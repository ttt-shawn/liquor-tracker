const $=s=>document.querySelector(s),KEY='savedLiquors';
let items=[];try{items=JSON.parse(localStorage.getItem(KEY))||[]}catch{items=[]}
items=items.map(i=>i.id?i:{...i,id:makeId()}).map(withCreated);
let sort={key:'ppo',dir:'asc'};try{const v=JSON.parse(localStorage.getItem('sortPref'));if(v&&SORT_KEYS.includes(v.key)&&['asc','desc'].includes(v.dir))sort=v}catch{}
const store=()=>localStorage.setItem(KEY,JSON.stringify(items));store();
let storeF='';try{storeF=localStorage.getItem('storeFilter')||''}catch{}
const setStoreF=f=>{storeF=f||'';try{localStorage.setItem('storeFilter',storeF)}catch{}};
const storeIn=$('#store'),fsel=$('#storeFilter');
const name=$('#name'),price=$('#price'),size=$('#size'),custom=$('#custom'),crow=$('#customRow');
const ml=()=>size.value==='0'?parseFloat(custom.value)||0:parseFloat(size.value);
function update(){crow.hidden=size.value!=='0';const oz=toOz(ml());
 $('#volRow').hidden=!(oz>0);$('#vol').textContent=oz.toFixed(2)+' fl oz';
 $('#ppo').textContent='$'+pricePerOz(price.value,ml()).toFixed(2)+' / oz';
 $('#save').disabled=!canSave(name.value,price.value,ml());}
const when=v=>{const t=Date.parse(v);if(!v||isNaN(t))return '';const d=new Date(t),n=new Date(),o={month:'short',day:'numeric'};if(d.getFullYear()!==n.getFullYear())o.year='numeric';return d.toLocaleDateString(undefined,o)+', '+d.toLocaleTimeString(undefined,{hour:'numeric',minute:'2-digit'})};
const esc=s=>s.replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
function renderSort(){document.querySelectorAll('#sort button').forEach(b=>{const on=b.dataset.k===sort.key;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);b.querySelector('i').textContent=on?(sort.dir==='asc'?'▲':'▼'):''})}
$('#sort').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const k=b.dataset.k;
 sort=k===sort.key?{key:k,dir:sort.dir==='asc'?'desc':'asc'}:{key:k,dir:k==='date'?'desc':'asc'};localStorage.setItem('sortPref',JSON.stringify(sort));renderSort();render()});
function renderStores(){const st=listStores(items),hasNone=items.some(i=>!normStore(i.store));
 $('#storeList').innerHTML=st.map(s=>`<option value="${esc(s)}">`).join('');
 const v=validFilter(items,storeF);if(v!==storeF)setStoreF(v);
 $('#filterCard').hidden=!st.length;
 fsel.innerHTML='<option value="">All stores</option>'+st.map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join('')+(hasNone?`<option value="${NO_STORE}">No store</option>`:'');
 fsel.value=storeF}
fsel.addEventListener('change',()=>{setStoreF(fsel.value);render()});
function render(){renderStores();const L=$('#log'),cnt=$('#filterCount');if(!items.length){L.innerHTML='<li class="empty">No logged items yet</li>';cnt.textContent='';return}
 const shown=filterByStore(items,storeF);cnt.textContent=storeF?`${shown.length} of ${items.length}`:'';
 if(!shown.length){L.innerHTML='<li class="empty">Nothing logged for this store</li>';return}
 L.innerHTML=sortItems(shown,sort.key,sort.dir).map(i=>`<li${i.id===editId?' class="editing"':''}><div class="info"><div class="nm">${esc(i.name)}</div>${normStore(i.store)?`<div class="st">@ ${esc(normStore(i.store))}</div>`:''}<div class="sub">$${i.price.toFixed(2)} for ${i.sizeMl.toFixed(0)}ml (${toOz(i.sizeMl).toFixed(1)} oz)</div>${when(i.createdAt)||when(i.updatedAt)?`<div class="when">${when(i.createdAt)?esc(when(i.createdAt)):''}${when(i.updatedAt)?`<span class="edt">${when(i.createdAt)?' · ':''}edited ${esc(when(i.updatedAt))}</span>`:''}</div>`:''}</div><div class="pp">$${pricePerOz(i.price,i.sizeMl).toFixed(2)}/oz</div><button class="ed" data-id="${i.id}" aria-label="Edit ${esc(i.name)}">✎</button><button class="del" data-id="${i.id}" aria-label="Delete ${esc(i.name)}">✕</button></li>`).join('')}
