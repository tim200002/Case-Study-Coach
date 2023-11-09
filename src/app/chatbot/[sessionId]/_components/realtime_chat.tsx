"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Spinner from "~/app/_components/spinner";
import { ConversationComponent } from "~/server/db/schema";
import { api } from "~/trpc/react";
import { TextInput } from "./text_input";
import { VoiceRecorderButton } from "./voice_recorder";
import { useSettingsStorage } from "~/store/settings_store";
import HydrationZustand from "~/utils/hydration_zustand";

const ChatBubble = (props: { message: ConversationComponent | string }) => {
  const { message } = props;
  function isMessageFromCandidate() {
    if (typeof message === "string") {
      return true;
    }
    return message.type === "CANDIDATE";
  }

  const messageContent =
    typeof message === "string" ? message : message.content;

  return (
    <div
      className={`${
        isMessageFromCandidate()
          ? "col-start-2 place-self-end"
          : "col-start-1 place-self-start"
      } col-span-2 max-w-full space-y-2`}
    >
      <div
        className={`rounded-2xl p-5 ${
          isMessageFromCandidate()
            ? "rounded-tr-none bg-green-300"
            : "rounded-tl-none bg-red-300"
        }`}
      >
        <div className="break-words text-base">{messageContent}</div>
      </div>
    </div>
  );
};

export default function RealtimeChat(props: {
  sessionId: number;
  initialConversation: ConversationComponent[];
}) {
  const { sessionId, initialConversation } = props;
  const afterLastChatMessageRef = useRef<HTMLDivElement>(null);
  const [conversation, setConversation] =
    useState<(ConversationComponent | string)[]>(initialConversation);
  const [loading, setLoading] = useState(false);
  const settingsStore = useSettingsStorage();

  const { mutate } = api.chatbot.addResponse.useMutation({
    onMutate: (data) => {
      const { content: newMessage } = data;
      setConversation([...conversation, newMessage]);
      setLoading(true);
      afterLastChatMessageRef.current?.scrollIntoView();
    },
    onSuccess: (data) => {
      const { conversationHistory, isCaseCompleted } = data;
      setLoading(false);
      setConversation(conversationHistory);
      afterLastChatMessageRef.current?.scrollIntoView();
    },
    onError: (data) => {
      setLoading(false);
      setConversation(conversation.slice(0, -1));
    },
  });

  const handleSendMessage = (message: string) => {
    mutate({
      sessionId,
      content: message,
      languageModelType: settingsStore!.languageModel,
    });
  };

  return (
    <div className="flex max-h-full w-full flex-col items-center p-2">
      <ul className="grid grid-cols-3 space-y-5 overflow-scroll">
        {conversation.map((message) => (
          <ChatBubble
            key={typeof message === "string" ? null : message.id}
            message={message}
          />
        ))}
        <div ref={afterLastChatMessageRef} />
      </ul>

      <div className="grow" />

      {loading && <Spinner />}
      <HydrationZustand>
        {!loading && settingsStore.inputModality === "Text" && (
          <TextInput onSendMessage={handleSendMessage} />
        )}
        {!loading && settingsStore.inputModality === "Voice" && (
          <VoiceRecorderButton onSendMessage={handleSendMessage} />
        )}
      </HydrationZustand>
    </div>
  );
}
