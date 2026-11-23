import { sahneKimlikleri, type SahneKimligi } from './sahne-kimlikleri';

export interface Palet { zemin: string; kemik: string; soluk: string; vurgu: string; koyu: string }
export type Cizici = (c: CanvasRenderingContext2D, w: number, h: number, t: number, r: Palet) => void;

const TAU = Math.PI * 2, { sin, cos, abs } = Math;
const rnd = (n: number) => { const x = sin(n * 127.1) * 43758.5453; return x - Math.floor(x); };
const daire = (c: CanvasRenderingContext2D, x: number, y: number, r: number) => { c.beginPath(); c.arc(x, y, Math.max(r, 0), 0, TAU); c.fill(); };
const ucgen = (p: number) => 1 - abs((((p % 2) + 2) % 2) - 1);

/** Küçük, özgün canlı sahneler. Ekran görüntüsü değil, işin ne yaptığını anlatan çizimlerdir. */
const sahneler: Record<SahneKimligi, Cizici> = {
  kar(c, w, h, t, r) {
    c.fillStyle = r.kemik; const b = h * 0.8;
    for (let i = 0; i < 170; i++) { const s = 0.6 + rnd(i) * 2.2; const y = (rnd(i + 9) * h + t * 26 * s) % b; const x = (rnd(i + 3) * w + sin(t * 0.6 + i) * 14) % w; c.globalAlpha = 0.25 + rnd(i + 5) * 0.65; daire(c, x, y, s); }
    c.globalAlpha = 1; c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= w; x += 12) c.lineTo(x, b + sin(x * 0.012) * 12 + sin(x * 0.041 + 2) * 6); c.lineTo(w, h); c.fill();
    const g = w * 0.58, yb = b + 6; daire(c, g, yb - 4, h * 0.075); daire(c, g, yb - h * 0.12, h * 0.052); daire(c, g, yb - h * 0.2, h * 0.036);
    c.fillStyle = r.zemin; daire(c, g - 5, yb - h * 0.207, 2.2); daire(c, g + 6, yb - h * 0.207, 2.2); c.fillStyle = r.vurgu; c.beginPath(); c.moveTo(g, yb - h * 0.198); c.lineTo(g + h * 0.05, yb - h * 0.192); c.lineTo(g, yb - h * 0.186); c.fill();
  },
  tarama(c, w, h, t, r) {
    c.lineWidth = 1.5; const kut: [number, number, number, number][] = []; for (let i = 0; i < 16; i++) kut.push([w * (0.06 + rnd(i) * 0.7), h * (0.08 + rnd(i + 40) * 0.74), w * (0.08 + rnd(i + 70) * 0.16), h * (0.04 + rnd(i + 90) * 0.1)]);
    const tara = (t * 0.22 % 1) * h; kut.forEach(([x, y, a, b], i) => { const g = y < tara; c.strokeStyle = g ? r.vurgu : r.koyu; c.strokeRect(x, y, a, b); if (g) { c.fillStyle = r.vurgu; c.fillRect(x, y - 15, 20, 15); c.fillStyle = r.zemin; c.font = '600 11px sans-serif'; c.fillText(String(i + 1), x + 4, y - 4); } });
    c.fillStyle = r.kemik; c.globalAlpha = 0.7; c.fillRect(0, tara, w, 1.5); c.globalAlpha = 1;
  },
  klavye(c, w, h, t, r) {
    const k = Math.min(w * 0.84 / 21, h * 0.7 / 6), ox = (w - k * 21) / 2, oy = (h - k * 6) / 2;
    for (let y = 0; y < 6; y++) for (let x = 0; x < 21; x++) { const v = 0.5 + 0.5 * sin(x * 0.38 - t * 2 + y * 0.55); c.fillStyle = r.vurgu; c.globalAlpha = 0.08 + v * v * 0.92; c.fillRect(ox + x * k + 2, oy + y * k + 2, k - 4, k - 4); } c.globalAlpha = 1;
  },
  hikaye(c, w, h, t, r) {
    const n: [number, number][] = [[.08,.5],[.28,.28],[.28,.7],[.5,.16],[.5,.44],[.5,.78],[.74,.3],[.74,.66]], e: [number, number][] = [[0,1],[0,2],[1,3],[1,4],[2,4],[2,5],[3,6],[4,6],[4,7],[5,7]]; const a = w * 0.13, b = h * 0.12;
    e.forEach(([i, j], s) => { const A = n[i]!, B = n[j]!, x1 = A[0] * w + a, y1 = A[1] * h + b / 2, x2 = B[0] * w, y2 = B[1] * h + b / 2, m = (x1 + x2) / 2; c.strokeStyle = r.soluk; c.lineWidth = 2; c.beginPath(); c.moveTo(x1, y1); c.bezierCurveTo(m, y1, m, y2, x2, y2); c.stroke(); const p = (t * 0.35 + s * 0.17) % 1, q = 1 - p; c.fillStyle = r.vurgu; daire(c, q*q*q*x1 + 3*q*q*p*m + 3*q*p*p*m + p*p*p*x2, q*q*q*y1 + 3*q*q*p*y1 + 3*q*p*p*y2 + p*p*p*y2, 4); });
    n.forEach(([x, y], i) => { c.fillStyle = r.zemin; c.strokeStyle = i === Math.floor(t * 0.7) % 8 ? r.vurgu : r.kemik; c.lineWidth = 2; c.beginPath(); c.roundRect(x * w, y * h, a, b, 8); c.fill(); c.stroke(); });
  },
  bildirim(c, w, h, t, r) { for (let i = 0; i < 6; i++) { const p = (t * 0.28 + i / 6) % 1, y = h * (1.02 - p * 1.1); c.globalAlpha = Math.min(1, p * 5, (1 - p) * 5); c.fillStyle = i % 3 ? r.koyu : r.vurgu; c.beginPath(); c.roundRect(w * 0.25, y, w * 0.5, h * 0.11, 10); c.fill(); c.fillStyle = r.kemik; c.fillRect(w * 0.29, y + h * 0.033, w * 0.2, 4); c.globalAlpha *= 0.6; c.fillRect(w * 0.29, y + h * 0.066, w * 0.34, 3); } c.globalAlpha = 1; },
  eslesme(c, w, h, t, r) { const p = ucgen(t * 0.5), y = h * 0.5; c.strokeStyle = r.soluk; c.setLineDash([6, 8]); c.lineDashOffset = -t * 30; c.lineWidth = 2; c.beginPath(); c.moveTo(w * 0.2, y); c.lineTo(w * 0.8, y); c.stroke(); c.setLineDash([]); c.fillStyle = r.kemik; daire(c, w * 0.2, y, h * 0.09); c.fillStyle = r.vurgu; daire(c, w * 0.8, y, h * 0.09); c.fillStyle = r.kemik; daire(c, w * (0.2 + 0.6 * p), y, 7); },
  yaziyor(c, w, h, t, r) { c.fillStyle = r.koyu; c.beginPath(); c.roundRect(w * 0.3, h * 0.36, w * 0.4, h * 0.28, h * 0.14); c.fill(); for (let i = 0; i < 3; i++) { c.fillStyle = i === Math.floor(t * 3) % 3 ? r.vurgu : r.kemik; daire(c, w * (0.42 + i * 0.08), h * 0.5 - Math.max(0, sin(t * 6 - i * 0.9)) * h * 0.05, h * 0.028); } },
  hayalet(c, w, h, t, r) { c.fillStyle = r.koyu; ([[0,.86,1],[.12,.64,.24],[.56,.6,.3],[.34,.4,.26]] as [number, number, number][]).forEach(([x, y, a]) => c.fillRect(x * w, y * h, a * w, 5)); for (let i = 7; i >= 0; i--) { const u = t * 0.8 - i * 0.42, x = w * (0.1 + 0.8 * ucgen(u)), zip = abs(sin(u * 4)) * h * 0.26; c.globalAlpha = i ? 0.1 + (7 - i) * 0.06 : 1; c.fillStyle = i ? r.kemik : r.vurgu; c.fillRect(x - 11, h * 0.86 - 36 - zip, 22, 36); } c.globalAlpha = 1; },
  peri(c, w, h, t, r) {
    const x = w * (0.5 + 0.26 * sin(t * 0.7)), y = h * (0.4 + 0.14 * sin(t * 1.3)), yer = h * 0.86, kx = w * (0.5 + 0.2 * sin(t * 0.7 - 0.7)), yon = cos(t * 0.7 - 0.7) > 0 ? 1 : -1;
    const g = c.createRadialGradient(x, y, 0, x, y, h * 0.55);
    g.addColorStop(0, r.vurgu + 'cc'); g.addColorStop(0.18, r.vurgu + '55'); g.addColorStop(1, r.vurgu + '00');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.fillStyle = r.koyu; c.beginPath(); c.moveTo(0, h); for (let i = 0; i <= w; i += 8) c.lineTo(i, yer + sin(i * 0.05) * 2.5); c.lineTo(w, h); c.fill();
    c.fillStyle = r.zemin; const adim = sin(t * 7) * 4;
    c.beginPath(); c.roundRect(kx - 5, yer - 25, 10, 16, 4); c.fill(); daire(c, kx + yon, yer - 30, 5.5);
    c.fillRect(kx - 4 + adim * 0.5, yer - 11, 3.4, 12); c.fillRect(kx + 0.6 - adim * 0.5, yer - 11, 3.4, 12);
    c.fillStyle = r.kemik; const k = abs(sin(t * 13)) * 5;
    c.globalAlpha = 0.7; c.beginPath(); c.ellipse(x - 5, y - 1, 5.5, 2 + k, -0.5, 0, TAU); c.ellipse(x + 5, y - 1, 5.5, 2 + k, 0.5, 0, TAU); c.fill(); c.globalAlpha = 1; daire(c, x, y, 3.6);
    for (let i = 0; i < 9; i++) { const p = (t * 0.5 + i / 9) % 1; c.globalAlpha = (1 - p) * 0.8; c.fillStyle = r.vurgu; daire(c, w * (0.5 + 0.26 * sin((t - p * 0.9) * 0.7)) + sin(i * 9) * 5, h * (0.4 + 0.14 * sin((t - p * 0.9) * 1.3)) + p * 16, 1.5 * (1 - p)); }
    c.globalAlpha = 1;
  },
  boru(c, w, h, t, r) { for (let i = 0; i < 5; i++) { const x = ((i * 0.28 - t * 0.12) % 1.4 + 1.4) % 1.4 * w - w * 0.15, b = h * (0.2 + rnd(i + 2) * 0.35); c.fillStyle = r.koyu; c.fillRect(x, 0, w * 0.07, b); c.fillRect(x, b + h * 0.32, w * 0.07, h); } c.save(); c.translate(w * 0.3, h * (0.48 + 0.12 * sin(t * 3))); c.rotate(cos(t * 3) * 0.35); c.fillStyle = r.vurgu; c.fillRect(-16, -16, 32, 32); c.fillStyle = r.kemik; c.fillRect(4, -9, 8, 8); c.restore(); },
  ziplama(c, w, h, t, r) { for (let i = 0; i < 9; i++) { const y = ((i / 9 + t * 0.09) % 1) * h, x = w * (0.15 + rnd(i + 4) * 0.6); c.fillStyle = i % 4 ? r.koyu : r.soluk; c.beginPath(); c.roundRect(x, y, w * 0.14, 9, 5); c.fill(); } c.fillStyle = r.vurgu; daire(c, w * (0.5 + 0.2 * sin(t * 0.9)), h * 0.62 - abs(sin(t * 2.6)) * h * 0.3, h * 0.045); },
  pong(c, w, h, t, r) { const bx = w * (0.08 + 0.84 * ucgen(t * 0.55)), by = h * (0.08 + 0.84 * ucgen(t * 0.73)); c.fillStyle = r.koyu; for (let y = 0; y < h; y += 28) c.fillRect(w / 2 - 2, y, 4, 14); c.fillStyle = r.kemik; c.fillRect(w * 0.05, by - h * 0.1, 10, h * 0.2); c.fillRect(w * 0.95 - 10, h * (0.08 + 0.84 * ucgen(t * 0.73 - 0.08)) - h * 0.1, 10, h * 0.2); c.fillStyle = r.vurgu; c.fillRect(bx - 8, by - 8, 16, 16); },
  dalga(c, w, h, t, r) { const renk = [r.vurgu, r.kemik, r.soluk, r.koyu]; for (let k = 0; k < 4; k++) { c.strokeStyle = renk[k]!; c.lineWidth = 2.5; c.beginPath(); const y0 = h * (0.2 + k * 0.2); for (let x = 0; x <= w; x += 4) { const a = h * 0.07 * (0.35 + 0.65 * abs(sin(x * 0.006 + t * (0.6 + k * 0.3) + k))); c.lineTo(x, y0 + sin(x * (0.05 + k * 0.03) - t * (5 + k)) * a); } c.stroke(); } },
  ag(c, w, h, t, r) { for (let k = 0; k < 2; k++) { c.beginPath(); c.moveTo(0, h); for (let x = 0; x <= w; x += 6) { const u = x * 0.012 + t * (1 + k * 0.4); c.lineTo(x, h * (0.72 - k * 0.12) - h * 0.2 * (0.5 + 0.5 * sin(u)) * (0.6 + 0.4 * sin(u * 2.7 + k))); } c.lineTo(w, h); c.globalAlpha = k ? 0.9 : 0.4; c.fillStyle = k ? r.vurgu : r.kemik; c.fill(); } c.globalAlpha = 1; },
  defter(c, w, h, t, r) { c.strokeStyle = r.koyu; c.lineWidth = 2; for (let i = 0; i < 7; i++) { const y = h * (0.2 + i * 0.1); c.beginPath(); c.moveTo(w * 0.14, y); c.lineTo(w * 0.86, y); c.stroke(); } const p = (t * 0.6) % 6, s = Math.floor(p), k = p - s; c.strokeStyle = r.vurgu; for (let i = 0; i <= s; i++) { const y = h * (0.2 + i * 0.1) - 7; c.beginPath(); for (let x = 0; x <= (i === s ? k : 0.7 + rnd(i) * 0.3) * 0.7; x += 0.006) c.lineTo(w * (0.15 + x), y + sin(x * 130 + i) * 4 * rnd(Math.floor(x * 40) + i)); c.stroke(); } },
};

