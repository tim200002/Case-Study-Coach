import { ConversationComponentType } from "~/server/db/schema";

export function prependTag(text: string, tag: ConversationComponentType) {
  return `${tag}: ${text}`;
}

export function stripTag(text: string): {
  tag: ConversationComponentType;
  content: string;
} {
  const pattern = /[A-Z]+: +/g;
  const matches = text.match(pattern);
  if (!matches) {
    throw new Error("No tag found");
  }
  if (matches.length > 1) {
    throw new Error("Multiple tags found");
  }

  const tag = matches[0].trim();
  const tagWithoutColon = tag.slice(0, -1) as ConversationComponentType;
  return {
    tag: tagWithoutColon,
    content: text.replace(tag, "").trim(),
  };
}

export function splitTags(text: string): string[] {
  const pattern = /[A-Z]+: +[A-z]+/g;
  const matches = text.match(pattern);
  console.log(matches);
  if (!matches) {
    throw new Error("No tag found");
  }
  return matches.map((match) => match.trim());
}
