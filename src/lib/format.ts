const currencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

export const formatCurrency = (value: number) => currencyFormatter.format(value);

// Aramada Türkçe karakter farkı sorun çıkarmasın: "musteri" -> "müşteri" eşleşir.
const TURKISH_MAP: Record<string, string> = {
  ı: "i",
  İ: "i",
  ş: "s",
  Ş: "s",
  ğ: "g",
  Ğ: "g",
  ü: "u",
  Ü: "u",
  ö: "o",
  Ö: "o",
  ç: "c",
  Ç: "c",
};

export const normalizeText = (value: string) =>
  value
    .replace(/[ıİşŞğĞüÜöÖçÇ]/g, (char) => TURKISH_MAP[char])
    .toLowerCase()
    .trim();
