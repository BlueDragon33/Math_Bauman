(function(global){
  'use strict';
  const RELEASE='E160_PWA_OFFLINE_SHELL';
  let registration=null;
  let offlineReady=false;
  let cachedCount=0;
  let failedCount=0;

  function setStatus(ready){
    offlineReady=!!ready;
    document.documentElement.dataset.e160OfflineReady=offlineReady?'1':'0';
    global.__BAUMAN_MATH_E160_PWA__={
      release:RELEASE,
      registered:!!registration,
      offlineReady,
      cachedCount,
      failedCount
    };
  }

  function coreUrls(){
    const adapter=global.SUBJECT_ADAPTER||{};
    const files=Array.isArray(adapter.initialDataFiles)?adapter.initialDataFiles:[];
    return files.map(name=>'data/'+name+'.json');
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

  navigator.serviceWorker&&navigator.serviceWorker.addEventListener('message',event=>{
    const data=event.data||{};
    if(data.type!=='E160_CACHE_COMPLETE')return;
    cachedCount=Number(data.cached||0);
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
        failedCount,
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
