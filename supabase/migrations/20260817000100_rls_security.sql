-- İşTakip tenant isolation and Data API privileges.
-- Onboarding and controlled destructive operations are deferred to trusted RPC/server flows.

create function public.current_company_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select profile.company_id
  from public.profiles as profile
  where profile.id = (select auth.uid());
$$;

revoke all privileges on function public.current_company_id() from public;
revoke all privileges on function public.current_company_id() from anon;
grant execute on function public.current_company_id() to authenticated;

alter table public.companies enable row level security;
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.quotes enable row level security;
alter table public.quote_items enable row level security;
alter table public.jobs enable row level security;
alter table public.expenses enable row level security;
alter table public.collections enable row level security;

-- Start from explicit least-privilege grants. RLS and grants are separate controls.
revoke all privileges on table
  public.companies,
  public.profiles,
  public.customers,
  public.quotes,
  public.quote_items,
  public.jobs,
  public.expenses,
  public.collections
from public, anon, authenticated;

grant usage on schema public to authenticated;

grant select on public.companies to authenticated;
grant update (name, currency_code) on public.companies to authenticated;

grant select on public.profiles to authenticated;
grant update (full_name) on public.profiles to authenticated;

grant select, insert, update, delete on public.customers to authenticated;
grant select, insert, update on public.quotes to authenticated;
grant select, insert, update on public.quote_items to authenticated;
grant select, insert, update on public.jobs to authenticated;
grant select, insert, update on public.expenses to authenticated;
grant select, insert, update on public.collections to authenticated;

create policy companies_select_own
on public.companies
for select
to authenticated
using (id = (select public.current_company_id()));

create policy companies_update_own
on public.companies
for update
to authenticated
using (id = (select public.current_company_id()))
with check (id = (select public.current_company_id()));

create policy profiles_select_self
on public.profiles
for select
to authenticated
using (id = (select auth.uid()));

create policy profiles_update_self
on public.profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (
  id = (select auth.uid())
  and company_id = (select public.current_company_id())
);

create policy customers_select_own_company
on public.customers
for select
to authenticated
using (company_id = (select public.current_company_id()));

create policy customers_insert_own_company
on public.customers
for insert
to authenticated
with check (company_id = (select public.current_company_id()));

create policy customers_update_own_company
on public.customers
for update
to authenticated
using (company_id = (select public.current_company_id()))
with check (company_id = (select public.current_company_id()));

create policy customers_delete_own_company
on public.customers
for delete
to authenticated
using (company_id = (select public.current_company_id()));

create policy quotes_select_own_company
on public.quotes
for select
to authenticated
using (company_id = (select public.current_company_id()));

create policy quotes_insert_own_company
on public.quotes
for insert
to authenticated
with check (company_id = (select public.current_company_id()));

create policy quotes_update_own_company
on public.quotes
for update
to authenticated
using (company_id = (select public.current_company_id()))
with check (company_id = (select public.current_company_id()));

create policy quote_items_select_own_company
on public.quote_items
for select
to authenticated
using (company_id = (select public.current_company_id()));

create policy quote_items_insert_own_company
on public.quote_items
for insert
to authenticated
with check (company_id = (select public.current_company_id()));

create policy quote_items_update_own_company
on public.quote_items
for update
to authenticated
using (company_id = (select public.current_company_id()))
with check (company_id = (select public.current_company_id()));

create policy jobs_select_own_company
on public.jobs
for select
to authenticated
using (company_id = (select public.current_company_id()));

create policy jobs_insert_own_company
on public.jobs
for insert
to authenticated
with check (company_id = (select public.current_company_id()));

create policy jobs_update_own_company
on public.jobs
for update
to authenticated
using (company_id = (select public.current_company_id()))
with check (company_id = (select public.current_company_id()));

create policy expenses_select_own_company
on public.expenses
for select
to authenticated
using (company_id = (select public.current_company_id()));

create policy expenses_insert_own_company
on public.expenses
for insert
to authenticated
with check (company_id = (select public.current_company_id()));

create policy expenses_update_own_company
on public.expenses
for update
to authenticated
using (company_id = (select public.current_company_id()))
with check (company_id = (select public.current_company_id()));

create policy collections_select_own_company
on public.collections
for select
to authenticated
using (company_id = (select public.current_company_id()));

create policy collections_insert_own_company
on public.collections
for insert
to authenticated
with check (company_id = (select public.current_company_id()));

create policy collections_update_own_company
on public.collections
for update
to authenticated
using (company_id = (select public.current_company_id()))
with check (company_id = (select public.current_company_id()));
