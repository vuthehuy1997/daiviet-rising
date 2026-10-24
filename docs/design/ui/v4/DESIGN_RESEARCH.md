# Nghiên cứu đồ họa v4 — làm sao bản đồ "như tranh vẽ" trong ràng buộc ngân sách 0 đồng

Ngày 2026-10-24. Phạm vi: chỉ `docs/design/ui/`. Chưa đụng `src/`. Mức xác minh ghi rõ: **[ĐÃ MỞ]** = tôi đã mở trang/ảnh thật; **[ĐO]** = số tôi đo bằng lệnh; **[SUY ĐOÁN]** = chưa kiểm chứng.

## 1. Kết luận ngắn
Chọn **"tranh thủ tục lai, nướng sẵn" (baked procedural painting)**: một script Python (numpy/opencv, chỉ chạy lúc thiết kế/build) sinh ảnh nền bản đồ dạng tranh (địa hình có đổ bóng từ Tây-Bắc, núi khối mặt phẳng + nét gạch bóng, rừng vẽ bằng các nhát chấm lá, ruộng ô thửa, sông nhiều lớp, mây, hạt giấy), công trình SVG của dự án được "painterize" rồi ghép; chữ, ruy-băng, HUD vẫn là HTML/SVG sắc nét phía trên. Không dùng tài nguyên bên thứ ba nào. Dung lượng nền: **408 kB** (WebP 3200x1800, q78) hoặc 276 kB (2400x1350) **[ĐO]**.

Vì sao không chọn gói miễn phí: không gói nào CC0/CC-BY có phong cách vẽ tay + bối cảnh Việt/Á Đông (xem mục 3). Vì sao không dùng AI cục bộ: máy này không sẵn (mục 3d).

## 2. Chẩn đoán v3 (số liệu **[ĐO]**, `tools/ref_stats.py`)
v3 là SVG sống: 5049 nút DOM, chuỗi SVG 530 kB, 7 bộ lọc, tải ~1,3 s. Về thị giác: độ sáng TB 0,65 và p5 = 0,35 (không có vùng tối ⇒ phẳng, không chiều sâu); mật độ cạnh 0,225 (quá nhiều nét viền ⇒ "clip-art"). Chữ vàng `#b8892b` trên giấy chỉ đạt tương phản 2,17:1 (trượt AA) — lỗi này có từ v3 và đã sửa ở v4 (`#7a5412` = 4,64:1).

## 3. Khảo sát nguồn
### (a)(b) Tài nguyên có sẵn — chi tiết giấy phép trích nguyên văn ở `../ASSET_LICENSES.md`
| Nguồn | Giấy phép | Phong cách | Hợp Việt/Á Đông | Tải | Công tích hợp | Rủi ro pháp lý | Kết luận |
|---|---|---|---|---|---|---|---|
| Kenney Medieval RTS [ĐÃ MỞ, xem ảnh mẫu] | CC0 (120 file) | vector phẳng, lâu đài châu Âu | Không | vài MB | thấp | ~0 | Loại: xấu hơn hiện tại |
| game-icons.net [ĐÃ MỞ] | CC BY 3.0, bắt buộc ghi công | glyph một màu | Thấp | nhỏ (SVG) | thấp | ghi công từng tác giả | Không dùng (có thể làm icon phụ) |
| OpenGameArt [ĐÃ MỞ FAQ] | tùy từng asset | hỗn hợp | chưa thấy bộ phù hợp | — | — | phải đọc từng asset | Không chọn |
| itch.io hand-painted free [ĐÃ MỞ trang liệt kê] | không hiện trên trang liệt kê | — | — | — | — | không xác minh được | Loại theo quy tắc |
| Poly Haven / ambientCG [ĐÃ MỞ] | CC0 | texture ảnh thật | trung tính | MB/texture | thấp | ~0 | Không cần: hạt giấy sinh bằng nhiễu = 0 byte |
| Wikimedia Commons: Đông Hồ, Hàng Trống, Hồng Đức bản đồ [ĐÃ MỞ qua API] | "Public domain" / "CC0" (một số ảnh "CC BY-SA 4.0" ⇒ loại) | tranh khắc mộc bản, bản đồ cổ | Cao về mỹ thuật, nhưng thế kỷ 16–19 (không phải Lý 1075) | 30 kB–12 MB/ảnh | cao (phải vẽ lại thành sprite) | ảnh chụp tác phẩm: chưa thẩm định luật VN | Chỉ tham khảo bảng màu |
| Met Open Access [ĐÃ MỞ metmuseum.github.io; trang chính sách Met trả 429] | CC0 | tranh sơn thủy Trung Hoa | tham khảo giá trị sáng tối | — | — | cần kiểm cờ OA từng tác phẩm | Chưa dùng |

