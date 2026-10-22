const a=require('assert'),L=require('./logic.js');
a.strictEqual(L.toOz(750).toFixed(2),'25.36');a.strictEqual(L.pricePerOz(30,750).toFixed(2),'1.18');
a.strictEqual(L.pricePerOz(30,0),0);a.ok(!L.canSave('',30,750));a.ok(!L.canSave('J','',750));a.ok(L.canSave('J','30',750));
const i=L.makeItem(' Jameson ','29.99',1750);a.strictEqual(i.name,'Jameson');a.ok(i.id);console.log('logic ok')
