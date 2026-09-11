from pathlib import Path
import json, math, html, re
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import mm
from reportlab.lib.utils import simpleSplit
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle
from reportlab.graphics.barcode.qr import QrCodeWidget
from pypdf import PdfReader

ROOT = Path('C:/Projects/zautomatyzujemy')
WORK = ROOT / 'tmp/sales-kit'
OUT = ROOT / 'output/sprzedaz-zautomatyzujemy'
SRC = OUT / 'zrodla-edytowalne'
SRC.mkdir(exist_ok=True)
for name, file in [('Sans','arial.ttf'),('Bold','arialbd.ttf'),('Italic','ariali.ttf'),('Serif','georgiai.ttf')]:
    pdfmetrics.registerFont(TTFont(name, 'C:/Windows/Fonts/'+file))
pdfmetrics.registerFontFamily('Sans',normal='Sans',bold='Bold',italic='Italic',boldItalic='Bold')
INK='#151719'; PAPER='#f5f2ed'; ORANGE='#c93820'; MUTED='#62625d'; LINE='#d9d6d0'
URL='https://zautomatyzujemy.pl'
CONTACT='n.chojnacki1993@gmail.com'
PHONE='+48 730 094 465'
checks=[]

def clean(text):
    return text.replace('—','-').replace('–','-').replace('\u2011','-')

def color(hexcode, cmyk=False):
    c=colors.HexColor(hexcode)
    if not cmyk:
        return c
    k=1-max(c.red,c.green,c.blue)
    if k>.9999:
        return colors.CMYKColor(0,0,0,1)
    return colors.CMYKColor((1-c.red-k)/(1-k),(1-c.green-k)/(1-k),(1-c.blue-k)/(1-k),k)

class Surface:
    def __init__(self, pdf, width, height, offset=0, cmyk=False):
        self.pdf=pdf; self.w=width; self.h=height; self.off=offset; self.cmyk=cmyk
        self.svg=[]
    def rect(self,x,y,w,h,fill=INK):
        self.pdf.setFillColor(color(fill,self.cmyk))
        self.pdf.rect(x+self.off,self.h+self.off-y-h,w,h,fill=1,stroke=0)
        self.svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{fill}"/>')
    def line(self,x,y,x2,y2,fill=LINE,width=.7):
        self.pdf.setStrokeColor(color(fill,self.cmyk)); self.pdf.setLineWidth(width)
        self.pdf.line(x+self.off,self.h+self.off-y,x2+self.off,self.h+self.off-y2)
        self.svg.append(f'<line x1="{x}" y1="{y}" x2="{x2}" y2="{y2}" stroke="{fill}" stroke-width="{width}"/>')
    def text(self,txt,x,y,size=11,font='Sans',fill=INK):
        txt=clean(txt)
        self.pdf.setFont(font,size); self.pdf.setFillColor(color(fill,self.cmyk))
        self.pdf.drawString(x+self.off,self.h+self.off-y-size*.82,txt)
        family='Georgia' if font=='Serif' else 'Arial'
        weight='700' if font=='Bold' else '400'
        italic='italic' if font in ['Serif','Italic'] else 'normal'
        self.svg.append(f'<text x="{x}" y="{y+size*.82}" font-family="{family}" font-size="{size}" font-weight="{weight}" font-style="{italic}" fill="{fill}">{html.escape(txt)}</text>')
        tw=pdfmetrics.stringWidth(txt,font,size)
        if x < -0.1 or x+tw>self.w+.1 or y+size>self.h+.1:
            raise ValueError(f'Text overflow {txt}: {x+tw}/{self.w}')
    def para(self,txt,x,y,width,size=11,leading=None,font='Sans',fill=INK):
        leading=leading or size*1.4
        for line in simpleSplit(clean(txt),font,size,width):
            self.text(line,x,y,size,font,fill); y+=leading
        return y
    def polygon(self,points,fill):
        p=self.pdf.beginPath()
        for i,(x,y) in enumerate(points):
            (p.moveTo if i==0 else p.lineTo)(x+self.off,self.h+self.off-y)
        p.close();self.pdf.setFillColor(color(fill,self.cmyk)); self.pdf.drawPath(p,fill=1,stroke=0)
        self.svg.append('<polygon points="'+' '.join(f'{x},{y}' for x,y in points)+f'" fill="{fill}"/>')
    def logo(self,x,y,scale=.55,inverse=False,labelsize=12):
        for pts in [[(8,0),(24,0),(24,23),(17,23),(17,7),(8,7)],[(0,13),(7,13),(7,29),(16,29),(16,36),(0,36)]]:
            self.polygon([(x+a*scale,y+b*scale) for a,b in pts],ORANGE)
        self.text('zautomatyzujemy.pl',x+24*scale+9,y+36*scale/2-labelsize*.42,labelsize,'Bold',PAPER if inverse else INK)
    def qr(self,url,x,y,size):
        widget=QrCodeWidget(url,barLevel='M');widget.qr.make()
        modules=widget.qr.modules;count=len(modules);unit=size/(count+8)
        self.rect(x,y,size,size,'#ffffff')
        for row in range(count):
            for col in range(count):
                if modules[row][col]:
                    self.rect(x+(col+4)*unit,y+(row+4)*unit,unit+.015,unit+.015,'#000000')
        self.pdf.linkURL(url,(x+self.off,self.h+self.off-y-size,x+self.off+size,self.h+self.off-y),relative=0)
        checks.append({'qr':url,'modules':count,'size_mm':round(size/mm,2)})
    def save_svg(self,name):
        (SRC/name).write_text(f'<svg xmlns="http://www.w3.org/2000/svg" width="{self.w/mm}mm" height="{self.h/mm}mm" viewBox="0 0 {self.w} {self.h}">'+''.join(self.svg)+'</svg>',encoding='utf-8')

