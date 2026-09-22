#!/usr/bin/env python3
"""E179 Lesson-Level Content Coverage Gate for Math_Bauman.

Tracks both chapter-level source presence and true lesson-level completion.
A chapter is lesson-complete only when every canonical theory lesson in that
chapter has all eight supplemental source types. Incomplete content is reported
without being mislabeled as complete.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"

SUPPLEMENT_SOURCES = {
    "formula": "formula_content.json",
    "exercise": "exercise_content.json",
    "application": "application_content.json",
    "simulation": "simulation_content.json",
    "professor_qa": "professor_qa_content.json",
    "review": "review_pack_content.json",
    "question": "question_bank_content.json",
    "mindmap": "mindmap_content.json",
}


def load(name: str):
    return json.loads((DATA / name).read_text(encoding="utf-8"))


def records(payload):
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        for key in ("records", "questions", "items", "content"):
            value = payload.get(key)
            if isinstance(value, list):
                return value
    return []


def lesson_id(item: dict) -> str:
    return str(item.get("lessonId") or item.get("id") or "").strip()


def main() -> int:
    chapters = [
        x for x in load("chapter_spine.json")
        if isinstance(x, dict)
        and 1 <= int(x.get("globalChapterNo") or 0) <= 40
        and x.get("locked") is not True
    ]
    chapters.sort(key=lambda x: int(x.get("globalChapterNo") or 0))
    chapter_by_id = {
        str(x.get("chapterId") or x.get("id") or ""): x for x in chapters
    }

    # Runtime canonical set: overlay intentionally replaces/adds lesson IDs.
    canonical: dict[str, dict] = {}
    for item in records(load("theory_lecture_content.json")):
        if isinstance(item, dict) and lesson_id(item):
            canonical[lesson_id(item)] = item
    for item in records(load("theory_lecture_overlay_e138.json")):
        if isinstance(item, dict) and lesson_id(item):
            canonical[lesson_id(item)] = item
    canonical_theory = list(canonical.values())

    source_records = {
        name: records(load(filename))
        for name, filename in SUPPLEMENT_SOURCES.items()
    }
    source_by_lesson = {}
    for source_name, items in source_records.items():
        counts: dict[str, int] = {}
        for item in items:
            if not isinstance(item, dict):
                continue
            lid = str(item.get("lessonId") or "").strip()
            if lid:
                counts[lid] = counts.get(lid, 0) + 1
        source_by_lesson[source_name] = counts

    errors = []
    lessons = []
    for lid, item in canonical.items():
        source_no = int(item.get("sourceChapterNo") or 0)
        if not (1 <= source_no <= 40):
            continue
        counts = {
            source_name: source_by_lesson[source_name].get(lid, 0)
            for source_name in SUPPLEMENT_SOURCES
        }
        any_supplement = any(value > 0 for value in counts.values())
        fully_supplemented = all(value > 0 for value in counts.values())
        lessons.append({
            "lessonId": lid,
            "sourceChapterNo": source_no,
            "title": str(item.get("title") or item.get("lessonTitle") or ""),
            "counts": counts,
            "any": any_supplement,
            "full": fully_supplemented,
        })

    rows = []
    for chapter in chapters:
        no = int(chapter.get("globalChapterNo") or 0)
        cid = str(chapter.get("chapterId") or chapter.get("id") or "")
        chapter_lessons = [x for x in lessons if x["sourceChapterNo"] == no]
        row = {
            "no": no,
            "id": cid,
            "title": str(chapter.get("chapterTitle") or chapter.get("globalChapterTitle") or ""),
            "theory": len(chapter_lessons),
            "lessonsWithAnySupplement": sum(1 for x in chapter_lessons if x["any"]),
            "fullySupplementedLessons": sum(1 for x in chapter_lessons if x["full"]),
        }
        for name, items in source_records.items():
            row[name] = sum(
                1 for item in items
                if isinstance(item, dict) and str(item.get("chapterId") or "") == cid
            )
        row["allSourceTypesPresent"] = all(row[name] > 0 for name in SUPPLEMENT_SOURCES)
        row["lessonComplete"] = (
            row["theory"] > 0
            and row["fullySupplementedLessons"] == row["theory"]
        )
        rows.append(row)

    for item in canonical_theory:
        source_no = int(item.get("sourceChapterNo") or 0)
        if 1 <= source_no <= 40 and not any(r["no"] == source_no for r in rows):
            errors.append(
                f"theory lesson {lesson_id(item)!r} references missing active chapter no {source_no}"
            )

    for source_name, items in source_records.items():
        for index, item in enumerate(items):
            if not isinstance(item, dict):
                continue
            cid = str(item.get("chapterId") or "")
            if cid and cid not in chapter_by_id:
                errors.append(
                    f"{source_name}[{index}] references chapter outside active master spine: {cid}"
                )

    no_theory = [r for r in rows if r["theory"] <= 0]
    if no_theory:
        errors.extend(
            f"active master chapter {r['no']} has no canonical theory: {r['title']}"
            for r in no_theory
        )

    source_complete_chapters = [r for r in rows if r["allSourceTypesPresent"]]
    lesson_complete_chapters = [r for r in rows if r["lessonComplete"]]
    any_chapter_supplement = [r for r in rows if r["lessonsWithAnySupplement"] > 0]
    theory_only_chapters = [r for r in rows if r["lessonsWithAnySupplement"] == 0]
    supplemented_lessons = [x for x in lessons if x["any"]]
    full_lessons = [x for x in lessons if x["full"]]
    uncovered_lessons = [x for x in lessons if not x["any"]]
    uncovered_lessons.sort(key=lambda x: (x["sourceChapterNo"], x["lessonId"]))

    print("E179 Lesson-Level Content Coverage Gate")
    print(f"- Active master chapters: {len(rows)}")
    print(f"- Canonical master lessons: {len(lessons)}")
    print(f"- Theory-covered chapters: {sum(1 for r in rows if r['theory'] > 0)}")
    print(f"- Chapters with any supplemented lesson: {len(any_chapter_supplement)}")
    print(f"- Chapters with all 8 source types represented: {len(source_complete_chapters)}")
    print(f"- Truly lesson-complete chapters: {len(lesson_complete_chapters)}")
    print(f"- Lessons with any supplement: {len(supplemented_lessons)}")
    print(f"- Fully supplemented lessons: {len(full_lessons)}")
    print(f"- Theory-only chapters: {len(theory_only_chapters)}")
    print("- Source-complete chapter numbers: " + (
        ", ".join(str(r["no"]) for r in source_complete_chapters)
        if source_complete_chapters else "none"
    ))
    print("- Lesson-complete chapter numbers: " + (
        ", ".join(str(r["no"]) for r in lesson_complete_chapters)
        if lesson_complete_chapters else "none"
    ))
    print("- Next uncovered lessons: " + (
        ", ".join(
            f"C{x['sourceChapterNo']}:{x['lessonId']}"
            for x in uncovered_lessons[:12]
        ) if uncovered_lessons else "none"
    ))
    print(f"- Errors: {len(errors)}")

    for error in errors:
        print(f"ERROR: {error}")

    if errors:
        return 1

    print(
        "PASS: theory coverage is structurally complete; lesson-level "
        "supplemental progress is measured without chapter-level overstatement."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
