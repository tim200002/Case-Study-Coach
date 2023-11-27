import ConversationTemplateInterface from "../conversation_templates/conversation_template_interface";
import conversationTemplateFactory from "../conversation_templates/factory";
import { JSON_TYPES } from "./types";

export enum Case_Component_Type {
  INTRODUCTION = "INTRODUCTION",
  FRAMEWORK = "FRAMEWORK",
  QUESTION = "QUESTION",
  SYNTHESIS = "SYNTHESIS",
}

export enum Case_Component_Status {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  COMPLETED = "COMPLETED",
}

export class CaseComponent {
  id: string;
  type: Case_Component_Type;
  status: Case_Component_Status;
  additionalCommands: string[];
  additionalInformation: string[];
  jsonType = JSON_TYPES.CASE_COMPONENT;
  shortDescription: string;

  protected constructor(
    id: string,
    type: Case_Component_Type,
    shortDescription: string,
    status?: Case_Component_Status,
    additionalCommands?: string[],
    additionalInformation?: string[],
  ) {
    this.id = id;
    this.type = type;
    this.status = status ?? Case_Component_Status.PENDING;
    this.additionalCommands = additionalCommands ?? [];
    this.additionalInformation = additionalInformation ?? [];
    this.shortDescription = shortDescription;
  }

  getIntroductionPrompt(): string {
    const template = conversationTemplateFactory(this);
    return template.getIntroductionPrompt();
  }

  getCheckCompletionPrompt(): string {
    const template = conversationTemplateFactory(this);
    return template.getCheckCompletionPrompt();
  }

  // factor to generate component from json
  static fromJson(json: any, id: string | null) {
    const type = json.type;
    switch (type) {
      case Case_Component_Type.INTRODUCTION:
        return CaseIntroductionComponent.fromJson(json, id);
      case Case_Component_Type.FRAMEWORK:
        return CaseFrameworkComponent.fromJson(json, id);
      case Case_Component_Type.QUESTION:
        return CaseQuestionComponent.fromJson(json, id);
      case Case_Component_Type.SYNTHESIS:
        return CaseSynthesisComponent.fromJson(json, id);
      default:
        throw new Error("Unknown Case Component Type");
    }
  }
}

class CaseComponentWithSolution extends CaseComponent {
  solution: string;

  constructor(
    id: string,
    type: Case_Component_Type,
    shortDescription: string,
    status: Case_Component_Status,
    solution: string,
    additionalCommands?: string[],
    additionalInformation?: string[],
  ) {
    super(
      id,
      type,
      shortDescription,
      status,
      additionalCommands,
      additionalInformation,
    );
    this.solution = solution;
  }
}

export class CaseIntroductionComponent extends CaseComponent {
  caseStarter: string;
  constructor(
    id: string,
    caseStarter: string,
    status: Case_Component_Status,
    additionalCommands?: string[],
    additionalInformation?: string[],
  ) {
    super(
      id,
      Case_Component_Type.INTRODUCTION,
      "Introduction of the Case",
      status,
      additionalCommands,
      additionalInformation,
    );
    this.caseStarter = caseStarter;
  }

  static fromJson(json: any, id: string | null) {
    return new CaseIntroductionComponent(
      id ?? json.id,
      json.caseStarter,
      json.status ?? Case_Component_Status.PENDING,
      json.additionalCommands,
      json.additionalInformation,
    );
  }
}

export class CaseFrameworkComponent extends CaseComponentWithSolution {
  constructor(
    id: string,
    status: Case_Component_Status,
    solution: string,
    additionalCommands?: string[],
    additionalInformation?: string[],
  ) {
    super(
      id,
      Case_Component_Type.FRAMEWORK,
      "Framework section. The goal is for the Candidate to come up with a framework to solve the case.",
      status,
      solution,
      additionalCommands,
      additionalInformation,
    );
  }

  static fromJson(json: any, id: string | null) {
    return new CaseFrameworkComponent(
      id ?? json.id,
      json.status,
      getSolutionFromJson(json),
      json.additionalCommands,
      json.additionalInformation,
    );
  }
}

export enum CASE_QUESTION_TYPE {
  NUMERIC = "NUMERIC",
  CREATIVE = "CREATIVE",
}
export class CaseQuestionComponent extends CaseComponentWithSolution {
  questionType: CASE_QUESTION_TYPE;
  question: string;

  constructor(
    id: string,
    status: Case_Component_Status,
    question: string,
    solution: string,
    questionType: CASE_QUESTION_TYPE,
    additionalCommands?: string[],
    additionalInformation?: string[],
  ) {
    super(
      id,
      Case_Component_Type.QUESTION,
      `A question to be answered by the candidate. The question is: ${question}`,
      status,
      solution,
      additionalCommands,
      additionalInformation,
    );
    this.questionType = questionType;
    this.question = question;
  }

  static fromJson(json: any, id: string | null) {
    return new CaseQuestionComponent(
      id ?? json.id,
      json.status,
      json.question,
      getSolutionFromJson(json),
      json.questionType,
      json.additionalCommands,
      json.additionalInformation,
    );
  }
}

export class CaseSynthesisComponent extends CaseComponentWithSolution {
  constructor(
    id: string,
    status: Case_Component_Status,
    solution: string,
    additionalCommands?: string[],
  ) {
    super(
      id,
      Case_Component_Type.SYNTHESIS,
      "Synthesis section. The goal is for the Candidate to summarize the case and provide a recommendation.",
      status,
      solution,
      additionalCommands,
    );
  }

  static fromJson(json: any, id: string | null) {
    return new CaseSynthesisComponent(
      id ?? json.id,
      json.status,
      getSolutionFromJson(json),
      json.additionalCommands,
      json.additionalInformation,
    );
  }
}

function getSolutionFromJson(json: any) {
  const referenceSolution = json.referenceSolution;
  const solution = json.solution;

  if (referenceSolution && solution) {
    throw new Error("Both reference solution and solution are present");
  }

  if (referenceSolution) {
    return referenceSolution;
  } else if (solution) {
    return solution;
  } else {
    throw new Error("No solution found");
  }
}
