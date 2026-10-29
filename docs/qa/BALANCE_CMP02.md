# CR-005 M4 — Cân bằng CMP-02 (bot, 40 seed)

Bot không phải người chơi tối ưu; số liệu là bằng chứng thô để phát hiện lệch. Chưa có người chơi thật thử CMP-02. Tái lập: `npx vitest run tests/balance_cmp02.test.ts` (ghi docs/qa/balance_cmp02_last.json).

## Kết quả với dữ liệu hiện tại
| Bot | Thắng /40 | Lý do thua chính |
|---|---|---|
| idle (bỏ mặc) | 0 | Thủ phủ thất thủ (40) |
| turtle (chỉ giữ Thủ phủ) | 0 | còn 1/3 khu định cư (40) |
| basic (lấy 203/204/202, không dùng triều/nhử) | **21 (52%)** | còn 2/3 khu định cư (19) |
| tide-aware (tuyến sông + cọc + trạm canh, không nhử) | **0** | Dân tâm cạn kiệt (32), còn 2/3 (8) |
| lurer (như trên + nhử) | **30 (75%)** | còn 2/3 khu định cư (10) |

Mục tiêu CR: turtle/idle 0% ✔; bot cơ bản 30–60% ✔; bot dùng triều+nhử khá hơn nhưng ≤90% ✔ (lurer); không chiến thuật nào >90% ✔.

## Đã chỉnh vì bằng chứng
1. Bản đầu (cỡ đợt placeholder của M1): `turtle` và `basic` đều thắng 40/40. Tăng cỡ đợt (×~1.06; chỉ B4 thuyền 9→10 và B5 thuyền 12→13 đổi sau làm tròn).
2. Sau khi tăng cỡ đợt `turtle` vẫn thắng 36/40: thua một ô ngoài Thủ phủ không đủ nặng. Thêm luật survive `win_min_settled: 3` (khác bản duyệt, xem CR-005).
3. Chi phí nhử 20+20: `lurer` thắng 40/40 ở mọi cỡ đợt tới ×1.25 (nhử quyết định ván). Tăng lên 30+30 → 75%.

## Vấn đề CÒN LẠI (ghi nhận, chưa giải quyết)
1. **Vách, không phải dải.** Kết quả gần như không phụ thuộc seed (combat chỉ ±10%): quét cỡ đợt cho `basic` 40/40 (×1.04) → 21/40 (×1.06) → 1/40 (×1.1). 52% chỉ là điểm ngay sát vách; đổi nhẹ số liệu là lật. Giống "vách RAID-5" của CMP-01 (EVENTS_BALANCE.md).
2. **Thủy triều một mình không giúp.** `tide-aware` (cọc theo triều nhưng không nhử) thua `basic`: cọc chỉ giảm 6–15% sát thương, tốn Lương/Gỗ, và địch nhắm ô gần nguồn nhất (TIL-202 nếu có) nên cọc ở sông thường không bị đánh. Có thể do bot kém (hết Lương) hoặc do cơ chế cọc quá yếu; chưa phân biệt được. Cần quyết định thiết kế: tăng hiệu lực cọc / đổi cách chọn mục tiêu, hoặc chấp nhận triều chỉ là bổ trợ cho nhử.
3. **Nhử gần như quyết định.** Với 30+30 vẫn là chiến thuật mạnh nhất; chi phí là đòn bẩy duy nhất đã thử (cost 28→38/40, 30→30/40, 32→24/40).
4. Dân tâm là điểm chết: mất một ô là −5, 3 lượt âm liên tiếp là thua; bot nghiên cứu hết kế sách khiến Dân tâm về ~0 từ lượt 6.
5. Chỉ 5 đợt, một kịch bản; cỡ đợt, hệ số triều, chu kỳ đều là số của game, không có nguồn lịch sử.
