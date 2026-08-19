import type { CollectionDisplayStatus } from "@/lib/finance/calculations";

export const PAYMENT_METHOD_OPTIONS = [
  { value: "bank_transfer", label: "Havale / EFT" },
  { value: "cash", label: "Nakit" },
  { value: "credit_card", label: "Kredi Kartı" },
  { value: "other", label: "Diğer" },
] as const;

export type PaymentMethod = (typeof PAYMENT_METHOD_OPTIONS)[number]["value"];
export type PaymentMethodLabel = (typeof PAYMENT_METHOD_OPTIONS)[number]["label"];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, PaymentMethodLabel> = {
  bank_transfer: "Havale / EFT",
  cash: "Nakit",
  credit_card: "Kredi Kartı",
  other: "Diğer",
};

export const COLLECTION_STATUS_LABELS = {
  paid: "Tahsil Edildi",
  pending: "Vadesi Beklenen",
  overdue: "Gecikmiş",
} as const satisfies Record<CollectionDisplayStatus, string>;

export type CollectionStatus = "pending" | "paid";

export type CollectionJob = {
  id: string;
  code: string;
  title: string;
  contractAmount: number;
  customer: {
    id: string;
    name: string;
  };
};

export type CollectionJobOption = CollectionJob & {
  allocatedAmount: number;
  availableAmount: number;
};

export type CollectionListItem = {
  id: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: CollectionStatus;
  displayStatus: CollectionDisplayStatus;
  statusLabel: string;
  paymentMethod: PaymentMethod | null;
  paymentMethodLabel: PaymentMethodLabel | null;
  job: CollectionJob;
};

export type CollectionActionState = {
  status: "idle" | "error";
  message: string;
};

export const INITIAL_COLLECTION_ACTION_STATE: CollectionActionState = {
  status: "idle",
  message: "",
};

export type CollectionMutationValues = {
  jobId: string;
  amount: string;
  dueDate: string;
};

export type MarkCollectionPaidValues = {
  collectionId: string;
  paidDate: string;
  paymentMethod: PaymentMethod;
};
