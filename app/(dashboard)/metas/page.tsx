import { getCurrentUser } from "@/services/authService";
import { redirect } from "next/navigation";
import { fetchGoals, fetchGoalPlanInfo } from "@/app/actions/goals/goalActions";
import { fetchHabits } from "@/app/actions/habitActions";
import { fetchChallenges } from "@/app/actions/challenges/challengeActions";
import GoalsList from "./_components/GoalsList";

export default async function MetasPage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const [goals, planInfo, habits, challengesResult] = await Promise.all([
    fetchGoals(user.id),
    fetchGoalPlanInfo(user.id),
    fetchHabits(user.id),
    fetchChallenges(user.id),
  ]);

  const challenges = challengesResult ?? [];

  return (
    <div className="dark mx-auto max-w-7xl space-y-10 px-6 py-10">
      <GoalsList
        goals={goals}
        planInfo={planInfo}
        habits={habits}
        challenges={challenges}
        userId={user.id}
      />
    </div>
  );
}
