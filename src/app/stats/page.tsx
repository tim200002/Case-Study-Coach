import { api } from "~/trpc/server";
import Header from "../_components/header";
import CompletedCasesList from "./_components/completed_cases";
import StatsDashboard from "./_components/stats_dashboard";

export default async function Stats() {
  const userCases = await api.case.getUserCases.query();
  return (
    <div>
      <Header />
      <div>
        <StatsDashboard userCases={userCases} />
        <CompletedCasesList userCases={userCases} />
      </div>
    </div>
  );
}
