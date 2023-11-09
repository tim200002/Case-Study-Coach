import { api } from "~/trpc/server";
import Header from "../_components/header";
import CompletedCasesList from "./_components/completed_cases";
import StatsDashboard from "./_components/stats_dashboard";

export default function Stats() {
  return (
    <div>
      <Header />
      <div>
        <StatsDashboard />
        <CompletedCasesList />
      </div>
    </div>
  );
}
