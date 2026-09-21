(function(global){
  'use strict';
  const RELEASE='E173_PWA_OFFLINE_READINESS_PERSISTENCE';
  let registration=null;
  let offlineReady=false;
  let cachedCount=0;
  let availableCachedCount=0;
  let skippedCount=0;
  let failedCount=0;
  let lastWarmFailedCount=0;
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
      availableCachedCount,
      skippedCount,
      failedCount,
      lastWarmFailedCount,
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

  function requiredOfflineUrls(){
    return [
      'data/content_vault_manifest.json',
      'data/discipline_spine.json',
      'data/chapter_spine.json',
      'data/theory_lecture_content.json',
      'data/question_bank_content.json',
      'data/mindmap_content.json',
      'data/theory_lecture_overlay_e138.json'
    ];
  }

  async function inspectRuntimeCache(){
    if(!('caches' in global))return {healthy:false,available:0,key:null};
    try{
      const keys=await caches.keys();
      const key=keys.find(k=>/^math-bauman-.*-runtime$/.test(k));
      if(!key)return {healthy:false,available:0,key:null};
      const cache=await caches.open(key);
      const urls=coreUrls();
      let available=0;
      for(const raw of urls){
        const url=new URL(raw,location.href).href;
        if(await cache.match(url,{ignoreSearch:true}))available++;
      }
      let required=true;
      for(const raw of requiredOfflineUrls()){
        const url=new URL(raw,location.href).href;
        if(!(await cache.match(url,{ignoreSearch:true}))){
          required=false;
          break;
        }
      }
      const minimum=Math.min(12,Math.max(1,urls.length));
      return {healthy:required&&available>=minimum,available,key,total:urls.length};
    }catch(_){
      return {healthy:false,available:0,key:null};
    }
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
      const retained=await inspectRuntimeCache();
      availableCachedCount=retained.available;
      if(retained.healthy){
        cachedCount=retained.available;
        skippedCount=Math.max(0,coreUrls().length-retained.available);
        failedCount=0;
        setStatus(true);
      }else{
        setStatus(false);
      }
      if(controllerChanges===0)warmCoreCache('E160_CACHE_URLS');
      return registration;
    }catch(error){
      console.warn('E160 service worker registration failed:',error&&error.message||error);
      const retained=await inspectRuntimeCache();
      availableCachedCount=retained.available;
      setStatus(retained.healthy);
      return null;
    }
  }

  function rewarmAfterControllerChange(){
    controllerChanges++;
    offlineReady=false;
    cachedCount=0;
    availableCachedCount=0;
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
    void (async()=>{
      cachedCount=Number(data.cached||0);
      skippedCount=Number(data.skipped||0);
      failedCount=Number(data.failed||0);
      lastWarmFailedCount=failedCount;
      if(data.reset===true)runtimeResets++;

      if(cachedCount>0&&failedCount===0){
        availableCachedCount=Math.max(availableCachedCount,cachedCount);
        setStatus(true);
        return;
      }

      // E173: a normal rewarm may fail because the origin is offline while a
      // previously materialized runtime cache is still complete and usable.
      // Preserve readiness from verified cached resources instead of treating
      // network reachability as equivalent to offline capability.
      if(data.reset!==true){
        const retained=await inspectRuntimeCache();
        availableCachedCount=retained.available;
        if(retained.healthy){
          cachedCount=Math.max(cachedCount,retained.available);
          setStatus(true);
          return;
        }
      }
      setStatus(false);
    })();
  });

  global.MathBaumanPWA=Object.freeze({
    release:RELEASE,
    register,
    warmCoreCache,
    inspectRuntimeCache,
    selfCheck:function(){
      return {
        ok:!!registration&&offlineReady&&availableCachedCount>0,
        release:RELEASE,
        registered:!!registration,
        controlled:!!navigator.serviceWorker?.controller,
        offlineReady,
        cachedCount,
        availableCachedCount,
        skippedCount,
        failedCount,
        lastWarmFailedCount,
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
