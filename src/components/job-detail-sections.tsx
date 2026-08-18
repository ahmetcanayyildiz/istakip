import Link from "next/link";

import SectionPanel from "@/components/section-panel";
import StatusBadge from "@/components/status-badge";
import { formatCurrency, formatDate } from "@/lib/format";
import type {
  JobCollectionRecord,
  JobExpenseRecord,
  JobSourceQuote,
} from "@/lib/jobs/types";
import { TD_CLASS, TH_CLASS, TR_CLASS } from "@/lib/table-styles";

function JobExpenseRecords({ expenses }: { expenses: JobExpenseRecord[] }) {
  if (expenses.length === 0) {
    return <p className="px-5 py-10 text-center text-sm text-foreground-muted">Bu iş için gider kaydı bulunmuyor.</p>;
  }

  return (
    <>
      <div className="divide-y divide-ui-border-subtle sm:hidden">
        {expenses.map((expense) => (
          <div key={expense.id} className="flex items-start justify-between gap-3 px-4 py-3.5">
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">{expense.description}</p>
              <p className="mt-0.5 text-xs text-foreground-muted tabular-nums">{formatDate(expense.date)} · {expense.category}</p>
            </div>
            <p className="shrink-0 text-sm font-medium text-foreground tabular-nums">{formatCurrency(expense.amount)}</p>
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-ui-border bg-surface-muted">
            <tr>
              <th scope="col" className={TH_CLASS}>Tarih</th>
              <th scope="col" className={TH_CLASS}>Açıklama</th>
              <th scope="col" className={TH_CLASS}>Kategori</th>
              <th scope="col" className={`${TH_CLASS} text-right`}>Tutar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ui-border-subtle">
            {expenses.map((expense) => (
              <tr key={expense.id} className={TR_CLASS}>
                <td className={`${TD_CLASS} whitespace-nowrap tabular-nums`}>{formatDate(expense.date)}</td>
                <td className={`${TD_CLASS} font-medium text-foreground`}>{expense.description}</td>
                <td className={TD_CLASS}>{expense.category}</td>
                <td className={`${TD_CLASS} text-right font-medium whitespace-nowrap text-foreground tabular-nums`}>{formatCurrency(expense.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function JobCollectionRecords({ collections }: { collections: JobCollectionRecord[] }) {
  if (collections.length === 0) {
    return <p className="px-5 py-10 text-center text-sm text-foreground-muted">Bu iş için tahsilat kaydı bulunmuyor.</p>;
  }

  return (
    <>
      <div className="divide-y divide-ui-border-subtle sm:hidden">
        {collections.map((collection) => (
          <div key={collection.id} className="px-4 py-3.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-foreground-muted tabular-nums">{formatDate(collection.displayDate)}</p>
                <p className="mt-1 text-sm text-foreground-secondary">{collection.paymentMethod}</p>
              </div>
              <p className="text-sm font-medium text-foreground tabular-nums">{formatCurrency(collection.amount)}</p>
            </div>
            <div className="mt-2"><StatusBadge status={collection.statusLabel} /></div>
          </div>
        ))}
      </div>
      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-ui-border bg-surface-muted">
            <tr>
              <th scope="col" className={TH_CLASS}>Ödeme / Vade</th>
              <th scope="col" className={TH_CLASS}>Ödeme Yöntemi</th>
              <th scope="col" className={TH_CLASS}>Durum</th>
              <th scope="col" className={`${TH_CLASS} text-right`}>Tutar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ui-border-subtle">
            {collections.map((collection) => (
              <tr key={collection.id} className={TR_CLASS}>
                <td className={`${TD_CLASS} whitespace-nowrap tabular-nums`}>{formatDate(collection.displayDate)}</td>
                <td className={TD_CLASS}>{collection.paymentMethod}</td>
                <td className={TD_CLASS}><StatusBadge status={collection.statusLabel} /></td>
                <td className={`${TD_CLASS} text-right font-medium whitespace-nowrap text-foreground tabular-nums`}>{formatCurrency(collection.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function RelatedQuote({ quote }: { quote: JobSourceQuote | null }) {
  return (
    <section className="overflow-hidden rounded-lg border border-ui-border bg-surface shadow-xs">
      <div className="border-b border-ui-border px-5 py-4">
        <h2 className="text-base font-semibold tracking-tight text-foreground">İlgili Teklif</h2>
        <p className="mt-0.5 text-xs text-foreground-muted">İşin oluşturulduğu teklif kaydı</p>
      </div>
      {quote ? (
        <div className="p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Link href={`/teklifler/${quote.id}`} className="rounded-sm text-sm font-semibold text-brand-700 hover:text-brand-800">{quote.code}</Link>
              <p className="mt-1 text-sm font-medium text-foreground">{quote.title}</p>
            </div>
            <StatusBadge status={quote.statusLabel} />
          </div>
          <dl className="mt-4 border-t border-ui-border-subtle pt-4 text-sm">
            <div><dt className="text-xs text-foreground-muted">Teklif Tarihi</dt><dd className="mt-1 text-foreground tabular-nums">{formatDate(quote.issueDate)}</dd></div>
          </dl>
        </div>
      ) : (
        <p className="px-5 py-10 text-center text-sm text-foreground-muted">Bu iş için ilişkilendirilmiş teklif bulunmuyor.</p>
      )}
    </section>
  );
}

export default function JobDetailSections({
  expenses,
  collections,
  quote,
}: {
  expenses: JobExpenseRecord[];
  collections: JobCollectionRecord[];
  quote: JobSourceQuote | null;
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <SectionPanel title="Giderler" description="Bu işe ait gider kayıtları" href="/giderler">
          <JobExpenseRecords expenses={expenses} />
        </SectionPanel>
        <SectionPanel title="Tahsilatlar" description="Bu işe ait ödeme planı ve kayıtlar" href="/tahsilatlar">
          <JobCollectionRecords collections={collections} />
        </SectionPanel>
      </div>
      <div className="max-w-2xl"><RelatedQuote quote={quote} /></div>
    </div>
  );
}
