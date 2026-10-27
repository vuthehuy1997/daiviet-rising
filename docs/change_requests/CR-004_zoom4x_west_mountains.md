# CR-004 — Zoom 4x và sửa núi phía tây

Ngày: 2026-10-27 · Baseline: RC3 (live) · Yêu cầu: "zoom 4x và sửa núi phía tây"
Loại: thay đổi nghệ thuật/UX (UI-1 bản đồ, camera). **Không đổi luật, sim, save, dữ liệu cân bằng.** Trạng thái: **ĐÃ DUYỆT 2026-10-27 — đang làm**.

## Hiện trạng (thật)
- Zoom tối đa 1,5x vì nền nướng 3200x1800 (308 kB) chỉ nét đến ~1,5x; vượt đó bị mờ (`Z_MAX` trong `src/ui/main.ts`).
- Dãy núi phía tây vẫn dạng khối/"giấy gấp" dù V3 đã làm mềm (nhận xét của chính tôi ở V3).

## Phạm vi
| ID | Nội dung |
|---|---|
| Z-1 | Nướng lại nền ở **6400x3600**, cắt thành **ô 4x2 (8 mảnh 1600x1800)** webp. Mảnh nhìn thấy mới được tải; bản 3200 hiện có vẫn là lớp nền tải ngay (không mờ trắng khi tải mảnh). |
| Z-2 | Nâng `Z_MAX` 1,5 → 4. Zoom chuột/hai ngón/nút giữ nguyên cơ chế; khi zoom >1,5 hiện mảnh độ phân giải cao. Công trình, ruy-băng vẫn là SVG nên nét ở mọi mức zoom. |
| Z-3 | Điều chỉnh bố cục điện thoại (mở lại ở zoom mặc định, pan giới hạn theo zoom). Chống rung/nhảy khi tải mảnh. |
| M-1 | Vẽ lại núi tây trong `docs/design/ui/v4/tools/paint_map.py`: đường sống núi theo nhiều lớp xa-gần (sương xa nhạt, lớp gần đậm), sườn thoải bằng nhiễu mềm thay vì mặt phẳng cạnh góc, rừng phủ sườn, đường đèo không đổi để khớp `roads.json`. |
| M-2 | Chụp so sánh trước/sau ở zoom 1x, 2x, 4x (desktop + điện thoại) lưu ở `docs/qa/visual/cr004_*`. |

## Ngân sách & rủi ro (nói thẳng)
- Tổng tải lần đầu: nền 3200 (~310 kB) giữ nguyên + mảnh 4x chỉ tải khi zoom. Ước tính cả 8 mảnh ~1,0–1,4 MB [SUY ĐOÁN, sẽ đo]. Cần bạn chấp nhận vượt mốc 600 kB **chỉ khi zoom sâu**; tải đầu vẫn ≲ 600 kB.
- RAM trên điện thoại yếu: giải mã mảnh lớn tốn bộ nhớ; sẽ giới hạn số mảnh giữ cùng lúc và đo bằng giả lập (chưa có máy thật).
- Chất lượng ở 4x phụ thuộc thuật toán nướng; không ngang tranh họa sĩ. Núi vẫn là thủ tục (procedural), chỉ mềm và tự nhiên hơn; muốn hơn nữa cần tranh thật từ bạn.
- Đổi nền cần cập nhật `roads.json` nếu hình học đường đổi (dự kiến không đổi).

## Kiểm thử
Giữ Vitest/Playwright/axe 0 nghiêm trọng, thêm: zoom đến 4x không vỡ camera (desktop+Pixel 7), mảnh tải đúng vùng nhìn thấy, ảnh chụp trước/sau, đo tải và thời gian khung hình với CPU 4x chậm.
Phát hành: build cục bộ (RC4). Push/deploy cần G3 mới.

## Câu hỏi mở
1. Chấp nhận mốc ~1+ MB cho mảnh zoom sâu (tải theo nhu cầu)? Mặc định: có.
2. Zoom tối đa 4x áp dụng cho cả điện thoại? Mặc định: có (cùng giới hạn).

## Kết quả triển khai (2026-10-27)
Hoàn tất Z-1..Z-3, M-1, M-2 ở mức build cục bộ (RC4). Bằng chứng: docs/qa/EVIDENCE_cr004.txt. Tải đầu ~551 kB; mảnh 4x tổng 808 kB, tải khi zoom. Hạn chế: desktop p95 khung 50 ms ở zoom 4x với CPU 4x chậm; núi vẫn procedural.
