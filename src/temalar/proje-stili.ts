import { createHash } from 'node:crypto';
import { tumIsler } from '../kutuphane/kayit';
import { tipler } from './tipler';

/** Her projenin rengi ve yazısı, içerikteki `gorunum` alanından. Değerler şemada doğrulandığı için doğrudan yazılır. */
export async function projeStili(): Promise<string> {
  return (await tumIsler())
    .map(({ id, veri: { gorunum: g } }) => {
      const t = tipler[g.tip];
      return `:root[data-is='${id}'],[data-is='${id}']{--zemin:${g.zemin};--yazi:${g.yazi};--vurgu:${g.vurgu};--vurgu-yazi:${g.vurguYazi};--tip:'${t.aile}';--kalin:${t.kalin};--ara:${t.ara};--boy:${g.boy ?? t.boy};--en:${g.en ? `${g.en}px` : 'none'};--odak:${g.odak}%;--merkez:${g.merkez[0]}% ${g.merkez[1]}%;--kafa:${g.kafa}%}`;
    })
    .join('\n');
}
/** İçerik değişince adres de değişir, eski stil önbellekte kalmaz. */
export const projeStiliAdresi = async () => `/projeler.css?v=${createHash('sha256').update(await projeStili()).digest('hex').slice(0, 10)}`;
