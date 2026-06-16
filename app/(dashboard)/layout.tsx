import { getCurrentUser } from "@/services/authService";
import { profileRepository } from "@/lib/supabase/repository/profileRepository";
import { subscriptionRepository } from "@/lib/supabase/repository/subscriptionRepository";
import { getLimits } from "@/lib/plans/limits";
import DashboardShell from "./_components/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  let displayName = "Usuario";
  let planLabel = "Gratuito";
  let isPremium = false;

  if (user?.id) {
    const [profile, subscription] = await Promise.all([
      profileRepository.findByUser(user.id),
      subscriptionRepository.findByUser(user.id),
    ]);
    displayName =
      profile?.display_name ||
      (user.email ? user.email.split("@")[0] : "Usuario");
    const limits = getLimits(subscription.plan);
    planLabel = limits.label;
    isPremium = limits.isPremium;
  }

  return (
    <DashboardShell
      userName={displayName}
      planLabel={planLabel}
      isPremium={isPremium}
    >
      {children}
    </DashboardShell>
  );
}
