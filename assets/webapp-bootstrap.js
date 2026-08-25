(function (global) {
  'use strict';

  const RELEASE = 'MATH-BAUMAN-WEBAPP-V2-L2.1';
  const LEARNING_TABS = ['theory', 'exercises', 'practice', 'review', 'exam'];

  function markReady() {
    const app = document.getElementById('app');
    if (app) app.setAttribute('aria-busy', 'false');
    document.documentElement.dataset.webappRelease = RELEASE;
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator) || location.protocol === 'file:') return;
    global.addEventListener('load', function () {
      navigator.serviceWorker.register('./service-worker.js', { scope: './' }).catch(function (error) {
        console.warn('Service Worker chưa được đăng ký:', error && error.message || error);
      });
    });
  }

  function navigate(view) {
    const api = global.__BAUMAN_CORE_API;
    const state = api && api.state;
    const allowed = Array.from(document.querySelectorAll('#nav [data-view]'), function (item) {
      return item.getAttribute('data-view');
    });
    if (!state || !allowed.includes(view)) return false;
    state.view = view;
    if (view === 'learning' && !LEARNING_TABS.includes(state.learnTab)) state.learnTab = 'theory';
    if (view === 'writing') state.simulationKind = 'unified';
    if (typeof api.save === 'function') api.save();
    if (typeof api.render === 'function') api.render();
    return state.view === view;
  }

  function bindPrimaryNavigation() {
    global.addEventListener('click', function (event) {
      const target = event.target && event.target.closest && event.target.closest('#nav [data-view]');
      if (!target) return;
      const view = target.getAttribute('data-view');
      if (!navigate(view)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
    }, true);
  }

  global.MathBaumanWebApp = Object.freeze({
    release: RELEASE,
    selfCheck: function () {
      return {
        ok: Boolean(global.SUBJECT_ADAPTER && global.BaumanSubjectStorage && document.getElementById('view')),
        release: RELEASE,
        subjectId: global.SUBJECT_ADAPTER && global.SUBJECT_ADAPTER.id || null,
        online: navigator.onLine,
        primaryNavigation: Boolean(global.__BAUMAN_CORE_API && typeof global.__BAUMAN_CORE_API.render === 'function')
      };
    },
    navigate: navigate
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', markReady, { once: true });
  else markReady();
  bindPrimaryNavigation();
  registerServiceWorker();
})(window);
