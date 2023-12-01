import { CaseIntroductionTemplate } from "./case_introduction";
import {
  CASE_QUESTION_TYPE,
  CaseComponent,
  CaseFrameworkComponent,
  CaseIntroductionComponent,
  CaseQuestionComponent,
  Case_Component_Type,
} from "../statemachine/case_component";
import { FrameworkTemplate } from "./framework";
import { NumeracyTemplate } from "./numeracy";
import { CreativeTemplate } from "./creative";
import { SynthesisTemplate } from "./synthesis";

export default function conversationTemplateFactory(
  caseComponent: CaseComponent,
) {
  switch (caseComponent.type) {
    case Case_Component_Type.INTRODUCTION:
      return new CaseIntroductionTemplate(
        caseComponent as CaseIntroductionComponent,
      );
    case Case_Component_Type.FRAMEWORK:
      return new FrameworkTemplate(caseComponent as CaseFrameworkComponent);
    case Case_Component_Type.QUESTION: {
      switch ((caseComponent as CaseQuestionComponent).questionType) {
        case CASE_QUESTION_TYPE.NUMERIC:
          return new NumeracyTemplate(caseComponent as CaseQuestionComponent);
        case CASE_QUESTION_TYPE.CREATIVE:
          return new CreativeTemplate(caseComponent as CaseQuestionComponent);
        default:
          throw new Error("Unknown Type");
      }
    }
    case Case_Component_Type.SYNTHESIS:
      return new SynthesisTemplate(caseComponent as CaseQuestionComponent);
    default:
      throw new Error("Unknown Case Component Type");
  }
}
