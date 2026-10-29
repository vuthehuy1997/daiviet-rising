# Deploy log

## 2026-10-22 — RC1 → GitHub Pages (G3 approved)
- Target (exactly as authorized): GitHub Pages of `vuthehuy1997/daiviet-rising` (new public repo created for this release; public is required for Pages on the free plan).
- URL: https://vuthehuy1997.github.io/daiviet-rising/
- Source: tag `rc1` (`3a38d5b` at deploy time); Pages branch `gh-pages` (`612e6be`) contains only `dist/` + `.nojekyll`. Build type: legacy branch deploy (no Actions workflow, no secrets in repo).
- Post-deploy smoke (real Chromium against the live URL): desktop + Pixel 7: 12 tiles render, End Turn → turn 2, no console errors, no HTTP ≥400, no horizontal overflow.
- Commit authors use the GitHub noreply address (no personal email published).
- Token: supplied in chat, used only through a transient environment variable / HTTP header; not stored in files, git config or remote URL. **Recommend revoking it now** (https://github.com/settings/tokens) since it appeared in the conversation and carries broad scopes.
- Note: Pages API returned a transient HTTP 500 on enabling; GET showed Pages enabled from `gh-pages` and built successfully.

## 2026-10-23 — RC2 → GitHub Pages (G3 approved: "approve G3: push và deploy RC2 lên vuthehuy1997/daiviet-rising")
- Pushed `main` (`56d41d9..4f110ab`) and annotated tag `rc2` (→ `4f110ab`) to `vuthehuy1997/daiviet-rising`. `gh-pages` updated by a new commit on top of RC1's (`612e6be..0e2a876`), containing only `dist/` + `.nojekyll`; no Actions, no secrets in repo.
- Content: DB-0.1 + CR-001 + CR-002 (8 choice events, save v2 with v1 migration). Open balance issues were shown to the user before approval (docs/qa/EVENTS_BALANCE.md).
- Live check: https://vuthehuy1997.github.io/daiviet-rising/ HTTP 200, served bundle `index-B5DR31Kp.js` equals local build.
- Post-deploy smoke (real Chromium on the live URL, desktop + Pixel 7): 12 tiles; End Turn → event dialog "Tin tình báo từ phía Bắc" appears; choosing (a) deducts 10 Lương (130→120); turn 2/28 shown; no console errors; no HTTP ≥400; no horizontal overflow.
- Token: a new token was pasted in chat; used only via a transient env var/HTTP header for push, never written to files, git config, remote URL or memory. **Revoke it now** (https://github.com/settings/tokens).

## Rollback
Re-push the previous `gh-pages` commit (RC1 = `612e6be`: `git push -f origin 612e6be:gh-pages`) or disable Pages in repo Settings → Pages. Source of truth remains `main`/tag `rc1`.

## RC3 — 2026-10-27
- Pushed main (26b0268), tag rc3, gh-pages (60b0e56 "Deploy RC3"). Token used transiently via http.extraHeader, not stored.
- Live smoke (desktop 1280x800 + phone 412x915, Chromium): map background present, 6 resource pills, 0 page errors, 0 failed requests. Live assets index-CHXffyLx.js / index-Bdwl9FXN.css.

## RC4 — 2026-10-28 (G3 approved: "approve G3: push và deploy RC4 lên vuthehuy1997/daiviet-rising")
- Pushed main (26b0268..330c754), tag rc4, gh-pages (60b0e56..b1227bb "Deploy RC4 (rc4 tag)"; dist/ + .nojekyll only). Token used transiently via http.extraHeader, not stored. **Revoke it** (https://github.com/settings/tokens).
- Pre-deploy: tsc OK, Vitest 112/112, build OK.
- Live check: HTTP 200, served bundle index-BduymceC.js equals local build. Browser smoke on live URL NOT run this time.
- Live smoke RC4 (2026-10-29, real Chromium on the live URL, desktop 1280x800 + Pixel 7): 12 tiles, "Lượt 1/28", 6 resource pills, End Turn → event dialog → "Để sau" → "Lượt 2/28", 0 console/page errors, 0 failed requests, 0 HTTP ≥400, no horizontal overflow. Desktop wheel-zoom to 4x: svg.map images 1 → 7, hi-res tiles hi_*.webp fetched with HTTP 200 (8 files total as the view moved), no errors.
