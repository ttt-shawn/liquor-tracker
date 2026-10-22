const ML_TO_OZ=0.033814;
function toOz(ml){return (Number(ml)||0)*ML_TO_OZ}
function pricePerOz(price,ml){const oz=toOz(ml);return oz>0?(Number(price)||0)/oz:0}
function makeId(){return (globalThis.crypto&&crypto.randomUUID)?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)}
function makeItem(name,price,ml){return {id:makeId(),name:String(name).trim(),price:Number(price),sizeMl:Number(ml)}}
function canSave(name,price,ml){return String(name).trim().length>0&&pricePerOz(price,ml)>0}
function sortItems(list,key,dir){const m=dir==='desc'?-1:1,byName=(a,b)=>String(a.name).localeCompare(String(b.name),undefined,{sensitivity:'base'});
 const prim={name:byName,size:(a,b)=>a.sizeMl-b.sizeMl,ppo:(a,b)=>pricePerOz(a.price,a.sizeMl)-pricePerOz(b.price,b.sizeMl)}[key]||((a,b)=>pricePerOz(a.price,a.sizeMl)-pricePerOz(b.price,b.sizeMl));
 return [...list].sort((a,b)=>m*prim(a,b)||byName(a,b))}
const BACKUP_MAX_ITEMS=5000,BACKUP_MAX_BYTES=2*1024*1024;
function makeBackup(items,sortPref,now){now=now||new Date();return {app:'liquor-tracker',version:1,exportedAt:now.toISOString(),sortPref:sortPref||null,items:items.map(i=>({id:i.id,name:i.name,price:i.price,sizeMl:i.sizeMl}))}}
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
  out.push({id,name:i.name.trim().slice(0,200),price,sizeMl:ml})}
 let sp=null;const s=d.sortPref;if(s&&['name','size','ppo'].includes(s.key)&&['asc','desc'].includes(s.dir))sp={key:s.key,dir:s.dir};
 return {ok:true,items:out,sortPref:sp}}
function mergeItems(cur,inc){const ids=new Set(cur.map(i=>i.id)),add=[];for(const i of inc)if(!ids.has(i.id)){ids.add(i.id);add.push(i)}return {items:[...cur,...add],added:add.length,skipped:inc.length-add.length}}
if(typeof module!=='undefined')module.exports={toOz,pricePerOz,makeItem,canSave,sortItems,ML_TO_OZ,makeBackup,backupFilename,parseBackup,mergeItems,BACKUP_MAX_ITEMS};
