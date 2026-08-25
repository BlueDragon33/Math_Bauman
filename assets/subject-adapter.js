/* FINAL_ADAPTER_SYNC: official release metadata synchronized. */
'use strict';

window.SUBJECT_ADAPTER = {
  id: 'math',
  subjectKind: 'mathematics',
  version: 'MathContentSystem E108 STAGE DISCIPLINE SPINE 2026-06-22',
  storageKey: 'bauman_math_stage_discipline_spine_e108',
  packageRoot: 'subjects/math/',
  localRoot: './',
  dataRoot: 'data/',
  externalDataRoot: 'external-data/',
  manifestPath: 'subject-manifest.json',
  oldStorageKeys: ['bauman_math_final_release','bauman_math_content_system_final_v32','bauman_math_roadmap_v9_simulation_tabs_lab','bauman_math_roadmap_v6_new_russian_ui_root','bauman_math_roadmap_v5_new_russian_ui_root','bauman_math_responsive_v3'],
  dataFiles: ['curriculum', 'chapter_spine', 'content-manifest', 'theory-framework', 'concept-map', 'mindmap', 'mastery-map', 'lessons', 'formulas', 'grammar', 'grammar-path', 'vocab', 'exercises', 'applications', 'simulations', 'professor_qa', 'speaking', 'dialogue-bauman-az', 'question_bank', 'test_blueprints', 'review_packs', 'learning_rules', 'tests', 'content-index', 'knowledge-index', 'handwriting', 'writing', 'videos', 'deep-speaking-bauman', 'speaking-link-index'],
  optionalDataFiles: ['deep-speaking-bauman', 'dialogue-bauman-az', 'handwriting', 'question_bank', 'review_packs', 'speaking', 'speaking-link-index', 'test_blueprints', 'tests', 'writing'],
  dataSourceMeta: {

    'content-manifest':{label:'Bản đồ nguồn dữ liệu',path:'data/content-manifest.json',group:'Hệ thống nội dung',required:true,plannedCount:12,description:'Quản lý slot JSON, schema, Replace/Merge/Restore'},
    'theory-framework':{label:'Khung Khoa-Bộ môn-Chương-Bài',path:'data/theory-framework.json',group:'Hệ thống nội dung',required:true,plannedCount:13,description:'Xương sống lý thuyết môn Toán'},
    'concept-map':{label:'Bản đồ khái niệm',path:'data/concept-map.json',group:'Hệ thống nội dung',required:true,plannedCount:451,description:'Từ điển khái niệm Việt-Nga-Anh, alias và liên kết'},
    'mastery-map':{label:'Bản đồ năng lực',path:'data/mastery-map.json',group:'Ôn tập/Kiểm tra',required:true,plannedCount:260,description:'Nối bài học với skill, kiểm tra, ôn tập, mind map'},
    formulas:{label:'Công thức chuẩn',path:'data/formulas.json',group:'Công thức',required:true,plannedCount:780,description:'Công thức, điều kiện áp dụng, lỗi sai'},
    professor_qa:{label:'Vấn đáp giáo sư',path:'data/professor_qa.json',group:'Vấn đáp',required:true,plannedCount:260,description:'Câu hỏi seminar/giáo sư theo lessonId'},
    question_bank:{label:'Ngân hàng câu hỏi',path:'data/question_bank.json',group:'Kiểm tra',required:true,plannedCount:1040,description:'Câu hỏi có chẩn đoán đáp án sai và remedial links'},
    test_blueprints:{label:'Blueprint kiểm tra',path:'data/test_blueprints.json',group:'Kiểm tra',required:true,plannedCount:32,description:'Quy tắc sinh đề theo chương, độ khó, skill'},
    review_packs:{label:'Gói ôn tập',path:'data/review_packs.json',group:'Ôn tập',required:true,plannedCount:260,description:'Gói sửa lỗi theo concept/skill'},
    learning_rules:{label:'Luật học tập',path:'data/learning_rules.json',group:'Ôn tập',required:true,plannedCount:2,description:'Luật từ sai câu → ôn tập → kiểm tra lại'},
    'content-index':{label:'Chỉ mục tìm kiếm',path:'data/content-index.json',group:'Tìm kiếm',required:true,plannedCount:260,description:'Index liên kết nội dung, concept, resource'},
    curriculum:{label:'Lộ trình & giai đoạn',path:'data/curriculum.json',group:'Lõi môn học',required:true,plannedCount:9,description:'Cây giai đoạn môn Toán theo lộ trình Bauman'},
    lessons:{label:'Bài giảng lý thuyết',path:'data/lessons.json',group:'Lõi môn học',required:true,plannedCount:260,description:'Chỉ gồm bài giảng lý thuyết, chia theo cụm môn học; không gộp bài tập/ứng dụng.'},
    grammar:{label:'Công thức gốc',path:'data/grammar.json',group:'Công thức',required:true,plannedCount:48,description:'Công thức, ý nghĩa và ứng dụng'},
    'grammar-path':{label:'Lộ trình công thức',path:'data/grammar-path.json',group:'Công thức',required:true,plannedCount:48,description:'Công thức theo giai đoạn'},
    vocab:{label:'Thẻ công thức',path:'data/vocab.json',group:'Công thức',required:true,plannedCount:852,description:'Thẻ công thức/ký hiệu dùng như flashcard'},
    mindmap:{label:'Mind map Toán',path:'data/mindmap.json',group:'Mind map',required:true,plannedCount:5,description:'Sơ đồ ôn tập theo giai đoạn'},
    exercises:{label:'Bài tập',path:'data/exercises.json',group:'Bài tập',required:true,plannedCount:1040,description:'Nguồn bài tập tách riêng khỏi lessons.json, liên kết theo lessonId của bài giảng lý thuyết.'},
    applications:{label:'Ứng dụng Toán',path:'data/applications.json',group:'Ứng dụng',required:true,plannedCount:520,description:'Nguồn ứng dụng tách riêng khỏi lessons.json, dùng cho tab Học tập > Ứng dụng.'},
    tests:{label:'Kiểm tra',path:'data/tests.json',group:'Kiểm tra',required:true,plannedCount:4,description:'Ngân hàng câu hỏi kiểm tra Toán'},
    simulations:{label:'Mô phỏng tham số',path:'data/simulations.json',group:'Mô phỏng',required:true,plannedCount:260,description:'Mô phỏng tổng hợp: mỗi bài học có một lab thống nhất, không tách lý thuyết/ứng dụng'},
    speaking:{label:'Vấn đáp giáo sư',path:'data/speaking.json',group:'Vấn đáp',required:true,plannedCount:260,description:'Câu hỏi lý thuyết thực tế giáo sư có thể hỏi, kèm thuật ngữ Việt-Nga-Anh'},
    'dialogue-bauman-az':{label:'Ứng dụng Toán vào AI/Bauman',path:'data/dialogue-bauman-az.json',group:'Ứng dụng',required:true,lazy:false,plannedCount:520,description:'Alias tương thích cũ của applications.json; dùng trực tiếp trong tab Học tập > Ứng dụng'},
    'deep-speaking-bauman':{label:'Phản biện ứng dụng sâu',path:'data/deep-speaking-bauman.json',group:'Ứng dụng',required:true,lazy:false,plannedCount:48,description:'Câu hỏi phản biện sâu cho seminar/НИР/ВКР'},
    'speaking-link-index':{label:'Cầu nối vấn đáp - ứng dụng',path:'data/speaking-link-index.json',group:'Ứng dụng',required:true,lazy:false,plannedCount:2,description:'Liên kết bài học với vấn đáp và phản biện'},
    handwriting:{label:'Ký hiệu',path:'data/handwriting.json',group:'Ký hiệu',required:true,plannedCount:48,description:'Ký hiệu Toán cần viết/gõ đúng'},
    writing:{label:'Báo cáo mô phỏng',path:'data/writing.json',group:'Mô phỏng',required:true,plannedCount:48,description:'Báo cáo sau mô phỏng: biến đầu vào, kết quả, công thức giải thích, ứng dụng'},
    videos:{label:'Video / mô phỏng',path:'data/videos.json',group:'Video/Audio',required:true,plannedCount:18,description:'Nguồn xem minh họa có thể nhập URL'},
    'knowledge-index':{label:'Chỉ mục kiến thức',path:'data/knowledge-index.json',group:'Lõi môn học',required:true,plannedCount:260,description:'Chỉ mục tra cứu bài học'},
  },
  integration: { selfContained:true, standaloneMode:true, iframeMode:true, newTabMode:true, liveServerRecommended:true, mainEntry:'subjects/math/index.html', mainEditor:'subjects/math/editor.html', packageProtocol:'MATH_STAGE_FRAME_LAB_V8' },
  getLocalDataPath(name){ return `${this.dataRoot || 'data/'}${name}.json`; },
  getDataSourceMeta(name){ return (this.dataSourceMeta && this.dataSourceMeta[name]) || {label:name,path:`data/${name}.json`,group:'Khác',required:false}; },
  exportSubjectStatus(){ return { subjectId:this.id, version:this.version, packageRoot:this.packageRoot, entry:this.integration?.mainEntry, editor:this.integration?.mainEditor, dataFiles:this.dataFiles, capabilities:['overview','learning','formula','simulation','professor-oral-defense','application','media','mindmap','storage','review','exam','json-import-export','lazy-data'], bridgeProtocol:this.bridge?.protocol, selfContained:true }; },
  bridge: { protocol:'BAUMAN_PLANNING_BRIDGE_V3_ROUTE_CARDS', targetQuestions:100, targetScore:80, completionRule:'answered >= targetQuestions && percent >= targetScore plus repair flow when weak' },
  planningPolicy: { routeCardLimits:{maxLessons:1,maxConcepts:1,maxVocabCards:8,maxDialogues:2,maxWritingTasks:1,quickCheckQuestions:6,orientationQuestions:0,consolidationReviewCards:12,repairErrorGroups:3}, minMinutesByLevel:{foundation:1200,prep:1800,hk1:2400,hk2:2400,hk3:1800,hk4:1600}, maxNewVocabPerDay:8, maxNormalMinutesPerDay:120, maxIntensiveMinutesPerDay:180, reviewGaps:[1,3,7,14], targetQuestions:100, targetScore:80, weakScore:70 },
  skillWeights: {theory:0.22, exercises:0.28, formula:0.16, simulation:0.14, proof:0.08, presentation:0.07, test:0.05},
  estimateLearningDemand(mission){ const requiredMinutes=12000; const recommendedDays=180; return {requiredMinutes,recommendedDays,levels:['vn','prep','hk1','hk2','hk3','hk4'],weights:this.skillWeights,source:'math-roadmap-v8'}; },
  pageSize: { vocab:24, practice:48, dialogue:48, handwriting:48, writing:48, exercises:80 },
  stageAliases: {prepare:'vn',preparatory:'prep',m1:'hk1',m2:'hk2',m3:'hk3',m4:'hk4',vietnam:'vn'},

  defaultState: { stage:'vn', view:'overview', learnTab:'theory', lessonQuery:'', conceptQuery:'', grammarQuery:'', lessonId:null, slide:0, present:false, exerciseLevel:'all', testLevel:'easy', testIndex:0, testAnswer:null, reviewLevel:'easy', reviewIndex:0, reviewPage:0, reviewAnswer:null, reviewProgress:{done:{},flagged:{},wrong:{}}, examLevel:'easy', examCycle:'auto', examIndex:0, examPage:0, examProgress:{answers:{},marked:{},submitted:false,submittedAt:null,result:null,wrong:{}}, examHistory:[], remedialPlan:{active:false,cards:[],completed:{}}, practiceQuery:'', practiceGroup:'all', practiceDifficulty:'all', dialogueQuery:'', dialogueGroup:'all', dialogueDifficulty:'all', dialoguePage:0, handwritingQuery:'', handwritingMode:'symbol', handwritingIndex:0, writingQuery:'', writingMode:'presentation', writingIndex:0, writingDraft:'', mediaCat:'all', mediaQuery:'', mediaId:'', mediaView:'list', vocabQuery:'', vocabPage:0, vocabIndex:0, hostTask:null, testSession:{answered:0,correct:0,targetQuestions:100,targetScore:80,seen:{}} },
  ui: {
    lang:'vi', logo:'∑', title:'Toán Bauman', fullTitle:'Toán cho AI, tín hiệu, điều khiển và luận văn Bauman', subtitle:'Nền tảng → Dự bị → Bauman → НИР/ВКР', coreLabel:'MATH · FINAL E106 STRICT TREE', heroBadge:'Math Bauman · FINAL E106', heroTitle:'Toán Bauman · Final E106 Strict Academic Tree', heroText:'UX/UI lấy trực tiếp từ file Tiếng Nga mới; nội dung là Toán cho AI, xử lý tín hiệu, điều khiển, dữ liệu và nghiên cứu.', assistantToast:'FINAL E106: cây học thuật Lý thuyết khóa bằng ID cứng.', stageLabel:'Giai đoạn', overviewSubtitle:'Tổng quan Toán theo 6 giai đoạn: Việt Nam, dự bị, HK1, HK2, НИР, ВКР.', learningSubtitle:'Học Toán theo nhịp: lý thuyết → bài tập → ứng dụng thực tế/AI → ôn tập → kiểm tra.', academicTitle:'Toán học thuật', academicSubtitle:'Nội dung bám lộ trình AI, tín hiệu, điều khiển và nghiên cứu Bauman.', mediaSubtitle:'Video/mô phỏng dùng để mở trực giác trước khi làm bài.', vocabSubtitle:'Thẻ công thức/ký hiệu: học ít nhưng dùng sâu trong bài tập và vấn đáp.', grammarSubtitle:'Công thức và ký hiệu theo giai đoạn: ý nghĩa, điều kiện áp dụng, ví dụ, lỗi sai.', mindmapSubtitle:'Mind map Toán giúp nối khái niệm, công thức, ứng dụng và lỗi sai.', storageSubtitle:'Data Manager: quản lý JSON môn Toán, preview, thêm/sửa/xuất/nhập rõ ràng.', dialogueSubtitle:'Vấn đáp: câu hỏi lý thuyết thực tế giáo sư có thể hỏi, kèm thuật ngữ Việt - Nga - Anh để quen môi trường Bauman.', writingSubtitle:'Mô phỏng: phòng lab tổng hợp, kiểm công thức, ứng dụng thực tế/code và kết luận AI/Bauman trong một luồng duy nhất.', grammarInlineSubtitle:'Công thức được cấy vào bài học, ví dụ, bài tập và vấn đáp.', handwritingSubtitle:'Ký hiệu và thuật ngữ Việt-Nga-Anh giúp đọc công thức, trả lời vấn đáp và viết báo cáo mô phỏng.', routes:{overview:'Tổng quan',learning:'Học tập',dialogue:'Vấn đáp',writing:'Mô phỏng',media:'Video/Tài nguyên',vocab:'Công thức',grammar:'Công thức sâu',mindmap:'Mind map',storage:'Dữ liệu'}, learningTabs:{theory:'Lý thuyết',exercises:'Bài tập',practice:'Ứng dụng',review:'Ôn tập',exam:'Kiểm tra'}, conceptsTitle:'Công thức theo bài · dùng được ngay', conceptsNote:'Mỗi công thức phải có ý nghĩa, điều kiện áp dụng, ví dụ và lỗi sai.', practiceTitle:'Ứng dụng thực tế · AI/Bauman', practiceDialogueTitle:'Kho case ứng dụng theo bài', vocabLabels:{term:'Công thức/ký hiệu',pron:'Cách đọc',meaning:'Ý nghĩa',example:'Ví dụ',usage:'Ứng dụng'}
  },
  stageLabels: { all:'Tất cả giai đoạn', vn:'GĐ1 · Việt Nam', prep:'GĐ2 · Dự bị', hk1:'Bauman · HK1', hk2:'Bauman · HK2', hk3:'Bauman · НИР', hk4:'Bauman · ВКР' },
  nav: [['overview','🧭','Tổng quan'],['learning','🎓','Học tập'],['dialogue','🎙️','Vấn đáp'],['writing','🔬','Mô phỏng'],['media','🎬','Video/Tài nguyên'],['vocab','🧮','Công thức'],['grammar','∑','Công thức sâu'],['mindmap','🧠','Mind map'],['storage','🗄️','Dữ liệu']],
  learningTabs: [['theory','📘','Lý thuyết'],['exercises','📝','Bài tập'],['practice','🧩','Ứng dụng'],['review','🔁','Ôn tập'],['exam','🧪','Kiểm tra']],
  getStages(db){ return Array.isArray(db.curriculum?.stages) ? db.curriculum.stages : []; },
  getModules(db){ return Array.isArray(db.curriculum?.modules) ? db.curriculum.modules : []; },
  getLessons(db){ return Array.isArray(db.lessons) ? db.lessons.filter(x=>!/thực hành|bài tập|ứng dụng|vấn đáp/i.test([x?.kind,x?.category,x?.mode,x?.title].filter(Boolean).join(' '))) : []; },
  getConcepts(db){ return Array.isArray(db.formulas) ? db.formulas : (Array.isArray(db.grammar) ? db.grammar : []); },
  getVocabulary(db){ return Array.isArray(db.vocab) ? db.vocab : []; },
  getExercises(db){ return Array.isArray(db.exercises) ? db.exercises : []; },
  getTests(db){ return Array.isArray(db.tests?.questions) ? db.tests.questions : (Array.isArray(db.question_bank)?db.question_bank:[]); },
  getTestLevels(db){ return Array.isArray(db.tests?.levels) ? db.tests.levels : []; },
  getPractice(db){ return Array.isArray(db.applications) ? db.applications : (Array.isArray(db['dialogue-bauman-az']) ? db['dialogue-bauman-az'] : []); },
  getDialogues(db){ return Array.isArray(db.speaking) ? db.speaking : []; },
  getBasicDialogues(db){ return Array.isArray(db.speaking) ? db.speaking : []; },
  getBaumanDialogues(db){ return Array.isArray(db.applications) ? db.applications : (Array.isArray(db['dialogue-bauman-az']) ? db['dialogue-bauman-az'] : []); },
  getDeepSpeaking(db){ return Array.isArray(db['deep-speaking-bauman']) ? db['deep-speaking-bauman'] : []; },
  getSpeakingLinkIndex(db){ return db['speaking-link-index'] && typeof db['speaking-link-index']==='object' ? db['speaking-link-index'] : {}; },
  getHandwriting(db){ return Array.isArray(db.handwriting) ? db.handwriting : []; },
  getWriting(db){ return Array.isArray(db.writing) ? db.writing : []; },
  getMedia(db){ return Array.isArray(db.videos) ? db.videos : []; },
  stageOf(item){ const raw=String(item?.stage || '').trim(); return (this.stageAliases && this.stageAliases[raw]) || raw; },
  itemText(item){ return [item?.id,item?.title,item?.summary,item?.rule,item?.focus,item?.prompt,item?.answer,item?.question,item?.purpose,item?.term,item?.front,item?.meaning,Array.isArray(item?.tags)?item.tags.join(' '):'',Array.isArray(item?.turns)?item.turns.map(t=>t.ru||t.vi||t).join(' '):''].filter(Boolean).join(' '); },
  lessonTitle(item){ return item?.title || item?.id || 'Bài học'; },
  lessonSubtitle(item){ return item?.summary || item?.description || ''; },
  conceptTitle(item){ return item?.title || item?.focus || item?.id || 'Công thức'; },
  conceptBody(item){ return item?.rule || item?.formula || item?.meaning || ''; },
  exerciseTitle(item){ return item?.title || item?.taskType || item?.id || 'Bài tập'; },
  exercisePrompt(item){ return item?.prompt || ''; },
  exerciseAnswer(item){ return item?.answer || item?.rubric || ''; },
  exerciseLevel(item){ return item?.level || item?.difficulty || 'all'; },
  testQuestion(item){ return item?.question || item?.prompt || ''; },
  testChoices(item){ return Array.isArray(item?.choices)&&item.choices.length ? item.choices : (Array.isArray(item?.options)?item.options:[]); },
  testAnswerIndex(item){ if(Number.isFinite(Number(item?.answerIndex)))return Number(item.answerIndex); if(Number.isFinite(Number(item?.answer)))return Number(item.answer); const choices=this.testChoices(item).map(x=>String(x??'').trim()); return choices.indexOf(String(item?.answer??'').trim()); },
  testExplanation(item){ return item?.explanation || item?.reasoningExplanation || item?.review || ''; },
  testLevel(item){ const raw=String(item?.difficulty || item?.level || item?.subLevel || 'easy').toLowerCase(); return ({excellent:'expert','xuất sắc':'expert','xuat sac':'expert',gioi:'expert','giỏi':'expert'})[raw] || raw; },
  practiceTitle(item){ return item?.title || item?.purpose || item?.id || 'Ứng dụng'; },
  practiceSubtitle(item){ return item?.purpose || item?.assistantRole || ''; },
  practiceGroup(item){ return item?.group || item?.group_id || item?.type || 'general'; },
  practiceDifficulty(item){ return item?.difficulty_id || item?.difficulty || item?.level || 'all'; },
  dialogueTitle(item){ return item?.title || item?.context_title_vi || item?.id || 'Vấn đáp'; },
  dialogueSubtitle(item){ return item?.purpose || item?.context_title_ru || item?.applicationDomain || ''; },
  dialogueGroup(item){ return item?.group || item?.group_ru || 'general'; },
  dialogueDifficulty(item){ return item?.difficulty_id || item?.difficulty || item?.level || 'all'; },
  dialogueTurns(item){ if(Array.isArray(item?.utterances)&&item.utterances.length)return item.utterances; const turns=Array.isArray(item?.turns)?item.turns:[]; const vi=Array.isArray(item?.vi_turns)?item.vi_turns:[]; const speakers=Array.isArray(item?.speakers)?item.speakers:[]; return turns.map((x,i)=> typeof x==='object'?x:{speaker:speakers[i]||(i%2?'HV':'GV'),ru:String(x||''),vi:vi[i]||String(x||'')}); },
  mediaTitle(item){ return item?.title || item?.id || 'Media'; }, mediaCategory(item){ return item?.category || item?.genre || item?.sourceType || 'general'; }, mediaPurpose(item){ return item?.purpose || item?.sourceStatus || ''; }, mediaUrl(item){ return item?.iframe || item?.url || ''; },
  vocabTerm(item){ return item?.front || item?.term || item?.formula || item?.word || ''; },
  vocabMeaning(item){ return item?.meaning || item?.vi || item?.definition || ''; },
  vocabPron(item){ return item?.pronunciation || item?.pron || item?.reading || ''; },
  vocabExample(item){ return item?.example || item?.usage || this.vocabTerm(item); },
  vocabUsage(item){ return item?.usage || item?.application || ''; },
  vocabSearchText(item){ return [this.vocabTerm(item),this.vocabMeaning(item),this.vocabPron(item),this.vocabExample(item),this.vocabUsage(item),Array.isArray(item?.tags)?item.tags.join(' '):''].filter(Boolean).join(' '); },
  handwritingPrint(item){ return item?.print || item?.text || item?.letter || ''; }, handwritingCursive(item){ return item?.cursive || item?.text || item?.letter || ''; }, handwritingNote(item){ return item?.note || item?.vi || item?.purpose || ''; }, handwritingText(item){ return [item?.print,item?.cursive,item?.text,item?.copy,item?.note,item?.mode,item?.stage].filter(Boolean).join(' '); },
  writingTitle(item){ return item?.title || item?.prompt_vi || item?.id || 'Báo cáo mô phỏng'; }, writingMode(item){ return item?.mode || item?.type || 'simulation-report'; }, writingPurpose(item){ return item?.purpose || item?.prompt_vi || ''; }, writingText(item){ return [item?.id,item?.title,item?.purpose,item?.prompt_vi,item?.model_vi,item?.mode,Array.isArray(item?.required_patterns)?item.required_patterns.join(' '):'',Array.isArray(item?.grammar_focus)?item.grammar_focus.join(' '):''].filter(Boolean).join(' '); },
  speech: { lang:'vi-VN', textForVocab(item){ return window.SUBJECT_ADAPTER.vocabTerm(item); }, textForDialogue(item){ return (Array.isArray(item?.turns)?item.turns.map(t=>t.ru||t.vi||t).join('. '):''); } }
};

