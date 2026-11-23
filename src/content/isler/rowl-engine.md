---
baslik: Rowl Engine
ozet: Kod bilmeden görsel roman yapmak için oyun motoru ve düğüm tabanlı hikâye editörü.
sahne: hikaye
kategori: oyun-gelistirme
etiketler: [oyun-motoru, gorsel-roman, dugum-editoru, kodsuz, sdl3, avalonia, cpp, csharp, lua, linux, windows, android]
kapsam: 4
baslangic: 2026-07-29
guncelleme: 2026-11-11
suruyor: true
lisans: MIT
baglantilar:
  - { tur: kaynak, ad: Kaynak kodu, adres: https://github.com/omerseyfettinozd/Rowl-Engine }
gorseller:
  - dosya: ../../assets/isler/rowl-engine/editor.png
    alt: "Rowl Engine editörü: ortada dallanan hikâye grafiği, sağda denetçi ve canlı sahne önizlemesi"
    altyazi: Editörde birlikte gelen "Kayıp Tablo" demosu
  - dosya: ../../assets/isler/rowl-engine/scene-leyla.jpg
    alt: "Kayıp Tablo demosunda çinili odasında Leyla ve oyuncuya sunulan üç seçenek"
    altyazi: Seçimler Leyla'nın sana güvenip güvenmeyeceğini belirler
  - dosya: ../../assets/isler/rowl-engine/scene-earthquake.jpg
    alt: "Kayıp Tablo demosunda Ayasofya önünde deprem sahnesi"
    altyazi: 10 Temmuz 1894, öğle
  - dosya: ../../assets/isler/rowl-engine/android-workshop.jpg
    alt: "Aynı demo Android telefonda: atölyesinde Usta Agop konuşuyor"
    altyazi: Aynı demo, gerçek bir Android telefonda
---

Rowl Engine, oyuncunun seçimleriyle yön değiştiren hikâye oyunları için. Hikâye, tuvalde düğümler birbirine bağlanarak kurulur. Her düğüm bir sahnedir: ekranda kim var, ne söylüyor, hangi müzik çalıyor, hangi seçenekler çıkıyor.

Oyun bitince editör olmadan çalışan bağımsız bir oyun olarak dışa aktarılır. Hazır düğümlerin yapamadığı şeyler Lua betikleriyle eklenir.

## Neler var

- Dallanan seçimler, değişkenler, koşullar ve birden fazla son
- Oyunu derlemeden editörün içinde oynatma
- Yüz ifadeli karakterler, dudak hareketi, kamera ve sahne geçişleri
- Kaydetme, yükleme ve geri sarma her oyunda hazır
- Lua betikleri dosya, ağ ve işletim sistemi erişimi olmadan çalışır
- Türkçe ve İngilizce arayüz

## Nerede çalışıyor

Editör Linux ve Windows'ta. Dışa aktarılan oyun ayrıca Android'de, deneysel olarak.

## Demo: Kayıp Tablo

İstanbul, Temmuz 1894. Yaşlı bir ustanın tablosu sergiden üç gün önce kaybolur ve çırağı onu aramaya çıkar. Yaklaşık on dakikalık, dallanan bir hikâye. Görseller kamu malı tablolar, sesler CC0 ya da kamu malı.
