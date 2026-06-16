"use client";

import { useRouter } from "next/navigation";
import { useId, useRef, useState, useTransition } from "react";
import {
  User,
  Mail,
  CalendarDays,
  Pencil,
  Check,
  X,
  Trash2,
  Shield,
  Sparkles,
  BarChart2,
  Swords,
  Trophy,
  Clock,
  History,
  BookOpen,
  AlertTriangle,
} from "lucide-react";
import { updateDisplayNameAction, deleteAccountAction } from "@/app/actions/profile/profileActions";
import { formatLimit } from "@/lib/plans/limits";
import type { ProfilePageData } from "@/services/profile/profileService";
import { supabase } from "@/lib/supabase/config/supabaseClient";

// ── Helpers ──────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function PlanBadge({ isPremium, label }: { isPremium: boolean; label: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-widest ${
        isPremium
          ? "border-brand-forest/30 bg-accent-subtle text-brand-forest"
          : "border-border-default bg-surface-muted text-text-muted"
      }`}
    >
      {isPremium ? <Sparkles className="size-3" strokeWidth={2.5} /> : <Shield className="size-3" strokeWidth={2} />}
      {label}
    </span>
  );
}

function SectionHeader({ label, title }: { label: string; title: string }) {
  return (
    <div className="mb-5">
      <div className="mb-1 flex items-center gap-2">
        <div className="h-[2px] w-6 bg-brand-forest" />
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-brand-forest/80">{label}</p>
      </div>
      <h2 className="text-lg font-black tracking-tight text-text-primary">{title}</h2>
    </div>
  );
}

// ── Display name editor ───────────────────────────────────────

function DisplayNameEditor({
  userId,
  initial,
}: {
  userId: string;
  initial: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setEditing(true);
    setValue(saved);
    setError(null);
    setTimeout(() => inputRef.current?.select(), 50);
  }

  function cancel() {
    setEditing(false);
    setValue(saved);
    setError(null);
  }

  async function save() {
    setError(null);
    startTransition(async () => {
      const result = await updateDisplayNameAction(userId, value);
      if (!result.success) {
        setError(result.error ?? "Error");
        return;
      }
      setSaved(value.trim());
      setEditing(false);
    });
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
        Nombre visible
      </label>
      {editing ? (
        <div className="flex items-center gap-2">
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") save();
              if (e.key === "Escape") cancel();
            }}
            maxLength={60}
            className="flex-1 rounded-xl border border-brand-forest/40 bg-surface-muted px-4 py-2.5 text-sm font-semibold text-text-primary outline-none ring-2 ring-brand-forest/15 focus:ring-brand-forest/30"
            disabled={isPending}
          />
          <button
            type="button"
            onClick={save}
            disabled={isPending}
            className="flex min-h-10 min-w-10 items-center justify-center rounded-xl bg-brand-forest text-brand-forest-fg hover:brightness-110 transition"
          >
            <Check className="size-4" strokeWidth={2.5} />
          </button>
          <button
            type="button"
            onClick={cancel}
            className="flex min-h-10 min-w-10 items-center justify-center rounded-xl border border-border-default text-text-muted hover:bg-surface-muted transition"
          >
            <X className="size-4" strokeWidth={2} />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <p className="text-xl font-black tracking-tight text-text-primary">{saved || "—"}</p>
          <button
            type="button"
            onClick={startEdit}
            className="flex min-h-9 min-w-9 items-center justify-center rounded-lg border border-border-default text-text-muted hover:bg-surface-muted hover:text-text-primary transition"
            aria-label="Editar nombre"
          >
            <Pencil className="size-3.5" strokeWidth={2} />
          </button>
        </div>
      )}
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  );
}

// ── Plan limits grid ──────────────────────────────────────────

function LimitRow({
  icon,
  label,
  value,
  current,
  limit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  current?: number;
  limit?: number;
}) {
  const pct =
    current !== undefined && limit !== undefined && limit !== Infinity
      ? Math.min(100, Math.round((current / limit) * 100))
      : null;

  const isNearLimit = pct !== null && pct >= 75;
  const isAtLimit = pct !== null && pct >= 100;

  return (
    <div className="flex flex-col gap-1.5 rounded-xl border border-border-subtle bg-surface-muted p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-text-muted">{icon}<span className="text-[11px] font-bold uppercase tracking-widest text-text-muted">{label}</span></div>
        <span className={`text-sm font-black tabular-nums ${isAtLimit ? "text-amber-400" : isNearLimit ? "text-yellow-400" : "text-text-primary"}`}>{value}</span>
      </div>
      {pct !== null && (
        <div className="h-1 overflow-hidden rounded-full bg-surface-subtle">
          <div
            className={`h-full rounded-full transition-all duration-500 ${isAtLimit ? "bg-amber-400" : isNearLimit ? "bg-yellow-400" : "bg-brand-forest"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

// ── Delete account dialog ─────────────────────────────────────

function DeleteAccountDialog({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) {
  const [confirm, setConfirm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const PHRASE = "eliminar mi cuenta";

  async function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteAccountAction(userId);
      if (!result.success) {
        setError(result.error ?? "Error al eliminar la cuenta.");
        return;
      }
      await fetch("/api/auth/logout", { method: "POST" });
      await supabase.auth.signOut();
      router.push("/login");
    });
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-brand-scrim backdrop-blur-sm"
        onClick={onClose}
        aria-label="Cancelar"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-border-subtle bg-surface-card p-6 shadow-2xl">
        <AlertTriangle className="mx-auto mb-3 size-12 text-red-400" strokeWidth={1.75} />
        <h2 className="text-center text-xl font-black text-text-primary">¿Eliminar tu cuenta?</h2>
        <p className="mt-2 text-center text-sm text-text-secondary">
          Esta acción es <span className="font-bold text-red-400">irreversible</span>. Se borrarán todos tus hábitos, retos, registros y datos personales.
        </p>
        <div className="mt-5 space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
            Escribe <span className="text-red-400 font-black">"{PHRASE}"</span> para confirmar
          </label>
          <input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder={PHRASE}
            className="w-full rounded-xl border border-border-default bg-surface-muted px-4 py-3 text-sm text-text-primary placeholder:text-text-muted outline-none focus:border-red-500/40 focus:ring-2 focus:ring-red-500/10"
          />
        </div>
        {error && (
          <p className="mt-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400">{error}</p>
        )}
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 min-h-11 rounded-xl border border-border-default text-sm font-bold text-text-secondary hover:bg-surface-muted transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending || confirm !== PHRASE}
            className="flex-1 min-h-11 rounded-xl bg-red-500 text-sm font-bold text-white hover:bg-red-600 transition disabled:opacity-40"
          >
            {isPending ? "Eliminando…" : "Sí, eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────

export default function ProfileClient({
  data,
  userId,
  userEmail,
}: {
  data: ProfilePageData;
  userId: string;
  userEmail: string;
}) {
  const [showDelete, setShowDelete] = useState(false);
  const { profile, subscription, stats, limits, planLabel, isPremium } = data;

  const displayName = profile?.display_name || userEmail.split("@")[0];
  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="dark mx-auto max-w-3xl space-y-10 px-4 py-8 sm:px-6 sm:py-10">
      {/* Header */}
      <header>
        <div className="mb-3 flex items-center gap-2">
          <div className="h-[2px] w-8 bg-brand-forest" />
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-brand-forest/80">
            Cuenta
          </p>
        </div>
        <h1 className="text-4xl font-black tracking-tighter text-text-primary">Mi perfil</h1>
        <p className="mt-2 text-sm text-text-muted">
          Gestiona tu información personal, consulta tu plan y controla tu cuenta.
        </p>
      </header>

      {/* Identity card */}
      <section className="rounded-2xl border border-border-subtle bg-surface-card p-6 sm:p-8">
        <SectionHeader label="Identidad" title="Información personal" />
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-8">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex size-20 items-center justify-center rounded-2xl border-2 border-brand-forest/40 bg-brand-forest text-2xl font-black text-brand-forest-fg shadow-lg">
              {initials}
            </div>
            <PlanBadge isPremium={isPremium} label={planLabel} />
          </div>

          {/* Fields */}
          <div className="flex-1 space-y-5 min-w-0">
            <DisplayNameEditor
              userId={userId}
              initial={profile?.display_name ?? ""}
            />
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                Correo electrónico
              </label>
              <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                <Mail className="size-4 text-text-muted shrink-0" strokeWidth={2} />
                {userEmail}
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">
                Miembro desde
              </label>
              <div className="flex items-center gap-2 text-sm font-medium text-text-secondary">
                <CalendarDays className="size-4 text-text-muted shrink-0" strokeWidth={2} />
                {formatDate(stats.memberSince)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="rounded-2xl border border-border-subtle bg-surface-card p-6 sm:p-8">
        <SectionHeader label="Actividad" title="Resumen de uso" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Hábitos", value: stats.totalHabits, icon: <BarChart2 className="size-5" strokeWidth={1.75} /> },
            { label: "Total retos", value: stats.totalChallenges, icon: <Swords className="size-5" strokeWidth={1.75} /> },
            { label: "Activos", value: stats.activeChallenges, icon: <BookOpen className="size-5" strokeWidth={1.75} /> },
            { label: "Completados", value: stats.completedChallenges, icon: <Trophy className="size-5" strokeWidth={1.75} /> },
          ].map((s) => (
            <div key={s.label} className="flex flex-col gap-2 rounded-xl border border-border-subtle bg-surface-muted p-4">
              <div className="text-text-muted">{s.icon}</div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-text-muted">{s.label}</p>
              <p className="text-2xl font-black tabular-nums text-text-primary">{s.value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plan & limits */}
      <section className="rounded-2xl border border-border-subtle bg-surface-card p-6 sm:p-8">
        <SectionHeader label="Suscripción" title="Plan y límites" />

        <div className="mb-5 flex items-center justify-between rounded-xl border border-brand-forest/20 bg-accent-subtle/40 px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Plan actual</p>
            <p className="text-lg font-black text-text-primary">{planLabel}</p>
            {subscription.starts_at && (
              <p className="text-xs text-text-muted">Desde {formatDate(subscription.starts_at)}</p>
            )}
          </div>
          <PlanBadge isPremium={isPremium} label={planLabel} />
        </div>

        <div className="grid gap-2 sm:grid-cols-2">
          <LimitRow
            icon={<BarChart2 className="size-4" strokeWidth={2} />}
            label="Hábitos activos"
            value={`${stats.totalHabits} / ${formatLimit(limits.habits)}`}
            current={stats.totalHabits}
            limit={limits.habits}
          />
          <LimitRow
            icon={<Swords className="size-4" strokeWidth={2} />}
            label="Retos activos"
            value={`${stats.activeChallenges} / ${formatLimit(limits.challenges)}`}
            current={stats.activeChallenges}
            limit={limits.challenges}
          />
          <LimitRow
            icon={<BookOpen className="size-4" strokeWidth={2} />}
            label="Hábitos por reto"
            value={formatLimit(limits.challengeHabits)}
          />
          <LimitRow
            icon={<Clock className="size-4" strokeWidth={2} />}
            label="Sesiones por hábito / día"
            value={limits.logsPerHabitPerDay === Infinity ? "Ilimitadas" : `${limits.logsPerHabitPerDay} sesión`}
          />
          <LimitRow
            icon={<History className="size-4" strokeWidth={2} />}
            label="Historial visible"
            value={limits.historyDays === Infinity ? "Todo el historial" : `Últimos ${limits.historyDays} días`}
          />
        </div>

        {!isPremium && (
          <div className="mt-4 rounded-xl border border-brand-forest/20 bg-accent-subtle/40 p-4 text-sm text-text-secondary">
            <span className="font-bold text-brand-forest">¿Quieres más?</span>{" "}
            Actualiza a Pro para hábitos ilimitados, todo el historial y acceso a funciones premium.
          </div>
        )}
      </section>

      {/* Danger zone */}
      <section className="rounded-2xl border border-red-500/20 bg-surface-card p-6 sm:p-8">
        <SectionHeader label="Zona de peligro" title="Acciones destructivas" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-bold text-text-primary">Eliminar cuenta</p>
            <p className="mt-1 text-xs text-text-muted">
              Borra permanentemente tu cuenta y todos tus datos. Esta acción no se puede deshacer.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowDelete(true)}
            className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 text-sm font-bold text-red-400 hover:bg-red-500/20 transition"
          >
            <Trash2 className="size-4" strokeWidth={2} />
            Eliminar cuenta
          </button>
        </div>
      </section>

      {showDelete && (
        <DeleteAccountDialog userId={userId} onClose={() => setShowDelete(false)} />
      )}
    </div>
  );
}
