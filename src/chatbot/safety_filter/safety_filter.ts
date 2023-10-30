import { ConversationComponent } from "~/server/db/schema";
import { Validator } from "./validators/validator_interface";
import { ExtendedContext } from "../llm/language_model";

export async function safetyFilter<T>(
  conversationHistory: ConversationComponent[],
  validator: Validator<T>,

  getResponseCallback: (
    conversationHistory: ConversationComponent[],
    extendedContext: ExtendedContext[],
  ) => Promise<string>,
  extendedContext: ExtendedContext[] = [],
): Promise<{
  parsedContent: T;
  rawResponse: string;
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
      return { parsedContent, rawResponse: modelResponse };
    }
    localExtendedContext.push(modelResponse);
    localExtendedContext.push(validator.repromt());
  }

  throw new Error("Too many repromts");
}