let editId=null,draft=null;const PRESETS=['50','375','750','1000','1750'];
function setForm(f){name.value=f.name;price.value=f.price;storeIn.value=f.store;const m=String(f.ml);if(PRESETS.includes(m)){size.value=m;custom.value=''}else{size.value='0';custom.value=f.ml||''}update()}
function getForm(){return {name:name.value,price:price.value,store:storeIn.value,ml:size.value==='0'?custom.value:size.value}}
function startEdit(it){if(!editId)draft=getForm();editId=it.id;setForm({name:it.name,price:String(it.price),store:normStore(it.store),ml:it.sizeMl});
 $('#editBar').hidden=false;$('#editName').textContent=it.name;$('#save').textContent='✓ Save Changes';$('#cancelEdit').hidden=false;document.body.classList.add('editmode');render();
 window.scrollTo({top:0,behavior:'smooth'})}
function endEdit(){editId=null;$('#editBar').hidden=true;$('#save').textContent='⊕ Save to Price Log';$('#cancelEdit').hidden=true;document.body.classList.remove('editmode');
 if(draft){setForm(draft);draft=null}else setForm({name:'',price:'',store:'',ml:'750'});render()}
$('#cancelEdit').addEventListener('click',endEdit);$('#editX').addEventListener('click',endEdit);
$('#log').addEventListener('click',e=>{const ed=e.target.closest('.ed');if(ed){const it=items.find(i=>i.id===ed.dataset.id);if(it)startEdit(it);return}
 const b=e.target.closest('.del');if(!b)return;const it=items.find(i=>i.id===b.dataset.id);
 if(it&&confirm(`Delete "${it.name}"?`)){items=items.filter(i=>i.id!==it.id);store();if(editId===it.id)endEdit();else render()}});
$('#save').addEventListener('click',()=>{if(!canSave(name.value,price.value,ml()))return;
 if(editId){const r=updateItem(items,editId,name.value,price.value,ml(),storeIn.value);if(!r.ok){toast("Couldn't save that entry");endEdit();return}
  items=r.items;store();const f=storeF;endEdit();const hidden=f&&!filterByStore([r.item],f).length&&storeF===f;
  toast(hidden?`Saved. "${r.item.name}" is now ${r.item.store?'at '+r.item.store:'without a store'}, so the ${f===NO_STORE?'No store':f} filter hides it`:`Saved "${r.item.name}"`);return}const it=makeItem(name.value,price.value,ml(),canonStore(items,storeIn.value));items.push(it);storeIn.value=it.store||'';store();render();name.value=price.value=custom.value='';update()});
[name,price,size,custom].forEach(el=>el.addEventListener('input',update));
let toastT;function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,3500)}
$('#bkBtn').addEventListener('click',async()=>{if(!items.length){toast('Nothing to back up yet');return}
 const fn=backupFilename(),json=JSON.stringify(makeBackup(items,sort,undefined,storeF),null,2);
 try{const f=new File([json],fn,{type:'application/json'});
  if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'Liquor Tracker backup'});toast(`Backed up ${items.length} item${items.length===1?'':'s'}`);return}}
 catch(e){if(e&&e.name==='AbortError')return}
 const u=URL.createObjectURL(new Blob([json],{type:'application/json'})),l=document.createElement('a');l.href=u;l.download=fn;document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),10000);toast(`Backed up ${items.length} item${items.length===1?'':'s'}`)});
$('#rsBtn').addEventListener('click',()=>$('#rsFile').click());
async function shareOrDownload(data,fn,type,title){try{const f=new File([data],fn,{type});
  if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title});return true}}
 catch(e){if(e&&e.name==='AbortError')return false}
 const u=URL.createObjectURL(new Blob([data],{type})),l=document.createElement('a');l.href=u;l.download=fn;document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),10000);return true}
