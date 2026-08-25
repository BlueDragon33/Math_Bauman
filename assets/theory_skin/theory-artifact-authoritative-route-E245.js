/* E245 · Authoritative lesson route for theory artifacts
 * Wraps the shared E244 resolver. When the current Reader/deck exposes a
 * concrete lesson ID, that ID is authoritative: return its registry entry or
 * null. Never fall back to a stale registered lesson title/ID.
 */
(function(){
  'use strict';

  var RELEASE='E245_AUTHORITATIVE_ARTIFACT_ROUTE';
  var installed=false;

  function state(){
    try{return (window.__BAUMAN_CORE_API&&window.__BAUMAN_CORE_API.state)||window.__MATH_STATE||{};}
    catch(_){return window.__MATH_STATE||{};}
  }

  function firstAttribute(node,names){
    if(!node)return '';
    for(var i=0;i<names.length;i++){
      var value=String(node.getAttribute(names[i])||'').trim();
      if(value)return value;
    }
    return '';
  }

  function authoritativeLessonId(){
    var deck=document.querySelector('.e132-overlay-deck.open');
    var id=firstAttribute(deck,['data-e243-lesson-id','data-e210-active-lesson-id','data-lesson-id']);
    if(id)return id;
    if(deck){
      var chip=deck.querySelector('[data-e210-lesson-id]');
      id=String(chip&&chip.getAttribute('data-e210-lesson-id')||'').trim();
      if(id)return id;
    }

    var shell=document.querySelector('.e129-theory-shell.presenting')||document.querySelector('.e129-theory-shell');
    var current=shell&&shell.querySelector('[data-current-lesson]');
    id=String(current&&current.getAttribute('data-current-lesson')||'').trim();
    if(id)return id;

    var s=state();
    return String(s&&s.e129LessonId||s&&s.e169Path&&s.e169Path.lessonId||'').trim();
  }

  function install(){
    var registry=window.BAUMAN_MATH_THEORY_ARTIFACT_REGISTRY_E244;
    if(!registry||typeof registry.resolve!=='function'||typeof registry.get!=='function')return false;
    if(registry.__e245Installed){installed=true;return true;}

    var fallbackResolve=registry.resolve;
    registry.resolve=function(values){
      var id=authoritativeLessonId();
      if(id)return registry.get(id)||null;
      return fallbackResolve.call(registry,values);
    };
    registry.authoritativeLessonId=authoritativeLessonId;
    registry.__e245Installed=true;
    registry.__e245Release=RELEASE;
    installed=true;
    return true;
  }

  function boot(){
    if(install())return;
    var attempts=0;
    var timer=setInterval(function(){
      attempts+=1;
      if(install()||attempts>=40)clearInterval(timer);
    },50);
  }

  window.BAUMAN_MATH_E245_ARTIFACT_ROUTE={
    release:RELEASE,
    install:install,
    authoritativeLessonId:authoritativeLessonId,
    selfCheck:function(){
      var registry=window.BAUMAN_MATH_THEORY_ARTIFACT_REGISTRY_E244;
      var id=authoritativeLessonId();
      var entry=id&&registry&&registry.get?registry.get(id):null;
      return {
        ok:installed&&!!(registry&&registry.__e245Installed),
        release:RELEASE,
        authoritativeLessonId:id,
        registered:!!entry,
        resolvedLessonId:entry&&entry.lessonId||'',
        staleFallbackBlocked:!!id&&!entry,
        newRendererCreated:false,
        newDataSourceCreated:false,
        newStateStoreCreated:false
      };
    }
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
