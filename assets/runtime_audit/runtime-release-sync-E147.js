'use strict';
(function(){
  const A=window.SUBJECT_ADAPTER;if(!A)return;
  const RELEASE='E147_RELEASE_STATE_RECONCILIATION';
  A.version='MathContentSystem E147 Integrity Hardened 2026-09-21';
  A.release=RELEASE;
  A.latestPatch=RELEASE;
  A.runtimeRelease='E134';
  A.integrityRelease='E145';
  A.contentContractRelease='E146';
  A.ui=A.ui||{};
  A.ui.coreLabel='MATH · E147 Integrity Hardened';
  A.ui.heroBadge='Math Bauman · E147';
  A.ui.heroTitle='Toán Bauman · Runtime ổn định, integrity được khóa';
  A.ui.overviewSubtitle='Runtime core giữ ở E134; E145 khóa integrity tự động; E146 tách path standalone/package.';
  A.ui.storageSubtitle='Content Vault dùng path local data/... cho site riêng và package path riêng cho Hub.';
  window.BAUMAN_MATH_RELEASE=Object.assign({},window.BAUMAN_MATH_RELEASE||{},{
    version:'E147',
    release:RELEASE,
    runtimeCore:'E134',
    integrityGate:'E145',
    contentPathContract:'E146',
    generatedAt:'2026-09-21',
    storageKey:A.storageKey
  });
})();
