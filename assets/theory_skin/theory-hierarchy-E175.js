/* E182 · Math Learning hierarchy
 * Stable flow: Khối kiến thức → Học phần → Chương → Hoạt động học tập → Nội dung cụ thể.
 * Fixes flicker by making breadcrumb rendering idempotent.
 * C01 theory lessons are built in as a fallback when runtime DB is not ready.
 */
(function(){
  'use strict';
  var RELEASE='E182_STABLE_FIVE_LEVEL_PATH';
  var C01_CHAPTER_ID='MATH-VN-C01-vector_trong_khong_gian_';
  var HIERARCHY=[
    {id:'pure',code:'I',title:'Toán học Thuần túy',en:'Pure Mathematics Module',courses:[
      {id:'pure-algebra',no:1,title:'Đại số và Cấu trúc số',en:'Algebra & Structures',chapters:[
        {id:'c01',no:1,title:'Đại số tuyến tính nâng cao cho tính toán hiệu năng cao.'},
        {id:'c02',no:2,title:'Không gian vectơ, cấu trúc hình học và ánh xạ tuyến tính.'},
        {id:'c03',no:3,title:'Đại số trừu tượng và ứng dụng mã hóa.'}
      ]},
      {id:'pure-analysis',no:2,title:'Giải tích toán học',en:'Mathematical Analysis',chapters:[
        {id:'c04',no:4,title:'Giải tích hàm một biến và các phương pháp xấp xỉ số.'},
        {id:'c05',no:5,title:'Giải tích hàm nhiều biến và tối ưu hóa dựa trên Gradient.'},
        {id:'c06',no:6,title:'Phương trình vi phân và ứng dụng mô hình hóa hệ động lực.'},
        {id:'c07',no:7,title:'Lý thuyết hàm phức và phép biến đổi tích phân.'}
      ]},
      {id:'pure-geometry',no:3,title:'Hình học và Không gian số',en:'Geometry & Space',chapters:[
        {id:'c08',no:8,title:'Hình học tính toán trong xử lý ảnh và đồ họa máy tính.'},
        {id:'c09',no:9,title:'Cơ sở Tôpô học và các hàm khoảng cách trong khai phá dữ liệu.'}
      ]},
      {id:'pure-logic',no:4,title:'Logic toán và Cơ sở lý thuyết',en:'Mathematical Logic',chapters:[
        {id:'c10',no:10,title:'Logic toán, đại số Boolean và tối ưu mạch số.'},
        {id:'c11',no:11,title:'Lý thuyết số, đồng dư thức và thuật toán mật mã công khai.'}
      ]}
    ]},
    {id:'applied',code:'II',title:'Toán học Ứng dụng',en:'Applied Mathematics Module',courses:[
      {id:'applied-probability',no:5,title:'Xác suất và Thống kê toán học',en:'Probability & Statistics',chapters:[
        {id:'c12',no:12,title:'Lý thuyết xác suất nâng cao và mô hình hóa luồng dữ liệu.'},
        {id:'c13',no:13,title:'Thống kê toán học ứng dụng trong đánh giá hiệu năng hệ thống.'},
        {id:'c14',no:14,title:'Các quá trình ngẫu nhiên và chuỗi Markov trong kỹ thuật độ tin cậy.'}
      ]},
      {id:'applied-discrete',no:6,title:'Toán rời rạc và Tin học tính toán',en:'Discrete & Computational Math',chapters:[
        {id:'c15',no:15,title:'Toán rời rạc và thuật toán đồ thị luồng mạng.',special:'graph_network_flow'},
        {id:'c16',no:16,title:'Phương pháp tính, giải tích số và biến đổi Fourier nhanh.'},
        {id:'c17',no:17,title:'Cơ sở toán học nền tảng cho Trí tuệ nhân tạo và Học sâu.'}
      ]},
      {id:'applied-optimization',no:7,title:'Tối ưu hóa và Mô hình hóa kỹ thuật',en:'Optimization & Modeling',chapters:[
        {id:'c18',no:18,title:'Quy hoạch toán học và bài toán phân bổ tài nguyên hệ thống phức tạp.'},
        {id:'c19',no:19,title:'Lý thuyết trò chơi và các thuật toán ra quyết định cho hệ thống tự hành.'},
        {id:'c20',no:20,title:'Toán tài chính định lượng và phân tích rủi ro dự án CNTT.'},
        {id:'c21',no:21,title:'Phương pháp mô phỏng số Monte Carlo cho hệ thống chịu lỗi.'}
      ]}
    ]}
  ];
  var ACTIVITIES=[
    {id:'theory',tab:'theory',label:'Lý thuyết',name:'Kiến thức cốt lõi',summary:'Video bài học, bài giảng đọc đầy đủ, công thức và slide.'},
    {id:'exercises',tab:'exercises',label:'Bài tập',name:'Củng cố tư duy',summary:'Trắc nghiệm, tự luận, bài tập tính tay và kiểm tra tư duy.'},
    {id:'practice',tab:'practice',label:'Thực hành',name:'Lập trình & Hiện thực hóa',summary:'Bài tập code, Python/NumPy hoặc C++ và test case.'},
    {id:'application',tab:'application',label:'Ứng dụng thực tế',name:'Tình huống kỹ thuật',summary:'Chuyên đề kỹ thuật liên hệ AI, tín hiệu, mạng, hệ thống tự hành.'},
    {id:'review',tab:'review',label:'Ôn tập',name:'Hệ thống hóa kiến thức',summary:'Mindmap, cheat sheet, flashcard và thuật ngữ song ngữ.'},
    {id:'exam',tab:'exam',label:'Kiểm tra',name:'Đánh giá năng lực',summary:'Bài thi tổng hợp, trắc nghiệm + tự luận, time-box.'}
  ];
  var C01_LESSONS=[
    {id:'MATH-VN-C01-vector_trong_khong_gian_-L01-vector-as-engineering-data-e130',label:'Bài 1.1 · Vector như dữ liệu kỹ thuật'},
    {id:'MATH-VN-C01-vector_trong_khong_gian_-L02-norm-distance-metric-e139',label:'Bài 1.2 · Chuẩn vector và khoảng cách'},
    {id:'MATH-VN-C01-vector_trong_khong_gian_-L03-dot-angle-projection-e139',label:'Bài 1.3 · Tích vô hướng, góc và phép chiếu'},
    {id:'MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140',label:'Bài 1.4 · Cơ sở, span và tọa độ'},
    {id:'MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140',label:'Bài 1.5 · Không gian con và biểu diễn dữ liệu'},
    {id:'MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140',label:'Bài 1.6 · Từ vector sang ma trận dữ liệu'}
  ];
  var C15={
    theory:['Video bài học 15.1 · Dijkstra, Bellman-Ford','Video bài học 15.2 · Ford-Fulkerson','Tài liệu số · Lý thuyết đồ thị ứng dụng trong cấu trúc mạng'],
    exercises:['Bài tập tương tác · Mô phỏng Dijkstra bằng kéo thả'],
    practice:['Code C++ · Cài đặt Ford-Fulkerson cho luồng cực đại'],
    application:['Chuyên đề · OSPF định tuyến gói tin bằng Dijkstra'],
    review:['Cheat Sheet · O(V²) so với O(E log V)'],
    exam:['Bài thi code trực tuyến · Tối ưu luồng mạng · 45 phút']
  };
  var ROUTES={theory:'theory',exercises:'exercises',practice:'practice',application:'application',review:'review',exam:'exam'};
  var scheduled=false;
  function S(v){return String(v==null?'':v);}
  function H(v){return S(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function api(){return window.__BAUMAN_CORE_API||{};}
  function state(){var st=api().state||window.__MATH_STATE;if(!st){st={view:'learning',learnTab:'theory'};window.__MATH_STATE=st;}return st;}
  function save(){try{api().save&&api().save();}catch(_){}}
  function path(){var st=state();st.e169Path=st.e169Path||{};var p=st.e169Path;if(!p.moduleId)p.moduleId='pure';if(!p.courseId)p.courseId='pure-algebra';if(!p.chapterId)p.chapterId='c01';if(!p.activityId)p.activityId='theory';return p;}
  function mod(id){return HIERARCHY.find(function(x){return x.id===id;})||HIERARCHY[0];}
  function course(mid,cid){var m=mod(mid);return (m.courses||[]).find(function(x){return x.id===cid;})||(m.courses||[])[0];}
  function chapter(mid,cid,chid){var c=course(mid,cid);return ((c&&c.chapters)||[]).find(function(x){return x.id===chid;})||((c&&c.chapters)||[])[0];}
  function activity(id){return ACTIVITIES.find(function(x){return x.id===id;})||ACTIVITIES[0];}
  function cleanLessonTitle(v){return S(v).replace(/^\s*§\s*/,'Bài ').replace(/Lý thuyết\s*·\s*§/,'Lý thuyết · Bài ').replace(/\b§(?=\d)/g,'Bài ');}
  function records(){var db=window.DB||{}, raw=db.theory_lecture_content||{}, list=Array.isArray(raw)?raw:(raw.records||raw.lessons||raw.items||[]);return Array.isArray(list)?list:[];}
  function frames(){var db=window.DB||{}, raw=db.theory_lecture_frame||{}, out=[];(raw.stages||[]).forEach(function(st){(st.disciplines||[]).forEach(function(d){(d.chapters||[]).forEach(function(ch){out.push(ch);});});});(raw.chapters||[]).forEach(function(ch){out.push(ch);});return out;}
  function frameByNo(no){return frames().find(function(ch){return Number(ch.chapterNo||ch.localChapterNo||ch.globalChapterNo||0)===Number(no);})||null;}
  function currentFrame(){var p=path(), ch=chapter(p.moduleId,p.courseId,p.chapterId);return frameByNo(ch&&ch.no);}
  function lessonRecords(){var fr=currentFrame();if(!fr)return[];return records().filter(function(r){return r.chapterId===(fr.chapterId||fr.id);});}
  function isC01Theory(){var p=path();return p.chapterId==='c01'&&p.activityId==='theory';}
  function c01Options(){return C01_LESSONS.map(function(x){return {id:x.id,label:x.label,sub:'Mở đúng bài trong E129 Reader full content.'};});}
  function contentOptions(){var p=path(), act=activity(p.activityId), ch=chapter(p.moduleId,p.courseId,p.chapterId);
    if(p.activityId==='theory'){
      var recs=lessonRecords();
      if(recs.length){return recs.map(function(r){return {id:S(r.lessonId||r.id),label:cleanLessonTitle(r.title||r.lessonTitle||r.lessonId),sub:'Mở trong E129 Reader full content.'};});}
      if(p.chapterId==='c01')return c01Options();
      return [{id:'theory-overview',label:'Bài giảng tổng quan',sub:'Chưa có lesson record riêng cho chương này.'}];
    }
    if(ch&&ch.special==='graph_network_flow'&&C15[p.activityId])return C15[p.activityId].map(function(x,i){return {id:p.activityId+'-'+(i+1),label:x,sub:act.summary};});
    return [{id:p.activityId+'-main',label:act.label+' · '+act.name,sub:act.summary}];
  }
  function currentContentLabel(){var p=path(), opts=contentOptions(), id=p.activityId==='theory'?(p.lessonId||p.contentId):p.contentId, hit=opts.find(function(x){return S(x.id)===S(id);})||opts[0];return hit?hit.label:'Nội dung cụ thể';}
  function moduleSubtitle(){var p=path(), m=mod(p.moduleId);return 'Đang chọn: Khối '+(m&&m.code||'I')+' · '+(m&&m.title||'Toán học');}
  function pathSummary(){var p=path(), m=mod(p.moduleId), c=course(p.moduleId,p.courseId), ch=chapter(p.moduleId,p.courseId,p.chapterId), act=activity(p.activityId);return ['Khối '+(m&&m.code||'I')+' · '+(m&&m.title||''),'Học phần '+(c&&c.no||'')+' · '+(c&&c.title||''),'Chương '+(ch&&ch.no||''),act&&act.label,currentContentLabel()].filter(Boolean).join(' → ');}
  function crumbs(){var p=path(), m=mod(p.moduleId), c=course(p.moduleId,p.courseId), ch=chapter(p.moduleId,p.courseId,p.chapterId), act=activity(p.activityId);return [
    {level:'module',label:'Khối '+(m&&m.code||'I')},
    {level:'course',label:'Học phần '+(c&&c.no||'')},
    {level:'chapter',label:'Chương '+(ch&&ch.no||'')},
    {level:'activity',label:(act&&act.label)||'Hoạt động'},
    {level:'content',label:cleanLessonTitle(currentContentLabel())}
  ];}
  function setPath(kind,id){var p=path();if(kind==='module'){p.moduleId=id;var m=mod(id);p.courseId=(m.courses[0]||{}).id;p.chapterId=(((m.courses[0]||{}).chapters||[])[0]||{}).id;p.activityId='theory';p.lessonId='';p.contentId='';}
    if(kind==='course'){p.courseId=id;var c=course(p.moduleId,id);p.chapterId=((c.chapters||[])[0]||{}).id;p.activityId='theory';p.lessonId='';p.contentId='';}
    if(kind==='chapter'){p.chapterId=id;p.activityId='theory';p.lessonId='';p.contentId='';}
    if(kind==='activity'){p.activityId=id;p.lessonId='';p.contentId='';}
    if(kind==='content'){p.contentId=id;if(p.activityId==='theory')p.lessonId=id;}
    save();return p;}
  function close(){var old=document.querySelector('.e129-modal-backdrop');if(old)old.remove();}
  function modal(html){close();var n=document.createElement('div');n.className='e129-modal-backdrop e175-modal-backdrop';n.innerHTML='<div class="e129-modal e175-modal">'+html+'</div>';document.body.appendChild(n);}
  function titleFor(level){return {module:'Chọn Khối kiến thức',course:'Chọn Học phần',chapter:'Chọn Chương',activity:'Chọn Hoạt động học tập',content:'Chọn Nội dung cụ thể'}[level]||'Chọn lộ trình';}
  function option(label,sub,attrs,active){var at=Object.keys(attrs||{}).map(function(k){return ' '+k+'="'+H(attrs[k])+'"';}).join('');return '<button class="e169-choice e175-choice '+(active?'active':'')+'"'+at+'><b>'+H(label)+'</b>'+(sub?'<span>'+H(sub)+'</span>':'')+'</button>';}
  function open(level){var p=path(), html='', m=mod(p.moduleId), c=course(p.moduleId,p.courseId);
    if(level==='module')html=HIERARCHY.map(function(x){return option('Khối kiến thức '+x.code+' · '+x.title,x.en,{'data-e178-pick':'module','data-e178-id':x.id},x.id===p.moduleId);}).join('');
    else if(level==='course')html=(m.courses||[]).map(function(x){return option('Học phần '+x.no+' · '+x.title,x.en,{'data-e178-pick':'course','data-e178-id':x.id},x.id===p.courseId);}).join('');
    else if(level==='chapter')html=((c&&c.chapters)||[]).map(function(x){return option('Chương '+x.no,x.title,{'data-e178-pick':'chapter','data-e178-id':x.id},x.id===p.chapterId);}).join('');
    else if(level==='activity')html=ACTIVITIES.map(function(x){return option(x.label+' · '+x.name,x.summary,{'data-e178-pick':'activity','data-e178-id':x.id},x.id===p.activityId);}).join('');
    else html=contentOptions().map(function(x){return option(x.label,x.sub,{'data-e178-pick':'content','data-e178-id':x.id},x.id===(p.lessonId||p.contentId));}).join('');
    modal('<header><div><span class="e129-badge">E182 · Learning Path</span><h3>'+H(titleFor(level))+'</h3><p>Chọn theo thứ tự: Khối → Học phần → Chương → Hoạt động → Nội dung.</p></div><button class="e129-close" data-e178-close>×</button></header><div class="e169-choice-grid e175-choice-grid">'+html+'</div>');
  }
  function renderRoute(){var p=path(), st=state(), fr=currentFrame();
    st.view='learning';st.learnTab=ROUTES[p.activityId]||p.activityId;
    if(fr)st.e129ChapterId=fr.chapterId||fr.id||'';
    if(p.chapterId==='c01')st.e129ChapterId=C01_CHAPTER_ID;
    if(p.activityId==='theory'){
      var opts=contentOptions(), hit=opts.find(function(x){return S(x.id)===S(p.lessonId||p.contentId);})||opts[0];
      if(hit){p.lessonId=hit.id;p.contentId=hit.id;st.e129LessonId=hit.id;}
    }
    save();close();try{window.BAUMAN_MATH_THEORY_E129&&window.BAUMAN_MATH_THEORY_E129.render&&window.BAUMAN_MATH_THEORY_E129.render();}catch(_){location.reload();}}
  function patchSurface(){
    var summary=pathSummary();
    var mb=document.querySelector('.e169-module-button');
    if(mb){mb.removeAttribute('data-e169-open');if(mb.getAttribute('data-e178-open')!=='module')mb.setAttribute('data-e178-open','module');if(mb.getAttribute('title')!==summary)mb.setAttribute('title',summary);var small=mb.querySelector('small'), sub=moduleSubtitle();if(small&&small.textContent!==sub)small.textContent=sub;}
    var bc=document.querySelector('.e169-breadcrumb');
    if(bc){var html=crumbs().map(function(x){return '<button type="button" data-e178-open="'+H(x.level)+'" title="'+H(summary)+'">'+H(x.label)+'</button>';}).join('');if(bc.getAttribute('data-e182-html')!==html){bc.innerHTML=html;bc.setAttribute('data-e182-html',html);}if(bc.getAttribute('data-e178-ready')!=='1')bc.setAttribute('data-e178-ready','1');}
  }
  function click(e){var t=e.target.closest&&e.target.closest('[data-e178-open],[data-e178-pick],[data-e178-close],[data-e169-open],[data-e169-pick-module],[data-e169-pick-course],[data-e169-pick-chapter],[data-e169-pick-activity],[data-e175-pick],[data-e175-close]');if(!t)return;
    e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    if(t.hasAttribute('data-e178-close')||t.hasAttribute('data-e175-close')){close();return;}
    if(t.hasAttribute('data-e178-open')){open(t.getAttribute('data-e178-open')||'module');return;}
    if(t.hasAttribute('data-e169-open')){open(t.getAttribute('data-e169-open')||'module');return;}
    var kind=t.getAttribute('data-e178-pick')||t.getAttribute('data-e175-pick'), id=t.getAttribute('data-e178-id')||t.getAttribute('data-e175-id');
    if(!kind){if(t.hasAttribute('data-e169-pick-module')){kind='module';id=t.getAttribute('data-e169-pick-module');}else if(t.hasAttribute('data-e169-pick-course')){kind='course';id=t.getAttribute('data-e169-pick-course');}else if(t.hasAttribute('data-e169-pick-chapter')){kind='chapter';id=t.getAttribute('data-e169-pick-chapter');}else if(t.hasAttribute('data-e169-pick-activity')){kind='activity';id=t.getAttribute('data-e169-pick-activity');}}
    if(kind==='module'){setPath('module',id);open('course');return;}
    if(kind==='course'){setPath('course',id);open('chapter');return;}
    if(kind==='chapter'){setPath('chapter',id);open('activity');return;}
    if(kind==='activity'){setPath('activity',id);open('content');return;}
    if(kind==='content'){setPath('content',id);renderRoute();return;}
  }
  function patchLabels(){
    var pageTitle=document.getElementById('pageTitle');if(pageTitle&&/Lý thuyết/.test(pageTitle.textContent||''))pageTitle.textContent='Học tập';
    document.querySelectorAll('button,.nav-item,.tab,.learn-tab,[data-tab],.e129-badge,h2').forEach(function(n){var s=(n.textContent||'').trim();if(s==='Lý thuyết'||s==='📘 Lý thuyết E129')n.textContent=s.indexOf('📘')>=0?'📚 Học tập':'Học tập';});
    document.querySelectorAll('.e169-choice b,.e169-reader-title h2').forEach(function(n){var c=cleanLessonTitle(n.textContent||'');if(n.textContent!==c)n.textContent=c;});
    patchSurface();
  }
  function schedulePatch(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;patchLabels();});}
  window.addEventListener('click',click,true);
  document.addEventListener('click',click,true);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.querySelector('.e175-modal-backdrop'))close();},true);
  var mo=new MutationObserver(schedulePatch);
  function boot(){try{mo.observe(document.body,{childList:true,subtree:true});}catch(_){}patchLabels();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.BAUMAN_MATH_E175_HIERARCHY={release:RELEASE,open:open,path:path,contentOptions:contentOptions,crumbs:crumbs,selfCheck:function(){return{release:RELEASE,flow:'module-course-chapter-activity-content',stable:true,isC01Theory:isC01Theory(),contentOptions:contentOptions().length,crumbs:crumbs().map(function(x){return x.label;})};}};
})();
