import math,random,os,subprocess,sys
# Kullanım: python3 araclar/afis-ciz.py [ad...]   Afişleri src/assets/afisler/ içine çizer (Google Chrome ve ImageMagick gerekir).
import tempfile
KOK=os.path.dirname(os.path.dirname(os.path.abspath(__file__))); CIKTI=KOK+'/src/assets/afisler'; S=tempfile.mkdtemp()
W,H=1920,900
def c(x,y,r,f,e=''): return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{f}" {e}/>'
def r(x,y,w,h,f,e=''): return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{f}" {e}/>'
def p(d,f='none',e=''): return f'<path d="{d}" fill="{f}" {e}/>'
def st(col,w,cap='round'): return f'stroke="{col}" stroke-width="{w}" stroke-linecap="{cap}" stroke-linejoin="round"'
def ln(x1,y1,x2,y2,col,w,cap='round'): return f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" {st(col,w,cap)}/>'
def poly(pts,f,e=''): return '<polygon points="'+' '.join(f'{a:.1f},{b:.1f}' for a,b in pts)+f'" fill="{f}" {e}/>'
def g(s,t='',e=''): return f'<g transform="{t}" {e}>{s}</g>'
def arch(x,y,w,h): return f'M{x} {y+h}V{y+w/2}A{w/2} {w/2} 0 0 1 {x+w} {y+w/2}V{y+h}Z'
A={}
# ---------- FAIRY
def fairy():
    bg='#12302a'; random.seed(4); cx,cy,R=1380,390,300
    def trunks(col,seedv,xs,ws,lean):
        random.seed(seedv); s=''
        for x,w in zip(xs,ws):
            l=lean*random.uniform(-1,1); t=w*.62
            s+=p(f'M{x-w/2-30} 900 C{x-w/2} 780 {x-w/2+8} 700 {x-w/2+l*.4} 450 L{x-t/2+l} -10 H{x+t/2+l} L{x+w/2+l*.4} 450 C{x+w/2-6} 700 {x+w/2} 790 {x+w/2+34} 900Z',col)
            for k in range(2):
                by=random.randint(120,420); sgn=random.choice((-1,1)); bl=random.randint(90,190)
                s+=p(f'M{x+l*.5} {by+40} Q{x+sgn*bl*.5} {by+10} {x+sgn*bl} {by-60}','none',st(col,w*.16))
        return s
    xsB=[690,860,1010,1180,1290,1480,1620,1760,1890]; wsB=[40,54,46,60,38,50,44,64,52]
    xsF=[960,1655,1850]; wsF=[104,120,150]
    o=r(0,0,W,H,bg)+trunks('#1a443a',2,xsB,wsB,40)
    o+=f'<clipPath id="d"><circle cx="{cx}" cy="{cy}" r="{R}"/></clipPath>'
    o+=c(cx,cy,R+70,'#1f5244')
    o+=trunks('#173d34',2,xsB,wsB,40)
    o+=f'<g clip-path="url(#d)">'+r(0,0,W,H,'#f6e3a1')+trunks('#b9cf86',2,xsB,wsB,40)+p('M1000 900 C1150 640 1500 610 1800 660 V900Z','#8fb36a')+'</g>'
    o+=p('M620 900 C820 780 1000 700 1200 676 C1360 660 1500 720 1640 770 C1760 810 1850 800 1920 790 V900Z','#0b211d')
    o+=trunks('#0b211d',7,xsF,wsF,30)
    # yaprak örtüsü
    random.seed(9)
    for x in range(820,1960,74): o+=c(x,random.randint(-40,24),random.randint(60,104),'#0b211d')
    # insan
    h='#0b211d'
    o+=g(c(0,-118,23,h)+p('M-22 -92 C-34 -40 -40 10 -44 58 H40 C36 0 30 -50 20 -92Z',h)+p('M14 -82 Q52 -120 66 -182','none',st(h,17))+p('M-16 -82 Q-46 -50 -44 -4','none',st(h,17))+ln(-20,50,-24,104,h,18)+ln(16,50,22,104,h,18)+p('M-22 -126 C-50 -110 -60 -70 -74 -46 C-44 -56 -26 -76 -20 -96Z','#8d2f2a'),'translate(1250 590) scale(1.02)')
    # peri
    o+=g(''.join(g(f'<ellipse cx="0" cy="-44" rx="17" ry="46" fill="{k}"/>',f'rotate({a})') for a,k in ((-64,'#ffffff'),(64,'#ffffff'),(-112,'#dff0c8'),(112,'#dff0c8')))+c(0,-32,13,'#c8452c')+p('M-9 -20 H9 L20 26 H-20Z','#c8452c')+ln(-6,26,-8,50,'#c8452c',6)+ln(6,26,10,48,'#c8452c',6),'translate(1400 290) rotate(10) scale(1.25)')
    return o
A['fairy-of-light']=fairy
# ---------- CLONE
def clone():
    o=r(0,0,W,H,'#f4ead6')
    o+=c(1690,470,250,'#e2352b')+r(900,712,1020,188,'#14141c')+r(760,800,90,30,'#14141c')
    def pol(x,y,a,l): return x+l*math.sin(math.radians(a)),y+l*math.cos(math.radians(a))
    def runner(x,ph,col,vis):
        y=470+ -16*abs(math.sin(ph)); s=''
        s+=ln(x,y,x+34,y-118,col,62)                       # gövde
        hx,hy=x+56,y-200; s+=c(hx,hy,41,col)
        s+=p(f'M{hx-44} {hy-10} A44 44 0 0 1 {hx+42} {hy-14} L{hx+62} {hy-8} L{hx-44} {hy+2}Z',col)
        for k,sg in ((0,1),(1,-1)):
            a=sg*52*math.sin(ph); kx,ky=pol(x,y,a+14,112); b=a-18-48*max(0,math.sin(ph+ (0 if sg>0 else math.pi)-1.1)); fx,fy=pol(kx,ky,b,116)
            s+=p(f'M{x} {y} L{kx:.0f} {ky:.0f} L{fx:.0f} {fy:.0f} l34 4','none',st(col,42))
        sx,sy=x+30,y-112
        s+=p(f'M{sx} {sy} l38 64 l84 -26','none',st(col,32))+p(f'M{sx} {sy} l-40 58 l-34 34','none',st(col,32))
        s+=r(sx+92,sy+14,118,22,col)+r(sx+104,sy+30,22,40,col)
        if vis: s+=r(hx+6,hy-10,30,14,'#f4ead6')
        return s
    cols=['#e3dccb','#cfcfd6','#b3bde0','#8e9fe0','#667fe0','#1b3fd6']
    n=len(cols)
    for i,co in enumerate(cols): o+=runner(985+i*108,0.15+i*0.62,co,i==n-1)
    # kule
    k='#14141c'
    o+=poly([(1700,712),(1728,300),(1832,300),(1860,712)],k)+r(1690,230,180,80,k)+poly([(1674,232),(1780,150),(1886,232)],k)+r(1716,252,52,34,'#f4ead6')+r(1792,252,52,34,'#f4ead6')+ln(1780,150,1780,70,k,8)+poly([(1784,72),(1866,98),(1784,124)],'#e2352b')
    return o
