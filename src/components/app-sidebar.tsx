"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { LogoMark } from "@/components/icons";
import { NAV_ITEMS, isActiveRoute } from "@/lib/navigation";

export default function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 border-r border-ui-border bg-surface lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col">
      <div className="flex h-16 items-center gap-2.5 border-b border-ui-border px-5">
        <LogoMark className="h-8 w-8" />
        <Link
          href="/"
          className="rounded-sm text-base font-semibold tracking-tight text-foreground"
        >
          İşTakip
        </Link>
      </div>

      <nav aria-label="Ana menü" className="flex-1 px-3 py-4">
        <p className="px-3 pb-2 text-xs font-medium tracking-wide text-foreground-muted uppercase">
          Yönetim
        </p>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const isActive = isActiveRoute(pathname, item.href);
            const Icon = item.icon;

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "bg-brand-50 font-semibold text-brand-800"
                      : "font-medium text-foreground-secondary hover:bg-surface-hover hover:text-foreground"
                  }`}
                >
                  {isActive ? (
                    <span
                      aria-hidden
                      className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-brand-action"
                    />
                  ) : null}
                  <Icon
                    className={`h-5 w-5 shrink-0 ${
                      isActive
                        ? "text-brand-700"
                        : "text-foreground-subtle group-hover:text-foreground-muted"
                    }`}
                  />
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-ui-border px-5 py-4">
        <p className="text-xs font-medium text-foreground-secondary">Demo veriler</p>
        <p className="mt-0.5 text-xs text-foreground-muted">Sürüm 0.1.0</p>
      </div>
    </aside>
  );
}
