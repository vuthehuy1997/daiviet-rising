# CR-005 — Thủy triều & nhử (CMP-02, SYS-11)

Ngày: 2026-10-29 · Baseline gốc: DB-0.1 + CR-001..004 (RC4, đang chạy trên Pages) · Yêu cầu của người dùng: "update game: thêm CMP-02 tides and lure"
Loại: **thêm cơ chế + nội dung mới (ảnh hưởng thiết kế)** → cần duyệt trước khi code. Trạng thái: **CHỜ DUYỆT — chưa viết code**.

## Hiện trạng (đã kiểm tra trong repo)
- GDD SYS-11 chỉ có 1 dòng: ô `song` có thủy triều chu kỳ 2–3 lượt (placeholder), `BLD-STAKES` hiệu quả theo nước rút/lên, "nhử" = lệnh kéo địch vào ô cọc. Chưa có công thức, chưa có test.
- `BLD-STAKES` (cọc ngầm) đã có: chỉ xây trên ô `song`, `attacker_penalty: 0.12`, luôn hiệu lực (không phụ thuộc triều). `BLD-DOCK` đang `enabled: false` (post-MVP).
- CMP-02 "Sông Nước Bạch Đằng" (Trần–Nguyên 1285–1288) mới là 1 dòng trong `03_CONTENT_NARRATIVE.md`; chưa có dữ liệu chiến dịch. Backlog FEAT-012 ghi `partial`: "thủy triều/nhử CHƯA làm".
- Sim hiện tất định theo seed (EDGE-07). Triều và nhử phải giữ tính chất này.

## Phạm vi — cần bạn chọn
- **Phương án A (đề xuất): cơ chế + lát cắt CMP-02 nhỏ.** Làm triều + nhử trong sim, cùng một chiến dịch CMP-02 rút gọn (~8–10 ô sông/cửa biển, 3–4 đợt, ~20 lượt) để có chỗ chơi và test. CMP-01 **không đổi** (không có triều, cân bằng RC4 giữ nguyên).
- Phương án B: chỉ cơ chế, áp lên các ô `song` của CMP-01 (TIL-007, TIL-010). Nhỏ nhất nhưng đổi cân bằng CMP-01 đã phát hành, phải chạy lại TST-08.
- Phương án C: CMP-02 đầy đủ (~28 ô, cốt truyện, sự kiện, kế sách riêng). Lớn; nên tách thành nhiều CR/mốc và cần rà soát sử học trước khi phát hành.

## Cơ chế đề xuất (số liệu là placeholder, chốt khi cân bằng)
**1. Thủy triều (tất định, không ngẫu nhiên).** Mỗi chiến dịch khai báo `tide: {period: 3, phase_offset: 0}`. `tide(turn) = (turn + offset) mod period` → `rising / high / ebb` (period 3: lên, đầy, rút). Hiển thị trên HUD (biểu tượng + nhãn chữ, không chỉ màu — AA) và xem trước 3 lượt tới, như cảnh báo tập kích.
- Ô `song` / `ven_bien` chịu triều; các ô khác không.
- **Chi phí di chuyển & tốc độ địch:** khi `ebb`, chi phí địa hình `song` của quân thuyền địch ×1.5 (mắc cạn); khi `high` ×1.0; quân bộ không ảnh hưởng.
- **Cọc ngầm:** `BLD-STAKES` chỉ có `attacker_penalty` đầy đủ khi `ebb` (cọc lộ ra, thuyền mắc); khi `high` bị che, penalty giảm còn ~25%. Cọc hiện tại (luôn 0.12) được thay bằng bảng theo pha — thay đổi này chỉ áp dụng cho chiến dịch có `tide`.
- **ETA:** `eta` của đợt tập kích bằng đường sông tính theo chi phí tại lượt xuất phát và được tính lại mỗi lượt (đã có cơ chế cảnh báo ETA; thêm hệ số triều). Đợt đã vào đường không đổi hướng.

**2. Nhử (lệnh mới `lure`).** Người chơi chọn một ô `song` có `BLD-STAKES` làm *mồi*, tốn Lương/Gỗ + 1 đơn vị quân cơ động (đóng vai nhử, không tham chiến).
- Hiệu lực: đợt tập kích kế tiếp có đường đi qua ô mồi **đổi mục tiêu** sang ô mồi nếu ô đó nằm trong phạm vi `lure_range` (2 bước) của đường đi và chi phí vòng không vượt `lure_max_detour` (+2 ETA).
- Thành công/thất bại **tất định**: dựa trên mức tình báo của địch (SYS-08) — tình báo `chính_xác` luôn thành công; `ước_lượng` thành công nếu đợt có chỉ huy thường; `mơ_hồ` thất bại. Không dùng RNG ẩn; kết quả hiện trước khi bấm ("dự báo").
- Hạn chế: 1 mồi hoạt động cùng lúc; hiệu lực hết sau đợt đó; thua mồi thì mất đơn vị nhử.
- Kết hợp: nhử đúng lúc đợt tới vào pha `ebb` là combo mạnh nhất — đó là "kỹ năng" của chiến dịch.

