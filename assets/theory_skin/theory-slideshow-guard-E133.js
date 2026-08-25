/* E133 · Slideshow Guard
 * Small runtime guard loaded after the E132/E133 deck.
 * Purpose: keep keyboard navigation inside the overlay and expose diagnostics.
 */
(function(){
  'use strict';
  var RELEASE='E133_SLIDESHOW_KEYBOARD_GUARD';
  var lastKey='';
  var lastAt='';
  function q(s){return document.querySelector(s);}
  function qa(s){return Array.prototype.slice.call(document.querySelectorAll(s));}
  function open(){return document.body.classList.contains('e132-overlay-open')&&!!q('.e132-overlay-deck.open');}
  function click(sel){var b=q(sel); if(b){b.click(); return true;} return false;}
  function capture(e){
    if(!open()) return;
    var keys=['ArrowRight','PageDown',' ','Enter','ArrowLeft','PageUp','Escape','Home','End'];
    if(keys.indexOf(e.key)<0) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    lastKey=e.key;
    lastAt=new Date().toISOString();
    if(e.key==='ArrowRight'||e.key==='PageDown'||e.key===' '||e.key==='Enter') click('[data-e132-next]');
    if(e.key==='ArrowLeft'||e.key==='PageUp') click('[data-e132-prev]');
    if(e.key==='Escape') click('[data-e132-exit]');
    if(e.key==='Home') qa('[data-e132-prev]').forEach(function(b){for(var i=0;i<80;i++) b.click();});
    if(e.key==='End') qa('[data-e132-next]').forEach(function(b){for(var i=0;i<80;i++) b.click();});
  }
  window.addEventListener('keydown',capture,true);
  document.addEventListener('keydown',capture,true);
  function snapshot(){
    var base={};
    try{base=window.BAUMAN_MATH_THEORY_E132&&window.BAUMAN_MATH_THEORY_E132.selfCheck?window.BAUMAN_MATH_THEORY_E132.selfCheck():{};}catch(_){base={};}
    return Object.assign({},base,{guardRelease:RELEASE,guardActive:true,overlayGuardOpen:open(),lastGuardKey:lastKey,lastGuardAt:lastAt,deckNode:!!q('.e132-overlay-deck'),deckOpenNode:!!q('.e132-overlay-deck.open'),visibleCards:qa('.e132-overlay-deck.open .e132-clean-card').length,visibleTitle:(q('.e132-overlay-deck.open .e132-clean-main h1')||{}).textContent||''});
  }
  window.BAUMAN_MATH_THEORY_E133_GUARD={release:RELEASE,snapshot:snapshot,selfCheck:snapshot};
})();
