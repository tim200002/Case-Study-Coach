"use client";
import { Menu } from "@headlessui/react";
import { IconTrash } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Spinner from "~/app/_components/spinner";
import { api } from "~/trpc/react";

const CaseTile = (props: {
  title: string;
  isCompleted: boolean;
  sessionId: number;
  createdAt: Date;
  evaluationScore: number;
}) => {
  const { title, isCompleted, sessionId, createdAt, evaluationScore } = props;

  const textContent = isCompleted ? "Completed" : "In Progress";
  const textColor = isCompleted ? "text-green-500" : "text-yellow-500";
  const router = useRouter();
  const { mutate, isLoading } = api.case.deleteUserCase.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

  const EvaluationButton = () => {
    if (!isCompleted) {
      return null;
    }

    // Go to case evaluation page
    return (
      <button onClick={() => router.push(`/evaluation/${sessionId}`)}>
        <p className="rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-blue-700">
          Evaluation
        </p>
      </button>
    );
  };

  const DeleteButton = () => {
    if (isLoading) {
      return <Spinner />;
    }

    return (
      <button onClick={() => mutate({ sessionId })}>
        <IconTrash />
      </button>
    );
  };

  return (
    <div className="m-2 flex flex-col rounded border p-6 shadow-md">
      <div className="text-l flex flex-row justify-between font-semibold">
        <h1>{title}</h1>
        {evaluationScore && <h1>Score: {evaluationScore}/10</h1>}
      </div>
      <p className="text-sm text-gray-500">
        Started on {new Date(createdAt).toLocaleDateString()}
      </p>
      <p className={textColor}>{textContent}</p>
      <div className="flex flex-row justify-end">
        <div className="mr-4">
          <EvaluationButton />
        </div>
        <div className="flex flex-row">
          <Link href={`chatbot/${sessionId}`}>
            <p className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">
              Go to Case
            </p>
          </Link>
          <div className="ml-4 mt-2">
            <DeleteButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CaseTile;
