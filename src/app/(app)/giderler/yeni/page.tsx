import type { Metadata } from "next";
import Link from "next/link";

import ExpenseDataError from "@/components/expenses/expense-data-error";
import ExpenseForm from "@/components/expenses/expense-form";
import { ArrowLeftIcon } from "@/components/icons";
import { getExpenseJobOptions } from "@/lib/expenses/data";
import { redirectDemoMutationRoute } from "@/lib/demo/access";

export const metadata: Metadata = {
  title: "Yeni Gider | İşTakip",
  description: "Gerçek bir işe yeni gider kaydı ekleyin.",
};

function getIstanbulDate() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Istanbul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";

  return `${value("year")}-${value("month")}-${value("day")}`;
}

export default async function NewExpensePage({
  searchParams,
}: {
  searchParams: Promise<{ job?: string }>;
}) {
  await redirectDemoMutationRoute("/giderler");
  const params = await searchParams;
  let jobs;

  try {
    jobs = await getExpenseJobOptions();
  } catch {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Link href="/giderler" className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground">
          <ArrowLeftIcon className="h-4 w-4" />
          Giderler
        </Link>
        <ExpenseDataError message="İş seçenekleri şu anda yüklenemiyor. Lütfen daha sonra tekrar deneyin." />
      </div>
    );
  }

  const defaultJobId = jobs.some((job) => job.id === params.job) ? params.job : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/giderler" className="inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-foreground-secondary transition-colors hover:text-foreground">
        <ArrowLeftIcon className="h-4 w-4" />
        Giderler
      </Link>

      <div>
        <h1 className="text-xl font-semibold tracking-tight text-foreground">Yeni Gider</h1>
        <p className="mt-1 text-sm text-foreground-muted">Gideri ilgili işe bağlayın. Yıldızlı alanların doldurulması zorunludur.</p>
      </div>

      {jobs.length === 0 ? (
        <section className="rounded-lg border border-ui-border bg-surface px-5 py-12 text-center shadow-xs">
          <h2 className="text-sm font-semibold text-foreground">Önce bir iş oluşturmalısınız</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-foreground-muted">Gider kaydı eklemek için onaylı bir teklifi işe dönüştürün.</p>
          <Link href="/teklifler" className="mt-4 inline-flex min-h-10 items-center justify-center rounded-md border border-ui-border bg-surface px-4 py-2 text-sm font-semibold text-foreground-secondary transition-colors hover:bg-surface-hover hover:text-foreground">
            Tekliflere Git
          </Link>
        </section>
      ) : (
        <section className="rounded-lg border border-ui-border bg-surface p-5 shadow-xs sm:p-6">
          <ExpenseForm jobs={jobs} defaultJobId={defaultJobId} defaultDate={getIstanbulDate()} />
        </section>
      )}
    </div>
  );
}
