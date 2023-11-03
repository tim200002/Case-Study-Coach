"use client";
import type { Case } from "~/server/db/schema";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";

export default function CaseTile(props: { caseData: Case }) {
  const { caseData } = props;
  const { caseTitle, caseDescription, id } = caseData;
  const router = useRouter();

  const { mutate: startCase } = api.chatbot.createNewSession.useMutation({
    onSuccess(sessionId, context) {
      router.push(`/chatbot/${sessionId}`);
    },
  });

  return (
    <div className="m-2 flex flex-col rounded border p-6 shadow-md">
      <h1 className="text-l font-semibold">{caseTitle}</h1>
      <p className="text">{caseDescription}</p>
      <div className="flex flex-row">
        <div className="grow" />
        <button
          className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
          onClick={() => startCase({ caseId: id })}
        >
          Start Case
        </button>
      </div>
    </div>
  );
}
