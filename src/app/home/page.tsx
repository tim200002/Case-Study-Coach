import Header from "../_components/header";
import { Filter } from "./_components/case_filter";
import { and, eq } from "drizzle-orm";
import { db } from "~/server/db";
import { Case, cases } from "~/server/db/schema";
import { z } from "zod";
import CaseTile from "./_components/case_tile";

export const Metadata = {
  title: "Welcome to Cacey",
};

export default async function Welcome({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const querySchema = z.object({
    sector: z.custom<Case["sector"]>(),
    difficulty: z.custom<Case["difficulty"]>(),
    function: z.custom<Case["function"]>(),
  });

  const searchParamsParsed = querySchema.parse(searchParams);

  const conditions = [];
  if (searchParamsParsed.sector) {
    conditions.push(eq(cases.sector, searchParamsParsed.sector));
  }
  if (searchParamsParsed.difficulty) {
    conditions.push(eq(cases.difficulty, searchParamsParsed.difficulty));
  }
  if (searchParamsParsed.function) {
    conditions.push(eq(cases.function, searchParamsParsed.function));
  }
  const filteredCases = await db.query.cases.findMany({
    where: and(...conditions),
  });

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
            <Filter searchParams={searchParams} />
            <div>
              {filteredCases.map((caseItem: Case) => (
                <CaseTile key={caseItem.id} caseData={caseItem} />
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
