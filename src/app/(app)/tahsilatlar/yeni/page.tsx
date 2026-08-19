import type { Metadata } from "next";
import Link from "next/link";

import CollectionDataError from "@/components/collections/collection-data-error";
import CollectionForm from "@/components/collections/collection-form";
import { ArrowLeftIcon } from "@/components/icons";
import { getCollectionJobOptions } from "@/lib/collections/data";
import { getIstanbulToday } from "@/lib/finance/calculations";

export const metadata: Metadata = {
  title: "Yeni Tahsilat | İşTakip",
  description: "Gerçek bir işe yeni tahsilat planı ekleyin.",
};

export default async function NewCollectionPage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string }>;
}) {
  const params = await searchParams;
  let jobs;

  try {
    jobs = await getCollectionJobOptions();
  } catch {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/tahsilatlar" className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground">
          <ArrowLeftIcon className="h-4 w-4" />
          Tahsilatlar
        </Link>
        <CollectionDataError message="İş seçenekleri şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin." />
      </div>
    );
  }

  const defaultJobId = jobs.some((job) => job.id === params.job) ? params.job : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/tahsilatlar" className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground">
        <ArrowLeftIcon className="h-4 w-4" />
        Tahsilatlar
      </Link>

      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Yeni Tahsilat</h1>
        <p className="mt-1 text-sm text-foreground-muted">Tahsilatı ilgili işe bağlayın. Yeni kayıt vadesi beklenen olarak oluşturulur.</p>
      </div>

      {jobs.length === 0 ? (
        <section className="rounded-lg border border-ui-border bg-surface px-5 py-12 text-center shadow-xs">
          <h2 className="text-sm font-semibold text-foreground">Önce bir iş oluşturmalısınız</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-foreground-muted">Tahsilat planı eklemek için onaylı bir teklifi işe dönüştürün.</p>
          <Link href="/teklifler" className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md border border-ui-border bg-surface px-4 py-2 text-sm font-semibold text-foreground-secondary transition-colors hover:bg-surface-hover hover:text-foreground">
            Tekliflere Git
          </Link>
        </section>
      ) : (
        <section className="rounded-lg border border-ui-border bg-surface p-5 shadow-xs sm:p-6">
          <CollectionForm jobs={jobs} defaultJobId={defaultJobId} defaultDueDate={getIstanbulToday()} />
        </section>
      )}
    </div>
  );
}
