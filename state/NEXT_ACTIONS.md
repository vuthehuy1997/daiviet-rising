# Next actions
1. (User) Chơi thử: `npm install && npm run dev` (hoặc `npx vite preview` sau `npm run build`); đọc docs/release/RC1.md và docs/change_requests/CR-001*.md; mở dashboard/index.html.
2. (User) Phản hồi playtest; quyết: `approve G3: <đích phát hành cụ thể>` hoặc `update game: ...`.
3. (Agent, sau G3) Chỉ deploy tới đích được nêu; hiện chưa có remote/đích nên KHÔNG push/deploy.
Rebuild dashboard: python3 -I tools/build_dashboard.py · Test: npm test; NO_PROXY=127.0.0.1,localhost npx playwright test
Resume: `resume game`