A['clone-combat']=clone
# ---------- UNITY ONLINE
def unity():
    o=r(0,0,W,H,'#0c4a53')+c(1400,520,290,'#f1dcb0')+r(0,520,W,380,'#083a42')
    random.seed(3)
    for i in range(11):
        y=548+i*i*2.6; hw=250-i*18
        if hw>30: o+=r(1400-hw+random.randint(-20,20),y,hw*2,9+i*.6,'#d9b97a' if i<8 else '#0c4a53')
    for i in range(16):
        x=random.randint(60,1860); y=random.randint(580,880); o+=r(x,y,random.randint(60,190),6,'#0f5862')
    ink='#05242a'
    def isle(x,w,h,f): return poly([(x-w,640),(x-w*.72,640-h*.5),(x-w*.4,640-h*.86),(x-w*.1,640-h),(x+w*.34,640-h*.94),(x+w*.6,640-h*.5),(x+w,640)],f)+poly([(x-w*.2,640),(x-w*.1,640-h),(x+w*.34,640-h*.94),(x+w*.6,640-h*.5),(x+w,640)],'#0a2f36')
    o+=isle(1040,160,120,ink)+isle(1740,170,150,ink)
    def kid(x,y,col,s):
        return g(c(0,-122,28,ink)+p('M-30 -92 H30 L40 10 H-40Z',col)+ln(-16,10,-18,62,ink,20)+ln(16,10,18,62,ink,20)+p('M22 -80 L54 -112 L34 -126','none',st(col,18))+g(r(-18,-15,36,30,'#f0653f'),'translate(40 -130) rotate(-8)')+ln(-26,-80,-46,-20,col,18),f'translate({x} {y}) scale({s} 1)')
    o+=kid(1060,462,'#f1dcb0',1)+kid(1730,432,'#f0653f',-1)
    o+=p('M1120 332 C1300 420 1500 410 1672 302','none',st(ink,6))
    o+=g(c(0,0,20,'#f0653f')+p('M-10 12 L-34 60 M10 12 L30 64','none',st('#f0653f',9)),'translate(1400 385)')
    return o
A['unity-online-altyapisi']=unity
# ---------- BOOBLE
def booble():
    o=r(0,0,W,H,'#f7c331')+p('M1920 0 V760 A900 900 0 0 1 1080 0Z','#5fb3dc')
    n='#1b2a49'
    def plank(x,y,w,a=0,f=n): return g(r(-w/2,-17,w,34,f)+ln(-w/2+20,0,w/2-60,0,'#33466f',4)+c(-w/2+20,0,5,'#f7c331')+c(w/2-20,0,5,'#f7c331'),f'translate({x} {y}) rotate({a})')
    o+=plank(1010,820,250)+plank(1740,640,230)+plank(1120,470,200)+plank(1800,300,190)+plank(1500,96,220)
    # kırık
    o+=g(poly([(-110,-17),(10,-17),(-12,-4),(8,4),(-14,17),(-110,17)],'#c4452f'),'translate(1330 720) rotate(24)')+g(poly([(110,-17),(4,-17),(-14,-4),(6,6),(-8,17),(110,17)],'#c4452f'),'translate(1440 742) rotate(-28)')
    # yay
    o+=plank(1640,838,220)+p('M1600 818 L1680 800 L1600 782 L1680 764 L1600 746 L1680 728','none',st(n,11))+r(1590,708,100,18,'#ffffff')
    # yaratık
    cr='#ffffff'
    o+=g(p('M-60 96 Q-120 140 -96 208','none',st(n,26))+p('M60 92 Q112 128 120 196','none',st(n,26))+c(-96,214,24,n)+c(124,204,24,n)+p('M-128 -10 Q-196 -60 -196 -126','none',st(n,24))+p('M126 -14 Q196 -62 206 -130','none',st(n,24))+c(0,0,142,cr)+p('M-142 0 A142 142 0 0 0 142 0 Q0 64 -142 0Z','#e9edf2')+c(-44,-40,30,n)+c(52,-44,30,n)+c(-36,-52,10,'#fff')+c(60,-56,10,'#fff')+p('M-34 22 Q8 78 52 18 Z',n)+p('M-10 48 Q10 62 28 42 Q10 34 -10 48Z','#e4472f')+p('M-46 -132 Q-70 -190 -120 -196 Q-104 -150 -76 -120Z','#5fb3dc')+p('M40 -136 Q58 -196 108 -208 Q100 -160 74 -124Z','#5fb3dc'),'translate(1400 380) rotate(8) scale(.96)')
    return o
A['booble-jump']=booble
# ---------- FLAPPY
def flappy():
    o=r(0,0,W,H,'#f6a673')+c(1240,470,330,'#fbeed9')
    def chim(x,y0,y1,w,up):
        s=r(x,y0,w,y1-y0,'#b5412d'); row=0; y=y0
        while y<y1:
            for k in range(-1,int(w/60)+1):
                bx=x+k*64+(32 if row%2 else 0); a=max(bx,x); b=min(bx+56,x+w)
                if b>a+6: s+=r(a,y,b-a,24,'#c9553b' if (k*7+row*3)%5 else '#8f2f20')
            y+=32; row+=1
        cy=y0 if up else y1-70
        s+=r(x-26,cy,w+52,70,'#8f2f20')+r(x-26,cy+(58 if up else 0),w+52,12,'#6f2216')
        return s
    o+=f'<clipPath id="cv"><rect x="0" y="0" width="{W}" height="{H}"/></clipPath><g clip-path="url(#cv)">'
    o+=chim(1010,650,930,150,True)+chim(1540,-10,270,190,False)+chim(1560,640,930,190,True)+chim(1030,-10,150,130,False)+'</g>'
    # kes çizgisi
    o+=p('M930 560 C1010 620 1080 600 1120 540','none',st('#1d2c4d',6)+' stroke-dasharray="18 16"')
    # makas
    o+=g(p('M0 0 L150 -34 L156 -18 L6 16Z','#1d2c4d')+p('M0 0 L150 34 L156 18 L6 -16Z','#33466f')+c(-34,-34,30,'none',st('#e2a72e',15))+c(-34,34,30,'none',st('#e2a72e',15))+c(12,0,8,'#fbeed9'),'translate(900 560) rotate(150) scale(.9)')
    d='<pattern id="cz" width="26" height="26" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="26" height="26" fill="#e2a72e"/><rect width="12" height="26" fill="#f4c65a"/></pattern><pattern id="nk" width="34" height="34" patternUnits="userSpaceOnUse"><rect width="34" height="34" fill="#1d6f86"/><circle cx="17" cy="17" r="8" fill="#bfe3e0"/></pattern><pattern id="kr" width="40" height="40" patternUnits="userSpaceOnUse"><rect width="40" height="40" fill="#fff"/><path d="M0 0h20v20H0zM20 20h20v20H20z" fill="#c4452f"/></pattern>'
    o+=g(poly([(-150,-10),(-290,-84),(-262,-10),(-300,66),(-150,50)],'url(#kr)')+poly([(-160,-70),(-60,-142),(60,-140),(150,-66),(168,30),(96,116),(-40,134),(-150,74)],'url(#cz)')+poly([(140,-46),(268,10),(150,62)],'#c4452f')+poly([(150,30),(236,26),(148,66)],'#8f2f20')+poly([(44,-104),(110,-96),(122,-36),(62,-22),(28,-60)],'#fff')+c(82,-60,17,'#1d2c4d')+poly([(-110,-20),(30,-10),(44,30),(-40,150),(-150,190),(-92,100),(-176,96),(-120,50),(-190,20)],'url(#nk)'),'translate(1300 430) rotate(-10)')
    return f'<defs>{d}</defs>'+o
