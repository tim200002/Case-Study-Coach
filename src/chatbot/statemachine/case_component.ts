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

  protected constructor(
    id: string,
    type: Case_Component_Type,
    status?: Case_Component_Status,
    additionalCommands?: string[],
    additionalInformation?: string[],
  ) {
    this.id = id;
    this.type = type;
    this.status = status ?? Case_Component_Status.PENDING;
    this.additionalCommands = additionalCommands ?? [];
    this.additionalInformation = additionalInformation ?? [];
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
    status: Case_Component_Status,
    solution: string,
    additionalCommands?: string[],
    additionalInformation?: string[],
  ) {
    super(id, type, status, additionalCommands, additionalInformation);
    this.solution = solution;
  }

  static fromJson(json: any, id: string|null) {
    return new CaseComponentWithSolution(
      id ?? json.id,
      json.type,
      json.status,
      json.solution,
      json.additionalCommands,
      json.additionalInformation,
    );
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
      status,
      additionalCommands,
      additionalInformation,
    );
    this.caseStarter = caseStarter;
  }

  static fromJson(json: any, id: string|null) {
    return new CaseIntroductionComponent(
      id ?? json.id,
      json.caseStarter,
      json.status ?? Case_Component_Status.PENDING,
      json.additionalCommands,
      json.additionalInformation,
    );
  }
}

class CaseFrameworkComponent extends CaseComponentWithSolution {
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
      status,
      solution,
      additionalCommands,
      additionalInformation,
    );
  }

  static fromJson(json: any, id: string|null) {
    return new CaseFrameworkComponent(
      id ?? json.id,
      json.status,
      json.solution,
      json.additionalCommands,
      json.additionalInformation,
    );
  }
}

enum CASE_QUESTION_TYPE {
  NUMERIC = "NUMERIC",
  CREATIVE = "CREATIVE",
}
class CaseQuestionComponent extends CaseComponentWithSolution {
  questionType: CASE_QUESTION_TYPE;

  constructor(
    id: string,
    status: Case_Component_Status,
    solution: string,
    questionType: CASE_QUESTION_TYPE,
    additionalCommands?: string[],
    additionalInformation?: string[],
  ) {
    super(
      id,
      Case_Component_Type.QUESTION,
      status,
      solution,
      additionalCommands,
      additionalInformation,
    );
    this.questionType = questionType;
  }

  static fromJson(json: any, id: string|null) {
    return new CaseQuestionComponent(
      id ?? json.id,
      json.status,
      json.solution,
      json.questionType,
      json.additionalCommands,
      json.additionalInformation,
    );
  }
}

class CaseSynthesisComponent extends CaseComponentWithSolution {
  constructor(
    id: string,
    status: Case_Component_Status,
    solution: string,
    additionalCommands?: string[],
    additionalInformation?: string[],
  ) {
    super(
      id,
      Case_Component_Type.SYNTHESIS,
      status,
      solution,
      additionalCommands,
      additionalInformation,
    );
  }

  static fromJson(json: any, id: string|null) {
    return new CaseSynthesisComponent(
      id ?? json.id,
      json.status,
      json.solution,
      json.additionalCommands,
      json.additionalInformation,
    );
  }
}
