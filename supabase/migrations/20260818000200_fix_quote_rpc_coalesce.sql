-- Fix runtime initialization of quote RPC note values. COALESCE is SQL
-- syntax and cannot be schema-qualified as pg_catalog.coalesce(...).

begin;

create or replace function public.create_quote(
  p_customer_id uuid,
  p_title text,
  p_issue_date date,
  p_valid_until date,
  p_status text,
  p_discount_amount numeric,
  p_vat_rate numeric,
  p_notes text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_company_id uuid;
  v_title text := pg_catalog.btrim(p_title);
  v_notes text := coalesce(p_notes, '');
  v_quote_year integer;
  v_sequence_value bigint;
  v_code text;
  v_quote_id uuid;
begin
  if v_user_id is null then
    raise exception using
      errcode = '28000',
      message = 'Authentication is required to create a quote.';
  end if;

  v_company_id := (select public.current_company_id());

  if v_company_id is null then
    raise exception using
      errcode = '28000',
      message = 'An authenticated company profile is required to create a quote.';
  end if;

  if p_customer_id is null then
    raise exception using errcode = '22023', message = 'Customer is required.';
  end if;

  perform 1
  from public.customers as customer
  where customer.id = p_customer_id
    and customer.company_id = v_company_id
  for key share;

  if not found then
    raise exception using errcode = 'P0002', message = 'Customer not found.';
  end if;

  if v_title is null or v_title = '' then
    raise exception using errcode = '22023', message = 'Quote title is required.';
  end if;

  if pg_catalog.char_length(v_title) > 200 then
    raise exception using errcode = '22023', message = 'Quote title must be 200 characters or fewer.';
  end if;

  if p_issue_date is null or p_valid_until is null then
    raise exception using errcode = '22023', message = 'Quote and validity dates are required.';
  end if;

  if p_valid_until < p_issue_date then
    raise exception using errcode = '22023', message = 'Validity date cannot be before the quote date.';
  end if;

  if p_status is null or p_status not in ('draft', 'sent', 'pending', 'approved', 'rejected') then
    raise exception using errcode = '22023', message = 'Quote status is invalid.';
  end if;

  if p_discount_amount is null
    or p_discount_amount::text in ('NaN', 'Infinity', '-Infinity')
    or p_discount_amount < 0
    or p_discount_amount > 999999999999.99
    or p_discount_amount <> pg_catalog.round(p_discount_amount, 2)
  then
    raise exception using errcode = '22023', message = 'Discount must be a non-negative numeric(14,2) value.';
  end if;

  if p_vat_rate is null
    or p_vat_rate::text in ('NaN', 'Infinity', '-Infinity')
    or p_vat_rate < 0
    or p_vat_rate > 100
    or p_vat_rate <> pg_catalog.round(p_vat_rate, 2)
  then
    raise exception using errcode = '22023', message = 'VAT rate must be between 0 and 100 with at most 2 decimal places.';
  end if;

  if pg_catalog.char_length(v_notes) > 4000 then
    raise exception using errcode = '22023', message = 'Quote notes must be 4000 characters or fewer.';
  end if;

  perform public.validate_quote_items(p_items);

  v_quote_year := pg_catalog.date_part('year', p_issue_date)::integer;

  if v_quote_year <= 0 then
    raise exception using
      errcode = '22023',
      message = 'Quote date must use a positive calendar year.';
  end if;

  insert into public.quote_number_counters as counter (
    company_id,
    quote_year,
    last_value,
    updated_at
  )
  values (v_company_id, v_quote_year, 1, pg_catalog.now())
  on conflict (company_id, quote_year)
  do update set
    last_value = counter.last_value + 1,
    updated_at = pg_catalog.now()
  returning last_value into v_sequence_value;

  v_code := pg_catalog.format(
    'TKL-%s-%s',
    v_quote_year,
    case
      when v_sequence_value < 1000
        then pg_catalog.lpad(v_sequence_value::text, 3, '0')
      else v_sequence_value::text
    end
  );

  insert into public.quotes (
    company_id,
    customer_id,
    code,
    title,
    status,
    issue_date,
    valid_until,
    discount_amount,
    vat_rate,
    notes
  )
  values (
    v_company_id,
    p_customer_id,
    v_code,
    v_title,
    'draft',
    p_issue_date,
    p_valid_until,
    p_discount_amount,
    p_vat_rate,
    v_notes
  )
  returning id into v_quote_id;

  perform public.replace_quote_items(v_quote_id, v_company_id, p_items);

  -- Approval is deliberately last so item writes cannot happen after freeze.
  update public.quotes
  set status = p_status
  where id = v_quote_id
    and company_id = v_company_id;

  return v_quote_id;
end;
$$;

revoke execute on function public.create_quote(uuid, text, date, date, text, numeric, numeric, text, jsonb) from public;
revoke execute on function public.create_quote(uuid, text, date, date, text, numeric, numeric, text, jsonb) from anon;
revoke execute on function public.create_quote(uuid, text, date, date, text, numeric, numeric, text, jsonb) from authenticated;
grant execute on function public.create_quote(uuid, text, date, date, text, numeric, numeric, text, jsonb) to authenticated;

create or replace function public.update_quote(
  p_quote_id uuid,
  p_customer_id uuid,
  p_title text,
  p_issue_date date,
  p_valid_until date,
  p_status text,
  p_discount_amount numeric,
  p_vat_rate numeric,
  p_notes text,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user_id uuid := (select auth.uid());
  v_company_id uuid;
  v_existing_status text;
  v_title text := pg_catalog.btrim(p_title);
  v_notes text := coalesce(p_notes, '');
begin
  if v_user_id is null then
    raise exception using
      errcode = '28000',
      message = 'Authentication is required to update a quote.';
  end if;

  v_company_id := (select public.current_company_id());

  if v_company_id is null then
    raise exception using
      errcode = '28000',
      message = 'An authenticated company profile is required to update a quote.';
  end if;

  if p_quote_id is null then
    raise exception using errcode = '22023', message = 'Quote id is required.';
  end if;

  if p_customer_id is null then
    raise exception using errcode = '22023', message = 'Customer is required.';
  end if;

  perform 1
  from public.customers as customer
  where customer.id = p_customer_id
    and customer.company_id = v_company_id
  for key share;

  if not found then
    raise exception using errcode = 'P0002', message = 'Customer not found.';
  end if;

  if v_title is null or v_title = '' then
    raise exception using errcode = '22023', message = 'Quote title is required.';
  end if;

  if pg_catalog.char_length(v_title) > 200 then
    raise exception using errcode = '22023', message = 'Quote title must be 200 characters or fewer.';
  end if;

  if p_issue_date is null or p_valid_until is null then
    raise exception using errcode = '22023', message = 'Quote and validity dates are required.';
  end if;

  if p_valid_until < p_issue_date then
    raise exception using errcode = '22023', message = 'Validity date cannot be before the quote date.';
  end if;

  if p_status is null or p_status not in ('draft', 'sent', 'pending', 'approved', 'rejected') then
    raise exception using errcode = '22023', message = 'Quote status is invalid.';
  end if;

  if p_discount_amount is null
    or p_discount_amount::text in ('NaN', 'Infinity', '-Infinity')
    or p_discount_amount < 0
    or p_discount_amount > 999999999999.99
    or p_discount_amount <> pg_catalog.round(p_discount_amount, 2)
  then
    raise exception using errcode = '22023', message = 'Discount must be a non-negative numeric(14,2) value.';
  end if;

  if p_vat_rate is null
    or p_vat_rate::text in ('NaN', 'Infinity', '-Infinity')
    or p_vat_rate < 0
    or p_vat_rate > 100
    or p_vat_rate <> pg_catalog.round(p_vat_rate, 2)
  then
    raise exception using errcode = '22023', message = 'VAT rate must be between 0 and 100 with at most 2 decimal places.';
  end if;

  if pg_catalog.char_length(v_notes) > 4000 then
    raise exception using errcode = '22023', message = 'Quote notes must be 4000 characters or fewer.';
  end if;

  perform public.validate_quote_items(p_items);

  select quote.status
  into v_existing_status
  from public.quotes as quote
  where quote.id = p_quote_id
    and quote.company_id = v_company_id
  for update;

  if not found then
    raise exception using errcode = 'P0002', message = 'Quote not found.';
  end if;

  if v_existing_status = 'approved' then
    raise exception using errcode = 'P0001', message = 'Approved quotes cannot be changed.';
  end if;

  update public.quotes
  set
    customer_id = p_customer_id,
    title = v_title,
    issue_date = p_issue_date,
    valid_until = p_valid_until,
    discount_amount = p_discount_amount,
    vat_rate = p_vat_rate,
    notes = v_notes
  where id = p_quote_id
    and company_id = v_company_id;

  perform public.replace_quote_items(p_quote_id, v_company_id, p_items);

  -- Approval is deliberately last so item writes cannot happen after freeze.
  update public.quotes
  set status = p_status
  where id = p_quote_id
    and company_id = v_company_id;

  return p_quote_id;
end;
$$;

revoke execute on function public.update_quote(uuid, uuid, text, date, date, text, numeric, numeric, text, jsonb) from public;
revoke execute on function public.update_quote(uuid, uuid, text, date, date, text, numeric, numeric, text, jsonb) from anon;
revoke execute on function public.update_quote(uuid, uuid, text, date, date, text, numeric, numeric, text, jsonb) from authenticated;
grant execute on function public.update_quote(uuid, uuid, text, date, date, text, numeric, numeric, text, jsonb) to authenticated;

commit;
