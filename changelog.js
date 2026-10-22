// "What's New" view (#changelog), version label, and one-time update toast. Data lives in version.js.
(function(){
  var css=document.createElement('style');css.textContent=
  '#verLink{display:block;margin:20px auto 0;border:0;background:none;color:var(--sub);font:13px -apple-system,system-ui,sans-serif;cursor:pointer;padding:8px}'+
  '#clView{position:fixed;inset:0;z-index:10;background:var(--bg);overflow-y:auto;-webkit-overflow-scrolling:touch;padding:env(safe-area-inset-top) calc(16px + env(safe-area-inset-right)) calc(32px + env(safe-area-inset-bottom)) calc(16px + env(safe-area-inset-left))}'+
  '#clBack{border:0;background:none;color:var(--blue);font:inherit;padding:12px 0 0;cursor:pointer}'+
  '#clView .rel{padding:12px 16px;border-bottom:.5px solid var(--sep)}#clView .rel:last-child{border-bottom:0}'+
  '#clView .vh{display:flex;align-items:baseline;gap:8px;font-weight:600}#clView .vd{margin-left:auto;font-size:13px;font-weight:400;color:var(--sub)}'+
  '#clView .cur{font-size:11px;font-weight:600;color:#fff;background:var(--blue);border-radius:6px;padding:1px 6px}'+
  '#clView ul{display:block;margin:6px 0 0;padding-left:20px;list-style:disc}#clView li{display:list-item;padding:2px 0;border:0;font-size:15px;color:var(--sub);line-height:1.4}';
  document.head.appendChild(css);
  var esc=function(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  function fmt(d){var p=d.split('-');return ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][+p[1]-1]+' '+(+p[2])+', '+p[0]}
  var l=document.createElement('button');l.id='verLink';l.textContent='v'+APP_VERSION+' · What\'s New';l.onclick=function(){location.hash='changelog'};
  var tst=document.getElementById('toast');document.body.insertBefore(l,tst||null);
  var v=document.createElement('div');v.id='clView';v.hidden=true;
  v.innerHTML='<button id="clBack">‹ Tracker</button><h1>What\'s New</h1><h2>Current version: v'+esc(APP_VERSION)+'</h2><div class="card">'+
    CHANGELOG.map(function(r){return '<div class="rel"><div class="vh">v'+esc(r.version)+(r.version===APP_VERSION?' <span class="cur">CURRENT</span>':'')+'<span class="vd">'+fmt(r.date)+'</span></div><ul>'+
      r.changes.map(function(c){return '<li>'+esc(c)+'</li>'}).join('')+'</ul></div>'}).join('')+'</div>';
  document.body.appendChild(v);
  function show(){var on=location.hash==='#changelog';v.hidden=!on;if(on)v.scrollTop=0}
  document.getElementById('clBack').onclick=function(){history.length>1&&location.hash==='#changelog'?history.back():(location.hash='')};
  window.addEventListener('hashchange',show);show();
  try{
    var K='lastSeenVersion',seen=localStorage.getItem(K),hasData=!!localStorage.getItem('savedLiquors')||!!localStorage.getItem('sortPref');
    if(seen!==APP_VERSION&&(seen||hasData)&&tst){
      tst.innerHTML='Updated to v'+esc(APP_VERSION)+' — <u>see what\'s new</u>';tst.hidden=false;tst.style.cursor='pointer';
      tst.onclick=function(){tst.hidden=true;location.hash='changelog'};setTimeout(function(){tst.hidden=true;tst.onclick=null},6000);
    }
    localStorage.setItem(K,APP_VERSION);
  }catch(e){}
})();
