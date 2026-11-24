/**
 * Etiket sözlüğü. İçerikte yalnız buradaki kimlikler kullanılabilir; yazım hatası derlemeyi durdurur.
 * Etiket grubu hangi soruya cevap verdiğini söyler.
 */
export const etiketGruplari = {
  tur: { ad: 'Türü', soru: 'Nasıl bir şey?' },
  ozellik: { ad: 'Özellikleri', soru: 'Ne yapabiliyor?' },
  arac: { ad: 'Yapıldığı araç', soru: 'Hangi motor ya da kütüphaneyle?' },
  dil: { ad: 'Yazılım dili', soru: 'Hangi dille?' },
  platform: { ad: 'Platform', soru: 'Nerede çalışıyor?' },
} as const;
export type EtiketGrubu = keyof typeof etiketGruplari;

const sozluk = {
  // Türü
  nisanci: ['tur', 'Nişancı'],
  'sonsuz-kosu': ['tur', 'Sonsuz oyun'],
  'spor-oyunu': ['tur', 'Spor oyunu'],
  platform2b: ['tur', 'Platform oyunu'],
  'gorsel-roman': ['tur', 'Görsel roman'],
  'oyun-motoru': ['tur', 'Oyun motoru'],
  'mod-paketi': ['tur', 'Mod paketi'],
  'unity-paketi': ['tur', 'Unity paketi'],
  'ajan-araci': ['tur', 'Ajan aracı'],
  'ses-ayirma': ['tur', 'Ses ayırma'],
  'kontrol-merkezi': ['tur', 'Kontrol merkezi'],
  izleme: ['tur', 'Sistem izleme'],
  'masaustu-susu': ['tur', 'Masaüstü süsü'],
  'tarayici-eklentisi': ['tur', 'Tarayıcı eklentisi'],
  'mobil-uygulama': ['tur', 'Mobil uygulama'],
  // Özellikleri
  '2b': ['ozellik', '2B'],
  cevrimici: ['ozellik', 'Çevrimiçi'],
  'yerel-ag': ['ozellik', 'Yerel ağ'],
  'ayni-ekran': ['ozellik', 'Aynı ekranda iki kişi'],
  isbirligi: ['ozellik', 'İş birliği'],
  'skor-tablosu': ['ozellik', 'Skor tablosu'],
  'bilgisayara-karsi': ['ozellik', 'Bilgisayara karşı'],
  'hareket-algilayici': ['ozellik', 'Hareket algılayıcı'],
  'rastgele-uretim': ['ozellik', 'Rastgele üretim'],
  'kendi-resmin': ['ozellik', 'Kendi resmin'],
  'dugum-editoru': ['ozellik', 'Düğüm editörü'],
  'kodsuz': ['ozellik', 'Kod bilmeden'],
  'yapay-zeka-modeli': ['ozellik', 'Yapay zekâ modeli'],
  ocr: ['ozellik', 'Metin tanıma'],
  'ses-tepkili': ['ozellik', 'Sese tepkili'],
  'fan-kontrolu': ['ozellik', 'Fan kontrolü'],
  rgb: ['ozellik', 'RGB klavye'],
  'cekirdek-modulu': ['ozellik', 'Çekirdek modülü'],
  'ag-hizi': ['ozellik', 'Ağ hızı'],
  erisilebilirlik: ['ozellik', 'Erişilebilirlik servisi'],
  'yerel-kayit': ['ozellik', 'Cihazda kayıt'],
  whatsapp: ['ozellik', 'WhatsApp'],
  // Araç
  unity: ['arac', 'Unity'],
  netcode: ['arac', 'Netcode for GameObjects'],
  'unity-relay': ['arac', 'Unity Relay ve Lobby'],
  fishnet: ['arac', 'FishNet'],
  eos: ['arac', 'Epic Online Services'],
  sdl3: ['arac', 'SDL3'],
  avalonia: ['arac', 'Avalonia'],
  tauri: ['arac', 'Tauri'],
  svelte: ['arac', 'Svelte'],
  wayland: ['arac', 'Wayland'],
  mcp: ['arac', 'MCP'],
  onnx: ['arac', 'ONNX Runtime'],
  win32: ['arac', 'Win32'],
  demucs: ['arac', 'Demucs'],
  ffmpeg: ['arac', 'FFmpeg'],
  tkinter: ['arac', 'Tkinter'],
  room: ['arac', 'Room'],
  // Dil
  csharp: ['dil', 'C#'],
  cpp: ['dil', 'C++'],
  c: ['dil', 'C'],
  rust: ['dil', 'Rust'],
  lua: ['dil', 'Lua'],
  python: ['dil', 'Python'],
  javascript: ['dil', 'JavaScript'],
  java: ['dil', 'Java'],
  kotlin: ['dil', 'Kotlin'],
  // Platform
  bilgisayar: ['platform', 'Bilgisayar'],
  linux: ['platform', 'Linux'],
  windows: ['platform', 'Windows'],
  android: ['platform', 'Android'],
  chrome: ['platform', 'Chrome'],
} as const satisfies Record<string, readonly [EtiketGrubu, string]>;

export type EtiketKimligi = keyof typeof sozluk;
export interface Etiket { id: EtiketKimligi; ad: string; grup: EtiketGrubu }
export const etiketKimlikleri = Object.keys(sozluk) as [EtiketKimligi, ...EtiketKimligi[]];
const sira = new Map(etiketKimlikleri.map((e, i) => [e, i]));
export const etiketBul = (id: EtiketKimligi): Etiket => ({ id, grup: sozluk[id][0], ad: sozluk[id][1] });
/** Sözlük sırasına dizer: önce türü, sonra özellik, araç, dil, platform. */
export const etiketleriDiz = (ids: readonly EtiketKimligi[]): Etiket[] => [...new Set(ids)].sort((a, b) => sira.get(a)! - sira.get(b)!).map(etiketBul);
export const gruptakiler = (e: readonly Etiket[], g: EtiketGrubu) => e.filter((x) => x.grup === g);
