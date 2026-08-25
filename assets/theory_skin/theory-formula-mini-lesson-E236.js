/* E236 Reader Pro formula modal mini-lesson layout. Layout-only bridge. */
(function(){
  'use strict';
  var RELEASE='E236_FORMULA_MODAL_MINI_LESSON_LAYOUT';
  var STYLE_ID='e236-formula-mini-lesson-style';

  function text(n){return (n&&n.textContent||'').replace(/\s+/g,' ').trim();}

  function classify(section){
    var h=text(section.querySelector('h3')).toLowerCase();
    if(/công thức đầy đủ/.test(h))return {cls:'e236-formula-section',step:'01',label:'Công thức'};
    if(/phân tích/.test(h))return {cls:'e236-analysis-section',step:'02',label:'Phân tích'};
    if(/ứng dụng/.test(h))return {cls:'e236-application-section',step:'03',label:'Ứng dụng'};
    if(/python/.test(h))return {cls:'e236-code-section',step:'04',label:'Python'};
    return null;
  }

  function decorate(modal){
    if(!modal)return;
    modal.classList.add('e236-mini-lesson');
    modal.setAttribute('data-e236-layout','1');
    Array.prototype.slice.call(modal.querySelectorAll('section')).forEach(function(section){
      var info=classify(section);
      if(!info)return;
      section.classList.add('e236-section',info.cls);
      section.setAttribute('data-e236-step',info.step);
      section.setAttribute('data-e236-label',info.label);
    });
  }

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    var css=''
      +'#modal.e211-formula-modal-host .modal-card,'
      +'.e211-formula-fallback-card{width:min(1180px,calc(96vw - 32px))!important;height:min(760px,calc(94vh - 32px))!important}'
      +'.e211-formula-modal.e236-mini-lesson{padding:22px!important;gap:16px!important}'
      +'.e211-formula-modal.e236-mini-lesson header{padding:0 68px 13px 2px!important;position:relative!important}'
      +'.e211-formula-modal.e236-mini-lesson header:after{content:"MINI LESSON";position:absolute;right:4px;bottom:13px;border:1px solid rgba(251,191,36,.32);border-radius:999px;padding:4px 8px;color:#fde68a;background:rgba(120,53,15,.24);font-size:9px;font-weight:900;letter-spacing:.14em}'
      +'.e211-formula-modal.e236-mini-lesson h2{font-size:clamp(23px,2vw,32px)!important;line-height:1.08!important}'
      +'.e211-formula-modal.e236-mini-lesson .e211-formula-context{display:inline-flex!important;align-items:center!important;max-width:100%!important;padding:5px 9px!important;border-radius:999px!important;background:rgba(251,191,36,.08)!important;border:1px solid rgba(251,191,36,.14)!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}'
      +'.e211-formula-modal.e236-mini-lesson .e211-formula-bodygrid{display:grid!important;grid-template-columns:minmax(0,1.65fr) minmax(310px,.82fr)!important;gap:15px!important;min-height:0!important;overflow:hidden!important}'
      +'.e211-formula-modal.e236-mini-lesson .e211-formula-topgrid{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;grid-template-rows:minmax(220px,auto) minmax(0,1fr)!important;gap:14px!important;min-height:0!important;overflow:auto!important;padding:0 4px 2px 0!important}'
      +'.e211-formula-modal.e236-mini-lesson .e211-formula-topgrid>section{margin:0!important}'
      +'.e211-formula-modal.e236-mini-lesson .e236-section{position:relative!important;border-radius:18px!important;padding:16px!important;overflow:auto!important;scrollbar-width:thin!important}'
      +'.e211-formula-modal.e236-mini-lesson .e236-section:before{content:attr(data-e236-step);position:absolute;right:13px;top:11px;color:rgba(253,230,138,.26);font-size:34px;font-weight:950;line-height:1;letter-spacing:-.05em;pointer-events:none}'
      +'.e211-formula-modal.e236-mini-lesson .e236-section>h3{position:relative!important;z-index:1!important;margin:0 42px 13px 0!important;font-size:11px!important;letter-spacing:.13em!important}'
      +'.e211-formula-modal.e236-mini-lesson .e236-formula-section{grid-column:1/-1!important;min-height:220px!important;background:radial-gradient(circle at 14% 0,rgba(245,158,11,.16),transparent 38%),linear-gradient(180deg,rgba(48,29,9,.92),rgba(10,12,18,.94))!important;border-color:rgba(251,191,36,.42)!important;box-shadow:inset 0 1px 0 rgba(255,248,225,.08),0 16px 34px rgba(0,0,0,.18)!important}'
      +'.e211-formula-modal.e236-mini-lesson .e236-analysis-section{background:linear-gradient(180deg,rgba(18,52,58,.72),rgba(10,18,26,.9))!important;border-color:rgba(94,234,212,.24)!important}'
      +'.e211-formula-modal.e236-mini-lesson .e236-analysis-section>h3{color:#99f6e4!important}'
      +'.e211-formula-modal.e236-mini-lesson .e236-application-section{background:linear-gradient(180deg,rgba(28,41,74,.72),rgba(10,16,30,.92))!important;border-color:rgba(147,197,253,.24)!important}'
      +'.e211-formula-modal.e236-mini-lesson .e236-application-section>h3{color:#bfdbfe!important}'
      +'.e211-formula-modal.e236-mini-lesson .e236-code-section,.e211-formula-modal.e236-mini-lesson .e211-formula-code-panel{height:100%!important;min-height:0!important;background:linear-gradient(180deg,rgba(17,24,39,.98),rgba(3,7,18,.98))!important;border-color:rgba(148,163,184,.25)!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.05),0 18px 36px rgba(0,0,0,.22)!important}'
      +'.e211-formula-modal.e236-mini-lesson .e236-code-section>h3{color:#c4b5fd!important}'
      +'.e211-formula-modal.e236-mini-lesson .e236-formula-section .e211-lesson-stack{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr))!important;gap:12px!important}'
      +'.e211-formula-modal.e236-mini-lesson .e236-formula-section .e227-note-box{grid-column:1/-1!important}'
      +'.e211-formula-modal.e236-mini-lesson .e236-analysis-section .e211-lesson-stack,'
      +'.e211-formula-modal.e236-mini-lesson .e236-application-section .e211-lesson-stack{display:grid!important;grid-template-columns:1fr!important;gap:10px!important}'
      +'.e211-formula-modal.e236-mini-lesson .e211-lesson-box{transition:border-color .18s ease,background .18s ease,transform .18s ease!important}'
      +'.e211-formula-modal.e236-mini-lesson .e211-lesson-box:hover{border-color:rgba(251,191,36,.38)!important;background:linear-gradient(180deg,rgba(15,23,42,.74),rgba(31,20,8,.58))!important;transform:translateY(-1px)!important}'
      +'.e211-formula-modal.e236-mini-lesson .e236-formula-section .e226-math{display:flex!important;align-items:center!important;justify-content:flex-start!important;min-height:64px!important;padding:14px 16px!important;font-size:clamp(19px,1.5vw,25px)!important;line-height:1.72!important}'
      +'.e211-formula-modal.e236-mini-lesson .e236-analysis-section p,'
      +'.e211-formula-modal.e236-mini-lesson .e236-application-section p{font-size:14.5px!important;line-height:1.64!important}'
      +'.e211-formula-modal.e236-mini-lesson .e236-code-section pre,'
      +'.e211-formula-modal.e236-mini-lesson .e211-formula-code-panel pre{display:block!important;margin:0!important;padding:15px!important;border:1px solid rgba(148,163,184,.16)!important;border-radius:13px!important;background:rgba(2,6,23,.76)!important;color:#e2e8f0!important;font-family:SFMono-Regular,Consolas,Liberation Mono,monospace!important;font-size:12.7px!important;line-height:1.55!important;tab-size:4!important;white-space:pre!important;overflow:auto!important;min-height:180px!important;box-shadow:inset 0 1px 0 rgba(255,255,255,.035)!important}'
      +'.e211-formula-modal.e236-mini-lesson .e236-code-section pre::selection{background:rgba(139,92,246,.35)!important}'
      +'.e211-formula-modal.e236-mini-lesson .modal-close{width:38px!important;height:38px!important;display:grid!important;place-items:center!important;font-size:20px!important;line-height:1!important}'
      +'@media(max-width:1000px){'
      +'#modal.e211-formula-modal-host .modal-card,.e211-formula-fallback-card{width:min(96vw,calc(100vw - 20px))!important;height:min(94vh,calc(100vh - 20px))!important}'
      +'.e211-formula-modal.e236-mini-lesson .e211-formula-bodygrid{grid-template-columns:1fr!important;grid-template-rows:auto auto!important;overflow:auto!important}'
      +'.e211-formula-modal.e236-mini-lesson .e211-formula-topgrid{overflow:visible!important}'
      +'.e211-formula-modal.e236-mini-lesson .e236-code-section,.e211-formula-modal.e236-mini-lesson .e211-formula-code-panel{height:auto!important;min-height:280px!important}'
      +'}'
      +'@media(max-width:720px){'
      +'.e211-formula-modal.e236-mini-lesson{padding:15px!important;gap:12px!important}'
      +'.e211-formula-modal.e236-mini-lesson header:after{display:none!important}'
      +'.e211-formula-modal.e236-mini-lesson .e211-formula-topgrid{grid-template-columns:1fr!important;grid-template-rows:auto!important}'
      +'.e211-formula-modal.e236-mini-lesson .e236-formula-section{grid-column:auto!important}'
      +'.e211-formula-modal.e236-mini-lesson .e236-section{padding:14px!important}'
      +'.e211-formula-modal.e236-mini-lesson .e236-formula-section .e226-math{font-size:clamp(17px,4.8vw,22px)!important;overflow-x:auto!important}'
      +'}';
    var style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=css;
    document.head.appendChild(style);
  }

  function scan(){
    ensureStyle();
    Array.prototype.slice.call(document.querySelectorAll('.e211-formula-modal')).forEach(decorate);
  }

  function boot(){
    scan();
    try{new MutationObserver(scan).observe(document.body,{childList:true,subtree:true});}catch(_){}
    document.addEventListener('click',function(){setTimeout(scan,0);},true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.BAUMAN_MATH_E236_FORMULA_LAYOUT={release:RELEASE,apply:scan};
})();