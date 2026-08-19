import type { Metadata } from "next";
import Link from "next/link";

import CollectionList from "@/components/collection-list";
import CollectionDataError from "@/components/collections/collection-data-error";
import { BanknotesIcon, ClockIcon, PlusIcon, ReceiptIcon } from "@/components/icons";
import StatCard from "@/components/stat-card";
import { getCollections } from "@/lib/collections/data";
import {
  calculateCollectionSummary,
  calculateOpenBalance,
  getIstanbulToday,
} from "@/lib/finance/calculations";
import { formatCurrency } from "@/lib/format";
import { getJobs } from "@/lib/jobs/data";

export const metadata: Metadata = {
  title: "Tahsilatlar | İşTakip",
  description: "Müşteri tahsilatları, bekleyen ödemeler ve gecikmiş alacaklar.",
};

export default async function TahsilatlarPage() {
  let collections;
  let jobs;
  try {
    [collections, jobs] = await Promise.all([getCollections(), getJobs()]);
  } catch {
    return (
      <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Tahsilatlar</h1>
          <p className="mt-1 text-sm text-foreground-muted">Tahsil edilen, vadesi beklenen ve gecikmiş ödemeleri ayrı olarak takip edin.</p>
        </div>
        <CollectionDataError message="Tahsilat kayıtları şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin." />
      </div>
    );
  }

  const today = getIstanbulToday();
  const summary = calculateCollectionSummary(collections, today);
  let totalJobAmount = 0;
  for (const job of jobs) {
    if (job.status !== "cancelled") totalJobAmount += job.contractAmount;
  }
  const openBalance = calculateOpenBalance(totalJobAmount, summary.collected);

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Tahsilatlar</h1>
          <p className="mt-1 text-sm text-foreground-muted">Tahsil edilen, vadesi beklenen ve gecikmiş gerçek ödemeleri takip edin.</p>
        </div>
        <Link href="/tahsilatlar/yeni" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-md bg-brand-action px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-action-hover">
          <PlusIcon className="h-4 w-4" />
          Yeni Tahsilat
        </Link>
      </div>

      <section>
        <h2 className="sr-only">Tahsilat özeti</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Tahsil Edilen" value={formatCurrency(summary.collected)} icon={BanknotesIcon} hint="Paid durumundaki kayıtlar" />
          <StatCard label="Vadesi Beklenen" value={formatCurrency(summary.duePending)} icon={ClockIcon} hint="Bugün veya ileri vadeli pending kayıtlar" />
          <StatCard label="Gecikmiş" value={formatCurrency(summary.overdue)} icon={ReceiptIcon} hint="Vadesi geçmiş pending kayıtlar" />
          <StatCard label="Toplam Açık Bakiye" value={formatCurrency(openBalance)} icon={ClockIcon} hint="İş bedeli − tahsil edilen" />
        </div>
      </section>

      <CollectionList collections={collections} today={today} />
    </div>
  );
}
