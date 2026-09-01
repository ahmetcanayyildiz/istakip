# Read-only demo kurulumu

İşTakip demo modu, arayüzdeki kısıtlamalara ek olarak veritabanında zorlanan salt-okunur bir tenant'tır. Demo kullanıcısının şirketi `companies.is_demo = true` olduğunda doğrudan tablo istekleri ve `SECURITY DEFINER` iş RPC'leri değişiklik yapamaz.

## Ön koşullar

1. `20260901000100_demo_read_only_mode.sql` migration'ını normal yayın sürecinizle uygulayın.
2. Supabase Dashboard > Authentication > Users bölümünde yalnızca demo için kullanılacak bir e-posta/parola kullanıcısı oluşturun ve e-postayı doğrulanmış olarak işaretleyin.
3. Oluşturulan kullanıcının UUID'sini kopyalayın. Migration ve seed dosyası `auth.users` tablosuna kayıt eklemez.

## Demo verisini bir kez oluşturma

1. `scripts/demo-seed.sql` dosyasının bir kopyasını açın.
2. `__DEMO_USER_ID__` yer tutucusunu kopyaladığınız gerçek Auth UUID'siyle değiştirin.
3. Dosyanın tamamını Supabase SQL Editor'da bir kez çalıştırın.
4. Sorgunun başarıyla tamamlandığını ve şirket kaydında `is_demo = true` olduğunu doğrulayın.

Seed kasıtlı olarak yer tutucu değişmeden çalışmaz. Ayrıca Auth kullanıcısı bulunamazsa veya kullanıcının zaten profili varsa tüm işlemi geri alır. İçerikteki şirketler, kişiler, iletişim bilgileri, işler ve finansal tutarlar tamamen kurgusaldır.

## Sunucu ortam değişkenleri

Uygulamanın çalıştığı sunucu ortamına aşağıdaki iki gizli değeri ekleyin:

```dotenv
DEMO_EMAIL=demo-hesabinin-epostasi
DEMO_PASSWORD=demo-hesabinin-parolasi
```

Bu isimleri `NEXT_PUBLIC_` ile başlatmayın. Değerler tarayıcı paketine konmamalı, repoya yazılmamalı ve loglanmamalıdır. `.env.example` yalnızca boş anahtarları belgeler.

## Doğrulama

- Giriş ekranındaki **Demo'yu Gör** eylemi demo hesabında oturum açar.
- Uygulama demo bandını gösterir; oluşturma, düzenleme, silme, işe dönüştürme ve tahsilatı ödendi işaretleme eylemleri gösterilmez.
- Demo kullanıcısıyla doğrudan Data API/RPC mutation denemeleri `demo_company_read_only` hatasıyla reddedilir.
- Normal bir kullanıcıyla müşteri CRUD ve mevcut teklif/iş/gider/tahsilat akışları değişmeden çalışır.
- Demo seed'i tekrar çalıştırmayın; yenilemek için ayrı ve kontrollü bir bakım prosedürü kullanın.
