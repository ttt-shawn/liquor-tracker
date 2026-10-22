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
const bk=L.makeBackup([{id:'x1',name:'J',price:30,sizeMl:750}],{key:'name',dir:'desc'},new Date(2026,9,21,12));
a.strictEqual(bk.app,'liquor-tracker');a.strictEqual(bk.version,1);a.ok(bk.exportedAt.startsWith('2026-10-21'));a.strictEqual(L.backupFilename(new Date(2026,0,5)),'liquor-tracker-backup-2026-01-05.json');
let r=L.parseBackup(JSON.stringify(bk));a.ok(r.ok);a.strictEqual(r.items.length,1);a.deepStrictEqual(r.sortPref,{key:'name',dir:'desc'});
const B=items=>JSON.stringify({app:'liquor-tracker',version:1,items});
for(const t of ['nope','null','[]',JSON.stringify({app:'other',version:1,items:[]}),JSON.stringify({app:'liquor-tracker',version:1}),JSON.stringify({app:'liquor-tracker',version:2,items:[]}),
 B([{name:'',price:1,sizeMl:1}]),B([{name:'  ',price:1,sizeMl:1}]),B([{name:5,price:1,sizeMl:1}]),B([{name:'a',price:-1,sizeMl:1}]),B([{name:'a',price:'5',sizeMl:1}]),B([{name:'a',price:null,sizeMl:1}]),
 B([{name:'a',price:1,sizeMl:0}]),B([{name:'a',price:1,sizeMl:-5}]),B([null]),B(Array(5001).fill({name:'a',price:1,sizeMl:1})),'x'.repeat(2*1024*1024+1)])a.ok(!L.parseBackup(t).ok,t.slice(0,60));
a.ok(!L.parseBackup(undefined).ok);a.ok(L.parseBackup(B([{name:'a',price:0,sizeMl:1}])).ok);
r=L.parseBackup(B([{name:'<img src=x onerror=alert(1)>',price:1,sizeMl:1}]));a.ok(r.ok);a.ok(r.items[0].id);
r=L.parseBackup(B([{id:'x1',name:'J',price:30,sizeMl:750},{name:'New',price:10,sizeMl:50}]));a.ok(r.ok&&r.items[1].id);
const m=L.mergeItems([{id:'x1',name:'J',price:30,sizeMl:750}],r.items);a.strictEqual(m.items.length,2);a.strictEqual(m.added,1);a.strictEqual(m.skipped,1);
console.log('logic ok')
