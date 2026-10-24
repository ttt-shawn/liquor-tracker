const ML_TO_OZ=0.033814;
function toOz(ml){return (Number(ml)||0)*ML_TO_OZ}
function pricePerOz(price,ml){const oz=toOz(ml);return oz>0?(Number(price)||0)/oz:0}
function makeId(){return (globalThis.crypto&&crypto.randomUUID)?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)}
const STORE_MAX=80,NO_STORE='__nostore__';
function normStore(s){return typeof s==='string'?s.replace(/\s+/g,' ').trim().slice(0,STORE_MAX):''}
const storeKey=s=>normStore(s).toLocaleLowerCase();
function listStores(list){const m=new Map();for(const i of list){const s=normStore(i&&i.store);if(s&&!m.has(storeKey(s)))m.set(storeKey(s),s)}return [...m.values()].sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:'base'}))}
function canonStore(list,s){s=normStore(s);if(!s)return '';const k=storeKey(s),hit=list.find(i=>i&&normStore(i.store)&&storeKey(i.store)===k);return hit?normStore(hit.store):s}
function filterByStore(list,f){if(!f)return list;if(f===NO_STORE)return list.filter(i=>!normStore(i.store));const k=storeKey(f);return list.filter(i=>normStore(i.store)&&storeKey(i.store)===k)}
function validFilter(list,f){if(!f)return '';if(f===NO_STORE)return list.some(i=>!normStore(i.store))?f:'';return canonStore(list,f)&&list.some(i=>storeKey(i.store)===storeKey(f))?canonStore(list,f):''}
// createdAt (v1.8.0): ISO time an entry was logged. Old entries get it from a time-based id when possible, else none.
const T_MIN=Date.UTC(2020,0,1),T_MAX=Date.UTC(2100,0,1);
function idTime(id){if(typeof id!=='string'||!/^[0-9a-z]{9,}$/.test(id))return '';const t=parseInt(id.slice(0,8),36);return t>=T_MIN&&t<=Date.now()+864e5?new Date(t).toISOString():''}
function validISO(v){return typeof v==='string'&&ISO_RE.test(v)&&!isNaN(Date.parse(v))?v:''}
function withCreated(i){if(!i||validISO(i.createdAt))return i;const c=idTime(i.id);if(c)return {...i,createdAt:c};if('createdAt' in i){const o={...i};delete o.createdAt;return o}return i}
function makeItem(name,price,ml,store,now){const it={id:makeId(),name:String(name).trim(),price:Number(price),sizeMl:Number(ml),createdAt:(now||new Date()).toISOString()},s=normStore(store);if(s)it.store=s;return it}
function canSave(name,price,ml){return String(name).trim().length>0&&pricePerOz(price,ml)>0}
function sortItems(list,key,dir){const m=dir==='desc'?-1:1,byName=(a,b)=>String(a.name).localeCompare(String(b.name),undefined,{sensitivity:'base'});
 const ct=i=>{const v=validISO(i.createdAt);return v?Date.parse(v):null};
 const prim={date:(a,b)=>{const x=ct(a),y=ct(b);if((x===null)!==(y===null))return (x===null?1:-1)*m;return (x||0)-(y||0)},name:byName,size:(a,b)=>a.sizeMl-b.sizeMl,ppo:(a,b)=>pricePerOz(a.price,a.sizeMl)-pricePerOz(b.price,b.sizeMl),
  store:(a,b)=>{const x=normStore(a.store),y=normStore(b.store);if(!x!==!y)return (!x?1:-1)*m;return x.localeCompare(y,undefined,{sensitivity:'base'})||pricePerOz(a.price,a.sizeMl)-pricePerOz(b.price,b.sizeMl)}}[key]||((a,b)=>pricePerOz(a.price,a.sizeMl)-pricePerOz(b.price,b.sizeMl));
 return [...list].sort((a,b)=>m*prim(a,b)||byName(a,b))}
