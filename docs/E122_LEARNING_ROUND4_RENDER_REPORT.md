# E122 Learning Round 4 · Render, Formula, Fallback, Responsive QA

## Scope
- Strengthen tab Học tập rendering without exporting a final zip.
- Keep the learning focus in the central board.
- Prevent empty content sources from producing blank panels.
- Render formula/ký hiệu through a safe frame.
- Add responsive safeguards for wide, medium, and narrow screens.

## Completed
1. Added active Round 4 renderer marker: `e122-round4-render`.
2. Rebuilt direct content boards for: theory, examples, exercises, practice, simulation, review, exam.
3. Added formula-safe deck: `e122-formula-deck` + `e122-math-safe`.
4. Added source audit cards to show connected frame/content JSON and required fields.
5. Added fallback plans when content JSON records are empty.
6. Added responsive CSS guards for 1320px, 1040px, and 720px.
7. Added self-check: `BAUMAN_MATH_E122_ROUND4_SELF_CHECK`.

## Export policy
No zip exported in this round. Final export remains reserved for lượt 6 after professional QA, cleanup, and final logic retest.

## Verification
- `node --check assets/core.js`: PASS
- `node --check assets/subject-adapter.js`: PASS
- `node --check assets/planning-bridge.js`: PASS
- 48 JSON files: PASS
- Static marker scan: PASS
- VM self-check `BAUMAN_MATH_E122_ROUND4_SELF_CHECK()`: PASS for 7/7 modes.

## Self-check modes
- theory: PASS
- examples: PASS
- exercises: PASS
- practice: PASS
- simulation: PASS
- review: PASS
- exam: PASS
