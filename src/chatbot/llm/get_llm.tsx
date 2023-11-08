import { supportedLanguageModelType } from "~/store/settings_store";
import {
  LangchainWrapperInterface,
  OpenAIWrapper,
  VertexAIWrapper,
} from "./language_model";

export function getLlm(
  llm: supportedLanguageModelType,
): LangchainWrapperInterface {
  if (llm === "OpenAI") {
    return new OpenAIWrapper();
  } else if (llm === "Vertex") {
    return new VertexAIWrapper();
  } else {
    throw new Error("Invalid language model type");
  }
}
