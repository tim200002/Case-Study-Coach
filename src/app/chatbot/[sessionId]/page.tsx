import Header from "~/app/_components/header";
import { api } from "~/trpc/server";
import { MainContent } from "./content";
import { Metadata } from "next";

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
        <MainContent
          case={currentSession.case}
          conversationHistory={currentSession.conversationComponents}
          session={currentSession}
        />
      </main>
    </>
  );
}
