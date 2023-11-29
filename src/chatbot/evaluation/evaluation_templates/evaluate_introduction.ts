import type EvaluationTemplateInterface from "./evaluation_template_interface";
import { type CaseComponent } from "~/chatbot/statemachine/case_component";

export class EvaluationIntroductionTemplate
  implements EvaluationTemplateInterface
{
  caseComponent: CaseComponent;

  constructor(caseComponent: CaseComponent) {
    this.caseComponent = caseComponent;
  }

  getEvaluationPrompt(conversationHistory: string): string {
    return `Evaluate the candidate's performance in the introduction part. The output should be written as if addressing the candidate. The candidate's introduction is evaluated as follows:
    - The candidate should be asking questions that are relevant to the case. Do not assume that they have all the relevant knowledge beforehand. 
    - It is positive if the candidate summarizes the case to the interviewer before proceeding to the next section. 
    - The candidate's response should be clear and concise.
    
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
