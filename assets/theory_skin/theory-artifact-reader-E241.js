/* E241 · Multi-lesson Reference / Full View artifact reader
 * Consumes the E244 lesson registry for §1.4 and §1.5.
 * Keeps Reader Pro, formula modal, E234 and E235 intact.
 */
(function(){
  'use strict';

  var RELEASE='E241_MULTI_LESSON_REFERENCE_FULL_VIEW_READER';
  var cacheByLesson={};
  var modal=null,scheduled=false;

  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function text(n){return String(n&&n.textContent||'').replace(/\s+/g,' ').trim();}
  function arr(v){return Array.isArray(v)?v:[];}
  function value(v){if(Array.isArray(v))return v.join(', ');if(v&&typeof v==='object')return JSON.stringify(v);return String(v==null?'':v);}
  function state(){try{return (window.__BAUMAN_CORE_API&&window.__BAUMAN_CORE_API.state)||window.__MATH_STATE||{};}catch(_){return window.__MATH_STATE||{};}}
  function deck(){return document.querySelector('.e132-overlay-deck.open');}
  function registry(){return window.BAUMAN_MATH_THEORY_ARTIFACT_REGISTRY_E244||null;}

  function candidates(){
    var s=state(), values=[];
    ['lessonId','currentLessonId','selectedLessonId','e129LessonId','theoryLessonId','activeLessonId','lessonTitle','currentLessonTitle','selectedTheoryTitle'].forEach(function(k){if(s&&s[k])values.push(String(s[k]));});
    var d=deck();
    if(d){
      ['[data-e210-lesson-id]','.e132-clean-side small','.e132-clean-main h1','.e210-source-line'].forEach(function(sel){var n=d.querySelector(sel);if(n)values.push(text(n));});
    }
    return values;
  }

  function activeEntry(){var r=registry();return r&&r.resolve?r.resolve(candidates()):null;}
  function registerOptionalSources(){var r=registry();return !!(r&&r.register&&r.register());}

  function cacheFor(entry){
    if(!entry)return null;
    return cacheByLesson[entry.lessonId]||(cacheByLesson[entry.lessonId]={reference:null,fullView:null,normalization:null,promise:null,error:null});
  }

  function fetchJson(entry,spec){
    return fetch(spec.path,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error(spec.path+' HTTP '+r.status);return r.json();}).then(function(j){
      if(!j||j.lessonId!==entry.lessonId)throw new Error(spec.path+' lessonId mismatch');
      if(j.version!==spec.version)throw new Error(spec.path+' version mismatch: '+String(j.version||''));
      return j;
    });
  }

  function loadArtifacts(entry){
    entry=entry||activeEntry();
    if(!entry)return Promise.reject(new Error('Không xác định được bài học đang mở.'));
    var cache=cacheFor(entry);
    if(cache.reference&&cache.fullView&&cache.normalization)return Promise.resolve(cache);
    if(cache.promise)return cache.promise;
    cache.promise=Promise.all([
      fetchJson(entry,entry.reference),
      fetchJson(entry,entry.fullView),
      fetchJson(entry,entry.normalization)
    ]).then(function(items){
      cache.reference=items[0];cache.fullView=items[1];cache.normalization=items[2];cache.error=null;return cache;
    }).catch(function(e){cache.error=String(e&&e.message||e);throw e;}).finally(function(){cache.promise=null;});
    return cache.promise;
  }

  function canonicalFormula(raw,bundle){
    var v=String(raw||'').trim(), n=bundle&&bundle.normalization;
    if(!v||!n)return v;
    var hit=null;
    arr(n.canonicalFormulaRegistry).some(function(item){
      var aliases=arr(item.sourceAliases).concat([item.canonicalText]);
      if(aliases.some(function(alias){return String(alias||'').trim()===v;})){hit=item;return true;}
      return false;
    });
    return hit&&hit.canonicalText?hit.canonicalText:v;
  }

  function ensureStyle(){
    if(document.getElementById('e241-artifact-style'))return;
    var st=document.createElement('style');st.id='e241-artifact-style';st.textContent=''
      +'.e241-actions{display:flex;flex-wrap:wrap;gap:9px;margin-top:12px}'
      +'.e241-btn{border:1px solid rgba(125,211,252,.38);border-radius:999px;background:rgba(8,47,73,.76);color:#eaf8ff;padding:8px 12px;font:800 12px/1 system-ui;cursor:pointer}'
      +'.e241-btn:hover{background:rgba(14,116,144,.9)}'
      +'.e241-btn.reference{border-color:rgba(167,139,250,.46);background:rgba(55,30,96,.8)}'
      +'.e241-btn.full{border-color:rgba(45,212,191,.48);background:rgba(6,78,78,.82)}'
      +'.e241-reference-summary{cursor:pointer}'
      +'.e241-reference-summary .e241-open-inline{margin-top:10px}'
      +'.e241-modal{position:fixed;inset:0;z-index:2147483620;display:grid;place-items:center;padding:22px;background:rgba(1,6,14,.91);backdrop-filter:blur(12px)}'
      +'.e241-modal.hidden{display:none}'
      +'.e241-shell{width:min(1180px,95vw);height:min(820px,92vh);display:grid;grid-template-rows:auto minmax(0,1fr);overflow:hidden;border:1px solid rgba(125,211,252,.36);border-radius:24px;background:linear-gradient(145deg,#081522,#0b2431 48%,#111a2d);box-shadow:0 30px 100px rgba(0,0,0,.72);color:#eaf7ff}'
      +'.e241-head{display:flex;gap:18px;align-items:flex-start;justify-content:space-between;padding:18px 20px;border-bottom:1px solid rgba(125,211,252,.2)}'
      +'.e241-head h2{margin:0;font-size:clamp(22px,2.3vw,32px)}'
      +'.e241-head p{margin:6px 0 0;color:#b8d7e8}'
      +'.e241-close{border:1px solid rgba(255,255,255,.25);border-radius:999px;background:#07101b;color:#fff;padding:8px 12px;cursor:pointer}'
      +'.e241-body{overflow:auto;padding:20px;scrollbar-width:thin}'
      +'.e241-section{margin:0 0 18px;padding:17px;border:1px solid rgba(125,211,252,.2);border-radius:18px;background:rgba(4,15,27,.56)}'
      +'.e241-section h3{margin:0 0 9px;font-size:20px;color:#f8fcff}'
      +'.e241-section h4{margin:14px 0 7px;color:#a7f3d0}'
      +'.e241-section p,.e241-section li{line-height:1.58;color:#d9edf7}'
      +'.e241-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(245px,1fr));gap:12px}'
      +'.e241-card{padding:13px;border:1px solid rgba(125,211,252,.18);border-radius:14px;background:rgba(8,32,50,.68)}'
      +'.e241-card h4{margin:0 0 7px}'
      +'.e241-formula{white-space:pre-wrap;overflow-wrap:anywhere;padding:11px;border-radius:12px;background:rgba(3,9,17,.85);color:#fff4c7}'
      +'.e241-warning{border-left:4px solid #f59e0b;padding-left:12px}'
      +'.e241-condition{border-left:4px solid #22d3ee;padding-left:12px}'
      +'.e241-table{width:100%;border-collapse:collapse}'
      +'.e241-table th,.e241-table td{border-bottom:1px solid rgba(125,211,252,.16);padding:9px;text-align:left;vertical-align:top}'
      +'@media(max-width:720px){.e241-modal{padding:8px}.e241-shell{width:98vw;height:96vh;border-radius:16px}.e241-body{padding:12px}.e241-head{padding:14px}.e241-table{display:block;overflow:auto}}';
    document.head.appendChild(st);
  }

  function ensureModal(){
    ensureStyle();
    if(modal)return modal;
    modal=document.createElement('div');modal.className='e241-modal hidden';modal.setAttribute('aria-hidden','true');
    modal.innerHTML='<div class="e241-shell" role="dialog" aria-modal="true"><header class="e241-head"><div><h2 data-e241-title></h2><p data-e241-sub></p></div><button class="e241-close" type="button" data-e241-close>Đóng</button></header><main class="e241-body" data-e241-body></main></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click',function(e){if(e.target===modal||e.target.closest('[data-e241-close]'))closeModal();});
    return modal;
  }

  function openModal(title,sub,html){var m=ensureModal();m.querySelector('[data-e241-title]').textContent=title||'';m.querySelector('[data-e241-sub]').textContent=sub||'';m.querySelector('[data-e241-body]').innerHTML=html;m.classList.remove('hidden');m.setAttribute('aria-hidden','false');}
  function closeModal(){if(!modal)return;modal.classList.add('hidden');modal.setAttribute('aria-hidden','true');modal.querySelector('[data-e241-body]').innerHTML='';}
  function listHtml(items){return '<ul>'+arr(items).map(function(x){return '<li>'+esc(typeof x==='string'?x:(x.label||x.text||x.meaning||value(x)))+'</li>';}).join('')+'</ul>';}
  function tableHtml(headers,rows){return '<table class="e241-table"><thead><tr>'+headers.map(function(h){return '<th>'+esc(h.label)+'</th>';}).join('')+'</tr></thead><tbody>'+arr(rows).map(function(row){return '<tr>'+headers.map(function(h){return '<td>'+esc(value(row&&row[h.key]))+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table>';}

  function workedCaseL04(c){
    c=c||{};var velocity=c.worldVelocity||{},basis=c.routeBasis||{},transform=c.transform||{},route=c.routeCoordinates||{},checks=c.checks||{};
    return '<div class="e241-grid"><article class="e241-card"><h4>World velocity</h4><pre class="e241-formula">'+esc((velocity.symbol||'[v]_W')+' = ('+arr(velocity.value).join(', ')+') '+(velocity.units||''))+'</pre></article>'
      +'<article class="e241-card"><h4>Route basis</h4><p>t = ('+esc(arr(basis.t).join(', '))+')</p><p>n_left = ('+esc(arr(basis.nLeft).join(', '))+')</p></article>'
      +'<article class="e241-card"><h4>Transform</h4><pre class="e241-formula">'+esc((transform.symbol||'P')+' = '+JSON.stringify(transform.matrix||[]))+'</pre></article>'
      +'<article class="e241-card"><h4>Route coordinates</h4><pre class="e241-formula">'+esc((route.symbol||'[v]_R')+' = ('+arr(route.value).join(', ')+')')+'</pre><p>'+esc(route.interpretation)+'</p></article>'
      +'<article class="e241-card"><h4>Checks</h4><p>Residual norm: '+esc(checks.residualNorm)+'</p><p>Norm² world/route: '+esc(checks.worldNormSquared)+' / '+esc(checks.routeNormSquared)+'</p></article></div>';
  }

  function referenceHtmlL04(r,bundle){
    var concepts=arr(r.conceptMap&&r.conceptMap.entries), formulas=arr(r.formulaTable), notation=arr(r.notationLookup);
    return '<section class="e241-section"><h3>Luận đề tra cứu</h3><p>'+esc(r.conceptMap&&r.conceptMap.thesis||r.purpose||'')+'</p></section>'
      +'<section class="e241-section"><h3>R01 · Bản đồ khái niệm</h3><div class="e241-grid">'+concepts.map(function(x){return '<article class="e241-card"><h4>'+esc(x.term)+'</h4><p>'+esc(x.compactDefinition)+'</p><p><b>Câu hỏi:</b> '+esc(x.keyQuestion)+'</p></article>';}).join('')+'</div></section>'
      +'<section class="e241-section"><h3>R02 · Bảng công thức</h3>'+formulas.map(function(x){return '<article class="e241-card"><h4>'+esc(x.name)+'</h4><pre class="e241-formula">'+esc(canonicalFormula(x.formula,bundle))+'</pre><p>'+esc(x.answers)+'</p><p class="e241-condition"><b>Điều kiện:</b> '+esc(x.conditions)+'</p><p class="e241-warning"><b>Cảnh báo:</b> '+esc(x.warning)+'</p></article>';}).join('')+'</section>'
      +'<section class="e241-section"><h3>R03 · Phân loại họ biểu diễn</h3>'+tableHtml([{key:'family',label:'Họ biểu diễn'},{key:'spansTarget',label:'Sinh target'},{key:'independent',label:'Độc lập'},{key:'existence',label:'Tồn tại'},{key:'uniqueness',label:'Duy nhất'}],r.familyComparison)+'</section>'
      +'<section class="e241-section"><h3>R04 · Chọn phương pháp</h3>'+tableHtml([{key:'situation',label:'Tình huống'},{key:'use',label:'Nên dùng'},{key:'avoid',label:'Tránh'}],r.methodDecisionTable)+'</section>'
      +'<section class="e241-section"><h3>R05 · Cổng kiểm tra kỹ thuật</h3>'+tableHtml([{key:'gate',label:'Cổng'},{key:'question',label:'Câu hỏi kiểm'},{key:'failAction',label:'Khi không đạt'}],r.assumptionChecklist)+'</section>'
      +'<section class="e241-section"><h3>R06 · Lỗi và chẩn đoán nhanh</h3>'+tableHtml([{key:'failure',label:'Lỗi'},{key:'symptom',label:'Triệu chứng'},{key:'diagnosis',label:'Chẩn đoán'},{key:'repair',label:'Cách sửa'}],r.failureQuickGuide)+'</section>'
      +'<section class="e241-section"><h3>R07 · Case UGV</h3>'+workedCaseL04(r.workedCaseSnapshot)+'</section>'
      +'<section class="e241-section"><h3>Ký hiệu nhanh</h3>'+tableHtml([{key:'symbol',label:'Ký hiệu'},{key:'meaning',label:'Ý nghĩa'}],notation)+'</section>';
  }

  function caseHtmlL05(c){
    c=c||{};var normal=c.normalSample||{}, mismatch=c.mismatchSample||{}, matrix=c.calibrationMatrix||{};
    return '<div class="e241-grid">'
      +'<article class="e241-card"><h4>Contract</h4><p>'+esc(c.caseId||'')+' · '+esc(c.version||'')+'</p><p>Order: '+esc(arr(c.featureOrder).join(' → '))+'</p><p>Units: '+esc(c.units||'')+'</p></article>'
      +'<article class="e241-card"><h4>Mean và basis</h4><pre class="e241-formula">μ = '+esc(JSON.stringify(c.mean||[]))+'\nQ = '+esc(JSON.stringify(c.Q||[]))+'</pre></article>'
      +'<article class="e241-card"><h4>Normal sample</h4><p>z_Q = '+esc(JSON.stringify(normal.zQ||[]))+'</p><p>r = '+esc(JSON.stringify(normal.r||[]))+'</p><p>score = '+esc(normal.score)+'</p><p>'+esc(normal.interpretation)+'</p></article>'
      +'<article class="e241-card"><h4>Mismatch sample</h4><p>z_Q = '+esc(JSON.stringify(mismatch.zQ||[]))+'</p><p>r = '+esc(JSON.stringify(mismatch.r||[]))+'</p><p>score = '+esc(mismatch.score)+'</p><p>'+esc(mismatch.interpretation)+'</p></article>'
      +'<article class="e241-card"><h4>Rank / SVD</h4><p>σ = '+esc(JSON.stringify(matrix.singularValues||[]))+'</p><p>Floating rank: '+esc(matrix.floatingPointRank)+'</p><p>rank_τ: '+esc(matrix.numericalRank)+' under τ='+esc(matrix.tau)+'</p><p>ρ₂: '+esc(matrix.retainedEnergyK2)+'</p></article>'
      +'</div>';
  }

  function referenceHtmlL05(r,bundle){
    var formulas=arr(r.formulaTable), terms=arr(r.terminologyLookup), limits=r.interpretationLimits||{};
    return '<section class="e241-section"><h3>Luận đề tra cứu</h3><p>'+esc(r.purpose||'')+'</p></section>'
      +'<section class="e241-section"><h3>R01 · Phân loại mô hình</h3>'+tableHtml([{key:'object',label:'Đối tượng'},{key:'tests',label:'Cổng kiểm'},{key:'classification',label:'Phân loại'},{key:'language',label:'Cách nói chuẩn'},{key:'warning',label:'Cảnh báo'}],r.modelClassification&&r.modelClassification.decisionTable)+'</section>'
      +'<section class="e241-section"><h3>R02 · Bảng công thức F01–F16</h3>'+formulas.map(function(x){return '<article class="e241-card"><h4>'+esc(x.id+' · '+x.name)+'</h4><pre class="e241-formula">'+esc(canonicalFormula(x.formula,bundle))+'</pre><p>'+esc(x.answers)+'</p><p class="e241-condition"><b>Điều kiện:</b> '+esc(x.conditions)+'</p><p><b>Kiểm:</b> '+esc(x.checks)+'</p><p class="e241-warning"><b>Cảnh báo:</b> '+esc(x.warning)+'</p></article>';}).join('')+'</section>'
      +'<section class="e241-section"><h3>R03 · Chọn projector</h3>'+tableHtml([{key:'case',label:'Basis gate'},{key:'coordinates',label:'Coordinates'},{key:'projector',label:'Projector'},{key:'recommendedComputation',label:'Cách tính'},{key:'reject',label:'Loại bỏ'}],r.projectorSelection)+'</section>'
      +'<section class="e241-section"><h3>R04 · Báo cáo rank</h3>'+tableHtml([{key:'label',label:'Loại kết quả'},{key:'requiredFields',label:'Bắt buộc nêu'},{key:'example',label:'Ví dụ đúng'},{key:'forbidden',label:'Không được nói'}],r.rankReporting)+'</section>'
      +'<section class="e241-section"><h3>R05 · Preprocessing gate</h3>'+tableHtml([{key:'check',label:'Cổng'},{key:'lockedValue',label:'Giá trị khóa'},{key:'failure',label:'Sai thì sao'}],r.preprocessingGate)+'</section>'
      +'<section class="e241-section"><h3>R06 · Case bốn cảm biến</h3>'+caseHtmlL05(r.caseLookup)+'</section>'
      +'<section class="e241-section"><h3>R07 · Troubleshooting M01–M25</h3>'+tableHtml([{key:'ids',label:'IDs'},{key:'symptom',label:'Triệu chứng'},{key:'rootCause',label:'Nguyên nhân'},{key:'evidence',label:'Bằng chứng'},{key:'repair',label:'Cách sửa'}],r.troubleshootingMatrix)+'</section>'
      +'<section class="e241-section"><h3>R08 · Thuật ngữ Việt–Anh–Nga</h3>'+tableHtml([{key:'id',label:'ID'},{key:'vi',label:'Việt'},{key:'en',label:'English'},{key:'ru',label:'Русский'}],terms)+'</section>'
      +'<section class="e241-section"><h3>Giới hạn kết luận</h3><div class="e241-grid"><article class="e241-card e241-condition"><h4>Được phép</h4>'+listHtml(limits.permitted)+'</article><article class="e241-card e241-warning"><h4>Bị cấm</h4>'+listHtml(limits.prohibited)+'</article></div></section>';
  }

  function referenceHtml(r,bundle){return r&&r.modelClassification?referenceHtmlL05(r,bundle):referenceHtmlL04(r,bundle);}

  function fullBlockHtml(b,bundle){
    if(!b||typeof b!=='object')return '<p>'+esc(b)+'</p>';
    var type=String(b.type||'').toLowerCase();
    if(type==='formula')return '<article class="e241-card"><pre class="e241-formula">'+esc(canonicalFormula(b.formula||b.text||b.calculation,bundle))+'</pre>'+(b.meaning?'<p>'+esc(b.meaning)+'</p>':'')+(b.conditions?'<div class="e241-condition"><b>Điều kiện</b>'+listHtml(b.conditions)+'</div>':'')+(b.warning?'<p class="e241-warning"><b>Cảnh báo:</b> '+esc(b.warning)+'</p>':'')+'</article>';
    if(type==='definition')return '<article class="e241-card"><h4>'+esc(b.term||'Định nghĩa')+'</h4><p>'+esc(b.text)+'</p></article>';
    if(type==='comparison'){
      if(arr(b.items).length)return '<div class="e241-grid">'+arr(b.items).map(function(x){return '<article class="e241-card"><h4>'+esc(x.label)+'</h4><p>'+esc(x.meaning||x.text)+'</p></article>';}).join('')+'</div>';
      return '<div class="e241-grid"><article class="e241-card"><h4>Vế trái</h4><p>'+esc(b.left)+'</p></article><article class="e241-card"><h4>Vế phải</h4><p>'+esc(b.right)+'</p></article></div>';
    }
    if(type==='derivation')return '<article class="e241-card"><h4>Suy luận</h4>'+listHtml(b.steps)+(b.conclusion?'<p><b>Kết luận:</b> '+esc(b.conclusion)+'</p>':'')+'</article>';
    if(type==='example')return '<article class="e241-card"><h4>'+esc(b.title||'Ví dụ')+'</h4>'+(b.setup?'<p><b>Thiết lập:</b> '+esc(b.setup)+'</p>':'')+(b.text?'<p>'+esc(b.text)+'</p>':'')+(b.steps?listHtml(b.steps):'')+(b.reconstruction?'<p><b>Reconstruction:</b> '+esc(b.reconstruction)+'</p>':'')+'</article>';
    if(type==='worked_step')return '<article class="e241-card"><h4>'+esc(b.label||b.title||'Bước tính')+'</h4><pre class="e241-formula">'+esc(b.calculation||b.text||'')+'</pre></article>';
    if(type==='check'||type==='checklist')return '<article class="e241-card"><h4>Tự kiểm</h4>'+listHtml(b.items||b.steps)+'</article>';
    if(type==='warning'||type==='failure')return '<p class="e241-warning"><b>'+(type==='failure'?'Lỗi:':'Cảnh báo:')+'</b> '+esc(b.text||b.body)+'</p>';
    if(type==='condition'||type==='contract')return '<p class="e241-condition"><b>'+(type==='contract'?'Hợp đồng:':'Điều kiện:')+'</b> '+esc(b.text||b.body)+'</p>';
    if(type==='summary'&&b.items)return '<article class="e241-card"><h4>Tổng kết</h4>'+listHtml(b.items)+'</article>';
    if(type==='decision_path'||type==='transfer'||type==='mastery'||type==='result'||type==='shape'||type==='lead'||type==='explanation'||type==='text')return '<article class="e241-card">'+(b.title?'<h4>'+esc(b.title)+'</h4>':'')+'<p>'+esc(b.text||b.body||b.lead||b.summary||b.meaning||'')+'</p></article>';
    if(b.items)return '<article class="e241-card">'+(b.title?'<h4>'+esc(b.title)+'</h4>':'')+listHtml(b.items)+'</article>';
    return '<p>'+esc(b.text||b.body||b.lead||b.summary||b.meaning||b.calculation||'')+'</p>';
  }

  function fullViewHtml(f,bundle){return arr(f.readingFlow).map(function(section,index){return '<section class="e241-section" id="e241-'+esc(section.id||String(index+1))+'"><h3>'+(index+1)+'. '+esc(section.title)+'</h3>'+(section.lead?'<p><b>'+esc(section.lead)+'</b></p>':'')+arr(section.blocks).map(function(b){return fullBlockHtml(b,bundle);}).join('')+'</section>';}).join('');}

  function showReference(){
    var entry=activeEntry();
    if(!entry)return false;
    loadArtifacts(entry).then(function(bundle){var count=arr(bundle.reference.informationArchitecture).length;openModal(bundle.reference.displayTitle||'Tham khảo thêm',bundle.reference.version+' · '+count+' khu tra cứu',referenceHtml(bundle.reference,bundle));}).catch(function(e){openModal('Không tải được Tham khảo thêm',RELEASE,'<section class="e241-section"><p>'+esc(e&&e.message||e)+'</p></section>');});
    return true;
  }

  function showFullView(){
    var entry=activeEntry();
    if(!entry)return false;
    loadArtifacts(entry).then(function(bundle){openModal(bundle.fullView.displayTitle||'Xem đầy đủ',bundle.fullView.version+' · '+arr(bundle.fullView.readingFlow).length+' phần',fullViewHtml(bundle.fullView,bundle));}).catch(function(e){openModal('Không tải được Xem đầy đủ',RELEASE,'<section class="e241-section"><p>'+esc(e&&e.message||e)+'</p></section>');});
    return true;
  }

  function clearControls(d){
    if(!d)return;
    var actions=d.querySelector('.e241-actions');if(actions)actions.remove();
    var panel=d.querySelector('.e211-summary-panel.e241-reference-summary');if(panel){panel.classList.remove('e241-reference-summary');panel.removeAttribute('data-e241-reference');}
  }

  function ensureControls(){
    registerOptionalSources();
    var d=deck();if(!d||!d.classList.contains('e211-reader-pro'))return false;
    var entry=activeEntry();
    if(!entry){clearControls(d);return false;}
    var formulaBtn=d.querySelector('[data-e211-formula-full]');if(formulaBtn&&formulaBtn.textContent!=='Công thức đầy đủ')formulaBtn.textContent='Công thức đầy đủ';
    var existing=d.querySelector('.e241-actions');
    if(existing&&existing.getAttribute('data-e241-lesson-id')!==entry.lessonId){existing.remove();existing=null;}
    var host=d.querySelector('.e202-hero-copy')||d.querySelector('.e132-clean-main');if(!host)return false;
    if(!existing){
      existing=document.createElement('div');existing.className='e241-actions';existing.setAttribute('data-e241-lesson-id',entry.lessonId);
      existing.innerHTML='<button type="button" class="e241-btn reference" data-e241-reference>Tham khảo thêm</button><button type="button" class="e241-btn full" data-e241-full>Xem đầy đủ</button>';host.appendChild(existing);
    }
    loadArtifacts(entry).then(function(bundle){
      var panel=d.querySelector('.e211-summary-panel');if(!panel)return;
      panel.classList.add('e241-reference-summary');panel.setAttribute('data-e241-reference','');panel.setAttribute('data-e241-lesson-id',entry.lessonId);
      var count=arr(bundle.reference.informationArchitecture).length;
      var lead=(bundle.reference.conceptMap&&bundle.reference.conceptMap.thesis)||bundle.reference.purpose||'';
      panel.innerHTML='<h3 class="e211-panel-title">Tham khảo thêm</h3><p class="e211-summary-lead">'+esc(lead)+'</p><button type="button" class="e241-btn reference e241-open-inline">Mở '+count+' khu tra cứu</button>';
    }).catch(function(){});
    return true;
  }

  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;ensureControls();});}
  function boot(){
    ensureStyle();registerOptionalSources();schedule();
    try{new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});}catch(_){}
    document.addEventListener('click',function(e){if(e.target&&e.target.closest('[data-e241-reference]')){e.preventDefault();e.stopPropagation();showReference();return;}if(e.target&&e.target.closest('[data-e241-full]')){e.preventDefault();e.stopPropagation();showFullView();}},true);
    window.addEventListener('keydown',function(e){if(e.key==='Escape'&&modal&&!modal.classList.contains('hidden')){e.preventDefault();e.stopPropagation();if(e.stopImmediatePropagation)e.stopImmediatePropagation();closeModal();}},true);
  }

  window.BAUMAN_MATH_E241_ARTIFACT_READER={
    release:RELEASE,
    registry:registry,
    active:activeEntry,
    load:function(lessonId){var r=registry(),entry=lessonId&&r&&r.get?r.get(lessonId):activeEntry();return loadArtifacts(entry);},
    showReference:showReference,
    showFullView:showFullView,
    apply:ensureControls,
    selfCheck:function(){
      var entry=activeEntry(),cache=entry&&cacheFor(entry);
      return {ok:!!registry(),release:RELEASE,multiLesson:true,activeLessonId:entry&&entry.lessonId||'',registeredLessons:registry()&&registry().list?registry().list().length:0,referenceLoaded:!!(cache&&cache.reference),fullViewLoaded:!!(cache&&cache.fullView),normalizationLoaded:!!(cache&&cache.normalization),formulaPopupSeparate:true,newSlideshowEngineCreated:false,e235Modified:false,error:cache&&cache.error||null};
    }
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();
