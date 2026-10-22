# UNIVERSAL GAME STUDIO — WORKFLOW v1

## Global principles
Genre-neutral, platform-neutral, offline/online-neutral. Choose stack only after research and approved design. All project artifacts under ``; game source may live in separate `project.code_repo`. Do not treat an example brief as a global rule.

## Phase 0 — Intake & validation
Read brief, check slug, links, player fantasy, constraints, target platforms and multiplayer needs. Record uncertainties, assumptions and decisions. Ask at most essential questions blocking research. Output `docs/00_INTAKE.md`; initialize state files.

## Phase 1 — Reference research & 3 concept proposals
Identify exact reference game; consult verifiable gameplay sources, official pages/videos and player feedback when accessible. Record URLs, access date, confidence and unknowns. Study genre, core/meta loops, mechanics, progression, monetization only if relevant, UI/UX, strengths, limitations, inspiration versus IP copying. Research setting, audience and competing games as relevant. Deliver 3 **meaningfully different** concepts, each with fantasy, loops, systems, scope, risks, platform fit, MVP. Compare and recommend; do not select. Output `docs/research/*`, `docs/concepts/*`, `docs/concepts/PROPOSAL.md`. **STOP G1**.

## Phase 2 — Approved concept → design baseline candidate
Produce vision, design pillars, GDD with formulas/rules and edge cases, UX flows, art/audio direction, levels/content, progression, accessibility, save/load, monetization if applicable, technical architecture and data schema, testing strategy, roadmap and granular backlog. Story/characters/dialogues are conditional on game needs; if present use stable IDs and structured data. Map feature IDs → design IDs → acceptance tests. Outputs `docs/design/`, `game-data/`, `docs/production/`.

## Phase 3 — Review dashboard & design gate
Implement review hub specification in `.game-studio/DASHBOARD_SPEC.md`. Support browsing/searching designs, previewing assets, comments/change requests and decision history; use source-controlled documents as authority. Review revisions, produce numbered baseline, record diff and unresolved issues. **STOP G2** before core production.

## Phase 4 — Build & QA autopilot
Choose platform/engine based on approved TDD; create working vertical slice, then iterate backlog. For each item: requirements → acceptance criteria → implementation → build → unit/integration/platform E2E → fix → regression → update status and traceability. Never fake tests. Timebox repeated failed fixes and surface blocker. Avoid scope drift. Track playable build and actual manual playtest feedback separately.

## Phase 5 — Release candidate
Full functional, gameplay, compatibility, save migration, performance, accessibility, licensing, security, packaging, smoke tests and release notes. Online games require auth/network/server/load and security review. Static web games require correct path, assets and no client secrets. Provide preview and evidence. **STOP G3** before production deployment.

## Phase 6 — Launch & changes
Deploy only with explicit authorization and verified target. Maintain release notes and rollback. For upgrades, create change request, impact map, updated design, required gate(s), then build-test-fix-regression-release. Major scope/design changes require human reapproval.

## Approvals and execution safety
G1 = explicit selection/acceptance of concept; G2 = explicit approval of named design baseline; G3 = explicit permission for named production release target. Agent cannot self-approve. No purchase, secret disclosure, destructive git action, remote push or production deploy without explicit authorization. Keep commits local unless user permits remote operations.

## Persistence
`state/STATUS.md`: phase, current gate, baseline, implementation repo, latest test commands/results, blockers, next step.
`state/DECISIONS.md`: choices and rationale.
`state/APPROVALS.md`: exact user approvals, scope, date and baseline.
`state/NEXT_ACTIONS.md`: next executable steps.
`state/CHANGELOG.md`: durable change summary.
On every start/resume verify actual files, repo state and test evidence before reporting progress.

## Autopilot limits
`autopilot-with-gates` means autonomous *within active session/tool permissions*, not guaranteed background execution after session ends. Always checkpoint on interruption.
