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
import getInitialPrimer from "../conversation_templates/initial_primer";
import { prependTag } from "../utils/formatters";
import LanguageModel from "../llm/language_model";

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
    const checkCompletionCommand =
      this.currentSection.getCheckCompletionPrompt();

    await this.addMessage(checkCompletionCommand, "COMMAND", true);
    await this.addMessage(content, "CANDIDATE", false);

    const conversationHistory = await this.getCurrentConversationHistory();
    const { parsedContent: isSectionCompleted, rawResponse } =
      await this.llm.getBooleanResponse(conversationHistory);
    console.log("Is section completed: " + isSectionCompleted);
    await this.addMessage(rawResponse.content, rawResponse.type, true);

    // check if we finished based on the response
    if (isSectionCompleted) {
      await this.initTransitionPhase();
      return;
    }

    // We did not finish. Continue as always

    await this.addMessage(
      `Continue the conversation. Think about how to continue in a sensible way. Then respond with ${prependTag(
        "<your Response>",
        "INTERVIEWER",
      )}`,
      "COMMAND",
      true,
    );

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
    await this.addMessage(
      "Thank the candidate for hist time and tell him that the case is closed now",
      "COMMAND",
      true,
    );

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
      "We finished the last section, successfully. Did the candidate already provide some indication where he wants to move next. If yes answer with SYSTEM: True, else with SYSTEM: False",
      "COMMAND",
      true,
    );
    await this.setWaitForModelResponse();

    const conversationHistory = await this.getCurrentConversationHistory();
    const { parsedContent: didProvideIndication, rawResponse } =
      await this.llm.getBooleanResponse(conversationHistory);
    this.addMessage(rawResponse.content, rawResponse.type, true);

    if (!didProvideIndication) {
      await this.addMessage(
        "Ask the candidate where he would like to move next",
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
    const optionsToContinue = this.nextPossibleStates.map((state) => {
      return `{id: ${state.id}, description: ${state.shortDescription}}`;
    });
    const optionsToContinueString = optionsToContinue.join("\n");
    const message = `Compare the candidates response of where to continue, with the possible options from the reference solution. The options are:
      ${optionsToContinueString}
      
      If the candidate provided a close match respond with "${prependTag(
        "(True, <id>",
        "SYSTEM",
      )}". Else choose one id of where to continue and respond with "${prependTag(
        "(False, <id>",
        "SYSTEM",
      )}".`;
    await this.addMessage(message, "COMMAND", true);
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

  private async setWaitForUserInput() {
    await db
      .update(caseSessions)
      .set({
        nextStep: "USER_INPUT",
      })
      .where(eq(caseSessions.id, this.session.id));
  }

  private async setWaitForModelResponse() {
    await db
      .update(caseSessions)
      .set({
        nextStep: "MODEL_RESPONSE",
      })
      .where(eq(caseSessions.id, this.session.id));
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
        throw new Error("get Stack To Element Recusively error");
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
}
