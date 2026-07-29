"use client";

import {
  createObligationAction,
  updateObligationAction,
  updateObligationStatusAction,
} from "@/app/actions/finance/financeActions";
import FinanceFormField from "../../_components/FinanceFormField";
import FinanceModal, { financeInputClass } from "../../_components/FinanceModal";
import { Obligation } from "@/lib/types";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  Clock3,
  CreditCard,
  PauseCircle,
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type FilterStatus = Obligation["status"] | "all";
type DueFilter = "all" | "overdue" | "7d" | "30d";
type SortKey = "due_asc" | "due_desc" | "amount_desc" | "amount_asc" | "progress_desc";

type ObligationMeta = {
  notes?: string;
  totalInstallments?: number;
  paidInstallments?: number;
};

type FormState = {
  title: string;
  amount: string;
  frequency: Obligation["frequency"];
  next_due_date: string;
  description: string;
  totalInstallments: string;
  paidInstallments: string;
};

const META_PREFIX = "[[HATRACK_OBLIGATION_META]]";

const FREQUENCY_LABELS: Record<Obligation["frequency"], string> = {
  once: "Pago único",
  weekly: "Semanal",
  monthly: "Mensual",
  yearly: "Anual",
};

const STATUS_LABELS: Record<Obligation["status"], string> = {
  active: "Pendiente",
  paid: "Pagada",
  paused: "Pausada",
};

const SORT_LABELS: Record<SortKey, string> = {
  due_asc: "Vence primero",
  due_desc: "Vence después",
  amount_desc: "Mayor monto",
  amount_asc: "Menor monto",
  progress_desc: "Más avanzado",
};

const emptyForm: FormState = {
  title: "",
  amount: "",
  frequency: "monthly",
  next_due_date: "",
  description: "",
  totalInstallments: "1",
  paidInstallments: "0",
};

function encodeDescription(notes: string, meta: ObligationMeta) {
  const clean = notes.trim();
  const total = Math.max(1, Number(meta.totalInstallments ?? 1));
  const paid = Math.min(total, Math.max(0, Number(meta.paidInstallments ?? 0)));
  const normalized: ObligationMeta = {
    notes: clean || undefined,
    totalInstallments: total,
    paidInstallments: paid,
  };
  return `${clean}${clean ? "\n" : ""}${META_PREFIX}${JSON.stringify(normalized)}`;
}

function parseDescription(raw?: string | null): { notes: string; meta: ObligationMeta } {
  if (!raw) return { notes: "", meta: { totalInstallments: 1, paidInstallments: 0 } };
  const idx = raw.indexOf(META_PREFIX);
  if (idx === -1) return { notes: raw, meta: { totalInstallments: 1, paidInstallments: 0 } };
  const notes = raw.slice(0, idx).trim();
  try {
    const meta = JSON.parse(raw.slice(idx + META_PREFIX.length)) as ObligationMeta;
    return {
      notes,
      meta: {
        totalInstallments: Math.max(1, Number(meta.totalInstallments ?? 1)),
        paidInstallments: Math.max(0, Number(meta.paidInstallments ?? 0)),
      },
    };
  } catch {
    return { notes: raw, meta: { totalInstallments: 1, paidInstallments: 0 } };
  }
}

function formatMoney(value: number) {
  return `$${Math.round(value).toLocaleString("es-CO")}`;
}

function formatDate(value: string) {
  return new Date(`${value}T12:00:00`).toLocaleDateString("es-CO", {
    dateStyle: "medium",
  });
}