/* E71_METADATA_PERFORMANCE_SYNC: synchronized counts + initial/background loading policy. */
(function(){
 const A=window.SUBJECT_ADAPTER; if(!A)return;
 const CFG={"dataFiles": ["curriculum", "content-manifest", "theory-framework", "concept-map", "mindmap", "mastery-map", "lessons", "formulas", "grammar", "grammar-path", "vocab", "exercises", "applications", "simulations", "professor_qa", "speaking", "dialogue-bauman-az", "question_bank", "test_blueprints", "review_packs", "learning_rules", "tests", "content-index", "knowledge-index", "handwriting", "writing", "videos", "deep-speaking-bauman", "speaking-link-index"], "initialDataFiles": ["curriculum", "content-manifest", "theory-framework", "concept-map", "mindmap", "mastery-map", "lessons", "formulas", "grammar", "grammar-path", "vocab", "exercises", "applications", "simulations", "professor_qa", "learning_rules", "content-index", "knowledge-index", "videos", "question_bank", "test_blueprints", "review_packs", "tests"], "backgroundDataFiles": ["speaking", "dialogue-bauman-az", "handwriting", "writing", "deep-speaking-bauman", "speaking-link-index"], "optionalDataFiles": ["speaking", "dialogue-bauman-az", "handwriting", "writing", "deep-speaking-bauman", "speaking-link-index"], "counts": {"curriculum": 9, "content-manifest": 12, "theory-framework": 13, "concept-map": 451, "mindmap": 5, "mastery-map": 260, "lessons": 260, "formulas": 780, "grammar": 48, "grammar-path": 48, "vocab": 852, "exercises": 1040, "applications": 520, "simulations": 260, "professor_qa": 260, "speaking": 260, "dialogue-bauman-az": 520, "question_bank": 1040, "test_blueprints": 32, "review_packs": 260, "learning_rules": 2, "tests": 4, "content-index": 260, "knowledge-index": 260, "handwriting": 32, "writing": 48, "videos": 18, "deep-speaking-bauman": 48, "speaking-link-index": 2}};
 A.version='MathContentSystem FINAL E106 STRICT ACADEMIC TREE FIX 2026-06-22';
 A.dataFiles=CFG.dataFiles;
 A.initialDataFiles=CFG.initialDataFiles;
 A.backgroundDataFiles=CFG.backgroundDataFiles;
 A.optionalDataFiles=Array.from(new Set(CFG.optionalDataFiles));
 A.performancePolicy={strategy:'initial critical load + background lazy load',initialDataFiles:CFG.initialDataFiles.length,backgroundDataFiles:CFG.backgroundDataFiles.length,heavyLazyFiles:CFG.backgroundDataFiles};
 A.dataSourceMeta=A.dataSourceMeta||{};
 Object.keys(CFG.counts).forEach(function(k){
   A.dataSourceMeta[k]=Object.assign({label:k,path:'data/'+k+'.json',group:'Dữ liệu',description:'FINAL synchronized metadata'},A.dataSourceMeta[k]||{},{plannedCount:CFG.counts[k],required:CFG.initialDataFiles.includes(k),lazy:CFG.backgroundDataFiles.includes(k)});
 });
 if(A.dataSourceMeta.simulations)A.dataSourceMeta.simulations.description='Mô phỏng tổng hợp: mỗi bài học có một lab thống nhất, không tách lý thuyết/ứng dụng';
 if(A.ui){A.ui.coreLabel='MATH · FINAL E106 STRICT TREE'; A.ui.heroBadge='Math Bauman · FINAL E106'; A.ui.heroTitle='Toán Bauman · Final E106 Strict Academic Tree'; A.ui.overviewSubtitle='Đã kiểm toàn hệ: lý thuyết, slide chương, mô phỏng, bài tập, ứng dụng, vấn đáp, ôn tập/kiểm tra và Kho môn học.'; A.ui.learningSubtitle='Lý thuyết bám chương/bộ môn, mô phỏng unified khóa theo bài, bài tập/ứng dụng/vấn đáp đã aligned.'; A.ui.assistantToast='FINAL E105: hệ thống đã qua kiểm tra QA, cây học thuật sạch và backend JSON sẵn sàng.';}
})();