def new_pdf(name,w,h,printmode=False):
    off=6*mm if printmode else 0
    pdf=canvas.Canvas(str(OUT/name),pagesize=(w+2*off,h+2*off))
    pdf.setTitle(name.removesuffix('.pdf').replace('-',' '));pdf.setAuthor('Norbert Chojnacki | Zautomatyzujemy.pl')
    if printmode:
        pdf.setTrimBox((off,off,off+w,off+h))
        pdf.setBleedBox((off-3*mm,off-3*mm,off+w+3*mm,off+h+3*mm))
    return pdf,off

def crop_marks(pdf,w,h,off):
    pdf.setStrokeColor(colors.CMYKColor(0,0,0,1));pdf.setLineWidth(.25)
    for x in [off,off+w]:
        pdf.line(x,0,x,off-3.7*mm);pdf.line(x,off+h+3.7*mm,x,h+2*off)
    for y in [off,off+h]:
        pdf.line(0,y,off-3.7*mm,y);pdf.line(off+w+3.7*mm,y,w+2*off,y)

FLYERS=[
 {'key':'automatyzacje','label':'AUTOMATYZACJE DLA FIRM','title':['Mniej ręcznej','pracy.','Więcej czasu.'],
  'intro':'Łączę narzędzia, których już używasz, i porządkuję powtarzalne zadania w Twojej firmie.',
  'flow':['Zapytanie od klienta','Dane trafiają do właściwej osoby','Sprawa ma swój następny krok'],
  'backtitle':['Pokaż mi zadanie,','które ciągle wraca.'],
  'blocks':[
    ['Kopiujesz te same dane?', 'Sprawdzimy, jak połączyć pocztę, formularz, arkusz lub CRM. Zaczniemy od jednego przepływu.'],
    ['Gubią się zgłoszenia?', 'Ustalimy, gdzie ma trafić sprawa, kto za nią odpowiada i kiedy potrzebna jest decyzja człowieka.'],
    ['Nie wiesz, od czego zacząć?', 'Możemy zacząć od audytu procesu lub praktycznego szkolenia z AI na zadaniach Twojego zespołu.']],
  'note':'Zakres, integracje, cena i koszty utrzymania ustalane po rozmowie.'},
 {'key':'asystenci-ai','label':'CHATBOTY I ASYSTENCI AI','title':['Klient pyta.','Asystent pomaga.','Ty decydujesz.'],
  'intro':'Asystent korzystający z wiedzy Twojej firmy: odpowiedzi na ustalone pytania i przekazanie sprawy do człowieka.',
  'flow':['Pytanie o Twoją ofertę','Odpowiedź z przygotowanych treści','Kontakt do dalszej rozmowy'],
  'backtitle':['Najpierw zakres.','Potem rozmowa.'],
  'blocks':[
    ['Na stronie internetowej', 'Chatbot może wyjaśniać ofertę i zbierać zgłoszenia. Ustalamy źródła wiedzy i testujemy typowe pytania.'],
    ['Rozmowa głosowa', 'Wypróbuj Klarę w przeglądarce. Obsługa numeru telefonu i integracje wymagają osobnego ustalenia zakresu.'],
    ['Z kontrolą człowieka', 'Wybieramy sprawy do przekazania pracownikowi. AI może się pomylić, dlatego zakres i testy są częścią projektu.']],
  'note':'Demo przedstawia możliwości. Wdrożenie dopasowujemy do Twojej firmy.'},
 {'key':'strony-aplikacje','label':'STRONY I APLIKACJE DLA BIZNESU','title':['Jasna oferta.','Prosty kontakt.','Sprawna obsługa.'],
  'intro':'Tworzę strony i narzędzia, które pomagają klientom wykonać następny krok, a Tobie obsłużyć ich sprawę.',
  'flow':['Klient poznaje Twoją ofertę','Wysyła czytelne zapytanie','Zespół otrzymuje potrzebne dane'],
  'backtitle':['Od wejścia na stronę','do konkretnej sprawy.'],
  'blocks':[
    ['Strona firmowa', 'Oferta czytelna na telefonie, wygodny kontakt i formularz dopasowany do informacji, których potrzebujesz.'],
    ['Narzędzie do pracy', 'Panel, rezerwacje lub obsługa zleceń. Najpierw opisujemy jedną ścieżkę i sprawdzamy potrzebne integracje.'],
    ['Bezpośrednia współpraca', 'Rozmawiasz ze mną od pierwszego spotkania po przekazanie rozwiązania. Zakres i sposób odbioru ustalamy wcześniej.']],
  'note':'Treści, funkcje, harmonogram i utrzymanie określamy przed realizacją.'}
]

