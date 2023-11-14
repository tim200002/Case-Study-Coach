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
}) => {
  const { title, isCompleted, sessionId } = props;

  const textContent = isCompleted ? "Completed" : "In Progress";
  const textColor = isCompleted ? "text-green-500" : "text-yellow-500";
  const router = useRouter();
  const { mutate, isLoading } = api.case.deleteUserCase.useMutation({
    onSuccess: () => {
      router.refresh();
    },
  });

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
      <h1 className="text-l font-semibold">{title}</h1>
      <p className={textColor}>{textContent}</p>
      <div className="flex flex-row">
        <div className="grow" />
        <Link href={`chatbot/${sessionId}`}>
          <p className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700">
            Go to Case
          </p>
        </Link>
        <div className="w-2" />
        <DeleteButton />
      </div>
    </div>
  );
};

export default CaseTile;
