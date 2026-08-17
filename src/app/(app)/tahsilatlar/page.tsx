import type { Metadata } from "next";

import CollectionList from "@/components/collection-list";
import { BanknotesIcon, ClockIcon, ReceiptIcon } from "@/components/icons";
import StatCard from "@/components/stat-card";
import { formatCurrency } from "@/lib/format";
import { COLLECTIONS } from "@/lib/mock-collections";
import { getCollectionFinancials, getDashboardFinancials } from "@/lib/mock-finance";
import { JOBS } from "@/lib/mock-jobs";

export const metadata: Metadata = {
  title: "Tahsilatlar | İşTakip",
  description: "Müşteri tahsilatları, bekleyen ödemeler ve gecikmiş alacaklar.",
};

export default function TahsilatlarPage() {
  const collections = getCollectionFinancials();
  const dashboard = getDashboardFinancials();

  return (
    <div className="mx-auto w-full min-w-0 max-w-7xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Tahsilatlar</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Tahsil edilen, vadesi beklenen ve gecikmiş ödemeleri ayrı olarak takip edin.
        </p>
      </div>

      <section>
        <h2 className="sr-only">Tahsilat özeti</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label="Toplam Tahsil Edilen" value={formatCurrency(collections.collected)} icon={BanknotesIcon} hint="Tahsil Edildi kayıtları" />
          <StatCard label="Vadesi Beklenen" value={formatCurrency(collections.duePending)} icon={ClockIcon} hint="Bekliyor kayıtları" />
          <StatCard label="Gecikmiş" value={formatCurrency(collections.overdue)} icon={ReceiptIcon} hint="Gecikmiş kayıtlar" />
          <StatCard label="Toplam Açık Bakiye" value={formatCurrency(dashboard.totalOpenBalance)} icon={ClockIcon} hint="İş bedeli − tahsil edilen" />
        </div>
      </section>

      <CollectionList collections={COLLECTIONS} jobs={JOBS} />
    </div>
  );
}
