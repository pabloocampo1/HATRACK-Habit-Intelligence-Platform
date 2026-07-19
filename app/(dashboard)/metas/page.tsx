import { getCurrentUser } from "@/services/authService";
import { redirect } from "next/navigation";
import { fetchGoals, fetchGoalPlanInfo } from "@/app/actions/goals/goalActions";
import GoalsList from "./_components/GoalsList";

export default async function MetasPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const [goals, planInfo] = await Promise.all([
    fetchGoals(user.id),
    fetchGoalPlanInfo(user.id),
  ]);

  return (
    <div className="dark mx-auto max-w-7xl space-y-10 px-6 py-10">
      <GoalsList
        goals={goals}
        planInfo={planInfo}
        userId={user.id}
      />
    </div>
  );
}
