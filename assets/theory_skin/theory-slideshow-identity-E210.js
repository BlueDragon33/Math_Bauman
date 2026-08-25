/* E210 canonical lesson identity label for the active slideshow only. */
(function(){
  'use strict';
  var RELEASE='E210_CANONICAL_LESSON_IDENTITY_LABEL';
  var last='';

  function text(n){return (n&&n.textContent||'').replace(/\s+/g,' ').trim();}
  function clean(s){
    s=String(s||'').replace(/\s+/g,' ').trim();
    s=s.replace(/^(Reader Pro|C0\d Level C|Stable renderer|Slide|Bài đang mở|Trình chiếu|Đang trình chiếu)\s*[:·-]?\s*/i,'');
    s=s.replace(/\b(Reader source|Mode|Stable Math Deck)\b/gi,'').replace(/\s+/g,' ').trim();
    return s||'Bài đang mở';
  }
  function state(){try{return (window.__BAUMAN_CORE_API&&window.__BAUMAN_CORE_API.state)||window.__MATH_STATE||{};}catch(_){return window.__MATH_STATE||{};}}
  function attr(n){
    if(!n)return'';
    var a=[text(n)];
    ['data-lesson-id','data-id','data-key','data-title','data-current-lesson','aria-label','title'].forEach(function(k){var v=n.getAttribute&&n.getAttribute(k);if(v)a.push(v);});
    return a.join(' ');
  }
  function activeShell(){return document.querySelector('.e129-theory-shell.presenting')||document.querySelector('.e129-theory-shell');}
  function registry(){return window.BAUMAN_MATH_THEORY_ARTIFACT_REGISTRY_E244||null;}
  function contentPayload(){
    try{
      var bridge=window.BAUMAN_MATH_E240_THEORY_CONTENT_SOURCE;
      if(bridge&&typeof bridge.getPayload==='function')return bridge.getPayload();
      return window.DB&&window.DB.theory_lecture_content||null;
    }catch(_){return null;}
  }
  function recordById(id){
    var payload=contentPayload(), records=payload&&Array.isArray(payload.records)?payload.records:[];
    return records.find(function(r){return r&&r.lessonId===id;})||null;
  }
  function canonicalById(id){
    id=String(id||'').trim();
    if(!id)return null;
    var reg=registry(), entry=reg&&typeof reg.get==='function'?reg.get(id):null;
    if(entry)return {lessonId:entry.lessonId,lessonTitle:entry.lessonTitle,source:'E244'};
    var record=recordById(id);
    if(record)return {lessonId:record.lessonId,lessonTitle:record.lessonTitle||record.title||record.lessonId,source:'E240'};
    return null;
  }
  function identity(){
    var s=state(), deck=document.querySelector('.e132-overlay-deck.open'), shell=activeShell(), ids=[], titles=[];
    if(deck){
      ['data-e243-lesson-id','data-e210-active-lesson-id','data-lesson-id'].forEach(function(k){var v=deck.getAttribute(k);if(v)ids.push(v);});
      var chip=deck.querySelector('[data-e210-lesson-id]');if(chip){var chipId=chip.getAttribute('data-e210-lesson-id');if(chipId&&chipId!=='1')ids.push(chipId);}
    }
    ['e129LessonId','theoryLessonId','currentLessonId','selectedLessonId','activeLessonId','lessonId'].forEach(function(k){if(s&&s[k])ids.push(s[k]);});
    if(s&&s.e169Path&&s.e169Path.lessonId)ids.push(s.e169Path.lessonId);
    if(shell){
      var current=shell.querySelector('[data-current-lesson]');if(current){var visible=current.getAttribute('data-current-lesson');if(visible)ids.unshift(visible);}
    }
    for(var i=0;i<ids.length;i++){var hit=canonicalById(ids[i]);if(hit)return hit;}

    ['lessonTitle','currentLessonTitle','selectedTheoryTitle'].forEach(function(k){if(s&&s[k])titles.push(s[k]);});
    if(shell){
      ['.e129-lesson-title','.e129-reader-title','[data-e129-current-title]','.e129-chip-btn.active','.e129-chip-btn[aria-pressed="true"]','.e129-slide-chip.active'].forEach(function(sel){Array.prototype.slice.call(shell.querySelectorAll(sel)).forEach(function(n){titles.push(attr(n));});});
    }
    if(deck){
      var lockedTitle=deck.getAttribute('data-e243-lesson-title');if(lockedTitle)titles.unshift(lockedTitle);
      var h=deck.querySelector('.e132-clean-main h1');if(h)titles.push(text(h));
    }
    var reg=registry();
    if(reg&&typeof reg.resolve==='function'){
      var entry=reg.resolve(titles);
      if(entry)return {lessonId:entry.lessonId,lessonTitle:entry.lessonTitle,source:'E244-title'};
    }
    for(var j=0;j<titles.length;j++){
      var title=clean(titles[j]);
      if(title&&title.length>5&&!/^(Reader Pro|Bài đang mở)$/i.test(title))return {lessonId:'',lessonTitle:title,source:'fallback-title'};
    }
    return {lessonId:'',lessonTitle:'Bài đang mở',source:'fallback'};
  }
  function ensureStyle(){
    if(document.getElementById('e210-lesson-identity-style'))return;
    var css='.e210-lesson-id{display:inline-flex;align-items:center;max-width:640px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border:1px solid rgba(125,211,252,.28);background:rgba(14,165,233,.10);color:#dff6ff;border-radius:999px;padding:5px 10px;font-size:12px;font-weight:900;letter-spacing:.02em}.e210-source-line{margin-top:4px;color:#9fc6e8;font-size:12px;font-weight:850;letter-spacing:.02em}.e210-check-line{margin-top:8px;border-top:1px solid rgba(125,211,252,.16);padding-top:8px;color:#bae6fd;font-size:12px;font-weight:800}';
    var st=document.createElement('style');st.id='e210-lesson-identity-style';st.textContent=css;document.head.appendChild(st);
  }
  function apply(){
    var deck=document.querySelector('.e132-overlay-deck.open');
    if(!deck)return false;
    ensureStyle();
    var id=identity(),title=id.lessonTitle||'Bài đang mở';
    var sig=(id.lessonId||title)+'|'+text(deck.querySelector('[data-e202-count]'))+'|'+text(deck.querySelector('[data-e202-mode]'));
    if(sig===last)return true;
    last=sig;
    if(id.lessonId){deck.setAttribute('data-e210-active-lesson-id',id.lessonId);deck.setAttribute('data-lesson-id',id.lessonId);}
    deck.setAttribute('data-e210-active-lesson-title',title);
    var bar=deck.querySelector('.e132-cleanbar div');
    if(bar){
      var chip=bar.querySelector('[data-e210-lesson-id]');
      if(!chip){chip=document.createElement('span');chip.className='e210-lesson-id';bar.appendChild(chip);}
      chip.setAttribute('data-e210-lesson-id',id.lessonId||'');
      if(id.lessonId)chip.setAttribute('data-lesson-id',id.lessonId);else chip.removeAttribute('data-lesson-id');
      chip.textContent='Đang trình chiếu: '+title;
    }
    var main=deck.querySelector('.e132-clean-main'),h=main&&main.querySelector('h1');
    if(h){
      var line=main.querySelector('[data-e210-source-line]');
      if(!line){line=document.createElement('div');line.className='e210-source-line';line.setAttribute('data-e210-source-line','1');h.insertAdjacentElement('afterend',line);}
      line.setAttribute('data-e210-source-lesson-id',id.lessonId||'');
      line.textContent='Bài đang được trình chiếu: '+title;
    }
    var check=deck.querySelector('.e132-clean-card.check');
    if(check){
      var c=check.querySelector('[data-e210-check-line]');
      if(!c){c=document.createElement('div');c.className='e210-check-line';c.setAttribute('data-e210-check-line','1');check.appendChild(c);}
      c.setAttribute('data-e210-check-lesson-id',id.lessonId||'');
      c.textContent='Kiểm tra bài: '+title;
    }
    return true;
  }
  var scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;apply();});}
  function boot(){
    apply();
    try{new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','data-current-lesson','data-e243-lesson-id']});}catch(_){}
    document.addEventListener('click',function(){setTimeout(schedule,0);},true);
    document.addEventListener('keydown',function(){setTimeout(schedule,0);},true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.BAUMAN_MATH_E210_LESSON_IDENTITY={release:RELEASE,apply:apply,identity:identity,selfCheck:function(){var id=identity();return {ok:true,release:RELEASE,lessonId:id.lessonId,lessonTitle:id.lessonTitle,identitySource:id.source,active:!!document.querySelector('.e132-overlay-deck.open'),canonicalIdPreferred:true};}};
})();
