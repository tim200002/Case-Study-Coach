"use client";

import Link from "next/link";
import Spinner from "~/app/_components/spinner";
import { api } from "~/trpc/react";

export default function CompletedCasesList() {
  const { data, isLoading } = api.case.getUserCases.useQuery();

  if (isLoading) {
    return <Spinner />;
  }
  //<div className="flex min-h-screen flex-col items-center">
  //<div className="w-full max-w-6xl px-4 md:px-6 lg:px-8">

  return (
    <div className="flex min-h-screen flex-col items-center">
      <div className="w-full max-w-6xl px-4 md:px-6 lg:px-8">
        {data!.map((info) => {
          return (
            <CompletedCaseTile
              key={info.sessionId}
              title={info.caseTitle}
              isCompleted={info.caseCompleted}
              sessionId={info.sessionId}
            />
          );
        })}
      </div>
    </div>
  );
}

function CompletedCaseTile(props: {
  title: string;
  isCompleted: boolean;
  sessionId: number;
}) {
  const { title, isCompleted, sessionId } = props;

  const textContent = isCompleted ? "Completed" : "In Progress";
  const textColor = isCompleted ? "text-green-500" : "text-yellow-500";

  console.log(isCompleted);
  return (
    <div className="m-2 flex flex-col rounded border p-6 shadow-md">
      <h1 className="text-l font-semibold">{title}</h1>
      <p className={textColor}>{textContent}</p>
      <div className="flex flex-row">
        <div className="grow" />
        <Link href={`chatbot/${sessionId}`}>
          <p className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">
            Go to Case
          </p>
        </Link>
      </div>
    </div>
  );
}
