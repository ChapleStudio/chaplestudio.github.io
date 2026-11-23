const kanal = (x: number) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
const parlaklik = (hex: string) => {
  const n = Number.parseInt(hex.slice(1), 16);
  return 0.2126 * kanal(((n >> 16) & 255) / 255) + 0.7152 * kanal(((n >> 8) & 255) / 255) + 0.0722 * kanal((n & 255) / 255);
};
/** İki rengin WCAG karşıtlık oranı. */
export function kontrast(a: string, b: string): number {
  const [x, y] = [parlaklik(a), parlaklik(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}
