import { isUuid } from "@/lib/customers/validation";
import {
  EXPENSE_CATEGORY_OPTIONS,
  type ExpenseCategory,
  type ExpenseMutationValues,
} from "@/lib/expenses/types";

export const EXPENSE_DESCRIPTION_MAX_LENGTH = 500;

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EXPENSE_CATEGORIES = new Set<ExpenseCategory>(
  EXPENSE_CATEGORY_OPTIONS.map(({ value }) => value),
);
const NUMERIC_14_2_MAX = BigInt("99999999999999");

type ExpenseValidationResult =
  | { success: true; data: ExpenseMutationValues }
  | { success: false; message: string };

function isValidDate(value: string) {
  if (!DATE_PATTERN.test(value)) return false;

  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    year > 0 &&
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

function normalizeAmount(value: FormDataEntryValue | null) {
  if (typeof value !== "string") return null;

  const normalized = value.trim().replace(",", ".");
  if (normalized.length > 32 || !/^\d+(?:\.\d{1,2})?$/.test(normalized)) return null;

  const [wholePart, fractionPart = ""] = normalized.split(".");
  const scaledValue = BigInt(`${wholePart}${fractionPart.padEnd(2, "0")}`);
  if (scaledValue === BigInt(0) || scaledValue > NUMERIC_14_2_MAX) return null;

  return normalized;
}

export function validateExpenseForm(formData: FormData): ExpenseValidationResult {
  const jobId = String(formData.get("jobId") ?? "").trim();
  const expenseDate = String(formData.get("expenseDate") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim() as ExpenseCategory;

  if (!isUuid(jobId)) return { success: false, message: "Geçerli bir iş seçin." };
  if (!isValidDate(expenseDate)) return { success: false, message: "Geçerli bir gider tarihi girin." };
  if (!description) return { success: false, message: "Gider açıklaması zorunludur." };
  if (description.length > EXPENSE_DESCRIPTION_MAX_LENGTH) {
    return {
      success: false,
      message: `Gider açıklaması en fazla ${EXPENSE_DESCRIPTION_MAX_LENGTH} karakter olabilir.`,
    };
  }
  if (!EXPENSE_CATEGORIES.has(category)) {
    return { success: false, message: "Geçerli bir gider kategorisi seçin." };
  }

  const amount = normalizeAmount(formData.get("amount"));
  if (!amount) {
    return {
      success: false,
      message: "Tutar sıfırdan büyük, en fazla iki ondalıklı ve izin verilen sınırlar içinde olmalıdır.",
    };
  }

  return {
    success: true,
    data: { jobId, expenseDate, description, category, amount },
  };
}
