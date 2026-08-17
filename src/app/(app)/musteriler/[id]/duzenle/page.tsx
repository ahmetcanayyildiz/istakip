import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import CustomerDataError from "@/components/customers/customer-data-error";
import CustomerForm from "@/components/customers/customer-form";
import { ArrowLeftIcon } from "@/components/icons";
import { updateCustomerAction } from "@/lib/customers/actions";
import { getCustomerById } from "@/lib/customers/data";

export const metadata: Metadata = {
  title: "Müşteri Düzenle | İşTakip",
  description: "Müşteri iletişim ve durum bilgilerini güncelleyin.",
};

export default async function EditCustomerPage({ params }: PageProps<"/musteriler/[id]/duzenle">) {
  const { id } = await params;
  let customer;

  try {
    customer = await getCustomerById(id);
  } catch {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/musteriler" className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground">
          <ArrowLeftIcon className="h-4 w-4" />
          Müşteriler
        </Link>
        <CustomerDataError message="Müşteri bilgileri şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin." />
      </div>
    );
  }

  if (!customer) notFound();

  const action = updateCustomerAction.bind(null, customer.id);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href={`/musteriler/${customer.id}`} className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground">
        <ArrowLeftIcon className="h-4 w-4" />
        Müşteri detayına dön
      </Link>

      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Müşteriyi Düzenle</h1>
        <p className="mt-1 text-sm text-foreground-muted">{customer.name} kaydının iletişim ve durum bilgilerini güncelleyin.</p>
      </div>

      <section className="rounded-lg border border-ui-border bg-surface p-5 shadow-xs sm:p-6">
        <CustomerForm
          action={action}
          cancelHref={`/musteriler/${customer.id}`}
          initialValues={customer}
          submitLabel="Değişiklikleri Kaydet"
          pendingLabel="Değişiklikler kaydediliyor"
        />
      </section>
    </div>
  );
}
