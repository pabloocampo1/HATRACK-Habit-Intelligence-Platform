import type { CategoryTone } from "../transacciones.types";

const tones: Record<
  CategoryTone,
  { pill: string; dot: string }
> = {
  emerald: {
    pill: "border-emerald-200/80 bg-emerald-50 text-emerald-900",
    dot: "bg-emerald-500",
  },
  amber: {
    pill: "border-amber-200/80 bg-amber-50 text-amber-900",
    dot: "bg-amber-500",
  },
  violet: {
    pill: "border-violet-200/80 bg-violet-50 text-violet-900",
    dot: "bg-violet-500",
  },
  sky: {
    pill: "border-sky-200/80 bg-sky-50 text-sky-900",
    dot: "bg-sky-500",
  },
  rose: {
    pill: "border-rose-200/80 bg-rose-50 text-rose-900",
    dot: "bg-rose-500",
  },
  slate: {
    pill: "border-neutral-200 bg-neutral-100 text-brand-slate",
    dot: "bg-neutral-500",
  },
};

export function categoryToneClasses(tone: CategoryTone) {
  return tones[tone] ?? tones.slate;
}
