"use client";

import { type } from "os";
import { useState } from "react";
import { ConversationComponent } from "~/server/db/schema";
import { api } from "~/trpc/react";

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

interface ChatInputProps {
  onSendMessage: (message: string) => void;
}

const ChatInput = ({ onSendMessage }: ChatInputProps) => {
  const [inputValue, setInputValue] = useState("");

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleSendClick = () => {
    if (inputValue.trim() !== "") {
      onSendMessage(inputValue);
      setInputValue("");
    }
  };

  return (
    <div className="mt-4 flex flex-row p-4">
      <input
        className="w-3/4 rounded-l-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
        placeholder="Type your message here..."
        value={inputValue}
        onChange={handleInputChange}
      />
      <button
        className={`w-1/4 rounded-r-lg bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700`}
        onClick={handleSendClick}
      >
        Send
      </button>
    </div>
  );
};

export default function RealtimeChat(props: {
  sessionId: number;
  initialConversation: ConversationComponent[];
}) {
  const { sessionId, initialConversation } = props;
  const [conversation, setConversation] =
    useState<(ConversationComponent | string)[]>(initialConversation);
  const [loading, setLoading] = useState(false);

  const { mutate } = api.chatbot.addResponse.useMutation({
    onMutate: (data) => {
      const { content: newMessage } = data;
      setConversation([...conversation, newMessage]);
      setLoading(true);
    },
    onSuccess: (data) => {
      const { conversationHistory, isCaseCompleted } = data;
      setLoading(false);
      setConversation(conversationHistory);
    },
    onError: (data) => {
      setLoading(false);
      setConversation(conversation.slice(0, -1));
    },
  });

  return (
    <div className="flex flex-col items-center">
      <ul className="grid w-1/2 grid-cols-3 space-y-5 overflow-scroll">
        {conversation.map((message) => (
          <ChatBubble message={message} />
        ))}
      </ul>

      {!loading && (
        <ChatInput
          onSendMessage={(message) => mutate({ sessionId, content: message })}
        />
      )}
    </div>
  );
}
