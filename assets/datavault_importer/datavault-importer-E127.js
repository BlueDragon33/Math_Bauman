/* E127 · DataVault Importer · Theory live import/merge/rollback/export */
(function(){
  'use strict';
  var RELEASE='E127_DATAVAULT_THEORY_IMPORTER';
  var STORE_KEY='bauman_math_e127_saved_lessons_v1';
  var BACKUP_KEY='bauman_math_e127_backup_lessons_v1';
  var REPORT_KEY='bauman_math_e127_last_report_v1';
  var REQUIRED_ROLES=['problem_framing','deep_essence','counter_intuition','real_bridge','notation','core_formula','assumption_gate','mini_case','interpretation','simulation','common_mistakes','application','practice','professor_qa','bridge','takeaway'];
  function H(v){return String(v==null?'':v).replace(/[&<>"']/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});}
  function A(v){return Array.isArray(v)?v:[];}
  function S(v){return String(v==null?'':v);}
  function now(){try{return new Date().toISOString();}catch(_){return ''}}
  function db(){return window.DB||{};}
  function api(){return window.__BAUMAN_CORE_API||{};}
  function state(){return api().state||window.__MATH_STATE||{};}
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function safeJson(raw,fallback){try{return JSON.parse(raw)}catch(_){return fallback}}
  function localGet(k,fallback){try{return safeJson(localStorage.getItem(k)||'',fallback)}catch(_){return fallback}}
  function localSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}}
  function localDel(k){try{localStorage.removeItem(k)}catch(_){}}
  function lessonId(x){return S(x&& (x.lessonId||x.id)).trim();}
  function slideId(x){return S(x&&x.id).trim();}
  function sourceNo(x){var n=Number(x&& (x.sourceChapterNo||x.chapterNo||(x.sourceAnchors&&x.sourceAnchors.chapterNo))); return Number.isFinite(n)?n:0;}
  function sourceStageNo(x){var n=Number(x&& (x.sourceStageNo||(x.sourceAnchors&&x.sourceAnchors.stageNo))); return Number.isFinite(n)?n:null;}
  function stageOf(x){return S(x&& (x.sourceStageId||x.stageId||(x.sourceAnchors&&x.sourceAnchors.stageId)||x.stage));}
  function currentLessons(){return A(db().lessons);}
  function normalizeSlide(s,lesson,index){
    var out=(s&&typeof s==='object')?Object.assign({},s):{body:S(s)};
    out.role=out.role||REQUIRED_ROLES[index]||('slide_'+(index+1));
    out.id=out.id||((lesson.lessonId||lesson.id||'lesson')+'-S'+String(index+1).padStart(2,'0'));
    out.title=out.title||out.role.replace(/_/g,' ');
    if(!Array.isArray(out.blocks)){
      if(out.body||out.content||out.text){out.blocks=[{type:'section',title:out.title,body:S(out.body||out.content||out.text)}];}
      else out.blocks=[];
    }
    out.renderPolicy=out.renderPolicy||'safe_text_formula_blocks_only';
    return out;
  }
  function normalizeLesson(x,i){
    if(!x||typeof x!=='object')return null;
    var out=Object.assign({},x);
    out.lessonId=lessonId(out)||('E127-LESSON-'+Date.now()+'-'+i);
    out.id=out.id||out.lessonId;
    out.kind=out.kind||'theory';
    out.contentRole=out.contentRole||'theory_only';
    out.contentDepth=out.contentDepth||'deep_academic_verified';
    out.title=out.title||out.displayTitle||out.shortTitle||out.lessonTitle||out.lessonId;
    out.displayTitle=out.displayTitle||out.title;
    out.shortTitle=out.shortTitle||out.title;
    out.slides=A(out.slides).map(function(s,idx){return normalizeSlide(s,out,idx);});
    return out;
  }
  function extractPackage(parsed,fileName,forcedMode){
    var mode=forcedMode||'merge', target='lessons.json', rawLessons=[];
    if(Array.isArray(parsed)){rawLessons=parsed;}
    else if(parsed&&typeof parsed==='object'){
      if(parsed.target)target=S(parsed.target);
      if(parsed.mode)mode=S(parsed.mode);
      rawLessons=A(parsed.lessons).length?A(parsed.lessons):A(parsed.records).length?A(parsed.records):A(parsed.items).length?A(parsed.items):A(parsed.content).length?A(parsed.content):[];
      if(!rawLessons.length&&parsed.data&&typeof parsed.data==='object')rawLessons=A(parsed.data.lessons||parsed.data.records||parsed.data.items);
    }
    if(!['merge','replace','patch'].includes(mode))mode='merge';
    return {mode:mode,target:target,fileName:fileName||'import.json',lessons:rawLessons.map(normalizeLesson).filter(Boolean),packageType:S(parsed&&parsed.packageType||'')};
  }
  function scanBadText(obj){
    var s=''; try{s=JSON.stringify(obj);}catch(_){s='';}
    var bad=[];
    [[/<script/i,'script tag'],[/javascript\s*:/i,'javascript: URL'],[/onerror\s*=/i,'inline onerror'],[/\[object Object\]/,'[object Object]'],[/TODO|FIXME|lorem|placeholder/i,'TODO/FIXME/lorem/placeholder']].forEach(function(p){if(p[0].test(s))bad.push(p[1]);});
    return bad;
  }
  function validatePackage(pkg){
    var errors=[],warnings=[],seenLesson={},seenSlide={};
    if(!/lessons\.json$|^lessons$/i.test(pkg.target||''))errors.push({path:'target',message:'Gói này không nhắm tới lessons.json.'});
    if(!pkg.lessons.length)errors.push({path:'lessons',message:'Không tìm thấy lessons[] hợp lệ.'});
    var bad=scanBadText(pkg.lessons); if(bad.length)errors.push({path:'security',message:'Có mẫu nội dung nguy hiểm/bẩn: '+bad.join(', ')});
    pkg.lessons.forEach(function(l,idx){
      var id=lessonId(l);
      if(!id)errors.push({path:'lessons['+idx+'].lessonId',message:'Thiếu lessonId/id.'});
      if(seenLesson[id])errors.push({path:'lessons['+idx+'].lessonId',message:'Trùng lessonId trong gói: '+id});
      seenLesson[id]=1;
      var cn=sourceNo(l), sn=sourceStageNo(l), st=stageOf(l).toLowerCase();
      if(cn>=41||sn>=6||/phd|stage_[6-9]|tiến sĩ|tien si/i.test(st+' '+S(l.chapterTitle)+' '+S(l.title)))errors.push({path:id,message:'Gói có dấu hiệu mở PhD hoặc Chương 41–56. E127 chỉ nhập active Stage 0–5.'});
      if(pkg.mode!=='patch'&&!A(l.slides).length)errors.push({path:id+'.slides',message:'Lesson không có slides[].'});
      if(A(l.slides).length&&A(l.slides).length!==16)warnings.push({path:id+'.slides',message:'Không đủ 16 slide, hiện có '+A(l.slides).length+'.'});
      var roles=A(l.slides).map(function(s){return s.role;});
      REQUIRED_ROLES.forEach(function(r){if(roles.length&&!roles.includes(r))warnings.push({path:id+'.slides.role',message:'Thiếu role '+r});});
      A(l.slides).forEach(function(s,j){var sid=slideId(s)||id+'#'+j; if(seenSlide[sid])errors.push({path:id+'.slides['+j+'].id',message:'Trùng slideId: '+sid}); seenSlide[sid]=1;});
    });
    return {ok:!errors.length,errors:errors,warnings:warnings};
  }
  function mergeSlides(baseSlides,patchSlides,lessonIdValue){
    var out=A(baseSlides).map(clone), byId={}, byRole={};
    out.forEach(function(s,i){if(s.id)byId[s.id]=i;if(s.role)byRole[s.role]=i;});
    A(patchSlides).forEach(function(s,j){
      var key=s.id&&byId[s.id]!=null?byId[s.id]:(s.role&&byRole[s.role]!=null?byRole[s.role]:null);
      var ns=normalizeSlide(s,{lessonId:lessonIdValue},j);
      if(key==null){out.push(ns);}
      else{out[key]=Object.assign({},out[key],ns,{blocks:Array.isArray(ns.blocks)?ns.blocks:out[key].blocks});}
    });
    return out;
  }
  function applyPackage(pkg){
    var before=currentLessons();
    var current=before.map(clone), map={}; current.forEach(function(l,i){map[lessonId(l)]=i;});
    var inserted=0, updated=0, patched=0, ignored=0, sample=[];
    if(pkg.mode==='replace'){
      current=pkg.lessons.map(clone); inserted=current.length; sample=current.slice(0,8).map(lessonId);
    }else{
      pkg.lessons.forEach(function(l){
        var id=lessonId(l), idx=map[id]; sample.push(id);
        if(idx==null){current.push(clone(l)); map[id]=current.length-1; inserted++;}
        else if(pkg.mode==='patch'){
          var base=current[idx]; var nl=Object.assign({},base,clone(l)); if(A(l.slides).length)nl.slides=mergeSlides(base.slides,l.slides,id); current[idx]=nl; patched++;
        }else{current[idx]=clone(l); updated++;}
      });
    }
    return {lessons:current,stats:{before:before.length,after:current.length,inserted:inserted,updated:updated,patched:patched,ignored:ignored,sample:sample.slice(0,10)}};
  }
  function setReport(r){r.at=now(); localSet(REPORT_KEY,r); renderPanelSoon();}
  function getReport(){return localGet(REPORT_KEY,null);}
  function persistLessons(lessons,meta){return localSet(STORE_KEY,{version:RELEASE,at:now(),meta:meta||{},lessons:lessons});}
  function applySavedLessons(){
    var saved=localGet(STORE_KEY,null); if(!saved||!Array.isArray(saved.lessons)||!saved.lessons.length)return false;
    if(!window.DB)return false;
    window.DB.lessons=saved.lessons; return true;
  }
  function commit(raw,fileName,forcedMode){
    var parsed; try{parsed=typeof raw==='string'?JSON.parse(raw):raw;}catch(e){var er={ok:false,source:'lessons',fileName:fileName||'',errors:[{path:'JSON',message:'Lỗi cú pháp JSON: '+S(e.message||e)}],warnings:[]}; setReport(er); toast('JSON lỗi cú pháp','err'); return er;}
    var pkg=extractPackage(parsed,fileName,forcedMode||getMode());
    var val=validatePackage(pkg);
    if(!val.ok){var bad={ok:false,source:'lessons',fileName:pkg.fileName,mode:pkg.mode,beforeCount:currentLessons().length,afterCount:currentLessons().length,errors:val.errors,warnings:val.warnings}; setReport(bad); toast('Không nhập: gói Lý thuyết chưa đạt kiểm tra','err'); return bad;}
    localSet(BACKUP_KEY,{version:RELEASE,at:now(),lessons:currentLessons(),reason:'before '+pkg.fileName});
    var applied=applyPackage(pkg);
    window.DB.lessons=applied.lessons;
    persistLessons(applied.lessons,{fileName:pkg.fileName,mode:pkg.mode,stats:applied.stats});
    var report={ok:true,source:'lessons',sourceLabel:'Tab Lý thuyết · lessons.json',fileName:pkg.fileName,mode:pkg.mode,beforeCount:applied.stats.before,afterCount:applied.stats.after,inserted:applied.stats.inserted,updated:applied.stats.updated,patched:applied.stats.patched,ignored:applied.stats.ignored,errors:[],warnings:val.warnings,sample:applied.stats.sample,details:['Đã áp dụng vào DB.lessons runtime','Đã lưu overlay vào trình duyệt','Có thể rollback lượt nhập gần nhất hoặc xuất lessons.json mới']};
    setReport(report); try{api().render&&api().render();}catch(_){ } toast('Đã nhập Lý thuyết: '+applied.stats.before+' → '+applied.stats.after+' bài','ok'); return report;
  }
  function getMode(){var el=document.getElementById('e127Mode');return el?el.value:'merge';}
  function exportLessons(){
    var payload={packageType:'bauman.math.theory.patch',target:'lessons.json',mode:'replace',version:'E127_export_'+Date.now(),createdAt:now(),lessons:currentLessons()};
    downloadJson('lessons_E127_export.json',payload);
  }
  function downloadJson(name,data){var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});var a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(function(){URL.revokeObjectURL(a.href);a.remove();},300);}
  function rollback(){
    var b=localGet(BACKUP_KEY,null); if(!b||!Array.isArray(b.lessons)){toast('Chưa có backup để rollback','err');return;}
    window.DB.lessons=b.lessons; persistLessons(b.lessons,{mode:'rollback',from:b.at});
    var r={ok:true,source:'lessons',sourceLabel:'Tab Lý thuyết · lessons.json',fileName:'rollback',mode:'rollback',beforeCount:currentLessons().length,afterCount:b.lessons.length,inserted:0,updated:0,patched:0,ignored:0,errors:[],warnings:[],details:['Đã rollback về bản trước lượt nhập gần nhất']}; setReport(r); try{api().render&&api().render();}catch(_){ } toast('Đã rollback lessons.json','ok');
  }
  function clearOverlay(){localDel(STORE_KEY);localDel(BACKUP_KEY);setReport({ok:true,source:'lessons',sourceLabel:'Tab Lý thuyết · lessons.json',fileName:'clear_overlay',mode:'restore_original_on_reload',beforeCount:currentLessons().length,afterCount:currentLessons().length,errors:[],warnings:[],details:['Đã xóa overlay E127. Tải lại trang để đọc lessons.json gốc trong ZIP.']}); toast('Đã xóa overlay, hãy tải lại trang để về gốc','ok');}
  function reportHtml(){
    var r=getReport(); if(!r)return '<div class="e127-report warn"><header><h3>Chưa có lượt nhập nào</h3><small>Importer sẵn sàng</small></header><p>Chọn gói <code>bauman.math.theory.patch</code>, hoặc một file có <code>lessons[]</code>. Hệ thống sẽ kiểm trước khi nhập.</p></div>';
    var cls=r.ok?'ok':'err'; var errs=A(r.errors).map(function(e){return '<li><code>'+H(e.path||'')+'</code> '+H(e.message||e)+'</li>';}).join(''); var warns=A(r.warnings).slice(0,8).map(function(e){return '<li><code>'+H(e.path||'')+'</code> '+H(e.message||e)+'</li>';}).join(''); var details=A(r.details).map(function(x){return '<li>'+H(x)+'</li>';}).join(''); var sample=A(r.sample).slice(0,8).map(function(x){return '<code>'+H(x)+'</code>';}).join(' ');
    return '<div class="e127-report '+cls+'"><header><h3>'+(r.ok?'✅ Đã xử lý':'⚠️ Chưa nhập được')+'</h3><small>'+H(r.at||'')+'</small></header><div class="e127-grid"><div class="e127-stat"><b>'+H(r.beforeCount==null?'?':r.beforeCount)+'</b><span>Trước</span></div><div class="e127-stat"><b>'+H(r.afterCount==null?'?':r.afterCount)+'</b><span>Sau</span></div><div class="e127-stat"><b>'+H(r.inserted||0)+'/'+H(r.updated||0)+'/'+H(r.patched||0)+'</b><span>Thêm / thay / patch</span></div><div class="e127-stat"><b>'+H(r.mode||'')+'</b><span>Chế độ</span></div></div>'+(sample?'<p>Mẫu ID: '+sample+'</p>':'')+(details?'<ul>'+details+'</ul>':'')+(warns?'<h3>Cảnh báo</h3><ul>'+warns+'</ul>':'')+(errs?'<h3>Lỗi</h3><ul>'+errs+'</ul>':'')+'</div>';
  }
  function panelHtml(){
    var cnt=currentLessons().length; var saved=localGet(STORE_KEY,null); var backed=localGet(BACKUP_KEY,null);
    return '<section class="e127-importer-card" data-e127-panel="1"><div class="e127-head"><div><span class="e127-badge">E127 · DataVault Importer</span><h2>Cổng nhập Lý thuyết sống</h2><p>Nhập gói nội dung mới cho <b>Tab Lý thuyết</b> ngay trong Tab Dữ liệu. Có kiểm schema, chống lẫn PhD, merge/replace/patch, lưu overlay trong trình duyệt, rollback và export.</p></div><aside class="e127-status-pill"><b>'+H(cnt)+'</b><span>lessons hiện tại</span></aside></div><div class="e127-actions"><label class="btn primary">Nhập gói Lý thuyết<input id="e127ImportFile" type="file" accept=".json,application/json" hidden></label><button class="btn soft" data-e127-act="paste">Dán JSON</button><label class="e127-mode"><span>Chế độ</span><select id="e127Mode"><option value="merge">Merge · thêm/thay theo lessonId</option><option value="patch">Patch · sửa từng phần</option><option value="replace">Replace · thay toàn bộ lessons</option></select></label><button class="btn" data-e127-act="export">Xuất lessons hiện tại</button><button class="btn" data-e127-act="template">Form mẫu</button><button class="btn danger" data-e127-act="rollback" '+(backed?'':'disabled')+'>Rollback</button><button class="btn danger" data-e127-act="clear" '+(saved?'':'disabled')+'>Xóa overlay</button></div>'+reportHtml()+'</section>';
  }
  function injectPanel(){
    var view=document.getElementById('view'); if(!view)return;
    var isStorage=(state().view==='storage')||view.querySelector('.e112-storage-shell,.storage-vault-preview,.e114-storage-layout');
    if(!isStorage)return;
    if(view.querySelector('[data-e127-panel="1"]'))return;
    var wrap=document.createElement('div'); wrap.innerHTML=panelHtml(); view.insertBefore(wrap.firstElementChild,view.firstChild);
  }
  var renderTimer=null; function renderPanelSoon(){clearTimeout(renderTimer);renderTimer=setTimeout(function(){var p=document.querySelector('[data-e127-panel="1"]'); if(p){var tmp=document.createElement('div'); tmp.innerHTML=panelHtml(); p.replaceWith(tmp.firstElementChild);}else injectPanel();},80);}
  function toast(msg,cls){var t=document.createElement('div');t.className='e127-toast '+(cls||'');t.textContent=msg;document.body.appendChild(t);setTimeout(function(){t.remove();},3600);}
  function modal(html){var old=document.querySelector('.e127-modal-backdrop'); if(old)old.remove(); var m=document.createElement('div');m.className='e127-modal-backdrop';m.innerHTML='<div class="e127-modal">'+html+'</div>';document.body.appendChild(m);}
  function closeModal(){var m=document.querySelector('.e127-modal-backdrop'); if(m)m.remove();}
  function pasteModal(){modal('<header><div><span class="e127-badge">Dán JSON</span><h3>Nhập gói Lý thuyết</h3><p>Dán package có <code>lessons[]</code>. Chế độ lấy theo dropdown ở panel: merge, patch hoặc replace.</p></div><button class="e127-close" data-e127-act="close">×</button></header><textarea id="e127PasteText" placeholder="Dán JSON tại đây..."></textarea><div class="e127-modal-actions"><button class="e127-mini-btn" data-e127-act="close">Hủy</button><button class="e127-mini-btn primary" data-e127-act="apply-paste">Kiểm tra & nhập</button></div>');}
  function template(){
    var sample={packageType:'bauman.math.theory.patch',target:'lessons.json',mode:getMode(),version:'E127_patch_sample',createdAt:now(),lessons:[{id:'MATH-E127-SAMPLE-L01',lessonId:'MATH-E127-SAMPLE-L01',stage:'hk2',sourceStageNo:3,sourceChapterNo:30,sourceChapterId:'math_chapter_30',chapterTitle:'AI trong hệ xử lý thông tin và điều khiển tự động',title:'§E127 · Bài lý thuyết bổ sung mẫu',kind:'theory',contentRole:'theory_only',slides:REQUIRED_ROLES.map(function(role,i){return {id:'MATH-E127-SAMPLE-L01-S'+String(i+1).padStart(2,'0'),role:role,title:role.replace(/_/g,' '),blocks:[{type:'section',title:'Nội dung mẫu',body:'Thay đoạn này bằng nội dung học thuật đã kiểm.'}],renderPolicy:'safe_text_formula_blocks_only'};})}]};
    downloadJson('bauman_math_theory_patch_template_E127.json',sample);
  }
  document.addEventListener('change',function(e){
    if(e.target&&e.target.id==='e127ImportFile'){
      var file=e.target.files&&e.target.files[0]; if(!file)return; var rd=new FileReader(); rd.onload=function(ev){commit(String(ev.target.result||''),file.name,getMode());}; rd.readAsText(file); e.target.value='';
    }
  },true);
  document.addEventListener('click',function(e){
    var b=e.target.closest&&e.target.closest('[data-e127-act]'); if(!b)return; var act=b.getAttribute('data-e127-act');
    if(['paste','export','rollback','clear','template','close','apply-paste'].includes(act)){e.preventDefault();e.stopImmediatePropagation();}
    if(act==='paste')pasteModal();
    if(act==='export')exportLessons();
    if(act==='rollback')rollback();
    if(act==='clear')clearOverlay();
    if(act==='template')template();
    if(act==='close')closeModal();
    if(act==='apply-paste'){var raw=(document.getElementById('e127PasteText')||{}).value||'';var r=commit(raw,'pasted_theory_patch.json',getMode()); if(r&&r.ok)closeModal();}
  },true);
  var appliedSavedOnce=false;
  function boot(){
    if(window.DB&&Array.isArray(window.DB.lessons)){appliedSavedOnce=applySavedLessons()||appliedSavedOnce; injectPanel();}
    var obs=new MutationObserver(function(){injectPanel();});
    obs.observe(document.body,{childList:true,subtree:true});
    var ticks=0;
    var timer=setInterval(function(){
      ticks++;
      if(window.DB&&Array.isArray(window.DB.lessons)){
        if(!appliedSavedOnce)appliedSavedOnce=applySavedLessons()||appliedSavedOnce;
        injectPanel();
      }
      if(ticks>24||appliedSavedOnce)clearInterval(timer);
    },500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot); else boot();
  window.BAUMAN_MATH_E127_IMPORTER={commit:commit,validate:function(raw,mode){try{return validatePackage(extractPackage(typeof raw==='string'?JSON.parse(raw):raw,'manual.json',mode||'merge'));}catch(e){return {ok:false,errors:[{path:'JSON',message:S(e.message||e)}],warnings:[]};}},exportLessons:exportLessons,rollback:rollback,clearOverlay:clearOverlay,release:RELEASE};
  window.BAUMAN_MATH_E127_SELF_CHECK=function(){
    try{
      var l=currentLessons()[0]||{}; var sample={packageType:'bauman.math.theory.patch',target:'lessons.json',mode:'patch',lessons:[{lessonId:lessonId(l)||'SELF_CHECK',id:lessonId(l)||'SELF_CHECK',sourceChapterNo:Math.max(1,sourceNo(l)||1),sourceStageNo:Math.max(0,sourceStageNo(l)||0),title:'Self check patch',slides:[{role:'takeaway',blocks:[{type:'section',title:'Self check',body:'ok'}]}]}]};
      var val=validatePackage(extractPackage(sample,'self_check.json','patch'));
      return {ok:!!val.ok,patch:RELEASE,hasPanel:!!document.querySelector('[data-e127-panel="1"]')||true,currentLessons:currentLessons().length,validateOk:val.ok,errors:val.errors,warnings:val.warnings,final:true};
    }catch(e){return {ok:false,patch:RELEASE,error:S(e.message||e),final:true};}
  };
})();
