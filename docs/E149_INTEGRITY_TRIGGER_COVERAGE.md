# E149 · Integrity Trigger Coverage

Date: 2026-09-21

## Gap

E148 made `subject-manifest.json` and `subject-manifest.js` part of the integrity contract, but the GitHub Actions path filter did not include either root-level file. A pull request that changed only one subject manifest could therefore bypass E145 entirely.

## Fix

The E145 workflow now triggers on:
- `subject-manifest.json`
- `subject-manifest.js`

Existing triggers for `index.html`, `assets/**`, `data/**`, the validator and workflow remain unchanged.