/* ===== FINAL E102 · ADAPTER / MANIFEST SMOKE SYNC ===== */
(function(){
  const A=window.SUBJECT_ADAPTER; if(!A)return;
  const counts={curriculum:9,'content-manifest':12,'theory-framework':13,'concept-map':451,mindmap:5,'mastery-map':260,lessons:260,chapter_lectures:32,formulas:780,grammar:48,'grammar-path':48,vocab:852,exercises:1040,applications:520,simulations:260,professor_qa:260,speaking:260,'dialogue-bauman-az':520,question_bank:1040,test_blueprints:32,review_packs:260,learning_rules:2,tests:4,'content-index':260,'knowledge-index':260,handwriting:32,writing:48,videos:18,'deep-speaking-bauman':48,'speaking-link-index':2};
  const ordered=['curriculum','discipline_spine','chapter_spine','content-manifest','theory-framework','concept-map','mindmap','mastery-map','lessons','chapter_lectures','formulas','grammar','grammar-path','vocab','exercises','applications','simulations','professor_qa','speaking','dialogue-bauman-az','question_bank','test_blueprints','review_packs','learning_rules','tests','content-index','knowledge-index','handwriting','writing','videos','deep-speaking-bauman','speaking-link-index'];
  const background=['speaking','dialogue-bauman-az','handwriting','writing','deep-speaking-bauman','speaking-link-index'];
  A.version='MathContentSystem FINAL E106 STRICT ACADEMIC TREE FIX 2026-06-22';
  A.dataFiles=ordered.slice();
  A.initialDataFiles=ordered.filter(x=>!background.includes(x));
  A.backgroundDataFiles=background.slice();
  A.optionalDataFiles=background.slice();
  A.performancePolicy={strategy:'E101 initial critical load + background lazy load',initialDataFiles:A.initialDataFiles.length,backgroundDataFiles:A.backgroundDataFiles.length,heavyLazyFiles:A.backgroundDataFiles};
  A.dataSourceMeta=A.dataSourceMeta||{};
  Object.keys(counts).forEach(function(k){A.dataSourceMeta[k]=Object.assign({label:k,path:'data/'+k+'.json',group:'Dữ liệu',description:'FINAL E102 synchronized metadata'},A.dataSourceMeta[k]||{},{plannedCount:counts[k],required:A.initialDataFiles.includes(k),lazy:background.includes(k)});});
  if(A.dataSourceMeta.question_bank){A.dataSourceMeta.question_bank.plannedCount=1040;A.dataSourceMeta.question_bank.description='1040 câu hỏi: 260 bài × 4 mức, aligned E96.';}
  if(A.dataSourceMeta.tests){A.dataSourceMeta.tests.plannedCount=4;}
  if(A.dataSourceMeta.chapter_lectures){A.dataSourceMeta.chapter_lectures.label='Slide bổ trợ cấp chương';A.dataSourceMeta.chapter_lectures.group='Lõi môn học';A.dataSourceMeta.chapter_lectures.description='32 gói slide cấp chương, 10 slide/chương, linked E99.';}
  if(A.ui){
    A.ui.coreLabel='MATH · FINAL E106 STRICT TREE';
    A.ui.heroBadge='Math Bauman · FINAL E106';
    A.ui.heroTitle='Toán Bauman · Final E106 Strict Academic Tree';
    A.ui.overviewSubtitle='Đã kiểm toàn hệ: lý thuyết, slide chương, mô phỏng, bài tập, ứng dụng, vấn đáp, ôn tập/kiểm tra và Kho môn học.';
    A.ui.learningSubtitle='Lý thuyết bám chương/bộ môn, mô phỏng unified khóa theo bài, bài tập/ứng dụng/vấn đáp đã aligned.';
    A.ui.assistantToast='FINAL E105: hệ thống đã qua kiểm tra QA, cây học thuật sạch và backend JSON sẵn sàng.';
  }
})();
/* ===== END FINAL E102 · ADAPTER / MANIFEST SMOKE SYNC ===== */

