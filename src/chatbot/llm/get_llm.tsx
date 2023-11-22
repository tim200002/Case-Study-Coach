import { supportedLanguageModelType } from "~/store/settings_store";
import {
  LangchainWrapperInterface,
  OpenAIWrapper,
  VertexAIWrapper,
} from "./language_model";

export function getLlm(
  llm: supportedLanguageModelType,
): LangchainWrapperInterface {
  if (llm === "GPT-3") {
    return new OpenAIWrapper("gpt-3.5-turbo");
  } else if (llm === "GPT-4") {
    return new OpenAIWrapper("gpt-4-1106-preview");
  } else if (llm === "Davinci") {
    return new OpenAIWrapper("text-davinci-003");
  } else if (llm === "Bard") {
    return new VertexAIWrapper();
  } else {
    throw new Error("Invalid language model type");
  }
}