### (c) Kỹ thuật thủ tục trong trình duyệt
- SVG filter sống (v1–v3): đã thử 3 vòng; không tạo được nét gạch/nhát cọ có hướng, tốn 5049 nút DOM, kết quả bị đánh giá "tệ". Kết luận thực nghiệm.
- Nướng sẵn bằng script (v4): DOM còn 434 nút, tải ~0,84 s **[ĐO, trong Chromium headless, máy 128 lõi — trên điện thoại chưa đo]**. Bảng dung lượng nền **[ĐO]**:

| Kích thước | WebP q60 | q70 | q78 | q85 | JPEG q82 |
|---|---|---|---|---|---|
| 3200x1800 | 298 kB | 337 | 408 | 553 | 782 |
| 2400x1350 | 203 | 230 | 276 | 376 | 495 |
| 1600x900 | 118 | 135 | 165 | 221 | 262 |
- Sinh ảnh bằng WebGL/canvas ngay trong trình duyệt: **chưa làm, chưa đo [SUY ĐOÁN]** — tốn thời gian khởi động và khó kiểm soát chất lượng; nướng sẵn rẻ hơn và tái lập được (seed cố định).

### (d) AI tạo ảnh cục bộ — kiểm tra thật bằng lệnh
`nvidia-smi`: 4 GPU H100 NVL 96 GB nhưng đang bị dùng gần hết bởi tác vụ khác (trống: 4,3 GB / 0,03 / 1,2 / 1,2 GB). Không có `torch`/`diffusers` trong Python mặc định; quét các môi trường conda không thấy `diffusers`; cache HuggingFace không có mô hình ảnh (chỉ LLM/OCR/CLIP). Có mạng qua proxy nên về lý thuyết tải được trọng số, nhưng: (1) GPU dùng chung gần đầy, chạy thêm có thể làm hỏng việc của người khác — tôi **không thử**; (2) bản quyền ảnh do AI sinh chưa rõ và giấy phép trọng số phải đọc riêng; (3) không bảo đảm nhất quán phong cách giữa nhiều ảnh. Kết luận: không dùng. Nếu bạn có máy/ dịch vụ riêng, đây là con đường cho chất lượng cao nhất (xem mục 7).

### (e) Người dùng tự cấp tranh — xem mục 7.

## 4. Tham chiếu phong cách (nguyên tắc, không chép tranh)
Nguồn: ảnh chụp màn hình chính thức trên trang cửa hàng Steam (4 game) + 6 ảnh Demacia Rising đã dùng ở `docs/research/REFERENCE_UI_DEMACIA.md`; tôi đã xem ảnh, chỉ đo số và không lưu ảnh vào repo. **[ĐO]** (ảnh thu 960x540):

