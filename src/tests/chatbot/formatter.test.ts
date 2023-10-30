import { expect, test } from "@jest/globals";
import { splitTags, stripTag } from "~/chatbot/utils/formatters";

test("Tag splitting test", () => {
  expect(splitTags("CANDIDATE: Hello")).toEqual(["CANDIDATE: Hello"]);
  expect(splitTags("CANDIDATE: Hello INTERVIEWER: Hi")).toEqual([
    "CANDIDATE: Hello",
    "INTERVIEWER: Hi",
  ]);
  expect(splitTags("CANDIDATE: Hello INTERVIEWER: Hi \nSYSTEM: Hey")).toEqual([
    "CANDIDATE: Hello",
    "INTERVIEWER: Hi",
    "SYSTEM: Hey",
  ]);
});

test("Tag stripping test", () => {
  expect(stripTag("CANDIDATE: Hello")).toEqual({
    tag: "CANDIDATE",
    content: "Hello",
  });

  //expect(stripTag("CANDIDATE: Hello COMPUTER: nein")).toThrow();
});
