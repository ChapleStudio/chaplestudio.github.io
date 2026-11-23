export interface Kamera { x: number; y: number; z: number }
export interface Kutu { x: number; y: number; w: number; h: number }

/**
 * İki görünüm arasında yakınlaşma ve kaydırmayı birlikte yapan yol (van Wijk ve Nuij, 2003).
 * `genislik` ekranın piksel genişliğidir; dönen fonksiyon 0..1 alır.
 */
export function ucusYolu(a: Kamera, b: Kamera, genislik: number): { yer: (t: number) => Kamera; uzunluk: number } {
  const rho = 1.3, r2 = rho * rho, r4 = r2 * r2;
  const w0 = genislik / a.z, w1 = genislik / b.z, dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy;
  if (d2 < 1) {
    const S = Math.log(w1 / w0) / rho;
    return { uzunluk: Math.abs(S), yer: (t) => ({ x: a.x + t * dx, y: a.y + t * dy, z: genislik / (w0 * Math.exp(rho * t * S)) }) };
  }
  const d1 = Math.sqrt(d2);
  const b0 = (w1 * w1 - w0 * w0 + r4 * d2) / (2 * w0 * r2 * d1), b1 = (w1 * w1 - w0 * w0 - r4 * d2) / (2 * w1 * r2 * d1);
  const q0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0), q1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1), S = (q1 - q0) / rho;
  return {
    uzunluk: Math.abs(S),
    yer: (t) => {
      const s = t * S, c0 = Math.cosh(q0), u = (w0 / (r2 * d1)) * (c0 * Math.tanh(rho * s + q0) - Math.sinh(q0));
      return { x: a.x + u * dx, y: a.y + u * dy, z: genislik / ((w0 * c0) / Math.cosh(rho * s + q0)) };
    },
  };
}
export const yumusak = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);
