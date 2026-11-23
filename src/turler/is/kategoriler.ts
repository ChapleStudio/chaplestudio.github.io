/**
 * Kategori işin NE olduğunu söyler ve ağacın dalıdır. Sıra soldan sağadır.
 * Platform, dil ve araç kategori olamaz; onlar etikettir (src/etiketler.ts).
 * `altlar` isteğe bağlı alt dallardır; bir kategoride alt dal varsa her iş birini seçer.
 */
export const kategoriler = {
  oyun: {
    ad: 'Oyunlar', tekil: 'Oyun', renk: 'mercan', ikon: 'oyun',
    aciklama: 'Oynanan şeyler.',
    altlar: { 'cok-oyunculu': 'Çok oyunculu', arcade: 'Arcade' },
  },
  'oyun-gelistirme': {
    ad: 'Oyun geliştirme', tekil: 'Oyun geliştirme', renk: 'altin', ikon: 'motor',
    aciklama: 'Oyun yapanların kullandığı motorlar ve paketler.', altlar: {},
  },
  'yapay-zeka': {
    ad: 'Yapay zekâ', tekil: 'Yapay zekâ', renk: 'leylak', ikon: 'zeka',
    aciklama: 'Yapay zekâ ajanları için ya da bir modelle çalışan araçlar.', altlar: {},
  },
  sistem: {
    ad: 'Sistem ve donanım', tekil: 'Sistem aracı', renk: 'adacayi', ikon: 'sistem',
    aciklama: 'Bilgisayarı yöneten ve izleyen araçlar.', altlar: {},
  },
  kisisellestirme: {
    ad: 'Kişiselleştirme', tekil: 'Kişiselleştirme', renk: 'gok', ikon: 'firca',
    aciklama: 'Masaüstünü eğlenceli ve kendine ait yapan şeyler.', altlar: {},
  },
  bildirim: {
    ad: 'Bildirim araçları', tekil: 'Bildirim aracı', renk: 'bakir', ikon: 'zil',
    aciklama: 'Bildirimleri yakalayan ve gönderen araçlar.', altlar: {},
  },
} as const satisfies Record<string, { ad: string; tekil: string; renk: string; ikon: string; aciklama: string; altlar: Record<string, string> }>;

export type Kategori = keyof typeof kategoriler;
export const kategoriKimlikleri = Object.keys(kategoriler) as [Kategori, ...Kategori[]];
export const altAdi = (k: Kategori, alt: string | undefined): string | undefined => (alt === undefined ? undefined : (kategoriler[k].altlar as Record<string, string>)[alt]);
