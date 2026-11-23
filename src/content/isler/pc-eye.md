---
baslik: PC-Eye
ozet: Yapay zekâ ajanlarının Linux masaüstünü ekran görüntüsü tahmin etmeden görüp kullanmasını sağlayan araç.
cesit: masaustu
kapsam: 3
baslangic: 2026-10-17
guncelleme: 2026-11-21
suruyor: true
masada: 3
teknoloji: [Rust, Wayland, MCP]
platform: [Linux]
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

Ajan isterse kendine ait, kullanıcının ekranından ayrı bir masaüstünde çalışır; fare ve odak kullanıcıda kalır.
