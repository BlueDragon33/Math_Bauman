# E148 · Manifest Federation Reconciliation

Date: 2026-09-21

## Defect found

Three metadata layers had diverged from the hydrated runtime:
- `data/content-manifest.json` still described E113 empty content, used package-only paths, and reported many content sources as 18 records.
- `subject-manifest.json` / `subject-manifest.js` still exposed E113–E126 release/UI metadata and stale 0/18 counts.
- Content Vault E146 and runtime adapter E144 already had newer counts, so the same app could report different states depending on which manifest a surface read.

## Fix

E148 makes Content Vault the canonical count/path contract and reconciles:
1. `content-manifest.json`
2. `subject-manifest.json`
3. `subject-manifest.js`

The subject JS manifest is regenerated directly from the JSON manifest to guarantee parity. Packaged entry paths are preserved, while standalone entry/editor fields are explicit.

E145 now fails on cross-manifest count/path drift or JSON/JS subject-manifest divergence.
