const currencyFormatter = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export const formatCurrency = (value: number) => currencyFormatter.format(value);

export const formatDate = (value: string) =>
  dateFormatter.format(new Date(`${value}T00:00:00`));

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
