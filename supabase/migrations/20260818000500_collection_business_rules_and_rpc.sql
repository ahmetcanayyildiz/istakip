-- Secure collection planning and payment transitions, enforce the per-job
-- contract ceiling under concurrency, and protect financial history records.

begin;

-- Refuse to establish the invariant on top of already-invalid financial data.
do $$
begin
  if exists (
    select 1
    from public.jobs as job
    join public.collections as collection
      on collection.job_id = job.id
     and collection.company_id = job.company_id
    group by job.id, job.company_id, job.contract_amount
    having pg_catalog.sum(collection.amount) > job.contract_amount
  ) then
    raise exception using
      errcode = '23514',
      message = 'Existing collection totals exceed a job contract amount.';
  end if;
end;
$$;

create function public.enforce_collection_business_rules()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_contract_amount numeric;
  v_planned_amount numeric;
begin
  if tg_op = 'DELETE' then
    raise exception using
      errcode = 'P0001',
      message = 'Collection records cannot be deleted.';
  end if;

  if tg_op = 'UPDATE' then
    if old.status <> 'pending' or new.status <> 'paid' then
      raise exception using
        errcode = 'P0001',
        message = 'Only pending collections can be marked as paid.';
    end if;

    if new.id is distinct from old.id
      or new.company_id is distinct from old.company_id
      or new.job_id is distinct from old.job_id
      or new.amount is distinct from old.amount
      or new.due_date is distinct from old.due_date
      or new.created_at is distinct from old.created_at
    then
      raise exception using
        errcode = 'P0001',
        message = 'Collection financial fields cannot be changed.';
    end if;

    if new.paid_at is null
      or new.payment_method is null
      or new.payment_method not in ('bank_transfer', 'cash', 'credit_card', 'other')
    then
      raise exception using
        errcode = '22023',
        message = 'Paid collections require a valid payment date and method.';
    end if;

    return new;
  end if;

  if new.status <> 'pending'
    or new.paid_at is not null
    or new.payment_method is not null
  then
    raise exception using
      errcode = 'P0001',
      message = 'New collections must start in the pending state.';
  end if;

  -- Every collection insert locks the parent job first. Inserts for one job
  -- therefore serialize before the aggregate is checked.
  select job.contract_amount
  into v_contract_amount
  from public.jobs as job
  where job.id = new.job_id
    and job.company_id = new.company_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Job not found.';
  end if;

  select coalesce(pg_catalog.sum(collection.amount), 0)
  into v_planned_amount
  from public.collections as collection
  where collection.job_id = new.job_id
    and collection.company_id = new.company_id;

  if v_planned_amount + new.amount > v_contract_amount then
    raise exception using
      errcode = '23514',
      message = 'Collection total cannot exceed the job contract amount.';
  end if;

  return new;
end;
$$;

revoke all privileges on function public.enforce_collection_business_rules()
from public, anon, authenticated;

create trigger collections_enforce_business_rules
before insert or update or delete on public.collections
for each row execute function public.enforce_collection_business_rules();

create function public.create_collection(
  p_job_id uuid,
  p_amount numeric,
  p_due_date date
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_company_id uuid;
  v_contract_amount numeric;
  v_planned_amount numeric;
  v_collection_id uuid;
begin
  if v_user_id is null then
    raise exception using
      errcode = '28000',
      message = 'Authentication is required to create a collection.';
  end if;

  v_company_id := (select public.current_company_id());

  if v_company_id is null then
    raise exception using
      errcode = '28000',
      message = 'An authenticated company profile is required to create a collection.';
  end if;

  if p_job_id is null then
    raise exception using
      errcode = '22023',
      message = 'Job id is required.';
  end if;

  if p_amount is null
    or p_amount::text in ('NaN', 'Infinity', '-Infinity')
    or p_amount <= 0
    or p_amount > 999999999999.99
    or p_amount <> pg_catalog.round(p_amount, 2)
  then
    raise exception using
      errcode = '22023',
      message = 'Collection amount must be a positive numeric(14,2) value.';
  end if;

  if p_due_date is null then
    raise exception using
      errcode = '22023',
      message = 'Collection due date is required.';
  end if;

  -- Tenant validation and concurrency serialization use the same row lock.
  select job.contract_amount
  into v_contract_amount
  from public.jobs as job
  where job.id = p_job_id
    and job.company_id = v_company_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Job not found.';
  end if;

  select coalesce(pg_catalog.sum(collection.amount), 0)
  into v_planned_amount
  from public.collections as collection
  where collection.job_id = p_job_id
    and collection.company_id = v_company_id;

  if v_planned_amount + p_amount > v_contract_amount then
    raise exception using
      errcode = '23514',
      message = 'Collection total cannot exceed the job contract amount.';
  end if;

  insert into public.collections (
    company_id,
    job_id,
    amount,
    due_date,
    status,
    payment_method,
    paid_at
  )
  values (
    v_company_id,
    p_job_id,
    p_amount,
    p_due_date,
    'pending',
    null,
    null
  )
  returning id into v_collection_id;

  return v_collection_id;
end;
$$;

revoke execute on function public.create_collection(uuid, numeric, date) from public;
revoke execute on function public.create_collection(uuid, numeric, date) from anon;
revoke execute on function public.create_collection(uuid, numeric, date) from authenticated;
grant execute on function public.create_collection(uuid, numeric, date) to authenticated;

create function public.mark_collection_paid(
  p_collection_id uuid,
  p_paid_date date,
  p_payment_method text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_company_id uuid;
  v_status text;
begin
  if v_user_id is null then
    raise exception using
      errcode = '28000',
      message = 'Authentication is required to mark a collection as paid.';
  end if;

  v_company_id := (select public.current_company_id());

  if v_company_id is null then
    raise exception using
      errcode = '28000',
      message = 'An authenticated company profile is required to update a collection.';
  end if;

  if p_collection_id is null then
    raise exception using
      errcode = '22023',
      message = 'Collection id is required.';
  end if;

  if p_paid_date is null then
    raise exception using
      errcode = '22023',
      message = 'Payment date is required.';
  end if;

  if p_payment_method is null
    or p_payment_method not in ('bank_transfer', 'cash', 'credit_card', 'other')
  then
    raise exception using
      errcode = '22023',
      message = 'Payment method is invalid.';
  end if;

  select collection.status
  into v_status
  from public.collections as collection
  where collection.id = p_collection_id
    and collection.company_id = v_company_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Collection not found.';
  end if;

  if v_status <> 'pending' then
    raise exception using
      errcode = 'P0001',
      message = 'Only pending collections can be marked as paid.';
  end if;

  update public.collections
  set
    status = 'paid',
    paid_at = p_paid_date::timestamp without time zone at time zone 'Europe/Istanbul',
    payment_method = p_payment_method
  where id = p_collection_id
    and company_id = v_company_id;

  return p_collection_id;
end;
$$;

revoke execute on function public.mark_collection_paid(uuid, date, text) from public;
revoke execute on function public.mark_collection_paid(uuid, date, text) from anon;
revoke execute on function public.mark_collection_paid(uuid, date, text) from authenticated;
grant execute on function public.mark_collection_paid(uuid, date, text) to authenticated;

-- Keep tenant-scoped reads only. All financial mutations flow through the
-- trusted functions above; dormant mutation policies are removed as well.
revoke all privileges on table public.collections from public;
revoke all privileges on table public.collections from anon;
revoke insert, update, delete on table public.collections from authenticated;
grant select on table public.collections to authenticated;

drop policy if exists collections_insert_own_company on public.collections;
drop policy if exists collections_update_own_company on public.collections;

commit;
