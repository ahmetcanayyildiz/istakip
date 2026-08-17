import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AuthMessage from "@/components/auth/auth-message";
import RegisterForm from "@/components/auth/register-form";
import AuthShell from "@/components/auth/auth-shell";
import { getCurrentAccount } from "@/lib/auth/account";

export const metadata: Metadata = {
  title: "Kayıt Ol | İşTakip",
  description: "Yeni İşTakip hesabınızı oluşturun.",
};

export default async function RegisterPage() {
  const account = await getCurrentAccount();

  if (account.status === "ready") redirect("/");
  if (account.status === "needs_onboarding") redirect("/onboarding");

  const configurationError = account.status === "misconfigured";
  const serviceError = account.status === "unavailable";

  return (
    <AuthShell
      title="Hesabınızı oluşturun"
      description="İşletmenizin günlük iş ve finans takibini tek bir yerde yönetin."
    >
      <div className="space-y-4">
        {configurationError ? (
          <AuthMessage tone="error">
            Supabase bağlantı ayarları eksik. Uygulama yöneticisiyle iletişime geçin.
          </AuthMessage>
        ) : null}
        {serviceError ? (
          <AuthMessage tone="error">
            Kayıt servisine şu anda ulaşılamıyor. Lütfen daha sonra tekrar deneyin.
          </AuthMessage>
        ) : null}
        <RegisterForm disabled={configurationError || serviceError} />
      </div>
    </AuthShell>
  );
}
