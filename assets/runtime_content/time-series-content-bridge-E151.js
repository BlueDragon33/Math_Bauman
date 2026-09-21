'use strict';
(function(){
  const RELEASE='E151_HK1_TIME_SERIES_CONTENT';
  const SOURCE='data/theory_lecture_overlay_e151.json';
  const MAX_ATTEMPTS=180;
  let overlay=null,attempts=0,applied=false;
  function arr(v){return Array.isArray(v)?v:[];}
  function records(v){if(Array.isArray(v))return v;if(v&&typeof v==='object')return arr(v.records||v.items||v.content);return [];}
  function byLesson(list,id){return arr(list).findIndex(x=>String(x&&x.lessonId||x&&x.id||'')===String(id||''));}
  function upsert(list,rec){const i=byLesson(list,rec&&rec.lessonId);if(i>=0)list[i]=rec;else list.push(rec);}
  function normalizeQa(q){
    if(!q||typeof q!=='object')return q;
    if(arr(q.canonicalQaPairs||q.qaPairs||q.professorQuestionsDetailed).length)return q;
    const question=String(q.question||'').trim(),answer=String(q.answer||'').trim();
    if(!question)return q;
    return Object.assign({},q,{qaPairs:[{
      question,shortAnswer:answer,fullAnswer:answer,
      correctnessCriteria:[
        'Nêu đúng bản chất toán học.',
        'Nêu công thức/quy ước và điều kiện áp dụng.',
        'Nêu một giới hạn hoặc bẫy diễn giải.'
      ],
      commonWrongAnswer:'Chỉ đọc công thức mà không giải thích giả thiết và ý nghĩa theo thời gian.',
      scoreGuide:'Đạt khi đủ bản chất + công thức/điều kiện + diễn giải/giới hạn.'
    }]});
  }
  function targetTheory(){
    const db=window.DB;if(!db||!db.theory_lecture_content)return null;
    if(Array.isArray(db.theory_lecture_content))return db.theory_lecture_content;
    if(db.theory_lecture_content&&typeof db.theory_lecture_content==='object'){
      if(!Array.isArray(db.theory_lecture_content.records))db.theory_lecture_content.records=[];
      return db.theory_lecture_content.records;
    }
    return null;
  }
  function apply(){
    if(applied||!overlay)return false;
    const db=window.DB,target=targetTheory();
    if(!db||!target)return false;
    if(!window.__BAUMAN_MATH_E140_VAULT_BRIDGE__||window.__BAUMAN_MATH_E140_VAULT_BRIDGE__.loaded!==true)return false;
    const incoming=records(overlay),lessons=arr(db.lessons);
    incoming.forEach(rec=>{upsert(target,rec);upsert(lessons,rec);});
    db.lessons=lessons;
    db.professor_qa=arr(db.professor_qa).map(normalizeQa);
    applied=true;
    window.__BAUMAN_MATH_E151_TIME_SERIES__={
      release:RELEASE,loaded:true,source:SOURCE,
      theoryLessons:incoming.length,
      runtimeLessons:incoming.filter(x=>byLesson(db.lessons,x.lessonId)>=0).length,
      professorQaNormalized:db.professor_qa.filter(x=>arr(x.qaPairs||x.canonicalQaPairs||x.professorQuestionsDetailed).length>0).length,
      targetChapterId:'MATH-HK1-C22-qua_trinh_ngau_nhien_va_'
    };
    window.BAUMAN_MATH_RELEASE=Object.assign({},window.BAUMAN_MATH_RELEASE||{},{timeSeriesContent:'E151'});
    try{if(window.__BAUMAN_CORE_API&&typeof window.__BAUMAN_CORE_API.render==='function')window.__BAUMAN_CORE_API.render();}catch(_){}
    return true;
  }
  function wait(){if(apply())return;attempts++;if(attempts<MAX_ATTEMPTS)setTimeout(wait,100);else window.__BAUMAN_MATH_E151_TIME_SERIES__={release:RELEASE,loaded:false,error:'sources_not_ready',attempts};}
  async function boot(){
    try{const r=await fetch(SOURCE,{cache:'no-store'});if(!r.ok)throw new Error('HTTP '+r.status);overlay=await r.json();wait();}
    catch(e){window.__BAUMAN_MATH_E151_TIME_SERIES__={release:RELEASE,loaded:false,error:String(e&&e.message||e)};}
  }
  window.BAUMAN_MATH_E151_SELF_CHECK=function(){
    const db=window.DB||{},status=window.__BAUMAN_MATH_E151_TIME_SERIES__||{};
    const ids=records(overlay).map(x=>x.lessonId);
    const theory=targetTheory()||[],runtime=arr(db.lessons),qa=arr(db.professor_qa);
    return {
      ok:status.loaded===true&&ids.length===6&&ids.every(id=>byLesson(theory,id)>=0&&byLesson(runtime,id)>=0)&&qa.length>0&&qa.every(x=>arr(x.qaPairs||x.canonicalQaPairs||x.professorQuestionsDetailed).length>0),
      release:RELEASE,status,
      counts:{overlay:ids.length,theoryMatched:ids.filter(id=>byLesson(theory,id)>=0).length,runtimeMatched:ids.filter(id=>byLesson(runtime,id)>=0).length,professorQa:qa.length}
    };
  };
  boot();
})();