"use client";

import { Case, CaseSession, ConversationComponent } from "~/server/db/schema";
import { Toggle } from "./_components/toggle";
import RealtimeChat from "./_components/realtime_chat";
import { EvaluationComponent } from "./_components/evaluation_menu";
import { CaseInfo } from "./_components/case_info";
import { useState } from "react";

export enum INPUT_MODALITY {
  TEXT,
  VOICE,
}

export const MainContent = (props: {
  session: CaseSession;
  case: Case;
  conversationHistory: ConversationComponent[];
}) => {
  const { session, case: currentCase, conversationHistory } = props;
  const [inputModality, setInputModality] = useState(INPUT_MODALITY.TEXT);

  return (
    <div className="flex grow flex-row  overflow-auto">
      <div className=" flex w-1/3 flex-col items-start">
        <CaseInfo case={currentCase} />
        <div className="grow" />
        <Toggle
          label="Use Text Input"
          isActive={inputModality === INPUT_MODALITY.TEXT}
          onChange={(isActive) => {
            if (isActive) {
              setInputModality(INPUT_MODALITY.TEXT);
            } else {
              setInputModality(INPUT_MODALITY.VOICE);
            }
          }}
        />
      </div>
      {session.state === "RUNNING" && (
        <RealtimeChat
          sessionId={session.id}
          initialConversation={conversationHistory}
          inputModality={inputModality}
        />
      )}
      <div className="flex w-1/3 flex-col items-end ">
        <EvaluationComponent clarity={3} engagement={8} speed={5} />
      </div>
    </div>
  );
};
