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
    <div className="min-h-screen bg-white text-black font-sans">
      <main className="mx-auto flex w-full max-w-md flex-col gap-8 px-6 py-16">
        <section className="rounded-2xl border-2 border-black p-8">
          <h1 className="text-3xl font-black">Crear cuenta</h1>
          <p className="mt-2 text-sm text-black/70">
            Regístrate para empezar a trackear tus hábitos y ver tus estadísticas.
          </p>

          <form className="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>

			<input type="text" name="fullName"   onChange={(e) => handleChange(e)} placeholder="Nombre completo"  className="rounded-md border border-black/30 px-4 py-3 outline-none focus:border-black" />
            <input
              type="email"
			  onChange={(e) => handleChange(e)}
              placeholder="Correo electrónico"
			  name="email"
			  className="rounded-md border border-black/30 px-4 py-3 outline-none focus:border-black"
            />
            <input
              type="password"
			    onChange={(e) => handleChange(e)}
              placeholder="Contraseña"
			  name="password"
              className="rounded-md border border-black/30 px-4 py-3 outline-none focus:border-black"
            />
            <input
              type="password"
			    onChange={(e) => handleChange(e)}
			  name="confirmPassword"
              placeholder="Confirmar contraseña"
              className="rounded-md border border-black/30 px-4 py-3 outline-none focus:border-black"
            />
            <button
              type="submit"
              className="rounded-full border-2 border-black bg-black px-5 py-3 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-white hover:text-black"
            >
              Crear cuenta
            </button>
          </form>

          {message && <p className="mt-3 text-sm text-black/70">{message}</p>}

       

          <Link href="/login" className="mt-4 inline-block text-sm font-bold text-black/80 hover:text-black">
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </section>
      </main>
    </div>
  );
}