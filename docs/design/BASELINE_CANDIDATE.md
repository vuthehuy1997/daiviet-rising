# Design Baseline Candidate — DB-0.1 (chờ G2)

Ngày: 2026-10-21 · Chưa được duyệt. Tài liệu: `docs/design/01..05`, `game-data/`, `docs/production/{ROADMAP.md,BACKLOG.yaml}`, dashboard `dashboard/index.html`.
Bằng chứng kiểm tra: `docs/qa/EVIDENCE_design_check.txt`.

## Quyết định cần bạn xác nhận tại G2
1. **Cách gộp**: MVP = CMP-01 (Lý–Tống) với A làm spine + C giản lược; CMP-02 và CMP-03 là bản sau MVP qua change request. (Bạn đã duyệt cả 3 concept; đây là thứ tự đề xuất.)
2. **Không có phí kết thúc lượt**; áp lực bằng lịch chiến dịch (khác reference).
3. **Thắng/Thua** (SYS-12) do dự án tự định nghĩa vì reference chưa rõ.
4. **Stack**: TypeScript + Vite + SVG/DOM (phương án thay: Phaser/Godot web).
5. **Tên "Mandi"**: vẫn chưa xác minh; chưa đưa vào thiết kế. Kẻ địch trong CMP-01 là lực lượng nhà Tống (trừu tượng hóa).
6. Chấp nhận **tất cả số liệu là placeholder** đến khi simulation cân bằng (Phase 4).

## Vấn đề chưa giải quyết
- Chưa xem video reference; tần suất/độ mạnh tập kích và hậu quả thua của reference không có nguồn (thiết kế riêng thay thế).
- Số liệu và chi tiết lịch sử chưa đối chiếu sử liệu gốc / chuyên gia → cần rà soát trước G3.
- Dashboard mới kiểm tra cú pháp JS, chưa chạy trong trình duyệt.
- Chưa có repo git, chưa có `project.code_repo`: cần bạn chỉ định (hoặc cho phép `git init` cục bộ) trước Phase 4.
- Ước lượng thời gian chưa đưa ra.

## Diff so với G1
Từ 3 concept độc lập → 1 thiết kế phân lớp (A spine, C lớp chuẩn bị/thủy chiến, B hậu MVP). Không thêm tính năng ngoài các concept đã duyệt.
