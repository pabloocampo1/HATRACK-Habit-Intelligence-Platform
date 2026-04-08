export async function logout() {
  return await fetch("/api/auth/logout", { method: "POST" });
}
