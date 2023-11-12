"use client";
import React from "react";

import {
  CaseDifficultyLevels,
  CaseFunctionTypes,
  CaseSectorTypes,
} from "~/server/db/schema";
import { useRouter } from "next/navigation";

export const Filter = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) => {
  const router = useRouter();

  const generateQueryUrl = (filter: string, value: string): string => {
    const url = new URL(window.location.href);
    if (value === "") {
      url.searchParams.delete(filter);
    } else {
      url.searchParams.set(filter, value);
    }
    return url.toString();
  };

  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-4"></div>

        <select
          className="mx-2 rounded border p-2 pr-4 shadow-md"
          value={searchParams.sector ?? ""}
          onChange={(event) => {
            const queryUrl = generateQueryUrl("sector", event.target.value);
            router.replace(queryUrl);
          }}
        >
          <option value="">All Sectors</option>
          {CaseSectorTypes.map((sector) => (
            <option value={sector}>{sector}</option>
          ))}
        </select>
        <select
          className="mx-2 rounded border p-2 shadow-md"
          value={searchParams.difficulty ?? ""}
          onChange={(event) => {
            const queryUrl = generateQueryUrl("difficulty", event.target.value);
            router.replace(queryUrl);
          }}
        >
          <option value="">All Difficulties</option>
          {CaseDifficultyLevels.map((difficulty) => (
            <option value={difficulty}>{difficulty}</option>
          ))}
        </select>
        <select
          className=" mx-2 rounded border p-2 shadow-md"
          value={searchParams.function ?? ""}
          onChange={(event) => {
            const queryUrl = generateQueryUrl("function", event.target.value);
            router.replace(queryUrl);
          }}
        >
          <option value="">All Functions</option>
          {CaseFunctionTypes.map((functionType) => (
            <option value={functionType}>{functionType}</option>
          ))}
        </select>
        <button
          onClick={() => {
            router.replace(window.location.pathname);
          }}
          className="ml-auto mr-3 rounded-md bg-blue-600 px-4 py-2 text-white shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};
