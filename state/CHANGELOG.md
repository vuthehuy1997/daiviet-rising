# Changelog
- Project initialized.
- 2026-10-21: Phase 0 intake + Phase 1 research và 3 concept (A/B/C) được tạo trong `docs/`. Dừng tại G1.
- 2026-10-21: G1 approved (all 3 concepts). Added docs/research/REFERENCE_DEEP_DIVE.md.
- 2026-10-21: Phase 2–3: docs/design/01..05, BASELINE_CANDIDATE (DB-0.1), game-data/, BACKLOG, ROADMAP, tools/, dashboard/, docs/qa evidence. Dừng tại G2.
- 2026-10-21: Phase 4–5: TypeScript sim + UI, 48 unit tests, 20 E2E (Chromium), bot balance, CR-001, RC1 docs, local git + tag rc1. Dừng tại G3.
- 2026-10-22: G3 approved; RC1 deployed to GitHub Pages (vuthehuy1997/daiviet-rising). See docs/release/DEPLOY_LOG.md.

## 2026-10-23
- `update game: thêm sự kiện có lựa chọn cho chiến dịch 1` → created CR-002 (docs/change_requests/CR-002_choice_events_cmp01.md), status PENDING APPROVAL. No code or data changed.
- CR-002 approved ("approve CR-002") and implemented locally: events_cmp01.yaml (8 events), sim (events.ts, choose cmd, mods, save v2 + migration), UI event dialog, tests (Vitest 67, Playwright 25+1 skipped). FEAT-011 → done. Not pushed/deployed.
- G3(RC2): pushed main+tag rc2, gh-pages 0e2a876; live smoke OK (see DEPLOY_LOG).
- 2026-10-23 update game: làm lại giao diện → researched official Riot screenshots (docs/research/REFERENCE_UI_DEMACIA.md), created CR-003 (PENDING APPROVAL). No code changed.
