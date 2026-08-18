-- Secure job numbering, atomic approved-quote conversion, historical contract
-- amount snapshots, and least-privilege Data API access for the jobs module.

begin;

create table public.job_number_counters (
  company_id uuid not null,
  job_year integer not null,
  last_value bigint not null,
  updated_at timestamptz not null default now(),
  constraint job_number_counters_pkey primary key (company_id, job_year),
  constraint job_number_counters_company_fkey
    foreign key (company_id) references public.companies (id) on delete restrict,
  constraint job_number_counters_year_check
    check (job_year between 1 and 9999),
  constraint job_number_counters_last_value_check
    check (last_value > 0)
);

alter table public.job_number_counters enable row level security;

-- Preserve the existing IS-YYYY-NNN format and continue after any matching
-- pre-existing job codes. Non-matching legacy codes remain untouched.
insert into public.job_number_counters (company_id, job_year, last_value)
select
  parsed.company_id,
  parsed.job_year,
  pg_catalog.max(parsed.sequence_value)
from (
  select
    job.company_id,
    pg_catalog.substr(job.code, 4, 4)::integer as job_year,
    pg_catalog.split_part(job.code, '-', 3)::bigint as sequence_value
  from public.jobs as job
  where job.code ~ '^IS-[0-9]{4}-[0-9]{1,18}$'
) as parsed
where parsed.sequence_value > 0
group by parsed.company_id, parsed.job_year;

revoke all privileges on table public.job_number_counters from public;
revoke all privileges on table public.job_number_counters from anon;
revoke all privileges on table public.job_number_counters from authenticated;

create function public.create_job_from_quote(
  p_quote_id uuid,
  p_start_date date,
  p_target_date date
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_company_id uuid;
  v_customer_id uuid;
  v_quote_title text;
  v_quote_status text;
  v_discount_amount numeric;
  v_item_count bigint;
  v_contract_amount numeric;
  v_job_year integer;
  v_sequence_value bigint;
  v_code text;
  v_job_id uuid;
begin
  if v_user_id is null then
    raise exception using
      errcode = '28000',
      message = 'Authentication is required to create a job.';
  end if;

  v_company_id := (select public.current_company_id());

  if v_company_id is null then
    raise exception using
      errcode = '28000',
      message = 'An authenticated company profile is required to create a job.';
  end if;

  if p_quote_id is null then
    raise exception using
      errcode = '22023',
      message = 'Quote id is required.';
  end if;

  if p_start_date is null or p_target_date is null then
    raise exception using
      errcode = '22023',
      message = 'Job start and target dates are required.';
  end if;

  if p_target_date < p_start_date then
    raise exception using
      errcode = '22023',
      message = 'Job target date cannot be before the start date.';
  end if;

  v_job_year := pg_catalog.date_part('year', p_start_date)::integer;

  if v_job_year < 1 or v_job_year > 9999 then
    raise exception using
      errcode = '22023',
      message = 'Job start date must use a four-digit positive calendar year.';
  end if;

  -- Serialize conversions of the same quote and take all trusted job fields
  -- from the tenant-scoped approved quote rather than from client input.
  select
    quote.customer_id,
    quote.title,
    quote.status,
    quote.discount_amount
  into
    v_customer_id,
    v_quote_title,
    v_quote_status,
    v_discount_amount
  from public.quotes as quote
  where quote.id = p_quote_id
    and quote.company_id = v_company_id
  for update;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Quote not found.';
  end if;

  if v_quote_status <> 'approved' then
    raise exception using
      errcode = 'P0001',
      message = 'Only approved quotes can be converted to jobs.';
  end if;

  if exists (
    select 1
    from public.jobs as job
    where job.source_quote_id = p_quote_id
  ) then
    raise exception using
      errcode = 'P0001',
      message = 'This quote has already been converted to a job.';
  end if;

  select
    pg_catalog.count(*),
    -- VAT is intentionally excluded: the job snapshot is quote subtotal
    -- minus discount, rounded to the jobs numeric(14,2) precision.
    pg_catalog.round(
      coalesce(pg_catalog.sum(item.quantity * item.unit_price), 0)
        - v_discount_amount,
      2
    )
  into
    v_item_count,
    v_contract_amount
  from public.quote_items as item
  where item.quote_id = p_quote_id
    and item.company_id = v_company_id;

  if v_item_count < 1 then
    raise exception using
      errcode = 'P0001',
      message = 'An approved quote must contain at least one item.';
  end if;

  if v_contract_amount::text in ('NaN', 'Infinity', '-Infinity')
    or v_contract_amount < 0
    or v_contract_amount > 999999999999.99
  then
    raise exception using
      errcode = '22023',
      message = 'Quote net amount is outside the allowed numeric(14,2) contract range.';
  end if;

  insert into public.job_number_counters as counter (
    company_id,
    job_year,
    last_value,
    updated_at
  )
  values (v_company_id, v_job_year, 1, pg_catalog.now())
  on conflict (company_id, job_year)
  do update set
    last_value = counter.last_value + 1,
    updated_at = pg_catalog.now()
  returning last_value into v_sequence_value;

  v_code := pg_catalog.format(
    'IS-%s-%s',
    v_job_year,
    case
      when v_sequence_value < 1000
        then pg_catalog.lpad(v_sequence_value::text, 3, '0')
      else v_sequence_value::text
    end
  );

  insert into public.jobs (
    company_id,
    customer_id,
    source_quote_id,
    code,
    title,
    status,
    start_date,
    target_date,
    contract_amount
  )
  values (
    v_company_id,
    v_customer_id,
    p_quote_id,
    v_code,
    v_quote_title,
    'planned',
    p_start_date,
    p_target_date,
    v_contract_amount
  )
  returning id into v_job_id;

  return v_job_id;
end;
$$;

revoke execute on function public.create_job_from_quote(uuid, date, date) from public;
revoke execute on function public.create_job_from_quote(uuid, date, date) from anon;
revoke execute on function public.create_job_from_quote(uuid, date, date) from authenticated;
grant execute on function public.create_job_from_quote(uuid, date, date) to authenticated;

-- Keep authenticated SELECT access and the tenant-scoped SELECT RLS policy.
-- DELETE was never granted. INSERT flows through the conversion RPC; UPDATE
-- remains unavailable until a dedicated lifecycle RPC is introduced.
revoke insert, update on table public.jobs from authenticated;

commit;
