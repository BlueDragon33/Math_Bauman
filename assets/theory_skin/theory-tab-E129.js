/* E129 · Theory Tab Frame/Content Shell + Content Importer
 * Purpose: render a clean Theory tab from DataVault frame/content sources and route imports to theory_lecture_content.
 * E126 and E128 remain compatibility layers for legacy lessons only.
 */
(function(){
  'use strict';
  var RELEASE = 'E129_THEORY_CONTENT_IMPORTER_V2';
  var CONTENT_OVERLAY_KEY = 'bauman_math_e129_theory_content_overlay_v1';
  var CONTENT_REPORT_KEY = 'bauman_math_e129_theory_content_report_v1';
  var SUBJECT_STORAGE = window.BaumanSubjectStorage.forSubject('math');
  var CONTRACT = {
    release: RELEASE,
    contractDoc: 'subjects/math/THEORY_TAB_CONTRACT_E129.md',
    status: 'frame_content_shell_importer_active',
    runtimeBehavior: 'e129_renders_and_imports_theory_lecture_content',
    primaryFrameSource: 'theory_lecture_frame',
    primaryFramePath: 'data/theory_lecture_frame.json',
    primaryContentSource: 'theory_lecture_content',
    primaryContentPath: 'data/theory_lecture_content.json',
    legacySource: 'lessons',
    legacyPath: 'data/lessons.json',
    legacyRole: 'compatibility_fallback_only',
    activeStages: ['vn','prep','hk1','hk2','hk3','hk4'],
    activeStageNos: [0,1,2,3,4,5],
    activeChapterRange: { min: 1, max: 40 },
    frameworkOnlyStages: ['phd_bridge','phd_y1','phd_y2','phd_thesis'],
    frameworkOnlyChapterRange: { min: 41, max: 56 },
    storageRoute: {
      view: 'storage',
      domain: 'theory',
      group: 'Bài giảng lý thuyết',
      defaultFrameFile: 'theory_lecture_frame',
      defaultContentFile: 'theory_lecture_content',
      legacyFile: 'lessons'
    },
    renderStates: {
      frameOnly: 'show_clean_placeholder_from_frame',
      frameAndContent: 'show_full_theory_reader',
      legacyFallback: 'show_lessons_with_compatibility_badge'
    },
    requiredContentFields: ['lessonId','chapterId','lessonTitle|title','slides'],
    preferredSlideRoles: [
      'problem_framing','deep_essence','counter_intuition','real_bridge',
      'notation','core_formula','assumption_gate','mini_case',
      'interpretation','simulation','common_mistakes','application',
      'practice','professor_qa','bridge','takeaway'
    ],
    forbidden: [
      'hard_code_academic_tree_into_ui',
      'make_lessons_json_primary_again',
      'merge_frame_and_content_into_one_giant_json',
      'break_storage_overview_planning_mindmap_other_tabs'
    ]
  };

  var cache = { frame:null, content:null, legacy:null, chapters:[], records:[], legacyLessons:[], loaded:false, loading:false, error:null, overlay:false };
  var stageLabels = {vn:'GĐ0 · Việt Nam',prep:'GĐ1 · Dự bị Nga',hk1:'GĐ2 · ThS năm 1 HK1',hk2:'GĐ3 · ThS năm 1 HK2',hk3:'GĐ4 · ThS năm 2 HK3',hk4:'GĐ5 · VKR',phd_bridge:'GĐ6 · Cầu nối TS',phd_y1:'GĐ7 · TS năm 1',phd_y2:'GĐ8 · TS năm 2',phd_thesis:'GĐ9 · Luận án'};
  var E169_ACTIVITIES = [
    {id:'theory',tab:'theory',label:'Lý thuyết',name:'Kiến thức cốt lõi',summary:'Đọc bài giảng lý thuyết đầy đủ trong E129 Reader.'},
    {id:'exercises',tab:'exercises',label:'Bài tập',name:'Củng cố tư duy',summary:'Trắc nghiệm, tự luận, bài tập tính tay và kiểm tra tư duy.'},
    {id:'practice',tab:'practice',label:'Thực hành',name:'Lập trình & Hiện thực hóa',summary:'Bài tập code, Python/NumPy hoặc C++ và test case nếu khung dữ liệu có.'},
    {id:'application',tab:'application',label:'Ứng dụng thực tế',name:'Tình huống kỹ thuật',summary:'Tình huống kỹ thuật liên hệ AI, tín hiệu, mạng, hệ thống tự hành.'},
    {id:'review',tab:'review',label:'Ôn tập',name:'Hệ thống hóa kiến thức',summary:'Mindmap, cheat sheet, flashcard và thuật ngữ song ngữ.'},
    {id:'exam',tab:'exam',label:'Kiểm tra',name:'Đánh giá năng lực',summary:'Bài thi tổng hợp, trắc nghiệm + tự luận, time-box; giữ logic đề hiện có.'}
  ];
  var E169_TAB_ROUTES = {theory:'theory',exercises:'exercises',practice:'practice',review:'review',exam:'exam'};
  var E169_HIERARCHY = [
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
  var E169_C15_DETAILS = {
    theory:'Video bài học 15.1: Cấu trúc đồ thị phức tạp và thuật toán tìm đường đi ngắn nhất Dijkstra, Bellman-Ford. Video bài học 15.2: Lý thuyết luồng cực đại trong mạng, thuật toán Ford-Fulkerson. Tài liệu số: Sách điện tử về lý thuyết đồ thị ứng dụng trong cấu trúc mạng.',
    exercises:'Bài tập tương tác: kéo thả, mô phỏng các bước duyệt đỉnh đồ thị theo thuật toán Dijkstra trực tiếp trên màn hình.',
    practice:'Bài tập Code: Cài đặt giải thuật Ford-Fulkerson bằng C++ để tìm luồng cực đại trên đồ thị trọng số.',
    application:'Chuyên đề phân tích: Cách định tuyến gói tin của giao thức OSPF trong mạng máy tính dựa trên thuật toán Dijkstra.',
    review:'Bảng tra cứu nhanh: so sánh độ phức tạp thuật toán đồ thị O(V²) và O(E log V).',
    exam:'Bài thi tổng hợp: bài kiểm tra thực hành giải toán tối ưu luồng mạng bằng code trực tuyến, time-box 45 phút.'
  };

  function arr(v){ return Array.isArray(v) ? v : []; }
  function S(v){ return String(v == null ? '' : v); }
  function H(v){ return S(v).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];}); }
  function clip(v,n){ var s=S(v).replace(/\s+/g,' ').trim(); n=n||120; return s.length>n?s.slice(0,n-1)+'…':s; }
  function now(){ try{return new Date().toISOString();}catch(_){return '';}}
  function db(){ return window.DB || {}; }
  function api(){ return window.__BAUMAN_CORE_API || {}; }
  function state(){
    var st = api().state || window.__MATH_STATE;
    if(!st){ st = { view:'learning', learnTab:'theory', stage:'vn' }; window.__MATH_STATE = st; }
    if(!st.stage) st.stage = 'vn';
    if(!st.view) st.view = 'learning';
    if(!st.learnTab) st.learnTab = 'theory';
    return st;
  }
  function save(){ try{ api().save && api().save(); }catch(_){ } }
  function clone(v){ return JSON.parse(JSON.stringify(v)); }
  function localGet(k,fallback){ try{ return SUBJECT_STORAGE.getJSON(k,fallback); }catch(_){ return fallback; } }
  function localSet(k,v){ try{ SUBJECT_STORAGE.setJSON(k,v,{kind:'math-e129-overlay'}); return true; }catch(_){ return false; } }
  function localDel(k){ try{ SUBJECT_STORAGE.removeItem(k,{kind:'math-e129-overlay'}); }catch(_){ } }
  function isTheoryState(){ var st=state(); return S(st.view)==='learning' && S(st.learnTab||'theory')==='theory'; }
  function e169Path(){ var st=state(); st.e169Path=st.e169Path||{}; var p=st.e169Path; if(!p.moduleId)p.moduleId='pure'; if(!p.courseId)p.courseId='pure-algebra'; if(!p.chapterId)p.chapterId='c01'; if(!p.activityId)p.activityId='theory'; return p; }
  function e169Module(id){ return E169_HIERARCHY.find(function(m){return m.id===id;})||E169_HIERARCHY[0]; }
  function e169Course(moduleId,courseId){ var m=e169Module(moduleId); return arr(m&&m.courses).find(function(c){return c.id===courseId;})||arr(m&&m.courses)[0]||null; }
  function e169Chapter(moduleId,courseId,chapterId){ var c=e169Course(moduleId,courseId); return arr(c&&c.chapters).find(function(ch){return ch.id===chapterId;})||arr(c&&c.chapters)[0]||null; }
  function e169Activity(id){ return E169_ACTIVITIES.find(function(a){return a.id===id;})||E169_ACTIVITIES[0]; }
  function chapterByNo(no){ return cache.chapters.find(function(ch){return Number(ch.chapterNo)===Number(no);})||null; }
  function e169FrameChapter(){ var p=e169Path(); var ch=e169Chapter(p.moduleId,p.courseId,p.chapterId); return chapterByNo(ch&&ch.no); }
  function e169Records(){ var f=e169FrameChapter(); return f?recordsForChapter(f):[]; }
  function e169LessonLabel(rec){ return rec?S(rec.title||rec.lessonTitle||rec.lessonId).replace(/^§/,'Bài '):'Bài giảng'; }
  function isE169ActivityState(){ var st=state(); return S(st.view)==='learning' && !!st.e169Path && S(st.learnTab||'theory')!=='theory'; }
  function shouldRenderE129(){ return isTheoryState() || isE169ActivityState() || !window.__BAUMAN_CORE_API; }
  function e169Select(moduleId,courseId,chapterId,activityId,lessonId){
    var p=e169Path();
    if(moduleId){ p.moduleId=moduleId; var m=e169Module(moduleId); p.courseId=arr(m.courses)[0]&&arr(m.courses)[0].id; var c=e169Course(p.moduleId,p.courseId); p.chapterId=arr(c.chapters)[0]&&arr(c.chapters)[0].id; p.lessonId=''; }
    if(courseId){ p.courseId=courseId; var cc=e169Course(p.moduleId,p.courseId); p.chapterId=arr(cc.chapters)[0]&&arr(cc.chapters)[0].id; p.lessonId=''; }
    if(chapterId){ p.chapterId=chapterId; p.lessonId=''; }
    if(activityId) p.activityId=activityId;
    if(lessonId) p.lessonId=lessonId;
    var frame=e169FrameChapter(); var act=e169Activity(p.activityId);
    if(frame) state().e129ChapterId=frame.chapterId;
    if(p.activityId==='theory'){
      state().learnTab='theory'; state().view='learning';
      var recs=e169Records();
      state().e129LessonId=p.lessonId || (recs[0]&&recs[0].lessonId) || '';
      p.lessonId=state().e129LessonId;
    }else{
      state().learnTab=E169_TAB_ROUTES[p.activityId]||p.activityId; state().view='learning';
      state().e129LessonId=p.lessonId||'';
    }
    save();
    return {path:p,frame:frame,activity:act};
  }
  function e169Crumbs(){
    var p=e169Path(), m=e169Module(p.moduleId), c=e169Course(p.moduleId,p.courseId), ch=e169Chapter(p.moduleId,p.courseId,p.chapterId), act=e169Activity(p.activityId);
    var rec=e169Records().find(function(r){return r.lessonId===p.lessonId;})||null;
    return [
      {level:'module',label:'Khối kiến thức '+(m&&m.code||'I')},
      {level:'course',label:(c?'Học phần '+c.no:'Học phần')},
      {level:'chapter',label:(ch?'Chương '+ch.no:'Chương')},
      {level:'activity',label:(act?act.label:'Lý thuyết')+(rec?' · '+e169LessonLabel(rec).replace(/^Bài /,''):'')}
    ];
  }
  function e169SelectorHtml(){
    var p=e169Path(), m=e169Module(p.moduleId), c=e169Course(p.moduleId,p.courseId), ch=e169Chapter(p.moduleId,p.courseId,p.chapterId), act=e169Activity(p.activityId);
    var selected=[m&&('Khối '+m.code+' · '+m.title),c&&('Học phần '+c.no+' · '+c.title),ch&&('Chương '+ch.no),act&&act.label].filter(Boolean).join(' → ');
    return '<section class="e169-learning-router"><button class="e169-module-button" data-e169-open="module"><span class="e169-module-icon">◉</span><span><b>Khối kiến thức</b><small>'+H(selected||'Chọn lộ trình học tập')+'</small></span></button><div class="e169-breadcrumb">'+e169Crumbs().map(function(x){return '<button data-e169-open="'+H(x.level)+'">'+H(x.label)+'</button>';}).join('<span>→</span>')+'</div></section>';
  }
  function e169SpecialDetail(ch,act){ return ch&&ch.special==='graph_network_flow' ? E169_C15_DETAILS[act.id] : ''; }
  function e169ActivityOptions(){
    var p=e169Path(), ch=e169Chapter(p.moduleId,p.courseId,p.chapterId), recs=e169Records(), out=[];
    if(recs.length){
      recs.forEach(function(r){ out.push({kind:'lesson',activityId:'theory',lessonId:r.lessonId,label:'Lý thuyết · '+H(r.title||r.lessonTitle||'Bài giảng'),summary:'Mở đúng bài trong E129 Reader full content.'}); });
    }else{
      out.push({kind:'activity',activityId:'theory',label:'Lý thuyết · Kiến thức cốt lõi',summary:e169SpecialDetail(ch,E169_ACTIVITIES[0])||E169_ACTIVITIES[0].summary});
    }
    E169_ACTIVITIES.slice(1).forEach(function(a){ out.push({kind:'activity',activityId:a.id,label:a.label+' · '+a.name,summary:e169SpecialDetail(ch,a)||a.summary}); });
    return out;
  }
  function setHeader(title,sub){
    try{
      var pageTitle=document.getElementById('pageTitle'); if(pageTitle) pageTitle.textContent=title||'Lý thuyết';
      var pageSub=document.getElementById('pageSub'); if(pageSub) pageSub.textContent=sub||'E129 · DataVault frame/content';
      var core=document.getElementById('coreLabel'); if(core) core.textContent='MATH · E129 Theory Importer';
      document.documentElement.setAttribute('data-theory-contract', RELEASE);
    }catch(_){ }
  }
  function fetchJson(path,fallback){
    return fetch(path,{cache:'no-store'}).then(function(r){ if(!r.ok) throw new Error(path+' HTTP '+r.status); return r.text(); }).then(function(txt){
      if(!txt || !txt.trim()) return fallback;
      return JSON.parse(txt);
    }).catch(function(e){ cache.error = e; return fallback; });
  }
  function extractRecords(raw){
    if(Array.isArray(raw)) return raw;
    if(raw && Array.isArray(raw.records)) return raw.records;
    if(raw && Array.isArray(raw.lessons)) return raw.lessons;
    if(raw && Array.isArray(raw.items)) return raw.items;
    if(raw && Array.isArray(raw.content)) return raw.content;
    if(raw && raw.data) return extractRecords(raw.data);
    return [];
  }
  function normalizeFrame(raw){
    var out=[];
    if(Array.isArray(raw)){
      raw.forEach(function(ch){ out.push(normalizeChapter(ch, ch.stageId||ch.stage||'vn', ch.stageTitle||'', ch.disciplineId||'', ch.disciplineTitle||'')); });
      return uniqueChapters(out);
    }
    arr(raw && raw.stages).forEach(function(stage){
      arr(stage.disciplines).forEach(function(disc){
        arr(disc.chapters).forEach(function(ch){ out.push(normalizeChapter(ch, stage.stageId, stage.stageTitle, disc.disciplineId, disc.disciplineTitle)); });
      });
    });
    arr(raw && raw.chapters).forEach(function(ch){ out.push(normalizeChapter(ch, ch.stageId||ch.stage||'vn', ch.stageTitle||'', ch.disciplineId||'', ch.disciplineTitle||'')); });
    return uniqueChapters(out);
  }
  function uniqueChapters(chapters){
    var seen=Object.create(null);
    return chapters.filter(Boolean).filter(function(chapter){
      var id=S(chapter.chapterId).trim();
      if(!id || seen[id]) return false;
      seen[id]=true;
      return true;
    });
  }
  function normalizeChapter(ch,stageId,stageTitle,disciplineId,disciplineTitle){
    if(!ch) return null;
    var id=S(ch.chapterId||ch.id).trim();
    if(!id) return null;
    return {
      chapterId:id,
      chapterNo:Number(ch.chapterNo||ch.localChapterNo||ch.globalChapterNo||0)||0,
      chapterTitle:S(ch.chapterTitle||ch.globalChapterTitle||ch.title||id),
      stageId:S(ch.stageId||stageId||'vn'),
      stageTitle:S(ch.stageTitle||stageTitle||stageLabels[stageId]||stageId||''),
      disciplineId:S(ch.disciplineId||disciplineId||''),
      disciplineTitle:S(ch.disciplineTitle||disciplineTitle||'Chưa phân môn'),
      secondaryDisciplineIds:arr(ch.secondaryDisciplineIds),
      pureLayer:arr(ch.pureLayer),
      appliedLayer:arr(ch.appliedLayer),
      bridgeQuestion:S(ch.bridgeQuestion||''),
      targetOutcome:S(ch.targetOutcome||''),
      suggestedLessonCount:Number(ch.suggestedLessonCount||0)||0,
      contentStatus:S(ch.contentStatus||'')
    };
  }
  function normalizeSlide(sl,rec,index){
    var out=(sl&&typeof sl==='object')?Object.assign({},sl):{body:S(sl)};
    out.role=out.role||CONTRACT.preferredSlideRoles[index]||('slide_'+(index+1));
    out.id=out.id||((rec.lessonId||rec.id||'lesson')+'-S'+String(index+1).padStart(2,'0'));
    out.title=out.title||out.role.replace(/_/g,' ');
    if(!Array.isArray(out.blocks)){
      if(out.body||out.content||out.text) out.blocks=[{type:'section',title:out.title,body:S(out.body||out.content||out.text)}];
      else out.blocks=[];
    }
    out.renderPolicy=out.renderPolicy||'safe_text_formula_blocks_only';
    return out;
  }
  function normalizeRecord(r){
    if(!r || typeof r!=='object') return null;
    var id=S(r.lessonId||r.id).trim();
    var chapterId=S(r.chapterId||r.sourceChapterId||(r.sourceAnchors&&r.sourceAnchors.chapterId)||'').trim();
    if(!id && !chapterId) return null;
    var out=Object.assign({},r,{lessonId:id||('lesson_'+chapterId),chapterId:chapterId,title:S(r.lessonTitle||r.title||r.displayTitle||id||'Bài giảng')});
    out.lessonTitle=out.lessonTitle||out.title;
    out.id=out.id||out.lessonId;
    out.slides=arr(out.slides).map(function(s,i){ return normalizeSlide(s,out,i); });
    return out;
  }
  function contentPayload(records,meta){
    return { id:'bauman_math_theory_lecture_content_overlay_e129', schema:'bauman_math_content_records_v1', version:RELEASE, title:'Bài giảng lý thuyết · Nội dung', role:'content', frameSource:'theory_lecture_frame.json', recordKey:'lessonId', importedAt:now(), meta:meta||{}, records:records };
  }
  function overlayPayload(){ return localGet(CONTENT_OVERLAY_KEY,null); }
  function loadOverlay(){
    var saved=overlayPayload();
    if(saved && Array.isArray(saved.records)){
      cache.content=saved;
      cache.overlay=true;
      if(window.DB) window.DB.theory_lecture_content=saved;
      return true;
    }
    return false;
  }
  function rebuildFromDb(){
    if(!cache.frame && db().theory_lecture_frame) cache.frame = db().theory_lecture_frame;
    if(!cache.content && db().theory_lecture_content) cache.content = db().theory_lecture_content;
    if(!cache.legacy && db().lessons) cache.legacy = db().lessons;
    cache.chapters = normalizeFrame(cache.frame||{});
    cache.records = extractRecords(cache.content||{}).map(normalizeRecord).filter(Boolean);
    cache.legacyLessons = extractRecords(cache.legacy||{}).map(normalizeRecord).filter(Boolean);
  }
  function loadData(){
    if(cache.loaded) return Promise.resolve(cache);
    if(cache.loading) return new Promise(function(resolve){ var t=setInterval(function(){ if(cache.loaded||cache.error){ clearInterval(t); resolve(cache); } },80); });
    cache.loading = true;
    return Promise.all([
      fetchJson(CONTRACT.primaryFramePath,{}),
      fetchJson(CONTRACT.primaryContentPath,{records:[]}),
      fetchJson(CONTRACT.legacyPath,[])
    ]).then(function(items){
      cache.frame = items[0]; cache.content = items[1]; cache.legacy = items[2];
      loadOverlay();
      rebuildFromDb(); cache.loaded = true; cache.loading = false; return cache;
    });
  }
  function countSource(name){
    if(name===CONTRACT.primaryFrameSource) return cache.chapters.length || (db().theory_lecture_frame ? 1 : 0);
    if(name===CONTRACT.primaryContentSource) return cache.records.length;
    if(name===CONTRACT.legacySource) return cache.legacyLessons.length;
    var value = db()[name];
    if(Array.isArray(value)) return value.length;
    if(value && Array.isArray(value.records)) return value.records.length;
    if(value && Array.isArray(value.lessons)) return value.lessons.length;
    if(value && Array.isArray(value.items)) return value.items.length;
    return value ? 1 : 0;
  }
  function sourceStatus(){
    rebuildFromDb();
    return { frame: countSource(CONTRACT.primaryFrameSource), content: countSource(CONTRACT.primaryContentSource), legacy: countSource(CONTRACT.legacySource), overlay:!!cache.overlay, frameSource: CONTRACT.primaryFrameSource, contentSource: CONTRACT.primaryContentSource, legacySource: CONTRACT.legacySource };
  }
  function applyAdapterMetadata(){
    var A = window.SUBJECT_ADAPTER;
    if(!A) return false;
    A.version = RELEASE; A.release = RELEASE; A.latestPatch = RELEASE; A.theoryContract = CONTRACT;
    A.dataSourceMeta = A.dataSourceMeta || {};
    A.dataSourceMeta.theory_lecture_frame = Object.assign({}, A.dataSourceMeta.theory_lecture_frame || {}, { label:'Bài giảng lý thuyết · Khung', path:CONTRACT.primaryFramePath, group:'Bài giảng lý thuyết', required:true, plannedCount:56, description:'E129 primary frame source: stage/discipline/chapter shell, not long lecture content.' });
    A.dataSourceMeta.theory_lecture_content = Object.assign({}, A.dataSourceMeta.theory_lecture_content || {}, { label:'Bài giảng lý thuyết · Nội dung', path:CONTRACT.primaryContentPath, group:'Bài giảng lý thuyết', required:true, plannedCount:0, description:'E129 primary content source: lesson records/slides keyed by lessonId and chapterId.' });
    A.dataSourceMeta.lessons = Object.assign({}, A.dataSourceMeta.lessons || {}, { label:'Bài giảng cũ / tương thích', path:CONTRACT.legacyPath, group:'Tương thích', required:false, description:'E129 compatibility fallback only. New Theory imports must target theory_lecture_content.' });
    A.ui = A.ui || {};
    A.ui.coreLabel='MATH · E129 Theory Importer'; A.ui.heroBadge='Math Bauman · E129'; A.ui.heroTitle='Toán Bauman · Theory Frame/Content Importer'; A.ui.subtitle='Lý thuyết thống nhất theo DataVault frame/content';
    A.ui.overviewSubtitle='E129: khung đọc từ theory_lecture_frame, nội dung đọc từ theory_lecture_content, lessons chỉ là tương thích.';
    A.ui.learningSubtitle='Tab Lý thuyết hiển thị được cả khi mới có khung, sau đó đọc bài giảng thật từ Dữ liệu môn học.';
    A.ui.storageSubtitle='Kho môn học ưu tiên cặp Lý thuyết: Khung môn học và Dữ liệu môn học; lessons chỉ dùng khi cần tương thích.';
    A.ui.assistantToast='E129: nhập Lý thuyết vào theory_lecture_content; E126/E128 giữ làm compatibility.';
    return true;
  }
  function currentStage(){ return S(state().e129Stage||state().stage||'vn'); }
  function stageChapters(){
    var q=S(state().e129Query||'').toLowerCase().trim();
    return cache.chapters.filter(function(ch){
      var okStage = ch.stageId===currentStage();
      var text = [ch.chapterTitle,ch.disciplineTitle,ch.bridgeQuestion,ch.targetOutcome,ch.pureLayer.join(' '),ch.appliedLayer.join(' ')].join(' ').toLowerCase();
      return okStage && (!q || text.indexOf(q)>=0);
    });
  }
  function pickChapter(list){
    var id=S(state().e129ChapterId||'');
    var hit=list.find(function(ch){return ch.chapterId===id;});
    if(hit) return hit;
    hit=list[0]||cache.chapters.find(function(ch){return ch.stageId===currentStage();})||cache.chapters[0]||null;
    if(hit) state().e129ChapterId=hit.chapterId;
    return hit;
  }
  function chapterById(id){ return cache.chapters.find(function(ch){ return ch.chapterId===id; }) || null; }
  function recordsForChapter(ch){ if(!ch) return []; return cache.records.filter(function(r){return r.chapterId===ch.chapterId;}); }
  function legacyForChapter(ch){ if(!ch) return []; return cache.legacyLessons.filter(function(r){return r.chapterId===ch.chapterId || Number(r.sourceChapterNo||0)===ch.chapterNo;}); }
  function groupByDiscipline(list){
    var groups=[]; var map={};
    list.forEach(function(ch){ var k=ch.disciplineId||ch.disciplineTitle||'other'; if(!map[k]){map[k]={id:k,title:ch.disciplineTitle||'Chưa phân môn',chapters:[]};groups.push(map[k]);} map[k].chapters.push(ch); });
    return groups;
  }
  function renderTree(list,current){
    if(!list.length) return '<div class="e129-empty">Không có chương phù hợp bộ lọc.</div>';
    return groupByDiscipline(list).map(function(g){
      return '<section class="e129-disc"><div class="e129-disc-title">'+H(g.title)+'</div>'+g.chapters.map(function(ch){
        var count=recordsForChapter(ch).length; var legacy=legacyForChapter(ch).length; var active=current&&current.chapterId===ch.chapterId;
        return '<button class="e129-chapter-btn '+(active?'active':'')+'" data-e129-chapter="'+H(ch.chapterId)+'"><b>'+H(ch.chapterTitle)+'</b><span>'+H(ch.bridgeQuestion||ch.targetOutcome||'Khung đã sẵn sàng nhập nội dung')+'</span><span>'+count+' bài nội dung · '+legacy+' legacy</span></button>';
      }).join('')+'</section>';
    }).join('');
  }
  function pillList(items){ items=arr(items).filter(Boolean); return items.length?'<div class="e129-pill-row">'+items.map(function(x){return '<span class="e129-pill">'+H(x)+'</span>';}).join('')+'</div>':'<p class="e129-muted">Chưa có dữ liệu lớp này trong khung.</p>'; }
  function blockHtml(b){
    if(!b || typeof b!=='object') return '<p>'+H(b)+'</p>';
    var title=S(b.title||b.type||'Nội dung'); var body=S(b.body||b.content||b.text||'');
    if((S(b.type).toLowerCase()==='formula') || /formula|công thức|ký hiệu/i.test(title)) return '<pre>'+H(title+'\n'+body)+'</pre>';
    return '<h3>'+H(title)+'</h3><p>'+H(body||'Chưa có nội dung chi tiết.')+'</p>';
  }
  function slideHtml(sl,i){
    var blocks=arr(sl&&sl.blocks);
    return '<article class="e129-slide"><h3>'+(i+1)+'. '+H(sl&& (sl.title||sl.role) || 'Slide')+'</h3>'+(blocks.length?blocks.map(blockHtml).join(''):'<p>'+H(sl&& (sl.body||sl.content||sl.text) || 'Slide chưa có block chi tiết.')+'</p>')+'</article>';
  }
  function renderContent(ch,records,legacy){
    if(records.length){
      var chosenId=S(state().e129LessonId||records[0].lessonId); var rec=records.find(function(r){return r.lessonId===chosenId;})||records[0]; state().e129LessonId=rec.lessonId;
      e169Path().lessonId=rec.lessonId;
      var slides=arr(rec.slides);
      return '<section class="e129-placeholder" data-current-lesson="'+H(rec.lessonId)+'"><span class="e129-badge">Dữ liệu môn học · theory_lecture_content'+(cache.overlay?' · overlay':'')+'</span><div class="e169-reader-title"><h2>'+H(rec.title)+'</h2><p class="e129-muted">Reader giữ full content · '+slides.length+' slide · lessonId: <code>'+H(rec.lessonId)+'</code></p></div><div class="e129-slide-list">'+(slides.length?slides.map(slideHtml).join(''):'<article class="e129-slide"><h3>Chưa có slide</h3><p>Record đã tồn tại nhưng chưa có mảng slides hợp lệ.</p></article>')+'</div></section>';
    }
    if(legacy.length){
      var l=legacy[0];
      return '<section class="e129-placeholder"><span class="e129-badge">Compatibility: lessons.json fallback</span><h2>'+H(l.title||'Bài legacy')+'</h2><p>Chương này có dữ liệu cũ trong <code>lessons.json</code>. E129 chỉ dùng để xem tương thích; nhập mới vẫn phải đi vào <code>theory_lecture_content.json</code>.</p><div class="e129-slide-list">'+arr(l.slides).map(slideHtml).join('')+'</div></section>';
    }
    return '<section class="e129-placeholder"><span class="e129-badge">Frame-only · chờ nội dung</span><h2>Chưa có nội dung bài giảng</h2><p>Khung chương đã có trong <code>theory_lecture_frame.json</code>, nhưng chưa có record tương ứng trong <code>theory_lecture_content.json</code>.</p><ol><li>Giữ nguyên <code>chapterId</code>: <code>'+H(ch&&ch.chapterId)+'</code></li><li>Tạo record có <code>lessonId</code>, <code>chapterId</code>, <code>lessonTitle/title</code>, <code>slides</code>.</li><li>Nhập qua Kho môn học → Học tập → Lý thuyết → Dữ liệu môn học.</li></ol></section>';
  }

  function scanBadText(obj){
    var s=''; try{s=JSON.stringify(obj);}catch(_){s='';}
    var bad=[];
    [[/<script/i,'script tag'],[/javascript\s*:/i,'javascript: URL'],[/onerror\s*=/i,'inline onerror'],[/\[object Object\]/,'[object Object]'],[/TODO|FIXME|lorem|placeholder/i,'TODO/FIXME/lorem/placeholder']].forEach(function(p){if(p[0].test(s))bad.push(p[1]);});
    return bad;
  }
  function extractContentPackage(parsed,fileName,forcedMode){
    var mode=forcedMode||'merge', target='theory_lecture_content', raw=[];
    if(Array.isArray(parsed)) raw=parsed;
    else if(parsed&&typeof parsed==='object'){
      if(parsed.target) target=S(parsed.target);
      if(parsed.mode) mode=S(parsed.mode);
      raw=arr(parsed.records).length?arr(parsed.records):arr(parsed.lessons).length?arr(parsed.lessons):arr(parsed.items).length?arr(parsed.items):arr(parsed.content);
      if(!raw.length&&parsed.data&&typeof parsed.data==='object') raw=arr(parsed.data.records||parsed.data.lessons||parsed.data.items);
    }
    if(!['merge','replace','patch'].includes(mode)) mode='merge';
    return {mode:mode,target:target,fileName:fileName||'theory_lecture_content_import.json',records:raw.map(normalizeRecord).filter(Boolean),packageType:S(parsed&&parsed.packageType||'')};
  }
  function validateContentPackage(pkg){
    var errors=[],warnings=[],seen={};
    if(!/^theory_lecture_content(?:\.json)?$|^theory$/i.test(pkg.target||'')) errors.push({path:'target',message:'Gói E129 phải nhắm tới theory_lecture_content, không phải lessons.json.'});
    if(!pkg.records.length) errors.push({path:'records',message:'Không tìm thấy records[]/lessons[] hợp lệ.'});
    var bad=scanBadText(pkg.records); if(bad.length) errors.push({path:'security',message:'Có mẫu nội dung nguy hiểm/bẩn: '+bad.join(', ')});
    pkg.records.forEach(function(r,idx){
      if(!r.lessonId) errors.push({path:'records['+idx+'].lessonId',message:'Thiếu lessonId.'});
      if(!r.chapterId) errors.push({path:'records['+idx+'].chapterId',message:'Thiếu chapterId.'});
      if(r.lessonId&&seen[r.lessonId]) errors.push({path:'records['+idx+'].lessonId',message:'Trùng lessonId trong gói: '+r.lessonId});
      seen[r.lessonId]=1;
      var ch=chapterById(r.chapterId);
      if(!ch) warnings.push({path:r.lessonId||('records['+idx+']'),message:'chapterId chưa khớp theory_lecture_frame: '+r.chapterId});
      if(ch && ch.chapterNo>=41) errors.push({path:r.lessonId,message:'Không nhập nội dung active cho PhD/framework-only chương 41–56.'});
      if(!r.title) errors.push({path:(r.lessonId||idx)+'.title',message:'Thiếu lessonTitle/title.'});
      if(!Array.isArray(r.slides) || !r.slides.length) errors.push({path:(r.lessonId||idx)+'.slides',message:'Thiếu slides[].'});
      if(Array.isArray(r.slides) && r.slides.length!==16) warnings.push({path:(r.lessonId||idx)+'.slides',message:'Khuyến nghị đủ 16 slide role; hiện có '+r.slides.length+'.'});
      arr(r.slides).forEach(function(sl,si){ if(si<CONTRACT.preferredSlideRoles.length && sl.role && sl.role!==CONTRACT.preferredSlideRoles[si]) warnings.push({path:(r.lessonId||idx)+'.slides['+si+'].role',message:'Role khác thứ tự chuẩn: '+sl.role+'; gợi ý '+CONTRACT.preferredSlideRoles[si]}); });
    });
    return {ok:!errors.length,errors:errors,warnings:warnings};
  }
  function applyContentPackage(pkg){
    var before=cache.records.map(clone), map={}, current=before.map(clone);
    current.forEach(function(r,i){ map[r.lessonId]=i; });
    var inserted=0,updated=0,patched=0,sample=[];
    if(pkg.mode==='replace'){
      current=pkg.records.map(clone); inserted=current.length; sample=current.slice(0,8).map(function(r){return r.lessonId;});
    }else{
      pkg.records.forEach(function(r){
        var idx=map[r.lessonId]; sample.push(r.lessonId);
        if(idx==null){ current.push(clone(r)); map[r.lessonId]=current.length-1; inserted++; }
        else if(pkg.mode==='patch'){ current[idx]=Object.assign({},current[idx],clone(r)); patched++; }
        else { current[idx]=clone(r); updated++; }
      });
    }
    var payload=contentPayload(current,{mode:pkg.mode,fileName:pkg.fileName});
    cache.content=payload; cache.records=current; cache.overlay=true; if(window.DB) window.DB.theory_lecture_content=payload;
    localSet(CONTENT_OVERLAY_KEY,payload);
    return {payload:payload,stats:{before:before.length,after:current.length,inserted:inserted,updated:updated,patched:patched,sample:sample.slice(0,10)}};
  }
  function setImportReport(r){ r.at=now(); localSet(CONTENT_REPORT_KEY,r); }
  function getImportReport(){ return localGet(CONTENT_REPORT_KEY,null); }
  function commitContent(raw,fileName,forcedMode){
    var parsed;
    try{ parsed=typeof raw==='string'?JSON.parse(raw):raw; }catch(e){ var er={ok:false,source:'theory_lecture_content',fileName:fileName||'',errors:[{path:'JSON',message:'Lỗi cú pháp JSON: '+S(e.message||e)}],warnings:[]}; setImportReport(er); renderStorage(); return er; }
    var pkg=extractContentPackage(parsed,fileName,forcedMode||getMode());
    var val=validateContentPackage(pkg);
    if(!val.ok){ var bad={ok:false,source:'theory_lecture_content',fileName:pkg.fileName,mode:pkg.mode,beforeCount:cache.records.length,afterCount:cache.records.length,errors:val.errors,warnings:val.warnings}; setImportReport(bad); renderStorage(); return bad; }
    var applied=applyContentPackage(pkg);
    var report={ok:true,source:'theory_lecture_content',sourceLabel:'Bài giảng lý thuyết · Nội dung',fileName:pkg.fileName,mode:pkg.mode,beforeCount:applied.stats.before,afterCount:applied.stats.after,inserted:applied.stats.inserted,updated:applied.stats.updated,patched:applied.stats.patched,errors:[],warnings:val.warnings,sample:applied.stats.sample,details:['Đã áp dụng vào DB.theory_lecture_content runtime','Đã lưu overlay localStorage E129','Xuất JSON nếu muốn ghi bền vào repo/data/theory_lecture_content.json']};
    setImportReport(report); renderStorage(); return report;
  }
  function getMode(){ var el=document.getElementById('e129Mode'); return el?el.value:'merge'; }
  function downloadJson(name,data){ var blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'}); var a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=name; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); },300); }
  function exportContent(){ downloadJson('theory_lecture_content_E129_export_'+Date.now()+'.json',contentPayload(cache.records,{exportedBy:RELEASE})); }
  function clearContentOverlay(){ localDel(CONTENT_OVERLAY_KEY); cache.overlay=false; cache.loaded=false; setImportReport({ok:true,source:'theory_lecture_content',fileName:'clear_overlay',mode:'restore_on_reload',beforeCount:cache.records.length,afterCount:cache.records.length,errors:[],warnings:[],details:['Đã xóa overlay E129. Bấm Tải lại JSON hoặc reload để đọc file gốc.']}); loadData().then(renderStorage); }
  function templateContent(){
    var ch=chapterById(state().e129ChapterId)||cache.chapters[0]||{chapterId:'MATH-VN-C01-vector_trong_khong_gian_',chapterTitle:'Chương 1 · Vector trong không gian dữ liệu'};
    var lessonId=(ch.chapterId||'MATH-C01')+'-L01';
    var sample={ packageType:'bauman.math.theory_lecture_content.patch', target:'theory_lecture_content', mode:getMode(), version:RELEASE, createdAt:now(), records:[{ lessonId:lessonId, chapterId:ch.chapterId, lessonTitle:'§1.1 · Bài giảng mẫu theo E129', title:'§1.1 · Bài giảng mẫu theo E129', tags:['draft','theory','datavault'], slides:CONTRACT.preferredSlideRoles.map(function(role,i){ return { id:lessonId+'-S'+String(i+1).padStart(2,'0'), role:role, title:role.replace(/_/g,' '), blocks:[{type:'section',title:'Nội dung mẫu',body:'Thay đoạn này bằng nội dung học thuật đã kiểm, gắn đúng chapterId và lessonId.'}], renderPolicy:'safe_text_formula_blocks_only' }; }) }] };
    downloadJson('bauman_math_theory_lecture_content_template_E129.json',sample);
  }
  function reportHtml(){
    var r=getImportReport();
    if(!r) return '<div class="e129-import-report warn"><h3>Chưa có lượt nhập E129</h3><p>Importer này nhắm tới <code>theory_lecture_content</code>. Không ghi vào <code>lessons.json</code>.</p></div>';
    var cls=r.ok?'ok':'err';
    var errs=arr(r.errors).map(function(e){return '<li><code>'+H(e.path||'')+'</code> '+H(e.message||e)+'</li>';}).join('');
    var warns=arr(r.warnings).slice(0,14).map(function(e){return '<li><code>'+H(e.path||'')+'</code> '+H(e.message||e)+'</li>';}).join('');
    var details=arr(r.details).map(function(x){return '<li>'+H(x)+'</li>';}).join('');
    var sample=arr(r.sample).slice(0,8).map(function(x){return '<code>'+H(x)+'</code>';}).join(' ');
    return '<div class="e129-import-report '+cls+'"><h3>'+(r.ok?'✅ Đã xử lý E129':'⚠️ Chưa nhập được E129')+'</h3><p class="e129-muted">'+H(r.at||'')+' · '+H(r.fileName||'')+'</p><div class="e129-status"><div class="e129-stat"><b>'+H(r.beforeCount==null?'?':r.beforeCount)+'</b><span>Trước</span></div><div class="e129-stat"><b>'+H(r.afterCount==null?'?':r.afterCount)+'</b><span>Sau</span></div><div class="e129-stat"><b>'+H((r.inserted||0)+'/'+(r.updated||0)+'/'+(r.patched||0))+'</b><span>Thêm / thay / patch</span></div></div>'+(sample?'<p>Mẫu ID: '+sample+'</p>':'')+(details?'<ul>'+details+'</ul>':'')+(warns?'<h3>Cảnh báo</h3><ul>'+warns+'</ul>':'')+(errs?'<h3>Lỗi</h3><ul>'+errs+'</ul>':'')+'</div>';
  }
  function pasteModal(){
    modal('<header><div><span class="e129-badge">Dán JSON E129</span><h3>Nhập theory_lecture_content</h3><p>Dán package có <code>target: theory_lecture_content</code> và <code>records[]</code>.</p></div><button class="e129-close" data-e129-import-act="close">×</button></header><textarea id="e129PasteText" placeholder="Dán JSON tại đây..."></textarea><div class="e129-modal-actions"><button class="e129-action ghost" data-e129-import-act="close">Hủy</button><button class="e129-action primary" data-e129-import-act="apply-paste">Kiểm tra & nhập</button></div>');
  }
  function modal(html){ var old=document.querySelector('.e129-modal-backdrop'); if(old) old.remove(); var m=document.createElement('div'); m.className='e129-modal-backdrop'; m.innerHTML='<div class="e129-modal">'+html+'</div>'; document.body.appendChild(m); }
  function closeModal(){ var old=document.querySelector('.e129-modal-backdrop'); if(old) old.remove(); }
  function e169ModalTitle(level){ return {module:'Chọn Khối kiến thức',course:'Chọn Học phần',chapter:'Chọn Chương',activity:'Chọn Bài giảng / Hoạt động'}[level]||'Chọn lộ trình'; }
  function e169Option(label,sub,attrs,kind){
    var at=Object.keys(attrs||{}).map(function(k){return ' '+k+'="'+H(attrs[k])+'"';}).join('');
    return '<button class="e169-choice '+H(kind||'')+'"'+at+'><b>'+H(label)+'</b>'+(sub?'<span>'+H(sub)+'</span>':'')+'</button>';
  }
  function openE169Modal(level){
    var p=e169Path(), html='', title=e169ModalTitle(level);
    if(level==='module'){
      html=E169_HIERARCHY.map(function(m){ return e169Option('Khối kiến thức '+m.code+' · '+m.title,m.en,{'data-e169-pick-module':m.id},m.id===p.moduleId?'active':''); }).join('');
    }else if(level==='course'){
      var m=e169Module(p.moduleId);
      html=arr(m.courses).map(function(c){ return e169Option('Học phần '+c.no+' · '+c.title,c.en,{'data-e169-pick-course':c.id},c.id===p.courseId?'active':''); }).join('');
    }else if(level==='chapter'){
      var c=e169Course(p.moduleId,p.courseId);
      html=arr(c&&c.chapters).map(function(ch){ return e169Option('Chương '+ch.no,ch.title,{'data-e169-pick-chapter':ch.id},ch.id===p.chapterId?'active':''); }).join('');
    }else{
      html=e169ActivityOptions().map(function(o){ return e169Option(o.label,o.summary,{'data-e169-pick-activity':o.activityId,'data-e169-pick-lesson':o.lessonId||''},(o.activityId===p.activityId&&(!o.lessonId||o.lessonId===p.lessonId))?'active':''); }).join('');
    }
    modal('<header><div><span class="e129-badge">E169 · Learning Path</span><h3>'+H(title)+'</h3><p>Chọn theo thứ tự Khối → Học phần → Chương → Bài giảng / Hoạt động.</p></div><button class="e129-close" data-e129-import-act="close">×</button></header><div class="e169-choice-grid">'+html+'</div>');
  }
  function suppressLegacyImporter(){
    var st=state();
    var onTheoryStorage = st.view==='storage' && st.storageDomain==='theory';
    document.body.classList.toggle('e129-theory-storage',!!onTheoryStorage);
    if(onTheoryStorage){ document.querySelectorAll('[data-e127-panel="1"]').forEach(function(n){n.remove();}); }
  }

  function renderTheory(){
    var view=document.getElementById('view'); if(!view) return false;
    rebuildFromDb();
    if(!cache.chapters.length){ view.innerHTML='<section class="e129-panel e129-reader"><span class="e129-badge">E129</span><h1>Chưa tải được khung Lý thuyết</h1><p class="e129-muted">Kiểm tra <code>data/theory_lecture_frame.json</code> hoặc chạy bằng Live Server.</p></section>'; return false; }
    state().view='learning'; state().learnTab='theory'; e169Path().activityId='theory'; document.body.classList.remove('e129-theory-storage');
    var routed=e169Select(null,null,null,'theory',e169Path().lessonId);
    var list=stageChapters(); var ch=routed.frame||pickChapter(list); var records=recordsForChapter(ch); var legacy=legacyForChapter(ch); var status=sourceStatus();
    setHeader('Lý thuyết','E129 · Frame/content importer · '+status.frame+' chương khung · '+status.content+' record nội dung · '+status.legacy+' legacy'+(status.overlay?' · overlay':''));
    var stages=CONTRACT.activeStages.concat(CONTRACT.frameworkOnlyStages);
    view.innerHTML='<main class="e129-theory-shell '+(state().e129Present?'presenting':'')+'" data-e129-release="'+RELEASE+'"><aside class="e129-panel e129-sidebar"><div class="e129-side-head"><span class="e129-badge">E129 · Theory Shell</span><h2>Khung Lý thuyết</h2><p>Đọc khung từ <code>theory_lecture_frame</code>, nội dung từ <code>theory_lecture_content</code>.</p><input class="e129-search" data-e129-query placeholder="Tìm chương, phân môn, bridge..." value="'+H(state().e129Query||'')+'"><div class="e129-status"><div class="e129-stat"><b>'+status.frame+'</b><span>khung</span></div><div class="e129-stat"><b>'+status.content+'</b><span>content</span></div><div class="e129-stat"><b>'+status.legacy+'</b><span>legacy</span></div></div></div><div class="e129-stage-tabs">'+stages.map(function(st){return '<button class="'+(currentStage()===st?'active':'')+'" data-e129-stage="'+H(st)+'">'+H(stageLabels[st]||st)+'</button>';}).join('')+'</div><div class="e129-tree">'+renderTree(list,ch)+'</div></aside><section class="e129-panel e129-reader"><header class="e129-reader-head e169-reader-head"><div>'+e169SelectorHtml()+'</div><div class="e129-actions"><button class="e129-action primary" data-e129-open-vault>Kho Lý thuyết</button><button class="e129-action ghost" data-e129-present>'+(state().e129Present?'Thoát trình chiếu':'Trình chiếu')+'</button><button class="e129-action ghost" data-e129-refresh>Tải lại JSON</button></div></header>'+renderContent(ch,records,legacy)+'</section></main>';
    document.body.classList.toggle('e129-presenting',!!state().e129Present);
    return true;
  }
  function renderE169Activity(){
    var view=document.getElementById('view'); if(!view) return false;
    rebuildFromDb();
    var p=e169Path(), frame=e169FrameChapter(), localChapter=e169Chapter(p.moduleId,p.courseId,p.chapterId), act=e169Activity(p.activityId);
    var known=!!E169_TAB_ROUTES[p.activityId];
    setHeader(act.label, 'E169 · Learning path router · '+(known?'route nội bộ đã map':'placeholder an toàn'));
    var detail=e169SpecialDetail(localChapter,act)||act.summary;
    var routeLabel=known?('learnTab = '+E169_TAB_ROUTES[p.activityId]):'Chưa có tab route riêng, hiển thị placeholder trong khu Học tập';
    view.innerHTML='<main class="e129-theory-shell e169-activity-shell" data-e129-release="'+RELEASE+'"><section class="e129-panel e129-reader"><header class="e129-reader-head e169-reader-head"><div>'+e169SelectorHtml()+'</div></header><section class="e169-activity-card"><span class="e129-badge">'+H(routeLabel)+'</span><h2>'+H(act.label+' · '+act.name)+'</h2><p>'+H(detail)+'</p><div class="e169-activity-meta"><span>'+H(localChapter?('Chương '+localChapter.no):'Chưa chọn chương')+'</span><span>'+H(frame?frame.chapterId:'Chưa có frame/content tương ứng')+'</span></div><div class="e169-placeholder-grid"><article><b>Trạng thái</b><p>Khung hoạt động đã route an toàn, chưa sinh nội dung học thuật dài.</p></article><article><b>Reader</b><p>E129 Reader vẫn giữ full content ở tab Lý thuyết.</p></article><article><b>Đi tiếp</b><p>Dùng breadcrumb hoặc nút Khối kiến thức để đổi cấp chọn.</p></article></div></section></section></main>';
    document.body.classList.remove('e129-presenting','e129-theory-storage');
    return true;
  }
  function renderStorage(){
    var view=document.getElementById('view'); if(!view) return false;
    state().view='storage'; state().storageDomain='theory'; setHeader('Kho Lý thuyết','E129 · Mở đúng cặp Khung môn học / Dữ liệu môn học');
    var status=sourceStatus(); suppressLegacyImporter();
    view.innerHTML='<main class="e129-theory-shell"><section class="e129-panel e129-reader"><span class="e129-badge">Kho môn học → Học tập → Lý thuyết</span><h1>DataVault Lý thuyết</h1><p class="e129-muted">Importer E129 nhắm tới <code>theory_lecture_content</code>. E128/lessons chỉ là legacy compatibility.</p><div class="e129-grid"><article class="e129-card"><h3>Khung môn học</h3><p><code>theory_lecture_frame.json</code></p><p>'+status.frame+' chương/frame đang sẵn sàng.</p></article><article class="e129-card"><h3>Dữ liệu môn học</h3><p><code>theory_lecture_content.json</code></p><p>'+status.content+' record nội dung hiện có'+(status.overlay?' · overlay đang bật':'')+'.</p></article><article class="e129-card"><h3>Legacy</h3><p><code>lessons.json</code></p><p>'+status.legacy+' bài tương thích. Không dùng làm nguồn chính.</p></article></div><section class="e129-placeholder e129-importer"><h2>Nhập Dữ liệu môn học Lý thuyết</h2><p>Gói nhập phải có <code>target: theory_lecture_content</code> và <code>records[]</code>. Không dùng <code>lessons.json</code> cho nội dung mới.</p><div class="e129-import-actions"><label class="e129-action primary">Nhập JSON<input id="e129ImportFile" type="file" accept=".json,application/json" hidden></label><button class="e129-action ghost" data-e129-import-act="paste">Dán JSON</button><label class="e129-mode"><span>Chế độ</span><select id="e129Mode"><option value="merge">Merge · thêm/thay theo lessonId</option><option value="patch">Patch · sửa từng phần</option><option value="replace">Replace · thay toàn bộ content</option></select></label><button class="e129-action ghost" data-e129-import-act="export">Xuất theory_lecture_content</button><button class="e129-action ghost" data-e129-import-act="template">Form mẫu E129</button><button class="e129-action danger" data-e129-import-act="clear">Xóa overlay</button><button class="e129-action" data-e129-back-theory>Quay lại Lý thuyết</button></div>'+reportHtml()+'</section></section></main>';
    setTimeout(suppressLegacyImporter,50); setTimeout(suppressLegacyImporter,500);
    return true;
  }
  function buildHostNav(){
    var nav=document.getElementById('nav');
    if(nav && !nav.querySelector('[data-e129-nav]')){
      nav.insertAdjacentHTML('beforeend','<button class="nav-item" data-e129-nav="theory">📘 Lý thuyết E129</button><button class="nav-item" data-e129-nav="storage">🗄 Kho Lý thuyết</button>');
    }
    var stageSel=document.getElementById('stageSelect');
    if(stageSel && !stageSel.querySelector('option[data-e129-stage]')){
      stageSel.innerHTML=CONTRACT.activeStages.concat(CONTRACT.frameworkOnlyStages).map(function(st){return '<option data-e129-stage="1" value="'+H(st)+'">'+H(stageLabels[st]||st)+'</option>';}).join('');
      stageSel.value=currentStage();
    }
  }
  function openTheoryVault(){
    var st=state(); st.view='storage'; st.storageDomain='theory'; st.storageFile=CONTRACT.storageRoute.defaultContentFile; st.storageFrameFile=CONTRACT.storageRoute.defaultFrameFile; st.storageContentFile=CONTRACT.storageRoute.defaultContentFile; st.storageLegacyFile=CONTRACT.storageRoute.legacyFile; save(); renderStorage(); return st;
  }
  function render(){
    applyAdapterMetadata(); buildHostNav(); suppressLegacyImporter();
    if(state().view==='storage' && state().storageDomain==='theory') return renderStorage();
    if(isE169ActivityState()) return renderE169Activity();
    if(shouldRenderE129()) return renderTheory();
    return false;
  }
  function scheduleRender(delay){ setTimeout(function(){ loadData().then(render); },delay||0); }
  function selfCheck(){ var status=sourceStatus(); return { ok:!!(cache.chapters.length||status.frame), release:RELEASE, contractDoc:CONTRACT.contractDoc, adapterMarked:!!(window.SUBJECT_ADAPTER&&window.SUBJECT_ADAPTER.theoryContract), sources:status, primaryFrameSource:CONTRACT.primaryFrameSource, primaryContentSource:CONTRACT.primaryContentSource, legacySource:CONTRACT.legacySource, renderReplacement:true, importerTarget:'theory_lecture_content', legacyImporterSuppressedOnTheoryStorage:true, frameOnlyRenderable:cache.chapters.length>0, note:'E129 shell/importer is active. E126/E128 remain compatibility layers outside E129 Theory storage.' }; }

  document.addEventListener('change',function(e){
    if(e.target&&e.target.id==='e129ImportFile'){
      var file=e.target.files&&e.target.files[0]; if(!file)return;
      var rd=new FileReader(); rd.onload=function(ev){ commitContent(String(ev.target.result||''),file.name,getMode()); }; rd.readAsText(file); e.target.value='';
    }
    if(e.target&&e.target.id==='stageSelect'&&e.target.querySelector('option[data-e129-stage]')){ state().e129Stage=e.target.value; state().stage=e.target.value; state().e129ChapterId=''; renderTheory(); }
  },true);
  document.addEventListener('click',function(e){
    var t=e.target.closest&&e.target.closest('[data-e169-open],[data-e169-pick-module],[data-e169-pick-course],[data-e169-pick-chapter],[data-e169-pick-activity],[data-e129-stage],[data-e129-chapter],[data-e129-lesson],[data-e129-open-vault],[data-e129-present],[data-e129-refresh],[data-e129-back-theory],[data-e129-nav],[data-e129-import-act]'); if(!t) return;
    var st=state();
    if(t.hasAttribute('data-e169-open')){ openE169Modal(t.getAttribute('data-e169-open')||'module'); e.preventDefault(); e.stopImmediatePropagation(); return; }
    if(t.hasAttribute('data-e169-pick-module')){ e169Select(t.getAttribute('data-e169-pick-module')); openE169Modal('course'); e.preventDefault(); e.stopImmediatePropagation(); return; }
    if(t.hasAttribute('data-e169-pick-course')){ e169Select(null,t.getAttribute('data-e169-pick-course')); openE169Modal('chapter'); e.preventDefault(); e.stopImmediatePropagation(); return; }
    if(t.hasAttribute('data-e169-pick-chapter')){ e169Select(null,null,t.getAttribute('data-e169-pick-chapter')); openE169Modal('activity'); e.preventDefault(); e.stopImmediatePropagation(); return; }
    if(t.hasAttribute('data-e169-pick-activity')){ e169Select(null,null,null,t.getAttribute('data-e169-pick-activity'),t.getAttribute('data-e169-pick-lesson')||''); closeModal(); render(); e.preventDefault(); e.stopImmediatePropagation(); return; }
    if(t.hasAttribute('data-e129-import-act')){
      var act=t.getAttribute('data-e129-import-act'); e.preventDefault(); e.stopImmediatePropagation();
      if(act==='paste') pasteModal();
      if(act==='export') exportContent();
      if(act==='template') templateContent();
      if(act==='clear') clearContentOverlay();
      if(act==='close') closeModal();
      if(act==='apply-paste'){ var raw=(document.getElementById('e129PasteText')||{}).value||''; var r=commitContent(raw,'pasted_theory_lecture_content.json',getMode()); if(r&&r.ok) closeModal(); }
      return;
    }
    if(t.hasAttribute('data-e129-nav')){ var v=t.getAttribute('data-e129-nav'); if(v==='storage'){openTheoryVault();}else{st.view='learning';st.learnTab='theory';renderTheory();} e.preventDefault(); return; }
    if(t.hasAttribute('data-e129-stage')){ st.e129Stage=t.getAttribute('data-e129-stage'); st.stage=st.e129Stage; st.e129ChapterId=''; st.e129LessonId=''; st.view='learning'; st.learnTab='theory'; renderTheory(); e.preventDefault(); return; }
    if(t.hasAttribute('data-e129-chapter')){ st.e129ChapterId=t.getAttribute('data-e129-chapter'); st.e129LessonId=''; st.view='learning'; st.learnTab='theory'; renderTheory(); e.preventDefault(); return; }
    if(t.hasAttribute('data-e129-lesson')){ st.e129LessonId=t.getAttribute('data-e129-lesson'); renderTheory(); e.preventDefault(); return; }
    if(t.hasAttribute('data-e129-open-vault')){ openTheoryVault(); e.preventDefault(); return; }
    if(t.hasAttribute('data-e129-present')){ var visible=document.querySelector('[data-current-lesson]'); var visibleId=S(visible&&visible.getAttribute('data-current-lesson')||st.e129LessonId||e169Path().lessonId||''); if(visibleId){st.e129LessonId=visibleId;e169Path().lessonId=visibleId;} st.e129Present=!st.e129Present; renderTheory(); e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation)e.stopImmediatePropagation(); return; }
    if(t.hasAttribute('data-e129-refresh')){ cache.loaded=false; cache.loading=false; loadData().then(renderTheory); e.preventDefault(); return; }
    if(t.hasAttribute('data-e129-back-theory')){ st.view='learning'; st.learnTab='theory'; renderTheory(); e.preventDefault(); return; }
  },true);
  document.addEventListener('input',function(e){ if(e.target&&e.target.matches&&e.target.matches('[data-e129-query]')){ state().e129Query=e.target.value||''; renderTheory(); } },true);
  document.addEventListener('keydown',function(e){ if(e.key==='Escape' && document.querySelector('.e129-modal-backdrop')) closeModal(); },true);

  var obs=null;
  function startSuppressor(){ if(obs) return; try{ obs=new MutationObserver(suppressLegacyImporter); obs.observe(document.body,{childList:true,subtree:true}); }catch(_){ } }

  window.BAUMAN_MATH_THEORY_E129_CONTRACT = CONTRACT;
  window.BAUMAN_MATH_THEORY_E129 = { release:RELEASE, contract:CONTRACT, applyAdapterMetadata:applyAdapterMetadata, sourceStatus:sourceStatus, openTheoryVault:openTheoryVault, render:render, commitContent:commitContent, exportContent:exportContent, clearContentOverlay:clearContentOverlay, selfCheck:selfCheck };
  window.BAUMAN_MATH_E129_OWNS_THEORY = true;

  applyAdapterMetadata();
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',function(){ startSuppressor(); scheduleRender(0); scheduleRender(650); });
  else { startSuppressor(); scheduleRender(0); scheduleRender(650); }
})();
