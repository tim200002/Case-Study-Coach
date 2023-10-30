import path from "node:path";
import { expect, test } from "@jest/globals";

import fs from "node:fs";
import { Parser } from "../../chatbot/statemachine/parser";

const parser = Parser;

// test parsing of case structure from the template to a workable json file
test("parseCaseTemplateToProperStateStructure", () => {
  // load text from case.json file
  const jsonString = fs.readFileSync(
    path.join(__dirname, "supplement_material/case.json"),
    "utf-8",
  );

  // parse the json string
  const caseStructure =
    parser.parseCaseTemplateToProperStateStructure(jsonString);

  const structureString = JSON.stringify(caseStructure, null, 2);
  // console.log(structureString);

  // load text from expected_case.json file
  const expectedString = JSON.stringify(
    JSON.parse(
      fs.readFileSync(
        path.join(
          __dirname,
          "supplement_material/parsed_case_reference_solution.json",
        ),
        "utf-8",
      ),
    ),
    null,
    2,
  );

  // compare the two strings
  expect(structureString).toEqual(expectedString);
});

// test parsing from state to a live version of the case
test("parseCaseStateFromJson", () => {
  const jsonString = fs.readFileSync(
    path.join(
      __dirname,
      "supplement_material/parsed_case_reference_solution.json",
    ),
    "utf-8",
  );
  const caseStructure = parser.parseCaseStateFromJson(jsonString);
  const structureString = JSON.stringify(caseStructure, null, 2);

  // console.log(structureString);

  const expectedString = JSON.stringify(JSON.parse(jsonString), null, 2);
  expect(structureString).toEqual(expectedString);
});
