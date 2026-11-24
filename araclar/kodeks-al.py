#!/usr/bin/env python3
"""Calradya Kodeksi'ni public/bannerlord/ içine alır.

Kullanım: python3 araclar/kodeks-al.py <bannerlord deposunun yolu>

Kaynak depodaki araclar/build_mod_site.py içeriği üretir; burası onu bu siteye uyarlar:
yazı tiplerini siteden verir, satır içi stil ve
betiği dosyaya taşır (güvenlik ilkesi), Chaple Studio'ya dönüş ve kurulum bölümünü ekler.
İndirme düğmesi yalnız özel linkle (/bannerlord/#indir=<Drive dosya kimliği>) açılır. Kimlik bu depoda
durmaz; araclar/kodeks-indirme.json içinde yalnız SHA-256 özeti (`kimlikOzeti`) vardır.
"""
import html, json, re, shutil, sys
from pathlib import Path
from urllib.parse import urlsplit

if len(sys.argv) != 2:
    sys.exit(__doc__)
kaynak, kok = Path(sys.argv.pop()).resolve(), Path(__file__).resolve().parent.parent
sys.path.insert(0, str(kaynak / "araclar"))
import build_mod_site as k  # noqa: E402

cikti = kok / "public" / "bannerlord"
E = html.escape
veri = k.parse(k.find_guide())

# --- kurulum bölümü
ind = json.loads((kok / "araclar" / "kodeks-indirme.json").read_text(encoding="utf-8"))
dugme = f'''<p class="front-links" id="indirDugme" data-ozet="{E(ind["kimlikOzeti"] or "")}" hidden><a class="button" href="#indir" rel="noopener noreferrer">Paketi indir ({E(ind["boy"])})</a></p>
  <p class="pending" id="indirYok">Paket arkadaşlara özel. İndirme düğmesi, sana gönderilen linkle açınca çıkar.</p>'''
kunye = "".join(f"<div><dt>{E(a)}</dt><dd>{d}</dd></div>" for a, d in [
    ("Sürüm", f'{E(ind["surum"])}, deneme sürümü'),
    ("İnen dosya", f'<code>{E(ind["dosya"])}</code>, {E(ind["boy"])}'),
    ("Boş alan", "Kurulum sırasında yaklaşık 22 GB, sonrasında 9,3 GB"),
    ("Gerekenler", "Bannerlord v1.5.7 ve War Sails v1.3.7"),
    ("SHA-256", f'<code class="ozet">{E(ind["sha256"])}</code>'),
] if d)
indir = f"""
<section class="news indir" id="indir" aria-labelledby="indir-h">
  <h2 id="indir-h">Paketi kur</h2>
  <p class="section-lede">Tek dosya iner. Kurulum programı modları, ayarları ve yükleme sırasını kendisi yerleştirir; kaldırınca oyunu eski hâline döndürür.</p>
  {dugme}
  <dl class="register">{kunye}</dl>
  <div class="kur-yollar">
    <section><h3>Windows</h3><ol>
      <li>Zip'e sağ tıkla, <strong>Tümünü ayıkla</strong> de. Zip'in içinden çalıştırma.</li>
      <li>Oyun kapalıyken <code>kurulum.exe</code>'ye çift tıkla, Enter'a bas. Windows uyarırsa: Ek bilgi, sonra Yine de çalıştır.</li>
      <li>Steam'den Oyna'ya bas ve yeni bir sefer başlat. Açılmazsa <code>OYNA.bat</code>'a çift tıkla.</li>
    </ol></section>
    <section><h3>Linux</h3><ol>
      <li>Zip'i ayıkla, klasörde bir uçbirim aç.</li>
      <li>Oyun kapalıyken <code>./kurulum</code> çalıştır, Enter'a bas. Çalışmazsa önce <code>chmod +x kurulum</code>.</li>
      <li>Steam'den Oyna'ya bas ve yeni bir sefer başlat.</li>
    </ol></section>
  </div>
  <ul class="ledger">
    <li><h3>Eski kayıtlar</h3><p>Bu modlarla açılmaz. Kurulum kayıtlara dokunmaz.</p></li>
    <li><h3>Bir şey bozulursa</h3><p>Uçbirimde <code>kurulum onar</code>; kaldırmak için <code>kurulum kaldir</code>. Bu yüzden klasörü silme.</p></li>
    <li><h3>Denenmemiş yanı</h3><p>Kurulum Linux'ta ve Wine'da denendi, gerçek Windows'ta henüz denenmedi.</p></li>
    <li><h3>Yetişkin içerik</h3><p>Pakette yetişkin içerikli modlar var, dizinde Yetişkin etiketiyle duruyorlar. 18 yaşından küçüksen kurma.</p></li>
  </ul>
</section>"""

