-- Add a database-enforced read-only demo tenant without changing normal tenants.
-- Demo identities are provisioned manually; this migration never writes auth.users.

begin;

alter table public.companies
add column is_demo boolean not null default false;

comment on column public.companies.is_demo is
  'Marks a tenant as a read-only product demo. Never writable by clients.';

-- The client only has column-level UPDATE privileges for name/currency_code.
-- Keep the demo marker explicitly outside that writable surface.
revoke update (is_demo) on table public.companies from public, anon, authenticated;

alter table public.customers
  add constraint customers_name_not_blank_check
    check (pg_catalog.btrim(name) <> ''),
  add constraint customers_name_length_check
    check (pg_catalog.char_length(name) <= 160),
  add constraint customers_contact_name_length_check
    check (contact_name is null or pg_catalog.char_length(contact_name) <= 160),
  add constraint customers_phone_length_check
    check (phone is null or pg_catalog.char_length(phone) <= 40),
  add constraint customers_email_length_check
    check (email is null or pg_catalog.char_length(email) <= 254),
  add constraint customers_address_length_check
    check (address is null or pg_catalog.char_length(address) <= 500),
  add constraint customers_city_length_check
    check (city is null or pg_catalog.char_length(city) <= 100);

create function public.current_company_allows_writes()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(not company.is_demo, false)
  from public.profiles as profile
  join public.companies as company on company.id = profile.company_id
  where profile.id = (select auth.uid());
$$;

revoke all privileges on function public.current_company_allows_writes()
from public, anon, authenticated;
grant execute on function public.current_company_allows_writes() to authenticated;

-- Reject every authenticated mutation when either the caller or target tenant is
-- a demo tenant. SECURITY DEFINER RPCs retain auth.uid(), so this guard covers
-- both direct table requests and every existing business RPC.
create function public.prevent_demo_company_mutation()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_old_company_id uuid;
  v_new_company_id uuid;
  v_caller_is_demo boolean := false;
  v_target_is_demo boolean := false;
begin
  -- Trusted maintenance and SQL Editor sessions have no Supabase auth identity.
  if v_user_id is null then
    if tg_op = 'DELETE' then
      return old;
    end if;

    return new;
  end if;

  select coalesce(company.is_demo, false)
  into v_caller_is_demo
  from public.profiles as profile
  join public.companies as company on company.id = profile.company_id
  where profile.id = v_user_id;

  if tg_table_name = 'companies' then
    if tg_op <> 'INSERT' then
      v_old_company_id := old.id;
      v_target_is_demo := coalesce(old.is_demo, false);
    end if;

    if tg_op <> 'DELETE' then
      v_new_company_id := new.id;
      v_target_is_demo := v_target_is_demo or coalesce(new.is_demo, false);
    end if;
  else
    if tg_op <> 'INSERT' then
      v_old_company_id := old.company_id;
    end if;

    if tg_op <> 'DELETE' then
      v_new_company_id := new.company_id;
    end if;

    select exists (
      select 1
      from public.companies as company
      where company.id in (v_old_company_id, v_new_company_id)
        and company.is_demo
    )
    into v_target_is_demo;
  end if;

  if v_caller_is_demo or v_target_is_demo then
    raise exception using
      errcode = 'P0001',
      message = 'demo_company_read_only';
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

revoke all privileges on function public.prevent_demo_company_mutation()
from public, anon, authenticated;

create trigger a_prevent_demo_company_mutation
before insert or update or delete on public.companies
for each row execute function public.prevent_demo_company_mutation();

create trigger a_prevent_demo_company_mutation
before insert or update or delete on public.profiles
for each row execute function public.prevent_demo_company_mutation();

create trigger a_prevent_demo_company_mutation
before insert or update or delete on public.customers
for each row execute function public.prevent_demo_company_mutation();

create trigger a_prevent_demo_company_mutation
before insert or update or delete on public.quotes
for each row execute function public.prevent_demo_company_mutation();

