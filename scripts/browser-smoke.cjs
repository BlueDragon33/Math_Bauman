'use strict';

const fs = require('fs');
const http = require('http');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.resolve(__dirname, '..');
const HOST = '127.0.0.1';
const PORT = Number(process.env.MATH_WEBAPP_PORT || 4173);
const BASE_URL = `http://${HOST}:${PORT}`;
const report = { gate: 'MATH-V2-L2-BROWSER', status: 'FAIL', checks: [], diagnostics: {} };

const MIME = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8'
};

function check(id, title, ok, evidence) {
  report.checks.push({ id, title, ok: Boolean(ok), evidence });
  if (!ok) throw new Error(`${id}: ${title}`);
}

function safeFile(requestUrl) {
  const url = new URL(requestUrl, BASE_URL);
  const relative = decodeURIComponent(url.pathname).replace(/^\/+/, '') || 'index.html';
  const file = path.resolve(ROOT, relative);
  return file === ROOT || file.startsWith(ROOT + path.sep) ? file : null;
}

function createServer() {
  return http.createServer((request, response) => {
    const file = safeFile(request.url || '/');
    if (!file) {
      response.writeHead(403).end('Forbidden');
      return;
    }
    fs.stat(file, (statError, stat) => {
      const target = !statError && stat.isDirectory() ? path.join(file, 'index.html') : file;
      fs.readFile(target, (readError, body) => {
        if (readError) {
          response.writeHead(readError.code === 'ENOENT' ? 404 : 500).end('Not found');
          return;
        }
        response.writeHead(200, {
          'Cache-Control': 'no-store',
          'Content-Type': MIME[path.extname(target)] || 'application/octet-stream'
        });
        response.end(body);
      });
    });
  });
}

async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(PORT, HOST, resolve);
  });
}

async function close(server) {
  if (!server.listening) return;
  await new Promise((resolve) => server.close(resolve));
}

