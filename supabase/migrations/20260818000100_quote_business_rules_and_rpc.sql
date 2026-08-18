-- Secure quote numbering, atomic quote mutations, approved-quote freezing,
-- and least-privilege Data API access for the quotes module.

begin;

create table public.quote_number_counters (
  company_id uuid not null,
  quote_year integer not null,
  last_value bigint not null,
  updated_at timestamptz not null default now(),
  constraint quote_number_counters_pkey primary key (company_id, quote_year),
  constraint quote_number_counters_company_fkey
    foreign key (company_id) references public.companies (id) on delete restrict,
  constraint quote_number_counters_year_check
    check (quote_year > 0),
  constraint quote_number_counters_last_value_check
    check (last_value > 0)
);

alter table public.quote_number_counters enable row level security;

-- Preserve the existing TKL-YYYY-NNN format and continue after any matching
-- pre-existing quote codes. Non-matching legacy codes remain untouched.
insert into public.quote_number_counters (company_id, quote_year, last_value)
select
  parsed.company_id,
  parsed.quote_year,
  pg_catalog.max(parsed.sequence_value)
from (
  select
    quote.company_id,
    pg_catalog.substr(quote.code, 5, 4)::integer as quote_year,
    pg_catalog.split_part(quote.code, '-', 3)::bigint as sequence_value
  from public.quotes as quote
  where quote.code ~ '^TKL-[0-9]{4}-[0-9]{1,18}$'
) as parsed
where parsed.sequence_value > 0
group by parsed.company_id, parsed.quote_year;

revoke all privileges on table public.quote_number_counters from public;
revoke all privileges on table public.quote_number_counters from anon;
revoke all privileges on table public.quote_number_counters from authenticated;

-- Internal input validator. Clients cannot execute this helper directly.
create function public.validate_quote_items(p_items jsonb)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_item jsonb;
  v_position integer := 0;
  v_description text;
  v_unit text;
  v_quantity_text text;
  v_unit_price_text text;
  v_quantity numeric;
  v_unit_price numeric;
begin
  if p_items is null or pg_catalog.jsonb_typeof(p_items) <> 'array' then
    raise exception using
      errcode = '22023',
      message = 'Quote items must be provided as a JSON array.';
  end if;

  if pg_catalog.jsonb_array_length(p_items) < 1 then
    raise exception using
      errcode = '22023',
      message = 'A quote must contain at least one item.';
  end if;

  if pg_catalog.jsonb_array_length(p_items) > 32767 then
    raise exception using
      errcode = '22023',
      message = 'A quote cannot contain more than 32767 items.';
  end if;

  for v_item in
    select item.value
    from pg_catalog.jsonb_array_elements(p_items) as item(value)
  loop
    v_position := v_position + 1;

    if pg_catalog.jsonb_typeof(v_item) <> 'object' then
      raise exception using
        errcode = '22023',
        message = pg_catalog.format('Quote item %s must be a JSON object.', v_position);
    end if;

    v_description := pg_catalog.btrim(v_item ->> 'description');
    v_unit := pg_catalog.btrim(v_item ->> 'unit');
    v_quantity_text := v_item ->> 'quantity';
    v_unit_price_text := v_item ->> 'unit_price';

    if v_description is null or v_description = '' then
      raise exception using
        errcode = '22023',
        message = pg_catalog.format('Quote item %s description is required.', v_position);
    end if;

    if pg_catalog.char_length(v_description) > 500 then
      raise exception using
        errcode = '22023',
        message = pg_catalog.format('Quote item %s description must be 500 characters or fewer.', v_position);
    end if;

    if v_unit is null or v_unit = '' then
      raise exception using
        errcode = '22023',
        message = pg_catalog.format('Quote item %s unit is required.', v_position);
    end if;

    if pg_catalog.char_length(v_unit) > 50 then
      raise exception using
        errcode = '22023',
        message = pg_catalog.format('Quote item %s unit must be 50 characters or fewer.', v_position);
    end if;

    if v_quantity_text is null
      or v_quantity_text !~ '^[0-9]+(\.[0-9]{1,3})?$'
    then
      raise exception using
        errcode = '22023',
        message = pg_catalog.format('Quote item %s quantity must be a positive number with at most 3 decimal places.', v_position);
    end if;

    if v_unit_price_text is null
      or v_unit_price_text !~ '^[0-9]+(\.[0-9]{1,2})?$'
    then
      raise exception using
        errcode = '22023',
        message = pg_catalog.format('Quote item %s unit price must be a non-negative number with at most 2 decimal places.', v_position);
    end if;

    v_quantity := v_quantity_text::numeric;
    v_unit_price := v_unit_price_text::numeric;

    if v_quantity <= 0 or v_quantity > 99999999999.999 then
      raise exception using
        errcode = '22023',
        message = pg_catalog.format('Quote item %s quantity is outside the allowed numeric(14,3) range.', v_position);
    end if;

    if v_unit_price < 0 or v_unit_price > 999999999999.99 then
      raise exception using
        errcode = '22023',
        message = pg_catalog.format('Quote item %s unit price is outside the allowed numeric(14,2) range.', v_position);
    end if;
  end loop;
