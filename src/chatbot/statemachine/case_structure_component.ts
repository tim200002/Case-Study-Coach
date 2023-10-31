import { CaseComponent, Case_Component_Status } from "./case_component";
import { JSON_TYPES } from "./types";

enum CASE_STRUCTURE_COMPONENT_TYPE {
  SEQUENTIAL = "SEQUENTIAL",
  PARALLEL = "PARALLEL",
}

export class CaseStructureComponent {
  type: CASE_STRUCTURE_COMPONENT_TYPE;
  children: (CaseComponent | CaseStructureComponent)[];
  jsonType = JSON_TYPES.CASE_STRUCTURE;

  constructor(
    type: CASE_STRUCTURE_COMPONENT_TYPE,
    children: (CaseComponent | CaseStructureComponent)[],
  ) {
    this.type = type;
    this.children = children;
  }

  getElementsToContinue() {
    if (this.type === CASE_STRUCTURE_COMPONENT_TYPE.SEQUENTIAL) {
      return this.getElementsToContinueSequentially();
    } else if (this.type === CASE_STRUCTURE_COMPONENT_TYPE.PARALLEL) {
      return this.getElementsToContinueParallel();
    } else {
      throw new Error("Unknown type");
    }
  }

  private getElementsToContinueSequentially(): CaseComponent[] {
    for (const child of this.children) {
      if (child instanceof CaseComponent) {
        if (child.status === Case_Component_Status.PENDING) {
          return [child];
        } else if (child.status === Case_Component_Status.RUNNING) {
          throw new Error(
            "Elements to Continue only exist when no component is currently running",
          );
        }
      } else if (child instanceof CaseStructureComponent) {
        const elementsToContinue = child.getElementsToContinueSequentially();
        if (elementsToContinue.length > 0) {
          return elementsToContinue;
        }
      } else {
        throw new Error("Unknown Child Type");
      }
    }
    return [];
  }

  private getElementsToContinueParallel(): CaseComponent[] {
    const elementsToContinue: CaseComponent[] = [];
    for (const child of this.children) {
      if (child instanceof CaseComponent) {
        if (child.status === Case_Component_Status.PENDING) {
          elementsToContinue.push(child);
        } else if (child.status === Case_Component_Status.RUNNING) {
          throw new Error(
            "Elements to Continue only exist when no component is currently running",
          );
        }
      } else if (child instanceof CaseStructureComponent) {
        elementsToContinue.push(...child.getElementsToContinueParallel());
      } else {
        throw new Error("Unknown Child Type");
      }
    }
    return elementsToContinue;
  }
}
