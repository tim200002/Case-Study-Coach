import { CaseComponent } from "../statemachine/case_component";

export default interface ConversationTemplateInterface {
  caseComponent: CaseComponent;
  getIntroductionPrompt(): string;
  getCheckCompletionPrompt(): string;
}
