"use client";

import Link from "next/link";
import { evaluations } from "~/server/db/schema";

const CaseCompleted = (props: { sessionId: number }) => {
  const { sessionId } = props;

  return (
    <div className="m-2 flex flex-col items-center">
      <h1 className="m-4 text-4xl font-bold">Case Completed</h1>
      <Link href={`/evaluation/${sessionId}`}>
        <p className="inline-block rounded bg-green-500 px-4 py-2 text-center font-bold text-white hover:bg-blue-700">
          Go To Evaluation
        </p>
      </Link>
    </div>
  );
};

export default CaseCompleted;
