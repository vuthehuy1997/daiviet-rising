# Approvals
## G1 — Concept approval
- Date: 2026-10-21
- Approver: user (as entered in session)
- Exact words: "approve G1: chọn cả 3 concept, về cơ bản demacia rising là mở rộng lãnh thổ, kèm phòng thủ các thành thị trong 1 vài lượt mà mandi hoặc noxus tấn công, tìm hiểu demacia rising sâu hơn đi,"
- Scope as recorded: Concept A + B + C (all three) are accepted as the concept direction. User states the reference's essence = territory expansion + defending towns within a few turns when attacked.
- Not decided by this approval: how the three concepts combine / MVP ordering (agent will propose in Phase 2 for G2 review); the term "mandi" (unverified).
- Baseline: none yet. G2 pending.

## G2 — Design baseline approval
- Date: 2026-10-21
- Approver: user (as entered in session)
- Exact words: "approve G2" (initial message, no baseline named) → confirmed via explicit question: "Duyệt DB-0.1 nguyên trạng"; local git init: "Có, git init cục bộ".
- Baseline: **DB-0.1** (docs/design/BASELINE_CANDIDATE.md, docs/design/01..05, game-data/, docs/production/BACKLOG.yaml). Approved as-is including the 6 proposals (MVP=CMP-01 first; no end-turn fee; self-defined win/lose SYS-12; TypeScript+Vite+SVG; "Mandi" excluded; all numbers placeholder).
- Also authorized: local `git init` in this directory (no remote push, no deploy).
- Not authorized: remote push, production deploy, purchases (G3 pending).

## G3 — Release approval
- Date: 2026-10-22
- Approver: user (as entered in session)
- Exact words: "approve G3" → target clarified via explicit question: "tạo repo cho tôi, tôi cung cấp token" (GitHub token supplied in chat; NOT stored in any file). CR-001 + RC1 limitations: "Xác nhận CR-001 và giới hạn".
- Baseline/build: RC1 (git tag rc1), DB-0.1 + CR-001.
- Authorized target: a NEW GitHub repository created under the token's account, and GitHub Pages of that repo (static `dist/`). Nothing else (no other repos, no paid services, no purchases).
- Agent constraints: token only via transient env var/header; never written to repo, remote URL, or memory. Recommend user revokes/rotates the token after release (it was pasted in chat).

## CR-002 — Choice events for CMP-01
- Date: 2026-10-23
- Approver: user (as entered in session)
- Exact words: "approve CR-002"
- Scope approved: docs/change_requests/CR-002_choice_events_cmp01.md as written (8 deterministic events, RC2 local build only).
- Not authorized: remote push, deploy of RC2 (G3 covers RC1 only).

## G3 (RC2) — Release approval
- Date: 2026-10-23
- Approver: user (as entered in session)
- Exact words: "approve G3: push và deploy RC2 lên vuthehuy1997/daiviet-rising"
- Build: RC2 = commit 016b7d5 (DB-0.1 + CR-001 + CR-002). Known open issues: docs/qa/EVENTS_BALANCE.md (shown to user before approval).
- Authorized target: push main (+ tag rc2) to origin vuthehuy1997/daiviet-rising and refresh gh-pages (GitHub Pages). Nothing else.

## CR-003 — UI redesign (Demacia Rising UI reference)
- Date: 2026-10-23
- Approver: user (as entered in session)
- Exact words: "approve CR-003: và thiết kế cho tôi phần design trước, lưu ra ảnh để xem trước"
- Approved: CR-003 (docs/change_requests/CR-003_ui_redesign.md) WITH the user's edit: produce the DESIGN first as preview images for the user to review. Defaults of the CR apply otherwise (SVG self-drawn, giấy dó + son/chàm/vàng thếp, Lý motifs, drop dark theme).
- Implementation in src/ (milestones V1–V3) is NOT yet started; start only after the user has seen the preview images and says to proceed (treat their reply as feedback, not blanket approval).
- Not authorized: push/deploy (G3 covers RC1/RC2 only).

## CR-003 — V1 implementation approval
- Date: 2026-10-24
- Approver: user (as entered in session)
- Exact words: "approve CR-003: làm V1 theo thiết kế v4"
- Approved: implement milestone V1 (UI-1..UI-4: full-screen map, settlement art + name banners, HUD with objective card, End-Turn disc/buttons) in src/ following docs/design/ui/v4 (baked painted map background + SVG/HTML overlay). Sim, balance data, save format unchanged.
- Zoom question was not answered by the user: the recommended default (zoom ≤ 1.5x, 2400px background) is applied and flagged for confirmation.
- V2/V3 still need showing V1 screenshots first. Not authorized: push/deploy (RC3 is a local build until the user re-authorizes).

## CR-003 — V2 implementation approval
- Date: 2026-10-24
- Approver: user (as entered in session)
- Exact words: "approve CR-003: làm V2"
- Approved: milestone V2 (UI-5..UI-8): tile side panel as slot grids (buildings, garrison, enemy icons), raid-alert polish, event card with art + side-by-side choices, battle report with two sides/banner/causes, policies as diamond-node grid. Sim, save format and balance data unchanged.
- Zoom question still unanswered → keeping <= 1.5x. Not authorized: push/deploy (RC3 stays a local build).

## CR-003 — V3 implementation approval
- Date: 2026-10-26
- Approver: user (as entered in session)
- Exact words: "approve CR-003: làm V3"
- Approved: milestone V3 (UI-9 + performance + polish): phone layout (bottom-sheet, touch targets, compact event card, small/landscape screens), performance and size budget, AA-contrast checks, polish of known V1/V2 leftovers (button arc, west mountains, long tile panel). Sim, save format, balance data unchanged.
- Zoom question still unanswered → keeping <= 1.5x. Not authorized: push/deploy (RC3 stays a local build).
