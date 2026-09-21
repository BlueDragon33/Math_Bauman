'use strict';
(function(){
  const A=window.SUBJECT_ADAPTER;
  if(!A)return;
  const RELEASE='E134_THEORY_SOURCE_RECOVERY';
  A.version='MathContentSystem E134 Theory Source Recovery 2026-09-21';
  A.release=RELEASE;
  A.latestPatch=RELEASE;
  A.runtimeRelease='E134';
  A.ui=A.ui||{};
  A.ui.coreLabel='MATH · E134 Theory Recovery';
  A.ui.heroBadge='Math Bauman · E134';
  A.ui.heroTitle='Toán Bauman · Theory Source Recovery';
  A.ui.overviewSubtitle='Runtime E133 giữ nguyên; Lý thuyết chuyển sang E129 frame/content và phục hồi 18 record C01–C03 từ nhánh migration.';
  A.ui.learningSubtitle='Lý thuyết đọc trực tiếp theory_lecture_frame + theory_lecture_content; legacy lessons không còn là nguồn chính.';
  window.BAUMAN_MATH_RELEASE=Object.assign({},window.BAUMAN_MATH_RELEASE||{},{
    version:'E134',
    runtimeCore:'E133',
    theoryRoute:'E129',
    recoveredTheoryRecords:18,
    recoverySource:'migration/full-webapp-v2',
    generatedAt:'2026-09-21'
  });
})();