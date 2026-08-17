export type CustomerStatus = "Aktif" | "Pasif";

export type Customer = {
  id: string;
  name: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  isActive: boolean;
  status: CustomerStatus;
  createdAt: string;
};

export type CustomerListItem = Omit<Customer, "address">;

export type CustomerActionState = {
  status: "idle" | "error";
  message: string;
};

export const INITIAL_CUSTOMER_ACTION_STATE: CustomerActionState = {
  status: "idle",
  message: "",
};

export type CustomerFormValues = Pick<
  Customer,
  "name" | "contactName" | "phone" | "email" | "address" | "city" | "isActive"
>;

export type CustomerRelatedRecord = {
  id: string;
  code: string;
  title: string;
  status: string;
  amount: number;
  date: string;
};

export type CustomerFinancialSummary = {
  totalJobs: number;
  activeJobs: number;
  totalRevenue: number;
  openBalance: number;
};

export type CustomerRelatedData = {
  financials: CustomerFinancialSummary;
  jobs: CustomerRelatedRecord[];
  quotes: CustomerRelatedRecord[];
};
