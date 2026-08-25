/* E184 · Activity-aware learning titles
 * Rule:
 * - After choosing Chapter, the activity selector popup title is `Học tập`.
 * - After choosing an activity, the content selector popup title is that activity label: Lý thuyết, Bài tập, Thực hành, ...
 * - The global Học tập nav can remain, but the active learning surface should show the selected activity.
 */
(function(){
  'use strict';
  var RELEASE='E184_ACTIVITY_AWARE_TITLES';
  var LABELS={
    theory:'Lý thuyết',
    exercises:'Bài tập',
    practice:'Thực hành',
    application:'Ứng dụng thực tế',
    review:'Ôn tập',
    exam:'Kiểm tra'
  };
  function api(){return window.BAUMAN_MATH_E175_HIERARCHY||null;}
  function path(){try{return api()&&api().path&&api().path();}catch(_){return null;}}
  function activityLabel(){var p=path()||{};return LABELS[p.activityId]||'Lý thuyết';}
  function hasLearningSurface(){return !!document.querySelector('.e169-learning-router,.e169-breadcrumb,.e129-theory-shell');}
  function patchModal(){
    var modal=document.querySelector('.e175-modal,.e129-modal');
    if(!modal)return;
    var h3=modal.querySelector('header h3');
    var p=modal.querySelector('header p');
    if(!h3)return;
    var t=(h3.textContent||'').trim();
    if(t==='Chọn Hoạt động học tập'){
      h3.textContent='Học tập';
      if(p)p.textContent='Chọn một hoạt động học tập trong chương đã chọn.';
      return;
    }
    if(t==='Chọn Nội dung cụ thể'){
      var label=activityLabel();
      h3.textContent=label;
      if(p)p.textContent='Chọn nội dung cụ thể trong mục '+label+'.';
      return;
    }
  }
  function patchTopbar(){
    if(!hasLearningSurface())return;
    var pageTitle=document.getElementById('pageTitle');
    if(!pageTitle)return;
    var label=activityLabel();
    var current=(pageTitle.textContent||'').trim();
    if(current==='Học tập'||current==='Lý thuyết'||current==='Bài tập'||current==='Thực hành'||current==='Ứng dụng thực tế'||current==='Ôn tập'||current==='Kiểm tra'){
      if(current!==label)pageTitle.textContent=label;
    }
  }
  function patch(){patchModal();patchTopbar();document.documentElement.setAttribute('data-e184-activity-title',RELEASE);}
  var scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;patch();});}
  var obs=new MutationObserver(schedule);
  function boot(){try{obs.observe(document.body,{childList:true,subtree:true,characterData:true});}catch(_){ }patch();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.BAUMAN_MATH_E184_ACTIVITY_TITLE={release:RELEASE,patch:patch,selfCheck:function(){return{release:RELEASE,activity:activityLabel(),hasLearningSurface:hasLearningSurface()};}};
})();
