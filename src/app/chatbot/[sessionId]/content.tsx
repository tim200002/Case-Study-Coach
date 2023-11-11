"use client";

import {
  Case,
  CaseSession,
  ConversationComponent,
  ConversationEvaluationComponent,
} from "~/server/db/schema";
import { Toggle } from "./_components/toggle";
import RealtimeChat from "./_components/realtime_chat";
import { EvaluationComponent } from "./_components/evaluation_menu";
import { CaseInfo } from "./_components/case_info";
import { createContext, useRef, useState } from "react";

import { SettingsModal } from "./_components/settings";
import { IconSettings } from "@tabler/icons-react";
import { useSettingsStorage } from "~/store/settings_store";
import { StoreApi, createStore } from "zustand";
import { api } from "~/trpc/react";

export const MainContent = (props: {
  session: CaseSession;
  case: Case;
  conversationHistory: ConversationComponent[];
}) => {
  const { session, case: currentCase, conversationHistory } = props;
  const settingsStore = useSettingsStorage();

  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <div className="flex grow flex-row  overflow-auto">
      {settingsOpen && <SettingsModal onClose={() => setSettingsOpen(false)} />}

      <div className=" flex w-1/3 flex-col items-start">
        <CaseInfo case={currentCase} />
        <div className="grow" />
        <Toggle
          label="Use Text Input"
          isActive={settingsStore.inputModality === "Text"}
          onChange={(isActive) => {
            if (isActive) {
              settingsStore.setInputModality("Text");
            } else {
              settingsStore.setInputModality("Voice");
            }
          }}
        />
      </div>
      {session.state === "RUNNING" && (
        <RealtimeChat
          sessionId={session.id}
          initialConversation={conversationHistory}
        />
      )}
      <div className="flex w-1/3 flex-col items-end ">
        <EvaluationComponent sessionId={session.id} />
        <div className="grow" />
        <button
          onClick={() => setSettingsOpen(true)}
          className="fixed bottom-0 right-0 m-2 rounded-full bg-blue-500 p-2 text-white shadow-lg transition-colors duration-200 ease-in-out hover:bg-blue-600"
          aria-label="Open Settings"
        >
          <IconSettings />
        </button>
      </div>
    </div>
  );
};
