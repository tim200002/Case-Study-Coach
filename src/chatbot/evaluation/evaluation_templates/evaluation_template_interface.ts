import { type CaseComponent } from "~/chatbot/statemachine/case_component";

export default interface EvaluationTemplateInterface {
  caseComponent: CaseComponent;
  getEvaluationPrompt(conversationHistory: string): string;
  getEvaluationScorePrompt(conversationHistory: string): string;
}
