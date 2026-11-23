import type { Kamera, Kutu } from './kamera';

export interface HamCizgi { cocuk: string; yol: string; renk: string }
export interface Dalga { bas: number; ids: Set<string>; kat: number }
export interface ZeminDurumu {
  kam: Kamera;
  W: number;
  H: number;
  /** Açılış büyümesinin saniyesi; 9 ve üstü tamam demektir. */
  buyume: number;
  /** null ise hepsi parlak. */
  parlak: Set<string> | null;
  boyali: Set<string>;
  dalga: Dalga | null;
  sakin: boolean;
}
interface Kok {
  cocuk: string; n: number; x: Float32Array; y: Float32Array; nx: Float32Array; ny: Float32Array; en: Float32Array;
  boy: number; kutu: [number, number, number, number]; renk: string; kabuk: string; isik: string;
  govde: Path2D; parilti: Path2D; kil: Path2D; gecikme: number; derin: number;
}

const rnd = (n: number) => { const s = Math.sin(n * 127.1 + 11.7) * 43758.5453; return s - Math.floor(s); };
/** Elle çizilmiş hissi veren yumuşak gürültü. */
const dalgalan = (t: number, tohum: number) => Math.sin(t * 1.7 + tohum) * 0.5 + Math.sin(t * 3.9 + tohum * 2.3) * 0.3 + Math.sin(t * 8.3 + tohum * 5.1) * 0.2;
const karis = (a: string, b: string, o: number) => {
  const p = (r: string) => { const n = parseInt(r.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; };
  const x = p(a), y = p(b);
  return `rgb(${x.map((v, i) => Math.round(v * o + y[i]! * (1 - o))).join(',')})`;
};
const yumusak = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/** Toprak, taşlar ve kökler. Ağacın çizgileri burada kalınlığı azalan köklere dönüşür. */
export function zeminKur(tuval: HTMLCanvasElement, ham: HamCizgi[], renkCoz: (ad: string) => string, derinlik: (id: string) => number, yaprakMi: (id: string) => boolean, yerler: Map<string, Kutu>) {
  const c = tuval.getContext('2d')!;
  const kok = yerler.get('kok')!, zeminY = kok.y + kok.h + 2;
  const toprak = renkCoz('toprak'), damar = renkCoz('damar'), tas = renkCoz('tas'), ot = renkCoz('ot'), kemik = renkCoz('kemik'), govdeRengi = renkCoz('govde');

  const kokler: Kok[] = ham.map((h, sira) => {
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', h.yol);
    const boy = p.getTotalLength(), n = Math.max(14, Math.min(260, Math.round(boy / 9))), tohum = rnd(sira + 3) * 90;
    const derin = derinlik(h.cocuk), yaprak = yaprakMi(h.cocuk);
    const k0 = 34 * 0.6 ** (derin - 1), k1 = yaprak ? 4.5 : k0 * 0.6;
    const x = new Float32Array(n + 1), y = new Float32Array(n + 1), nx = new Float32Array(n + 1), ny = new Float32Array(n + 1), en = new Float32Array(n + 1);
    for (let i = 0; i <= n; i++) { const q = p.getPointAtLength((boy * i) / n); x[i] = q.x; y[i] = q.y; }
    for (let i = 0; i <= n; i++) {
      const a = Math.max(0, i - 1), b = Math.min(n, i + 1), dx = x[b]! - x[a]!, dy = y[b]! - y[a]!, l = Math.hypot(dx, dy) || 1, t = i / n;
      nx[i] = -dy / l; ny[i] = dx / l;
      en[i] = ((k0 * 0.82 + (k1 - k0 * 0.82) * t ** 0.8) + (1 - t) ** 9 * k0 * 0.5) * (1 + 0.16 * dalgalan((boy * t) / 34, tohum));
    }
    for (let i = 0; i <= n; i++) {
      const t = i / n, uc = Math.min(1, t * 6, (1 - t) * 6), s = dalgalan((boy * t) / 80, tohum * 1.3) * Math.min(9, 3 + k0 * 0.2) * uc;
      x[i] = x[i]! + nx[i]! * s; y[i] = y[i]! + ny[i]! * s;
    }
    let a = Infinity, b = Infinity, e = -Infinity, f = -Infinity;
    for (let i = 0; i <= n; i++) { a = Math.min(a, x[i]!); e = Math.max(e, x[i]!); b = Math.min(b, y[i]!); f = Math.max(f, y[i]!); }
    const renk = renkCoz(h.renk);
    const kil = new Path2D();
    for (let i = 5; i < n - 3; i++) {
      if (rnd(sira * 31 + i) > (yaprak ? 0.06 : 0.13)) continue;
      const yon = rnd(sira * 17 + i * 3) > 0.5 ? 1 : -1, u = 20 + rnd(i * 7 + sira) * 46, e0 = en[i]! * 0.45 * yon;
      const x0 = x[i]! + nx[i]! * e0, y0 = y[i]! + ny[i]! * e0, kivrim = (rnd(i + sira * 5) - 0.3) * 22;
      kil.moveTo(x0, y0);
      kil.quadraticCurveTo(x0 + nx[i]! * u * 0.5 * yon, y0 + ny[i]! * u * 0.5 * yon + kivrim, x0 + nx[i]! * u * 0.8 * yon + kivrim * 0.4, y0 + ny[i]! * u * 0.8 * yon + u * 0.6);
    }
    const kokNesne = { cocuk: h.cocuk, n, x, y, nx, ny, en, boy, kutu: [a - 70, b - 70, e + 70, f + 70] as [number, number, number, number], renk, kabuk: karis(renk, govdeRengi, 0.3), isik: karis(renk, govdeRengi, 0.55), kil, derin, gecikme: Math.max(0, derin - 1) * 0.6 + (yaprak ? Math.min(0.5, (yerler.get(h.cocuk)!.y / 2600) * 0.5) : 0) };
    return { ...kokNesne, govde: sekil(kokNesne, 0, 1, 1, 0), parilti: sekil(kokNesne, 0.01, 0.97, 0.34, -0.22) };
  });

  type Iskelet = Pick<Kok, 'n' | 'x' | 'y' | 'nx' | 'ny' | 'en'>;
  /** Kökün [t0, t1] arasını kapalı bir şekle çevirir. Ucu yuvarlanarak incelir. */
  function sekil(k: Iskelet, t0: number, t1: number, oran: number, kayma: number): Path2D {
    const yol = new Path2D(), i0 = Math.floor(t0 * k.n), i1 = Math.max(i0 + 2, Math.ceil(t1 * k.n)), son = Math.min(k.n, i1);
    const nokta = (i: number, yon: number): [number, number] => {
      const uc = t1 < 1 || oran < 1 ? Math.min(1, (son - i) / 5 + 0.12, (i - i0) / (oran < 1 ? 5 : 0.01) + 0.12) : 1;
      const e = k.en[i]! * (kayma + yon * 0.5 * oran * uc);
      return [k.x[i]! + k.nx[i]! * e, k.y[i]! + k.ny[i]! * e];
    };
    for (let i = i0; i <= son; i++) { const [a, b] = nokta(i, 1); if (i === i0) yol.moveTo(a, b); else yol.lineTo(a, b); }
    for (let i = son; i >= i0; i--) { const [a, b] = nokta(i, -1); yol.lineTo(a, b); }
    yol.closePath();
    return yol;
  }

  /* Toprak dünyası: her şey dünya koordinatında, bir kez kurulur. */
  const sinirlar = [...yerler.values()], sol = Math.min(...sinirlar.map((k) => k.x)) - 2600, sag = Math.max(...sinirlar.map((k) => k.x + k.w)) + 2600, dip = Math.max(...sinirlar.map((k) => k.y + k.h)) + 2200;
  const yuzey = (x: number) => zeminY + dalgalan(x / 210, 4) * 15;
  const toprakSekli = new Path2D(), otlar = new Path2D(), damarlar = new Path2D(), taslar = new Path2D();
  toprakSekli.moveTo(sol, dip);
  for (let x = sol; x <= sag; x += 22) toprakSekli.lineTo(x, yuzey(x));
  toprakSekli.lineTo(sag, dip);
  toprakSekli.closePath();
  for (let i = 0, x = sol; x < sag; i++, x += 9 + rnd(i) * 30) {
    const b = 8 + rnd(i + 70) * 24, e = (rnd(i + 20) - 0.5) * 20, y = yuzey(x) + 3;
    otlar.moveTo(x, y);
    otlar.quadraticCurveTo(x + e * 0.2, y - b * 0.6, x + e, y - b);
  }
  for (let j = 0, y = zeminY + 330; y < dip; j++, y += 300 + rnd(j) * 190) {
    let kalem = false;
    for (let x = sol; x <= sag; x += 26) {
      const bosluk = dalgalan(x / 300, j * 7 + 1) > 0.28;
      const yy = y + dalgalan(x / 260, j * 3) * 34;
      if (bosluk) { kalem = false; continue; }
      if (kalem) damarlar.lineTo(x, yy); else { damarlar.moveTo(x, yy); kalem = true; }
    }
  }
  const tasSayisi = Math.min(900, Math.round(((sag - sol) * (dip - zeminY)) / 52_000));
  for (let i = 0; i < tasSayisi; i++) {
    const x = sol + rnd(i * 3.1) * (sag - sol), y = zeminY + 50 + rnd(i * 7.7) ** 0.9 * (dip - zeminY - 60), r = 3 + rnd(i * 5.3) ** 3 * 26, k = 6 + Math.floor(rnd(i) * 3);
    for (let a = 0; a <= k; a++) {
      const aci = (a / k) * 6.2832, q = r * (0.75 + rnd(i * 11 + (a % k)) * 0.45);
      const px = x + Math.cos(aci) * q * 1.3, py = y + Math.sin(aci) * q;
      if (a === 0) taslar.moveTo(px, py); else taslar.lineTo(px, py);
    }
  }

  return {
    buyumeBitti: (cocuk: string, b: number) => { const k = kokler.find((x) => x.cocuk === cocuk); return !k || b > k.gecikme + 0.45; },
    cocuklar: kokler.map((k) => k.cocuk),
    ciz(an: number, d: ZeminDurumu) {
      const { kam, W, H } = d, kat = Math.min(devicePixelRatio, 1.5);
      if (tuval.width !== Math.round(W * kat) || tuval.height !== Math.round(H * kat)) { tuval.width = Math.round(W * kat); tuval.height = Math.round(H * kat); }
      c.setTransform(1, 0, 0, 1, 0, 0);
      c.globalAlpha = 1;
      c.clearRect(0, 0, tuval.width, tuval.height);
      const z = kam.z * kat;
      c.setTransform(z, 0, 0, z, (W / 2 - kam.x * kam.z) * kat, (H / 2 - kam.y * kam.z) * kat);
      const sinir: [number, number, number, number] = [kam.x - W / 2 / kam.z, kam.y - H / 2 / kam.z, kam.x + W / 2 / kam.z, kam.y + H / 2 / kam.z];
      c.lineCap = c.lineJoin = 'round';
      c.fillStyle = toprak; c.fill(toprakSekli);
      c.fillStyle = tas; c.fill(taslar);
      c.strokeStyle = damar; c.lineWidth = 5; c.stroke(damarlar);
      c.strokeStyle = ot; c.lineWidth = 3.2; c.stroke(otlar);

      const gorunen = kokler.filter(({ kutu: [a, b, e, f] }) => a < sinir[2] && e > sinir[0] && b < sinir[3] && f > sinir[1]);
      const p = (k: Kok) => yumusak(Math.min(1, Math.max(0, (d.buyume - k.gecikme) / 0.75)));
      const soluk = (k: Kok) => (d.parlak && !d.parlak.has(k.cocuk) ? 0.22 : 1);
      // İnce kökler altta, kalınlar üstte birleşsin.
      for (const k of [...gorunen].sort((a, b) => b.derin - a.derin)) {
        const q = p(k);
        if (q <= 0) continue;
        c.globalAlpha = soluk(k);
        if (q >= 1) { c.strokeStyle = k.kabuk; c.lineWidth = 2.4; c.stroke(k.kil); }
        c.fillStyle = d.boyali.has(k.cocuk) ? k.renk : k.kabuk;
        c.fill(q >= 1 ? k.govde : sekil(k, 0, q, 1, 0));
      }
      for (const k of gorunen) {
        if (p(k) < 1) continue;
        c.globalAlpha = soluk(k) * 0.8;
        c.fillStyle = d.boyali.has(k.cocuk) ? karis(k.renk, kemik, 0.55) : k.isik;
        c.fill(k.parilti);
      }
      if (!d.sakin) {
        // Özsu: kökün içinde ağır ağır inen dolgunluk.
        for (const k of gorunen) {
          if (p(k) < 1 || soluk(k) < 1) continue;
          const tur = k.boy + 1500, yer = (((an / 1000) * 170 + rnd(k.cocuk.length + k.boy) * tur) % tur) / k.boy;
          if (yer >= 1) continue;
          c.globalAlpha = 0.9;
          c.fillStyle = k.renk;
          c.fill(sekil(k, Math.max(0, yer - 80 / k.boy), yer, 0.6, 0));
        }
        if (d.dalga) {
          const gecen = (an - d.dalga.bas) / 1000;
          for (const k of gorunen) {
            if (!d.dalga.ids.has(k.cocuk)) continue;
            const q = (gecen - Math.max(0, k.derin - d.dalga.kat - 1) * 0.18 - 0.25) / 0.75;
            if (q <= 0 || q >= 1.6) continue;
            c.globalAlpha = Math.min(1, (1.6 - q) * 1.9);
            c.fillStyle = k.renk;
            c.fill(sekil(k, 0, Math.min(1, q), 1, 0));
          }
        }
      }
      c.globalAlpha = 1;
    },
  };
}
