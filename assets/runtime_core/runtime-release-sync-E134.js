'use strict';
(function(){
  const A=window.SUBJECT_ADAPTER;if(!A)return;
  const R='E134_CORE_RUNTIME_RECOVERY';
  A.version='MathContentSystem E134 Core Runtime Recovery 2026-09-21';
  A.release=R;A.latestPatch=R;A.coreVersion=R;A.runtimeRelease='E134';
  A.ui=A.ui||{};
  A.ui.coreLabel='MATH · E134 Core Runtime';
  A.ui.heroBadge='Math Bauman · E134';
  A.ui.heroTitle='Toán Bauman · Core Runtime Recovery';
  A.ui.overviewSubtitle='Core runtime thật đã được khôi phục: đọc JSON, điều hướng, stage, state và trạng thái nguồn dữ liệu.';
  A.ui.assistantToast='E134: core.js đã được dựng lại từ adapter + dữ liệu thật.';
  window.BAUMAN_MATH_RELEASE=Object.assign({},window.BAUMAN_MATH_RELEASE||{},{version:'E134',runtimeCore:'E134',generatedAt:'2026-09-21',storageKey:A.storageKey});
})();