/* E103 · ADAPTER LABEL SYNC */
try{if(window.SUBJECT_ADAPTER){SUBJECT_ADAPTER.version='MathContentSystem FINAL E106 STRICT ACADEMIC TREE FIX 2026-06-22'; if(SUBJECT_ADAPTER.ui){SUBJECT_ADAPTER.ui.coreLabel='MATH · FINAL E106 STRICT TREE'; SUBJECT_ADAPTER.ui.heroBadge='Math Bauman · FINAL E106'; SUBJECT_ADAPTER.ui.heroTitle='Toán Bauman · Final E106 Strict Academic Tree'; SUBJECT_ADAPTER.ui.assistantToast='FINAL E105: hệ thống đã qua kiểm tra QA, cây học thuật sạch và backend JSON sẵn sàng.';}}}catch(e){}


/* ===== E105 · SYSTEM QA LABEL SYNC ===== */
try{
  if(window.SUBJECT_ADAPTER){
    SUBJECT_ADAPTER.version='MathContentSystem FINAL E106 STRICT ACADEMIC TREE FIX 2026-06-22';
    SUBJECT_ADAPTER.release='E105_SYSTEM_QA_PATCH';
    SUBJECT_ADAPTER.latestPatch='E105_SYSTEM_QA_PATCH';
    SUBJECT_ADAPTER.lastPatch='E105_SYSTEM_QA_PATCH';
    if(SUBJECT_ADAPTER.ui){
      SUBJECT_ADAPTER.ui.coreLabel='MATH · FINAL E106 STRICT TREE';
      SUBJECT_ADAPTER.ui.heroBadge='Math Bauman · FINAL E106';
      SUBJECT_ADAPTER.ui.heroTitle='Toán Bauman · Final E106 Strict Academic Tree';
      SUBJECT_ADAPTER.ui.overviewSubtitle='Khung e-learning đọc nội dung từ Kho môn học, cây học thuật theo metadata thật, sẵn sàng nạp học liệu JSON.';
      SUBJECT_ADAPTER.ui.learningSubtitle='Học theo cây Khoa → Bộ môn → Chương → Bài, mọi nội dung bám cùng lessonId.';
      SUBJECT_ADAPTER.ui.assistantToast='FINAL E105: đã kiểm hệ thống, sửa thứ tự chương nội bộ và đồng bộ nhãn runtime.';
    }
  }
}catch(e){}
/* ===== END E105 ===== */


