/* Các màn hình mockup (CR-003). Nội dung chữ lấy từ game thật (RC2): ô, công trình, sự kiện EVT-01, cảnh báo RAID-2. */
const ic = (id, c = '') => `<svg class="ic ${c}" viewBox="0 0 32 32"><use href="#${id}"/></svg>`;
const sprite = `<svg width="0" height="0" style="position:absolute"><defs>${SYMBOLS}</defs></svg>`;

function resPill(compact = false) {
  const r = [['i-grain', '120'], ['i-wood', '96'], ['i-stone', '41'], ['i-iron', '22'], ['i-lotus', '13']];
  return `<div class="res parch-pill">${r.map(([i, n]) => `<span class="rv">${ic(i)}<b>${n}</b></span>`).join('')}<span class="sep"></span><span class="rv" title="Quân dùng/trần">${ic('i-helm')}<b>3<small>/6</small></b></span></div>`;
}
function objective(collapsed = false) {
  const rows = [['Chặn đợt tập kích', '1/4', false], ['Giữ ≥3 khu định cư', '2/3', false], ['Dân tâm ≥10', '13/10', true], ['Giảng hòa (từ lượt 21)', 'lượt 6/28', false]];
  return `<div class="obj parch"><div class="obj-h"><span>Mục tiêu</span><i>▾</i></div>${collapsed ? '' : rows.map(([t, v, ok]) => `<div class="obj-r ${ok ? 'ok' : ''}"><span class="d">${ok ? ic('i-check') : '◆'}</span><span class="t">${t}</span><b>${v}</b></div>`).join('')}</div>`;
}
function cluster(size = 150) {
  return `<div class="cluster" style="width:${size + 120}px;height:${size + 90}px">
  <button class="rb rb-a" aria-label="Nhật ký">${ic('i-scroll')}</button>
  <button class="rb rb-b" aria-label="Kế sách">${ic('i-diamond')}</button>
  <button class="rb rb-c" aria-label="Bối cảnh">${ic('i-book')}</button>
  <button class="rb rb-d" aria-label="Cài đặt">${ic('i-gear')}</button>
  <button class="rb undo" aria-label="Hoàn tác">${ic('i-undo')}<em>2</em></button>
  <div class="disc" style="width:${size}px;height:${size}px">${endDisc(size)}</div>
  <div class="disc-l">Kết thúc lượt</div></div>`;
}
function slot(icon, name, lv, kind = 'full') {
  if (kind === 'empty') return `<div class="slot empty">${ic('i-plus')}<small>Trống</small></div>`;
  if (kind === 'lock') return `<div class="slot lock">${ic('i-lock')}</div>`;
  return `<div class="slot">${ic(icon)}<small>${name}</small>${lv ? `<i class="lv">${lv}</i>` : ''}</div>`;
}
function unit(icon, n, side = 'own') { return `<div class="unit ${side}"><div class="pt">${ic(icon)}</div><i class="cnt">${n}</i></div>`; }
function unitEmpty(lock) { return `<div class="unit empty">${lock ? ic('i-lock') : ''}</div>`; }

function tilePanel() {
  return `<aside class="side parch"><div class="rib"><span>Thủ phủ</span><i class="lvb">Đồng bằng</i></div>
  <div class="tag">Khu định cư · công sự −20% sát thương</div>
  <h4>Công trình <small>3/6</small></h4>
  <div class="grid3">${slot('i-farm', 'Ruộng', 'Cấp 1')}${slot('i-lumber', 'Bãi gỗ', 'Cấp 1')}${slot('i-barracks', 'Trại quân', 'Cấp 1')}${slot('', '', '', 'empty')}${slot('', '', '', 'empty')}${slot('', '', '', 'empty')}</div>
  <h4>Quân đồn trú <small>3/8</small></h4>
  <div class="grid4">${unit('i-hat', 3)}${unitEmpty()}${unitEmpty()}${unitEmpty()}${unitEmpty()}${unitEmpty(1)}${unitEmpty(1)}${unitEmpty(1)}</div>
  <h4>Quân cơ động tại ô</h4>
  <div class="grid4">${unit('i-helm', 2)}${unit('i-bow', 1)}${unitEmpty()}${unitEmpty()}</div>
  <div class="acts"><button class="btn pri">${ic('i-helm')}Huấn luyện</button><button class="btn">${ic('i-banner')}Điều quân</button><button class="btn">${ic('i-lumber')}Xây dựng</button></div></aside>`;
}
function alertBar() {
  return `<div class="alertbar"><b>${ic('i-hourglass', 'w')} Tập kích RAID-2 → Đồng Trung</b><span>tới sau <b>2 lượt</b> · dự báo ≈6 quân</span><span class="ok">Đội chọn tới kịp sau 1 lượt</span></div>`;
}
function titleBanner() {
  return `<div class="title"><span class="t1">Hộ Quốc Tuyến</span><span class="t2">1075 – 1077 · Lượt <b>6</b>/28</span></div>`;
}

