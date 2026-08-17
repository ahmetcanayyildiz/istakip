// GEÇİCİ: Giderler modülünün sahte verisidir.

export type ExpenseCategory =
  | "Malzeme"
  | "İşçilik"
  | "Ulaşım"
  | "Ekipman"
  | "Hizmet"
  | "Diğer";

export type Expense = {
  id: string;
  date: string;
  description: string;
  category: ExpenseCategory;
  jobId: string;
  amount: number;
};

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Malzeme",
  "İşçilik",
  "Ulaşım",
  "Ekipman",
  "Hizmet",
  "Diğer",
];

export const EXPENSES: Expense[] = [
  { id: "gid-2026-082", date: "2026-08-15", description: "LED ray spot ve sürücüler", category: "Malzeme", jobId: "is-2026-041", amount: 18500 },
  { id: "gid-2026-081", date: "2026-08-14", description: "Elektrik montaj ekibi", category: "İşçilik", jobId: "is-2026-041", amount: 9000 },
  { id: "gid-2026-079", date: "2026-08-13", description: "Dağıtım panosu ve şalt malzemesi", category: "Malzeme", jobId: "is-2026-040", amount: 42000 },
  { id: "gid-2026-078", date: "2026-08-12", description: "Şantiye elektrik ustaları", category: "İşçilik", jobId: "is-2026-040", amount: 16000 },
  { id: "gid-2026-076", date: "2026-08-08", description: "Paslanmaz havalandırma kanalı", category: "Ekipman", jobId: "is-2026-039", amount: 11500 },
  { id: "gid-2026-075", date: "2026-08-07", description: "Montaj ve devreye alma hizmeti", category: "Hizmet", jobId: "is-2026-039", amount: 7500 },
  { id: "gid-2026-073", date: "2026-08-06", description: "Galvaniz depo raf modülleri", category: "Malzeme", jobId: "is-2026-038", amount: 35000 },
  { id: "gid-2026-072", date: "2026-08-05", description: "Denizli sevkiyat ve nakliye", category: "Ulaşım", jobId: "is-2026-038", amount: 7500 },
  { id: "gid-2026-070", date: "2026-08-01", description: "Zemin koruma ve boya malzemesi", category: "Malzeme", jobId: "is-2026-037", amount: 19400 },
  { id: "gid-2026-068", date: "2026-08-01", description: "Rampa bakım ekipmanı kiralama", category: "Ekipman", jobId: "is-2026-036", amount: 18000 },
  { id: "gid-2026-065", date: "2026-08-03", description: "Soğutma sistemi bakım servisi", category: "Hizmet", jobId: "is-2026-029", amount: 17200 },
  { id: "gid-2026-061", date: "2026-08-02", description: "Cam montajı güvenlik hizmeti", category: "Hizmet", jobId: "is-2026-004", amount: 11800 },
];
