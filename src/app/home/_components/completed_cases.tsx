"use client";

import { IconForbid } from "@tabler/icons-react";
import Link from "next/link";
import Spinner from "~/app/_components/spinner";
import { api } from "~/trpc/react";

export default function CompletedCasesList() {
  const { data, isLoading } = api.case.getUserCases.useQuery();

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <ul>
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
    </ul>
  );
}

function CompletedCaseTile(props: {
  title: string;
  isCompleted: boolean;
  sessionId: number;
}) {
  const { title, isCompleted, sessionId } = props;
  console.log(isCompleted);
  return (
    <div className="m-2 rounded bg-white p-6 shadow-md">
      <h1>Case title: {title}</h1>
      <h1>Completed: {isCompleted.toString()}</h1>
      <Link href={`chatbot/${sessionId}`}>Go to case</Link>
    </div>
  );
}
