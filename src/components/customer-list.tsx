"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { ChevronRightIcon, SearchIcon } from "@/components/icons";
import StatusBadge from "@/components/status-badge";
import { formatCurrency, normalizeText } from "@/lib/format";
import type { Customer, CustomerStatus } from "@/lib/mock-customers";
import type { CustomerFinancials } from "@/lib/mock-finance";
import { TD_CLASS, TH_CLASS, TR_CLASS } from "@/lib/table-styles";

type StatusFilter = "Tümü" | CustomerStatus;
export type CustomerListItem = Customer & CustomerFinancials;

const STATUS_FILTERS: StatusFilter[] = ["Tümü", "Aktif", "Pasif"];

export default function CustomerList({ customers }: { customers: CustomerListItem[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("Tümü");

  const counts = useMemo(
    () => ({
      Tümü: customers.length,
      Aktif: customers.filter((customer) => customer.status === "Aktif").length,
      Pasif: customers.filter((customer) => customer.status === "Pasif").length,
    }),
    [customers],
  );

  const filtered = useMemo(() => {
    const term = normalizeText(query);

    return customers.filter((customer) => {
      if (status !== "Tümü" && customer.status !== status) {
        return false;
      }

      if (!term) {
        return true;
      }

      return [customer.name, customer.contact, customer.phone, customer.email].some(
        (field) => normalizeText(field).includes(term),
      );
    });
  }, [customers, query, status]);

  const isFiltered = query.trim() !== "" || status !== "Tümü";

  const resetFilters = () => {
    setQuery("");
    setStatus("Tümü");
  };

  return (
    <section className="overflow-hidden rounded-lg border border-ui-border bg-surface shadow-xs">
      <div className="flex flex-col gap-3 border-b border-ui-border px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-sm">
          <label htmlFor="musteri-arama" className="sr-only">
            Müşteri ara
          </label>
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-foreground-subtle"
          />
          <input
            id="musteri-arama"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Firma, yetkili, telefon veya e-posta ara"
            className="w-full rounded-md border border-ui-border bg-surface py-2 pr-3 pl-9 text-sm text-foreground placeholder:text-foreground-subtle"
          />
        </div>

        <div
          role="group"
          aria-label="Durum filtresi"
          className="flex items-center gap-1 self-start rounded-md border border-ui-border p-0.5"
        >
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
                <span className="ml-1.5 text-xs text-foreground-muted tabular-nums">
                  {counts[item]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <p aria-live="polite" className="sr-only">
        {filtered.length} müşteri listeleniyor.
      </p>

      {filtered.length === 0 ? (
        <div className="px-6 py-16 text-center">
          <span
            aria-hidden
            className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-surface-strong text-foreground-subtle"
          >
            <SearchIcon className="h-5 w-5" />
          </span>
          <h3 className="mt-3 text-sm font-semibold text-foreground">Müşteri bulunamadı</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-foreground-muted">
            Arama veya durum filtresine uyan kayıt yok. Farklı bir arama deneyin ya da
            filtreleri temizleyin.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="mt-4 inline-flex items-center rounded-md border border-ui-border bg-surface px-3 py-1.5 text-sm font-medium text-foreground-secondary shadow-xs transition-colors hover:bg-surface-hover"
          >
            Filtreleri temizle
          </button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead className="border-b border-ui-border bg-surface-muted">
              <tr>
                <th scope="col" className={TH_CLASS}>
                  Müşteri
                </th>
                <th scope="col" className={`${TH_CLASS} hidden md:table-cell`}>
                  Yetkili
                </th>
                <th scope="col" className={`${TH_CLASS} hidden lg:table-cell`}>
                  İletişim
                </th>
                <th scope="col" className={`${TH_CLASS} hidden text-right sm:table-cell`}>
                  Aktif İş
                </th>
                <th scope="col" className={`${TH_CLASS} hidden text-right xl:table-cell`}>
                  Toplam İş
                </th>
                <th scope="col" className={`${TH_CLASS} text-right`}>
                  Toplam Ciro
                </th>
                <th scope="col" className={TH_CLASS}>
                  Durum
                </th>
                <th scope="col" className={`${TH_CLASS} hidden xl:table-cell`}>
                  Son işlem
                </th>
                <th scope="col" className="w-10">
                  <span className="sr-only">Detay</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ui-border-subtle">
              {filtered.map((customer) => (
                <tr
                  key={customer.id}
                  onClick={() => router.push(`/musteriler/${customer.id}`)}
                  className={`${TR_CLASS} cursor-pointer`}
                >
                  <td className={TD_CLASS}>
                    <Link
                      href={`/musteriler/${customer.id}`}
                      className="rounded-sm font-medium text-foreground hover:text-brand-700"
                    >
                      {customer.name}
                    </Link>
                    <span className="mt-0.5 block text-xs text-foreground-muted md:hidden">
                      {customer.contact} · {customer.phone}
                    </span>
                    <span className="mt-0.5 hidden text-xs text-foreground-muted md:block">
                      {customer.city}
                    </span>
                  </td>
                  <td className={`${TD_CLASS} hidden md:table-cell`}>{customer.contact}</td>
                  <td className={`${TD_CLASS} hidden lg:table-cell`}>
                    <span className="block text-foreground-secondary">{customer.phone}</span>
                    <span className="mt-0.5 block text-xs text-foreground-muted">
                      {customer.email}
                    </span>
                  </td>
                  <td className={`${TD_CLASS} hidden text-right tabular-nums sm:table-cell`}>
                    {customer.activeJobs}
                  </td>
                  <td className={`${TD_CLASS} hidden text-right tabular-nums xl:table-cell`}>
                    {customer.totalJobs}
                  </td>
                  <td
                    className={`${TD_CLASS} text-right font-medium text-foreground tabular-nums`}
                  >
                    {formatCurrency(customer.totalRevenue)}
                  </td>
                  <td className={TD_CLASS}>
                    <StatusBadge status={customer.status} />
                  </td>
                  <td className={`${TD_CLASS} hidden tabular-nums xl:table-cell`}>
                    {customer.lastActivity}
                  </td>
                  <td className={`${TD_CLASS} text-right`}>
                    <ChevronRightIcon className="ml-auto h-4 w-4 text-foreground-faint" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {filtered.length > 0 ? (
        <div className="flex items-center justify-between border-t border-ui-border px-5 py-3 text-xs text-foreground-muted">
          <span className="tabular-nums">
            {filtered.length} / {customers.length} müşteri gösteriliyor
          </span>
          {isFiltered ? (
            <button
              type="button"
              onClick={resetFilters}
              className="rounded-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
            >
              Filtreleri temizle
            </button>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
