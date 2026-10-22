# Nghiên cứu game tham khảo: Demacia Rising

Ngày truy cập: 2026-10-21. Độ tin cậy tổng: **trung bình** (chỉ đọc tài liệu chính thức + wiki + hướng dẫn; **chưa** xem gameplay video, chưa tự chơi — game là metagame trong client LoL, có thể đã kết thúc).

## Nguồn
| ID | Nguồn | Loại | Tin cậy |
|---|---|---|---|
| S1 | https://support.riotgames.com/en-us/league-of-legends/events/league-of-legends-demacia-rising-metagame | Riot chính thức | Cao |
| S2 | https://wiki.leagueoflegends.com/en-us/Demacia_Rising | Wiki cộng đồng (chỉ đọc 100k/308k ký tự) | Trung bình |
| S3 | https://www.thespike.gg/league-of-legends/beginner-guides/demacia-rising-guide | Hướng dẫn truyền thông | Trung bình |
| S4 | backloggd.com/u/Meowpixel/reviews/ | 1 review người chơi | Thấp (ý kiến cá nhân) |
| S5 | demaciarising.org | Bị đánh giá là nội dung chung chung | Không dùng |

## Sự thật đã xác minh (S1 trừ khi ghi khác)
- F1. Metagame theo lượt trong client LoL, mở từ màn hình chính; mở rộng lãnh thổ trên bản đồ, xây vương quốc. Hai arc: *The Founding of Demacia* (Act I) và *Threats from Beyond* (Act II). Lịch ghi: Act I 08/01–03/03/2026, Act II 04/03–28/04/2026 (S2 ghi ngày phát hành lệch 1 ngày → dùng "xấp xỉ").
- F2. **Vòng lặp lượt**: mỗi lượt cần 10 Silver Shields (kiếm từ chơi LoL/TFT) để kết thúc. Cuối lượt: công trình sản xuất, xây/huấn luyện tiến triển, quân hành quân, sự kiện/mối đe dọa xuất hiện, trận đã lên lịch bắt đầu.
- F3. **Tài nguyên**: Food, Lumber, Stone, Metal, Petricite, Silver Shields, Valor (Valor từ lập/nâng cấp khu định cư, thắng trận, sự kiện; cần cho nghiên cứu).
- F4. **Thị trấn** có bonus theo loại địa hình/vị trí (vd. Heartland: nông trại đầu tiên cho thêm Food; S3 nêu Heartland/Coastal/Mountain). Công trình có thể phá để lấy chỗ.
- F5. **Nghiên cứu** 4 nhánh màu (Green hệ thống, Blue vương quốc, Red chiến đấu, Gold tướng), khóa theo cấp thành chính (Zeffira); có chuỗi tuần tự.
- F6. **Chiến đấu tự động (autoplay)**, có nút tăng tốc; kích hoạt khi thăm dò lãnh thổ bị chiếm hoặc bị tập kích; có cảnh báo trước để điều quân phòng thủ. Đơn vị có khắc chế; nghiên cứu tăng sức mạnh. (S1, S3)
- F7. **Tướng (champions)** mở bằng nghiên cứu, huấn luyện ở Barracks, gia nhập vĩnh viễn theo tiến trình/chương.
- F8. Có cốt truyện chương (Prologue, Chapter 1–7+), mục tiêu chính góc trên phải, phần thưởng (tài nguyên, XP pass...).
- F9. Đơn người chơi, cần internet (S2).

## Nhận định người chơi (S4 — 1 ý kiến, chưa kiểm chứng)
- Vòng lặp "xây thành → sản xuất → nghiên cứu → chiếm trại → mở thành mới" hấp dẫn ở phần dựng quân/chinh phục.
- Phần xây thành yếu: nhiều công trình vô dụng; một số đơn vị lỗi thời; một nâng cấp tướng bị coi là "bẫy".

## Chưa biết (KHÔNG suy đoán)
- Điều kiện thắng/thua, hậu quả thua trận, số lượng/kích thước bản đồ.
- Chi phí, tốc độ sản xuất, công thức giải quyết trận, chỉ số đơn vị.
- Chi tiết lựa chọn sự kiện; danh sách đầy đủ công trình/đơn vị.
- Silver Shields vs "Silver Shards" có cùng là một không (S1 dùng cả hai).
- Cảm giác UI/UX thực tế (cần video/chơi thử).

## Học được (cấp độ nguyên lý) vs không được sao chép
| Học (nguyên lý) | Không sao chép |
|---|---|
| Vòng lặp lượt: hành động tốn thời gian, kết thúc lượt mới phân giải | Tên riêng, nhân vật, địa danh Runeterra, lời thoại, hình ảnh, bản đồ |
| Mở rộng theo lãnh thổ kề nhau + bonus địa hình | Hệ nhánh nghiên cứu y nguyên (tên/màu/cấu trúc) |
| Chiến đấu tự động, chiều sâu ở dựng quân/thời điểm/khắc chế | Cổng tiến trình bằng chơi LoL (không áp dụng) |
| Cảnh báo tập kích → quyết định phòng thủ | Danh sách tướng, lịch mở theo chương |
| Tướng có vai trò + cốt truyện đan xen | |

## Bài học thiết kế cho Dai Viet Rising
- L1. Đừng để công trình "chỉ là tăng tài nguyên" → mỗi công trình phải thay đổi quyết định chiến lược (hậu cần, phòng tuyến, thủy lộ).
- L2. Tự động giải quyết trận chỉ ổn nếu **tiền chiến** (địa hình, hậu cần, bố trí) có chiều sâu và hiển thị rõ lý do thắng/thua.
- L3. Cần thay cơ chế "Silver Shields từ game khác" bằng nhịp lượt riêng (không cần tài khoản/online).
