-- Atomically provision the authenticated user's company and profile.
-- Direct client INSERT privileges on public.companies and public.profiles remain disabled.

create function public.create_company_and_profile(
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

  -- Serialize onboarding attempts for this auth user before checking the profile PK.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(v_user_id::text, 0)
  );

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
      -- The profiles PK is the final guard if another trusted path races this RPC.
      raise exception using
        errcode = 'P0001',
        message = 'Onboarding has already been completed for this user.';
  end;

  return v_company_id;
end;
$$;

revoke execute on function public.create_company_and_profile(text, text) from public;
revoke execute on function public.create_company_and_profile(text, text) from anon;
revoke execute on function public.create_company_and_profile(text, text) from authenticated;
grant execute on function public.create_company_and_profile(text, text) to authenticated;
