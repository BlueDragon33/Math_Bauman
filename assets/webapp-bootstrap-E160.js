(function(global){
  'use strict';
  const RELEASE='E166_PWA_ACTIVATION_FRESHNESS';
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

  function warmCoreCache(){
    const worker=registration&&(registration.active||registration.waiting||registration.installing);
    if(!worker)return false;
    const urls=coreUrls();
    if(!urls.length)return false;
    worker.postMessage({type:'E160_CACHE_URLS',urls});
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
      warmCoreCache();
      return registration;
    }catch(error){
      console.warn('E160 service worker registration failed:',error&&error.message||error);
      setStatus(false);
      return null;
    }
  }

  async function resetRuntimeCaches(){
    if(!('caches' in global))return 0;
    const keys=await caches.keys();
    const runtimeKeys=keys.filter(key=>/^math-bauman-.*-runtime$/.test(key));
    await Promise.all(runtimeKeys.map(key=>caches.delete(key)));
    runtimeResets+=runtimeKeys.length;
    return runtimeKeys.length;
  }

  async function rewarmAfterControllerChange(){
    controllerChanges++;
    setStatus(false);
    try{registration=await navigator.serviceWorker.ready;}catch(_){}
    try{await resetRuntimeCaches();}catch(_){}
    clearTimeout(rewarmTimer);
    rewarmTimer=setTimeout(()=>{warmCoreCache();},60);
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