A['customizable-flappy-bird']=flappy
# ---------- MUSIC
def music():
    o=r(0,0,W,H,'#3b1735')
    cx,cy=1400,390
    o+=f'<clipPath id="u"><rect x="0" y="0" width="{W}" height="392"/></clipPath><g clip-path="url(#u)">'+c(cx,cy,350,'#140812')
    for k in range(330,140,-19): o+=c(cx,cy,k,'none','stroke="#3a2036" stroke-width="4"')
    o+=c(cx,cy,126,'#f08aa0')+c(cx,cy,126,'none','stroke="#f7ecd9" stroke-width="8"')+c(cx,cy,22,'#140812')+p('M1150 250 A290 290 0 0 1 1290 120','none',st('#6d4766',16))+'</g>'
    d='<pattern id="m1" width="60" height="44" patternUnits="userSpaceOnUse"><rect width="60" height="44" fill="#f08aa0"/><path d="M0 34L30 8L60 34" fill="none" stroke="#3b1735" stroke-width="10"/></pattern><pattern id="m2" width="64" height="64" patternUnits="userSpaceOnUse"><rect width="64" height="64" fill="#f7ecd9"/><circle cx="32" cy="32" r="18" fill="#c4452f"/></pattern><pattern id="m3" width="40" height="30" patternUnits="userSpaceOnUse"><rect width="40" height="30" fill="#e0a526"/><rect width="40" height="12" fill="#3b1735"/></pattern><pattern id="m4" width="44" height="44" patternUnits="userSpaceOnUse"><rect width="44" height="44" fill="#2f8f8b"/><path d="M0 0H22V22H0ZM22 22H44V44H22Z" fill="#d6ece4"/></pattern>'
    xs=[1040,1225,1410,1595]; le=[820,900,740,860]; amp=[26,-30,24,-22]
    for i,(x,l,a) in enumerate(zip(xs,le,amp)):
        w=150
        o+=p(f'M{x} 470 C{x+a} 560 {x-a} 680 {x+a*.6} {l} l{w/2} -34 l{w/2} 34 C{x+w-a} 680 {x+w+a} 560 {x+w} 470Z',f'url(#m{i+1})')
    o+=r(980,386,840,110,'#e0a526')+r(980,386,840,18,'#f4c65a')+r(1030,420,740,16,'#3b1735')+r(980,480,840,16,'#b07d12')
    o+=c(1846,441,50,'#f7ecd9')+c(1846,441,18,'#3b1735')+ln(1846,441,1846,320,'#f7ecd9',18)+r(1818,272,56,60,'#c4452f')
    return f'<defs>{d}</defs>'+o
A['music-shredder']=music
# ---------- PCEYE
def pceye():
    o=r(0,0,W,H,'#0f1b2d'); cx,cy=1400,440
    def alm(w,h): return f'M{cx-w} {cy} C{cx-w*.5} {cy-h} {cx+w*.5} {cy-h} {cx+w} {cy} C{cx+w*.5} {cy+h} {cx-w*.5} {cy+h} {cx-w} {cy}Z'
    for w,h,col in ((620,560,'#16283f'),(560,490,'#213a56'),(505,420,'#5d7f99')): o+=p(alm(w,h),col)
    o+=p(alm(452,352),'#eef4f7')
    o+=f'<clipPath id="e"><path d="{alm(452,352)}"/></clipPath><g clip-path="url(#e)">'+c(cx,cy,236,'#5d7f99')+c(cx,cy,212,'#0f1b2d')
    # pencere irisi
    o+=r(cx-128,cy-128,256,256,'#cfe3ee')+r(cx-112,cy-112,224,224,'#0f1b2d')
    k=0
    for yy in range(3):
        for xx in range(3):
            f='#f26b21' if (xx,yy)==(2,0) else ('#5d7f99' if (xx+yy)%2 else '#2b4763')
            o+=r(cx-100+xx*70,cy-100+yy*70,60,60,f)
    for a in range(0,360,15):
        x1,y1=cx+186*math.cos(math.radians(a)),cy+186*math.sin(math.radians(a)); x2,y2=cx+226*math.cos(math.radians(a)),cy+226*math.sin(math.radians(a)); o+=ln(x1,y1,x2,y2,'#cfe3ee',7,'butt')
    o+='</g>'
    for i,a in enumerate((-62,-38,-14,14,38,62)):
        x=cx+a*6.2; y0=cy-300+abs(a)*1.5; o+=ln(x,y0-40,x+a*1.15,y0-128+abs(a)*.5,'#cfe3ee',16,'butt')
    # pencere siluetleri
    random.seed(8)
    for x in range(880,1920,58):
        h=random.randint(60,170); o+=r(x,H-h,52,h,'#1b3048')
        for yy in range(H-h+14,H-10,30):
            for q in (8,30): o+=r(x+q,yy,14,16,'#2f4f6c')
    o+=r(1866-6,812-2,1,1,'#0f1b2d')
    return o
