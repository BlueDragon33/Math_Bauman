'use strict';
(function(){
  const A=window.SUBJECT_ADAPTER;
  if(!A)return;
  const RELEASE='E133_RUNTIME_UI_CONSISTENCY';
  A.version='MathContentSystem E133 Runtime UI Consistency 2026-09-21';
  A.release=RELEASE;
  A.latestPatch=RELEASE;
  A.coreVersion=RELEASE;
  A.runtimeRelease='E133';
  A.ui=A.ui||{};
  A.ui.coreLabel='MATH · E133 Runtime Core';
  A.ui.heroBadge='Math Bauman · E133';
  A.ui.heroTitle='Toán Bauman · Runtime UI Consistency';
  A.ui.overviewSubtitle='Runtime core đã khôi phục; route, stage, storage và trạng thái dữ liệu được kiểm soát thống nhất.';
  A.ui.assistantToast='E133: runtime hoạt động theo dữ liệu thật; nguồn rỗng không còn bị hiển thị như đã có nội dung.';
  window.BAUMAN_MATH_RELEASE=Object.assign({},window.BAUMAN_MATH_RELEASE||{},{
    version:'E133',
    overview:'E130',
    planning:'E131',
    runtimeMetadata:'E132',
    runtimeCore:'E133',
    storageKey:A.storageKey,
    generatedAt:'2026-09-21'
  });
})();