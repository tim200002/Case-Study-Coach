import { Metadata } from "next";
import Header from "../../_components/header";
import { api } from "~/trpc/server";
import { evaluations } from "~/server/db/schema";

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

  //If there is no evaluation we create one
  if (!evaluation) {
    const newEvaluationId = await api.case.createEvaluation.mutate({
      sessionId: sessionId,
    });

    console.log(newEvaluationId);
  }

  const newEvaluationId = await api.case.createEvaluation.mutate({
    sessionId: sessionId,
  });

  return (
    <div>
      <Header />
      {evaluation && <h1>Evaluation found</h1>}
      {!evaluation && <h1>Evaluation not found</h1>}
      <h1>{evaluation!.id}</h1>
    </div>
  );
}
