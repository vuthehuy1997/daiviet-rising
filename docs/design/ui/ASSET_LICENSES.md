# Giấy phép tài nguyên đồ họa — Đại Việt Rising (thiết kế UI, CR-003, v4)

Cập nhật: 2026-10-24. Phạm vi: chỉ thư mục `docs/design/ui/`. Chưa có gì được đưa vào `src/`.

## 1. Tài nguyên bên thứ ba ĐANG DÙNG trong bản v4

| Tài nguyên | Tác giả | URL | Giấy phép | Ghi công | Nơi dùng |
|---|---|---|---|---|---|
| Lora (Bold, tập con latin / latin-ext / vietnamese, woff2) | Cyreal | https://fonts.google.com/specimen/Lora | SIL Open Font License 1.1 (file nguyên văn: `mockups/fonts/LICENSE-Lora-OFL.txt`) | Không bắt buộc ghi công trên màn hình; giữ file giấy phép đi kèm font | Tiêu đề, bảng tên ruy-băng |
| Be Vietnam Pro (400/600, tập con latin / latin-ext / vietnamese, woff2) | Lâm Bảo Thịnh, Vietnam Type | https://fonts.google.com/specimen/Be+Vietnam+Pro | SIL Open Font License 1.1 (file nguyên văn: `mockups/fonts/LICENSE-BeVietnamPro-OFL.txt`) | Như trên | Chữ nội dung/HUD |

Hai font này đã có sẵn trong repo từ bản v1–v3 (CR-003), không được tải thêm ở lượt v4 này.

**Không có ảnh, icon, họa tiết hay tranh của bên thứ ba nào trong bản v4.** Toàn bộ bản đồ (`v4/map_bg.webp`) do thuật toán trong `v4/tools/paint_map.py` sinh ra từ số ngẫu nhiên có seed cố định + SVG biểu tượng do chính dự án vẽ (`mockups/art.js`). Không có tệp tải về nào bị chạy; không có mã bên thứ ba.

## 2. Nguồn đã mở xem và đã xác minh giấy phép nhưng KHÔNG dùng (chỉ ghi để quyết định)

| Nguồn | URL (đã mở ngày 2026-10-24) | Giấy phép, trích nguyên văn từ trang | Vì sao không dùng |
|---|---|---|---|
| Kenney (mọi asset) | https://kenney.nl/support | "all game assets on the asset pages are public domain licensed (CC0). You’re free to use them, even in commercial projects." / "Attribution is not required" | Đã xem ảnh mẫu Medieval RTS (https://kenney.nl/assets/medieval-rts, "License Creative Commons CC0", 120 file): vector phẳng kiểu lâu đài châu Âu, còn "clip-art" hơn bản hiện tại, sai bối cảnh |
| game-icons.net | https://game-icons.net/about.html | "provided ... under the terms of the Creative Commons 3.0 BY license. It means that you can use them freely as long as you credit the original author" | Biểu tượng một màu kiểu RPG phương Tây; cần ghi công từng tác giả; không hợp bộ icon sen/lá đề của dự án. Có thể cân nhắc cho icon phụ nếu bạn muốn, kèm ghi công |
| OpenGameArt (chính sách chung) | https://opengameart.org/content/faq | "you can use any of the art submitted to this site. Even in commercial projects. Just be sure to adhere to the license terms." | Giấy phép nằm ở TỪNG tài nguyên; chưa tìm được bộ nào hợp phong cách Việt/Á Đông chất lượng cao; không chọn |
| Poly Haven | https://polyhaven.com/license | "Our assets are all licensed as CC0" | Texture giấy PBR nặng (MB), không cần vì hạt giấy sinh bằng nhiễu thủ tục (0 byte) |
| ambientCG | https://docs.ambientcg.com/license/ | "All ambientCG assets are provided under the Creative Commons CC0 1.0 Universal License." | Như trên |
| Wikimedia Commons — tranh Đông Hồ, Hàng Trống (Daderot, người vô danh) | https://commons.wikimedia.org/wiki/Category:Dong_Ho_painting | Nhãn giấy phép theo API Commons: "Public domain" (8 tệp Đông Hồ), "CC0" (2 ảnh chụp của Daderot) ; 1 tệp là "CC BY-SA 4.0" (loại vì share-alike) | Thuộc thế kỷ 16–19, KHÔNG phải thời Lý; chỉ dùng làm tham khảo bảng màu/nét, chưa đưa vào game. Chưa thẩm định luật bản quyền Việt Nam cho ảnh chụp |
| Wikimedia Commons — Hồng Đức bản đồ (1490) | https://commons.wikimedia.org/wiki/Category:Dong_Ho_painting (tìm bằng API) | "Public domain" (tệp Thăng Long 1490, Sơn Tây); tệp Thuận Hóa là "CC BY-SA 4.0" (loại) | Thuộc thời Lê, không phải Lý; tham khảo cách vẽ bản đồ cổ |
| The Met Open Access | https://metmuseum.github.io/ | "The Metropolitan Museum of Art has waived all copyright and related or neighboring rights to this dataset using the Creative Commons Zero license." | Chưa tải tác phẩm nào; trang chính sách của Met trả HTTP 429 nên chỉ xác minh qua trang GitHub của Met; nếu dùng cần kiểm tra cờ "Open Access" từng tác phẩm |
| itch.io (thẻ hand-painted, free) | https://itch.io/game-assets/free/tag-hand-painted | Trang danh sách không ghi giấy phép; mỗi asset một giấy phép | KHÔNG xác minh được từng asset ⇒ loại theo quy tắc |

## 3. Quy tắc nếu sau này bổ sung tài nguyên
Mỗi bộ tải vào thư mục riêng `docs/design/ui/assets/<tên>/` kèm file giấy phép + URL nguồn; chỉ dùng tệp ảnh/font, không chạy mã; giấy phép không rõ, cấm thương mại hoặc cấm chỉnh sửa ⇒ loại. Bổ sung một dòng vào bảng mục 1.
