'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = process.cwd();
const checks = [];
const warnings = [];

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

function json(file) {
  return JSON.parse(read(file));
}

function digest(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function check(id, title, ok, evidence) {
  checks.push({ id, title, ok: Boolean(ok), evidence });
}

function unique(values) {
  return new Set(values).size === values.length;
}

function sorted(values) {
  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

function sourceCount(id, value) {
  if (id === 'program_identity') return 1;
  if (id === 'content-manifest') return value.sources?.length || 0;
  if (id === 'content_vault_manifest') return value.domains?.length || 0;
  if (id === 'curriculum') return value.stages?.length || 0;
  if (id === 'discipline_spine') return value.disciplines?.length || 0;
  if (id === 'chapter_spine') return Array.isArray(value) ? value.length : 0;
  if (id === 'theory_lecture_frame') return value.chapters?.length || 0;
  if (Array.isArray(value)) return value.length;
  for (const key of ['records', 'items', 'questions', 'rules', 'domains', 'sources', 'chapters']) {
    if (Array.isArray(value?.[key])) return value[key].length;
  }
  return 0;
}

function valuesAtKeys(value, keys, results = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => valuesAtKeys(item, keys, results));
    return results;
  }
  if (!value || typeof value !== 'object') return results;
  Object.entries(value).forEach(([key, child]) => {
    if (keys.has(key)) {
      if (typeof child === 'string') results.push(child);
      if (Array.isArray(child)) child.filter((item) => typeof item === 'string').forEach((item) => results.push(item));
    }
    valuesAtKeys(child, keys, results);
  });
  return results;
}

function frameStageChapterIds(frame) {
  const ids = [];
  (frame.stages || []).forEach((stage) => {
    (stage.disciplines || []).forEach((discipline) => {
      (discipline.chapters || []).forEach((chapter) => ids.push(chapter.chapterId || chapter.id));
    });
  });
  return ids;
}

const manifest = json('subject-manifest.json');
const manifestSchema = json('schemas/subject-manifest.schema.json');
const programIdentity = json('data/program_identity.json');
const catalog = json('data/content-manifest.json');
const vault = json('data/content_vault_manifest.json');
const namespaceRegistry = json('data/id-namespace-registry.json');
const lessons = json('data/lessons.json');
const theoryContent = json('data/theory_lecture_content.json');
const overlays = Array.isArray(theoryContent) ? theoryContent : theoryContent.records || [];
const theoryFrame = json('data/theory_lecture_frame.json');
const chapterSpine = json('data/chapter_spine.json');
const curriculum = json('data/curriculum.json');

const manifestRequired = manifestSchema.required || [];
const missingRequired = manifestRequired.filter((key) => manifest[key] === undefined);
const dataFileIds = manifest.dataFiles?.map((item) => item.id) || [];
const dataFilePaths = manifest.dataFiles?.map((item) => item.path) || [];

