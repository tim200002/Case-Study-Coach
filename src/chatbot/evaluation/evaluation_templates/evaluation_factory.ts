import {
  CASE_QUESTION_TYPE,
  type CaseComponent,
  Case_Component_Type,
  type CaseQuestionComponent,
} from "../../statemachine/case_component";

import { EvaluationCreativeTemplate } from "./evaluate_creative";
import { EvaluationSynthesisTemplate } from "./evaluate_synthesis";
import { EvaluationFrameworkTemplate } from "./evaluate_framework";
import { EvaluationIntroductionTemplate } from "./evaluate_introduction";
import { EvaluationNumeracyTemplate } from "./evaluate_numeracy";

export default function evaluationTemplateFactory(
  caseComponent: CaseComponent,
) {
  switch (caseComponent.type) {
    case Case_Component_Type.INTRODUCTION:
      return new EvaluationIntroductionTemplate(caseComponent);
    case Case_Component_Type.FRAMEWORK:
      return new EvaluationFrameworkTemplate(caseComponent);
    case Case_Component_Type.QUESTION: {
      switch ((caseComponent as CaseQuestionComponent).questionType) {
        case CASE_QUESTION_TYPE.NUMERIC:
          return new EvaluationNumeracyTemplate(caseComponent);
        case CASE_QUESTION_TYPE.CREATIVE:
          return new EvaluationCreativeTemplate(caseComponent);
        default:
          throw new Error("Unknown Type");
      }
    }
    case Case_Component_Type.SYNTHESIS:
      return new EvaluationSynthesisTemplate(caseComponent);
    default:
      throw new Error("Unknown Case Component Type");
  }
}
