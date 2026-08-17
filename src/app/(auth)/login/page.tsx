import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AuthMessage from "@/components/auth/auth-message";
import AuthShell from "@/components/auth/auth-shell";
import LoginForm from "@/components/auth/login-form";
import { getCurrentAccount } from "@/lib/auth/account";

export const metadata: Metadata = {
  title: "Giriş Yap | İşTakip",
  description: "İşTakip hesabınıza giriş yapın.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [account, params] = await Promise.all([getCurrentAccount(), searchParams]);

  if (account.status === "ready") redirect("/");
  if (account.status === "needs_onboarding") redirect("/onboarding");

  const configurationError = account.status === "misconfigured";
  const serviceError = account.status === "unavailable";
  const confirmationError = params.error === "confirmation";

  return (
    <AuthShell
      title="Tekrar hoş geldiniz"
      description="İşlerinizi ve finansal durumunuzu yönetmek için hesabınıza giriş yapın."
    >
      <div className="space-y-4">
        {configurationError ? (
          <AuthMessage tone="error">
            Supabase bağlantı ayarları eksik. Uygulama yöneticisiyle iletişime geçin.
          </AuthMessage>
        ) : null}
        {serviceError ? (
          <AuthMessage tone="error">
            Hesap bilgileri şu anda kontrol edilemiyor. Lütfen daha sonra tekrar deneyin.
          </AuthMessage>
        ) : null}
        {confirmationError ? (
          <AuthMessage tone="error">
            E-posta doğrulama bağlantısı geçersiz veya süresi dolmuş.
          </AuthMessage>
        ) : null}
        <LoginForm disabled={configurationError || serviceError} />
      </div>
    </AuthShell>
  );
}