function screenMap() {
  return `<div class="stage" style="width:1600px;height:900px">${mapSvg({ sel: 'TIL-001' })}${titleBanner()}${resPill()}${objective()}${alertBar()}${tilePanel()}${cluster(150)}</div>`;
}

/* tranh minh họa sự kiện (trinh sát nơi biên ải) */
function eventArt() {
  let s = `<svg viewBox="0 0 760 250" width="760" height="250" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6d98f"/><stop offset=".6" stop-color="#f0b86a"/><stop offset="1" stop-color="#d98a52"/></linearGradient></defs><rect width="760" height="250" fill="url(#sk)"/>`;
  s += `<g transform="translate(380,128)">`;
  for (let i = 0; i < 20; i++) s += `<path d="M0,0 L${Math.cos(i / 20 * Math.PI * 2) * 420},${Math.sin(i / 20 * Math.PI * 2) * 420}" stroke="#fff3c4" stroke-width="${i % 2 ? 6 : 12}" opacity=".22"/>`;
  s += `<circle r="38" fill="#fbe7a0" stroke="#b8892b" stroke-width="3"/><circle r="26" fill="#f8d36a"/></g>`;
  s += `<path d="M0,190 L90,110 L150,150 L240,70 L330,160 L420,120 L520,60 L620,140 L690,100 L760,150 L760,250 L0,250Z" fill="#6c6a9a" stroke="${INK}" stroke-width="2.4" stroke-linejoin="round"/>`;
  s += `<path d="M240,70 L330,160 L290,170 L250,110Z M520,60 L620,140 L560,150Z" fill="#5a5888"/><path d="M0,215 C140,185 220,225 360,205 C500,185 620,225 760,200 L760,250 L0,250Z" fill="#2f5d73" stroke="${INK}" stroke-width="2.4"/>`;
  s += `<path d="M30,222 q8,-6 16,0 q8,6 16,0 M300,214 q8,-6 16,0 q8,6 16,0 M520,222 q8,-6 16,0 q8,6 16,0" stroke="#cfe3e6" stroke-width="2" fill="none"/>`;
  s += `<path d="M560,250 L600,176 L680,176 L720,250Z" fill="#3d3a63" stroke="${INK}" stroke-width="2.4"/>`;
  s += `<g transform="translate(640,176)"><path d="M-10,0 q4,-18 14,-16 q4,2 2,8 l8,8z" fill="#2b1c0e"/><path d="M14,-8 L14,-52" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M15,-52 Q30,-58 44,-48 Q30,-44 15,-38Z" fill="#a33b2f" stroke="${INK}" stroke-width="2"/><circle cx="2" cy="-22" r="7" fill="#2b1c0e"/><path d="M-6,-26 q8,-8 16,0" stroke="#b8892b" stroke-width="3" fill="none"/></g>`;
  s += `<path d="M160,70 q10,-10 20,0 q10,10 20,0 M480,40 q8,-8 16,0 q8,8 16,0" stroke="${INK}" stroke-width="2" fill="none" opacity=".6"/>`;
  return s + '</svg>';
}
function lotusBorder(w) {
  return `<div class="lb" style="width:${w}px"><svg viewBox="0 0 ${w} 18" width="${w}" height="18"><path d="M0,9 H${w / 2 - 40} M${w / 2 + 40},9 H${w}" stroke="#b8892b" stroke-width="2"/><g transform="translate(${w / 2},9)"><use href="#i-lotus" x="-14" y="-14" width="28" height="28"/></g><circle cx="${w / 2 - 52}" cy="9" r="3" fill="#b8892b"/><circle cx="${w / 2 + 52}" cy="9" r="3" fill="#b8892b"/></svg></div>`;
}
function choiceCard(t, lines, dflt) {
  return `<div class="choice ${dflt ? 'dflt' : ''}">${dflt ? '<i class="dtag">Mặc định</i>' : ''}<h5>${t}</h5>${lines.map(([k, v]) => `<div class="eff ${k}">${v}</div>`).join('')}<button class="btn ${dflt ? '' : 'pri'}">Chọn</button></div>`;
}
function screenEvent() {
  return `<div class="stage" style="width:1600px;height:900px">${mapSvg({ sel: null, showAlert: false })}<div class="dim"></div>${resPill()}${titleBanner()}
  <div class="evt parch"><div class="evt-art">${eventArt()}<div class="evt-frame"></div></div>
  <div class="evt-tags"><span>Sự kiện · Lượt 2</span><span class="src">SOURCED · khung H8</span></div>
  <h2>Tin tình báo từ phía Bắc</h2>${lotusBorder(420)}
  <p>Trinh sát báo đối phương đang gom lương, chuẩn bị tiến quân. Chờ họ ra tay trước hay chủ động ra tay?</p>
  <div class="choices">
   ${choiceCard('Cử trinh sát qua biên', [['neg', '−10 Lương'], ['pos', '+1 tầm cảnh báo trong 6 lượt']], false)}
   ${choiceCard('Tập kích trước ở biên', [['neg', '−25 Lương, −10 Sắt, −1 Dân tâm'], ['pos', 'Đợt tập kích kế tiếp tới muộn 1 lượt'], ['pos', 'Đợt tập kích kế tiếp yếu đi 10%']], false)}
   ${choiceCard('Chỉ củng cố tiền tuyến', [['pos', '+5% công sự trong 6 lượt'], ['neu', 'Không tốn gì']], true)}
  </div>
  <div class="evt-foot"><span>Chưa chọn khi kết thúc lượt → tự áp lựa chọn <b>Mặc định</b>.</span><button class="btn">Để sau</button></div></div></div>`;
}

