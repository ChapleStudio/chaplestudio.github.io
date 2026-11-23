export const sahneKimlikleri = ['kar', 'tarama', 'klavye', 'hikaye', 'bildirim', 'eslesme', 'yaziyor', 'hayalet', 'peri', 'boru', 'ziplama', 'pong', 'dalga', 'ag', 'defter'] as const;
export type SahneKimligi = (typeof sahneKimlikleri)[number];
