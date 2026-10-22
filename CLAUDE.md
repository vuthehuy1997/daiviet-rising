# Claude Code — Game Studio (per-project)

This repository is ONE independent game. No central game-studio repository or cross-project data.

On `start game`, read `game.yaml`, `.game-studio/WORKFLOW.md`, `.game-studio/prompts/ORCHESTRATOR.md`, and `state/`. Run Phase 0–1 and stop at G1.
On `continue game` or `resume game`, inspect state and explicit approvals; proceed only to the next allowed gate.
On `status game`, summarize actual progress.
On `approve G1: ...`, `approve G2: ...`, `approve G3: ...`, record the user's explicit approval for the named concept/design baseline/release; do not interpret an ambiguous message as approval.
On `update game: ...`, create change request and follow design-impact approval gates.

Do not require a project slug. Read only this repository's `game.yaml`. Never use another project's context or files. Do not guess reference-game mechanics. No automatic purchases, remote pushes, or production deploys. Keep evidence of executed tests.
