"use client";

import { useRef, useEffect, useState } from "react";
import Spinner from "~/app/_components/spinner";
import { api } from "~/trpc/react";

export default function Loading(props: { sessionId: number }) {
  const [isTimeout, setIsTimeout] = useState(false);
  const { data, isLoading } = api.case.getEvaluation.useQuery({
    sessionId: props.sessionId,
  });

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(() => {}, 300);
      setIsTimeout(true);
    }
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  if (isTimeout) {
    return null;
  }

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
