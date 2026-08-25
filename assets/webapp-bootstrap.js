(function (global) {
  'use strict';

  const RELEASE = 'MATH-BAUMAN-WEBAPP-V2-L4.1';
  const LEARNING_TABS = ['theory', 'exercises', 'practice', 'review', 'exam'];
  const THEORY_RETRY_DELAYS = [0, 250, 1000, 2500];
  let theoryOwnershipObserver = null;
  let theoryOwnershipQueued = false;

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

  function renderTheoryWhenReady(attempt) {
    const api = global.__BAUMAN_CORE_API;
    const state = api && api.state;
    if (!state || state.view !== 'learning' || state.learnTab !== 'theory') return;
    const theory = global.BAUMAN_MATH_THEORY_E129;
    let rendered = false;
    try {
      rendered = Boolean(theory && typeof theory.render === 'function' && theory.render());
    } catch (_) {
      rendered = false;
    }
    const nextAttempt = Number(attempt || 0) + 1;
    if (!rendered && nextAttempt < THEORY_RETRY_DELAYS.length) {
      global.setTimeout(function () {
        renderTheoryWhenReady(nextAttempt);
      }, THEORY_RETRY_DELAYS[nextAttempt]);
    }
  }

  function restoreTheoryOwnership() {
    theoryOwnershipQueued = false;
    const api = global.__BAUMAN_CORE_API;
    const state = api && api.state;
    const view = document.getElementById('view');
    if (!state || !view || state.view !== 'learning' || state.learnTab !== 'theory') return;
    if (view.querySelector('.e129-theory-shell')) return;
    const theory = global.BAUMAN_MATH_THEORY_E129;
    let status = null;
    try {
      status = theory && typeof theory.sourceStatus === 'function' && theory.sourceStatus();
    } catch (_) {
      return;
    }
    if (!status || Number(status.frame || 0) < 1) return;
    try {
      theory.render();
    } catch (_) {
      renderTheoryWhenReady(0);
    }
  }

  function bindTheoryOwnership() {
    const view = document.getElementById('view');
    if (!view || theoryOwnershipObserver) return;
    theoryOwnershipObserver = new MutationObserver(function () {
      if (theoryOwnershipQueued) return;
      theoryOwnershipQueued = true;
      global.setTimeout(restoreTheoryOwnership, 0);
    });
    theoryOwnershipObserver.observe(view, { childList: true });
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
    if (view === 'learning' && state.learnTab === 'theory') renderTheoryWhenReady(0);
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
        primaryNavigation: Boolean(global.__BAUMAN_CORE_API && typeof global.__BAUMAN_CORE_API.render === 'function'),
        theoryRouteHandoff: true,
        theoryRouteOwnership: Boolean(theoryOwnershipObserver),
        learnerUx: Boolean(global.MathBaumanLearnerUX && global.MathBaumanLearnerUX.selfCheck().ok)
      };
    },
    navigate: navigate
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', markReady, { once: true });
  else markReady();
  bindPrimaryNavigation();
  bindTheoryOwnership();
  registerServiceWorker();
})(window);
