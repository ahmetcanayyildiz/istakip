import type { QuoteStatus, QuoteStatusLabel } from "@/lib/quotes/types";

export const JOB_STATUS_OPTIONS = [
  { value: "planned", label: "Planlandı" },
  { value: "in_progress", label: "Devam Ediyor" },
  { value: "on_hold", label: "Beklemede" },
  { value: "completed", label: "Tamamlandı" },
  { value: "cancelled", label: "İptal Edildi" },
] as const;

export type JobStatus = (typeof JOB_STATUS_OPTIONS)[number]["value"];
export type JobStatusLabel = (typeof JOB_STATUS_OPTIONS)[number]["label"];

export const JOB_STATUS_LABELS: Record<JobStatus, JobStatusLabel> = {
  planned: "Planlandı",
  in_progress: "Devam Ediyor",
  on_hold: "Beklemede",
  completed: "Tamamlandı",
  cancelled: "İptal Edildi",
};

export type JobCustomer = {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
};

export type JobSourceQuote = {
  id: string;
  code: string;
  title: string;
  status: QuoteStatus;
  statusLabel: QuoteStatusLabel;
  issueDate: string;
};

export type JobListItem = {
  id: string;
  code: string;
  title: string;
  status: JobStatus;
  statusLabel: JobStatusLabel;
  startDate: string;
  targetDate: string;
  contractAmount: number;
  customer: Pick<JobCustomer, "id" | "name">;
  sourceQuote: JobSourceQuote | null;
};

export type JobExpenseRecord = {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
};

export type JobCollectionRecord = {
  id: string;
  amount: number;
  dueDate: string;
  paidAt: string | null;
  displayDate: string;
  paymentMethod: string;
  status: "pending" | "paid";
  statusLabel: "Tahsil Edildi" | "Vadesi Beklenen" | "Gecikmiş";
};

export type JobFinancials = {
  totalExpenses: number;
  collected: number;
  openBalance: number;
  estimatedProfit: number;
};

export type JobDetail = Omit<JobListItem, "customer"> & {
  customer: JobCustomer;
  expenses: JobExpenseRecord[];
  collections: JobCollectionRecord[];
  financials: JobFinancials;
};

export type JobActionState = {
  status: "idle" | "error";
  message: string;
};

export const INITIAL_JOB_ACTION_STATE: JobActionState = {
  status: "idle",
  message: "",
};

