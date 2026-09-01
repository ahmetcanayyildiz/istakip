# İşTakip — Yedekleme Stratejisi

## Kapsam ve dürüst sınırlar

Supabase **Free** planında zamanlanmış otomatik yedek (PITR / günlük managed
backup) **yoktur**. Bu, ücretli plana bağlı bir özelliktir. Bu dokümandaki
yöntem **manuel / operatör tetiklemeli** bir yedeklemedir.

Otomatik bulut yedeklemesi (ör. GitHub Actions cron) bilinçli olarak
kurulmamıştır çünkü veritabanı şifresinin bir CI secret'ı olarak saklanmasını
gerektirir. Bu, tüm müşteri ve finansal veriye erişebilen kalıcı bir kimlik
bilgisini repoya bağlar. Bu bir güvenlik/operasyon kararıdır — sahte güvenlik
hissi yaratmamak için burada açıkça belirtilmiştir.

**Sonuç:** Yedek alma sıklığı operatörün sorumluluğundadır. Haftalık bir
hatırlatıcı kurulması önerilir.

## Yedek alma

Bağlantı dizesi: Supabase Dashboard → Project Settings → Database →
Connection string → URI.

```sh
# Baştaki boşluk komutu shell geçmişine yazılmaktan korur.
 SUPABASE_DB_URL='postgresql://...' sh scripts/backup-database.sh
```

Script `./backups` altına üç dosya yazar:

| Dosya | İçerik |
| --- | --- |
| `<zaman>_roles.sql` | Rol tanımları |
| `<zaman>_schema.sql` | Şema, RLS politikaları, fonksiyonlar, trigger'lar |
| `<zaman>_data.sql` | Satır verisi |

Doğrudan CLI ile de çalıştırılabilir:

```sh
npx supabase db dump --db-url "$SUPABASE_DB_URL" --role-only -f backups/roles.sql
npx supabase db dump --db-url "$SUPABASE_DB_URL"             -f backups/schema.sql
npx supabase db dump --db-url "$SUPABASE_DB_URL" --data-only -f backups/data.sql
```

## Güvenlik kuralları

- `./backups` **`.gitignore`** içindedir. Yedekler asla commit edilmez.
- Yedek dosyaları tüm müşteri, teklif, iş, gider ve tahsilat kayıtlarını
  düz metin olarak içerir. Repo dışında, şifreli bir konumda saklayın.
- `SUPABASE_DB_URL` asla bir kaynak dosyaya, `.env.example`'a veya commit
  mesajına yazılmaz.
- Veritabanı şifresi bu görevde bilinçli olarak GitHub Actions'a eklenmemiştir.

## Geri yükleme (restore)

Geri yükleme **yıkıcı** bir işlemdir. Önce yeni/boş bir Supabase projesinde
veya local `supabase start` ortamında prova edin.

```sh
psql "$TARGET_DB_URL" -f backups/<zaman>_roles.sql
psql "$TARGET_DB_URL" -f backups/<zaman>_schema.sql
psql "$TARGET_DB_URL" -f backups/<zaman>_data.sql
```

Doğrulama: RLS'in açık kaldığını ve politikaların taşındığını kontrol edin.

```sql
select relname, relrowsecurity from pg_class
where relnamespace = 'public'::regnamespace and relkind = 'r';
```

`relrowsecurity` tüm tablolarda `true` olmalıdır.
