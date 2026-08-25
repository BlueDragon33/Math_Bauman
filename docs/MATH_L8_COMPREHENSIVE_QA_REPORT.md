# MATH L8 COMPREHENSIVE QA REPORT

Status: round8_comprehensive_qa_not_exported

## Scope
- Data integrity
- Manifest/data links
- JavaScript syntax
- Stage gate rules
- Exam difficulty mix
- Application/simulation links
- UX safety checks for content readability
- Main bridge unlock request check

## Results

| Check | Result |
|---|---|
| JSON parse | PASS |
| Manifest links | PASS |
| JS syntax | PASS |
| Stage gate coverage | PASS |
| Exam mix 30/30/20/20 | PASS |
| Application links | PASS |
| Learning content cut risk | PASS |
| Unlock request bridge | FIXED + PASS |
| 7-day unlock residue in active core | PASS |

## Data counts

| Data | Count |
|---|---:|
| Lessons | 72 |
| Concepts | 87 |
| Formulas/patterns | 61 |
| Exercises | 432 |
| Review/remediation items | 360 |
| Exam questions | 2200 |
| Application labs | 24 |
| Simulations | 36 |
| Projects | 7 |

## Exam coverage

- Stage-parts: 20/20
- Questions per stage-part: 110
- Difficulty totals:
  - easy: 680
  - medium: 680
  - good: 420
  - excellent: 420
- Remediation: 2200/2200 questions include lesson/concept remediation.

## Fix applied during L8

During QA, the core was found to update the internal stage gate on unlock, but it did not emit a `BAUMAN_UNLOCK_REQUEST` back to Main. This was fixed by adding `emitUnlockRequest()` and calling the PlanningBridge/postMessage path when unlocking next part or next stage.

## Packaging notes for L9

- Exclude internal backup folders under `data/_backup_before_l*` from final zip.
- Finalize visible version text from L8 QA to final release label.
- Keep stage gate, exam routing, and unlock request bridge unchanged unless a blocking bug appears.
