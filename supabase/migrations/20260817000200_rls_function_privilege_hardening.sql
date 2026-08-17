-- Remove unnecessary Data API execution privileges from the RLS event-trigger function.
-- The owner privilege and ensure_rls event trigger remain unchanged.

revoke execute on function public.rls_auto_enable() from public;
revoke execute on function public.rls_auto_enable() from anon;
revoke execute on function public.rls_auto_enable() from authenticated;
