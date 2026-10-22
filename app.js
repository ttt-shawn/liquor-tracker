const $=s=>document.querySelector(s),KEY='savedLiquors';
let items=[];try{items=JSON.parse(localStorage.getItem(KEY))||[]}catch{items=[]}
items=items.map(i=>i.id?i:{...i,id:makeItem('',0,0).id});
let sort={key:'ppo',dir:'asc'};try{const v=JSON.parse(localStorage.getItem('sortPref'));if(v&&['name','size','ppo'].includes(v.key)&&['asc','desc'].includes(v.dir))sort=v}catch{}
const store=()=>localStorage.setItem(KEY,JSON.stringify(items));store();
const name=$('#name'),price=$('#price'),size=$('#size'),custom=$('#custom'),crow=$('#customRow');
const ml=()=>size.value==='0'?parseFloat(custom.value)||0:parseFloat(size.value);
function update(){crow.hidden=size.value!=='0';const oz=toOz(ml());
 $('#volRow').hidden=!(oz>0);$('#vol').textContent=oz.toFixed(2)+' fl oz';
 $('#ppo').textContent='$'+pricePerOz(price.value,ml()).toFixed(2)+' / oz';
 $('#save').disabled=!canSave(name.value,price.value,ml());}
const esc=s=>s.replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
function renderSort(){document.querySelectorAll('#sort button').forEach(b=>{const on=b.dataset.k===sort.key;b.classList.toggle('on',on);b.setAttribute('aria-pressed',on);b.querySelector('i').textContent=on?(sort.dir==='asc'?'▲':'▼'):''})}
$('#sort').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const k=b.dataset.k;
 sort=k===sort.key?{key:k,dir:sort.dir==='asc'?'desc':'asc'}:{key:k,dir:'asc'};localStorage.setItem('sortPref',JSON.stringify(sort));renderSort();render()});
function render(){const L=$('#log');if(!items.length){L.innerHTML='<li class="empty">No logged items yet</li>';return}
 L.innerHTML=sortItems(items,sort.key,sort.dir).map(i=>`<li><div class="info"><div class="nm">${esc(i.name)}</div><div class="sub">$${i.price.toFixed(2)} for ${i.sizeMl.toFixed(0)}ml (${toOz(i.sizeMl).toFixed(1)} oz)</div></div><div class="pp">$${pricePerOz(i.price,i.sizeMl).toFixed(2)}/oz</div><button class="del" data-id="${i.id}" aria-label="Delete">✕</button></li>`).join('')}
$('#log').addEventListener('click',e=>{const b=e.target.closest('.del');if(!b)return;const it=items.find(i=>i.id===b.dataset.id);
 if(it&&confirm(`Delete "${it.name}"?`)){items=items.filter(i=>i.id!==it.id);store();render()}});
$('#save').addEventListener('click',()=>{if(!canSave(name.value,price.value,ml()))return;items.push(makeItem(name.value,price.value,ml()));store();render();name.value=price.value=custom.value='';update()});
[name,price,size,custom].forEach(el=>el.addEventListener('input',update));
let toastT;function toast(m){const t=$('#toast');t.textContent=m;t.hidden=false;clearTimeout(toastT);toastT=setTimeout(()=>t.hidden=true,3500)}
$('#bkBtn').addEventListener('click',async()=>{if(!items.length){toast('Nothing to back up yet');return}
 const fn=backupFilename(),json=JSON.stringify(makeBackup(items,sort),null,2);
 try{const f=new File([json],fn,{type:'application/json'});
  if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'Liquor Tracker backup'});toast(`Backed up ${items.length} item${items.length===1?'':'s'}`);return}}
 catch(e){if(e&&e.name==='AbortError')return}
 const u=URL.createObjectURL(new Blob([json],{type:'application/json'})),l=document.createElement('a');l.href=u;l.download=fn;document.body.appendChild(l);l.click();l.remove();setTimeout(()=>URL.revokeObjectURL(u),10000);toast(`Backed up ${items.length} item${items.length===1?'':'s'}`)});
$('#rsBtn').addEventListener('click',()=>$('#rsFile').click());
let pending=null;const sheet=$('#sheet');
$('#rsFile').addEventListener('change',async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
 if(f.size>BACKUP_MAX_BYTES){alert("That file is too big to be a Liquor Tracker backup (2 MB max).");return}
 let txt;try{txt=await f.text()}catch{alert("That file couldn't be read.");return}
 const r=parseBackup(txt);if(!r.ok){alert(r.error);return}
 pending=r;const n=r.items.length;$('#sheetMsg').textContent=`This backup has ${n} item${n===1?'':'s'}. Merge them into your current log (${items.length}), or replace your log with the backup?`;
 $('#shReplace').textContent=items.length?'Replace':'Restore';$('#shMerge').hidden=!items.length;sheet.hidden=false});
const closeSheet=()=>{sheet.hidden=true;pending=null};$('#shCancel').addEventListener('click',closeSheet);sheet.addEventListener('click',e=>{if(e.target===sheet)closeSheet()});
$('#shMerge').addEventListener('click',()=>{if(!pending)return;const m=mergeItems(items,pending.items);items=m.items;store();render();closeSheet();toast(`Restored ${m.added} item${m.added===1?'':'s'}`+(m.skipped?` (${m.skipped} already here)`:''))});
$('#shReplace').addEventListener('click',()=>{if(!pending)return;const p=pending;if(items.length&&!confirm(`Replace your ${items.length} logged items with the backup? This can't be undone.`))return;
 items=p.items;store();if(p.sortPref){sort=p.sortPref;localStorage.setItem('sortPref',JSON.stringify(sort));renderSort()}render();closeSheet();toast(`Restored ${items.length} item${items.length===1?'':'s'}`)});
update();renderSort();render();
if('serviceWorker'in navigator){navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(r=>r.update());let rl=false;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(rl)return;rl=true;location.reload()});}