def flyer_front(s,info):
    w,h=s.w,s.h
    s.rect(-3*mm,-3*mm,w+6*mm,h+6*mm,PAPER)
    s.logo(28,25,.56,labelsize=12)
    s.text(info['label'],28,76,8.3,'Bold',ORANGE)
    for i,line in enumerate(info['title']):
        s.text(line,27,104+i*34,28 if info['key']!='asystenci-ai' else 26,'Bold' if i<2 else 'Serif',INK if i<2 else ORANGE)
    s.para(info['intro'],28,222,w-56,10.8,15)
    for i,label in enumerate(info['flow']):
        y=293+i*46
        s.rect(28,y,w-56,36,'#ffffff')
        s.text(f'0{i+1}',39,y+12,9,'Bold',ORANGE)
        s.text(label,70,y+12,10,'Sans')
        if i<2:s.line(48,y+37,48,y+45,ORANGE,1)
    s.text('Przykładowy przebieg do dopasowania.',28,435,8,'Sans',MUTED)
    s.line(28,460,w-28,460)
    s.text('Porozmawiajmy o Twojej firmie.',28,479,12,'Bold')
    s.text('Bezpłatna konsultacja',28,501,10,'Sans')
    s.text(PHONE,28,526,11,'Bold',ORANGE)
    s.text('zautomatyzujemy.pl',28,548,10,'Sans')
    s.qr(URL+'/#kontakt',w-100,482,71)

def flyer_back(s,info):
    w,h=s.w,s.h
    s.rect(-3*mm,-3*mm,w+6*mm,h+6*mm,PAPER)
    s.logo(28,25,.56,labelsize=12)
    for i,t in enumerate(info['backtitle']):s.text(t,28,88+i*28,22,'Bold')
    y=177
    for i,(head,txt) in enumerate(info['blocks']):
        s.text(f'0{i+1}',28,y+2,9,'Bold',ORANGE)
        s.text(head,59,y,12,'Bold')
        s.para(txt,59,y+23,w-87,10.2,14)
        y+=94
    s.rect(0,469,w,h-469+3*mm,INK)
    s.text('Norbert Chojnacki',28,488,14,'Bold',PAPER)
    s.text(PHONE+'  |  zautomatyzujemy.pl',28,514,10,'Sans',PAPER)
    s.text(CONTACT,28,535,9.2,'Sans',PAPER)
    s.para(info['note'],28,562,w-56,7.6,10,'Sans','#dedbd5')

