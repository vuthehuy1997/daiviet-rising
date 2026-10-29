# 05 — Kiến trúc kỹ thuật, dữ liệu, chiến lược kiểm thử (TDD-xx, TST-xx)

Đề xuất — **chốt khi duyệt G2** (workflow: chọn stack sau khi duyệt thiết kế).

## Lựa chọn đề xuất (TDD-01)
- Ngôn ngữ: **TypeScript**; bundler **Vite**; UI: DOM + **SVG** cho bản đồ (không cần engine game); không framework nặng (có thể dùng thư viện nhỏ nếu cần). Miễn phí/mã nguồn mở.
- Lý do: web tĩnh, offline, chạm; logic thuần dễ test; không cần engine 2D realtime. **Phương án khác** (cần bạn cân nhắc): Phaser/Godot web — mạnh hơn cho hoạt ảnh trận nhưng nặng hơn cho game UI-heavy.
- Triển khai: GitHub Pages (`base` path đúng, không secret). **Không deploy** khi chưa có G3.

## Phân tầng (TDD-02)
```
src/sim/      lõi thuần, deterministic (không DOM, không Date.now/Math.random → seeded RNG)
src/data/     loader + validator schema (đọc game-data/)
src/ui/       SVG map, panels, báo cáo trận
src/save/     serialize/migrate
game-data/    YAML/JSON nội dung (nguồn sự thật), build sang JSON
tests/        unit (sim), integration (turn), e2e (Playwright)
```
`sim` nhận `(state, commands, seed) → (state', events, reports)`; UI chỉ hiển thị và gửi lệnh.

## Schema dữ liệu (TDD-03)
Tệp mẫu ở `game-data/`: `tiles`, `buildings`, `units`, `campaign`. Trường chung: `id`, `name_vi`, `source_label`, `source_ids`, `balance: placeholder|tuned`. Validator kiểm: ID duy nhất, tham chiếu hợp lệ, nhãn nguồn hợp lệ, đồ thị kề đối xứng.

## Chiến lược kiểm thử (TST)
| ID | Loại | Nội dung |
|---|---|---|
| TST-01 | Unit | Công thức sản xuất, supply_cap, sát thương, khắc chế |
| TST-02 | Unit | Determinism: cùng seed+lệnh → state hash giống |
| TST-03 | Integration | Thứ tự phân giải lượt (SYS-02) và các EDGE-01..07 |
| TST-04 | Integration | Tập kích: ETA/cảnh báo/đến kịp-hay-không |
| TST-05 | Data | Validator `game-data/` + nhãn nguồn bắt buộc |
| TST-06 | Save | Round-trip, migration giữa `save_version` |
| TST-07 | E2E | Playwright: chơi hết CP1 bằng kịch bản; chạm & chuột |
| TST-08 | Balance | Simulation hàng loạt: không chiến thuật thống trị, tỉ lệ thắng dải mục tiêu |
| TST-09 | A11y/Perf | axe, tương phản, thời gian nạp, bundle size |
| TST-11 | Thủy triều/nhử (CR-005) | pha triều, cọc theo pha, ETA thuyền, CMP-02 dữ liệu/luật, tất định (tests/tide.test.ts) |
| TST-10 | Manual | Playtest thực — ghi riêng khỏi build tự động |
Hồi quy: chạy toàn bộ trên mỗi thay đổi; không giả lập kết quả test.

## Rủi ro kỹ thuật
- Cân bằng auto-battle (TST-08). · Số liệu lịch sử (PIL-05). · Hiệu năng bản đồ trên mobile (đã giới hạn ~28 ô). · localStorage có thể bị chặn → cảnh báo + xuất file.
