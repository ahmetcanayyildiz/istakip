import {
  PAYMENT_METHOD_OPTIONS,
  type CollectionMutationValues,
  type MarkCollectionPaidValues,
  type PaymentMethod,
} from "@/lib/collections/types";
import { isUuid } from "@/lib/customers/validation";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const NUMERIC_14_2_MAX = BigInt("99999999999999");
const PAYMENT_METHODS = new Set<PaymentMethod>(
  PAYMENT_METHOD_OPTIONS.map(({ value }) => value),
);

type ValidationResult<T> =
  | { success: true; data: T }
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

export function validateCollectionForm(
  formData: FormData,
): ValidationResult<CollectionMutationValues> {
  const jobId = String(formData.get("jobId") ?? "").trim();
  const dueDate = String(formData.get("dueDate") ?? "").trim();
  const amount = normalizeAmount(formData.get("amount"));

  if (!isUuid(jobId)) return { success: false, message: "Geçerli bir iş seçin." };
  if (!amount) {
    return {
      success: false,
      message: "Tutar sıfırdan büyük, en fazla iki ondalıklı ve izin verilen sınırlar içinde olmalıdır.",
    };
  }
  if (!isValidDate(dueDate)) return { success: false, message: "Geçerli bir vade tarihi girin." };

  return { success: true, data: { jobId, amount, dueDate } };
}

export function validateMarkCollectionPaidForm(
  formData: FormData,
): ValidationResult<MarkCollectionPaidValues> {
  const collectionId = String(formData.get("collectionId") ?? "").trim();
  const paidDate = String(formData.get("paidDate") ?? "").trim();
  const paymentMethod = String(formData.get("paymentMethod") ?? "").trim() as PaymentMethod;

  if (!isUuid(collectionId)) return { success: false, message: "Geçerli bir tahsilat seçin." };
  if (!isValidDate(paidDate)) return { success: false, message: "Geçerli bir ödeme tarihi girin." };
  if (!PAYMENT_METHODS.has(paymentMethod)) {
    return { success: false, message: "Geçerli bir ödeme yöntemi seçin." };
  }

  return { success: true, data: { collectionId, paidDate, paymentMethod } };
}
