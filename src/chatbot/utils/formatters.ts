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
    throw new Error("No tag found in text: " + text);
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
  // Pattern explanation:
  // [A-Z]+: matches uppercase tags followed by a colon
  // \\s* matches optional whitespace
  // [\\s\\S]*? matches any characters including new lines, non-greedily
  // (?=[A-Z]+:|$) is a positive lookahead for an uppercase tag followed by a colon or the end of the string
  const pattern = /[A-Z]+:\s*([\s\S]*?)(?=[A-Z]+:|$)/g;

  const matches = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    // Remove the next tag from the end of the match, if present
    const tagRemoved = match[0].replace(/\s+[A-Z]+:$/, '').trim();
    matches.push(tagRemoved);
  }

  if (matches.length === 0) {
    throw new Error("No tag found in text: " + text);
  }

  return matches;
}
