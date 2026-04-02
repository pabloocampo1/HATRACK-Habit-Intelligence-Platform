


export async function createUser(userDto: { email: string; password: string; confirmPassword: string; fullName: string }) {
  if (userDto.password !== userDto.confirmPassword) {
    throw new Error("Las contraseñas no coinciden");
  }

  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: userDto.email, password: userDto.password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error?.error || "Error al crear cuenta");
  }

  return await res.json();
}