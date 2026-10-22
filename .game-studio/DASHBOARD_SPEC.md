# UNIVERSAL DESIGN REVIEW DASHBOARD — PRODUCT SPEC

## Purpose
Cross-project Game Studio dashboard for reviewing concept, GDD, world/story (optional), characters/dialogues (optional), levels, maps, UI/UX, art/assets, implementation backlog, test evidence, change requests, release readiness.

## Views
Portfolio (project cards/status), Project overview, Research/sources, Concept comparison (G1), Design explorer (G2), Content browser, Asset previews, UX screen flow, Roadmap/Kanban, QA reports, Changes/approvals, Release readiness (G3).

## Data model
Projects have unique slug; docs/assets/features have stable IDs, version, status, links to source paths, review comments and acceptance criteria. Approval records include gate, exact baseline/version, approver identity as entered, date and explicit user decision. Never forge approvals.

## Editing & approval
Phase 1: Markdown/YAML/JSON in Git, comments/change requests via GitHub Issues/PR or local files.
Phase 2 optional: authenticated backend for in-dashboard editing, only after explicit cost/security approval.
Static GitHub Pages cannot safely persist arbitrary edits or approvals without separate auth/write service. No tokens in client bundles.

## MVP acceptance
Can select project; browse concept options and sources; view design and assets; see statuses; open review issue/PR or local change request; see explicit approval status and pending gate; trace design IDs to backlog and QA. Mobile-friendly, accessible, search/filter where feasible. No fake interactive save buttons.
