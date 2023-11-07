import { api } from "~/trpc/server";
import Header from "../_components/header";
import CaseTile from "./_components/case_tile";
import CaseFilter from "./_components/filtered_case_list";

export const Metadata = {
  title: "Welcome to Cacey",
};

export default async function Welcome() {
  const allCases = await api.case.getAll.query();

  /*  const CaseTileList = () => {
    return (
      <ul>
        {allCases.map((caseData) => {
          return <CaseTile key={caseData.id} caseData={caseData} />;
        })}
      </ul>
    );
  };*/

  allCases.push({
    id: 2,
    caseContent: null,
    caseTitle: "Test",
    caseDescription: "Test",
    function: "DIGITAL",
    sector: "CONSULTING",
    createdAt: new Date(),
    difficulty: "MEDIUM",
  });

  allCases.push({
    id: 3,
    caseContent: null,
    caseTitle: "Test",
    caseDescription: "Test",
    function: "DIGITAL",
    sector: "FINANCE",
    createdAt: new Date(),
    difficulty: "MEDIUM",
  });

  const FilteredCases = () => {
    return <CaseFilter cases={allCases} />;
  };

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center">
        <div className="w-full max-w-6xl px-4 md:px-6 lg:px-8">
          {" "}
          <div className="mt-4 w-full p-2">
            <h1 className="my-4 mt-4 text-center text-4xl font-bold">
              Discover cases
            </h1>{" "}
            <FilteredCases />
          </div>
        </div>
      </main>
    </>
  );
}
