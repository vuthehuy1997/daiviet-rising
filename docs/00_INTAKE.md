# 00 — INTAKE & VALIDATION (Phase 0)

Ngày: 2026-10-21 · Nguồn: `game.yaml` (đọc nguyên văn), `.game-studio/WORKFLOW.md`, `.game-studio/prompts/ORCHESTRATOR.md`, `state/`.

## 1. Tóm tắt brief
- Game: **Dai Viet Rising** — chiến lược/xây dựng quốc gia bối cảnh Đại Việt, lấy cảm hứng *nguyên lý gameplay* từ Demacia Rising.
- Nền tảng: web (GitHub Pages), offline single-player, chuột + cảm ứng, tiếng Việt. Tương lai: Android/iOS/desktop (chưa làm).
- Ràng buộc: ngân sách tối thiểu, không dịch vụ trả phí, 1 dev + Claude Code, không backend trong MVP. Engine chọn sau G2.
- Narrative: `central`. Phải phân biệt sự kiện có nguồn / hư cấu / lịch sử giả định.

## 2. Kiểm tra
| Mục | Kết quả |
|---|---|
| Slug | `daiviet-rising` (khớp thư mục) |
| Link tham chiếu | `references[0].url` **để trống** → xem Câu hỏi Q1 |
| Xác minh game tham khảo | Đã làm: xem `docs/research/REFERENCE_DEMACIA_RISING.md` (độ tin cậy trung bình) |
| Multiplayer/online | Không (offline) |
| Monetization | Không áp dụng |
| Code repo riêng | Chưa có; `project.code_repo` không khai báo. Thư mục này chưa phải git repo. |

## 3. Giả định (cần bạn xác nhận hoặc sửa)
- A1. "Demacia Rising" = metagame chiến lược theo lượt trong client League of Legends (Riot Games, mùa 2026 Season 1 "For Demacia"). Không phải game nào khác trùng tên.
- A2. "Học hỏi gameplay" = tham khảo cấu trúc vòng lặp (lượt, mở rộng lãnh thổ, nghiên cứu, tự động giải quyết trận), **không** sao chép nội dung/IP.
- A3. Các cơ chế chưa được nguồn xác nhận (chi phí, công thức, điều kiện thắng/thua) sẽ **không** bị suy đoán; thiết kế riêng cho Đại Việt.
- A4. Ngôn ngữ tài liệu: tiếng Việt.

## 4. Câu hỏi (không chặn G1, nhưng nên trả lời khi duyệt)
- Q1. Đúng là Demacia Rising của LoL (A1)? Nếu có link/video bạn muốn dùng làm chuẩn, hãy gửi.
- Q2. Thời kỳ ưu tiên cho MVP: Lý–Tống (1075–77), Trần–Nguyên (1258–1288), hay Nam tiến (thế kỷ XV)? (Mỗi concept dưới đây gợi ý một lựa chọn.)
- Q3. Mức độ chấp nhận chủ đề nhạy cảm (chiến tranh với Champa 1471 có bạo lực với dân thường theo sử liệu).

## 5. Trạng thái
Phase 0 hoàn tất. Chuyển Phase 1 → `docs/research/`, `docs/concepts/`.
