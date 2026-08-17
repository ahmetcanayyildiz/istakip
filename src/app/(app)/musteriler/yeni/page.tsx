import type { Metadata } from "next";
import Link from "next/link";

import CustomerForm from "@/components/customers/customer-form";
import { ArrowLeftIcon } from "@/components/icons";
import { createCustomerAction } from "@/lib/customers/actions";

export const metadata: Metadata = {
  title: "Yeni Müşteri | İşTakip",
  description: "İşletmeniz için yeni bir müşteri kaydı oluşturun.",
};

export default function NewCustomerPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/musteriler" className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground">
        <ArrowLeftIcon className="h-4 w-4" />
        Müşteriler
      </Link>

      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Yeni Müşteri</h1>
        <p className="mt-1 text-sm text-foreground-muted">
          Müşteri iletişim bilgilerini ekleyin. Yıldızlı alanların doldurulması zorunludur.
        </p>
      </div>

      <section className="rounded-lg border border-ui-border bg-surface p-5 shadow-xs sm:p-6">
        <CustomerForm
          action={createCustomerAction}
          cancelHref="/musteriler"
          submitLabel="Müşteri Oluştur"
          pendingLabel="Müşteri oluşturuluyor"
        />
      </section>
    </div>
  );
}
