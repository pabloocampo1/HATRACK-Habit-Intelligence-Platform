-- Metas de ahorro: cuenta destino obligatoria + vínculo con transacciones
-- Ejecutar en Supabase SQL Editor

alter table public.savings_goals
  add column if not exists account_id bigint
  references public.accounts (account_id) on delete set null;

alter table public.savings_goal_contributions
  add column if not exists transaction_id bigint
  references public.transactions (id_transaction) on delete set null;



do $$
begin
  if exists (
    select 1 from public.savings_goals where account_id is null
  ) then
    raise exception
      'Hay metas sin account_id. Asígnales una cuenta destino antes de hacer la columna NOT NULL.';
  end if;
end $$;

alter table public.savings_goals
  alter column account_id set not null;

create index if not exists savings_goals_account_id_idx
  on public.savings_goals (account_id);

create index if not exists savings_goal_contributions_transaction_id_idx
  on public.savings_goal_contributions (transaction_id);
