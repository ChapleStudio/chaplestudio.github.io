/**
 * Temalar. Üç seviye vardır:
 * 1. Renk, yazı ve çerçeve: src/temalar/kartlar.css (düğüm) ve src/temalar/<ad>/oda.css (sayfa).
 * 2. Projeye özel süs ve düzen: src/temalar/<ad>/Sus.astro, sayfanın giriş sahnesine eklenir.
 * 3. Kendi sitesi: içerikte `kendiSitesi: /yol/`. Düğüm ağaçta durur, içine girilince o site açılır; temaya hiç dokunulmaz.
 * Yeni tema: buraya ad, kartlar.css'e düğüm rengi, klasörüne oda.css. Eksik oda.css derlemeyi durdurur.
 */
export const temaKimlikleri = ['studyo', 'rowl', 'peri'] as const;
export type Tema = (typeof temaKimlikleri)[number];

const dosyalar = import.meta.glob<string>('./*/oda.css', { query: '?url', import: 'default', eager: true });
/** Sayfaya yalnız kendi temasının stili yüklenir. Stüdyo temasının ek dosyası yoktur. */
export function temaStili(tema: Tema): string | undefined {
  if (tema === 'studyo') return undefined;
  const yol = dosyalar[`./${tema}/oda.css`];
  if (!yol) throw new Error(`"${tema}" temasının src/temalar/${tema}/oda.css dosyası yok`);
  return yol;
}
