"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase/config/supabaseClient";
import { Eye, EyeOff, ArrowRight, AlertCircle } from "lucide-react";

// ── decorative ring ──────────────────────────────────────────

function Ring({
  size,
  opacity,
  delay,
}: {
  size: number;
  opacity: number;
  delay: string;
}) {
  return (
    <div
      aria-hidden
      className="absolute rounded-full border border-brand-forest/20 animate-pulse"
      style={{
        width: size,
        height: size,
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        opacity,
        animationDelay: delay,
        animationDuration: "3s",
      }}
    />
  );
}

// ── stat badge ───────────────────────────────────────────────

function StatBadge({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-white/4 px-5 py-4 backdrop-blur-sm">
      <p className="text-2xl font-black tabular-nums text-white">{value}</p>
      <p className="mt-0.5 text-[10px] font-bold uppercase tracking-widest text-white/40">
        {label}
      </p>
    </div>
  );
}

// ── main ─────────────────────────────────────────────────────

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message || "Error al iniciar sesión.");
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
          className="pointer-events-none absolute bottom-0 left-0 h-[600px] w-[600px] -translate-x-1/3 translate-y-1/3 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(52,211,153,0.07) 0%, transparent 70%)",
          }}
        />

        {/* concentric rings */}
        <div className="pointer-events-none absolute inset-0">
          <Ring size={320} opacity={0.5} delay="0s" />
          <Ring size={500} opacity={0.3} delay="0.6s" />
          <Ring size={700} opacity={0.15} delay="1.2s" />
        </div>

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
        <div className="relative z-10 space-y-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-forest/80">
              Sistema de hábitos
            </p>
            <h2 className="mt-3 text-5xl font-black leading-[1.1] tracking-tight text-white">
              Construye hábitos{" "}
              <span className="text-brand-forest">que duran.</span>
            </h2>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/40">
              Registra tus sesiones, mide tu progreso real y supera retos
              personales. Todo en un solo lugar.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <StatBadge label="Hábitos" value="∞" />
            <StatBadge label="Retos" value="×4" />
            <StatBadge label="Analytics" value="↑" />
          </div>
        </div>

        {/* bottom */}
        <div className="relative z-10">
          <p className="text-[9px] font-mono uppercase tracking-[0.5em] text-white/20">
            Sistema de productividad
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
              Bienvenido de nuevo
            </h1>
            <p className="mt-2 text-sm text-white/40">
              Ingresa tus datos para continuar donde lo dejaste.
            </p>
          </div>

          {/* form card */}
          <div className="rounded-2xl border border-white/8 bg-white/4 p-8 backdrop-blur-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
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
                  type="email"
                  autoComplete="email"
                  required
                  disabled={loading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    type={showPass ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    disabled={loading}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`${inputBase} border-white/10 pr-12 focus:border-brand-forest/40`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-white/30 transition hover:text-white/60"
                    aria-label={showPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  >
                    {showPass ? (
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
                  <AlertCircle className="mt-0.5 size-4 shrink-0 text-red-400" strokeWidth={2} />
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
                    Entrando…
                  </>
                ) : (
                  <>
                    Entrar a mi cuenta
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
              ¿No tienes cuenta?{" "}
              <Link
                href="/signup"
                className="font-bold text-brand-forest underline underline-offset-2 transition hover:brightness-125"
              >
                Crear cuenta gratis
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
