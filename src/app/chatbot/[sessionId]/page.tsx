import Head from "next/head";
import Header from "~/app/_components/header";
import { api } from "~/trpc/server";
import RealtimeChat from "./_components/realtime_chat";

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
      <Head>
        <title>Chat</title>
        <meta name="description" content="Solve the case" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex h-screen flex-col">
        <Header />
        <div className="grow  overflow-auto">
          {currentSession.state === "RUNNING" && (
            <RealtimeChat
              sessionId={sessionId}
              initialConversation={currentSession.conversationComponents}
            />
          )}
        </div>
      </main>
    </>
  );
}
