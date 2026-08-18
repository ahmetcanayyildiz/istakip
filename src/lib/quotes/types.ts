export const QUOTE_STATUS_OPTIONS = [
  { value: "draft", label: "Taslak" },
  { value: "sent", label: "Gönderildi" },
  { value: "pending", label: "Beklemede" },
  { value: "approved", label: "Onaylandı" },
  { value: "rejected", label: "Reddedildi" },
] as const;

export const QUOTE_FIELD_LIMITS = {
  title: 200,
  notes: 4000,
  itemDescription: 500,
  itemUnit: 50,
  itemCount: 32767,
} as const;

export type QuoteStatus = (typeof QUOTE_STATUS_OPTIONS)[number]["value"];
export type QuoteStatusLabel = (typeof QUOTE_STATUS_OPTIONS)[number]["label"];

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, QuoteStatusLabel> = {
  draft: "Taslak",
  sent: "Gönderildi",
  pending: "Beklemede",
  approved: "Onaylandı",
  rejected: "Reddedildi",
};

export type QuoteCustomer = {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  isActive: boolean;
};

export type QuoteCustomerOption = Pick<QuoteCustomer, "id" | "name" | "isActive">;

export type QuoteItem = {
  id: string;
  position: number;
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
};

export type QuoteTotals = {
  subtotalCents: number;
  discountCents: number;
  netTotalCents: number;
  vatCents: number;
  grandTotalCents: number;
};

export type QuoteListItem = QuoteTotals & {
  id: string;
  code: string;
  title: string;
  customer: Pick<QuoteCustomer, "id" | "name">;
  status: QuoteStatus;
  statusLabel: QuoteStatusLabel;
  issueDate: string;
  validUntil: string;
  vatRate: string;
};

export type QuoteDetail = QuoteListItem & {
  customer: QuoteCustomer;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  discountAmount: string;
  items: QuoteItem[];
};

export type QuoteFormInitialValues = {
  customerId: string;
  title: string;
  issueDate: string;
  validUntil: string;
  status: QuoteStatus;
  notes: string;
  discountAmount: string;
  vatRate: string;
  items: Array<Pick<QuoteItem, "description" | "quantity" | "unit" | "unitPrice">>;
};

export type QuoteActionState = {
  status: "idle" | "error";
  message: string;
};

export const INITIAL_QUOTE_ACTION_STATE: QuoteActionState = {
  status: "idle",
  message: "",
};

export type QuoteRpcItem = {
  description: string;
  quantity: string;
  unit: string;
  unit_price: string;
};

export type QuoteMutationValues = {
  customerId: string;
  title: string;
  issueDate: string;
  validUntil: string;
  status: QuoteStatus;
  discountAmount: string;
  vatRate: string;
  notes: string;
  items: QuoteRpcItem[];
};