end;
$$;

revoke execute on function public.validate_quote_items(jsonb) from public;
revoke execute on function public.validate_quote_items(jsonb) from anon;
revoke execute on function public.validate_quote_items(jsonb) from authenticated;

-- Internal replacement helper. Its caller must validate the payload first.
create function public.replace_quote_items(
  p_quote_id uuid,
  p_company_id uuid,
  p_items jsonb
)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_item record;
begin
  if not exists (
    select 1
    from public.quotes as quote
    where quote.id = p_quote_id
      and quote.company_id = p_company_id
  ) then
    raise exception using
      errcode = 'P0002',
      message = 'Quote not found.';
  end if;

  delete from public.quote_items as item
  where item.quote_id = p_quote_id
    and item.company_id = p_company_id;

  for v_item in
    select item.value, item.position
    from pg_catalog.jsonb_array_elements(p_items)
      with ordinality as item(value, position)
    order by item.position
  loop
    insert into public.quote_items (
      company_id,
      quote_id,
      position,
      description,
      quantity,
      unit,
      unit_price
    )
    values (
      p_company_id,
      p_quote_id,
      v_item.position::smallint,
      pg_catalog.btrim(v_item.value ->> 'description'),
      (v_item.value ->> 'quantity')::numeric(14,3),
      pg_catalog.btrim(v_item.value ->> 'unit'),
      (v_item.value ->> 'unit_price')::numeric(14,2)
    );
  end loop;
end;
$$;

revoke execute on function public.replace_quote_items(uuid, uuid, jsonb) from public;
revoke execute on function public.replace_quote_items(uuid, uuid, jsonb) from anon;
revoke execute on function public.replace_quote_items(uuid, uuid, jsonb) from authenticated;

create function public.prevent_approved_quote_changes()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status = 'approved'
    and (pg_catalog.to_jsonb(new) - 'updated_at')
      is distinct from (pg_catalog.to_jsonb(old) - 'updated_at')
  then
    raise exception using
      errcode = 'P0001',
      message = 'Approved quotes cannot be changed.';
  end if;

  return new;
end;
$$;

revoke execute on function public.prevent_approved_quote_changes() from public;
revoke execute on function public.prevent_approved_quote_changes() from anon;
revoke execute on function public.prevent_approved_quote_changes() from authenticated;

create trigger quotes_prevent_approved_changes
before update on public.quotes
for each row execute function public.prevent_approved_quote_changes();

create function public.prevent_approved_quote_item_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op in ('UPDATE', 'DELETE') then
    if exists (
      select 1
      from public.quotes as quote
      where quote.id = old.quote_id
        and quote.company_id = old.company_id
        and quote.status = 'approved'
    ) then
      raise exception using
        errcode = 'P0001',
        message = 'Items of an approved quote cannot be changed.';
    end if;
  end if;

  if tg_op in ('INSERT', 'UPDATE') then
    if exists (
      select 1
      from public.quotes as quote
      where quote.id = new.quote_id
        and quote.company_id = new.company_id
        and quote.status = 'approved'
    ) then
      raise exception using
        errcode = 'P0001',
        message = 'Items cannot be added to or moved into an approved quote.';
    end if;
  end if;

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

revoke execute on function public.prevent_approved_quote_item_changes() from public;
revoke execute on function public.prevent_approved_quote_item_changes() from anon;
revoke execute on function public.prevent_approved_quote_item_changes() from authenticated;

create trigger quote_items_prevent_approved_changes
before insert or update or delete on public.quote_items
for each row execute function public.prevent_approved_quote_item_changes();

create function public.create_quote(
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
  v_notes text := pg_catalog.coalesce(p_notes, '');
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

create function public.update_quote(
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
  v_notes text := pg_catalog.coalesce(p_notes, '');
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

-- Keep authenticated SELECT access and tenant-scoped SELECT RLS policies.
-- DELETE was never granted; INSERT and UPDATE now flow only through RPCs.
revoke insert, update on table public.quotes from authenticated;
revoke insert, update on table public.quote_items from authenticated;

commit;
