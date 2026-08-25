/* E130 · Program Frame UI View
 * E135 cleanup: keep program-frame APIs/data, but do not inject redundant learner UI.
 */
(function(){
  'use strict';
  var RELEASE='E130_PROGRAM_VIEW_INERT_FOR_E135_HEADER_ONLY';
  var FRAME_PATH='data/math_program_frame.json';
  var MAP_PATH='data/math_program_map.json';
  var cache={frame:null,map:null,error:null};

  function api(){return window.__BAUMAN_CORE_API||{};}
  function st(){try{return api().state||window.__MATH_STATE||{};}catch(_){return window.__MATH_STATE||{};}}
  function arr(x){return Array.isArray(x)?x:[];}
  function el(tag,cls,text){var n=document.createElement(tag); if(cls)n.className=cls; if(text!=null)n.textContent=String(text); return n;}
  function clear(n){while(n&&n.firstChild)n.removeChild(n.firstChild);}
  function save(){try{api().save&&api().save();}catch(_){} }
  function setHeader(title,sub){
    var p=document.getElementById('pageTitle'); if(p)p.textContent=title||'Lý thuyết';
    var s=document.getElementById('pageSub'); if(s)s.textContent=sub||'';
    var c=document.getElementById('coreLabel'); if(c)c.textContent='';
  }
  function load(){
    if(cache.frame&&cache.map)return Promise.resolve(cache);
    return Promise.all([
      fetch(FRAME_PATH,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error(FRAME_PATH+' '+r.status);return r.json();}),
      fetch(MAP_PATH,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error(MAP_PATH+' '+r.status);return r.json();})
    ]).then(function(xs){cache.frame=xs[0];cache.map=xs[1];return cache;}).catch(function(e){cache.error=e;return cache;});
  }
  function byLecture(map){
    var out={};
    arr(map&&map.chapterMappings).forEach(function(m){
      [m.primaryProgramLectureId].concat(arr(m.secondaryProgramLectureIds)).filter(Boolean).forEach(function(id){(out[id]=out[id]||[]).push(m);});
    });
    Object.keys(out).forEach(function(k){out[k].sort(function(a,b){return Number(a.chapterNo||0)-Number(b.chapterNo||0);});});
    return out;
  }
  function chapterPills(parent,items,anchorId){
    var wrap=el('div','e130-chapter-pills');
    if(!items.length){wrap.appendChild(el('div','e130-empty','Chưa map chương nào vào anchor này.')); parent.appendChild(wrap); return;}
    items.forEach(function(m){
      var b=el('button',m.primaryProgramLectureId===anchorId?'primary':'secondary');
      b.type='button'; b.setAttribute('data-e130-chapter',m.chapterId||''); b.setAttribute('data-e130-stage',m.stageId||'');
      b.appendChild(el('b','',m.chapterNo?'C'+m.chapterNo:'C?'));
      b.appendChild(el('span','',m.stageId||''));
      b.appendChild(el('em','',m.roadmapRole||m.disciplineId||'mapped'));
      wrap.appendChild(b);
    });
    parent.appendChild(wrap);
  }
  function anchorCard(a,lookup){
    var card=el('article','e130-anchor-card'); card.setAttribute('data-e130-anchor',a.programLectureId||'');
    var head=el('header'); head.appendChild(el('span','e130-no','Bài giảng '+(a.lectureNo||'?'))); head.appendChild(el('h4','',a.title||'Lecture anchor')); card.appendChild(head);
    var focus=el('p','e130-focus'); focus.textContent='Trọng tâm Bauman: '+(a.baumanFocus||''); card.appendChild(focus);
    var ms=arr(lookup[a.programLectureId]);
    var meta=el('div','e130-meta'); meta.appendChild(el('span','',arr(a.stageHints).join(' · ')||'stage pending')); meta.appendChild(el('span','',ms.length+' chương liên kết')); meta.appendChild(el('span','','Lab Work')); card.appendChild(meta);
    var lab=el('div','e130-lab'); lab.textContent='Ứng dụng lập trình: '+arr(a.labWork&&a.labWork.suggestedTasks).slice(0,3).join(' · '); card.appendChild(lab);
    chapterPills(card,ms,a.programLectureId);
    return card;
  }
  function renderProgram(data){
    var view=document.getElementById('view'); if(!view)return false;
    var frame=data.frame||{}, map=data.map||{}, lookup=byLecture(map);
    clear(view); setHeader('Khung bài giảng Bauman E130','');
    var main=el('main','e130-program-view'); main.setAttribute('data-e130-release',RELEASE);
    var hero=el('section','e130-hero');
    var htext=el('div'); htext.appendChild(el('h2','',frame.title||'Khung chương trình Toán'));
    var stats=el('aside'); stats.appendChild(el('b','',arr(map.chapterMappings).length)); stats.appendChild(el('span','','chương active đã map'));
    hero.appendChild(htext); hero.appendChild(stats); main.appendChild(hero);
    arr(frame.blocks).forEach(function(block){
      var bs=el('section','e130-block'); var bh=el('div','e130-block-head');
      bh.appendChild(el('span','','Khối '+(block.blockNo||''))); bh.appendChild(el('h3','',block.blockTitle||'')); bs.appendChild(bh);
      arr(block.sections).forEach(function(sec){var ss=el('section','e130-section'); ss.appendChild(el('h3','',sec.sectionTitle||'')); var grid=el('div','e130-anchor-grid'); arr(sec.lectureAnchors).forEach(function(a){grid.appendChild(anchorCard(a,lookup));}); ss.appendChild(grid); bs.appendChild(ss);});
      main.appendChild(bs);
    });
    view.appendChild(main); return true;
  }
  function openProgram(){
    var s=st(); s.view='learning'; s.learnTab='theory'; s.e130Route='program'; save();
    var view=document.getElementById('view'); if(view){clear(view); view.appendChild(el('main','e130-program-view','Đang tải khung chương trình E130...'));}
    setHeader('Khung bài giảng Bauman E130','');
    load().then(function(data){if(data.error){if(view){clear(view);view.appendChild(el('main','e130-program-view','Không tải được E130: '+data.error.message));}return;} renderProgram(data);});
  }
  function openBauman(){
    var s=st(); s.view='learning'; s.learnTab='theory'; s.e130Route='bauman'; save();
    try{if(window.BAUMAN_MATH_THEORY_E129&&window.BAUMAN_MATH_THEORY_E129.render){window.BAUMAN_MATH_THEORY_E129.render(); return;}}catch(_){ }
    try{api().render&&api().render();}catch(_){ }
  }
  function removeInjected(){
    document.querySelectorAll('[data-e130-toggle],[data-e130-open-program]').forEach(function(n){n.remove();});
    var s=st(); if(s.e130Route==='program'){s.e130Route='bauman'; save();}
  }
  document.addEventListener('click',function(e){
    var t=e.target&&e.target.closest&&e.target.closest('[data-e130-route],[data-e130-open-program],[data-e130-chapter]'); if(!t)return;
    if(t.hasAttribute('data-e130-route')||t.hasAttribute('data-e130-open-program')){removeInjected(); openBauman(); e.preventDefault(); e.stopPropagation();}
    else if(t.hasAttribute('data-e130-chapter')){var s=st(); var chapterId=t.getAttribute('data-e130-chapter'); var stageId=t.getAttribute('data-e130-stage'); s.chapterId=chapterId; s.e129ChapterId=chapterId; if(stageId){s.stage=stageId; s.e129Stage=stageId;} openBauman(); e.preventDefault(); e.stopPropagation();}
  },true);
  var mo=new MutationObserver(function(){setTimeout(removeInjected,0);});
  function boot(){removeInjected(); var app=document.getElementById('app')||document.body; if(app)mo.observe(app,{childList:true,subtree:true});}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot); else boot();
  window.BAUMAN_MATH_E130_PROGRAM_VIEW={release:RELEASE,open:openProgram,back:openBauman,selfCheck:function(){var meta=(window.SUBJECT_ADAPTER&&window.SUBJECT_ADAPTER.dataSourceMeta)||{};return {ok:!!(window.BAUMAN_MATH_E130_PROGRAM_FRAME&&meta.math_program_frame&&meta.math_program_map),release:RELEASE,routeToggle:false,learnerInjection:false,defaultRoute:'bauman',programFramePath:meta.math_program_frame&&meta.math_program_frame.path,programMapPath:meta.math_program_map&&meta.math_program_map.path,importTargetUnchanged:'theory_lecture_content',e129SelectionSync:'e129ChapterId/e129Stage'};}};
})();
