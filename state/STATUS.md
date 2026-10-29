# Status
Updated: 2026-10-27
Phase: 6 — RELEASED (RC4 live) · maintenance/change requests
Gate: G3 APPROVED and executed for the named target only (see APPROVALS.md, docs/release/DEPLOY_LOG.md)
Live: https://vuthehuy1997.github.io/daiviet-rising/ (GitHub Pages, branch gh-pages)
Repo: https://github.com/vuthehuy1997/daiviet-rising (public), main + tags rc1, rc2, rc3
Evidence: docs/qa/EVIDENCE_rc1.txt, EVIDENCE_rc2.txt, EVIDENCE_cr003_v1.txt (local tests), live smoke on desktop+Pixel7 Chromium (see DEPLOY_LOG.md)
Known gaps: unchanged from docs/release/RC1.md (no human playtest, 7 partial features, history expert review, other browsers).
Open: user should revoke the GitHub token that was pasted in chat.
CR-002 (choice events CMP-01): APPROVED + implemented; RC2 pushed (tag rc2) and deployed to Pages 2026-10-23 under G3 (RC2) approval. Evidence: docs/qa/EVIDENCE_rc2.txt, docs/qa/EVENTS_BALANCE.md (2 open balance issues).
CR-003 (UI redesign): V1, V2 and V3 (UI-1..9, perf, polish) IMPLEMENTED locally (approvals: "approve CR-003: làm V1 theo thiết kế v4", "...làm V2", "...làm V3"). RC3 pushed (main 26b0268, tag rc3) and deployed to Pages (gh-pages 60b0e56) 2026-10-27 under the RC3 G3 approval. Evidence: docs/qa/EVIDENCE_cr003_v1/v2/v3.txt, screenshots docs/qa/visual/. Next: user review/playtest; any further push/deploy needs a NEW explicit G3.
Next: playtest feedback → `update game: ...` (change request flow).

CR-004 (zoom 4x + west mountains): APPROVED ("approve CR-004") + IMPLEMENTED locally as RC4 (commit pending/see git log), NOT pushed. Evidence docs/qa/EVIDENCE_cr004.txt. Live site is still RC3. Push needs a new G3.

UPDATE 2026-10-28: RC4 (CR-004) pushed (main 330c754, tag rc4) and deployed to Pages (gh-pages b1227bb) under the RC4 G3 approval. Live bundle verified; browser smoke not run. Further push/deploy needs a NEW G3.

CR-005 (CMP-02 tides + lure): DRAFTED 2026-10-29 (docs/change_requests/CR-005_cmp02_tides_lure.md), AWAITING APPROVAL. No code written.
