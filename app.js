const $=s=>document.querySelector(s),KEY='savedLiquors';
let items=[];try{items=JSON.parse(localStorage.getItem(KEY))||[]}catch{items=[]}
items=items.map(i=>i.id?i:{...i,id:makeItem('',0,0).id});
const store=()=>localStorage.setItem(KEY,JSON.stringify(items));store();
const name=$('#name'),price=$('#price'),size=$('#size'),custom=$('#custom'),crow=$('#customRow');
const ml=()=>size.value==='0'?parseFloat(custom.value)||0:parseFloat(size.value);
function update(){crow.hidden=size.value!=='0';const oz=toOz(ml());
 $('#volRow').hidden=!(oz>0);$('#vol').textContent=oz.toFixed(2)+' fl oz';
 $('#ppo').textContent='$'+pricePerOz(price.value,ml()).toFixed(2)+' / oz';
 $('#save').disabled=!canSave(name.value,price.value,ml());}
const esc=s=>s.replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
function render(){const L=$('#log');if(!items.length){L.innerHTML='<li class="empty">No logged items yet</li>';return}
 L.innerHTML=items.map(i=>`<li><div class="info"><div class="nm">${esc(i.name)}</div><div class="sub">$${i.price.toFixed(2)} for ${i.sizeMl.toFixed(0)}ml (${toOz(i.sizeMl).toFixed(1)} oz)</div></div><div class="pp">$${pricePerOz(i.price,i.sizeMl).toFixed(2)}/oz</div><button class="del" data-id="${i.id}" aria-label="Delete">✕</button></li>`).join('')}
$('#log').addEventListener('click',e=>{const b=e.target.closest('.del');if(!b)return;const it=items.find(i=>i.id===b.dataset.id);
 if(it&&confirm(`Delete "${it.name}"?`)){items=items.filter(i=>i.id!==it.id);store();render()}});
$('#save').addEventListener('click',()=>{if(!canSave(name.value,price.value,ml()))return;items.push(makeItem(name.value,price.value,ml()));store();render();name.value=price.value=custom.value='';update()});
[name,price,size,custom].forEach(el=>el.addEventListener('input',update));
update();render();
if('serviceWorker'in navigator)navigator.serviceWorker.register('sw.js');