create trigger a_prevent_demo_company_mutation
before insert or update or delete on public.quote_items
for each row execute function public.prevent_demo_company_mutation();

create trigger a_prevent_demo_company_mutation
before insert or update or delete on public.jobs
for each row execute function public.prevent_demo_company_mutation();

create trigger a_prevent_demo_company_mutation
before insert or update or delete on public.expenses
for each row execute function public.prevent_demo_company_mutation();

create trigger a_prevent_demo_company_mutation
before insert or update or delete on public.collections
for each row execute function public.prevent_demo_company_mutation();

drop policy if exists companies_update_own on public.companies;
create policy companies_update_own
on public.companies
for update
to authenticated
using (
  id = (select public.current_company_id())
  and (select public.current_company_allows_writes())
)
with check (
  id = (select public.current_company_id())
  and (select public.current_company_allows_writes())
);

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
on public.profiles
for update
to authenticated
using (
  id = (select auth.uid())
  and (select public.current_company_allows_writes())
)
with check (
  id = (select auth.uid())
  and company_id = (select public.current_company_id())
  and (select public.current_company_allows_writes())
);

drop policy if exists customers_insert_own_company on public.customers;
create policy customers_insert_own_company
on public.customers
for insert
to authenticated
with check (
  company_id = (select public.current_company_id())
  and (select public.current_company_allows_writes())
);

drop policy if exists customers_update_own_company on public.customers;
create policy customers_update_own_company
on public.customers
for update
to authenticated
using (
  company_id = (select public.current_company_id())
  and (select public.current_company_allows_writes())
)
with check (
  company_id = (select public.current_company_id())
  and (select public.current_company_allows_writes())
);

drop policy if exists customers_delete_own_company on public.customers;
create policy customers_delete_own_company
on public.customers
for delete
to authenticated
using (
  company_id = (select public.current_company_id())
  and (select public.current_company_allows_writes())
);

-- Give the onboarding RPC a deterministic demo-specific failure before its
-- existing "already completed" branch. Normal first-time onboarding is unchanged.
create or replace function public.create_company_and_profile(
  p_company_name text,
  p_full_name text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_company_name text := pg_catalog.btrim(p_company_name);
  v_full_name text := nullif(pg_catalog.btrim(p_full_name), '');
  v_company_id uuid;
begin
  if v_user_id is null then
    raise exception using
      errcode = '28000',
      message = 'Authentication is required to complete onboarding.';
  end if;

  if v_company_name is null or v_company_name = '' then
    raise exception using
      errcode = '22023',
      message = 'Company name is required.';
  end if;

  if pg_catalog.char_length(v_company_name) > 160 then
    raise exception using
      errcode = '22023',
      message = 'Company name must be 160 characters or fewer.';
  end if;

  if v_full_name is not null and pg_catalog.char_length(v_full_name) > 160 then
    raise exception using
      errcode = '22023',
      message = 'Full name must be 160 characters or fewer.';
  end if;

  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 0)
  );

  if exists (
    select 1
    from public.profiles as profile
    join public.companies as company on company.id = profile.company_id
    where profile.id = v_user_id
      and company.is_demo
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'demo_company_read_only';
  end if;

  if exists (
    select 1
    from public.profiles as profile
    where profile.id = v_user_id
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'Onboarding has already been completed for this user.';
  end if;

  insert into public.companies (name)
  values (v_company_name)
  returning id into v_company_id;

  begin
    insert into public.profiles (id, company_id, full_name)
    values (v_user_id, v_company_id, v_full_name);
  exception
    when unique_violation then
      raise exception using
        errcode = 'P0001',
        message = 'Onboarding has already been completed for this user.';
  end;

  return v_company_id;
end;
$$;

revoke execute on function public.create_company_and_profile(text, text)
from public, anon, authenticated;
grant execute on function public.create_company_and_profile(text, text) to authenticated;

commit;
