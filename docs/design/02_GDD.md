# 02 — GDD (hệ thống, công thức, trường hợp biên)

Phiên bản 0.1 (candidate). **Mọi con số là `PLACEHOLDER-BALANCE`** — chỉ để làm khung, sẽ cân bằng bằng simulation ở Phase 4 (không dùng số liệu lịch sử). ID: `SYS-xx`.

## SYS-01 Bản đồ & ô
- Bản đồ = đồ thị các **ô** (châu/lộ trừu tượng). Mỗi ô: `terrain ∈ {dong_bang, song, nui, ven_bien, rung}`, danh sách kề kèm `move_cost`, số `slot` công trình, `state ∈ {hostile, open, settled, contested, lost}`, `owner`.
- `hostile`: bị địch chiếm → cần trận để chiếm (`SYS-06`). `open`: đất trống, lập khu định cư tốn tài nguyên. `settled`: có khu định cư (cấp 1–5).
- MVP Chiến dịch 1: ~28 ô (placeholder).

## SYS-02 Lượt & thứ tự phân giải
Người chơi ra lệnh → **Kết thúc lượt** (miễn phí). Thứ tự (theo reference S3, áp dụng nguyên lý):
1. Sản xuất → 2. Công trình (hoàn tất nếu `remaining==0`) → 3. Di chuyển quân → 4. Huấn luyện → 5. Sự kiện & tình báo → 6. Trận đã lên lịch.
Mỗi lệnh có `duration` (số lượt). Di chuyển ngắn vẫn ≥1 lượt. Xác định (deterministic) theo `seed` của chiến dịch.

## SYS-03 Tài nguyên
| Tài nguyên | Nguồn | Dùng |
|---|---|---|
| Lương (grain) | Ruộng/đồn điền | **Trần quân cơ động** (supply cap) + nuôi quân đồn trú |
| Gỗ-tre | Trại gỗ | Xây, đồn tre, cọc, thuyền |
| Đá | Mỏ đá | Thành, kè, đê |
| Sắt | Lò rèn | Vũ khí, nâng cấp |
| Dân tâm | Lập khu định cư, thắng trận, sự kiện | Nghiên cứu **Kế sách** (tương đương vai trò Valor ở mức nguyên lý) |

Công thức:
- `output(b,t) = base[b.level] × terrain_mult(b.type, t.terrain) × (1 + 0.1·adjacent_synergy)`
- `supply_cap = 4 + Σ granary_level` (placeholder). Quân cơ động vượt cap → mỗi lượt `-5% morale` mỗi đơn vị vượt.
- Quân đồn trú & công trình phòng thủ **không tính** vào `supply_cap` nhưng tốn lương duy trì nhỏ.

## SYS-04 Công trình (mỗi cái phải thỏa PIL-01)
| ID | Công trình | Tác động quyết định |
|---|---|---|
| BLD-FARM | Ruộng/đồn điền | Lương + nâng supply_cap |
| BLD-LUMBER | Trại gỗ-tre | Gỗ-tre |
| BLD-QUARRY | Mỏ đá | Đá |
| BLD-FORGE | Lò rèn | Sắt, mở quân cấp cao |
| BLD-BARRACKS | Trại quân | Huấn luyện quân/tướng |
| BLD-GRANARY | Kho lương | +supply_cap, giảm phạt hậu cần khi hành quân xa |
| BLD-DIKE | Đê/kè | Giảm sát thương lũ; trong ô `song` tạo **tuyến chặn** |
| BLD-PALISADE | Đồn tre/lũy | Phòng thủ gắn ô (không tính trần quân); cấp 1–3 |
| BLD-STAKES | Cọc ngầm (chỉ ô `song`) | Đánh quân thủy/vượt sông (lớp C) |
| BLD-WATCH | Chòi canh | Tăng độ chính xác tình báo & thời gian cảnh báo |
| BLD-DOCK | Bến thuyền | Mở quân thủy; tốc độ đường sông |
Công trình có thể **phá/sắp xếp lại** (hoàn lại 50%, placeholder).

## SYS-05 Quân
Lớp: `bo_binh` (cận chiến), `cung_no` (tầm xa), `ky_tuong`/`tuong` (anh hùng có nguồn), `thuy_binh`, `dan_binh` (đồn trú). Khắc chế (ma trận placeholder): cận chiến > tầm xa; tầm xa > thủy khi bị cọc; AoE phạt dồn quân. Mỗi đơn vị: `hp, atk, def, range, speed, cost, train_turns, supply`.
- **Tướng** (`CHR-*`): chỉ nhân vật có nguồn; vai trò kỹ năng trừu tượng, không sao chép tướng của reference.

