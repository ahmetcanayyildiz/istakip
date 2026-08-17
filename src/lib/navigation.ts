import type { ComponentType } from "react";

import {
  BanknotesIcon,
  BriefcaseIcon,
  DashboardIcon,
  DocumentIcon,
  ReceiptIcon,
  UsersIcon,
} from "@/components/icons";

export type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
};

// Alt sayfalarda da (örn. /musteriler/aydin-mobilya) ilgili menü aktif kalır.
export const isActiveRoute = (pathname: string, href: string) =>
  href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/", icon: DashboardIcon },
  { label: "Müşteriler", href: "/musteriler", icon: UsersIcon },
  { label: "Teklifler", href: "/teklifler", icon: DocumentIcon },
  { label: "İşler", href: "/isler", icon: BriefcaseIcon },
  { label: "Giderler", href: "/giderler", icon: ReceiptIcon },
  { label: "Tahsilatlar", href: "/tahsilatlar", icon: BanknotesIcon },
];
