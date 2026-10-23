# CR-002 — Sự kiện có lựa chọn cho Chiến dịch 1 (CMP-01)

Ngày: 2026-10-23 · Baseline gốc: DB-0.1 + CR-001 (RC1) · Yêu cầu của người dùng: "thêm sự kiện có lựa chọn cho chiến dịch 1"
Loại: **thêm cơ chế (ảnh hưởng thiết kế)** → cần duyệt trước khi code. Trạng thái: **ĐÃ DUYỆT (2026-10-23, "approve CR-002") — ĐÃ TRIỂN KHAI cục bộ (RC2 chưa push/deploy)**.

## Phạm vi
Hoàn thiện FEAT-011 (đang `partial`): GDD SYS-10 đã nêu "sự kiện có lựa chọn", mục tiêu nội dung ~8 sự kiện. CR này chỉ làm CMP-01; không đụng CMP-02/03.

## Cơ chế đề xuất
- **Kích hoạt theo kịch bản** (lượt cố định hoặc điều kiện), *không ngẫu nhiên*, để mô phỏng vẫn tất định và tái lập được bằng seed.
- Xử lý ở bước 5 của thứ tự lượt (Sự kiện & tình báo). Sự kiện hiện ra ở bản tin cuối lượt dưới dạng hộp thoại (bàn phím/chạm được, có nhãn nguồn `SOURCED`/`FICTION`).
- **2–3 lựa chọn mỗi sự kiện**, mỗi lựa chọn hiện rõ chi phí và hệ quả *trước khi bấm* (nguyên tắc minh bạch như báo cáo trận). Có lựa chọn "bỏ qua" an toàn.
- Hiệu ứng chỉ dùng tài nguyên/cơ chế sẵn có: kho (lương, gỗ, đá, sắt), Dân tâm, quân, mức tình báo, đợt tập kích (dời ETA, đổi quân số). Không thêm tài nguyên mới.
- Phải chọn trước khi **Kết thúc lượt** tiếp theo; sự kiện chưa chọn tự rơi về lựa chọn mặc định (ghi trong bản tin). Lưu/nạp và hoàn tác trong lượt tương thích.
- Dữ liệu ở `game-data/events_cmp01.yaml`, ID `EVT-xx`, mỗi bản ghi có `source_label` và `source_ids`.

## Danh sách sự kiện đề xuất (số liệu là placeholder, chốt khi cân bằng)
| ID | Lượt | Nhãn | Tình huống | Lựa chọn (hệ quả sơ bộ) |
|---|---|---|---|---|
| EVT-01 | 2 | SOURCED (khung) | Tin tình báo về việc phía Bắc chuẩn bị (khung "tiên phát chế nhân") | (a) Cử trinh sát: tốn lương, tăng mức tình báo 1 đợt / (b) Tập kích trước ở biên: tốn quân, hoãn đợt 1 thêm 1 lượt, rủi ro mất quân / (c) Chỉ củng cố: +công sự nhỏ ở tiền tuyến |
| EVT-02 | 4 | FICTION | Dân làng tản cư từ vùng biên xin vào thành | (a) Đón nhận: +Dân tâm, −lương / (b) Chỉ nhận thợ: +gỗ/đá, Dân tâm không đổi / (c) Từ chối: giữ lương, −Dân tâm |
| EVT-03 | 7 | FICTION | Tin đồn sai về hướng tiến quân của địch | (a) Tin và dồn quân sang hướng đó (nếu sai: ô thật bị hở) / (b) Kiểm chứng: tốn 1 lượt, giữ tình báo / (c) Phân tán nhẹ |
| EVT-04 | 10 | FICTION | Thương nhân xin qua lại biên giới | (a) Cho qua và thu thuế: +kho, giảm tình báo / (b) Mua tin: tốn kho, +tình báo / (c) Cấm: không đổi |
| EVT-05 | 13 | FICTION | Thiếu lương trong quân | (a) Trưng thu: +lương, −Dân tâm / (b) Cắt khẩu phần: giảm chỉ tiêu quân tạm 2 lượt / (c) Xin vay lương của dân làng: +lương, nợ trả sau 3 lượt |
| EVT-06 | 16 | FICTION | Thợ rèn đề nghị cải tiến khí giới | (a) Đầu tư sắt: +sức mạnh cung thủ vĩnh viễn nhỏ / (b) Đầu tư gỗ: +công sự / (c) Từ chối |
| EVT-07 | 19 | SOURCED (khung, sông Như Nguyệt) | Chuẩn bị tuyến sông: đắp lũy hay giữ quân cơ động | (a) Lũy sông: +công sự ô tuyến sông, khóa quân tại chỗ 2 lượt / (b) Quân cơ động: +tốc độ, công sự không đổi / (c) Cả hai nửa vời |
| EVT-08 | 23 | FICTION/ALT | Sứ giả đối phương dò hỏi giảng hòa trước hạn | (a) Nghe: mở đàm phán sớm nếu đủ điều kiện, −Dân tâm nếu chưa đủ / (b) Hoãn: không đổi / (c) Từ chối thẳng: +Dân tâm, đợt sau mạnh thêm |

