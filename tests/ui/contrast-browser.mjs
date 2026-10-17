// UI-CONTRAST-02: real Chromium computed-style audit for Math_Bauman.
 // This is CI browser evidence, NOT user Windows / human visual acceptance.
import { chromium } from 'playwright';
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
      const scenario = {
        name, requested: routes.map(r => r.name), rendered: [], measurements: [],
        routeErrors: [], browserExceptions: [],
        themeMethod: 'forced actual CSS classes/data-theme (switch-control workflow unverified)',
      };
      report.scenarios.push(scenario);
      page.on('pageerror', e => scenario.browserExceptions.push(String(e)));
      page.on('response', res => {
        if (res.status() >= 400 && (res.url().includes('.css') || res.url().includes('core.js'))) {
          scenario.routeErrors.push({ status: res.status(), url: res.url() });
        }
      });
      try {
        await page.goto(origin + '/index.html', { waitUntil: 'domcontentloaded', timeout: 45000 });
        await page.waitForFunction(() => document.querySelectorAll('#nav button,#nav a').length >= 3, null, { timeout: 25000 });
        await page.evaluate(theme => {
          document.body.classList.remove('theme-clean','theme-warm','theme-focus');
          if (theme === 'light') document.body.classList.add('theme-clean');
          document.documentElement.dataset.theme = theme;
        }, mode);
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
            if (!current.title?.toLowerCase().includes(route.text.toLowerCase())) {
              throw new Error('route mismatch: wanted ' + route.text + ', title=' + current.title);
            }
            scenario.rendered.push({ route: route.name, ...current, navigation: normalTap ? 'CLICK_VISIBLE' : 'PROGRAMMATIC_HIDDEN_NAV' });
            const samples = await page.evaluate(() => {
              const selectors = [
                '.sidebar .brand h1', '.sidebar .brand p', '.sidebar .select-label',
                '#nav button:not(.active) span', '#nav button.active span',
                '.topbar h2', '.topbar p', '.topbar .btn.primary',
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
            scenario.measurements.push({ route: route.name, solid, samples });
            const failures = samples.filter(x => x.audit === 'AA_NORMAL_TEXT_FAIL');
            if (failures.length) {
              throw new Error('Low computed contrast on ' + route.name + ': ' + JSON.stringify(failures.map(
                f => ({ selector:f.selector, text:f.text, foreground:f.color, ratio:f.computedRatio })
              )));
            }
            await page.screenshot({ path: path.join(output, name + '-' + route.name + '.png'), fullPage: false });
          } catch (error) {
            scenario.routeErrors.push({ route: route.name, message: String(error.message || error) });
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
console.log(JSON.stringify({ kind:'MATH_CONTRAST_BROWSER_QA', head:report.head, rendered:total, expected:12, measured, failures:failed, scenarios: report.scenarios.map(s=>({name:s.name,rendered:s.rendered.map(x=>x.route),errors:s.routeErrors})) }));
if (total !== 12 || failed > 0 || measured < 8) {
  console.error('Browser QA is NOT PASS; inspect measurements.json and screenshots. No approval implied.');
  process.exitCode = 1;
}
