// UI-CONTRAST-02: real Chromium computed-style audit for Math_Bauman.
 // This is CI browser evidence, NOT user Windows / human visual acceptance.
import { chromium } from 'playwright';
import { PNG } from 'pngjs';
import fs from 'node:fs';
import path from 'node:path';

const origin = process.env.MATH_CONTRAST_ORIGIN || 'http://127.0.0.1:8765';
const output = process.env.MATH_CONTRAST_OUTPUT || 'artifacts/math-ui-contrast';
fs.mkdirSync(output, { recursive: true });
const report = {
  schema: 'math-ui-contrast-browser/1',
  head: process.env.MATH_CONTRAST_HEAD || 'LOCAL_UNVERIFIED',
  origin, testedAt: new Date().toISOString(),
  browser: 'chromium', platform: process.platform,
  scope: 'computed-color/surface browser spot checks; no real workstation acceptance',
  scenarios: [], errors: [],
};
const onError = (name, error) => report.errors.push({ scenario: name, error: String(error?.stack || error) });
const combos = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
];
const modes = ['dark', 'light'];
const routes = [
  { name: 'overview', text: 'Tổng quan' },
  { name: 'learning', text: 'Học tập' },
  { name: 'simulation', text: 'Mô phỏng' },
];

function parseRgb(c) {
  const m = c?.match(/^rgba?\(\s*(\d+)[,\s]+(\d+)[,\s]+(\d+)(?:[,\s\/]+([\d.]+))?\s*\)$/);
  if (!m) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])];
}
function luminance(rgb) {
  const v = rgb.slice(0, 3).map(x => {
    const a = x / 255;
    return a <= 0.04045 ? a / 12.92 : Math.pow((a + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
}
function ratio(a, b) {
  const l = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l[0] + 0.05) / (l[1] + 0.05);
}

/* Wait for the app's *real* direct #themeBtn handler, not merely populated
   navigation HTML. Source init() awaits sequential data fetches before
   registering handlers. CDP inspects live listener registration without
   modifying runtime source or arbitrary fixed startup sleeps. */
async function waitForInteractiveApp(page, ms=45000) {
  const session=await page.context().newCDPSession(page);
  await session.send('Runtime.enable');
  const start=Date.now();
  let observed=-1;
  try {
    while(Date.now()-start < ms) {
      const remote=await session.send('Runtime.evaluate',{
        expression:'document.getElementById("themeBtn")',returnByValue:false
      });
      if(remote.result?.objectId) {
        const listeners=await session.send('DOMDebugger.getEventListeners',{
          objectId:remote.result.objectId
        });
        observed=(listeners.listeners||[]).filter(l=>l.type==='click').length;
        if(observed>0) return {ready:true,waitMs:Date.now()-start,listeners:observed};
      }
      await page.waitForTimeout(200);
    }
    return {ready:false,waitMs:Date.now()-start,listeners:observed};
  } finally { await session.detach(); }
}


/* Capture composited page pixels with glyphs hidden. Unlike reading CSS
   background-image alone, this measures real gradient/alpha blending rendered
   by Chromium at three points within each visible target's text box. */
const GRADIENT_TEXT_TARGETS = [
  '.sidebar .brand h1', '.sidebar .brand p',
  '#nav button.active span', '#nav button:not(.active) span',
  '.topbar h2', '.topbar p',
  '#view .e121-hero h1', '#view .e121-hero p', '#view .e121-kicker',
  '#view .e126-brand h3', '#view .e126-brand p',
  '#view .e126-hero h2', '#view .e126-slide h3',
  '#view .e126-card h4', '#view .e126-card p'
];
async function auditCompositedTextPixels(page) {
  const targets = await page.evaluate(selectors => {
    const result=[];
    const visible = el => {
      const r=el.getBoundingClientRect();
      const s=getComputedStyle(el);
      return r.width > 6 && r.height > 6 && r.right > 0 && r.bottom > 0 &&
        r.left < innerWidth && r.top < innerHeight && s.visibility !== 'hidden' && s.display !== 'none';
    };
    for(const selector of selectors) {
      for(const el of Array.from(document.querySelectorAll(selector)).filter(visible).slice(0,2)) {
        const r=el.getBoundingClientRect(), cs=getComputedStyle(el);
        const points=[.2,.5,.8].map(f=>({
          x:Math.round(r.left+r.width*f),y:Math.round(r.top+r.height*.5)
        })).filter(p=>p.x>=1&&p.y>=1&&p.x<innerWidth-1&&p.y<innerHeight-1);
        if(points.length) result.push({
          selector,text:(el.textContent||'').trim().slice(0,65),
          foreground:cs.color,opacity:cs.opacity,points,
          parentBackground:getComputedStyle(el.parentElement).backgroundImage.slice(0,120)
        });
      }
    }
    return result;
  }, GRADIENT_TEXT_TARGETS);
  const hiddenText=await page.addStyleTag({
    content:'body, body * { color:transparent!important; -webkit-text-fill-color:transparent!important; text-shadow:none!important; }'
  });
  let screenshot;
  try {
    screenshot=await page.screenshot({type:'png',fullPage:false,animations:'disabled'});
  } finally {
    await hiddenText.evaluate(el=>el.remove()).catch(()=>{});
  }
  const img=PNG.sync.read(screenshot);
  const results=[];
  for(const t of targets) {
    const fg=parseRgb(t.foreground);
    if(!fg || fg[3]!==1 || Number(t.opacity)!==1) {
      results.push({...t,measurement:'UNVERIFIED_ALPHA_OR_FOREGROUND'});continue;
    }
    const points=t.points.map(p=>{
      if(p.x>=img.width||p.y>=img.height)return null;
      const pos=(p.y*img.width+p.x)*4;
      const bg=[img.data[pos],img.data[pos+1],img.data[pos+2],img.data[pos+3]/255];
      if(bg[3]<1)return null;
      return {x:p.x,y:p.y,backgroundRgb:bg.slice(0,3),ratio:Number(ratio(fg,bg).toFixed(2))};
    }).filter(Boolean);
    const minRatio=points.length?Math.min(...points.map(p=>p.ratio)):null;
    results.push({...t,points,ratio:minRatio,
      measurement:minRatio===null?'UNVERIFIED_SAMPLING':
        minRatio>=4.5?'WCAG_AA_PIXEL_SAMPLE_PASS':'WCAG_AA_PIXEL_SAMPLE_FAIL'});
  }
  return results;
}
const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
try {
  for (const device of combos) {
    for (const mode of modes) {
      const context = await browser.newContext({
        viewport: { width: device.width, height: device.height },
        deviceScaleFactor: 1,
        serviceWorkers: 'block',
        reducedMotion: 'reduce'
      });
      const page = await context.newPage();
      const name = device.name + '-' + mode;
      if(name==='desktop-dark') {
        let delayed=false;
        await page.route('**/data/*.json',async route=>{
          if(!delayed){delayed=true;await new Promise(resolve=>setTimeout(resolve,1000));}
          await route.continue();
        });
      }
      if (process.env.MATH_UI_ROOT_CAUSE_DIAG === '2' && name !== 'desktop-dark') { await context.close(); continue; }
      const scenario = {
        name, requested: routes.map(r => r.name), rendered: [], measurements: [],
        routeErrors: [], browserExceptions: [],
        themeMethod: 'real in-app Giao diện swatch click after CDP-proven event readiness',
      };
      report.scenarios.push(scenario);
      page.on('pageerror', e => scenario.browserExceptions.push(String(e)));
      page.on('console', msg => { if (msg.type() === 'error' && scenario.browserExceptions.length < 12) scenario.browserExceptions.push('console: ' + msg.text().slice(0,500)); });
      page.on('response', res => {
        if (res.status() >= 400 && (res.url().includes('.css') || res.url().includes('core.js'))) {
          scenario.routeErrors.push({ status: res.status(), url: res.url() });
        }
      });
      if (name === 'desktop-dark' && process.env.MATH_UI_ROOT_CAUSE_DIAG === '2') {
        try {
          await page.goto(origin + '/index.html', { waitUntil:'domcontentloaded', timeout:45000 });
          await page.waitForFunction(() => document.querySelectorAll('#nav button').length > 3, null, {timeout:25000});
          const cdp = await context.newCDPSession(page);
          await cdp.send('Runtime.enable');
          const listenerCount = async expression => {
            try {
              const obj=await cdp.send('Runtime.evaluate',{expression,returnByValue:false});
              if (!obj.result?.objectId) return -1;
              const list=await cdp.send('DOMDebugger.getEventListeners',{objectId:obj.result.objectId});
              return (list.listeners||[]).filter(x=>x.type==='click').length;
            } catch(e) { return 'CDP_UNAVAILABLE:'+String(e.message||e); }
          };
          const initialListeners = {
            theme:await listenerCount('document.getElementById("themeBtn")'),
            document:await listenerCount('document')
          };
          await page.evaluate(() => {
            window.__uiDiag = { events: [], mutations: [] };
            document.addEventListener('click', e => {
              window.__uiDiag.events.push({target:e.target.id||e.target.tagName, dataView:e.target.closest('[data-view]')?.getAttribute('data-view'), at:Date.now()});
            }, {capture:true});
            new MutationObserver(records => {
              window.__uiDiag.mutations.push(...records.map(r => ({
                target:r.target.id||r.target.tagName, attr:r.attributeName||null,
                childNodes:r.target.childNodes?.length ?? null, at:Date.now()
              })));
            }).observe(document.querySelector('#modal'), { attributes:true, attributeFilter:['class'], childList:true, subtree:true });
          });
          await page.locator('#themeBtn').click();
          await page.waitForTimeout(150);
          const before = await page.evaluate(() => ({
            modalClass:document.querySelector('#modal')?.className,
            modalBodyChars:document.querySelector('#modalBody')?.innerHTML.length,
            swatches:document.querySelectorAll('[data-ui-theme]').length,
            selectedTheme:document.body.className,
            events:window.__uiDiag.events,
            mutations:window.__uiDiag.mutations.slice(0,20),
            nav:Array.from(document.querySelectorAll('#nav button')).map(b=>({text:b.textContent.trim(),view:b.dataset.view}))
          }));
          await page.screenshot({ path: path.join(output,'diag-after-theme-click.png') });
          const nav=page.locator('#nav button[data-view="learning"]');
          await nav.click({timeout:10000});
          await page.waitForTimeout(1400);
          const after = await page.evaluate(() => ({
            title:document.querySelector('#pageTitle')?.textContent?.trim(),
            active:Array.from(document.querySelectorAll('#nav button.active')).map(b=>b.dataset.view),
            view:(document.querySelector('#view')?.innerText||'').slice(0,1100),
            bodyClass:document.body.className,
            modalClass:document.querySelector('#modal')?.className,
            hardRecovery:!!document.querySelector('.hard-recovery'),
            events:window.__uiDiag.events.slice(-12),
            mutations:window.__uiDiag.mutations.slice(-20),
          }));
          await page.screenshot({ path:path.join(output,'diag-after-learning-click.png') });
          const afterListeners = {
            theme:await listenerCount('document.getElementById("themeBtn")'),
            document:await listenerCount('document')
          };
          let readyWaitMs = 0;
          if (afterListeners.theme === 0) {
            const t0 = Date.now();
            for (let i = 0; i < 32; i++) {
              await page.waitForTimeout(250);
              if ((await listenerCount('document.getElementById("themeBtn")')) > 0) { readyWaitMs=Date.now()-t0; break; }
            }
          }
          const lateListeners={
            theme:await listenerCount('document.getElementById("themeBtn")'),
            document:await listenerCount('document')
          };
          report.diagnostic = { before, after, initialListeners, afterListeners, lateListeners, readyWaitMs,
            browserExceptions:scenario.browserExceptions };

          console.log('MATH_UI_ROOT_CAUSE_DIAG', JSON.stringify(report.diagnostic));
        } catch (e) {
          report.diagnosticError = String(e.stack||e);
          console.log('MATH_UI_ROOT_CAUSE_DIAG_ERROR', report.diagnosticError);
        }
        throw new Error('ROOT_CAUSE_DIAGNOSTIC_ONLY; UX gate intentionally NOT PASS');
      }
      try {
        await page.goto(origin + '/index.html', { waitUntil: 'domcontentloaded', timeout: 45000 });
        if(name==='desktop-dark') {
          const loading=await page.evaluate(()=>({
            busy:document.querySelector('#app')?.getAttribute('aria-busy'),
            themeDisabled:document.querySelector('#themeBtn')?.disabled,
            aiDisabled:document.querySelector('#aiBtn')?.disabled,
            stageDisabled:document.querySelector('#stageSelect')?.disabled,
            navInert:document.querySelector('#nav')?.hasAttribute('inert'),
          }));
          scenario.startup=loading;
          if(loading.busy!=='true'||!loading.themeDisabled||!loading.aiDisabled||
             !loading.stageDisabled||!loading.navInert) {
            throw new Error('Premature interactive state while JSON is loading: '+JSON.stringify(loading));
          }
        }
        await page.waitForFunction(() => document.querySelectorAll('#nav button,#nav a').length >= 3, null, { timeout: 25000 });
        const appReady=await waitForInteractiveApp(page);
        scenario.appReady=appReady;
        if (!appReady.ready) throw new Error('Math app did not attach actual theme click handler after '+appReady.waitMs+'ms');
        const loaded=await page.evaluate(()=>({
          busy:document.querySelector('#app')?.getAttribute('aria-busy'),
          themeDisabled:document.querySelector('#themeBtn')?.disabled,
          aiDisabled:document.querySelector('#aiBtn')?.disabled,
          stageDisabled:document.querySelector('#stageSelect')?.disabled,
          navInert:document.querySelector('#nav')?.hasAttribute('inert'),
        }));
        scenario.interactive=loaded;
        if(loaded.busy!=='false'||loaded.themeDisabled||loaded.aiDisabled||
           loaded.stageDisabled||loaded.navInert)throw new Error('App listeners ready but UI still blocked: '+JSON.stringify(loaded));
        if(name==='desktop-dark') {
          await page.locator('a.skip-link').focus();
          const skip=await page.locator('a.skip-link').evaluate(el=>{
            const r=el.getBoundingClientRect(), cs=getComputedStyle(el);
            return {color:cs.color,bg:cs.backgroundColor,width:r.width,height:r.height,
              focused:document.activeElement===el};
          });
          scenario.skipLink=skip;
          const f=parseRgb(skip.color),b=parseRgb(skip.bg);
          if(!skip.focused||skip.width<70||!f||!b||ratio(f,b)<4.5)
            throw new Error('Keyboard skip-link focus is not perceivable/contrasting: '+JSON.stringify(skip));
        }
        // Real application theme switch, not a CSS-only forced class:
        // applyInterface() resets body classes on every route render.
        await page.locator('#themeBtn').click();
        await page.locator('[data-ui-theme="' + (mode === 'light' ? 'clean' : 'navy') + '"]').first().click();
        await page.locator('#modalClose').click();
        await page.waitForFunction(expected => document.body.classList.contains('theme-' + expected),
          mode === 'light' ? 'clean' : 'navy', { timeout: 12000 });
        for (const route of routes) {
          try {
            const locator = page.locator('#nav button, #nav a').filter({ hasText: route.text }).first();
            if (await locator.count() === 0) throw new Error('missing route ' + route.text);
            const normalTap = await locator.isVisible();
            if (normalTap) await locator.click({ timeout: 10000 });
            else await locator.evaluate(node => node.click()); // records non-user simulated navigation
            await page.waitForFunction(
              expected => {
                const title = (document.querySelector('#pageTitle')?.textContent || '').trim().toLowerCase();
                const content = document.querySelector('#view')?.textContent?.trim() || '';
                return title.includes(expected.toLowerCase()) && content.length > 35;
              },
              route.text, { timeout: 20000 }
            );
            const current = await page.evaluate(() => ({
              title: document.querySelector('#pageTitle')?.textContent?.trim(),
              viewChars: document.querySelector('#view')?.textContent?.trim().length || 0,
              navItems: document.querySelectorAll('#nav button,#nav a').length,
              viewNodes: document.querySelectorAll('#view *').length,
              currentThemeClass: document.body.className,
              loadedCss: Array.from(document.styleSheets).some(s => s.href?.includes('accessibility-contrast-v1.css')),
            }));
            if (!current.loadedCss) throw new Error('contrast CSS missing in computed browser document');
            if (current.viewChars < 35 || current.viewNodes < 4) throw new Error('empty rendered route: ' + route.name);
            if (!current.currentThemeClass.includes('theme-' + (mode === 'light' ? 'clean' : 'navy'))) {
              throw new Error('selected app theme did not survive navigation: ' + current.currentThemeClass);
            }
            if (!current.title?.toLowerCase().includes(route.text.toLowerCase())) {
              throw new Error('route mismatch: wanted ' + route.text + ', title=' + current.title);
            }
            scenario.rendered.push({ route: route.name, ...current, navigation: normalTap ? 'CLICK_VISIBLE' : 'PROGRAMMATIC_HIDDEN_NAV' });
            const samples = await page.evaluate(() => {
              const selectors = [
                '.sidebar .brand h1', '.sidebar .brand p', '.sidebar .select-label',
                '#nav button:not(.active) span', '#nav button.active span',
                '.topbar h2', '.topbar p', '.topbar .btn.primary',
                '#view .e121-hero h1', '#view .e121-hero p', '#view .e121-main-cta b', '#view .e121-hero aside p',
                '#view .e126-brand h3', '#view .e126-brand p',
                '#view .e126-hero h2', '#view .e126-slide h3',
                '#view .e126-card h4', '#view .e126-card p',
                '#view .e126-lesson-btn small',
                '#view .lesson-content h3', '#view .slide-section h4',
                '#view .item-card b', '#view .source-tile b',
                '#view .metric b', '#view .compact-card b',
                '#view .math-sim-item b', '#view .math-term-grid article b',
                '#view .e133-source b', '#view .e133-tabs .btn',
                '#view .deep-review-item b', '#view .answer-card'
              ];
              const visible = el => {
                const r = el.getBoundingClientRect();
                const s = getComputedStyle(el);
                return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none';
              };
              const sample = el => {
                const s = getComputedStyle(el);
                let parent = el; const backgrounds = [];
                while (parent) {
                  const st = getComputedStyle(parent);
                  if (st.backgroundImage !== 'none' || st.backgroundColor !== 'rgba(0, 0, 0, 0)') {
                    backgrounds.push({
                      tag: parent.tagName.toLowerCase(),
                      className: String(parent.className || '').slice(0, 100),
                      color: st.backgroundColor, image: st.backgroundImage.slice(0, 160)
                    });
                  }
                  parent = parent.parentElement;
                }
                return {
                  text: (el.textContent || '').trim().slice(0, 65),
                  selector: el.dataset.contrastSelector, color: s.color,
                  opacity: s.opacity, backgroundLayers: backgrounds,
                };
              };
              const results = [];
              for (const sel of selectors) {
                for (const el of Array.from(document.querySelectorAll(sel)).filter(visible).slice(0, 3)) {
                  el.dataset.contrastSelector = sel;
                  results.push(sample(el));
                  delete el.dataset.contrastSelector;
                }
              }
              return results;
            });
            if (route.name === 'overview') {
              const heroTitle = samples.find(x => x.selector === '#view .e121-hero h1');
              if (!heroTitle) throw new Error('E121 hero title absent: cannot verify visual contrast');
              if (heroTitle.color !== 'rgb(248, 251, 255)') {
                throw new Error('E121 hero heading must be foreground white, got ' + heroTitle.color);
              }
              const heroCopy = samples.find(x => x.selector === '#view .e121-hero p');
              if (!heroCopy || heroCopy.color !== 'rgb(203, 220, 240)') {
                throw new Error('E121 hero paragraph computed ink mismatch ' + (heroCopy?.color || 'MISSING'));
              }
            }
            // E126 visually failed despite 12/12 route tests: #0f172a was
            // rendered over a navy lesson surface, outside prior selector list.
            if (route.name === 'learning') {
              const headings = samples.filter(x => ['#view .e126-brand h3','#view .e126-hero h2',
                '#view .e126-slide h3','#view .e126-card h4'].includes(x.selector));
              const descriptions = samples.filter(x => ['#view .e126-brand p',
                '#view .e126-card p','#view .e126-lesson-btn small'].includes(x.selector));
              if (headings.length < 3 || descriptions.length < 2) {
                throw new Error('E126 coverage missing: headings='+headings.length+' descriptions='+descriptions.length);
              }
              const darkInkFails = [
                ...headings.filter(x => x.color !== 'rgb(248, 251, 255)'),
                ...descriptions.filter(x => x.color !== 'rgb(203, 220, 240)')
              ];
              if (darkInkFails.length) throw new Error('E126 dark-on-dark regression: '+
                JSON.stringify(darkInkFails.map(x=>({selector:x.selector,color:x.color,text:x.text}))));
            }
            if(device.name === 'mobile') {
              const navVisibility=await page.locator('#nav button').evaluateAll(nodes=>nodes.map(btn=>{
                const span=btn.querySelector('span');
                const st=span?getComputedStyle(span):null;
                return {text:span?.textContent?.trim(),display:st?.display,visibility:st?.visibility,
                  width:span?.getBoundingClientRect()?.width||0};
              }));
              scenario.mobileNav=navVisibility;
              if(navVisibility.filter(x=>x.text&&x.display!=='none'&&x.visibility!=='hidden'&&x.width>0).length<8)
                throw new Error('Mobile nav captions remain hidden: '+JSON.stringify(navVisibility));
            }
            let solid = 0;
            for (const x of samples) {
              const fg = parseRgb(x.color);
              // Find the first opaque solid CSS-painted surface. If a gradient is
              // encountered earlier, the exact pixel contrast stays UNVERIFIED.
              let bg = null, indeterminate = false;
              for (const l of x.backgroundLayers) {
                if (l.image !== 'none') { indeterminate = true; break; }
                const rgb = parseRgb(l.color);
                if (rgb && rgb[3] === 1) { bg = rgb; break; }
                if (rgb && rgb[3] > 0) { indeterminate = true; break; }
              }
              x.computedRatio = fg && bg && fg[3] === 1 && !indeterminate ? Number(ratio(fg, bg).toFixed(2)) : null;
              x.audit = x.computedRatio === null ? 'COMPLEX_SURFACE_UNVERIFIED'
                : x.computedRatio >= 4.5 ? 'AA_NORMAL_TEXT_PASS' : 'AA_NORMAL_TEXT_FAIL';
              if (x.computedRatio !== null) solid++;
            }
            const composited=await auditCompositedTextPixels(page);
            const pixelFailures=composited.filter(x=>x.measurement==='WCAG_AA_PIXEL_SAMPLE_FAIL');
            const pixelMeasured=composited.filter(x=>x.ratio!=null).length;
            scenario.measurements.push({ route: route.name, solid, samples,
              composited, pixelMeasured, pixelFailures:pixelFailures.length });
            if(pixelFailures.length) throw new Error('Composited gradient/text pixel contrast below 4.5: '+
              JSON.stringify(pixelFailures.map(x=>({selector:x.selector,text:x.text,ratio:x.ratio,points:x.points}))));
            if(pixelMeasured<4)throw new Error('Insufficient real page pixels sampled: '+pixelMeasured);
            const failures = samples.filter(x => x.audit === 'AA_NORMAL_TEXT_FAIL');
            if (failures.length) {
              throw new Error('Low computed contrast on ' + route.name + ': ' + JSON.stringify(failures.map(
                f => ({ selector:f.selector, text:f.text, foreground:f.color, ratio:f.computedRatio })
              )));
            }
            if(device.name==='mobile') {
              const focus = route.name==='learning' ? '#view .e126-hero h2'
                : route.name==='overview' ? '#view .e121-hero h1'
                : '#view h2';
              const node=page.locator(focus).first();
              if(await node.count()) await node.scrollIntoViewIfNeeded().catch(()=>{});
            }
            await page.screenshot({ path: path.join(output, name + '-' + route.name + '.png'), fullPage: false });
          } catch (error) {
            const debug = await page.evaluate(() => ({
              title: document.querySelector('#pageTitle')?.textContent?.trim(),
              activeNav: Array.from(document.querySelectorAll('#nav button.active')).map(e => ({text:e.textContent.trim(),view:e.dataset.view})),
              pageTextLength: document.querySelector('#view')?.textContent?.trim().length || 0,
              bodyClass: document.body.className,
              hardRecovery: Boolean(document.querySelector('.hard-recovery')),
            })).catch(() => ({}));
            scenario.routeErrors.push({ route: route.name, message: String(error.message || error), debug, browserExceptions: scenario.browserExceptions.slice(-8) });
            await page.screenshot({ path: path.join(output, name + '-' + route.name + '-FAILED.png'), fullPage: false }).catch(() => {});
          }
        }
      } catch (error) {
        onError(name, error);
        await page.screenshot({ path: path.join(output, name + '-LOAD-FAILED.png'), fullPage: false }).catch(() => {});
      } finally {
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
  fs.writeFileSync(path.join(output,'measurements.json'), JSON.stringify(report,null,2));
}
const total = report.scenarios.reduce((n,s) => n + s.rendered.length, 0);
const failed = report.errors.length + report.scenarios.reduce((n,s) => n + s.routeErrors.length, 0);
const measured = report.scenarios.reduce((n,s) => n + s.measurements.reduce((k,m) => k + m.solid,0), 0);
const pixelMeasured=report.scenarios.reduce((n,s) => n + s.measurements.reduce((k,m) => k + (m.pixelMeasured||0),0), 0);
console.log(JSON.stringify({ kind:'MATH_CONTRAST_BROWSER_QA', head:report.head, rendered:total, expected:12, measured, pixelMeasured, failures:failed, scenarios: report.scenarios.map(s=>({name:s.name,rendered:s.rendered.map(x=>x.route),errors:s.routeErrors})) }));
if (total !== 12 || failed > 0 || measured < 8 || pixelMeasured < 48) {
  console.error('Browser QA is NOT PASS; inspect measurements.json and screenshots. No approval implied.');
  process.exitCode = 1;
}
