# E146 · Dual-mode Content Vault Path Contract

Date: 2026-09-21

## Defect

The standalone Math_Bauman repository stores its data under `data/`, but the Content Vault manifest still advertised `subjects/math/data/...` as its primary frame/content paths. Those paths belong to the packaged Hub layout and do not exist in the standalone repository.

## Fix

- `framePath` / `contentPath`: canonical standalone paths, e.g. `data/formula_frame.json`.
- `packageFramePath` / `packageContentPath`: preserved Hub package paths, e.g. `subjects/math/data/formula_frame.json`.
- E145 integrity gate now verifies both contracts and requires the standalone files to exist.

No learning records, IDs, questions, formulas or lesson content are changed.
