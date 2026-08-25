# E205 Slideshow Stability Gate

Purpose: prevent the Math slideshow from becoming unstable again after the E190-E195 incident.

## Current rule

Only one slideshow runtime path may be active at a time.

Current active runtime:

- `assets/theory_skin/theory-slideshow-E202.js?v=202`

Do not add chapter-specific slideshow wrappers, post-render DOM decorators, or additional runtime engines after E202.

## Required gate before wiring another chapter

Before wiring any new chapter data into E202, the current runtime must pass local browser smoke.

Required smoke for E202 after C02 wiring:

1. Hard refresh browser after `git pull origin main`.
2. C01 → Lý thuyết → Trình chiếu:
   - Opens.
   - Uses Reader fallback.
   - No repeated movement.
   - Next/previous/escape/close work.
3. C02 §2.1-§2.6 → Lý thuyết → Trình chiếu:
   - Shows `C02 Level C` mode.
   - §2.1 and §2.2 show 20 slides.
   - §2.3-§2.6 show 18 slides.
   - Matrix visual block appears.
   - No repeated movement.
   - Next/previous/escape/close work.
4. C03 → Lý thuyết → Trình chiếu:
   - Opens.
   - Uses Reader fallback until C03 is deliberately wired.
   - No repeated movement.
5. Browser console: 0 errors.

## Allowed after smoke PASS

If all checks pass, the next safe step is:

- Wire C03 data into E202 by adding the C03 JSON URLs and chapter detection to the same E202 renderer.
- Keep the same single runtime path.
- Do not create a new runtime file unless it fully replaces E202 in `index.html`.
- Do not load E191/E193/E195 again.

## Not allowed

- No stacked slideshow wrappers.
- No post-render MutationObserver that decorates an already-open deck.
- No overriding `window.BAUMAN_MATH_THEORY_E132` from multiple files.
- No `slice(0,16)` or hard slide cap.
- No claiming PASS without a real local browser smoke.

## Deck length policy

16 slides is the minimum acceptable deck size, not the maximum.
Dense Level C lessons may use 18-28 slides when needed.
