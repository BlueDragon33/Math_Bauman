/* E243 · Presenter route and canonical identity lock
 * Preserves the visible E129 lesson while opening E202, prevents C01 decimal
 * content from being mistaken for C02/C03 aliases, and stamps the canonical
 * lesson identity onto the existing deck. No new renderer.
 */
(function(){
  'use strict';

  var RELEASE='E243_PRESENTER_ROUTE_IDENTITY_LOCK_R3';
  var handled=0;
  var lastLessonId='';
  var lastLessonTitle='';
  var stabilizationRuns=0;

  function state(){
    try{return (window.__BAUMAN_CORE_API&&window.__BAUMAN_CORE_API.state)||window.__MATH_STATE||(window.__MATH_STATE={});}
    catch(_){return window.__MATH_STATE||(window.__MATH_STATE={});}
  }
  function registry(){return window.BAUMAN_MATH_THEORY_ARTIFACT_REGISTRY_E244||null;}
  function contentPayload(){
    try{
      var bridge=window.BAUMAN_MATH_E240_THEORY_CONTENT_SOURCE;
      if(bridge&&typeof bridge.getPayload==='function')return bridge.getPayload();
      return window.DB&&window.DB.theory_lecture_content||null;
    }catch(_){return null;}
  }
  function canonicalIdentity(id){
    id=String(id||'').trim();
    if(!id)return {lessonId:'',lessonTitle:'',source:'none'};
    var reg=registry(),entry=reg&&typeof reg.get==='function'?reg.get(id):null;
    if(entry)return {lessonId:entry.lessonId,lessonTitle:entry.lessonTitle,source:'E244'};
    var payload=contentPayload(),records=payload&&Array.isArray(payload.records)?payload.records:[];
    var record=records.find(function(r){return r&&r.lessonId===id;});
    if(record)return {lessonId:record.lessonId,lessonTitle:record.lessonTitle||record.title||record.lessonId,source:'E240'};
    return {lessonId:id,lessonTitle:id,source:'raw-id'};
  }
  function visibleLesson(button){
    var shell=button&&button.closest&&button.closest('.e129-theory-shell');
    var node=(shell&&shell.querySelector('[data-current-lesson]'))||document.querySelector('[data-current-lesson]');
    return String(node&&node.getAttribute('data-current-lesson')||state().e129LessonId||state().e169Path&&state().e169Path.lessonId||'').trim();
  }
  function lockState(id,present){
    var st=state(),identity=canonicalIdentity(id);
    st.e169Path=st.e169Path||{};
    if(identity.lessonId){
      st.e129LessonId=identity.lessonId;
      st.e169Path.lessonId=identity.lessonId;
      lastLessonId=identity.lessonId;
      lastLessonTitle=identity.lessonTitle;
    }
    st.view='learning';
    st.learnTab='theory';
    st.e129Present=!!present;
    return identity;
  }
  function stampDeck(identity){
    var deck=document.querySelector('.e132-overlay-deck.open');
    if(!deck||!identity||!identity.lessonId)return false;
    deck.setAttribute('data-e243-route-lock',RELEASE);
    deck.setAttribute('data-e243-lesson-id',identity.lessonId);
    deck.setAttribute('data-e243-lesson-title',identity.lessonTitle||identity.lessonId);
    deck.setAttribute('data-lesson-id',identity.lessonId);
    try{
      var e210=window.BAUMAN_MATH_E210_LESSON_IDENTITY;
      if(e210&&typeof e210.apply==='function')e210.apply();
      var e241=window.BAUMAN_MATH_E241_ARTIFACT_READER;
      if(e241&&typeof e241.apply==='function')e241.apply();
      var e242=window.BAUMAN_MATH_E242_SLIDESHOW_RICHNESS;
      if(e242&&typeof e242.apply==='function')e242.apply();
    }catch(_){}
    return true;
  }
  function sanitizeRoutingText(root){
    if(!root||!document.createTreeWalker)return;
    var walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT),node;
    while((node=walker.nextNode()))node.nodeValue=String(node.nodeValue||'').replace(/([23])\.([1-6])/g,'$1·$2');
  }
  function openDeckFromLockedReader(identity){
    var api=window.BAUMAN_MATH_THEORY_E132;
    var real=document.querySelector('.e129-theory-shell.presenting');
    if(!api||typeof api.openDeck!=='function'||!real)return false;
    var ghost=real.cloneNode(true);
    ghost.setAttribute('data-e243-routing-ghost','1');
    ghost.style.display='none';
    sanitizeRoutingText(ghost);
    real.classList.remove('presenting');
    document.body.appendChild(ghost);
    try{
      var result=api.openDeck()!==false;
      stampDeck(identity);
      return result;
    }finally{
      if(ghost.parentNode)ghost.parentNode.removeChild(ghost);
      real.classList.add('presenting');
    }
  }
  function stabilizeReader(identity,e129){
    [0,120,720].forEach(function(delay){
      setTimeout(function(){
        var deck=document.querySelector('.e132-overlay-deck.open');
        if(!deck||!identity||!identity.lessonId)return;
        identity=lockState(identity.lessonId,true);
        stampDeck(identity);
        e129.render();
        stampDeck(identity);
        stabilizationRuns+=1;
      },delay);
    });
  }
  function handle(e){
    var button=e.target&&e.target.closest&&e.target.closest('[data-e129-present]');
    if(!button)return;
    var e129=window.BAUMAN_MATH_THEORY_E129;
    if(!e129||typeof e129.render!=='function')return;
    var st=state(),next=!st.e129Present,id=visibleLesson(button),identity=lockState(id,next);
    e129.render();
    if(next){
      openDeckFromLockedReader(identity);
      stabilizeReader(identity,e129);
    }else{
      var deckApi=window.BAUMAN_MATH_THEORY_E132;
      if(deckApi&&typeof deckApi.closeDeck==='function')deckApi.closeDeck();
    }
    handled+=1;
    e.preventDefault();
    e.stopPropagation();
    if(e.stopImmediatePropagation)e.stopImmediatePropagation();
  }

  window.addEventListener('click',handle,true);

  window.BAUMAN_MATH_E243_PRESENTER_ROUTE_LOCK={
    release:RELEASE,
    canonicalIdentity:canonicalIdentity,
    stampDeck:stampDeck,
    selfCheck:function(){
      var deck=document.querySelector('.e132-overlay-deck.open');
      return {
        ok:true,
        release:RELEASE,
        handled:handled,
        lastLessonId:lastLessonId,
        lastLessonTitle:lastLessonTitle,
        stabilizationRuns:stabilizationRuns,
        deckLessonId:deck&&deck.getAttribute('data-e243-lesson-id')||'',
        deckLessonTitle:deck&&deck.getAttribute('data-e243-lesson-title')||'',
        canonicalIdentityLocked:true,
        noNewRenderer:true,
        routingGhostPresent:!!document.querySelector('[data-e243-routing-ghost]')
      };
    }
  };
})();
