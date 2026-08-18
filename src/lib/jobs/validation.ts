import { isUuid } from "@/lib/customers/validation";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type JobConversionValidationResult =
  | { success: true; data: { quoteId: string; startDate: string; targetDate: string } }
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

export function validateJobConversion(
  quoteId: string,
  formData: FormData,
): JobConversionValidationResult {
  const startDate = String(formData.get("startDate") ?? "").trim();
  const targetDate = String(formData.get("targetDate") ?? "").trim();

  if (!isUuid(quoteId)) {
    return { success: false, message: "Teklif bulunamadı." };
  }

  if (!startDate || !targetDate) {
    return { success: false, message: "Başlangıç ve hedef tarihleri zorunludur." };
  }

  if (!isValidDate(startDate) || !isValidDate(targetDate) || targetDate < startDate) {
    return { success: false, message: "Geçerli bir başlangıç ve hedef tarihi girin." };
  }

  return { success: true, data: { quoteId, startDate, targetDate } };
}

