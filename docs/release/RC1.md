# Release Candidate RC1 — Dai Viet Rising (CMP-01 "Hộ Quốc Tuyến")

Ngày: 2026-10-21 · Baseline: DB-0.1 + CR-001 · Mục tiêu phát hành đề xuất: **web tĩnh (GitHub Pages)** — *chưa deploy, chờ G3*.
Bằng chứng chạy thật: `docs/qa/EVIDENCE_rc1.txt`, `docs/qa/balance_last.json`, `docs/qa/e2e-last.json`.

## Gói
`npm run build` → `dist/` (index.html + 1 JS 137 kB/gzip 44 kB + 1 CSS 2.8 kB), đường dẫn tương đối (`base './'`); đã kiểm tra phục vụ đúng dưới đường dẫn con bằng HTTP tĩnh cục bộ (200). **Chưa** kiểm tra trên GitHub Pages thật.

## Kết quả kiểm thử (đã chạy)
| Hạng mục | Kết quả |
|---|---|
| Typecheck (`tsc --noEmit`, trong `npm run build`) | đạt |
| `tools/check_design.py` (truy vết dữ liệu/thiết kế) | OK: 40 ID, 12 ô, 20 feature |
| Vitest: 48 test (sim, dữ liệu, xác định, lưu/nạp, combat, tập kích, controller, jsdom smoke, bot cân bằng) | 48/48 đạt |
| Playwright Chromium 156: desktop + Pixel 7 cảm ứng, 10 kịch bản + axe | 19 đạt, 1 bỏ qua (bàn phím, chỉ desktop) |
| Axe (serious/critical) | 0 vi phạm sau khi sửa label-content-name-mismatch |
| Cân bằng bot 40 seed/chiến thuật | bỏ mặc 0%, turtle 0%, rải đều 0%, tập trung phòng thủ 52% (21/40), +tiến công 50% |
| Quét `src/`: fetch/XHR/WebSocket/eval/innerHTML/secret | không có |
| Giấy phép phụ thuộc chạy: `yaml` (ISC); không tài sản ngoài (không ảnh/âm thanh/font nhúng) | ổn |

Lỗi thật đã tìm và sửa nhờ test (không phải test giả): đồn trú vô hạn (thống trị), kinh tế quá mỏng, tràn ngang ở di động, quân đang hành quân không hiển thị, nhãn truy cập lệch.

## Giới hạn đã biết (KHÔNG che giấu)
1. **Chưa có playtest thủ công của người thật.** Chưa biết có vui, dễ hiểu hay đúng "cảm giác" hay không. Cần bạn chơi và phản hồi.
2. Cân bằng chỉ qua bot ngây thơ; số liệu đều placeholder; người chơi giỏi có thể thắng dễ hơn/khó hơn 52%.
3. Backlog: 13 done, 7 partial (xem `docs/production/BACKLOG.yaml` `note`): thiếu EDGE-02, sự kiện lựa chọn, thủy triều/nhử, chỉ ~3 kế sách, 12 ô thay vì ~28, chưa thử screen reader thật, chưa chỉnh cỡ chữ.
4. Lịch sử: chỉ khung chiến dịch có nguồn (Wikipedia tiếng Anh, chưa thẩm định sử học); toàn bộ địa danh/quân số là hư cấu có nhãn. **Cần rà soát sử học trước khi công bố rộng.**
5. Reference (Demacia Rising) chưa xem video; "Mandi" chưa xác minh (không đưa vào game).
6. Đã thử trên Chromium duy nhất; Firefox/Safari/thiết bị thật chưa thử. Không có đo hiệu năng riêng ngoài thời gian chạy test.
7. Lưu = localStorage + xuất/nhập JSON; chưa có test migration giữa nhiều phiên bản (chỉ v1).
8. Không có âm thanh, hình ảnh nghệ thuật, hay lồng tiếng (MVP).

## Quyết định cần từ bạn tại G3
- **G3 chỉ cấp phép phát hành tới đích bạn nêu rõ** (ví dụ: "GitHub Pages của repo X, nhánh gh-pages"). Hiện chưa có remote/repo đích; tôi *không* push hay deploy khi chưa có xác nhận.
- Xác nhận CR-001 (docs/change_requests).
- Có chấp nhận phát hành với các giới hạn trên, hay muốn làm thêm (playtest, sự kiện lựa chọn, thủy triều CMP-02…) trước.

## Rollback
Bản phát hành là tệp tĩnh: rollback = redeploy `dist/` của commit trước (git tag `rc1` đặt cục bộ).
