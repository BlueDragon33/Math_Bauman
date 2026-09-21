import fs from 'node:fs';
import { chromium } from 'playwright-core';

const BASE_URL = process.env.E155_BASE_URL || 'http://127.0.0.1:4173/index.html';
const chromeCandidates = [
  process.env.CHROME_PATH,
  '/usr/bin/google-chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser'
].filter(Boolean);
const executablePath = chromeCandidates.find(p => fs.existsSync(p));
if (!executablePath) {
  throw new Error('E155: no system Chromium/Chrome executable found');
}

const browser = await chromium.launch({
  headless: true,
  executablePath,
  args: ['--no-sandbox', '--disable-dev-shm-usage']
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const pageErrors = [];
const guardErrors = [];

page.on('pageerror', err => pageErrors.push(String(err && err.stack || err)));
page.on('console', msg => {
  if (msg.type() !== 'error') return;
  const text = msg.text();
  if (/FULL_RENDER_GUARD|RECOVERY_RENDER_FAILED|Learning tab render error/i.test(text)) {
    guardErrors.push(text);
  }
});

async function fail(message) {
  console.error('E155 FAIL:', message);
  if (pageErrors.length) console.error('Page errors:', pageErrors);
  if (guardErrors.length) console.error('Guard errors:', guardErrors);
  await browser.close();
  process.exit(1);
}

async function routeSmoke(label, view, learnTab = null) {
  await page.evaluate(({ view, learnTab }) => {
    const api = window.__BAUMAN_CORE_API;
    if (!api) throw new Error('missing __BAUMAN_CORE_API');
    api.state.view = view;
    if (learnTab) api.state.learnTab = learnTab;
    api.render();
  }, { view, learnTab });

  await page.waitForTimeout(120);
  const result = await page.evaluate(() => {
    const host = document.querySelector('#view');
    const text = (host?.innerText || '').replace(/\s+/g, ' ').trim();
    return {
      textLength: text.length,
      recovery: /KHÔI PHỤC TAB HỌC TẬP|LỖI TAB HỌC TẬP|RECOVERY_RENDER_FAILED/i.test(text),
      objectObject: /\[object Object\]/.test(text),
      state: window.__BAUMAN_CORE_API ? {
        view: window.__BAUMAN_CORE_API.state.view,
        learnTab: window.__BAUMAN_CORE_API.state.learnTab
      } : null,
      mindmapCanvas: !!document.querySelector('[data-mindmap-canvas="1"]'),
      maps: Array.isArray(window.DB?.mindmap) ? window.DB.mindmap.length : 0,
      professorQa: Array.isArray(window.DB?.professor_qa) ? window.DB.professor_qa.length : 0
    };
  });

  console.log('E155 route', label, JSON.stringify(result));
  if (!result.state || result.state.view !== view) await fail(label + ': view state mismatch');
  if (learnTab && result.state.learnTab !== learnTab) await fail(label + ': learning tab mismatch');
  if (result.textLength < 24) await fail(label + ': rendered content is unexpectedly empty');
  if (result.recovery) await fail(label + ': recovery UI was rendered');
  if (result.objectObject) await fail(label + ': visible [object Object] regression');
  if (view === 'mindmap' && (!result.mindmapCanvas || result.maps < 1)) {
    await fail(label + ': visible mindmap runtime surface missing');
  }
  if (view === 'dialogue' && result.professorQa < 1) {
    await fail(label + ': professor QA runtime bridge is empty');
  }
}

try {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });

  await page.waitForFunction(() => {
    return !!window.__BAUMAN_CORE_API &&
      !!window.DB &&
      document.querySelectorAll('#nav button[data-view]').length >= 8 &&
      (document.querySelector('#view')?.innerText || '').trim().length > 20;
  }, null, { timeout: 60000 });

  await page.waitForFunction(() => {
    return window.__BAUMAN_MATH_E140_VAULT_BRIDGE__?.loaded === true;
  }, null, { timeout: 30000 });

  await page.waitForFunction(() => {
    return window.__BAUMAN_MATH_E150_MINDMAP_TOPOLOGY__?.loaded === true;
  }, null, { timeout: 30000 });

  const checks = await page.evaluate(() => ({
    e140: typeof window.BAUMAN_MATH_E140_SELF_CHECK === 'function'
      ? window.BAUMAN_MATH_E140_SELF_CHECK() : null,
    e150: typeof window.BAUMAN_MATH_E150_SELF_CHECK === 'function'
      ? window.BAUMAN_MATH_E150_SELF_CHECK() : null,
    e73: typeof window.BAUMAN_MATH_E73_SELF_CHECK === 'function'
      ? window.BAUMAN_MATH_E73_SELF_CHECK() : null,
    navCount: document.querySelectorAll('#nav button[data-view]').length
  }));
  console.log('E155 self-checks', JSON.stringify(checks));
  if (!checks.e140?.ok) await fail('E140 runtime bridge self-check failed');
  if (!checks.e150?.ok) await fail('E150 mindmap/professor-QA self-check failed');
  if (checks.e73 && checks.e73.ok === false) await fail('E73 route self-check failed');
  if (checks.navCount < 8) await fail('navigation surface is incomplete');

  const routes = [
    ['overview', 'overview'],
    ['learning/theory', 'learning', 'theory'],
    ['learning/exercises', 'learning', 'exercises'],
    ['learning/practice', 'learning', 'practice'],
    ['learning/review', 'learning', 'review'],
    ['learning/exam', 'learning', 'exam'],
    ['dialogue', 'dialogue'],
    ['writing', 'writing'],
    ['media', 'media'],
    ['vocab', 'vocab'],
    ['grammar', 'grammar'],
    ['mindmap', 'mindmap'],
    ['storage', 'storage']
  ];
  for (const [label, view, tab] of routes) {
    await routeSmoke(label, view, tab || null);
  }

  const postChecks = await page.evaluate(() => ({
    e140: typeof window.BAUMAN_MATH_E140_SELF_CHECK === 'function'
      ? window.BAUMAN_MATH_E140_SELF_CHECK() : null,
    e150: typeof window.BAUMAN_MATH_E150_SELF_CHECK === 'function'
      ? window.BAUMAN_MATH_E150_SELF_CHECK() : null,
    maps: Array.isArray(window.DB?.mindmap) ? window.DB.mindmap.length : 0,
    professorQa: Array.isArray(window.DB?.professor_qa) ? window.DB.professor_qa.length : 0
  }));
  console.log('E155 post-route checks', JSON.stringify(postChecks));
  if (!postChecks.e140?.ok) await fail('E140 bridge regressed after route traversal');
  if (!postChecks.e150?.ok) await fail('E150 bridge regressed after route traversal');
  if (postChecks.maps < 1 || postChecks.professorQa < 1) {
    await fail('runtime bridged data was lost during route traversal');
  }

  // E157: use the real delegated UI events, then verify persisted state survives reload.
  await page.locator('#nav button[data-view="learning"]').click();
  await page.waitForFunction(() => window.__BAUMAN_CORE_API?.state?.view === 'learning');

  await page.evaluate(() => {
    const button = document.querySelector('button[data-learn="exercises"]');
    if (!button) throw new Error('missing exercises learning-tab button');
    button.click();
  });
  await page.waitForFunction(() => window.__BAUMAN_CORE_API?.state?.learnTab === 'exercises');

  const hasPrep = await page.locator('#stageSelect option[value="prep"]').count();
  if (!hasPrep) await fail('stageSelect does not expose prep stage');
  await page.locator('#stageSelect').selectOption('prep');
  await page.waitForFunction(() => window.__BAUMAN_CORE_API?.state?.stage === 'prep');

  const interactionState = await page.evaluate(() => ({
    view: window.__BAUMAN_CORE_API?.state?.view,
    learnTab: window.__BAUMAN_CORE_API?.state?.learnTab,
    stage: window.__BAUMAN_CORE_API?.state?.stage,
    viewText: (document.querySelector('#view')?.innerText || '').replace(/\s+/g, ' ').trim().length
  }));
  console.log('E157 interaction state', JSON.stringify(interactionState));
  if (interactionState.view !== 'learning' || interactionState.learnTab !== 'exercises' || interactionState.stage !== 'prep') {
    await fail('real UI interaction state mismatch');
  }
  if (interactionState.viewText < 24) await fail('interaction route rendered empty content');

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => {
    return !!window.__BAUMAN_CORE_API &&
      !!window.DB &&
      (document.querySelector('#view')?.innerText || '').trim().length > 20;
  }, null, { timeout: 60000 });
  await page.waitForFunction(() => window.__BAUMAN_MATH_E140_VAULT_BRIDGE__?.loaded === true, null, { timeout: 30000 });
  await page.waitForFunction(() => window.__BAUMAN_MATH_E150_MINDMAP_TOPOLOGY__?.loaded === true, null, { timeout: 30000 });

  const persisted = await page.evaluate(() => ({
    view: window.__BAUMAN_CORE_API?.state?.view,
    learnTab: window.__BAUMAN_CORE_API?.state?.learnTab,
    stage: window.__BAUMAN_CORE_API?.state?.stage,
    maps: Array.isArray(window.DB?.mindmap) ? window.DB.mindmap.length : 0,
    professorQa: Array.isArray(window.DB?.professor_qa) ? window.DB.professor_qa.length : 0,
    recovery: /KHÔI PHỤC TAB HỌC TẬP|LỖI TAB HỌC TẬP/i.test(document.querySelector('#view')?.innerText || '')
  }));
  console.log('E157 persisted state', JSON.stringify(persisted));
  if (persisted.view !== 'learning' || persisted.learnTab !== 'exercises' || persisted.stage !== 'prep') {
    await fail('view/tab/stage state did not persist across reload');
  }
  if (persisted.maps < 1 || persisted.professorQa < 1) await fail('content bridges did not recover after reload');
  if (persisted.recovery) await fail('reload fell into recovery UI');

  // E158: mobile viewport smoke for the most important surfaces.
  await page.setViewportSize({ width: 390, height: 844 });
  const mobileRoutes = [
    ['mobile/overview', 'overview', null],
    ['mobile/learning-theory', 'learning', 'theory'],
    ['mobile/dialogue', 'dialogue', null],
    ['mobile/mindmap', 'mindmap', null]
  ];
  for (const [label, view, tab] of mobileRoutes) {
    await routeSmoke(label, view, tab);
    const geometry = await page.evaluate(() => {
      const app = document.querySelector('#app')?.getBoundingClientRect();
      const main = document.querySelector('.main')?.getBoundingClientRect();
      const bodyOverflow = Math.max(0, document.documentElement.scrollWidth - window.innerWidth);
      return {
        innerWidth: window.innerWidth,
        appWidth: app?.width || 0,
        mainWidth: main?.width || 0,
        bodyOverflow
      };
    });
    console.log('E158 mobile geometry', label, JSON.stringify(geometry));
    if (geometry.appWidth < 300 || geometry.mainWidth < 280) {
      await fail(label + ': main application area collapsed on mobile');
    }
    if (geometry.bodyOverflow > 32) {
      await fail(label + ': global horizontal overflow ' + geometry.bodyOverflow + 'px');
    }
  }

  // E160: installability + warm-cache + true offline reload.
  await page.waitForFunction(() => {
    const pwa = window.MathBaumanPWA;
    if (!pwa || typeof pwa.selfCheck !== 'function') return false;
    const status = pwa.selfCheck();
    return status.ok === true && status.controlled === true;
  }, null, { timeout: 120000 });

  const pwaOnline = await page.evaluate(() => window.MathBaumanPWA.selfCheck());
  console.log('E160 PWA online-ready', JSON.stringify(pwaOnline));
  if (!pwaOnline.ok || !pwaOnline.controlled || pwaOnline.initialDataFiles < 10) {
    await fail('PWA did not become controlled/offline-ready');
  }

  const activationSeed = await page.evaluate(async () => {
    const keys = await caches.keys();
    const runtime = keys.find(k => k.endsWith('-runtime'));
    if (!runtime) return { ok:false, runtime };
    const url = new URL('./__e166_activation_stale_probe__.txt', location.href).href;
    const req = new Request(url);
    await (await caches.open(runtime)).put(req, new Response('stale-before-update', { status:200, headers:{'Content-Type':'text/plain'} }));
    const status = window.MathBaumanPWA.selfCheck();
    return { ok:true, runtime, url, controllerChanges:status.controllerChanges || 0 };
  });
  console.log('E166 activation seed', JSON.stringify(activationSeed));
  if (!activationSeed.ok) await fail('E166 could not seed stale runtime cache probe');

  fs.appendFileSync(new URL('../service-worker.js', import.meta.url), '\n// E166 CI update probe\n', 'utf8');

  const swUpdate = await page.evaluate(async (beforeChanges) => {
    const registration = await navigator.serviceWorker.getRegistration('./');
    if (!registration) return { ok:false, reason:'missing registration' };
    const changed = new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('controllerchange timeout')), 30000);
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        clearTimeout(timer);
        resolve(true);
      }, { once:true });
    });
    await registration.update();
    await changed;
    return {
      ok:true,
      beforeChanges,
      controller: !!navigator.serviceWorker.controller
    };
  }, activationSeed.controllerChanges);
  console.log('E166 service-worker update', JSON.stringify(swUpdate));
  if (!swUpdate.ok || !swUpdate.controller) await fail('E166 service worker did not take control after update');

  await page.waitForFunction((beforeChanges) => {
    const pwa = window.MathBaumanPWA;
    if (!pwa || typeof pwa.selfCheck !== 'function') return false;
    const status = pwa.selfCheck();
    return status.ok === true && status.controllerChanges > beforeChanges;
  }, activationSeed.controllerChanges, { timeout: 120000 });

  const activationPost = await page.evaluate(async (probeUrl) => {
    const keys = await caches.keys();
    const runtime = keys.find(k => k.endsWith('-runtime'));
    const cache = runtime ? await caches.open(runtime) : null;
    const hit = cache ? await cache.match(probeUrl) : null;
    const entries = cache ? await cache.keys() : [];
    const required = {};
    for (const path of [
      'data/theory_lecture_content.json',
      'data/mindmap_content.json',
      'data/theory_lecture_overlay_e138.json'
    ]) {
      const url = new URL(path, location.href).href;
      const response = cache ? await cache.match(url) : null;
      required[path] = response ? { present:true, status:response.status } : { present:false };
    }
    return {
      runtime,
      staleProbePresent: !!hit,
      entryCount: entries.length,
      required,
      sampleEntries: entries.slice(0,8).map(r=>r.url),
      pwa: window.MathBaumanPWA.selfCheck()
    };
  }, activationSeed.url);
  console.log('E166 activation post', JSON.stringify(activationPost));
  const materialized = Object.values(activationPost.required || {}).every(x => x && x.present);
  if (activationPost.staleProbePresent || !activationPost.pwa.ok || activationPost.entryCount < 40 || !materialized) {
    await fail('E168 runtime cache did not materialize required core data after service-worker activation');
  }

  const cachePrioritySeed = await page.evaluate(async () => {
    const keys = await caches.keys();
    const shell = keys.find(k => k.endsWith('-shell'));
    const runtime = keys.find(k => k.endsWith('-runtime'));
    if (!shell || !runtime) return { ok:false, shell, runtime };
    const url = new URL('./__e165_cache_priority_probe__.txt', location.href).href;
    const req = new Request(url);
    await (await caches.open(shell)).put(req, new Response('shell-stale', { status:200, headers:{'Content-Type':'text/plain'} }));
    await (await caches.open(runtime)).put(req, new Response('runtime-fresh', { status:200, headers:{'Content-Type':'text/plain'} }));
    return { ok:true, shell, runtime, url };
  });
  console.log('E165 cache priority seed', JSON.stringify(cachePrioritySeed));
  if (!cachePrioritySeed.ok) await fail('E165 could not seed shell/runtime cache priority probe');

  const serverPid = Number(process.env.E155_SERVER_PID || 0);
  if (!Number.isInteger(serverPid) || serverPid <= 1) {
    await fail('E164 local origin PID is unavailable');
  }
  process.kill(serverPid, 'SIGTERM');
  await new Promise(resolve => setTimeout(resolve, 350));
  console.log('E164 origin stopped', JSON.stringify({ serverPid }));

  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => {
    return !!window.__BAUMAN_CORE_API &&
      !!window.DB &&
      (document.querySelector('#view')?.innerText || '').trim().length > 20;
  }, null, { timeout: 60000 });
  try {
    await page.waitForFunction(() => window.__BAUMAN_MATH_E140_VAULT_BRIDGE__?.loaded === true, null, { timeout: 22000 });
  } catch (error) {
    const diagnostics = await page.evaluate(async () => {
      const db = window.DB || {};
      const files = Array.isArray(window.SUBJECT_ADAPTER?.initialDataFiles) ? window.SUBJECT_ADAPTER.initialDataFiles : [];
      const missing = files.filter(name => !Object.prototype.hasOwnProperty.call(db, name));
      const nullish = files.filter(name => Object.prototype.hasOwnProperty.call(db, name) && db[name] == null);
      let overlayFetch = null;
      try {
        const r = await fetch('data/theory_lecture_overlay_e138.json', { cache:'no-store' });
        overlayFetch = { ok:r.ok, status:r.status, length:(await r.text()).length };
      } catch (e) {
        overlayFetch = { ok:false, error:String(e && e.message || e) };
      }
      return {
        e138: window.__BAUMAN_MATH_E138_THEORY_OVERLAY__ || null,
        e140: window.__BAUMAN_MATH_E140_VAULT_BRIDGE__ || null,
        initialCount: files.length,
        missing,
        nullish,
        theoryContent: Array.isArray(db.theory_lecture_content)
          ? db.theory_lecture_content.length
          : (Array.isArray(db.theory_lecture_content?.records) ? db.theory_lecture_content.records.length : null),
        formulaContent: Array.isArray(db.formula_content)
          ? db.formula_content.length
          : (Array.isArray(db.formula_content?.records) ? db.formula_content.records.length : null),
        mindmapContent: Array.isArray(db.mindmap_content)
          ? db.mindmap_content.length
          : (Array.isArray(db.mindmap_content?.records) ? db.mindmap_content.records.length : null),
        overlayFetch,
        cacheKeys: await caches.keys(),
        pwa: typeof window.MathBaumanPWA?.selfCheck === 'function' ? window.MathBaumanPWA.selfCheck() : null,
        controllerScript: navigator.serviceWorker?.controller?.scriptURL || null,
        runtimeCache: await (async()=>{
          const key=(await caches.keys()).find(k=>k.endsWith('-runtime'));
          if(!key)return {key:null,count:0,sample:[]};
          const cache=await caches.open(key);
          const entries=await cache.keys();
          const probes={};
          for(const path of ['data/content_vault_manifest.json','data/discipline_spine.json','data/chapter_spine.json','data/theory_lecture_content.json','data/mindmap_content.json']){
            const u=new URL(path,location.href).href;
            probes[path]=!!(await cache.match(u));
          }
          return {key,count:entries.length,sample:entries.slice(0,12).map(x=>x.url),probes};
        })()
      };
    });
    console.error('E167 offline bridge diagnostics', JSON.stringify(diagnostics));
    await fail('E140 did not hydrate after service-worker update + origin-down reload');
  }
  await page.waitForFunction(() => window.__BAUMAN_MATH_E150_MINDMAP_TOPOLOGY__?.loaded === true, null, { timeout: 30000 });

  const offline = await page.evaluate(async () => {
    let uncachedProbeFailed = false;
    let cachePriorityBody = '';
    try {
      await fetch('./__e162_uncached_offline_probe__.txt?probe=' + Date.now(), { cache: 'no-store' });
    } catch (_) {
      uncachedProbeFailed = true;
    }
    try {
      const response = await fetch('./__e165_cache_priority_probe__.txt', { cache: 'no-store' });
      cachePriorityBody = await response.text();
    } catch (_) {}
    return {
      onlineHint: navigator.onLine,
      uncachedProbeFailed,
      cachePriorityBody,
      view: window.__BAUMAN_CORE_API?.state?.view,
      textLength: (document.querySelector('#view')?.innerText || '').replace(/\s+/g, ' ').trim().length,
      maps: Array.isArray(window.DB?.mindmap) ? window.DB.mindmap.length : 0,
      professorQa: Array.isArray(window.DB?.professor_qa) ? window.DB.professor_qa.length : 0,
      e140: typeof window.BAUMAN_MATH_E140_SELF_CHECK === 'function' ? window.BAUMAN_MATH_E140_SELF_CHECK().ok : false,
      e150: typeof window.BAUMAN_MATH_E150_SELF_CHECK === 'function' ? window.BAUMAN_MATH_E150_SELF_CHECK().ok : false,
      recovery: /KHÔI PHỤC TAB HỌC TẬP|LỖI TAB HỌC TẬP/i.test(document.querySelector('#view')?.innerText || '')
    };
  });
  console.log('E160 offline reload', JSON.stringify(offline));
  if (!offline.uncachedProbeFailed || offline.cachePriorityBody !== 'runtime-fresh' || offline.textLength < 24 || offline.maps < 1 || offline.professorQa < 1 || !offline.e140 || !offline.e150 || offline.recovery) {
    await fail('offline reload did not preserve a healthy learning runtime');
  }
  if (pageErrors.length) await fail('uncaught page errors detected');
  if (guardErrors.length) await fail('render guard errors detected');

  console.log('E155/E157/E158/E160/E162/E164/E165/E166 PASS: routes, interactions, persistence, mobile layout, offline runtime, cache freshness and service-worker activation are healthy.');
} finally {
  await browser.close();
}
