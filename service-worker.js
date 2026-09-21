'use strict';

const RELEASE='math-bauman-e160-pwa-v1';
const SHELL_CACHE=RELEASE+'-shell';
const RUNTIME_CACHE=RELEASE+'-runtime';
const CACHE_PREFIX='math-bauman-';

const SHELL=[
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/app-icon.svg',
  './subject-manifest.js',
  './subject-manifest.json',
  './assets/core.css',
  './assets/math.css',
  './assets/theory_skin/theory-main-adapter-E126.css',
  './assets/datavault_importer/datavault-importer-E128.css',
  './assets/overview_cleanup/overview-home-E129.css',
  './assets/overview_state_guard/overview-state-guard-E130.css',
  './assets/runtime_audit/runtime-ui-consistency-E133.css',
  './assets/platform/storage-adapter.js',
  './assets/platform/subject-storage.js',
  './assets/subject-adapter.js',
  './assets/runtime_sync/runtime-release-sync-E132.js',
  './assets/runtime_audit/runtime-release-sync-E133.js',
  './assets/runtime_audit/runtime-release-sync-E134.js',
  './assets/runtime_audit/runtime-release-sync-E147.js',
  './assets/planning-bridge.js',
  './assets/core.js',
  './assets/runtime_content/theory-overlay-E138.js',
  './assets/runtime_content/content-vault-bridge-E140.js',
  './assets/runtime_content/mindmap-topology-bridge-E150.js',
  './assets/theory_skin/theory-main-adapter-E126.js',
  './assets/datavault_importer/datavault-importer-E128.js',
  './assets/overview_cleanup/overview-home-E129.js',
  './assets/overview_state_guard/overview-state-guard-E130.js',
  './assets/webapp-bootstrap-E160.js'
];

async function put(cacheName,request,response){
  if(!response||!response.ok)return response;
  const cache=await caches.open(cacheName);
  await cache.put(request,response.clone());
  return response;
}

async function cached(request){
  const runtime=await caches.open(RUNTIME_CACHE);
  const shell=await caches.open(SHELL_CACHE);
  return (await runtime.match(request))
    || (await runtime.match(request,{ignoreSearch:true}))
    || (await shell.match(request))
    || (await shell.match(request,{ignoreSearch:true}));
}

self.addEventListener('install',event=>{
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(cache=>cache.addAll(SHELL))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener('activate',event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key.startsWith(CACHE_PREFIX)&&key!==SHELL_CACHE&&key!==RUNTIME_CACHE).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener('message',event=>{
  const data=event.data||{};
  if(data.type!=='E160_CACHE_URLS'||!Array.isArray(data.urls))return;
  event.waitUntil((async()=>{
    let cachedCount=0,skippedCount=0,failedCount=0;
    const cache=await caches.open(RUNTIME_CACHE);
    for(const raw of Array.from(new Set(data.urls))){
      try{
        const url=new URL(raw,self.location.href);
        if(url.origin!==self.location.origin)continue;
        const request=new Request(url.href,{method:'GET',credentials:'same-origin',cache:'reload'});
        const response=await fetch(request);
        if(response&&response.ok){
          await cache.put(request,response.clone());
          cachedCount++;
        }else if(response&&response.status===404){
          skippedCount++;
        }else{
          failedCount++;
        }
      }catch(_){failedCount++;}
    }
    try{event.source&&event.source.postMessage({type:'E160_CACHE_COMPLETE',cached:cachedCount,skipped:skippedCount,failed:failedCount,release:RELEASE});}catch(_){}
  })());
});

self.addEventListener('fetch',event=>{
  const request=event.request;
  if(request.method!=='GET')return;
  const url=new URL(request.url);
  if(url.origin!==self.location.origin)return;

  event.respondWith((async()=>{
    try{
      const response=await fetch(request);
      return await put(RUNTIME_CACHE,request,response);
    }catch(_){
      const hit=await cached(request);
      if(hit)return hit;
      if(request.mode==='navigate'){
        const fallback=await cached(new Request(new URL('./index.html',self.location.href).href));
        if(fallback)return fallback;
      }
      return Response.error();
    }
  })());
});
