/* E246: do not preload the large compatibility lessons file. */
(function(){
  'use strict';
  var contract=window.BAUMAN_MATH_THEORY_E129_CONTRACT;
  if(!contract)return;
  var full='data/lessons.json';
  var small='data/lessons_deferred.json';
  contract.legacyPath=small;

  /* Window capture runs before E129's document capture handler. */
  window.addEventListener('click',function(e){
    var button=e.target&&e.target.closest&&e.target.closest('[data-e129-refresh]');
    if(!button)return;
    contract.legacyPath=full;
    window.setTimeout(function(){contract.legacyPath=small;},1500);
  },true);

  window.BAUMAN_MATH_E246_LEGACY_ROUTE={
    release:'E246_DEFERRED_LEGACY_ROUTE',
    deferredPath:small,
    fullPath:full,
    selfCheck:function(){return {ok:contract.legacyPath===small,legacyPath:contract.legacyPath};}
  };
})();
