'use strict';
(function(){
  const VERSION = 'PlanningBridge V11 RouteBoundExam';
  const LEVEL_ORDER = ['zero','A0','A1','A2','B1','B2','C1','C2'];
  const DEFAULT_TEST_POLICY = {
    noOfficialTestBeforeSessions: 3,
    firstCheckType: 'orientation_check',
    unlockEasy: { minSessions: 3, minStudyMinutes: 80, minLearnedItems: 40, minDialogues: 3 },
    unlockMedium: { requirePreviousEasyScore: 75, minSessions: 6 },
    unlockHard: { requirePreviousMediumScore: 75, minSessions: 10 },
    unlockExpert: { requirePreviousHardScore: 75, minSessions: 16, mode: 'integrated_skills' },
    repairAfterAssessment: { alwaysShow: true, maxErrorGroups: 3, requireRewriteOrRetry: true, minRepairMinutes: 20 },
    weekendDecision: { mainSendsOnlyWeekEndSignal: true, subjectDecidesTestOrReview: true }
  };
  const DEFAULT_ROUTE_LIMITS = {
    maxLessons: 2,
    maxConcepts: 2,
    maxVocabCards: 35,
    maxDialogues: 2,
    maxWritingTasks: 1,
    quickCheckQuestions: 10,
    orientationQuestions: 0,
    consolidationReviewCards: 25,
    repairErrorGroups: 3
  };
  const DEFAULT_POLICY = {
    minMinutesByLevel: { A0: 600, A1: 1500, A2: 2400, B1: 3600, B2: 4800, C1: 7200 },
    minDaysByLevel: { A0: 7, A1: 18, A2: 30, B1: 50, B2: 75, C1: 110 },
    maxNewVocabPerDay: 40,
    maxNewConceptsPerDay: 3,
    maxIntensiveMinutesPerDay: 180,
    maxNormalMinutesPerDay: 120,
    minSessionMinutes: 35,
    reviewGaps: [1,3,7,14],
    targetQuestions: 100,
    targetScore: 80,
    weakScore: 70,
    overloadMinutesPerDay: 180,
    minimumReviewRatio: 0.25,
    testPolicy: DEFAULT_TEST_POLICY,
    routeCardLimits: DEFAULT_ROUTE_LIMITS,
    planningVersion: VERSION
  };
  const SKILL_WEIGHTS = {
    language: {listening:0.32, speaking:0.30, video:0.18, formula:0.10, symbolic:0.04, reading:0.02, writing:0.03, test:0.01},
    academic: {theory:0.25, practice:0.25, exercises:0.18, review:0.17, test:0.15},
    technical: {theory:0.22, practice:0.30, exercises:0.20, review:0.13, test:0.15}
  };
  const clone = x => { try{return JSON.parse(JSON.stringify(x));}catch(_){return x;} };
  const arr = v => Array.isArray(v) ? v : [];
  const clean = v => String(v ?? '').trim();
  const nowIso = () => new Date().toISOString();
  const isoDate = d => {
    const z = new Date(d);
    if(Number.isNaN(z.getTime())) return '';
    return z.toISOString().slice(0,10);
  };
  const addDays = (date, days) => {
    const d = new Date(date || Date.now());
    d.setDate(d.getDate() + Number(days || 0));
    return isoDate(d);
  };
  const deepMerge = (...items) => {
    const out = {};
    for(const item of items){
      if(!item || typeof item !== 'object') continue;
      for(const [k,v] of Object.entries(item)){
        if(v && typeof v === 'object' && !Array.isArray(v)) out[k] = deepMerge(out[k] || {}, v);
        else out[k] = clone(v);
      }
    }
    return out;
  };
  function levelIndex(level){ const i=LEVEL_ORDER.indexOf(clean(level)); return i>=0?i:LEVEL_ORDER.indexOf('A0'); }
  function parseLevels(raw){
    const text = clean(raw?.target || raw?.learningItem || raw?.requiredOutput?.level || raw?.goal || raw?.title || '').toUpperCase();
    const explicitStart = clean(raw?.startLevel || raw?.fromLevel || raw?.currentLevel);
    const explicitTarget = clean(raw?.targetLevel || raw?.toLevel || raw?.level);
    const found = text.match(/A0|A1|A2|B1|B2|C1|C2/g) || [];
    let startLevel = explicitStart || (found.length>=2 ? found[0] : (found[0] || 'A0'));
    let targetLevel = explicitTarget || (found.length>=2 ? found[found.length-1] : (found[0] || 'A1'));
    if(levelIndex(startLevel)>levelIndex(targetLevel)) [startLevel,targetLevel] = [targetLevel,startLevel];
    return {startLevel,targetLevel};
  }
  function inferSubjectType(raw, adapter){
    const text = [raw?.courseId, raw?.subjectId, raw?.courseName, raw?.target, raw?.learningItem, adapter?.id, adapter?.ui?.title].map(clean).join(' ').toLowerCase();
    if(/russian|tiếng nga|ngoại ngữ|language|speaking|listening|dialog/i.test(text)) return 'language';
    if(/math|toán|python|machine|ai|lập trình|technical|lab/i.test(text)) return 'technical';
    return 'academic';
  }
  function normalizeSessions(raw){
    const direct = arr(raw?.sessions).map((s,i)=>({
      id: clean(s.id) || `session_${i+1}`,
      date: isoDate(s.date || s.day || raw?.date) || addDays(raw?.startDate || Date.now(), i),
      minutes: Math.max(0, Number(s.minutes || s.durationMinutes || raw?.durationMinutes || 0)),
      timeBlock: clean(s.timeBlock || s.slot || s.slotLabel || ''),
      isWeekEndSignal: Boolean(s.isWeekEndSignal || s.isWeekEnd || s.isLastDayOfWeek || s.weekEndSignal || s.endOfWeek || s.weeklyCheckpoint),
      source: s.source || 'main'
    })).filter(s=>s.minutes>0);
    if(direct.length) return direct;
    const durationDays = Math.max(1, Number(raw?.durationDays || raw?.days || 0));
    const minutes = Math.max(0, Number(raw?.durationMinutes || raw?.minutesPerDay || raw?.dailyMinutes || 90));
    const start = raw?.startDate || raw?.date || Date.now();
    return Array.from({length:durationDays},(_,i)=>({id:`auto_${i+1}`, date:addDays(start,i), minutes, timeBlock:clean(raw?.timeBlock || raw?.slotLabel || 'auto'), isWeekEndSignal:false, source:'derived'}));
  }
  function normalizeMission(raw={}, ctx={}){
    const adapter = ctx.adapter || {};
    const sessions = normalizeSessions(raw);
    const {startLevel,targetLevel} = parseLevels(raw);
    const startDate = isoDate(raw.startDate || raw.date || sessions[0]?.date || Date.now());
    const deadline = isoDate(raw.deadline || raw.plannedEndDate || raw.endDate || sessions[sessions.length-1]?.date || addDays(startDate, Math.max(0,sessions.length-1)));
    const durationDays = Math.max(1, Number(raw.durationDays || Math.ceil((new Date(deadline)-new Date(startDate))/86400000)+1 || sessions.length || 1));
    const subjectType = clean(raw.subjectType) || inferSubjectType(raw, adapter);
    const policy = deepMerge(DEFAULT_POLICY, adapter.planningPolicy || {}, raw.policy || {});
    policy.minMinutesByLevel = Object.assign({}, DEFAULT_POLICY.minMinutesByLevel, adapter.planningPolicy?.minMinutesByLevel || {}, raw.policy?.minMinutesByLevel || {});
    policy.minDaysByLevel = Object.assign({}, DEFAULT_POLICY.minDaysByLevel, adapter.planningPolicy?.minDaysByLevel || {}, raw.policy?.minDaysByLevel || {});
    policy.reviewGaps = arr(raw.policy?.reviewGaps).length ? raw.policy.reviewGaps : (arr(adapter.planningPolicy?.reviewGaps).length ? adapter.planningPolicy.reviewGaps : DEFAULT_POLICY.reviewGaps);
    return {
      id: clean(raw.missionId || raw.taskId || raw.id) || `mission_${Date.now()}`,
      taskId: clean(raw.taskId || raw.id || ''),
      courseId: clean(raw.courseId || raw.subjectId || adapter.id || 'subject'),
      courseName: clean(raw.courseName || raw.subjectName || adapter.ui?.title || 'Môn học'),
      target: clean(raw.target || raw.learningItem || raw.goal || 'Mục tiêu học tập'),
      learningItem: clean(raw.learningItem || raw.target || raw.goal || ''),
      goalType: clean(raw.goalType || 'level_completion'),
      startLevel, targetLevel, subjectType,
      startDate, deadline, durationDays, sessions,
      requiredOutput: Object.assign({}, raw.requiredOutput || {}),
      targetQuestions: Math.max(1, Number(raw.targetQuestions || raw.requiredOutput?.testQuestions || policy.targetQuestions || 100)),
      targetScore: Math.max(1, Number(raw.targetScore || raw.requiredOutput?.targetScore || policy.targetScore || 80)),
      antiCramming: raw.antiCramming !== false,
      preferredView: clean(raw.preferredView || ''),
      previousAssessments: arr(raw.previousAssessments || raw.assessments || raw.testHistory || raw.progress?.assessments),
      learnedStats: Object.assign({studyMinutes:0, learnedItems:0, dialogues:0}, raw.learnedStats || raw.progress?.learnedStats || {}),
      raw: clone(raw), policy
    };
  }
  function estimateDemand(mission, ctx={}){
    const adapter = ctx.adapter || {};
    const custom = typeof adapter.estimateLearningDemand === 'function' ? adapter.estimateLearningDemand(mission, ctx) : null;
    if(custom) return Object.assign({source:'adapter'}, custom);
    const from = levelIndex(mission.startLevel), to = levelIndex(mission.targetLevel);
    const levels = LEVEL_ORDER.slice(Math.max(1, from+1), Math.max(from+2,to+1)).filter(x=>mission.policy.minMinutesByLevel[x]);
    const targetLevels = levels.length ? levels : [mission.targetLevel].filter(x=>mission.policy.minMinutesByLevel[x]);
    const requiredMinutes = targetLevels.reduce((sum,l)=>sum + Number(mission.policy.minMinutesByLevel[l] || 0), 0) || 900;
    const recommendedDays = Math.max(...targetLevels.map(l=>Number(mission.policy.minDaysByLevel[l] || 1)), Math.ceil(requiredMinutes / Math.max(60, mission.policy.maxNormalMinutesPerDay || 120)));
    const weights = adapter.skillWeights || SKILL_WEIGHTS[mission.subjectType] || SKILL_WEIGHTS.academic;
    return {requiredMinutes, recommendedDays, levels:targetLevels, weights, source:'core-default'};
  }
  function availableMinutes(mission){ return arr(mission.sessions).reduce((sum,s)=>sum+Number(s.minutes||0),0); }
  function uniqueDays(mission){ return Array.from(new Set(arr(mission.sessions).map(s=>s.date).filter(Boolean))).length || mission.durationDays || 1; }
  function analyzeFeasibility(mission, ctx={}){
    const demand = estimateDemand(mission, ctx);
    const minutes = availableMinutes(mission);
    const days = uniqueDays(mission);
    const avg = minutes / Math.max(1, days);
    const warnings = [];
    if(minutes < demand.requiredMinutes) warnings.push({code:'insufficient_minutes', severity:'high', message:`Thiếu ${Math.max(0,demand.requiredMinutes-minutes)} phút so với khuyến nghị.`});
    if(days < demand.recommendedDays) warnings.push({code:'insufficient_days', severity:'high', message:`Thiếu ngày học giãn cách. Khuyến nghị tối thiểu ${demand.recommendedDays} ngày.`});
    if(avg > mission.policy.overloadMinutesPerDay) warnings.push({code:'overload_daily_minutes', severity:'medium', message:`Trung bình ${Math.round(avg)} phút/ngày, dễ nhồi nhét và quên nhanh.`});
    if(days < Math.max(4, arr(mission.policy.reviewGaps).length + 1)) warnings.push({code:'insufficient_review_spacing', severity:'medium', message:'Không đủ khoảng cách để ôn gián đoạn 1-3-7-14 ngày.'});
    const feasible = !warnings.some(w=>w.severity==='high');
    const riskLevel = warnings.some(w=>w.severity==='high') ? 'high' : (warnings.length ? 'medium' : 'low');
    return {
      feasible, riskLevel, demand, availableMinutes:minutes, availableDays:days,
      averageMinutesPerDay: Math.round(avg), warnings,
      minimumRecommendedMinutes:demand.requiredMinutes,
      minimumRecommendedDays:demand.recommendedDays,
      generatedAt: nowIso()
    };
  }
  function phaseName(index, total, mission, sessionKind='study'){
    if(sessionKind==='orientation') return `Làm quen ${mission.startLevel || 'A0'} an toàn`;
    if(sessionKind==='foundation') return 'Tạo nền trước khi kiểm tra';
    if(sessionKind==='review_consolidation') return 'Ôn củng cố, chưa ép kiểm tra';
    if(sessionKind==='assessment') return 'Kiểm tra khi đủ điều kiện';
    const p = index / Math.max(1,total-1);
    if(p < 0.18) return `Nền ${mission.startLevel} → ${mission.targetLevel}`;
    if(p < 0.48) return 'Học mới có kiểm soát';
    if(p < 0.72) return 'Vận dụng tình huống thực tế';
    if(p < 0.92) return 'Ôn gián đoạn và sửa lỗi';
    return 'Chốt đầu ra theo năng lực';
  }
  function skillForSession(i, total, mission, demand, sessionKind='study'){
    if(sessionKind==='orientation') return 'orientation';
    if(sessionKind==='assessment') return 'test';
    if(sessionKind==='review_consolidation') return 'review';
    const keys = Object.keys(demand.weights || {});
    if(!keys.length) return 'study';
    const cycle = keys.filter(k=>k!=='test');
    return cycle[i % cycle.length] || keys[0];
  }
  function assessmentScore(mission, level){
    const hit = arr(mission.previousAssessments).find(a => String(a.level||a.difficulty||a.type||'').toLowerCase() === level);
    return Number(hit?.score || hit?.percent || hit?.accuracy || 0);
  }
  function testReadiness(mission, sessionNo){
    const tp = mission.policy.testPolicy || DEFAULT_TEST_POLICY;
    const stats = mission.learnedStats || {};
    const blockers = [];
    const minOfficial = Number(tp.noOfficialTestBeforeSessions || 3);
    if(sessionNo < minOfficial){
      blockers.push(`Cần ít nhất ${minOfficial} buổi làm quen/nền trước kiểm tra chính thức.`);
      return {unlocked:null, reason:'too_early_for_official_test', blockers};
    }
    const easy = tp.unlockEasy || {};
    const learnedMinutes = Number(stats.studyMinutes || availableMinutes(mission));
    const learnedItems = Number(stats.learnedItems || sessionNo * 20);
    const dialogues = Number(stats.dialogues || sessionNo);
    if(sessionNo < Number(easy.minSessions || 3)) blockers.push(`Cần ${Number(easy.minSessions || 3)} buổi học nền.`);
    if(learnedMinutes < Number(easy.minStudyMinutes || 0)) blockers.push(`Cần tối thiểu ${Number(easy.minStudyMinutes || 0)} phút học thực.`);
    if(learnedItems < Number(easy.minLearnedItems || 0)) blockers.push(`Cần tối thiểu ${Number(easy.minLearnedItems || 0)} đơn vị học/từ/cụm.`);
    if(dialogues < Number(easy.minDialogues || 0)) blockers.push(`Cần tối thiểu ${Number(easy.minDialogues || 0)} vấn đáp/thực hành.`);
    if(blockers.length) return {unlocked:null, reason:'not_enough_learning_material', blockers};

    const easyScore = assessmentScore(mission,'easy');
    const mediumScore = assessmentScore(mission,'medium');
    const hardScore = assessmentScore(mission,'hard');
    const medium = tp.unlockMedium || {}, hard = tp.unlockHard || {}, expert = tp.unlockExpert || {};

    if(sessionNo >= Number(expert.minSessions || 16)){
      if(hardScore >= Number(expert.requirePreviousHardScore || 75)) return {unlocked:'expert', reason:'hard_passed_expert_unlocked', blockers:[]};
      if(hardScore > 0) return {unlocked:'hard', reason:'hard_retry_after_low_score', blockers:[`Hard chưa đạt ${Number(expert.requirePreviousHardScore || 75)}%.`]};
    }
    if(sessionNo >= Number(hard.minSessions || 10)){
      if(mediumScore >= Number(hard.requirePreviousMediumScore || 75)) return {unlocked:'hard', reason:'medium_passed_hard_unlocked', blockers:[]};
      if(mediumScore > 0) return {unlocked:'medium', reason:'medium_retry_after_low_score', blockers:[`Medium chưa đạt ${Number(hard.requirePreviousMediumScore || 75)}%.`]};
    }
    if(sessionNo >= Number(medium.minSessions || 6)){
      if(easyScore >= Number(medium.requirePreviousEasyScore || 75)) return {unlocked:'medium', reason:'easy_passed_medium_unlocked', blockers:[]};
      if(easyScore > 0) return {unlocked:'easy', reason:'easy_retry_after_low_score', blockers:[`Easy chưa đạt ${Number(medium.requirePreviousEasyScore || 75)}%.`]};
    }
    return {unlocked:'easy', reason:'easy_unlocked', blockers:[]};
  }
  function unlockedTestLevel(mission, sessionNo){
    return testReadiness(mission, sessionNo).unlocked;
  }
  function classifySession(i, s, total, mission){
    const sessionNo = i + 1;
    const isCalendarWeekend = [0,6].includes(new Date(s.date).getDay());
    const weekEndSignal = Boolean(s.isWeekEndSignal || s.isLastDayOfWeek || s.weekEndSignal || s.endOfWeek || s.weeklyCheckpoint);
    if(sessionNo === 1) return {kind:'orientation', testLevel:null, officialTest:false, isWeekend:isCalendarWeekend, weekEndSignal, weekendDecision:'no_test_first_day', blockedTestReason:'Ngày đầu chỉ làm quen, chưa kiểm tra.'};
    if(sessionNo < Number(mission.policy.testPolicy?.noOfficialTestBeforeSessions || 3)) return {kind:'foundation', testLevel:null, officialTest:false, isWeekend:isCalendarWeekend, weekEndSignal, weekendDecision:'build_foundation', blockedTestReason:'Chưa đủ số buổi nền để kiểm tra chính thức.'};
    const readiness = testReadiness(mission, sessionNo);
    const explicitFinal = Boolean(mission.raw?.finalCheck || mission.raw?.isFinalSession || mission.raw?.forceFinalTest || mission.goalType === 'final_test');
    if((weekEndSignal || explicitFinal) && readiness.unlocked){
      return {kind:'assessment', testLevel:readiness.unlocked, officialTest:true, isWeekend:isCalendarWeekend, weekEndSignal, weekendDecision:'test_unlocked', testReason:readiness.reason, blockedTestReason:'', blockers:readiness.blockers};
    }
    if(weekEndSignal || explicitFinal){
      return {kind:'review_consolidation', testLevel:null, officialTest:false, isWeekend:isCalendarWeekend, weekEndSignal, weekendDecision:'review_instead_of_test', testReason:readiness.reason, blockedTestReason:arr(readiness.blockers).join(' ') || 'Chưa đủ điều kiện mở khóa kiểm tra.', blockers:readiness.blockers};
    }
    if(mission.policy.reviewGaps.includes(i) || i>0 && i%4===0){
      return {kind:'review_consolidation', testLevel:null, officialTest:false, isWeekend:isCalendarWeekend, weekEndSignal, weekendDecision:'spaced_review', testReason:'review_gap', blockedTestReason:'', blockers:[]};
    }
    return {kind:'study', testLevel:null, officialTest:false, isWeekend:isCalendarWeekend, weekEndSignal, weekendDecision:'study', testReason:'', blockedTestReason:'', blockers:[]};
  }
  function scaleBlocks(blocks, minutes){
    const total = blocks.reduce((s,b)=>s+Number(b.minutes||0),0) || 90;
    const ratio = Number(minutes || 90) / total;
    let used = 0;
    return blocks.map((b,idx)=>{
      const m = idx===blocks.length-1 ? Math.max(0, Number(minutes||90)-used) : Math.max(1, Math.round(Number(b.minutes||0)*ratio));
      used += m;
      return Object.assign({}, b, {minutes:m});
    });
  }
  function sessionBlocks(kind, minutes){
    const base = {
      orientation: [
        {key:'video_warmup', label:'Video/mô phỏng ngắn: mở trực giác trước khi vào công thức', minutes:15},
        {key:'active_listening', label:'Đọc đề chủ động 2 lượt, khoanh biến/giả thiết chưa rõ', minutes:30},
        {key:'shadowing', label:'Giải lại ví dụ mẫu từng bước', minutes:25},
        {key:'roleplay', label:'Vấn đáp tình huống: định nghĩa, công thức, lỗi sai', minutes:25},
        {key:'survival_chunks', label:'Công thức dùng ngay trong bài tập', minutes:10},
        {key:'symbolic_in_sentence', label:'Ký hiệu phụ trợ qua 1 ví dụ mẫu', minutes:5},
        {key:'reflection', label:'Tự phản hồi lỗi biến đổi/công thức cần sửa', minutes:10}
      ],
      foundation: [
        {key:'video_context', label:'Xem minh họa trực giác Toán/kỹ thuật', minutes:20},
        {key:'active_listening', label:'Đọc hiểu ý chính và bắt giả thiết lặp lại', minutes:25},
        {key:'repeat_shadow', label:'Giải mẫu, sửa bước biến đổi và ký hiệu', minutes:25},
        {key:'guided_dialogue', label:'Vấn đáp lời giải có hướng dẫn', minutes:25},
        {key:'formula_minimum', label:'Công thức tối thiểu để giải được', minutes:10},
        {key:'micro_symbolic', label:'Ký hiệu cực ngắn từ bài vừa giải', minutes:5},
        {key:'write_spoken_sentence', label:'Ghi lại công thức/bước giải đã dùng', minutes:5},
        {key:'self_check', label:'Tự kiểm nhẹ, không tính điểm', minutes:5}
      ],
      study: [
        {key:'listen_again', label:'Đọc lại đề và bắt cấu trúc bài', minutes:15},
        {key:'video_context', label:'Video/mô phỏng theo chủ đề hôm nay', minutes:20},
        {key:'dialogue', label:'Vấn đáp và giải mẫu phản xạ', minutes:35},
        {key:'shadowing', label:'Trình bày lời giải tốc độ tự nhiên', minutes:20},
        {key:'formula_chunks', label:'Công thức phụ trợ dùng ngay', minutes:10},
        {key:'micro_symbolic', label:'Công thức qua lỗi/bài mẫu', minutes:5},
        {key:'write_or_type', label:'Ghi lại 3-5 bước giải quan trọng', minutes:10},
        {key:'reflection', label:'Tự phản hồi lỗi công thức/biến đổi', minutes:5}
      ],
      review_consolidation: [
        {key:'listen_wrong_lines', label:'Giải lại câu từng sai/chưa hiểu rõ', minutes:20},
        {key:'roleplay', label:'Vấn đáp trọng điểm', minutes:30},
        {key:'video_rewatch', label:'Xem lại mô phỏng/video liên quan', minutes:20},
        {key:'pronunciation_repair', label:'Sửa công thức và bước dùng sai', minutes:20},
        {key:'formula_symbolic_light', label:'Công thức/ký hiệu phụ trợ', minutes:15},
        {key:'mini_check', label:'Mini-check củng cố', minutes:15}
      ],
      assessment: [
        {key:'listen_warmup', label:'Khởi động công thức ngắn trước kiểm tra', minutes:10},
        {key:'test', label:'Kiểm tra đã mở khóa', minutes:40},
        {key:'correction', label:'Chữa lỗi ngay sau kiểm tra', minutes:20},
        {key:'speaking_repair', label:'Trình bày lại câu sai trong ngữ cảnh', minutes:25},
        {key:'repair_plan', label:'Tạo kế hoạch sửa lỗi', minutes:25}
      ]
    };
    return scaleBlocks(base[kind] || base.study, minutes);
  }
  function examPaperFromTestLevel(level, mission={}){
    const n = Number(mission.targetQuestions || mission.requiredOutput?.testQuestions || 0);
    if(n >= 100) return 'deep';
    if(n >= 60) return 'advanced';
    if(n >= 40) return 'intensive';
    const lv = clean(level).toLowerCase();
    if(/expert|giỏi|deep/.test(lv)) return 'deep';
    if(/hard|khá|advanced/.test(lv)) return 'advanced';
    if(/medium|trung|intensive/.test(lv)) return 'intensive';
    return 'standard';
  }
  function examRoute(level, mission={}){
    const paperType = examPaperFromTestLevel(level, mission);
    return {view:'learning', learnTab:'exam', paperType, examPaperType:paperType, testLevel:level || 'easy'};
  }
  function routeCards(kind, skill, mission, testLevel, cls={}){
    const L = mission.policy.routeCardLimits || DEFAULT_ROUTE_LIMITS;
    if(kind==='orientation') return [
      {title:'Video/mô phỏng mở trực giác', purpose:'Giai đoạn đầu cần mở trực giác bằng video/mô phỏng trước khi kiểm tra.', limit:'1 video/mô phỏng ngắn 5-12 phút', route:{view:'media'}, button:'Xem ngay'},
      {title:'Đọc đề - giải mẫu - trình bày', purpose:'Tạo phản xạ nhận dạng giả thiết, công thức và bước giải.', limit:'5-8 bước mẫu', route:{view:'learning', learnTab:'practice'}, button:'Luyện giải mẫu'},
      {title:'Vấn đáp tình huống', purpose:'Dùng định nghĩa/công thức trong bài tập; ký hiệu chỉ hỗ trợ hiểu sâu.', limit:'1-2 vấn đáp', route:{view:'dialogue'}, button:'Vấn đáp'}
    ];
    if(kind==='assessment') return [
      {title:'Khởi động công thức trước kiểm tra', purpose:'Ôn công thức ngắn để vào nhịp, không nhảy thẳng vào đề.', limit:'5-10 phút', route:{view:'media'}, button:'Mở ôn nhanh'},
      {title:`Kiểm tra trong lịch hôm nay`, purpose:'Làm đúng đề đã được lịch hôm nay mở; trả lời đủ câu mới nộp.', limit:`${Math.min(mission.targetQuestions || 20, 100)} câu mục tiêu`, route:examRoute(testLevel || 'easy', mission), button:'Làm kiểm tra'},
      {title:'Chữa lỗi ngay sau kiểm tra', purpose:'Phân loại lỗi, xem đáp án và đưa câu sai sang Ôn tập.', limit:`${L.repairErrorGroups || 3} nhóm lỗi chính`, route:{view:'learning', learnTab:'review', reviewFilter:'wrong'}, button:'Mở ôn tập'},
      {title:'Trình bày lại phần sai', purpose:'Biến lỗi thành bài luyện suy luận.', limit:'1 nhiệm vụ trình bày lại', route:{view:'dialogue', mode:'retry'}, button:'Luyện lại'},
      {title:'Chốt kế hoạch sửa lỗi', purpose:'Ghi 1-3 lỗi chính để buổi sau không lặp lại.', limit:'3 lỗi trọng tâm', route:{view:'learning', learnTab:'review', reviewFilter:'wrong'}, button:'Mở câu sai'}
    ];
    if(kind==='review_consolidation'){
      if(cls.blockedTestReason){
        return [
          {title:'Ôn củng cố trước kiểm tra', purpose:'Main báo cuối tuần, nhưng môn chưa đủ điều kiện kiểm tra nên chuyển sang củng cố.', limit:`tối đa ${L.consolidationReviewCards || L.maxVocabCards} công thức/đơn vị ôn`, route:{view:'vocab'}, button:'Ôn nền'},
          {title:'Bổ sung vật liệu học còn thiếu', purpose:'Hoàn thiện bài học, vấn đáp/thực hành, công thức hoặc ví dụ còn thiếu.', limit:`${L.maxLessons} bài · ${L.maxDialogues} thực hành`, route:{view:'learning', learnTab:'theory'}, button:'Bổ sung học'},
          {title:'Mini-check chưa tính điểm', purpose:'Tự kiểm tra rất nhẹ để xem đã sẵn sàng mở khóa bài chính thức chưa.', limit:`${L.quickCheckQuestions} câu`, route:{view:'learning', learnTab:'review'}, button:'Tự kiểm nhẹ'}
        ];
      }
      return [
        {title:'Ôn gián đoạn', purpose:'Nhắc lại đúng khoảng cách để nhớ lâu.', limit:`tối đa ${L.maxVocabCards} công thức`, route:{view:'vocab'}, button:'Ôn công thức/khái niệm'},
        {title:'Thực hành vấn đáp', purpose:'Biến kiến thức thành lời giải dùng được.', limit:`${L.maxDialogues} mô phỏng/vấn đáp`, route:{view:'learning', learnTab:'practice'}, button:'Luyện thực hành'},
        {title:'Mini-check củng cố', purpose:'Kiểm tra nhẹ, không thay thế kiểm tra chính thức.', limit:`${L.quickCheckQuestions} câu`, route:{view:'learning', learnTab:'review'}, button:'Tự kiểm'}
      ];
    }
    return [
      {title:'Video/mô phỏng chủ lực', purpose:'Mở trực giác bằng minh họa thật, ưu tiên hình học và cơ chế.', limit:'1 nguồn minh họa ngắn', route:{view:'media'}, button:'Xem'},
      {title:'Giải mẫu phản xạ', purpose:'Đọc mẫu, giải lại, tự vấn đáp để hiểu trước khi phân tích sâu.', limit:`tối đa ${L.maxDialogues || 2} vấn đáp`, route:{view:'dialogue'}, button:'Vấn đáp'},
      {title:'Giải mẫu trong bài', purpose:'Luyện từng bước của bài học, gắn với bài toán thật.', limit:'20-35 phút giải mẫu', route:{view:'learning', learnTab:'practice'}, button:'Mở Giải mẫu'},
      {title:'Công thức/ký hiệu phụ trợ', purpose:'Chỉ chọn công thức và ký hiệu cần cho bài hôm nay.', limit:`tối đa ${Math.min(L.maxVocabCards||15,15)} công thức + 1 ví dụ`, route:{view:'vocab'}, button:'Học công thức'}
    ];
  }
  function buildInternalPlan(mission, analysis, ctx={}){
    const sessions = arr(mission.sessions).length ? arr(mission.sessions) : normalizeSessions(mission);
    const demand = analysis.demand || estimateDemand(mission, ctx);
    const total = sessions.length;
    const planSessions = sessions.map((s,i)=>{
      const cls = classifySession(i, s, total, mission);
      const skill = skillForSession(i,total,mission,demand,cls.kind);
      const minutes = Number(s.minutes||0);
      const blocks = sessionBlocks(cls.kind, minutes || 90);
      const newMinutes = blocks.filter(b=>!/review|correction|repair|reflection|self_check|mini_check/.test(b.key)).reduce((sum,b)=>sum+Number(b.minutes||0),0);
      const reviewMinutes = Math.max(0, minutes - newMinutes);
      const cards = routeCards(cls.kind, skill, mission, cls.testLevel, cls);
      const output = cls.officialTest
        ? `Kiểm tra ${cls.testLevel}, sau đó chữa lỗi và lập kế hoạch sửa.`
        : (cls.kind==='orientation'
          ? '2 tháng đầu: video/mô phỏng, giải-nhại, shadowing và đóng vai; công thức/ký hiệu chỉ phụ trợ.'
          : (cls.kind==='review_consolidation' && cls.blockedTestReason
            ? 'Cuối tuần nhưng chưa đủ điều kiện kiểm tra; chuyển sang ôn củng cố và mini-check.'
            : `Hoàn thành phiên giải-trình bày-video trọng tâm, có giới hạn công thức/ký hiệu và tự phản hồi nhẹ.`));
      return {
        id: s.id || `session_${i+1}`,
        order: i+1,
        date: s.date,
        minutes,
        timeBlock: s.timeBlock || '',
        phase: phaseName(i,total,mission,cls.kind),
        sessionKind: cls.kind,
        testLevel: cls.testLevel,
        officialTest: cls.officialTest,
        skill,
        mode: cls.kind,
        weekEndSignal: cls.weekEndSignal,
        weekendDecision: cls.weekendDecision,
        testReason: cls.testReason || '',
        blockedTestReason: cls.blockedTestReason || '',
        blockers: arr(cls.blockers),
        blocks,
        cards,
        limits: clone(mission.policy.routeCardLimits || DEFAULT_ROUTE_LIMITS),
        newLearningMinutes: newMinutes,
        reviewMinutes,
        output,
        repairFlow: cls.officialTest ? ['làm bài', 'chữa lỗi', 'phân loại lỗi', 'luyện lại phần sai', 'gửi phản hồi Main'] : [],
        antiCrammingNote: mission.antiCramming ? 'Có chia học mới + ôn + tự kiểm để giảm quên.' : 'Chế độ học nhanh.',
        pedagogyNote: cls.kind==='orientation'
          ? 'Giai đoạn đầu không nhồi kiểm tra; ưu tiên giải, nhại, trình bày lại và tự phản hồi.'
          : (cls.kind==='assessment'
            ? 'Kiểm tra đã mở khóa; bắt buộc có chữa lỗi sau kiểm tra.'
            : (cls.blockedTestReason
              ? 'Môn tự quyết định ôn thay vì kiểm tra vì chưa đủ nền.'
              : 'Ưu tiên hiểu sâu và phản xạ, không nhồi.'))
      };
    });
    return {
      missionId: mission.id,
      courseId: mission.courseId,
      target: mission.target,
      startDate: mission.startDate,
      deadline: mission.deadline,
      feasibleAtCreation: analysis.feasible,
      riskLevel: analysis.riskLevel,
      totalSessions: planSessions.length,
      totalMinutes: planSessions.reduce((s,x)=>s+x.minutes,0),
      sessions: planSessions,
      reviewGaps: mission.policy.reviewGaps,
      testPolicy: clone(mission.policy.testPolicy),
      routeCardLimits: clone(mission.policy.routeCardLimits),
      weekendPolicy: {
        mainRole: 'send_week_end_signal_only',
        subjectRole: 'decide_test_or_consolidation_by_readiness',
        noForcedTestWithoutLearningMaterial: true
      },
      repairPolicy: clone(mission.policy.testPolicy?.repairAfterAssessment || DEFAULT_TEST_POLICY.repairAfterAssessment),
      completionRule: {
        type:'final_test_and_mastery',
        noOfficialTestBeforeSessions: mission.policy.testPolicy.noOfficialTestBeforeSessions,
        targetQuestions: mission.targetQuestions,
        targetScore: mission.targetScore,
        requireSkillMinimum:true,
        requirePostTestCorrection:true
      }
    };
  }
  function warningOptions(mission, analysis){
    if(analysis.feasible) return [];
    return [
      {action:'regenerate_schedule', label:'Tạo lại lịch', requestedMinimumDays:analysis.minimumRecommendedDays, requestedMinimumMinutes:analysis.minimumRecommendedMinutes},
      {action:'add_extra_study_time', label:'Học bù thêm giờ', preferredBlocks:['evening','saturday','sunday'], requestedExtraMinutes:Math.max(0,analysis.minimumRecommendedMinutes-analysis.availableMinutes)}
    ];
  }
  function makeWarning(mission, analysis){
    if(analysis.feasible) return null;
    return {
      type:'BAUMAN_SUBJECT_WARNING',
      missionId:mission.id,
      courseId:mission.courseId,
      status:'warning',
      warningType:'insufficient_learning_conditions',
      riskLevel:analysis.riskLevel,
      message:`${mission.courseName}: thời lượng hiện tại chưa đủ an toàn để đạt “${mission.target}”.`,
      details:analysis.warnings,
      options:warningOptions(mission, analysis),
      generatedAt:nowIso()
    };
  }
  function acceptMission(raw, ctx={}){
    const mission = normalizeMission(raw, ctx);
    const analysis = analyzeFeasibility(mission, ctx);
    const plan = buildInternalPlan(mission, analysis, ctx);
    const warning = makeWarning(mission, analysis);
    return {version:VERSION, mission, analysis, plan, warning, generatedAt:nowIso()};
  }
  function buildRepairPlan(result={}, bundle=null){
    const mission = bundle?.mission || {};
    const targetScore = Number(mission.targetScore || result.targetScore || DEFAULT_POLICY.targetScore);
    const answered = Number(result.answered || result.completedQuestions || 0);
    const correct = Number(result.correct || 0);
    const score = Number(result.score || (answered ? Math.round(correct*100/answered) : 0));
    const weakAreas = arr(result.weakAreas);
    const rawGroups = arr(result.errorGroups).length ? arr(result.errorGroups) : weakAreas.map(x=>({area:x, reason:'Kỹ năng yếu cần luyện lại.'}));
    const maxGroups = Number(mission.policy?.testPolicy?.repairAfterAssessment?.maxErrorGroups || DEFAULT_TEST_POLICY.repairAfterAssessment.maxErrorGroups || 3);
    const groups = rawGroups.slice(0,maxGroups).map((g,i)=> typeof g==='string' ? {area:g, reason:'Cần ôn và làm lại.'} : Object.assign({area:`Nhóm lỗi ${i+1}`}, g));
    const needsRepair = answered > 0 && (score < targetScore || groups.length > 0);
    return {
      required: needsRepair,
      score,
      targetScore,
      errorGroups: groups,
      steps: needsRepair ? [
        'Xem lại câu sai và đáp án đúng.',
        'Phân loại tối đa 3 nhóm lỗi chính.',
        'Quay lại thẻ học/bài tập liên quan.',
        'Làm lại mini-check sau sửa lỗi.',
        'Gửi phản hồi cập nhật cho Main.'
      ] : ['Ghi nhận đạt mục tiêu, chuyển sang ôn gián đoạn.'],
      routeCards: needsRepair ? [
        {title:'Sửa lỗi trọng tâm', route:{view:'learning', learnTab:'exercises', mode:'repair'}},
        {title:'Luyện lại thực hành', route:{view:'learning', learnTab:'practice', mode:'retry'}},
        {title:'Mini-check sau sửa', route:{view:'learning', learnTab:'review'}}
      ] : [{title:'Ôn gián đoạn', route:{view:'vocab', mode:'spaced_review'}}]
    };
  }
  function progressFromSession(result={}, bundle=null){
    const mission = bundle?.mission || {};
    const targetQuestions = Number(mission.targetQuestions || result.targetQuestions || DEFAULT_POLICY.targetQuestions);
    const targetScore = Number(mission.targetScore || result.targetScore || DEFAULT_POLICY.targetScore);
    const answered = Number(result.answered || result.completedQuestions || 0);
    const correct = Number(result.correct || 0);
    const score = Number(result.score || (answered ? Math.round(correct*100/answered) : 0));
    const weakAreas = arr(result.weakAreas);
    const repairPlan = buildRepairPlan(result, bundle);
    const skillScores = result.skillScores || {};
    const skillMinimumFailed = Object.values(skillScores).some(v=>Number(v) < DEFAULT_POLICY.weakScore);
    const completed = answered >= targetQuestions && score >= targetScore && !skillMinimumFailed && !weakAreas.length && !repairPlan.required;
    const needsWeekendIntensive = (score>0 && score < DEFAULT_POLICY.weakScore) || weakAreas.length >= 2 || repairPlan.required;
    return {
      type:'BAUMAN_SUBJECT_PROGRESS',
      missionId:mission.id || result.missionId || '', courseId:mission.courseId || result.courseId || '',
      answered, correct, score, targetQuestions, targetScore, completed,
      weakAreas, needsWeekendIntensive,
      repairPlan,
      recommendedMinutes: needsWeekendIntensive ? Math.max(90, Number(repairPlan.required ? 90 : 60)) : 35,
      nextReviewMode: needsWeekendIntensive ? 'weekend_repair' : 'spaced_review',
      recommendedAction: completed ? 'continue_spaced_review' : (repairPlan.required ? 'repair_before_next_level' : 'continue_learning'),
      generatedAt:nowIso()
    };
  }
  function buildMainActionRequest(action, bundle){
    const mission = bundle?.mission || {}, analysis = bundle?.analysis || {};
    const opt = warningOptions(mission, analysis).find(x=>x.action===action) || {action};
    return {
      type:'BAUMAN_SUBJECT_SCHEDULE_REQUEST',
      action,
      missionId:mission.id,
      courseId:mission.courseId,
      requestedMinimumDays:opt.requestedMinimumDays || analysis.minimumRecommendedDays,
      requestedMinimumMinutes:opt.requestedMinimumMinutes || analysis.minimumRecommendedMinutes,
      requestedExtraMinutes:opt.requestedExtraMinutes || Math.max(0,(analysis.minimumRecommendedMinutes||0)-(analysis.availableMinutes||0)),
      preferredBlocks:opt.preferredBlocks || [],
      reason: action==='regenerate_schedule' ? 'Môn học yêu cầu Main tạo lại lịch cho đủ chuẩn đầu ra.' : 'Môn học yêu cầu thêm giờ học bù nhưng vẫn chống nhồi nhét.',
      generatedAt:nowIso()
    };
  }
  window.BaumanPlanningBridge = {VERSION, DEFAULT_POLICY, DEFAULT_TEST_POLICY, DEFAULT_ROUTE_LIMITS, normalizeMission, estimateDemand, analyzeFeasibility, testReadiness, unlockedTestLevel, classifySession, sessionBlocks, routeCards, buildRepairPlan, buildInternalPlan, makeWarning, warningOptions, acceptMission, progressFromSession, buildMainActionRequest};
})();
