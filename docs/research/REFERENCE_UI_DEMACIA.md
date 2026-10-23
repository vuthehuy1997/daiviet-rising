# Demacia Rising — tham chiếu giao diện (UI) quan sát được

Ngày: 2026-10-23. Nguồn: 6 ảnh chụp màn hình CHÍNH THỨC trên trang hỗ trợ Riot ("League of Legends: Demacia Rising metagame", support.riotgames.com) + văn bản trang đó. Ảnh chỉ được xem để phân tích bố cục, KHÔNG sao chép vào repo (bản quyền Riot). Độ tin cậy: cao cho những gì thấy trong ảnh; **chưa có**: hoạt ảnh, âm thanh, bố cục điện thoại (đây là client PC), nhịp độ thực tế. Không suy diễn cơ chế từ ảnh.

## Quan sát (đã thấy trong ảnh)
1. **Bản đồ là toàn màn hình**, không nằm trong "hộp". Tranh vẽ tay nét mực + màu tô, nhìn chéo từ trên: đồng cỏ, sông rộng xanh, núi đá có vách và nét gạch bóng, rừng thông, mây ở rìa, vùng chưa khám phá bị tối/phủ sương. Đường là lối đá cuộn theo địa hình (không phải đường thẳng).
2. **Mỗi địa điểm là một cụm minh họa nhỏ** trên nền đất (nhà, ruộng, tháp, trại), không phải ô chữ nhật. Dưới cụm có **bảng tên dạng ruy-băng**: có huy hiệu cấp "Lv.N", viền vàng; địa điểm của mình có nền sáng + cờ xanh; **trại địch có bảng đầu đỏ + lửa trại**; địa điểm chưa chiếm có bảng nâu nhạt; số nhỏ dưới bảng cho biết số quân đồn trú.
3. **HUD góc trên phải:** thanh giấy da dạng viên thuốc, mỗi tài nguyên có biểu tượng + số (Lương hiện có/trần quân, gỗ, đá, ...). Dưới đó là **thẻ Mục tiêu** viền vàng, luôn hiện, nói rõ việc cần làm kế tiếp.
4. **Góc dưới phải:** nút **Kết thúc lượt hình mặt trời** lớn trong vòng tròn viền vàng, kèm con số (chi phí lượt), xung quanh là các nút tròn nhỏ (cuộn giấy/nhật ký, nghiên cứu, rương) + nút **hoàn tác đỏ tròn có huy hiệu số** + bánh răng cài đặt.
5. **Bảng bên trái trượt ra khi chọn địa điểm:** tiêu đề ruy-băng vàng ("Enemy Territory" / tên thành + Lv); thân giấy da. Thành: nhãn địa hình, **lưới ô công trình** (ô trống viền cam, ô khóa có ổ khóa), **lưới 8 ô quân đồn trú** (chân dung tròn, ô khóa). Lãnh thổ địch: **biểu tượng địch kèm số lượng**, dòng đỏ "nên mang tướng X", nút **Di chuyển**, thanh **Phần thưởng** màu xanh đậm. Bấm vào một biểu tượng → thẻ chú giải (tên + một dòng đặc tính).
6. **Cảnh báo:** huy hiệu đỏ có số đếm ngược đặt trên địa điểm bị nhắm.
7. **Sự kiện (modal):** thẻ giấy da viền vàng, **tranh minh họa lớn phía trên** (khung họa tiết), tiêu đề chữ hoa vàng, 1–2 câu bối cảnh, rồi **các lựa chọn là hai thẻ cạnh nhau, ghi rõ hậu quả bằng chữ ("Lose 30 Stone and 16 Metal")**. Nền phía sau tối đi, HUD vẫn thấy được.
8. **Xây dựng:** hộp thoại bên phải bảng: danh sách công trình ở cột trái, minh họa lớn + sản lượng/lượt + nút Build.
9. **Nghiên cứu:** cây kỹ năng nút hình thoi, **màu viền theo nhóm** (xanh lá = hệ thống, xanh dương = vương quốc, đỏ = chiến đấu, vàng = tướng — theo trang hỗ trợ), nối bằng đường; nút khóa xám; bảng chi tiết bên trái có nút Mở khóa + giá.
10. **Ngôn ngữ thị giác chung:** giấy da kem + vàng + xanh navy + đỏ; chữ tiêu đề hoa dạng khắc; nút tròn viền vàng; nhiều minh họa nhỏ thay cho chữ.

## Nguyên tắc rút ra cho Dai Viet Rising (KHÔNG sao chép thương hiệu/tranh)
- P-UI1: bản đồ toàn màn hình, minh họa tay (nét mực + màu), đường cong theo địa hình; địa điểm là cụm minh họa + bảng tên, không phải hộp.
- P-UI2: HUD cố định: tài nguyên có biểu tượng + trần quân; **thẻ Mục tiêu luôn hiện** (nhờ đó người chơi biết điều kiện thắng, hiện game của chúng ta chưa nói rõ).
- P-UI3: một nút Kết thúc lượt nổi bật + hoàn tác nổi bật có huy hiệu số bước.
- P-UI4: bảng bên trái trượt ra theo ô được chọn, dùng lưới ô (công trình, quân) thay danh sách nút chữ.
- P-UI5: địch hiện bằng biểu tượng + số lượng; cảnh báo = huy hiệu đếm ngược trên ô bị nhắm.
- P-UI6: sự kiện = thẻ có tranh + lựa chọn song song với hậu quả ghi rõ (khớp CR-002).
- P-UI7: bảng nghiên cứu dạng cây nút theo nhóm màu.
