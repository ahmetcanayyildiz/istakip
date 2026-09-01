import type { Metadata } from "next";
import Link from "next/link";

import ExpenseList from "@/components/expense-list";
import ExpenseDataError from "@/components/expenses/expense-data-error";
import { DocumentIcon, PlusIcon, ReceiptIcon } from "@/components/icons";
import StatCard from "@/components/stat-card";
import { getCurrentAccount } from "@/lib/auth/account";
import { getExpenses } from "@/lib/expenses/data";
import { formatCurrency } from "@/lib/format";

export const metadata: Metadata = {
  title: "Giderler | İşTakip",
  description: "İş bazlı gerçek gider kayıtları ve aylık gider özeti.",
};

function getCurrentMonth() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
  }).formatToParts(now);
  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";

  return {
    key: `${year}-${month}`,
    label: new Intl.DateTimeFormat("tr-TR", {
      timeZone: "Europe/Istanbul",
      year: "numeric",
      month: "long",
    }).format(now),
  };
}

export default async function GiderlerPage() {
  const accountPromise = getCurrentAccount();
  let expenses;
  try {
    expenses = await getExpenses();
  } catch {
    return (
      <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Giderler</h1>
          <p className="mt-1 text-sm text-foreground-muted">İşlere ait giderleri ve kategori dağılımını tek listede takip edin.</p>
        </div>
        <ExpenseDataError message="Gider kayıtları şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin." />
      </div>
    );
  }

  const account = await accountPromise;
  const isDemo = account.status === "ready" && account.isDemo;
  const currentMonth = getCurrentMonth();
  const totalExpense = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const monthlyExpense = expenses.reduce(
    (sum, expense) => sum + (expense.date.startsWith(currentMonth.key) ? expense.amount : 0),
    0,
  );

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Giderler</h1>
          <p className="mt-1 text-sm text-foreground-muted">İşlere ait gerçek giderleri ve finansal etkilerini tek listede takip edin.</p>
        </div>
        {!isDemo ? (
          <Link href="/giderler/yeni" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-brand-action px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-action-hover">
            <PlusIcon className="h-4 w-4" />
            Yeni Gider
          </Link>
        ) : null}
      </div>

      <section>
        <h2 className="sr-only">Gider özeti</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Toplam Gider" value={formatCurrency(totalExpense)} icon={ReceiptIcon} hint="Tüm gerçek gider kayıtları" />
          <StatCard label="Bu Ayki Gider" value={formatCurrency(monthlyExpense)} icon={ReceiptIcon} hint={currentMonth.label} />
          <StatCard label="Gider Kaydı Sayısı" value={String(expenses.length)} icon={DocumentIcon} hint="Tüm kayıtlar" />
        </div>
      </section>

      <ExpenseList expenses={expenses} />
    </div>
  );
}
