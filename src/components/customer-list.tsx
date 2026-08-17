"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ChevronRightIcon, PlusIcon, SearchIcon } from "@/components/icons";
import StatusBadge from "@/components/status-badge";
import type { CustomerListItem, CustomerStatus } from "@/lib/customers/types";
import { formatDate, normalizeText } from "@/lib/format";
import { TD_CLASS, TH_CLASS, TR_CLASS } from "@/lib/table-styles";

type StatusFilter = "Tümü" | CustomerStatus;

const STATUS_FILTERS: StatusFilter[] = ["Tümü", "Aktif", "Pasif"];
const displayValue = (value: string | null) => value || "—";
const customerDate = (value: string) => formatDate(value.slice(0, 10));

function CustomerEmptyState() {
  return (
    <section className="rounded-lg border border-ui-border bg-surface px-6 py-16 text-center shadow-xs">
      <span
        aria-hidden
        className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-700"
      >
        <PlusIcon className="h-5 w-5" />
      </span>
      <h2 className="mt-3 text-sm font-semibold text-foreground">Henüz müşteri kaydı yok</h2>
      <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-foreground-muted">
        İlk müşteri kaydınızı oluşturarak teklif ve iş akışınızı başlatabilirsiniz.
      </p>
      <Link
        href="/musteriler/yeni"
        className="mt-5 inline-flex min-h-10 items-center justify-center gap-1.5 rounded-md bg-brand-action px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-action-hover"
      >
        <PlusIcon className="h-4 w-4" />
        Yeni Müşteri
      </Link>
    </section>
  );
}

