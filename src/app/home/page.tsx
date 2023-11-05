import { api } from "~/trpc/server";
import Header from "../_components/header";
import CaseTile from "./_components/case_tile";

export const Metadata = {
  title: "Welcome to Cacey",
};

export default async function Welcome() {
  const allCases = await api.case.getAll.query();

  const CaseTileList = () => {
    return (
      <ul>
        {allCases.map((caseData) => {
          return <CaseTile key={caseData.id} caseData={caseData} />;
        })}
      </ul>
    );
  };

  return (
    <>
      <Header />
      <main className="flex min-h-screen flex-col items-center">
        <div className="w-full max-w-6xl px-4 md:px-6 lg:px-8">
          {" "}
          <div className="mt-4 w-full p-2">
            <h1 className="text-center text-xl font-bold ">
              Discover New Cases
            </h1>{" "}
            <CaseTileList />
          </div>
        </div>
      </main>
    </>
  );
}

/*
  <div>
    <h1 className="text-xl font-bold">Your Stats</h1>
    <CompletedCasesList />
  </div>
*/
