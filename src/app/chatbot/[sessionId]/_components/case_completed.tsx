"use client";

//ToDo REbuild as server component

import Link from "next/link";
import { api } from "~/trpc/react";

const CaseCompleted = (props: { sessionId: number }) => {
  const { sessionId } = props;

  const { data: evaluation, isLoading } = api.case.getEvaluation.useQuery({
    sessionId: sessionId,
  });

  return (
    <div className="m-2 flex flex-col items-center">
      <h1 className="m-4 text-4xl font-bold">Case Completed</h1>
      {isLoading && <h1>Loading...</h1>}
      {!isLoading && (
        <Link href={`/evaluation/${sessionId}`}>
          <p className="inline-block rounded bg-green-500 px-4 py-2 text-center font-bold text-white hover:bg-blue-700">
            Go To Evaluation
          </p>
        </Link>
      )}
    </div>
  );
};

export default CaseCompleted;
