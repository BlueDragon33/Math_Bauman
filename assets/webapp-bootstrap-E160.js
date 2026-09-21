(function(global){
  'use strict';
  const RELEASE='E169_PWA_ATOMIC_RESET_REWARM';
  let registration=null;
  let offlineReady=false;
  let cachedCount=0;
  let skippedCount=0;
  let failedCount=0;
  let controllerChanges=0;
  let runtimeResets=0;
  let rewarmTimer=null;

  function setStatus(ready){
    offlineReady=!!ready;
    document.documentElement.dataset.e160OfflineReady=offlineReady?'1':'0';
    global.__BAUMAN_MATH_E160_PWA__={
      release:RELEASE,
      registered:!!registration,
      offlineReady,
      cachedCount,
      skippedCount,
      failedCount,
      controllerChanges,
      runtimeResets
    };
    global.__BAUMAN_MATH_E166_PWA__=global.__BAUMAN_MATH_E160_PWA__;
  }

  function coreUrls(){
    const adapter=global.SUBJECT_ADAPTER||{};
    const files=Array.isArray(adapter.initialDataFiles)?adapter.initialDataFiles:[];
    return Array.from(new Set(
      files.map(name=>'data/'+name+'.json')
        .concat(['data/theory_lecture_overlay_e138.json'])
    ));
  }

  function warmCoreCache(type){
    const worker=navigator.serviceWorker?.controller
      || (registration&&(registration.active||registration.waiting||registration.installing));
    if(!worker)return false;
    const urls=coreUrls();
    if(!urls.length)return false;
    worker.postMessage({type:type||'E160_CACHE_URLS',urls});
    return true;
  }

  async function register(){
    if(!('serviceWorker' in navigator)||location.protocol==='file:'){
      setStatus(false);
      return null;
    }
    try{
      registration=await navigator.serviceWorker.register('./service-worker.js',{scope:'./'});
      registration=await navigator.serviceWorker.ready;
      setStatus(false);
      if(controllerChanges===0)warmCoreCache('E160_CACHE_URLS');
      return registration;
    }catch(error){
      console.warn('E160 service worker registration failed:',error&&error.message||error);
      setStatus(false);
      return null;
    }
  }

  function rewarmAfterControllerChange(){
    controllerChanges++;
    offlineReady=false;
    cachedCount=0;
    skippedCount=0;
    failedCount=0;
    setStatus(false);
    clearTimeout(rewarmTimer);
    rewarmTimer=setTimeout(()=>{
      warmCoreCache('E169_RESET_AND_CACHE_URLS');
    },60);
  }

  navigator.serviceWorker&&navigator.serviceWorker.addEventListener('controllerchange',()=>{
    rewarmAfterControllerChange();
  });

  navigator.serviceWorker&&navigator.serviceWorker.addEventListener('message',event=>{
    const data=event.data||{};
    if(data.type!=='E160_CACHE_COMPLETE')return;
    cachedCount=Number(data.cached||0);
    skippedCount=Number(data.skipped||0);
    failedCount=Number(data.failed||0);
    if(data.reset===true)runtimeResets++;
    setStatus(cachedCount>0&&failedCount===0);
  });

  global.MathBaumanPWA=Object.freeze({
    release:RELEASE,
    register,
    warmCoreCache,
    selfCheck:function(){
      return {
        ok:!!registration&&offlineReady&&cachedCount>0&&failedCount===0,
        release:RELEASE,
        registered:!!registration,
        controlled:!!navigator.serviceWorker?.controller,
        offlineReady,
        cachedCount,
        skippedCount,
        failedCount,
        controllerChanges,
        runtimeResets,
        initialDataFiles:coreUrls().length
      };
    }
  });

  setStatus(false);
  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',register,{once:true});
  }else{
    register();
  }
})(window);
