"use client";

import { usePathname } from "next/navigation";

import { LogoMark } from "@/components/icons";
import LogoutButton from "@/components/logout-button";
import ThemeToggle from "@/components/theme-toggle";
import { NAV_ITEMS, isActiveRoute } from "@/lib/navigation";

function getInitials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0))
    .join("")
    .toLocaleUpperCase("tr-TR");
}

export default function AppHeader({
  companyName,
  fullName,
  isDemo,
}: {
  companyName: string;
  fullName: string | null;
  isDemo: boolean;
}) {
  const pathname = usePathname();
  const currentItem = NAV_ITEMS.find((item) => isActiveRoute(pathname, item.href));
  const currentLabel = currentItem?.label ?? "İşTakip";
  const displayName = fullName || "Kullanıcı";
  const initials = getInitials(fullName || companyName) || "İT";

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b border-ui-border bg-shell-header/95 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-2.5">
        <LogoMark className="h-8 w-8 lg:hidden" />
        <nav aria-label="Sayfa konumu" className="min-w-0">
          <ol className="flex items-center gap-1.5 text-sm">
            <li className="hidden text-foreground-muted sm:block">İşTakip</li>
            <li aria-hidden className="hidden text-foreground-faint sm:block">
              /
            </li>
            <li className="truncate font-medium text-foreground" aria-current="page">
              {currentLabel}
            </li>
          </ol>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {isDemo ? (
          <span className="rounded-full bg-warning-soft px-2.5 py-1 text-xs font-semibold text-warning ring-1 ring-inset ring-warning-ring">
            Demo
          </span>
        ) : null}
        <div className="hidden text-right sm:block">
          <p className="max-w-44 truncate text-sm font-medium text-foreground">{companyName}</p>
          <p className="max-w-44 truncate text-xs text-foreground-muted">{displayName}</p>
        </div>
        <span
          aria-hidden
          className="flex h-9 w-9 items-center justify-center rounded-full bg-avatar text-sm font-medium text-white"
        >
          {initials}
        </span>
        <span className="sr-only">Oturum: {companyName}, {displayName}</span>
        <ThemeToggle />
        <LogoutButton />
      </div>
    </header>
  );
}
