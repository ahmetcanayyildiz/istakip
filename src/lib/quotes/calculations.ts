import type { QuoteTotals } from "@/lib/quotes/types";

type DecimalValue = number | string;

type QuoteCalculationInput = {
  items: Array<{ quantity: DecimalValue; unitPrice: DecimalValue }>;
  discountAmount: DecimalValue;
  vatRate: DecimalValue;
};

const DECIMAL_PATTERN = /^-?\d+(?:[.,]\d+)?$/;

function toScaledInteger(value: DecimalValue, fractionDigits: number) {
  const source = typeof value === "number" ? value.toFixed(fractionDigits + 1) : value.trim();
  const normalized = source.replace(",", ".");

  if (!DECIMAL_PATTERN.test(normalized)) return 0;

  const negative = normalized.startsWith("-");
  const unsigned = negative ? normalized.slice(1) : normalized;
  const [wholePart, fractionPart = ""] = unsigned.split(".");
  const paddedFraction = `${fractionPart}${"0".repeat(fractionDigits + 1)}`;
  const keptFraction = paddedFraction.slice(0, fractionDigits);
  const roundingDigit = Number(paddedFraction[fractionDigits] ?? "0");
  const scale = 10 ** fractionDigits;
  let result = Number(wholePart) * scale + Number(keptFraction || "0");

  if (roundingDigit >= 5) result += 1;
  return negative ? -result : result;
}

export function calculateLineTotalCents(quantity: DecimalValue, unitPrice: DecimalValue) {
  const quantityThousandths = toScaledInteger(quantity, 3);
  const unitPriceCents = toScaledInteger(unitPrice, 2);
  return Math.round((quantityThousandths * unitPriceCents) / 1000);
}

export function calculateQuoteTotals({
  items,
  discountAmount,
  vatRate,
}: QuoteCalculationInput): QuoteTotals {
  const subtotalCents = items.reduce(
    (total, item) => total + calculateLineTotalCents(item.quantity, item.unitPrice),
    0,
  );
  const discountCents = Math.max(0, toScaledInteger(discountAmount, 2));
  const netTotalCents = Math.max(0, subtotalCents - discountCents);
  const vatBasisPoints = Math.max(0, toScaledInteger(vatRate, 2));
  const vatCents = Math.round((netTotalCents * vatBasisPoints) / 10_000);

  return {
    subtotalCents,
    discountCents,
    netTotalCents,
    vatCents,
    grandTotalCents: netTotalCents + vatCents,
  };
}

export function centsToAmount(cents: number) {
  return cents / 100;
}
