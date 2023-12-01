"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import Spinner from "~/app/_components/spinner";
import { ConversationComponent } from "~/server/db/schema";
import CaseCompleted from "./case_completed";
import { api } from "~/trpc/react";
import { TextInput } from "./text_input";
import { VoiceRecorderButton } from "./voice_recorder";
import { useSettingsStorage } from "~/store/settings_store";
import HydrationZustand from "~/utils/hydration_zustand";
import { Modal } from "~/app/_components/modal";

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

const ChatBubbleWithMedia = (props: { link: string; type: "IMAGE" }) => {
  const { link, type } = props;

  switch (type) {
    case "IMAGE":
      return <ImageBubble link={link} />;
    default:
      return null;
  }
};

const ImageBubble = (props: { link: string }) => {
  const { link } = props;

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleDialogClose = () => setIsDialogOpen(false);
  const handleDialogOpen = () => setIsDialogOpen(true);

  return (
    <div>
      {isDialogOpen && (
        <Modal title="Image" onClose={handleDialogClose}>
          <img src={link} />
        </Modal>
      )}

      <div className="col-span-2 col-start-1 max-w-full space-y-2 place-self-start">
        <div className="rounded-2xl rounded-tl-none bg-red-300 p-5">
          <button onClick={handleDialogOpen}>View Image</button>
        </div>
      </div>
    </div>
  );
};

export default function RealtimeChat(props: {
  sessionId: number;
  initialConversation: ConversationComponent[];
  isCaseCompletedProp: boolean;
}) {
  const { sessionId, initialConversation, isCaseCompletedProp } = props;
  const afterLastChatMessageRef = useRef<HTMLDivElement>(null);
  const [conversation, setConversation] =
    useState<(ConversationComponent | string)[]>(initialConversation);
  const [loading, setLoading] = useState(false);
  const settingsStore = useSettingsStorage();
  const [isCaseCompleted, setIsCaseCompleted] = useState(isCaseCompletedProp);

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
      setIsCaseCompleted(isCaseCompleted);
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

  const convertMessageToChatBubble = (
    message: string | ConversationComponent,
  ) => {
    if (typeof message === "string") {
      return <ChatBubble message={message} key={message} />;
    }

    const { component: messageParsed, url } = parseImage(message);
    if (!url) {
      return <ChatBubble message={messageParsed} key={messageParsed.id} />;
    }

    return (
      <div className="flex flex-col gap-2">
        <ChatBubble message={messageParsed} key={messageParsed.id} />
        <ChatBubbleWithMedia link={url} type="IMAGE" />
      </div>
    );
  };

  const parseImage = (
    component: ConversationComponent,
  ): { component: ConversationComponent; url?: string } => {
    // Regular expression to match the <image> tag and extract the URL
    const imageTagRegex = /<image>([^<]+)<\/image>/;

    // Check if the message contains an <image> tag
    const match = component.content.match(imageTagRegex);

    if (!match) {
      return { component: component };
    }

    const componentCopy = structuredClone(component);
    // Extract the URL from the <image> tag
    const url = match[1];

    // Replace the <image> tag with the string "image"
    componentCopy.content = componentCopy.content.replace(
      imageTagRegex,
      "image",
    );

    return { component: componentCopy, url };
  };

  return (
    <div className="flex max-h-full w-full flex-col items-center p-2">
      <ul className="grid grid-cols-3 space-y-5 overflow-scroll">
        {conversation.map(convertMessageToChatBubble)}

        <div ref={afterLastChatMessageRef} />
      </ul>
      <div className="grow" />

      {loading && <Spinner />}
      <HydrationZustand>
        {!isCaseCompleted &&
          !loading &&
          settingsStore.inputModality === "Text" && (
            <TextInput onSendMessage={handleSendMessage} />
          )}
        {!isCaseCompleted &&
          !loading &&
          settingsStore.inputModality === "Voice" && (
            <VoiceRecorderButton
              onSendMessage={handleSendMessage}
              sessionId={sessionId}
            />
          )}
      </HydrationZustand>
      {!loading && isCaseCompleted && <CaseCompleted sessionId={sessionId} />}
    </div>
  );
}
