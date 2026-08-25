# E122 Learning Tab Total Rebuild · Round 1 Audit

Status: internal working copy only. Do not export this round.

## Scope
Round 1 covers steps 1-3:
1. Inspect the current Learning tab structure.
2. Map logic and data sources.
3. Identify old layers to isolate before rebuilding.

## Current active learning render chain
`renderLearning` has multiple historical layers. The final active assignment is the E109 theory split branch:

- Final `renderLearning`: E109 theory split shell for `learnTab === theory`.
- Non-theory tabs fall back through older layers via `PREV109.learning`.
- Earlier layers still present: base renderer, E36, E37, E62, E63, E80 polish/safe layers, E104, E107, E109.

## Findings
### P0 risk
The Learning tab does not have one single clean architecture. Theory is controlled by E109, while exercises/application/review/exam still depend on old fallback layers. This creates the same class of risk previously found in the schedule popup.

### P1 UX risk
The central content is not guaranteed to be the dominant visual area across all learning modes. Some modes still depend on legacy split panels and historic CSS such as `learn-canva`, `v1261`, `v1283`, `e36`, `e37`, `e104`, and `e109`.

### P1 logic risk
`learnTab` is referenced many times and `button[data-learn]` appears in several separate flows. The rebuild must use a single E122 click path for mode changes and keep legacy paths from stealing clicks.

### P1 data risk
Current module has frame data for 56 chapters, but most content records are empty. The new UI must render useful direct learning frames even when content is not loaded yet.

## Data map
Primary Learning sources:
- theory: `theory_lecture_frame`, `theory_lecture_content`, fallback `lessons`
- exercises: `exercise_frame`, `exercise_content`, fallback `exercises`
- application: `application_frame`, `application_content`, fallback `applications`
- simulation: `simulation_frame`, `simulation_content`, fallback `simulations`, target view `writing`
- review: `review_pack_frame`, `review_pack_content`, fallback `review_packs`
- exam: `test_blueprint_frame`, `test_blueprint_content`, fallback `question_bank`, `tests`
- formula support: `formula_frame`, `formula_content`, fallback `formulas`

## New architecture locked for Round 2
Target root:
- `e122-learning-workbench`

Target zones:
- `e122-learn-hero`: active lesson/chapter and learning objective.
- `e122-focus-board`: dominant direct content frame.
- `e122-mode-rail`: mode buttons, compact and visible.
- `e122-context-dock`: formulas, sources, status, next actions.
- `e122-resource-strip`: small direct source links.

Target modes:
1. theory
2. examples
3. exercises
4. application
5. simulation
6. review
7. exam

## Cleanup decision
Round 2 should not extend E109/E104 panels. It should place one final E122 `renderLearning()` after E121 and route all Learning mode output through that single renderer.

Legacy renderers should remain physically present until Round 5 cleanup, but they must no longer be active for the Learning tab once E122 renderer lands.
