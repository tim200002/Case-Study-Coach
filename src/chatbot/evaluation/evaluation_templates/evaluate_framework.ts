import type EvaluationTemplateInterface from "./evaluation_template_interface";
import {
  type CaseComponent,
  CaseComponentWithSolution,
} from "~/chatbot/statemachine/case_component";

export class EvaluationFrameworkTemplate
  implements EvaluationTemplateInterface
{
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
    return `Evaluate the candidate's performance in the framework part of the case. The output should be written as if addressing the candidate. The candidate's framework based on the following criteria:
  - The framework is mutually exclusive and collectively exhaustive. No information is repeated and no information is missing.
  - The framework is structured in a logical manner. The candidate should be able to explain the framework in a clear and concise manner.
  - The framework is relevant to the case. The candidate should be able to explain why the framework is relevant to the case.
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
