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
- CR-003 approved with edit; design preview produced (docs/design/ui/*.png, README). No src/ change. Awaiting user review.

## 2026-10-24
- CR-003 design v2-v4 produced (subagent designer research: docs/design/ui/v4/DESIGN_RESEARCH.md, ASSET_LICENSES.md).
- "approve CR-003: làm V1 theo thiết kế v4" → V1 implemented locally (src/ui rewritten: full-screen painted map, live SVG settlements, HUD, End-Turn disc, pan/zoom<=1.5x; tile coords updated in campaign yaml; fonts + map_bg.webp bundled). Vitest 67/67, Playwright 25+1 skipped, axe 0 serious. Not pushed/deployed.
- "approve CR-003: làm V2" → V2 implemented locally (tile-panel grids, event card art x8, battle report, policy diamonds, effectTones helper + test). Vitest 68/68, Playwright 25+1 skipped, axe 0 serious. Not pushed/deployed.

## 2026-10-26
- "approve CR-003: làm V3" → V3 implemented locally (phone/landscape layouts, pinch zoom, button arc, YAML→JSON at build, tile DOM reuse, AA contrast tests + 4 colours fixed, softer west mountains). Vitest 112/112, Playwright 38 passed + 2 skipped, dist 531 kB. Not pushed/deployed.
