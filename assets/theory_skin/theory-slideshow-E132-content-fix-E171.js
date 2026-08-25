/* E171 · E132 C01 compact deck content micro-fix
 * Non-invasive runtime text cleanup loaded after E132.
 * Keeps E129 Reader and E132 slideshow engine untouched.
 */
(function(){
  'use strict';
  var RELEASE='E171_E132_C01_CONTENT_MICROFIX';
  var REPLACEMENTS=[
    {
      from:'x_i=(x_i-min_i)/(max_i-min_i)',
      to:'x_i^{scaled} = (x_i - min_i)/(max_i - min_i)'
    },
    {
      from:'Chuẩn bị cho §1.6: cần biết trong subspace có bao nhiêu hướng độc lập.',
      to:'Chuẩn bị cho §1.6: nhiều vector trong hoặc gần subspace sẽ được xếp thành ma trận dữ liệu để đọc rank, hàng, cột và hướng thông tin.'
    },
    {
      from:'Subspace này có dimension bao nhiêu và sinh bởi vector nào?',
      to:'Khi xếp nhiều điểm gần subspace thành ma trận X, rank và row/column space sẽ kể chuyện gì?'
    }
  ];
  function patchTextNode(node){
    var before=node.nodeValue || '';
    var after=before;
    REPLACEMENTS.forEach(function(r){ after=after.split(r.from).join(r.to); });
    if(after!==before) node.nodeValue=after;
  }
  function walk(node){
    if(!node) return;
    if(node.nodeType===3){ patchTextNode(node); return; }
    if(node.nodeType!==1) return;
    var tag=(node.tagName||'').toLowerCase();
    if(tag==='script' || tag==='style' || tag==='textarea') return;
    Array.prototype.slice.call(node.childNodes||[]).forEach(walk);
  }
  function patch(){
    ['.e132-overlay-deck','.e132-clean-stage','.e132-clean-slide','.e132-formula-rail'].forEach(function(sel){
      Array.prototype.slice.call(document.querySelectorAll(sel)).forEach(walk);
    });
    document.documentElement.setAttribute('data-e171-e132-content-fix',RELEASE);
  }
  var scheduled=false;
  function schedule(){
    if(scheduled) return;
    scheduled=true;
    requestAnimationFrame(function(){ scheduled=false; patch(); });
  }
  var obs=new MutationObserver(schedule);
  function boot(){
    try{ obs.observe(document.body,{childList:true,subtree:true,characterData:true}); }catch(_){ }
    patch();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
  window.BAUMAN_MATH_E171_E132_CONTENT_FIX={release:RELEASE,patch:patch,replacements:REPLACEMENTS.length};
})();
