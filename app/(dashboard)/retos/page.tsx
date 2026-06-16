import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/authService";
import { fetchChallenges } from "@/app/actions/challenges/challengeActions";
import { fetchHabits } from "@/app/actions/habitActions";
import { fetchPlanInfo } from "@/app/actions/plans/subscriptionActions";
import RetosList from "./_components/RetosList";

export const metadata = { title: "Retos" };

export default async function RetosPage() {
  const user = await getCurrentUser();

  if (!user?.id) redirect("/login");

  const [challenges, habits, planInfo] = await Promise.all([
    fetchChallenges(user.id),
    fetchHabits(user.id),
    fetchPlanInfo(user.id),
  ]);

  return (
    <div className="dark mx-auto max-w-7xl space-y-10 px-4 py-8 sm:px-6 sm:py-10">
      <RetosList challenges={challenges} habits={habits} userId={user.id} planInfo={planInfo} />
    </div>
  );
}
