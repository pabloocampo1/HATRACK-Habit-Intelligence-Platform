import { getCurrentUser } from "@/services/authService";
import { redirect, notFound } from "next/navigation";
import { fetchGoalDetail, fetchGoalPlanInfo } from "@/app/actions/goals/goalActions";
import { fetchHabits } from "@/app/actions/habitActions";
import { fetchChallenges } from "@/app/actions/challenges/challengeActions";
import GoalDetailClient from "./_components/GoalDetailClient";

export default async function GoalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

  const [goal, planInfo, habits, challengesResult] = await Promise.all([
    fetchGoalDetail(id, user.id),
    fetchGoalPlanInfo(user.id),
    fetchHabits(user.id),
    fetchChallenges(user.id),
  ]);

  if (!goal) notFound();

  const challenges = challengesResult ?? [];

  return (
    <div className="dark mx-auto max-w-4xl px-6 py-10">
      <GoalDetailClient
        goal={goal}
        planInfo={planInfo}
        habits={habits}
        challenges={challenges}
        userId={user.id}
      />
    </div>
  );
}
