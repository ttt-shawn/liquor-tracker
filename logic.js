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
function makeItem(name,price,ml,store){const it={id:makeId(),name:String(name).trim(),price:Number(price),sizeMl:Number(ml)},s=normStore(store);if(s)it.store=s;return it}
function canSave(name,price,ml){return String(name).trim().length>0&&pricePerOz(price,ml)>0}
function sortItems(list,key,dir){const m=dir==='desc'?-1:1,byName=(a,b)=>String(a.name).localeCompare(String(b.name),undefined,{sensitivity:'base'});
 const prim={name:byName,size:(a,b)=>a.sizeMl-b.sizeMl,ppo:(a,b)=>pricePerOz(a.price,a.sizeMl)-pricePerOz(b.price,b.sizeMl),
  store:(a,b)=>{const x=normStore(a.store),y=normStore(b.store);if(!x!==!y)return (!x?1:-1)*m;return x.localeCompare(y,undefined,{sensitivity:'base'})||pricePerOz(a.price,a.sizeMl)-pricePerOz(b.price,b.sizeMl)}}[key]||((a,b)=>pricePerOz(a.price,a.sizeMl)-pricePerOz(b.price,b.sizeMl));
 return [...list].sort((a,b)=>m*prim(a,b)||byName(a,b))}
const BACKUP_MAX_ITEMS=5000,BACKUP_MAX_BYTES=2*1024*1024;
const SORT_KEYS=['name','size','ppo','store'];
function makeBackup(items,sortPref,now,storeFilter){now=now||new Date();const b={app:'liquor-tracker',version:1,exportedAt:now.toISOString(),sortPref:sortPref||null,items:items.map(i=>{const o={id:i.id,name:i.name,price:i.price,sizeMl:i.sizeMl},s=normStore(i.store);if(s)o.store=s;return o})};if(storeFilter)b.storeFilter=storeFilter;return b}
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
  const o={id,name:i.name.trim().slice(0,200),price,sizeMl:ml},st=normStore(i.store);if(st)o.store=st;out.push(o)}
 let sp=null;const s=d.sortPref;if(s&&SORT_KEYS.includes(s.key)&&['asc','desc'].includes(s.dir))sp={key:s.key,dir:s.dir};
 const sf=d.storeFilter===NO_STORE?NO_STORE:normStore(d.storeFilter);
 return {ok:true,items:out,sortPref:sp,storeFilter:sf}}
// Duplicates are matched by entry id: the same bottle logged at two stores (or twice at one) is two separate entries, so both are kept.
// If an incoming entry has the same id but adds a store the local copy lacks, the store is filled in.
function mergeItems(cur,inc){const byId=new Map(cur.map(i=>[i.id,i])),out=cur.map(i=>i),add=[];let skipped=0;
 for(const i of inc){const ex=byId.get(i.id);if(ex){skipped++;if(!normStore(ex.store)&&normStore(i.store))out[out.indexOf(ex)]={...ex,store:normStore(i.store)};continue}byId.set(i.id,i);add.push(i)}
 return {items:[...out,...add],added:add.length,skipped}}
if(typeof module!=='undefined')module.exports={normStore,listStores,canonStore,filterByStore,validFilter,NO_STORE,SORT_KEYS,toOz,pricePerOz,makeItem,canSave,sortItems,ML_TO_OZ,makeBackup,backupFilename,parseBackup,mergeItems,BACKUP_MAX_ITEMS};
