import { ExtendedContext } from "~/chatbot/llm/language_model";
import { splitTags, stripTag } from "~/chatbot/utils/formatters";
import { ConversationComponentType } from "~/server/db/schema";

export interface Validator<T> {
  validate: (text: string) => { isValid: boolean; parsedContent: T | null };

  repromt: () => ExtendedContext;
}

export class ChatOutputValidator
  implements
    Validator<{
      type: ConversationComponentType;
      content: string;
    }>
{
  allowedTags: ConversationComponentType[];
  constructor(allowedTags: ConversationComponentType[]) {
    this.allowedTags = allowedTags;
  }

  private validateLoose(text: string) {
    try {
      const inputSplit = splitTags(text);
      if (inputSplit.length === 0) {
        return { isValid: false, parsedContent: null };
      }
      const firstInput = inputSplit[0]!;
      const { tag, content } = stripTag(firstInput);

      if (!this.allowedTags.includes(tag)) {
        return { isValid: false, parsedContent: null };
      }

      return { isValid: true, parsedContent: { type: tag, content } };
    } catch (e) {
      console.log("Error: " + e);
      return { isValid: false, parsedContent: null };
    }
  }

  validate(text: string) {
    return this.validateLoose(text);
  }

  repromt(): ExtendedContext {
    return {
      type: "COMMAND",
      content: `Command: Do it again, but this time your response should be started with only of of the tags from the list [${this.allowedTags}]. It must also not continue after this tag.`,
    };
  }
}

export class BooleanValidator implements Validator<boolean> {
  validate(text: string) {
    console.log("Boolean validator " + text);
    const cleanedText = text.replace("SYSTEM:", "").trim().toLowerCase();
    console.log("cleaned text " + cleanedText);
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
      content:
        "Do it again, but this time respond with either SYSTEM: True or SYSTEM: False.",
    };
  }
}

export class NextSectionIdValidator
  implements
    Validator<{ useCandidateProposal: boolean; nextSectionId: string }>
{
  possibleNextSectionIds: string[];
  constructor(possibleNextSectionIds: string[]) {
    this.possibleNextSectionIds = possibleNextSectionIds;
  }

  validate(text: string) {
    const pattern = /SYSTEM:\s*\(([^,]+),\s*(\d+)\)/;
    const match = text.match(pattern);

    if (!match) {
      return {
        isValid: false,
        parsedContent: null,
      };
    }

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
      content: `Do it again, but this time respond with either "SYSTEM: (True, <id>)" or "SYSTEM: (False, <id>)". Remember that id must be any of [${nextSectionIdsString}].`,
    };
  }
}
