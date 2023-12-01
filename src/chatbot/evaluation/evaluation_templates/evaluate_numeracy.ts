import type EvaluationTemplateInterface from "./evaluation_template_interface";
import {
  type CaseComponent,
  CaseComponentWithSolution,
} from "~/chatbot/statemachine/case_component";

export class EvaluationNumeracyTemplate implements EvaluationTemplateInterface {
  caseComponent: CaseComponent;
  referenceSolution: string;

  constructor(caseComponent: CaseComponent) {
    this.caseComponent = caseComponent;

    if (caseComponent instanceof CaseComponentWithSolution) {
      this.referenceSolution = caseComponent.solution;
    } else {
      throw new Error("Case component does not have a solution");
    }
  }

  getEvaluationPrompt(conversationHistory: string): string {
    return `Evaluate the candidate's performance in the numeracy part of the case. The output should be written as if addressing the candidate. The candidate's performance in this section is based on the following criteria:
    - The candidate should be able to perform the calculations correctly.
    - The candidate should be able to structure their calculations and verify their approach before starting to perform calculations.
    - The candidate should be able to explain their calculations in a clear and concise manner.
    - The candidate should make reasonable assumptions if necessary and ask for relevant information that they require to perform the calculations.
    - The candidate's answer should be similar to the following answer:
    ${this.referenceSolution}\n\n
    
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
