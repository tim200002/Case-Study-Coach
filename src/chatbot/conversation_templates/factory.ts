import { CaseIntroductionTemplate } from "./case_introduction";
import {
  CaseComponent,
  CaseIntroductionComponent,
  Case_Component_Type,
} from "../statemachine/case_component";

export default function conversationTemplateFactory(
  caseComponent: CaseComponent,
) {
  switch (caseComponent.type) {
    case Case_Component_Type.INTRODUCTION:
      return new CaseIntroductionTemplate(
        caseComponent as CaseIntroductionComponent,
      );
    default:
      throw new Error("Unknown Case Component Type");
  }
}
