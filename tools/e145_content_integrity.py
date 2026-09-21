#!/usr/bin/env python3
"""E145 Runtime Content Integrity Gate for Math_Bauman.

No third-party dependencies. Fails closed on persisted content/metadata/reference
drift that can make the standalone Math Web App report or load the wrong state.
"""
from __future__ import annotations

import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
ERRORS: list[str] = []
WARNINGS: list[str] = []

ALLOWED_STAGES = {"vn", "prep", "hk1", "hk2", "hk3", "hk4"}
ALLOWED_LEVELS = {"easy", "medium", "hard", "expert"}
READINESS = {
    "standardExamReady": 20,
    "intensiveExamReady": 40,
    "advancedExamReady": 60,
    "deepExamReady": 100,
}


def fail(message: str) -> None:
    ERRORS.append(message)


def load_json(path: Path):
    try:
        return json.loads(path.read_text(encoding="utf-8"))
    except FileNotFoundError:
        fail(f"missing JSON: {path.relative_to(ROOT)}")
    except json.JSONDecodeError as exc:
        fail(f"invalid JSON: {path.relative_to(ROOT)}:{exc.lineno}:{exc.colno} {exc.msg}")
    return None


def records(payload) -> list:
    if isinstance(payload, list):
        return payload
    if isinstance(payload, dict):
        for key in ("records", "items", "questions", "content"):
            value = payload.get(key)
            if isinstance(value, list):
                return value
    return []


def check_manifest_counts() -> tuple[dict[str, int], dict]:
    path = DATA / "content_vault_manifest.json"
    manifest = load_json(path)
    counts: dict[str, int] = {}
    if not isinstance(manifest, dict):
        fail("content_vault_manifest.json must be an object")
        return counts, {}

    domains = manifest.get("domains")
    if not isinstance(domains, list) or not domains:
        fail("content_vault_manifest.json has no domains")
        return counts, manifest

    seen = set()
    for domain in domains:
        if not isinstance(domain, dict):
            fail("manifest domain is not an object")
            continue
        content_name = str(domain.get("content") or "")
        if not content_name:
            fail("manifest domain missing content name")
            continue
        if content_name in seen:
            fail(f"duplicate manifest content source: {content_name}")
        seen.add(content_name)

        payload = load_json(DATA / f"{content_name}.json")
        actual = len(records(payload))
        declared = domain.get("contentCount")
        counts[content_name] = actual
        if declared != actual:
            fail(f"{content_name}: manifest contentCount={declared!r}, actual={actual}")

    return counts, manifest


def check_adapter_counts(counts: dict[str, int]) -> None:
    path = ROOT / "assets" / "subject-adapter.js"
    try:
        text = path.read_text(encoding="utf-8")
    except FileNotFoundError:
        fail("missing assets/subject-adapter.js")
        return

    for name, count in counts.items():
        scalar = re.compile(rf'["\']{re.escape(name)}["\']\s*:\s*{count}\b')
        meta = re.compile(
            rf'["\']{re.escape(name)}["\']\s*:\s*\{{[^{{}}]*?'
            rf'["\']plannedCount["\']\s*:\s*{count}\b',
            re.S,
        )
        if not scalar.search(text):
            fail(f"subject-adapter counts drift: {name} != {count}")
        if not meta.search(text):
            fail(f"subject-adapter plannedCount drift: {name} != {count}")