## SYS-06 Trận tự động
Mô phỏng `N=12` vòng. Mỗi vòng, mỗi đơn vị chọn mục tiêu theo ưu tiên lớp; sát thương:
`dmg = atk × counter(attacker,target) × terrain_atk_mod × morale_mod × (1 − def_reduction) × rand(0.9..1.1 theo seed)`
`def_reduction = min(0.6, def/(def+K))` + `fort_bonus` nếu bên phòng thủ ở ô có `BLD-PALISADE`.
Kết thúc khi một bên hết quân hoặc hết vòng (so điểm còn lại). **Báo cáo nguyên nhân** (PIL-03): top 3 yếu tố (khắc chế, địa hình, hậu cần/morale, công trình) + đơn vị gây/ chịu nhiều sát thương nhất.
- Xem trước thành phần địch: mức chính xác phụ thuộc `BLD-WATCH` và tình báo (`SYS-08`).

## SYS-07 Tập kích & phòng thủ (trọng tâm)
- **Cảnh báo:** đợt tập kích sinh ra với `target_tile`, `eta = ceil(path_cost / enemy_speed)`; cảnh báo hiện khi `eta ≤ warn_lead` (`warn_lead = 2 + watch_bonus`).
- **Ba đòn bẩy:** (1) điều quân cơ động tới kịp trước `eta`; (2) đồn trú + công trình gắn ô; (3) Kế sách phòng thủ (ví dụ "Lũy biên").
- **Đường tới:** quân đi theo đường rẻ nhất; chặn đường/đoạn sông bằng tuyến chặn có thể làm địch chậm.
- Trận xảy ra khi `eta` về 0.

## SYS-08 Tình báo
Mức: `chính_xác`, `ước_lượng (±25%)`, `mơ_hồ (lớp quân, không số)`. Chòi canh/trinh sát nâng mức. Thông tin sai có thể là sự kiện `FICTION`.

## SYS-09 Kế sách (nghiên cứu)
Cây 4 nhánh *riêng của dự án* (chưa đặt tên cuối, không dùng nhánh màu/cấu trúc reference): Nông-hậu cần, Thành-phòng, Quân-chiến thuật, Ngoại giao. Tốn Dân tâm; khóa theo cấp **Kinh đô/Thủ phủ**.

## SYS-10 Sự kiện & ngoại giao
Sự kiện có lựa chọn, nhãn nguồn. Ngoại giao (Chiến dịch 1): đàm phán kết thúc khi điều kiện đạt (xem §9).

## SYS-11 Lớp thủy chiến (từ C)
Ô `song`: thủy triều chu kỳ 2–3 lượt (placeholder); `BLD-STAKES` hiệu quả khi nước rút/lên theo kịch bản; nhử mục tiêu = lệnh kéo địch vào ô cọc. Dùng chủ yếu ở CP2, MVP có phiên bản giản lược (tuyến sông CP1).

## SYS-12 Thắng / Thua (thiết kế của chúng ta — reference chưa rõ)
- **Thua:** mất Thủ phủ (`CAPITAL`), hoặc tổng `Dân tâm < 0` kéo dài 3 lượt.
- **Thắng CP1:** chặn đợt tập kích cuối **và** đạt điều kiện giảng hòa/ngoại giao đến hạn lịch.
- **Hậu quả thua một ô khác:** ô thành `lost` (công trình giảm cấp, quân đồn trú mất); có thể chiếm lại bằng trận (`SYS-06`).

## Trường hợp biên (EDGE)
- EDGE-01: Hai đợt tập kích cùng ETA cùng ô → gộp thành 1 trận hai làn (placeholder: xử lý tuần tự theo ID).
- EDGE-02: Quân đang di chuyển bị tập kích đường → dừng tại ô gần nhất, trận tại đó.
- EDGE-03: Phá công trình khi đang có trận lên lịch ở ô đó → cho phép, mất bonus ngay.
- EDGE-04: Supply cap giảm (phá kho) khi đã vượt → áp dụng phạt từ lượt sau.
- EDGE-05: Không đủ tài nguyên khi hàng đợi tới lượt → lệnh tạm dừng, không mất tài nguyên đã trả.
- EDGE-06: Lưu/nạp giữa lượt: chỉ lưu tại trạng thái "đang ra lệnh" (đầu pha người chơi).
- EDGE-07: Cùng seed + cùng lệnh → kết quả giống hệt (test bắt buộc).

## Phụ lục Phase 4 (CR-001) — thay đổi sau G2, xem `docs/change_requests/CR-001_balance_fixes_from_TST08.md`
- SYS-05: **trần đồn trú theo ô** = 4 (+4 thủ phủ) + 3 × tổng cấp công trình có `fort_bonus`.
- SYS-12 (thắng): `negotiate` hợp lệ khi lượt ≥ 21, không còn đợt tập kích, đã chặn ≥ 4 đợt, Dân tâm ≥ 10, và đang giữ ≥ 3 khu định cư. Thua: thủ phủ thất thủ / Dân tâm < 0 liên tục 3 lượt / quá lượt 28.
- SYS-03: công sự tối đa 40% giảm sát thương; không có chi phí duy trì lương.
- Dân tâm: +3 lập khu định cư, +2 chiếm ô địch, +3 chặn tập kích, −5 mất ô.
