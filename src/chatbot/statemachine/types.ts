import { ConversationComponentType } from "~/server/db/schema";

export enum JSON_TYPES {
  CASE_STRUCTURE = "CASE_STRUCTURE",
  CASE_COMPONENT = "CASE_COMPONENT",
}

export type ParsedModelResponse = {
  type: ConversationComponentType;
  content: string;
};
