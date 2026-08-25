/* E133 · Slideshow Support */
(function(){
  'use strict';
  var RELEASE='E133_SLIDESHOW_SUPPORT';
  var lastKey='';
  var lastAt='';
  function q(s){return document.querySelector(s);}
  function qa(s){return Array.prototype.slice.call(document.querySelectorAll(s));}
  function opened(){return document.body.classList.contains('e132-overlay-open')&&!!q('.e132-overlay-deck.open');}
  function press(sel){var b=q(sel); if(b){b.click(); return true;} return false;}
  function handle(e){
    if(!opened()) return;
    var keys=['ArrowRight','PageDown',' ','Enter','ArrowLeft','PageUp','Escape','Home','End'];
    if(keys.indexOf(e.key)<0) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    lastKey=e.key;
    lastAt=new Date().toISOString();
    if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' '||e.key==='Enter') press('[data-e132-next]');
    if(e.key==='ArrowLeft'||e.key==='PageUp') press('[data-e132-prev]');
    if(e.key==='Escape') press('[data-e132-exit]');
    if(e.key==='Home'){for(var i=0;i<80;i++) press('[data-e132-prev]');}
    if(e.key==='End'){for(var j=0;j<80;j++) press('[data-e132-next]');}
  }
  window.addEventListener('keydown',handle,true);
  document.addEventListener('keydown',handle,true);
  function snapshot(){
    var base={};
    try{base=window.BAUMAN_MATH_THEORY_E132&&window.BAUMAN_MATH_THEORY_E132.selfCheck?window.BAUMAN_MATH_THEORY_E132.selfCheck():{};}catch(_){base={};}
    base.supportRelease=RELEASE;
    base.supportActive=true;
    base.supportOpen=opened();
    base.lastSupportKey=lastKey;
    base.lastSupportAt=lastAt;
    base.visibleCards=qa('.e132-overlay-deck.open .e132-clean-card').length;
    base.visibleTitle=(q('.e132-overlay-deck.open .e132-clean-main h1')||{}).textContent||'';
    return base;
  }
  window.BAUMAN_MATH_THEORY_E133_SUPPORT={release:RELEASE,snapshot:snapshot,selfCheck:snapshot};
})();
