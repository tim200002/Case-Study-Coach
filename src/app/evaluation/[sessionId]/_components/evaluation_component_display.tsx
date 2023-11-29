"use client";

import { type EvaluationComponent } from "~/server/db/schema";

export default function EvaluationComponentDispaly(props: {
  evaluationComponent: EvaluationComponent;
}) {
  const evaluationComponent = props.evaluationComponent;

  if (!evaluationComponent) {
    throw Error("No Evaluation Componetn");
  }

  return (
    <div className="mx-auto my-8 max-w-sm rounded bg-white p-6 shadow-lg">
      <div className="mb-4 text-center text-5xl font-bold text-black">
        {evaluationComponent.score} / 10
      </div>
      <p
        className="mx-2 overflow-y-scroll text-base text-gray-700 "
        style={{ height: "500px" }}
      >
        {evaluationComponent.feedback}
      </p>
    </div>
  );
}
