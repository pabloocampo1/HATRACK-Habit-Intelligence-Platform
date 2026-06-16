import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/services/authService";
import { fetchChallengeDetail } from "@/app/actions/challenges/challengeActions";
import ChallengeDetailClient from "./_components/ChallengeDetailClient";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params;
  const detail = await fetchChallengeDetail(id);
  return { title: detail?.challenge.title ?? "Reto" };
}

export default async function ChallengeDetailPage({ params }: PageProps) {
  const { id } = await params;

  const user = await getCurrentUser();

  if (!user?.id) redirect("/login");

  const detail = await fetchChallengeDetail(id);
  if (!detail || detail.challenge.user_id !== user.id) notFound();

  return <ChallengeDetailClient detail={detail} userId={user.id} />;
}
