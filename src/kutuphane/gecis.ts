/** Raftaki kutuyu iş sayfasının başlık bloğuna bağlar. Desteklemeyen tarayıcıda hiçbir şey değişmez. */
const kutuBul = (adres: string | null | undefined): HTMLElement | null =>
  adres ? document.querySelector<HTMLElement>(`[data-kutu="${CSS.escape(new URL(adres).pathname)}"]`) : null;

async function adlandir(kutu: HTMLElement | null, bitince: Promise<unknown>) {
  if (!kutu) return;
  kutu.style.viewTransitionName = 'kutu';
  await bitince.catch(() => undefined);
  kutu.style.viewTransitionName = '';
}

addEventListener('pageswap', (e) => {
  if (e.viewTransition) void adlandir(kutuBul(e.activation?.entry?.url), e.viewTransition.finished);
});
addEventListener('pagereveal', (e) => {
  if (e.viewTransition) void adlandir(kutuBul(navigation.activation?.from?.url), e.viewTransition.ready);
});