const BACKUP_MAX_ITEMS=5000,BACKUP_MAX_BYTES=2*1024*1024;
// Edit an entry in place: same id and position, same validation as adding. Store is matched against the OTHER entries' spelling.
// Returns {ok:false} if invalid or not found. Sets updatedAt (ISO) on the edited entry.
function updateItem(list,id,name,price,ml,store,now){const k=list.findIndex(i=>i&&i.id===id);if(k<0||!canSave(name,price,ml))return {ok:false,items:list};
 const others=list.filter((_,j)=>j!==k),s=canonStore(others,store),it={...list[k],name:String(name).trim(),price:Number(price),sizeMl:Number(ml),updatedAt:(now||new Date()).toISOString()};
 if(s)it.store=s;else delete it.store;const out=list.slice();out[k]=it;return {ok:true,items:out,item:it}}
const ISO_RE=/^\d{4}-\d{2}-\d{2}T[\d:.]+Z$/;
const SORT_KEYS=['name','size','ppo','store','date'];
function makeBackup(items,sortPref,now,storeFilter){now=now||new Date();const b={app:'liquor-tracker',version:1,exportedAt:now.toISOString(),sortPref:sortPref||null,items:items.map(i=>{const o={id:i.id,name:i.name,price:i.price,sizeMl:i.sizeMl},s=normStore(i.store);if(s)o.store=s;if(typeof i.updatedAt==='string'&&ISO_RE.test(i.updatedAt))o.updatedAt=i.updatedAt;const c=validISO(withCreated(i).createdAt);if(c)o.createdAt=c;return o})};if(storeFilter)b.storeFilter=storeFilter;return b}
function backupFilename(now){now=now||new Date();const p=n=>String(n).padStart(2,'0');return `liquor-tracker-backup-${now.getFullYear()}-${p(now.getMonth()+1)}-${p(now.getDate())}.json`}
function parseBackup(text){const bad=m=>({ok:false,error:m});
 if(typeof text!=='string')return bad("That file couldn't be read.");
 if(text.length>BACKUP_MAX_BYTES)return bad("That file is too big to be a Liquor Tracker backup (2 MB max).");
 let d;try{d=JSON.parse(text)}catch{return bad("That file isn't a valid backup (it's not JSON).")}
 if(!d||typeof d!=='object'||Array.isArray(d)||d.app!=='liquor-tracker')return bad("That doesn't look like a Liquor Tracker backup.");
 if(typeof d.version!=='number'||d.version>1)return bad("That backup is from a newer version of the app. Close and reopen the app to update, then try again.");
 if(!Array.isArray(d.items))return bad("That backup has no item list.");
 if(d.items.length>BACKUP_MAX_ITEMS)return bad(`That backup has too many items (max ${BACKUP_MAX_ITEMS}).`);
 const out=[];for(let k=0;k<d.items.length;k++){const i=d.items[k],n=k+1;
  if(!i||typeof i!=='object')return bad(`Item ${n} in the backup is broken.`);
  if(typeof i.name!=='string'||!i.name.trim())return bad(`Item ${n} in the backup has no name.`);
  const price=typeof i.price==='number'?i.price:NaN,ml=typeof i.sizeMl==='number'?i.sizeMl:NaN;
  if(!Number.isFinite(price)||price<0)return bad(`"${i.name.trim().slice(0,40)}" has a bad price.`);
  if(!Number.isFinite(ml)||ml<=0)return bad(`"${i.name.trim().slice(0,40)}" has a bad bottle size.`);
  const id=typeof i.id==='string'&&i.id.trim()&&i.id.length<=100?i.id:makeId();
  const o={id,name:i.name.trim().slice(0,200),price,sizeMl:ml},st=normStore(i.store);if(st)o.store=st;if(typeof i.updatedAt==='string'&&ISO_RE.test(i.updatedAt))o.updatedAt=i.updatedAt;const c=validISO(i.createdAt)||idTime(id);if(c)o.createdAt=c;out.push(o)}
 let sp=null;const s=d.sortPref;if(s&&SORT_KEYS.includes(s.key)&&['asc','desc'].includes(s.dir))sp={key:s.key,dir:s.dir};
 const sf=d.storeFilter===NO_STORE?NO_STORE:normStore(d.storeFilter);
 return {ok:true,items:out,sortPref:sp,storeFilter:sf}}
