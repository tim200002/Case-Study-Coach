"use client";
import React, { useState, useEffect } from "react";
import CaseTile from "./case_tile";
import type { Case } from "~/server/db/schema";

interface CaseFilterProps {
  cases: Case[];
}

const CaseFilter: React.FC<CaseFilterProps> = ({ cases }) => {
  const [filteredCases, setFilteredCases] = useState<Case[]>(cases);
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("");
  const [selectedFunction, setSelectedFunction] = useState<string>("");

  const handleSectorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedSector(event.target.value);
  };

  const handleDifficultyChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedDifficulty(event.target.value);
  };

  const handleFunctionChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setSelectedFunction(event.target.value);
  };

  const resetFilters = () => {
    setSelectedSector("");
    setSelectedDifficulty("");
    setSelectedFunction("");
  };

  useEffect(() => {
    setFilteredCases(
      cases.filter(
        (caseItem) =>
          (selectedSector ? caseItem.sector === selectedSector : true) &&
          (selectedDifficulty
            ? caseItem.difficulty === selectedDifficulty
            : true) &&
          (selectedFunction ? caseItem.function === selectedFunction : true),
      ),
    );
  }, [selectedSector, selectedDifficulty, selectedFunction, cases]);

  return (
    <div className="flex flex-col space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-4"></div>

        <select
          className="mx-2 rounded border p-2 pr-4 shadow-md"
          value={selectedSector}
          onChange={handleSectorChange}
        >
          <option value="">All Sectors</option>
          <option value="TECH">Tech</option>
          <option value="FINANCE">Finance</option>
          <option value="CONSULTING">Consulting</option>
          <option value="OTHER">Other</option>
        </select>
        <select
          className="mx-2 rounded border p-2 shadow-md"
          value={selectedDifficulty}
          onChange={handleDifficultyChange}
        >
          <option value="">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        <select
          className=" mx-2 rounded border p-2 shadow-md"
          value={selectedFunction}
          onChange={handleFunctionChange}
        >
          <option value="">All Functions</option>
          <option value="DIGITAL">Digital</option>
          <option value="MARKETING">Marketing</option>
          <option value="GROWTH">Growth</option>
          <option value="INVESTMENT">Investment</option>
          <option value="M&A">M&A</option>
        </select>
        <button
          onClick={resetFilters}
          className="ml-auto mr-3 rounded-md bg-blue-600 px-4 py-2 text-white shadow hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
        >
          Clear Filters
        </button>
      </div>
      <div>
        {filteredCases.map((caseItem: Case) => (
          <CaseTile key={caseItem.id} caseData={caseItem} />
        ))}
      </div>
    </div>
  );
};

export default CaseFilter;
