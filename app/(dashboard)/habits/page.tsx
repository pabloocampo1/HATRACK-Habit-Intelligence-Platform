import { fetchHabits } from "@/app/actions/habitActions";
import { fetchHabitsPageData } from "@/app/actions/habits/habitOverviewAction";
import { fetchPlanInfo } from "@/app/actions/plans/subscriptionActions";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/authService";
import HabitsGlobalInsightsPanel from "./_components/HabitsGlobalInsights";
import HabitsListSection from "./_components/HabitsListSection";
import HabitsPageHeader from "./_components/HabitsPageHeader";

export default async function HabitsPage() {
  const user = await getCurrentUser();

  if (!user?.id) {
    redirect("/login");
  }

  const [habits, { overviews, insights }, planInfo] = await Promise.all([
    fetchHabits(user.id),
    fetchHabitsPageData(user.id),
    fetchPlanInfo(user.id),
  ]);

  return (
    <div className="dark mx-auto max-w-7xl space-y-12 px-6 py-10">
      <HabitsPageHeader userId={user.id} habits={habits} planInfo={planInfo} />
      <HabitsGlobalInsightsPanel insights={insights} />
      <HabitsListSection habits={overviews} />
    </div>
  );
}
