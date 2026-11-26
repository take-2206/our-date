// LoveSync room module: màn hình chính = căn phòng có hai nhân vật + thú cưng (kiểu game nuôi pet).
// Lịch, buổi hẹn, ghi chú, trò chơi, album, cài đặt mở bằng thanh menu dưới (nav() trong core.js).
// Ảnh nền phòng: đổi file trong img/bg/ để đổi nền (ví dụ mùa khác)
const ROOM_BG = './img/bg/dark-room.png';
const ROOM_BG_WIDE = './img/bg/dark-room-wide.png'; // máy tính / màn ngang
const ROOM_BG_LIGHT = './img/bg/room-christmas.png';
const ROOM_BG_LIGHT_WIDE = './img/bg/room-christmas-wide.png';
function roomLightsOn() {
  try {
    return localStorage.getItem('ls-room-lights') !== 'off';
  } catch (e) {
    return true;
  }
}
function roomArt(lightsOn) {
  const portrait = lightsOn ? ROOM_BG_LIGHT : ROOM_BG;
  const landscape = lightsOn ? ROOM_BG_LIGHT_WIDE : ROOM_BG_WIDE;
  return `<picture><source media="(orientation: landscape)" srcset="${landscape}"><img class="room-bg" src="${portrait}" alt="" draggable="false"></picture>`;
}
function vRoom() {
  const lightsOn = roomLightsOn();
  const lightLabel = lightsOn ? 'Tắt đèn' : 'Bật đèn';
  const lightSwitch = `<button class="room-lamp-toggle" type="button" data-a="toggleRoomLight" aria-label="${lightLabel}" aria-pressed="${lightsOn}" title="${lightLabel}"><span class="room-lamp-chain" aria-hidden="true"></span><span class="room-lamp-pull" aria-hidden="true"></span></button>`;
  const jarLabel = t(petCardView == 'jar' ? 'petViewToggle' : 'feelingsJar');
  const jarToggle = `<button class="ib room-feelings-toggle" type="button" data-a="petViewToggle" aria-label="${jarLabel}" title="${jarLabel}" aria-pressed="${petCardView == 'jar'}">${I.jar}</button>`;
  return `<div class="room${lightsOn ? '' : ' lights-off'}">${roomArt(lightsOn)}${lightSwitch}<button class="room-lamp-toggle room-lamp-toggle--corner" type="button" data-a="toggleRoomLight" aria-label="${lightLabel}" aria-pressed="${lightsOn}" title="${lightLabel}"></button>${head('', t('shared'), dayHeadBadge(), jarToggle)}${petCardHtml()}</div>`;
}
