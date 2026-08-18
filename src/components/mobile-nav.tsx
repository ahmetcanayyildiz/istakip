"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS, isActiveRoute } from "@/lib/navigation";

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Ana menü"
      className="overflow-x-auto border-b border-ui-border bg-shell-header lg:hidden"
    >
      <ul className="flex min-w-max items-center gap-1 px-4 py-2">
        {NAV_ITEMS.map((item) => {
          const isActive = isActiveRoute(pathname, item.href);
          const Icon = item.icon;

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-brand-50 font-semibold text-brand-800"
                    : "font-medium text-foreground-secondary hover:bg-surface-hover hover:text-foreground"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${isActive ? "text-brand-700" : "text-foreground-subtle"}`}
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
