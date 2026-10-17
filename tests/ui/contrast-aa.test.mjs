// UI-CONTRAST-01 / Blueprint OS 1.3.0 / B2 COMPACT
// Source-level assertions only. Browser screenshots and human UX are separate gates.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const css = readFileSync(new URL('../../assets/accessibility-contrast-v1.css', import.meta.url), 'utf8');
const html = readFileSync(new URL('../../index.html', import.meta.url), 'utf8');

function token(name) {
  const match = css.match(new RegExp('--math-cx-' + name + ':\\s*(#[\\da-fA-F]{6})\\s*;'));
  assert.ok(match, 'Missing owned color token: ' + name);
  return match[1];
}
function luminance(hex) {
  const channel = n => {
    const x = Number.parseInt(hex.slice(n, n + 2), 16) / 255;
    return x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(1) + 0.7152 * channel(3) + 0.0722 * channel(5);
}
function contrast(a, b) {
  const [upper, lower] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (upper + 0.05) / (lower + 0.05);
}
for (const [label, foreground, background, min] of [
  ['dark primary copy', 'on-dark', 'dark-bg', 4.5],
  ['dark secondary copy', 'muted-dark', 'dark-card', 4.5],
  ['light primary copy', 'on-light', 'light-card', 4.5],
  ['light secondary copy', 'muted-light', 'light-bg', 4.5],
  ['light hover secondary copy', 'muted-light', '#edf4ff', 4.5],
  ['primary action button', '#ffffff', 'action', 4.5],
  ['gold focus on dark', 'gold', 'dark-bg', 3],
  ['nav label on deep background', 'muted-dark', 'dark-bg', 4.5]
]) {
  test('WCAG AA ' + label, () => {
    const fg = foreground.startsWith('#') ? foreground : token(foreground);
    const bg = background.startsWith('#') ? background : token(background);
    const ratio = contrast(fg, bg);
    assert.ok(ratio >= min, label + ' ratio ' + ratio.toFixed(2) + ':1, need >= ' + min);
  });
}
test('stylesheet is last so it overrides the mixed legacy Math color rules', () => {
  const lastLegacy = html.indexOf('assets/runtime_audit/runtime-ui-consistency-E133.css');
  const correction = html.indexOf('assets/accessibility-contrast-v1.css?v=1');
  assert.ok(lastLegacy >= 0 && correction > lastLegacy);
  assert.equal(html.match(/assets\/accessibility-contrast-v1\.css/g)?.length, 1);
});
test('targets the diagnosed white-on-white nested-panel defect, not global text', () => {
  assert.match(css, /#view :is\([\s\S]*?\.source-tile[\s\S]*?\)\s+:is\(h1/);
  assert.match(css, /\.panel b\/h3\/h4 white text leaks onto #fff descendant cards/);
  assert.doesNotMatch(css, /body\s+\*/);
  assert.doesNotMatch(css, /filter\s*:\s*brightness/);
});
test('preserves text contrast in dark E133 source rows and light tab controls', () => {
  assert.match(css, /html\[data-theme="dark"\] #view \.e133-source/);
  assert.match(css, /#view :is\(\.e133-tabs, \.lesson-content, \.present-slide\) \.btn:not/);
});
test('keyboard, contrast preference, reduced-motion, and offline-only CSS', () => {
  assert.match(css, /:focus-visible/);
  assert.match(css, /prefers-contrast:\s*more/);
  assert.match(css, /prefers-reduced-motion:\s*reduce/);
  assert.doesNotMatch(css, /@import|https?:\/\/|url\(/i);
});
test('light sidebar themes keep dark ink while selected tabs keep white ink', () => {
  assert.match(css, /body:is\(\.theme-clean, \.theme-warm, \.theme-focus\) \.sidebar \.nav button:not\(\.active\):not\(:hover\)/);
  assert.match(css, /body:is\(\.theme-clean, \.theme-warm, \.theme-focus\) \.sidebar \.brand h1/);
  assert.ok(contrast(token('on-light'), token('light-bg')) >= 4.5);
});
test('dark E133 source count never inherits low-contrast royal blue', () => {
  assert.match(css, /html\[data-theme="dark"\] #view \.e133-source > span/);
  assert.ok(contrast(token('gold'), token('dark-card')) >= 4.5);
});

test('offline PWA shell precaches the new stylesheet before activation', () => {
  const sw = readFileSync(new URL('../../service-worker.js', import.meta.url), 'utf8');
  assert.match(sw, /'\.\/assets\/accessibility-contrast-v1\.css'/);
  assert.match(sw, /caches\.open\(SHELL_CACHE\)[\s\S]*cache\.addAll\(SHELL\)/);
});

test('real E121 hero failure has own text and CTA surfaces (not inherited body ink)', () => {
  assert.match(css, /#view \.e121-hero :is\(h1, h2, h3\)/);
  assert.match(css, /#view \.e121-hero :is\(p, aside p\)/);
  assert.match(css, /#view \.e121-main-cta/);
  assert.ok(contrast(token('on-dark'), token('dark-bg')) >= 4.5);
  assert.ok(contrast(token('muted-dark'), token('dark-card')) >= 4.5);
});
