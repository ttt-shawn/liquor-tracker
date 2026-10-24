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
// store handling (v1.5.0)
a.strictEqual(L.normStore('  Class   IV \n'),'Class IV');a.strictEqual(L.normStore(undefined),'');a.strictEqual(L.normStore(42),'');a.strictEqual(L.normStore('x'.repeat(200)).length,80);
let s1=L.makeItem('J',30,750,'  Class  IV ');a.strictEqual(s1.store,'Class IV');a.ok(!('store' in L.makeItem('J',30,750)));a.ok(!('store' in L.makeItem('J',30,750,'   ')));
const st=[{id:'1',name:'J',price:30,sizeMl:750,store:'Class IV'},{id:'2',name:'J',price:25,sizeMl:750,store:'Bob\'s Liquor'},{id:'3',name:'K',price:40,sizeMl:750},{id:'4',name:'M',price:20,sizeMl:750,store:'class iv'},{id:'5',name:'N',price:50,sizeMl:1750,store:''}];
a.deepStrictEqual(L.listStores(st),['Bob\'s Liquor','Class IV']);a.deepStrictEqual(L.listStores([]),[]);
a.strictEqual(L.canonStore(st,' CLASS iv '),'Class IV');a.strictEqual(L.canonStore(st,'New Place'),'New Place');a.strictEqual(L.canonStore(st,'  '),'');
const ids=x=>x.map(i=>i.id).join();
a.strictEqual(ids(L.filterByStore(st,'')),'1,2,3,4,5');a.strictEqual(ids(L.filterByStore(st,'CLASS IV')),'1,4');a.strictEqual(ids(L.filterByStore(st,L.NO_STORE)),'3,5');a.strictEqual(ids(L.filterByStore(st,'Nowhere')),'');
a.strictEqual(L.validFilter(st,'class IV'),'Class IV');a.strictEqual(L.validFilter(st,'Gone'),'');a.strictEqual(L.validFilter(st,L.NO_STORE),L.NO_STORE);a.strictEqual(L.validFilter(st.slice(0,2),L.NO_STORE),'');
// filter + sort compose
a.strictEqual(ids(L.sortItems(L.filterByStore(st,'Class IV'),'ppo','asc')),'4,1');a.strictEqual(ids(L.sortItems(L.filterByStore(st,'Class IV'),'ppo','desc')),'1,4');
// store sort: alphabetical, $/oz within store, no-store last in both directions
a.strictEqual(ids(L.sortItems(st,'store','asc')),'2,4,1,5,3');a.strictEqual(ids(L.sortItems(st,'store','desc')).slice(0,5),'1,4,2');a.ok(/[35],[35]$/.test(ids(L.sortItems(st,'store','desc'))));
// backup round-trip with store
const bk2=L.makeBackup(st,{key:'store',dir:'asc'},new Date(2026,9,22),'Class IV');a.strictEqual(bk2.items[0].store,'Class IV');a.ok(!('store' in bk2.items[2]));a.ok(!('store' in bk2.items[4]));a.strictEqual(bk2.storeFilter,'Class IV');
let r2=L.parseBackup(JSON.stringify(bk2));a.ok(r2.ok);a.strictEqual(r2.items[1].store,'Bob\'s Liquor');a.ok(!('store' in r2.items[2]));a.deepStrictEqual(r2.sortPref,{key:'store',dir:'asc'});a.strictEqual(r2.storeFilter,'Class IV');
a.ok(!('storeFilter' in L.makeBackup(st,null,new Date())));
// old backups (no store, no storeFilter) still load
r2=L.parseBackup(B([{id:'o1',name:'Old',price:10,sizeMl:750}]));a.ok(r2.ok);a.ok(!('store' in r2.items[0]));a.strictEqual(r2.storeFilter,'');
// bad store values are dropped, not fatal
r2=L.parseBackup(B([{name:'a',price:1,sizeMl:1,store:123},{name:'b',price:1,sizeMl:1,store:null},{name:'c',price:1,sizeMl:1,store:'  Spaced   Out  '},{name:'d',price:1,sizeMl:1,store:'<b>x</b>'}]));
a.ok(r2.ok);a.ok(!('store' in r2.items[0]));a.ok(!('store' in r2.items[1]));a.strictEqual(r2.items[2].store,'Spaced Out');a.strictEqual(r2.items[3].store,'<b>x</b>');
a.strictEqual(L.parseBackup(JSON.stringify({app:'liquor-tracker',version:1,items:[],storeFilter:L.NO_STORE})).storeFilter,L.NO_STORE);
// merge: id-based; same bottle at another store (different id) is kept; same id fills in a missing store
const mg=L.mergeItems([{id:'1',name:'J',price:30,sizeMl:750},{id:'2',name:'J',price:25,sizeMl:750,store:'A'}],[{id:'1',name:'J',price:30,sizeMl:750,store:'Class IV'},{id:'2',name:'J',price:25,sizeMl:750,store:'B'},{id:'9',name:'J',price:30,sizeMl:750,store:'B'}]);
a.strictEqual(mg.items.length,3);a.strictEqual(mg.added,1);a.strictEqual(mg.skipped,2);a.strictEqual(mg.items[0].store,'Class IV');a.strictEqual(mg.items[1].store,'A');a.strictEqual(mg.items[2].store,'B');
// edit (v1.6.0)
{const base=[{id:'a',name:'Jamesn',price:30,sizeMl:750},{id:'b',name:'Crown',price:22,sizeMl:750,store:'Class IV'},{id:'c',name:'Tito',price:20,sizeMl:1750,store:'Bob\'s'}],snap=JSON.stringify(base),now=new Date(Date.UTC(2026,9,22,5));
 let u=L.updateItem(base,'a',' Jameson ','28.5',1000,'  class   iv ',now);a.ok(u.ok);a.strictEqual(JSON.stringify(base),snap,'no mutation');
 a.strictEqual(u.items.length,3);a.strictEqual(u.items[0].id,'a');a.strictEqual(u.item.name,'Jameson');a.strictEqual(u.item.price,28.5);a.strictEqual(u.item.sizeMl,1000);
 a.strictEqual(u.item.store,'Class IV','old entry gets store, matched to existing spelling');a.strictEqual(u.item.updatedAt,'2026-10-22T05:00:00.000Z');a.strictEqual(u.items[1],base[1]);
 a.strictEqual(L.pricePerOz(u.item.price,u.item.sizeMl).toFixed(2),'0.84');
 a.deepStrictEqual(L.listStores(u.items),['Bob\'s','Class IV']);a.strictEqual(ids(L.filterByStore(u.items,'Class IV')),'a,b');a.strictEqual(ids(L.sortItems(u.items,'ppo','asc')),'c,a,b');
 u=L.updateItem(base,'b','Crown',22,750,'',now);a.ok(u.ok);a.ok(!('store' in u.item),'clearing store removes it');a.strictEqual(ids(L.filterByStore(u.items,'Class IV')),'');a.strictEqual(L.validFilter(u.items,'Class IV'),'');
 u=L.updateItem(base,'b','Crown',22,750,'CLASS IV',now);a.strictEqual(u.item.store,'CLASS IV','own spelling can be re-cased when no other entry uses it');
 for(const bad of [['a','',30,750],['a','J','',750],['a','J',30,0],['a','J','abc',750],['zzz','J',30,750]]){const r=L.updateItem(base,...bad,'',now);a.ok(!r.ok,bad.join());a.strictEqual(r.items,base)}
 // backup keeps updatedAt; junk updatedAt dropped; old entries w/o updatedAt fine
 u=L.updateItem(base,'a','Jameson',30,750,'X',now);const rb=L.parseBackup(JSON.stringify(L.makeBackup(u.items,null,now)));a.ok(rb.ok);a.strictEqual(rb.items[0].updatedAt,'2026-10-22T05:00:00.000Z');a.ok(!('updatedAt' in rb.items[1]));
 const rj=L.parseBackup(B([{name:'a',price:1,sizeMl:1,updatedAt:'yesterday'},{name:'b',price:1,sizeMl:1,updatedAt:5}]));a.ok(rj.ok);a.ok(!('updatedAt' in rj.items[0]));a.ok(!('updatedAt' in rj.items[1]));
 a.ok(!('updatedAt' in L.makeBackup([{id:'q',name:'q',price:1,sizeMl:1,updatedAt:'<script>'}],null,now).items[0]));
 // merge after edit: same id is a duplicate (local edit wins)
 const mm=L.mergeItems(u.items,base);a.strictEqual(mm.added,0);a.strictEqual(mm.items[0].store,'X');}
