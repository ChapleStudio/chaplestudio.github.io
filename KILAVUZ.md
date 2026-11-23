# Chaple Studio kılavuzu

## Yeni iş eklemek

```bash
npm run yeni -- isler "Oyunumun Adı"
```

`src/content/isler/` içinde hazır bir dosya oluşur. Doldur, `taslak: true` satırını sil. Ekran görüntülerini `src/assets/isler/<ad>/` klasörüne koy. Düğümü ağaçta kendiliğinden yerini alır; liste, süzgeç, RSS ve site haritası kendiliğinden güncellenir.

## Kategori ve etiket

- **Kategori işin ne olduğunu söyler** ve ağacın dalıdır: `src/turler/is/kategoriler.ts`. Yeni kategori buraya bir satır; dal, renk ve menü kendiliğinden gelir. `altlar` alt dallardır.
- **Etiket neyle, nerede, nasıl olduğunu söyler**: `src/etiketler.ts`. Beş grup var: türü, özellikleri, yapıldığı araç, yazılım dili, platform. Her işte en az bir tür, bir dil ve bir platform etiketi zorunlu. Sözlükte olmayan etiket derlemeyi durdurur.
- Etiket eklenince sayfası (`/etiket/<ad>/`), ağaçtaki süzgeci ve liste süzgeci kendiliğinden oluşur.

## Düğümün canlı sahnesi

`sahne:` alanına `src/tuval/sahne-kimlikleri.ts` içindeki adlardan birini yaz. Boş bırakırsan ada özgü bir desen çizilir. Yeni sahne için adı oraya, çizimi `src/tuval/sahneler.ts` içine ekle.

## Yeni bölüm açmak (blog gibi)

`src/site.ts` içinde bölüm listesine satır ekle. Günlük bölümü hazır: `acik: false` olan satırı `true` yap, sonra:

```bash
npm run yeni -- gunluk "İlk yazım"
```

## Yeni içerik türü (müzik, çizim…)

1. `src/turler/semalar.ts`: alanları tanımla.
2. `src/kutuphane/kayit.ts`: `VeriTipleri` ve `dugumBilgisi`ne ekle (hangi dala asılacağı, rengi, ikonu).
3. `src/turler/<tür>/Liste.astro` ve `Detay.astro`; `src/pages/[bolum]/` içindeki iki dosyada çağır.

Eksik bırakılan adımı tip denetimi söyler.

## Adres değiştirmek

İçeriğin dosya adını değiştirirsen eskisini `eskiAdresler: [isler/eski-ad]` olarak yaz. Eski link yenisine gider.

## Denetim ve yayın

```bash
npm run denetle
```

Tip, şema, kırık bağlantı, taşma, erişilebilirlik, güvenlik ilkesi ve süzgeci gerçek Chrome'da dener. `main` dalına gönderilen her değişiklik GitHub'da aynı denetimden geçer, geçerse chaplestudio.github.io yayınlanır. Yedek adres:

```bash
npm run yayinla:cloudflare
```
