"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/config/supabaseClient";
import { Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

// ── password strength ────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ caracteres", ok: password.length >= 8 },
    { label: "Mayúscula", ok: /[A-Z]/.test(password) },
    { label: "Número", ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ["bg-red-500", "bg-yellow-500", "bg-brand-forest"];
  const color = password.length > 0 ? colors[score - 1] ?? "bg-red-500" : "bg-white/10";

  if (!password) return null;

  return (
    <div className="space-y-2">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? color : "bg-white/10"}`}
          />
        ))}
      </div>
      <div className="flex gap-3">
        {checks.map((c) => (
          <span
            key={c.label}
            className={`flex items-center gap-1 text-[10px] font-medium transition-colors ${c.ok ? "text-brand-forest" : "text-white/30"}`}
          >
            <CheckCircle2 className="size-3" strokeWidth={c.ok ? 2.5 : 1.5} />
            {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ── main ─────────────────────────────────────────────────────

export default function SignupPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);

    const { error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.fullName } },
    });

    if (authError) {
      setError(authError.message || "Error al crear cuenta.");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  const inputBase =
    "w-full rounded-xl border bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-white/30 outline-none transition focus:ring-1 focus:ring-brand-forest/60 disabled:opacity-50";

  return (
    <div className="dark flex min-h-dvh bg-[#09090b] font-sans">
      {/* ── LEFT PANEL ─────────────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-between overflow-hidden bg-[#0a0f0d] p-14">
        {/* grid texture */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(rgba(52,211,153,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.04) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />

        {/* radial glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 right-0 h-[500px] w-[500px] translate-x-1/3 -translate-y-1/3 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 70%)",
          }}
        />

        {/* logo */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-forest">
              <span className="text-lg font-black text-[#022c22]">H</span>
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              HaTrack
            </span>
          </div>
        </div>

        {/* center content */}
        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-forest/80">
              Empieza hoy
            </p>
            <h2 className="mt-3 text-5xl font-black leading-[1.1] tracking-tight text-white">
              El primer paso es{" "}
              <span className="text-brand-forest">registrarte.</span>
            </h2>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/40">
              Crea tu cuenta gratuita y empieza a trackear tus hábitos, retos y
              progreso personal desde el día uno.
            </p>
          </div>

          {/* steps */}
          <div className="space-y-3">
            {[
              "Crea tu cuenta en segundos",
              "Define tus primeros hábitos",
              "Registra sesiones y mide tu avance",
              "Supera retos y alcanza tus metas",
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-forest/20 text-[10px] font-black text-brand-forest">
                  {i + 1}
                </div>
                <p className="text-sm text-white/50">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* bottom */}
        <div className="relative z-10">
          <p className="text-[9px] font-mono uppercase tracking-[0.5em] text-white/20">
            Plan gratuito — Sin tarjeta de crédito
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL ────────────────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        {/* mobile logo */}
        <div className="mb-10 flex items-center gap-2 lg:hidden">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-forest">
            <span className="text-base font-black text-[#022c22]">H</span>
          </div>
          <span className="text-lg font-black tracking-tight text-white">
            HaTrack
          </span>
        </div>

        <div className="w-full max-w-md">
          {/* header */}
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight text-white">
              Crea tu cuenta
            </h1>
            <p className="mt-2 text-sm text-white/40">
              Gratis para siempre. Sin tarjeta de crédito.
            </p>
          </div>

          {/* form card */}
          <div className="rounded-2xl border border-white/8 bg-white/4 p-8 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="fullName"
                  className="text-[10px] font-bold uppercase tracking-widest text-white/40"
                >
                  Nombre completo
                </label>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  autoComplete="name"
                  required
                  disabled={loading}
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Juan García"
                  className={`${inputBase} border-white/10 focus:border-brand-forest/40`}
                />
              </div>

              {/* email */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="text-[10px] font-bold uppercase tracking-widest text-white/40"
                >
                  Correo electrónico
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading}
                  value={form.email}
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className={`${inputBase} border-white/10 focus:border-brand-forest/40`}
                />
              </div>

              {/* password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="text-[10px] font-bold uppercase tracking-widest text-white/40"
                >
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPass ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    disabled={loading}
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Mínimo 8 caracteres"
                    className={`${inputBase} border-white/10 pr-12 focus:border-brand-forest/40`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/30 transition hover:text-white/60"
                    aria-label={showPass ? "Ocultar" : "Mostrar"}
                  >
                    {showPass ? (
                      <EyeOff className="size-4" strokeWidth={2} />
                    ) : (
                      <Eye className="size-4" strokeWidth={2} />
                    )}
                  </button>
                </div>
                <PasswordStrength password={form.password} />
              </div>

              {/* confirm password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="text-[10px] font-bold uppercase tracking-widest text-white/40"
                >
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    autoComplete="new-password"
                    required
                    disabled={loading}
                    value={form.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repite tu contraseña"
                    className={`${inputBase} pr-12 ${
                      form.confirmPassword && form.password !== form.confirmPassword
                        ? "border-red-500/40 focus:border-red-500/60"
                        : form.confirmPassword && form.password === form.confirmPassword
                          ? "border-brand-forest/30 focus:border-brand-forest/60"
                          : "border-white/10 focus:border-brand-forest/40"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/30 transition hover:text-white/60"
                    aria-label={showConfirm ? "Ocultar" : "Mostrar"}
                  >
                    {showConfirm ? (
                      <EyeOff className="size-4" strokeWidth={2} />
                    ) : (
                      <Eye className="size-4" strokeWidth={2} />
                    )}
                  </button>
                </div>
              </div>

              {/* error */}
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/8 px-4 py-3">
                  <AlertCircle
                    className="mt-0.5 size-4 shrink-0 text-red-400"
                    strokeWidth={2}
                  />
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}

              {/* submit */}
              <button
                type="submit"
                disabled={loading}
                className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-brand-forest px-5 py-3.5 text-[11px] font-black uppercase tracking-[0.2em] text-[#022c22] transition hover:brightness-110 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <span className="size-4 animate-spin rounded-full border-2 border-[#022c22]/30 border-t-[#022c22]" />
                    Creando cuenta…
                  </>
                ) : (
                  <>
                    Crear cuenta gratis
                    <ArrowRight
                      className="size-4 transition-transform group-hover:translate-x-0.5"
                      strokeWidth={2.5}
                    />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* footer links */}
          <div className="mt-6 flex flex-col items-center gap-3 text-center">
            <p className="text-sm text-white/40">
              ¿Ya tienes cuenta?{" "}
              <Link
                href="/login"
                className="font-bold text-brand-forest underline underline-offset-2 transition hover:brightness-125"
              >
                Iniciar sesión
              </Link>
            </p>
            <Link
              href="/"
              className="text-xs text-white/25 transition hover:text-white/50"
            >
              ← Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
