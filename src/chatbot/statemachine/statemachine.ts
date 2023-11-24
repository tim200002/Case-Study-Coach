import {
  Case,
  CaseSession,
  ConversationComponentType,
  caseSessions,
  conversationComponents,
} from "~/server/db/schema";
import { CaseStructureComponent } from "./case_structure_component";
import { Parser } from "./parser";
import {
  CaseComponent,
  CaseIntroductionComponent,
  CaseSynthesisComponent,
  Case_Component_Status,
} from "./case_component";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import LanguageModel from "../llm/language_model";
import {
  askCandidateWhereToMoveNextPrompt,
  compareResponsesWhereToContinuePrompt,
  continueConversationPrompt,
  didCandidateProvideIndicationToContinuePrompt,
  getInitialPrimer,
  thankCandidateOnCaseEndingPrompt,
} from "../conversation_templates/special_prompts";
import { parseArrayFromJson } from "../utils/parseArray";

export class Statemachine {
  case: Case;
  session: CaseSession;
  parsedStructure: CaseStructureComponent;
  llm: LanguageModel;

  constructor(thisCase: Case, session: CaseSession, llm: LanguageModel) {
    this.case = thisCase;
    this.session = session;

    let liveStructureJson;
    try {
      liveStructureJson = JSON.parse(session.liveStructure as string);
    } catch {
      liveStructureJson = session.liveStructure;
    }
    this.parsedStructure = Parser.parseCaseStateFromJson(liveStructureJson);
    this.llm = llm;
  }

  async startCase() {
    const caseStarted = this.session.state !== "NOT_STARTED";
    if (caseStarted) {
      throw new Error("Case is already started");
    }

    const introduction = this.parsedStructure.children[0];
    if (!(introduction instanceof CaseIntroductionComponent)) {
      throw new Error(
        "Invalid Database State. First component is not an introduction",
      );
    }

    await this.addSectionToSectionHistory(introduction.id);

    introduction.status = Case_Component_Status.RUNNING; // Does this update the underlying real object?

    await db
      .update(caseSessions)
      .set({
        state: "RUNNING",
        liveStructure: JSON.stringify(this.parsedStructure),
      })
      .where(eq(caseSessions.id, this.session.id));

    // create components to start case
    this.addMessage(
      getInitialPrimer(
        (this.case.caseContent as any).problemStatement,
        (this.case.caseContent as any).additionalInformation,
      ),
      "COMMAND",
      false,
    );

    this.addMessage(introduction.getIntroductionPrompt(), "INTERVIEWER", false);
  }

  async continueConversationAfterCandidateResponse(content: string) {
    //! Special case where feedback is necessary in transition
    if (this.session.state === "TRANSITION_PHASE_2") {
      return await this.transitionPhase2(content);
    }

    //! Normal case where user just responds to chatbot
    await this.addMessage(content, "CANDIDATE", false);
    const checkCompletionCommand =
      this.currentSection.getCheckCompletionPrompt();

    await this.addMessage(checkCompletionCommand, "COMMAND", true);

    const conversationHistory = await this.getCurrentConversationHistory();
    const { parsedContent: isSectionCompleted, rawResponse } =
      await this.llm.getBooleanResponse(conversationHistory);
    await this.addMessage(rawResponse.content, rawResponse.type, true);

    // check if we finished based on the response
    if (isSectionCompleted) {
      await this.initTransitionPhase();
      return;
    }

    // We did not finish. Continue as always

    await this.addMessage(continueConversationPrompt(), "COMMAND", true);

    const conversationHistory2 = await this.getCurrentConversationHistory();
    const { parsedContent: continuedConversation } =
      await this.llm.getInterviewerResponse(conversationHistory2);
    await this.addMessage(
      continuedConversation.content,
      continuedConversation.type,
      false,
    );
  }

  private async initTransitionPhase() {
    if (this.nextPossibleStates.length === 0) {
      // close case
      await this.closeCase();
    }
    // Advance to framework
    else if (
      this.nextPossibleStates.length === 1 &&
      this.currentSection instanceof CaseIntroductionComponent
    ) {
      await this.advanceToState(this.nextPossibleStates[0]!.id);
      await this.introduceCurrentSection();
    }
    // Advance to synthesis
    else if (
      this.nextPossibleStates.length === 1 &&
      this.nextPossibleStates[0] instanceof CaseSynthesisComponent
    ) {
      // go to synthesis
      await this.advanceToState(this.nextPossibleStates[0].id);
      await this.introduceCurrentSection();
    } else {
      await this.setSessionState("TRANSITION_PHASE_1");
      await this.transitionPhase1();
    }
  }

