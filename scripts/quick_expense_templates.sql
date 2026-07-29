-- Gastos fijos — ejecutar en Supabase SQL Editor
-- Si ya creaste la tabla y ves error 42501 al guardar, ejecuta TODO este script.

create table if not exists public.quick_expense_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  label text not null,
  icon text not null default 'wallet',
  default_amount numeric not null default 0 check (default_amount > 0),
  currency varchar(10) not null default 'COP',
  category_id bigint references public.category_transaction (id_category) on delete set null,
  account_id bigint not null references public.accounts (account_id) on delete cascade,
  type text not null default 'expense' check (type in ('expense', 'income')),
  sort_order int not null default 0,
  usage_count int not null default 0,
  last_used_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.transactions
  add column if not exists quick_expense_template_id uuid
  references public.quick_expense_templates (id) on delete set null;

create index if not exists quick_expense_templates_user_id_idx
  on public.quick_expense_templates (user_id);

alter table public.quick_expense_templates enable row level security;

-- Permisos para el rol authenticated (necesario en tablas nuevas)
grant usage on schema public to authenticated, anon;
grant select, insert, update, delete on public.quick_expense_templates to authenticated;
grant all on public.quick_expense_templates to service_role;

-- Recrear política (corrige error 42501 al insertar)
drop policy if exists "Users manage own quick expense templates" on public.quick_expense_templates;

create policy "Users manage own quick expense templates"
  on public.quick_expense_templates
  for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
