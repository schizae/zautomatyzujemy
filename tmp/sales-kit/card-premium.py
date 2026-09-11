from pathlib import Path
from io import BytesIO
import base64, json, zipfile, html
from PIL import Image, ImageOps, ImageDraw, ImageFont
from reportlab.lib.utils import ImageReader
from reportlab.lib.units import mm
from pypdf import PdfReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from build import Surface, new_pdf, crop_marks, OUT, SRC, ROOT, INK, PAPER, ORANGE, PHONE, CONTACT, URL
from build import color, clean

for name,filename in [('Manrope','Manrope-400.ttf'),('ManropeMedium','Manrope-600.ttf'),('ManropeBold','Manrope-700.ttf'),('Brand','SpaceGrotesk-700.ttf')]:
    pdfmetrics.registerFont(TTFont(name,str(Path(__file__).parent/filename)))

class BrandSurface(Surface):
    def text(self,txt,x,y,size=11,font='Sans',fill=INK):
        font={'Sans':'Manrope','Bold':'ManropeBold','Medium':'ManropeMedium'}.get(font,font)
        if getattr(self,'in_logo',False):font='Brand'
        txt=clean(txt)
        self.pdf.setFont(font,size);self.pdf.setFillColor(color(fill,self.cmyk))
        self.pdf.drawString(x+self.off,self.h+self.off-y-size*.82,txt)
        family='Space Grotesk' if font=='Brand' else 'Manrope'
        weight='700' if font in ['Brand','ManropeBold'] else '600' if font=='ManropeMedium' else '400'
        self.svg.append(f'<text x="{x}" y="{y+size*.82}" font-family="{family}" font-size="{size}" font-weight="{weight}" fill="{fill}">{html.escape(txt)}</text>')
        assert x+pdfmetrics.stringWidth(txt,font,size)<=self.w+.1,txt
    def logo(self,*args,**kwargs):
        self.in_logo=True
        super().logo(*args,**kwargs)
        self.in_logo=False

def shade(s,x,y,w,h,alpha):
    s.pdf.saveState();s.pdf.setFillColor(color('#101214',s.cmyk));s.pdf.setFillAlpha(alpha)
    s.pdf.rect(x+s.off,s.h+s.off-y-h,w,h,fill=1,stroke=0)
    s.pdf.restoreState()
    s.svg.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="#101214" opacity="{alpha}"/>')

def photo(surface,path,x,y,width,height,viewport):
    original=Image.open(path).convert('RGB')
    rgb=BytesIO();original.save(rgb,format='JPEG',quality=95)
    image_data=rgb.getvalue()
    if surface.cmyk:
        cmyk=BytesIO();original.convert('CMYK').save(cmyk,format='JPEG',quality=95)
        pdf_image=ImageReader(BytesIO(cmyk.getvalue()))
    else:
        pdf_image=ImageReader(BytesIO(image_data))
    vx,vy,vw,vh=viewport
    c=surface.pdf;c.saveState()
    clip=c.beginPath();clip.rect(vx+surface.off,surface.h+surface.off-vy-vh,vw,vh)
    c.clipPath(clip,stroke=0,fill=0)
    c.drawImage(pdf_image,x+surface.off,surface.h+surface.off-y-height,width,height)
    c.restoreState()
    cid='photo'+str(len(surface.svg))
    surface.svg.append(f'<defs><clipPath id="{cid}"><rect x="{vx}" y="{vy}" width="{vw}" height="{vh}"/></clipPath></defs>')
    surface.svg.append(f'<image x="{x}" y="{y}" width="{width}" height="{height}" href="data:image/jpeg;base64,{base64.b64encode(image_data).decode()}" clip-path="url(#{cid})"/>')

def make(printmode):
    w,h=85*mm,55*mm;b=3*mm
    filename='03-wizytowka-85x55'+('-druk' if printmode else '')+'.pdf'
    pdf,off=new_pdf(filename,w,h,printmode)
    s=BrandSurface(pdf,w,h,off,printmode)
    s.rect(-b,-b,w+2*b,h+2*b,INK)
    # A clipped placement of the original website portrait keeps identity intact.
    photo(s,ROOT/'public/norbert.png',113,-42,183,243,(151,-b,w-151+b,h+2*b))
    s.rect(148,-b,3,h+2*b,ORANGE)
    s.logo(13,15,.36,True,8.3)
    s.text('Inż. Informatyki Stosowanej',13,48,7.1,'Sans','#dedbd5')
    s.text('Norbert',12,64,19.5,'Brand',PAPER)
    s.text('Chojnacki',12,86,19.5,'Brand',PAPER)
    s.text('Pomagam firmom oszczędzać',13,116,8.1,'Brand',PAPER)
    s.text('czas i pieniądze.',13,127,8.1,'Brand',PAPER)
    s.text('AI · Automatyzacje · Aplikacje',13,140,7.1,'Medium','#dedbd5')
    if printmode:crop_marks(pdf,w,h,off)
    else:s.save_svg('wizytowka-przod.svg')
    pdf.showPage()
    s=BrandSurface(pdf,w,h,off,printmode)
    s.rect(-b,-b,w+2*b,h+2*b,'#101214')
    photo(s,ROOT/'public/redesign/klara-metal-v2.webp',81,-36,178,222.5,(81,-b,w-81+b,h+2*b))
    # Vector shading keeps the large background motif separate from foreground text.
    for step in range(100):
        x=81+step*.85
        shade(s,x,-b,.87,h+2*b,.99*(1-step/100)**1.8)
    shade(s,166,-b,w-166+b,h+2*b,.04)
    s.logo(13,15,.36,True,8.3)
    s.text(PHONE,13,48,11,'Medium',PAPER)
    s.text(CONTACT,13,68,7.2,'Sans','#dedbd5')
    s.line(13,84,125,84,'#44464a',.4)
    s.qr(URL+'/#klara',13,96,50)
    s.text('Poznaj Klarę',75,108,9.4,'Medium',PAPER)
    s.text('Asystent AI',75,124,7,'Sans','#dedbd5')
    if printmode:crop_marks(pdf,w,h,off)
    else:s.save_svg('wizytowka-tyl.svg')
    pdf.showPage();pdf.save()
    reader=PdfReader(OUT/filename)
    assert len(reader.pages)==2
    assert 'Inż. Informatyki Stosowanej' in reader.pages[0].extract_text()
    assert 'Norbert' in reader.pages[0].extract_text()
    assert any(a.get_object().get('/A',{}).get('/URI')==URL+'/#klara' for a in reader.pages[1]['/Annots'])
    if printmode:
        assert abs(float(reader.pages[0].trimbox.width)/mm-85)<.01
    return filename

if __name__=='__main__':
    print(json.dumps([make(False),make(True)]))