def check_questions_and_blueprints() -> tuple[int, int]:
    q_payload = load_json(DATA / "question_bank_content.json")
    bp_payload = load_json(DATA / "test_blueprint_content.json")
    questions = records(q_payload)
    blueprints = records(bp_payload)

    question_by_id: dict[str, dict] = {}
    for index, question in enumerate(questions):
        if not isinstance(question, dict):
            fail(f"question[{index}] is not an object")
            continue
        qid = str(question.get("questionId") or question.get("id") or "")
        if not qid:
            fail(f"question[{index}] missing questionId")
            continue
        if qid in question_by_id:
            fail(f"duplicate questionId: {qid}")
            continue
        question_by_id[qid] = question

        options = question.get("options")
        if not isinstance(options, list) or len(options) != 4:
            fail(f"{qid}: expected exactly 4 options")
            continue
        option_text = [str(value) for value in options]
        if len(set(option_text)) != 4:
            fail(f"{qid}: duplicate answer options")
        if str(question.get("answer")) not in option_text:
            fail(f"{qid}: answer is not one of the options")

        stage = str(question.get("stage") or "")
        if stage not in ALLOWED_STAGES:
            fail(f"{qid}: invalid/missing stage {stage!r}")
        level = str(question.get("level") or question.get("difficulty") or "")
        if level not in ALLOWED_LEVELS:
            fail(f"{qid}: invalid/missing level {level!r}")

    blueprint_ids = set()
    for index, blueprint in enumerate(blueprints):
        if not isinstance(blueprint, dict):
            fail(f"blueprint[{index}] is not an object")
            continue
        bid = str(blueprint.get("blueprintId") or "")
        if not bid:
            fail(f"blueprint[{index}] missing blueprintId")
            continue
        if bid in blueprint_ids:
            fail(f"duplicate blueprintId: {bid}")
        blueprint_ids.add(bid)

        refs = blueprint.get("questionRefs")
        if not isinstance(refs, list):
            fail(f"{bid}: questionRefs must be an array")
            continue
        refs = [str(value) for value in refs]
        if len(refs) != len(set(refs)):
            fail(f"{bid}: duplicate questionRefs")
        missing = [qid for qid in refs if qid not in question_by_id]
        if missing:
            fail(f"{bid}: missing question refs: {', '.join(missing[:8])}")

        declared = blueprint.get("availableQuestionCount")
        if declared != len(refs):
            fail(f"{bid}: availableQuestionCount={declared!r}, refs={len(refs)}")

        distribution = blueprint.get("distribution")
        if not isinstance(distribution, dict):
            fail(f"{bid}: distribution must be an object")
        else:
            total = sum(int(distribution.get(level, 0) or 0) for level in ALLOWED_LEVELS)
            if total != len(refs):
                fail(f"{bid}: distribution total={total}, refs={len(refs)}")

        stage = str(blueprint.get("stage") or "")
        if stage not in ALLOWED_STAGES:
            fail(f"{bid}: invalid/missing stage {stage!r}")
        mismatched = [
            qid for qid in refs
            if qid in question_by_id and str(question_by_id[qid].get("stage") or "") != stage
        ]
        if mismatched:
            fail(f"{bid}: cross-stage refs: {', '.join(mismatched[:8])}")

        for flag, minimum in READINESS.items():
            expected = len(refs) >= minimum
            if bool(blueprint.get(flag)) != expected:
                fail(f"{bid}: {flag}={blueprint.get(flag)!r}, expected={expected} for {len(refs)} refs")

    return len(question_by_id), len(blueprint_ids)


def check_runtime_shell() -> None:
    index_path = ROOT / "index.html"
    try:
        text = index_path.read_text(encoding="utf-8")
    except FileNotFoundError:
        fail("missing index.html")
        return

    if "\\n" in text:
        fail("index.html contains literal \\n sequence")

    required_order = [
        "assets/core.js?v=134",
        "assets/runtime_content/theory-overlay-E138.js?v=138",
        "assets/runtime_content/content-vault-bridge-E140.js?v=140",
    ]
    positions = [text.find(src) for src in required_order]
    if any(pos < 0 for pos in positions) or positions != sorted(positions):
        fail(f"runtime script order invalid: {positions}")

    for src in re.findall(r'<script[^>]+src="([^"]+)"', text):
        local = src.split("?", 1)[0]
        if re.match(r"^https?://", local):
            continue
        if not (ROOT / local).is_file():
            fail(f"index.html references missing script: {local}")

    core = ROOT / "assets" / "core.js"
    if not core.is_file():
        fail("missing assets/core.js")
    elif core.stat().st_size < 100_000:
        fail(f"assets/core.js unexpectedly small: {core.stat().st_size} bytes")

    for path in (
        ROOT / "assets/runtime_content/theory-overlay-E138.js",
        ROOT / "assets/runtime_content/content-vault-bridge-E140.js",
    ):
        if not path.is_file():
            fail(f"missing runtime bridge: {path.relative_to(ROOT)}")


def check_bridge_contract(counts: dict[str, int]) -> None:
    bridge_path = ROOT / "assets/runtime_content/content-vault-bridge-E140.js"
    if not bridge_path.is_file():
        return
    bridge = bridge_path.read_text(encoding="utf-8")
    required = {
        "theory_lecture_content": "lessons:records(db.theory_lecture_content)",
        "formula_content": "formulas:records(db.formula_content)",
        "exercise_content": "exercises:records(db.exercise_content)",
        "application_content": "applications:records(db.application_content)",
        "simulation_content": "simulations:records(db.simulation_content)",
        "professor_qa_content": "professor_qa:records(db.professor_qa_content)",
        "review_pack_content": "review_packs:records(db.review_pack_content)",
        "question_bank_content": "question_bank:records(db.question_bank_content)",
        "test_blueprint_content": "test_blueprints:records(db.test_blueprint_content)",
    }
    for source, signature in required.items():
        if counts.get(source, 0) > 0 and signature not in bridge:
            fail(f"E140 bridge missing hydrated source mapping: {source}")


def main() -> int:
    counts, _manifest = check_manifest_counts()
    check_adapter_counts(counts)
    questions, blueprints = check_questions_and_blueprints()
    check_runtime_shell()
    check_bridge_contract(counts)

    print("E145 Runtime Content Integrity Gate")
    print(f"- Content Vault domains: {len(counts)}")
    print(f"- Questions: {questions}")
    print(f"- Blueprints: {blueprints}")
    print(f"- Errors: {len(ERRORS)}")
    print(f"- Warnings: {len(WARNINGS)}")

    if WARNINGS:
        for warning in WARNINGS:
            print(f"WARNING: {warning}")
    if ERRORS:
        for error in ERRORS:
            print(f"ERROR: {error}")
        return 1

    print("PASS: persisted content, metadata, references and runtime shell are consistent.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
