# CR-001 — Điều chỉnh thiết kế phát sinh từ bằng chứng TST-08 (Phase 4)

Ngày: 2026-10-21 · Baseline gốc: DB-0.1 (G2 đã duyệt) · Loại: **làm rõ/cân bằng**, không đổi phạm vi (vẫn MVP = CMP-01). Cần bạn xác nhận khi xem G3.

## Vì sao
Bot mô phỏng (`tests/bots.ts`) cho thấy bản DB-0.1 nguyên trạng có chiến thuật thống trị: **dân binh đồn trú không giới hạn** giúp một ô thủ phủ chặn cả 5 đợt tập kích mà không mất quân và thắng nếu bỏ bớt kế sách. Tôi đã *không* giữ im lặng mà sửa như sau (dữ liệu: `docs/qa/balance_last.json`).

## Thay đổi
| ID | Thay đổi | Lý do |
|---|---|---|
| CR-001-a | **Trần đồn trú theo ô**: 4 (+4 thủ phủ) + 3 mỗi cấp lũy (SYS-05) | Chặn spam đồn trú |
| CR-001-b | **Điều kiện đàm phán thắng**: giữ ≥3 khu định cư (ngoài ≥4 đợt chặn, Dân tâm ≥10, từ lượt 21, không còn đợt tập kích) (SYS-12) | Buộc mở rộng, hết "turtle" thắng |
| CR-001-c | Trần công sự 0.40 (trước đó chỉ nêu "tối đa" chưa số); ô định cư thường có 4 ô xây (trước 3) | Cân bằng |
| CR-001-d | Sản lượng cơ bản ×2; đợt 3–5: 9+6, 14+9, 19+12 (bộ binh + cung thủ địch) | Cân bằng, ~52% bot thắng |
| CR-001-e | Lập khu định cư: +3 Dân tâm; đánh chiếm ô: +2; chặn tập kích: +3; mất ô: −5 | Quy định rõ (GDD chỉ nói "Dân tâm từ…") |
| CR-001-f | Không có chi phí duy trì lương (GDD SYS-03 có nhắc "tốn lương duy trì nhỏ") | Không cần sau khi có trần đồn trú |

## Chưa thay đổi / còn nợ
EDGE-02, thủy triều, sự kiện lựa chọn, 12 ô → 28 ô (xem BACKLOG `note`).
