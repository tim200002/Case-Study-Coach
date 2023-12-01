"use client";

import Spinner from "~/app/_components/spinner";
import { api } from "~/trpc/react";

export default function Loading(props: { sessionId: number }) {
  const { data, isLoading } = api.case.getEvaluation.useQuery({
    sessionId: props.sessionId,
  });

  return (
    <div className="flex h-screen flex-grow flex-col items-center justify-center ">
      <Spinner />
      {!isLoading && !data && (
        <div>
          <div>Please wait while evaluation is being created...</div>
        </div>
      )}
    </div>
  );
}
