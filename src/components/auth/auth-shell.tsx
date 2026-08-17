import Link from "next/link";
import type { ReactNode } from "react";

import { LogoMark } from "@/components/icons";

export default function AuthShell({
  title,
  description,
  children,
  accessory,
}: {
  title: string;
  description: string;
  children: ReactNode;
  accessory?: ReactNode;
}) {
  return (
    <main className="flex min-h-svh items-center justify-center px-4 py-10 sm:px-6">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-2.5 rounded-sm">
            <LogoMark className="h-9 w-9" />
            <span className="text-lg font-semibold tracking-tight text-slate-900">İşTakip</span>
          </Link>
          {accessory}
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-xs sm:p-7">
          <header>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900">{title}</h1>
            <p className="mt-1.5 text-sm leading-6 text-slate-500">{description}</p>
          </header>
          <div className="mt-6">{children}</div>
        </section>

        <p className="mt-5 text-center text-xs text-slate-500">
          Müşteri, teklif, iş ve finans süreçlerin tek yerde.
        </p>
      </div>
    </main>
  );
}
