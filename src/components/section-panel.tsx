import Link from "next/link";
import type { ReactNode } from "react";

import { ChevronRightIcon } from "@/components/icons";

type SectionPanelProps = {
  title: string;
  description?: string;
  href?: string;
  children: ReactNode;
};

export default function SectionPanel({
  title,
  description,
  href,
  children,
}: SectionPanelProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-lg border border-ui-border bg-surface shadow-xs">
      <div className="flex items-center justify-between gap-3 border-b border-ui-border px-5 py-4">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
          {description ? (
            <p className="mt-0.5 truncate text-xs text-foreground-muted">{description}</p>
          ) : null}
        </div>
        {href ? (
          <Link
            href={href}
            className="inline-flex shrink-0 items-center gap-1 rounded-md text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
          >
            Tümünü Gör
            <span className="sr-only"> — {title}</span>
            <ChevronRightIcon className="h-4 w-4" />
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}
