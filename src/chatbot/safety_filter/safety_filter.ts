import {
  ConversationComponent,
  ConversationComponentType,
} from "~/server/db/schema";
import { Validator } from "./validators/validator_interface";
import { ExtendedContext } from "../llm/language_model";
import { prependTag } from "../utils/formatters";

export async function safetyFilterString<T>(
  conversationHistory: ConversationComponent[],
  validator: Validator<T>,

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
      `Safety Filter of class ${validator.constructor.name}. Iteration ${i}`,
    );
    const modelResponse = await getResponseCallback(
      conversationHistory,
      localExtendedContext,
    );
    const { isValid, parsedContent } = validator.validate(modelResponse);
    if (isValid) {
      if (!parsedContent) {
        throw new Error("Result is valid but parsed content is still null");
      }
      return { parsedContent };
    }
    localExtendedContext.push(modelResponse);
    localExtendedContext.push(validator.repromt());
  }

  throw new Error("Too many repromts");
}

export async function safetyFilterParsedInput<T>(
  conversationHistory: ConversationComponent[],
  validator: Validator<T>,

  getResponseCallback: (
    conversationHistory: ConversationComponent[],
    extendedContext: ExtendedContext[],
  ) => Promise<{
    content: string;
    type: ConversationComponentType;
  }>,
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
    const { isValid, parsedContent } = validator.validate(
      prependTag(modelResponse.content, modelResponse.type),
    );
    if (isValid) {
      if (parsedContent === null) {
        throw new Error("Result is valid but parsed content is still null");
      }
      return { parsedContent, rawResponse: modelResponse };
    }
    localExtendedContext.push(
      prependTag(modelResponse.content, modelResponse.type),
    );
    localExtendedContext.push(validator.repromt());
  }

  throw new Error("Too many repromts");
}
