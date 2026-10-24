# Status
Updated: 2026-10-24
Phase: 6 — RELEASED (RC2 live) · maintenance/change requests
Gate: G3 APPROVED and executed for the named target only (see APPROVALS.md, docs/release/DEPLOY_LOG.md)
Live: https://vuthehuy1997.github.io/daiviet-rising/ (GitHub Pages, branch gh-pages)
Repo: https://github.com/vuthehuy1997/daiviet-rising (public), main + tags rc1, rc2
Evidence: docs/qa/EVIDENCE_rc1.txt, EVIDENCE_rc2.txt, EVIDENCE_cr003_v1.txt (local tests), live smoke on desktop+Pixel7 Chromium (see DEPLOY_LOG.md)
Known gaps: unchanged from docs/release/RC1.md (no human playtest, 7 partial features, history expert review, other browsers).
Open: user should revoke the GitHub token that was pasted in chat.
CR-002 (choice events CMP-01): APPROVED + implemented; RC2 pushed (tag rc2) and deployed to Pages 2026-10-23 under G3 (RC2) approval. Evidence: docs/qa/EVIDENCE_rc2.txt, docs/qa/EVENTS_BALANCE.md (2 open balance issues).
CR-003 (UI redesign): V1 (UI-1..4) and V2 (UI-5..8: tile-panel grids, raid alerts, event cards with art, battle report, policy diamonds) IMPLEMENTED locally 2026-10-24 (approvals: "approve CR-003: làm V1 theo thiết kế v4", "approve CR-003: làm V2"). NOT pushed/deployed (RC3 = local build). Evidence: docs/qa/EVIDENCE_cr003_v1.txt, EVIDENCE_cr003_v2.txt, screenshots docs/qa/visual/. Waiting for user review before V3 (mobile/perf/polish).
Next: playtest feedback → `update game: ...` (change request flow).
