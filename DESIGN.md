# Chaple Studio tasarım kuralları

## Fikir

Site yukarıdan aşağı dallanan bir **düğüm ağacı**: Chaple Studio → (bölüm) → dal → proje. Rowl Engine'in hikâye tuvalinden gelir. Dala tıklayınca kamera ona uçar, projeye tıklayınca düğüm ekranı kaplar ve içine girilir. İçerik büyüdükçe ağaç büyür; yerleşim `src/kutuphane/agac.ts` içinde hesaplanır, elle konum verilmez.

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
| altın | `#e0b06c` | Motorlar |
| adaçayı | `#86bfa6` | Masaüstü |
| leylak | `#a9a7ee` | Mobil ve tarayıcı |

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

## Erişim

Ağaç gerçek bir bağlantı listesidir. JavaScript yoksa ve telefonda yukarıdan aşağı akar. Ok tuşları düğümler arasında gezer, Esc bir kat çıkar, her projenin kendi adresi vardır.
