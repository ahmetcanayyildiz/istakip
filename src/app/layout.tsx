import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const themeInitializationScript = `
  (function () {
    try {
      var storedTheme = localStorage.getItem("istakip-theme");
      var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      var useDarkTheme = storedTheme === "dark" || (storedTheme !== "light" && prefersDark);
      document.documentElement.classList.toggle("dark", useDarkTheme);
      document.documentElement.style.colorScheme = useDarkTheme ? "dark" : "light";
    } catch (_) {}
  })();
`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "İşTakip",
  description:
    "Küçük işletmeler için müşteri, teklif, iş, gider ve tahsilat yönetim paneli.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializationScript }} />
      </head>
      <body className="min-h-full bg-page font-sans text-foreground">{children}</body>
    </html>
  );
}
