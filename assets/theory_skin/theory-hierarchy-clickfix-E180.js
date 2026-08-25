/* E180 · Direct click fallback for Math learning hierarchy
 * Fixes non-responsive breadcrumb/module path buttons if older E129/E169 handlers miss or swallow the click.
 * Does not change data, reader, or slideshow runtime.
 */
(function(){
  'use strict';
  var RELEASE='E180_DIRECT_PATH_CLICK_FIX';
  function text(n){return (n&&n.textContent||'').replace(/\s+/g,' ').trim();}
  function shortModuleSubtitle(){
    var small=document.querySelector('.e169-module-button small');
    if(!small)return;
    var api=window.BAUMAN_MATH_E175_HIERARCHY;
    var p=api&&api.path?api.path():null;
    var current=text(small);
    var label='Đang chọn: Khối I · Toán học Thuần túy';
    if(p&&p.moduleId==='applied') label='Đang chọn: Khối II · Toán học Ứng dụng';
    if(current!==label) small.textContent=label;
  }
  function normalizeButtons(){
    document.querySelectorAll('.e169-module-button,.e169-breadcrumb button').forEach(function(btn){
      btn.style.pointerEvents='auto';
      btn.style.cursor='pointer';
      btn.style.position=btn.style.position||'relative';
      if(!btn.hasAttribute('type')) btn.setAttribute('type','button');
    });
    var mb=document.querySelector('.e169-module-button');
    if(mb){
      mb.removeAttribute('data-e169-open');
      mb.setAttribute('data-e178-open','module');
    }
  }
  function targetFromEvent(e){
    var t=e.target&&e.target.closest&&e.target.closest('[data-e178-open],.e169-module-button,.e169-breadcrumb button');
    if(!t)return null;
    var level=t.getAttribute('data-e178-open');
    if(!level && t.classList.contains('e169-module-button')) level='module';
    if(!level && t.parentElement && t.parentElement.classList.contains('e169-breadcrumb')){
      var list=Array.prototype.slice.call(t.parentElement.querySelectorAll('button'));
      level=['module','course','chapter','activity','content'][Math.max(0,list.indexOf(t))]||'module';
    }
    return level?{node:t,level:level}:null;
  }
  function openLevel(level){
    var api=window.BAUMAN_MATH_E175_HIERARCHY;
    if(api&&typeof api.open==='function'){
      api.open(level);
      return true;
    }
    return false;
  }
  function handle(e){
    var hit=targetFromEvent(e);
    if(!hit)return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    normalizeButtons();
    shortModuleSubtitle();
    if(!openLevel(hit.level)){
      console.warn('[E180] Learning hierarchy API not ready for level:',hit.level);
    }
  }
  function bindDirect(){
    normalizeButtons();
    shortModuleSubtitle();
    document.querySelectorAll('[data-e178-open],.e169-module-button,.e169-breadcrumb button').forEach(function(btn){
      if(btn.dataset.e180Bound==='1')return;
      btn.dataset.e180Bound='1';
      btn.addEventListener('click',handle,true);
      btn.addEventListener('pointerup',handle,true);
    });
  }
  window.addEventListener('click',handle,true);
  window.addEventListener('pointerup',handle,true);
  var obs=new MutationObserver(function(){setTimeout(bindDirect,0);});
  function boot(){
    try{obs.observe(document.body,{childList:true,subtree:true,attributes:true});}catch(_){ }
    bindDirect();
    setInterval(function(){shortModuleSubtitle();normalizeButtons();},1200);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.BAUMAN_MATH_E180_CLICK_FIX={release:RELEASE,bind:bindDirect,selfCheck:function(){return{release:RELEASE,moduleButton:!!document.querySelector('.e169-module-button'),crumbButtons:document.querySelectorAll('.e169-breadcrumb button').length,apiReady:!!(window.BAUMAN_MATH_E175_HIERARCHY&&window.BAUMAN_MATH_E175_HIERARCHY.open)};}};
})();