  private async introduceCurrentSection() {
    await this.addSectionToSectionHistory(this.currentSection.id);
    this.addMessage(
      this.currentSection.getIntroductionPrompt(),
      "COMMAND",
      false,
    );
    const res2 = await this.llm.getInterviewerResponse(
      await this.getCurrentConversationHistory(),
    );
    await this.addMessage(
      res2.parsedContent.content,
      res2.parsedContent.type,
      false,
    );
  }

  private async closeCase() {
    this.currentSection.status = Case_Component_Status.COMPLETED;
    // One last message to candidate
    await this.addMessage(thankCandidateOnCaseEndingPrompt(), "COMMAND", true);

    const conversationHistory = await this.getCurrentConversationHistory();
    const { parsedContent } =
      await this.llm.getInterviewerResponse(conversationHistory);
    await this.addMessage(parsedContent.content, parsedContent.type, false);

    await db
      .update(caseSessions)
      .set({
        state: "COMPLETED",
        liveStructure: JSON.stringify(this.parsedStructure),
      })
      .where(eq(caseSessions.id, this.session.id));
  }

  private async transitionPhase1() {
    await this.addMessage(
      didCandidateProvideIndicationToContinuePrompt(),
      "COMMAND",
      true,
    );

    const conversationHistory = await this.getCurrentConversationHistory();
    const { parsedContent: didProvideIndication, rawResponse } =
      await this.llm.getBooleanResponse(conversationHistory);
    this.addMessage(rawResponse.content, rawResponse.type, true);

    if (!didProvideIndication) {
      await this.addMessage(
        askCandidateWhereToMoveNextPrompt(),
        "COMMAND",
        true,
      );

      const conversationHistory = await this.getCurrentConversationHistory();
      const { parsedContent } =
        await this.llm.getInterviewerResponse(conversationHistory);
      await this.addMessage(parsedContent.content, parsedContent.type, false);
      await this.setSessionState("TRANSITION_PHASE_2");
    } else {
      await this.setSessionState("TRANSITION_PHASE_3");
      await this.transitionPhase3();
    }
  }

  private async transitionPhase2(content: string) {
    this.addMessage(content, "CANDIDATE", false);
    await this.setSessionState("TRANSITION_PHASE_3");
    await this.transitionPhase3();
  }

  private async transitionPhase3() {
    await this.addMessage(
      compareResponsesWhereToContinuePrompt(this.nextPossibleStates),
      "COMMAND",
      true,
    );
    const res = await this.llm.getNextSectionResponse(
      await this.getCurrentConversationHistory(),
      this.nextPossibleStates.map((state) => state.id),
    );
    await this.addMessage(res.rawResponse.content, res.rawResponse.type, true);
    await this.advanceToState(res.parsedContent.nextSectionId);

    // now introduce the next section
    await this.introduceCurrentSection();
  }

  async addMessage(
    message: string,
    type: ConversationComponentType,
    isVolatile: boolean,
  ) {
    const currentSection = this.currentSection;
    if (!currentSection) {
      throw new Error("No current section");
    }
    const sessionId = this.session.id;
    const sectionId = currentSection.id;

    await db.insert(conversationComponents).values({
      caseSessionId: sessionId,
      content: message,
      sectionId: sectionId,
      type: type,
      isVolatile: isVolatile,
    });
  }

  get currentSection() {
    function findCurrentSection(
      structure: CaseStructureComponent,
    ): CaseComponent | null {
      for (const child of structure.children) {
        if (
          child instanceof CaseComponent &&
          child.status === Case_Component_Status.RUNNING
        ) {
          return child;
        } else if (child instanceof CaseStructureComponent) {
          const childResult = findCurrentSection(child);
          if (childResult) {
            return childResult;
          }
        }
      }
      return null;
    }
    const currentSection = findCurrentSection(this.parsedStructure);
    if (!currentSection) {
      throw new Error("No current section");
    }
    return currentSection;
  }

  private async setSessionState(state: CaseSession["state"]) {
    await db
      .update(caseSessions)
      .set({
        state: state,
      })
      .where(eq(caseSessions.id, this.session.id));
  }

