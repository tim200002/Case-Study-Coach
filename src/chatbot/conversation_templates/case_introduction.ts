import {
  CaseComponent,
  CaseIntroductionComponent,
} from "../statemachine/case_component";
import { prependTag } from "../utils/formatters";
import ConversationTemplateInterface from "./conversation_template_interface";

export class CaseIntroductionTemplate implements ConversationTemplateInterface {
  caseComponent: CaseIntroductionComponent;
  constructor(caseComponent: CaseIntroductionComponent) {
    this.caseComponent = caseComponent;
  }

  getIntroductionPrompt(): string {
    return this.caseComponent.caseStarter;
  }

  getCheckCompletionPrompt(): string {
    const completionPrompt = `Take the previous response of the candidate to evaluate if this part of the case study is completed. The section is completed if:
- The candidate does not want any more information. If the candidate indicated that he wants to construct a framework this section is also completed.
            
If the section is not completed respond with "${prependTag(
      "False",
      "SYSTEM",
      true,
    )}". If the section is finished respond with "${prependTag(
      "True",
      "SYSTEM",
      true,
    )}".`;
    return completionPrompt;
  }
}