function daysUntil(value: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${value}T00:00:00`);
  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

function progress(meta: ObligationMeta) {
  const total = Math.max(1, Number(meta.totalInstallments ?? 1));
  const paid = Math.min(total, Math.max(0, Number(meta.paidInstallments ?? 0)));
  return { total, paid, pct: Math.round((paid / total) * 100) };
}

function statusClasses(status: Obligation["status"]) {
  if (status === "paid") return "border-emerald-500/30 text-emerald-300 bg-emerald-500/10";
  if (status === "paused") return "border-amber-500/30 text-amber-300 bg-amber-500/10";
  return "border-sky-500/30 text-sky-300 bg-sky-500/10";
}

export default function ObligacionesModuleClient({ userId, obligations }: {
  userId: string;
  obligations: Obligation[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState<Obligation | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [detailPaid, setDetailPaid] = useState("");
  const [detailTotal, setDetailTotal] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<FilterStatus>("all");
  const [dueFilter, setDueFilter] = useState<DueFilter>("all");
  const [sort, setSort] = useState<SortKey>("due_asc");

  const enriched = useMemo(
    () =>
      obligations.map((item) => {
        const parsed = parseDescription(item.description);
        return { item, ...parsed, progress: progress(parsed.meta), days: daysUntil(item.next_due_date) };
      }),
    [obligations],
  );

  const metrics = useMemo(() => {
    const active = enriched.filter((row) => row.item.status === "active");
    const totalPending = active.reduce((sum, row) => sum + Number(row.item.amount ?? 0), 0);
    const overdue = active.filter((row) => row.days < 0).length;
    const next7 = active.filter((row) => row.days >= 0 && row.days <= 7).length;
    return { active: active.length, totalPending, overdue, next7 };
  }, [enriched]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return enriched
      .filter((row) => {
        if (status !== "all" && row.item.status !== status) return false;
        if (dueFilter === "overdue" && row.days >= 0) return false;
        if (dueFilter === "7d" && (row.days < 0 || row.days > 7)) return false;
        if (dueFilter === "30d" && (row.days < 0 || row.days > 30)) return false;
        if (q) {
          const blob = [
            row.item.title,
            row.notes,
            row.item.amount,
            FREQUENCY_LABELS[row.item.frequency],
            STATUS_LABELS[row.item.status],
            `${row.progress.paid}/${row.progress.total}`,
          ].join(" ").toLowerCase();
          if (!blob.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sort === "due_desc") return b.days - a.days;
        if (sort === "amount_desc") return Number(b.item.amount) - Number(a.item.amount);
        if (sort === "amount_asc") return Number(a.item.amount) - Number(b.item.amount);
        if (sort === "progress_desc") return b.progress.pct - a.progress.pct;
        return a.days - b.days;
      });
  }, [dueFilter, enriched, query, sort, status]);

  const resetForm = () => {
    setForm(emptyForm);
    setError(null);
  };

  const handleCreate = () => {
    const total = Number(form.totalInstallments);
    const paid = Number(form.paidInstallments);
    if (!form.title.trim()) return setError("El nombre de la obligación es obligatorio.");
    if (Number(form.amount) <= 0) return setError("El monto debe ser mayor a cero.");
    if (!form.next_due_date) return setError("Selecciona la próxima fecha de pago.");
    if (!Number.isFinite(total) || total < 1) return setError("El número de cuotas debe ser mínimo 1.");
    if (!Number.isFinite(paid) || paid < 0 || paid > total) {
      return setError("Las cuotas pagadas deben estar entre 0 y el total de cuotas.");
    }
    setError(null);
    startTransition(async () => {
      await createObligationAction(userId, {
        title: form.title.trim(),
        amount: Number(form.amount),
        frequency: form.frequency,
        next_due_date: form.next_due_date,
        description: encodeDescription(form.description, {
          totalInstallments: total,
          paidInstallments: paid,
        }),
      });
      resetForm();
      setModalOpen(false);
      router.refresh();
    });
  };

  const changeStatus = (obligationId: number, nextStatus: Obligation["status"]) => {
    startTransition(async () => {
      await updateObligationStatusAction(userId, obligationId, nextStatus);
      router.refresh();
    });
  };

  const openDetail = (item: Obligation) => {
    const { meta } = parseDescription(item.description);
    const p = progress(meta);
    setSelected(item);
    setDetailPaid(String(p.paid));
    setDetailTotal(String(p.total));
    setError(null);
  };

  const saveInstallments = () => {
    if (!selected) return;
    const paid = Number(detailPaid);
    const total = Number(detailTotal);
    if (!Number.isFinite(total) || total < 1) return setError("El total de cuotas debe ser mínimo 1.");
    if (!Number.isFinite(paid) || paid < 0 || paid > total) {
      return setError("Las cuotas pagadas deben estar entre 0 y el total.");
    }
    const { notes } = parseDescription(selected.description);
    const nextStatus: Obligation["status"] = paid >= total ? "paid" : selected.status;
    setError(null);
    startTransition(async () => {
      await updateObligationAction(userId, selected.id_obligation, {
        description: encodeDescription(notes, {
          totalInstallments: total,
          paidInstallments: paid,
        }),
        status: nextStatus,
      });
      setSelected(null);
      router.refresh();
    });
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border-subtle bg-surface-card p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Deudas y compromisos</p>
            <h1 className="mt-1 text-xl font-semibold text-text-primary">Obligaciones</h1>
            <p className="mt-1 max-w-xl text-sm text-text-secondary">
              Pagos que debes hacer: arriendo, créditos, servicios o suscripciones.
              Lleva cuotas, fechas de vencimiento y avance sin mezclarlos con gastos ya hechos.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              resetForm();
              setModalOpen(true);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-black"
          >
            <Plus className="size-4" />
            Nueva obligación
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          ["Pendientes", metrics.active, "text-sky-300"],
          ["Total por pagar", formatMoney(metrics.totalPending), "text-text-primary"],
          ["Vencidas", metrics.overdue, "text-rose-300"],
          ["Próximos 7 días", metrics.next7, "text-emerald-300"],
        ].map(([label, value, tone]) => (
          <div key={String(label)} className="rounded-2xl border border-border-subtle bg-surface-card p-4">
            <p className="text-xs text-text-muted">{label}</p>
            <p className={`mt-1 text-2xl font-semibold ${tone}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border-subtle bg-surface-card p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-text-primary">Compromisos registrados</h2>
            <p className="mt-1 text-xs text-text-muted">Filtra por estado, vencimiento y texto.</p>
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className={`${financeInputClass} w-auto min-w-44`}>
            {Object.entries(SORT_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-text-muted" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar deuda, nota, monto, estado…" className={`${financeInputClass} pl-10`} />
          </div>
          <div className="flex flex-wrap gap-2">
            {(["all", "active", "paid", "paused"] as FilterStatus[]).map((key) => (
              <button key={key} type="button" onClick={() => setStatus(key)} className={`rounded-xl border px-3 py-2 text-xs font-semibold ${status === key ? "border-emerald-500 bg-emerald-500 text-black" : "border-border-default text-text-secondary"}`}>
                {key === "all" ? "Todas" : STATUS_LABELS[key]}
              </button>
            ))}
            {(["overdue", "7d", "30d"] as DueFilter[]).map((key) => (
              <button key={key} type="button" onClick={() => setDueFilter(dueFilter === key ? "all" : key)} className={`rounded-xl border px-3 py-2 text-xs font-semibold ${dueFilter === key ? "border-emerald-500 bg-emerald-500 text-black" : "border-border-default text-text-secondary"}`}>
                {key === "overdue" ? "Vencidas" : key === "7d" ? "7 días" : "30 días"}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border-default p-8 text-center">
              <CalendarClock className="mx-auto size-8 text-text-muted" />
              <p className="mt-2 text-sm text-text-muted">No hay obligaciones que coincidan.</p>
            </div>
          ) : null}

          {filtered.map(({ item, notes, progress: p, days }) => (
            <button
              key={item.id_obligation}
              type="button"
              onClick={() => openDetail(item)}
              className="w-full rounded-xl border border-border-default bg-surface-muted p-4 text-left transition hover:border-emerald-500/30"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="flex size-9 items-center justify-center rounded-xl border border-border-default bg-surface-card text-emerald-300">
                      {item.status === "paid" ? <CheckCircle2 className="size-4" /> : item.status === "paused" ? <PauseCircle className="size-4" /> : <CreditCard className="size-4" />}
                    </span>
                    <h3 className="text-sm font-semibold text-text-primary">{item.title}</h3>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusClasses(item.status)}`}>
                      {STATUS_LABELS[item.status]}
                    </span>
                    {days < 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-rose-500/30 px-2 py-0.5 text-[10px] font-semibold text-rose-200">
                        <AlertCircle className="size-3" /> Vencida
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs text-text-muted">
                    {FREQUENCY_LABELS[item.frequency]} · vence {formatDate(item.next_due_date)} · {days < 0 ? `${Math.abs(days)} día(s) vencida` : `faltan ${days} día(s)`}
                  </p>
                  {notes ? <p className="mt-1 text-xs text-text-secondary">{notes}</p> : null}
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/20">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: `${p.pct}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] text-text-muted">
                    Cuotas {p.paid}/{p.total} · {p.pct}% pagado
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-text-primary">{formatMoney(Number(item.amount))}</p>
                  <div className="mt-2 flex flex-wrap justify-end gap-1.5">
                    <span onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => changeStatus(item.id_obligation, "paid")} className="rounded-lg border border-emerald-500/40 px-2 py-1 text-xs text-emerald-300">Pagada</button>
                    </span>
                    <span onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => changeStatus(item.id_obligation, "paused")} className="rounded-lg border border-amber-500/40 px-2 py-1 text-xs text-amber-300">Pausar</button>
                    </span>
                    <span onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => changeStatus(item.id_obligation, "active")} className="rounded-lg border border-blue-500/40 px-2 py-1 text-xs text-blue-300">Activar</button>
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {modalOpen ? (
        <FinanceModal title="Nueva obligación" subtitle="Registra una deuda, suscripción o pago pendiente con control de cuotas." onClose={() => setModalOpen(false)}>
          <div className="space-y-4">
            <FinanceFormField label="Nombre del compromiso" required hint='Ej: "Crédito moto", "Tarjeta", "Arriendo".'>
              <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="¿Qué debes pagar?" className={financeInputClass} />
            </FinanceFormField>
            <div className="grid gap-3 sm:grid-cols-2">
              <FinanceFormField label="Monto de la cuota" required>
                <input type="number" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} placeholder="Ej: 350000" className={financeInputClass} />
              </FinanceFormField>
              <FinanceFormField label="Frecuencia">
                <select value={form.frequency} onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value as Obligation["frequency"] }))} className={financeInputClass}>
                  <option value="once">Pago único</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                  <option value="yearly">Anual</option>
                </select>
              </FinanceFormField>
            </div>
            <FinanceFormField label="Próxima fecha de pago" required>
              <input type="date" value={form.next_due_date} onChange={(e) => setForm((p) => ({ ...p, next_due_date: e.target.value }))} className={`${financeInputClass} [color-scheme:dark]`} />
            </FinanceFormField>
            <div className="grid gap-3 sm:grid-cols-2">
              <FinanceFormField label="Número de cuotas" required hint="Total de cuotas pactadas. Ej: 12, 24, 36.">
                <input type="number" min={1} value={form.totalInstallments} onChange={(e) => setForm((p) => ({ ...p, totalInstallments: e.target.value }))} className={financeInputClass} />
              </FinanceFormField>
              <FinanceFormField label="Cuotas ya pagadas" hint="Si ya venías pagando esta deuda.">
                <input type="number" min={0} value={form.paidInstallments} onChange={(e) => setForm((p) => ({ ...p, paidInstallments: e.target.value }))} className={financeInputClass} />
              </FinanceFormField>
            </div>
            <FinanceFormField label="Notas (opcional)" hint="Detalle extra que quieras recordar.">
              <input value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} placeholder="Ej: débito automático día 5" className={financeInputClass} />
            </FinanceFormField>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-border-default px-4 py-2 text-sm text-text-secondary">Cancelar</button>
              <button type="button" onClick={handleCreate} disabled={isPending} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60">
                {isPending ? "Guardando…" : "Registrar obligación"}
              </button>
            </div>
          </div>
        </FinanceModal>
      ) : null}

      {selected ? (
        <FinanceModal title={selected.title} subtitle="Detalle de obligación y control de cuotas." onClose={() => setSelected(null)}>
          <div className="space-y-4">
            <div className="rounded-xl border border-border-default bg-surface-muted p-4">
              <p className="text-xs text-text-muted">Monto de cuota</p>
              <p className="mt-1 text-2xl font-semibold text-text-primary">{formatMoney(Number(selected.amount))}</p>
              <p className="mt-2 text-sm text-text-secondary">Vence {formatDate(selected.next_due_date)} · {FREQUENCY_LABELS[selected.frequency]}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <FinanceFormField label="Cuotas pagadas">
                <input type="number" min={0} value={detailPaid} onChange={(e) => setDetailPaid(e.target.value)} className={financeInputClass} />
              </FinanceFormField>
              <FinanceFormField label="Número total de cuotas">
                <input type="number" min={1} value={detailTotal} onChange={(e) => setDetailTotal(e.target.value)} className={financeInputClass} />
              </FinanceFormField>
            </div>
            {error ? <p className="text-sm text-red-400">{error}</p> : null}
            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button type="button" onClick={() => setSelected(null)} className="rounded-xl border border-border-default px-4 py-2 text-sm text-text-secondary">Cerrar</button>
              <button type="button" onClick={saveInstallments} disabled={isPending} className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-black disabled:opacity-60">
                {isPending ? "Guardando…" : "Guardar cuotas"}
              </button>
            </div>
          </div>
        </FinanceModal>
      ) : null}
    </div>
  );
}
