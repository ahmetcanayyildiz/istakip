"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import AuthMessage from "@/components/auth/auth-message";
import { PlusIcon } from "@/components/icons";
import { formatCurrency } from "@/lib/format";
import { calculateLineTotalCents, calculateQuoteTotals, centsToAmount } from "@/lib/quotes/calculations";
import {
  INITIAL_QUOTE_ACTION_STATE,
  QUOTE_FIELD_LIMITS,
  QUOTE_STATUS_OPTIONS,
  type QuoteActionState,
  type QuoteCustomerOption,
  type QuoteFormInitialValues,
} from "@/lib/quotes/types";

type FormLineItem = QuoteFormInitialValues["items"][number] & { key: number };

type QuoteFormAction = (
  state: QuoteActionState,
  formData: FormData,
) => Promise<QuoteActionState>;

type QuoteFormProps = {
  action: QuoteFormAction;
  cancelHref: string;
  customers: QuoteCustomerOption[];
  initialValues: QuoteFormInitialValues;
  mode: "create" | "edit";
  quoteCode?: string;
};

const FIELD_CLASS = "mt-1.5 w-full rounded-md border border-ui-border bg-surface px-3 py-2 text-sm text-foreground placeholder:text-foreground-subtle";
const LABEL_CLASS = "text-sm font-medium text-foreground-secondary";

