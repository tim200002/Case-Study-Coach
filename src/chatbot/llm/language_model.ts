import { OpenAI } from "langchain/llms/openai";
import {
  ConversationComponent,
  ConversationComponentType,
} from "~/server/db/schema";
import { safetyFilter } from "../safety_filter/safety_filter";
import {
  BooleanValidator,
  ChatOutputValidator,
  NextSectionIdValidator,
} from "../safety_filter/validators/validator_interface";

export type ExtendedContext =
  | {
      content: string;
      type: ConversationComponentType;
    }
  | string;

export class LanguageModel {
  llm: OpenAI;
  constructor() {
    this.llm = new OpenAI();
  }

  async getCandidateResponse(
    conversationHistory: ConversationComponent[],
    extendedContext: ExtendedContext[] = [],
  ) {
    const allowedTags: ConversationComponentType[] = ["CANDIDATE"];
    return await this._getResponse(
      conversationHistory,
      allowedTags,
      extendedContext,
    );
  }

  async getSystemResponse(
    conversationHistory: ConversationComponent[],
    extendedContext: ExtendedContext[] = [],
  ) {
    const allowedTags: ConversationComponentType[] = ["SYSTEM"];
    return await this._getResponse(
      conversationHistory,
      allowedTags,
      extendedContext,
    );
  }

  async getBooleanResponse(conversationHistory: ConversationComponent[]) {
    const responseValidator = new BooleanValidator();
    return await safetyFilter<boolean>(
      conversationHistory,
      responseValidator,
      async (conversationHistory, extendedContext) => {
        const res = await this.getSystemResponse(
          conversationHistory,
          extendedContext,
        );
        return res.rawResponse;
      },
    );
  }

  async getNextSectionResponse(
    conversationHistory: ConversationComponent[],
    possibleNextSectionIds: string[],
  ) {
    const responseValidator = new NextSectionIdValidator(
      possibleNextSectionIds,
    );

    return await safetyFilter<{
      useCandidateProposal: boolean;
      nextSectionId: string;
    }>(
      conversationHistory,
      responseValidator,
      async (conversationHistory, extendedContext) => {
        const res = await this.getSystemResponse(
          conversationHistory,
          extendedContext,
        );
        return res.rawResponse;
      },
    );
  }

  async _getResponse(
    conversationHistory: ConversationComponent[],
    allowedTags: ConversationComponentType[],
    extendedContext: ExtendedContext[] = [],
  ) {
    const responseValidator = new ChatOutputValidator(allowedTags);

    const response = await safetyFilter<{
      type: ConversationComponentType;
      content: string;
    } | null>(
      conversationHistory,
      responseValidator,

      async (conversationHistory, extendedContext) => {
        let prompt =
          this._convertConversationHistoryToPrompt(conversationHistory);
        if (extendedContext && extendedContext.length > 0) {
          prompt +=
            "\n\n" + this._convertExtendedContextToPrompt(extendedContext);
        }
        return await this.llm.predict(prompt);
      },
      extendedContext,
    );

    return response;
  }

  private _convertConversationHistoryToPrompt(
    conversation_history: ConversationComponent[],
  ) {
    const prompt = conversation_history.map((component) => {
      const prefix = component.type;
      return `${prefix}: ${component.content}`;
    });

    return prompt.join("\n\n");
  }

  private _convertExtendedContextToPrompt(extended_context: ExtendedContext[]) {
    const prompt = extended_context.map((component) => {
      if (typeof component === "string") {
        return component;
      }

      const prefix = component.type;
      return `${prefix}: ${component.content}`;
    });

    return prompt.join("\n\n");
  }
}
