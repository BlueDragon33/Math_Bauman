(function (global) {
  'use strict';

  const RELEASE = 'MATH-BAUMAN-WEBAPP-V2-L2';

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

  global.MathBaumanWebApp = Object.freeze({
    release: RELEASE,
    selfCheck: function () {
      return {
        ok: Boolean(global.SUBJECT_ADAPTER && global.BaumanSubjectStorage && document.getElementById('view')),
        release: RELEASE,
        subjectId: global.SUBJECT_ADAPTER && global.SUBJECT_ADAPTER.id || null,
        online: navigator.onLine
      };
    }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', markReady, { once: true });
  else markReady();
  registerServiceWorker();
})(window);
