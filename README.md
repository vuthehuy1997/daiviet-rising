# GAME STUDIO — PER PROJECT

Mỗi game = **một repository riêng** + **một phiên Claude Code riêng**. Không cần repository `game-studio` trung tâm.

## Cài đặt
1. Giải nén ZIP này **vào thư mục gốc của repository game**. Nếu đã có `CLAUDE.md`, hãy gộp hướng dẫn thay vì ghi đè.
2. Mở Claude Code ngay tại thư mục gốc của game.
3. Chỉnh file `game.yaml` (game tham khảo, link/video, hướng sáng tạo, nền tảng, online/offline, ngân sách).
4. Chat **`start game`**.

## Pipeline
Intake → research → 3 concept → **G1 duyệt** → GDD/content/architecture → dashboard review → **G2 duyệt** → implement/build/test/fix/regression → release candidate → **G3 duyệt** → deploy → change requests.

## Lệnh chat
- `start game`: bắt đầu nghiên cứu và đề xuất concept
- `status game`: xem trạng thái
- `continue game` hoặc `resume game`: tiếp tục từ checkpoint
- `approve G1: ...`: chốt concept
- `approve G2: ...`: chốt thiết kế
- `approve G3: ...`: cho phép phát hành đích cụ thể
- `update game: ...`: yêu cầu nâng cấp

Các lệnh này là **câu chat Claude Code**, không phải CLI commands. Chúng được nhận diện qua `CLAUDE.md`. Không cần nhập slug vì đang ở đúng repo game.

## Files
- `CLAUDE.md`: entrypoint cho Claude Code
- `.game-studio/WORKFLOW.md`: workflow chung, copy giống nhau sang các game
- `.game-studio/prompts/`: orchestrator và các prompt
- `.game-studio/DASHBOARD_SPEC.md`: đặc tả dashboard
- `game.yaml`: thông tin riêng của game
- `docs/`: thiết kế, research, QA
- `state/`: checkpoint, decisions, approvals

## Giới hạn
Bộ ZIP là **hướng dẫn và cấu hình**, không phải dashboard/game đã được implement. GitHub Pages chỉ phục vụ nội dung tĩnh; việc lưu comment/approval có thể dùng GitHub PR/Issues hoặc cần backend có xác thực. Autopilot chạy trong phiên Claude Code và theo quyền công cụ, không đảm bảo chạy ngầm khi phiên kết thúc.
