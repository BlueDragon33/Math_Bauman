# E122 Learning Tab Round 6 Final QA

Scope:
- Lock final active `renderLearning()` as `e122-learning-final-tested`.
- Keep core E121 Overview/Schedule compatible.
- Verify 7 learning modes: theory, examples, exercises, practice, simulation, review, exam.
- Verify lessonId priority over stale activeChapterId.
- Verify no `undefined`, `null`, `[object Object]`, or `renderFormula is not defined` in final learning HTML.
- Bump cache to v=122.

Result: final self-check is exposed as `BAUMAN_MATH_E122_FINAL_SELF_CHECK` and assigned to `BAUMAN_MATH_FINAL_SELF_CHECK`.