A['pc-eye']=pceye
# ---------- NETWORK
# ---------- SNOWDESK
def snow():
    o=r(0,0,W,H,'#bfe0f2')+c(1500,230,170,'#eaf5fb')
    random.seed(12)
    for _ in range(34): o+=c(random.randint(40,1880),random.randint(20,640),random.choice((5,7,9,12)),'#ffffff')
    n='#1f4e8c'
    def pile(x,y,w,h,sd):
        random.seed(sd); d=f'M{x-16} {y+12} Q{x-22} {y-6} {x} {y-8}'; k=x; seg=w/5
        for i in range(5):
            top=y-h*(.6+.4*random.random())*(1 if 0<i<4 else .55); d+=f' Q{k+seg/2:.0f} {top-18:.0f} {k+seg:.0f} {(y-h*.55 if i<4 else y-8):.0f}'; k+=seg
        return p(d+f' Q{x+w+22} {y-6} {x+w+16} {y+12} Q{x+w*.8} {y+34} {x+w*.66} {y+14} Q{x+w*.5} {y+40} {x+w*.36} {y+14} Q{x+w*.2} {y+30} {x-16} {y+12}Z','#ffffff')
    def win(x,y,w,h,body): return r(x+12,y+14,w,h,'#8fbfdd')+r(x,y,w,h,n)+r(x+10,y+52,w-20,h-62,body)+r(x+w-44,y+16,24,24,'#f07f2e')+r(x+w-78,y+16,24,24,'#bfe0f2')+r(x+20,y+18,w*.34,18,'#3d6fae')
    o+=g(win(0,0,360,250,'#dceefa')+r(40,90,200,18,'#a9cfe8')+r(40,124,260,18,'#a9cfe8')+r(40,158,150,18,'#a9cfe8'),'translate(1510 520) rotate(13)')
    o+=g(p('M-10 8 Q20 -34 90 -40 Q190 -46 230 6 Q120 26 -10 8Z','#fff'),'translate(1580 506) rotate(13)')+''.join(c(a,b,q,'#fff') for a,b,q in ((1876,640,22),(1890,700,15),(1862,738,11)))
    o+=win(960,394,520,350,'#f4fafd')+r(1010,484,420,20,'#cfe4f1')+r(1010,524,300,20,'#cfe4f1')+r(1010,570,180,130,'#bfe0f2')+r(1214,570,216,130,'#dceefa')+pile(960,394,520,70,5)
    o+=win(1590,262,230,150,'#eaf5fb')+pile(1590,262,230,38,8)
    # kardan adam
    sm='#ffffff'
    o+=g(c(0,0,84,'#d6e9f4')+c(-5,-4,82,sm)+c(0,-112,60,'#d6e9f4')+c(-4,-114,58,sm)+c(-22,-126,8,'#0f2f5c')+c(20,-126,8,'#0f2f5c')+poly([(0,-112),(72,-100),(2,-92)],'#f07f2e')+''.join(c(-2,q,7,'#0f2f5c') for q in (-30,0,30))+p('M-50 -70 Q0 -44 50 -70 L54 -48 Q0 -22 -54 -48Z','#d93a3a')+poly([(24,-52),(58,-50),(64,18),(34,20)],'#d93a3a')+r(-66,-176,132,16,'#0f2f5c')+r(-42,-244,84,74,'#0f2f5c')+r(-42,-190,84,14,'#f07f2e')+p('M-78 -24 L-146 -84 M-120 -60 L-150 -56 M-124 -64 L-126 -96','none',st('#6b4327',10))+p('M78 -24 L140 -92 M116 -66 L146 -66','none',st('#6b4327',10)),'translate(1130 296) scale(.9)')
    # ren geyiği
    b='#7a4a28'
    o+=g(p('M-60 0 Q-70 -50 -20 -52 H40 Q66 -50 66 -14 V4 H-60Z',b)+''.join(ln(q,0,q+w2,62,b,13) for q,w2 in ((-48,-10),(-26,6),(38,-8),(58,8)))+p('M50 -40 L88 -100','none',st(b,24))+g('<ellipse cx="0" cy="0" rx="34" ry="20" fill="%s"/>'%b,'translate(104 -108) rotate(18)')+c(136,-98,9,'#d93a3a')+c(106,-116,4,'#fff')+p('M86 -122 L70 -176 M78 -150 L52 -166 M96 -122 L104 -178 M100 -152 L124 -170','none',st(b,8))+p('M-60 -36 L-80 -50','none',st(b,12)),'translate(1690 182) scale(.8)')
    o+=p('M0 900 V850 Q300 800 620 838 Q980 878 1300 826 Q1640 780 1920 840 V900Z','#ffffff')
    return o
A['snowdesk']=snow
# ---------- BILDIRIM
def bild():
    o=r(0,0,W,H,'#5a1428'); random.seed(5)
    o+=r(1150,70,720,900,'#3d0a19')+r(1130,50,720,900,'#f26d5b')+r(1110,30,760,44,'#c24a3c')
    cols,rows=4,5; cw,ch=160,132
    for j in range(rows):
        for i in range(cols):
            x,y=1162+i*168,104+j*150
            op=(i,j) in ((1,2),)
            o+=r(x,y,cw,ch,'#c24a3c')
            t=(i*5+j*3+i*j)%4
            if t!=1 and not op:
                for k in range(1+t%3):
                    o+=g(r(0,-34-k*9,70,70,['#f9d3c5','#fff4ec','#e0a526'][(k+t)%3]),f'translate({x+20+k*26} {y+14}) rotate({-10+k*11+t*2})')
            o+=r(x+6,y+14,cw-12,ch-20,'#e25a49')+r(x+50,y+38,60,30,'#fff4ec')+r(x+58,y+88,44,12,'#5a1428')
    # açık çekmece
    x,y=1162+168,104+300
    o+=poly([(x-26,y+60),(x+cw+26,y+60),(x+cw+6,y+20),(x-6,y+20)],'#3d0a19')
    for k,(f,a) in enumerate((('#fff4ec',-12),('#f9d3c5',-3),('#e0a526',8),('#fff4ec',16))): o+=g(r(-36,-104,72,110,f)+r(-24,-88,48,7,'#c24a3c')+r(-24,-72,34,7,'#c24a3c'),f'translate({x+26+k*36} {y+54}) rotate({a})')
    o+=r(x-30,y+50,cw+60,ch+14,'#f58876')+r(x+46,y+84,68,34,'#fff4ec')+r(x+56,y+142,48,14,'#5a1428')
    def env(x,y,a,s,f='#fff4ec',fl='#f9d3c5'): return g(r(-70,-46,140,92,f)+poly([(-70,-46),(0,18),(70,-46)],fl)+p('M-70 -46 L0 18 L70 -46','none',st('#5a1428',4)),f'translate({x} {y}) rotate({a}) scale({s})')
    o+=p('M620 60 C800 60 980 130 1080 300 C1130 380 1200 420 1310 430','none',st('#8a2a40',6)+' stroke-dasharray="4 22"')
    o+=env(640,70,-16,.7)+env(800,116,10,.9,'#e0a526','#f4c65a')+env(950,206,-8,1.05)+env(1060,346,24,.95,'#f9d3c5','#fff4ec')
    return o
A['bildirim-kaydedici']=bild
# ---------- YAZIYOR
def yaz():
    o=r(0,0,W,H,'#1b6b5e')
    b='M960 150 H1800 V650 H1180 L1030 800 V650 H960Z'
    o+=p(b,'#0f4a41','transform="translate(20 22)"')+p(b,'#bfe5d3')
    for y,sg in ((566,0),): o+=p('M940 556 Q1380 600 1820 556','none',st('#12211f',9))
    def bird(x,y,body,face=1,hop=False):
        k='#12211f'
        s=p('M-96 24 C-110 -60 -40 -110 10 -104 C70 -98 104 -50 98 10 C92 74 40 100 -10 98 C-60 96 -92 70 -96 24Z',body)
        s+=poly([(-84,36),(-150,8),(-142,58),(-80,72)],body)+p('M-62 10 C-40 -30 30 -20 34 20 C20 60 -40 70 -62 10Z','#12211f' if body!='#12211f' else '#2d4a45')
        s+=poly([(84,-40),(140,-20),(90,0)],'#f3c83c')+c(48,-42,19,'#fff')+c(54,-42,9,'#c4452f' if body=='#12211f' else k)
        s+=p('M-18 96 V%d M20 96 V%d'%((132,132) if not hop else (118,112)),'none',st('#f3c83c',9))
        return g(s,f'translate({x} {y}) scale({face} 1)')
    o+=bird(1140,452,'#12211f')+bird(1385,346,'#f3c83c',1,True).replace('#f3c83c" stroke','#12211f" stroke')+bird(1630,452,'#12211f',-1)
    o+=p('M1320 506 q60 22 130 0 M1342 536 q42 14 86 0','none',st('#1b6b5e',8))
    return o
