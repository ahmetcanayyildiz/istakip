"use client";

import { MoonIcon, SunIcon } from "@/components/icons";

const THEME_STORAGE_KEY = "istakip-theme";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.style.colorScheme = theme;
}

export default function ThemeToggle() {
  function handleToggle() {
    const nextTheme: Theme = document.documentElement.classList.contains("dark")
      ? "light"
      : "dark";

    applyTheme(nextTheme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // Tema yine bu oturum için uygulanır; depolama kullanılamıyorsa kalıcı olmaz.
    }
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label="Renk temasını değiştir"
      title="Renk temasını değiştir"
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-ui-border bg-surface text-foreground-secondary transition-colors hover:border-ui-border-strong hover:bg-surface-hover hover:text-foreground"
    >
      <SunIcon className="h-4.5 w-4.5 dark:hidden" />
      <MoonIcon className="hidden h-4.5 w-4.5 dark:block" />
    </button>
  );
}
