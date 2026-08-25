/* E183 · Clean duplicate lesson labels
 * Removes leftovers such as `Bài Bài 1.2` or leading broken `ài ...` created by old pseudo-title hacks.
 */
(function(){
  'use strict';
  var RELEASE='E183_CLEAN_DUPLICATE_LESSON_LABELS';
  function clean(s){
    return String(s||'')
      .replace(/^\s*§\s*/,'Bài ')
      .replace(/\b§(?=\d)/g,'Bài ')
      .replace(/^\s*ài\s+Bài\s+/,'Bài ')
      .replace(/^\s*Bài\s+Bài\s+/,'Bài ')
      .replace(/Lý thuyết\s*·\s*Bài\s+Bài\s+/,'Lý thuyết · Bài ')
      .replace(/\s{2,}/g,' ')
      .trim();
  }
  function patch(){
    document.querySelectorAll('.e169-reader-title h2,.e169-breadcrumb button,.e169-choice b,.e129-slide h3').forEach(function(n){
      var before=n.textContent||'', after=clean(before);
      if(after&&after!==before)n.textContent=after;
    });
    document.documentElement.setAttribute('data-e183-title-clean','1');
  }
  var scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;patch();});}
  var obs=new MutationObserver(schedule);
  function boot(){try{obs.observe(document.body,{childList:true,subtree:true,characterData:true});}catch(_){ }patch();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.BAUMAN_MATH_E183_TITLE_CLEAN={release:RELEASE,patch:patch,selfCheck:function(){return{release:RELEASE,enabled:true};}};
})();