A['yaziyor-bildirimi']=yaz

# ---------- YENİ: PONG
def pong():
    bg='#c8371f'; ink='#1b1512'; bone='#fff1dc'
    o=r(0,0,W,H,bg)+c(1400,430,400,'#d94a2c')+r(0,730,W,170,'#a42a14')
    def oyuncu(x,y,s,kazak,desen,sac,ten):
        b=p('M-118 400 C-128 190 -104 92 0 92 C104 92 128 190 118 400Z',kazak)
        if desen=='cizgi':
            b+=''.join(p(f'M-{w} {yy} Q0 {yy+22} {w} {yy}','none',st(bone,20,'butt')) for yy,w in ((170,96),(230,112),(290,118)))
        else:
            b+=''.join(c(xx,yy,13,'#f2b632') for xx,yy in ((-50,180),(20,165),(70,220),(-20,240),(-80,270),(40,300),(-40,330)))
        b+=r(-24,60,48,50,ten)+c(0,10,78,ten)
        if sac=='topuz':
            b+=p('M-82 14 C-92 -80 -20 -104 40 -80 C70 -66 84 -40 80 -10 C40 -20 0 -40 -20 -52 C-34 -20 -58 0 -82 14Z',ink)+c(-46,-92,38,ink)
        else:
            b+=p('M-78 -18 C-70 -86 60 -96 80 -22 C40 -44 -30 -50 -78 -18Z',ink)+p('M-74 16 C-70 100 72 104 76 16 C50 44 20 36 6 34 C-20 36 -50 44 -74 16Z',ink)
        b+=c(22,2,8,ink)+c(62,2,8,ink)
        b+=p('M26 40 Q46 58 64 38','none',st(ink,7)) if sac=='topuz' else p('M30 62 Q46 74 62 62','none',st(bone,7))+c(84,20,11,'#e88a6a')
        b+=p('M70 160 Q150 210 196 120','none',st(kazak,54))+c(200,112,30,ten)
        b+=g(r(-11,-6,22,70,'#f2b632')+f'<ellipse cx="0" cy="-66" rx="62" ry="72" fill="{ink}"/><ellipse cx="0" cy="-66" rx="48" ry="58" fill="#3a2a24"/>','translate(206 96) rotate(14)')
        return g(b,f'translate({x} {y}) scale({s} 1)')
    o+=oyuncu(1030,330,1,'#1f7a78','cizgi','topuz','#f0c39a')+oyuncu(1752,330,-1,'#1d2c5e','nokta','sakal','#d99b6c')
    # top ve izi
    n=9
    for i in range(n):
        t=i/(n-1); x=1246+t*200; y=250-150*math.sin(t*math.pi*.62); o+=c(x,y,7+i*1.6,'#f6b39a' if i<n-1 else bone)
    o+=c(1470,118,42,bone)+p('M1440 100 A34 34 0 0 1 1470 84','none',st('#ffffff',8))
    # masa = telefon
    o+=poly([(936,690),(1864,690),(1900,806),(900,806)],ink)+r(900,804,1000,34,'#0e0a08')
    o+=poly([(966,702),(1834,702),(1864,794),(936,794)],'#2f8f6f')+poly([(1392,702),(1408,702),(1410,794),(1390,794)],bone)
    o+=poly([(1000,722),(1016,722),(1004,774),(986,774)],bone)+poly([(1784,722),(1800,722),(1816,774),(1798,774)],bone)
    o+=c(1400,748,0,bone)+r(960,836,40,64,ink)+r(1800,836,40,64,ink)
    return o
A['pong']=pong
# ---------- YENİ: NETWORK
def net():
    ink='#10211a'; cr='#f7eed9'
    o=r(0,0,W,H,'#1f6b48')
    gx,gy,R=1400,570,440
    o+=c(gx,gy,R,cr)
    for k,(a0,a1,f) in enumerate(((180,235,'#8fc9a0'),(235,290,'#f2b632'),(290,360,'#ea6a3a'))):
        x0,y0=gx+R*math.cos(math.radians(a0)),gy+R*math.sin(math.radians(a0)); x1,y1=gx+R*math.cos(math.radians(a1)),gy+R*math.sin(math.radians(a1)); q=R-62
        x2,y2=gx+q*math.cos(math.radians(a1)),gy+q*math.sin(math.radians(a1)); x3,y3=gx+q*math.cos(math.radians(a0)),gy+q*math.sin(math.radians(a0))
        o+=p(f'M{x0:.0f} {y0:.0f} A{R} {R} 0 0 1 {x1:.0f} {y1:.0f} L{x2:.0f} {y2:.0f} A{q} {q} 0 0 0 {x3:.0f} {y3:.0f}Z',f)
    for a in range(190,351,16):
        m=(a-190)%48==0; q0=R-84; q1=R-(140 if m else 112)
        o+=ln(gx+q0*math.cos(math.radians(a)),gy+q0*math.sin(math.radians(a)),gx+q1*math.cos(math.radians(a)),gy+q1*math.sin(math.radians(a)),ink,12 if m else 7,'butt')
    a=math.radians(312); o+=poly([(gx-20,gy-16),(gx+300*math.cos(a),gy+300*math.sin(a)),(gx+20,gy+18)],ink)
    # tepeler
    o+=p('M640 900 C860 860 1060 640 1240 560 C1360 508 1460 512 1570 566 C1720 640 1830 740 1920 780 V900Z','#14492f')
    o+=p('M640 900 C880 884 1100 720 1270 650 C1400 600 1500 622 1620 690 C1740 756 1840 820 1920 836 V900Z','#2f8a59')
    random.seed(6)
    for x,y in ((1010,832),(1180,760),(1370,700),(1500,740),(1660,800),(1290,810),(1450,840),(1780,860),(900,880)):
        o+=p(f'M{x} {y} l-9 -30 M{x} {y} l3 -38 M{x} {y} l14 -28','none',st('#14492f',7))
    # tavşan (indirme: hızla aşağı)
    rb='#b0603d'
    t=p('M-70 10 Q-150 30 -196 92','none',st(rb,44))+p('M-40 34 Q-100 80 -150 130','none',st('#8d4527',36))
    t+=p('M96 26 Q170 50 214 116','none',st(rb,34))+p('M70 40 Q130 84 168 140','none',st('#8d4527',30))
    t+=p('M-130 -6 C-120 -84 0 -84 70 -56 C130 -36 140 40 70 58 C0 74 -120 72 -130 -6Z',rb)+c(-136,-18,30,'#fff6e2')+p('M-60 44 C0 70 70 62 100 20 C70 78 -20 84 -60 44Z','#e8b48c')
    t+=p('M104 -100 Q20 -130 -54 -190 Q-30 -120 80 -68Z',rb)+p('M120 -104 Q60 -170 4 -240 Q0 -160 92 -82Z','#8d4527')+p('M100 -100 Q50 -124 0 -160 Q20 -118 84 -82Z','#e8a08a')
    t+=c(132,-62,56,rb)+c(152,-72,10,ink)+c(188,-54,9,'#e8776a')+p('M166 -36 Q178 -28 186 -38','none',st(ink,5))
    t+=g(r(-62,-52,124,96,'#c98a3c')+r(-8,-52,16,96,'#8a5a22')+r(-62,-14,124,14,'#8a5a22'),'translate(-34 -96) rotate(-8)')+g(r(-40,-32,80,60,'#ea6a3a')+r(-5,-32,10,60,'#a9401b'),'translate(-70 -172) rotate(-14)')
    o+=g(t,'translate(1620 530) rotate(27) scale(.9)')
    for dx,dy,l in ((0,0,120),(-20,46,90),(26,-46,80)): o+=ln(1404+dx,400+dy,1404+dx-l*.89,452+dy-l*.45,ink,9)
    # salyangoz (yükleme: ağır ağır yukarı)
    s=p('M-170 64 C-120 20 -40 30 60 36 C110 40 128 10 132 -50 C134 -78 180 -78 182 -46 C186 30 170 84 110 84 H-150 C-176 84 -186 74 -170 64Z','#f2c9a2')
    s+=ln(146,-66,132,-124,'#f2c9a2',12)+ln(168,-66,180,-122,'#f2c9a2',12)+c(132,-128,13,ink)+c(182,-126,13,ink)+p('M150 -20 Q164 -8 176 -22','none',st(ink,6))
    s+=c(-20,-18,92,'#ea6a3a')+p('M-20 -18 m0 0 a16 16 0 0 1 30 6 a36 36 0 0 1 -66 16 a56 56 0 0 1 52 -78 a70 70 0 0 1 66 78','none',st('#a9401b',12))
    s+=g(r(-52,-34,104,68,'#f2b632')+poly([(-52,-34),(0,14),(52,-34)],'#d9962a')+p('M-52 -34 L0 14 L52 -34','none',st(ink,5)),'translate(-26 -142) rotate(6)')
    o+=g(s,'translate(1096 652) rotate(-33) scale(.86)')
    return o