export default function QuoteForm({
  action,
  cancelHref,
  customers,
  initialValues,
  mode,
  quoteCode,
}: QuoteFormProps) {
  const [state, formAction, isPending] = useActionState(action, INITIAL_QUOTE_ACTION_STATE);
  const [issueDate, setIssueDate] = useState(initialValues.issueDate);
  const [discountAmount, setDiscountAmount] = useState(initialValues.discountAmount);
  const [vatRate, setVatRate] = useState(initialValues.vatRate);
  const [items, setItems] = useState<FormLineItem[]>(() =>
    initialValues.items.map((item, index) => ({ ...item, key: index + 1 })),
  );
  const [nextItemKey, setNextItemKey] = useState(initialValues.items.length + 1);

  const totals = useMemo(
    () => calculateQuoteTotals({ items, discountAmount, vatRate }),
    [discountAmount, items, vatRate],
  );
  const itemPayload = items.map(({ description, quantity, unit, unitPrice }) => ({
    description,
    quantity,
    unit,
    unit_price: unitPrice,
  }));

  const addItem = () => {
    setItems((current) => [
      ...current,
      { key: nextItemKey, description: "", quantity: "1", unit: "adet", unitPrice: "0" },
    ]);
    setNextItemKey((current) => current + 1);
  };

  const removeItem = (key: number) => {
    setItems((current) => current.length > 1 ? current.filter((item) => item.key !== key) : current);
  };

  const updateItem = (key: number, field: keyof Omit<FormLineItem, "key">, value: string) => {
    setItems((current) => current.map((item) => item.key === key ? { ...item, [field]: value } : item));
  };

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="items" value={JSON.stringify(itemPayload)} />

      <fieldset disabled={isPending} className="space-y-6 disabled:opacity-75">
        <section aria-labelledby="quote-information-title" className="rounded-lg border border-ui-border bg-surface p-5 shadow-xs sm:p-6">
        <div className="border-b border-ui-border-subtle pb-4">
          <h2 id="quote-information-title" className="text-base font-semibold tracking-tight text-foreground">Teklif Bilgileri</h2>
          <p className="mt-1 text-xs leading-5 text-foreground-muted">Teklif numarası istemcide üretilmez; güvenli database mekanizması tarafından atanacaktır.</p>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
          <label className={LABEL_CLASS}>
            Teklif No
            <input value={quoteCode ?? "Otomatik oluşturulacak"} disabled className={`${FIELD_CLASS} cursor-not-allowed bg-surface-muted text-foreground-muted`} />
          </label>

          <label className={LABEL_CLASS}>
            Müşteri <span aria-hidden className="text-danger">*</span>
            <select name="customerId" defaultValue={initialValues.customerId} required className={FIELD_CLASS}>
              <option value="" disabled>Müşteri seçin</option>
              {customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name}{customer.isActive ? "" : " (Pasif)"}</option>)}
            </select>
            <span className="mt-1 block text-xs font-normal text-foreground-muted">Yeni tekliflerde yalnız aktif müşteriler listelenir.</span>
          </label>

          <label className={`${LABEL_CLASS} sm:col-span-2`}>
            Teklif Başlığı <span aria-hidden className="text-danger">*</span>
            <input name="title" type="text" defaultValue={initialValues.title} required maxLength={QUOTE_FIELD_LIMITS.title} placeholder="Örn. Ofis aydınlatma yenilemesi" className={FIELD_CLASS} />
          </label>

          <label className={LABEL_CLASS}>
            Teklif Tarihi <span aria-hidden className="text-danger">*</span>
            <input name="issueDate" type="date" value={issueDate} onChange={(event) => setIssueDate(event.target.value)} required className={FIELD_CLASS} />
          </label>

          <label className={LABEL_CLASS}>
            Geçerlilik Tarihi <span aria-hidden className="text-danger">*</span>
            <input name="validUntil" type="date" defaultValue={initialValues.validUntil} min={issueDate} required className={FIELD_CLASS} />
          </label>

          <label className={LABEL_CLASS}>
            Durum <span aria-hidden className="text-danger">*</span>
            <select name="status" defaultValue={initialValues.status} required className={FIELD_CLASS}>
              {QUOTE_STATUS_OPTIONS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}
            </select>
          </label>

          <label className={LABEL_CLASS}>
            İndirim Tutarı
            <input name="discountAmount" type="number" min="0" max="999999999999.99" step="0.01" inputMode="decimal" value={discountAmount} onChange={(event) => setDiscountAmount(event.target.value)} required className={FIELD_CLASS} />
          </label>

          <label className={LABEL_CLASS}>
            KDV Oranı (%) <span aria-hidden className="text-danger">*</span>
            <input name="vatRate" type="number" min="0" max="100" step="0.01" inputMode="decimal" value={vatRate} onChange={(event) => setVatRate(event.target.value)} required className={FIELD_CLASS} />
            <span className="mt-1 block text-xs font-normal text-foreground-muted">Mevcut schema KDV oranını kalem değil, teklif seviyesinde tutar.</span>
          </label>

          <label className={`${LABEL_CLASS} sm:col-span-2`}>
            Not
            <textarea name="notes" defaultValue={initialValues.notes} maxLength={QUOTE_FIELD_LIMITS.notes} rows={4} placeholder="Teslim, ödeme veya kapsam notları" className={`${FIELD_CLASS} resize-y`} />
          </label>
        </div>
        </section>

        <section aria-labelledby="quote-items-title" className="overflow-hidden rounded-lg border border-ui-border bg-surface shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ui-border px-5 py-4">
          <div>
            <h2 id="quote-items-title" className="text-base font-semibold tracking-tight text-foreground">Teklif Kalemleri</h2>
            <p className="mt-0.5 text-xs text-foreground-muted">Her teklifte en az bir kalem bulunmalıdır.</p>
          </div>
          <button type="button" onClick={addItem} className="inline-flex min-h-9 items-center justify-center gap-1.5 rounded-md border border-ui-border bg-surface px-3 py-1.5 text-sm font-semibold text-foreground-secondary shadow-xs transition-colors hover:bg-surface-hover hover:text-foreground">
            <PlusIcon className="h-4 w-4" /> Kalem Ekle
          </button>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          {items.map((item, index) => (
            <fieldset key={item.key} className="rounded-lg border border-ui-border-subtle bg-surface-muted/50 p-4">
              <legend className="px-1 text-xs font-semibold tracking-wide text-foreground-muted uppercase">Kalem {index + 1}</legend>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(14rem,2fr)_minmax(7rem,0.7fr)_minmax(7rem,0.7fr)_minmax(9rem,1fr)_auto] lg:items-end">
                <label className={LABEL_CLASS}>Açıklama <span aria-hidden className="text-danger">*</span><input type="text" value={item.description} onChange={(event) => updateItem(item.key, "description", event.target.value)} required maxLength={QUOTE_FIELD_LIMITS.itemDescription} className={FIELD_CLASS} /></label>
                <label className={LABEL_CLASS}>Miktar <span aria-hidden className="text-danger">*</span><input type="number" min="0.001" max="99999999999.999" step="0.001" inputMode="decimal" value={item.quantity} onChange={(event) => updateItem(item.key, "quantity", event.target.value)} required className={FIELD_CLASS} /></label>
                <label className={LABEL_CLASS}>Birim <span aria-hidden className="text-danger">*</span><input type="text" value={item.unit} onChange={(event) => updateItem(item.key, "unit", event.target.value)} required maxLength={QUOTE_FIELD_LIMITS.itemUnit} className={FIELD_CLASS} /></label>
                <label className={LABEL_CLASS}>Birim Fiyat <span aria-hidden className="text-danger">*</span><input type="number" min="0" max="999999999999.99" step="0.01" inputMode="decimal" value={item.unitPrice} onChange={(event) => updateItem(item.key, "unitPrice", event.target.value)} required className={FIELD_CLASS} /></label>
                <button type="button" onClick={() => removeItem(item.key)} disabled={items.length === 1} className="min-h-10 rounded-md border border-ui-border bg-surface px-3 text-sm font-medium text-danger transition-colors hover:bg-danger-soft disabled:cursor-not-allowed disabled:text-foreground-faint disabled:hover:bg-surface" aria-label={`${index + 1}. kalemi kaldır`}>Kaldır</button>
              </div>
              <p className="mt-3 text-right text-xs text-foreground-muted">Kalem toplamı: <span className="font-semibold text-foreground tabular-nums">{formatCurrency(centsToAmount(calculateLineTotalCents(item.quantity, item.unitPrice)))}</span></p>
            </fieldset>
          ))}
        </div>

        <div className="flex justify-end border-t border-ui-border bg-surface-muted/60 px-4 py-5 sm:px-5">
          <dl className="w-full max-w-sm space-y-3 text-sm">
            <div className="flex justify-between gap-6"><dt className="text-foreground-muted">Ara toplam</dt><dd className="font-medium text-foreground tabular-nums">{formatCurrency(centsToAmount(totals.subtotalCents))}</dd></div>
            <div className="flex justify-between gap-6"><dt className="text-foreground-muted">İndirim</dt><dd className="font-medium text-success tabular-nums">−{formatCurrency(centsToAmount(totals.discountCents))}</dd></div>
            <div className="flex justify-between gap-6"><dt className="text-foreground-muted">KDV (%{vatRate || "0"})</dt><dd className="font-medium text-foreground tabular-nums">{formatCurrency(centsToAmount(totals.vatCents))}</dd></div>
            <div className="flex justify-between gap-6 border-t border-ui-border pt-3"><dt className="font-semibold text-foreground">Genel toplam</dt><dd className="text-lg font-semibold tracking-tight text-foreground tabular-nums">{formatCurrency(centsToAmount(totals.grandTotalCents))}</dd></div>
          </dl>
        </div>
        </section>
      </fieldset>

      {state.message ? <AuthMessage tone="error">{state.message}</AuthMessage> : null}

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={cancelHref} className="inline-flex min-h-10 items-center justify-center rounded-md border border-ui-border bg-surface px-4 py-2 text-sm font-semibold text-foreground-secondary shadow-xs transition-colors hover:bg-surface-hover hover:text-foreground">Vazgeç</Link>
        <button type="submit" disabled={isPending} className="inline-flex min-h-10 items-center justify-center rounded-md bg-brand-action px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-action-hover disabled:cursor-wait disabled:bg-control-disabled">
          {isPending
            ? mode === "create" ? "Teklif oluşturuluyor..." : "Değişiklikler kaydediliyor..."
            : mode === "create" ? "Teklif Oluştur" : "Değişiklikleri Kaydet"}
        </button>
      </div>
    </form>
  );
}