Ràng buộc nội dung (CNT-P1/P3): ngôn ngữ không miệt thị phía đối phương; số liệu chỉ là cơ chế, không trình bày như sự thật lịch sử; mọi chi tiết ngoài khung có nhãn `FICTION`.

## Tác động
- **Thiết kế:** cập nhật GDD SYS-10, bảng nội dung 03, thứ tự lượt (bước 5), backlog (FEAT-011 → done sau test).
- **Sim:** thêm `EventDef` trong `types.ts`/`data.ts` (có validator), trạng thái `pendingEvents`/`chosen` trong `GameState` (**đổi định dạng save → nâng version, nạp bản cũ RC1 được migrate sang không có sự kiện**), lệnh `choose` trong `commands.ts`, xử lý trong `turn.ts`.
- **UI:** hộp thoại sự kiện (focus quản lý, Esc không tự chọn), hiển thị hệ quả, nhật ký các lựa chọn đã làm.
- **Cân bằng:** có thể lệch mốc 52% thắng của bot. Cần chạy lại TST-08 với bot chọn (mặc định / ngẫu nhiên có seed / tham lam); mục tiêu: không có lựa chọn nào thống trị, `turtle`/`idle` vẫn 0%, bot `expand` giữ khoảng 40–60%. Nếu lệch sẽ chỉnh số, không đổi cấu trúc, và ghi vào CR-002.
- **Kiểm thử:** unit cho từng lựa chọn (hiệu ứng, từ chối khi thiếu kho), save/load/migrate, E2E (hộp thoại bằng bàn phím và chạm, axe), cập nhật `check_design.py`.
- **Phát hành:** sau khi xong sẽ là RC2. Push/deploy lên repo `vuthehuy1997/daiviet-rising` cần **bạn cho phép lại**; G3 hiện tại chỉ phủ RC1. Tôi sẽ không tự push.

## Rủi ro / câu hỏi mở
1. Văn bản sự kiện tiếng Việt là hư cấu do tôi soạn, chưa qua rà soát sử học.
2. Sự kiện tất định (cố định lượt) nên người chơi lần 2 sẽ biết trước; sự kiện ngẫu nhiên có trọng số để dành cho CR sau nếu bạn muốn.
3. Số lượng 8 sự kiện có thể quá dày cho một ván 28 lượt (cứ ~3 lượt một sự kiện). Có thể giảm còn 6.

## Cần bạn duyệt
Trả lời một trong các cách sau:
- `approve CR-002` để làm nguyên trạng (8 sự kiện, tất định, RC2 chỉ build cục bộ, chưa push).
- `approve CR-002: <chỉnh sửa>` (ví dụ giảm còn 6 sự kiện, đổi một lựa chọn, thêm ngẫu nhiên).
- Hoặc nói điểm cần đổi; tôi sửa CR rồi hỏi lại.


## Ghi chú triển khai (khác biệt so với bản duyệt — cần bạn biết)
- **Lượt kích hoạt:** EVT-07 (tuyến sông) chuyển 19→18 và EVT-08 (sứ giả) chuyển 23→19. Lý do: ở lượt 23 đã hết đợt tập kích (cuối cùng ở lượt 20) nên hệ quả "đợt sau mạnh thêm" vô nghĩa; EVT-08 phải đứng trước RAID-5.
- **Đơn giản hóa hệ quả cho khớp cơ chế sẵn có:** EVT-01b dùng chi phí + hoãn/làm yếu RAID-1 thay vì "rủi ro mất quân"; EVT-03a không còn "dồn quân sang hướng sai" mà là +công sự tạm kèm −tầm cảnh báo tạm (bị đánh lạc hướng); EVT-07a không khóa quân 2 lượt mà tốn Đá; EVT-08a/c đổi theo cơ chế đợt tập kích kế tiếp.
- **Số liệu đã chỉnh theo bằng chứng bot:** xem `docs/qa/EVENTS_BALANCE.md`, gồm cả hai vấn đề CHƯA giải quyết (vách RAID-5 và chuỗi "luôn chọn b" thắng 40/40 với bot).
- **Save:** `save_version` 2; bản RC1 (v1) được migrate (có test).
- **Kiểm thử:** Vitest 67/67, Playwright 25 đạt + 1 bỏ qua (desktop + mobile-touch, có axe với hộp thoại sự kiện), check_design OK. Bằng chứng: `docs/qa/EVIDENCE_rc2.txt`.