A['network-monitor']=net
# ---------- YENİ: R9T
def r9t():
    ink='#15171d'; bone='#eee6d8'
    o=r(0,0,W,H,'#262a35')+r(0,770,W,130,'#1b1e27')
    o+=c(1400,400,430,'#30354a')
    # ekran
    o+=r(1066,96,676,430,'#b9b0a0','rx="26"')+r(1058,86,676,430,bone,'rx="26"')+r(1088,114,616,362,ink,'rx="8"')
    # ekranda fan
    fx,fy=1252,294
    o+=c(fx,fy,138,'#2b2f3b')
    for k in range(7):
        o+=g(p('M0 -24 C46 -34 70 -74 56 -118 C28 -132 -8 -128 -22 -112 C6 -86 -2 -50 -14 -24Z','#e0453f'),f'translate({fx} {fy}) rotate({k*360/7+10:.1f})')
    o+=c(fx,fy,34,bone)+c(fx,fy,13,'#e0453f')
    # fan eğrisi
    for y in (180,250,320,390): o+=r(1436,y,232,4,'#2b2f3b')
    o+=p('M1436 400 L1490 384 L1546 330 L1596 236 L1668 176 V430 H1436Z','#233f52')+p('M1436 400 L1490 384 L1546 330 L1596 236 L1668 176','none',st('#4fc0d0',11))
    for x,y in ((1490,384),(1546,330),(1596,236)): o+=c(x,y,14,bone)
    o+=r(1090,516,612,34,'#8d8780')
    # klavye tablası
    o+=poly([(1040,548),(1760,548),(1880,806),(920,806)],bone)+poly([(920,806),(1880,806),(1872,838),(928,838)],'#b9b0a0')
    cols=['#e0453f','#ee7536','#f2b632','#b5c741','#58b368','#2fa8a0','#3f94d6','#5b74dc','#8b63d6','#c763b4','#ea6f93','#e0453f']
    rows,n=5,12
    for j in range(rows):
        for i in range(n):
            def pt(u,v):
                y=566+v*176; l=1066+v*-66; q=1734+v*66; return (l+(q-l)*u,y)
            u0,u1=(i+.09)/n,(i+.91)/n; v0,v1=(j+.08)/rows,(j+.88)/rows
            boyali=i<9-(1 if j<2 else 0)+(1 if j==4 else 0)
            f=cols[i] if boyali else '#7a7c86'
            a,b,c2,d=pt(u0,v0),pt(u1,v0),pt(u1,v1),pt(u0,v1)
            o+=poly([(a[0]+3,a[1]+7),(b[0]+3,b[1]+7),(c2[0]+3,c2[1]+7),(d[0]+3,d[1]+7)],'#a79e8e')+poly([a,b,c2,d],f)
    o+=poly([(1270,758),(1530,758),(1542,796),(1258,796)],'#d3cabb')
    def isci(x,y,s,tulum,kask,kol):
        return g(r(-34,60,30,16,ink)+r(4,60,30,16,ink)+ln(-16,0,-18,62,tulum,26)+ln(16,0,18,62,tulum,26)+p('M-34 -92 H34 L38 10 H-38Z',tulum)+r(-18,-92,8,40,'#f2b632')+r(10,-92,8,40,'#f2b632')+c(0,-124,34,'#f0c39a')+p('M-38 -130 A38 36 0 0 1 38 -130 L54 -122 H-38Z',kask)+c(10,-120,5,ink)+c(28,-120,5,ink)+p('M8 -106 Q18 -98 28 -106','none',st(ink,4))+kol,f'translate({x} {y}) scale({s} {abs(s)})')
    # boyacı: dev fırça
    firca=g(r(-9,-210,18,200,'#b5763a')+r(-22,-20,44,30,'#9a9ca6')+p('M-26 8 H26 L20 62 Q0 92 -20 62Z','#c763b4'),'translate(116 -18) rotate(28)')
    o+=isci(1752,640,-1.02,'#3f94d6','#f2b632',firca+ln(26,-74,86,-58,'#3f94d6',22)+ln(24,-60,112,-104,'#3f94d6',22)+c(90,-56,14,'#f0c39a')+c(114,-106,14,'#f0c39a'))
    o+=g(poly([(-42,-60),(42,-60),(34,24),(-34,24)],'#9a9ca6')+f'<ellipse cx="0" cy="-60" rx="42" ry="13" fill="#c763b4"/>'+p('M-42 -58 Q0 -130 42 -58','none',st('#6b6d78',6))+p('M-30 -54 Q-34 -20 -26 -14 Q-18 -20 -20 -50Z','#c763b4'),'translate(1840 730)')
    # üstte oturan işçi, elinde anahtar
    o+=g(r(-30,-8,0,0,ink)+ln(-14,0,10,44,'#e0453f',26)+ln(16,0,48,40,'#e0453f',26)+r(0,40,34,18,ink)+r(40,36,34,18,ink)+p('M-36 -94 H30 L34 12 H-38Z','#e0453f')+c(-2,-124,34,'#d99b6c')+p('M-40 -130 A38 36 0 0 1 36 -130 L52 -122 H-40Z',bone)+c(10,-120,5,ink)+c(27,-120,5,ink)+p('M8 -104 Q18 -96 28 -104','none',st(ink,4))+ln(20,-74,74,-110,'#e0453f',22)+c(78,-112,14,'#d99b6c')+p('M78 -112 L118 -176','none',st('#b9b0a0',15))+p('M106 -206 a24 24 0 1 0 34 20','none',st('#b9b0a0',14)),'translate(1520 84) scale(.0001)')
    o+=isci(1014,690,1.02,'#e0453f',bone,ln(24,-72,74,-42,'#e0453f',22)+ln(-24,-72,-60,-24,'#e0453f',22)+c(78,-40,14,'#f0c39a')+c(-62,-20,14,'#f0c39a')+g(r(-8,-30,16,120,'#8d8780')+c(0,-40,22,'#f2b632'),'translate(92 -40) rotate(24)'))
    return o