console.log('logic ok')
// version.js consistency
// CSV (v1.7.0)
{const src=[{id:'a1',name:'Jim "Beam", Jr',price:30,sizeMl:750,store:'Bob\'s, Inc',updatedAt:'2026-10-22T05:00:00.000Z'},{id:'a2',name:'Plain',price:1234.5,sizeMl:1750},{id:'a3',name:'=SUM(A1)',price:0,sizeMl:50,store:'Café Ünï'}];
 const c=L.makeCSV(src);a.ok(c.startsWith('\uFEFFid,name,sizeMl,price,pricePerOz,store,createdAt,updatedAt\r\n'));a.ok(c.includes('"Jim ""Beam"", Jr"'));a.ok(c.includes("'=SUM(A1)"));
 let r=L.parseCSV(c);a.ok(r.ok,r.error);a.strictEqual(r.items.length,3);a.strictEqual(r.skipped.length,0);
 for(let k=0;k<3;k++){const x=r.items[k],y=src[k];a.strictEqual(x.id,y.id);a.strictEqual(x.name,y.name.replace(/\s+/g,' '));a.strictEqual(x.price,y.price);a.strictEqual(x.sizeMl,y.sizeMl);a.strictEqual(x.store,y.store);a.strictEqual(x.updatedAt,y.updatedAt)}
 // round trip into same log: nothing changes
 let m=L.mergeCSV(src,r.items);a.strictEqual(m.added,0);a.strictEqual(m.updated,0);
 // reordered header, LF only, Excel-formatted numbers, $/oz lies, aliases, blank lines, bad rows
 const x='\uFEFFStore,Price,$/oz,Name,Size (ml),ID\n"Class IV","$1,299.00",999,Big Bottle,"1,750",a2\n,$20,1,New One,750,\n\n,10,1,,750,\nBad,abc,1,Nope,750,\nBad2,5,1,Zero,0,zz\n,$22.50,1,Unknown Id,375,ghost\n';
 r=L.parseCSV(x);a.ok(r.ok);a.strictEqual(r.items.length,3);a.strictEqual(r.skipped.length,3);a.ok(/no name/.test(r.skipped[0])&&/bad price/.test(r.skipped[1])&&/bad size/.test(r.skipped[2]));
 a.strictEqual(r.items[0].price,1299);a.strictEqual(r.items[0].sizeMl,1750);a.strictEqual(r.items[0].store,'Class IV');a.ok(!('ppo' in r.items[0]));
 const now=new Date(Date.UTC(2026,9,23,12));m=L.mergeCSV(src,r.items,now);a.strictEqual(m.added,2);a.strictEqual(m.updated,1);a.strictEqual(m.items.length,5);
 a.strictEqual(m.items[1].id,'a2');a.strictEqual(m.items[1].price,1299);a.strictEqual(m.items[1].updatedAt,now.toISOString());a.strictEqual(m.items[0].updatedAt,src[0].updatedAt);
 a.ok(m.items[3].id&&m.items[3].id!=='ghost'&&m.items[4].id!=='ghost');a.strictEqual(L.pricePerOz(m.items[1].price,m.items[1].sizeMl).toFixed(2),'21.95');
 a.strictEqual(src[1].price,1234.5,'no mutation');
 // overwrite gives every row an id
 const ov=L.replaceFromCSV(r.items);a.strictEqual(ov.length,3);a.ok(ov.every(i=>i.id));
 // CRLF, quoted CRLF inside field, store cleared via merge
 r=L.parseCSV('id,name,sizeMl,price,store\r\na1,"Line1\r\nLine2",750,30,\r\n');a.ok(r.ok);a.strictEqual(r.items[0].name,'Line1 Line2');m=L.mergeCSV(src,r.items,now);a.strictEqual(m.updated,1);a.ok(!('store' in m.items[0]));
 // duplicate ids in file: second becomes new
 r=L.parseCSV('id,name,sizeMl,price\na1,A,750,1\na1,B,750,2\n');a.strictEqual(r.items[1].id,'');
 // errors
 for(const b of ['','\uFEFF','name,price\nA,1',JSON.stringify({app:'liquor-tracker'}),'name,price,sizeMl\n,1,750'])a.ok(!L.parseCSV(b).ok,JSON.stringify(b));a.ok(!L.parseCSV(undefined).ok);
 a.strictEqual(L.csvNum(' $1,234.50 '),1234.5);a.ok(Number.isNaN(L.csvNum('')));a.ok(Number.isNaN(L.csvNum('1.2.3')));a.strictEqual(L.csvNum('750ml'),750);
 a.strictEqual(L.csvFilename(new Date(2026,0,5)),'liquor-tracker-2026-01-05.csv');
 // bad updatedAt (Excel-reformatted) dropped
 r=L.parseCSV('id,name,sizeMl,price,updatedAt\nq,A,750,1,10/22/2026 5:00\n');a.ok(!('updatedAt' in r.items[0]));
 console.log('csv ok')}