// Duplicates are matched by entry id: the same bottle logged at two stores (or twice at one) is two separate entries, so both are kept.
// If an incoming entry has the same id but adds a store the local copy lacks, the store is filled in.
function mergeItems(cur,inc){const byId=new Map(cur.map(i=>[i.id,i])),out=cur.map(i=>i),add=[];let skipped=0;
 for(const i of inc){const ex=byId.get(i.id);if(ex){skipped++;const k=out.indexOf(ex);if(!normStore(ex.store)&&normStore(i.store))out[k]={...out[k],store:normStore(i.store)};if(!validISO(out[k].createdAt)&&validISO(i.createdAt))out[k]={...out[k],createdAt:i.createdAt};continue}byId.set(i.id,i);add.push(i)}
 return {items:[...out,...add],added:add.length,skipped}}
// ---- CSV (v1.7.0): open spreadsheet format. JSON backup stays the full-fidelity backup. ----
const CSV_COLS=['id','name','sizeMl','price','pricePerOz','store','createdAt','updatedAt'];
const CSV_BOM='\uFEFF';
function csvCell(v){let s=v==null?'':String(v);if(/^[=+\-@\t\r]/.test(s)&&!/^-?\d/.test(s))s="'"+s;return /[",\r\n]/.test(s)||s!==s.trim()?'"'+s.replace(/"/g,'""')+'"':s}
function makeCSV(items){const rows=[CSV_COLS.join(',')];for(const i of items){const up=typeof i.updatedAt==='string'&&ISO_RE.test(i.updatedAt)?i.updatedAt:'';
 rows.push([i.id,i.name,i.sizeMl,Number(i.price).toFixed(2),pricePerOz(i.price,i.sizeMl).toFixed(2),normStore(i.store),validISO(withCreated(i).createdAt),up].map(csvCell).join(','))}
 return CSV_BOM+rows.join('\r\n')+'\r\n'}
function csvFilename(now){return backupFilename(now).replace('-backup-','-').replace(/\.json$/,'.csv')}
// RFC 4180 tokenizer: quoted fields, "" escapes, CRLF/LF/CR, embedded newlines. Returns array of rows (arrays of strings).
function parseCSVRows(t){const rows=[];let row=[],f='',q=false,i=0;const n=t.length;
 while(i<n){const c=t[i];if(q){if(c==='"'){if(t[i+1]==='"'){f+='"';i+=2;continue}q=false;i++;continue}f+=c;i++;continue}
  if(c==='"'&&f.trim()===''){q=true;f='';i++;continue}
  if(c===','){row.push(f);f='';i++;continue}
  if(c==='\r'||c==='\n'){row.push(f);rows.push(row);row=[];f='';i+=(c==='\r'&&t[i+1]==='\n')?2:1;continue}
  f+=c;i++}
 if(f!==''||row.length){row.push(f);rows.push(row)}return rows}
const CSV_ALIAS={id:'id',name:'name',bottle:'name',liquor:'name',sizeml:'sizeMl',size:'sizeMl',ml:'sizeMl','size(ml)':'sizeMl',price:'price',totalprice:'price',store:'store',updatedat:'updatedAt',createdat:'createdAt',created:'createdAt',date:'createdAt',logged:'createdAt',updated:'updatedAt',priceperoz:'ppo','$/oz':'ppo'};
const hkey=h=>String(h).replace(/^\uFEFF/,'').toLowerCase().replace(/[\s_]/g,'');
function csvNum(s){s=String(s==null?'':s).trim().replace(/^\((.*)\)$/,'-$1').replace(/[$\s,]/g,'').replace(/ml$/i,'');if(!/^-?(\d+\.?\d*|\.\d+)$/.test(s))return NaN;return Number(s)}
const unq=s=>{s=String(s==null?'':s).trim();return /^'[=+\-@]/.test(s)?s.slice(1):s};
// Accepts ISO 8601 (date-only or with time/offset); normalizes to ...Z. Anything else is silently dropped.
function csvISO(v){v=String(v==null?'':v).trim();if(!/^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/.test(v))return '';const t=Date.parse(v.replace(' ','T'));return isNaN(t)||t<T_MIN||t>=T_MAX?'':new Date(t).toISOString()}
function parseCSV(text){const bad=m=>({ok:false,error:m});
 if(typeof text!=='string')return bad("That file couldn't be read.");
 if(text.length>BACKUP_MAX_BYTES)return bad("That file is too big (2 MB max).");
 text=text.replace(/^\uFEFF/,'');if(/^\s*[\[{]/.test(text))return bad("That looks like a .json backup. Use Restore from File for those.");
 const rows=parseCSVRows(text).filter(r=>r.some(c=>c.trim()!==''));if(!rows.length)return bad("That spreadsheet is empty.");
 const head=rows[0].map(h=>CSV_ALIAS[hkey(h)]||null),col={};head.forEach((k,j)=>{if(k&&!(k in col))col[k]=j});
 const miss=['name','price','sizeMl'].filter(k=>!(k in col));if(miss.length)return bad(`That spreadsheet is missing the ${miss.map(k=>k==='sizeMl'?'sizeMl (bottle size in ml)':k).join(', ')} column${miss.length>1?'s':''}. Export one from the app to see the layout.`);
 if(rows.length-1>BACKUP_MAX_ITEMS)return bad(`That spreadsheet has too many rows (max ${BACKUP_MAX_ITEMS}).`);
 const out=[],skipped=[],seen=new Set();const g=(r,k)=>k in col?(r[col[k]]==null?'':r[col[k]]):'';
 for(let k=1;k<rows.length;k++){const r=rows[k],line=k+1,nm=unq(g(r,'name')).replace(/\s+/g,' ').slice(0,200),lab=nm?`"${nm.slice(0,40)}"`:`Row ${line}`;
  if(!nm){skipped.push(`Row ${line}: no name`);continue}
  const price=csvNum(g(r,'price')),ml=csvNum(g(r,'sizeMl'));
  if(!Number.isFinite(price)||price<0){skipped.push(`${lab} (row ${line}): bad price`);continue}
  if(!Number.isFinite(ml)||ml<=0){skipped.push(`${lab} (row ${line}): bad size`);continue}
  let id=String(g(r,'id')).trim();if(!id||id.length>100||seen.has(id))id='';if(id)seen.add(id);
  const o={id,name:nm,price,sizeMl:ml},st=normStore(unq(g(r,'store')));if(st)o.store=st;const up=String(g(r,'updatedAt')).trim();if(ISO_RE.test(up))o.updatedAt=up;const cr=csvISO(g(r,'createdAt'));if(cr)o.createdAt=cr;out.push(o)}
 if(!out.length)return {ok:false,error:`No usable rows in that spreadsheet (${skipped.length} skipped).`+(skipped.length?'\n'+skipped.slice(0,5).join('\n'):''),skipped};
 return {ok:true,items:out,skipped}}
// Rows with no id or an id not in `cur` become new entries with fresh ids; matching ids are updated if anything changed.
function mergeCSV(cur,inc,now){const ts=(now||new Date()).toISOString(),idx=new Map(cur.map((i,k)=>[i.id,k])),out=cur.slice(),add=[];let updated=0,same=0;
 for(const i of inc){const k=i.id?idx.get(i.id):undefined;
  if(k===undefined){const n={...i,id:makeId()};delete n.updatedAt;if(i.updatedAt)n.updatedAt=i.updatedAt;add.push(n);continue}
  const ex=out[k],st=canonStore(out.filter((_,j)=>j!==k),i.store);
  const fill=!validISO(ex.createdAt)&&i.createdAt?{createdAt:i.createdAt}:null;
  if(ex.name===i.name&&ex.price===i.price&&ex.sizeMl===i.sizeMl&&normStore(ex.store)===st){if(fill)out[k]={...ex,...fill};same++;continue}
  const n={...ex,...fill,name:i.name,price:i.price,sizeMl:i.sizeMl,updatedAt:ts};if(st)n.store=st;else delete n.store;out[k]=n;updated++}
 return {items:[...out,...add],added:add.length,updated,unchanged:same}}
// Overwrite: every row kept; missing ids get fresh ones.
function replaceFromCSV(inc){return inc.map(i=>i.id?{...i}:{...i,id:makeId()})}
if(typeof module!=='undefined')module.exports={idTime,withCreated,csvISO,CSV_COLS,makeCSV,csvFilename,parseCSVRows,parseCSV,mergeCSV,replaceFromCSV,csvNum,updateItem,normStore,listStores,canonStore,filterByStore,validFilter,NO_STORE,SORT_KEYS,toOz,pricePerOz,makeItem,canSave,sortItems,ML_TO_OZ,makeBackup,backupFilename,parseBackup,mergeItems,BACKUP_MAX_ITEMS};
