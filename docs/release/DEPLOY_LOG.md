# Deploy log

## 2026-10-22 — RC1 → GitHub Pages (G3 approved)
- Target (exactly as authorized): GitHub Pages of `vuthehuy1997/daiviet-rising` (new public repo created for this release; public is required for Pages on the free plan).
- URL: https://vuthehuy1997.github.io/daiviet-rising/
- Source: tag `rc1` (`3a38d5b` at deploy time); Pages branch `gh-pages` (`612e6be`) contains only `dist/` + `.nojekyll`. Build type: legacy branch deploy (no Actions workflow, no secrets in repo).
- Post-deploy smoke (real Chromium against the live URL): desktop + Pixel 7: 12 tiles render, End Turn → turn 2, no console errors, no HTTP ≥400, no horizontal overflow.
- Commit authors use the GitHub noreply address (no personal email published).
- Token: supplied in chat, used only through a transient environment variable / HTTP header; not stored in files, git config or remote URL. **Recommend revoking it now** (https://github.com/settings/tokens) since it appeared in the conversation and carries broad scopes.
- Note: Pages API returned a transient HTTP 500 on enabling; GET showed Pages enabled from `gh-pages` and built successfully.

## Rollback
Re-push the previous `gh-pages` commit (`git push -f origin <old-sha>:gh-pages`) or disable Pages in repo Settings → Pages. Source of truth remains `main`/tag `rc1`.
