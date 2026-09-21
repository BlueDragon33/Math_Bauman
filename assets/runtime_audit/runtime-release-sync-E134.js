'use strict';
(function(){
  const A=window.SUBJECT_ADAPTER;if(!A)return;
  const R='E134_STORAGE_MARKUP_HOTFIX';
  A.version='MathContentSystem E134 Storage Markup Hotfix 2026-09-21';
  A.release=R;A.latestPatch=R;A.coreVersion=R;A.runtimeRelease='E134';
  A.ui=A.ui||{};
  A.ui.coreLabel='MATH · E134 Runtime Stable';
  A.ui.heroBadge='Math Bauman · E134';
  A.ui.heroTitle='Toán Bauman · Runtime Stable';
  A.ui.overviewSubtitle='Giữ nguyên core trưởng thành; storage đi qua platform adapter và shell HTML đã được làm sạch.';
  window.BAUMAN_MATH_RELEASE=Object.assign({},window.BAUMAN_MATH_RELEASE||{},{version:'E134',runtimeCore:'E134',generatedAt:'2026-09-21',storageKey:A.storageKey});
})();