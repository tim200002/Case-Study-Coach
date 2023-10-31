import { CaseFrameworkComponent } from "../statemachine/case_component";
import { prependTag } from "../utils/formatters";
import ConversationTemplateInterface from "./conversation_template_interface";

export class FrameworkTemplate implements ConversationTemplateInterface {
  caseComponent: CaseFrameworkComponent;
  constructor(caseComponent: CaseFrameworkComponent) {
    this.caseComponent = caseComponent;
  }

  getIntroductionPrompt(): string {
    return `We are now at the start of the framework section. The framework is a structured way to solve the case. It is a way to break down the problem into smaller parts and to solve the case in a structured way. Your task is to help the candidate come up with a good framework. One reference framework that could be used for this case is the following
# Reference Framework:
${this.caseComponent.solution}

Start this section by asking the candidate to explain his framework to you. Make sure that your wording fits into the previous conversation with the candidate.
`;
  }

  getCheckCompletionPrompt(): string {
    const completionPrompt = `Take the previous response of the candidate to evaluate if this part of the case study is completed. To evaluate if the framework is completed you can use the following criteria:
- A good framework should consists of 2-4 buckets. The buckets should be mutually exclusive but in total cover all important aspects of the case.
- The candidate should not just provide the buckets but more information what exactly he wants to tackle exactly within each bucket
- The candidate must not match the reference solution one to one but should provide most information. It is your task to evaluate if the candidate has given enough information.
- Be very critical and do not let the candidate leave before his developed framework is good

Respond with "${prependTag("True", "SYSTEM", true)}" if this section is completed, otherwise respond with "${prependTag("False", "SYSTEM", true)}".`;

    return completionPrompt;
  }
}