async function run() {
  const server = createServer();
  let browser;
  await listen(server);
  try {
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      locale: 'vi-VN',
      viewport: { width: 1440, height: 1000 }
    });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const failedRequests = [];
    let phase = 'online';

    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(`[${phase}] ${message.text()}`);
    });
    page.on('pageerror', (error) => pageErrors.push(`[${phase}] ${error.message}`));
    page.on('requestfailed', (request) => {
      if (phase === 'online') failedRequests.push(`${request.url()} · ${request.failure() && request.failure().errorText}`);
    });

    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(() => {
      const theory = window.DB && window.DB.theory_lecture_content;
      const records = Array.isArray(theory) ? theory : theory && theory.records;
      return window.MathBaumanWebApp &&
        window.DB && Array.isArray(window.DB.lessons) && window.DB.lessons.length === 347 &&
        Array.isArray(records) && records.length === 18 &&
        document.querySelectorAll('#nav [data-view]').length >= 9 &&
        Boolean(document.querySelector('#view') && document.querySelector('#view').textContent.trim());
    }, null, { timeout: 60000 });

    const onlineState = await page.evaluate(() => {
      const theory = window.DB.theory_lecture_content;
      const records = Array.isArray(theory) ? theory : theory.records;
      return {
        app: window.MathBaumanWebApp.selfCheck(),
        lessons: window.DB.lessons.length,
        overlays: records.length,
        navItems: document.querySelectorAll('#nav [data-view]').length,
        ariaBusy: document.getElementById('app').getAttribute('aria-busy'),
        bodyText: document.body.innerText,
        title: document.title
      };
    });
    check('ONLINE-BOOT', 'standalone shell boots with its subject adapter', onlineState.app.ok && onlineState.app.subjectId === 'math', onlineState.app);
    check('LEGACY-347-RUNTIME', 'all 347 legacy lessons are available at runtime', onlineState.lessons === 347, onlineState.lessons);
    check('OVERLAY-18-RUNTIME', 'all 18 theory overlays are available at runtime', onlineState.overlays === 18, onlineState.overlays);
    check('NAV-RUNTIME', 'the learner navigation renders all primary tabs', onlineState.navItems >= 9, onlineState.navItems);
    check('READY-STATE', 'the Web App clears its accessible loading state', onlineState.ariaBusy === 'false', onlineState.ariaBusy);
    check('CLEAN-VISIBLE-TEXT', 'visible learner UI has no leaked object text or forbidden institution label', !/\[object Object\]|HUTECH/i.test(onlineState.bodyText), null);

    await page.locator('#nav [data-view="learning"]').click();
    await page.waitForFunction(() => window.__BAUMAN_CORE_API && window.__BAUMAN_CORE_API.state.view === 'learning');
    await page.waitForSelector('.e129-theory-shell', { timeout: 30000 });
    const c03 = 'MATH-VN-C03-ham_so_ao_ham_va_gradien';
    await page.locator(`[data-e129-chapter="${c03}"]`).first().click();
    await page.waitForSelector('[data-current-lesson^="MATH-VN-C03"]', { timeout: 30000 });
    const c03State = await page.evaluate((chapterId) => {
      const theory = window.DB.theory_lecture_content;
      const records = Array.isArray(theory) ? theory : theory.records;
      return {
        records: records.filter((record) => record.chapterId === chapterId).length,
        currentLesson: document.querySelector('[data-current-lesson]') && document.querySelector('[data-current-lesson]').getAttribute('data-current-lesson'),
        recovery: /KHÔI PHỤC TAB HỌC TẬP|Chưa có nội dung bài giảng/.test(document.querySelector('#view').innerText)
      };
    }, c03);
    check('C03-CANONICAL-ROUTE', 'the corrected C03 chapter route exposes all six overlays', c03State.records === 6 && /^MATH-VN-C03/.test(c03State.currentLesson || '') && !c03State.recovery, c03State);

    await page.setViewportSize({ width: 390, height: 844 });
    await page.waitForTimeout(250);
    const mobile = await page.evaluate(() => ({
      width: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      viewVisible: Boolean(document.querySelector('#view') && document.querySelector('#view').getBoundingClientRect().height)
    }));
    check('MOBILE-LAYOUT', 'the 390px learner viewport has no document-level horizontal overflow', mobile.viewVisible && mobile.scrollWidth <= mobile.width + 2, mobile);

    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.evaluate(() => navigator.serviceWorker.ready);
    if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) {
      await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
      await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller), null, { timeout: 30000 });
    }
    check('PWA-CONTROLLER', 'the versioned Service Worker controls the Web App', await page.evaluate(() => Boolean(navigator.serviceWorker.controller)), null);

    phase = 'offline';
    await context.setOffline(true);
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.waitForFunction(() => window.MathBaumanWebApp && window.MathBaumanWebApp.selfCheck().ok, null, { timeout: 60000 });
    const offlineState = await page.evaluate(() => {
      const theory = window.DB && window.DB.theory_lecture_content;
      const records = Array.isArray(theory) ? theory : theory && theory.records;
      return {
        app: window.MathBaumanWebApp.selfCheck(),
        lessons: window.DB && Array.isArray(window.DB.lessons) ? window.DB.lessons.length : 0,
        overlays: Array.isArray(records) ? records.length : 0,
        bodyLength: document.body.innerText.length
      };
    });
    check('OFFLINE-RELOAD', 'a controlled offline reload preserves the usable shell and core learning sources', offlineState.app.ok && offlineState.app.online === false && offlineState.lessons === 347 && offlineState.overlays === 18 && offlineState.bodyLength > 200, offlineState);
    await context.setOffline(false);

    report.diagnostics = { consoleErrors, pageErrors, failedRequests };
    check('RUNTIME-ERRORS', 'online/offline smoke emits no page errors or online request failures', consoleErrors.length === 0 && pageErrors.length === 0 && failedRequests.length === 0, report.diagnostics);
    report.status = 'PASS';
  } finally {
    if (browser) await browser.close();
    await close(server);
  }
}

fs.mkdirSync(path.join(ROOT, 'reports'), { recursive: true });
run().catch((error) => {
  report.error = error && error.stack || String(error);
  process.exitCode = 1;
}).finally(() => {
  fs.writeFileSync(path.join(ROOT, 'reports/browser-smoke.generated.json'), JSON.stringify(report, null, 2) + '\n');
  report.checks.forEach((item) => console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.id} ${item.title}`));
  console.log(`Math V2 browser gate ${report.status}: ${report.checks.filter((item) => item.ok).length}/${report.checks.length}`);
  if (report.error) console.error(report.error);
});
