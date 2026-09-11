import urllib.request,re
from pathlib import Path
folder=Path(__file__).parent
url='https://fonts.googleapis.com/css?family=Manrope:400,600,700%7CSpace+Grotesk:700&subset=latin-ext'
css=urllib.request.urlopen(url).read().decode()
print(css)
for block in css.split('@font-face')[1:]:
    if "format('truetype')" not in block:
        continue
    name=re.search(r"font-family: '([^']+)'",block).group(1)
    weight=re.search(r'font-weight: (\d+)',block).group(1)
    fonturl=re.search(r'url\(([^)]+)\)',block).group(1)
    dest=folder/(name.replace(' ','')+'-'+weight+'.ttf')
    urllib.request.urlretrieve(fonturl,dest)
    print('saved',dest.name)
for family in ['manrope','spacegrotesk']:
    urllib.request.urlretrieve('https://raw.githubusercontent.com/google/fonts/main/ofl/'+family+'/OFL.txt',folder/(family+'-OFL.txt'))
