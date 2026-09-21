# E145 · Runtime Content Integrity Gate

Date: 2026-09-21  
Scope: standalone Math_Bauman runtime/content integrity.

## Baseline before enabling the gate

- question bank: 200 records
- stage split: 100 VN + 100 preparatory
- levels: 60 easy + 60 medium + 40 hard + 40 expert
- test blueprints: 4
- missing blueprint question refs: 0
- duplicate options / invalid answers: 0
- literal \\n shell artifacts: 0
- required runtime order: core → E138 theory overlay → E140 content bridge
- E143 manifest counts and E144 adapter counts are treated as one consistency contract.

## Gate responsibilities

1. Parse every persisted Content Vault source named by content_vault_manifest.json.
2. Fail when manifest contentCount differs from actual persisted records.
3. Fail when subject-adapter counts/plannedCount drift from persisted data.
4. Validate question IDs, four unique options, valid answer, stage and level.
5. Validate blueprint refs, stage isolation, distribution totals and exam readiness flags.
6. Detect literal shell newline artifacts and missing script assets.
7. Guard against accidental truncation of the mature core runtime.
8. Require E140 mappings for hydrated content sources.

This gate is intentionally dependency-free and runs on pull requests plus main pushes.
