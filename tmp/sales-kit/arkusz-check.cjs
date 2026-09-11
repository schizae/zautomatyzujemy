const fs = require('node:fs');
const {createRequire}=require('node:module');
const req=createRequire('C:/Users/kuba/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/package.json');
const {Workbook,SpreadsheetFile,FileBlob}=req('@oai/artifact-tool');
(async()=>{
 const w=await SpreadsheetFile.importXlsx(await FileBlob.load('C:/Projects/zautomatyzujemy/output/sprzedaz-zautomatyzujemy/05-narzedzia-sprzedazy.xlsx'));
 w.recalculate();
 console.log((await w.inspect({kind:'table',range:"'Kalkulator korzyści'!B5:C11",include:'values,formulas',tableMaxRows:8,tableMaxCols:2})).ndjson);
 const s=w.worksheets.getItem('Kalkulator korzyści');
 for(const [label,changes] of [['zero-volume',{C15:0}],['blank-required',{C15:null}],['negative-benefit',{C15:300,C17:12}],['positive-cash',{C17:2,C20:1}],['zero-cost',{C21:0,C22:0,C23:0}]]){
  for(const [cell,value] of Object.entries(changes)) s.getRange(cell).values=[[value]];
  w.recalculate();
  console.log(label,(await w.inspect({kind:'table',range:"'Kalkulator korzyści'!B7:C9",include:'values',tableMaxRows:3,tableMaxCols:2})).ndjson);
 }
 const original=await SpreadsheetFile.importXlsx(await FileBlob.load('C:/Projects/zautomatyzujemy/output/sprzedaz-zautomatyzujemy/05-narzedzia-sprzedazy.xlsx'));
 for(const name of ['START','Kalkulator korzyści','Wycena','Lejek CRM','Discovery','Odbiór']){
  const png=await original.render({sheetName:name,range:name==='Lejek CRM'?'B1:L8':name==='Kalkulator korzyści'?'B1:D12':'B1:D15',scale:1,format:'png'});
  fs.writeFileSync('C:/Projects/zautomatyzujemy/tmp/sales-kit/arkusz-'+name.replaceAll(' ','-')+'.png',new Uint8Array(await png.arrayBuffer()));
 }
})().catch(e=>{console.error(e.stack);process.exitCode=1});
