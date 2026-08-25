
/* E126 · Integrates E124/E125 lessons.json visual skin into the existing E122 main module. */
(function(){
  'use strict';
  var PATCH='E126_THEORY_VISUAL_INTEGRATED';
  var applying=false;
  function api(){return window.__BAUMAN_CORE_API||{};}
  function st(){try{return api().state||window.__MATH_STATE||{};}catch(_){return window.__MATH_STATE||{};}}
  function db(){return window.DB||{};}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function arr(x){return Array.isArray(x)?x:[];}
  function lessons(){var raw=db().lessons; var xs=Array.isArray(raw)?raw:(raw&&Array.isArray(raw.lessons)?raw.lessons:[]); return xs.filter(function(l){return l && (l.kind==='theory'||l.contentRole==='theory_only') && Number(l.sourceChapterNo||0)>=1 && Number(l.sourceChapterNo||0)<=40;});}
  var stageNames={0:'GĐ0 · Việt Nam trước dự bị',1:'GĐ1 · Dự bị tiếng Nga',2:'GĐ2 · Thạc sĩ năm 1 kỳ 1',3:'GĐ3 · Thạc sĩ năm 1 kỳ 2',4:'GĐ4 · NIR / năm 2 kỳ 3',5:'GĐ5 · VKR / bảo vệ'};
  var stageToMain={0:'vn',1:'prep',2:'hk1',3:'hk2',4:'hk3',5:'hk4'};
  var mainToStage={vn:0,prep:1,hk1:2,hk2:3,hk3:4,hk4:5};
  function stageNoOf(l){var n=Number(l&&l.sourceStageNo); return isFinite(n)?n:0;}
  function lessonId(l){return String((l&& (l.lessonId||l.id))||'');}
  function currentLesson(xs){var s=st(); var id=String(s.e126LessonId||s.lessonId||''); var hit=xs.find(function(l){return lessonId(l)===id;}); if(hit)return hit; var n=s.e126StageNo!=null?Number(s.e126StageNo):mainToStage[String(s.stage||'vn')]||0; return xs.find(function(l){return stageNoOf(l)===n;})||xs[0]||null;}
  function currentSlide(lesson){var n=Number(st().e126SlideIndex||0); var max=Math.max(0,arr(lesson&&lesson.slides).length-1); return Math.max(0,Math.min(n,max));}
  function clip(s,n){s=String(s||'').replace(/\s+/g,' ').trim(); n=n||160; return s.length>n?s.slice(0,n-1)+'…':s;}
  function safeBlockBody(b){return b&&String(b.body||b.content||b.text||'')||'';}
  function blockHtml(b){var title=b&&String(b.title||b.type||'Nội dung')||'Nội dung'; var body=safeBlockBody(b); var type=String((b&&b.type)||'').toLowerCase(); var isFormula=type==='formula'||/công thức|formula|ký hiệu/.test(title.toLowerCase()); if(isFormula){return '<article class="e126-block formula"><b>'+esc(title)+'</b><pre>'+esc(body)+'</pre></article>';} return '<article class="e126-block"><b>'+esc(title)+'</b><p>'+esc(body)+'</p></article>';}
  function searchText(l){return [l.title,l.chapterTitle,l.departmentTitle,l.stageName,arr(l.conceptIds).join(' '),JSON.stringify(l.sourceAnchors||{})].join(' ').toLowerCase();}
  function render(){
    var xs=lessons();
    var view=document.getElementById('view');
    if(!view||!xs.length)return false;
    var s=st();
    var isLearning=String(s.view||'learning')==='learning';
    var isTheory=String(s.learnTab||'theory')==='theory' && String(s.e122Focus||'theory')!=='examples';
    if(!isLearning||!isTheory)return false;
    var q=String(s.e126Search||'').toLowerCase().trim();
    var lesson=currentLesson(xs); if(!lesson)return false;
    var stageNo=stageNoOf(lesson);
    var slides=arr(lesson.slides); var idx=currentSlide(lesson); var slide=slides[idx]||{};
    var filtered=xs.filter(function(l){return stageNoOf(l)===stageNo && (!q||searchText(l).indexOf(q)>=0);});
    var lessonIndex=xs.findIndex(function(l){return lessonId(l)===lessonId(lesson);});
    var prev=lessonIndex>0?xs[lessonIndex-1]:null, next=lessonIndex<xs.length-1?xs[lessonIndex+1]:null;
    var progress=slides.length?Math.round(((idx+1)/slides.length)*100):0;
    var stageButtons=[0,1,2,3,4,5].map(function(n){var count=xs.filter(function(l){return stageNoOf(l)===n;}).length; return '<button class="'+(n===stageNo?'active':'')+'" data-e126-stage="'+n+'">Stage '+n+' <small>'+count+'</small></button>';}).join('');
    var list=filtered.map(function(l){var on=lessonId(l)===lessonId(lesson); return '<button class="e126-lesson-btn '+(on?'active':'')+'" data-e126-lesson="'+esc(lessonId(l))+'"><b>'+esc(clip(l.title,92))+'</b><small>C'+esc(l.sourceChapterNo)+' · '+esc(clip(l.chapterTitle,54))+'</small></button>';}).join('') || '<div class="e126-empty">Không có bài phù hợp bộ lọc.</div>';
    var rail=slides.map(function(sl,i){return '<button class="e126-slide-pill '+(i===idx?'active':'')+'" data-e126-slide="'+i+'"><span>'+String(i+1).padStart(2,'0')+' · '+esc(sl.role||'slide')+'</span>'+esc(clip(sl.title||'Slide',54))+'</button>';}).join('');
    var roleGrid=slides.map(function(sl,i){return '<button class="'+(i===idx?'active':'')+'" data-e126-slide="'+i+'">'+String(i+1).padStart(2,'0')+' · '+esc(sl.role||'slide')+'</button>';}).join('');
    var blocks=arr(slide.blocks).map(blockHtml).join('') || '<article class="e126-block"><b>Nội dung</b><p>'+esc(slide.body||slide.content||'Slide chưa có block chi tiết.')+'</p></article>';
    var pure=arr(lesson.sourceAnchors&&lesson.sourceAnchors.pureLayer).concat(arr(lesson.pureLayer)).slice(0,6);
    var applied=arr(lesson.sourceAnchors&&lesson.sourceAnchors.appliedLayer).concat(arr(lesson.appliedLayer)).slice(0,6);
    var html='<main class="e126-theory-integrated" data-e126-patch="'+PATCH+'">'+
      '<aside class="e126-side e126-glass"><div class="e126-brand"><div class="e126-logo">∑</div><div><h3>Tab Lý thuyết E126</h3><p>'+xs.length+' bài · '+xs.reduce(function(a,l){return a+arr(l.slides).length;},0)+' slide · visual skin</p></div></div><input class="e126-search" value="'+esc(s.e126Search||'')+'" data-e126-search placeholder="Tìm bài, chương, công thức..."><div class="e126-stage-tabs">'+stageButtons+'</div><div class="e126-list">'+list+'</div></aside>'+
      '<section class="e126-main e126-glass"><header class="e126-hero"><div class="e126-kicker">'+esc(stageNames[stageNo]||('Stage '+stageNo))+' · '+esc(lesson.departmentTitle||'Toán Bauman')+'</div><h2>'+esc(lesson.title||'Bài lý thuyết')+'</h2><div class="e126-meta"><span class="e126-chip">Chương '+esc(lesson.sourceChapterNo||'')+' · '+esc(lesson.chapterTitle||'')+'</span><span class="e126-chip">'+esc(lesson.contentDepth||'deep_academic_verified')+'</span><span class="e126-chip">lessonId: '+esc(lessonId(lesson))+'</span></div></header>'+
      '<div class="e126-toolbar"><nav><button class="e126-btn" data-e126-prev '+(!prev?'disabled':'')+'>← Bài trước</button><button class="e126-btn" data-e126-next '+(!next?'disabled':'')+'>Bài sau →</button><button class="e126-btn" data-e126-open-storage>Kho dữ liệu</button></nav><div class="e126-progress"><i style="width:'+progress+'%"></i></div></div>'+
      '<div class="e126-slide-rail">'+rail+'</div><section class="e126-content"><article class="e126-slide"><header><div><div class="e126-role">'+esc(slide.role||'slide')+'</div><h3>'+esc(slide.title||'Slide')+'</h3></div><span class="e126-chip">'+(idx+1)+'/'+slides.length+'</span></header>'+blocks+'</article><aside class="e126-dock"><section class="e126-card"><h4>Cầu nối chương</h4><p>'+esc(clip((lesson.sourceAnchors&&lesson.sourceAnchors.bridgeQuestion)||'',240))+'</p></section><section class="e126-card"><h4>Lớp thuần túy</h4><p>'+esc(pure.join(' · ')||'Đã khóa trong E110')+'</p></section><section class="e126-card"><h4>Lớp ứng dụng</h4><p>'+esc(applied.join(' · ')||'Đã khóa trong E110')+'</p></section><section class="e126-card"><h4>16 vai trò slide</h4><div class="e126-role-grid">'+roleGrid+'</div></section></aside></section></section></main>';
    applying=true; view.innerHTML=html; applying=false;
    return true;
  }
  function rerender(){try{api().save&&api().save(); api().render&&api().render();}catch(_){setTimeout(render,0);}}
  document.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('[data-e126-lesson],[data-e126-stage],[data-e126-slide],[data-e126-prev],[data-e126-next],[data-e126-open-storage]'); if(!t)return;
    var xs=lessons(), s=st();
    if(t.hasAttribute('data-e126-lesson')){s.e126LessonId=t.getAttribute('data-e126-lesson'); s.lessonId=s.e126LessonId; s.e126SlideIndex=0; var l=xs.find(function(x){return lessonId(x)===s.e126LessonId;}); if(l){s.e126StageNo=stageNoOf(l); s.stage=stageToMain[s.e126StageNo]||s.stage;} s.view='learning'; s.learnTab='theory'; s.e122Focus='theory'; rerender(); e.preventDefault(); e.stopPropagation(); return;}
    if(t.hasAttribute('data-e126-stage')){var n=Number(t.getAttribute('data-e126-stage')); var l2=xs.find(function(x){return stageNoOf(x)===n;}); s.e126StageNo=n; s.stage=stageToMain[n]||s.stage; if(l2){s.e126LessonId=lessonId(l2); s.lessonId=s.e126LessonId;} s.e126SlideIndex=0; s.view='learning'; s.learnTab='theory'; s.e122Focus='theory'; rerender(); e.preventDefault(); e.stopPropagation(); return;}
    if(t.hasAttribute('data-e126-slide')){s.e126SlideIndex=Number(t.getAttribute('data-e126-slide'))||0; render(); e.preventDefault(); e.stopPropagation(); return;}
    if(t.hasAttribute('data-e126-prev')||t.hasAttribute('data-e126-next')){var cur=currentLesson(xs); var i=xs.findIndex(function(x){return lessonId(x)===lessonId(cur);}); var ni=t.hasAttribute('data-e126-prev')?Math.max(0,i-1):Math.min(xs.length-1,i+1); var nl=xs[ni]; if(nl){s.e126LessonId=lessonId(nl); s.lessonId=s.e126LessonId; s.e126StageNo=stageNoOf(nl); s.stage=stageToMain[s.e126StageNo]||s.stage; s.e126SlideIndex=0;} s.view='learning'; s.learnTab='theory'; s.e122Focus='theory'; rerender(); e.preventDefault(); e.stopPropagation(); return;}
    if(t.hasAttribute('data-e126-open-storage')){s.view='storage'; s.storageFile='lessons'; rerender(); e.preventDefault(); e.stopPropagation(); return;}
  },true);
  document.addEventListener('input',function(e){var inp=e.target&&e.target.matches&&e.target.matches('[data-e126-search]')?e.target:null; if(!inp)return; st().e126Search=inp.value||''; render();},true);
  var mo=new MutationObserver(function(){if(applying)return; setTimeout(render,0);});
  function boot(){var view=document.getElementById('view'); if(view){mo.observe(view,{childList:true,subtree:false}); render();} else setTimeout(boot,50);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot); else boot();
  window.BAUMAN_MATH_E126_SELF_CHECK=function(){try{var xs=lessons(); var ok=xs.length>=347 && xs.every(function(l){return arr(l.slides).length===16;}); var htmlOk=render(); return {ok:!!(ok&&htmlOk),patch:PATCH,lessons:xs.length,slides:xs.reduce(function(a,l){return a+arr(l.slides).length;},0),activeChapters:(new Set(xs.map(function(l){return l.sourceChapterNo;}))).size,visualIntegrated:true,final:true};}catch(e){return {ok:false,patch:PATCH,error:String(e&&e.message||e)};}};
})();
