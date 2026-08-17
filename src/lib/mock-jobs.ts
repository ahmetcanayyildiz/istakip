// GEÇİCİ: İşler modülünün sahte verisidir.
// Veritabanı aşamasında bu dosya gerçek sorgularla değiştirilecektir.

import { CUSTOMERS } from "@/lib/mock-customers";
import { calculateQuoteTotals, getQuoteById } from "@/lib/mock-quotes";

export type JobStatus =
  | "Planlandı"
  | "Devam Ediyor"
  | "Beklemede"
  | "Tamamlandı"
  | "İptal Edildi";

export type JobCustomer = {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  city: string;
};

export type Job = {
  id: string;
  code: string;
  title: string;
  customer: JobCustomer;
  startDate: string;
  targetDate: string;
  status: JobStatus;
  amount: number;
  relatedQuoteId?: string;
};

const customerRef = (id: string): JobCustomer => {
  const customer = CUSTOMERS.find((item) => item.id === id);

  if (!customer) {
    throw new Error(`Mock müşteri bulunamadı: ${id}`);
  }

  return {
    id: customer.id,
    name: customer.name,
    contact: customer.contact,
    phone: customer.phone,
    email: customer.email,
    address: customer.address,
    city: customer.city,
  };
};

const netContractAmountFromQuote = (quoteId: string) => {
  const quote = getQuoteById(quoteId);

  if (!quote) {
    throw new Error(`Mock teklif bulunamadı: ${quoteId}`);
  }

  return calculateQuoteTotals(quote).netTotal;
};

export const JOBS: Job[] = [
  {
    id: "is-2026-041",
    code: "IS-2026-041",
    title: "Mağaza aydınlatma yenileme",
    customer: customerRef("aydin-mobilya"),
    startDate: "2026-08-14",
    targetDate: "2026-08-28",
    status: "Devam Ediyor",
    amount: netContractAmountFromQuote("tkl-2026-117"),
    relatedQuoteId: "tkl-2026-117",
  },
  {
    id: "is-2026-040",
    code: "IS-2026-040",
    title: "Şantiye elektrik tesisatı",
    customer: customerRef("kaya-insaat"),
    startDate: "2026-08-11",
    targetDate: "2026-09-12",
    status: "Devam Ediyor",
    amount: netContractAmountFromQuote("tkl-2026-115"),
    relatedQuoteId: "tkl-2026-115",
  },
  {
    id: "is-2026-039",
    code: "IS-2026-039",
    title: "Mutfak havalandırma montajı",
    customer: customerRef("deniz-kafe"),
    startDate: "2026-08-03",
    targetDate: "2026-08-08",
    status: "Tamamlandı",
    amount: netContractAmountFromQuote("tkl-2026-110"),
    relatedQuoteId: "tkl-2026-110",
  },
  {
    id: "is-2026-038",
    code: "IS-2026-038",
    title: "Depo raf sistemi kurulumu",
    customer: customerRef("yilmaz-tekstil"),
    startDate: "2026-08-05",
    targetDate: "2026-08-26",
    status: "Beklemede",
    amount: 95000,
  },
  {
    id: "is-2026-037",
    code: "IS-2026-037",
    title: "Servis alanı boya işleri",
    customer: customerRef("ege-otomotiv"),
    startDate: "2026-07-27",
    targetDate: "2026-08-01",
    status: "Tamamlandı",
    amount: 41800,
  },
  {
    id: "is-2026-036",
    code: "IS-2026-036",
    title: "Yükleme rampası bakımı",
    customer: customerRef("marmara-lojistik"),
    startDate: "2026-07-29",
    targetDate: "2026-08-22",
    status: "Devam Ediyor",
    amount: 48000,
  },
  {
    id: "is-2026-029",
    code: "IS-2026-029",
    title: "Soğutucu reyon bakımı",
    customer: customerRef("sonmez-market"),
    startDate: "2026-06-20",
    targetDate: "2026-06-24",
    status: "Tamamlandı",
    amount: 26700,
  },
  {
    id: "is-2026-004",
    code: "IS-2026-004",
    title: "Cephe cam montaj desteği",
    customer: customerRef("kuzey-cam-sistemleri"),
    startDate: "2026-02-09",
    targetDate: "2026-02-18",
    status: "Tamamlandı",
    amount: 74500,
  },
  {
    id: "is-2026-042",
    code: "IS-2026-042",
    title: "Soğutma hattı enerji ölçümü",
    customer: customerRef("sonmez-market"),
    startDate: "2026-08-24",
    targetDate: "2026-08-25",
    status: "Planlandı",
    amount: 24000,
  },
  {
    id: "is-2026-033",
    code: "IS-2026-033",
    title: "Üretim hattı pano revizyonu",
    customer: customerRef("oz-demir-metal"),
    startDate: "2026-07-21",
    targetDate: "2026-08-04",
    status: "İptal Edildi",
    amount: 56000,
  },
];

export const getJobById = (id: string) => JOBS.find((job) => job.id === id);
