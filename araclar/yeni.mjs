// Kullanım: npm run yeni -- <bölüm> "<başlık>"     örnek: npm run yeni -- isler "Yeni Oyunum"
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';

const [bolum, baslik] = process.argv.slice(2);
const kok = new URL('../', import.meta.url).pathname;
const kaynak = readFileSync(`${kok}src/site.ts`, 'utf8');
const bolumler = [...kaynak.matchAll(/id: '([a-z0-9-]+)',[\s\S]*?tur: '([a-z]+)'/g)].map(([, id, tur]) => ({ id, tur }));
const b = bolumler.find((x) => x.id === bolum);
if (!b || !baslik) {
  console.error(`Kullanım: npm run yeni -- <${bolumler.map((x) => x.id).join('|')}> "<başlık>"`);
  process.exit(1);
}
const sade = baslik.toLocaleLowerCase('tr').normalize('NFD').replace(/\p{M}/gu, '').replaceAll('ı', 'i').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
if (!sade) { console.error('Başlıktan adres çıkmadı.'); process.exit(1); }
const klasor = `${kok}src/content/${b.id}`;
const dosya = `${klasor}/${sade}.md`;
if (existsSync(dosya)) { console.error(`Zaten var: ${dosya}`); process.exit(1); }
const bugun = new Date().toISOString().slice(0, 10);
const tirnak = JSON.stringify(baslik);
const sablon = {
  is: `---
baslik: ${tirnak}
ozet: Ne yaptığını bir cümleyle yaz, en az 20 karakter.
cesit: oyun # oyun | motor | masaustu | mobil
kapsam: 1 # 1 küçük deneme, 4 büyük proje (geniş düğüm)
baslangic: ${bugun}
guncelleme: ${bugun}
suruyor: true
taslak: true # hazır olunca bu satırı sil
teknoloji: [Unity]
platform: [Android]
baglantilar: []
---

Burada anlat.
`,
  yazi: `---
baslik: ${tirnak}
ozet: Yazının ne hakkında olduğunu bir cümleyle yaz.
tarih: ${bugun}
taslak: true # hazır olunca bu satırı sil
---

Burada anlat.
`,
}[b.tur];
mkdirSync(klasor, { recursive: true });
writeFileSync(dosya, sablon);
console.log(`Oluştu: src/content/${b.id}/${sade}.md`);
