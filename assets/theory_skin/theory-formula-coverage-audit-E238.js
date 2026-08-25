/* E238B hidden coverage audit aligned with runtime chapter-scoped matching. */
(function(){
  'use strict';
  var RELEASE='E238B_CHAPTER_SCOPED_FORMULA_COVERAGE_AUDIT';
  var THEORY_URL='data/theory_lecture_content.json';
  var REGISTRY_URLS=[
    'data/theory_formula_academic_c01.json',
    'data/theory_formula_academic_c02.json',
    'data/theory_formula_academic_c03.json'
  ];
  var ALIAS_URL='data/theory_formula_match_aliases_e238b.json';

  function norm(s){
    return String(s||'')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g,'')
      .replace(/đ/g,'d')
      .replace(/ℝ/g,'r')
      .replace(/θ/g,'theta').replace(/α/g,'alpha').replace(/μ/g,'mu')
      .replace(/λ/g,'lambda').replace(/σ/g,'sigma').replace(/∞/g,'inf')
      .replace(/ᵀ/g,'^t').replace(/∈/g,' in ').replace(/∇/g,'grad ').replace(/∂/g,'partial ')
      .replace(/≤/g,'<=').replace(/≥/g,'>=').replace(/≠/g,'!=').replace(/≈/g,'~=')
      .replace(/→/g,'->').replace(/[−–—]/g,'-')
      .replace(/₁/g,'_1').replace(/₂/g,'_2').replace(/₃/g,'_3').replace(/ₘ/g,'_m').replace(/ₙ/g,'_n')
      .replace(/\b([mnp])\s+[x×]\s+([mnp])\b/g,'$1x$2')
      .replace(/\s*([=+\-*/^_,;:·<>])\s*/g,'$1')
      .replace(/\(\s+/g,'(').replace(/\s+\)/g,')')
      .replace(/\[\s+/g,'[').replace(/\s+\]/g,']')
      .replace(/\{\s+/g,'{').replace(/\s+\}/g,'}')
      .replace(/\s+/g,' ')
      .trim();
  }

  function getJson(url){
    return fetch(url,{cache:'no-store'}).then(function(r){
      if(!r.ok)throw new Error(url+' HTTP '+r.status);
      return r.json();
    });
  }

  function specificity(profile){
    var keys=(profile.matchAll||[]).concat(profile.matchAny||[]).concat(profile.__aliases||[]);
    return keys.reduce(function(total,key){return total+norm(key).length;},0)+keys.length*20;
  }

  function profileSort(a,b){
    var p=(b.priority||0)-(a.priority||0);
    if(p)return p;
    var s=specificity(b)-specificity(a);
    if(s)return s;
    return String(a.id||'').localeCompare(String(b.id||''));
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

  function collectLessons(root){
    var found=[],seen=new Set();
    function visit(value){
      if(!value||typeof value!=='object')return;
      if(value.lessonId&&Array.isArray(value.slides)){
        if(!seen.has(value.lessonId)){seen.add(value.lessonId);found.push(value);}
        return;
      }
      if(Array.isArray(value)){value.forEach(visit);return;}
      Object.keys(value).forEach(function(key){visit(value[key]);});
    }
    visit(root);
    return found;
  }

  function formulaSlides(lessons){
    var out=[];
    lessons.forEach(function(lesson){
      (lesson.slides||[]).forEach(function(slide,slideIndex){
        var blocks=(slide.blocks||[]).filter(function(block){return block&&block.type==='formula'&&block.body;});
        if(!blocks.length)return;
        out.push({
          lessonId:lesson.lessonId||'',
          lessonTitle:lesson.lessonTitle||lesson.title||'',
          chapterId:lesson.chapterId||'',
          slideIndex:slideIndex+1,
          slideTitle:slide.title||'',
          blockCount:blocks.length,
          raw:blocks.map(function(block){return block.body;}).join('\n')
        });
      });
    });
    return out;
  }

  function duplicateValues(items,keyFn){
    var map={};
    items.forEach(function(item){var key=keyFn(item);if(key)(map[key]||(map[key]=[])).push(item);});
    return Object.keys(map).filter(function(key){return map[key].length>1;}).map(function(key){return {key:key,items:map[key].map(function(item){return item.id||item;})};});
  }

  function matchSignature(profile){
    return JSON.stringify({
      chapter:profile.__chapterId||'',
      all:(profile.matchAll||[]).map(norm).sort(),
      any:(profile.matchAny||[]).map(norm).sort(),
      aliases:(profile.__aliases||[]).map(norm).sort()
    });
  }

  function summarizeByChapter(rows){
    var result={};
    rows.forEach(function(row){
      var key=row.chapterId||'unknown';
      var b=result[key]||(result[key]={total:0,matched:0,single:0,ambiguous:0,unmatched:0,foreignCandidates:0});
      b.total++;
      if(row.candidates.length)b.matched++;
      if(row.candidates.length===1)b.single++;
      if(row.candidates.length>1)b.ambiguous++;
      if(!row.candidates.length)b.unmatched++;
      if(row.foreignCandidates.length)b.foreignCandidates++;
    });
    return result;
  }

  function buildReport(theory,registries,aliasData){
    var aliasMap=(aliasData&&aliasData.aliases)||{};
    var profiles=[];
    registries.forEach(function(registry,index){
      (registry.profiles||[]).forEach(function(profile){
        var copy=Object.assign({},profile);
        copy.__registry=REGISTRY_URLS[index];
        copy.__chapterId=registry.chapterId||'';
        copy.__aliases=(aliasMap[copy.id]||[]).slice();
        copy.__specificity=specificity(copy);
        profiles.push(copy);
      });
    });
    profiles.sort(profileSort);

    var lessons=collectLessons(theory);
    var slides=formulaSlides(lessons);
    var usage={};
    var rows=slides.map(function(slide){
      var every=profiles.filter(function(profile){return matches(profile,slide.raw);}).sort(profileSort);
      var candidates=every.filter(function(profile){return !profile.__chapterId||profile.__chapterId===slide.chapterId;});
      var foreign=every.filter(function(profile){return profile.__chapterId&&profile.__chapterId!==slide.chapterId;});
      var selected=candidates[0]||null;
      if(selected)usage[selected.id]=(usage[selected.id]||0)+1;
      return Object.assign({},slide,{
        selected:selected?selected.id:'',
        selectedRegistry:selected?selected.__registry:'',
        candidates:candidates.map(function(p){return p.id;}),
        foreignCandidates:foreign.map(function(p){return p.id;})
      });
    });

    var unmatched=rows.filter(function(row){return row.candidates.length===0;});
    var ambiguous=rows.filter(function(row){return row.candidates.length>1;});
    var foreign=rows.filter(function(row){return row.foreignCandidates.length>0;});
    var unusedProfiles=profiles.filter(function(profile){return !usage[profile.id];}).map(function(profile){return {id:profile.id,registry:profile.__registry,priority:profile.priority||0,specificity:profile.__specificity};});
    var duplicateIds=duplicateValues(profiles,function(profile){return profile.id;});
    var duplicateSignatures=duplicateValues(profiles,matchSignature);

    return {
      release:RELEASE,
      generatedAt:new Date().toISOString(),
      summary:{
        lessons:lessons.length,
        formulaSlides:rows.length,
        formulaBlocks:rows.reduce(function(total,row){return total+row.blockCount;},0),
        matched:rows.length-unmatched.length,
        singleMatch:rows.filter(function(row){return row.candidates.length===1;}).length,
        ambiguous:ambiguous.length,
        unmatched:unmatched.length,
        slidesWithForeignCandidates:foreign.length,
        profiles:profiles.length,
        usedProfiles:Object.keys(usage).length,
        unusedProfiles:unusedProfiles.length,
        duplicateProfileIds:duplicateIds.length,
        duplicateMatchSignatures:duplicateSignatures.length
      },
      byChapter:summarizeByChapter(rows),
      unmatched:unmatched,
      ambiguous:ambiguous,
      foreignCandidates:foreign,
      unusedProfiles:unusedProfiles,
      duplicateProfileIds:duplicateIds,
      duplicateMatchSignatures:duplicateSignatures,
      profileUsage:usage,
      rows:rows
    };
  }

  function printReport(report){
    console.group('[E238B] Formula academic coverage audit');
    console.table([report.summary]);
    console.table(Object.keys(report.byChapter).map(function(chapterId){return Object.assign({chapterId:chapterId},report.byChapter[chapterId]);}));
    if(report.unmatched.length){console.warn('[E238B] unmatched:',report.unmatched.length);console.table(report.unmatched.map(function(r){return {chapter:r.chapterId,lesson:r.lessonTitle,slide:r.slideIndex,title:r.slideTitle,formula:r.raw};}));}
    if(report.ambiguous.length){console.warn('[E238B] ambiguous within chapter:',report.ambiguous.length);console.table(report.ambiguous.map(function(r){return {lesson:r.lessonTitle,slide:r.slideIndex,selected:r.selected,candidates:r.candidates.join(', '),formula:r.raw};}));}
    if(report.foreignCandidates.length){console.info('[E238B] foreign candidates ignored by chapter scope:',report.foreignCandidates.length);console.table(report.foreignCandidates.map(function(r){return {lesson:r.lessonTitle,slide:r.slideIndex,foreign:r.foreignCandidates.join(', ')};}));}
    if(report.unusedProfiles.length){console.info('[E238B] unused profiles:',report.unusedProfiles.length);console.table(report.unusedProfiles);}
    console.groupEnd();
  }

  function run(){
    return Promise.all([getJson(THEORY_URL)].concat(REGISTRY_URLS.map(getJson)).concat([getJson(ALIAS_URL)]))
      .then(function(items){
        var report=buildReport(items[0],items.slice(1,1+REGISTRY_URLS.length),items[items.length-1]);
        window.BAUMAN_MATH_E238_AUDIT_REPORT=report;
        printReport(report);
        return report;
      });
  }

  function save(filename){
    var report=window.BAUMAN_MATH_E238_AUDIT_REPORT;
    if(!report)throw new Error('Run the audit first');
    var blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'});
    var a=document.createElement('a');
    a.href=URL.createObjectURL(blob);
    a.download=filename||'formula-academic-audit-e238b.json';
    a.click();
    setTimeout(function(){URL.revokeObjectURL(a.href);},1000);
  }

  window.BAUMAN_MATH_E238_AUDIT={release:RELEASE,run:run,save:save,normalize:norm};
  try{if(new URLSearchParams(location.search).get('formulaAudit')==='1')run().catch(function(err){console.error('[E238B] audit failed',err);});}catch(_){}
})();
