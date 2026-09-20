'use strict';
(function(){
  const VERSION='E129 Overview IA Cleanup';
  const AUX_SELECTORS=['.overview-reminder-grid','.overview-follow-grid','.overview-control-board','.overview-reality-card','.overview-resume-card:not(.round55-resume-mini)','.overview-stage-panel','.overview-schedule-panel','.overview-resume-panel:not(.round55-resume-mini)','.route-focus-panel','.route-continue-panel'];
  let queued=false;
  function isOverview(view){
    const title=(document.getElementById('pageTitle')?.textContent||'').trim().toLowerCase();
    return title.includes('tổng quan')||!!view.querySelector('.overview-v1255-restored,.round55-overview-restore,.overview-mission-clean,.canva-dashboard-grid');
  }
  function markAuxiliary(root){
    const hasCanonical=!!root.querySelector('.round55-overview-grid,.round55-flow-card');
    if(!hasCanonical)return;
    AUX_SELECTORS.forEach(selector=>root.querySelectorAll(selector).forEach(node=>{
      if(node.closest('.round55-side-stack'))return;
      node.dataset.e129Aux='true';
    }));
    const dashboards=Array.from(root.querySelectorAll('.canva-dashboard-grid'));
    dashboards.slice(1).forEach(node=>node.dataset.e129Aux='true');
    root.querySelectorAll('.overview-canva-lower,.overview-reminder-wrap,.overview-top-fill-v1249').forEach(node=>{
      if(node.querySelector('.round55-overview-grid,.round55-flow-card'))return;
      node.dataset.e129Aux='true';
    });
  }
  function apply(){
    queued=false;
    const view=document.getElementById('view');
    if(!view)return;
    const active=isOverview(view);
    view.classList.toggle('overview-e129-summary',active);
    if(!active)return;
    const root=view.querySelector('.overview-v1255-restored')||view;
    root.classList.add('overview-e129-root');
    markAuxiliary(root);
    view.dataset.overviewLayout=VERSION;
  }
  function schedule(){if(queued)return;queued=true;requestAnimationFrame(apply)}
  const view=document.getElementById('view');
  if(view)new MutationObserver(schedule).observe(view,{childList:true,subtree:true,characterData:true});
  const title=document.getElementById('pageTitle');
  if(title)new MutationObserver(schedule).observe(title,{childList:true,subtree:true,characterData:true});
  schedule();
  window.BaumanOverviewCleanup={VERSION,apply};
})();
