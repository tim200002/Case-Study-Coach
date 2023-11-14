import Header from "~/app/_components/header";
import { api } from "~/trpc/server";
import { Metadata } from "next";
import { CaseInfo } from "./_components/case_info";
import { EvaluationComponent } from "./_components/evaluation_menu";
import RealtimeChat from "./_components/realtime_chat";
import {
  InputModalityToggle,
  SettingsButton,
  VideoToggle,
} from "./_components/settings";
import { VideoAnalysis } from "./_components/video";

export const metadata: Metadata = {
  title: "Solve the Case",
};

export default async function Page({
  params,
}: {
  params: { sessionId: string };
}) {
  const sessionId = parseInt(params.sessionId);
  const currentSession = await api.chatbot.getSession.query({
    sessionId: sessionId,
  });

  if (currentSession.state === "NOT_STARTED") {
    throw new Error("Session not started");
  }

  return (
    <>
      <main className="flex h-screen flex-col">
        <Header />
        <div className="flex grow flex-row  overflow-auto">
          <div className=" flex w-1/3 flex-col items-start">
            <CaseInfo case={currentSession.case} />
            <div className="grow" />
            <InputModalityToggle />
            <VideoToggle />
          </div>
          {currentSession.state === "RUNNING" && (
            <RealtimeChat
              sessionId={currentSession.id}
              initialConversation={currentSession.conversationComponents}
            />
          )}
          <div className="flex w-1/3 flex-col items-end ">
            <EvaluationComponent sessionId={currentSession.id} />
            <VideoAnalysis sessionId={currentSession.id} />

            <div className="grow" />
            <SettingsButton />
          </div>
        </div>
      </main>
    </>
  );
}
