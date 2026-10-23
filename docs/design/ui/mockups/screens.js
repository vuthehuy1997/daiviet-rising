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
  const pine = (x, y, k, c) => { let g = `<g transform="translate(${x},${y}) scale(${k})"><rect x="-2" y="-8" width="4" height="10" fill="#1f1a14"/>`; for (let i = 0; i < 4; i++) { const w = 20 - i * 4, y0 = -6 - i * 14; g += `<path d="M${-w},${y0} L0,${y0 - 22} L${w},${y0} Q0,${y0 + 5} ${-w},${y0}Z" fill="${c}"/>`; } return g + '</g>'; };
  let s = `<svg viewBox="0 0 760 250" width="760" height="250" preserveAspectRatio="xMidYMid slice"><defs>
<linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7f9fae"/><stop offset=".45" stop-color="#f4d8a0"/><stop offset=".8" stop-color="#f2a766"/><stop offset="1" stop-color="#e58a54"/></linearGradient>
<radialGradient id="sg"><stop offset="0" stop-color="rgba(255,244,190,.95)"/><stop offset=".35" stop-color="rgba(255,214,120,.5)"/><stop offset="1" stop-color="rgba(255,190,100,0)"/></radialGradient>
<linearGradient id="mist" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="rgba(255,236,200,0)"/><stop offset=".6" stop-color="rgba(255,232,190,.7)"/><stop offset="1" stop-color="rgba(255,232,190,0)"/></linearGradient>
<radialGradient id="fg"><stop offset="0" stop-color="rgba(255,150,40,.9)"/><stop offset="1" stop-color="rgba(255,150,40,0)"/></radialGradient>
<linearGradient id="rv" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a9aa6"/><stop offset=".55" stop-color="#f8dca0"/><stop offset="1" stop-color="#6b8b98"/></linearGradient></defs><rect width="760" height="250" fill="url(#sk)"/>`;
  s += `<circle cx="470" cy="116" r="120" fill="url(#sg)"/><circle cx="470" cy="116" r="27" fill="#fff0b8"/>`;
  for (let i = 0; i < 14; i++) s += `<path d="M470,116 L${f1(470 + Math.cos(i / 14 * 6.283) * 520)},${f1(116 + Math.sin(i / 14 * 6.283) * 520)}" stroke="#fff3c4" stroke-width="${i % 2 ? 5 : 10}" opacity=".13"/>`;
  s += `<path d="M0,128 L70,96 L120,112 L200,70 L270,108 L340,88 L420,118 L520,84 L600,110 L680,80 L760,108 L760,170 L0,170Z" fill="#b8c1c4"/>`; // dãy xa
  s += `<rect y="110" width="760" height="40" fill="url(#mist)"/>`;
  s += `<path d="M0,150 L60,118 L110,138 L180,96 L250,136 L330,112 L400,146 L480,126 L560,150 L640,116 L720,140 L760,126 L760,190 L0,190Z" fill="#8e9fa8" stroke="rgba(60,50,60,.4)" stroke-width="1.5"/><path d="M180,96 L250,136 L215,150 L190,124Z M640,116 L720,140 L670,150Z" fill="#74878f"/>`;
  s += `<rect y="140" width="760" height="40" fill="url(#mist)" opacity=".8"/>`;
  s += `<path d="M0,176 C120,160 200,186 330,172 C470,158 560,186 760,168 L760,250 L0,250Z" fill="#6f8a5a" stroke="${INK}" stroke-width="1.6"/>`; // thung lũng
  s += `<path d="M130,250 C200,214 300,206 360,190 C420,176 450,170 520,174 C440,182 400,196 340,214 C270,232 230,246 220,250Z" fill="url(#rv)" stroke="${INK}" stroke-width="1.4"/>`; // sông phản chiếu mặt trời
  for (const [x, y] of [[300, 188], [336, 184], [372, 190], [330, 196]]) s += `<path d="M${x - 11},${y} L${x},${y - 17} L${x + 11},${y}Z" fill="#8f2d24" stroke="${INK}" stroke-width="1.2"/>`; // trại địch phía xa
  for (const [x, y] of [[318, 194], [352, 194], [280, 190]]) s += `<circle cx="${x}" cy="${y}" r="13" fill="url(#fg)"/><circle cx="${x}" cy="${y}" r="2.4" fill="#ffe27a"/><path d="M${x},${y - 3} q-5,-12 1,-24 q6,-10 -1,-20" stroke="#6b6458" stroke-width="2" fill="none" opacity=".4"/>`;
  s += `<path d="M0,250 L0,196 C60,188 110,200 170,214 C200,222 230,236 250,250Z" fill="#3f5233" stroke="${INK}" stroke-width="2"/>${pine(40, 214, 1.5, '#2b3a24')}${pine(96, 220, 1.2, '#33452a')}${pine(150, 236, .95, '#2b3a24')}`;
  s += `<path d="M540,250 L566,168 C590,158 640,160 700,170 L760,176 L760,250Z" fill="#5c4a3a" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/><path d="M566,168 C590,158 640,160 700,170 L690,180 C640,172 596,174 572,184Z" fill="#8f8a52"/><path d="M566,168 L548,250 L575,250 L582,186Z" fill="#8d7960" opacity=".7"/><path d="M600,190 l20,10 M640,200 l24,12 M690,196 l-16,20" stroke="#3f3226" stroke-width="2" opacity=".6" stroke-linecap="round"/>`;
  s += `<g transform="translate(640,170)"><ellipse cx="6" cy="2" rx="22" ry="4" fill="rgba(0,0,0,.3)"/><path d="M-12,2 Q-10,-24 4,-30 Q18,-26 20,2Z" fill="#2b2230" stroke="${INK}" stroke-width="1.8" stroke-linejoin="round"/><path d="M-12,2 Q-10,-24 4,-30 L2,2Z" fill="#3d3144"/><circle cx="4" cy="-36" r="8" fill="#c99a6a" stroke="${INK}" stroke-width="1.6"/><path d="M-6,-39 Q4,-54 14,-39 Z" fill="#c8ced4" stroke="${INK}" stroke-width="1.5" stroke-linejoin="round"/><path d="M4,-52 q6,-6 12,-2" stroke="#a33b2f" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M26,6 L30,-64" stroke="${INK}" stroke-width="3" stroke-linecap="round"/><path d="M30,-64 l-3,-9 l6,0Z" fill="#c8ced4" stroke="${INK}" stroke-width="1"/><path d="M30,-62 Q46,-68 60,-58 Q46,-54 30,-48Z" fill="#a33b2f" stroke="${INK}" stroke-width="1.6" stroke-linejoin="round"/><path d="M30,-62 Q46,-68 44,-52 L30,-48Z" fill="rgba(255,200,140,.3)"/></g>`;
  s += `<path d="M120,60 q10,-9 20,0 q10,9 20,0 M580,38 q8,-8 16,0 q8,8 16,0 M610,64 q6,-6 12,0 q6,6 12,0" stroke="${INK}" stroke-width="2" fill="none" opacity=".55" stroke-linecap="round"/>`;
  s += `<rect width="760" height="250" fill="none" stroke="rgba(40,26,12,.55)" stroke-width="22" opacity=".35" filter="url(#soft)"/>`;
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