export default function CustomerList({ customers }: { customers: CustomerListItem[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("Tümü");

  const counts = useMemo(
    () => ({
      Tümü: customers.length,
      Aktif: customers.filter((customer) => customer.isActive).length,
      Pasif: customers.filter((customer) => !customer.isActive).length,
    }),
    [customers],
  );

  const filtered = useMemo(() => {
    const term = normalizeText(query);

    return customers.filter((customer) => {
      if (status !== "Tümü" && customer.status !== status) return false;
      if (!term) return true;

      return [customer.name, customer.contactName, customer.phone, customer.email].some((field) =>
        normalizeText(field ?? "").includes(term),
      );
    });
  }, [customers, query, status]);

  const isFiltered = query.trim() !== "" || status !== "Tümü";
  const resetFilters = () => {
    setQuery("");
    setStatus("Tümü");
  };

  if (customers.length === 0) return <CustomerEmptyState />;

  return (
    <section className="overflow-hidden rounded-lg border border-ui-border bg-surface shadow-xs">
      <div className="flex flex-col gap-3 border-b border-ui-border px-4 py-4 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <label htmlFor="musteri-arama" className="sr-only">Müşteri ara</label>
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-foreground-subtle" />
          <input
            id="musteri-arama"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Firma, yetkili, telefon veya e-posta ara"
            className="w-full rounded-md border border-ui-border bg-surface py-2 pr-3 pl-9 text-sm text-foreground placeholder:text-foreground-subtle"
          />
        </div>

        <div role="group" aria-label="Durum filtresi" className="flex w-max items-center gap-1 rounded-md border border-ui-border p-0.5">
          {STATUS_FILTERS.map((item) => {
            const isSelected = status === item;
            return (
              <button
                key={item}
                type="button"
                aria-pressed={isSelected}
                onClick={() => setStatus(item)}
                className={`rounded-sm px-3 py-1.5 text-sm font-medium transition-colors ${
                  isSelected
                    ? "bg-brand-50 text-brand-800"
                    : "text-foreground-secondary hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                {item}
                <span className="ml-1.5 text-xs text-foreground-muted tabular-nums">{counts[item]}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p aria-live="polite" className="sr-only">{filtered.length} müşteri listeleniyor.</p>

      {filtered.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <span aria-hidden className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-surface-strong text-foreground-subtle">
            <SearchIcon className="h-5 w-5" />
          </span>
          <h3 className="mt-3 text-sm font-semibold text-foreground">Müşteri bulunamadı</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-foreground-muted">
            Arama veya durum filtresine uyan kayıt yok. Farklı bir arama deneyin ya da filtreleri temizleyin.
          </p>
          <button type="button" onClick={resetFilters} className="mt-4 inline-flex items-center rounded-md border border-ui-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground-secondary shadow-xs transition-colors hover:bg-surface-hover">
            Filtreleri temizle
          </button>
        </div>
      ) : (
        <>
          <div className="divide-y divide-ui-border-subtle md:hidden">
            {filtered.map((customer) => (
              <Link key={customer.id} href={`/musteriler/${customer.id}`} className="block px-4 py-4 transition-colors hover:bg-surface-hover">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold text-foreground">{customer.name}</h3>
                    <p className="mt-0.5 truncate text-sm text-foreground-muted">{displayValue(customer.contactName)}</p>
                  </div>
                  <ChevronRightIcon className="mt-1 h-4 w-4 shrink-0 text-foreground-faint" />
                </div>
                <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                  <div><dt className="text-xs text-foreground-muted">Telefon</dt><dd className="mt-0.5 text-foreground-secondary">{displayValue(customer.phone)}</dd></div>
                  <div><dt className="text-xs text-foreground-muted">Şehir</dt><dd className="mt-0.5 text-foreground-secondary">{displayValue(customer.city)}</dd></div>
                  <div><dt className="text-xs text-foreground-muted">Durum</dt><dd className="mt-1"><StatusBadge status={customer.status} /></dd></div>
                  <div><dt className="text-xs text-foreground-muted">Oluşturulma</dt><dd className="mt-0.5 text-foreground-secondary tabular-nums">{customerDate(customer.createdAt)}</dd></div>
                </dl>
              </Link>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[72rem] border-collapse text-left">
              <thead className="border-b border-ui-border bg-surface-muted">
                <tr>
                  <th scope="col" className={TH_CLASS}>Müşteri / Firma</th>
                  <th scope="col" className={TH_CLASS}>Yetkili</th>
                  <th scope="col" className={TH_CLASS}>Telefon</th>
                  <th scope="col" className={TH_CLASS}>E-posta</th>
                  <th scope="col" className={TH_CLASS}>Şehir</th>
                  <th scope="col" className={TH_CLASS}>Durum</th>
                  <th scope="col" className={TH_CLASS}>Oluşturulma</th>
                  <th scope="col" className="w-10"><span className="sr-only">Detay</span></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-ui-border-subtle">
                {filtered.map((customer) => (
                  <tr key={customer.id} onClick={() => router.push(`/musteriler/${customer.id}`)} className={`${TR_CLASS} cursor-pointer`}>
                    <td className={TD_CLASS}>
                      <Link href={`/musteriler/${customer.id}`} className="rounded-sm font-medium text-foreground hover:text-brand-700">{customer.name}</Link>
                    </td>
                    <td className={TD_CLASS}>{displayValue(customer.contactName)}</td>
                    <td className={TD_CLASS}>{displayValue(customer.phone)}</td>
                    <td className={TD_CLASS}>{displayValue(customer.email)}</td>
                    <td className={TD_CLASS}>{displayValue(customer.city)}</td>
                    <td className={TD_CLASS}><StatusBadge status={customer.status} /></td>
                    <td className={`${TD_CLASS} whitespace-nowrap tabular-nums`}>{customerDate(customer.createdAt)}</td>
                    <td className={`${TD_CLASS} text-right`}><ChevronRightIcon className="ml-auto h-4 w-4 text-foreground-faint" /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {filtered.length > 0 ? (
        <div className="flex items-center justify-between border-t border-ui-border px-4 py-3 text-xs text-foreground-muted sm:px-5">
          <span className="tabular-nums">{filtered.length} / {customers.length} müşteri gösteriliyor</span>
          {isFiltered ? <button type="button" onClick={resetFilters} className="rounded-sm font-medium text-brand-700 transition-colors hover:text-brand-800">Filtreleri temizle</button> : null}
        </div>
      ) : null}
    </section>
  );
}