function unitRow(icon, n, left, side) { return `<div class="ur ${side}">${unit(icon, n, side)}<span>→ còn <b>${left}</b></span></div>`; }
function screenBattle() {
  return `<div class="stage" style="width:1600px;height:900px">${mapSvg({ sel: 'TIL-005', showAlert: false })}<div class="dim"></div>${resPill()}
  <div class="bat parch"><div class="win-ribbon"><span>Phòng thủ thành công</span></div>
  <div class="bat-sub">Đồng Trung (TIL-005) · RAID-2 · 7 vòng</div>
  <div class="bat-cols">
   <div class="col own"><h4>${ic('i-shield')} Quân ta</h4><div class="urs">${unitRow('i-hat', 4, 3, 'own')}${unitRow('i-helm', 3, 3, 'own')}${unitRow('i-bow', 2, 2, 'own')}</div><div class="bar"><i style="width:82%"></i></div><small>Còn 82% lực lượng</small></div>
   <div class="vs">${ic('i-swords')}</div>
   <div class="col foe"><h4>${ic('i-swords')} Phe tấn công</h4><div class="urs">${unitRow('i-helm', 4, 0, 'enemy')}${unitRow('i-bow', 2, 0, 'enemy')}</div><div class="bar foe"><i style="width:0%"></i></div><small>Bị đánh tan</small></div></div>
  <h4 class="cz">Nguyên nhân chính</h4>
  <ul class="causes"><li>${ic('i-palisade')}<span>Lũy gỗ giảm <b>20%</b> sát thương nhận vào</span></li><li>${ic('i-bow')}<span>Cung thủ ta bắn từ phía sau, tầm xa hơn bộ binh địch</span></li><li>${ic('i-lotus')}<span>Dân tâm <b>+3</b> · đã chặn <b>2/4</b> đợt</span></li></ul>
  <div class="acts c"><button class="btn pri">Đóng</button></div></div></div>`;
}

function screenMobile() {
  return `<div class="stage m" style="width:412px;height:915px">${mapSvg({ viewBox: '520 240 480 690', w: 412, h: 592, sel: 'TIL-001' })}
  <div class="m-top"><div class="title sm"><span class="t1">Hộ Quốc Tuyến</span><span class="t2">Lượt <b>6</b>/28</span></div>
  <div class="res parch-pill sm">${[['i-grain', '120'], ['i-wood', '96'], ['i-stone', '41'], ['i-iron', '22'], ['i-lotus', '13']].map(([i, n]) => `<span class="rv">${ic(i)}<b>${n}</b></span>`).join('')}</div>
  <div class="obj parch sm"><div class="obj-h"><span>Mục tiêu · 1/4 · 2/3 · 13/10 ✓</span><i>▸</i></div></div></div>
  <div class="m-alert">${ic('i-hourglass', 'w')} <b>RAID-2 → Đồng Trung</b> · 2 lượt</div>
  <div class="m-cluster">${cluster(88)}</div>
  <aside class="sheet parch"><div class="grab"></div><div class="rib sm"><span>Thủ phủ</span><i class="lvb">Đồng bằng</i></div>
  <h4>Công trình <small>3/6</small></h4><div class="grid6">${slot('i-farm', 'Ruộng', '1')}${slot('i-lumber', 'Gỗ', '1')}${slot('i-barracks', 'Trại', '1')}${slot('', '', '', 'empty')}${slot('', '', '', 'empty')}${slot('', '', '', 'empty')}</div>
  <h4>Quân tại ô <small>3 đồn trú · 3 cơ động</small></h4><div class="grid6u">${unit('i-hat', 3)}${unit('i-helm', 2)}${unit('i-bow', 1)}${unitEmpty()}${unitEmpty()}${unitEmpty(1)}</div>
  <div class="acts"><button class="btn pri">Huấn luyện</button><button class="btn">Điều quân</button><button class="btn">Xây</button></div></aside></div>`;
}

