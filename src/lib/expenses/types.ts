export const EXPENSE_CATEGORY_OPTIONS = [
  { value: "material", label: "Malzeme" },
  { value: "labor", label: "İşçilik" },
  { value: "transport", label: "Ulaşım" },
  { value: "equipment", label: "Ekipman" },
  { value: "service", label: "Hizmet" },
  { value: "other", label: "Diğer" },
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORY_OPTIONS)[number]["value"];
export type ExpenseCategoryLabel = (typeof EXPENSE_CATEGORY_OPTIONS)[number]["label"];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, ExpenseCategoryLabel> = {
  material: "Malzeme",
  labor: "İşçilik",
  transport: "Ulaşım",
  equipment: "Ekipman",
  service: "Hizmet",
  other: "Diğer",
};

export type ExpenseJob = {
  id: string;
  code: string;
  title: string;
  customer: {
    id: string;
    name: string;
  };
};

export type ExpenseListItem = {
  id: string;
  date: string;
  description: string;
  category: ExpenseCategory;
  categoryLabel: ExpenseCategoryLabel;
  amount: number;
  job: ExpenseJob;
};

export type ExpenseMutationValues = {
  jobId: string;
  expenseDate: string;
  description: string;
  category: ExpenseCategory;
  amount: string;
};

export type ExpenseActionState = {
  status: "idle" | "error";
  message: string;
};

export const INITIAL_EXPENSE_ACTION_STATE: ExpenseActionState = {
  status: "idle",
  message: "",
};
