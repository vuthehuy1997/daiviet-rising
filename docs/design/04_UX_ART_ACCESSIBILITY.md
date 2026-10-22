# 04 — UX, Art/Audio, Accessibility, Save/Load (UXD-xx)

## Màn hình & luồng (UXD-FLOW)
Menu → Chọn chiến dịch (có màn Bối cảnh & Nguồn) → **Bản đồ** (màn chính) → [Chi tiết ô / Xây / Huấn luyện / Điều quân / Kế sách] → Kết thúc lượt → **Bản tin cuối lượt** (sản xuất, sự kiện, cảnh báo) → Trận (tự động, tua nhanh, báo cáo nguyên nhân) → Kết chiến dịch.
- UXD-01 Bản đồ ô SVG, chạm/chuột, zoom/pan.
- UXD-02 Dải cảnh báo luôn hiển thị: ô bị nhắm, ETA, mức tình báo.
- UXD-03 Điều quân: chọn quân → chọn ô → hiển thị **thời gian tới** so với ETA đợt tập kích (PIL-02).
- UXD-04 Xem trước trận: thành phần + độ tin cậy tình báo; không hứa kết quả.
- UXD-05 Báo cáo trận: 3 yếu tố chính + nhật ký vòng (tua nhanh/bỏ qua).
- UXD-06 Hoàn tác trong lượt (trước Kết thúc lượt).

## Art / Audio (định hướng)
Phong cách 2D tối giản lấy cảm hứng tranh dân gian/bản đồ cổ (nguồn mở hoặc tự vẽ SVG); **không dùng tài sản có bản quyền hoặc của reference**. Nhạc/SFX: giấy phép miễn phí/CC0, ghi nguồn trong `docs/production/ASSET_LICENSES.md` (sẽ tạo ở Phase 4). Lời thoại: chữ, MVP không lồng tiếng.

## Accessibility (UXD-A11Y)
- Điều khiển chuột + chạm, đủ vùng chạm ≥44px; hỗ trợ bàn phím cơ bản cho menu/hành động.
- Không chỉ dựa vào màu (icon/texture); tương phản WCAG AA; cỡ chữ chỉnh được; giảm chuyển động.
- Nội dung tiếng Việt (UTF-8), font hỗ trợ dấu.

## Save/Load (UXD-SAVE)
- Lưu tự động đầu mỗi lượt vào `localStorage`; xuất/nhập file JSON. Schema có `save_version`; migration có test. Cùng seed + lệnh → tái hiện (EDGE-07).
- Không dữ liệu cá nhân, không mạng.