def make_flyers(printmode):
    w,h=148*mm,210*mm
    name='02-ulotki-A5'+('-druk' if printmode else '')+'.pdf'
    pdf,off=new_pdf(name,w,h,printmode)
    for info in FLYERS:
        for side,draw in [('przod',flyer_front),('tyl',flyer_back)]:
            s=Surface(pdf,w,h,off,printmode);draw(s,info)
            if printmode:crop_marks(pdf,w,h,off)
            else:s.save_svg('ulotka-'+info['key']+'-'+side+'.svg')
            pdf.showPage()
    pdf.save()

def make_business_card(printmode):
    w,h=85*mm,55*mm
    name='03-wizytowka-85x55'+('-druk' if printmode else '')+'.pdf'
    pdf,off=new_pdf(name,w,h,printmode)
    s=Surface(pdf,w,h,off,printmode)
    s.rect(-3*mm,-3*mm,w+6*mm,h+6*mm,INK)
    s.logo(15,16,.46,True,10.3)
    s.text('Norbert',15,57,20,'Bold',PAPER)
    s.text('Chojnacki',15,79,20,'Bold',PAPER)
    s.text('AI i automatyzacje dla firm',15,116,9,'Sans',PAPER)
    s.rect(15,139,40,2,ORANGE)
    if printmode:crop_marks(pdf,w,h,off)
    else:s.save_svg('wizytowka-przod.svg')
    pdf.showPage()
    s=Surface(pdf,w,h,off,printmode)
    s.rect(-3*mm,-3*mm,w+6*mm,h+6*mm,PAPER)
    s.text('Porozmawiajmy',15,17,14,'Bold')
    s.text('o Twojej firmie.',15,34,14,'Serif',ORANGE)
    s.text(PHONE,15,64,11,'Bold')
    s.text(CONTACT,15,84,8,'Sans')
    s.text('zautomatyzujemy.pl',15,104,9,'Bold')
    s.text('Kontakt i demo',15,131,7.5,'Sans',MUTED)
    s.qr(URL,171,98,55)
    if printmode:crop_marks(pdf,w,h,off)
    else:s.save_svg('wizytowka-tyl.svg')
    pdf.showPage();pdf.save()

def paragraph(pdf,text,x,top,width,size=10.3,leading=14.4,bold=False):
    style=ParagraphStyle('body',fontName='Bold' if bold else 'Sans',fontSize=size,leading=leading,textColor=colors.HexColor(INK),spaceAfter=0)
    p=Paragraph(html.escape(clean(text)),style)
    _,height=p.wrap(width,1000)
    p.drawOn(pdf,x,top-height)
    return top-height

def footer(pdf,page,label='PODRĘCZNIK SPRZEDAŻY'):
    pdf.setStrokeColor(colors.HexColor(LINE));pdf.setLineWidth(.5);pdf.line(43,40,552,40)
    pdf.setFillColor(colors.HexColor(MUTED));pdf.setFont('Sans',8)
    pdf.drawString(43,25,'zautomatyzujemy.pl  /  '+label)
    pdf.drawRightString(552,25,f'{page:02d}')

