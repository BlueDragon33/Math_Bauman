'use strict';
(function(){
  const RELEASE='E140_CONTENT_VAULT_RUNTIME_BRIDGE';
  const HARDENING='E156_POST_INIT_DB_REBIND_GUARD';
  const MAX_ATTEMPTS=160;
  let attempts=0,applied=false;
  function arr(v){return Array.isArray(v)?v:[];}
  function records(v){
    if(Array.isArray(v))return v;
    if(v&&typeof v==='object')return arr(v.records||v.items||v.questions||v.content);
    return [];
  }
  function inferStage(x){
    if(x&&x.stage)return x.stage;
    const id=String((x&&(x.chapterId||x.lessonId||x.id))||'');
    if(id.indexOf('MATH-PREP-')===0)return 'prep';
    if(id.indexOf('MATH-HK1-')===0)return 'hk1';
    if(id.indexOf('MATH-HK2-')===0)return 'hk2';
    if(id.indexOf('MATH-HK3-')===0)return 'hk3';
    if(id.indexOf('MATH-HK4-')===0)return 'hk4';
    return 'vn';
  }
  function enriched(xs){return arr(xs).map(x=>x&&typeof x==='object'?Object.assign({},x,{stage:inferStage(x)}):x);}
  function emptyArray(v){return !Array.isArray(v)||v.length===0;}
  function mindmapLegacy(xs){
    return arr(xs).map((m,mi)=>{
      const nodes=arr(m.nodes), root=nodes.find(n=>n.id==='root')||nodes[0]||{};
      const children=nodes.filter(n=>n!==root);
      return {
        id:m.mindmapId||m.id||('E140-MM-'+(mi+1)),
        stage:inferStage(m),
        title:root.label||m.title||'Mind map',
        subtitle:'Sinh từ mindmap_content · nguồn chuẩn vẫn là content vault.',
        type:'radial',
        branches:children.map((n,i)=>({
          id:String(n.id||('branch_'+i)),
          title:n.label||n.title||String(n.id||'Nhánh'),
          summary:n.type?('Loại: '+n.type):'',
          children:[]
        }))
      };
    });
  }
  function apply(){
    if(applied)return true;
    const coreState=window.__BAUMAN_CORE_API&&window.__BAUMAN_CORE_API.state;
    if(!coreState||!(Number(coreState.e69InitialLoadMs)>0))return false;
    const db=window.DB;
    if(!db||!db.theory_lecture_content)return false;
    if(!window.__BAUMAN_MATH_E138_THEORY_OVERLAY__ || window.__BAUMAN_MATH_E138_THEORY_OVERLAY__.loaded!==true)return false;
    const sources={
      lessons:records(db.theory_lecture_content),
      formulas:records(db.formula_content),
      exercises:records(db.exercise_content),
      applications:records(db.application_content),
      simulations:records(db.simulation_content),
      professor_qa:records(db.professor_qa_content),
      review_packs:records(db.review_pack_content),
      question_bank:records(db.question_bank_content),
      test_blueprints:records(db.test_blueprint_content)
    };
    const bridged={};
    Object.keys(sources).forEach(k=>{
      const src=enriched(sources[k]);
      if(src.length&&emptyArray(db[k])){db[k]=src;bridged[k]=src.length;}
    });
    if(records(db.question_bank_content).length){
      if(!db.tests||typeof db.tests!=='object'||Array.isArray(db.tests))db.tests={};
      if(!Array.isArray(db.tests.questions)||!db.tests.questions.length){
        db.tests.questions=enriched(records(db.question_bank_content));
        bridged['tests.questions']=db.tests.questions.length;
      }
    }
    const mm=records(db.mindmap_content);
    if(mm.length&&emptyArray(db.mindmap)){db.mindmap=mindmapLegacy(mm);bridged.mindmap=db.mindmap.length;}
    applied=true;
    window.__BAUMAN_MATH_E140_VAULT_BRIDGE__={release:RELEASE,hardening:HARDENING,loaded:true,bridged,initialLoadMs:Number(coreState.e69InitialLoadMs)||0};
    try{if(window.__BAUMAN_CORE_API&&typeof window.__BAUMAN_CORE_API.render==='function')window.__BAUMAN_CORE_API.render();}catch(_){}
    return true;
  }
  function wait(){
    if(apply())return;
    attempts++;
    if(attempts<MAX_ATTEMPTS)setTimeout(wait,100);
    else window.__BAUMAN_MATH_E140_VAULT_BRIDGE__={release:RELEASE,hardening:HARDENING,loaded:false,error:'content_vaults_or_core_init_not_ready',attempts};
  }
  window.BAUMAN_MATH_E140_SELF_CHECK=function(){
    const db=window.DB||{}, q=arr(db.tests&&db.tests.questions);
    const levels=q.reduce((a,x)=>{const k=String(x.level||x.difficulty||'easy');a[k]=(a[k]||0)+1;return a;},{});
    return {
      ok:!!(window.__BAUMAN_MATH_E140_VAULT_BRIDGE__&&window.__BAUMAN_MATH_E140_VAULT_BRIDGE__.loaded)&&
         arr(db.lessons).length>0&&arr(db.exercises).length>0&&q.length>=48&&arr(db.mindmap).length>0,
      release:RELEASE,status:window.__BAUMAN_MATH_E140_VAULT_BRIDGE__||null,
      counts:{lessons:arr(db.lessons).length,formulas:arr(db.formulas).length,exercises:arr(db.exercises).length,
        applications:arr(db.applications).length,simulations:arr(db.simulations).length,questions:q.length,mindmap:arr(db.mindmap).length},
      questionLevels:levels
    };
  };
  wait();
})();
