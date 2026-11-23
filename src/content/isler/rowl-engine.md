---
baslik: Rowl Engine
ozet: Kod bilmeden görsel roman yapmak için oyun motoru ve düğüm tabanlı hikâye editörü.
kisa: "Görsel roman motoru"
kategori: oyun-yapimi
sira: 1
etiketler: [oyun-motoru, gorsel-roman, dugum-editoru, kodsuz, sdl3, avalonia, cpp, csharp, lua, linux, windows, android]
afis: ../../assets/afisler/rowl-engine.jpg
gorunum: { zemin: "#2b1550", yazi: "#f1e9ff", vurgu: "#f0b441", vurguYazi: "#2b1550", tip: rakkas, odak: 97, merkez: [70, 50], kafa: 100 }
baslangic: 2026-07-29
guncelleme: 2026-11-11
suruyor: true
lisans: MIT
baglantilar:
  - { tur: kaynak, ad: Kaynak kodu, adres: https://github.com/omerseyfettinozd/Rowl-Engine }
serit:
  gorsel: ../../assets/afisler/rowl-agac.jpg
  alt: "Bir kapıyla başlayan, dallanıp üç ayrı sona varan hikâye çizimi"
  adimlar:
    - { ad: Kur, metin: "Her düğüm bir sahne: ekranda kim var, ne söylüyor, hangi müzik çalıyor." }
    - { ad: Dallandır, metin: "Seçimler, değişkenler ve koşullar hikâyeyi farklı sonlara götürür." }
    - { ad: Oyunu çıkar, metin: "Editör olmadan çalışan bağımsız bir oyun olarak dışa aktarılır." }
gorseller:
  - dosya: ../../assets/isler/rowl-engine/editor.png
    alt: "Rowl Engine editörü: ortada dallanan hikâye grafiği, sağda denetçi"
    altyazi: Editörün kendisi
---

Rowl Engine, oyuncunun seçimleriyle yön değiştiren hikâye oyunları için. Hikâye, tuvalde düğümler birbirine bağlanarak kurulur. Hazır düğümlerin yapamadığı şeyler Lua betikleriyle eklenir.

## Neler var

- Oyunu derlemeden editörün içinde oynatma
- Yüz ifadeli karakterler, dudak hareketi, kamera ve sahne geçişleri
- Kaydetme, yükleme ve geri sarma her oyunda hazır
- Lua betikleri dosya, ağ ve işletim sistemi erişimi olmadan çalışır
- Türkçe ve İngilizce arayüz

## Nerede çalışıyor

Editör Linux ve Windows'ta. Dışa aktarılan oyun ayrıca Android'de, deneysel olarak.

## Demo: Kayıp Tablo

İstanbul, Temmuz 1894. Yaşlı bir ustanın tablosu sergiden üç gün önce kaybolur ve çırağı onu aramaya çıkar. Yaklaşık on dakikalık, dallanan bir hikâye. Görseller kamu malı tablolar, sesler CC0 ya da kamu malı.