/* ===== E107 · FOUNDATION SPINE RESET ADAPTER OVERRIDE ===== */
try{
  if(window.SUBJECT_ADAPTER){
    var A=window.SUBJECT_ADAPTER;
    A.version='MathContentSystem E108 STAGE DISCIPLINE SPINE 2026-06-22';
    A.storageKey='bauman_math_stage_discipline_spine_e108';
    A.release='E108_STAGE_DISCIPLINE_SPINE';
    A.latestPatch='E108_STAGE_DISCIPLINE_SPINE';
    var ordered=['curriculum','discipline_spine','chapter_spine','content-manifest','theory-framework','concept-map','mindmap','mastery-map','lessons','chapter_lectures','formulas','grammar','grammar-path','vocab','exercises','applications','simulations','professor_qa','speaking','dialogue-bauman-az','question_bank','test_blueprints','review_packs','learning_rules','tests','content-index','knowledge-index','handwriting','writing','videos','deep-speaking-bauman','speaking-link-index'];
    A.dataFiles=ordered.slice();
    A.initialDataFiles=ordered.filter(function(x){return ['speaking','dialogue-bauman-az','handwriting','writing','deep-speaking-bauman','speaking-link-index'].indexOf(x)<0;});
    A.backgroundDataFiles=['speaking','dialogue-bauman-az','handwriting','writing','deep-speaking-bauman','speaking-link-index'];
    A.optionalDataFiles=A.backgroundDataFiles.slice();
    A.dataSourceMeta=A.dataSourceMeta||{};
    var counts={discipline_spine:12,chapter_spine:56,lessons:0,formulas:0,exercises:0,applications:0,simulations:0,professor_qa:0,question_bank:0,test_blueprints:0,review_packs:0,chapter_lectures:0,'concept-map':0,mindmap:0,'content-index':0,'knowledge-index':0,'mastery-map':0,vocab:0,grammar:0,'grammar-path':0,tests:0};
    Object.keys(counts).forEach(function(k){A.dataSourceMeta[k]=Object.assign({},A.dataSourceMeta[k]||{},{path:'data/'+k+'.json',plannedCount:counts[k],required:A.initialDataFiles.indexOf(k)>=0,description:(k==='chapter_spine'?'Xương sống 56 chương sạch, chưa có bài active.':'Nguồn đang rỗng có chủ đích, chờ nạp học liệu mới qua Kho môn học.')});});
    A.dataSourceMeta.discipline_spine={label:'12 phân môn lõi',path:'data/discipline_spine.json',group:'Lõi môn học',required:true,plannedCount:12,description:'Khung phân môn: mỗi phân môn có lớp thuần túy và lớp ứng dụng.'};
    A.dataSourceMeta.chapter_spine={label:'Xương sống 56 chương',path:'data/chapter_spine.json',group:'Lõi môn học',required:true,plannedCount:56,description:'40 chương thạc sĩ + 16 chương mở rộng tiến sĩ; chưa chứa bài học.'};
    A.stageLabels=Object.assign({},A.stageLabels||{},{all:'Tất cả',vn:'GĐ0 · Việt Nam',prep:'GĐ1 · Dự bị Nga',hk1:'GĐ2 · ThS năm 1 HK1',hk2:'GĐ3 · ThS năm 1 HK2',hk3:'GĐ4 · ThS năm 2 HK3',hk4:'GĐ5 · VKR',phd_bridge:'GĐ6 · Cầu nối TS',phd_y1:'GĐ7 · TS năm 1',phd_y2:'GĐ8 · TS năm 2',phd_thesis:'GĐ9 · Luận án'});
    if(A.ui){A.ui.coreLabel='MATH · E108 STAGE DISCIPLINE';A.ui.heroBadge='Math Bauman · E108';A.ui.heroTitle='Toán Bauman · Stage Discipline Spine';A.ui.subtitle='Khung sạch: giai đoạn → phân môn → chương';A.ui.overviewSubtitle='Khung nằm trong discipline_spine/chapter_spine; học liệu mới nhập riêng qua Kho môn học.';A.ui.learningSubtitle='Tab Lý thuyết hiển thị Giai đoạn → Phân môn → Chương, mỗi chương có lớp thuần túy và lớp ứng dụng.';A.ui.assistantToast='E108: đã tách khung phân môn khỏi nội dung học liệu.';}
  }
}catch(e){}
/* ===== END E107 ADAPTER OVERRIDE ===== */


