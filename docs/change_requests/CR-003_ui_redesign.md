# CR-003 — Làm lại giao diện theo tham chiếu Demacia Rising

Ngày: 2026-10-23 · Baseline gốc: RC2 · Yêu cầu: "làm lại giao diện, tham khảo design của demacia rising dùm" (+ phản hồi: giao diện hiện chỉ là khung chữ nhật, chữ tràn, không có minh họa)
Loại: **thay đổi thiết kế UX/nghệ thuật (UXD-01..05, PIL art), KHÔNG đổi luật chơi/sim.** Trạng thái: **CHỜ DUYỆT**.
Tham chiếu: `docs/research/REFERENCE_UI_DEMACIA.md` (từ ảnh chính thức của Riot; chỉ lấy nguyên tắc bố cục, không sao chép tranh/tên/biểu tượng).

## Vấn đề thật
RC1/RC2 chỉ được kiểm tra chức năng + trợ năng, chưa từng được review thị giác. Ảnh chụp thật: bản đồ là 12 hộp phẳng, chữ tràn khỏi ô, panel toàn nút chữ, không có biểu tượng/minh họa, người chơi không thấy điều kiện thắng.

## Hướng nghệ thuật đề xuất (mặc định nếu bạn chỉ gõ `approve CR-003`)
- **Phong cách:** bản đồ vẽ tay nét mực + màu nước nhạt trên **giấy dó** (kem), mực nâu đen; điểm nhấn **son đỏ** (địch/cảnh báo), **chàm** (sông, UI), **vàng thếp** (viền, nhấn). Họa tiết khung lấy từ **thời Lý: sen, rồng Lý, lá đề** (tránh trống đồng Đông Sơn vì lệch niên đại với 1075). Cần thẩm định sử học cho họa tiết.
- **Cách làm (ngân sách tối thiểu, không dịch vụ trả phí):** minh họa SVG tự vẽ (sông/núi/rừng/đường cong, nhà, ruộng, tháp, lũy, trại), có bộ lọc SVG tạo nét tay + vân giấy; biểu tượng tài nguyên/quân/công trình vẽ SVG. Có thể dùng thêm tài nguyên giấy phép CC0/OFL nếu cần (ghi nguồn trong `docs/`); font tự đóng gói (OFL, có tiếng Việt) để chạy offline.
- **Thành thật về chất lượng:** tôi không phải họa sĩ; SVG thủ tục sẽ đẹp hơn nhiều so với hiện tại nhưng KHÔNG ngang tranh vẽ tay của Riot. Nếu bạn có/cho phép dùng tranh nền hoặc bộ icon riêng, tôi gắn vào chỗ đã chừa sẵn.

## Phạm vi thay đổi
| ID | Nội dung | Nguyên tắc |
|---|---|---|
| UI-1 | **Bản đồ toàn màn hình**: bố cục lại 12 ô thành khung ngang rộng (chỉ đổi `x,y` trong dữ liệu, giữ ID/kề), sông/núi/rừng/đường cong, mây-sương rìa; kéo/phóng to-thu nhỏ (chuột, cảm ứng, bàn phím) với nút "vừa màn hình" | P-UI1 |
| UI-2 | **Địa điểm = cụm minh họa + bảng tên ruy-băng** (cấp, quân đồn trú); địch = bảng đỏ + lửa trại; mục tiêu không tràn chữ | P-UI1, P-UI5 |
| UI-3 | **HUD**: thanh tài nguyên có biểu tượng + Quân dùng/trần; **thẻ Mục tiêu** hiển thị tiến độ điều kiện thắng/thua (chặn n/4, khu định cư n/3, Dân tâm n/10, lượt n/28) | P-UI2 |
| UI-4 | **Nút Kết thúc lượt lớn** (đĩa sen-mặt trời) + nút tròn: Nhật ký, Kế sách, Bối cảnh, Cài đặt (xuất/nhập/chơi lại), **Hoàn tác** đỏ có huy hiệu số | P-UI3 |
| UI-5 | **Bảng trái trượt ra** khi chọn ô: tiêu đề, lưới ô công trình (trống/khóa), lưới quân, hành động; ô địch: biểu tượng + số lượng + dự báo + Tấn công; chú giải khi bấm | P-UI4, P-UI5 |
| UI-6 | **Cảnh báo tập kích**: huy hiệu đếm ngược trên ô bị nhắm + mũi tên chạy dọc đường (tôn trọng giảm chuyển động) | P-UI5 |
| UI-7 | **Hộp thoại sự kiện** dạng thẻ có tranh + lựa chọn song song ghi hậu quả; **báo cáo trận** có hai phe bằng biểu tượng + biểu ngữ thắng/thua + nguyên nhân | P-UI6 |
| UI-8 | **Kế sách** thành bảng nút thoi theo nhóm màu (3 kế sách hiện có) | P-UI7 |
| UI-9 | **Điện thoại**: bản đồ toàn màn hình, bảng ô thành bottom-sheet, cụm nút góc dưới phải, vùng chạm ≥44px | UXD-A11Y |

