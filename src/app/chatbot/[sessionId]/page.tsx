import Head from "next/head";
import Header from "~/app/_components/header";
import { api } from "~/trpc/server";
import RealtimeChat from "./_components/realtime_chat";
import { EvaluationComponent } from "./_components/evaluation_menu";
import { Case } from "~/server/db/schema";

const CaseInfo = (props: { case: Case }) => {
  return (
    <div className="m-2 space-y-6 rounded-lg bg-white p-6 shadow-md">
      <div className="flex items-center space-x-4">
        <svg
          className="h-8 w-8 text-blue-500"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
            clipRule="evenodd"
          />
        </svg>
        <h1 className="text-2xl font-semibold text-gray-800">
          {props.case.caseTitle}
        </h1>
      </div>

      <p className="text-gray-700">{props.case.caseDescription}</p>
    </div>
  );
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
      <Head>
        <title>Chat</title>
        <meta name="description" content="Solve the case" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex h-screen flex-col">
        <Header />
        <div className="flex grow flex-row  overflow-auto">
          <div className=" w-1/3">
            <CaseInfo case={currentSession.case} />
          </div>
          {currentSession.state === "RUNNING" && (
            <RealtimeChat
              sessionId={sessionId}
              initialConversation={currentSession.conversationComponents}
            />
          )}
          <div className=" w-1/3 ">
            <EvaluationComponent clarity={3} engagement={8} speed={5} />
          </div>
        </div>
      </main>
    </>
  );
}
