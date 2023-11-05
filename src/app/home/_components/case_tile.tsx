"use client";
import type { Case } from "~/server/db/schema";
import { api } from "~/trpc/react";
import { useRouter } from "next/navigation";
import { StarIcon } from "@heroicons/react/24/solid";

export default function CaseTile(props: { caseData: Case }) {
  const { caseData } = props;
  const { caseTitle, caseDescription, id } = caseData;
  const router = useRouter();

  const tags = [
    { type: "Interviewer-led" },
    { difficulty: "Easy" },
    { functionArea: "Operations" },
    { sector: "Healthcare" },
  ];

  const type = "Interviewer-led"; // Replace with caseData.type
  const difficulty = "Easy"; // Replace with caseData.difficulty
  const functionArea = "Operations"; // Replace with caseData.functionArea
  const sector = "Healthcare"; // Replace with caseData.industry
  const rating = 4.5; // Replace with caseData.rating

  const renderStars = () => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
      stars.push(
        <StarIcon
          key={i}
          className={`h-5 w-5 ${
            i < Math.round(rating) ? "text-yellow-400" : "text-gray-300"
          }`}
        />,
      );
    }
    return stars;
  };

  const { mutate: startCase } = api.chatbot.createNewSession.useMutation({
    onSuccess(sessionId, context) {
      router.push(`/chatbot/${sessionId}`);
    },
  });

  return (
    <div className="m-2 flex flex-col rounded border p-6 shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{caseTitle}</h3>
          <p className="text-sm text-gray-500">
            {type} | Difficulty: {difficulty} | Function: {functionArea} |
            Sector: {sector}
          </p>
          <p className="mt-2 text-gray-600">{caseDescription}</p>
        </div>
        <div className="flex items-center">
          <span className="mr-2 text-lg font-semibold text-gray-800">
            {rating.toFixed(1)}
          </span>
          <div className="flex">{renderStars()}</div>
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <button className="rounded-lg bg-blue-600 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-700 focus:ring-4 focus:ring-blue-300">
          View case
        </button>
      </div>
    </div>
  );
}