/* ===== E109 · THEORY LECTURE FRAME/CONTENT SPLIT ADAPTER ===== */
try{
  if(window.SUBJECT_ADAPTER){
    var A=window.SUBJECT_ADAPTER;
    A.version='MathContentSystem E109 THEORY SPLIT SCHEDULE FOCUS 2026-06-22';
    A.storageKey='bauman_math_e109_theory_split_schedule_focus';
    A.release='E112_CONTENT_VAULT_CLEAN_ARCHITECTURE';
    A.latestPatch='E112_CONTENT_VAULT_CLEAN_ARCHITECTURE';
    var ordered=['curriculum','discipline_spine','chapter_spine','theory_lecture_frame','theory_lecture_content','content-manifest','theory-framework','concept-map','mindmap','mastery-map','lessons','chapter_lectures','formulas','grammar','grammar-path','vocab','exercises','applications','simulations','professor_qa','speaking','dialogue-bauman-az','question_bank','test_blueprints','review_packs','learning_rules','tests','content-index','knowledge-index','handwriting','writing','videos','deep-speaking-bauman','speaking-link-index'];
    A.dataFiles=ordered.slice();
    A.initialDataFiles=ordered.filter(function(x){return ['speaking','dialogue-bauman-az','handwriting','writing','deep-speaking-bauman','speaking-link-index'].indexOf(x)<0;});
    A.backgroundDataFiles=['speaking','dialogue-bauman-az','handwriting','writing','deep-speaking-bauman','speaking-link-index'];
    A.optionalDataFiles=A.backgroundDataFiles.slice();
    A.dataSourceMeta=A.dataSourceMeta||{};
    A.dataSourceMeta.theory_lecture_frame={label:'Bài giảng lý thuyết · Khung',path:'data/theory_lecture_frame.json',group:'Bài giảng lý thuyết',required:true,plannedCount:56,description:'Khung giai đoạn → phân môn → chương. Không chứa slide nội dung.'};
    A.dataSourceMeta.theory_lecture_content={label:'Bài giảng lý thuyết · Nội dung',path:'data/theory_lecture_content.json',group:'Bài giảng lý thuyết',required:true,plannedCount:0,description:'Nội dung bài giảng/slide theo lessonId và chapterId. Import sau khi audit.'};
    if(A.dataSourceMeta.lessons){A.dataSourceMeta.lessons.label='Bài giảng cũ / tương thích';A.dataSourceMeta.lessons.description='Nguồn tương thích cũ. E109 ưu tiên theory_lecture_frame + theory_lecture_content.';}
    if(A.ui){A.ui.coreLabel='MATH · E109 THEORY SPLIT';A.ui.heroBadge='Math Bauman · E109';A.ui.heroTitle='Toán Bauman · Theory Frame/Content Split';A.ui.subtitle='Bài giảng lý thuyết tách khung và nội dung';A.ui.overviewSubtitle='Khung lý thuyết nằm trong theory_lecture_frame.json; nội dung bài giảng nằm trong theory_lecture_content.json; nhập qua Kho môn học.';A.ui.learningSubtitle='Tab Lý thuyết đọc khung và nội dung riêng, dễ đổi khung mà không phá học liệu.';A.ui.assistantToast='E109: đã tách Bài giảng lý thuyết thành 2 nguồn và làm nổi Lịch trình hôm nay.';}
  }
}catch(e){}
/* ===== END E109 ADAPTER ===== */