**3. Thắng/Thua CMP-02 (đề xuất):** thắng = chặn đợt cuối đến hạn lượt (không có giảng hòa như CMP-01); thua = mất Thủ phủ hoặc Dân tâm < 0 kéo dài 3 lượt. Giữ SYS-12 cho CMP-01 nguyên trạng.

## Tác động
- **Thiết kế:** mở rộng GDD SYS-11 (công thức triều, nhử, EDGE mới: nhử cùng lúc nhiều đợt, triều trong lúc đợt đang đi, cọc bị phá khi đang nhử), cập nhật 03_CONTENT_NARRATIVE (CMP-02), backlog FEAT-012 + FEAT mới, thêm test TST-09 (triều/nhử).
- **Dữ liệu:** `game-data/campaign_cmp02.yaml` (ô, đợt tập kích, `tide`, `lure`), cập nhật `buildings.yaml` (bảng penalty cọc theo pha, bật `BLD-DOCK` nếu cần), `units.yaml` nếu thêm quân thuyền địch (`ENM-BOAT`).
- **Sim:** `types.ts`/`data.ts` (validator cho `tide`, `lure`), `derived.ts` (pha triều, hệ số chi phí), `turn.ts` (ETA theo triều, đổi mục tiêu), `commands.ts` (lệnh `lure`), `combat.ts` (penalty cọc theo pha). **Đổi định dạng save → nâng `save_version` lên 3**, migrate v2 (CMP-01 không có triều). Chọn chiến dịch cần màn chọn chiến dịch tối thiểu.
- **UI:** chỉ báo triều trên HUD (chữ + biểu tượng), xem trước 3 lượt, panel ô sông hiển thị hiệu lực cọc theo pha, nút/chế độ "Nhử" có dự báo, tường thuật báo cáo trận nêu rõ vai trò triều/nhử, bản đồ CMP-02 mới (nền vẽ/bake riêng; phụ thuộc pipeline nền hiện có). Mobile + AA giữ như CR-003.
- **Cân bằng:** bot mới `tide-aware` và `lurer`; mục tiêu CMP-02: `turtle`/`idle` 0%, bot cơ bản 30–60%, bot biết dùng triều+nhử cao hơn nhưng không áp đảo (≤ 90%), không có lựa chọn thống trị. CMP-01 phải giữ nguyên kết quả TST-08 (kiểm tra hồi quy).
- **Kiểm thử:** unit (pha triều, ETA, penalty cọc, nhử thành/bại, từ chối khi thiếu kho/quân), save/migrate, tính tất định EDGE-07, E2E desktop + Pixel 7 (có axe), `check_design.py` cập nhật.
- **Phát hành:** sau khi xong = RC5, chỉ build cục bộ. Push/deploy cần một **G3 mới**; G3 hiện tại chỉ phủ RC4.
- **Nội dung/lịch sử:** CMP-02 dựa trên khung Trần–Nguyên/Bạch Đằng (kế "cọc ngầm theo triều" là chi tiết nổi tiếng nhưng *độ tin cậy nguồn trong repo là TB-thấp*). Mọi chi tiết ngoài khung gắn `FICTION`; cần rà soát sử học trước khi phát hành rộng. Giữ CNT-P1/P3 (không miệt thị, số liệu chỉ là cơ chế).

## Ước lượng mốc (nếu chọn A)
- M1: sim triều + penalty cọc + test + CMP-02 dữ liệu tối thiểu.
- M2: lệnh nhử + dự báo + test + bot.
- M3: UI (HUD triều, panel, nhử), bản đồ CMP-02, E2E/axe.
- M4: cân bằng + hồi quy CMP-01 + bằng chứng RC5.
Tôi sẽ dừng sau mỗi mốc để bạn xem trước khi sang mốc kế (giống CR-003).

## Rủi ro / câu hỏi mở
1. Phạm vi A/B/C (câu hỏi chính).
2. Số liệu triều (chu kỳ 3, hệ số ×1.5, penalty 25%) là placeholder, chưa có nguồn lịch sử; chỉ là cơ chế game.
3. Màn chọn chiến dịch và bản đồ CMP-02 cần thêm tài sản nền; nghệ thuật vẫn là SVG thủ tục (trần chất lượng hiện tại).
4. "Nhử" tất định có thể kém bất ngờ so với ngẫu nhiên; chọn tất định để giữ tái lập theo seed.
5. Văn bản/nhân vật CMP-02 chưa qua rà soát sử học.

## Cần bạn duyệt
- `approve CR-005` — làm **Phương án A** nguyên trạng (RC5 chỉ build cục bộ, chưa push).
- `approve CR-005: phương án B` hoặc `phương án C` hoặc kèm chỉnh sửa (ví dụ đổi chu kỳ triều, bỏ thắng-bằng-chặn…).
- Hoặc nêu điểm cần đổi; tôi sửa CR rồi hỏi lại.