$('#csvExBtn').addEventListener('click',async()=>{if(!items.length){toast('Nothing to export yet');return}
 if(await shareOrDownload(makeCSV(items),csvFilename(),'text/csv','Liquor Tracker spreadsheet'))toast(`Exported ${items.length} item${items.length===1?'':'s'} to CSV`)});
$('#csvImBtn').addEventListener('click',()=>$('#csvFile').click());
$('#csvFile').addEventListener('change',async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
 if(f.size>BACKUP_MAX_BYTES){alert("That file is too big (2 MB max).");return}
 let txt;try{txt=await f.text()}catch{alert("That file couldn't be read.");return}
 const r=parseCSV(txt);if(!r.ok){alert(r.error);return}
 pending={csv:true,items:r.items,skipped:r.skipped};const n=r.items.length,sk=r.skipped.length;
 $('#sheetMsg').textContent=`This spreadsheet has ${n} good row${n===1?'':'s'}`+(sk?` (${sk} bad row${sk===1?'':'s'} will be skipped)`:'')+`. Merge adds new bottles and updates changed ones in your log (${items.length}). Overwrite replaces your whole log with the spreadsheet.`;
 $('#shReplace').textContent=items.length?'Overwrite':'Import';$('#shMerge').hidden=!items.length;$('#toast').hidden=true;sheet.hidden=false});
const skipNote=p=>p.skipped&&p.skipped.length?`, ${p.skipped.length} skipped (${p.skipped.slice(0,3).join('; ')}${p.skipped.length>3?'; …':''})`:'';
let pending=null;const sheet=$('#sheet');
$('#rsFile').addEventListener('change',async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
 if(f.size>BACKUP_MAX_BYTES){alert("That file is too big to be a Liquor Tracker backup (2 MB max).");return}
 let txt;try{txt=await f.text()}catch{alert("That file couldn't be read.");return}
 const r=parseBackup(txt);if(!r.ok){alert(r.error);return}
 pending=r;const n=r.items.length;$('#sheetMsg').textContent=`This backup has ${n} item${n===1?'':'s'}. Merge them into your current log (${items.length}), or replace your log with the backup?`;
 $('#shReplace').textContent=items.length?'Replace':'Restore';$('#shMerge').hidden=!items.length;$('#toast').hidden=true;sheet.hidden=false});
const closeSheet=()=>{sheet.hidden=true;pending=null};$('#shCancel').addEventListener('click',closeSheet);sheet.addEventListener('click',e=>{if(e.target===sheet)closeSheet()});
$('#shMerge').addEventListener('click',()=>{if(!pending)return;if(editId){draft=null;endEdit()}
 if(pending.csv){const p=pending,m=mergeCSV(items,p.items);items=m.items;store();render();closeSheet();toast(`${m.added} imported, ${m.updated} updated`+(m.unchanged?`, ${m.unchanged} unchanged`:'')+skipNote(p));return}
 const m=mergeItems(items,pending.items);items=m.items;store();render();closeSheet();toast(`Restored ${m.added} item${m.added===1?'':'s'}`+(m.skipped?` (${m.skipped} already here)`:''))});
$('#shReplace').addEventListener('click',()=>{if(!pending)return;const p=pending;if(items.length&&!confirm(`Replace your ${items.length} logged items with the ${p.csv?'spreadsheet':'backup'}? This can't be undone.`))return;if(editId){draft=null;endEdit()}
 if(p.csv){items=replaceFromCSV(p.items);store();render();closeSheet();toast(`${items.length} imported (log overwritten)`+skipNote(p));return}
 
 items=p.items;store();if(p.sortPref){sort=p.sortPref;localStorage.setItem('sortPref',JSON.stringify(sort));renderSort()}setStoreF(p.storeFilter||'');render();closeSheet();toast(`Restored ${items.length} item${items.length===1?'':'s'}`)});
update();renderSort();render();
if('serviceWorker'in navigator){navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(r=>r.update());let rl=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(rl)return;rl=true;location.reload()});}
