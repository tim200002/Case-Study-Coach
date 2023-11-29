import { JSONObject } from "superjson/dist/types";
import { CaseComponent, CaseComponentWithSolution } from "./case_component";
import { CaseStructureComponent } from "./case_structure_component";
import { JSON_TYPES } from "./types";

export class Parser {
  static parseCaseStateFromJson(json: any): CaseStructureComponent {
    function recursiveCaseStructureRunner(
      json: any,
    ): (CaseComponent | CaseStructureComponent)[] {
      const caseStructureType = json.type;

      const children: (CaseComponent | CaseStructureComponent)[] = [];
      for (const child of json.children) {
        const jsonType: JSON_TYPES = child.jsonType;
        switch (jsonType) {
          case JSON_TYPES.CASE_COMPONENT:
            children.push(CaseComponent.fromJson(child, null));
            break;
          case JSON_TYPES.CASE_STRUCTURE:
            children.push(...recursiveCaseStructureRunner(child));
            break;
          default:
            throw new Error("Unknown JSON Type");
        }
      }
      return [new CaseStructureComponent(caseStructureType, children)];
    }

    // check that length is exactly 1. This is always the case given the structure of the json
    const parsedCaseStructure = recursiveCaseStructureRunner(json);
    if (parsedCaseStructure.length !== 1) {
      throw new Error("Error in Parsing");
    }
    const parsedRoot = parsedCaseStructure[0];
    if (!(parsedRoot instanceof CaseStructureComponent)) {
      throw new Error("Error in Parsing");
    }
    return parsedRoot;
  }

  static parseCaseStateFromJsonFlat(json: any) {
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

  static parseCaseTemplateToProperStateStructure(
    json: any,
  ): CaseStructureComponent {
    const caseComponentDict = readCaseInformation(json);
    const caseStructureTemplate = json.caseStructure;

    function recursiveCaseStructureRunner(json: any): CaseStructureComponent {
      const caseStructureType = json.type;

      const children: (CaseComponent | CaseStructureComponent)[] = [];
      for (const child of json.children) {
        // check if child is a string
        if (typeof child === "string") {
          const childComponent = caseComponentDict[child];
          if (!childComponent) {
            throw new Error("Unknown Case Component");
          }
          children.push(childComponent);
        } else if (typeof child === "object") {
          children.push(recursiveCaseStructureRunner(child));
        } else {
          throw new Error("Unknown Child Type");
        }
      }
      return new CaseStructureComponent(caseStructureType, children);
    }

    function readCaseInformation(json: any) {
      const caseComponentDict: { [key: string]: CaseComponent } = {};
      for (let [key, value] of Object.entries(json.caseComponents)) {
        const component = CaseComponent.fromJson(value, key);
        caseComponentDict[key] = component;
      }
      return caseComponentDict;
    }

    return recursiveCaseStructureRunner(caseStructureTemplate);
  }
}
