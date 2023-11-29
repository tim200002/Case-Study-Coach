import type EvaluationTemplateInterface from "./evaluation_template_interface";
import {
  type CaseComponent,
  CaseComponentWithSolution,
} from "~/chatbot/statemachine/case_component";

export class EvaluationCreativeTemplate implements EvaluationTemplateInterface {
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
    return `Evaluate the candidate's performance in the creativity part of the case. The output should be written as if addressing the candidate. The candidate's performance in this section is based on the following criteria:\n
    - The candidate should be able to perform a structured brainstorm. Their ideas should be structured into several buckets and the candidate should be able to argue which parts are the most important.\n
    - The candidate should be able to identify many potential solutions or problems. However it is productive if these are unnecessary for solving the case.\n
    - The candidate should identify and priortize the most important of the problem or solution and should dive deeper into these by their own.\n
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
