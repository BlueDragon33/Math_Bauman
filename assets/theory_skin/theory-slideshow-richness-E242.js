/* E242 · Multi-lesson slideshow richness bridge
 * Restores semantic diagrams, misconception intercepts and retrieval checks
 * for registered lessons inside the existing E202/E211 layout.
 */
(function(){
  'use strict';

  var RELEASE='E242_MULTI_LESSON_SLIDESHOW_RICHNESS';
  var cacheByLesson={},scheduled=false,lastKey='';

  function arr(v){return Array.isArray(v)?v:[];}
  function esc(v){return String(v==null?'':v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function text(n){return String(n&&n.textContent||'').replace(/\s+/g,' ').trim();}
  function state(){try{return (window.__BAUMAN_CORE_API&&window.__BAUMAN_CORE_API.state)||window.__MATH_STATE||{};}catch(_){return window.__MATH_STATE||{};}}
  function deck(){return document.querySelector('.e132-overlay-deck.open');}
  function registry(){return window.BAUMAN_MATH_THEORY_ARTIFACT_REGISTRY_E244||null;}

  function candidates(){
    var s=state(),values=[],d=deck(),shell=document.querySelector('.e129-theory-shell.presenting')||document.querySelector('.e129-theory-shell');
    if(d){
      ['data-e243-lesson-id','data-e210-active-lesson-id','data-lesson-id'].forEach(function(k){var v=d.getAttribute(k);if(v)values.push(String(v));});
      var chip=d.querySelector('[data-e210-lesson-id]');if(chip){var chipId=chip.getAttribute('data-e210-lesson-id');if(chipId)values.push(String(chipId));}
    }
    if(shell){var current=shell.querySelector('[data-current-lesson]');if(current){var visible=current.getAttribute('data-current-lesson');if(visible)values.push(String(visible));}}
    ['e129LessonId','theoryLessonId','currentLessonId','selectedLessonId','activeLessonId','lessonId','lessonTitle','currentLessonTitle','selectedTheoryTitle'].forEach(function(k){if(s&&s[k])values.push(String(s[k]));});
    if(d){['.e132-clean-side small','.e132-clean-main h1','.e210-source-line'].forEach(function(sel){var n=d.querySelector(sel);if(n)values.push(text(n));});}
    return values;
  }

  function activeEntry(){var r=registry();return r&&r.resolve?r.resolve(candidates()):null;}
  function registerOptionalSources(){var r=registry();return !!(r&&r.register&&r.register());}
  function cacheFor(entry){return cacheByLesson[entry.lessonId]||(cacheByLesson[entry.lessonId]={artifact:null,loading:null,error:null});}

  function countFeatures(slides){
    return {
      slides:slides.length,
      diagrams:slides.filter(function(s){return !!s.diagramSpec;}).length,
      retrievalChecks:slides.filter(function(s){return !!s.retrievalCheck;}).length,
      misconceptions:slides.filter(function(s){return !!s.misconceptionIntercept;}).length
    };
  }

  function validate(entry,j){
    var source=entry.slideshow,expected=source.expected||{};
    if(!j||j.lessonId!==entry.lessonId)throw new Error('E242 lessonId mismatch for '+entry.lessonId);
    if(j.version!==source.version)throw new Error('E242 version mismatch: '+String(j.version||''));
    var counts=countFeatures(arr(j.slides));
    Object.keys(expected).forEach(function(k){if(counts[k]!==expected[k])throw new Error('E242 '+k+' expected '+expected[k]+' but found '+counts[k]);});
    var ids=arr(j.slides).map(function(s){return s.id;});
    for(var i=1;i<=expected.slides;i++)if(ids[i-1]!=='SL'+String(i).padStart(2,'0'))throw new Error('E242 slide order mismatch at '+i);
    return j;
  }

  function load(entry){
    entry=entry||activeEntry();
    if(!entry||!entry.slideshow)return Promise.reject(new Error('Không có slideshow registry cho bài đang mở.'));
    var cache=cacheFor(entry);
    if(cache.artifact)return Promise.resolve(cache.artifact);
    if(cache.loading)return cache.loading;
    cache.loading=fetch(entry.slideshow.path,{cache:'no-store'}).then(function(r){if(!r.ok)throw new Error(entry.slideshow.path+' HTTP '+r.status);return r.json();}).then(function(j){cache.artifact=validate(entry,j);cache.error=null;return cache.artifact;}).catch(function(e){cache.error=String(e&&e.message||e);throw e;}).finally(function(){cache.loading=null;});
    return cache.loading;
  }

  function currentIndex(d){var match=text(d&&d.querySelector('[data-e202-count]')).match(/(\d+)\s*\//);return match?Math.max(0,parseInt(match[1],10)-1):0;}

  function ensureStyle(){
    if(document.getElementById('e242-style'))return;
    var st=document.createElement('style');st.id='e242-style';st.textContent=''
      +'.e242-diagram{height:100%;display:flex;flex-direction:column;justify-content:center;gap:9px}'
      +'.e242-diagram-head{display:flex;flex-wrap:wrap;gap:7px;align-items:center}'
      +'.e242-diagram-type{border:1px solid rgba(45,212,191,.4);border-radius:999px;padding:5px 8px;color:#a7f3d0;font:900 10px/1 system-ui;letter-spacing:.06em;text-transform:uppercase}'
      +'.e242-diagram-purpose{font-size:12px;line-height:1.35;color:#cce7f3}'
      +'.e242-flow{display:flex;flex-wrap:wrap;gap:7px;align-items:center;justify-content:center}'
      +'.e242-node{min-width:72px;max-width:145px;padding:8px 9px;border:1px solid rgba(125,211,252,.3);border-radius:12px;background:rgba(7,29,46,.78);color:#f4fbff;font:800 11px/1.28 system-ui;text-align:center;overflow-wrap:anywhere}'
      +'.e242-arrow{color:#67e8f9;font-weight:900}'
      +'.e242-constraints{margin:0;padding-left:18px;display:grid;gap:3px;color:#c8dbe7;font-size:10px;line-height:1.32}'
      +'.e242-wrong{color:#fecaca!important}'
      +'.e242-correction{color:#d1fae5!important}'
      +'.e242-evidence{margin-top:7px;padding-top:7px;border-top:1px solid rgba(125,211,252,.18);font-size:11px;color:#cce7f3}'
      +'.e242-evidence summary{cursor:pointer;font-weight:900;color:#a7f3d0}'
      +'.e242-evidence ul{margin:6px 0 0;padding-left:18px}'
      +'.e211-extension-panel .e242-diagram-embed{display:block;margin-top:12px;padding-top:10px;border-top:1px solid rgba(125,211,252,.2)}'
      +'.e211-extension-panel .e242-diagram-embed .e242-diagram{height:auto;min-height:0;justify-content:flex-start}'
      +'@media(max-width:720px){.e242-node{min-width:58px;max-width:110px;padding:6px;font-size:10px}.e242-constraints{font-size:9px}}';
    document.head.appendChild(st);
  }

  function labelFor(spec,index){var labels=arr(spec.labels),entities=arr(spec.entities);return labels[index]||entities[index]||('node '+String(index+1));}
  function diagramHtml(spec){
    var entities=arr(spec.entities),labels=arr(spec.labels),count=Math.max(entities.length,labels.length),nodes=[];
    for(var i=0;i<count;i++){if(i)nodes.push('<span class="e242-arrow">→</span>');nodes.push('<span class="e242-node">'+esc(labelFor(spec,i))+'</span>');}
    return '<div class="e242-diagram"><div class="e242-diagram-head"><span class="e242-diagram-type">'+esc(String(spec.type||'semantic diagram').replace(/_/g,' '))+'</span><span class="e242-diagram-purpose">'+esc(spec.purpose||'')+'</span></div><div class="e242-flow">'+nodes.join('')+'</div>'+(arr(spec.mathematicalConstraints).length?'<ul class="e242-constraints">'+arr(spec.mathematicalConstraints).map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>':'')+'</div>';
  }

  function applyDiagram(d,slide){
    var host=d.querySelector('.e202-visual');if(!host||!slide.diagramSpec)return false;
    var panel=host.querySelector('.e211-extension-panel');
    if(panel){
      var body=panel.querySelector('.e211-summary-lead, p');if(!body)return false;
      var old=body.querySelector('.e242-diagram-embed');if(old)old.remove();
      var embed=document.createElement('span');embed.className='e242-diagram-embed';embed.setAttribute('data-e242-diagram',slide.id);embed.innerHTML=diagramHtml(slide.diagramSpec);body.appendChild(embed);
      host.removeAttribute('data-e242-diagram');return true;
    }
    host.innerHTML=diagramHtml(slide.diagramSpec);host.setAttribute('data-e242-diagram',slide.id);return true;
  }
  function cardParts(card){return {kicker:card&&card.querySelector('.e132-card-kicker'),headline:card&&card.querySelector('h3'),body:card&&card.querySelector('.e132-full-body')};}

  function applyMisconception(d,slide){
    if(!slide.misconceptionIntercept)return false;
    var card=d.querySelector('.e202-card-grid .e132-clean-card.application');if(!card)return false;
    var p=cardParts(card),m=slide.misconceptionIntercept;
    if(p.kicker)p.kicker.textContent='Chặn nhầm lẫn';
    if(p.headline){p.headline.textContent=m.wrong||'Nhầm lẫn thường gặp';p.headline.classList.add('e242-wrong');}
    if(p.body){p.body.textContent=m.correction||'';p.body.classList.add('e242-correction');}
    card.setAttribute('data-e242-misconception',slide.id);return true;
  }

  function applyRetrieval(d,slide){
    if(!slide.retrievalCheck)return false;
    var card=d.querySelector('.e202-card-grid .e132-clean-card.check');if(!card)return false;
    var p=cardParts(card),r=slide.retrievalCheck;
    if(p.kicker)p.kicker.textContent='Retrieval check · '+String(r.id||'');
    if(p.headline)p.headline.textContent=r.prompt||'Tự kiểm';
    if(p.body){
      p.body.textContent=r.misconceptionTarget?('Mục tiêu phát hiện: '+r.misconceptionTarget):'Tự trả lời trước khi xem bằng chứng.';
      var old=card.querySelector('.e242-evidence');if(old)old.remove();
      var details=document.createElement('details');details.className='e242-evidence';details.innerHTML='<summary>Bằng chứng mong đợi</summary><ul>'+arr(r.expectedEvidence).map(function(x){return '<li>'+esc(x)+'</li>';}).join('')+'</ul>';card.appendChild(details);
    }
    card.setAttribute('data-e242-retrieval',slide.id);return true;
  }

  function clearStale(d){
    if(!d)return;
    Array.prototype.slice.call(d.querySelectorAll('[data-e242-diagram],[data-e242-retrieval],[data-e242-misconception]')).forEach(function(n){n.removeAttribute('data-e242-diagram');n.removeAttribute('data-e242-retrieval');n.removeAttribute('data-e242-misconception');});
    Array.prototype.slice.call(d.querySelectorAll('.e242-diagram-embed')).forEach(function(n){n.remove();});
    Array.prototype.slice.call(d.querySelectorAll('.e242-wrong,.e242-correction')).forEach(function(n){n.classList.remove('e242-wrong','e242-correction');});
    Array.prototype.slice.call(d.querySelectorAll('.e242-evidence')).forEach(function(n){n.remove();});
  }

  function richnessPresent(d,slide){
    if(!d||!slide)return false;
    if(slide.diagramSpec&&!d.querySelector('[data-e242-diagram="'+slide.id+'"]'))return false;
    if(slide.misconceptionIntercept&&!d.querySelector('[data-e242-misconception="'+slide.id+'"]'))return false;
    if(slide.retrievalCheck&&!d.querySelector('[data-e242-retrieval="'+slide.id+'"]'))return false;
    return true;
  }

  function clearOutsideTarget(d){
    if(!d)return;
    clearStale(d);d.removeAttribute('data-e242-richness');d.removeAttribute('data-e242-lesson-id');
    var main=d.querySelector('.e132-clean-main');if(main)main.removeAttribute('data-e242-slide');
    lastKey='';
    try{window.BAUMAN_MATH_E211_READER_CONTENT&&window.BAUMAN_MATH_E211_READER_CONTENT.apply&&window.BAUMAN_MATH_E211_READER_CONTENT.apply();}catch(_){}
  }

  function apply(){
    var d=deck();if(!d||!d.classList.contains('open'))return false;
    var entry=activeEntry();if(!entry||!entry.slideshow){clearOutsideTarget(d);return false;}
    var cache=cacheFor(entry);
    if(!cache.artifact){load(entry).then(schedule).catch(function(){});return false;}
    var index=currentIndex(d),slide=arr(cache.artifact.slides)[index];if(!slide)return false;
    var key=entry.lessonId+'|'+slide.id+'|'+text(d.querySelector('.e132-clean-main h1'));
    if(lastKey===key&&d.querySelector('[data-e242-slide="'+slide.id+'"]')&&richnessPresent(d,slide))return true;
    lastKey=key;clearStale(d);
    var main=d.querySelector('.e132-clean-main');if(main)main.setAttribute('data-e242-slide',slide.id);
    applyDiagram(d,slide);applyMisconception(d,slide);applyRetrieval(d,slide);
    d.setAttribute('data-e242-richness',RELEASE);d.setAttribute('data-e242-lesson-id',entry.lessonId);
    return true;
  }

  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;apply();});}
  function boot(){ensureStyle();registerOptionalSources();schedule();try{new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});}catch(_){} }

  window.BAUMAN_MATH_E242_SLIDESHOW_RICHNESS={
    release:RELEASE,
    registry:registry,
    active:activeEntry,
    load:function(lessonId){var r=registry(),entry=lessonId&&r&&r.get?r.get(lessonId):activeEntry();return load(entry);},
    apply:apply,
    selfCheck:function(){
      var entry=activeEntry(),cache=entry&&cacheFor(entry),counts=cache&&cache.artifact?countFeatures(arr(cache.artifact.slides)):null,slide=null,d=deck();
      if(entry&&cache&&cache.artifact&&d)slide=arr(cache.artifact.slides)[currentIndex(d)]||null;
      return {ok:!!registry()&&!(cache&&cache.error),release:RELEASE,multiLesson:true,activeLessonId:entry&&entry.lessonId||'',loaded:!!(cache&&cache.artifact),counts:counts,expected:entry&&entry.slideshow&&entry.slideshow.expected||null,currentSlide:d&&d.querySelector('.e132-clean-main')&&d.querySelector('.e132-clean-main').getAttribute('data-e242-slide'),richnessPresent:slide?richnessPresent(d,slide):null,newSlideshowEngineCreated:false,e235Modified:false,error:cache&&cache.error||null};
    }
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
})();