(function learnerUxModule(global) {
  'use strict';

  const RELEASE = 'MATH-BAUMAN-WEBAPP-V2-L4.1';
  const STORAGE_KEY = 'math.bauman.learner-ux.v1';
  const EMPTY_STATE = Object.freeze({ version: 1, lastLesson: null, bookmarks: {}, notes: {}, checklists: {} });
  let renderQueued = false;
  let activeNoteLessonId = '';
  let storageHealthy = true;

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function replace(character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function loadState() {
    try {
      const parsed = JSON.parse(global.localStorage.getItem(STORAGE_KEY) || 'null');
      if (!parsed || parsed.version !== 1) return clone(EMPTY_STATE);
      return Object.assign(clone(EMPTY_STATE), parsed, {
        bookmarks: parsed.bookmarks || {},
        notes: parsed.notes || {},
        checklists: parsed.checklists || {}
      });
    } catch (_) {
      storageHealthy = false;
      return clone(EMPTY_STATE);
    }
  }

  let learnerState = loadState();

  function saveState() {
    try {
      global.localStorage.setItem(STORAGE_KEY, JSON.stringify(learnerState));
      storageHealthy = true;
    } catch (_) {
      storageHealthy = false;
    }
  }

  function coreState() {
    return global.__BAUMAN_CORE_API && global.__BAUMAN_CORE_API.state || global.__MATH_STATE || {};
  }

  function overlays() {
    const source = global.DB && global.DB.theory_lecture_content;
    return Array.isArray(source) ? source : source && (source.records || source.items || source.lessons) || [];
  }

  function legacyLessons() {
    const source = global.DB && global.DB.lessons;
    return Array.isArray(source) ? source : source && (source.records || source.items || source.lessons) || [];
  }

  function frames() {
    const source = global.DB && global.DB.theory_lecture_frame || {};
    return Array.isArray(source.chapters) ? source.chapters : [];
  }

  function currentLessonId() {
    const visible = document.querySelector('[data-current-lesson]');
    const state = coreState();
    return String(
      visible && visible.getAttribute('data-current-lesson')
      || state.e129LessonId
      || state.e186Path && state.e186Path.lessonId
      || state.lessonId
      || ''
    ).trim();
  }

  function recordById(lessonId) {
    return overlays().find(function match(record) {
      return String(record && (record.lessonId || record.id) || '') === lessonId;
    }) || legacyLessons().find(function match(record) {
      return String(record && (record.lessonId || record.id) || '') === lessonId;
    }) || null;
  }

  function prerequisiteFor(record) {
    if (Array.isArray(record && record.prerequisites) && record.prerequisites.length) return record.prerequisites.join(' · ');
    const records = overlays();
    const chapterRecords = records.filter(function sameChapter(item) { return item.chapterId === record.chapterId; });
    const index = chapterRecords.findIndex(function sameRecord(item) { return item.lessonId === record.lessonId; });
    if (index > 0) return chapterRecords[index - 1].title || chapterRecords[index - 1].lessonTitle || chapterRecords[index - 1].lessonId;
    return 'Kiến thức nền của chương trước và các ký hiệu cơ bản';
  }

  function misconceptionFor(record) {
    const slides = Array.isArray(record && record.slides) ? record.slides : [];
    const commonMistakes = slides.find(function findMistakeSlide(slide) {
      return /common[_ -]?mistakes|mistake|misconception/i.test(String(slide && slide.role || ''));
    });
    const blocks = commonMistakes && Array.isArray(commonMistakes.blocks) ? commonMistakes.blocks : [];
    const first = blocks.find(function hasContent(block) { return block && (block.body || block.text || block.title); });
    return first && (first.body || first.text || first.title)
      || 'Đừng chỉ nhớ công thức: luôn kiểm tra giả thiết, kích thước, đơn vị và ý nghĩa của kết quả.';
  }

  function currentMetadata() {
    const lessonId = currentLessonId();
    if (!lessonId) return null;
    const record = recordById(lessonId);
    if (!record) return null;
    const chapterId = String(record.chapterId || record.sourceAnchors && record.sourceAnchors.chapterId || '');
    const frame = frames().find(function match(chapter) { return String(chapter.chapterId || chapter.id || '') === chapterId; }) || {};
    const slides = Array.isArray(record.slides) ? record.slides.length : 0;
    const e186 = global.BAUMAN_MATH_E186_LESSON_FIRST;
    let crumbs = [];
    let path = null;
    try {
      crumbs = e186 && typeof e186.crumbs === 'function' ? e186.crumbs().map(function label(item) { return item.label; }) : [];
      path = e186 && typeof e186.path === 'function' ? clone(e186.path()) : null;
    } catch (_) {
      crumbs = [];
      path = null;
    }
    return {
      lessonId,
      chapterId,
      title: record.title || record.lessonTitle || record.displayTitle || lessonId,
      chapterTitle: frame.chapterTitle || record.chapterTitle || 'Chương hiện tại',
      stageTitle: frame.stageTitle || record.stageName || 'Lộ trình Bauman',
      objective: record.baumanFocus || record.targetOutcome || record.sourceAnchors && record.sourceAnchors.targetOutcome || 'Hiểu khái niệm, giải được ví dụ và kết nối với bài toán kỹ thuật.',
      prerequisite: prerequisiteFor(record),
      misconception: misconceptionFor(record),
      estimatedMinutes: Math.max(25, Math.min(90, slides ? slides * 8 : 45)),
      crumbs,
      path
    };
  }

  function checklistFor(lessonId) {
    return Object.assign({ concept: false, example: false, selfCheck: false }, learnerState.checklists[lessonId] || {});
  }

  function completedCount(checklist) {
    return ['concept', 'example', 'selfCheck'].filter(function completed(key) { return Boolean(checklist[key]); }).length;
  }

  function updateLastLesson(metadata) {
    const current = learnerState.lastLesson;
    const signature = [metadata.lessonId, JSON.stringify(metadata.path || {})].join('|');
    const currentSignature = current && [current.lessonId, JSON.stringify(current.path || {})].join('|');
    if (signature === currentSignature) return;
    learnerState.lastLesson = {
      lessonId: metadata.lessonId,
      chapterId: metadata.chapterId,
      title: metadata.title,
      chapterTitle: metadata.chapterTitle,
      stageTitle: metadata.stageTitle,
      path: metadata.path
    };
    saveState();
  }

  function learningContextHtml(metadata) {
    const lessonId = metadata.lessonId;
    const checklist = checklistFor(lessonId);
    const isBookmarked = Boolean(learnerState.bookmarks[lessonId]);
    const hasNote = Boolean(String(learnerState.notes[lessonId] || '').trim());
    const breadcrumb = metadata.crumbs.length ? metadata.crumbs : [metadata.stageTitle, metadata.chapterTitle, metadata.title];
    return `
      <div class="learner-context-main" data-l4-lesson="${escapeHtml(lessonId)}">
        <nav aria-label="Vị trí bài học"><ol class="learner-breadcrumb">${breadcrumb.map(function crumb(label) { return `<li>${escapeHtml(label)}</li>`; }).join('')}</ol></nav>
        <div class="learner-context-heading"><div><span class="learner-eyebrow">Bài đang học</span><h3>${escapeHtml(metadata.title)}</h3></div><span class="learner-duration" aria-label="Thời lượng ước tính">≈ ${metadata.estimatedMinutes} phút</span></div>
        <div class="learner-context-grid">
          <article><b>Mục tiêu</b><p>${escapeHtml(metadata.objective)}</p></article>
          <article><b>Kiến thức cần trước</b><p>${escapeHtml(metadata.prerequisite)}</p></article>
          <article><b>Lỗi dễ mắc</b><p>${escapeHtml(metadata.misconception)}</p></article>
        </div>
      </div>
      <aside class="learner-tools" aria-label="Công cụ bài học">
        <div class="learner-tool-actions">
          <button class="btn soft" type="button" data-l4-action="bookmark" aria-pressed="${isBookmarked}">${isBookmarked ? '★ Đã lưu' : '☆ Lưu bài'}</button>
          <button class="btn soft" type="button" data-l4-action="note">${hasNote ? 'Sửa ghi chú' : 'Ghi chú'}</button>
        </div>
        <fieldset><legend>Checklist ${completedCount(checklist)}/3</legend>
          <label><input type="checkbox" data-l4-check="concept" ${checklist.concept ? 'checked' : ''}> Hiểu khái niệm</label>
          <label><input type="checkbox" data-l4-check="example" ${checklist.example ? 'checked' : ''}> Tự làm lại ví dụ</label>
          <label><input type="checkbox" data-l4-check="selfCheck" ${checklist.selfCheck ? 'checked' : ''}> Hoàn thành tự kiểm</label>
        </fieldset>
      </aside>`;
  }

  function resumeHtml(lastLesson) {
    if (!lastLesson) {
      return '<div class="learner-resume-empty"><span class="learner-eyebrow">Bắt đầu học</span><h3>Chọn một chương và bài trong tab Học tập</h3><p>Ứng dụng sẽ tự lưu bài gần nhất, bookmark, checklist và ghi chú ngay trên thiết bị này.</p><button class="btn primary" type="button" data-l4-action="start">Mở lộ trình học</button></div>';
    }
    const checklist = checklistFor(lastLesson.lessonId);
    return `<div class="learner-resume" data-l4-resume="${escapeHtml(lastLesson.lessonId)}">
      <div><span class="learner-eyebrow">Tiếp tục học</span><h3>${escapeHtml(lastLesson.title)}</h3><p>${escapeHtml(lastLesson.stageTitle)} · ${escapeHtml(lastLesson.chapterTitle)}</p></div>
      <div class="learner-resume-progress"><b>${completedCount(checklist)}/3</b><span>mục đã hoàn thành</span><button class="btn primary" type="button" data-l4-action="resume">Học tiếp</button></div>
    </div>`;
  }

  function render() {
    renderQueued = false;
    const host = document.getElementById('learnerContext');
    if (!host) return;
    const state = coreState();
    const metadata = state.view === 'learning' && state.learnTab === 'theory' ? currentMetadata() : null;
    if (metadata && document.querySelector('[data-current-lesson]')) {
      updateLastLesson(metadata);
      host.innerHTML = learningContextHtml(metadata);
      host.hidden = false;
      host.dataset.mode = 'lesson';
      return;
    }
    if (state.view === 'overview') {
      host.innerHTML = resumeHtml(learnerState.lastLesson);
      host.hidden = false;
      host.dataset.mode = 'overview';
      return;
    }
    host.hidden = true;
    host.removeAttribute('data-mode');
    host.innerHTML = '';
  }

  function scheduleRender() {
    if (renderQueued) return;
    renderQueued = true;
    global.setTimeout(render, 40);
  }

  function openNotes() {
    const metadata = currentMetadata();
    const dialog = document.getElementById('learnerNotesDialog');
    const textarea = document.getElementById('learnerNotesText');
    const title = document.getElementById('learnerNotesTitle');
    if (!metadata || !dialog || !textarea) return;
    activeNoteLessonId = metadata.lessonId;
    textarea.value = learnerState.notes[activeNoteLessonId] || '';
    if (title) title.textContent = `Ghi chú · ${metadata.title}`;
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else dialog.setAttribute('open', '');
    global.setTimeout(function focusNotes() { textarea.focus(); }, 0);
  }

  function saveNote() {
    const textarea = document.getElementById('learnerNotesText');
    if (!activeNoteLessonId || !textarea) return;
    const value = textarea.value.trim();
    if (value) learnerState.notes[activeNoteLessonId] = value;
    else delete learnerState.notes[activeNoteLessonId];
    saveState();
    scheduleRender();
  }

  function resumeLearning() {
    const last = learnerState.lastLesson;
    const api = global.__BAUMAN_CORE_API;
    if (!last || !api || !api.state) {
      global.MathBaumanWebApp && global.MathBaumanWebApp.navigate('learning');
      return;
    }
    api.state.view = 'learning';
    api.state.learnTab = 'theory';
    api.state.lessonId = last.lessonId;
    api.state.e129LessonId = last.lessonId;
    api.state.e129ChapterId = last.chapterId;
    if (last.path) api.state.e186Path = clone(last.path);
    if (typeof api.save === 'function') api.save();
    if (typeof api.render === 'function') api.render();
    global.setTimeout(function renderTheory() {
      try {
        global.BAUMAN_MATH_THEORY_E129 && global.BAUMAN_MATH_THEORY_E129.render();
      } catch (_) {}
      scheduleRender();
    }, 80);
  }

  function handleClick(event) {
    const target = event.target && event.target.closest && event.target.closest('[data-l4-action]');
    if (!target) return;
    const action = target.getAttribute('data-l4-action');
    if (action === 'start') {
      global.MathBaumanWebApp && global.MathBaumanWebApp.navigate('learning');
      return;
    }
    if (action === 'resume') {
      resumeLearning();
      return;
    }
    const metadata = currentMetadata();
    if (!metadata) return;
    if (action === 'bookmark') {
      if (learnerState.bookmarks[metadata.lessonId]) delete learnerState.bookmarks[metadata.lessonId];
      else learnerState.bookmarks[metadata.lessonId] = { lessonId: metadata.lessonId, title: metadata.title };
      saveState();
      scheduleRender();
    }
    if (action === 'note') openNotes();
  }

  function handleChange(event) {
    const checkbox = event.target && event.target.closest && event.target.closest('[data-l4-check]');
    if (!checkbox) return;
    const metadata = currentMetadata();
    if (!metadata) return;
    const key = checkbox.getAttribute('data-l4-check');
    const checklist = checklistFor(metadata.lessonId);
    checklist[key] = Boolean(checkbox.checked);
    learnerState.checklists[metadata.lessonId] = checklist;
    saveState();
    scheduleRender();
  }

  function handleNoteSubmit(event) {
    const form = event.target && event.target.closest && event.target.closest('[data-l4-note-form]');
    if (!form) return;
    const submitter = event.submitter;
    if (submitter && submitter.value === 'save') saveNote();
  }

  function boot() {
    document.addEventListener('click', handleClick);
    document.addEventListener('change', handleChange);
    document.addEventListener('submit', handleNoteSubmit);
    const view = document.getElementById('view');
    if (view) new MutationObserver(scheduleRender).observe(view, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-current-lesson'] });
    scheduleRender();
  }

  global.MathBaumanLearnerUX = Object.freeze({
    release: RELEASE,
    storageKey: STORAGE_KEY,
    refresh: scheduleRender,
    resume: resumeLearning,
    snapshot: function snapshot() { return clone(learnerState); },
    selfCheck: function selfCheck() {
      return {
        ok: Boolean(document.getElementById('learnerContext') && document.getElementById('learnerNotesDialog')),
        release: RELEASE,
        storageHealthy,
        currentLessonId: currentLessonId(),
        hasResume: Boolean(learnerState.lastLesson),
        bookmarks: Object.keys(learnerState.bookmarks).length,
        notes: Object.keys(learnerState.notes).length
      };
    }
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})(window);
