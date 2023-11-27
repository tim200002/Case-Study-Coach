import {
  CaseComponent,
  CaseIntroductionComponent,
  CaseQuestionComponent,
  CaseSynthesisComponent,
} from "../statemachine/case_component";
import ConversationTemplateInterface from "./conversation_template_interface";

export class SynthesisTemplate implements ConversationTemplateInterface {
  caseComponent: CaseSynthesisComponent;
  constructor(caseComponent: CaseSynthesisComponent) {
    this.caseComponent = caseComponent;
  }

  getIntroductionPrompt(): string {
    return `We are now at the end of the case and the candidate should summarize their findings. The following is a reference solution for this case:
${this.caseComponent.solution}

Start this section by asking the candidate to make a recommendation to the client. Make sure that your wording fits into the previous conversation with the candidate.
`;
  }

  getCheckCompletionPrompt(): string {
    const completionPrompt = `Make sure that the candidate not only provides a recommendation but also supports their recommendation.

Respond with "${prependTag(
      "True",
      "SYSTEM",
      true,
    )}" if this section is completed, otherwise respond with "${prependTag(
      "False",
      "SYSTEM",
      true,
    )}".`;

    return completionPrompt;
  }
}
