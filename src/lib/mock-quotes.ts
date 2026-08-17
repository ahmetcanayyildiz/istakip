// GEÇİCİ: Teklifler modülünün sahte verisidir.
// Veritabanı aşamasında bu dosya gerçek sorgularla değiştirilecektir.

export type QuoteStatus =
  | "Taslak"
  | "Gönderildi"
  | "Beklemede"
  | "Onaylandı"
  | "Reddedildi";

export type QuoteItem = {
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
};

export type Quote = {
  id: string;
  code: string;
  customer: {
    id: string;
    name: string;
    contact: string;
    phone: string;
    email: string;
  };
  title: string;
  status: QuoteStatus;
  createdAt: string;
  validUntil: string;
  updatedAt: string;
  items: QuoteItem[];
  discount: number;
  vatRate: number;
  notes: string[];
};

export type QuoteTotals = {
  subtotal: number;
  discount: number;
  netTotal: number;
  vat: number;
  grandTotal: number;
};

export const calculateQuoteTotals = (quote: Quote): QuoteTotals => {
  const subtotal = quote.items.reduce(
    (total, item) => total + item.quantity * item.unitPrice,
    0,
  );
  const taxableAmount = subtotal - quote.discount;
  const vat = taxableAmount * (quote.vatRate / 100);

  return {
    subtotal,
    discount: quote.discount,
    netTotal: taxableAmount,
    vat,
    grandTotal: taxableAmount + vat,
  };
};

