-- İşTakip one-time demo tenant seed.
-- All names, contact details, project titles, and financial values below are fictional.
-- Run manually in the Supabase SQL Editor only after the demo migration is applied.

begin;

do $$
declare
  v_demo_user_text constant text := '28565539-7803-417b-b498-321fe97205cb';
  v_demo_user_id uuid;
  v_company_id uuid;
begin
  if v_demo_user_text = '__DEMO_USER_ID__' then
    raise exception using
      errcode = '22023',
      message = 'Replace __DEMO_USER_ID__ with the Auth user UUID before running this seed.';
  end if;

  begin
    v_demo_user_id := v_demo_user_text::uuid;
  exception
    when invalid_text_representation then
      raise exception using
        errcode = '22023',
        message = 'The demo user id must be a valid UUID.';
  end;

  if not exists (select 1 from auth.users where id = v_demo_user_id) then
    raise exception using
      errcode = 'P0002',
      message = 'Create the demo user in Supabase Auth before running this seed.';
  end if;

  if exists (select 1 from public.profiles where id = v_demo_user_id) then
    raise exception using
      errcode = '23505',
      message = 'This Auth user already has a profile. Use a dedicated demo user.';
  end if;

  insert into public.companies (name, currency_code, is_demo)
  values ('Atlas Teknik Hizmetler', 'TRY', false)
  returning id into v_company_id;

  insert into public.profiles (id, company_id, full_name)
  values (v_demo_user_id, v_company_id, 'Demo Kullanıcısı');

  insert into public.customers (
    company_id, name, contact_name, phone, email, address, city, is_active
  )
  values
    (v_company_id, 'Nova Yapı', 'Ece Demir', '+90 212 555 0101', 'ece.demir@example.com', 'Örnek Mah. 10', 'İstanbul', true),
    (v_company_id, 'Mavi Ofis', 'Can Yalın', '+90 216 555 0102', 'can.yalin@example.com', 'Tanıtım Cad. 22', 'İstanbul', true),
    (v_company_id, 'Arma Lojistik', 'Selin Akay', '+90 232 555 0103', 'selin.akay@example.com', 'Demo Sok. 7', 'İzmir', true),
    (v_company_id, 'Kent Mobilya', 'Mert Soylu', '+90 224 555 0104', 'mert.soylu@example.com', 'Numune Bulvarı 35', 'Bursa', true),
    (v_company_id, 'Delta Mimarlık', 'İpek Uslu', '+90 312 555 0105', 'ipek.uslu@example.com', 'Örnekler Cad. 18', 'Ankara', true),
    (v_company_id, 'Pera Atölye', 'Deniz Er', '+90 212 555 0106', 'deniz.er@example.com', 'Kurgu Sok. 4', 'İstanbul', true),
    (v_company_id, 'Rota Depolama', 'Bora Şen', '+90 262 555 0107', 'bora.sen@example.com', 'Senaryo Cad. 12', 'Kocaeli', true),
    (v_company_id, 'Ufuk Tasarım', 'Ada Işık', '+90 242 555 0108', 'ada.isik@example.com', 'Tanıtım Sok. 9', 'Antalya', true);

  insert into public.quotes (
    company_id, customer_id, code, title, status, issue_date, valid_until,
    discount_amount, vat_rate, notes
  )
  select
    v_company_id,
    customer.id,
    source.code,
    source.title,
    source.status,
    current_date + source.issue_offset,
    current_date + source.valid_offset,
    0,
    20,
    'Tamamen kurgusal demo kaydı.'
  from (
    values
      ('Nova Yapı',       'TKL-DEMO-001', 'Merkez Ofis Yenileme',          'pending', -150, -120),
      ('Mavi Ofis',       'TKL-DEMO-002', 'Açık Ofis Mobilya Uygulaması',   'pending', -130, -100),
      ('Arma Lojistik',   'TKL-DEMO-003', 'Sevkiyat Alanı Düzenlemesi',     'pending', -110,  -80),
      ('Kent Mobilya',    'TKL-DEMO-004', 'Showroom İç Mekân Uygulaması',   'pending',  -90,  -60),
      ('Delta Mimarlık',  'TKL-DEMO-005', 'Proje Ofisi Kurulumu',           'pending',  -70,  -40),
      ('Pera Atölye',     'TKL-DEMO-006', 'Atölye Elektrik Revizyonu',      'pending',  -50,  -20),
      ('Rota Depolama',   'TKL-DEMO-007', 'Raf Sistemi Planlaması',         'draft',     -8,   22),
      ('Ufuk Tasarım',    'TKL-DEMO-008', 'Numune Alanı Aydınlatması',      'sent',     -12,   18),
      ('Nova Yapı',       'TKL-DEMO-009', 'Toplantı Katı Akustik Projesi',  'pending',  -18,   12),
      ('Mavi Ofis',       'TKL-DEMO-010', 'Resepsiyon Bankosu Üretimi',     'rejected', -40,  -10),
      ('Delta Mimarlık',  'TKL-DEMO-011', 'Cephe Mockup Çalışması',         'sent',      -5,   25),
      ('Ufuk Tasarım',    'TKL-DEMO-012', 'Stüdyo Zemin Yenileme',          'draft',     -2,   28)
  ) as source(customer_name, code, title, status, issue_offset, valid_offset)
  join public.customers as customer
    on customer.company_id = v_company_id
   and customer.name = source.customer_name;

  insert into public.quote_items (
    company_id, quote_id, position, description, quantity, unit, unit_price
  )
  select
    v_company_id,
    quote.id,
    1,
    source.description,
    1,
    'proje',
    source.amount
  from (
    values
      ('TKL-DEMO-001', 'Anahtar teslim yenileme paketi',       180000.00),
      ('TKL-DEMO-002', 'Mobilya üretim ve montaj paketi',      145000.00),
      ('TKL-DEMO-003', 'Saha düzenleme ve işaretleme paketi',   98000.00),
      ('TKL-DEMO-004', 'Showroom uygulama paketi',             220000.00),
      ('TKL-DEMO-005', 'Ofis kurulum paketi',                   76000.00),
      ('TKL-DEMO-006', 'Elektrik revizyon paketi',             132000.00),
      ('TKL-DEMO-007', 'Raf sistemi tasarım paketi',            88000.00),
      ('TKL-DEMO-008', 'Aydınlatma uygulama paketi',            54000.00),
      ('TKL-DEMO-009', 'Akustik uygulama paketi',              118000.00),
      ('TKL-DEMO-010', 'Banko üretim paketi',                   64000.00),
      ('TKL-DEMO-011', 'Cephe mockup paketi',                   92000.00),
      ('TKL-DEMO-012', 'Zemin yenileme paketi',                 47000.00)
  ) as source(code, description, amount)
  join public.quotes as quote
    on quote.company_id = v_company_id
   and quote.code = source.code;

  -- Quote items must exist before approved quotes become immutable.
  update public.quotes
  set status = 'approved'
  where company_id = v_company_id
    and code in (
      'TKL-DEMO-001', 'TKL-DEMO-002', 'TKL-DEMO-003',
      'TKL-DEMO-004', 'TKL-DEMO-005', 'TKL-DEMO-006'
    );

  insert into public.jobs (
    company_id, customer_id, source_quote_id, code, title, status,
    start_date, target_date, contract_amount
  )
  select
    v_company_id,
    quote.customer_id,
    quote.id,
    source.job_code,
    quote.title,
    source.status,
    current_date + source.start_offset,
    current_date + source.target_offset,
    source.contract_amount
  from (
    values
      ('TKL-DEMO-001', 'IS-DEMO-001', 'completed',   -115,  -55, 180000.00),
      ('TKL-DEMO-002', 'IS-DEMO-002', 'completed',    -95,  -35, 145000.00),
      ('TKL-DEMO-003', 'IS-DEMO-003', 'in_progress',  -70,   20,  98000.00),
      ('TKL-DEMO-004', 'IS-DEMO-004', 'in_progress',  -45,   45, 220000.00),
      ('TKL-DEMO-005', 'IS-DEMO-005', 'on_hold',      -20,   35,  76000.00),
      ('TKL-DEMO-006', 'IS-DEMO-006', 'planned',       10,   70, 132000.00)
  ) as source(quote_code, job_code, status, start_offset, target_offset, contract_amount)
  join public.quotes as quote
    on quote.company_id = v_company_id
   and quote.code = source.quote_code;

  insert into public.expenses (
    company_id, job_id, expense_date, description, category, amount
  )
  select
    v_company_id,
    job.id,
    current_date + source.day_offset,
    source.description,
    source.category,
    source.amount
  from (
    values
      ('IS-DEMO-001', -110, 'Boya ve yüzey malzemeleri',    'material',  18500.00),
      ('IS-DEMO-001',  -92, 'Uygulama ekibi hizmeti',       'labor',     24000.00),
      ('IS-DEMO-001',  -75, 'Şantiye nakliyesi',            'transport',  4800.00),
      ('IS-DEMO-002',  -90, 'Panel ve bağlantı elemanları', 'material',  27800.00),
      ('IS-DEMO-002',  -62, 'Montaj hizmeti',               'service',   19500.00),
      ('IS-DEMO-003',  -65, 'Zemin işaretleme malzemesi',   'material',  11200.00),
      ('IS-DEMO-003',  -40, 'Platform kiralama',            'equipment',  7200.00),
      ('IS-DEMO-003',  -18, 'Saha işçiliği',                'labor',     15600.00),
      ('IS-DEMO-004',  -42, 'Aydınlatma armatürleri',       'material',  32600.00),
      ('IS-DEMO-004',  -27, 'Uygulama ekibi avansı',        'labor',     21000.00),
      ('IS-DEMO-004',  -10, 'Özel üretim lojistiği',        'transport',  6900.00),
      ('IS-DEMO-005',  -18, 'Ofis bölme panelleri',         'material',  13400.00),
      ('IS-DEMO-005',   -5, 'Teknik danışmanlık',           'service',    5200.00),
      ('IS-DEMO-006',    5, 'Elektrik ekipmanı ön siparişi','material',  22100.00),
      ('IS-DEMO-006',    8, 'Proje saha keşfi',             'other',      2800.00)
  ) as source(job_code, day_offset, description, category, amount)
  join public.jobs as job
    on job.company_id = v_company_id
   and job.code = source.job_code;

  insert into public.collections (
    company_id, job_id, amount, due_date, status, payment_method, paid_at
  )
  select
    v_company_id,
    job.id,
    source.amount,
    current_date + source.due_offset,
    'pending',
    null,
    null
  from (
    values
      ('IS-DEMO-001', 60000.00, -105), ('IS-DEMO-001', 60000.00, -70),
      ('IS-DEMO-002', 50000.00,  -85), ('IS-DEMO-002', 50000.00, -45),
      ('IS-DEMO-003', 40000.00,  -55), ('IS-DEMO-003', 30000.00,  10),
      ('IS-DEMO-004', 80000.00,  -30), ('IS-DEMO-004', 90000.00,  30),
      ('IS-DEMO-005', 30000.00,  -10), ('IS-DEMO-005', 30000.00,  25),
      ('IS-DEMO-006', 50000.00,   15), ('IS-DEMO-006', 50000.00,  55)
  ) as source(job_code, amount, due_offset)
  join public.jobs as job
    on job.company_id = v_company_id
   and job.code = source.job_code;

  -- Use the supported pending -> paid transition so existing collection rules run.
  update public.collections as collection
  set
    status = 'paid',
    paid_at = (collection.due_date + time '12:00') at time zone 'Europe/Istanbul',
    payment_method = case job.code
      when 'IS-DEMO-001' then 'bank_transfer'
      when 'IS-DEMO-002' then 'credit_card'
      when 'IS-DEMO-003' then 'cash'
      when 'IS-DEMO-004' then 'bank_transfer'
      when 'IS-DEMO-005' then 'other'
      else 'bank_transfer'
    end
  from public.jobs as job
  where collection.job_id = job.id
    and job.company_id = v_company_id
    and collection.due_date = (
      select min(candidate.due_date)
      from public.collections as candidate
      where candidate.job_id = job.id
        and candidate.company_id = v_company_id
    );

  if (select count(*) from public.customers where company_id = v_company_id) <> 8
    or (select count(*) from public.quotes where company_id = v_company_id) <> 12
    or (select count(*) from public.jobs where company_id = v_company_id) <> 6
    or (select count(*) from public.expenses where company_id = v_company_id) <> 15
    or (select count(*) from public.collections where company_id = v_company_id) <> 12
  then
    raise exception using
      errcode = 'P0001',
      message = 'Demo seed count validation failed; the transaction was rolled back.';
  end if;

  if exists (
    select 1
    from public.jobs as job
    join public.collections as collection
      on collection.job_id = job.id
     and collection.company_id = job.company_id
    where job.company_id = v_company_id
    group by job.id, job.contract_amount
    having sum(collection.amount) > job.contract_amount
  ) then
    raise exception using
      errcode = '23514',
      message = 'Demo collection totals exceed a contract amount; the transaction was rolled back.';
  end if;

  -- Mark the tenant read-only only after all one-time setup writes are complete.
  update public.companies
  set is_demo = true
  where id = v_company_id;
end;
$$;

commit;
