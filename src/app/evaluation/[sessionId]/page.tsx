import { Metadata } from "next";
import Header from "../../_components/header";
import { api } from "~/trpc/server";

export const metadata: Metadata = {
  title: "Evaluation",
};

export default async function Page({
  params,
}: {
  params: { sessionId: string };
}) {
  const sessionId = parseInt(params.sessionId);
  const evaluation = await api.case.getEvaluation.query({
    sessionId: sessionId,
  });

  return (
    <div>
      <Header />
      <h1>{evaluation?.caseId}</h1>
    </div>
  );
}