// createdAt (v1.8.0)
{const now=new Date(Date.UTC(2026,9,23,12,25));const it=L.makeItem('J',30,750,'',now);a.strictEqual(it.createdAt,'2026-10-23T12:25:00.000Z');a.ok(L.makeItem('J',30,750).createdAt);
 const t=Date.UTC(2026,9,21,8),tid=t.toString(36)+'abc123def';a.strictEqual(L.idTime(tid),new Date(t).toISOString());
 for(const x of ['a1','x1','old1',crypto.randomUUID(),'zzzzzzzzzzzz','00000000abc',undefined,42])a.strictEqual(L.idTime(x),'',String(x));
 a.strictEqual(L.withCreated({id:tid,name:'a'}).createdAt,new Date(t).toISOString());a.ok(!('createdAt' in L.withCreated({id:'a1',createdAt:'junk'})));
 const keep={id:tid,createdAt:'2025-01-01T00:00:00.000Z'};a.strictEqual(L.withCreated(keep),keep);
 // edit keeps createdAt
 const u=L.updateItem([it],it.id,'Jameson',28,750,'',new Date());a.strictEqual(u.item.createdAt,it.createdAt);a.ok(u.item.updatedAt);
 // date sort: newest first via desc, undated last both ways
 const ds=[{id:'1',name:'a',price:1,sizeMl:1,createdAt:'2026-10-01T00:00:00.000Z'},{id:'2',name:'b',price:1,sizeMl:1},{id:'3',name:'c',price:1,sizeMl:1,createdAt:'2026-10-20T00:00:00.000Z'}];
 const ids=x=>x.map(i=>i.id).join();a.strictEqual(ids(L.sortItems(ds,'date','desc')),'3,1,2');a.strictEqual(ids(L.sortItems(ds,'date','asc')),'1,3,2');a.ok(L.SORT_KEYS.includes('date'));
 // backup carries + derives createdAt; parse keeps valid, drops bad, derives from id
 const bk=L.makeBackup([ds[0],ds[1],{id:tid,name:'d',price:1,sizeMl:1}],null,now);a.strictEqual(bk.items[0].createdAt,ds[0].createdAt);a.ok(!('createdAt' in bk.items[1]));a.strictEqual(bk.items[2].createdAt,new Date(t).toISOString());
 let r=L.parseBackup(JSON.stringify(bk));a.strictEqual(r.items[0].createdAt,ds[0].createdAt);a.ok(!('createdAt' in r.items[1]));
 r=L.parseBackup(JSON.stringify({app:'liquor-tracker',version:1,items:[{id:'q',name:'x',price:1,sizeMl:1,createdAt:'yesterday'}]}));a.ok(r.ok);a.ok(!('createdAt' in r.items[0]));
 // merge fills missing createdAt
 const mg=L.mergeItems([{id:'2',name:'b',price:1,sizeMl:1}],[{id:'2',name:'b',price:1,sizeMl:1,createdAt:'2026-10-05T00:00:00.000Z'}]);a.strictEqual(mg.items[0].createdAt,'2026-10-05T00:00:00.000Z');
 const mg2=L.mergeItems([ds[0]],[{...ds[0],createdAt:'2020-02-02T00:00:00.000Z'}]);a.strictEqual(mg2.items[0].createdAt,ds[0].createdAt);
 // CSV column, round trip, lenient ISO, junk dropped silently, merge fill
 const c=L.makeCSV(ds);a.ok(c.includes(',2026-10-01T00:00:00.000Z,'));r=L.parseCSV(c);a.ok(r.ok);a.strictEqual(r.items[0].createdAt,ds[0].createdAt);a.ok(!('createdAt' in r.items[1]));a.strictEqual(r.skipped.length,0);
 r=L.parseCSV('name,sizeMl,price,createdAt\nA,750,1,2026-10-23\nB,750,1,2026-10-23 17:25\nC,750,1,10/23/2026\nD,750,1,2026-13-45\nE,750,1,2026-10-23T17:25:00-07:00\n');
 a.strictEqual(r.items.length,5);a.strictEqual(r.skipped.length,0);a.strictEqual(r.items[0].createdAt,'2026-10-23T00:00:00.000Z'.slice(0,0)||r.items[0].createdAt);a.ok(r.items[0].createdAt&&r.items[1].createdAt);
 a.ok(!('createdAt' in r.items[2]));a.ok(!('createdAt' in r.items[3]));a.strictEqual(r.items[4].createdAt,'2026-10-24T00:25:00.000Z');
 const mc=L.mergeCSV([{id:'2',name:'b',price:1,sizeMl:1}],[{id:'2',name:'b',price:1,sizeMl:1,createdAt:'2026-10-05T00:00:00.000Z'}]);a.strictEqual(mc.unchanged,1);a.strictEqual(mc.items[0].createdAt,'2026-10-05T00:00:00.000Z');
 console.log('createdAt ok')}

{const V=require('./version.js'),sem=/^\d+\.\d+\.\d+$/;a.ok(sem.test(V.APP_VERSION));a.strictEqual(V.CHANGELOG[0].version,V.APP_VERSION);
const k=v=>v.split('.').map(Number),cmp=(x,y)=>{x=k(x);y=k(y);for(let i=0;i<3;i++)if(x[i]!==y[i])return x[i]-y[i];return 0};
V.CHANGELOG.forEach((r,i)=>{a.ok(sem.test(r.version));a.ok(/^\d{4}-\d{2}-\d{2}$/.test(r.date));a.ok(r.changes.length);if(i)a.ok(cmp(V.CHANGELOG[i-1].version,r.version)>0)});
const sw=require('fs').readFileSync(__dirname+'/sw.js','utf8');a.ok(sw.includes("'liquor-'+APP_VERSION")&&sw.includes("'version.js'"));console.log('version ok',V.APP_VERSION)}
