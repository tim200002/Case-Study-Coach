import { expect, test } from "@jest/globals";
import { splitTags } from "~/chatbot/utils/formatters";

test("Tag splitting test", () => {
  // expect(splitTags("CANDIDATE: Hello")).toEqual(["CANDIDATE: Hello"]);
  // expect(splitTags("CANDIDATE: Hello how are you INTERVIEWER: Hi")).toEqual([
  //   "CANDIDATE: Hello how are you",
  //   "INTERVIEWER: Hi",
  // ]);
  // expect(splitTags("CANDIDATE: Hello INTERVIEWER: Hi \nSYSTEM: Hey")).toEqual([
  //   "CANDIDATE: Hello",
  //   "INTERVIEWER: Hi",
  //   "SYSTEM: Hey",
  // ]);

  const inputString1 =
    "{{#CANDIDATE~}} <content string1> {{~/CANDIDATE}}  {{#<some tag>~}} <content string2> {{~/<some tag>}}";
  console.log(splitTags(inputString1));
});

// test("Tag stripping test", () => {
//   expect(stripTag("CANDIDATE: Hello")).toEqual({
//     tag: "CANDIDATE",
//     content: "Hello",
//   });

//   //expect(stripTag("CANDIDATE: Hello COMPUTER: nein")).toThrow();
// });
