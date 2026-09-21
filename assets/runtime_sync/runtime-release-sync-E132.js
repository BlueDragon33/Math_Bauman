'use strict';
(function(){
  const A=window.SUBJECT_ADAPTER;
  if(!A)return;
  const VERSION='MathContentSystem E132 RUNTIME RELEASE SYNC 2026-09-21';
  A.version=VERSION;
  A.release='E132_RUNTIME_RELEASE_SYNC';
  A.latestPatch='E132_RUNTIME_RELEASE_SYNC';
  A.coreVersion='E132_RUNTIME_RELEASE_SYNC';
  A.runtimeRelease='E132';
  A.ui=A.ui||{};
  A.ui.coreLabel='MATH · E132 Runtime Sync';
  A.ui.heroBadge='Math Bauman · E132';
  A.ui.heroTitle='Toán Bauman · Runtime Release Sync';
  A.ui.overviewSubtitle='Tổng quan E130 + planning stage fix E131 + runtime metadata sync E132.';
  A.ui.assistantToast='E132: metadata runtime đã đồng bộ với giao diện và logic mới nhất.';
  window.BAUMAN_MATH_RELEASE={
    version:'E132',
    overview:'E130',
    planning:'E131',
    runtime:'E132',
    storageKey:A.storageKey,
    generatedAt:'2026-09-21'
  };
})();