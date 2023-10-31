import { CaseComponent } from "../statemachine/case_component";
import { prependTag } from "../utils/formatters";

export function getInitialPrimer(
  casePrompt: string,
  additionalInformation: string[],
) {
  const prePrompt = `We are in the situation of a case interview for applying to a job in consulting. You are taking the role of the interviewer in this case. You are there to practice solving case studies with the interviewee. You are provided with a reference solution to the case. You are not tasked to solve the case yourself but rather guide the candidate throughout the case. Important things for you to remember
- - You are only supposed to use the INTERVIEWER or SYSTEM tag.
- Your name is Casey the Casebot
- You are supposed to help the candidate but not provide him with the solutions. The candidate must be able to solve the case on its own.
- The candidate must not match the reference solution one to one but should provide most information.
- After each step wait for the candidate to answer the question. You are never to take the role of the candidate and answer questions yourself!
- Never automatically add something to the responses of the candidate. Only react towards what the candidate is writing.
- Tags are used to show who said what in the conversation. Tags are of the format {{#<some tag>~}} <content string> {{~/<some tag>}}. Possible tags are CANDIDATE, INTERVIEWER, COMMAND, STATE.
- The COMMAND tag is used to ask you to do something.  Pay attention to these commands when continuing the conversation. 
- The CANDIDATE tag is used to mark input from the candidate.
- The INTERVIEWER tag is used by you to talk to the candidate.
- The SYSTEM tag is used by you to answer internal questions.`;

  const additionalInformationString = additionalInformation.join("\n");

  const caseSpecificInformation = `# Reference Information about the case
  ## Problem Statement: 
  ${casePrompt}
  
  ## Additional Information: 
  ${additionalInformationString}`;

  const startCaseString = `# Start of the Case Interview`;

  return `\n${prePrompt}\n\n${caseSpecificInformation}\n\n${startCaseString}\n\n`;
}

export function continueConversationPrompt() {
  return `Continue the conversation. Think about how to continue in a sensible way. Then respond with ${prependTag(
    "<your Response>",
    "INTERVIEWER",
    true,
  )}`;
}

export function didCandidateProvideIndicationToContinuePrompt() {
  return `We finished the last section, successfully. Did the candidate already provide some indication where he wants to move next. If yes answer with "${prependTag(
    "True",
    "SYSTEM",
    true,
  )}", else with "${prependTag("False", "SYSTEM", true)}".`;
}

export function askCandidateWhereToMoveNextPrompt() {
  return `The candidate did not provide any indication where to move next. Ask him where he wants to move next.`;
}

export function compareResponsesWhereToContinuePrompt(
  nextPossibleStates: CaseComponent[],
) {
  const optionsToContinue = nextPossibleStates.map((state) => {
    return `{id: ${state.id}, description: ${state.shortDescription}}`;
  });
  const optionsToContinueString = "[" + optionsToContinue.join(", ") + "]";

  return `Compare the candidates response of where to continue, with the possible options from the reference solution. The options are: ${optionsToContinueString}
  
  If the candidate provided a close match respond with "${prependTag(
    "(True, <id>)",
    "SYSTEM",
    true,
  )}". Else choose one id of where to continue and respond with "${prependTag(
    "(False, <id>)",
    "SYSTEM",
    true,
  )}".`;
}

export function thankCandidateOnCaseEndingPrompt() {
  return `The case is now finished. Thank the candidate for his participation.`;
}
