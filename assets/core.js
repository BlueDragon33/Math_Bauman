'use strict';
(function(){
  const A=window.SUBJECT_ADAPTER||{};
  const RELEASE='E134_CORE_RUNTIME_RECOVERY';
  const $=s=>document.querySelector(s);
  const els={
    app:$('#app'),nav:$('#nav'),stage:$('#stageSelect'),stageLabel:$('#stageLabel'),
    view:$('#view'),title:$('#pageTitle'),sub:$('#pageSub'),core:$('#coreLabel'),
    save:$('#saveState'),theme:$('#themeBtn'),ai:$('#aiBtn'),modal:$('#modal'),
    modalClose:$('#modalClose'),modalBody:$('#modalBody'),toast:$('#toast')
  };
  const storage=(window.BaumanSubjectStorage&&window.BaumanSubjectStorage.forSubject)
    ? window.BaumanSubjectStorage.forSubject(A.id||'math') : null;
  const stateKey=A.storageKey||'bauman_math_state';
  const defaults=Object.assign({stage:'vn',view:'overview',learnTab:'theory',theme:'light'},A.defaultState||{});
  let state=Object.assign({},defaults);
  let db={};
  let sourceStatus={};

  function arr(v){return Array.isArray(v)?v:[]}
  function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
  function toast(msg){if(!els.toast)return;els.toast.textContent=msg;els.toast.classList.add('show');setTimeout(()=>els.toast.classList.remove('show'),2200)}
  function setBusy(v){if(els.app)els.app.setAttribute('aria-busy',v?'true':'false')}
  function setSave(text,kind='ok'){if(!els.save)return;els.save.textContent=text;els.save.dataset.state=kind}
  function loadState(){
    try{
      const raw=storage?storage.getJSON(stateKey,null):JSON.parse(localStorage.getItem(stateKey)||'null');
      if(raw&&typeof raw==='object')state=Object.assign({},defaults,raw);
    }catch(_){}
  }
  function saveState(){
    try{
      if(storage)storage.setJSON(stateKey,state,{release:RELEASE});
      else localStorage.setItem(stateKey,JSON.stringify(state));
      setSave('Đã lưu','ok');
    }catch(_){setSave('Không thể lưu','error')}
  }
  async function loadJSON(name){
    const meta=A.getDataSourceMeta?A.getDataSourceMeta(name):(A.dataSourceMeta?.[name]||{path:'data/'+name+'.json'});
    const path=meta.path||('data/'+name+'.json');
    try{
      const r=await fetch(path,{cache:'no-store'});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const text=await r.text();
      if(!text.trim()){sourceStatus[name]={ok:true,empty:true,path,count:0};return name==='curriculum'?{}:[]}
      const data=JSON.parse(text);
      const count=Array.isArray(data)?data.length:
        Array.isArray(data?.lessons)?data.lessons.length:
        Array.isArray(data?.stages)?data.stages.length:
        Array.isArray(data?.disciplines)?data.disciplines.length:
        Object.keys(data||{}).length;
      sourceStatus[name]={ok:true,empty:count===0,path,count};
      return data;
    }catch(e){
      sourceStatus[name]={ok:false,empty:true,path,count:0,error:String(e?.message||e)};
      return name==='curriculum'?{}:[];
    }
  }
  async function loadData(){
    const names=['curriculum','discipline_spine','chapter_spine','lessons','formulas','exercises','applications','simulations','professor_qa','review_packs','question_bank','mindmap','videos'];
    const out=await Promise.all(names.map(async n=>[n,await loadJSON(n)]));
    db=Object.fromEntries(out);
  }
  function stages(){
    const s=arr(db.curriculum?.stages);
    return s.length?s:[{id:'vn',title:'Giai đoạn Việt Nam'}];
  }
  function stageTitle(id){return stages().find(x=>x.id===id)?.title||id}
  function normalizeStage(){
    const ids=stages().map(x=>x.id);
    if(!ids.includes(state.stage))state.stage=ids[0]||'vn';
  }
  function navItems(){return arr(A.nav).length?A.nav:[['overview','🧭','Tổng quan'],['learning','🎓','Học tập'],['dialogue','🎙️','Vấn đáp'],['writing','🔬','Mô phỏng'],['media','🎬','Video/Tài nguyên'],['vocab','🧮','Công thức'],['mindmap','🧠','Mind map'],['storage','🗄️','Dữ liệu']]}
  function learningTabs(){return arr(A.learningTabs).length?A.learningTabs:[['theory','📘','Lý thuyết'],['exercises','📝','Bài tập'],['practice','🧩','Ứng dụng'],['review','🔁','Ôn tập'],['exam','🧪','Kiểm tra']]}
  function renderShell(){
    if(els.core)els.core.textContent=A.ui?.coreLabel||'MATH · E134 Core Runtime';
    if(els.stageLabel)els.stageLabel.textContent=A.ui?.stageLabel||'Giai đoạn';
    els.stage.innerHTML=stages().map(s=>'<option value="'+esc(s.id)+'">'+esc(s.title)+'</option>').join('');
    els.stage.value=state.stage;
    els.nav.innerHTML=navItems().map(([id,icon,label])=>'<button type="button" data-route="'+esc(id)+'" class="'+(state.view===id?'active':'')+'" aria-current="'+(state.view===id?'page':'false')+'"><span>'+esc(icon)+'</span><b>'+esc(label)+'</b></button>').join('');
  }
  function routeMeta(){
    const labels=A.ui?.routes||{};
    const title=labels[state.view]||navItems().find(x=>x[0]===state.view)?.[2]||'Tổng quan';
    const subMap={overview:A.ui?.overviewSubtitle,learning:A.ui?.learningSubtitle,dialogue:A.ui?.dialogueSubtitle,writing:A.ui?.writingSubtitle,media:A.ui?.mediaSubtitle,vocab:A.ui?.vocabSubtitle,mindmap:A.ui?.mindmapSubtitle,storage:A.ui?.storageSubtitle};
    els.title.textContent=title;
    els.sub.textContent=subMap[state.view]||('Giai đoạn hiện tại: '+stageTitle(state.stage));
  }
  function stageChapters(){
    return arr(db.chapter_spine).filter(c=>(c.stageId||c.stage)===state.stage);
  }
  function lessons(){
    const raw=Array.isArray(db.lessons)?db.lessons:arr(db.lessons?.lessons);
    return raw.filter(x=>!state.stage||(x.stageId||x.stage)===state.stage);
  }
  function empty(title,text,action){
    return '<section class="panel card e133-empty"><h3>'+esc(title)+'</h3><p>'+esc(text)+'</p>'+(action?'<div>'+action+'</div>':'')+'</section>';
  }
  function metric(label,value,sub=''){
    return '<article class="metric"><b>'+esc(value)+'</b><small>'+esc(label)+'</small>'+(sub?'<span>'+esc(sub)+'</span>':'')+'</article>';
  }
  function renderOverview(){
    const s=stages().find(x=>x.id===state.stage)||{};
    const chapters=stageChapters();
    const activeLessons=lessons();
    return '<div class="e133-overview">'+
      '<section class="hero panel e133-hero"><span class="chip">'+esc(stageTitle(state.stage))+'</span><h3>'+esc(s.goal||'Lộ trình Toán Bauman theo giai đoạn')+'</h3><p>'+esc(s.period||s.duration||'')+'</p><div class="lesson-tools"><button class="btn primary" data-route-jump="learning">Tiếp tục học</button><button class="btn soft" data-route-jump="storage">Kiểm tra dữ liệu</button></div></section>'+
      '<section class="metric-grid">'+
        metric('Chương trong giai đoạn',chapters.length)+
        metric('Bài học đã nạp',activeLessons.length)+
        metric('Bài tập',arr(db.exercises).filter(x=>(x.stageId||x.stage)===state.stage).length)+
        metric('Câu kiểm tra',arr(db.question_bank).filter(x=>(x.stageId||x.stage)===state.stage).length)+
      '</section>'+
      '<section class="panel card"><div class="toolbar"><div><h3>Khung chương hiện tại</h3><p>Khung thật từ chapter_spine.json; nội dung rỗng được hiển thị đúng là rỗng.</p></div></div><div class="e133-chapters">'+
      (chapters.length?chapters.map(c=>'<article class="item-card"><b>'+esc(c.chapterTitle||c.globalChapterTitle||c.chapterName)+'</b><small>'+esc(c.primaryDisciplineTitle||c.departmentTitle||'')+'</small><small>Trạng thái: '+esc(c.contentStatus||'chưa xác định')+'</small></article>').join(''):empty('Chưa có chương','Không tìm thấy chapter_spine cho giai đoạn này.'))+
      '</div></section></div>';
  }
  function renderLearning(){
    const tab=learningTabs().some(x=>x[0]===state.learnTab)?state.learnTab:'theory';
    state.learnTab=tab;
    let body='';
    if(tab==='theory'){
      const xs=lessons(),chs=stageChapters();
      body=xs.length
        ? '<div class="list">'+xs.map(x=>'<article class="panel card"><span class="chip">'+esc(x.chapterId||x.stage||'Bài học')+'</span><h3>'+esc(A.lessonTitle?A.lessonTitle(x):(x.title||x.id))+'</h3><p>'+esc(A.lessonSubtitle?A.lessonSubtitle(x):(x.summary||''))+'</p></article>').join('')+'</div>'
        : '<div class="e133-discipline">'+empty('Khung đã có, học liệu lý thuyết chưa nạp','lessons.json hiện rỗng. Hệ thống không tự bịa bài học; hãy nạp nội dung qua Kho môn học.')+'<div class="e133-chapters">'+chs.map(c=>'<article class="item-card"><b>'+esc(c.chapterTitle||c.chapterName)+'</b><small>'+esc(c.targetOutcome||c.primaryDisciplineTitle||'')+'</small></article>').join('')+'</div></div>';
    }else{
      const map={exercises:['Bài tập',db.exercises],practice:['Ứng dụng',db.applications],review:['Ôn tập',db.review_packs],exam:['Kiểm tra',db.question_bank]};
      const [label,data]=map[tab]||['Nội dung',[]];
      const xs=arr(data).filter(x=>!state.stage||(x.stageId||x.stage)===state.stage);
      body=xs.length?'<div class="list">'+xs.map(x=>'<article class="panel card"><h3>'+esc(x.title||x.question||x.prompt||x.id||label)+'</h3><p>'+esc(x.summary||x.purpose||x.explanation||'')+'</p></article>').join('')+'</div>':empty(label+' chưa có dữ liệu','Nguồn JSON cho '+label.toLowerCase()+' hiện đang rỗng ở giai đoạn này.');
    }
    return '<div class="e133-learning"><div class="tabs e133-tabs">'+learningTabs().map(([id,icon,label])=>'<button type="button" class="btn '+(tab===id?'active':'')+'" data-learn-tab="'+esc(id)+'">'+esc(icon)+' '+esc(label)+'</button>').join('')+'</div>'+body+'</div>';
  }
  function renderDialogue(){
    const xs=arr(db.professor_qa).filter(x=>!state.stage||(x.stageId||x.stage)===state.stage);
    return xs.length?'<div class="list">'+xs.map(x=>'<article class="panel card"><h3>'+esc(x.question||x.title||x.id)+'</h3><p>'+esc(x.answer||x.hint||'')+'</p></article>').join('')+'</div>':empty('Vấn đáp chưa có dữ liệu','professor_qa.json hiện rỗng; tab vẫn hoạt động nhưng không giả lập câu hỏi.');
  }
  function renderSimulation(){
    const xs=arr(db.simulations).filter(x=>!state.stage||(x.stageId||x.stage)===state.stage);
    return xs.length?'<div class="list">'+xs.map(x=>'<article class="panel card"><h3>'+esc(x.title||x.id||'Mô phỏng')+'</h3><p>'+esc(x.description||x.purpose||'')+'</p></article>').join('')+'</div>':empty('Mô phỏng chưa có dữ liệu','simulations.json hiện rỗng. Khung runtime đã sẵn sàng để nạp lab thật.');
  }
  function renderMedia(){
    const xs=arr(db.videos).filter(x=>!state.stage||(x.stageId||x.stage)===state.stage);
    return xs.length?'<div class="list">'+xs.map(x=>'<article class="panel card"><h3>'+esc(x.title||x.id||'Tài nguyên')+'</h3><p>'+esc(x.purpose||x.url||'')+'</p></article>').join('')+'</div>':empty('Video/Tài nguyên chưa có dữ liệu','videos.json hiện rỗng hoặc chưa có tài nguyên cho giai đoạn này.');
  }
  function renderFormula(){
    const xs=arr(db.formulas).filter(x=>!state.stage||(x.stageId||x.stage)===state.stage);
    return xs.length?'<div class="list">'+xs.map(x=>'<article class="panel card"><h3>'+esc(x.title||x.formula||x.id||'Công thức')+'</h3><p>'+esc(x.meaning||x.rule||'')+'</p></article>').join('')+'</div>':empty('Công thức chưa có dữ liệu','formulas.json hiện rỗng.');
  }
  function renderMindmap(){
    const xs=arr(db.mindmap).filter(x=>!state.stage||(x.stageId||x.stage)===state.stage);
    return xs.length?'<div class="list">'+xs.map(x=>'<article class="panel card"><h3>'+esc(x.title||x.id||'Mind map')+'</h3></article>').join('')+'</div>':empty('Mind map chưa có dữ liệu','mindmap.json hiện rỗng.');
  }
  function renderStorage(){
    const order=['curriculum','discipline_spine','chapter_spine','lessons','formulas','exercises','applications','simulations','professor_qa','review_packs','question_bank','mindmap','videos'];
    return '<div class="e133-storage"><section class="panel card"><div class="toolbar"><div><h3>Trạng thái nguồn dữ liệu runtime</h3><p>Đọc trực tiếp JSON thật. Nguồn lỗi/rỗng được báo rõ.</p></div><button class="btn soft" data-reload-data>Đọc lại dữ liệu</button></div></section><section class="panel card e133-source-list">'+order.map(n=>{const s=sourceStatus[n]||{};return '<article class="e133-source '+(!s.ok?'error':'')+'"><div><b>'+esc(A.getDataSourceMeta?A.getDataSourceMeta(n).label:n)+'</b><small>'+esc(s.path||('data/'+n+'.json'))+'</small></div><span>'+(s.ok?(s.empty?'Rỗng':esc(s.count)):'Lỗi')+'</span><small>'+esc(!s.ok?s.error:'')+'</small></article>'}).join('')+'</section></div>';
  }
  function render(){
    normalizeStage();
    renderShell();
    routeMeta();
    const map={overview:renderOverview,learning:renderLearning,dialogue:renderDialogue,writing:renderSimulation,media:renderMedia,vocab:renderFormula,grammar:renderFormula,mindmap:renderMindmap,storage:renderStorage};
    const fn=map[state.view]||renderOverview;
    els.view.innerHTML=fn();
    els.view.dataset.coreRelease=RELEASE;
    saveState();
  }
  function setRoute(route){
    if(!navItems().some(x=>x[0]===route))route='overview';
    state.view=route;
    render();
    els.view?.focus({preventScroll:true});
  }
  function bind(){
    els.nav?.addEventListener('click',e=>{const b=e.target.closest('[data-route]');if(b)setRoute(b.dataset.route)});
    els.stage?.addEventListener('change',()=>{state.stage=els.stage.value;render()});
    els.view?.addEventListener('click',async e=>{
      const jump=e.target.closest('[data-route-jump]');if(jump){setRoute(jump.dataset.routeJump);return}
      const tab=e.target.closest('[data-learn-tab]');if(tab){state.learnTab=tab.dataset.learnTab;render();return}
      if(e.target.closest('[data-reload-data]')){setBusy(true);setSave('Đang đọc','ok');await loadData();render();setBusy(false);toast('Đã đọc lại dữ liệu')}
    });
    els.theme?.addEventListener('click',()=>{
      state.theme=document.documentElement.dataset.theme==='dark'?'light':'dark';
      document.documentElement.dataset.theme=state.theme;saveState();
    });
    els.ai?.addEventListener('click',()=>{
      if(!els.modal||!els.modalBody)return;
      els.modalBody.innerHTML='<h3>AI Mentor</h3><p>Runtime E134 đã khôi phục điều hướng và đọc dữ liệu. AI Mentor chưa được nối backend hội thoại trong repo này, nên nút không giả lập phản hồi.</p>';
      els.modal.classList.remove('hidden');
    });
    els.modalClose?.addEventListener('click',()=>els.modal.classList.add('hidden'));
    els.modal?.addEventListener('click',e=>{if(e.target===els.modal)els.modal.classList.add('hidden')});
    document.addEventListener('keydown',e=>{if(e.key==='Escape')els.modal?.classList.add('hidden')});
  }
  async function boot(){
    setBusy(true);setSave('Đang tải','ok');loadState();
    document.documentElement.dataset.theme=state.theme||'light';
    bind();
    await loadData();
    normalizeStage();
    render();
    setBusy(false);
    setSave(window.BaumanPlatformStorage?.mode==='memory-fallback'?'Lưu tạm':'Đã lưu',window.BaumanPlatformStorage?.mode==='memory-fallback'?'warning':'ok');
    window.BaumanMathCore={version:RELEASE,getState:()=>({...state}),getData:()=>db,reload:async()=>{await loadData();render()}};
  }
  boot().catch(err=>{setBusy(false);setSave('Lỗi runtime','error');if(els.view)els.view.innerHTML=empty('Không thể khởi động runtime',String(err?.message||err));console.error(err)});
})();