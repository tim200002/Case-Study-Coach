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
  Case_Component_Status,
} from "./case_component";
import { db } from "~/server/db";
import { eq } from "drizzle-orm";
import getInitialPrimer from "../conversation_templates/initial_primer";

export class Statemachine {
  case: Case;
  session: CaseSession;
  parsedStructure: CaseStructureComponent;

  constructor(thisCase: Case, session: CaseSession) {
    this.case = thisCase;
    this.session = session;
    this.parsedStructure = Parser.parseCaseStateFromJson(session.liveStructure);
  }

  async startCase() {
    const caseStarted = this.session.state !== "NOT_STARTED";
    if (caseStarted) {
      throw new Error("Case is already started");
    }
    if (this.currentSection) {
      throw new Error(
        "Invalid Database State. Case is not started but some components are running already",
      );
    }

    const introduction = this.parsedStructure.children[0];
    if (!(introduction instanceof CaseIntroductionComponent)) {
      throw new Error(
        "Invalid Database State. First component is not an introduction",
      );
    }

    console.log(introduction);

    introduction.status = Case_Component_Status.RUNNING; // Does this update the underlying real object?
    this.session.state = "RUNNING";

    await db
      .update(caseSessions)
      .set(this.session)
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

    return findCurrentSection(this.parsedStructure);
  }
}
