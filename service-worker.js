'use strict';

const RELEASE = 'math-bauman-webapp-v2-l3-1';
const CACHE = RELEASE + '-shell';
const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './assets/app-icon.svg',
  './assets/core.css',
  './assets/math.css',
  './assets/webapp.css',
  './assets/theory_skin/theory-tab-E129.css',
  './assets/theory_skin/theory-title-clean-E183.css',
  './assets/theory_skin/theory-ui-tokens-E132.css',
  './assets/theory_skin/theory-slideshow-E132.css',
  './subject-manifest.js',
  './subject-manifest.json',
  './assets/core.js',
  './assets/subject-adapter.js',
  './assets/planning-bridge.js',
  './assets/platform/storage-adapter.js',
  './assets/platform/subject-storage.js',
  './assets/theory_skin/theory-presenter-route-lock-E243.js',
  './assets/program_frame/program-frame-E130.js',
  './assets/theory_skin/theory-tab-E129.js',
  './assets/theory_skin/theory-legacy-route-E246.js',
  './assets/theory_skin/theory-min-slide-contract-E239.js',
  './assets/theory_skin/theory-content-source-E240.js',
  './assets/theory_skin/theory-learning-path-E186.js',
  './assets/theory_skin/theory-title-clean-E183.js',
  './assets/theory_skin/theory-learning-final-labels-E187.js',
  './assets/theory_skin/theory-slideshow-E202.js',
  './assets/theory_skin/theory-slideshow-identity-E210.js',
  './assets/theory_skin/theory-slideshow-reader-content-E211.js',
  './assets/theory_skin/theory-artifact-registry-E244.js',
  './assets/theory_skin/theory-artifact-authoritative-route-E245.js',
  './assets/theory_skin/theory-artifact-reader-E241.js',
  './assets/theory_skin/theory-slideshow-richness-E242.js',
  './assets/theory_skin/theory-slideshow-reader-formula-accuracy-E224.js',
  './assets/theory_skin/theory-formula-typeset-E234.js',
  './assets/theory_skin/theory-formula-fraction-align-E235.js',
  './assets/theory_skin/theory-slideshow-reader-fit-E212.js',
  './assets/webapp-bootstrap.js',
  './data/curriculum.json',
  './data/program_identity.json',
  './data/id-namespace-registry.json',
  './data/content-manifest.json',
  './data/content_vault_manifest.json',
  './data/discipline_spine.json',
  './data/chapter_spine.json',
  './data/lessons.json',
  './data/theory_lecture_frame.json',
  './data/theory_lecture_content.json'
];

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) { return cache.addAll(SHELL); }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (key) {
      return key.startsWith('math-bauman-webapp-') && key !== CACHE;
    }).map(function (key) { return caches.delete(key); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(caches.match(event.request).then(function (cached) {
    if (cached) return cached;
    return fetch(event.request).then(function (response) {
      if (response && response.ok) {
        const copy = response.clone();
        caches.open(CACHE).then(function (cache) { cache.put(event.request, copy); });
      }
      return response;
    }).catch(function () {
      return event.request.mode === 'navigate' ? caches.match('./index.html') : Response.error();
    });
  }));
});
