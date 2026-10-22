const a=require('assert'),L=require('./logic.js');
a.strictEqual(L.toOz(750).toFixed(2),'25.36');a.strictEqual(L.pricePerOz(30,750).toFixed(2),'1.18');
a.strictEqual(L.pricePerOz(30,0),0);a.ok(!L.canSave('',30,750));a.ok(!L.canSave('J','',750));a.ok(L.canSave('J','30',750));
const i=L.makeItem(' Jameson ','29.99',1750);a.strictEqual(i.name,'Jameson');a.ok(i.id);
const it=[{name:'b',price:30,sizeMl:750},{name:'A',price:20,sizeMl:1750},{name:'c',price:10,sizeMl:750},{name:'a2',price:60,sizeMl:1500}];const n=x=>x.map(i=>i.name).join();
a.strictEqual(n(L.sortItems(it,'name','asc')),'A,a2,b,c');a.strictEqual(n(L.sortItems(it,'name','desc')),'c,b,a2,A');
a.strictEqual(n(L.sortItems(it,'size','asc')),'b,c,a2,A');a.strictEqual(n(L.sortItems(it,'size','desc')),'A,a2,b,c');
a.strictEqual(n(L.sortItems(it,'ppo','asc')),'A,c,a2,b');a.strictEqual(n(L.sortItems(it,'ppo','desc')),'a2,b,c,A');
a.strictEqual(n(L.sortItems([{name:'z',price:10,sizeMl:750},{name:'y',price:10,sizeMl:750}],'ppo','asc')),'y,z');
a.strictEqual(n(it),'b,A,c,a2');a.strictEqual(n(L.sortItems(it,'bogus','asc')),'A,c,a2,b');
console.log('logic ok')
