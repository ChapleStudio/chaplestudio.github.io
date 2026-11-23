# Chaple Studio tasarım kuralları

## Fikir

Site yukarıdan aşağı dallanan bir **düğüm ağacı**: Chaple Studio → (bölüm) → kategori → (alt dal) → proje. Kategori amaçtır; platform, dil ve araç etikettir. Rowl Engine'in hikâye tuvalinden gelir. Elle yakınlaştırma ve sürükleme yoktur; tekerlek sayfayı dikey kaydırır. Dala tıklayınca kamera ona uçar, projeye tıklayınca düğüm ekranı kaplar ve içine girilir. İçerik büyüdükçe ağaç büyür; yerleşim `src/kutuphane/agac.ts` içinde hesaplanır, elle konum verilmez.

## Renk

Tek, koyu tema. Renk dalı söyler; listede olmayan renk kullanılmaz.

| Ad | Değer | Görev |
|---|---|---|
| zemin | `#0b0b0b` | Tuval |
| yüzey | `#151413`, `#1f1d1b` | Düğüm, kapsül |
| çizgi | `#3a3631`, `#4d4740` | Kenar |
| kemik | `#e9e3d8` | Metin, kök, yazılar |
| soluk | `#aaa399` | İkincil metin |
| mercan | `#e76f8b` | Oyunlar, fare etkisi |
| altın | `#e6c35c` | Oyun geliştirme |
| leylak | `#a9a7ee` | Yapay zekâ |
| adaçayı | `#86bfa6` | Sistem ve donanım |
| gök | `#7db8e6` | Kişiselleştirme |
| bakır | `#e2935f` | Bildirim araçları |

## Yazı

Schibsted Grotesk, tek aile, siteden sunulur. Başlık 750 ve sıkı, metin 400, en çok 66 karakter. Tamamı büyük harf etiket ve başlık üstü küçük etiket yok.

## Düğüm

Proje düğümünde ekran görüntüsü yerine ne yaptığını anlatan küçük bir canlı sahne oynar. Sahneler 200 birim yüksekliğinde çizilir, yakınlaşınca gerçekten büyür. Gerçek ekran görüntüleri proje sayfasındadır. Üzerinde çalışılan projenin köşesinde nokta durur.

## Hareket

- Açılışta dallar kökten büyür, bir kez.
- Dallarda ışık akar; seçilen dala ışık dalgası iner, ötekiler kararır.
- Kamera yolu yakınlaşmayı ve kaydırmayı birlikte yapar (van Wijk).
- Girişte düğümün sahnesi ekranı kaplar, çıkışta aynı yoldan geri döner.
- `prefers-reduced-motion` hepsini kapatır.
- Enerji: bütün döngüler `src/tuval/tempo.ts` üzerinden zamanlanır. Etkileşimde 60, boşta 12 kare/sn; 25 saniye dokunulmazsa, pencere arkadaysa ya da gizliyse hiç çizilmez. Yeni efekt kendi `requestAnimationFrame` döngüsünü açmaz.

## Erişim

Ağaç gerçek bir bağlantı listesidir. Telefonda kök ve kategoriler tek ekrandadır, dokunulan dal açılır. JavaScript yoksa bütün dallar açık akar. Ok tuşları düğümler arasında gezer, Esc bir kat çıkar, her projenin kendi adresi vardır.
