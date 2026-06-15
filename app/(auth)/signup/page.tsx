"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { createUser } from "./actions";

export default function SignupPage() {
	const [registerDto, setRegisterDto] = useState({
		email: "",
		password: "",
		confirmPassword: "",
		fullName: ""
	})
	const [message, setMessage] = useState("");
	const router = useRouter();

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		setMessage("Creando cuenta...");
		
		try {
			const result = await createUser(registerDto);
			if (result.session?.access_token) {
				localStorage.setItem("supabase_token", result.session.access_token);
			}
			setMessage("Registro exitoso. Redirigiendo...");
			setTimeout(() => router.push("/dashboard"), 1500);
		} catch (error: any) {
			setMessage(error?.message || "Error al crear cuenta.");
		}
	}

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setRegisterDto(prev => ({ ...prev, [name]: value }));
	}

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <main className="mx-auto flex w-full max-w-md flex-col gap-8 px-6 py-16">
        <section className="rounded-2xl border-2 border-border-strong p-8">
          <h1 className="text-3xl font-black">Crear cuenta</h1>
          <p className="mt-2 text-sm text-text-secondary">
            Regístrate para empezar a trackear tus hábitos y ver tus estadísticas.
          </p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>

			<input type="text" name="fullName"   onChange={(e) => handleChange(e)} placeholder="Nombre completo"  className="rounded-md border border-border-default bg-surface-card px-4 py-3 text-foreground outline-none focus:border-brand-forest" />
            <input
              type="email"
			  onChange={(e) => handleChange(e)}
              placeholder="Correo electrónico"
			  name="email"
			  className="rounded-md border border-border-default bg-surface-card px-4 py-3 text-foreground outline-none focus:border-brand-forest"
            />
            <input
              type="password"
			    onChange={(e) => handleChange(e)}
              placeholder="Contraseña"
			  name="password"
              className="rounded-md border border-border-default bg-surface-card px-4 py-3 text-foreground outline-none focus:border-brand-forest"
            />
            <input
              type="password"
			    onChange={(e) => handleChange(e)}
			  name="confirmPassword"
              placeholder="Confirmar contraseña"
              className="rounded-md border border-border-default bg-surface-card px-4 py-3 text-foreground outline-none focus:border-brand-forest"
            />
            <button
              type="submit"
              className="rounded-full border-2 border-brand-forest bg-brand-forest px-5 py-3 text-sm font-bold uppercase tracking-widest text-brand-forest-fg transition hover:brightness-110"
            >
              Crear cuenta
            </button>
          </form>

          {message && <p className="mt-3 text-sm text-text-secondary">{message}</p>}

       

          <Link href="/login" className="mt-4 inline-block text-sm font-bold text-text-secondary hover:text-foreground">
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </section>
      </main>
    </div>
  );
}