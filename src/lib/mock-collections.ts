// GEÇİCİ: Tahsilatlar modülünün sahte verisidir.

export type PaymentMethod = "Havale / EFT" | "Nakit" | "Kredi Kartı" | "Diğer";
export type CollectionStatus = "Tahsil Edildi" | "Bekliyor" | "Gecikmiş";

export type CollectionRecord = {
  id: string;
  date: string;
  jobId: string;
  amount: number;
  method: PaymentMethod;
  status: CollectionStatus;
};

export const PAYMENT_METHODS: PaymentMethod[] = [
  "Havale / EFT",
  "Nakit",
  "Kredi Kartı",
  "Diğer",
];

export const COLLECTIONS: CollectionRecord[] = [
  { id: "tah-2026-096", date: "2026-08-14", jobId: "is-2026-041", amount: 32250, method: "Havale / EFT", status: "Tahsil Edildi" },
  { id: "tah-2026-097", date: "2026-08-28", jobId: "is-2026-041", amount: 32250, method: "Kredi Kartı", status: "Bekliyor" },
  { id: "tah-2026-093", date: "2026-08-12", jobId: "is-2026-040", amount: 83000, method: "Havale / EFT", status: "Tahsil Edildi" },
  { id: "tah-2026-094", date: "2026-08-05", jobId: "is-2026-040", amount: 37000, method: "Havale / EFT", status: "Gecikmiş" },
  { id: "tah-2026-090", date: "2026-08-08", jobId: "is-2026-039", amount: 37250, method: "Nakit", status: "Tahsil Edildi" },
  { id: "tah-2026-088", date: "2026-08-05", jobId: "is-2026-038", amount: 95000, method: "Havale / EFT", status: "Gecikmiş" },
  { id: "tah-2026-085", date: "2026-08-01", jobId: "is-2026-037", amount: 29000, method: "Kredi Kartı", status: "Tahsil Edildi" },
  { id: "tah-2026-086", date: "2026-08-20", jobId: "is-2026-037", amount: 12800, method: "Havale / EFT", status: "Bekliyor" },
  { id: "tah-2026-080", date: "2026-07-29", jobId: "is-2026-036", amount: 24000, method: "Havale / EFT", status: "Tahsil Edildi" },
  { id: "tah-2026-081", date: "2026-08-31", jobId: "is-2026-036", amount: 24000, method: "Diğer", status: "Bekliyor" },
  { id: "tah-2026-062", date: "2026-06-24", jobId: "is-2026-029", amount: 26700, method: "Nakit", status: "Tahsil Edildi" },
  { id: "tah-2026-018", date: "2026-02-18", jobId: "is-2026-004", amount: 74500, method: "Havale / EFT", status: "Tahsil Edildi" },
];