/* ===== E112 · CONTENT VAULT CLEAN ARCHITECTURE ADAPTER OVERRIDE ===== */
try{
  if(window.SUBJECT_ADAPTER){
    var A=window.SUBJECT_ADAPTER;
    var ordered=["content_vault_manifest", "discipline_spine", "chapter_spine", "curriculum", "content-manifest", "theory_lecture_frame", "formula_frame", "simulation_frame", "exercise_frame", "application_frame", "professor_qa_frame", "review_pack_frame", "question_bank_frame", "test_blueprint_frame", "chapter_lecture_frame", "mindmap_frame", "concept_map_frame", "media_frame", "theory_lecture_content", "formula_content", "simulation_content", "exercise_content", "application_content", "professor_qa_content", "review_pack_content", "question_bank_content", "test_blueprint_content", "chapter_lecture_content", "mindmap_content", "concept_map_content", "media_content", "lessons", "formulas", "simulations", "exercises", "applications", "professor_qa", "review_packs", "question_bank", "test_blueprints", "chapter_lectures", "mindmap", "concept-map", "videos", "learning_rules", "tests", "content-index", "knowledge-index", "mastery-map", "vocab", "grammar", "grammar-path", "writing", "handwriting", "speaking", "deep-speaking-bauman", "speaking-link-index", "dialogue-bauman-az"];
    var initial=["content_vault_manifest", "discipline_spine", "chapter_spine", "curriculum", "content-manifest", "theory_lecture_frame", "formula_frame", "simulation_frame", "exercise_frame", "application_frame", "professor_qa_frame", "review_pack_frame", "question_bank_frame", "test_blueprint_frame", "chapter_lecture_frame", "mindmap_frame", "concept_map_frame", "media_frame", "theory_lecture_content", "formula_content", "simulation_content", "exercise_content", "application_content", "professor_qa_content", "review_pack_content", "question_bank_content", "test_blueprint_content", "chapter_lecture_content", "mindmap_content", "concept_map_content", "media_content", "lessons", "formulas", "simulations", "exercises", "applications", "professor_qa", "review_packs", "question_bank", "test_blueprints", "chapter_lectures", "mindmap", "concept-map", "videos", "learning_rules", "tests", "content-index", "knowledge-index", "mastery-map", "vocab", "grammar", "grammar-path"];
    var background=["speaking", "dialogue-bauman-az", "handwriting", "writing", "deep-speaking-bauman", "speaking-link-index"];
    var counts={"content_vault_manifest": 13, "discipline_spine": 12, "chapter_spine": 56, "curriculum": 0, "content-manifest": 16, "theory_lecture_frame": 56, "formula_frame": 56, "simulation_frame": 56, "exercise_frame": 56, "application_frame": 56, "professor_qa_frame": 56, "review_pack_frame": 56, "question_bank_frame": 56, "test_blueprint_frame": 56, "chapter_lecture_frame": 56, "mindmap_frame": 56, "concept_map_frame": 56, "media_frame": 56, "theory_lecture_content": 0, "formula_content": 0, "simulation_content": 0, "exercise_content": 0, "application_content": 0, "professor_qa_content": 0, "review_pack_content": 0, "question_bank_content": 0, "test_blueprint_content": 0, "chapter_lecture_content": 0, "mindmap_content": 0, "concept_map_content": 0, "media_content": 0, "lessons": 0, "formulas": 0, "simulations": 0, "exercises": 0, "applications": 0, "professor_qa": 0, "review_packs": 0, "question_bank": 0, "test_blueprints": 0, "chapter_lectures": 0, "mindmap": 0, "concept-map": 0, "videos": 0, "learning_rules": 0, "tests": 0, "content-index": 0, "knowledge-index": 0, "mastery-map": 0, "vocab": 0, "grammar": 0, "grammar-path": 0, "writing": 0, "handwriting": 0, "speaking": 0, "deep-speaking-bauman": 0, "speaking-link-index": 0, "dialogue-bauman-az": 0};
    var meta={"content_vault_manifest": {"label": "Manifest Kho môn học", "path": "data/content_vault_manifest.json", "group": "Khung hệ thống", "required": true, "plannedCount": 13, "description": "Bản điều khiển các cặp frame/content"}, "discipline_spine": {"label": "12 phân môn lõi", "path": "data/discipline_spine.json", "group": "Khung hệ thống", "required": true, "plannedCount": 12, "description": "Phân môn có lớp thuần túy và ứng dụng"}, "chapter_spine": {"label": "Xương sống 56 chương", "path": "data/chapter_spine.json", "group": "Khung hệ thống", "required": true, "plannedCount": 56, "description": "40 chương thạc sĩ + 16 chương mở rộng tiến sĩ"}, "content-manifest": {"label": "Manifest nguồn dữ liệu", "path": "data/content-manifest.json", "group": "Khung hệ thống", "required": true, "plannedCount": 16, "description": "Danh mục nguồn dữ liệu và plannedCount"}, "theory_lecture_frame": {"label": "Bài giảng lý thuyết · Khung", "path": "data/theory_lecture_frame.json", "group": "Bài giảng lý thuyết", "required": true, "plannedCount": 56, "description": "Khung/phân loại/luật tìm kiếm-thay thế cho Bài giảng lý thuyết"}, "theory_lecture_content": {"label": "Bài giảng lý thuyết · Nội dung", "path": "data/theory_lecture_content.json", "group": "Bài giảng lý thuyết", "required": true, "plannedCount": 0, "description": "Records nội dung import/export cho Bài giảng lý thuyết"}, "formula_frame": {"label": "Công thức · Khung", "path": "data/formula_frame.json", "group": "Công thức", "required": true, "plannedCount": 56, "description": "Khung/phân loại/luật tìm kiếm-thay thế cho Công thức"}, "formula_content": {"label": "Công thức · Nội dung", "path": "data/formula_content.json", "group": "Công thức", "required": true, "plannedCount": 0, "description": "Records nội dung import/export cho Công thức"}, "simulation_frame": {"label": "Mô phỏng · Khung", "path": "data/simulation_frame.json", "group": "Mô phỏng", "required": true, "plannedCount": 56, "description": "Khung/phân loại/luật tìm kiếm-thay thế cho Mô phỏng"}, "simulation_content": {"label": "Mô phỏng · Nội dung", "path": "data/simulation_content.json", "group": "Mô phỏng", "required": true, "plannedCount": 0, "description": "Records nội dung import/export cho Mô phỏng"}, "exercise_frame": {"label": "Bài tập · Khung", "path": "data/exercise_frame.json", "group": "Bài tập", "required": true, "plannedCount": 56, "description": "Khung/phân loại/luật tìm kiếm-thay thế cho Bài tập"}, "exercise_content": {"label": "Bài tập · Nội dung", "path": "data/exercise_content.json", "group": "Bài tập", "required": true, "plannedCount": 0, "description": "Records nội dung import/export cho Bài tập"}, "application_frame": {"label": "Ứng dụng · Khung", "path": "data/application_frame.json", "group": "Ứng dụng", "required": true, "plannedCount": 56, "description": "Khung/phân loại/luật tìm kiếm-thay thế cho Ứng dụng"}, "application_content": {"label": "Ứng dụng · Nội dung", "path": "data/application_content.json", "group": "Ứng dụng", "required": true, "plannedCount": 0, "description": "Records nội dung import/export cho Ứng dụng"}, "professor_qa_frame": {"label": "Vấn đáp · Khung", "path": "data/professor_qa_frame.json", "group": "Vấn đáp", "required": true, "plannedCount": 56, "description": "Khung/phân loại/luật tìm kiếm-thay thế cho Vấn đáp"}, "professor_qa_content": {"label": "Vấn đáp · Nội dung", "path": "data/professor_qa_content.json", "group": "Vấn đáp", "required": true, "plannedCount": 0, "description": "Records nội dung import/export cho Vấn đáp"}, "review_pack_frame": {"label": "Ôn tập · Khung", "path": "data/review_pack_frame.json", "group": "Ôn tập", "required": true, "plannedCount": 56, "description": "Khung/phân loại/luật tìm kiếm-thay thế cho Ôn tập"}, "review_pack_content": {"label": "Ôn tập · Nội dung", "path": "data/review_pack_content.json", "group": "Ôn tập", "required": true, "plannedCount": 0, "description": "Records nội dung import/export cho Ôn tập"}, "question_bank_frame": {"label": "Ngân hàng câu hỏi · Khung", "path": "data/question_bank_frame.json", "group": "Ngân hàng câu hỏi", "required": true, "plannedCount": 56, "description": "Khung/phân loại/luật tìm kiếm-thay thế cho Ngân hàng câu hỏi"}, "question_bank_content": {"label": "Ngân hàng câu hỏi · Nội dung", "path": "data/question_bank_content.json", "group": "Ngân hàng câu hỏi", "required": true, "plannedCount": 0, "description": "Records nội dung import/export cho Ngân hàng câu hỏi"}, "test_blueprint_frame": {"label": "Blueprint kiểm tra · Khung", "path": "data/test_blueprint_frame.json", "group": "Blueprint kiểm tra", "required": true, "plannedCount": 56, "description": "Khung/phân loại/luật tìm kiếm-thay thế cho Blueprint kiểm tra"}, "test_blueprint_content": {"label": "Blueprint kiểm tra · Nội dung", "path": "data/test_blueprint_content.json", "group": "Blueprint kiểm tra", "required": true, "plannedCount": 0, "description": "Records nội dung import/export cho Blueprint kiểm tra"}, "chapter_lecture_frame": {"label": "Slide bổ trợ cấp chương · Khung", "path": "data/chapter_lecture_frame.json", "group": "Slide bổ trợ cấp chương", "required": true, "plannedCount": 56, "description": "Khung/phân loại/luật tìm kiếm-thay thế cho Slide bổ trợ cấp chương"}, "chapter_lecture_content": {"label": "Slide bổ trợ cấp chương · Nội dung", "path": "data/chapter_lecture_content.json", "group": "Slide bổ trợ cấp chương", "required": true, "plannedCount": 0, "description": "Records nội dung import/export cho Slide bổ trợ cấp chương"}, "mindmap_frame": {"label": "Mind map · Khung", "path": "data/mindmap_frame.json", "group": "Mind map", "required": true, "plannedCount": 56, "description": "Khung/phân loại/luật tìm kiếm-thay thế cho Mind map"}, "mindmap_content": {"label": "Mind map · Nội dung", "path": "data/mindmap_content.json", "group": "Mind map", "required": true, "plannedCount": 0, "description": "Records nội dung import/export cho Mind map"}, "concept_map_frame": {"label": "Concept map · Khung", "path": "data/concept_map_frame.json", "group": "Concept map", "required": true, "plannedCount": 56, "description": "Khung/phân loại/luật tìm kiếm-thay thế cho Concept map"}, "concept_map_content": {"label": "Concept map · Nội dung", "path": "data/concept_map_content.json", "group": "Concept map", "required": true, "plannedCount": 0, "description": "Records nội dung import/export cho Concept map"}, "media_frame": {"label": "Media / Canva · Khung", "path": "data/media_frame.json", "group": "Media / Canva", "required": true, "plannedCount": 56, "description": "Khung/phân loại/luật tìm kiếm-thay thế cho Media / Canva"}, "media_content": {"label": "Media / Canva · Nội dung", "path": "data/media_content.json", "group": "Media / Canva", "required": true, "plannedCount": 0, "description": "Records nội dung import/export cho Media / Canva"}};
    A.version='MathContentSystem E112 CONTENT VAULT CLEAN ARCHITECTURE 2026-06-22';
    A.storageKey='bauman_math_e112_content_vault_clean_architecture';
    A.release='E112_CONTENT_VAULT_CLEAN_ARCHITECTURE';
    A.latestPatch='E112_CONTENT_VAULT_CLEAN_ARCHITECTURE';
    A.coreVersion='E112_CONTENT_VAULT_CLEAN_ARCHITECTURE';
    A.dataFiles=ordered.slice();
    A.initialDataFiles=initial.slice();
    A.backgroundDataFiles=background.slice();
    A.optionalDataFiles=background.slice();
    A.performancePolicy={strategy:'E112 critical frame/content load + lazy heavy sources',initialDataFiles:A.initialDataFiles.length,backgroundDataFiles:A.backgroundDataFiles.length,heavyLazyFiles:A.backgroundDataFiles};
    A.dataSourceMeta=A.dataSourceMeta||{};
    Object.keys(meta).forEach(function(k){A.dataSourceMeta[k]=Object.assign({},A.dataSourceMeta[k]||{},meta[k]);});
    Object.keys(counts).forEach(function(k){A.dataSourceMeta[k]=Object.assign({path:'data/'+k+'.json'},A.dataSourceMeta[k]||{},{plannedCount:counts[k],required:A.initialDataFiles.indexOf(k)>=0,lazy:A.backgroundDataFiles.indexOf(k)>=0});});
    if(A.ui){
      A.ui.coreLabel='MATH · E112 Clean Vault';
      A.ui.heroBadge='Math Bauman · E112';
      A.ui.heroTitle='Toán Bauman · Content Vault Clean Architecture';
      A.ui.subtitle='Khung e-learning sạch: mọi nguồn chính tách Khung/Nội dung';
      A.ui.overviewSubtitle='Bắt đầu từ Lịch trình hôm nay. Kho môn học mở trực tiếp từng cặp Khung/Nội dung.';
      A.ui.storageSubtitle='Kho môn học E112: không chồng giao diện cũ, mỗi nguồn có Khung/Nội dung/Import/Export riêng.';
      A.ui.assistantToast='E112: Kho môn học đã được dọn lại thành Content Vault sạch.';
    }
  }
}catch(e){}
/* ===== END E112 ADAPTER ===== */