# --- gövde
front = k.render_front(veri).replace("Linux, Proton", "Windows ve Linux")
front = front.replace('<a class="button" href="#bolumler">Modları oku</a>', '<a class="button" href="#indir">Paketi kur</a> <a class="button quiet" href="#bolumler">Modları oku</a>')
sayfa = (k.SRC / "index.html").read_text(encoding="utf-8")
for ad, deger in {
    "{{FRONT}}": front, "{{INTRO}}": k.render_intro(veri) + indir, "{{WORKS}}": k.render_works(veri),
    "{{GAME}}": E(k.versions(veri)[0]), "{{SAILS}}": E(k.versions(veri)[1]), "{{FRIEZE}}": k.frieze(), "{{FRIEZE2}}": k.frieze("flip"),
    "{{CHAPTERS}}": k.render_chapters(veri), "{{ORDERS}}": k.render_orders(veri), "{{INDEX}}": k.render_index(veri),
    "{{FOLIOS}}": k.render_folios(veri), "{{CREDITS}}": k.render_credits(), "{{COUNT}}": str(len(veri["mods"])),
}.items():
    sayfa = sayfa.replace(ad, deger)

csp = "default-src 'none'; img-src 'self' data:; style-src 'self'; script-src 'self'; font-src 'self'; base-uri 'none'; form-action 'none'"
sayfa = re.sub(r'<link rel="(?:preconnect|stylesheet)"[^>]*>\n?|<link href="https://fonts[^>]*>\n?|<script type="application/ld\+json">.*?</script>\n?', "", sayfa, flags=re.S)
sayfa = sayfa.replace('<script>document.documentElement.classList.add("js")</script>', '<script src="ilk.js"></script>')
sayfa = sayfa.replace("<style>{{CSS}}</style>", '<link rel="stylesheet" href="kodeks.css">').replace("<script>{{JS}}</script>", '<script src="kodeks.js"></script>')
sayfa = sayfa.replace('<meta charset="utf-8">', f'<meta charset="utf-8">\n<meta http-equiv="Content-Security-Policy" content="{csp}">', 1)
sayfa = sayfa.replace('content="assets/san-romano.webp"', 'content="https://chaplestudio.github.io/bannerlord/assets/san-romano.webp"')
sayfa = sayfa.replace('<meta name="theme-color"', '<link rel="canonical" href="https://chaplestudio.github.io/bannerlord/">\n<meta name="theme-color"', 1)
sayfa = sayfa.replace(' onsubmit="return false"', "")
sayfa = sayfa.replace('<a class="wordmark"', '<a class="donus" href="/#isler/calradya-kodeksi" aria-label="Chaple Studio, bütün projeler">←</a>\n  <a class="wordmark"', 1)
sayfa = sayfa.replace('<li><a href="#bolumler">', '<li><a href="#indir">Kur</a></li>\n      <li><a href="#bolumler">', 1)

# satır içi renk → sınıf
renkler = {}
def renk(m):
    return f' data-p="{renkler.setdefault(m.group(1), len(renkler) + 1)}"'
sayfa = re.sub(r' style="--pigment:(#[0-9A-Fa-f]{6})"', renk, sayfa)
for kalan in (r'\sstyle="', r"<style", r"\son[a-z]+=\"", r"\{\{", r"https?://fonts"):
    if re.search(kalan, sayfa):
        sys.exit(f"siteye uymayan parça kaldı: {kalan}")
for yasak in ("/home/", "chaple@", "@gmail"):
    if re.search(rf"{re.escape(yasak)}", sayfa):
        sys.exit(f"siteye girmemesi gereken metin: {yasak}")

betik = (k.SRC / "app.js").read_text(encoding="utf-8")
betik = betik.replace('cat.addEventListener("change", applyFilter);', 'cat.addEventListener("change", applyFilter);\n  q.form.addEventListener("submit", e => e.preventDefault());', 1)
if "q.form.addEventListener" not in betik:
    sys.exit("app.js değişmiş, form yakalanamadı")

