/* E213 Reader Pro balance guard · prevent oversized hero from hiding content. */
(function(){
  'use strict';
  var RELEASE='E213_READER_PRO_BALANCE_GUARD';
  function text(n){return (n&&n.textContent||'').replace(/\s+/g,' ').trim();}
  function isReaderPro(){
    var d=document.querySelector('.e132-overlay-deck.open');
    if(!d)return false;
    var m=text(d.querySelector('[data-e202-mode], .e132-clean-role'));
    return /Reader Pro/i.test(m);
  }
  function ensureStyle(){
    if(document.getElementById('e213-reader-balance-style'))return;
    var css = [
      '.e132-overlay-deck.open.e211-reader-pro{--readerHeroRatio:58%;--readerCardMin:196px}',
      '.e132-overlay-deck.open.e211-reader-pro .e132-clean-slide{height:min(724px,calc(100vh - 88px))!important;overflow:hidden!important;padding:10px!important;grid-template-columns:86px minmax(0,1fr)!important;gap:10px!important}',
      '.e132-overlay-deck.open.e211-reader-pro .e132-clean-side{padding:9px!important;overflow:hidden!important}',
      '.e132-overlay-deck.open.e211-reader-pro .e132-clean-side strong{font-size:clamp(30px,3.2vw,42px)!important}',
      '.e132-overlay-deck.open.e211-reader-pro .e132-clean-side small{display:-webkit-box!important;-webkit-line-clamp:4!important;-webkit-box-orient:vertical!important;overflow:hidden!important}',
      '.e132-overlay-deck.open.e211-reader-pro .e132-clean-main{height:100%!important;min-height:0!important;overflow:hidden!important;display:grid!important;grid-template-rows:minmax(0,var(--readerHeroRatio)) minmax(var(--readerCardMin),1fr)!important;gap:10px!important}',
      '.e132-overlay-deck.open.e211-reader-pro .e202-hero{height:100%!important;min-height:0!important;max-height:none!important;overflow:hidden!important;grid-template-columns:minmax(0,1.55fr) minmax(300px,.9fr)!important;gap:12px!important}',
      '.e132-overlay-deck.open.e211-reader-pro .e202-hero-copy{min-height:0!important;overflow:auto!important;justify-content:flex-start!important;padding:4px 4px 2px!important;scrollbar-width:thin}',
      '.e132-overlay-deck.open.e211-reader-pro .e132-clean-main h1{font-size:clamp(28px,2.45vw,40px)!important;line-height:1.05!important;letter-spacing:-.03em!important;margin:0!important;display:-webkit-box!important;-webkit-line-clamp:2!important;-webkit-box-orient:vertical!important;overflow:hidden!important}',
      '.e132-overlay-deck.open.e211-reader-pro .e202-source-line,.e132-overlay-deck.open.e211-reader-pro .e210-source-line{font-size:12px!important;line-height:1.25!important;margin:2px 0 0!important;color:#9ed9ff!important}',
      '.e132-overlay-deck.open.e211-reader-pro .e202-insight{font-size:clamp(14px,1.02vw,17px)!important;line-height:1.45!important;max-height:116px!important;overflow:auto!important;margin:4px 0 0!important;padding-right:4px!important;scrollbar-width:thin}',
      '.e132-overlay-deck.open.e211-reader-pro .e202-formula-strip{max-width:100%!important;padding:7px 9px!important;margin-top:2px!important}',
      '.e132-overlay-deck.open.e211-reader-pro .e202-formula-strip code{font-size:clamp(12px,.86vw,14px)!important;line-height:1.28!important;-webkit-line-clamp:3!important}',
      '.e132-overlay-deck.open.e211-reader-pro .e202-visual{height:100%!important;min-height:0!important;max-height:100%!important;overflow:hidden!important;padding:10px!important}',
      '.e132-overlay-deck.open.e211-reader-pro .e211-summary-panel{height:100%!important;max-height:100%!important;overflow:auto!important;padding:12px!important;scrollbar-width:thin}',
      '.e132-overlay-deck.open.e211-reader-pro .e211-summary-panel h3{font-size:clamp(15px,1.05vw,18px)!important;line-height:1.18!important;margin:0 0 6px!important}',
      '.e132-overlay-deck.open.e211-reader-pro .e211-summary-panel .e211-slide-name{font-size:12px!important;line-height:1.25!important;margin:0 0 7px!important}',
      '.e132-overlay-deck.open.e211-reader-pro .e211-summary-list{font-size:clamp(12px,.84vw,14px)!important;line-height:1.36!important;margin:0!important;padding-left:17px!important}',
      '.e132-overlay-deck.open.e211-reader-pro .e211-summary-list li{margin:5px 0!important}',
      '.e132-overlay-deck.open.e211-reader-pro .e211-keyline{font-size:11.5px!important;line-height:1.25!important;margin-top:8px!important;padding-top:7px!important}',
      '.e132-overlay-deck.open.e211-reader-pro .e202-note{font-size:11.5px!important;line-height:1.25!important;margin-top:2px!important}',
      '.e132-overlay-deck.open.e211-reader-pro .e132-clean-grid.e202-card-grid{height:100%!important;min-height:0!important;max-height:none!important;overflow:hidden!important;display:grid!important;grid-template-columns:1.1fr 1fr .95fr!important;gap:10px!important;grid-auto-rows:1fr!important}',
      '.e132-overlay-deck.open.e211-reader-pro .e132-clean-card{min-height:0!important;height:100%!important;overflow:auto!important;padding:11px 13px!important;scrollbar-width:thin}',
      '.e132-overlay-deck.open.e211-reader-pro .e132-clean-card h3{font-size:clamp(16px,1.08vw,20px)!important;line-height:1.16!important;margin:0!important}',
      '.e132-overlay-deck.open.e211-reader-pro .e132-clean-card p.e132-full-body{font-size:clamp(12.5px,.86vw,15px)!important;line-height:1.36!important;margin:0!important}',
      '.e132-overlay-deck.open.e211-reader-pro .e132-card-kicker{font-size:10.5px!important;padding:4px 7px!important;margin-bottom:5px!important}',
      '@media(max-height:760px){.e132-overlay-deck.open.e211-reader-pro{--readerHeroRatio:55%;--readerCardMin:178px}.e132-overlay-deck.open.e211-reader-pro .e132-clean-main h1{font-size:clamp(24px,2.1vw,34px)!important}.e132-overlay-deck.open.e211-reader-pro .e202-insight{max-height:86px!important}.e132-overlay-deck.open.e211-reader-pro .e211-summary-list{font-size:12px!important;line-height:1.28!important}}',
      '@media(max-width:1100px){.e132-overlay-deck.open.e211-reader-pro .e202-hero{grid-template-columns:1fr!important}.e132-overlay-deck.open.e211-reader-pro .e202-visual{display:none!important}.e132-overlay-deck.open.e211-reader-pro .e132-clean-grid.e202-card-grid{grid-template-columns:1fr!important;overflow:auto!important}}'
    ].join('\n');
    var st=document.createElement('style');
    st.id='e213-reader-balance-style';
    st.textContent=css;
    document.head.appendChild(st);
  }
  function apply(){
    var d=document.querySelector('.e132-overlay-deck.open');
    if(!d)return;
    if(!isReaderPro()){d.classList.remove('e213-reader-balance');return;}
    ensureStyle();
    d.classList.add('e213-reader-balance');
  }
  var scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;apply();});}
  function boot(){
    apply();
    try{new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}catch(_){}
    document.addEventListener('click',function(){setTimeout(schedule,0);},true);
    document.addEventListener('keydown',function(){setTimeout(schedule,0);},true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.BAUMAN_MATH_E213_READER_BALANCE={release:RELEASE,apply:apply,selfCheck:function(){return {ok:true,release:RELEASE,readerPro:isReaderPro(),active:!!document.querySelector('.e132-overlay-deck.open.e213-reader-balance')};}};
})();
