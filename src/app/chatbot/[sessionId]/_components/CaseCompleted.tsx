"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const CaseCompleted = (props: { sessionId: number }) => {
  const { sessionId } = props;
  const [evaluationId, setEvaluationId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvaluationId = async () => {
      try {
        const evaluation = await api.case.getEvaluation.query({
          sessionId: sessionId,
        });
        setEvaluationId(evaluation!.id);
      } catch (e) {
        throw e;
      } finally {
        console.log("done");
        setLoading(false);
      }
    };

    fetchEvaluationId();
  });

  return (
    <div className="m-2 flex flex-col items-center">
      <h1 className="m-4 text-4xl font-bold">Case Completed</h1>
      {loading && <h1>Loading...</h1>}
      {!loading && <h1>{evaluationId}</h1>}
      <Link href={`/evaluation/${sessionId}`}>
        <p className="inline-block rounded bg-green-500 px-4 py-2 text-center font-bold text-white hover:bg-blue-700">
          Go To Evaluation
        </p>
      </Link>
    </div>
  );
};

export default CaseCompleted;
