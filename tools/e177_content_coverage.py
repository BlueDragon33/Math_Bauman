#!/usr/bin/env python3
"""E177 Content Coverage Gate for Math_Bauman.

Tracks real master-path coverage without pretending incomplete supplemental
content is complete. Fails only on structural regressions: an active master
chapter without theory, malformed chapter references, or impossible coverage.
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

    theory = records(load("theory_lecture_content.json"))
    overlay = records(load("theory_lecture_overlay_e138.json"))
    canonical_theory = theory + overlay

    source_records = {
        name: records(load(filename))
        for name, filename in SUPPLEMENT_SOURCES.items()
    }

    rows = []
    errors = []
    for chapter in chapters:
        no = int(chapter.get("globalChapterNo") or 0)
        cid = str(chapter.get("chapterId") or chapter.get("id") or "")
        row = {
            "no": no,
            "id": cid,
            "title": str(chapter.get("chapterTitle") or chapter.get("globalChapterTitle") or ""),
            "theory": sum(
                1 for item in canonical_theory
                if isinstance(item, dict)
                and int(item.get("sourceChapterNo") or 0) == no
            ),
        }
        for name, items in source_records.items():
            row[name] = sum(
                1 for item in items
                if isinstance(item, dict) and str(item.get("chapterId") or "") == cid
            )
        rows.append(row)

    for item in canonical_theory:
        if not isinstance(item, dict):
            continue
        source_no = int(item.get("sourceChapterNo") or 0)
        if 1 <= source_no <= 40 and not any(r["no"] == source_no for r in rows):
            errors.append(
                f"theory lesson {item.get('lessonId')!r} references missing active chapter no {source_no}"
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

    full = [
        r for r in rows
        if r["theory"] > 0
        and all(r[name] > 0 for name in SUPPLEMENT_SOURCES)
    ]
    any_supplement = [
        r for r in rows
        if any(r[name] > 0 for name in SUPPLEMENT_SOURCES)
    ]
    zero_supplement = [
        r for r in rows
        if r["theory"] > 0
        and all(r[name] == 0 for name in SUPPLEMENT_SOURCES)
    ]

    print("E177 Content Coverage Gate")
    print(f"- Active master chapters: {len(rows)}")
    print(f"- Theory-covered chapters: {sum(1 for r in rows if r['theory'] > 0)}")
    print(f"- Chapters with any supplement: {len(any_supplement)}")
    print(f"- Fully supplemented chapters: {len(full)}")
    print(f"- Theory-only chapters: {len(zero_supplement)}")
    print("- Fully supplemented chapter numbers: " + (
        ", ".join(str(r["no"]) for r in full) if full else "none"
    ))
    print("- Next theory-only chapter numbers: " + (
        ", ".join(str(r["no"]) for r in zero_supplement[:12]) if zero_supplement else "none"
    ))
    print(f"- Errors: {len(errors)}")

    for error in errors:
        print(f"ERROR: {error}")

    if errors:
        return 1

    print("PASS: master theory coverage is structurally complete; supplemental coverage is tracked explicitly.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
