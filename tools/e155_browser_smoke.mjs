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

  if (pageErrors.length) await fail('uncaught page errors detected');
  if (guardErrors.length) await fail('render guard errors detected');

  console.log('E155 PASS: browser runtime routes and content bridges are healthy.');
} finally {
  await browser.close();
}