  private async getCurrentConversationHistory() {
    const currentSection = this.currentSection;

    // fetch part 1, all components that are not current section. For these volatile should be false
    const conversationHistoryPart1 =
      await db.query.conversationComponents.findMany({
        where: (components, { and, not, eq }) =>
          and(
            eq(components.caseSessionId, this.session.id),
            not(eq(components.sectionId, currentSection.id)),
            not(components.isVolatile),
          ),
        orderBy: (components, { asc }) => [asc(components.createdAt)],
      });

    const conversationHistoryPart2 =
      await db.query.conversationComponents.findMany({
        where: (components, { and, eq }) =>
          and(
            eq(components.caseSessionId, this.session.id),
            eq(components.sectionId, currentSection.id),
          ),
        orderBy: (components, { asc }) => [asc(components.createdAt)],
      });

    return [...conversationHistoryPart1, ...conversationHistoryPart2];
  }

  private get nextPossibleStates() {
    const stackToCurrentElement = this.getStackToElement(
      this.currentSection.id,
    );

    function recursivelyPopUntilNonCompletedElement(
      stack: CaseStructureComponent[],
    ) {
      if (stack.length === 0) {
        return [];
      }

      const currentElement = stack.pop();
      const elementToContinue = currentElement!.getElementsToContinue();
      if (elementToContinue.length > 0) {
        return elementToContinue;
      } else {
        return recursivelyPopUntilNonCompletedElement(stack);
      }
    }

    return recursivelyPopUntilNonCompletedElement(stackToCurrentElement);
  }

  private getStackToElement(id: string): CaseStructureComponent[] {
    function getStackToElementRecursively(
      elementId: string,
      structureStack: CaseStructureComponent[],
    ): { stack: CaseStructureComponent[]; found: boolean } {
      const currentElement = structureStack[structureStack.length - 1];
      if (!currentElement) {
        throw new Error("get Stack To Element Recursively error");
      }

      for (const child of currentElement.children) {
        if (child instanceof CaseComponent) {
          if (child.id === elementId) {
            return { stack: structureStack, found: true };
          }
        } else if (child instanceof CaseStructureComponent) {
          const result = getStackToElementRecursively(elementId, [
            ...structureStack,
            child,
          ]);
          if (result.found) {
            return result;
          }
        } else {
          throw new Error("Invalid Case Structure Component");
        }
      }
      return { stack: structureStack, found: false };
    }

    const structureStack = [this.parsedStructure];
    const result = getStackToElementRecursively(id, structureStack);

    if (!result.found) {
      throw new Error(`State with id ${id} not found`);
    }

    return result.stack;
  }

  private async advanceToState(nextStateId: string) {
    console.log("Advance to state " + nextStateId);
    function recursiveFindStateById(
      structureComponent: CaseStructureComponent,
      id: string,
    ): CaseComponent | null {
      for (const child of structureComponent.children) {
        if (child instanceof CaseComponent) {
          if (child.id === id) {
            return child;
          }
        } else if (child instanceof CaseStructureComponent) {
          const result = recursiveFindStateById(child, id);
          if (result) {
            return result;
          }
        } else {
          throw new Error("Invalid Case Structure Component");
        }
      }
      return null;
    }

    this.currentSection.status = Case_Component_Status.COMPLETED;

    const nextState = recursiveFindStateById(this.parsedStructure, nextStateId);
    if (!nextState) {
      throw new Error("Invalid Next State");
    }
    nextState.status = Case_Component_Status.RUNNING;

    await db
      .update(caseSessions)
      .set({
        state: "RUNNING",
        liveStructure: JSON.stringify(this.parsedStructure),
      })
      .where(eq(caseSessions.id, this.session.id));

    return nextState;
  }

  private async addSectionToSectionHistory(sectionId: string) {
    console.log("Add section to section history ");
    // get section history
    const sectionHistory = parseArrayFromJson<string>(this.session.order);
    // check that section is not already in section history
    if (sectionHistory.includes(sectionId)) {
      throw new Error("Section already in section history");
    }

    // add section to section history
    sectionHistory.push(sectionId);
    console.log("Section history: " + sectionHistory);

    // update section history
    await db
      .update(caseSessions)
      .set({
        order: JSON.stringify(sectionHistory),
      })
      .where(eq(caseSessions.id, this.session.id));
  }
}
