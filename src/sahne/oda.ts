/** Proje sayfası: "Bütün projeler" ve Esc, ana sayfaya aynı projeye döner. Geçmişte varsa geri gidilir, kaydırma ve durum korunur. */
import { DONUS } from './donus';
const cik = document.querySelector<HTMLAnchorElement>('[data-cik]');
if (cik) {
  const id = cik.dataset['cik']!;
  const anaSayfadan = () => document.referrer !== '' && new URL(document.referrer).origin === location.origin && new URL(document.referrer).pathname === '/';
  if (anaSayfadan()) sessionStorage.setItem(DONUS, id);
  const don = () => {
    sessionStorage.setItem(DONUS, id);
    if (anaSayfadan() && history.length > 1) history.back();
    else location.assign(cik.href);
  };
  cik.addEventListener('click', (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    don();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !e.defaultPrevented) don(); });
}
