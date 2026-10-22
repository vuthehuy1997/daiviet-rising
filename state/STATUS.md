# Status
Updated: 2026-10-21
Phase: 5 complete — Release Candidate RC1 (CMP-01) built and tested locally
Gate: **G3 — AWAITING USER DECISION** (chưa có phê duyệt G3; chưa deploy)
Baseline: DB-0.1 (G2 approved) + CR-001 (balance/clarification changes, cần user xác nhận)
Implementation repo: this directory (local git, branch main, tag rc1; no remote; no push)
Evidence (docs/qa/EVIDENCE_rc1.txt): typecheck OK; check_design OK; vitest 48/48; build OK (137 kB JS); Playwright Chromium desktop+Pixel7: 19 passed/1 skipped; axe 0 serious/critical; bot balance idle/turtle/sprawl 0%, expand 52%.
Backlog: 13 done, 7 partial, 0 todo (docs/production/BACKLOG.yaml).
NOT done: manual human playtest; real GitHub Pages deploy; Firefox/Safari/real devices; screen-reader test; history expert review; reference video.
Blockers: none for local; G3 needs explicit release target (none specified).
Next: user reads docs/release/RC1.md, plays `npm run dev` / dist, then `approve G3: <target>` or requests changes (`update game: ...`).