## KHÔNG thay đổi
Luật chơi, dữ liệu cân bằng, save (không đổi version), sim, thứ tự lượt, nội dung sự kiện. Chủ đề tối (prefers-color-scheme: dark) hiện có: **đề xuất bỏ**, dùng một giao diện giấy dó duy nhất (nếu bạn muốn giữ thì nói; chi phí thêm một bộ màu cho bảng/HUD).

## Quy trình & cổng review thị giác (mới, vì lần trước thiếu)
Ba mốc, mỗi mốc có **ảnh chụp desktop + điện thoại** lưu ở `docs/qa/visual/` và tôi tự chấm theo checklist (chữ không tràn/không bị che, độ tương phản, vùng chạm, bố cục 1280×800 / 1920×1080 / 412×915) trước khi báo bạn:
- **V1:** bản đồ nghệ thuật + địa điểm + HUD + nút Kết thúc lượt (UI-1..4). Gửi ảnh cho bạn xem trước khi làm tiếp.
- **V2:** bảng ô, cảnh báo, sự kiện, báo cáo trận, kế sách (UI-5..8).
- **V3:** điện thoại, hiệu năng, đánh bóng (UI-9).
Kiểm thử: giữ toàn bộ Vitest (sim không đổi); cập nhật selector Playwright; giữ axe 0 vi phạm nghiêm trọng, thêm kiểm tra tương phản AA; ảnh chụp tham chiếu bằng Playwright; ngân sách tải: tổng JS+CSS+font+SVG ≲ 600 kB, tải lần đầu mượt trên Pixel 7 giả lập.
Phát hành: build cục bộ trước (RC3). Push/deploy cần **bạn cho phép lại** (G3 hiện chỉ phủ RC1/RC2).

## Rủi ro / câu hỏi mở
1. Chất lượng nghệ thuật phụ thuộc cách làm (xem trên). Bạn muốn: (a) SVG tự vẽ [mặc định], (b) bạn cấp bộ tranh/icon, hay (c) kết hợp?
2. Họa tiết thời Lý cần thẩm định sử học; chưa có chuyên gia.
3. Kéo/phóng bản đồ làm tăng độ phức tạp trợ năng/bàn phím; tôi sẽ vẫn bảo đảm Tab/Enter chọn ô như hiện nay.
4. Chưa xem được hoạt ảnh/âm thanh/điện thoại của Demacia Rising (ảnh chỉ là PC tĩnh) nên phần chuyển động là do tôi tự thiết kế, nhẹ.
5. Bỏ chủ đề tối (xem trên).

## Cần bạn duyệt
- `approve CR-003`: làm nguyên trạng (SVG tự vẽ, giấy dó + son/chàm/vàng, họa tiết Lý, bỏ chủ đề tối, 3 mốc V1–V3, chưa push).
- `approve CR-003: <chỉnh sửa>` (ví dụ đổi bảng màu, giữ chủ đề tối, bạn cấp tranh).
- Hoặc nêu điểm cần đổi.