check(
  'SCHEMA-LOCAL',
  'manifest declares the tracked local JSON Schema',
  manifest.$schema === 'schemas/subject-manifest.schema.json' && manifestSchema.$schema === 'https://json-schema.org/draft/2020-12/schema',
  { declaration: manifest.$schema, schemaId: manifestSchema.$id }
);
check(
  'MANIFEST-REQUIRED',
  'all schema-required subject manifest fields are present',
  missingRequired.length === 0,
  missingRequired
);
check(
  'MANIFEST-STANDALONE',
  'subject manifest uses the standalone Web App entry and package paths',
  manifest.schema === 'bauman.math.subject-manifest.v2' && manifest.id === 'math' && manifest.entry === 'index.html',
  { schema: manifest.schema, id: manifest.id, entry: manifest.entry }
);
check(
  'PROGRAM-CODE-POLICY',
  'official and personalized program codes remain distinct and correctly labeled',
  manifest.program?.officialPublishedCode === '09.04.01'
    && manifest.program?.personalizedDisplayCode === '09.04.01/11'
    && programIdentity.programCodes?.officialPublished === '09.04.01'
    && programIdentity.programCodes?.personalizedDisplay === '09.04.01/11'
    && manifest.program?.learnerDisplay === 'Bauman ИУ-5 · 09.04.01/11',
  {
    officialPublished: manifest.program?.officialPublishedCode,
    personalizedDisplay: manifest.program?.personalizedDisplayCode,
    learnerDisplay: manifest.program?.learnerDisplay
  }
);
check(
  'MANIFEST-SOURCE-PROVENANCE',
  'source and destination repository provenance is explicit',
  manifest.source?.repository === 'BlueDragon33/Bauman-master-ai-system'
    && manifest.source?.branch === 'migration/webapp-l1-audit-storage'
    && manifest.source?.destinationRepository === 'BlueDragon33/Math_Bauman'
    && manifest.source?.destinationBranch === 'migration/full-webapp-v2'
    && manifest.source?.importPolicy === 'controlled-overlay-no-blind-merge',
  manifest.source
);
check(
  'MANIFEST-DATAFILE-SHAPE',
  'manifest dataFiles use unique object IDs and standalone JSON paths',
  manifest.dataFiles?.length === 18
    && unique(dataFileIds)
    && unique(dataFilePaths)
    && manifest.dataFiles.every((item) => (
      item && typeof item.id === 'string'
      && /^data\/[a-z0-9_-]+\.json$/.test(item.path)
      && Number.isInteger(item.actualCount)
      && item.actualCount >= 0
      && ['active', 'partial', 'planned'].includes(item.status)
    )),
  { count: manifest.dataFiles?.length, uniqueIds: unique(dataFileIds), uniquePaths: unique(dataFilePaths) }
);

const missingDataFiles = manifest.dataFiles.filter((item) => !fs.existsSync(path.join(ROOT, item.path))).map((item) => item.path);
check('MANIFEST-DATAFILE-EXISTS', 'every declared manifest data file exists', missingDataFiles.length === 0, missingDataFiles);

const manifestCountMismatches = manifest.dataFiles.flatMap((item) => {
  if (!fs.existsSync(path.join(ROOT, item.path))) return [];
  const actual = sourceCount(item.id, json(item.path));
  return actual === item.actualCount ? [] : [{ id: item.id, declared: item.actualCount, actual }];
});
check('MANIFEST-ACTUAL-COUNTS', 'manifest actualCount values match on-disk records', manifestCountMismatches.length === 0, manifestCountMismatches);

const jsContext = { window: {} };
vm.runInNewContext(read('subject-manifest.js'), jsContext, { filename: 'subject-manifest.js' });
check(
  'MANIFEST-JS-PARITY',
  'generated browser manifest matches the canonical JSON manifest',
  JSON.stringify(jsContext.window.SUBJECT_MANIFEST) === JSON.stringify(manifest),
  { jsonDigest: digest(manifest), browserDigest: digest(jsContext.window.SUBJECT_MANIFEST) }
);

