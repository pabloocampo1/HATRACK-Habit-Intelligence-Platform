"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Cargando...");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      setMessage(data.error || "Error al iniciar sesión");
      return;
    }

    // Guardar token en localStorage
    await fetch("/api/auth/setCookie", {
      method: "POST",
      body: JSON.stringify({
        token: data.session.access_token,
      }),
    });

    setMessage("¡Bienvenido! Redirigiendo...");
    setTimeout(() => router.push("/dashboard"), 1500);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      <main className="mx-auto flex w-full max-w-md flex-col gap-8 px-6 py-16">
        <section className="rounded-2xl border-2 border-black p-8">
          <h1 className="text-3xl font-black">Iniciar sesión</h1>
          <p className="mt-2 text-sm text-black/70">
            Accede para ver tus estadísticas y seguir tu progreso.
          </p>

          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Correo electrónico"
              className="rounded-md border border-black/30 px-4 py-3 outline-none focus:border-black"
            />
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Contraseña"
              className="rounded-md border border-black/30 px-4 py-3 outline-none focus:border-black"
            />
            <button
              type="submit"
              className="rounded-full border-2 border-black bg-black px-5 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white hover:text-black"
            >
              Entrar
            </button>
          </form>

          {message && <p className="mt-3 text-sm text-black/70">{message}</p>}

          <p className="mt-4 text-xs text-black/70">
            ¿No tienes cuenta?{" "}
            <Link href="/signup" className="font-bold underline">
              Regístrate
            </Link>
          </p>

          <Link
            href="/"
            className="mt-4 inline-block text-sm font-bold text-black/80 hover:text-black"
          >
            ← Volver a hatrack
          </Link>
        </section>
      </main>
    </div>
  );
}
