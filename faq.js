// FAQ content: append new {q, a} entries to this array. Answers may contain simple HTML.
var FAQ = [
 {q:"How do I install it on my iPhone?", a:"Open <b>ttt-shawn.github.io/liquor-tracker</b> in <b>Safari</b> (it has to be Safari), tap the Share button (square with the arrow), then <b>Add to Home Screen</b>. You get a bottle icon that opens full-screen like a real app. No App Store, no password, no judgment."},
 {q:"How is cost per ounce calculated?", a:"Bottles are sold in milliliters, so the app converts: <b>1 ml = 0.033814 fl oz</b>. Then it's just <b>price ÷ ounces</b>.<br>Example: $30 for a 750 ml bottle → 750 × 0.033814 = 25.36 oz → $30 ÷ 25.36 = <b>$1.18/oz</b>."},
 {q:"What do the bottle size names mean?", a:"<b>Nip</b> = 50 ml (airplane bottle)<br><b>Half</b> = 375 ml (half a fifth, a.k.a. a pint-ish)<br><b>Fifth</b> = 750 ml<br><b>Quart / Liter</b> = 1 L (technically a liter, a hair more than a US quart)<br><b>Handle</b> = 1.75 L (it has a handle, because you'll need one)"},
 {q:"Why is it called a \"fifth\"?", a:"Before the US went metric on liquor in 1979–80, the standard bottle was a <b>fifth of a US gallon</b> (about 757 ml). It became 750 ml, but the nickname stuck around like that one guy at closing time."},
 {q:"How do I use a custom size?", a:"In <b>Size Preset</b>, choose <b>Custom (ml)</b> and type the volume in milliliters. Got a weird 200 ml or 1.5 L bottle? Covered. If the label is in liters, multiply by 1000 (1.5 L = 1500 ml)."},
 {q:"How does sorting work?", a:"Tap <b>Name</b>, <b>Size</b>, or <b>$/oz</b> above the Saved Price Log. Tap the same button again to flip the order (the little arrow shows which way). It starts cheapest-per-ounce first and remembers your choice next time you open it."},
 {q:"How do I track which store had which price?", a:"When you log a bottle, fill in the optional <b>Store</b> box (Class IV, the corner liquor store, wherever). After the first time, stores you've used pop up as suggestions, so no retyping. The Store box stays filled after you save, so you can rattle off a whole shelf at one place. Each entry in the log shows its store in blue.<br>To compare, sort by <b>$/oz</b> to see who's cheapest, or use the <b>Store</b> filter above the log to see just one store. Sorting by <b>Store</b> groups entries by store, cheapest per ounce first. The same bottle at two stores counts as two entries, which is the whole point. Capitalization doesn't split stores: \"class iv\" files under \"Class IV\" if that's how you typed it first."},
 {q:"How do I delete an entry?", a:"Tap the red <b>✕</b> next to it in the Saved Price Log. It's gone immediately, so aim carefully."},
 {q:"Where is my data stored?", a:"Only on <b>this phone</b>, in Safari's storage for this app. Nothing is sent to any server, to Shawn, or to the bot. The flip side: it doesn't sync to other devices and there's no account or cloud backup."},
 {q:"Will I lose my log?", a:"Your log lives only on this phone, so it's gone if you <b>delete the Home Screen app</b> or <b>clear Safari's website data</b>. That's what <b>Back Up to File</b> is for (bottom of the main screen). Make a backup now and then and you're covered."},
 {q:"How do I back up my log?", a:"Scroll to the bottom of the main screen and tap <b>Back Up to File</b>. On iPhone a share sheet pops up: pick <b>Save to Files</b> (iCloud Drive is a good spot), AirDrop it, or email it to yourself. It's a small <code>.json</code> file named with today's date."},
 {q:"How do I restore a backup?", a:"Tap <b>Restore from File</b> at the bottom of the main screen and pick your backup from Files/iCloud Drive. Then choose <b>Merge</b> (adds the backup to what's already here, skipping duplicates) or <b>Replace</b> (wipes the current log and uses the backup instead)."},
 {q:"Does it work offline?", a:"Yes. After it loads once, it works with no signal, perfect for the back corner of the liquor store where reception goes to die."},
 {q:"How do I get updates?", a:"Automatically. Updates download in the background when you open the app. If a new feature isn't showing, close the app completely (swipe it away) and reopen it, maybe twice."},
 {q:"What version am I on / what changed?", a:"Scroll to the very bottom of the main screen: the small version label (like <b>v1.3.1</b>) shows your version. Tap it to open <b>What's New</b>, the full change log. Versions go <b>MAJOR.MINOR.PATCH</b>: big overhauls bump the first number, new features the middle, fixes and tweaks the last. After an update you'll also get a one-time \"see what's new\" pop-up."},
 {q:"Does it account for tax or bottle deposits?", a:"No. It uses whatever price you type. For fair comparisons, be consistent: either always include tax and deposit, or never do."},
 {q:"How do I suggest a feature or report a bug?", a:"Email <a href=\"mailto:spackbot+liquorbot@mail.grokbot.com?subject=Liquor%20Tracker%20idea\">spackbot+liquorbot@mail.grokbot.com</a>. Ideas, bugs, and insults all welcome. Some of these answers came from questions sent there."},
 {q:"Does a bot read my emails and make the changes, or does Shawn do it by hand?", a:"A bit of both. A bot reads your emails and summarizes them, <b>Shawn decides</b> what gets built, and then the bot writes the code. Robot labor, human management. The way nature intended."},
 {q:"Will this make my liquor cheaper?", a:"Sadly, no. It'll just make you <i>smug</i> about how cheap it was. It may also reveal that the handle was the better deal all along. It usually is."},
 {q:"Is this app affiliated with any store or brand?", a:"Nope. No ads, no sponsors, no tracking. Just math."}
];
(function(){
  var css=document.createElement('style');css.textContent=
  '#faqBtn{position:absolute;top:calc(env(safe-area-inset-top) + 22px);right:calc(16px + env(safe-area-inset-right));width:30px;height:30px;border-radius:50%;border:0;background:var(--blue);color:#fff;font:700 17px -apple-system,system-ui,sans-serif;cursor:pointer}'+
  'h1{padding-right:40px}#faqView{position:fixed;inset:0;z-index:10;background:var(--bg);overflow-y:auto;-webkit-overflow-scrolling:touch;padding:env(safe-area-inset-top) calc(16px + env(safe-area-inset-right)) calc(32px + env(safe-area-inset-bottom)) calc(16px + env(safe-area-inset-left))}'+
  '#faqBack{border:0;background:none;color:var(--blue);font:inherit;padding:12px 0 0;cursor:pointer}'+
  '#faqView details{border-bottom:.5px solid var(--sep)}#faqView details:last-child{border-bottom:0}'+
  '#faqView summary{list-style:none;display:flex;align-items:center;gap:8px;min-height:44px;padding:10px 16px;cursor:pointer;font-weight:500}#faqView summary::-webkit-details-marker{display:none}'+
  '#faqView summary:after{content:"\\203A";margin-left:auto;color:var(--sub);font-size:22px;transition:transform .2s}#faqView details[open] summary:after{transform:rotate(90deg)}'+
  '#faqView .ans{padding:0 16px 14px;color:var(--sub);font-size:15px;line-height:1.45}#faqView .ans b{color:var(--tx)}#faqView a{color:var(--blue)}'+
  '.resp{text-align:center;color:var(--sub);font-size:13px;margin:22px 12px}';
  document.head.appendChild(css);
  var esc=function(s){return s.replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})};
  var b=document.createElement('button');b.id='faqBtn';b.textContent='?';b.setAttribute('aria-label','FAQ');document.body.appendChild(b);
  var v=document.createElement('div');v.id='faqView';v.hidden=true;
  v.innerHTML='<button id="faqBack">‹ Tracker</button><h1>FAQ</h1><div class="card">'+
    FAQ.map(function(f){return '<details><summary>'+esc(f.q)+'</summary><div class="ans">'+f.a+'</div></details>'}).join('')+
    '</div><p class="resp">🥃 Please drink responsibly. Know your limit, and never drink and drive.<br>Cheap per ounce is not a challenge.</p>';
  document.body.appendChild(v);
  function show(){var on=location.hash==='#faq';v.hidden=!on;if(on)v.scrollTop=0}
  b.onclick=function(){location.hash='faq'};
  document.getElementById('faqBack').onclick=function(){history.length>1&&location.hash==='#faq'?history.back():(location.hash='')};
  window.addEventListener('hashchange',show);show();
})();
