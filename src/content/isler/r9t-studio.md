---
baslik: R9T Studio
ozet: GameGaraj Slayer R9T dizüstü için Linux kontrol merkezi. Fan, güç, RGB klavye ve tanılama tek yerde.
kisa: "Dizüstü kontrol merkezi"
kategori: arac
sira: 1
etiketler: [kontrol-merkezi, fan-kontrolu, rgb, ses-tepkili, cekirdek-modulu, tauri, svelte, rust, c, linux]
afis: ../../assets/afisler/r9t-studio.jpg
gorunum: { zemin: "#262a35", yazi: "#eee6d8", vurgu: "#e0453f", vurguYazi: "#140708", tip: stencil, odak: 85, merkez: [66, 50] }
baslangic: 2026-10-03
guncelleme: 2026-11-21
suruyor: true
baglantilar:
  - { tur: kaynak, ad: Kaynak kodu, adres: https://github.com/omerseyfettinozd/kontrol-merkezi-linux }
gorseller:
  - dosya: ../../assets/isler/r9t-studio/overview.png
    alt: "R9T Studio genel bakış ekranı: sıcaklık, güç ve fan grafikleri"
    altyazi: Genel bakış
  - dosya: ../../assets/isler/r9t-studio/performance.png
    alt: "R9T Studio performans ve termal ekranı: güç profilleri ve fan eğrisi"
    altyazi: Performans ve termal
  - dosya: ../../assets/isler/r9t-studio/keyboard.png
    alt: "R9T Studio klavye ekranı: tuş tuş renk boyama ızgarası"
    altyazi: Klavye ve RGB
---

Donanım servisi, masaüstü ajanı, komut satırı aracı ve arayüzden oluşuyor. Bu modele özel yazıldı.

## Neler yapıyor

- CPU ve GPU sıcaklığı, güç, fan devri ve pil için canlı grafikler
- Güç profilleri, frekans tavanları ve sürüklenebilir fan eğrisi
- 6×21 ızgarada tuş tuş klavye boyama; nefes, dalga ve sese tepki efektleri
- Ekran yenileme hızı, açılış, priz ve oyun kuralları
- Profil kıyaslama ve 60 saniyelik kararlılık testi

Yalnız bu modelde doğrulandı. Servis, cihaz modelini denetler; kanıtlanmamış yetenek arayüzde açık görünmez.
