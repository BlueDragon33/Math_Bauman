/* E185 · Remove `Học tập` from path/modal content levels
 * Học tập is only the outer sidebar/tab name.
 * Inside the learning path:
 * - After Chương: popup title = Chọn hoạt động
 * - After selecting an activity: popup title = that activity label
 * - Breadcrumb activity segment = selected activity label, never Học tập
 */
(function(){
  'use strict';
  var RELEASE='E185_NO_HOC_TAP_IN_PATH';
  var LABELS={
    theory:'Lý thuyết',
    exercises:'Bài tập',
    practice:'Thực hành',
    application:'Ứng dụng thực tế',
    review:'Ôn tập',
    exam:'Kiểm tra'
  };
  function api(){return window.BAUMAN_MATH_E175_HIERARCHY||null;}
  function currentPath(){try{return api()&&api().path&&api().path();}catch(_){return null;}}
  function activityLabel(){var p=currentPath()||{};return LABELS[p.activityId]||'Lý thuyết';}
  function inLearning(){return !!document.querySelector('.e169-learning-router,.e169-breadcrumb,.e129-theory-shell');}
  function modalHasPick(kind){return !!document.querySelector('.e175-modal [data-e178-pick="'+kind+'"],.e129-modal [data-e178-pick="'+kind+'"]');}
  function patchModal(){
    var modal=document.querySelector('.e175-modal,.e129-modal');
    if(!modal)return;
    var h3=modal.querySelector('header h3');
    var p=modal.querySelector('header p');
    if(!h3)return;
    if(modalHasPick('activity')){
      if(h3.textContent.trim()!=='Chọn hoạt động')h3.textContent='Chọn hoạt động';
      if(p&&p.textContent.trim()!=='Chọn một mục để học trong chương đã chọn.')p.textContent='Chọn một mục để học trong chương đã chọn.';
      return;
    }
    if(modalHasPick('content')){
      var label=activityLabel();
      if(h3.textContent.trim()!==label)h3.textContent=label;
      if(p&&p.textContent.trim()!==('Chọn nội dung trong mục '+label+'.'))p.textContent='Chọn nội dung trong mục '+label+'.';
    }
  }
  function patchBreadcrumb(){
    var bc=document.querySelector('.e169-breadcrumb');
    if(!bc)return;
    var buttons=Array.prototype.slice.call(bc.querySelectorAll('button'));
    var label=activityLabel();
    buttons.forEach(function(btn,idx){
      var s=(btn.textContent||'').replace(/\s+/g,' ').trim();
      if(s==='Học tập')btn.textContent=(idx===3?label:'Chọn hoạt động');
    });
    if(buttons[3] && buttons[3].textContent.trim()==='Học tập')buttons[3].textContent=label;
  }
  function patchTopbar(){
    if(!inLearning())return;
    var title=document.getElementById('pageTitle');
    if(!title)return;
    var s=(title.textContent||'').trim();
    var label=activityLabel();
    if(s==='Học tập'||LABELS[s]||Object.values(LABELS).indexOf(s)>=0){
      if(title.textContent!==label)title.textContent=label;
    }
  }
  function patch(){
    patchModal();
    patchBreadcrumb();
    patchTopbar();
    document.documentElement.setAttribute('data-e185-no-hoc-tap-path',RELEASE);
  }
  var scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;patch();});}
  var obs=new MutationObserver(schedule);
  function boot(){
    try{obs.observe(document.body,{childList:true,subtree:true,characterData:true});}catch(_){ }
    patch();
    setInterval(patch,900);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.BAUMAN_MATH_E185_NO_HOC_TAP_PATH={release:RELEASE,patch:patch,selfCheck:function(){return{release:RELEASE,activity:activityLabel(),hasBreadcrumb:!!document.querySelector('.e169-breadcrumb')};}};
})();
