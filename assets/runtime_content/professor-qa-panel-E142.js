'use strict';
(function(){
  const RELEASE='E142_PROFESSOR_QA_UI_INTEGRATION';
  let observer=null,queued=false;
  function arr(v){return Array.isArray(v)?v:[];}
  function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function state(){return (window.__BAUMAN_CORE_API&&window.__BAUMAN_CORE_API.state)||window.__MATH_STATE||window.state||{};}
  function stageOf(x){
    if(x&&x.stage)return String(x.stage);
    const id=String((x&&(x.chapterId||x.lessonId||x.id))||'');
    if(id.indexOf('MATH-PREP-')===0)return 'prep';
    if(id.indexOf('MATH-HK1-')===0)return 'hk1';
    if(id.indexOf('MATH-HK2-')===0)return 'hk2';
    if(id.indexOf('MATH-HK3-')===0)return 'hk3';
    if(id.indexOf('MATH-HK4-')===0)return 'hk4';
    return 'vn';
  }
  function records(){
    const db=window.DB||{};
    const xs=arr(db.professor_qa);
    const st=String(state().stage||'vn');
    return xs.filter(x=>st==='all'||stageOf(x)===st);
  }
  function currentLessonId(){return String(state().lessonId||'');}
  function visibleRecords(){
    const xs=records(), lid=currentLessonId();
    const exact=lid?xs.filter(x=>String(x.lessonId||'')===lid):[];
    return exact.length?exact:xs;
  }
  function style(){
    if(document.getElementById('e142-professor-qa-style'))return;
    const el=document.createElement('style');
    el.id='e142-professor-qa-style';
    el.textContent=
      '.e142-professor-qa{margin:0 0 18px;padding:18px;border:1px solid var(--line,#dfe5ee);border-radius:20px;background:var(--panel,#fff);box-shadow:0 10px 30px rgba(15,23,42,.06)}'+
      '.e142-professor-qa header{display:flex;gap:16px;align-items:flex-start;justify-content:space-between;margin-bottom:12px}'+
      '.e142-professor-qa header span{font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;opacity:.72}'+
      '.e142-professor-qa header h2{margin:4px 0 6px;font-size:22px}'+
      '.e142-professor-qa header p{margin:0;max-width:760px;opacity:.75}'+
      '.e142-professor-qa .e142-count{min-width:82px;text-align:center;padding:10px 12px;border-radius:14px;background:rgba(99,102,241,.08);font-weight:800}'+
      '.e142-professor-list{display:grid;gap:10px}'+
      '.e142-professor-list details{border:1px solid var(--line,#e5e7eb);border-radius:14px;padding:12px 14px;background:rgba(248,250,252,.72)}'+
      '.e142-professor-list summary{cursor:pointer;font-weight:750;line-height:1.45}'+
      '.e142-professor-list p{margin:10px 0 0;line-height:1.65}'+
      '.e142-professor-list small{display:block;margin-top:8px;opacity:.65}';
    document.head.appendChild(el);
  }
  function html(xs){
    return '<section class="e142-professor-qa" data-e142-professor-qa="1"><header><div><span>Vấn đáp học thuật · E142</span><h2>Vấn đáp giáo sư</h2><p>Tự trả lời trước khi mở đáp án. Nội dung lấy từ professor_qa_content, còn luyện nói/application bên dưới vẫn giữ nguyên.</p></div><div class="e142-count">'+xs.length+' câu</div></header><div class="e142-professor-list">'+
      xs.map((x,i)=>'<details><summary>'+(i+1)+'. '+esc(x.question||x.question_vi||x.title||'Câu hỏi')+'</summary><p>'+esc(x.answer||x.answer_vi||'Chưa có đáp án')+'</p><small>'+esc((x.lessonId||'')+(x.chapterId?' · '+x.chapterId:''))+'</small></details>').join('')+
      '</div></section>';
  }
  function renderPanel(){
    queued=false;
    const host=document.querySelector('#view');
    if(!host)return;
    const old=host.querySelector('[data-e142-professor-qa="1"]');
    if(String(state().view||'')!=='dialogue'){if(old)old.remove();return;}
    if(!window.__BAUMAN_MATH_E140_VAULT_BRIDGE__||window.__BAUMAN_MATH_E140_VAULT_BRIDGE__.loaded!==true)return;
    const xs=visibleRecords();
    if(!xs.length){if(old)old.remove();return;}
    style();
    const marker=xs.map(x=>x.qaId||x.id).join('|');
    if(old&&old.getAttribute('data-e142-key')===marker)return;
    if(old)old.remove();
    const wrap=document.createElement('div');
    wrap.innerHTML=html(xs);
    const panel=wrap.firstElementChild;
    panel.setAttribute('data-e142-key',marker);
    host.insertBefore(panel,host.firstChild);
  }
  function queue(){if(queued)return;queued=true;setTimeout(renderPanel,30);}
  function boot(){
    const host=document.querySelector('#view');
    if(!host){setTimeout(boot,100);return;}
    observer=new MutationObserver(queue);
    observer.observe(host,{childList:true,subtree:false});
    queue();
    window.__BAUMAN_MATH_E142_PROFESSOR_QA__={release:RELEASE,loaded:true};
  }
  window.BAUMAN_MATH_E142_SELF_CHECK=function(){
    const db=window.DB||{}, q=arr(db.professor_qa), mm=arr(db.mindmap);
    return {
      ok:!!(window.__BAUMAN_MATH_E140_VAULT_BRIDGE__&&window.__BAUMAN_MATH_E140_VAULT_BRIDGE__.loaded)&&q.length>=8&&mm.length>=8,
      release:RELEASE,professorQaCount:q.length,mindmapCount:mm.length,
      panelVisible:!!document.querySelector('[data-e142-professor-qa="1"]')
    };
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
