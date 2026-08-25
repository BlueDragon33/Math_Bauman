/* E239 · Minimum slide contract for E129 importer
 * Rule: 16 slides is the minimum, not the exact count or maximum.
 * This narrow compatibility patch removes only the obsolete count warning
 * when a valid imported record has 16 or more slides.
 */
(function(){
  'use strict';

  var RELEASE='E239_MINIMUM_16_SLIDES_NOT_MAXIMUM';
  var MIN_SLIDES=16;
  var REPORT_KEY='bauman_math_e129_theory_content_report_v1';
  var SUBJECT_STORAGE=window.BaumanSubjectStorage.forSubject('math');
  var COUNT_WARNING=/Khuyến nghị đủ 16 slide role; hiện có\s+(\d+)\./i;
  var originalStorageSet=Storage.prototype.setItem;
  var wrappedApi=false;

  function arr(v){return Array.isArray(v)?v:[];}

  function warningCount(w){
    var message=String(w&&w.message||w||'');
    var match=message.match(COUNT_WARNING);
    return match?Number(match[1]):-1;
  }

  function normalizeReport(report){
    if(!report||typeof report!=='object')return report;
    var copy=Object.assign({},report);
    copy.warnings=arr(report.warnings).filter(function(w){
      var count=warningCount(w);
      return count<0||count<MIN_SLIDES;
    });
    copy.slideCountContract={minimum:MIN_SLIDES,maximum:null,exact:false};
    return copy;
  }

  function installStorageFilter(){
    if(Storage.prototype.setItem.__e239Wrapped)return;
    function setItem(key,value){
      if(String(key)===REPORT_KEY){
        try{
          var parsed=JSON.parse(String(value));
          value=JSON.stringify(normalizeReport(parsed));
        }catch(_){ }
      }
      return originalStorageSet.call(this,key,value);
    }
    setItem.__e239Wrapped=true;
    Storage.prototype.setItem=setItem;
  }

  function validateSlideCount(count){
    count=Number(count)||0;
    return {
      ok:count>=MIN_SLIDES,
      count:count,
      minimum:MIN_SLIDES,
      maximum:null,
      warning:count<MIN_SLIDES?('Bài giảng cần tối thiểu '+MIN_SLIDES+' slide; hiện có '+count+'.'):''
    };
  }

  function patchApi(){
    var api=window.BAUMAN_MATH_THEORY_E129;
    if(!api||wrappedApi)return false;
    wrappedApi=true;

    if(api.contract){
      api.contract.minimumSlideCount=MIN_SLIDES;
      api.contract.maximumSlideCount=null;
      api.contract.slideCountMode='minimum_not_exact';
      api.contract.preferredSlideRolesAreBaseline=true;
      api.contract.extendedSemanticRolesAllowed=true;
    }

    if(typeof api.commitContent==='function'){
      var originalCommit=api.commitContent;
      api.commitContent=function(){
        var report=originalCommit.apply(api,arguments);
        var normalized=normalizeReport(report);
        try{SUBJECT_STORAGE.setJSON(REPORT_KEY,normalized,{kind:'math-e129-report'});}catch(_){ }
        return normalized;
      };
    }

    var originalSelfCheck=typeof api.selfCheck==='function'?api.selfCheck:null;
    api.selfCheck=function(){
      var base=originalSelfCheck?originalSelfCheck.apply(api,arguments):{};
      return Object.assign({},base,{
        minSlideContract:true,
        minimumSlideCount:MIN_SLIDES,
        maximumSlideCount:null,
        countTests:{
          fifteen:validateSlideCount(15),
          sixteen:validateSlideCount(16),
          twentyTwo:validateSlideCount(22)
        },
        releasePatch:RELEASE
      });
    };

    return true;
  }

  function sanitizeStoredReport(){
    try{
      var raw=SUBJECT_STORAGE.getItem(REPORT_KEY);
      if(!raw)return;
      var parsed=JSON.parse(raw);
      SUBJECT_STORAGE.setJSON(REPORT_KEY,normalizeReport(parsed),{kind:'math-e129-report-sanitize'});
    }catch(_){ }
  }

  function boot(){
    installStorageFilter();
    sanitizeStoredReport();
    if(patchApi())return;
    var tries=0;
    var timer=setInterval(function(){
      tries+=1;
      if(patchApi()||tries>=40)clearInterval(timer);
    },50);
  }

  window.BAUMAN_MATH_E239_MIN_SLIDE_CONTRACT={
    release:RELEASE,
    minimumSlideCount:MIN_SLIDES,
    maximumSlideCount:null,
    validateSlideCount:validateSlideCount,
    normalizeReport:normalizeReport,
    selfCheck:function(){
      return {
        ok:validateSlideCount(15).ok===false&&validateSlideCount(16).ok===true&&validateSlideCount(22).ok===true,
        tests:{fifteen:validateSlideCount(15),sixteen:validateSlideCount(16),twentyTwo:validateSlideCount(22)},
        apiPatched:wrappedApi
      };
    }
  };

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);
  else boot();
})();
