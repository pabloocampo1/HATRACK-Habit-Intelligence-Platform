"use client";

import { ArrowRight } from "lucide-react";
import PendingNavLink from "@/components/PendingNavLink";

const primaryBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-brand-forest px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-brand-forest-fg transition hover:brightness-110 disabled:opacity-70";

const ghostBtn =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-border-default px-6 py-3 text-xs font-black uppercase tracking-[0.18em] text-text-secondary transition hover:border-border-strong hover:text-text-primary disabled:opacity-70";

const navGhost =
  "inline-flex items-center justify-center gap-2 rounded-xl border border-border-default px-4 py-2 text-xs font-bold uppercase tracking-widest text-text-secondary transition hover:border-border-strong hover:text-text-primary disabled:opacity-70";

const navPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-brand-forest px-4 py-2 text-xs font-bold uppercase tracking-widest text-brand-forest-fg transition hover:brightness-110 disabled:opacity-70";

export function HomeNavAuthActions() {
  return (
    <div className="flex items-center gap-2">
      <PendingNavLink
        href="/login"
        className={navGhost}
        pendingLabel="Entrando…"
        spinnerClassName="border-text-muted/40 border-t-text-primary"
      >
        Entrar
      </PendingNavLink>
      <PendingNavLink
        href="/signup"
        className={navPrimary}
        pendingLabel="Cargando…"
        spinnerClassName="border-brand-forest-fg/30 border-t-brand-forest-fg"
      >
        Comenzar gratis
      </PendingNavLink>
    </div>
  );
}

export function HomeHeroAuthActions() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <PendingNavLink
        href="/signup"
        className={primaryBtn}
        pendingLabel="Cargando…"
        spinnerClassName="border-brand-forest-fg/30 border-t-brand-forest-fg"
      >
        Crear cuenta gratis
        <ArrowRight className="size-4" strokeWidth={2.5} />
      </PendingNavLink>
      <PendingNavLink
        href="/login"
        className={ghostBtn}
        pendingLabel="Entrando…"
        spinnerClassName="border-text-muted/40 border-t-text-primary"
      >
        Ya tengo cuenta
      </PendingNavLink>
    </div>
  );
}

export function HomeCtaAuthActions() {
  return (
    <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
      <PendingNavLink
        href="/signup"
        className={primaryBtn}
        pendingLabel="Cargando…"
        spinnerClassName="border-brand-forest-fg/30 border-t-brand-forest-fg"
      >
        Comenzar gratis
        <ArrowRight className="size-4" strokeWidth={2.5} />
      </PendingNavLink>
      <PendingNavLink
        href="/login"
        className={ghostBtn}
        pendingLabel="Entrando…"
        spinnerClassName="border-text-muted/40 border-t-text-primary"
      >
        Iniciar sesion
      </PendingNavLink>
    </div>
  );
}