/** Sahnesi seçilmemiş işler için addan üretilen, her işe farklı bir desen. */
const imza = (tohum: number): Cizici => (c, w, h, t, r) => {
  const halka = 3 + Math.floor(rnd(tohum) * 3), kol = 3 + Math.floor(rnd(tohum + 1) * 6);
  c.lineWidth = 2;
  for (let k = 0; k < halka; k++) {
    c.strokeStyle = k === 0 ? r.vurgu : k % 2 ? r.kemik : r.soluk;
    c.globalAlpha = 1 - k * 0.15;
    c.beginPath();
    for (let a = 0; a <= TAU + 0.01; a += TAU / 220) {
      const q = h * (0.12 + k * 0.075) * (1 + 0.28 * sin(a * kol + t * (0.5 + rnd(tohum + k) * 0.6) * (k % 2 ? -1 : 1)) * rnd(tohum + k + 5));
      c.lineTo(w / 2 + cos(a) * q * 1.25, h / 2 + sin(a) * q);
    }
    c.stroke();
  }
  c.globalAlpha = 1;
};

const kimlikKumesi = new Set<string>(sahneKimlikleri);
export function sahneBul(ad: string | undefined, kayitId: string): Cizici {
  if (ad && kimlikKumesi.has(ad)) return sahneler[ad as SahneKimligi];
  let t = 7;
  for (const h of kayitId) t = (t * 31 + h.charCodeAt(0)) % 9973;
  return imza(t);
}
