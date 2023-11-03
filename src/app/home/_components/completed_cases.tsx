"use client";

import { IconForbid } from "@tabler/icons-react";
import Spinner from "~/app/_components/spinner";
import { api } from "~/trpc/react";

export default function CompletedCasesList() {
  // TODO: get completed cases from server
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
          />
        );
      })}
    </ul>
  );
}

function CompletedCaseTile(props: { title: string; isCompleted: boolean }) {
  const { title, isCompleted } = props;
  console.log(isCompleted);
  return (
    <div className="m-2 rounded bg-white p-6 shadow-md">
      <h1>Case title: {title}</h1>
      <h1>Completed: {isCompleted.toString()}</h1>
    </div>
  );
}