def make_handbook():
    core=json.loads((WORK/'core.json').read_text(encoding='utf-8-sig'))
    objection=json.loads((WORK/'obiekcje.json').read_text(encoding='utf-8-sig'))
    rollout=json.loads((WORK/'wdrozenia.json').read_text(encoding='utf-8-sig'))
    chapters=core[:7]+rollout[:2]+core[7:]+objection[:7]+[objection[7]]+rollout[2:]
    chapters.append({'title':'Źródła i granice obietnic','intro':'Materiały powstały dla obecnej oferty Zautomatyzujemy.pl. Ich celem jest ułatwienie diagnozy, demonstracji i uzgodnienia zakresu. Zawarte scenariusze nie potwierdzają wyników wdrożeń u klientów.','blocks':[
        {'heading':'Oferta i tożsamość marki','text':'Zweryfikowano w projekcie: sekcję usług, sekcję kontaktu, opis Norberta Chojnackiego, komponent logo oraz integrację głosową. Dane kontaktowe: +48 730 094 465, n.chojnacki1993@gmail.com, https://zautomatyzujemy.pl. Stan materiałów: 9 września 2026.'},
        {'heading':'Kontakt handlowy','text':'UKE publikuje ustawę z 12 lipca 2024 r. Prawo komunikacji elektronicznej. Podstawą wskazówek o kontakcie marketingowym jest art. 398. Przy planowaniu kampanii sprawdź aktualne przepisy i konkretny sposób kontaktu; ten pakiet nie zastępuje indywidualnej oceny prawnej.'},
        {'heading':'Dane osobowe i AI','text':'Materiały UODO podkreślają znaczenie przejrzystości oraz oceny przetwarzania danych przy AI. Odpowiedzi w FAQ celowo uzależniają lokalizację danych, retencję, dostępy i dokumenty od wybranego zastosowania. Brak w tym zestawie gotowej opinii prawnej, certyfikatu RODO lub AI Act.'},
        {'heading':'Źródła internetowe','text':'UKE - Prawo komunikacji elektronicznej, art. 398 (odnośnik poniżej). UODO - materiały o przejrzystości i AI (odnośnik poniżej). Dane kosztowe i przykłady kalkulacji w narzędziach są hipotetyczne; nie zaczerpnięto ich z wyników klientów.'},
        {'heading':'Przed wysłaniem oferty','text':'Potwierdź sposób rozliczenia i pełną kwotę do zapłaty. Sprawdź ceny dostawców, licencje, wykonalność integracji, własną dostępność oraz wymagania dotyczące danych. Usuń pola formularzowe i nieaktualne przykłady. Warunki wsparcia oraz przeniesienia praw określaj w umowie, nie w ogólnym haśle sprzedażowym.'}
    ]})
    pdf,_=new_pdf('01-podrecznik-sprzedazy.pdf',210*mm,297*mm)
    s=Surface(pdf,210*mm,297*mm)
    s.rect(0,0,s.w,s.h,PAPER);s.logo(44,43,.7,labelsize=16)
    s.text('ZESTAW DO CODZIENNEJ PRACY',44,151,10,'Bold',ORANGE)
    s.text('Sprzedawaj',40,201,49,'Bold')
    s.text('konkretne',40,260,49,'Bold')
    s.text('rozwiązania.',40,319,49,'Serif',ORANGE)
    s.para('Rozmowy, oferty, obiekcje i wdrożenia dla Zautomatyzujemy.pl',44,410,440,18,25)
    s.line(44,503,550,503)
    for i,(a,b) in enumerate([('01','Rozpoznaj problem i policz jego koszt.'),('02','Pokaż właściwe demo i uzgodnij zakres.'),('03','Dostarcz rezultat i poproś o polecenie.')]):
        s.text(a,44,531+i*43,10,'Bold',ORANGE);s.text(b,81,528+i*43,13,'Sans')
    s.text('Norbert Chojnacki',44,723,13,'Bold')
    s.text('Materiały wewnętrzne  /  9 września 2026',44,747,10,'Sans',MUTED)
    footer(pdf,1);pdf.showPage()
    pdf.setFont('Bold',28);pdf.drawString(43,766,'Spis treści')
    paragraph(pdf,'Wybierz potrzebną stronę. W PDF tytuły są klikalne. Na spotkanie zabierz osobną dwustronicową ściągę.',43,739,500,11,16)
    for i,ch in enumerate(chapters):
        y=674-i*21
        title=clean(ch['title'])
        title=re.sub(r'Obiekcje (\d)/4 - ',r'Obiekcje \1 - ',title)
        if pdfmetrics.stringWidth(title,'Sans',9)>458:
            size=8.5
        else:size=9
        pdf.setFont('Sans',size);pdf.setFillColor(colors.HexColor(INK));pdf.drawString(43,y,title)
        pdf.setFont('Bold',9);pdf.drawRightString(550,y,str(i+3))
        pdf.linkAbsolute(title,f'ch{i}',(43,y-3,551,y+12))
    footer(pdf,2);pdf.showPage()
    for i,ch in enumerate(chapters):
        pdf.bookmarkPage(f'ch{i}');pdf.addOutlineEntry(clean(ch['title']),f'ch{i}',0)
        pdf.setFont('Bold',8);pdf.setFillColor(colors.HexColor(ORANGE));pdf.drawString(43,794,f'PRAKTYKA SPRZEDAŻY  /  {i+1:02d}')
        top=770
        top=paragraph(pdf,ch['title'],43,top,509,24,29,True)-17
        top=paragraph(pdf,ch['intro'],43,top,509,10.5,15)-17
        for block in ch['blocks']:
            top=paragraph(pdf,block['heading'],43,top,509,11,15,True)-5
            top=paragraph(pdf,block['text'],43,top,509,10.1,14.4)-13
        if i==len(chapters)-1:
            for label,url in [('Otwórz ustawę PKE opublikowaną przez UKE','https://cik.uke.gov.pl/gfx/cik/userfiles/_public/ustawa_prawo_komunikacji_elektronicznej_z_12_lipca_2024_r.pdf'),('Otwórz materiały UODO o AI i przejrzystości','https://uodo.gov.pl/pl/589/3202')]:
                pdf.setFont('Sans',9);pdf.setFillColor(colors.HexColor(ORANGE));pdf.drawString(43,top,label)
                pdf.linkURL(url,(43,top-2,450,top+11));top-=20
        if top<52:raise ValueError(f'Handbook page overflow {i+3}: {top}, {ch["title"]}')
        checks.append({'chapter':ch['title'],'page':i+3,'bottom':round(top,1)})
        footer(pdf,i+3);pdf.showPage()
    pdf.save()
    markdown=['# Podręcznik sprzedaży Zautomatyzujemy.pl','Materiały wewnętrzne | Norbert Chojnacki | 9 września 2026']
    for ch in chapters:
        markdown += ['\n## '+ch['title'],ch['intro']]
        for block in ch['blocks']:markdown += ['\n### '+block['heading'],block['text']]
    (OUT/'01-podrecznik-edytowalny.md').write_text('\n\n'.join(markdown),encoding='utf-8')
    (SRC/'tresci-podrecznika.json').write_text(json.dumps(chapters,ensure_ascii=False,indent=2),encoding='utf-8')
    return chapters

