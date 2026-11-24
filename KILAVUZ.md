# Chaple Studio kılavuzu

## Yeni iş eklemek

1. Afişi hazırla: 1920×900, konu sağda, sol yarı sakin. `src/assets/afisler/<ad>.jpg`.
2. Dosyayı oluştur:

```bash
npm run yeni -- isler "Oyunumun Adı"
```

3. `src/content/isler/` içindeki dosyayı doldur, `taslak: true` satırını sil. Ekran görüntüleri `src/assets/isler/<ad>/` klasörüne.

Ana sayfa, liste, RSS ve site haritası kendiliğinden güncellenir. Eksik ya da okunmayan bir şey derlemeyi durdurur.

## Projenin görünümü

İçerikteki `gorunum` alanı:

- `zemin`, `yazi`, `vurgu`, `vurguYazi`: dört renk (`#rrggbb`). Karşıtlık denetlenir.
- `tip`: adın yazı tipi, `src/temalar/tipler.ts` listesinden. `boy` ve `en` uzun adlarda küçültmek ya da iki satıra kırmak için.
- `odak`: dar dilimde afişin hangi parçası görünsün (0 sol, 100 sağ). `merkez`: içine girerken yakınlaşılan nokta. `kafa`: proje sayfasının üstündeki dikey yer.

`kisa` adın altındaki iki üç kelimedir. `sira` kategorideki yeridir; verilmeyen en sona, yeniden eskiye dizilir. `serit` sayfanın ortasına geniş çizim ve adımlar koyar (örnek: Rowl Engine). Açılışta görünen iş `src/site.ts` içindeki `vitrin`dir.

**Kendi sitesi olan proje:** hazır siteyi `public/<yol>/` klasörüne koy, içeriğe `kendiSitesi: /<yol>/` yaz. İçine girilince o site açılır. O sitede dönüş için `/#isler/<dosya-adı>` bağlantısı yeter.

**Calradya Kodeksi** (`public/bannerlord/`) elle düzenlenmez: `python3 araclar/kodeks-al.py <bannerlord deposu>` üretir. İndirme düğmesi yalnız özel linkle açılır; dosya değişince `araclar/kodeks-indirme.json` içindeki özet, boy ve SHA-256 güncellenir. Dosya kimliği bu depoya yazılmaz.

## Kategori ve etiket

- **Kategori işin ne olduğunu söyler**: `src/turler/is/kategoriler.ts`. Yeni kategori bir satır; ana sayfadaki büyük kelime kendiliğinden gelir.
- **Etiket neyle, nerede çalıştığını söyler**: `src/etiketler.ts`. Her işte en az bir tür, bir dil ve bir platform etiketi zorunlu. Künyede ve `/isler/` aramasında kullanılır.

## Yeni bölüm açmak (blog gibi)

`src/site.ts` içinde bölüm listesine satır ekle. Günlük bölümü hazır: `acik: false` olan satırı `true` yap, sonra:

```bash
npm run yeni -- gunluk "İlk yazım"
```

## Yeni içerik türü (müzik, çizim…)

1. `src/turler/semalar.ts`: alanları tanımla.
2. `src/kutuphane/kayit.ts`: `VeriTipleri` ve `tureOzel`e ekle (kümesi, sırası, tarihi).
3. `src/turler/<tür>/Liste.astro` ve `Detay.astro`; `src/pages/[bolum]/` içindeki iki dosyada çağır.

Eksik bırakılan adımı tip denetimi söyler.

## Adres değiştirmek

İçeriğin dosya adını değiştirirsen eskisini `eskiAdresler: [isler/eski-ad]` olarak yaz. Eski link yenisine gider.

## Denetim ve yayın

```bash
npm run denetle
```

Tip, şema, kırık bağlantı, taşma, hizalama, erişilebilirlik, güvenlik ilkesi, arama ve her tıklamada animasyonun oynadığını gerçek Chrome'da dener. `main` dalına gönderilen her değişiklik GitHub'da aynı denetimden geçer, geçerse chaplestudio.github.io yayınlanır. Yedek adres:

```bash
npm run yayinla:cloudflare
```
