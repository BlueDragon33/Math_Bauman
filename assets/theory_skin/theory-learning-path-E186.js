/* E186 · Lesson-first learning path
 * Desired order:
 * Khối kiến thức → Học phần → Chương → Bài → Phân mục
 * The outer sidebar tab can be Học tập, but the path itself never uses Học tập as a level.
 */
(function(){
  'use strict';
  var RELEASE='E195_C03_LESSON_PICKER_FIX';
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
    {id:'theory',tab:'theory',label:'Lý thuyết',summary:'Đọc bài giảng đầy đủ, công thức, trình chiếu.'},
    {id:'exercises',tab:'exercises',label:'Bài tập',summary:'Củng cố tư duy bằng trắc nghiệm, tự luận, bài tính tay.'},
    {id:'practice',tab:'practice',label:'Thực hành',summary:'Lập trình, mô phỏng, test case.'},
    {id:'application',tab:'application',label:'Ứng dụng thực tế',summary:'Tình huống kỹ thuật, AI, tín hiệu, mạng, hệ tự hành.'},
    {id:'review',tab:'review',label:'Ôn tập',summary:'Mindmap, cheat sheet, flashcard, thuật ngữ.'},
    {id:'exam',tab:'exam',label:'Kiểm tra',summary:'Đánh giá năng lực, time-box, tổng hợp.'}
  ];
  var C01_LESSONS=[
    {id:'MATH-VN-C01-vector_trong_khong_gian_-L01-vector-as-engineering-data-e130',label:'Bài 1.1 · Vector như dữ liệu kỹ thuật'},
    {id:'MATH-VN-C01-vector_trong_khong_gian_-L02-norm-distance-metric-e139',label:'Bài 1.2 · Chuẩn vector và khoảng cách'},
    {id:'MATH-VN-C01-vector_trong_khong_gian_-L03-dot-angle-projection-e139',label:'Bài 1.3 · Tích vô hướng, góc và phép chiếu'},
    {id:'MATH-VN-C01-vector_trong_khong_gian_-L04-basis-span-coordinate-e140',label:'Bài 1.4 · Cơ sở, span và tọa độ'},
    {id:'MATH-VN-C01-vector_trong_khong_gian_-L05-subspace-data-representation-e140',label:'Bài 1.5 · Không gian con và biểu diễn dữ liệu'},
    {id:'MATH-VN-C01-vector_trong_khong_gian_-L06-vector-to-data-matrix-e140',label:'Bài 1.6 · Từ vector sang ma trận dữ liệu'}
  ];
  var C02_LESSONS=[
    {id:'MATH-VN-C02-ma_tran_va_phep_bien_oi_-L01-matrix-as-data-and-transform-e142',label:'Bài 2.1 · Ma trận như dữ liệu và phép biến đổi'},
    {id:'MATH-VN-C02-ma_tran_va_phep_bien_oi_-L02-matrix-multiplication-pipeline-e142',label:'Bài 2.2 · Phép nhân ma trận và pipeline tuyến tính'},
    {id:'MATH-VN-C02-ma_tran_va_phep_bien_oi_-L03-rank-column-space-independent-information-e142',label:'Bài 2.3 · Hạng ma trận, không gian cột và thông tin độc lập'},
    {id:'MATH-VN-C02-ma_tran_va_phep_bien_oi_-L04-inverse-linear-system-solution-e143',label:'Bài 2.4 · Nghịch đảo, giải hệ và điều kiện tồn tại nghiệm'},
    {id:'MATH-VN-C02-ma_tran_va_phep_bien_oi_-L05-linear-transform-geometry-data-e143',label:'Bài 2.5 · Phép biến đổi tuyến tính trong hình học và dữ liệu'},
    {id:'MATH-VN-C02-ma_tran_va_phep_bien_oi_-L06-matrix-to-pca-linear-model-e143',label:'Bài 2.6 · Từ ma trận sang PCA và mô hình tuyến tính'}
  ];
  var C03_LESSONS=[
    {id:'MATH-VN-C03-giai_tich_dao_ham_gradient-L01-function-as-input-output-model-e145',label:'Bài 3.1 · Hàm số như mô hình đầu vào–đầu ra'},
    {id:'MATH-VN-C03-giai_tich_dao_ham_gradient-L02-derivative-system-sensitivity-e145',label:'Bài 3.2 · Đạo hàm và độ nhạy của hệ thống'},
    {id:'MATH-VN-C03-giai_tich_dao_ham_gradient-L03-gradient-direction-fastest-change-e145',label:'Bài 3.3 · Gradient như hướng thay đổi nhanh nhất'},
    {id:'MATH-VN-C03-giai_tich_dao_ham_gradient-L04-gradient-descent-learning-rate-e146',label:'Bài 3.4 · Gradient descent và learning rate'},
    {id:'MATH-VN-C03-giai_tich_dao_ham_gradient-L05-loss-extrema-optimality-e146',label:'Bài 3.5 · Hàm mất mát, cực trị và điều kiện tối ưu'},
    {id:'MATH-VN-C03-giai_tich_dao_ham_gradient-L06-gradient-backprop-ml-optimization-e146',label:'Bài 3.6 · Từ gradient sang backpropagation và tối ưu ML'}
  ];
  var ROUTES={theory:'theory',exercises:'exercises',practice:'practice',application:'application',review:'review',exam:'exam'};
  var scheduled=false;
  function S(v){return String(v==null?'':v);}
  function H(v){return S(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
  function api(){return window.__BAUMAN_CORE_API||{};}
  function state(){var st=api().state||window.__MATH_STATE;if(!st){st={view:'learning',learnTab:'theory'};window.__MATH_STATE=st;}return st;}
  function save(){try{api().save&&api().save();}catch(_){} }
  function path(){var st=state();st.e186Path=st.e186Path||{};var p=st.e186Path;if(!p.moduleId)p.moduleId='pure';if(!p.courseId)p.courseId='pure-algebra';if(!p.chapterId)p.chapterId='c01';if(!p.lessonId)p.lessonId=C01_LESSONS[0].id;if(!p.activityId)p.activityId='theory';return p;}
  function mod(id){return HIERARCHY.find(function(x){return x.id===id;})||HIERARCHY[0];}
  function course(mid,cid){var m=mod(mid);return (m.courses||[]).find(function(x){return x.id===cid;})||(m.courses||[])[0];}
  function chapter(mid,cid,chid){var c=course(mid,cid);return ((c&&c.chapters)||[]).find(function(x){return x.id===chid;})||((c&&c.chapters)||[])[0];}
  function activity(id){return ACTIVITIES.find(function(x){return x.id===id;})||ACTIVITIES[0];}
  function cleanLessonTitle(v){return S(v).replace(/^\s*§\s*/,'Bài ').replace(/\b§(?=\d)/g,'Bài ').replace(/^\s*Bài\s+Bài\s+/,'Bài ').replace(/^\s*ài\s+Bài\s+/,'Bài ').trim();}
  function records(){var db=window.DB||{}, raw=db.theory_lecture_content||{}, list=Array.isArray(raw)?raw:(raw.records||raw.lessons||raw.items||[]);return Array.isArray(list)?list:[];}
  function frames(){var db=window.DB||{}, raw=db.theory_lecture_frame||{}, out=[];(raw.stages||[]).forEach(function(st){(st.disciplines||[]).forEach(function(d){(d.chapters||[]).forEach(function(ch){out.push(ch);});});});(raw.chapters||[]).forEach(function(ch){out.push(ch);});return out;}
  function frameByNo(no){return frames().find(function(ch){return Number(ch.chapterNo||ch.localChapterNo||ch.globalChapterNo||0)===Number(no);})||null;}
  function currentFrame(){var p=path(), ch=chapter(p.moduleId,p.courseId,p.chapterId);return frameByNo(ch&&ch.no);}
  function staticLessons(chapterId){if(chapterId==='c01')return C01_LESSONS;if(chapterId==='c02')return C02_LESSONS;if(chapterId==='c03')return C03_LESSONS;return [];}
  function lessonOptions(){var p=path(), fr=currentFrame();
    if(fr){var recs=records().filter(function(r){return r.chapterId===(fr.chapterId||fr.id);});if(recs.length){return recs.map(function(r){return {id:S(r.lessonId||r.id),label:cleanLessonTitle(r.title||r.lessonTitle||r.lessonId),sub:'Chọn bài trước, rồi chọn phân mục học tập.'};});}}
    var stat=staticLessons(p.chapterId);if(stat.length)return stat.map(function(x){return {id:x.id,label:x.label,sub:'Chọn bài trước, rồi chọn phân mục học tập.'};});
    var ch=chapter(p.moduleId,p.courseId,p.chapterId);return [{id:p.chapterId+'-overview',label:'Bài '+(ch&&ch.no||'')+'.1 · Bài giảng tổng quan',sub:'Khung bài tạm cho chương này.'}];
  }
  function ensureLesson(){var p=path(), opts=lessonOptions();if(!opts.length)return p;var ok=opts.some(function(x){return x.id===p.lessonId;});if(!p.lessonId||!ok||/-overview$/.test(S(p.lessonId))){p.lessonId=opts[0].id;}return p;}
  function lessonLabel(){ensureLesson();var p=path(), opts=lessonOptions(), hit=opts.find(function(x){return x.id===p.lessonId;})||opts[0];return hit?hit.label:'Chọn bài';}
  function activityLabel(){return activity(path().activityId).label;}
  function displayChapterTitle(ch){
    if(!ch)return 'Chưa chọn chương';
    if(ch.id==='c01')return 'Đại số tuyến tính nâng cao';
    var title=S(ch.title||'').replace(/^\s*Chương\s*\d+\s*[·:.-]\s*/i,'').replace(/[.。]\s*$/,'').trim();
    if(title.length>72)title=title.slice(0,72).replace(/\s+\S*$/,'').trim();
    return title||('Chương '+(ch.no||''));
  }
  function moduleSubtitle(){var p=path(), m=mod(p.moduleId), c=course(p.moduleId,p.courseId), ch=chapter(p.moduleId,p.courseId,p.chapterId);return [(m&&m.title)||'Toán học',(c&&c.title)||'Học phần',displayChapterTitle(ch)].join(' > ');}
  function crumbs(){var p=path(), m=mod(p.moduleId), c=course(p.moduleId,p.courseId), ch=chapter(p.moduleId,p.courseId,p.chapterId);return [
    {level:'module',label:'Khối '+(m&&m.code||'I')},
    {level:'course',label:'Học phần '+(c&&c.no||'')},
    {level:'chapter',label:'Chương '+(ch&&ch.no||'')},
    {level:'lesson',label:cleanLessonTitle(lessonLabel())},
    {level:'activity',label:activityLabel()}
  ];}
  function pathSummary(){return crumbs().map(function(x){return x.label;}).join(' → ');}
  function syncLegacy(){var p=ensureLesson(), st=state();st.e169Path=st.e169Path||{};st.e169Path.moduleId=p.moduleId;st.e169Path.courseId=p.courseId;st.e169Path.chapterId=p.chapterId;st.e169Path.activityId=p.activityId;st.e169Path.lessonId=p.lessonId;st.e169Path.contentId=p.lessonId;}
  function setPath(kind,id){var p=path();if(kind==='module'){p.moduleId=id;var m=mod(id);p.courseId=(m.courses[0]||{}).id;p.chapterId=(((m.courses[0]||{}).chapters||[])[0]||{}).id;p.lessonId='';p.activityId='theory';}
    if(kind==='course'){p.courseId=id;var c=course(p.moduleId,id);p.chapterId=((c.chapters||[])[0]||{}).id;p.lessonId='';p.activityId='theory';}
    if(kind==='chapter'){p.chapterId=id;p.lessonId='';p.activityId='theory';}
    if(kind==='lesson'){p.lessonId=id;p.activityId='theory';}
    if(kind==='activity'){p.activityId=id;}
    ensureLesson();syncLegacy();save();return p;}
  function close(){var old=document.querySelector('.e129-modal-backdrop');if(old)old.remove();}
  function modal(html){close();var n=document.createElement('div');n.className='e129-modal-backdrop e186-modal-backdrop';n.innerHTML='<div class="e129-modal e186-modal">'+html+'</div>';document.body.appendChild(n);}
  function option(label,sub,attrs,active){var at=Object.keys(attrs||{}).map(function(k){return ' '+k+'="'+H(attrs[k])+'"';}).join('');return '<button class="e169-choice e186-choice '+(active?'active':'')+'"'+at+'><b>'+H(label)+'</b>'+(sub?'<span>'+H(sub)+'</span>':'')+'</button>';}
  function open(level){var p=path(), html='', m=mod(p.moduleId), c=course(p.moduleId,p.courseId), title='';
    if(level==='module'){title='Chọn Khối kiến thức';html=HIERARCHY.map(function(x){return option('Khối kiến thức '+x.code+' · '+x.title,x.en,{'data-e186-pick':'module','data-e186-id':x.id},x.id===p.moduleId);}).join('');}
    else if(level==='course'){title='Chọn Học phần';html=(m.courses||[]).map(function(x){return option('Học phần '+x.no+' · '+x.title,x.en,{'data-e186-pick':'course','data-e186-id':x.id},x.id===p.courseId);}).join('');}
    else if(level==='chapter'){title='Chọn Chương';html=((c&&c.chapters)||[]).map(function(x){return option('Chương '+x.no,x.title,{'data-e186-pick':'chapter','data-e186-id':x.id},x.id===p.chapterId);}).join('');}
    else if(level==='lesson'){ensureLesson();title='Chọn Bài';html=lessonOptions().map(function(x){return option(x.label,x.sub,{'data-e186-pick':'lesson','data-e186-id':x.id},x.id===path().lessonId);}).join('');}
    else {title='Chọn phân mục';html=ACTIVITIES.map(function(x){return option(x.label,x.summary,{'data-e186-pick':'activity','data-e186-id':x.id},x.id===p.activityId);}).join('');}
    modal('<header><div><span class="e129-badge">E186 · Lesson First</span><h3>'+H(title)+'</h3><p>Thứ tự: Khối → Học phần → Chương → Bài → Phân mục.</p></div><button class="e129-close" data-e186-close>×</button></header><div class="e169-choice-grid e186-choice-grid">'+html+'</div>');
  }
  function renderRoute(){var p=ensureLesson(), st=state(), fr=currentFrame();syncLegacy();st.view='learning';st.learnTab=ROUTES[p.activityId]||p.activityId;if(fr)st.e129ChapterId=fr.chapterId||fr.id||'';if(p.chapterId==='c01')st.e129ChapterId=C01_CHAPTER_ID;st.e129LessonId=p.lessonId;save();close();try{window.BAUMAN_MATH_THEORY_E129&&window.BAUMAN_MATH_THEORY_E129.render&&window.BAUMAN_MATH_THEORY_E129.render();}catch(_){location.reload();}}
  function patchSurface(){
    syncLegacy();
    var summary=pathSummary();
    var mb=document.querySelector('.e169-module-button');
    if(mb){['data-e169-open','data-e178-open'].forEach(function(a){mb.removeAttribute(a);});mb.setAttribute('data-e186-open','module');mb.setAttribute('title',summary);var small=mb.querySelector('small');if(small&&small.textContent!==moduleSubtitle())small.textContent=moduleSubtitle();}
    var bc=document.querySelector('.e169-breadcrumb');
    if(bc){var html=crumbs().map(function(x){return '<button type="button" data-e186-open="'+H(x.level)+'" title="'+H(summary)+'">'+H(x.label)+'</button>';}).join('');if(bc.getAttribute('data-e186-html')!==html){bc.innerHTML=html;bc.setAttribute('data-e186-html',html);}bc.setAttribute('data-e186-ready','1');}
    var title=document.getElementById('pageTitle');if(title&&document.querySelector('.e169-learning-router,.e169-breadcrumb,.e129-theory-shell')){var a=activityLabel();if(title.textContent!==a&&/Học tập|Lý thuyết|Bài tập|Thực hành|Ứng dụng thực tế|Ôn tập|Kiểm tra/.test(title.textContent||''))title.textContent=a;}
  }
  function handle(e){var t=e.target.closest&&e.target.closest('[data-e186-open],[data-e186-pick],[data-e186-close]');if(!t)return;e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();
    if(t.hasAttribute('data-e186-close')){close();return;}
    if(t.hasAttribute('data-e186-open')){open(t.getAttribute('data-e186-open')||'module');return;}
    var kind=t.getAttribute('data-e186-pick'), id=t.getAttribute('data-e186-id');
    if(kind==='module'){setPath('module',id);open('course');return;}
    if(kind==='course'){setPath('course',id);open('chapter');return;}
    if(kind==='chapter'){setPath('chapter',id);open('lesson');return;}
    if(kind==='lesson'){setPath('lesson',id);renderRoute();open('activity');return;}
    if(kind==='activity'){setPath('activity',id);renderRoute();return;}
  }
  function patchLabels(){document.querySelectorAll('.e169-reader-title h2,.e169-choice b,.e129-slide h3').forEach(function(n){var c=cleanLessonTitle(n.textContent||'');if(c&&c!==n.textContent)n.textContent=c;});patchSurface();}
  function schedulePatch(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;patchLabels();});}
  window.addEventListener('click',handle,true);
  window.addEventListener('pointerup',handle,true);
  document.addEventListener('keydown',function(e){if(e.key==='Escape'&&document.querySelector('.e186-modal-backdrop'))close();},true);
  var mo=new MutationObserver(schedulePatch);
  function boot(){try{mo.observe(document.body,{childList:true,subtree:true});}catch(_){}patchLabels();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot);else boot();
  window.BAUMAN_MATH_E186_LESSON_FIRST={release:RELEASE,open:open,path:path,lessonOptions:lessonOptions,crumbs:crumbs,moduleSubtitle:moduleSubtitle,displayChapterTitle:displayChapterTitle,selfCheck:function(){return{release:RELEASE,flow:'module-course-chapter-lesson-activity',crumbs:crumbs().map(function(x){return x.label;}),lessons:lessonOptions().length,activity:activityLabel(),moduleSubtitle:moduleSubtitle()};}};
})();