/* ===== E114 · ADAPTER SYNC · Specialized Data Vault Router ===== */
(function(){
  try{
    var A=window.SUBJECT_ADAPTER; if(!A)return;
    A.version='MathContentSystem E114 SPECIALIZED DATA VAULT ROUTER 2026-06-22';
    A.storageKey='bauman_math_e114_specialized_data_vault_router';
    A.release='E114_SPECIALIZED_DATA_VAULT_ROUTER';
    A.latestPatch='E114_SPECIALIZED_DATA_VAULT_ROUTER';
    A.coreVersion='E114_SPECIALIZED_DATA_VAULT_ROUTER';
    if(A.ui){
      A.ui.coreLabel='MATH · E114 Data Vault';
      A.ui.heroBadge='Math Bauman · E114';
      A.ui.heroTitle='Toán Bauman · Kho môn học chuyên biệt';
      A.ui.storageSubtitle='Kho môn học: Học tập → Lý thuyết/Bài tập/Ứng dụng/Ôn tập/Kiểm tra → Khung môn học/Dữ liệu môn học.';
      A.ui.overviewSubtitle='Lộ trình Bauman chính từ tháng 8/2026 đến VKR; tiến sĩ chỉ là khung khóa mở rộng.';
    }
    A.dataSourceMeta=A.dataSourceMeta||{};
    var pairs={
      theory_lecture_frame:['Bài giảng lý thuyết · Khung','Học tập/Lý thuyết'],theory_lecture_content:['Bài giảng lý thuyết · Dữ liệu','Học tập/Lý thuyết'],
      exercise_frame:['Bài tập · Khung','Học tập/Bài tập'],exercise_content:['Bài tập · Dữ liệu','Học tập/Bài tập'],
      application_frame:['Ứng dụng · Khung','Học tập/Ứng dụng'],application_content:['Ứng dụng · Dữ liệu','Học tập/Ứng dụng'],
      review_pack_frame:['Ôn tập · Khung','Học tập/Ôn tập'],review_pack_content:['Ôn tập · Dữ liệu','Học tập/Ôn tập'],
      question_bank_frame:['Kiểm tra · Khung câu hỏi','Học tập/Kiểm tra'],question_bank_content:['Kiểm tra · Dữ liệu câu hỏi','Học tập/Kiểm tra'],
      test_blueprint_frame:['Blueprint kiểm tra · Khung','Học tập/Blueprint'],test_blueprint_content:['Blueprint kiểm tra · Dữ liệu','Học tập/Blueprint']
    };
    Object.keys(pairs).forEach(function(k){A.dataSourceMeta[k]=Object.assign({},A.dataSourceMeta[k]||{path:'data/'+k+'.json'}, {label:pairs[k][0], group:pairs[k][1], e114SpecializedSlot:true});});
  }catch(e){}
})();
/* ===== END E114 ADAPTER SYNC ===== */


/* E126_THEORY_VISUAL_INTEGRATED_SYNC */
(function(){
  var A=window.SUBJECT_ADAPTER; if(!A)return;
  A.version='MathContentSystem E126 THEORY VISUAL INTEGRATED 2026-06-26';
  A.ui=A.ui||{};
  A.ui.coreLabel='MATH · E126 Theory Visual Integrated';
  A.ui.learningSubtitle='Tab Lý thuyết đọc data/lessons.json E124/E125 qua visual skin E126.';
  A.dataSourceMeta=A.dataSourceMeta||{};
  A.dataSourceMeta.lessons=Object.assign({},A.dataSourceMeta.lessons||{}, {plannedCount:347, required:true, label:'Bài giảng lý thuyết E126', description:'347 bài lý thuyết sâu, 5.552 slide, tích hợp visual skin E126.'});
  A.getLessons=function(db){
    var raw=db&&db.lessons;
    var xs=Array.isArray(raw)?raw:(raw&&Array.isArray(raw.lessons)?raw.lessons:[]);
    return xs.filter(function(x){return x && (x.kind==='theory' || x.contentRole==='theory_only' || !/thực hành|bài tập|ứng dụng/i.test([x.kind,x.category,x.mode,x.title].filter(Boolean).join(' ')));});
  };
})();
