const ML_TO_OZ=0.033814;
function toOz(ml){return (Number(ml)||0)*ML_TO_OZ}
function pricePerOz(price,ml){const oz=toOz(ml);return oz>0?(Number(price)||0)/oz:0}
function makeId(){return (globalThis.crypto&&crypto.randomUUID)?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)}
function makeItem(name,price,ml){return {id:makeId(),name:String(name).trim(),price:Number(price),sizeMl:Number(ml)}}
function canSave(name,price,ml){return String(name).trim().length>0&&pricePerOz(price,ml)>0}
if(typeof module!=='undefined')module.exports={toOz,pricePerOz,makeItem,canSave,ML_TO_OZ};