| Ảnh | Sáng TB | p5 | p95 | Biên độ | Bão hòa | Mật độ cạnh |
|---|---|---|---|---|---|---|
| Demacia Rising (bản đồ) | 0,49 | 0,22 | 0,89 | 0,67 | 0,34 | 0,16 |
| Demacia Rising (bản đồ + panel) | 0,59 | 0,24 | 0,89 | 0,65 | 0,35 | 0,14 |
| Battle Brothers (bản đồ thế giới) | 0,35 | 0,13 | 0,69 | 0,55 | 0,33 | 0,12 |
| Total War: Three Kingdoms (chiến dịch) | 0,23 | 0,00 | 0,51 | 0,51 | 0,42 | 0,15 |
| Battle for Wesnoth | 0,29 | 0,11 | 0,53 | 0,42 | 0,47 | 0,13 |
| The Banner Saga (đồ họa) | 0,40 | 0,00 | 0,89 | 0,89 | 0,27 | 0,18 |
| v3 (trước) | 0,65 | 0,35 | 0,91 | 0,57 | 0,33 | 0,23 |
| **v4 bản đồ + HUD** | 0,50 | 0,19 | 0,84 | 0,64 | 0,42 | 0,24 |
| v4 chỉ nền bản đồ | 0,43 | 0,18 | 0,67 | 0,49 | 0,40 | 0,18 |

Nguyên tắc rút ra: (1) bản đồ chiến lược tranh vẽ có độ sáng TB ~0,3–0,5 và p5 ≤ 0,22: **phải có vùng tối thật** để tạo chiều sâu; v3 quá sáng. (2) Biên độ giá trị ≥ 0,55 với HUD sáng nằm trên nền tối vừa. (3) Bão hòa vừa (0,27–0,35) — v4 còn cao (0,40). (4) Ánh sáng nhất quán một hướng, bóng đổ có sắc lạnh (Demacia, Banner Saga: bóng chàm/xanh, không đen). (5) Đá/núi là vật thể tương phản mạnh nhất, có nét gạch bóng trên mặt khuất. (6) Địa điểm là cụm nhỏ trên nền đất, nhãn ruy-băng sáng đè lên nền tối để dễ đọc. (7) Rừng là khối tối + nhát sáng, không phải từng cây tròn đều nhau. (8) Total War: Three Kingdoms dùng mực loang đen làm khung HUD ⇒ gợi ý khung "mực tàu" cho HUD Á Đông (chưa làm).

## 5. Quyết định và phản biện
Chọn nướng thủ tục vì: chi phí 0 đồng, 0 rủi ro bản quyền, ≈408 kB (trong ngân sách 600 kB), đạt giá trị sáng/tối gần chuẩn tham chiếu, tái lập, sửa bố cục chỉ cần chạy lại. 

Điểm yếu thành thật:
1. **Công trình vẫn là SVG clip-art** (mái, cọc rào, lều): painterize chỉ làm mềm/viền, không thành tranh vẽ tay. Đây là phần giống "clip-art" nhất còn lại.
2. **Núi dạng khối đa giác mặt phẳng** — gọn nhưng giống giấy gấp, chưa phải núi đá vẽ tay của Demacia; sơn thủy Việt chưa có.
3. Cây lặp (ba dạng: tán tròn, thông, tre). Có chất tranh nhưng người xem tinh ý thấy khuôn.
4. Ảnh nướng độ phân giải cố định: zoom 2,7x cần bản 4x (6400x3600) — cỡ ảnh vượt ngân sách (chưa nén bản này; ước lượng gấp ~3–4 lần bản 3200 [SUY ĐOÁN]) ⇒ cần chia ô (tile) hoặc giới hạn zoom ≤1,5x. Bản 02_zoom_detail_v4.png là upscale bản 2x (mờ), bản `_hi` dựng từ 4x để cho thấy trần chất lượng.
5. Bão hòa còn cao, mật độ cạnh HUD 0,24 (> 0,16 chuẩn).
6. Nhãn ruy-băng và HUD vẫn là vector phẳng có hạt giấy — hài hòa nhưng chưa "vẽ tay".
7. Mới có màn bản đồ chính + cận cảnh; thẻ sự kiện, báo cáo trận, mobile chưa dựng lại bằng phong cách này. Chưa kiểm thử trên điện thoại thật.
8. Chưa hỏi chuyên gia sử học về trang phục/kiến trúc; mái cong và sen là gợi ý, không phải khảo chứng.