def make_quick_reference():
    pdf,_=new_pdf('04-sciaga-na-spotkanie-A4.pdf',210*mm,297*mm)
    pages=[
      ('Rozmowa w 30 minut',[
       ('OTWARCIE','„Przejdźmy przez jeden proces. Na końcu ustalimy, czy warto go usprawnić i jaki byłby pierwszy krok”.'),
       ('01  PROBLEM','Co ostatnio się wydarzyło? Pokaż jedną sprawę od początku do końca. Co jest przepisywane albo powtarzane?'),
       ('02  LICZBY','Ile spraw miesięcznie? Ile minut na sprawę? Jak często występuje błąd? Czy liczby są zmierzone, czy szacowane?'),
       ('03  DECYZJA','Kto używa procesu? Kto zatwierdzi zakup? Co musi się wydarzyć, żeby podjąć decyzję?'),
       ('04  DOPASOWANIE','Jeden problem -> jedno demo -> jeden pierwszy zakres. Nazwij ograniczenia. Zapytaj: „Co w tym przebiegu trzeba zmienić?”.'),
       ('05  NASTĘPNY KROK','„Co musimy jeszcze sprawdzić?”. Zapisz rezultat, właściciela i datę. Bez ustaleń nie obiecuj ceny ani terminu.'),
       ('ZANIM WYJDZIESZ','Znam problem, wolumen, decydenta, narzędzia, miarę sukcesu i kolejny krok. Jeśli nie - wiem, czego brakuje.')]),
      ('Obiekcja to informacja',[
       ('ZA DROGO','„W porównaniu z budżetem, inną ofertą czy kosztem obecnej pracy?”. Zmniejsz zakres, jeśli nadal daje wartość.'),
       ('MUSZĘ SIĘ ZASTANOWIĆ','„Jakiej informacji brakuje do decyzji: o koszcie, zakresie, ryzyku czy sposobie działania?”. Nie twórz presji.'),
       ('MAMY JUŻ CRM','„Co mimo tego nadal robicie ręcznie?”. Najpierw sprawdź funkcję obecnego narzędzia.'),
       ('NIE MAM CZASU','„Czy brakuje czasu na decyzję, czy na udział we wdrożeniu?”. Ustal minimalny wkład klienta.'),
       ('NIE MA REFERENCJI','„Pokażę działające demo i jasno opiszę ograniczenia. Możemy zacząć od małego etapu z kryteriami odbioru”.'),
       ('BOJĘ SIĘ BŁĘDÓW AI','„AI może się pomylić. Ustalimy zakres pytań, testy i przekazanie sprawy człowiekowi”.'),
       ('UCZCIWE ZAMKNIĘCIE','„Czy zakres rozwiązuje właściwy problem? Co jest potrzebne do decyzji?”. Akceptuj odmowę. Zero fikcyjnych wyników i sztucznej pilności.')])]
    for pno,(title,blocks) in enumerate(pages,1):
        s=Surface(pdf,210*mm,297*mm);s.rect(0,0,s.w,s.h,PAPER);s.logo(43,32,.6,labelsize=13)
        s.text(title,43,95,27,'Bold')
        y=156
        for head,body in blocks:
            s.text(head,43,y,9,'Bold',ORANGE)
            y=s.para(body,43,y+19,505,11,15.4)+25
        footer(pdf,pno,'ŚCIĄGA WEWNĘTRZNA');pdf.showPage()
    pdf.save()

