import {
  ConversationComponentType,
  isConversationComponentType,
} from "~/server/db/schema";

export function prependTag(
  text: string,
  tag: ConversationComponentType,
  inline = false,
) {
  if (inline) {
    return `{{#${tag}~}} ${text} {{~/${tag}}}`;
  } else {
    return `{{#${tag}~}}\n${text}\n{{~/${tag}}}`;
  }
}

export function splitTags(
  text: string,
): { tag: ConversationComponentType; content: string }[] {
  // Pattern explanation:
  // \{\{# matches the opening brace followed by a hash
  // ([^}]+) captures the tag name (everything up to the next brace)
  // ~\}\} matches the closing sequence of the opening tag
  // ([\s\S]*?) captures the content, non-greedily
  // \{\{~\/ matches the opening of the closing tag
  // \1 matches the same text as most recently matched by the 1st capturing group (the tag name)
  // \}\} matches the closing brace of the closing tag
  const pattern = /\{\{#([^}]+)~\}\}([\s\S]*?)\{\{~\/\1\}\}/g;

  const matches = [];
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const tag = match[1]!.trim();
    const content = match[2]!.trim();
    if (!isConversationComponentType(tag)) {
      throw new Error("Invalid tag: " + tag);
    }

    matches.push({ tag, content });
  }

  if (matches.length === 0) {
    throw new Error("No tags found in text: " + text);
  }

  return matches;
}
