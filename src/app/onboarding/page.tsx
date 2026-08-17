import type { Metadata } from "next";
import { redirect } from "next/navigation";

import AuthMessage from "@/components/auth/auth-message";
import OnboardingForm from "@/components/auth/onboarding-form";
import AuthShell from "@/components/auth/auth-shell";
import LogoutButton from "@/components/logout-button";
import { getCurrentAccount } from "@/lib/auth/account";

export const metadata: Metadata = {
  title: "İşletme Kurulumu | İşTakip",
  description: "İşTakip işletme profilinizi oluşturun.",
};

export default async function OnboardingPage() {
  const account = await getCurrentAccount();

  if (account.status === "signed_out") redirect("/login");
  if (account.status === "ready") redirect("/");

  const configurationError = account.status === "misconfigured";
  const serviceError = account.status === "unavailable";

  return (
    <AuthShell
      title="İşletmenizi hazırlayın"
      description="İşTakip'i kullanmaya başlamak için işletme bilgilerinizi tamamlayın."
      accessory={<LogoutButton />}
    >
      <div className="space-y-4">
        {configurationError ? (
          <AuthMessage tone="error">
            Supabase bağlantı ayarları eksik. Uygulama yöneticisiyle iletişime geçin.
          </AuthMessage>
        ) : null}
        {serviceError ? (
          <AuthMessage tone="error">
            Profil durumu şu anda kontrol edilemiyor. Lütfen daha sonra tekrar deneyin.
          </AuthMessage>
        ) : null}
        <OnboardingForm disabled={configurationError || serviceError} />
      </div>
    </AuthShell>
  );
}
