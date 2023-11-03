import { OpenAI } from "langchain/llms/openai";
import { GoogleVertexAI } from "langchain/llms/googlevertexai/web";
import {
  ConversationComponent,
  ConversationComponentType,
} from "~/server/db/schema";
import {
  safetyFilterString,
  safetyFilterParsedInput,
} from "../safety_filter/safety_filter";
import {
  BooleanValidator,
  ChatOutputValidator,
  NextSectionIdValidator,
} from "../safety_filter/validators/validator_interface";
import { prependTag } from "../utils/formatters";

export type ExtendedContext = {
  content: string;
  type: ConversationComponentType;
};

interface LangchainWrapperInterface {
  predict(prompt: string): Promise<string>;
}

export class OpenAIWrapper implements LangchainWrapperInterface {
  private llm: OpenAI;
  constructor() {
    this.llm = new OpenAI();
  }

  async predict(prompt: string) {
    return await this.llm.predict(prompt);
  }
}

export class VertexAIWrapper implements LangchainWrapperInterface {
  private llm: GoogleVertexAI;
  constructor() {
    this.llm = new GoogleVertexAI();
  }

  async predict(prompt: string) {
    return await this.llm.predict(prompt);
  }
}

export default class LanguageModel {
  llm: LangchainWrapperInterface;
  constructor(llm: LangchainWrapperInterface) {
    this.llm = llm;
  }

  async getInterviewerResponse(
    conversationHistory: ConversationComponent[],
    extendedContext: ExtendedContext[] = [],
  ) {
    const allowedTags: ConversationComponentType[] = ["INTERVIEWER"];
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
    return await safetyFilterParsedInput<boolean>(
      conversationHistory,
      responseValidator,
      async (conversationHistory, extendedContext) => {
        const res = await this.getSystemResponse(
          conversationHistory,
          extendedContext,
        );
        return res.parsedContent;
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

    return await safetyFilterParsedInput<{
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
        return res.parsedContent;
      },
    );
  }

  async _getResponse(
    conversationHistory: ConversationComponent[],
    allowedTags: ConversationComponentType[],
    extendedContext: ExtendedContext[] = [],
  ) {
    const responseValidator = new ChatOutputValidator(allowedTags);

    const response = await safetyFilterString<{
      type: ConversationComponentType;
      content: string;
    }>(
      conversationHistory,
      responseValidator,
      async (conversationHistory, extendedContext) => {
        let prompt =
          this._convertConversationHistoryToPrompt(conversationHistory);
        if (extendedContext && extendedContext.length > 0) {
          prompt +=
            "\n\n" + this._convertExtendedContextToPrompt(extendedContext);
        }
        console.log("Prompt: \n" + prompt);
        const modelResponse = await this.llm.predict(prompt);
        console.log("Model response: " + modelResponse);
        return modelResponse;
      },
      extendedContext,
    );

    return response;
  }

  private _convertConversationHistoryToPrompt(
    conversation_history: ConversationComponent[],
  ) {
    const prompt = conversation_history.map((component) =>
      prependTag(component.content, component.type),
    );

    return prompt.join("\n\n");
  }

  private _convertExtendedContextToPrompt(extended_context: ExtendedContext[]) {
    const prompt = extended_context.map((component) =>
      prependTag(component.content, component.type),
    );

    return prompt.join("\n\n");
  }
}
