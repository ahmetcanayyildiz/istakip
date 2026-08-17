// GEÇİCİ: Müşteriler modülünün sahte verisidir.
// Veritabanı aşamasında bu dosya gerçek sorgularla değiştirilecektir.
// Kayıtlar dashboard'daki iş/teklif kodlarıyla tutarlıdır.

import type { StatusLabel } from "@/lib/mock-dashboard";

export type CustomerStatus = "Aktif" | "Pasif";

export type CustomerJob = {
  code: string;
  title: string;
  status: StatusLabel;
  amount: number;
  date: string;
};

export type CustomerQuote = {
  code: string;
  title: string;
  status: StatusLabel;
  amount: number;
  date: string;
};

export type Customer = {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  status: CustomerStatus;
  activeJobs: number;
  totalJobs: number;
  totalRevenue: number;
  pendingPayment: number;
  lastActivity: string;
  jobs: CustomerJob[];
  quotes: CustomerQuote[];
};

export const CUSTOMERS: Customer[] = [
  {
    id: "aydin-mobilya",
    name: "Aydın Mobilya",
    contact: "Serkan Aydın",
    phone: "0532 418 22 07",
    email: "serkan@aydinmobilya.com.tr",
    address: "Organize Sanayi Bölgesi 4. Cadde No: 12, Nilüfer",
    city: "Bursa",
    status: "Aktif",
    activeJobs: 1,
    totalJobs: 7,
    totalRevenue: 318400,
    pendingPayment: 32250,
    lastActivity: "14.08.2026",
    jobs: [
      {
        code: "IS-2026-041",
        title: "Mağaza aydınlatma yenileme",
        status: "Devam ediyor",
        amount: 64500,
        date: "14.08.2026",
      },
      {
        code: "IS-2026-022",
        title: "Showroom vitrin montajı",
        status: "Tamamlandı",
        amount: 87000,
        date: "19.06.2026",
      },
      {
        code: "IS-2026-009",
        title: "Depo zemin kaplama",
        status: "Tamamlandı",
        amount: 52300,
        date: "27.03.2026",
      },
    ],
    quotes: [
      {
        code: "TKL-2026-117",
        title: "Mağaza aydınlatma yenileme",
        status: "Onaylandı",
        amount: 77400,
        date: "12.08.2026",
      },
      {
        code: "TKL-2026-104",
        title: "İkinci kat tadilat",
        status: "Beklemede",
        amount: 41000,
        date: "24.07.2026",
      },
    ],
  },
  {
    id: "kaya-insaat",
    name: "Kaya İnşaat",
    contact: "Emre Kaya",
    phone: "0533 207 65 41",
    email: "emre.kaya@kayainsaat.com",
    address: "Çankaya Mahallesi Atatürk Bulvarı No: 148/6",
    city: "Ankara",
    status: "Aktif",
    activeJobs: 1,
    totalJobs: 5,
    totalRevenue: 462000,
    pendingPayment: 45000,
    lastActivity: "11.08.2026",
    jobs: [
      {
        code: "IS-2026-040",
        title: "Şantiye elektrik tesisatı",
        status: "Devam ediyor",
        amount: 128000,
        date: "11.08.2026",
      },
      {
        code: "IS-2026-018",
        title: "Ofis konteyner kurulumu",
        status: "Tamamlandı",
        amount: 96500,
        date: "05.05.2026",
      },
    ],
    quotes: [
      {
        code: "TKL-2026-115",
        title: "Şantiye elektrik tesisatı",
        status: "Onaylandı",
        amount: 144000,
        date: "07.08.2026",
      },
      {
        code: "TKL-2026-099",
        title: "B blok kaba inşaat desteği",
        status: "Gönderildi",
        amount: 215000,
        date: "18.07.2026",
      },
    ],
  },
  {
    id: "deniz-kafe",
    name: "Deniz Kafe",
    contact: "Deniz Yalçın",
    phone: "0555 934 18 76",
    email: "info@denizkafe.com",
    address: "Alsancak Kıbrıs Şehitleri Caddesi No: 61",
    city: "İzmir",
    status: "Aktif",
    activeJobs: 0,
    totalJobs: 3,
    totalRevenue: 74600,
    pendingPayment: 0,
    lastActivity: "08.08.2026",
    jobs: [
      {
        code: "IS-2026-039",
        title: "Mutfak havalandırma montajı",
        status: "Tamamlandı",
        amount: 37250,
        date: "08.08.2026",
      },
      {
        code: "IS-2026-015",
        title: "Teras aydınlatma kurulumu",
        status: "Tamamlandı",
        amount: 21400,
        date: "22.04.2026",
      },
    ],
    quotes: [
      {
        code: "TKL-2026-110",
        title: "Mutfak havalandırma montajı",
        status: "Onaylandı",
        amount: 44700,
        date: "30.07.2026",
      },
    ],
  },
  {
    id: "yilmaz-tekstil",
    name: "Yılmaz Tekstil",
    contact: "Hatice Yılmaz",
    phone: "0542 611 30 92",
    email: "hatice@yilmaztekstil.com.tr",
    address: "Denizli OSB 8. Sokak No: 3",
    city: "Denizli",
    status: "Aktif",
    activeJobs: 0,
    totalJobs: 4,
    totalRevenue: 208900,
    pendingPayment: 95000,
    lastActivity: "05.08.2026",
    jobs: [
      {
        code: "IS-2026-038",
        title: "Depo raf sistemi kurulumu",
        status: "Beklemede",
        amount: 95000,
        date: "05.08.2026",
      },
      {
        code: "IS-2026-011",
        title: "Üretim hattı elektrik bakımı",
        status: "Tamamlandı",
        amount: 62400,
        date: "02.04.2026",
      },
    ],
    quotes: [
      {
        code: "TKL-2026-108",
        title: "Depo raf sistemi kurulumu",
        status: "Onaylandı",
        amount: 95000,
        date: "26.07.2026",
      },
    ],
  },
  {
    id: "ege-otomotiv",
    name: "Ege Otomotiv",
    contact: "Murat Şahin",
    phone: "0505 288 47 13",
    email: "murat.sahin@egeotomotiv.com",
    address: "Bornova Sanayi Sitesi 12. Blok No: 9",
    city: "İzmir",
    status: "Aktif",
    activeJobs: 0,
    totalJobs: 6,
    totalRevenue: 154300,
    pendingPayment: 12800,
    lastActivity: "01.08.2026",
    jobs: [
      {
        code: "IS-2026-037",
        title: "Servis alanı boya işleri",
        status: "Tamamlandı",
        amount: 41800,
        date: "01.08.2026",
      },
      {
        code: "IS-2026-020",
        title: "Yağ değişim istasyonu düzenlemesi",
        status: "Tamamlandı",
        amount: 33500,
        date: "12.05.2026",
      },
    ],
    quotes: [
      {
        code: "TKL-2026-101",
        title: "Servis alanı boya işleri",
        status: "Onaylandı",
        amount: 41800,
        date: "21.07.2026",
      },
    ],
  },
  {
    id: "marmara-lojistik",
    name: "Marmara Lojistik",
    contact: "Elif Demirkan",
    phone: "0546 750 19 28",
    email: "elif.demirkan@marmaralojistik.com",
    address: "Gebze Plastikçiler OSB 2. Cadde No: 27",
    city: "Kocaeli",
    status: "Aktif",
    activeJobs: 1,
    totalJobs: 2,
    totalRevenue: 96000,
    pendingPayment: 24000,
    lastActivity: "15.08.2026",
    jobs: [
      {
        code: "IS-2026-036",
        title: "Yükleme rampası bakımı",
        status: "Devam ediyor",
        amount: 48000,
        date: "29.07.2026",
      },
    ],
    quotes: [
      {
        code: "TKL-2026-118",
        title: "Antrepo aydınlatma projesi",
        status: "Gönderildi",
        amount: 57600,
        date: "15.08.2026",
      },
    ],
  },
  {
    id: "sonmez-market",
    name: "Sönmez Market",
    contact: "Kemal Sönmez",
    phone: "0532 903 55 64",
    email: "kemal@sonmezmarket.com",
    address: "Bağcılar Merkez Mahallesi 1512. Sokak No: 4",
    city: "İstanbul",
    status: "Aktif",
    activeJobs: 0,
    totalJobs: 2,
    totalRevenue: 47200,
    pendingPayment: 0,
    lastActivity: "10.08.2026",
    jobs: [
      {
        code: "IS-2026-029",
        title: "Soğutucu reyon bakımı",
        status: "Tamamlandı",
        amount: 26700,
        date: "24.06.2026",
      },
    ],
    quotes: [
      {
        code: "TKL-2026-116",
        title: "Reyon yenileme çalışması",
        status: "Beklemede",
        amount: 28500,
        date: "10.08.2026",
      },
    ],
  },
  {
    id: "bati-yapi-market",
    name: "Batı Yapı Market",
    contact: "Onur Batı",
    phone: "0553 471 82 30",
    email: "onur@batiyapimarket.com",
    address: "Altıeylül Paşaalanı Mahallesi 5. Sokak No: 18",
    city: "Balıkesir",
    status: "Pasif",
    activeJobs: 0,
    totalJobs: 1,
    totalRevenue: 18900,
    pendingPayment: 0,
    lastActivity: "03.08.2026",
    jobs: [
      {
        code: "IS-2025-214",
        title: "Kasa alanı elektrik revizyonu",
        status: "Tamamlandı",
        amount: 18900,
        date: "16.11.2025",
      },
    ],
    quotes: [
      {
        code: "TKL-2026-114",
        title: "Depo raf ve etiket sistemi",
        status: "Reddedildi",
        amount: 37440,
        date: "03.08.2026",
      },
    ],
  },
  {
    id: "kuzey-cam-sistemleri",
    name: "Kuzey Cam Sistemleri",
    contact: "Selin Kuzey",
    phone: "0544 126 74 09",
    email: "selin.kuzey@kuzeycam.com.tr",
    address: "Sancaktepe Sanayi Mahallesi 3. Cadde No: 55",
    city: "İstanbul",
    status: "Pasif",
    activeJobs: 0,
    totalJobs: 3,
    totalRevenue: 129500,
    pendingPayment: 0,
    lastActivity: "18.02.2026",
    jobs: [
      {
        code: "IS-2026-004",
        title: "Cephe cam montaj desteği",
        status: "Tamamlandı",
        amount: 74500,
        date: "18.02.2026",
      },
    ],
    quotes: [
      {
        code: "TKL-2026-021",
        title: "Cephe cam montaj desteği",
        status: "Onaylandı",
        amount: 74500,
        date: "04.02.2026",
      },
    ],
  },
  {
    id: "oz-demir-metal",
    name: "Öz Demir Metal",
    contact: "Hüseyin Demir",
    phone: "0531 660 24 85",
    email: "huseyin@ozdemirmetal.com",
    address: "Konya Büyükkayacık OSB 14. Sokak No: 7",
    city: "Konya",
    status: "Pasif",
    activeJobs: 0,
    totalJobs: 0,
    totalRevenue: 0,
    pendingPayment: 0,
    lastActivity: "09.01.2026",
    jobs: [],
    quotes: [],
  },
];

export const getCustomerById = (id: string) =>
  CUSTOMERS.find((customer) => customer.id === id);
