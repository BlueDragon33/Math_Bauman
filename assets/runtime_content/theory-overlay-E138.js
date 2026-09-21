'use strict';
(function(){
  const RELEASE='E138_CENTERING_PEARSON_GAP_PATCH';
  const SOURCE='data/theory_lecture_overlay_e138.json';
  const MAX_ATTEMPTS=120;
  let attempts=0, overlay=null, applied=false;

  function arr(v){return Array.isArray(v)?v:[];}
  function targetRecords(){
    const db=window.DB;
    if(!db||!db.theory_lecture_content)return null;
    const t=db.theory_lecture_content;
    if(Array.isArray(t))return t;
    if(t&&typeof t==='object'){
      if(!Array.isArray(t.records))t.records=[];
      return t.records;
    }
    return null;
  }
  function merge(){
    if(applied||!overlay)return false;
    const target=targetRecords();
    if(!target)return false;
    const incoming=arr(overlay.records);
    const byId=new Map(target.map((r,i)=>[String((r&&r.lessonId)||''),i]));
    let added=0,replaced=0;
    incoming.forEach(rec=>{
      const id=String((rec&&rec.lessonId)||'');
      if(!id)return;
      if(byId.has(id)){target[byId.get(id)]=rec;replaced++;}
      else {byId.set(id,target.length);target.push(rec);added++;}
    });
    applied=true;
    window.__BAUMAN_MATH_E138_THEORY_OVERLAY__={
      release:RELEASE,loaded:true,source:SOURCE,added,replaced,totalIncoming:incoming.length,
      lessonIds:incoming.map(x=>x.lessonId),physicalChapter7Created:false
    };
    try{
      if(window.__BAUMAN_CORE_API&&typeof window.__BAUMAN_CORE_API.render==='function'){
        window.__BAUMAN_CORE_API.render();
      }
    }catch(_){}
    return true;
  }
  function waitAndMerge(){
    if(merge())return;
    attempts++;
    if(attempts<MAX_ATTEMPTS)setTimeout(waitAndMerge,100);
    else window.__BAUMAN_MATH_E138_THEORY_OVERLAY__={
      release:RELEASE,loaded:false,source:SOURCE,error:'theory_lecture_content_not_ready',
      attempts
    };
  }
  async function boot(){
    try{
      const r=await fetch(SOURCE,{cache:'no-store'});
      if(!r.ok)throw new Error('HTTP '+r.status);
      overlay=await r.json();
      waitAndMerge();
    }catch(err){
      window.__BAUMAN_MATH_E138_THEORY_OVERLAY__={
        release:RELEASE,loaded:false,source:SOURCE,error:String(err&&err.message||err)
      };
    }
  }
  window.BAUMAN_MATH_E138_SELF_CHECK=function(){
    const status=window.__BAUMAN_MATH_E138_THEORY_OVERLAY__||{};
    const target=targetRecords()||[];
    const ids=['MATH-VN-PS-C06-L09','MATH-VN-PS-C06-L10'];
    const found=ids.map(id=>target.find(x=>x&&x.lessonId===id)).filter(Boolean);
    return {
      ok:status.loaded===true&&found.length===2&&found.every(x=>arr(x.slides).length===16),
      release:RELEASE,
      status,
      found:found.map(x=>({lessonId:x.lessonId,slides:arr(x.slides).length,frameChapterId:x.frameChapterId}))
    };
  };
  boot();
})();
