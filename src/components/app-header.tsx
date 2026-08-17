"use client";

import { usePathname } from "next/navigation";

import { LogoMark } from "@/components/icons";
import { NAV_ITEMS, isActiveRoute } from "@/lib/navigation";

export default function AppHeader() {
  const pathname = usePathname();
  const currentItem = NAV_ITEMS.find((item) => isActiveRoute(pathname, item.href));
  const currentLabel = currentItem?.label ?? "İşTakip";

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2.5">
        <LogoMark className="h-8 w-8 lg:hidden" />
        <nav aria-label="Sayfa konumu" className="min-w-0">
          <ol className="flex items-center gap-1.5 text-sm">
            <li className="hidden text-slate-500 sm:block">İşTakip</li>
            <li aria-hidden className="hidden text-slate-300 sm:block">
              /
            </li>
            <li className="truncate font-medium text-slate-900" aria-current="page">
              {currentLabel}
            </li>
          </ol>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-900">Demo İşletme</p>
          <p className="text-xs text-slate-500">Yönetici</p>
        </div>
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-sm font-medium text-white"
        >
          Dİ
        </span>
        <span className="sr-only">Oturum: Demo İşletme, Yönetici</span>
      </div>
    </header>
  );
}
