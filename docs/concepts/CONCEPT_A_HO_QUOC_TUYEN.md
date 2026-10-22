# CONCEPT A — Hộ Quốc Tuyến (Phòng tuyến giữ nước)

**Thể loại:** chiến lược theo lượt + xây dựng quốc gia + phòng thủ. Gần nhất với vòng lặp Demacia Rising (F2, F4, F6).
**Thời kỳ MVP:** Lý–Tống 1075–1077 (chiến dịch 1), mở rộng Trần–Nguyên (chiến dịch 2). Nhãn: `[SOURCED]` cho khung sự kiện, `[FICTION]` cho nhân vật phụ/sự kiện địa phương.

## Fantasy
Là triều đình điều hành vùng châu Bắc Đại Việt: dựng kinh tế, quân, thành lũy; đọc tin tình báo; quyết định **đánh trước hay giữ tuyến** trước đại quân phương Bắc.

## Core loop (mỗi lượt ≈ 1 tuần/tháng trong game)
1. Xem bản đồ + cảnh báo tình báo → 2. Giao việc: xây/nâng (đồn, kho, đê, bến), tuyển/luyện quân, nghiên cứu "kế sách" → 3. Điều quân, đặt phòng tuyến → 4. **Kết thúc lượt** → sản xuất, hậu cần, sự kiện, giao tranh tự động có báo cáo nguyên nhân thắng/thua.
**Meta loop:** hoàn thành giai đoạn chiến dịch → mở kế sách, tướng (nhân vật có nguồn), chiến dịch mới.

## Hệ thống chính
- Bản đồ ô/châu kề nhau, địa hình (đồng bằng, sông, núi, ven biển) cho bonus/phạt.
- Tài nguyên: lương, gỗ/tre, đá, sắt, **lòng dân/uy tín**; hậu cần là ràng buộc cứng (quân hết lương thì suy giảm).
- Phòng tuyến sông: cọc ngầm, đồn tre (khung từ H2) — đặt trước, quyết định kết quả giao tranh.
- Chiến đấu auto-resolve theo khắc chế + địa hình + hậu cần + tinh thần; báo cáo minh bạch (L2).
- Ngoại giao: giảng hòa/chiến tranh tâm lý như đòn kết thúc.
- Tướng: vài nhân vật lịch sử có nguồn, vai trò rõ.

## Phạm vi MVP (ước lượng, chưa cam kết)
1 chiến dịch (≈8–10 chương lượt), ~12–15 loại công trình, ~6 loại quân, 1 bản đồ ≈ 25–35 ô, 6–10 sự kiện. Lưu cục bộ (localStorage/file xuất).

## Điểm mạnh / Rủi ro
+ Dễ dựng trên web, 2D/UI-heavy, hợp 1 dev; gần reference, đã có bài học (L1–L3).
− Dễ thành bản sao cơ chế nếu thiếu bản sắc → giảm bằng phòng tuyến sông/hậu cần/đê điều.
− Cân bằng auto-battle cần nhiều test; sử liệu số liệu chưa chắc → dùng tỉ lệ trừu tượng, không số lịch sử.
− Rủi ro "xây thành vô nghĩa" (L1).

**Hợp nền tảng web/chạm:** Cao (UI dạng bảng + bản đồ ô, không cần realtime).
