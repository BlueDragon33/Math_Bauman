/* E238B academic registry bridge with chapter scope and canonical matching. */
(function(){
  'use strict';
  var RELEASE='E238B_CHAPTER_SCOPED_CANONICAL_FORMULA_MATCHING';
  var REGISTRY_URLS=[
    'data/theory_formula_academic_c01.json',
    'data/theory_formula_academic_c02.json',
    'data/theory_formula_academic_c03.json'
  ];
  var ALIAS_URL='data/theory_formula_match_aliases_e238b.json';
  var CHAPTERS={
    c01:'MATH-VN-C01-vector_trong_khong_gian_',
    c02:'MATH-VN-C02-ma_tran_va_phep_bien_oi_',
    c03:'MATH-VN-C03-ham_so_ao_ham_va_gradien'
  };
  var profiles=[];
  var aliases={};
  var ready=false;
  var loading=false;
  var scheduled=false;

  function esc(s){
    return String(s==null?'':s).replace(/[&<>"']/g,function(c){
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  function text(n){return (n&&n.textContent||'').replace(/\s+/g,' ').trim();}

  function norm(s){
    return String(s||'')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .replace(/đ/g,'d')
      .replace(/ℝ/g,'r')
      .replace(/θ/g,'theta')
      .replace(/α/g,'alpha')
      .replace(/μ/g,'mu')
      .replace(/λ/g,'lambda')
      .replace(/σ/g,'sigma')
      .replace(/∞/g,'inf')
      .replace(/ᵀ/g,'^t')
      .replace(/∈/g,' in ')
      .replace(/∇/g,'grad ')
      .replace(/∂/g,'partial ')
      .replace(/≤/g,'<=')
      .replace(/≥/g,'>=')
      .replace(/≠/g,'!=')
      .replace(/≈/g,'~=')
      .replace(/→/g,'->')
      .replace(/[−–—]/g,'-')
      .replace(/₁/g,'_1').replace(/₂/g,'_2').replace(/₃/g,'_3')
      .replace(/ₘ/g,'_m').replace(/ₙ/g,'_n')
      .replace(/\b([mnp])\s+[x×]\s+([mnp])\b/g,'$1x$2')
      .replace(/\s*([=+\-*/^_,;:·<>])\s*/g,'$1')
      .replace(/\(\s+/g,'(').replace(/\s+\)/g,')')
      .replace(/\[\s+/g,'[').replace(/\s+\]/g,']')
      .replace(/\{\s+/g,'{').replace(/\s+\}/g,'}')
      .replace(/\s+/g,' ')
      .trim();
  }

  function specificity(profile){
    var keys=(profile.matchAll||[]).concat(profile.matchAny||[]).concat(profile.__aliases||[]);
    return keys.reduce(function(total,key){return total+norm(key).length;},0)+keys.length*20;
  }

  function profileSort(a,b){
    var byPriority=(b.priority||0)-(a.priority||0);
    if(byPriority)return byPriority;
    var bySpecificity=specificity(b)-specificity(a);
    if(bySpecificity)return bySpecificity;
    return String(a.id||'').localeCompare(String(b.id||''));
  }

  function getJson(url){
    return fetch(url,{cache:'no-store'}).then(function(r){
      if(!r.ok)throw new Error(url+' HTTP '+r.status);
      return r.json();
    });
  }

  function loadOne(url){
    return getJson(url)
      .then(function(data){
        return ((data&&data.profiles)||[]).map(function(profile){
          profile.__registry=url;
          profile.__chapterId=(data&&data.chapterId)||'';
          return profile;
        });
      })
      .catch(function(err){
        console.warn('[E238B] academic registry unavailable',err);
        return [];
      });
  }

  function load(){
    if(ready||loading)return;
    loading=true;
    Promise.all([Promise.all(REGISTRY_URLS.map(loadOne)),getJson(ALIAS_URL).catch(function(err){console.warn('[E238B] alias file unavailable',err);return {aliases:{}};})])
      .then(function(items){
        profiles=[];
        items[0].forEach(function(group){profiles=profiles.concat(group);});
        aliases=(items[1]&&items[1].aliases)||{};
        profiles.forEach(function(profile){
          profile.__aliases=(aliases[profile.id]||[]).slice();
          profile.__specificity=specificity(profile);
        });
        profiles.sort(profileSort);
        ready=true;
        schedule();
      })
      .finally(function(){loading=false;});
  }

  function state(){
    try{return (window.__BAUMAN_CORE_API&&window.__BAUMAN_CORE_API.state)||window.__MATH_STATE||{};}
    catch(_){return window.__MATH_STATE||{};}
  }

  function chapterFromText(value){
    var raw=String(value||'');
    var n=norm(raw);
    if(n.indexOf('math-vn-c01')>=0||/§\s*1\./.test(raw))return CHAPTERS.c01;
    if(n.indexOf('math-vn-c02')>=0||/§\s*2\./.test(raw))return CHAPTERS.c02;
    if(n.indexOf('math-vn-c03')>=0||/§\s*3\./.test(raw))return CHAPTERS.c03;
    return '';
  }

  function activeChapterId(modal){
    var values=[];
    var s=state();
    ['chapterId','currentChapterId','lessonId','currentLessonId','selectedLessonId','lessonTitle','currentLessonTitle','selectedTheoryTitle'].forEach(function(k){if(s&&s[k])values.push(s[k]);});
    var shell=document.querySelector('.e129-theory-shell.presenting')||document.querySelector('.e129-theory-shell');
    if(shell){
      ['data-chapter-id','data-lesson-id','data-id','data-title'].forEach(function(k){var v=shell.getAttribute(k);if(v)values.push(v);});
      values.push(text(shell.querySelector('.e129-lesson-title')));
      values.push(text(shell.querySelector('.e129-chip-btn.active')));
    }
    values.push(text(document.querySelector('[data-e210-lesson-id]')));
    values.push(text(document.querySelector('[data-e210-source-line]')));
    if(modal){values.push(text(modal.querySelector('header')));values.push(text(modal.querySelector('.e211-formula-context')));}
    for(var i=0;i<values.length;i++){
      var found=chapterFromText(values[i]);
      if(found)return found;
    }
    return '';
  }

  function rawFormula(modal){
    var strip=document.querySelector('.e211-reader-pro .e202-formula-strip code')||document.querySelector('.e202-formula-strip code');
    if(strip&&text(strip))return strip.textContent||'';
    var nodes=modal?Array.prototype.slice.call(modal.querySelectorAll('.e236-formula-section [data-e226-raw-formula], section [data-e226-raw-formula]')):[];
    return nodes.map(function(n){return n.getAttribute('data-e226-raw-formula')||n.textContent||'';}).filter(Boolean).join('\n');
  }

  function baseMatch(profile,n){
    var all=(profile.matchAll||[]).map(norm);
    var any=(profile.matchAny||[]).map(norm);
    if(all.length&&!all.every(function(k){return n.indexOf(k)>=0;}))return false;
    if(any.length&&!any.some(function(k){return n.indexOf(k)>=0;}))return false;
    return all.length>0||any.length>0;
  }

  function matches(profile,raw){
    var n=norm(raw);
    if(baseMatch(profile,n))return true;
    return (profile.__aliases||[]).map(norm).some(function(k){return k&&n.indexOf(k)>=0;});
  }

  function allMatches(raw){
    return profiles.filter(function(profile){return matches(profile,raw);}).sort(profileSort);
  }

  function findProfiles(raw,chapterId){
    var found=allMatches(raw);
    if(!chapterId)return found;
    return found.filter(function(profile){return !profile.__chapterId||profile.__chapterId===chapterId;});
  }

  function card(item){
    return '<article class="e211-lesson-box e237-academic-box"><h4>'+esc(item.title||'')+'</h4><p>'+esc(item.body||'')+'</p></article>';
  }

  function stack(items){return '<div class="e211-lesson-stack e237-academic-stack">'+(items||[]).map(card).join('')+'</div>';}

  function sectionBy(modal,re){
    var sections=Array.prototype.slice.call(modal.querySelectorAll('section'));
    for(var i=0;i<sections.length;i++)if(re.test(text(sections[i].querySelector('h3'))))return sections[i];
    return null;
  }

  function ensureStyle(){
    if(document.getElementById('e237-academic-style'))return;
    var css=''
      +'.e211-formula-modal .e237-academic-stack{display:grid!important;grid-template-columns:1fr!important;gap:10px!important}'
      +'.e211-formula-modal .e237-academic-box{border-left:3px solid rgba(94,234,212,.42)!important}'
      +'.e211-formula-modal .e236-application-section .e237-academic-box{border-left-color:rgba(147,197,253,.46)!important}'
      +'.e211-formula-modal .e237-academic-box h4{font-size:11.5px!important;letter-spacing:.07em!important}'
      +'.e211-formula-modal .e237-academic-box p{font-size:14.5px!important;line-height:1.64!important}'
      +'.e211-formula-modal .e237-code{white-space:pre!important;overflow:auto!important;tab-size:4!important}';
    var style=document.createElement('style');
    style.id='e237-academic-style';
    style.textContent=css;
    document.head.appendChild(style);
  }

  function clearSelection(modal){
    modal.removeAttribute('data-e237-profile');
    modal.removeAttribute('data-e237-registry');
    modal.removeAttribute('data-e237-signature');
  }

  function patch(modal){
    if(!ready||!modal)return;
    var raw=rawFormula(modal);
    if(!raw)return;
    var chapterId=activeChapterId(modal);
    var every=allMatches(raw);
    var candidates=findProfiles(raw,chapterId);
    var foreign=every.filter(function(profile){return chapterId&&profile.__chapterId&&profile.__chapterId!==chapterId;});

    modal.setAttribute('data-e237-chapter',chapterId||'unknown');
    modal.setAttribute('data-e237-match-count',String(candidates.length));
    modal.setAttribute('data-e237-candidates',candidates.map(function(p){return p.id;}).join(','));
    modal.setAttribute('data-e237-foreign-candidates',foreign.map(function(p){return p.id;}).join(','));

    if(!candidates.length){
      clearSelection(modal);
      modal.setAttribute('data-e237-academic','0');
      return;
    }

    var profile=candidates[0];
    var signature=profile.id+'|'+chapterId+'|'+norm(raw);
    if(modal.getAttribute('data-e237-signature')===signature)return;

    ensureStyle();
    var analysis=sectionBy(modal,/phân tích/i);
    var application=sectionBy(modal,/ứng dụng/i);
    var python=sectionBy(modal,/python/i);
    if(analysis){analysis.innerHTML='<h3>Phân tích công thức</h3>'+stack(profile.analysis||[]);analysis.setAttribute('data-e237-profile',profile.id);}
    if(application){application.innerHTML='<h3>Ứng dụng</h3>'+stack(profile.application||[]);application.setAttribute('data-e237-profile',profile.id);}
    if(python&&profile.python){python.innerHTML='<h3>Cách dùng trong code Python</h3><pre class="e237-code">'+esc(profile.python)+'</pre>';python.setAttribute('data-e237-profile',profile.id);}

    modal.setAttribute('data-e237-signature',signature);
    modal.setAttribute('data-e237-profile',profile.id);
    modal.setAttribute('data-e237-registry',profile.__registry||'');
    modal.setAttribute('data-e237-academic','1');
  }

  function scan(){if(!ready){load();return;}Array.prototype.slice.call(document.querySelectorAll('.e211-formula-modal')).forEach(patch);}
  function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;scan();});}
  function boot(){load();scan();try{new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});}catch(_){}document.addEventListener('click',function(){setTimeout(schedule,0);},true);}

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.BAUMAN_MATH_E237_ACADEMIC={
    release:RELEASE,
    apply:scan,
    normalize:norm,
    chapterFromText:chapterFromText,
    activeChapter:activeChapterId,
    match:function(raw,chapterId){return findProfiles(raw,chapterId||'').slice();},
    matchAll:function(raw){return allMatches(raw).slice();},
    profiles:function(){return profiles.slice();},
    registries:function(){return REGISTRY_URLS.slice();},
    isReady:function(){return ready;}
  };
})();
