-- İşTakip initial database schema.
-- RLS policies are intentionally deferred to a separate security migration.

create table public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  currency_code text not null default 'TRY',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_currency_code_check
    check (currency_code ~ '^[A-Z]{3}$')
);

create table public.profiles (
  id uuid primary key,
  company_id uuid not null,
  full_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_user_fkey
    foreign key (id) references auth.users (id) on delete cascade,
  constraint profiles_company_fkey
    foreign key (company_id) references public.companies (id) on delete restrict
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  name text not null,
  contact_name text,
  phone text,
  email text,
  address text,
  city text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_id_company_key unique (id, company_id),
  constraint customers_company_fkey
    foreign key (company_id) references public.companies (id) on delete restrict
);

create table public.quotes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  customer_id uuid not null,
  code text not null,
  title text not null,
  status text not null default 'draft',
  issue_date date not null default current_date,
  valid_until date not null,
  discount_amount numeric(14,2) not null default 0,
  vat_rate numeric(5,2) not null default 20,
  notes text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quotes_company_code_key unique (company_id, code),
  constraint quotes_id_company_key unique (id, company_id),
  constraint quotes_id_customer_company_key unique (id, customer_id, company_id),
  constraint quotes_company_fkey
    foreign key (company_id) references public.companies (id) on delete restrict,
  constraint quotes_customer_company_fkey
    foreign key (customer_id, company_id)
    references public.customers (id, company_id)
    on delete restrict,
  constraint quotes_status_check
    check (status in ('draft', 'sent', 'pending', 'approved', 'rejected')),
  constraint quotes_valid_until_check
    check (valid_until >= issue_date),
  constraint quotes_discount_amount_check
    check (discount_amount >= 0),
  constraint quotes_vat_rate_check
    check (vat_rate >= 0 and vat_rate <= 100)
);

create table public.quote_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  quote_id uuid not null,
  position smallint not null,
  description text not null,
  quantity numeric(14,3) not null,
  unit text not null,
  unit_price numeric(14,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint quote_items_quote_position_key unique (quote_id, position),
  constraint quote_items_company_fkey
    foreign key (company_id) references public.companies (id) on delete restrict,
  constraint quote_items_quote_company_fkey
    foreign key (quote_id, company_id)
    references public.quotes (id, company_id)
    on delete cascade,
  constraint quote_items_position_check
    check (position > 0),
  constraint quote_items_quantity_check
    check (quantity > 0),
  constraint quote_items_unit_price_check
    check (unit_price >= 0)
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  customer_id uuid not null,
  source_quote_id uuid,
  code text not null,
  title text not null,
  status text not null default 'planned',
  start_date date not null,
  target_date date not null,
  contract_amount numeric(14,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint jobs_company_code_key unique (company_id, code),
  constraint jobs_id_company_key unique (id, company_id),
  constraint jobs_source_quote_key unique (source_quote_id),
  constraint jobs_company_fkey
    foreign key (company_id) references public.companies (id) on delete restrict,
  constraint jobs_customer_company_fkey
    foreign key (customer_id, company_id)
    references public.customers (id, company_id)
    on delete restrict,
  constraint jobs_source_quote_customer_company_fkey
    foreign key (source_quote_id, customer_id, company_id)
    references public.quotes (id, customer_id, company_id)
    on delete restrict,
  constraint jobs_status_check
    check (status in ('planned', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  constraint jobs_target_date_check
    check (target_date >= start_date),
  constraint jobs_contract_amount_check
    check (contract_amount >= 0)
);

create table public.expenses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  job_id uuid not null,
  expense_date date not null,
  description text not null,
  category text not null,
  amount numeric(14,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expenses_company_fkey
    foreign key (company_id) references public.companies (id) on delete restrict,
  constraint expenses_job_company_fkey
    foreign key (job_id, company_id)
    references public.jobs (id, company_id)
    on delete restrict,
  constraint expenses_category_check
    check (category in ('material', 'labor', 'transport', 'equipment', 'service', 'other')),
  constraint expenses_amount_check
    check (amount > 0)
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null,
  job_id uuid not null,
  amount numeric(14,2) not null,
  due_date date not null,
  status text not null default 'pending',
  payment_method text,
  paid_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint collections_company_fkey
    foreign key (company_id) references public.companies (id) on delete restrict,
  constraint collections_job_company_fkey
    foreign key (job_id, company_id)
    references public.jobs (id, company_id)
    on delete restrict,
  constraint collections_amount_check
    check (amount > 0),
  constraint collections_status_check
    check (status in ('pending', 'paid')),
  constraint collections_payment_method_check
    check (
      payment_method is null
      or payment_method in ('bank_transfer', 'cash', 'credit_card', 'other')
    ),
  constraint collections_payment_state_check
    check (
      (status = 'pending' and paid_at is null)
      or
      (status = 'paid' and paid_at is not null and payment_method is not null)
    )
);

-- Foreign-key, tenant-filter and common list/filter indexes.
-- Primary-key and unique-constraint indexes are not duplicated here.
create index profiles_company_id_idx
  on public.profiles (company_id);

create index customers_company_active_name_idx
  on public.customers (company_id, is_active, name);

create index quotes_company_customer_issue_date_idx
  on public.quotes (company_id, customer_id, issue_date desc);

create index quotes_company_status_issue_date_idx
  on public.quotes (company_id, status, issue_date desc);

create index quote_items_company_quote_position_idx
  on public.quote_items (company_id, quote_id, position);

create index jobs_company_customer_start_date_idx
  on public.jobs (company_id, customer_id, start_date desc);

create index jobs_company_status_target_date_idx
  on public.jobs (company_id, status, target_date);

create index expenses_company_job_expense_date_idx
  on public.expenses (company_id, job_id, expense_date desc);

create index expenses_company_category_expense_date_idx
  on public.expenses (company_id, category, expense_date desc);

create index expenses_company_expense_date_idx
  on public.expenses (company_id, expense_date desc);

create index collections_company_job_due_date_idx
  on public.collections (company_id, job_id, due_date desc);

create index collections_company_pending_due_date_idx
  on public.collections (company_id, due_date)
  where status = 'pending';

create index collections_company_paid_at_idx
  on public.collections (company_id, paid_at desc)
  where status = 'paid';

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger companies_set_updated_at
before update on public.companies
for each row execute function public.set_updated_at();

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger customers_set_updated_at
before update on public.customers
for each row execute function public.set_updated_at();

create trigger quotes_set_updated_at
before update on public.quotes
for each row execute function public.set_updated_at();

create trigger quote_items_set_updated_at
before update on public.quote_items
for each row execute function public.set_updated_at();

create trigger jobs_set_updated_at
before update on public.jobs
for each row execute function public.set_updated_at();

create trigger expenses_set_updated_at
before update on public.expenses
for each row execute function public.set_updated_at();

create trigger collections_set_updated_at
before update on public.collections
for each row execute function public.set_updated_at();
