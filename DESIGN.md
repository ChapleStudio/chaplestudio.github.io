# Chaple Studio tasarım kuralları

## Fikir

Site toprağın altına inen **kökler**: Chaple Studio yüzeyde, kategoriler kalın kökler, projeler köklerin ucundaki dünyalar. Her dal yukarıdan aşağı iner; içerik büyüdükçe kökler uzar. Yerleşim `src/kutuphane/agac.ts` içinde hesaplanır. Elle yakınlaştırma yoktur; tekerlek dikey kaydırır, dala tıklayınca kamera ona uçar, projenin içine girilir.

**Stüdyo tek kalıp dayatmaz.** Her proje kendi temasını taşıyabilir: düğümü ağaçta o temayla görünür, içine girince bütün sayfa onun dünyasıdır.

## Stüdyonun rengi

Gece toprağı: mürdüm zemin `#1d1218`, toprak `#24161c`, kemik yazı `#f2e6da`. Kök boyaları: mercan (Oyunlar), altın (Oyun geliştirme), leylak (Yapay zekâ), adaçayı (Sistem ve donanım), gök (Kişiselleştirme), bakır (Bildirim araçları). Listede olmayan renk yalnız bir temanın içinde kullanılır.

## Yazı

Başlık Grenze 600-700 (el kesimi, oyun kutusu havası), metin Alegreya Sans 400/500/700. Temalar kendi yazısını getirir: Rowl'da Piazzolla, Fairy of Light'ta Grandstander.

## Biçim

- Köşeler eşit değil, elle kesilmiş gibi (`--kose`). Hap biçimi, cam, parlama, renk lekesi, süzülen toz, noktalı ızgara yok.
- Kökler kalınlığı azalan, kıvrımlı şekillerdir; çizgi değildir.
- Etiketler sol ucu kesik bez etiket biçimindedir.
- Düğümlerde ne yaptığını anlatan küçük canlı sahne oynar; gerçek ekran görüntüleri proje sayfasındadır.

## Temalar

| Tema | Proje | Dünya |
|---|---|---|
| studyo | varsayılan | Gece toprağı |
| rowl | Rowl Engine | Mor perde, sahne ve görsel roman konuşma kutusu |
| peri | Fairy of Light | Alacakaranlık ormanı, ışık yalnız periden gelir |

## Hareket

- Açılışta kökler aşağı doğru büyür, bir kez.
- Köklerin içinde özsu ağır ağır iner; seçilen dal kendi rengine boyanır, ötekiler kararır.
- Kamera yolu yakınlaşmayı ve kaydırmayı birlikte yapar (van Wijk).
- Girişte düğümün sahnesi ekranı kaplar, çıkışta aynı yoldan geri döner.
- `prefers-reduced-motion` hepsini kapatır.
- Enerji: bütün döngüler `src/tuval/tempo.ts` üzerinden zamanlanır. Etkileşimde 60, boşta 12 kare/sn; 25 saniye dokunulmazsa, pencere arkadaysa ya da gizliyse hiç çizilmez. Yeni efekt kendi `requestAnimationFrame` döngüsünü açmaz.

## Erişim

Ağaç gerçek bir bağlantı listesidir. Telefonda kök ve kategoriler tek ekrandadır, dokunulan dal açılır. JavaScript yoksa bütün dallar açık akar. Ok tuşları düğümler arasında gezer, Esc bir kat çıkar, her projenin kendi adresi vardır.
