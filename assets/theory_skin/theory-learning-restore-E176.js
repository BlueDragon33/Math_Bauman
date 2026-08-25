/* E176 · Restore original learning preview helper
 * Replaces the E169 hierarchy selector surface with a simple original-style E129 header.
 * Does not modify data or E132 slideshow runtime.
 */
(function(){
  'use strict';
  var RELEASE='E176_ORIGINAL_LEARNING_PREVIEW';
  function text(n){return (n&&n.textContent||'').replace(/\s+/g,' ').trim();}
  function clean(s){return String(s||'').replace(/^\s*§\s*/,'Bài ').replace(/\b§(?=\d)/g,'Bài ');}
  function patchTitle(){
    var pageTitle=document.getElementById('pageTitle');
    if(pageTitle && /Lý thuyết|Theory/i.test(pageTitle.textContent||'')) pageTitle.textContent='Học tập';
    document.querySelectorAll('#nav button,.nav-item').forEach(function(b){
      var s=text(b);
      if(s==='📘 Lý thuyết E129') b.textContent='📚 Học tập';
      else if(s==='Lý thuyết E129'||s==='Lý thuyết') b.textContent='Học tập';
    });
  }
  function currentChapter(){
    var active=document.querySelector('.e129-chapter-btn.active b');
    if(active) return clean(text(active));
    var h=document.querySelector('.e169-reader-title h2');
    if(h) return clean(text(h));
    return 'Chọn chương ở cột trái';
  }
  function currentLesson(){
    var h=document.querySelector('.e169-reader-title h2');
    if(h) return clean(text(h));
    var slide=document.querySelector('.e129-slide h3');
    if(slide) return clean(text(slide));
    return 'Reader E129 giữ nội dung đầy đủ';
  }
  function restoreHeader(){
    var router=document.querySelector('.e169-learning-router');
    if(!router) return;
    var wrap=router.parentElement;
    if(!wrap) return;
    var old=wrap.querySelector('.e176-learning-title');
    if(!old){
      old=document.createElement('section');
      old.className='e176-learning-title';
      wrap.insertBefore(old,router);
    }
    old.innerHTML='<span class="e129-kicker">Học tập · Lý thuyết</span><h1>'+currentChapter()+'</h1><p>'+currentLesson()+' · Dùng sidebar để đổi chương, dùng Reader để đọc đủ nội dung, Trình chiếu để xem slide.</p>';
  }
  function cleanSectionMarks(){
    document.querySelectorAll('.e169-reader-title h2,.e129-slide h3,.e129-chip-btn,.e129-chapter-btn b').forEach(function(n){
      var s=text(n), c=clean(s);
      if(s!==c) n.textContent=c;
    });
  }
  function patch(){patchTitle();restoreHeader();cleanSectionMarks();document.documentElement.setAttribute('data-learning-preview',RELEASE);}
  var obs=null;
  function boot(){
    patch();
    try{obs=new MutationObserver(function(){setTimeout(patch,0);});obs.observe(document.body,{childList:true,subtree:true,characterData:true});}catch(_){ }
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
  window.BAUMAN_MATH_E176_RESTORE={release:RELEASE,patch:patch,selfCheck:function(){return{release:RELEASE,routerHidden:!!document.querySelector('.e169-learning-router'),title:document.getElementById('pageTitle')&&document.getElementById('pageTitle').textContent};}};
})();
