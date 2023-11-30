import { api } from "~/trpc/server";
import Header from "../_components/header";
import StatsDashboard from "./_components/stats_dashboard";
import CaseTile from "./_components/case_tile";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Show your stats",
};

const CompletedCaseList = (props: {
  cases: {
    caseTitle: string;
    caseCompleted: boolean;
    sessionId: number;
    createdAt: Date;
    evaluationScore: number;
  }[];
}) => {
  const { cases } = props;
  return (
    <div className="flex min-h-screen flex-col items-center">
      <div className="w-full max-w-6xl px-4 md:px-6 lg:px-8">
        {cases.map((info) => {
          return (
            <CaseTile
              key={info.sessionId}
              title={info.caseTitle}
              isCompleted={info.caseCompleted}
              sessionId={info.sessionId}
              createdAt={info.createdAt}
              evaluationScore={info.evaluationScore}
            />
          );
        })}
      </div>
    </div>
  );
};

export default async function Stats() {
  const userCases = await api.case.getUserCases.query();

  for (const userCase of userCases) {
    const evaluation = await api.case.getEvaluation.query({
      sessionId: userCase.sessionId,
    });

    userCase.evaluationScore = evaluation?.overallScore ?? null;
  }

  return (
    <div>
      <Header />
      <div>
        <StatsDashboard userCases={userCases} />
        <CompletedCaseList cases={userCases} />
      </div>
    </div>
  );
}
