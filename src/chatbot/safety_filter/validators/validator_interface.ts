import { ExtendedContext } from "~/chatbot/llm/language_model";
import { ParsedModelResponse } from "~/chatbot/statemachine/types";
import { prependTag, splitTags } from "~/chatbot/utils/formatters";
import { ConversationComponentType } from "~/server/db/schema";

export interface Validator<A, T> {
  validate: (input: A) => { isValid: boolean; parsedContent: T | null };

  repromt: () => ExtendedContext;
}

export class ChatOutputValidator
  implements Validator<string, ParsedModelResponse>
{
  allowedTags: ConversationComponentType[];
  constructor(allowedTags: ConversationComponentType[]) {
    this.allowedTags = allowedTags;
  }

  private validateLoose(input: string) {
    try {
      const inputSplit = splitTags(input);
      if (inputSplit.length === 0) {
        return { isValid: false, parsedContent: null };
      }
      const { tag, content } = inputSplit[0]!;

      if (!this.allowedTags.includes(tag)) {
        return { isValid: false, parsedContent: null };
      }

      return { isValid: true, parsedContent: { type: tag, content } };
    } catch (e) {
      console.log("Error: " + e);
      return { isValid: false, parsedContent: null };
    }
  }

  validate(input: string) {
    return this.validateLoose(input);
  }

  repromt(): ExtendedContext {
    return {
      type: "COMMAND",
      content: `Do it again, but this time your response should be started with only of the tags from the list [${this.allowedTags}]. It must also not continue after this tag.`,
    };
  }
}

export class BooleanValidator
  implements Validator<ParsedModelResponse, boolean>
{
  validate(input: ParsedModelResponse) {
    console.log("Boolean validator " + input);
    const cleanedText = input.content.replace(".", "").trim().toLowerCase();
    if (cleanedText === "true") {
      return { isValid: true, parsedContent: true };
    } else if (cleanedText === "false") {
      return { isValid: true, parsedContent: false };
    } else {
      return { isValid: false, parsedContent: null };
    }
  }

  repromt(): ExtendedContext {
    return {
      type: "COMMAND",
      content: `Do it again, but this time respond with either "${prependTag(
        "True",
        "SYSTEM",
        true,
      )}" or "${prependTag("False", "SYSTEM", true)}".`,
    };
  }
}

export class NextSectionIdValidator
  implements
    Validator<
      ParsedModelResponse,
      { useCandidateProposal: boolean; nextSectionId: string }
    >
{
  possibleNextSectionIds: string[];
  constructor(possibleNextSectionIds: string[]) {
    this.possibleNextSectionIds = possibleNextSectionIds;
  }

  validate(input: ParsedModelResponse) {
    const pattern = /(?:\()?([^,]+),\s*(\d+)(?:\))?/;
    const match = input.content.match(pattern);

    if (!match) {
      return {
        isValid: false,
        parsedContent: null,
      };
    }

    // Extracting the matched groups
    const [_, useCandidateProposalString, nextSectionIdString] = match;
    if (!useCandidateProposalString || !nextSectionIdString) {
      return {
        isValid: false,
        parsedContent: null,
      };
    }

    const useCandidateProposal =
      useCandidateProposalString.trim().toLowerCase() === "true";
    const nextSectionId = nextSectionIdString.trim();

    // check that id is in next possible states
    if (!this.possibleNextSectionIds.includes(nextSectionId)) {
      return {
        isValid: false,
        parsedContent: null,
      };
    }

    return {
      isValid: true,
      parsedContent: { useCandidateProposal, nextSectionId },
    };
  }

  repromt(): ExtendedContext {
    const nextSectionIdsString = this.possibleNextSectionIds.join(", ");
    return {
      type: "COMMAND",
      content: `Do it again, but this time respond with either "${prependTag(
        "(True, <id>)",
        "SYSTEM",
        true,
      )}" or "${prependTag(
        "(False, <id>)",
        "SYSTEM",
        true,
      )}". Remember that id must be any of [${nextSectionIdsString}].`,
    };
  }
}
