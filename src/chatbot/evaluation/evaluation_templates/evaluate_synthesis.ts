import type EvaluationTemplateInterface from "./evaluation_template_interface";
import { type CaseComponent } from "../../statemachine/case_component";

export class EvaluationSynthesisTemplate
  implements EvaluationTemplateInterface
{
  caseComponent: CaseComponent;

  constructor(caseComponent: CaseComponent) {
    this.caseComponent = caseComponent;
  }

  getEvaluationPrompt(conversationHistory: string): string {
    return `Evaluate the candidate's performance in the synthesis part of the case. The output should be written as if addressing the candidate. The candidate's performance in this section is based on the following criteria:\n
    - The candidate should be able to summarize the case in a clear and concise manner.\n
    - The candidate should be able to identify the most important parts of the case and explain why these are the most important parts.\n
    
    This is the conversation history of the candidate:\n
    ${conversationHistory}\n\n`;
  }

  getEvaluationScorePrompt(conversationHistory: string): string {
    return (
      this.getEvaluationPrompt(conversationHistory) +
      `Only output a number between 0 and 10 with 10 being the highest. Do not output anything else.\n\n`
    );
  }
}
