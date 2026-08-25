'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const checks = [];
const warnings = [];

function read(file) { return fs.readFileSync(path.join(ROOT, file), 'utf8'); }
function json(file) { return JSON.parse(read(file)); }
function check(id, title, ok, evidence) { checks.push({ id, title, ok: Boolean(ok), evidence }); }
function digest(value) { return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex'); }
function count(value) {
  if (Array.isArray(value)) return value.length;
  if (value && Array.isArray(value.records)) return value.records.length;
  if (value && Array.isArray(value.items)) return value.items.length;
  if (value && Array.isArray(value.questions)) return value.questions.length;
  return 0;
}

const lessons = json('data/lessons.json');
const theoryContent = json('data/theory_lecture_content.json');
const overlays = Array.isArray(theoryContent) ? theoryContent : theoryContent.records || [];
const frame = json('data/theory_lecture_frame.json');
const sourceFamilies = [
  'formulas', 'exercises', 'applications', 'simulations', 'question_bank',
  'review_packs', 'test_blueprints', 'professor_qa', 'mindmap'
];
const ids = lessons.map((lesson) => lesson.id || lesson.lessonId);
const overlayIds = overlays.map((lesson) => lesson.lessonId || lesson.id);
const frameChapterIds = new Set((frame.chapters || []).map((chapter) => chapter.chapterId || chapter.id));

check('LESSONS-347', 'preserve all 347 legacy Mathematics lessons', lessons.length === 347, lessons.length);
check('LESSON-ID-UNIQUE', 'legacy lesson IDs are complete and unique', ids.every(Boolean) && new Set(ids).size === 347, new Set(ids).size);
check('OVERLAYS-18', 'preserve all 18 authoritative theory overlays', overlays.length === 18, overlays.length);
check('OVERLAY-ID-UNIQUE', 'overlay lesson IDs are complete and unique', overlayIds.every(Boolean) && new Set(overlayIds).size === 18, new Set(overlayIds).size);
check('OVERLAY-ANCHORS-RESOLVE', 'every overlay has a stable chapter anchor in the 56-chapter frame', overlays.every((overlay) => {
  const anchor = overlay.sourceAnchors || {};
  return Boolean(overlay.chapterId && anchor.chapterId === overlay.chapterId && frameChapterIds.has(overlay.chapterId));
}), overlays.filter((overlay) => !frameChapterIds.has(overlay.chapterId)).map((overlay) => overlay.lessonId));
check('OVERLAY-ID-BOUNDARY', 'overlay IDs stay distinct and are never silently rewritten as legacy IDs', overlays.every((overlay) => !ids.includes(overlay.lessonId)), overlayIds);
check('FRAME-56', 'preserve the 56-chapter theory frame', Array.isArray(frame.chapters) && frame.chapters.length === 56, frame.chapters && frame.chapters.length);
const stageAliases = {
  vn: 'vn',
  prep: 'prep',
  master_y1_s1: 'hk1',
  master_y1_s2: 'hk2',
  nir: 'hk3',
  vkr: 'hk4'
};
const canonicalStages = new Set(lessons.map((lesson) => stageAliases[lesson.stage] || lesson.stage));
check('STAGES', 'learner stages vn/prep/hk1-hk4 remain represented through reviewed aliases', ['vn','prep','hk1','hk2','hk3','hk4'].every((stage) => canonicalStages.has(stage)), { source: Array.from(new Set(lessons.map((lesson) => lesson.stage))), canonical: Array.from(canonicalStages) });

const html = read('index.html');
const localRefs = Array.from(html.matchAll(/(?:src|href)="([^"#?]+)(?:\?[^"#]*)?"/g), (match) => match[1])
  .filter((ref) => !/^(?:https?:|data:|#)/.test(ref));
const missingRefs = localRefs.filter((ref) => !fs.existsSync(path.join(ROOT, ref.replace(/^\.\//, ''))));
const serviceWorker = read('service-worker.js');
const uncachedShellRefs = localRefs.filter((ref) => {
  const normalized = './' + ref.replace(/^\.\//, '');
  return !serviceWorker.includes(`'${normalized}'`);
});
check('STANDALONE-PATHS', 'index has no parent-repository dependency', !html.includes('../../'), localRefs);
check('LOCAL-ASSETS', 'all index local assets exist', missingRefs.length === 0, missingRefs);
check('WEBAPP-SHELL', 'single Web App shell retains legacy core and new theory runtime', html.includes('assets/core.js') && html.includes('theory-tab-E129.js') && html.includes('webapp-bootstrap.js'), null);
check('PWA', 'manifest and versioned Service Worker are present', fs.existsSync(path.join(ROOT, 'manifest.webmanifest')) && serviceWorker.includes('math-bauman-webapp-v2-l2'), null);
check('PWA-SHELL-COVERAGE', 'every local asset referenced by index is precached for first offline reload', uncachedShellRefs.length === 0, uncachedShellRefs);
check('NO-HUTECH-UI', 'learner-facing shell does not expose HUTECH', !/HUTECH/i.test(html), null);

const familyCounts = {};
sourceFamilies.forEach((name) => {
  familyCounts[name] = count(json(`data/${name}.json`));
  if (familyCounts[name] === 0) warnings.push({
    id: 'EMPTY-' + name.toUpperCase(),
    message: `${name}.json is an empty source shell and must be completed in planned content rounds.`
  });
});
check('EMPTY-FAMILIES-DISCLOSED', 'empty content families are disclosed instead of overstated as complete', warnings.length >= 7, familyCounts);

const report = {
  gate: 'MATH-V2-L1-L2-STATIC',
  status: checks.every((item) => item.ok) ? 'PASS' : 'FAIL',
  source: {
    repository: 'BlueDragon33/Bauman-master-ai-system',
    branch: 'migration/webapp-l1-audit-storage',
    package: 'subjects/math',
    destinationRepository: 'BlueDragon33/Math_Bauman',
    destinationBranch: 'migration/full-webapp-v2'
  },
  inventory: {
    lessons: lessons.length,
    theoryOverlays: overlays.length,
    chapters: frame.chapters.length,
    familyCounts,
    lessonDigest: digest(lessons),
    overlayDigest: digest(overlays)
  },
  checks,
  warnings
};

fs.mkdirSync(path.join(ROOT, 'reports'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'reports/source-audit.generated.json'), JSON.stringify(report, null, 2) + '\n');
checks.forEach((item) => console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.id} ${item.title}`));
warnings.forEach((item) => console.log(`WARN ${item.id} ${item.message}`));
console.log(`Math V2 static gate ${report.status}: ${checks.filter((item) => item.ok).length}/${checks.length}`);
if (report.status !== 'PASS') process.exit(1);
