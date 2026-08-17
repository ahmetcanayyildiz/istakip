import type { Metadata } from "next";

import ExpenseList from "@/components/expense-list";
import { ChartBarIcon, DocumentIcon, ReceiptIcon } from "@/components/icons";
import StatCard from "@/components/stat-card";
import { formatCurrency } from "@/lib/format";
import { EXPENSE_CATEGORIES, EXPENSES } from "@/lib/mock-expenses";
import { JOBS } from "@/lib/mock-jobs";

export const metadata: Metadata = {
  title: "Giderler | İşTakip",
  description: "İş bazlı gider kayıtları, kategoriler ve aylık gider özeti.",
};

export default function GiderlerPage() {
  const monthlyExpenses = EXPENSES.filter((expense) => expense.date.startsWith("2026-08"));
  const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  const categoryTotals = EXPENSE_CATEGORIES.map((category) => ({
    category,
    total: monthlyExpenses.reduce(
      (sum, expense) => sum + (expense.category === category ? expense.amount : 0),
      0,
    ),
  }));
  const largestCategory = categoryTotals.reduce((largest, current) =>
    current.total > largest.total ? current : largest,
  );

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Giderler</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          İşlere ait giderleri ve kategori dağılımını tek listede takip edin.
        </p>
      </div>

      <section>
        <h2 className="sr-only">Gider özeti</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatCard label="Bu Ay Toplam Gider" value={formatCurrency(monthlyTotal)} icon={ReceiptIcon} hint="Ağustos 2026" />
          <StatCard label="En Büyük Gider Kategorisi" value={largestCategory.category} icon={ChartBarIcon} hint={formatCurrency(largestCategory.total)} />
          <StatCard label="Gider Kaydı Sayısı" value={String(EXPENSES.length)} icon={DocumentIcon} hint="Tüm kayıtlar" />
        </div>
      </section>

      <ExpenseList expenses={EXPENSES} jobs={JOBS} />
    </div>
  );
}
