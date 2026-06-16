import { redirect } from "next/navigation";
import { getCurrentUser } from "@/services/authService";
import { fetchProfilePageData } from "@/app/actions/profile/profileActions";
import ProfileClient from "./_components/ProfileClient";

export const metadata = { title: "Mi perfil" };

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user?.id) redirect("/login");

  const data = await fetchProfilePageData(
    user.id,
    user.email ?? "",
    user.created_at ?? new Date().toISOString(),
  );

  return (
    <ProfileClient
      data={data}
      userId={user.id}
      userEmail={user.email ?? ""}
    />
  );
}
