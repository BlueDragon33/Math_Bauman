'use strict';
(function(){
  const A=window.SUBJECT_ADAPTER||{};
  const RELEASE='E133_RUNTIME_UI_CONSISTENCY_CORE';
  const $=(id)=>document.getElementById(id);
  const esc=(v)=>String(v==null?'':v).replace(/[&<>"']/g,(c)=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const arr=(v)=>Array.isArray(v)?v:[];
  const storage=(window.BaumanSubjectStorage&&window.BaumanSubjectStorage.forSubject)?window.BaumanSubjectStorage.forSubject(A.id||'math'):null;
  const stateKey=A.storageKey||'bauman_math_runtime_state';
  const critical=['curriculum','theory_lecture_frame','theory_lecture_content','lessons','formulas','exercises','applications','simulations','professor_qa','question_bank','review_packs','mindmap','videos'];
  const DB=window.DB=window.DB||{};
  let renderQueued=false;
  let loading=false;
  let loadErrors={};

  function clone(v){try{return JSON.parse(JSON.stringify(v));}catch(_){return v;}}
  function readState(){
    const base=clone(A.defaultState||{stage:'vn',view:'overview',learnTab:'theory'});
    try{
      const saved=storage?storage.getJSON(stateKey,null):JSON.parse(localStorage.getItem(stateKey)||'null');
      return Object.assign(base,saved||{});
    }catch(_){return base;}
  }
  const state=window.__MATH_STATE=readState();

  function save(){
    try{
      if(storage)storage.setJSON(stateKey,state,{kind:'e133-core-state'});
      else localStorage.setItem(stateKey,JSON.stringify(state));
      setSaveStatus('Đã lưu','ok');
      return true;
    }catch(_){
      setSaveStatus('Không thể lưu','error');
      return false;
    }
  }
  function setSaveStatus(label,mode){
    const el=$('saveState'); if(!el)return;
    el.textContent=label;
    el.dataset.state=mode||'ok';
    el.setAttribute('role','status');
  }
  function toast(msg){
    const el=$('toast'); if(!el)return;
    el.textContent=msg; el.classList.add('show');
    clearTimeout(toast._t); toast._t=setTimeout(()=>el.classList.remove('show'),2200);
  }
  function modal(title,body){
    const host=$('modal'), box=$('modalBody'); if(!host||!box)return;
    box.innerHTML='<div class="modal-body"><h3>'+esc(title)+'</h3>'+body+'</div>';
    host.classList.remove('hidden');
  }
  function closeModal(){$('modal')&&$('modal').classList.add('hidden');}

  function sourceMeta(name){
    return (A.dataSourceMeta&&A.dataSourceMeta[name])||{path:'data/'+name+'.json',label:name};
  }
  async function loadOne(name){
    if(Object.prototype.hasOwnProperty.call(DB,name))return DB[name];
    const meta=sourceMeta(name), path=meta.path||('data/'+name+'.json');
    try{
      const res=await fetch(path,{cache:'no-store'});
      if(!res.ok)throw new Error('HTTP '+res.status);
      const text=await res.text();
      DB[name]=text.trim()?JSON.parse(text):[];
      delete loadErrors[name];
    }catch(e){
      DB[name]=[];
      loadErrors[name]=String(e&&e.message||e);
    }
    return DB[name];
  }
  async function loadInitial(){
    if(loading)return;
    loading=true; setSaveStatus('Đang tải','loading');
    await Promise.all(critical.map(loadOne));
    loading=false; validateState(); render();
    setSaveStatus(Object.keys(loadErrors).length?'Đã tải · có nguồn thiếu':'Đã tải','ok');
    window.dispatchEvent(new CustomEvent('bauman:core-ready',{detail:{release:RELEASE,errors:clone(loadErrors)}}));
  }

  function stages(){
    const raw=DB.curriculum;
    return arr(raw&&raw.stages);
  }
  function stageId(s){return String((s&& (s.id||s.stageId))||'');}
  function currentStage(){
    return stages().find((s)=>stageId(s)===String(state.stage||''))||stages()[0]||null;
  }
  function validateState(){
    const ss=stages();
    if(ss.length&&!ss.some((s)=>stageId(s)===state.stage))state.stage=stageId(ss[0]);
    const views=arr(A.nav).map((x)=>x[0]);
    if(views.length&&!views.includes(state.view))state.view='overview';
    const tabs=arr(A.learningTabs).map((x)=>x[0]);
    if(tabs.length&&!tabs.includes(state.learnTab))state.learnTab='theory';
  }

  function count(name){
    const v=DB[name];
    if(Array.isArray(v))return v.length;
    if(v&&Array.isArray(v.records))return v.records.length;
    if(v&&Array.isArray(v.items))return v.items.length;
    if(v&&Array.isArray(v.questions))return v.questions.length;
    return 0;
  }
  function empty(title,desc,action){
    return '<section class="panel card e133-empty"><span class="chip">Chưa có dữ liệu active</span><h3>'+esc(title)+'</h3><p>'+esc(desc)+'</p>'+(action||'')+'</section>';
  }
  function topMeta(title,sub){
    $('pageTitle').textContent=title;
    $('pageSub').textContent=sub||'';
    $('coreLabel').textContent=(A.ui&&A.ui.coreLabel)||'MATH · E133 Runtime Core';
  }

  function buildStage(){
    const el=$('stageSelect'); if(!el)return;
    const ss=stages();
    el.innerHTML=ss.map((s)=>'<option value="'+esc(stageId(s))+'">'+esc(s.title||s.stageTitle||stageId(s))+'</option>').join('');
    if(ss.some((s)=>stageId(s)===state.stage))el.value=state.stage;
    el.setAttribute('aria-label','Chọn giai đoạn học Toán');
  }
  function buildNav(){
    const host=$('nav'); if(!host)return;
    host.innerHTML=arr(A.nav).map((item)=>{
      const id=item[0],icon=item[1]||'•',label=item[2]||id;
      return '<button type="button" data-view="'+esc(id)+'" class="'+(state.view===id?'active':'')+'"><span aria-hidden="true">'+esc(icon)+'</span><b>'+esc(label)+'</b></button>';
    }).join('');
  }

  function overview(){
    topMeta('Tổng quan',(A.ui&&A.ui.overviewSubtitle)||'Tổng quan lộ trình và trạng thái dữ liệu.');
    const st=currentStage();
    const metrics=[
      ['Khung chương','theory_lecture_frame'],['Bài lý thuyết','theory_lecture_content'],['Công thức','formulas'],
      ['Bài tập','exercises'],['Ứng dụng','applications'],['Mô phỏng','simulations'],['Vấn đáp','professor_qa'],['Câu kiểm tra','question_bank']
    ];
    const cards=metrics.map((m)=>'<article class="metric"><b>'+count(m[1])+'</b><small>'+esc(m[0])+'</small></article>').join('');
    return '<section class="e133-overview">'
      +'<article class="panel hero e133-hero"><span class="chip">E133 · Runtime restored</span><h3>'+esc((st&&(st.title||st.stageTitle))||'Toán Bauman')+'</h3><p>Runtime đã được khôi phục theo nguyên tắc dữ liệu thật: nguồn rỗng hiển thị trạng thái rỗng, không tạo số liệu giả.</p><div class="lesson-tools"><button class="btn primary" data-go="learning">Tiếp tục học</button><button class="btn soft" data-go="storage">Kiểm tra dữ liệu</button></div></article>'
      +'<section class="metric-grid">'+cards+'</section>'
      +(Object.keys(loadErrors).length?'<section class="note">Có '+Object.keys(loadErrors).length+' nguồn không tải được. Mở tab Dữ liệu để xem chi tiết.</section>':'')
      +'</section>';
  }

  function theoryFrame(){
    const frame=DB.theory_lecture_frame||{};
    const ss=arr(frame.stages);
    const wanted=ss.find((x)=>String(x.stageId||x.id||'')===String(state.stage||''))||ss[0];
    if(!wanted)return empty('Khung lý thuyết chưa sẵn sàng','Không đọc được theory_lecture_frame.json.','<button class="btn soft" data-go="storage">Mở Dữ liệu</button>');
    const disciplines=arr(wanted.disciplines);
    let chapterCount=0;
    const html=disciplines.map((d)=>{
      const chapters=arr(d.chapters); chapterCount+=chapters.length;
      return '<article class="panel card e133-discipline"><h4>'+esc(d.disciplineTitle||d.title||d.disciplineId)+'</h4><div class="e133-chapters">'+chapters.map((c)=>'<button type="button" class="item-card" data-chapter="'+esc(c.chapterId||c.id||'')+'"><b>'+esc(c.chapterTitle||c.title||c.chapterId||c.id)+'</b><small>'+esc(c.chapterId||c.id||'')+'</small></button>').join('')+'</div></article>';
    }).join('');
    const contentCount=count('theory_lecture_content');
    return '<section class="e133-theory-frame"><div class="toolbar"><div><h3>'+esc(wanted.stageTitle||wanted.title||state.stage)+'</h3><p>'+disciplines.length+' phân môn · '+chapterCount+' chương · '+contentCount+' bài nội dung active</p></div></div>'+html+(contentCount===0?empty('Khung đã có nhưng nội dung bài giảng đang rỗng','theory_lecture_content.json trên main chưa chứa content. Đây là trạng thái dữ liệu thật, không phải lỗi renderer.','<button class="btn soft" data-go="storage">Kiểm tra nguồn</button>'):'')+'</section>';
  }
  function dataList(name,title,desc){
    const raw=DB[name], xs=Array.isArray(raw)?raw:(raw&&Array.isArray(raw.records)?raw.records:(raw&&Array.isArray(raw.items)?raw.items:[]));
    if(!xs.length)return empty(title,desc,'<button class="btn soft" data-go="storage">Mở Dữ liệu</button>');
    return '<section class="grid">'+xs.slice(0,100).map((x,i)=>'<article class="panel card"><span class="chip">'+esc(x.id||x.lessonId||('#'+(i+1)))+'</span><h4>'+esc(x.title||x.lessonTitle||x.question||x.prompt||title)+'</h4><p>'+esc(x.summary||x.description||x.purpose||x.explanation||'')+'</p></article>').join('')+'</section>';
  }
  function learning(){
    topMeta('Học tập',(A.ui&&A.ui.learningSubtitle)||'Lý thuyết → bài tập → ứng dụng → ôn tập → kiểm tra.');
    const tabs=arr(A.learningTabs).map((item)=>'<button type="button" class="btn '+(state.learnTab===item[0]?'active':'')+'" data-learn-tab="'+esc(item[0])+'">'+esc(item[1]||'')+' '+esc(item[2]||item[0])+'</button>').join('');
    let body='';
    if(state.learnTab==='theory')body=theoryFrame();
    else if(state.learnTab==='exercises')body=dataList('exercises','Bài tập chưa có dữ liệu active','Bank exercises.json hiện đang rỗng.');
    else if(state.learnTab==='practice')body=dataList('applications','Ứng dụng chưa có dữ liệu active','Bank applications.json hiện đang rỗng.');
    else if(state.learnTab==='review')body=dataList('review_packs','Ôn tập chưa có dữ liệu active','Bank review_packs.json hiện đang rỗng.');
    else if(state.learnTab==='exam')body=dataList('question_bank','Kiểm tra chưa có dữ liệu active','Bank question_bank.json hiện đang rỗng.');
    return '<section class="e133-learning"><div class="tabs e133-tabs">'+tabs+'</div>'+body+'</section>';
  }
  function simpleRoute(view,title,subtitle,source,emptyText){
    topMeta(title,subtitle);
    return dataList(source,title,emptyText);
  }
  function storageView(){
    topMeta('Dữ liệu',(A.ui&&A.ui.storageSubtitle)||'Kiểm tra các nguồn JSON và trạng thái tải.');
    const names=Array.from(new Set([].concat(critical,arr(A.dataFiles||[]))));
    const rows=names.map((name)=>{
      const meta=sourceMeta(name), loaded=Object.prototype.hasOwnProperty.call(DB,name), n=count(name), err=loadErrors[name];
      return '<article class="e133-source '+(err?'error':'')+'"><div><b>'+esc(meta.label||name)+'</b><small>'+esc(meta.path||('data/'+name+'.json'))+'</small></div><span>'+esc(loaded?(err?'Lỗi':String(n)):'Chưa tải')+'</span><button class="btn soft" type="button" data-load-source="'+esc(name)+'">'+(loaded?'Tải lại':'Tải')+'</button></article>';
    }).join('');
    return '<section class="panel card e133-storage"><div class="toolbar"><div><h3>Runtime Data Inspector</h3><p>Không suy đoán dữ liệu. Mỗi nguồn hiển thị đúng trạng thái tải và số record thực.</p></div></div><div class="e133-source-list">'+rows+'</div></section>';
  }

  function routeHtml(){
    if(state.view==='overview')return overview();
    if(state.view==='learning')return learning();
    if(state.view==='dialogue')return simpleRoute('dialogue','Vấn đáp',(A.ui&&A.ui.dialogueSubtitle)||'Vấn đáp giáo sư.','professor_qa','professor_qa.json hiện đang rỗng.');
    if(state.view==='writing')return simpleRoute('writing','Mô phỏng',(A.ui&&A.ui.writingSubtitle)||'Mô phỏng Toán.','simulations','simulations.json hiện đang rỗng.');
    if(state.view==='media')return simpleRoute('media','Video/Tài nguyên',(A.ui&&A.ui.mediaSubtitle)||'Video và tài nguyên.','videos','videos.json chưa có nội dung active.');
    if(state.view==='vocab')return simpleRoute('vocab','Công thức',(A.ui&&A.ui.vocabSubtitle)||'Công thức và ký hiệu.','formulas','formulas.json hiện đang rỗng.');
    if(state.view==='grammar')return simpleRoute('grammar','Công thức sâu',(A.ui&&A.ui.grammarSubtitle)||'Công thức sâu theo bài.','formulas','formulas.json hiện đang rỗng.');
    if(state.view==='mindmap')return simpleRoute('mindmap','Mind map',(A.ui&&A.ui.mindmapSubtitle)||'Mind map môn Toán.','mindmap','mindmap.json hiện đang rỗng.');
    if(state.view==='storage')return storageView();
    topMeta('Toán Bauman','Route chưa được cấu hình.');
    return empty('Route chưa được cấu hình',state.view||'unknown','');
  }

  function render(){
    if(renderQueued)return;
    renderQueued=true;
    requestAnimationFrame(()=>{
      renderQueued=false;
      validateState(); buildStage(); buildNav();
      const v=$('view'); if(!v)return;
      v.innerHTML=routeHtml();
      document.documentElement.dataset.mathRelease=RELEASE;
      v.dataset.coreRelease=RELEASE;
      try{
        if(state.view==='learning'&&state.learnTab==='theory'&&window.BAUMAN_MATH_THEORY_E126&&typeof window.BAUMAN_MATH_THEORY_E126.render==='function'){
          window.BAUMAN_MATH_THEORY_E126.render();
        }
      }catch(_){}
    });
  }
  function navigate(view){
    const allowed=arr(A.nav).map((x)=>x[0]);
    if(!allowed.includes(view))return false;
    state.view=view; save(); render(); return true;
  }

  document.addEventListener('click',(e)=>{
    const nav=e.target.closest&&e.target.closest('#nav [data-view]');
    if(nav){navigate(nav.getAttribute('data-view'));return;}
    const go=e.target.closest&&e.target.closest('[data-go]');
    if(go){navigate(go.getAttribute('data-go'));return;}
    const lt=e.target.closest&&e.target.closest('[data-learn-tab]');
    if(lt){state.view='learning';state.learnTab=lt.getAttribute('data-learn-tab');save();render();return;}
    const loader=e.target.closest&&e.target.closest('[data-load-source]');
    if(loader){
      const name=loader.getAttribute('data-load-source');
      delete DB[name];
      loadOne(name).then(()=>{toast('Đã tải '+name);render();});
      return;
    }
    if(e.target&&e.target.id==='modalClose')closeModal();
  });
  $('stageSelect')&&$('stageSelect').addEventListener('change',(e)=>{state.stage=e.target.value;save();render();});
  $('themeBtn')&&$('themeBtn').addEventListener('click',()=>{
    const dark=document.documentElement.dataset.theme==='dark';
    document.documentElement.dataset.theme=dark?'light':'dark';
    toast(dark?'Giao diện sáng':'Giao diện tối');
  });
  $('aiBtn')&&$('aiBtn').addEventListener('click',()=>modal('AI Mentor','<p>AI Mentor đang ở chế độ giao diện. Runtime E133 chưa tự tạo nội dung khi bank dữ liệu đang rỗng.</p>'));
  $('modal')&&$('modal').addEventListener('click',(e)=>{if(e.target===$('modal'))closeModal();});
  window.addEventListener('keydown',(e)=>{if(e.key==='Escape')closeModal();});

  window.__BAUMAN_CORE_API={
    release:RELEASE,state:state,db:DB,save:save,render:render,navigate:navigate,loadData:loadOne,
    selfCheck:()=>({ok:Boolean($('view')&&$('nav')&&$('stageSelect')),release:RELEASE,view:state.view,stage:state.stage,loadErrors:clone(loadErrors)})
  };
  loadInitial();
})();