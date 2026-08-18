-- Secure expense creation through a tenant-scoped RPC and remove direct
-- client mutation privileges from financial history records.

begin;

create function public.create_expense(
  p_job_id uuid,
  p_expense_date date,
  p_description text,
  p_category text,
  p_amount numeric
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_company_id uuid;
  v_description text := pg_catalog.btrim(p_description);
  v_expense_id uuid;
begin
  if v_user_id is null then
    raise exception using
      errcode = '28000',
      message = 'Authentication is required to create an expense.';
  end if;

  v_company_id := (select public.current_company_id());

  if v_company_id is null then
    raise exception using
      errcode = '28000',
      message = 'An authenticated company profile is required to create an expense.';
  end if;

  if p_job_id is null then
    raise exception using
      errcode = '22023',
      message = 'Job id is required.';
  end if;

  perform 1
  from public.jobs as job
  where job.id = p_job_id
    and job.company_id = v_company_id
  for key share;

  if not found then
    raise exception using
      errcode = 'P0002',
      message = 'Job not found.';
  end if;

  if p_expense_date is null then
    raise exception using
      errcode = '22023',
      message = 'Expense date is required.';
  end if;

  if v_description is null or v_description = '' then
    raise exception using
      errcode = '22023',
      message = 'Expense description is required.';
  end if;

  if pg_catalog.char_length(v_description) > 500 then
    raise exception using
      errcode = '22023',
      message = 'Expense description must be 500 characters or fewer.';
  end if;

  if p_category is null
    or p_category not in ('material', 'labor', 'transport', 'equipment', 'service', 'other')
  then
    raise exception using
      errcode = '22023',
      message = 'Expense category is invalid.';
  end if;

  if p_amount is null
    or p_amount::text in ('NaN', 'Infinity', '-Infinity')
    or p_amount <= 0
    or p_amount > 999999999999.99
    or p_amount <> pg_catalog.round(p_amount, 2)
  then
    raise exception using
      errcode = '22023',
      message = 'Expense amount must be a positive numeric(14,2) value.';
  end if;

  insert into public.expenses (
    company_id,
    job_id,
    expense_date,
    description,
    category,
    amount
  )
  values (
    v_company_id,
    p_job_id,
    p_expense_date,
    v_description,
    p_category,
    p_amount
  )
  returning id into v_expense_id;

  return v_expense_id;
end;
$$;

revoke execute on function public.create_expense(uuid, date, text, text, numeric) from public;
revoke execute on function public.create_expense(uuid, date, text, text, numeric) from anon;
revoke execute on function public.create_expense(uuid, date, text, text, numeric) from authenticated;
grant execute on function public.create_expense(uuid, date, text, text, numeric) to authenticated;

-- Tenant-scoped reads remain available through the existing SELECT policy.
-- Financial history writes must now use trusted RPCs; DELETE remains unavailable.
revoke insert, update on table public.expenses from authenticated;

commit;
