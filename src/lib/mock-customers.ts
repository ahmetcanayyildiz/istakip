// GEÇİCİ: Müşteri kimlik ve iletişim mock verileridir.
// Finansal alanlar JOBS, EXPENSES ve COLLECTIONS üzerinden hesaplanır.

export type CustomerStatus = "Aktif" | "Pasif";

export type Customer = {
  id: string;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  status: CustomerStatus;
  lastActivity: string;
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
    lastActivity: "14.08.2026",
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
    lastActivity: "11.08.2026",
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
    lastActivity: "08.08.2026",
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
    lastActivity: "05.08.2026",
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
    lastActivity: "01.08.2026",
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
    lastActivity: "15.08.2026",
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
    lastActivity: "10.08.2026",
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
    lastActivity: "03.08.2026",
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
    lastActivity: "18.02.2026",
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
    lastActivity: "09.01.2026",
  },
];

export const getCustomerById = (id: string) =>
  CUSTOMERS.find((customer) => customer.id === id);
