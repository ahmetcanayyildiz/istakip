// GEÇİCİ: Dashboard'un görsel olarak çalışabilmesi için kullanılan sahte verilerdir.
// Veritabanı aşamasına geçildiğinde bu dosya gerçek sorgularla değiştirilecektir.

import {
  BanknotesIcon,
  BriefcaseIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentIcon,
  ReceiptIcon,
} from "@/components/icons";
import type { StatCardProps } from "@/components/stat-card";
import { formatCurrency } from "@/lib/format";

export type StatusLabel =
  | "Devam ediyor"
  | "Tamamlandı"
  | "Onaylandı"
  | "Beklemede"
  | "Gönderildi"
  | "Reddedildi";

export const PERIOD_LABEL = "Ağustos 2026";

export const SUMMARY_CARDS: StatCardProps[] = [
  {
    label: "Toplam Ciro",
    value: formatCurrency(486750),
    icon: BanknotesIcon,
    trend: { direction: "up", value: "%12", tone: "positive" },
  },
  {
    label: "Toplam Gider",
    value: formatCurrency(213400),
    icon: ReceiptIcon,
    trend: { direction: "up", value: "%4", tone: "negative" },
  },
  {
    label: "Tahmini Kâr",
    value: formatCurrency(273350),
    icon: ChartBarIcon,
    trend: { direction: "up", value: "%19", tone: "positive" },
  },
  {
    label: "Bekleyen Tahsilat",
    value: formatCurrency(92500),
    icon: ClockIcon,
    trend: { direction: "down", value: "%6", tone: "positive" },
  },
  {
    label: "Aktif İşler",
    value: "12",
    icon: BriefcaseIcon,
    hint: "3 iş teslim aşamasında",
  },
  {
    label: "Bekleyen Teklifler",
    value: "5",
    icon: DocumentIcon,
    hint: `Toplam ${formatCurrency(148000)} değerinde`,
  },
];

export type RecentJob = {
  code: string;
  title: string;
  customer: string;
  status: StatusLabel;
  amount: number;
  date: string;
};

export const RECENT_JOBS: RecentJob[] = [
  {
    code: "IS-2026-041",
    title: "Mağaza aydınlatma yenileme",
    customer: "Aydın Mobilya",
    status: "Devam ediyor",
    amount: 64500,
    date: "14.08.2026",
  },
  {
    code: "IS-2026-040",
    title: "Şantiye elektrik tesisatı",
    customer: "Kaya İnşaat",
    status: "Devam ediyor",
    amount: 128000,
    date: "11.08.2026",
  },
  {
    code: "IS-2026-039",
    title: "Mutfak havalandırma montajı",
    customer: "Deniz Kafe",
    status: "Tamamlandı",
    amount: 37250,
    date: "08.08.2026",
  },
  {
    code: "IS-2026-038",
    title: "Depo raf sistemi kurulumu",
    customer: "Yılmaz Tekstil",
    status: "Beklemede",
    amount: 95000,
    date: "05.08.2026",
  },
  {
    code: "IS-2026-037",
    title: "Servis alanı boya işleri",
    customer: "Ege Otomotiv",
    status: "Tamamlandı",
    amount: 41800,
    date: "01.08.2026",
  },
];

export type RecentQuote = {
  code: string;
  customer: string;
  status: StatusLabel;
  amount: number;
  date: string;
};

export const RECENT_QUOTES: RecentQuote[] = [
  {
    code: "TKL-2026-118",
    customer: "Marmara Lojistik",
    status: "Gönderildi",
    amount: 58000,
    date: "15.08.2026",
  },
  {
    code: "TKL-2026-117",
    customer: "Aydın Mobilya",
    status: "Onaylandı",
    amount: 64500,
    date: "12.08.2026",
  },
  {
    code: "TKL-2026-116",
    customer: "Sönmez Market",
    status: "Beklemede",
    amount: 23750,
    date: "10.08.2026",
  },
  {
    code: "TKL-2026-115",
    customer: "Kaya İnşaat",
    status: "Onaylandı",
    amount: 128000,
    date: "07.08.2026",
  },
  {
    code: "TKL-2026-114",
    customer: "Batı Yapı Market",
    status: "Reddedildi",
    amount: 31200,
    date: "03.08.2026",
  },
];
