import {
  ConversationComponent,
  ConversationComponentType,
} from "~/server/db/schema";
import { Validator } from "./validators/validator_interface";
import { ExtendedContext } from "../llm/language_model";
import { ParsedModelResponse } from "../statemachine/types";

export async function safetyFilterString<T>(
  conversationHistory: ConversationComponent[],
  validator: Validator<string, T>,

  getResponseCallback: (
    conversationHistory: ConversationComponent[],
    extendedContext: ExtendedContext[],
  ) => Promise<string>,
  extendedContext: ExtendedContext[] = [],
): Promise<{
  parsedContent: T;
}> {
  const localExtendedContext = structuredClone(extendedContext);

  const MAX_REPROMTS = 3;
  for (let i = 0; i < MAX_REPROMTS; i++) {
    console.log(
      `Safety Filter of class ${validator.constructor.name}. Iteration ${i}\n
      The current extended context is ${JSON.stringify(localExtendedContext)}
      `,
    );
    const modelResponse = await getResponseCallback(
      conversationHistory,
      localExtendedContext,
    );
    const { isValid, parsedContent } = validator.validate(modelResponse);
    if (isValid) {
      if (parsedContent === null) {
        throw new Error("Result is valid but parsed content is still null");
      }
      return { parsedContent };
    }
    localExtendedContext.push({ content: modelResponse, type: "UNDEFINED" });
    localExtendedContext.push(validator.repromt());
  }

  throw new Error("Too many repromts");
}

export async function safetyFilterParsedInput<T>(
  conversationHistory: ConversationComponent[],
  validator: Validator<ParsedModelResponse, T>,

  getResponseCallback: (
    conversationHistory: ConversationComponent[],
    extendedContext: ExtendedContext[],
  ) => Promise<ParsedModelResponse>,
  extendedContext: ExtendedContext[] = [],
): Promise<{
  parsedContent: T;
  rawResponse: {
    content: string;
    type: ConversationComponentType;
  };
}> {
  const localExtendedContext = structuredClone(extendedContext);

  const MAX_REPROMTS = 3;
  for (let i = 0; i < MAX_REPROMTS; i++) {
    const modelResponse = await getResponseCallback(
      conversationHistory,
      localExtendedContext,
    );
    const { isValid, parsedContent } = validator.validate(modelResponse);
    if (isValid) {
      if (parsedContent === null) {
        throw new Error("Result is valid but parsed content is still null");
      }
      return { parsedContent, rawResponse: modelResponse };
    }
    localExtendedContext.push(modelResponse);
    localExtendedContext.push(validator.repromt());
  }

  throw new Error("Too many reprompts");
}
