# Dai Viet Rising — thiết kế giao diện (CR-003, bản XEM TRƯỚC)

Trạng thái: **mockup để bạn duyệt. Chưa có dòng code nào trong `src/` thay đổi.** Ảnh là HTML/SVG tĩnh dựng riêng (`mockups/`), dùng chữ và dữ liệu của game thật (RC2): ô, công trình, EVT-01, cảnh báo RAID-2. Tham chiếu bố cục: `docs/research/REFERENCE_UI_DEMACIA.md` (chỉ nguyên tắc, không sao chép tranh/biểu tượng Riot).

| Ảnh | Nội dung |
|---|---|
| `00_style_board.png` | bảng màu, chữ, bộ biểu tượng (tài nguyên, công trình, quân), 3 trạng thái bảng tên, nút, ô, nút Kết thúc lượt |
| `01_map_desktop.png` (1600×900) | màn chính: bản đồ toàn màn hình, HUD, thẻ Mục tiêu, thanh cảnh báo, bảng ô bên trái, nút Kết thúc lượt + cụm nút tròn |
| `02_event_card.png` | thẻ sự kiện EVT-01: tranh minh họa, 3 lựa chọn song song ghi hậu quả, nhãn nguồn, mặc định |
| `03_battle_report.png` | báo cáo trận: hai phe bằng biểu tượng + số, thanh lực lượng, nguyên nhân chính |
| `04_mobile.png` (412×915 @2x) | điện thoại: bản đồ + HUD gọn + bảng ô dạng bottom-sheet + cụm nút góc phải |

## Quyết định thiết kế
- **Bản đồ vẽ tay (SVG) toàn màn hình**: sông, núi, rừng, tre, đường cong; địa điểm là cụm minh họa (nhà mái cong, ruộng, chòi canh, lũy; trại + lửa cho địch) và **bảng tên ruy-băng** (của ta: kem–vàng; đất trống: nâu; địch: đầu đỏ). Chip dưới bảng: quân đồn trú (ta) hoặc ước lượng (địch, `≈`).
- **HUD:** tài nguyên có biểu tượng + Quân dùng/trần; **thẻ Mục tiêu luôn hiện** với tiến độ điều kiện thắng (hiện game chưa nói rõ); thanh cảnh báo tập kích có ETA + tình trạng "tới kịp".
- **Nút Kết thúc lượt** là đĩa sen–mặt trời (họa tiết thời Lý, không dùng trống đồng); cụm nút tròn: Nhật ký, Kế sách, Bối cảnh, Cài đặt, **Hoàn tác** đỏ có huy hiệu số bước.
- **Bảng ô** bên trái: tiêu đề ruy-băng vàng, lưới ô công trình (có ô trống/khóa), lưới quân đồn trú (8 ô = trần đồn trú của thủ phủ) và quân cơ động.
- **Màu:** giấy dó, mực, son, chàm, vàng thếp, lục đồng. Mọi trạng thái có biểu tượng + chữ, không chỉ màu.
- **Font:** Lora Bold (tiêu đề) + Be Vietnam Pro (nội dung), cả hai OFL, có tiếng Việt, tự đóng gói để chạy offline (giấy phép ở `mockups/fonts/`).

## Tự đánh giá thẳng
- Đẹp hơn hẳn bản hộp chữ nhật hiện tại, nhưng **không ngang tranh vẽ tay của Riot**: cây/núi/nhà là SVG thủ tục, hơi "đồ họa vector" và lặp lại. Muốn đẹp hơn cần tranh nền/icon do họa sĩ hoặc công cụ ảnh của bạn.
- Chưa có: cây Kế sách (nút thoi), hộp thoại Xây dựng, bảng ô địch (có biểu tượng địch + dự báo), tooltip/chú giải, trạng thái chọn quân, hoạt ảnh. Sẽ làm ở mốc V2.
- Mobile: HUD chiếm ~190px đầu màn hình che phần bắc của bản đồ; thẻ Mục tiêu thu gọn thành một dòng.
- Họa tiết (sen, lá đề, rồng Lý) chưa thẩm định sử học; tranh sự kiện mới là cảnh trinh sát chung, các sự kiện khác cần tranh riêng hoặc dùng 4–5 cảnh dùng chung.
- Chưa kiểm tra tương phản AA bằng công cụ trên bản mockup; sẽ kiểm tra trên bản code thật (axe).

## Dựng lại ảnh
`node docs/design/ui/mockups/render.mjs` (cần `@playwright/test` + Chromium, đã có trong dự án).

## Nâng cấp đồ họa lần 2 (2026-10-23, phản hồi "đồ họa chưa đủ")
Giữ nguyên bố cục/HUD, vẽ lại lớp minh họa theo một nguồn sáng thống nhất (trên-trái, bóng đổ xuống phải):
- **Nền đất**: gradient + mảng màu loang (rừng đậm, đồng lúa vàng, đất cát), vân giấy/mottle, cỏ lác đác; bờ biển có viền cát + sóng vỗ; sông có bờ cát, nước sâu/nông, ánh sáng.
- **Núi**: cụm 3 đỉnh có mặt sáng/mặt khuất, nét gạch bóng, sương chân núi, cây thông ở chân.
- **Cây**: 2 loại (tròn nhiều tầng sáng-tối, thông 3 tầng), bóng đổ; tre có đốt.
- **Công trình**: mái ngói cong đầu đao vểnh (kiểu Lý) có khối sáng/tối + đường ngói; tháp 3 tầng ở thủ phủ; tường đá; lũy cọc có mặt sáng; ruộng bậc có ánh nước.
- **Đồn địch**: lều nhiều lớp có cờ hiệu, lều chỉ huy, lửa trại có quầng sáng + khói, giá giáo, lũy cọc.
- **Tranh sự kiện**: cảnh bình minh nhiều lớp (núi xa phủ sương → thung lũng → đồn địch có lửa → trinh sát trên vách đá).
- **Đường**: đường đất có bóng, vệt bánh xe; làng nhỏ rải ven đường; sương mù phía bắc (chưa khám phá).

Giới hạn còn lại (trung thực): vẫn là SVG thủ tục, nên cây/nhà còn lặp mẫu; chưa có hoạt ảnh; tranh sự kiện mới có 1 cảnh (7 sự kiện còn lại dùng chung hoặc chờ tranh); cây Kế sách, hộp Xây dựng, bảng ô địch chưa thiết kế. Nếu muốn vượt mức này cần tranh nền/icon do họa sĩ hoặc công cụ ảnh bạn cấp (CR-003 câu hỏi 1).
