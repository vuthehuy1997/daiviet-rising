# 03 — Nội dung, lịch sử & tường thuật (CNT-xx)

Nhãn bắt buộc cho mọi nội dung: `[SOURCED]` có nguồn · `[FICTION]` hư cấu · `[ALT-HISTORY]` giả định. Nguồn hiện có: `docs/research/HISTORY_SETTING.md` (độ tin cậy TB-thấp, **cần rà soát sử học trước khi phát hành**).

## Chiến dịch (CMP)
| ID | Chiến dịch | Thời kỳ | Spine | Lớp | Phát hành |
|---|---|---|---|---|---|
| CMP-01 | Hộ Quốc Tuyến | Lý–Tống 1075–1077 | A | C giản lược (tuyến sông) | **MVP** |
| CMP-02 | Sông Nước Bạch Đằng | Trần–Nguyên 1285–1288 | A | C đầy đủ (thủy triều/cọc/nhử) | Sau MVP |
| CMP-03 | Mở Cõi Phương Nam | Thế kỷ XV (hoặc giả định) | A | B ngoại giao/ảnh hưởng | Sau MVP, cần cố vấn sử học |

## CMP-01 khung sự kiện (`SOURCED` ở mức khung, chi tiết `FICTION`)
1. Mở đầu: tình báo về việc Tống chuẩn bị (khung H8 "tiên phát chế nhân").
2. Hành động tùy chọn: **tập kích trước ở biên** (người chơi chọn; hệ quả là cơ chế game, không khẳng định chi tiết lịch sử).
3. Các đợt tập kích tăng dần về biên/Bắc; tuyến sông (CP1 đặt chủ đề sông Như Nguyệt, ≈ đầu 1077 theo H2).
4. Kết: giảng hòa — điều kiện ngoại giao (SYS-10).
- Nhân vật có nguồn: Lý Thường Kiệt (chỉ huy). Nhân vật khác `FICTION` ghi rõ.
- Văn bản: *Nam quốc sơn hà* — chỉ trích dẫn dạng ghi nguồn nếu dùng; kiểm tra bản quyền/bản dịch.

## Nguyên tắc tường thuật
- CNT-P1: Quân đối phương là **thực thể lịch sử có chiều sâu**, không đồng nhất với quốc gia/dân tộc hiện đại; tránh ngôn ngữ miệt thị.
- CNT-P2: Không gộp các cuộc chiến cách nhau nhiều thế kỷ mà không giải thích; mỗi chiến dịch có màn "bối cảnh & nguồn".
- CNT-P3: Số liệu quân/thương vong **không hiển thị như sự thật lịch sử**; chỉ cơ chế trừu tượng.
- CNT-P4: Nội dung bạo lực với dân thường (nhất là CMP-03) xử lý bằng cách diễn đạt có trách nhiệm, qua rà soát sử học/cộng đồng.

## Cấu trúc dữ liệu
Nội dung đặt trong `game-data/` (YAML/JSON), ID ổn định: `CMP-`, `TIL-`, `BLD-`, `UNT-`, `CHR-`, `EVT-`, `POL-` (kế sách). Mỗi bản ghi có `source_label` và `source_ids`.

## Danh mục nội dung MVP (mục tiêu)
~28 ô, ~11 công trình, ~6 loại quân, ~3 tướng/chỉ huy có nguồn, ~8 sự kiện, ~12 kế sách (placeholder; chốt khi cân bằng).