def make_forms():
    pdf,_=new_pdf('06-karty-rozmowy-i-odbioru-A4.pdf',210*mm,297*mm)
    for pno,title,fields in [
      (1,'Karta rozmowy z klientem',[
       ('Firma i osoba kontaktowa','Data / źródło relacji / uzgodniony kanał kontaktu'),
       ('Problem własnymi słowami klienta','Ostatni przykład i obecny przebieg'),
       ('Skala i koszt pracy','Sprawy / miesiąc, minuty / sprawę, częste błędy, źródło liczb'),
       ('Narzędzia i ograniczenia','Źródło, cel, dostępy, dane, czynności pozostające u człowieka'),
       ('Decydent i termin','Kto zatwierdza, kto korzysta, co uruchamia decyzję'),
       ('Kryterium sukcesu i pierwszy zakres','Co mierzymy, jak, na jakiej próbce; co wyłączamy'),
       ('Następny krok','Kto / co / do kiedy; oferta, diagnoza lub rezygnacja')]),
      (2,'Karta odbioru wdrożenia',[
       ('Projekt i zakres odbioru','Klient / data / wersja / środowisko / osoba odbierająca'),
       ('Scenariusz poprawny','Przypadek / oczekiwany wynik / uzyskany wynik / dowód'),
       ('Błąd i przypadek nietypowy','Brak danych / duplikat / brak wiedzy / przerwa usługi - właściwe dla zakresu'),
       ('Wyłączenie i obsługa ręczna','Sprawdzona procedura / osoba odpowiedzialna / ograniczenia'),
       ('Przekazane materiały','Instrukcja / dostępy / pliki / lista usług / koszty / szkolenie'),
       ('Otwarte punkty','Usterka czy nowy zakres / właściciel / uzgodniony termin'),
       ('Decyzja i opieka','Odebrano / do poprawy / wstrzymano; kanał zgłoszeń; potwierdzenie obu stron')])]:
        s=Surface(pdf,210*mm,297*mm);s.logo(43,32,.6,labelsize=13);s.text(title,43,90,25,'Bold')
        y=145
        for head,hint in fields:
            s.text(head,43,y,11,'Bold');s.text(hint,43,y+18,8,'Sans',MUTED)
            s.line(43,y+47,552,y+47);s.line(43,y+65,552,y+65);y+=88
        footer(pdf,pno,'FORMULARZ DO UZUPEŁNIENIA');pdf.showPage()
    pdf.save()

if __name__=='__main__':
    make_flyers(False);make_flyers(True)
    make_business_card(False);make_business_card(True)
    make_handbook();make_quick_reference();make_forms()
    (SRC/'tresci-ulotek.json').write_text(json.dumps(FLYERS,ensure_ascii=False,indent=2),encoding='utf-8')
    for file in OUT.glob('*.pdf'):
        reader=PdfReader(file)
        checks.append({'file':file.name,'pages':len(reader.pages),'size':file.stat().st_size})
    (WORK/'checks.json').write_text(json.dumps(checks,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps([c for c in checks if 'file' in c],ensure_ascii=False,indent=2))
