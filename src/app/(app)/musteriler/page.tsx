import type { Metadata } from "next";
import Link from "next/link";

import CustomerList from "@/components/customer-list";
import CustomerDataError from "@/components/customers/customer-data-error";
import { PlusIcon } from "@/components/icons";
import { getCurrentAccount } from "@/lib/auth/account";
import { getCustomers } from "@/lib/customers/data";

export const metadata: Metadata = {
  title: "Müşteriler | İşTakip",
  description: "Gerçek işletme müşteri kayıtlarını yönetin.",
};

export default async function MusterilerPage() {
  const accountPromise = getCurrentAccount();
  let customers;

  try {
    customers = await getCustomers();
  } catch {
    return (
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Müşteriler</h1>
          <p className="mt-1 text-sm text-foreground-muted">İşletmenize ait müşteri kayıtları.</p>
        </div>
        <CustomerDataError message="Müşteri kayıtları şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin." />
      </div>
    );
  }

  const account = await accountPromise;
  const isDemo = account.status === "ready" && account.isDemo;
  const activeCount = customers.filter((customer) => customer.isActive).length;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Müşteriler</h1>
          <p className="mt-1 text-sm text-foreground-muted">
            Toplam <span className="font-medium text-foreground-secondary tabular-nums">{customers.length}</span>{" "}
            müşteri kayıtlı, <span className="font-medium text-foreground-secondary tabular-nums">{activeCount}</span>{" "}
            tanesi aktif.
          </p>
        </div>

        {!isDemo ? (
          <Link
            href="/musteriler/yeni"
            className="inline-flex min-h-10 items-center justify-center gap-1.5 self-start rounded-md bg-brand-action px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-action-hover"
          >
            <PlusIcon className="h-4 w-4" />
            Yeni Müşteri
          </Link>
        ) : null}
      </div>

      <CustomerList customers={customers} isDemo={isDemo} />
    </div>
  );
}