Kết luận thẳng: v4 tốt hơn v3 rõ về chiều sâu và chất liệu, nhưng **không ngang họa sĩ thật**. Muốn vượt trần này cần họa sĩ/ảnh do người dùng cấp (mục 7).

## 6. Vòng lặp tự chấm (checklist) trên 01_map_desktop_v4.png
Vòng 1: sáng/tối ổn nhưng núi như vệt sáp mờ, mây xám, nước có vân như đường đồng mức, ruộng như bàn cờ ⇒ Vòng 2: thay núi bằng khối chóp phẳng nhiều tầng, vẽ lại dòng chảy bằng nét, làm ruộng lớn và dịu, cây có tán nhiều thùy. Vòng 3: nâng sàn tối của đá (bớt đen), bờ đất nền làng lởm chởm thay vì hình bầu dục, tắt mờ ở công trình, giảm bão hòa, giảm cỏ lặp. Vòng 4: sửa hạt giấy làm tối ảnh, sửa tương phản chữ vàng. Kết quả:
- Chữ không tràn: nhãn đều nằm trong ruy-băng (xem ảnh) — đạt, kiểm bằng mắt, chưa test tự động.
- Tương phản AA **[ĐO]**: bảng tên ta 6,12:1; địch 7,67:1; đất trống 6,92:1; mực/giấy 9,4:1; chip 11,7:1; chữ vàng cũ 2,17 ⇒ mới 4,64:1. Chưa đo toàn bộ phần tử.
- Nguồn sáng: từ Tây-Bắc, bóng rơi Đông-Nam cho núi, cây, công trình, mây — nhất quán.
- Đọc trạng thái: ta/địch/đất trống vẫn phân biệt bằng viền ruy-băng + biểu tượng + chữ; đường tập kích đỏ đi theo đường thật.
- Còn nhược: pad đất trống hơi xám, nhãn che phần đáy công trình (giữ từ v3).

## 7. Việc cần người dùng quyết định / cung cấp
Quyết định: (a) chấp nhận phong cách v4 làm nền cho V2, hay chờ tranh thật? (b) cho phép tôi chạy mô hình ảnh trên GPU chung (cần bạn xác nhận vì tranh tài nguyên) hay bạn tự có công cụ? (c) giới hạn zoom hay chấp nhận tile 4x?
Nếu muốn chất lượng tranh vẽ tay thật, cung cấp (PNG nền trong, tay/ảnh gốc ≥ 2x): 1) 8–10 sprite công trình theo bối cảnh Lý (nhà mái cong, tháp canh gỗ, lũy, trại lính, thuyền) mỗi cái 3 trạng thái ta/trống/địch; 2) 3–4 kiểu cây (đa, tre, thông, cây ăn quả) và 3–4 khối núi/đá; 3) 1 tranh nền bản đồ hoặc bộ ô địa hình (đồng ruộng, rừng, núi, sông, biển); 4) khung ruy-băng, nút tròn, đĩa kết thúc lượt; 5) tranh sự kiện cho 6 sự kiện; 6) ghi rõ giấy phép (tự vẽ + chuyển nhượng cho dự án, hoặc CC0/CC-BY kèm URL). Ảnh AI tạo ra: cho biết công cụ + điều khoản dùng thương mại.

## 8. Ước lượng dung lượng đưa vào game (nếu duyệt)
Nền 408 kB (hoặc 276 kB ở 2400x1350) + roads 23 kB (nén được ~8 kB) + 2 font OFL đã có ~181 kB ⇒ **≈ 0,6–0,7 MB gồm cả font; phần đồ họa mới ≈ 0,3–0,43 MB**. Hạt giấy chạy bằng SVG filter 0 byte. Sinh lại: `tools/run.sh` (~1 phút) rồi `mockups/render.mjs`; ảnh trung gian (sprites*.png, map_bg*.png) nằm trong `build/` và bị `.gitignore`.
