import type { Metadata } from "next";

import CustomerList from "@/components/customer-list";
import { PlusIcon } from "@/components/icons";
import { CUSTOMERS } from "@/lib/mock-customers";
import { getCustomerFinancials } from "@/lib/mock-finance";

export const metadata: Metadata = {
  title: "Müşteriler | İşTakip",
  description: "Müşteri kayıtları, iletişim bilgileri ve müşteri bazlı iş özeti.",
};

export default function MusterilerPage() {
  const activeCount = CUSTOMERS.filter((customer) => customer.status === "Aktif").length;
  const customers = CUSTOMERS.map((customer) => ({
    ...customer,
    ...getCustomerFinancials(customer.id),
  }));

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-900">Müşteriler</h1>
          <p className="mt-1 text-sm text-slate-500">
            Toplam <span className="font-medium text-slate-700 tabular-nums">{CUSTOMERS.length}</span>{" "}
            müşteri kayıtlı, <span className="font-medium text-slate-700 tabular-nums">{activeCount}</span>{" "}
            tanesi aktif. Finansal değerler mevcut iş ve tahsilat kayıtlarından hesaplanır.
          </p>
        </div>

        <div className="flex flex-col gap-1 sm:items-end">
          <button
            type="button"
            disabled
            aria-describedby="yeni-musteri-notu"
            className="inline-flex cursor-not-allowed items-center gap-1.5 self-start rounded-md border border-slate-200 bg-slate-100 px-3 py-1.5 text-sm font-medium text-slate-400"
          >
            <PlusIcon className="h-4 w-4" />
            Yeni Müşteri
          </button>
          <p id="yeni-musteri-notu" className="text-xs text-slate-500">
            Kayıt ekleme sonraki aşamada eklenecek.
          </p>
        </div>
      </div>

      <CustomerList customers={customers} />
    </div>
  );
}
