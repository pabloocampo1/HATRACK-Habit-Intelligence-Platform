import { fetchHabits } from "@/app/actions/habitActions";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getUserFromToken } from "@/services/authService";
import HabitsGlobalInsightsPanel from "./_components/HabitsGlobalInsights";
import HabitsListSection from "./_components/HabitsListSection";
import HabitsPageHeader from "./_components/HabitsPageHeader";
import { MOCK_GLOBAL_INSIGHTS, MOCK_HABIT_OVERVIEWS } from "./_data/mock";

export default async function HabitsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("hackhabit_auth")?.value ?? "";
  const user = await getUserFromToken(token);

  if (!user?.id) {
    redirect("/noAuthenticated");
  }

  const habits = await fetchHabits(user.id);

  return (
    <div className="mx-auto max-w-7xl space-y-12 px-6 py-10">
      <HabitsPageHeader userId={user.id} habits={habits} />
      <HabitsGlobalInsightsPanel insights={MOCK_GLOBAL_INSIGHTS} />
      <HabitsListSection habits={MOCK_HABIT_OVERVIEWS} />
    </div>
  );
}
