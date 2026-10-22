# 01 — Vision, Pillars, Cách gộp 3 concept (DSN-VIS)

Trạng thái: **candidate cho G2** · Phiên bản: 0.1 · Dựa trên G1 (xem `state/APPROVALS.md`) và `docs/research/REFERENCE_DEEP_DIVE.md`.

## Tầm nhìn
Chiến lược theo lượt trên web: mở rộng lãnh thổ Đại Việt ô-kề-ô và **giữ các thành/trấn trước các đợt tập kích** bằng quân, công trình, địa hình, hậu cần và kế sách — lấy bối cảnh các giai đoạn có sử liệu.

## Cách gộp A + B + C (đề xuất — cần duyệt ở G2)
| Lớp | Nguồn concept | Vai trò | Phát hành |
|---|---|---|---|
| Spine | A Hộ Quốc Tuyến | Vòng lặp lượt: mở rộng → cảnh báo → phòng thủ → phân giải | MVP |
| Lớp chuẩn bị chiến trường | C Thế Trận Sông Nước | Địa hình/thủy triều/cọc ngầm/nhử trong pha chuẩn bị; trận thủy | MVP (phần giản lược) + CP2 |
| Lớp khu vực/ngoại giao | B Mở Cõi Phương Nam | Chiến dịch phương Nam, ảnh hưởng/ngoại giao | Sau MVP (CP3), cần rà soát sử học |

**Nguyên tắc ranh giới:** MVP = *Chiến dịch 1* (Lý–Tống 1075–77). CP2 Trần–Nguyên, CP3 Nam tiến là bản mở rộng, mỗi bản qua change request.

## Trụ cột thiết kế
- **PIL-01 Mọi công trình đều đổi quyết định.** Công trình phải tác động tới mở rộng hoặc phòng thủ (bài học L1).
- **PIL-02 Đến kịp hay không.** Thời gian di chuyển (địa hình) so với bộ đếm cảnh báo là quyết định chính.
- **PIL-03 Trận tự động nhưng giải thích được.** Luôn có báo cáo nguyên nhân thắng/thua (D5).
- **PIL-04 Bản sắc Đại Việt.** Sông nước, đê, hậu cần, thành lũy tre/đất, ngoại giao — không mang cơ chế fantasy.
- **PIL-05 Sử liệu minh bạch.** Mỗi nội dung gắn nhãn `SOURCED / FICTION / ALT-HISTORY`; không dùng số liệu lịch sử chưa đối chiếu.
- **PIL-06 Nhỏ, offline, chạm được.** Chạy tĩnh trên GitHub Pages, chuột + chạm, tiếng Việt.

## Không làm (non-goals MVP)
Backend/online, monetization, chiến đấu điều khiển trực tiếp, mobile app gốc, nhiều ngôn ngữ, sao chép tên/nhánh nghiên cứu/tướng từ reference.

## Điểm khác biệt có chủ đích so với reference
| Reference | Dai Viet Rising |
|---|---|
| Cổng tiến trình bằng chơi LoL (10 Silver Shields/lượt) | Không có phí kết thúc lượt; áp lực bằng **lịch chiến dịch** (deadline sự kiện) |
| Chiến đấu auto, thông tin ít | Auto + **báo cáo nguyên nhân** + tình báo có độ nhiễu |
| Địa hình chỉ bonus công trình | Địa hình ảnh hưởng **tốc độ hành quân, phòng tuyến, trận** |
| Thắng/thua tổng chưa rõ | Thua/thắng chiến dịch **do chúng ta định nghĩa** (xem GDD SYS-12) |