export const QUOTES: Quote[] = [
  {
    id: "tkl-2026-118",
    code: "TKL-2026-118",
    customer: {
      id: "marmara-lojistik",
      name: "Marmara Lojistik",
      contact: "Elif Demirkan",
      phone: "0546 750 19 28",
      email: "elif.demirkan@marmaralojistik.com",
    },
    title: "Antrepo aydınlatma projesi",
    status: "Gönderildi",
    createdAt: "15.08.2026",
    validUntil: "30.08.2026",
    updatedAt: "16.08.2026",
    items: [
      { description: "Endüstriyel LED armatür", quantity: 20, unit: "adet", unitPrice: 1600 },
      { description: "Kablo ve montaj malzemesi", quantity: 1, unit: "paket", unitPrice: 8000 },
      { description: "Montaj ve devreye alma", quantity: 2, unit: "gün", unitPrice: 5000 },
    ],
    discount: 2000,
    vatRate: 20,
    notes: [
      "Teklif 15 gün geçerlidir.",
      "Montaj çalışmaları işletmenin vardiya planına göre programlanacaktır.",
    ],
  },
  {
    id: "tkl-2026-117",
    code: "TKL-2026-117",
    customer: {
      id: "aydin-mobilya",
      name: "Aydın Mobilya",
      contact: "Serkan Aydın",
      phone: "0532 418 22 07",
      email: "serkan@aydinmobilya.com.tr",
    },
    title: "Mağaza aydınlatma yenileme",
    status: "Onaylandı",
    createdAt: "12.08.2026",
    validUntil: "27.08.2026",
    updatedAt: "14.08.2026",
    items: [
      { description: "LED ray spot", quantity: 18, unit: "adet", unitPrice: 1750 },
      { description: "Vitrin lineer aydınlatma", quantity: 24, unit: "m", unitPrice: 625 },
      { description: "Elektrik altyapı yenileme", quantity: 1, unit: "hizmet", unitPrice: 18000 },
    ],
    discount: 0,
    vatRate: 20,
    notes: [
      "Teklif 15 gün geçerlidir.",
      "Elektrik panosunda ilave revizyon gerekirse ayrıca fiyatlandırılacaktır.",
    ],
  },
  {
    id: "tkl-2026-116",
    code: "TKL-2026-116",
    customer: {
      id: "sonmez-market",
      name: "Sönmez Market",
      contact: "Kemal Sönmez",
      phone: "0532 903 55 64",
      email: "kemal@sonmezmarket.com",
    },
    title: "Reyon yenileme çalışması",
    status: "Beklemede",
    createdAt: "10.08.2026",
    validUntil: "25.08.2026",
    updatedAt: "13.08.2026",
    items: [
      { description: "Reyon raf modülü", quantity: 10, unit: "adet", unitPrice: 1400 },
      { description: "LED fiyat etiketi rayı", quantity: 25, unit: "m", unitPrice: 250 },
      { description: "Kurulum ve hizalama", quantity: 1, unit: "hizmet", unitPrice: 3500 },
    ],
    discount: 0,
    vatRate: 20,
    notes: [
      "Teklif 15 gün geçerlidir.",
      "Uygulama, mağaza kapanış saatlerinden sonra iki etapta yapılacaktır.",
    ],
  },
  {
    id: "tkl-2026-115",
    code: "TKL-2026-115",
    customer: {
      id: "kaya-insaat",
      name: "Kaya İnşaat",
      contact: "Emre Kaya",
      phone: "0533 207 65 41",
      email: "emre.kaya@kayainsaat.com",
    },
    title: "Şantiye elektrik tesisatı",
    status: "Onaylandı",
    createdAt: "07.08.2026",
    validUntil: "22.08.2026",
    updatedAt: "11.08.2026",
    items: [
      { description: "Ana dağıtım panosu", quantity: 2, unit: "adet", unitPrice: 27500 },
      { description: "Enerji ve data kablo hattı", quantity: 350, unit: "m", unitPrice: 140 },
      { description: "Montaj, test ve devreye alma", quantity: 3, unit: "gün", unitPrice: 8000 },
    ],
    discount: 8000,
    vatRate: 20,
    notes: [
      "Teklif 15 gün geçerlidir.",
      "Şantiye içi erişim ve çalışma izinleri müşteri tarafından sağlanacaktır.",
    ],
  },
  {
    id: "tkl-2026-114",
    code: "TKL-2026-114",
    customer: {
      id: "bati-yapi-market",
      name: "Batı Yapı Market",
      contact: "Onur Batı",
      phone: "0553 471 82 30",
      email: "onur@batiyapimarket.com",
    },
    title: "Depo raf ve etiket sistemi",
    status: "Reddedildi",
    createdAt: "03.08.2026",
    validUntil: "18.08.2026",
    updatedAt: "08.08.2026",
    items: [
      { description: "Galvaniz raf modülü", quantity: 12, unit: "adet", unitPrice: 1800 },
      { description: "Raf etiketleme sistemi", quantity: 1, unit: "set", unitPrice: 4800 },
      { description: "Kurulum işçiliği", quantity: 2, unit: "gün", unitPrice: 2400 },
    ],
    discount: 0,
    vatRate: 20,
    notes: [
      "Teklif 15 gün geçerlidir.",
      "Depo zemininin montaja hazır ve boş teslim edilmesi beklenmektedir.",
    ],
  },
  {
    id: "tkl-2026-113",
    code: "TKL-2026-113",
    customer: {
      id: "aydin-mobilya",
      name: "Aydın Mobilya",
      contact: "Serkan Aydın",
      phone: "0532 418 22 07",
      email: "serkan@aydinmobilya.com.tr",
    },
    title: "İkinci kat tadilat ön keşfi",
    status: "Taslak",
    createdAt: "01.08.2026",
    validUntil: "16.08.2026",
    updatedAt: "01.08.2026",
    items: [
      { description: "Uygulama projesi ve keşif", quantity: 1, unit: "hizmet", unitPrice: 12000 },
      { description: "Söküm ve alan hazırlığı", quantity: 1, unit: "hizmet", unitPrice: 8500 },
      { description: "Boya işçiliği", quantity: 95, unit: "m²", unitPrice: 180 },
    ],
    discount: 0,
    vatRate: 20,
    notes: [
      "Taslak çalışma, yerinde ölçüm sonrasında güncellenecektir.",
      "Malzeme fiyat değişiklikleri ayrıca değerlendirilir.",
    ],
  },
  {
    id: "tkl-2026-112",
    code: "TKL-2026-112",
    customer: {
      id: "ege-otomotiv",
      name: "Ege Otomotiv",
      contact: "Murat Şahin",
      phone: "0505 288 47 13",
      email: "murat.sahin@egeotomotiv.com",
    },
    title: "Servis kabul alanı düzenlemesi",
    status: "Gönderildi",
    createdAt: "29.07.2026",
    validUntil: "13.08.2026",
    updatedAt: "05.08.2026",
    items: [
      { description: "Epoksi zemin kaplama", quantity: 80, unit: "m²", unitPrice: 320 },
      { description: "Yönlendirme tabelası", quantity: 6, unit: "adet", unitPrice: 1450 },
      { description: "Uygulama işçiliği", quantity: 2, unit: "gün", unitPrice: 6500 },
    ],
    discount: 1300,
    vatRate: 20,
    notes: [
      "Teklif 15 gün geçerlidir.",
      "Zemin uygulamasından sonra alan 24 saat kullanıma kapalı tutulmalıdır.",
    ],
  },
  {
    id: "tkl-2026-111",
    code: "TKL-2026-111",
    customer: {
      id: "oz-demir-metal",
      name: "Öz Demir Metal",
      contact: "Hüseyin Demir",
      phone: "0531 660 24 85",
      email: "huseyin@ozdemirmetal.com",
    },
    title: "Üretim sahası havalandırma bakımı",
    status: "Reddedildi",
    createdAt: "25.07.2026",
    validUntil: "09.08.2026",
    updatedAt: "02.08.2026",
    items: [
      { description: "Havalandırma kanalı temizliği", quantity: 180, unit: "m", unitPrice: 95 },
      { description: "Fan motoru bakımı", quantity: 4, unit: "adet", unitPrice: 3200 },
      { description: "Endüstriyel filtre", quantity: 8, unit: "adet", unitPrice: 850 },
    ],
    discount: 0,
    vatRate: 20,
    notes: [
      "Teklif 15 gün geçerlidir.",
      "Bakım süresince ilgili üretim hattının durdurulması gerekmektedir.",
    ],
  },
  {
    id: "tkl-2026-110",
    code: "TKL-2026-110",
    customer: {
      id: "deniz-kafe",
      name: "Deniz Kafe",
      contact: "Deniz Yalçın",
      phone: "0555 934 18 76",
      email: "info@denizkafe.com",
    },
    title: "Mutfak havalandırma montajı",
    status: "Onaylandı",
    createdAt: "30.07.2026",
    validUntil: "14.08.2026",
    updatedAt: "08.08.2026",
    items: [
      { description: "Paslanmaz davlumbaz", quantity: 1, unit: "adet", unitPrice: 18500 },
      { description: "Havalandırma kanalı", quantity: 14, unit: "m", unitPrice: 650 },
      { description: "Egzoz fanı", quantity: 1, unit: "adet", unitPrice: 5400 },
      { description: "Montaj işçiliği", quantity: 1, unit: "hizmet", unitPrice: 4250 },
    ],
    discount: 0,
    vatRate: 20,
    notes: [
      "Teklif 15 gün geçerlidir.",
      "Baca çıkışı için gerekli belediye izinleri müşterinin sorumluluğundadır.",
    ],
  },
  {
    id: "tkl-2026-109",
    code: "TKL-2026-109",
    customer: {
      id: "kuzey-cam-sistemleri",
      name: "Kuzey Cam Sistemleri",
      contact: "Selin Kuzey",
      phone: "0544 126 74 09",
      email: "selin.kuzey@kuzeycam.com.tr",
    },
    title: "Showroom bölme cam uygulaması",
    status: "Taslak",
    createdAt: "21.07.2026",
    validUntil: "05.08.2026",
    updatedAt: "21.07.2026",
    items: [
      { description: "Temperli bölme camı", quantity: 45, unit: "m²", unitPrice: 1550 },
      { description: "Paslanmaz bağlantı aksesuarı", quantity: 1, unit: "set", unitPrice: 12500 },
      { description: "Montaj işçiliği", quantity: 3, unit: "gün", unitPrice: 7000 },
    ],
    discount: 3250,
    vatRate: 20,
    notes: [
      "Taslak teklif, nihai ölçü onayı sonrasında kesinleşecektir.",
      "Cam üretimi başladıktan sonra ölçü değişikliği kabul edilemez.",
    ],
  },
];

export const getQuoteById = (id: string) => QUOTES.find((quote) => quote.id === id);
