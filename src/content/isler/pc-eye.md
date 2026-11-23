---
baslik: PC-Eye
ozet: Yapay zekâ ajanlarının Linux masaüstünü ekran görüntüsü tahmin etmeden görüp kullanmasını sağlayan araç.
kisa: "Ajanların masaüstü gözü"
kategori: yapay-zeka
sira: 1
etiketler: [ajan-araci, ocr, yapay-zeka-modeli, mcp, wayland, onnx, rust, linux]
afis: ../../assets/afisler/pc-eye.jpg
gorunum: { zemin: "#0f1b2d", yazi: "#dfeaf2", vurgu: "#f26b21", vurguYazi: "#0f1b2d", tip: krona, odak: 78, merkez: [68, 45] }
baslangic: 2026-10-17
guncelleme: 2026-11-21
suruyor: true
baglantilar:
  - { tur: kaynak, ad: Kaynak kodu, adres: https://github.com/omerseyfettinozd/Pc-Eye }
---

PC-Eye, bir yapay zekâ ajanına Hyprland masaüstünün iç yapısını gösterir. Ajan piksellere bakıp tahmin etmek yerine pencereleri, düğmeleri ve metinleri doğrudan okur.

## Neler görüyor

- Pencereler, çalışma alanları ve kısayollar
- Uygulamaların erişilebilirlik ağacı; ağaç yoksa ekrandaki metin
- Terminalde görünen satırlar
- Süreçler, açık dosyalar, ağ bağlantıları ve GPU
- Sistem günlükleri, çökmeler ve bildirimler

Yapay zekâ istemcilerine MCP ile bağlanır. Metni isteğe bağlı bir sinir ağıyla, yoksa Tesseract ile okur.

Ajan isterse kendine ait, kullanıcının ekranından ayrı bir masaüstünde çalışır; fare ve odak kullanıcıda kalır.