A['r9t-studio']=r9t
# ---------- YENİ: ROWL
def rowl():
    bg='#2b1550'; ink='#180a32'; li='#d9c8ff'; oc='#f0b441'; pk='#f08ab0'
    o=r(0,0,W,H,bg); X=1380
    # iplerle sarkan gökyüzü
    o+=c(X,352,286,oc)+c(X+18,344,262,'#f7cb6a')
    def bulut(x,y,s,f):
        return ln(x,-20,x,y-40*s,'#7d5bd0',4)+g(p('M-110 30 C-150 30 -150 -26 -100 -24 C-92 -74 -14 -82 4 -40 C40 -70 100 -40 92 -2 C130 0 130 30 100 30Z',f),f'translate({x} {y}) scale({s})')
    def yildiz(x,y,s,f=oc):
        pts=[(x+(s if k%2==0 else s*.42)*math.sin(k*math.pi/5),y-(s if k%2==0 else s*.42)*math.cos(k*math.pi/5)) for k in range(10)]
        return ln(x,-20,x,y-s+4,'#7d5bd0',4)+poly(pts,f)
    o+=bulut(1020,150,.95,'#6a3fc4')+bulut(1720,210,1.05,'#6a3fc4')+yildiz(890,250,34)+yildiz(1180,92,26,pk)+yildiz(1600,104,30)+yildiz(1846,120,26,pk)
    # arka dağlar
    o+=poly([(X-400,690),(X-300,470),(X-210,560),(X-100,420),(X+10,560),(X+120,440),(X+250,580),(X+330,480),(X+420,690)],'#4b2a8c')
    # şato
    def kule(x,y,w,h,f,cati):
        s=r(x-w/2,y-h,w,h,f)+poly([(x-w/2-14,y-h),(x,y-h-w*1.15),(x+w/2+14,y-h)],cati)+ln(x,y-h-w*1.15,x,y-h-w*1.15-40,ink,5)+poly([(x+2,y-h-w*1.15-40),(x+42,y-h-w*1.15-28),(x+2,y-h-w*1.15-16)],pk)
        return s
    o+=kule(X-104,660,70,230,li,'#6a3fc4')+kule(X+110,660,78,270,li,'#6a3fc4')+r(X-110,520,226,150,li)+kule(X+4,600,96,300,'#ece2ff','#8a5fe0')
    for k in range(6): o+=r(X-108+k*40,500,24,24,li)
    for xx,yy in ((X-104,486),(X+110,452),(X+4,370),(X+4,440)): o+=p(arch(xx-13,yy-26,26,50),oc)
    o+=p(arch(X-34,580,76,100),ink)+p(arch(X-22,592,52,88),'#6a3fc4')
    # sağda orman
    for x,y,h,f in ((X+230,700,190,'#2a7a6a'),(X+300,706,250,'#1f5f58'),(X+372,700,200,'#2a7a6a'),(X+260,712,130,'#3f9a82'),(X+336,716,140,'#3f9a82')):
        o+=r(x-8,y-30,16,40,'#5a2f1c')+poly([(x-62,y-30),(x,y-h*.62),(x+62,y-30)],f)+poly([(x-48,y-h*.42),(x,y-h*.86),(x+48,y-h*.42)],f)+poly([(x-34,y-h*.68),(x,y-h),(x+34,y-h*.68)],f)
    # solda deniz ve gemi
    def dalga(y,f,x0,x1,ph):
        d=f'M{x0} 720 L{x0} {y}'; x=x0
        while x<x1: d+=f' q22 {-26+ph} 44 0'; x+=44
        return p(d+f' V720Z',f)
    o+=dalga(590,'#2b6f9e',X-404,X-170,0)
    o+=g(p('M-92 0 H92 L64 52 H-62Z','#b5452a')+r(-84,10,160,9,'#f7cb6a')+ln(0,0,0,-170,ink,9)+p('M8 -164 Q96 -100 78 -22 H8Z','#fff6ea')+p('M-8 -140 Q-74 -90 -66 -22 H-8Z',li)+poly([(2,-170),(48,-156),(2,-142)],pk),f'translate({X-300} 570) rotate(-5) scale(.98)')
    o+=dalga(622,'#3f94c0',X-410,X-160,2)+dalga(660,'#6bb8d6',X-416,X-156,0)
    # kitap
    o+=poly([(X,884),(X-500,822),(X-486,852),(X,914)],oc)+poly([(X,884),(X+500,822),(X+486,852),(X,914)],'#c98a24')
    o+=poly([(X,700),(X-420,664),(X-492,812),(X,872)],'#f6efff')+poly([(X,700),(X+420,664),(X+492,812),(X,872)],'#e6d9ff')
    o+=poly([(X,872),(X-492,812),(X-490,830),(X,890)],'#b79df0')+poly([(X,872),(X+492,812),(X+490,830),(X,890)],'#9a7be0')
    # çatallanan yol
    o+=p(f'M{X-40} 868 C{X-40} 800 {X-30} 780 {X-30} 700 H{X+42} C{X+36} 780 {X+40} 800 {X+40} 868Z',oc)
    o+=p(f'M{X-34} 830 C{X-120} 800 {X-230} 760 {X-290} 690 L{X-236} 692 C{X-190} 740 {X-110} 776 {X-30} 780Z',oc)
    o+=p(f'M{X+38} 830 C{X+130} 806 {X+220} 766 {X+282} 694 L{X+226} 692 C{X+180} 738 {X+110} 772 {X+34} 780Z',oc)
    # kahraman
    o+=g(ln(-12,0,-14,42,ink,15)+ln(12,0,14,42,ink,15)+p('M-34 8 C-30 -40 -20 -70 0 -72 C20 -70 30 -40 34 8Z','#d83a4a')+p('M-28 -60 C-66 -40 -70 10 -86 34 C-50 40 -20 20 -10 -20Z','#a8243a')+c(0,-94,26,'#f3cba4')+p('M-28 -92 C-28 -130 28 -130 28 -92 C10 -108 -8 -108 -28 -92Z','#5a2f1c')+p('M-28 -94 Q-34 -70 -22 -66 L-18 -90Z','#5a2f1c')+ln(24,-50,60,-74,'#d83a4a',13)+ln(60,-96,60,-50,'#5a2f1c',5)+c(60,-44,15,oc)+c(60,-44,8,'#fff6d8'),f'translate({X} 800) scale(1.08)')
    return o