function screenBoard() {
  const sw = [['Giấy dó', '#efe2c0'], ['Mực', '#3b2a1c'], ['Son', '#a33b2f'], ['Chàm', '#2f5d73'], ['Vàng thếp', '#b8892b'], ['Lục đồng', '#6f8f4e'], ['Đất sét', '#a2543a'], ['Nước sông', '#7fa7b4']];
  return `<div class="stage board" style="width:1600px;height:1040px"><svg width="0" height="0"></svg>
  <h1>Dai Viet Rising — Bảng phong cách giao diện (CR-003, bản xem trước)</h1>
  <div class="bcol"><h3>Bảng màu</h3><div class="sws">${sw.map(([n, c]) => `<div class="sw"><i style="background:${c}"></i><b>${n}</b><small>${c}</small></div>`).join('')}</div>
  <h3>Chữ</h3><div class="typo"><div class="t-h">Hộ Quốc Tuyến</div><small>Lora Bold, chữ hoa cách chữ — tiêu đề, bảng tên, nút lớn</small><div class="t-b">Lương 120 · Gỗ-tre 96 · Dân tâm 13/10</div><small>Be Vietnam Pro 400/600 — nội dung, số liệu (font tự đóng gói, giấy phép OFL, chạy offline)</small></div>
  <h3>Tiền tệ & trạng thái</h3><div class="iconrow">${['i-grain', 'i-wood', 'i-stone', 'i-iron', 'i-lotus', 'i-shield', 'i-swords', 'i-hourglass'].map((i) => ic(i, 'big')).join('')}</div>
  <h3>Công trình</h3><div class="iconrow">${['i-farm', 'i-lumber', 'i-barracks', 'i-watch', 'i-palisade'].map((i) => ic(i, 'big')).join('')}</div>
  <h3>Quân</h3><div class="iconrow">${['i-hat', 'i-helm', 'i-bow', 'i-spear', 'i-banner'].map((i) => ic(i, 'big')).join('')}</div></div>
  <div class="bcol"><h3>Bảng tên địa điểm (3 trạng thái)</h3>
   <svg width="620" height="140" viewBox="0 0 620 140"><defs>${SYMBOLS}</defs>${banner(110, 28, 'Thủ phủ', 'own')}${chip(110, 62, 'i-shield', '3', 'own')}${banner(310, 28, 'Châu Đông', 'open')}${banner(510, 28, 'Cửa Đông Bắc', 'enemy')}${chip(510, 62, 'i-swords', '≈4', 'enemy')}${alertBadge(590, 92, 2)}<text x="20" y="128" font-size="13" fill="#4a3a22">Của ta · đất trống · địch chiếm (số quân ước lượng) · huy hiệu đếm ngược (phải)</text></svg>
  <h3>Nút & ô</h3><div class="btnrow"><button class="btn pri">Chọn</button><button class="btn">Điều quân</button><button class="btn" disabled>Không đủ tài nguyên</button></div>
  <div class="grid4 sm4">${slot('i-farm', 'Ruộng', 'Cấp 1')}${slot('', '', '', 'empty')}${slot('', '', '', 'lock')}${unit('i-hat', 3)}</div>
  <h3>Nút Kết thúc lượt & cụm nút tròn</h3><div style="position:relative;height:250px">${cluster(130).replace('class="cluster"', 'class="cluster" style="position:absolute;left:0;top:0;width:380px;height:250px"')}</div>
  <h3>Nguyên tắc</h3><ul class="pr"><li>Bản đồ toàn màn hình, địa điểm là cụm minh họa — không phải hộp (P-UI1)</li><li>Mọi trạng thái có biểu tượng + chữ, không chỉ màu (trợ năng)</li><li>Hậu quả hiện bằng chữ trước khi bấm (P-UI6)</li><li>Họa tiết: sen, lá đề, rồng Lý — cần thẩm định sử học</li></ul></div></div>`;
}
