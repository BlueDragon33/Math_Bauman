# Slideshow QA E206 · Fallback observation

Status: FALLBACK_VISUAL_CASE_PASS_NEEDS_C02_LEVEL_C_TEST

Observed by user screenshot:
- The slideshow shows a `Reader fallback` panel.
- The old misleading visual `Input -> Matrix -> Output` is no longer shown in fallback mode.
- The panel states that the slide is sourced from Reader content.

Assessment:
- This is correct for C01 and C03 while C03 is still intentionally unwired.
- This is not sufficient to pass the whole slideshow feature.
- The next mandatory QA case is C02 Level C runtime.

Next required test:
1. Open C02 §2.1 → Lý thuyết → Trình chiếu.
   - Expected mode: `C02 Level C`.
   - Expected slide count: 20.
   - Expected visual: actual C02 matrix/data visual, not Reader fallback.
2. Open C02 §2.2 → Lý thuyết → Trình chiếu.
   - Expected mode: `C02 Level C`.
   - Expected slide count: 20.
3. Open C02 §2.3-§2.6.
   - Expected mode: `C02 Level C`.
   - Expected slide count: 18 each.
4. Open C03.
   - Expected mode: `Reader fallback` until C03 is wired later.
5. Browser console must show 0 errors.

If C02 shows `Reader fallback`:
- Treat it as a bug.
- Check whether JSON data was loaded.
- Check whether the selected lesson identifier is exposed through E129/E186 state.
- Run in Live Server, not direct file mode, because E206 fetches JSON data files.

Do not wire C03 until C02 Level C passes browser smoke.
