"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import type { AuthActionState } from "@/lib/auth/action-state";
import { createClient } from "@/lib/supabase/server";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AuthErrorLike = {
  code?: string;
  status?: number;
};

function errorState(message: string): AuthActionState {
  return { status: "error", message };
}

function logAuthError(context: string, error: AuthErrorLike) {
  console.error(context, { code: error.code, status: error.status });
}

function translateSignInError(error: AuthErrorLike) {
  if (error.code === "email_not_confirmed") {
    return "E-posta adresiniz henüz doğrulanmamış. Gelen kutunuzu kontrol edin.";
  }

  if (error.code === "invalid_credentials") {
    return "E-posta adresi veya şifre hatalı.";
  }

  return "Giriş yapılamadı. Bilgilerinizi kontrol edip tekrar deneyin.";
}

function translateSignUpError(error: AuthErrorLike) {
  if (error.code === "user_already_exists" || error.status === 422) {
    return "Bu e-posta adresiyle daha önce kayıt oluşturulmuş.";
  }

  if (error.code === "over_email_send_rate_limit") {
    return "Çok kısa sürede fazla doğrulama e-postası istendi. Lütfen biraz bekleyin.";
  }

  return "Kayıt oluşturulamadı. Lütfen daha sonra tekrar deneyin.";
}

async function getRequestOrigin() {
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");

  if (!origin) return null;

  try {
    const parsed = new URL(origin);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.origin : null;
  } catch {
    return null;
  }
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!EMAIL_PATTERN.test(email)) return errorState("Geçerli bir e-posta adresi girin.");
  if (password.length < 8) return errorState("Şifre en az 8 karakter olmalı.");

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return errorState("Supabase bağlantı ayarları eksik. Uygulama yöneticisiyle iletişime geçin.");
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    logAuthError("Password sign-in failed.", signInError);
    return errorState(translateSignInError(signInError));
  }

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || typeof userId !== "string") {
    if (claimsError) logAuthError("Post-login claims validation failed.", claimsError);
    return errorState("Oturum doğrulanamadı. Lütfen tekrar giriş yapın.");
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    logAuthError("Post-login profile lookup failed.", profileError);
    return errorState("Profil bilgisi kontrol edilemedi. Lütfen tekrar deneyin.");
  }

  revalidatePath("/", "layout");
  redirect(profile ? "/" : "/onboarding");
}

export async function registerAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const fullName = String(formData.get("fullName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const passwordConfirmation = String(formData.get("passwordConfirmation") ?? "");

  if (!fullName) return errorState("Ad soyad alanı zorunludur.");
  if (fullName.length > 160) return errorState("Ad soyad en fazla 160 karakter olabilir.");
  if (!EMAIL_PATTERN.test(email)) return errorState("Geçerli bir e-posta adresi girin.");
  if (password.length < 8) return errorState("Şifre en az 8 karakter olmalı.");
  if (password !== passwordConfirmation) return errorState("Şifreler birbiriyle eşleşmiyor.");

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return errorState("Supabase bağlantı ayarları eksik. Uygulama yöneticisiyle iletişime geçin.");
  }

  const origin = await getRequestOrigin();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Stored only as non-authoritative profile seed data; never used for access control.
      data: { full_name: fullName },
      ...(origin ? { emailRedirectTo: `${origin}/auth/confirm` } : {}),
    },
  });

  if (error) {
    logAuthError("Email sign-up failed.", error);
    return errorState(translateSignUpError(error));
  }

  if (data.user?.identities?.length === 0) {
    return errorState("Bu e-posta adresiyle daha önce kayıt oluşturulmuş.");
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/onboarding");
  }

  return {
    status: "success",
    message: "E-posta adresine gönderilen doğrulama bağlantısını kontrol et.",
  };
}

export async function onboardingAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const companyName = String(formData.get("companyName") ?? "").trim();
  const fullNameValue = String(formData.get("fullName") ?? "").trim();
  const fullName = fullNameValue || null;

  if (!companyName) return errorState("İşletme adı zorunludur.");
  if (companyName.length > 160) return errorState("İşletme adı en fazla 160 karakter olabilir.");
  if (fullName && fullName.length > 160) return errorState("Ad soyad en fazla 160 karakter olabilir.");

  let supabase;
  try {
    supabase = await createClient();
  } catch {
    return errorState("Supabase bağlantı ayarları eksik. Uygulama yöneticisiyle iletişime geçin.");
  }

  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || typeof claimsData?.claims?.sub !== "string") {
    if (claimsError) logAuthError("Onboarding claims validation failed.", claimsError);
    return errorState("Oturumunuz doğrulanamadı. Lütfen yeniden giriş yapın.");
  }

  const { error } = await supabase.rpc("create_company_and_profile", {
    p_company_name: companyName,
    p_full_name: fullName,
  });

  if (error) {
    logAuthError("Onboarding RPC failed.", error);

    if (error.code === "P0001") {
      const { data: profile } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", claimsData.claims.sub)
        .maybeSingle();

      if (profile) {
        revalidatePath("/", "layout");
        redirect("/");
      }

      return errorState("Bu kullanıcı için işletme kurulumu daha önce tamamlanmış.");
    }

    return errorState("İşletme kurulumu tamamlanamadı. Lütfen tekrar deneyin.");
  }

  revalidatePath("/", "layout");
  redirect("/");
}
