/**
 * Design tokens — Cuentas (marca: brand-forest / brand-slate desde globals.css).
 */

const btnBase =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-6 py-3 text-base font-semibold transition " +
  "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40";

/** Primary — verde bosque de marca */
export const btnPrimary =
  `${btnBase} border border-brand-forest bg-brand-forest text-brand-forest-fg shadow-md ` +
  "hover:brightness-110 active:brightness-95";

/** Secondary — borde bosque suave, texto slate de marca */
export const btnSecondary =
  `${btnBase} border border-brand-forest/25 bg-surface-card text-brand-slate shadow-sm ` +
  "hover:border-brand-forest/40 hover:bg-surface-muted active:bg-surface-muted";

/** @deprecated Use btnSecondary — kept for existing imports */
export const btnGhost = btnSecondary;

export const btnDanger =
  `${btnBase} border border-red-600/30 bg-red-600 text-white shadow-md ` +
  "hover:bg-red-700 hover:border-red-700 active:bg-red-800";

export const inputSurface =
  "w-full rounded-xl border border-brand-forest/15 bg-surface-card px-4 py-3.5 text-base text-brand-slate shadow-sm outline-none transition " +
  "placeholder:text-text-muted hover:border-brand-forest/25 focus:border-brand-forest/40 focus:ring-2 focus:ring-brand-forest/20";

export const cardRadius = "rounded-2xl";

export const panelPadding = "p-6 md:p-8";

/** Page / hero card */
export const elevSurface =
  "rounded-2xl border border-brand-forest/10 bg-surface-card shadow-md";

/** Grouping shell (KPI wrap, filter rail) — add padding in the component */
export const surfaceSoft =
  "rounded-2xl border border-brand-forest/10 bg-surface-muted shadow-sm";
