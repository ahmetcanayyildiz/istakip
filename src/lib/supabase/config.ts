export const SUPABASE_CONFIG_MESSAGE =
  "Supabase bağlantı ayarları eksik. Uygulama yöneticisiyle iletişime geçin.";

export class SupabaseConfigError extends Error {
  constructor() {
    super(SUPABASE_CONFIG_MESSAGE);
    this.name = "SupabaseConfigError";
  }
}

export function hasSupabaseConfig() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );
}

export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !publishableKey) throw new SupabaseConfigError();

  return { url, publishableKey };
}
