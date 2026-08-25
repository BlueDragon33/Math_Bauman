# E119 Round 1 · Overview Total Rebuild Audit & Blueprint

## Scope
Round 1 covers steps 1-3 only. No final ZIP is exported in this round.

## Step 1 · Overview / Schedule audit

### Active overview chain
- Base `renderOverview()` exists near line 896.
- E108 appends another `renderOverview=function(){...}` near line 8024.
- E112 appends the currently active `renderOverview=function(){...}` near line 8152.
- Result: Overview is not a single clean layout. It is a stacked override chain.

### Active schedule popup chain
`renderRouteModal()` is defined or reassigned multiple times:
- Base function near line 5060.
- E62/E63 text-clean wrappers near 5142 and 5179.
- E77 route restore near 5816.
- E80/E80B wrappers near 6093 and 6145.
- E81 route modal near 6318.
- E101 route modal near 7651.
- E104 route modal near 8026.
- E109 today modal near 8070.
- E112/E116 today modal near 8211.
- E117 rebuilt modal near 8323.
- E118 total schedule rebuild near 8440.

### Event / click path
- The button `data-act="route-modal"` is routed through the central `handleClick()` block near line 3261.
- `open-today-route` is also routed near line 3288.
- E117 and E118 add separate capturing document click handlers for their own route buttons.
- Result: the main open action is stable, but inner popup buttons are split across old and new handler families.

### CSS stacking
- Old route CSS remains in the file: `.route-modal-*`, `.route-card-modal`, `.e101-route-*`, `.e104-*`, `.e109-*`, `.e117-*`, `.e118-*`.
- E118 styles are active near the end of `core.css`, while older route CSS still exists earlier.
- Result: the active popup is E118, but the stylesheet is a sedimentary cliff: old classes are still available and can leak visually if an older render path is revived.

## Step 2 · Old popup quarantine plan

### Must be removed from active output
- `e104-route-modal`
- `e109-today-modal`
- `e112-today-modal`
- `e116-today-modal`
- `e117-today-shell`
- `e118-schedule-root`

### Must stay only as inactive historical code until final cleanup
- Data vault routing from E114.
- Learning content/data functions.
- Exam gate helper functions.
- Storage group helpers.

### Single new route contract for E119
All schedule actions must use only these two families:
- `data-e119-route='{"view":"learning","learnTab":"theory"}'`
- `data-e119-open-source="theory_lecture_content"`

No E117/E118 private click handlers should remain active in the final version.

## Step 3 · New Overview architecture

### New Overview areas
1. `e119-overview-shell`
2. `e119-hero-today`
3. `e119-today-command-card`
4. `e119-stage-card`
5. `e119-progress-strip`
6. `e119-quick-grid`
7. `e119-source-status`

### New schedule popup areas
1. `e119-schedule-studio`
2. `e119-schedule-header`
3. `e119-schedule-rail`
4. `e119-schedule-board`
5. `e119-schedule-tabs`
6. `e119-schedule-pane`
7. `e119-schedule-footer`

### Popup tab structure
- Hôm nay
- Lý thuyết
- Bài tập
- Ứng dụng
- Mô phỏng
- Ôn tập
- Dữ liệu

### Display rule
- Never show a long table as the default view.
- Default view shows only the next learning block and a compact map of the session.
- Similar content is grouped into tabs and accordions.
- Each pane owns its own scroll area.
- Header and footer remain visible.

### Required final tests
- No active output contains E104/E109/E112/E116/E117/E118 popup classes.
- `route-modal` and `open-today-route` both open E119 popup.
- Each popup tab is reachable.
- Each quick button routes to the correct main tab.
- Storage/source actions open the correct source file.
- `node --check assets/core.js` passes.
- `index.html`, `subject-manifest.*` cache labels are bumped to E119 only in final round.

## Round 1 decision
Do not patch E118 further. Round 2 should append or replace with a single E119 active render chain, then Round 3 should remove active old leakage and export final zip.

## Round 1 working-branch action completed
A non-final E119 quarantine layer was appended to the working branch:
- `renderRouteModal()` now returns `e119-schedule-studio` in the working branch.
- The active popup output no longer contains E104/E109/E112/E116/E117/E118 popup classes.
- A minimal CSS shell was added only as a placeholder so the branch remains syntactically and visually safe during development.
- This is not the final UX; Round 2 will replace the placeholder with the full Schedule Studio.

Validation:
- `node --check assets/core.js`: PASS
- Working marker: `BAUMAN_MATH_E119_ROUND1_SELF_CHECK`