A['rowl-engine']=rowl
# ---------- ROWL: hikâye ağacı (sayfa içi)
def rowlag():
    ink='#180a32'; li='#d9c8ff'; oc='#f0b441'; pk='#f08ab0'
    o=r(0,0,W,H,'#3a1f70')
    def ip(x1,y1,x2,y2,f=oc): return p(f'M{x1} {y1} C{(x1+x2)/2} {y1} {(x1+x2)/2} {y2} {x2} {y2}','none',st('#24104a',20)+' transform="translate(4 8)"')+p(f'M{x1} {y1} C{(x1+x2)/2} {y1} {(x1+x2)/2} {y2} {x2} {y2}','none',st(f,16))
    A1=(330,450); B=[(800,240),(800,670)]; C=[(1270,156),(1270,450),(1270,744)]; D=[(1700,156),(1700,450),(1700,744)]
    for b in B: o+=ip(A1[0]+150,A1[1],b[0]-140,b[1])
    o+=ip(B[0][0]+130,B[0][1],C[0][0]-130,C[0][1])+ip(B[0][0]+130,B[0][1],C[1][0]-130,C[1][1])+ip(B[1][0]+130,B[1][1],C[1][0]-130,C[1][1],pk)+ip(B[1][0]+130,B[1][1],C[2][0]-130,C[2][1],pk)
    for k,(q,d) in enumerate(zip(C,D)): o+=ip(q[0]+120,q[1],d[0]-80,d[1],(oc,li,pk)[k])
    def kart(x,y,w,h,f,ic,a=0): return g(r(-w/2+8,-h/2+12,w,h,'#24104a')+r(-w/2,-h/2,w,h,'#f6efff')+f'<svg x="{-w/2+14}" y="{-h/2+14}" width="{w-28}" height="{h-28}" viewBox="{-(w-28)/2} {-(h-28)/2} {w-28} {h-28}">'+r(-w,-h,2*w,2*h,f)+ic+'</svg>',f'translate({x} {y}) rotate({a})')
    kapi=p(arch(-52,-70,104,180),ink)+p(arch(-40,-56,80,166),'#8a3f2a')+c(22,30,8,oc)+p('M-160 110 H160 V160 H-160Z','#24104a')
    gemi=p('M-140 50 q22 -24 44 0 q22 -24 44 0 q22 -24 44 0 q22 -24 44 0 q22 -24 44 0 q22 -24 44 0 V140 H-140Z','#6bb8d6')+g(p('M-70 0 H70 L48 40 H-48Z','#b5452a')+ln(0,0,0,-110,ink,7)+p('M6 -106 Q66 -66 54 -14 H6Z','#fff6ea')+p('M-6 -90 Q-50 -60 -46 -14 H-6Z',li),'translate(0 22)')
    orman=''.join(poly([(x-44,70),(x,70-h),(x+44,70)],f)+r(x-6,68,12,20,'#5a2f1c') for x,h,f in ((-74,120,'#2a7a6a'),(66,140,'#2a7a6a'),(-6,170,'#3f9a82')))+r(-160,84,320,80,'#1f5f58')
    sato=r(-60,-10,120,110,li)+r(-78,-50,40,150,'#ece2ff')+r(38,-50,40,150,'#ece2ff')+poly([(-86,-50),(-58,-96),(-30,-50)],'#8a5fe0')+poly([(30,-50),(58,-96),(86,-50)],'#8a5fe0')+p(arch(-18,40,36,60),ink)
    anahtar=c(-46,-6,34,'none',st(oc,20))+ln(-14,-6,84,-6,oc,20)+ln(60,-6,60,30,oc,18)+ln(82,-6,82,24,oc,18)
    cadir=poly([(-96,74),(0,-76),(96,74)],'#d83a4a')+poly([(-30,74),(0,-20),(30,74)],ink)+poly([(-96,74),(0,-76),(-30,74)],'#a8243a')+r(-160,72,320,80,'#24104a')
    o+=kart(*A1,320,300,'#f7cb6a',kapi,-3)+kart(*B[0],290,250,'#bfe2f0',gemi,2)+kart(*B[1],290,250,'#f7cb6a',orman,-2)
    o+=kart(*C[0],250,210,'#8a5fe0' and '#f3b7cc',sato,-2)+kart(*C[1],250,210,'#4b2a8c',anahtar,2)+kart(*C[2],250,210,'#f7cb6a',cadir,-2)
    # sonlar
    def mad(x,y,f,ic): return c(x+6,y+10,98,'#24104a')+c(x,y,98,'#f6efff')+c(x,y,82,f)+g(ic,f'translate({x} {y})')
    gunes=c(0,0,34,oc)+''.join(ln(48*math.cos(math.radians(a)),48*math.sin(math.radians(a)),66*math.cos(math.radians(a)),66*math.sin(math.radians(a)),oc,9) for a in range(0,360,45))
    ay=p('M20 -54 A56 56 0 1 0 50 34 A46 46 0 1 1 20 -54Z','#f7cb6a')
    kalp=p('M0 56 C-70 10 -62 -46 -28 -46 C-10 -46 0 -32 0 -22 C0 -32 10 -46 28 -46 C62 -46 70 10 0 56Z','#d83a4a')
    o+=mad(*D[0],'#2b6f9e',gunes)+mad(*D[1],ink,ay)+mad(*D[2],'#f3b7cc',kalp)
    return o
A['rowl-agac']=rowlag

DEF='''<filter id="kes" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G"/></filter>
<filter id="gr" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1.1 -0.42"/></filter>'''
names=sys.argv[1:] or list(A)
os.makedirs(CIKTI,exist_ok=True)
for n in names:
    svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}"><defs>{DEF}</defs><g filter="url(#kes)"><g transform="translate(-12 -6) scale(1.0125 1.0135)">{A[n]()}</g></g><rect width="{W}" height="{H}" filter="url(#gr)" opacity=".13"/></svg>'
    open(f'{S}/{n}.html','w').write(f'<meta charset=utf-8><style>body{{margin:0;background:#000}}svg{{display:block}}</style>{svg}')
    subprocess.run(['google-chrome-stable','--headless=new','--disable-gpu','--hide-scrollbars','--allow-file-access-from-files',f'--user-data-dir={S}/chrome',f'--window-size={W},{H}',f'--screenshot={S}/{n}.png',f'file://{S}/{n}.html'],capture_output=True,timeout=60)
    subprocess.run(['magick',f'{S}/{n}.png','-quality','88','-sampling-factor','4:4:4',f'{CIKTI}/{n}.jpg'],check=True)
