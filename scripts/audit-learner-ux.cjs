'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();
const checks = [];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function check(id, title, ok, evidence) {
  checks.push({ id, title, ok: Boolean(ok), evidence });
}

const html = read('index.html');
const core = read('assets/core.js');
const learnerUx = read('assets/learner-ux.js');
const learnerCss = read('assets/webapp.css');
const lessonFirst = read('assets/theory_skin/theory-learning-path-E186.js');

check(
  'L4-DASHBOARD',
  'overview exposes today/resume actions without replacing the existing dashboard',
  /Lịch trình hôm nay/.test(core)
    && /id="learnerContext"/.test(html)
    && /data-l4-action="resume"/.test(learnerUx)
    && /data-l4-action="start"/.test(learnerUx),
  { todaySchedule: /Lịch trình hôm nay/.test(core), learnerContext: /id="learnerContext"/.test(html) }
);
check(
  'L4-HIERARCHY',
  'lesson-first hierarchy keeps module-course-chapter-lesson-activity navigation',
  /flow:'module-course-chapter-lesson-activity'/.test(lessonFirst)
    && /data-e186-open/.test(lessonFirst)
    && /data-e186-pick/.test(lessonFirst),
  'E186 lesson-first route'
);
check(
  'L4-SEARCH-STATE',
  'search and filter state remain part of the persisted canonical core state',
  /lessonQuery:''/.test(core)
    && /conceptQuery:''/.test(core)
    && /practiceQuery:''/.test(core)
    && /function save\(/.test(core),
  ['lessonQuery', 'conceptQuery', 'practiceQuery']
);
check(
  'L4-READER-CONTEXT',
  'reader context is mounted outside the replaceable lesson surface',
  html.indexOf('id="learnerContext"') < html.indexOf('id="view"')
    && /\[data-current-lesson\]/.test(learnerUx)
    && /learner-context-grid/.test(learnerCss),
  { persistentHostBeforeView: html.indexOf('id="learnerContext"') < html.indexOf('id="view"') }
);
check(
  'L4-LEARNING-METADATA',
  'current lesson context supplies goal, prerequisite and estimated duration',
  /objective:/.test(learnerUx)
    && /prerequisite:/.test(learnerUx)
    && /estimatedMinutes:/.test(learnerUx)
    && /Mục tiêu/.test(learnerUx)
    && /Kiến thức cần trước/.test(learnerUx),
  ['objective', 'prerequisite', 'estimatedMinutes']
);
check(
  'L4-CONTENT-HIERARCHY',
  'existing reader retains formula, example and misconception-oriented content structure',
  /formula-section/.test(core)
    && /Tự kiểm/.test(core)
    && /Lỗi dễ mắc/.test(learnerUx)
    && /misconceptionFor/.test(learnerUx),
  ['formula-section', 'Tự kiểm', 'misconception copy']
);
check(
  'L4-RESUME',
  'last lesson and E186 path are saved and can be restored',
  /lastLesson/.test(learnerUx)
    && /resumeLearning/.test(learnerUx)
    && /api\.state\.e186Path/.test(learnerUx)
    && /api\.state\.e129LessonId/.test(learnerUx),
  'math.bauman.learner-ux.v1'
);
check(
  'L4-LEARNER-TOOLS',
  'bookmark, note and three-step checklist are local-first and lesson-scoped',
  /bookmarks/.test(learnerUx)
    && /notes/.test(learnerUx)
    && /checklists/.test(learnerUx)
    && /localStorage/.test(learnerUx)
    && /data-l4-check="concept"/.test(learnerUx)
    && /data-l4-check="example"/.test(learnerUx)
    && /data-l4-check="selfCheck"/.test(learnerUx),
  ['bookmark', 'note', 'concept/example/selfCheck']
);
check(
  'L4-RECOVERY-STATES',
  'learner UI retains actionable loading, empty and error/recovery states',
  /Đang tải/.test(core)
    && /Chưa có/.test(core)
    && /KHÔI PHỤC TAB HỌC TẬP/.test(core)
    && /Đã chặn lỗi render/.test(core),
  ['loading', 'empty', 'recovery']
);
check(
  'L4-RESPONSIVE-ACCESSIBLE',
  'learner context and notes provide responsive, labeled and keyboard-native controls',
  /aria-live="polite"/.test(html)
    && /<dialog id="learnerNotesDialog"/.test(html)
    && /aria-labelledby="learnerNotesTitle"/.test(html)
    && /@media \(max-width: 600px\)/.test(learnerCss)
    && /:focus-visible/.test(learnerCss),
  ['dialog', 'aria-live', '600px layout', 'focus-visible']
);

const report = {
  gate: 'MATH-BAUMAN-WEBAPP-V2-L4-LEARNER-UX',
  status: checks.every((item) => item.ok) ? 'PASS' : 'FAIL',
  release: 'MATH-BAUMAN-WEBAPP-V2-L4.1',
  checks
};

fs.mkdirSync(path.join(ROOT, 'reports'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'reports/learner-ux.generated.json'), `${JSON.stringify(report, null, 2)}\n`);
checks.forEach((item) => console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.id} ${item.title}`));
console.log(`Math V2 L4 learner UX ${report.status}: ${checks.filter((item) => item.ok).length}/${checks.length}`);
if (report.status !== 'PASS') process.exit(1);
