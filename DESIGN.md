# Chaple Studio tasarım kuralları

## Fikir

**Stüdyo susar, iş konuşur.** Arayüz beyaz ve sessizdir; bütün renk ve karakter projelerden gelir. Her projenin kendi afişi, kendi renkleri ve kendi yazı tipi vardır. Ana sayfanın üstü seçili projenin sahnesidir, altında dört kategori durur.

## Gezinme

- Kategori → dilimler → proje → içine girme. Kategoriye basınca sahne o kategorinin afişlerine bölünür, basılan dilim ekranı kaplar, "İçine gir" afişe yakınlaşıp sayfayı açar.
- **Her şey tıklamayla olur.** Üstüne gelmek hiçbir şeyi açmaz ya da değiştirmez.
- Teknoloji etiketi (Unity, C#…) gezinmede yoktur, proje sayfasının künyesinde durur.
- Adın altındaki iki üç kelime projenin ne yaptığını söyler. Adlar ve açıklamalar tek satır, aynı çizgidedir.

## Afişler

Kesme kâğıt tarzı: düz renkler, elle kesilmiş gibi kenar, hafif kâğıt dokusu. Konu sağda; sol yarı sakin, çünkü üstüne ad gelir. 1920×900. Soyut ya da mekanik değil, **karakterli ve küçük bir hikâyesi olan** çizim: kardan adam, tavşan, kuşlar. Ekran görüntüsü afişe konmaz, proje sayfasında durur; görsel uydurulmaz. Kaynak: `araclar/afis-ciz.py`.

## Renk ve yazı

Stüdyo: beyaz `#ffffff`, siyah `#111111`, seçili olmayan kategori `#757575`, açıklama `#595959`. Arayüz yazısı Hanken Grotesk. Proje renkleri içerikteki `gorunum` alanındadır; karşıtlık 4,5'in altındaysa derleme durur. Proje adının yazı tipleri `src/temalar/tipler.ts` içindedir.

Parlama, renk lekesi, nokta ızgara, süzülen toz, hap biçimi ve aynı kalıptan kartlar yoktur.

## Hareket

- Afiş geçişi soldan sağa silinir (önce ad okunur), dilimler yukarıdan iner, kapanış da animasyonludur.
- Animasyonlar `Element.animate` ile başlatılır; her tıklamada baştan oynar, durum farkına bağlı değildir.
- Sürekli çizim döngüsü yoktur; kimse dokunmuyorsa hiçbir şey çalışmaz.
- `prefers-reduced-motion` hepsini kapatır.

## Erişim

Her ad gerçek bir bağlantıdır: orta tuş ve Ctrl ile yeni sekmede açılır. JavaScript yoksa bütün kategoriler açık listelenir. Esc dilimleri kapatır, proje sayfasından çıkar.
