import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import AppHeader from "@/components/app-header";
import AppSidebar from "@/components/app-sidebar";
import MobileNav from "@/components/mobile-nav";
import { getCurrentAccount } from "@/lib/auth/account";

export default async function ProtectedAppLayout({ children }: { children: ReactNode }) {
  const account = await getCurrentAccount();

  if (account.status === "signed_out") redirect("/login");
  if (account.status === "needs_onboarding") redirect("/onboarding");
  if (account.status === "misconfigured") redirect("/login?error=config");
  if (account.status === "unavailable") redirect("/login?error=service");

  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader companyName={account.companyName} fullName={account.fullName} />
        <MobileNav />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
