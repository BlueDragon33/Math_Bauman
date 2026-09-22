#!/usr/bin/env python3
"""E182 Supplemental Bundle Builder for Math_Bauman.

Validates and applies one lesson-level supplemental bundle across the eight
canonical non-theory sources, then reconciles all federated count metadata.

Usage:
  python3 tools/e182_supplement_bundle_builder.py path/to/bundle.json
  python3 tools/e182_supplement_bundle_builder.py path/to/bundle.json --apply
  python3 tools/e182_supplement_bundle_builder.py --self-test

Default mode is dry-run/validation only. --apply writes repository files.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

SOURCE_SPECS = {
    "formula_content": ("formula_content.json", "formulaId"),
    "exercise_content": ("exercise_content.json", "exerciseId"),
    "application_content": ("application_content.json", "applicationId"),
    "simulation_content": ("simulation_content.json", "simulationId"),
    "professor_qa_content": ("professor_qa_content.json", "qaId"),
    "review_pack_content": ("review_pack_content.json", "reviewPackId"),
    "question_bank_content": ("question_bank_content.json", "questionId"),
    "mindmap_content": ("mindmap_content.json", "mindmapId"),
}


def load_json(path: Path) -> Any:
    with path.open("r", encoding="utf-8") as fh:
        return json.load(fh)


def dump_json(path: Path, payload: Any) -> None:
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def records(payload: Any) -> list[dict]:
    if isinstance(payload, list):
        return [x for x in payload if isinstance(x, dict)]
    if isinstance(payload, dict):
        for key in ("records", "questions", "items", "content"):
            value = payload.get(key)
            if isinstance(value, list):
                return [x for x in value if isinstance(x, dict)]
    return []


def canonical_lessons() -> dict[str, dict]:
    canonical: dict[str, dict] = {}
    for name in ("theory_lecture_content.json", "theory_lecture_overlay_e138.json"):
        for item in records(load_json(DATA / name)):
            lesson_id = str(item.get("lessonId") or item.get("id") or "").strip()
            if lesson_id:
                canonical[lesson_id] = item
    return canonical


def chapter_by_no() -> dict[int, dict]:
    out: dict[int, dict] = {}
    for item in records(load_json(DATA / "chapter_spine.json")):
        no = int(item.get("globalChapterNo") or item.get("chapterNo") or 0)
        if no:
            out[no] = item
    return out


def canonical_chapter_id(lesson: dict) -> str:
    source_no = int(lesson.get("sourceChapterNo") or 0)
    chapter = chapter_by_no().get(source_no) or {}
    return str(chapter.get("chapterId") or chapter.get("id") or "").strip()


def source_array(payload: dict) -> list[dict]:
    if isinstance(payload.get("records"), list):
        return payload["records"]
    if isinstance(payload.get("questions"), list):
        return payload["questions"]
    raise ValueError("source JSON must contain records[] or questions[]")


def validate_bundle(bundle: dict) -> list[str]:
    errors: list[str] = []
    lesson_id = str(bundle.get("lessonId") or "").strip()
    chapter_id = str(bundle.get("chapterId") or "").strip()
    sources = bundle.get("sources")

    if not lesson_id:
        errors.append("bundle.lessonId is required")
    if not chapter_id:
        errors.append("bundle.chapterId is required")
    if not isinstance(sources, dict):
        errors.append("bundle.sources must be an object")
        return errors

    canonical = canonical_lessons()
    lesson = canonical.get(lesson_id)
    if not lesson:
        errors.append(f"lessonId {lesson_id!r} is not canonical")
    else:
        expected_chapter = canonical_chapter_id(lesson)
        if expected_chapter and chapter_id != expected_chapter:
            errors.append(
                f"chapterId mismatch: bundle={chapter_id!r}, canonical={expected_chapter!r}"
            )

    missing = [name for name in SOURCE_SPECS if not isinstance(sources.get(name), list) or not sources.get(name)]
    if missing:
        errors.append("all eight sources must be non-empty: " + ", ".join(missing))

    for source_name, (_, key_name) in SOURCE_SPECS.items():
        items = sources.get(source_name)
        if not isinstance(items, list):
            continue
        seen: set[str] = set()
        for index, item in enumerate(items):
            if not isinstance(item, dict):
                errors.append(f"{source_name}[{index}] must be an object")
                continue
            key = str(item.get(key_name) or "").strip()
            if not key:
                errors.append(f"{source_name}[{index}] missing {key_name}")
            elif key in seen:
                errors.append(f"{source_name} duplicate bundle key {key!r}")
            seen.add(key)
            if str(item.get("lessonId") or "").strip() != lesson_id:
                errors.append(f"{source_name}[{index}] lessonId drift")
            if str(item.get("chapterId") or "").strip() != chapter_id:
                errors.append(f"{source_name}[{index}] chapterId drift")
    return errors


def upsert_source(source_name: str, incoming: list[dict]) -> tuple[int, int, int]:
    filename, key_name = SOURCE_SPECS[source_name]
    path = DATA / filename
    payload = load_json(path)
    target = source_array(payload)
    positions = {
        str(item.get(key_name) or ""): index
        for index, item in enumerate(target)
        if str(item.get(key_name) or "")
    }
    inserted = 0
    replaced = 0
    for item in incoming:
        key = str(item.get(key_name) or "")
        if key in positions:
            target[positions[key]] = item
            replaced += 1
        else:
            positions[key] = len(target)
            target.append(item)
            inserted += 1
    if isinstance(payload, dict):
        payload["updatedAt"] = "2026-09-22"
    dump_json(path, payload)
    return inserted, replaced, len(target)


def current_counts() -> dict[str, int]:
    counts = {}
    for source_name, (filename, _) in SOURCE_SPECS.items():
        counts[source_name] = len(records(load_json(DATA / filename)))
    return counts


def reconcile_content_manifest(counts: dict[str, int]) -> None:
    path = DATA / "content-manifest.json"
    manifest = load_json(path)
    manifest.setdefault("counts", {}).update(counts)
    for row in manifest.get("dataSources", []):
        if isinstance(row, dict) and row.get("id") in counts:
            value = counts[row["id"]]
            row["plannedCount"] = value
            row["recordCount"] = value
    manifest["updatedAt"] = "2026-09-22"
    dump_json(path, manifest)


def reconcile_vault_manifest(counts: dict[str, int]) -> None:
    path = DATA / "content_vault_manifest.json"
    manifest = load_json(path)
    for domain in manifest.get("domains", []):
        if isinstance(domain, dict) and domain.get("content") in counts:
            domain["contentCount"] = counts[domain["content"]]
    manifest["updatedAt"] = "2026-09-22"
    dump_json(path, manifest)


def reconcile_subject_manifest_payload(manifest: dict, counts: dict[str, int]) -> dict:
    manifest.setdefault("data", {}).update(counts)
    if isinstance(manifest.get("counts"), dict):
        manifest["counts"].update(counts)
    for row in manifest.get("externalDataFiles", []):
        if isinstance(row, dict) and row.get("id") in counts:
            source_name = row["id"]
            value = counts[source_name]
            row["path"] = f"data/{source_name}.json"
            row["plannedCount"] = value
            if "recordCount" in row:
                row["recordCount"] = value
    for row in manifest.get("dataSources", []):
        if isinstance(row, dict) and row.get("id") in counts:
            value = counts[row["id"]]
            row["plannedCount"] = value
            row["recordCount"] = value
    meta = manifest.get("dataSourceMeta")
    if isinstance(meta, dict):
        for name, value in counts.items():
            if isinstance(meta.get(name), dict):
                meta[name]["plannedCount"] = value
    manifest["updatedAt"] = "2026-09-22"
    return manifest


def reconcile_subject_manifests(counts: dict[str, int]) -> None:
    json_path = ROOT / "subject-manifest.json"
    manifest = reconcile_subject_manifest_payload(load_json(json_path), counts)
    dump_json(json_path, manifest)
    js_path = ROOT / "subject-manifest.js"
    js_path.write_text(
        "window.SUBJECT_MANIFEST = "
        + json.dumps(manifest, ensure_ascii=False, indent=2)
        + ";\n",
        encoding="utf-8",
    )


def reconcile_adapter(counts: dict[str, int]) -> None:
    path = ROOT / "assets" / "subject-adapter.js"
    text = path.read_text(encoding="utf-8")
    for name, value in counts.items():
        scalar = re.compile(rf'(["\']{re.escape(name)}["\']\s*:\s*)\d+(?=\s*[,}}])')
        meta = re.compile(
            rf'(["\']{re.escape(name)}["\']\s*:\s*\{{[^{{}}]*?'
            rf'["\']plannedCount["\']\s*:\s*)\d+(?=\s*[,}}])',
            re.S,
        )
        text, scalar_n = scalar.subn(rf"\g<1>{value}", text, count=1)
        text, meta_n = meta.subn(rf"\g<1>{value}", text, count=1)
        if scalar_n != 1 or meta_n != 1:
            raise RuntimeError(
                f"adapter reconciliation failed for {name}: scalar={scalar_n}, meta={meta_n}"
            )
    path.write_text(text, encoding="utf-8")


def reconcile_all(counts: dict[str, int]) -> None:
    reconcile_content_manifest(counts)
    reconcile_vault_manifest(counts)
    reconcile_subject_manifests(counts)
    reconcile_adapter(counts)


def validate_federation() -> list[str]:
    errors: list[str] = []
    counts = current_counts()
    vault = load_json(DATA / "content_vault_manifest.json")
    content_manifest = load_json(DATA / "content-manifest.json")
    subject_manifest = load_json(ROOT / "subject-manifest.json")

    vault_counts = {
        str(d.get("content")): int(d.get("contentCount") or 0)
        for d in vault.get("domains", [])
        if isinstance(d, dict) and d.get("content") in counts
    }
    cm_counts = content_manifest.get("counts") or {}
    cm_sources = {
        str(x.get("id")): x
        for x in content_manifest.get("dataSources", [])
        if isinstance(x, dict)
    }
    sm_data = subject_manifest.get("data") or {}
    sm_sources = {
        str(x.get("id")): x
        for x in subject_manifest.get("externalDataFiles", [])
        if isinstance(x, dict)
    }

    for name, actual in counts.items():
        if vault_counts.get(name) != actual:
            errors.append(f"vault drift {name}: {vault_counts.get(name)} != {actual}")
        if cm_counts.get(name) != actual:
            errors.append(f"content-manifest count drift {name}")
        if (cm_sources.get(name) or {}).get("plannedCount") != actual:
            errors.append(f"content-manifest plannedCount drift {name}")
        if sm_data.get(name) != actual:
            errors.append(f"subject-manifest data drift {name}")
        if (sm_sources.get(name) or {}).get("plannedCount") != actual:
            errors.append(f"subject-manifest external plannedCount drift {name}")

    js_path = ROOT / "subject-manifest.js"
    js_text = js_path.read_text(encoding="utf-8").strip()
    prefix = "window.SUBJECT_MANIFEST = "
    try:
        if not js_text.startswith(prefix) or not js_text.endswith(";"):
            raise ValueError("wrapper")
        js_manifest = json.loads(js_text[len(prefix):-1])
        if js_manifest != subject_manifest:
            errors.append("subject-manifest.js/json drift")
    except Exception as exc:
        errors.append(f"subject-manifest.js invalid: {exc}")

    adapter = (ROOT / "assets" / "subject-adapter.js").read_text(encoding="utf-8")
    for name, actual in counts.items():
        scalar = re.search(rf'["\']{re.escape(name)}["\']\s*:\s*{actual}\b', adapter)
        meta = re.search(
            rf'["\']{re.escape(name)}["\']\s*:\s*\{{[^{{}}]*?'
            rf'["\']plannedCount["\']\s*:\s*{actual}\b',
            adapter,
            re.S,
        )
        if not scalar:
            errors.append(f"adapter scalar drift {name}")
        if not meta:
            errors.append(f"adapter plannedCount drift {name}")
    return errors


def self_test() -> int:
    errors = validate_federation()
    print("E182 Supplemental Bundle Builder Self-Test")
    print("- Sources: " + ", ".join(f"{k}={v}" for k, v in current_counts().items()))
    print(f"- Errors: {len(errors)}")
    for error in errors:
        print("ERROR:", error)
    if errors:
        return 1
    print("PASS: bundle builder federation contract is healthy.")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("bundle", nargs="?")
    parser.add_argument("--apply", action="store_true")
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()

    if args.self_test:
        return self_test()
    if not args.bundle:
        parser.error("bundle path is required unless --self-test is used")

    bundle_path = Path(args.bundle)
    bundle = load_json(bundle_path)
    if not isinstance(bundle, dict):
        print("ERROR: bundle root must be an object", file=sys.stderr)
        return 2

    errors = validate_bundle(bundle)
    if errors:
        for error in errors:
            print("ERROR:", error, file=sys.stderr)
        return 2

    lesson_id = str(bundle["lessonId"])
    print(f"E182 bundle valid: {lesson_id}")
    for source_name in SOURCE_SPECS:
        print(f"- {source_name}: {len(bundle['sources'][source_name])}")

    if not args.apply:
        print("DRY RUN: no files changed. Re-run with --apply to write.")
        return 0

    for source_name in SOURCE_SPECS:
        inserted, replaced, total = upsert_source(source_name, bundle["sources"][source_name])
        print(f"- applied {source_name}: +{inserted}, replaced={replaced}, total={total}")

    counts = current_counts()
    reconcile_all(counts)
    federation_errors = validate_federation()
    if federation_errors:
        for error in federation_errors:
            print("ERROR:", error, file=sys.stderr)
        return 1
    print("PASS: bundle applied and all federated counts reconciled.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
