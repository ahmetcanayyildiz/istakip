# İşTakip

## Proje Adı

İşTakip (paket adı: `istakip`)

## Projenin Amacı

Türkiye'deki küçük işletmelerin müşteri, teklif, iş, gider ve tahsilat süreçlerini
tek bir web uygulaması üzerinden yönetebilmesini sağlamak.

## Hedef Kullanıcı

- Küçük işletme sahipleri ve esnaf
- Serbest çalışanlar (freelancer)
- Küçük ekipli servis/atölye/taşeron firmaları
- Ayrı bir muhasebe veya ERP yazılımı kullanmayan, işini Excel/WhatsApp/defter ile takip eden işletmeler

## Çözülen Problem

Küçük işletmeler işlerini genellikle dağınık araçlarla takip ediyor: müşteri bilgisi telefonda,
teklif Word/Excel'de, gider fişte, tahsilat defterde. Bunun sonucunda:

- Hangi teklifin onaylandığı ve hangi işin devam ettiği takip edilemiyor
- Tahsil edilmemiş alacaklar unutuluyor
- İş bazında kâr/zarar görülemiyor
- İşletmenin genel durumu tek bir ekranda izlenemiyor

İşTakip bu süreçleri tek bir akış ve tek bir arayüz altında toplar.

## Temel İş Akışı

```
Müşteri → Teklif → İş → Gider → Tahsilat → Dashboard
```

1. **Müşteri** kaydedilir.
2. Müşteriye **teklif** hazırlanır.
3. Onaylanan teklif **iş**e dönüşür.
4. İş sürecinde oluşan **gider**ler işlenir.
5. Müşteriden **tahsilat** alınır.
6. Tüm veriler **Dashboard**'da özetlenir.

## MVP Modülleri

- **Dashboard** — özet metrikler ve genel durum
- **Müşteriler** — müşteri kayıtları ve iletişim bilgileri
- **Teklifler** — teklif oluşturma ve durum takibi
- **İşler** — onaylanan işlerin takibi
- **Giderler** — iş bazlı ve genel giderler
- **Tahsilatlar** — ödeme kayıtları ve kalan bakiye

## MVP Dışında Kalan Özellikler

İlk sürümde **yapılmayacaklar**:

- AI özellikleri
- WhatsApp entegrasyonu
- E-fatura
- Muhasebe entegrasyonları
- Abonelik / ödeme sistemi
- Mobil uygulama

## Kullanılacak Temel Teknolojiler

| Katman | Teknoloji |
| --- | --- |
| Framework | Next.js (App Router) |
| Dil | TypeScript |
| Arayüz | Tailwind CSS |
| Kod kalitesi | ESLint |
| Versiyon kontrol | Git / GitHub |
| Veritabanı (sonraki aşama) | Supabase + PostgreSQL |

Notlar:

- `src/` dizin yapısı kullanılır.
- Import alias: `@/*`
- Supabase, veritabanı aşamasına gelindiğinde eklenecektir; şu an kurulu değildir.

## Geliştirme Sırası

1. **Proje iskeleti** — Next.js + TypeScript + Tailwind + ESLint kurulumu ✅
2. **Git / GitHub** — repo başlatma ve ilk commit
3. **Layout ve navigasyon** — ana yerleşim, kenar menü, sayfa iskeletleri
4. **Statik sayfalar** — 6 modülün boş sayfaları (Dashboard, Müşteriler, Teklifler, İşler, Giderler, Tahsilatlar)
5. **Veri modeli tasarımı** — tablolar ve ilişkiler (kâğıt üzerinde)
6. **Supabase + PostgreSQL** — proje kurulumu ve şema oluşturma
7. **Müşteriler modülü** — ilk uçtan uca CRUD
8. **Teklifler modülü**
9. **İşler modülü**
10. **Giderler modülü**
11. **Tahsilatlar modülü**
12. **Dashboard** — diğer modüllerin verisinden beslenen özet ekran
13. **Kimlik doğrulama** — login / register
14. **Yayına alma** — deploy
