import {
  CaseComponent,
  CaseComponentWithSolution,
} from "../statemachine/case_component";
import { JSON_TYPES } from "../statemachine/types";

export function parseArrayFromJson<T>(json: string | null) {
  if (json === null) {
    return [];
  } else {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const jsonParsed = JSON.parse(json);
    if (Array.isArray(jsonParsed)) {
      return jsonParsed as T[];
    }
  }
  throw new Error("Invalid JSON: " + JSON.stringify(json));
}

export function parseCaseStateFromJsonFlat(json: any) {
  function recursiveRunner(json: any) {
    const children: CaseComponent[] = [];
    for (const child of json.children) {
      const jsonType: JSON_TYPES = child.jsonType;
      switch (jsonType) {
        case JSON_TYPES.CASE_COMPONENT:
          children.push(CaseComponentWithSolution.fromJson(child, null));
          break;
        case JSON_TYPES.CASE_STRUCTURE:
          children.push(...recursiveRunner(child));
          break;
        default:
          throw new Error("Unknown JSON Type");
      }
    }
    return children;
  }

  const parsedCaseStructure = recursiveRunner(json);

  // convert to dictionary for easy access by id
  const caseComponentDict: { [key: string]: CaseComponent } = {};
  for (const component of parsedCaseStructure) {
    caseComponentDict[component.id] = component;
  }
  return caseComponentDict;
}
