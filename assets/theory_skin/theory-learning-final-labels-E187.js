/* E187 · Final learning labels
 * UI rule:
 * - Main/sidebar tab name is `Học tập`, never `Lý thuyết E129`.
 * - Inner path remains: Khối → Học phần → Chương → Bài → Phân mục.
 * - The Khối kiến thức button subtitle also shows the currently selected Course/Học phần.
 */
(function(){
  'use strict';
  var RELEASE='E187_FINAL_LEARNING_LABELS';
  var MODULES={
    pure:{code:'I',title:'Toán học Thuần túy'},
    applied:{code:'II',title:'Toán học Ứng dụng'}
  };
  var COURSES={
    'pure-algebra':{no:1,title:'Đại số và Cấu trúc số'},
    'pure-analysis':{no:2,title:'Giải tích toán học'},
    'pure-geometry':{no:3,title:'Hình học và Không gian số'},
    'pure-logic':{no:4,title:'Logic toán và Cơ sở lý thuyết'},
    'applied-probability':{no:5,title:'Xác suất và Thống kê toán học'},
    'applied-discrete':{no:6,title:'Toán rời rạc và Tin học tính toán'},
    'applied-optimization':{no:7,title:'Tối ưu hóa và Mô hình hóa kỹ thuật'}
  };
  var CHAPTER_FALLBACKS={
    c01:'Đại số tuyến tính nâng cao'
  };
  function e186(){return window.BAUMAN_MATH_E186_LESSON_FIRST||null;}
  function path(){try{return e186()&&e186().path&&e186().path();}catch(_){return null;}}
  function cleanText(s){return String(s||'').replace(/\s+/g,' ').trim();}
  function moduleSubtitle(p,m,c){
    var api=e186();
    try{if(api&&api.moduleSubtitle)return api.moduleSubtitle();}catch(_){}
    return [m.title,c.title,CHAPTER_FALLBACKS[p.chapterId]||'Chương học'].join(' > ');
  }
  function isLearningView(){return !!document.querySelector('.e169-learning-router,.e169-breadcrumb,.e129-theory-shell');}
  function learningMainLabel(s){
    s=cleanText(s);
    return s==='Lý thuyết E129'||s==='📘 Lý thuyết E129'||s==='Lý thuyết'||s==='📘 Lý thuyết'||s==='Theory E129'||s==='Theory';
  }
  function patchMainTabLabels(){
    document.querySelectorAll('#nav button,#nav a,.nav button,.nav a,.nav-item,[data-nav],[data-tab]').forEach(function(n){
      var s=cleanText(n.textContent);
      if(learningMainLabel(s)){
        n.textContent=s.indexOf('📘')>=0?'📚 Học tập':'Học tập';
        n.setAttribute('title','Học tập');
      }
      var aria=n.getAttribute&&n.getAttribute('aria-label');
      if(learningMainLabel(aria))n.setAttribute('aria-label','Học tập');
    });
  }
  function patchModuleSubtitle(){
    var p=path();
    if(!p)return;
    var m=MODULES[p.moduleId]||MODULES.pure;
    var c=COURSES[p.courseId]||COURSES['pure-algebra'];
    var small=document.querySelector('.e169-module-button small');
    if(!small)return;
    var label=moduleSubtitle(p,m,c);
    if(cleanText(small.textContent)!==label)small.textContent=label;
  }
  function patchTopbarOnlyWhenTechnical(){
    var title=document.getElementById('pageTitle');
    if(!title)return;
    var s=cleanText(title.textContent);
    if(s==='Lý thuyết E129'||s==='📘 Lý thuyết E129')title.textContent='Học tập';
  }
  function patch(){
    patchMainTabLabels();
    patchModuleSubtitle();
    patchTopbarOnlyWhenTechnical();
    document.documentElement.setAttribute('data-e187-final-labels',RELEASE);
  }
  var scheduled=false;
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;patch();});}
  var obs=new MutationObserver(schedule);
  function boot(){
    try{obs.observe(document.body,{childList:true,subtree:true,characterData:true});}catch(_){ }
    patch();
    setInterval(patch,1200);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.BAUMAN_MATH_E187_FINAL_LABELS={release:RELEASE,patch:patch,selfCheck:function(){var p=path()||{};return{release:RELEASE,path:p,mainTab:'Học tập',subtitle:cleanText((document.querySelector('.e169-module-button small')||{}).textContent||'')};}};
})();
