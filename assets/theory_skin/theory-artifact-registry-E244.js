/* E244 · Lesson-scoped theory artifact registry
 * Registers optional Reference / Full View / Normalization / Slideshow sources.
 * Provides one shared lesson resolver; creates no reader or slideshow engine.
 */
(function(){
  'use strict';

  var RELEASE='E244_MULTI_LESSON_THEORY_ARTIFACT_REGISTRY';
  var GROUP='Bài giảng lý thuyết · Artifact phụ';
  var KINDS=['reference','fullView','normalization','slideshow'];
  var REGISTRY={
    'MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140':{
      lessonId:'MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140',
      lessonTitle:'§1.4 · Cơ sở, span và tọa độ',
      academicStatus:'accepted',
      reference:{id:'theory_reference_c01_l04',label:'Tham khảo thêm · §1.4',path:'data/theory_reference/theory_reference_c01_l04.json',version:'REFERENCE_C01_L04_V1_APPROVED'},
      fullView:{id:'theory_full_view_c01_l04',label:'Xem đầy đủ · §1.4',path:'data/theory_full_view/theory_full_view_c01_l04.json',version:'FULL_VIEW_C01_L04_V1_APPROVED'},
      normalization:{id:'theory_normalization_c01_l04',label:'Chuẩn hóa ký hiệu · §1.4',path:'data/theory_normalization/theory_normalization_c01_l04.json',version:'NORMALIZATION_C01_L04_V1_APPROVED'},
      slideshow:{id:'theory_slideshow_c01_l04',label:'Slideshow richness · §1.4',path:'data/theory_slideshow/theory_slideshow_c01_l04.json',version:'SLIDESHOW_C01_L04_V1_APPROVED',expected:{slides:22,diagrams:8,retrievalChecks:9,misconceptions:16}}
    },
    'MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140':{
      lessonId:'MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140',
      lessonTitle:'§1.5 · Không gian con và biểu diễn dữ liệu',
      academicStatus:'ACADEMIC_14_OF_14_PASS',
      academicAcceptance:'THEORY_C01_L05_ACADEMIC_ACCEPTANCE.json',
      reference:{id:'theory_reference_c01_l05',label:'Tham khảo thêm · §1.5',path:'data/theory_reference/theory_reference_c01_l05.json',version:'REFERENCE_C01_L05_V1_PASS11'},
      fullView:{id:'theory_full_view_c01_l05',label:'Xem đầy đủ · §1.5',path:'data/theory_full_view/theory_full_view_c01_l05.json',version:'FULL_VIEW_C01_L05_V1_PASS12'},
      normalization:{id:'theory_normalization_c01_l05',label:'Chuẩn hóa ký hiệu · §1.5',path:'data/theory_normalization/theory_normalization_c01_l05.json',version:'NORMALIZATION_C01_L05_V1_PASS12'},
      slideshow:{id:'theory_slideshow_c01_l05',label:'Slideshow richness · §1.5',path:'data/theory_slideshow/theory_slideshow_c01_l05.json',version:'SLIDESHOW_C01_L05_V1_PASS13',expected:{slides:22,diagrams:9,retrievalChecks:10,misconceptions:18}}
    }
  };

  function clone(value){try{return JSON.parse(JSON.stringify(value));}catch(_){return value;}}
  function norm(value){return String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/§/g,'').replace(/[^a-z0-9.]+/g,' ').trim();}

  function sourceMeta(entry,spec,kind){
    return {
      label:spec.label,
      path:spec.path,
      group:GROUP,
      required:false,
      lazy:true,
      lessonId:entry.lessonId,
      lessonTitle:entry.lessonTitle,
      artifactKind:kind,
      version:spec.version,
      expected:spec.expected||null,
      release:RELEASE
    };
  }

  function register(){
    var A=window.SUBJECT_ADAPTER;
    if(!A)return false;
    A.dataSourceMeta=A.dataSourceMeta||{};
    Object.keys(REGISTRY).forEach(function(lessonId){
      var entry=REGISTRY[lessonId];
      KINDS.forEach(function(kind){
        var spec=entry[kind];
        if(spec&&spec.id)A.dataSourceMeta[spec.id]=sourceMeta(entry,spec,kind);
      });
    });
    return true;
  }

  function get(lessonId){return REGISTRY[String(lessonId||'')]||null;}
  function list(){return Object.keys(REGISTRY).map(function(id){return clone(REGISTRY[id]);});}
  function resolve(values){
    var input=Array.isArray(values)?values:[values], ids=Object.keys(REGISTRY), i, j, raw, n, entry, title;
    for(i=0;i<input.length;i++){
      raw=String(input[i]||'');
      if(REGISTRY[raw])return REGISTRY[raw];
    }
    for(i=0;i<input.length;i++){
      n=norm(input[i]);
      if(!n)continue;
      for(j=0;j<ids.length;j++){
        entry=REGISTRY[ids[j]];
        title=norm(entry.lessonTitle);
        if(n===norm(entry.lessonId)||n===title||n.indexOf(title)>=0||title.indexOf(n)>=0)return entry;
      }
    }
    return null;
  }

  function selfCheck(){
    var entries=list(), sources=[];
    entries.forEach(function(entry){
      KINDS.forEach(function(kind){
        var spec=entry[kind];
        sources.push({lessonId:entry.lessonId,kind:kind,id:spec.id,path:spec.path,version:spec.version,expected:spec.expected||null});
      });
    });
    var ids=sources.map(function(x){return x.id;});
    return {
      ok:entries.length===2&&sources.length===8&&new Set(ids).size===8,
      release:RELEASE,
      lessonCount:entries.length,
      sourceCount:sources.length,
      kinds:KINDS.slice(),
      duplicateSourceIds:ids.filter(function(id,index){return ids.indexOf(id)!==index;}),
      registered:register(),
      multiLessonResolver:true,
      entries:entries,
      sources:sources,
      newSlideshowEngineCreated:false,
      e235Modified:false
    };
  }

  window.BAUMAN_MATH_THEORY_ARTIFACT_REGISTRY_E244={
    release:RELEASE,
    entries:REGISTRY,
    kinds:KINDS.slice(),
    get:get,
    list:list,
    resolve:resolve,
    register:register,
    selfCheck:selfCheck
  };

  if(!register()){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',register,{once:true});
    setTimeout(register,0);
  }
})();