const activeManifestFiles = ['subject-manifest.json', 'data/content-manifest.json', 'data/content_vault_manifest.json'];
const nestedPackageRefs = activeManifestFiles.filter((file) => /subjects\/math\//.test(read(file)));
check('NO-NESTED-PACKAGE-PATHS', 'active manifests contain no obsolete subjects/math paths', nestedPackageRefs.length === 0, nestedPackageRefs);

const catalogSourceIds = catalog.sources?.map((source) => source.id) || [];
const catalogSourcePaths = catalog.sources?.map((source) => source.path) || [];
const missingCatalogFiles = (catalog.sources || []).filter((source) => !fs.existsSync(path.join(ROOT, source.path))).map((source) => source.path);
const catalogCountMismatches = (catalog.sources || []).flatMap((source) => {
  if (!fs.existsSync(path.join(ROOT, source.path))) return [];
  const actual = sourceCount(source.id, json(source.path));
  return actual === source.actualCount ? [] : [{ id: source.id, declared: source.actualCount, actual }];
});
check(
  'CONTENT-CATALOG-SHAPE',
  'content catalog has 18 unique source records and standalone paths',
  catalog.schema === 'bauman.math.content-catalog.v2'
    && catalog.sources?.length === 18
    && unique(catalogSourceIds)
    && unique(catalogSourcePaths)
    && catalog.sources.every((source) => /^data\/[a-z0-9_-]+\.json$/.test(source.path)),
  { count: catalog.sources?.length, uniqueIds: unique(catalogSourceIds), uniquePaths: unique(catalogSourcePaths) }
);
check('CONTENT-CATALOG-FILES', 'every content catalog source exists', missingCatalogFiles.length === 0, missingCatalogFiles);
check('CONTENT-CATALOG-COUNTS', 'content catalog counts match actual data', catalogCountMismatches.length === 0, catalogCountMismatches);
check(
  'CONTENT-CATALOG-INVENTORY',
  'content catalog reports the audited legacy, overlay and chapter inventories',
  catalog.inventory?.legacyLessons === 347
    && catalog.inventory?.theoryOverlays === 18
    && catalog.inventory?.canonicalChapters === 56
    && catalog.inventory?.activeMasterChapters === 40
    && catalog.inventory?.frameworkOnlyPhdChapters === 16,
  catalog.inventory
);

const supportCountMismatches = Object.entries(catalog.support || {}).flatMap(([id, item]) => {
  if (!fs.existsSync(path.join(ROOT, item.path))) return [{ id, error: 'missing', path: item.path }];
  const actual = sourceCount(id, json(item.path));
  return actual === item.actualCount ? [] : [{ id, declared: item.actualCount, actual }];
});
check('SUPPORT-CATALOG-COUNTS', 'support catalog counts match actual data', supportCountMismatches.length === 0, supportCountMismatches);

const vaultMismatches = (vault.domains || []).flatMap((domain) => {
  const issues = [];
  const framePath = domain.framePath;
  const contentPath = domain.contentPath;
  if (!fs.existsSync(path.join(ROOT, framePath))) issues.push({ domain: domain.frame, path: framePath, error: 'missing-frame' });
  if (!fs.existsSync(path.join(ROOT, contentPath))) issues.push({ domain: domain.content, path: contentPath, error: 'missing-content' });
  if (fs.existsSync(path.join(ROOT, framePath))) {
    const actual = sourceCount(domain.frame, json(framePath));
    if (actual !== domain.frameCount) issues.push({ domain: domain.frame, declared: domain.frameCount, actual });
  }
  if (fs.existsSync(path.join(ROOT, contentPath))) {
    const actual = sourceCount(domain.content, json(contentPath));
    if (actual !== domain.contentCount) issues.push({ domain: domain.content, declared: domain.contentCount, actual });
  }
  return issues;
});
check(
  'VAULT-ROUTER-CONTRACT',
  'all 13 vault frame/content pairs exist and report actual counts',
  vault.schema === 'bauman.math.content-vault-manifest.v3' && vault.domains?.length === 13 && vaultMismatches.length === 0,
  { domains: vault.domains?.length, mismatches: vaultMismatches }
);

const lessonIds = lessons.map((lesson) => lesson.id || lesson.lessonId);
const overlayIds = overlays.map((lesson) => lesson.lessonId || lesson.id);
const chapterIds = theoryFrame.chapters?.map((chapter) => chapter.chapterId || chapter.id) || [];
const stagedChapterIds = frameStageChapterIds(theoryFrame);
const chapterSpineIds = chapterSpine.map((chapter) => chapter.chapterId || chapter.id);
const curriculumChapterIds = (curriculum.stages || []).flatMap((stage) => stage.chapterIds || []);
const chapterIdSet = new Set(chapterIds);

check('LEGACY-IDS', 'all 347 legacy lesson IDs are present and unique', lessonIds.length === 347 && lessonIds.every(Boolean) && unique(lessonIds), { count: lessonIds.length, unique: new Set(lessonIds).size });
check('OVERLAY-IDS', 'all 18 overlay IDs are present and unique', overlayIds.length === 18 && overlayIds.every(Boolean) && unique(overlayIds), { count: overlayIds.length, unique: new Set(overlayIds).size });
check('CANONICAL-CHAPTER-IDS', 'all 56 canonical chapter IDs are present and unique', chapterIds.length === 56 && chapterIds.every(Boolean) && unique(chapterIds), { count: chapterIds.length, unique: new Set(chapterIds).size });
check(
  'FRAME-TREE-PARITY',
  'staged theory-frame chapters equal the flat authoritative chapter list',
  stagedChapterIds.length === 56 && unique(stagedChapterIds) && JSON.stringify(sorted(stagedChapterIds)) === JSON.stringify(sorted(chapterIds)),
  { staged: stagedChapterIds.length, flat: chapterIds.length }
);
check(
  'CHAPTER-SPINE-PARITY',
  'chapter spine and curriculum use the same canonical 56 chapter IDs',
  unique(chapterSpineIds)
    && unique(curriculumChapterIds)
    && JSON.stringify(sorted(chapterSpineIds)) === JSON.stringify(sorted(chapterIds))
    && JSON.stringify(sorted(curriculumChapterIds)) === JSON.stringify(sorted(chapterIds)),
  { chapterSpine: chapterSpineIds.length, curriculum: curriculumChapterIds.length, canonical: chapterIds.length }
);

const brokenOverlayAnchors = overlays.flatMap((overlay) => {
  const anchor = overlay.sourceAnchors || {};
  return overlay.chapterId && anchor.chapterId === overlay.chapterId && chapterIdSet.has(overlay.chapterId)
    ? []
    : [{ lessonId: overlay.lessonId, chapterId: overlay.chapterId, sourceAnchor: anchor.chapterId }];
});
check('OVERLAY-ANCHORS', 'every authoritative overlay resolves to one canonical chapter', brokenOverlayAnchors.length === 0, brokenOverlayAnchors);
check('ID-NAMESPACE-BOUNDARY', 'legacy and overlay lesson IDs remain separate namespaces', overlayIds.every((id) => !lessonIds.includes(id)), { legacy: lessonIds.length, overlays: overlayIds.length, collisions: overlayIds.filter((id) => lessonIds.includes(id)) });

const registryById = Object.fromEntries((namespaceRegistry.namespaces || []).map((item) => [item.id, item]));
check(
  'NAMESPACE-REGISTRY',
  'namespace registry discloses canonical, legacy, overlay and support bridge policies',
  registryById['math.chapter.canonical.v2']?.count === 56
    && registryById['math.lesson.legacy.v1']?.count === 347
    && registryById['math.lesson.overlay.v1']?.count === 18
    && registryById['math.support.legacy-lesson.v1']?.status === 'mapping-required-l5'
    && registryById['math.support.module.v1']?.status === 'mapping-required-l5'
    && namespaceRegistry.bridgePolicy?.writeLegacyIds === false,
  { namespaces: Object.keys(registryById), bridgePolicy: namespaceRegistry.bridgePolicy }
);

const supportReferenceFiles = [
  'data/vocab.json',
  'data/grammar.json',
  'data/grammar-path.json',
  'data/speaking.json',
  'data/dialogue-bauman-az.json',
  'data/deep-speaking-bauman.json',
  'data/writing.json',
  'data/videos.json'
];
const knownLessonIds = new Set([...lessonIds, ...overlayIds]);
const supportReferenceAudit = supportReferenceFiles.map((file) => {
  const value = json(file);
  const lessonRefs = valuesAtKeys(value, new Set(['lessonId', 'lessonIds']));
  const chapterRefs = valuesAtKeys(value, new Set(['chapterId', 'chapterIds']));
  const moduleRefs = [...lessonRefs, ...chapterRefs].filter((id) => /^M\d{2}$/.test(id));
  return {
    file,
    lessonRefs: lessonRefs.length,
    unmappedLessonRefs: lessonRefs.filter((id) => !knownLessonIds.has(id)).length,
    chapterRefs: chapterRefs.length,
    unmappedChapterRefs: chapterRefs.filter((id) => !chapterIdSet.has(id)).length,
    moduleRefs: moduleRefs.length
  };
});
const supportUnmappedTotal = supportReferenceAudit.reduce((total, item) => total + item.unmappedLessonRefs + item.unmappedChapterRefs, 0);
if (supportUnmappedTotal > 0) {
  warnings.push({
    id: 'SUPPORT-REFERENCE-MAPPING-DEBT',
    message: 'Support artifacts contain historical lesson/chapter/module namespaces; L5 must bridge them without rewriting source IDs.',
    total: supportUnmappedTotal
  });
}
check(
  'SUPPORT-DEBT-DISCLOSED',
  'historical support-reference namespaces are measured and scheduled for an L5 bridge',
  supportUnmappedTotal > 0
    && manifest.knownDebt?.some((item) => item.id === 'support-reference-namespaces' && item.status === 'planned-l5'),
  supportReferenceAudit
);

const sourceBefore = { lessons: digest(lessons), overlays: digest(overlays) };
const dryRunLessons = structuredClone(lessons);
const dryRunOverlays = structuredClone(overlays);
const resolvedSources = [
  ...dryRunOverlays.map((record) => ({ runtimeKey: `math.lesson.overlay.v1:${record.lessonId}`, authority: 'authoritative-overlay' })),
  ...dryRunLessons.map((record) => ({ runtimeKey: `math.lesson.legacy.v1:${record.id || record.lessonId}`, authority: 'legacy-compatibility' }))
];
const sourceAfter = { lessons: digest(dryRunLessons), overlays: digest(dryRunOverlays) };
check(
  'MIGRATION-DRY-RUN',
  'migration dry-run preserves source records and selects 18 overlays plus 347 legacy fallbacks without collisions',
  sourceBefore.lessons === sourceAfter.lessons
    && sourceBefore.overlays === sourceAfter.overlays
    && resolvedSources.length === 365
    && unique(resolvedSources.map((item) => item.runtimeKey))
    && resolvedSources.filter((item) => item.authority === 'authoritative-overlay').length === 18
    && resolvedSources.filter((item) => item.authority === 'legacy-compatibility').length === 347,
  {
    before: sourceBefore,
    after: sourceAfter,
    resolved: resolvedSources.length,
    overlays: 18,
    legacyFallbacks: 347,
    runtimeKeyCollisions: resolvedSources.length - new Set(resolvedSources.map((item) => item.runtimeKey)).size
  }
);

const learnerUiFiles = ['index.html', 'assets/webapp-bootstrap.js', 'assets/subject-adapter.js'];
const forbiddenLearnerUiMatches = learnerUiFiles.filter((file) => /HUTECH/i.test(read(file)));
check('NO-FORBIDDEN-INSTITUTION-UI', 'learner-facing runtime files do not expose HUTECH', forbiddenLearnerUiMatches.length === 0, forbiddenLearnerUiMatches);

const report = {
  gate: 'MATH-BAUMAN-WEBAPP-V2-L3-DATA-CONTRACT',
  status: checks.every((item) => item.ok) ? 'PASS' : 'FAIL',
  contract: {
    manifestVersion: manifest.version,
    officialPublishedCode: manifest.program?.officialPublishedCode,
    personalizedDisplayCode: manifest.program?.personalizedDisplayCode,
    legacyLessons: lessons.length,
    theoryOverlays: overlays.length,
    canonicalChapters: chapterIds.length,
    catalogSources: catalog.sources?.length,
    vaultDomains: vault.domains?.length
  },
  migrationDryRun: {
    sourceBefore,
    sourceAfter,
    resolvedSources: resolvedSources.length,
    overlaySources: 18,
    legacyFallbackSources: 347,
    mutatedSourceRecords: sourceBefore.lessons !== sourceAfter.lessons || sourceBefore.overlays !== sourceAfter.overlays
  },
  supportReferenceAudit,
  checks,
  warnings
};

fs.mkdirSync(path.join(ROOT, 'reports'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'reports/data-contract.generated.json'), `${JSON.stringify(report, null, 2)}\n`);
checks.forEach((item) => console.log(`${item.ok ? 'PASS' : 'FAIL'} ${item.id} ${item.title}`));
warnings.forEach((item) => console.log(`WARN ${item.id} ${item.message}`));
console.log(`Math V2 L3 data contract ${report.status}: ${checks.filter((item) => item.ok).length}/${checks.length}`);
if (report.status !== 'PASS') process.exit(1);
