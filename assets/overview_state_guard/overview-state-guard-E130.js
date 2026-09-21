'use strict';
(function(){
  const VERSION='E130 Overview Interaction & State Guard';
  const ACTION_ID='overviewE130Actions';
  let queued=false;

  const norm=v=>String(v||'').trim().toLowerCase();
  const view=()=>document.getElementById('view');
  const title=()=>document.getElementById('pageTitle');
  const nav=()=>document.getElementById('nav');
  const stage=()=>document.getElementById('stageSelect');
  const save=()=>document.getElementById('saveState');

  function storageState(){
    try{
      const key='__bauman_e130_probe__';
      localStorage.setItem(key,'1');
      localStorage.removeItem(key);
      return {ok:true,label:'Lưu cục bộ sẵn sàng',state:'ok'};
    }catch(_){
      return {ok:false,label:'Không thể lưu cục bộ',state:'error'};
    }
  }

  function isOverview(){
    const v=view();
    if(!v)return false;
    const t=norm(title()?.textContent);
    return t.includes('tổng quan') || !!v.querySelector('.overview-v1255-restored,.round55-overview-grid,.overview-mission-clean');
  }

  function findNavButton(labels){
    const buttons=Array.from(nav()?.querySelectorAll('button')||[]);
    return buttons.find(btn=>{
      const text=norm(btn.textContent);
      return labels.some(label=>text.includes(norm(label)));
    })||null;
  }

  function triggerRoute(labels){
    const btn=findNavButton(labels);
    if(!btn)return false;
    btn.click();
    return true;
  }

  function validateStage(){
    const s=stage();
    if(!s || !s.options?.length)return;
    const valid=Array.from(s.options).some(o=>o.value===s.value);
    if(!valid){
      s.selectedIndex=0;
      s.dispatchEvent(new Event('change',{bubbles:true}));
    }
    s.setAttribute('aria-label','Chọn giai đoạn học Toán');
  }

  function updateSaveState(){
    const el=save();
    if(!el)return;
    const st=storageState();
    el.textContent=st.ok?'Lưu cục bộ':'Không thể lưu';
    el.title=st.label;
    el.dataset.e130Storage=st.state;
    el.setAttribute('aria-live','polite');
  }

  function buildActions(){
    const v=view();
    if(!v || !isOverview())return;
    if(document.getElementById(ACTION_ID))return;
    const canonical=v.querySelector('.overview-e129-root,.overview-v1255-restored,.round55-overview-grid')||v.firstElementChild||v;
    const st=storageState();
    const bar=document.createElement('section');
    bar.id=ACTION_ID;
    bar.className='overview-e130-actions';
    bar.setAttribute('aria-label','Thao tác tiếp tục học');
    bar.innerHTML=
      '<div><h4>Tiếp tục đúng luồng học</h4><p>Lý thuyết → bài tập → ứng dụng → ôn tập → kiểm tra. Trạng thái chỉ hiển thị đồng bộ khi bộ nhớ cục bộ hoạt động.</p></div>'+
      '<div class="overview-e130-action-buttons">'+
        '<span class="overview-e130-storage" data-state="'+st.state+'">'+st.label+'</span>'+
        '<button class="btn primary" type="button" data-e130-route="learning">Tiếp tục học</button>'+
        '<button class="btn soft" type="button" data-e130-route="simulation">Mô phỏng</button>'+
        '<button class="btn soft" type="button" data-e130-route="storage">Dữ liệu</button>'+
      '</div>';
    canonical.insertAdjacentElement('afterend',bar);
    bar.addEventListener('click',ev=>{
      const btn=ev.target.closest('[data-e130-route]');
      if(!btn)return;
      const route=btn.dataset.e130Route;
      const ok=route==='learning'
        ? triggerRoute(['Học tập'])
        : route==='simulation'
          ? triggerRoute(['Mô phỏng'])
          : triggerRoute(['Dữ liệu']);
      if(!ok){
        const toast=document.getElementById('toast');
        if(toast){
          toast.textContent='Không tìm thấy tab tương ứng trong cấu hình hiện tại.';
          toast.classList.add('show');
          setTimeout(()=>toast.classList.remove('show'),2200);
        }
      }
    });
  }

  function normalizeNavState(){
    const buttons=Array.from(nav()?.querySelectorAll('button')||[]);
    if(!buttons.length)return;
    buttons.forEach(btn=>{
      btn.setAttribute('type','button');
      if(!btn.getAttribute('aria-label'))btn.setAttribute('aria-label',String(btn.textContent||'').trim());
    });
    const active=buttons.filter(btn=>btn.classList.contains('active'));
    if(active.length>1)active.slice(1).forEach(btn=>btn.classList.remove('active'));
  }

  function apply(){
    queued=false;
    const v=view();
    if(!v)return;
    const overview=isOverview();
    v.classList.toggle('overview-e130-guard',overview);
    if(!overview){
      document.getElementById(ACTION_ID)?.remove();
    }else{
      buildActions();
    }
    validateStage();
    normalizeNavState();
    updateSaveState();
    v.dataset.e130Guard=VERSION;
  }

  function schedule(){
    if(queued)return;
    queued=true;
    requestAnimationFrame(apply);
  }

  const v=view();
  if(v)new MutationObserver(schedule).observe(v,{childList:true,subtree:true,characterData:true});
  if(title())new MutationObserver(schedule).observe(title(),{childList:true,subtree:true,characterData:true});
  if(nav())new MutationObserver(schedule).observe(nav(),{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
  stage()?.addEventListener('change',schedule);
  window.addEventListener('storage',schedule);
  window.addEventListener('popstate',schedule);
  schedule();

  window.BaumanOverviewStateGuard={VERSION,apply,storageState};
})();