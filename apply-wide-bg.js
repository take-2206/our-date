// Chạy trong thư mục gốc repo:  node apply-wide-bg.js
// Cần có sẵn img/bg/room-christmas-wide.png
const fs = require('fs');
const log = (...a) => console.log(...a);
function edit(file, fn) { const s = fs.readFileSync(file, 'utf8'), r = fn(s); if (r === null) return; fs.writeFileSync(file, r); }

// 1) room.js: màn ngang dùng ảnh ngang, màn dọc dùng ảnh dọc
edit('js/pages/room.js', (s) => {
  if (s.includes('ROOM_BG_WIDE')) { log('SKIP room.js (đã có)'); return null; }
  const oldImg = '`<img class="room-bg" src="${ROOM_BG}" alt="" draggable="false">`';
  if (!s.includes(oldImg)) { log('KHÔNG TÌM THẤY: thẻ <img class="room-bg"> trong js/pages/room.js'); return null; }
  s = s.replace("const ROOM_BG = './img/bg/room-christmas.png';",
    "const ROOM_BG = './img/bg/room-christmas.png';\nconst ROOM_BG_WIDE = './img/bg/room-christmas-wide.png'; // máy tính / màn ngang");
  s = s.replace(oldImg, () => '`<picture><source media="(orientation: landscape)" srcset="${ROOM_BG_WIDE}"><img class="room-bg" src="${ROOM_BG}" alt="" draggable="false"></picture>`');
  log('OK room.js'); return s;
});
// 2) CSS: màn ngang cho phòng rộng hết cỡ, sàn nằm ở phần dưới ảnh
edit('css/theme-cozy.css', (s) => {
  if (s.includes('/* ===== PHÒNG NGANG')) { log('SKIP css (đã có)'); return null; }
  log('OK css'); return s.replace(/\s*$/, '\n') + `
/* ===== PHÒNG NGANG (máy tính / màn hình ngang) ===== */
@media (orientation: landscape) and (min-width: 700px) {
  .room { max-width: none; }
  .room-bg { object-position: center bottom; }
  .room .pet-card { padding-left: 24px; padding-right: 24px; }
  .room .pet-stage { top: 56%; bottom: 150px; }
  .room .pet-walker { width: 150px; height: 195px; }
  .room .pet-chat { width: min(560px, 100%); }
}
`;
});
// 3) sw.js: cache thêm ảnh ngang
edit('sw.js', (s) => {
  if (s.includes('room-christmas-wide')) { log('SKIP sw.js (đã có)'); return null; }
  const m = s.match(/(\s*)"\.\/img\/bg\/room-christmas\.png",/);
  if (!m) { log('SKIP sw.js (không thấy dòng ảnh dọc; bỏ qua cũng không sao)'); return null; }
  log('OK sw.js (nhớ tăng số phiên bản CACHE)'); return s.replace(m[0], m[0] + m[1] + '"./img/bg/room-christmas-wide.png",');
});
