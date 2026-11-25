// LoveSync room module: màn hình chính = căn phòng có hai nhân vật + thú cưng (kiểu game nuôi pet).
// Lịch, buổi hẹn, ghi chú, trò chơi, album, cài đặt mở bằng thanh menu dưới (nav() trong core.js).
// Ảnh nền phòng: đổi file trong img/bg/ để đổi nền (ví dụ mùa khác)
const ROOM_BG = './img/bg/room-christmas.png';
const ROOM_BG_WIDE = './img/bg/room-christmas-wide.png'; // máy tính / màn ngang
function roomArt() {
  return `<picture><source media="(orientation: landscape)" srcset="${ROOM_BG_WIDE}"><img class="room-bg" src="${ROOM_BG}" alt="" draggable="false"></picture>`;
}
function vRoom() {
  return `<div class="room">${roomArt()}${head('', t('shared'), dayHeadBadge())}${petCardHtml()}</div>`;
}
