# Chaple Studio tasarım kuralları

## Fikir

Site bir **raf**. Her iş rafta duran bir kutu sırtı, her bölüm (işler, ileride günlük, çizim, müzik…) ayrı bir raf. Yeni iş eklemek rafa kutu koymak, yeni bölüm açmak duvara raf asmaktır. Düzen, içerik büyüdükçe bozulmaz: kutular satıra sığmazsa alttaki tahtaya geçer.

İlk görülen şey slogan değil, rafın kendisidir. Masaüstünde kutular dik durur; telefonda aynı kutular yatık üst üste dizilir.

## Renk

Renk süs değildir, işin **türünü** söyler. Bu listede olmayan renk kullanılmaz.

| Ad | Açık | Koyu | Görev |
|---|---|---|---|
| duvar | `#d9dfe1` | `#20272c` | Sayfa zemini |
| yüzey | `#eef1f2` | `#2a3238` | Form alanı, görsel zemini |
| mürekkep | `#15191d` | `#eef1f2` | Metin, raf tahtası (açık) |
| soluk | `#465058` | `#b3bdc3` | İkincil metin |
| çizgi | `#aab4b9` | `#4a555c` | Ayırıcı |
| zinober | `#c0301d` | `#c93a27` | Oyun |
| lacivert | `#22399b` | `#3f58c8` | Motor ve altyapı |
| çam | `#1d5b45` | `#2a7759` | Masaüstü aracı |
| hardal | `#e6a417` | `#e6a417` | Mobil ve tarayıcı |
| kâğıt | `#f7f8f6` | `#f7f8f6` | Yazı türündeki bölümler |

Zinober, lacivert ve çam üstünde beyaz; hardal ve kâğıt üstünde mürekkep yazılır. Koyu tema kişinin sistem ayarını izler.

## Yazı

- **Sofia Sans Extra Condensed**: kutu sırtları ve başlıklar. Dar olduğu için uzun adlar sırta sığar. Ağırlık 800.
- **Sofia Sans**: metin. 17–19 px, satır 1.55, en çok 68 karakter.
- İkisi de siteden sunulur, Türkçe karakterleri vardır. Başka sunucuya istek gitmez.
- Tamamı büyük harf etiket, başlık üstü küçük etiket, tek sözcüğü renkli başlık yok.

## Biçim

- Kutular köşeli (2 px). Yuvarlak kart, cam, gradyan yazı, gölge süsü yok.
- Kutu kalınlığı işin kapsamını gösterir (`kapsam: 1–4`). Rastgele değildir.
- Ekran görüntüsü varsa gerçektir. Yoksa görsel uydurulmaz, kutu tek başına yeter.
- İkonlar tek elden çizilmiş SVG, 1.75 çizgi. Emoji ve Unicode simge yok.

## Hareket

Tek yazılmış an: raftan seçilen kutu, iş sayfasının başlık bloğuna dönüşür (belgeler arası view transition). Fareyle gelince kutu biraz yükselir. Kaydırınca beliren öğe yok. `prefers-reduced-motion` hepsini kapatır.

## Dil

Türkçe, birinci tekil, kısa. Övgü sıfatı yok; ne yaptığı, neyle yapıldığı ve durumu yazılır. Düğme eylemi söyler: "Android için indir", "Kaynak kodu".
