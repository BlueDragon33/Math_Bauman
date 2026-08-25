/* E195 · Safe C03 Level C visual enhancer
 * Does NOT override E132/E191 engines.
 * It only decorates the already-working E191 C03 deck with SVG visuals.
 */
(function(){
  'use strict';
  var RELEASE='E195_C03_SAFE_LEVEL_C_VISUAL_ENHANCER';
  var scheduled=false;
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function text(n){return (n&&n.textContent||'').replace(/\s+/g,' ').trim();}
  function norm(s){return String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/§/g,'').replace(/[^a-z0-9.]+/g,' ').trim();}
  function api(){return window.__BAUMAN_CORE_API||{};}
  function state(){try{return api().state||window.__MATH_STATE||{};}catch(_){return window.__MATH_STATE||{};}}
  function injectStyle(){
    if(document.getElementById('e195-c03-visual-style'))return;
    var css='.e195-visual{border:1px solid rgba(125,211,252,.34);border-radius:22px;background:radial-gradient(circle at 20% 10%,rgba(14,165,233,.20),rgba(15,23,42,.78) 48%,rgba(2,6,23,.88));padding:12px;margin:10px 0 14px;box-shadow:0 16px 46px rgba(0,0,0,.24)}.e195-visual-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:8px;color:#bae6fd;font-weight:900;letter-spacing:.035em;font-size:12px}.e195-visual svg{width:100%;height:210px;display:block}.e195-axis{stroke:rgba(226,232,240,.56);stroke-width:1.2}.e195-curve{fill:none;stroke:#7dd3fc;stroke-width:4;stroke-linecap:round}.e195-curve2{fill:none;stroke:#c4b5fd;stroke-width:3;stroke-linecap:round}.e195-tangent{stroke:#facc15;stroke-width:3;stroke-linecap:round}.e195-arrow{stroke:#22c55e;stroke-width:4;stroke-linecap:round;marker-end:url(#e195-arrow)}.e195-red{stroke:#fb7185}.e195-dot{fill:#f8fafc;stroke:#0f172a;stroke-width:2}.e195-label{fill:#e0f2fe;font:700 12px ui-sans-serif,system-ui}.e195-note{fill:#cbd5e1;font:600 11px ui-sans-serif,system-ui}';
    var st=document.createElement('style');st.id='e195-c03-visual-style';st.textContent=css;document.head.appendChild(st);
  }
  function defs(){return '<defs><marker id="e195-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#22c55e"/></marker><marker id="e195-arrow-red" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#fb7185"/></marker></defs>';}
  function axes(){return '<line class="e195-axis" x1="32" y1="178" x2="430" y2="178"/><line class="e195-axis" x1="62" y1="18" x2="62" y2="198"/>';}
  function typeFromKey(key){
    var k=norm(key);
    if(k.indexOf('3.6')>=0||k.indexOf('backprop')>=0)return 'backprop';
    if(k.indexOf('3.5')>=0||k.indexOf('loss')>=0||k.indexOf('ham mat mat')>=0)return 'loss';
    if(k.indexOf('3.4')>=0||k.indexOf('descent')>=0||k.indexOf('learning rate')>=0)return 'descent';
    if(k.indexOf('3.3')>=0||k.indexOf('gradient')>=0)return 'gradient';
    if(k.indexOf('3.2')>=0||k.indexOf('derivative')>=0||k.indexOf('dao ham')>=0)return 'derivative';
    return 'function';
  }
  function currentKey(deck){
    var bits=[];
    ['h1','aside small','.e132-clean-side small','[data-e191-stage]'].forEach(function(sel){Array.prototype.slice.call(deck.querySelectorAll(sel)).forEach(function(n){bits.push(text(n));});});
    var st=state();['e129LessonId','lessonId','currentLessonId','selectedLessonId'].forEach(function(k){if(st&&st[k])bits.push(st[k]);});
    return bits.join(' ');
  }
  function svg(type){var d=defs();
    if(type==='function')return d+'<rect x="34" y="76" width="76" height="52" rx="15" fill="rgba(14,165,233,.18)" stroke="#7dd3fc"/><rect x="180" y="56" width="104" height="92" rx="22" fill="rgba(34,197,94,.14)" stroke="#86efac"/><rect x="354" y="76" width="76" height="52" rx="15" fill="rgba(168,85,247,.16)" stroke="#c4b5fd"/><line class="e195-arrow" x1="112" y1="102" x2="174" y2="102"/><line class="e195-arrow" x1="286" y1="102" x2="348" y2="102"/><text class="e195-label" x="62" y="107">x</text><text class="e195-label" x="220" y="107">f</text><text class="e195-label" x="382" y="107">y</text><path class="e195-curve" d="M70,184 C120,92 172,78 218,118 C270,166 318,54 396,44"/><text class="e195-note" x="300" y="42">y=f(x)</text>';
    if(type==='derivative')return d+axes()+'<path class="e195-curve" d="M54,160 C110,134 156,70 220,108 C274,138 306,90 358,66"/><line class="e195-tangent" x1="138" y1="134" x2="250" y2="82"/><circle class="e195-dot" cx="194" cy="108" r="6"/><text class="e195-label" x="258" y="88">tiếp tuyến f′(x)</text><circle class="e195-dot" cx="130" cy="138" r="4"/><circle class="e195-dot" cx="168" cy="118" r="4"/><text class="e195-note" x="136" y="156">sai phân h</text>';
    if(type==='gradient')return d+'<ellipse cx="230" cy="108" rx="148" ry="72" fill="none" stroke="rgba(125,211,252,.28)" stroke-width="2"/><ellipse cx="230" cy="108" rx="98" ry="46" fill="none" stroke="rgba(125,211,252,.48)" stroke-width="2"/><ellipse cx="230" cy="108" rx="44" ry="20" fill="none" stroke="#7dd3fc" stroke-width="2"/><circle class="e195-dot" cx="270" cy="132" r="6"/><line class="e195-arrow" x1="270" y1="132" x2="342" y2="68"/><line x1="270" y1="132" x2="205" y2="178" stroke="#fb7185" stroke-width="4" marker-end="url(#e195-arrow-red)"/><text class="e195-label" x="348" y="66">∇f</text><text class="e195-label" x="160" y="194">-∇f</text><text class="e195-note" x="164" y="38">contour giữ f không đổi</text>';
    if(type==='descent')return d+'<ellipse cx="238" cy="112" rx="160" ry="76" fill="none" stroke="rgba(125,211,252,.25)" stroke-width="2"/><ellipse cx="238" cy="112" rx="106" ry="50" fill="none" stroke="rgba(125,211,252,.48)" stroke-width="2"/><ellipse cx="238" cy="112" rx="46" ry="22" fill="none" stroke="#7dd3fc" stroke-width="2"/><polyline points="72,180 126,154 170,138 204,124 226,116 240,112" fill="none" stroke="#22c55e" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" marker-end="url(#e195-arrow)"/><circle class="e195-dot" cx="72" cy="180" r="5"/><circle class="e195-dot" cx="240" cy="112" r="5"/><text class="e195-label" x="255" y="110">minimum</text><text class="e195-note" x="76" y="40">η nhỏ: chậm · η lớn: dao động</text>';
    if(type==='loss')return d+axes()+'<path class="e195-curve" d="M54,54 C106,194 270,194 332,54"/><circle class="e195-dot" cx="194" cy="177" r="6"/><text class="e195-label" x="172" y="204">min</text><path class="e195-curve2" d="M78,80 C124,40 166,168 214,94 C264,24 304,164 354,76"/><text class="e195-note" x="250" y="38">nonconvex / saddle</text>';
    return d+'<rect x="35" y="82" width="58" height="48" rx="14" fill="rgba(14,165,233,.15)" stroke="#7dd3fc"/><rect x="124" y="82" width="70" height="48" rx="14" fill="rgba(34,197,94,.14)" stroke="#86efac"/><rect x="225" y="82" width="70" height="48" rx="14" fill="rgba(34,197,94,.14)" stroke="#86efac"/><rect x="336" y="82" width="70" height="48" rx="14" fill="rgba(168,85,247,.15)" stroke="#c4b5fd"/><line class="e195-arrow" x1="95" y1="106" x2="120" y2="106"/><line class="e195-arrow" x1="196" y1="106" x2="221" y2="106"/><line class="e195-arrow" x1="297" y1="106" x2="332" y2="106"/><path d="M370,150 C292,194 170,194 70,150" fill="none" stroke="#fb7185" stroke-width="4" marker-end="url(#e195-arrow-red)"/><text class="e195-label" x="55" y="111">x</text><text class="e195-label" x="140" y="111">layer1</text><text class="e195-label" x="242" y="111">layer2</text><text class="e195-label" x="356" y="111">loss</text><text class="e195-note" x="172" y="205">gradient đi ngược</text>';
  }
  function decorate(){
    scheduled=false;injectStyle();
    var decks=Array.prototype.slice.call(document.querySelectorAll('.e191-c03-deck.open'));
    decks.forEach(function(deck){
      var stage=deck.querySelector('[data-e191-stage]');
      if(!stage)return;
      var key=currentKey(deck), type=typeFromKey(key), sig=type+'|'+text(stage.querySelector('h1'));
      var old=stage.querySelector('.e195-visual');
      if(old&&old.getAttribute('data-e195-sig')===sig)return;
      if(old)old.remove();
      var main=stage.querySelector('.e132-clean-main');
      if(!main)return;
      var h1=main.querySelector('h1');
      var box=document.createElement('div');
      box.className='e195-visual';box.setAttribute('data-e195-sig',sig);
      box.innerHTML='<div class="e195-visual-head"><span>E195 · C03 Level C visual</span><span>'+esc(type)+'</span></div><svg viewBox="0 0 460 220" role="img" aria-label="C03 '+esc(type)+' visual">'+svg(type)+'</svg>';
      if(h1&&h1.nextSibling)main.insertBefore(box,h1.nextSibling);else main.insertBefore(box,main.firstChild);
    });
  }
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(decorate);}
  var mo=new MutationObserver(schedule);
  function boot(){try{mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}catch(_){}decorate();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.BAUMAN_MATH_E195_C03_VISUAL_ENHANCER={release:RELEASE,decorate:decorate,selfCheck:function(){return{release:RELEASE,openDecks:document.querySelectorAll('.e191-c03-deck.open').length,visuals:document.querySelectorAll('.e195-visual').length};}};
})();
