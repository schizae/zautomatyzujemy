import { mkdir, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

// Original vector cover family: paper, ink, coral; the subject changes with the article.
const directory = fileURLToPath(new URL('../public/editorial/', import.meta.url))
const ink = '#202826', coral = '#c93820', paper = '#fcfaf5', muted = '#b8b8ab'
const rect = (x,y,w,h,fill=paper,extra='') => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" ${extra}/>`
const line = (x,y,w,color=muted) => `<path d="M${x} ${y}h${w}" stroke="${color}" stroke-width="5"/>`
const lines = (x,y,width,count=4) => Array.from({length:count},(_,i)=>line(x,y+i*28,width-(i===count-1?width*.3:0))).join('')
const circle = (x,y,r,fill) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}"/>`
const sheet = (body, rotation=0) => `<g transform="rotate(${rotation} 600 375)" filter="url(#shadow)">${body}</g>`
const conversation = `<path d="M395 225h365v190H540l-85 64v-64h-60z" fill="${paper}"/>${lines(435,275,250,3)}<path d="M590 410h240v125h-42v42l-60-42H590z" fill="${ink}"/>${circle(644,473,9,'#e3dccd')}${circle(690,473,9,'#e3dccd')}${circle(736,473,9,coral)}`
const invoice = `${rect(420,160,365,420)}${rect(455,198,64,64,ink)}${line(565,218,170,ink)}${line(565,246,105)}${line(455,303,285)}${lines(455,343,220,3)}${rect(455,464,285,65,'#e6e5da')}${line(480,497,125,ink)}${circle(765,550,48,coral)}<path d="m744 550 14 14 30-33" fill="none" stroke="${paper}" stroke-width="8"/>`
const covers = {
  brief: { background:'#e9e5dc', title:'Przegląd wiadomości o AI', body:sheet(`${rect(344,190,480,385,'#cecbbf')}`, -7)+sheet(`${rect(376,165,480,385)}${rect(408,197,105,15,coral)}${line(408,246,405,ink)}${line(408,272,310,ink)}${rect(408,321,170,170,ink)}${lines(610,328,197,6)}${rect(452,359,81,94,'#d9d4c7')}${rect(468,379,82,75,coral)}`,3) },
  analysis: { background:'#e4e7df', title:'Analiza danych i decyzje', body:sheet(`${rect(335,170,530,405)}${line(375,220,160,ink)}${line(375,247,110)}${rect(400,390,75,115,'#b8c1b1')}${rect(505,326,75,179,ink)}${rect(610,260,75,245,coral)}${rect(715,348,75,157,'#d9d2c3')}${line(375,523,450,'#d4d5cb')}`,-3)+`<circle cx="797" cy="268" r="88" fill="${paper}" stroke="${ink}" stroke-width="12"/><path d="m860 331 61 64" stroke="${ink}" stroke-width="25" stroke-linecap="round"/>${rect(754,274,22,38,'#b8c1b1')}${rect(786,244,22,68,coral)}${rect(818,259,22,53,ink)}` },
  security: { background:'#dfe3dc', title:'Ochrona danych i bezpieczeństwo', body:`${circle(600,367,237,'#d0d7cb')}<path d="m600 149 186 71v155c0 125-186 219-186 219s-186-94-186-219V220z" fill="${ink}" filter="url(#shadow)"/><path d="m600 185 150 58v132c0 96-150 178-150 178" fill="none" stroke="#687265" stroke-width="2"/>${rect(528,324,144,118,paper,'rx="8"')}<path d="M550 324v-40a50 50 0 0 1 100 0v40" stroke="${paper}" stroke-width="17" fill="none"/>${circle(600,369,13,coral)}${rect(594,369,12,33,coral)}` },
  documents: { background:'#ebe5dc', title:'Dokumenty odczytane i uporządkowane', body:sheet(rect(390,179,365,420,'#c5c6b8'),-7)+sheet(invoice,4) },
  support: { background:'#e0e5df', title:'Rozmowa i wsparcie oparte na wiedzy', body:sheet(conversation,-3)+`<path d="M325 245v-70h70M875 492v80h-65" fill="none" stroke="#9da89b" stroke-width="2"/>` },
  commerce: { background:'#e9e3d8', title:'Sklep internetowy i obsługa zamówień', body:`<g filter="url(#shadow)"><path d="m388 309 195-103 232 113-203 110z" fill="#d8c9ad"/><path d="m388 309 224 120v203L388 508z" fill="#b9aa8e"/><path d="m612 429 203-110v202L612 632z" fill="#e8dbc0"/><path d="m478 261 221 119v90l-39 21v-90L436 283z" fill="${paper}"/></g><path d="M677 128h226v146h-91l-46 43v-43h-89z" fill="${ink}"/>${circle(736,201,8,paper)}${circle(787,201,8,paper)}${circle(838,201,8,coral)}` },
  workflow: { background:'#e4e6df', title:'Integracje i uporządkowane procesy', body:`<g filter="url(#shadow)">${rect(307,263,175,210,paper,'rx="6"')}${rect(514,205,175,325,ink,'rx="6"')}${rect(722,263,175,210,'#c8cebf','rx="6"')}</g>${circle(394,340,30,coral)}${lines(341,404,108,2)}<path d="m557 323 35 35 59-68" stroke="${paper}" stroke-width="12" fill="none"/>${lines(552,434,101,2)}${rect(766,309,85,65,paper)}${rect(785,329,48,26,coral)}${lines(754,411,106,2)}` },
  knowledge: { background:'#e7e4da', title:'Wiedza firmowa i uporządkowane źródła', body:`<g filter="url(#shadow)">${rect(335,227,104,323,ink)}${rect(452,192,104,358,paper)}${rect(570,248,104,302,'#b5bdab')}<g transform="rotate(-12 780 550)">${rect(713,209,104,341,'#d3c8b2')}${rect(736,236,59,55,coral)}</g></g>${line(360,268,55,'#a4afa0')}${line(477,238,55,ink)}${line(595,291,55,ink)}${rect(475,456,58,64,coral)}` },
  people: { background:'#e4e6df', title:'Rekrutacja i dopasowanie kompetencji', body:sheet(`${rect(345,223,230,325,'#c4ccbe')}${circle(460,305,36,paper)}<path d="M399 409v-26a61 61 0 0 1 122 0v26" fill="${paper}"/>${lines(389,450,144,2)}`,-7)+sheet(`${rect(600,181,255,365)}${circle(727,275,42,ink)}<path d="M655 396v-32a72 72 0 0 1 144 0v32" fill="${ink}"/>${lines(645,445,160,2)}${circle(849,508,49,coral)}<path d="m828 507 14 14 29-32" stroke="${paper}" stroke-width="8" fill="none"/>`,4) },
  health: { background:'#e2e7df', title:'Opieka zdrowotna i bezpieczna informacja', body:`${circle(520,370,220,'#ced8c8')}<path d="M454 197h132v112h112v132H586v112H454V441H342V309h112z" fill="${ink}"/>${sheet(`${rect(635,307,228,271)}${circle(677,351,12,coral)}${lines(675,409,145,4)}`,6)}` },
  design: { background:'#e9e4dc', title:'Projektowanie interfejsów i kompozycji', body:sheet(`${rect(325,171,552,408)}${line(359,220,170,ink)}${rect(359,270,206,259,ink)}${circle(462,366,64,'#d0c7b6')}<path d="M398 492 462 395 526 492z" fill="${coral}"/>${rect(592,270,250,118,'#e1ddcf')}${circle(645,329,28,coral)}${line(697,319,115,ink)}${line(697,342,87)}${lines(592,429,243,3)}`,2) },
}

await mkdir(directory,{recursive:true})
for (const [name,cover] of Object.entries(covers)) {
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 750" width="1200" height="750" role="img"><title>${cover.title}</title><defs><filter id="shadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="0" dy="16" stdDeviation="15" flood-color="#202826" flood-opacity=".12"/></filter></defs>${rect(0,0,1200,750,cover.background)}${cover.body}<path d="M80 650h25v-25M1120 100h-25v25" fill="none" stroke="${ink}" stroke-width="2" opacity=".22"/></svg>`
  await writeFile(`${directory}/${name}.svg`,svg)
  await sharp(Buffer.from(svg)).png({ compressionLevel: 9, palette: true }).toFile(`${directory}/${name}.png`)
}
console.log(`Created ${Object.keys(covers).length} editorial SVG covers.`)