betik += """
/* ---------- özel linkle indirme: yalnız özeti tutan dosya kimliği düğmeyi açar ---------- */
(() => {
  "use strict";
  const kutu = document.getElementById("indirDugme"), yok = document.getElementById("indirYok");
  const dene = async (kimlik, kaydir) => {
    if (!/^[\\w-]{20,80}$/.test(kimlik || "") || !kutu.dataset.ozet || !globalThis.crypto?.subtle) return;
    const ozet = [...new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(kimlik)))].map(b => b.toString(16).padStart(2, "0")).join("");
    if (ozet !== kutu.dataset.ozet) return;
    kutu.firstElementChild.href = "https://drive.usercontent.google.com/download?id=" + kimlik + "&export=download&confirm=t";
    kutu.hidden = false;
    yok.hidden = true;
    try { sessionStorage.setItem("kodeks-indir", kimlik); } catch {}
    if (kaydir) document.getElementById("indir").scrollIntoView();
  };
  const oku = () => dene(location.hash.match(/^#indir=(.+)$/)?.[1], true);
  addEventListener("hashchange", oku);
  try { dene(sessionStorage.getItem("kodeks-indir"), false); } catch {}
  oku();
})();
"""

yazi = []
for aile, paket, ad, agirlik in (("Grenze Gotisch", "grenze-gotisch", "wght-normal", "100 900"), ("EB Garamond", "eb-garamond", "wght-normal", "400 800"), ("EB Garamond", "eb-garamond", "wght-italic", "400 800")):
    for alt, aralik in (("latin-ext", "U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF"), ("latin", "U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD")):
        f = f"{paket}-{alt}-{ad}.woff2"
        yazi.append(f'@font-face{{font-family:"{aile}";font-style:{ad.split("-")[1]};font-weight:{agirlik};font-display:swap;src:url(yazi/{f}) format("woff2");unicode-range:{aralik}}}')
        (cikti / "yazi").mkdir(parents=True, exist_ok=True)
        shutil.copy(kok / "node_modules" / "@fontsource-variable" / paket / "files" / f, cikti / "yazi" / f)
stil = "\n".join(yazi) + "\n" + (k.SRC / "style.css").read_text(encoding="utf-8")
stil += "\n/* ---------------- bu siteye özel ---------------- */\n"
stil += "\n".join(f'[data-p="{n}"] {{ --pigment: {r}; }}' for r, n in renkler.items())
stil += """
.donus { color: var(--vellum); text-decoration: none; font-size: 26px; line-height: 1; padding: 6px 8px; margin-left: -8px; }
.donus:hover { color: var(--vellum-shade); }
@media (max-width: 560px) {
  .masthead { gap: 8px; }
  .masthead .wordmark { font-size: 20px; }
  .masthead .find kbd { display: none; }
  .find, .menu { padding: 8px; font-size: 15px; }
}
@media (max-width: 400px) {
  .masthead .wordmark { white-space: normal; min-width: 0; flex: 1 1 0; }
  .masthead nav { margin-left: 0; }
  li:has(> .leader), a:has(> .leader) { min-width: 0; }
  :has(> .leader) > :first-child { white-space: normal; min-width: 0; overflow-wrap: anywhere; }
  .leader { min-width: 0; }
}
.indir .register { max-width: 760px; }
.ozet { font-size: .82em; overflow-wrap: anywhere; font-variant-numeric: lining-nums; }
#indirDugme[hidden], #indirYok[hidden] { display: none; }
.pending { margin: 30px 0 0; padding: 12px 16px; max-width: var(--measure); border: 1px solid var(--gold-leaf); background: var(--vellum-shade); }
.kur-yollar { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr)); gap: 8px clamp(24px, 4vw, 56px); margin-top: 34px; }
.kur-yollar h3 { font: 600 24px/1.3 var(--book); color: var(--cinnabar); }
.kur-yollar ol { margin: 8px 0 0; padding-left: 1.3em; }
.kur-yollar li { padding: 4px 0; max-width: var(--measure); }
"""
(cikti / "assets").mkdir(exist_ok=True)
for g in {a["file"] for a in k.ART.values()}:
    shutil.copy(kaynak / "site" / "assets" / g, cikti / "assets" / g)
(cikti / "index.html").write_text(sayfa, encoding="utf-8")
(cikti / "kodeks.css").write_text(stil, encoding="utf-8")
(cikti / "kodeks.js").write_text(betik, encoding="utf-8")
(cikti / "ilk.js").write_text('document.documentElement.classList.add("js");\n', encoding="utf-8")
print(f"{len(veri['mods'])} anlatım, {len(sayfa) // 1024} KB, indirme: {'özel link' if ind['kimlikOzeti'] else 'kapalı'}")
