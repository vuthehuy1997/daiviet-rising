# CR-002 — Cân bằng sự kiện lựa chọn (bot, 40 seed, chiến thuật `expand` trừ khi ghi khác)

Bot không phải người chơi tối ưu. Mọi số là bằng chứng thô để phát hiện lệch, không phải mục tiêu thiết kế. Mốc: để sự kiện tự chọn mặc định = **21/40 (52%)**, giống trước CR-002.

## Từng lựa chọn đơn lẻ (các sự kiện khác để mặc định), sau khi chỉnh số
| Sự kiện | a | b | c |
|---|---|---|---|
| EVT-01 | 19 | 26 (đo trước khi tăng giá) | 21* |
| EVT-02 | 21 | 16* | 22 |
| EVT-03 | 21 | 21 | 21* |
| EVT-04 | 21 (đo sau chỉnh) | 22 (trước khi tăng giá, xem dưới) | 21* |
| EVT-05 | 21 (đo sau chỉnh) | 21* | 21 |
| EVT-06 | 21 | 21 (đo sau khi đổi sang tốn Sắt) | 21* |
| EVT-07 | 21 (đo sau khi đổi sang tốn Đá) | 24 (trước khi tăng giá) | 21* |
| EVT-08 | 21 | 21* | 20 |
(* = mặc định.) Không lựa chọn đơn lẻ nào ở ngoài 16–26/40.

## Những gì đã chỉnh vì bằng chứng (số liệu placeholder)
- EVT-04a: bản đầu (+15 Lương, +10 Gỗ) thắng 39/40 → bỏ Gỗ, còn +10 Lương.
- EVT-05a: bản đầu (−3 Dân tâm) thắng 0/40 → −1 Dân tâm, +30 Lương.
- EVT-06b, EVT-07a: tốn Gỗ cạnh tranh trực tiếp với nâng cấp lũy mà bot luôn làm, kết quả lật theo ngưỡng Gỗ (4/40 ↔ 38/40) → chuyển chi phí sang Sắt/Đá, hệ số công sự giảm (0.03 / 0.05).
- EVT-01b, 04b, 07b tăng giá nhẹ (ngăn lợi ích rẻ).

## Vấn đề CÒN LẠI (ghi nhận, chưa giải quyết)
1. **Vách RAID-5.** Mọi ván thua của `expand` là "hết thời hạn" vì đúng một đợt tập kích (thường RAID-5) chặn được hay không (4 vs 5 đợt chặn → Dân tâm 4 vs 12). Chỉ cần +3–5% công sự là lật. Đây là độ nhạy sẵn có của CR-001, sự kiện làm lộ ra. Kết quả bot quanh vách này kém tin cậy.
2. **Đường "luôn chọn b" (chuẩn bị/do thám) thắng 40/40** cho `expand` và `expand-strike`, dù từng lựa chọn đơn lẻ không áp đảo; bỏ riêng EVT-01 thì tụt 0/40, bỏ riêng EVT-02 còn 25/40 (tương tác EVT-01b + EVT-02). Nghĩa là tồn tại một chuỗi lựa chọn tốt rõ ràng với bot. Chưa biết người thật có thấy hiển nhiên không → cần playtest.
3. Chọn xoay vòng (`mix`) cho 9–22/40, tức chọn bừa thường kém hơn mặc định.
4. `turtle` 0/40 và `idle` 0/40 với mọi kiểu chọn (có test).
