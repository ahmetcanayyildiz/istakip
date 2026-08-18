import { isUuid } from "@/lib/customers/validation";
import {
  QUOTE_FIELD_LIMITS,
  QUOTE_STATUS_OPTIONS,
  type QuoteMutationValues,
  type QuoteRpcItem,
  type QuoteStatus,
} from "@/lib/quotes/types";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const QUOTE_STATUSES = new Set<QuoteStatus>(QUOTE_STATUS_OPTIONS.map(({ value }) => value));
const ZERO = BigInt(0);
const NUMERIC_14_2_MAX = BigInt("99999999999999");
const NUMERIC_14_3_MAX = BigInt("99999999999999");
const VAT_RATE_MAX = BigInt("10000");

type QuoteValidationResult =
  | { success: true; data: QuoteMutationValues }
  | { success: false; message: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

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

function normalizeDecimal(
  value: unknown,
  fractionDigits: number,
  maximumScaledValue: bigint,
  allowZero: boolean,
) {
  if (typeof value !== "string") return null;

  const normalized = value.trim().replace(",", ".");
  if (normalized.length > 32) return null;
  const pattern = new RegExp(`^\\d+(?:\\.\\d{1,${fractionDigits}})?$`);
  if (!pattern.test(normalized)) return null;

  const [wholePart, fractionPart = ""] = normalized.split(".");
  const scaledValue = BigInt(`${wholePart}${fractionPart.padEnd(fractionDigits, "0")}`);
  if ((!allowZero && scaledValue === ZERO) || scaledValue > maximumScaledValue) return null;

  return normalized;
}

function validateItems(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return { success: false as const, message: "En az bir teklif kalemi ekleyin." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(value);
  } catch {
    return { success: false as const, message: "Teklif kalemleri okunamadı. Lütfen tekrar deneyin." };
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return { success: false as const, message: "En az bir teklif kalemi ekleyin." };
  }
  if (parsed.length > QUOTE_FIELD_LIMITS.itemCount) {
    return { success: false as const, message: "Teklif kalemi sayısı izin verilen sınırı aşıyor." };
  }

  const items: QuoteRpcItem[] = [];
  for (let index = 0; index < parsed.length; index += 1) {
    const item = parsed[index];
    if (!isRecord(item)) {
      return { success: false as const, message: `${index + 1}. teklif kalemi geçersiz.` };
    }

    const description = typeof item.description === "string" ? item.description.trim() : "";
    const unit = typeof item.unit === "string" ? item.unit.trim() : "";
    if (!description) {
      return { success: false as const, message: `${index + 1}. kalem açıklaması zorunludur.` };
    }
    if (description.length > QUOTE_FIELD_LIMITS.itemDescription) {
      return { success: false as const, message: `${index + 1}. kalem açıklaması en fazla ${QUOTE_FIELD_LIMITS.itemDescription} karakter olabilir.` };
    }
    if (!unit) {
      return { success: false as const, message: `${index + 1}. kalem birimi zorunludur.` };
    }
    if (unit.length > QUOTE_FIELD_LIMITS.itemUnit) {
      return { success: false as const, message: `${index + 1}. kalem birimi en fazla ${QUOTE_FIELD_LIMITS.itemUnit} karakter olabilir.` };
    }

    const quantity = normalizeDecimal(item.quantity, 3, NUMERIC_14_3_MAX, false);
    if (!quantity) {
      return { success: false as const, message: `${index + 1}. kalem için geçerli bir miktar girin.` };
    }

    const unitPrice = normalizeDecimal(item.unit_price, 2, NUMERIC_14_2_MAX, true);
    if (!unitPrice) {
      return { success: false as const, message: `${index + 1}. kalem için geçerli bir birim fiyat girin.` };
    }

    items.push({ description, quantity, unit, unit_price: unitPrice });
  }

  return { success: true as const, data: items };
}

export function validateQuoteForm(formData: FormData): QuoteValidationResult {
  const customerId = String(formData.get("customerId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const issueDate = String(formData.get("issueDate") ?? "").trim();
  const validUntil = String(formData.get("validUntil") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim() as QuoteStatus;
  const notes = String(formData.get("notes") ?? "").trim();

  if (!isUuid(customerId)) return { success: false, message: "Geçerli bir müşteri seçin." };
  if (!title) return { success: false, message: "Teklif başlığı zorunludur." };
  if (title.length > QUOTE_FIELD_LIMITS.title) {
    return { success: false, message: `Teklif başlığı en fazla ${QUOTE_FIELD_LIMITS.title} karakter olabilir.` };
  }
  if (!isValidDate(issueDate) || !isValidDate(validUntil) || validUntil < issueDate) {
    return { success: false, message: "Geçerli bir teklif ve geçerlilik tarihi girin." };
  }
  if (!QUOTE_STATUSES.has(status)) {
    return { success: false, message: "Geçerli bir teklif durumu seçin." };
  }
  if (notes.length > QUOTE_FIELD_LIMITS.notes) {
    return { success: false, message: `Teklif notu en fazla ${QUOTE_FIELD_LIMITS.notes} karakter olabilir.` };
  }

  const discountAmount = normalizeDecimal(
    formData.get("discountAmount"),
    2,
    NUMERIC_14_2_MAX,
    true,
  );
  if (!discountAmount) return { success: false, message: "Geçerli bir indirim tutarı girin." };

  const vatRate = normalizeDecimal(formData.get("vatRate"), 2, VAT_RATE_MAX, true);
  if (!vatRate) return { success: false, message: "KDV oranı 0 ile 100 arasında olmalıdır." };

  const items = validateItems(formData.get("items"));
  if (!items.success) return items;

  return {
    success: true,
    data: {
      customerId,
      title,
      issueDate,
      validUntil,
      status,
      discountAmount,
      vatRate,
      notes,
      items: items.data,
    },
  };
}
