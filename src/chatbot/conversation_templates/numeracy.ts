import {
  CaseComponent,
  CaseIntroductionComponent,
  CaseQuestionComponent,
} from "../statemachine/case_component";
import { prependTag } from "../utils/formatters";
import ConversationTemplateInterface from "./conversation_template_interface";

export class NumeracyTemplate implements ConversationTemplateInterface {
  caseComponent: CaseQuestionComponent;
  constructor(caseComponent: CaseQuestionComponent) {
    this.caseComponent = caseComponent;
  }

  getIntroductionPrompt(): string {
    return `We are now at the start of one question of the case. This is a numeracy question and thus involves a lot of calculations. The question to for the candidate to answer is the following:
${this.caseComponent.question}

Additional information you should provide the candidate when they ask for it is:
${this.caseComponent.additionalInformation}
Always provide this information when the candidate asks for it. Never provide additional information that is not asked for if it is not relevant to solve the case, and never do any math for the candidate. 

A reference solution of steps to solve the question is the following:
${this.caseComponent.solution}

Start this section now by asking the candidate to solve the question. Make sure that your wording fits into the previous conversation with the candidate. Remember only ask the question, do not continue the conversation.
`;
  }

  getCheckCompletionPrompt(): string {
    const completionPrompt = `Take the previous response of the candidate to evaluate if this part of the case study is completed. To evaluate if the question is completed use the following criteria:
- Check if the candidate approach is right and if it guides us towards the goal, else help him to get on the right track
- Check if the math is right, if not tell the candidate where he must redo calculations
- Check if the candidate got to the complete result and has gone through ALL the steps in the reference solution, only after that continue the case
- Be very critical and do not let the candidate leave before this section is completed

  Respond with "${prependTag(
    "True",
    "SYSTEM",
    true,
  )}" if this section is completed, otherwise respond with "${prependTag(
    "False",
    "SYSTEM",
    true,
  )}".
`;

    return completionPrompt;
  }
}
