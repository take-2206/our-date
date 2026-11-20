// Shared, online two-player Tic Tac Toe page.
const TTT_WINS = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function tttWinningLine(board) {
  return (
    TTT_WINS.find(
      ([a, b, c]) => board[a] && board[a] == board[b] && board[a] == board[c],
    ) || []
  );
}

// ===== Ghế ngồi: ghế 0 = bên trái = con gái, ghế 1 = bên phải = con trai =====
// Cả hai máy đều tính ra cùng một kết quả nên thấy cùng một cảnh.
function throwMySeat() {
  const mine = me(),
    other = pr();
  // Hai người cùng giới: người có id nhỏ hơn đứng bên trái
  if (mine === other) return String(S.user?.id) < String(partner()?.id) ? 0 : 1;
  return mine === "m" ? 1 : 0;
}

function vThrowGame() {
  const ended = THROW_GAME.hp.some((hp) => hp <= 0),
    seat = throwMySeat(),
    names = [],
    genders = [];
  names[seat] = S.user?.name || me();
  names[1 - seat] = partner()?.name || t("petPartner");
  genders[seat] = me();
  genders[1 - seat] = pr();

  // ===== Thanh máu: xanh -> vàng (<=50%) -> đỏ (<=25%) =====
  const hpPct = (i) =>
      Math.max(0, Math.min(100, Number(THROW_GAME.hp[i]) || 0)),
    hpLevel = (i) => (hpPct(i) <= 25 ? "low" : hpPct(i) <= 50 ? "mid" : ""),
    hpCard = (i) =>
      `<div class="throw-player${THROW_GAME.turn == i && !ended ? " active" : ""}${hpPct(i) <= 0 ? " ko" : ""}"><img src="./img/pet/mini_${genders[i] == "m" ? "boy" : "girl"}.png" alt=""><div class="throw-hp-info"><div class="throw-hp-top"><span>${esc(names[i])}</span><b>${hpPct(i)}%</b></div><div class="throw-hp" role="progressbar" aria-label="${esc(names[i])}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${hpPct(i)}"><i class="${hpLevel(i)}" style="width:${hpPct(i)}%"></i></div></div></div>`;

  const targetSrc = (i) => throwImageSrc(i, genders[i] == "m" ? "boy" : "girl");

  if (!THROW_GAME.open)
    return `<button class="card throw-launch" type="button" data-a="throwOpen" aria-label="${esc(t("throwOpen"))}"><img src="./img/game1.png" alt=""><span><small class="mono">MINI GAME</small><b>${esc(t("throwTitle"))}</b><em>${esc(t("throwOpen"))} ↗</em></span>
</button>`;
  return `<section class="card throw-card" aria-label="${esc(t("throwTitle"))}">
    <div class="throw-heading"><div><p class="mono sub">// MINI GAME</p><h2 class="px">${esc(t("throwTitle"))}</h2><p class="sub">${esc(t("throwHint"))}</p></div><div class="throw-heading-actions"><button class="btn b2 throw-reset" type="button" data-a="throwReset">${esc(t("throwReset"))}</button><button class="btn b2 throw-reset" type="button" data-a="throwClose">${esc(t("throwClose"))}</button></div></div>
    <div class="throw-score">${hpCard(0)}${hpCard(1)}</div>
    <p class="throw-status" role="status">${esc(ended ? t("throwWin").replace("{name}", names[THROW_GAME.hp[0] <= 0 ? 1 : 0]) : THROW_GAME.message || t("throwTurn").replace("{name}", names[THROW_GAME.turn]))}</p>
    <div class="throw-arena" data-throw-arena>
      <canvas class="throw-canvas" data-throw-canvas width="640" height="360"></canvas>
      <img class="throw-target throw-target-left" data-throw-target="0" style="${throwTargetStyle(0, throwIsTease(0))}" src="${targetSrc(0)}" alt="${esc(names[0])}">
      <img class="throw-target throw-target-right" data-throw-target="1" style="${throwTargetStyle(1, throwIsTease(1))}" src="${targetSrc(1)}" alt="${esc(names[1])}">
    </div>
    <div class="throw-power"><span>${esc(t("throwPower"))}</span><div><i data-throw-power></i></div><b data-throw-power-label>0%</b></div>
    <p class="throw-help">${esc(t("throwControls"))}</p>
  </section>`;
}

function vGame() {
  const line = TTT.winLine || [],
    finished = !!TTT.winner || TTT.draw,
    profileX = (TTT.playerX && P[TTT.playerX]) || {},
    profileO = (TTT.playerO && P[TTT.playerO]) || {},
    playerX = profileX.name || (TTT.playerX == S.user?.id ? S.user.name : "X"),
    playerO = profileO.name || (TTT.playerO == S.user?.id ? S.user.name : "O"),
    playerXGender =
      profileX.gender || (TTT.playerX == S.user?.id ? me() : pr()),
    playerOGender =
      profileO.gender || (TTT.playerO == S.user?.id ? me() : pr()),
    myTurn =
      !!S.user && S.user.id == (TTT.turn == "X" ? TTT.playerX : TTT.playerO),
    status = !TTT.playerO
      ? t("gameWaitPartner")
      : TTT.winner
        ? t("gameWin").replace("{name}", TTT.winner == "X" ? playerX : playerO)
        : TTT.draw
          ? t("gameDraw")
          : myTurn
            ? t("gameYourTurn")
            : t("gameTurn").replace(
                "{name}",
                TTT.turn == "X" ? playerX : playerO,
              );
  if (!TTT.open)
    return `<div class="main">${head(t("game"), t("gameSub"))}${vThrowGame()}<button class="card throw-launch ttt-launch" type="button" data-a="tttOpen" aria-label="${esc(t("tttOpen"))}"><img src="./img/game2.png" alt=""><span><small class="mono">TIC TAC TOE</small><b>${esc(t("tttOpen"))}</b><em>${esc(t("throwOpen"))} ↗</em></span></button></div>`;
  return `<div class="main">${head(t("game"), t("gameSub"))}${vThrowGame()}
    ${
      !TTT.ready
        ? `<section class="card ttt-card ttt-setup"><div class="ttt-collapse-row"><span class="mono sub">TIC TAC TOE</span><button class="btn b2" type="button" data-a="tttClose">${esc(t("tttClose"))}</button></div><h2>${t("gameSetup")}</h2><p class="sub">${esc(TTT.error || "")}</p></section>`
        : `<section class="card ttt-card" aria-label="${t("game")}">
      <div class="ttt-collapse-row"><span class="mono sub">TIC TAC TOE</span><button class="btn b2" type="button" data-a="tttClose">${esc(t("tttClose"))}</button></div>
      <div class="ttt-scoreboard" aria-label="${t("gameScore")}" aria-live="polite">
        <div class="ttt-score-player${TTT.turn == "X" && !finished ? " active" : ""}"><img class="ttt-mark ttt-x" src="./img/pet/mini_${playerXGender == "m" ? "boy" : "girl"}.png" alt=""><span class="ttt-player-name">${esc(playerX)}</span><b>${Number(TTT.scores?.X) || 0}</b></div>
        <div class="ttt-score-draw"><span>${t("gameDraws")}</span><b>${Number(TTT.scores?.draws) || 0}</b></div>
        <div class="ttt-score-player${TTT.turn == "O" && !finished ? " active" : ""}"><img class="ttt-mark ttt-o" src="./img/pet/mini_${playerOGender == "m" ? "boy" : "girl"}.png" alt=""><span class="ttt-player-name">${esc(playerO)}</span><b>${Number(TTT.scores?.O) || 0}</b></div>
      </div>
      <p class="ttt-status" role="status" aria-live="polite">${esc(status)}</p>
      <div class="ttt-board" role="group" aria-label="${t("game")}">${TTT.board.map((mark, index) => `<button class="ttt-cell${mark ? ` ttt-${mark.toLowerCase()}` : ""}${line.includes(index) ? " win" : ""}" type="button" data-a="tttMove" data-i="${index}" aria-label="${t("gameCell").replace("{n}", index + 1)}${mark ? `: ${mark}` : ""}"${mark || finished || !myTurn || TTT.busy || !TTT.playerO ? " disabled" : ""}>${mark ? `<img class="ttt-token" src="./img/pet/mini_${(mark == "X" ? playerXGender : playerOGender) == "m" ? "boy" : "girl"}.png" alt="">` : ""}</button>`).join("")}</div>
      <div class="ttt-actions"><button class="btn b1" type="button" data-a="tttNewRound"${TTT.busy || !TTT.playerO ? " disabled" : ""}>${t("gameNewRound")}</button><button class="btn b2" type="button" data-a="tttResetScore"${TTT.busy || !TTT.playerO ? " disabled" : ""}>${t("gameResetScore")}</button></div>
    </section>`
    }
  </div>`;
}

// ===== Đồng bộ online cho game ném (Supabase Realtime broadcast) =====
// Gọi throwConnect(sb) MỘT LẦN khi vào trang game (sau khi đã đăng nhập và có partner()).
//   sb       = client Supabase của bạn
//   coupleId = (tuỳ chọn) nếu bỏ trống sẽ tự ghép từ id của hai tài khoản,
//              đã sắp xếp nên hai máy luôn ra cùng một giá trị.
let throwChannel = null;
let throwChannelId = null;
let throwChannelStatus = "NOT_CONNECTED";

function throwCoupleId() {
  const a = S.user?.id,
    b = partner()?.id;
  if (!a || !b) return null;
  return [String(a), String(b)].sort().join("-");
}

function throwConnect(sb, coupleId) {
  const id = coupleId || throwCoupleId();
  if (!id) {
    console.warn("[throw] chưa có id của 2 tài khoản, chưa thể kết nối");
    return;
  }
  if (throwChannel && throwChannelId === id) return; // đã kết nối rồi
  if (throwChannel) {
    sb.removeChannel(throwChannel); // id đổi: bỏ kênh cũ
    throwChannel = null;
  }
  throwChannelId = id;
  throwChannel = sb.channel(`throw:${id}`, {
    config: { broadcast: { self: false } },
  });
  throwChannel
    .on("broadcast", { event: "throw" }, ({ payload }) => {
      if (THROW.debug) console.log("[throw] nhận cú ném:", payload);
      THROW.remote?.(payload);
    })
    .on("broadcast", { event: "throwReset" }, () => {
      if (THROW.debug) console.log("[throw] nhận reset");
      // throwApplyReset() nằm trong interactions.js: đặt lại máu/lượt rồi render.
      // Nó KHÔNG gửi lại throwReset nên không bị lặp vô hạn.
      if (typeof throwApplyReset === "function") throwApplyReset();
    })
    .subscribe((status) => {
      throwChannelStatus = status;
      console.log("[throw] kênh", `throw:${id}`, "→", status);
    });
}

function throwSend(event, payload) {
  if (!throwChannel || throwChannelStatus !== "SUBSCRIBED") {
    console.warn(
      "[throw] chưa gửi được vì kênh chưa SUBSCRIBED (trạng thái:",
      throwChannelStatus + ")",
    );
    return;
  }
  throwChannel.send({ type: "broadcast", event, payload });
}

// Gõ throwDebug() trong Console (F12) trên CẢ HAI máy để kiểm tra
function throwDebug() {
  THROW.debug = true;
  console.log("[throw] ghế của mình:", throwMySeat(), "(0=trái/gái, 1=phải/trai)");
  console.log("[throw] lượt hiện tại:", THROW_GAME.turn, "| máu:", THROW_GAME.hp);
  console.log("[throw] me():", me(), "| pr():", pr());
  console.log("[throw] coupleId:", throwCoupleId());
  console.log("[throw] trạng thái kênh:", throwChannelStatus);
}

// ===== Game ném chảo: kéo chuột ngắm theo quỹ đạo cong =====
// Gọi initThrowGame(onHit) sau khi HTML của vGame() đã được gắn vào trang.
const THROW = {
  G: 0.45, // trọng lực
  MAX_PULL: 160, // kéo tối đa (px trên canvas)
  POWER_K: 0.106, // hệ số lực ném (tốc độ tối đa ≈ 17 px/frame)
  MIN_POWER: 0.08,
  PAN: 44,
  CHAR: 80,
  pose: null, // chỉ số người đang ở tư thế ném (null = không ai)
  HIT_MS: 900, // thời gian hiện ảnh bị trúng
  hit: null, // { i: người bị trúng, until: thời điểm hết hiệu lực }
  drag: null,
  flight: null,
  cvs: null,
  bound: false,
  remote: null, // nhận cú ném từ máy kia (gán trong initThrowGame)
  debug: false, // bật bằng throwDebug()
};

// Người i đang ở trạng thái "thắng và trêu": mình đã hết máu, đối phương còn máu.
// Tính theo góc nhìn của từng máy (ghế của mình = throwMySeat()).
function throwIsTease(i) {
  const hp = (typeof THROW_GAME !== "undefined" && THROW_GAME.hp) || [];
  const mySeat = throwMySeat();
  return i === 1 - mySeat && hp[mySeat] <= 0 && hp[i] > 0;
}

// Chọn ảnh cho nhân vật i (g = "boy" | "girl"). Ưu tiên:
// thắng => trêu (tease_*) > sắp ném (throw_*) > bị trúng (*) > thường (pet)
function throwImageSrc(i, g) {
  if (throwIsTease(i)) return `./img/throw/tease_${g}.png`;
  if (THROW.pose === i) return `./img/throw/throw_${g}.png`;
  if (THROW.hit && THROW.hit.i === i && Date.now() < THROW.hit.until)
    return `./img/throw/${g}.png`;
  return `./img/pet/${g}.png`;
}

// Khung cố định của nhân vật (khớp vùng va chạm trong canvas 640x360, CHAR=80).
// Mọi ảnh dùng chung khung, neo ở đáy, không transform/animation => không bị nhảy khi đổi ảnh.
// big = true: ảnh thắng to hơn (~1.75 lần). Muốn to hơn thì tăng 22 và 39.
function throwTargetStyle(i, big) {
  const w = big ? 22 : 12.5,
    h = big ? 39 : 22.2;
  return (
    `position:absolute;z-index:0;bottom:16.9%;width:${w}%;height:${h}%;` +
    `${i === 0 ? "left" : "right"}:10.9%;` +
    "object-fit:contain;object-position:50% 100%;" +
    "transform:none;animation:none;transition:none;pointer-events:none;"
  );
}

// Cập nhật ảnh 2 nhân vật theo trạng thái: thắng (tease) > đang ném (pose) > bị trúng (hit) > thường
function applyThrowImages() {
  document.querySelectorAll("[data-throw-target]").forEach((el) => {
    const i = Number(el.dataset.throwTarget);
    const g = ((el.getAttribute("src") || "").match(/(boy|girl)\.png/) || [])[1];
    if (!g) return;
    el.style.cssText = throwTargetStyle(i, throwIsTease(i));
    el.setAttribute("src", throwImageSrc(i, g));
  });
}

// i = 0/1: người đó đổi sang ảnh sắp ném; null = trả lại
function setThrowPose(i) {
  THROW.pose = i;
  applyThrowImages();
}

// Người bị ném trúng đổi sang img/throw/boy|girl.png trong HIT_MS rồi trả lại
function showThrowHit(i) {
  THROW.hit = { i, until: Date.now() + THROW.HIT_MS };
  applyThrowImages();
  setTimeout(() => {
    if (THROW.hit && Date.now() >= THROW.hit.until) THROW.hit = null;
    applyThrowImages(); // vGame() có thể đã render lại nên tìm lại trong DOM
  }, THROW.HIT_MS + 20);
}

function initThrowGame(onHit) {
  const arena = document.querySelector("[data-throw-arena]");
  if (!arena) return;
  const cvs = arena.querySelector("[data-throw-canvas]");
  cvs.style.touchAction = "none"; // chặn trình duyệt cuộn trang khi kéo trên điện thoại
  const ctx = cvs.getContext("2d");
  const W = cvs.width,
    H = cvs.height;
  const GROUND = H * 0.83;
  const { CHAR, PAN } = THROW;

  // Tải trước ảnh tư thế ném để không bị chớp khi đổi
  ["boy", "girl"].forEach((n) => {
    new Image().src = `./img/throw/throw_${n}.png`;
    new Image().src = `./img/throw/${n}.png`;
    new Image().src = `./img/throw/tease_${n}.png`;
  });

  const turn = THROW_GAME.turn;
  // Ghế 0 đứng bên trái (con gái), ghế 1 đứng bên phải (con trai)
  const spot = (i) => ({ x: i === 0 ? 110 : W - 110, y: GROUND - CHAR * 0.6 });
  const start = spot(turn);

  const toCanvas = (e) => {
    const r = cvs.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) * W) / r.width,
      y: ((e.clientY - r.top) * H) / r.height,
    };
  };

  // Kéo về phía sau => ném sang phía đối diện; kéo càng xa lực càng mạnh
  const launchVec = () => {
    const d = THROW.drag;
    if (!d) return null;
    const dx = d.sx - d.x,
      dy = d.sy - d.y;
    const len = Math.hypot(dx, dy);
    if (len < 4) return null;
    const power = Math.min(len / THROW.MAX_PULL, 1);
    const k = ((power * THROW.MAX_PULL) / len) * THROW.POWER_K;
    return { vx: dx * k, vy: dy * k, power };
  };

  const trajectory = (v) => {
    const pts = [];
    let x = start.x,
      y = start.y,
      vx = v.vx,
      vy = v.vy;
    for (let i = 0; i < 240; i++) {
      vy += THROW.G;
      x += vx;
      y += vy;
      pts.push({ x, y });
      if (y > GROUND || x < -PAN || x > W + PAN) break;
    }
    return pts;
  };

  // Bắt đầu một cú bay từ ghế `seat` (dùng cho cả cú của mình lẫn cú nhận từ máy kia)
  const launch = (seat, vx, vy, power) => {
    const s = spot(seat);
    THROW.flight = { x: s.x, y: s.y, vx, vy, power, rot: 0 };
  };

  // Máy kia gửi cú ném tới: mô phỏng lại cùng vx, vy nên hai máy ra cùng kết quả
  THROW.remote = (p) => {
    if (!p) return;
    if (THROW.flight || p.seat !== THROW_GAME.turn) {
      console.warn(
        "[throw] bỏ qua cú ném nhận được. Đang bay:",
        !!THROW.flight,
        "| ghế người ném:",
        p.seat,
        "| lượt ở máy này:",
        THROW_GAME.turn,
      );
      return;
    }
    setThrowPose(p.seat);
    launch(p.seat, p.vx, p.vy, p.power);
  };

  // Đạn bay: chấm tròn nhỏ (không dùng ảnh chảo)
  const drawShot = (x, y) => {
    ctx.save();
    ctx.fillStyle = "#b36bff";
    ctx.shadowColor = "rgba(179, 107, 255, .8)";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(x, y, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const render = () => {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#3a4a2e";
    ctx.fillRect(0, GROUND, W, H - GROUND);

    const v = THROW.drag ? launchVec() : null;

    if (THROW.flight) {
      drawShot(THROW.flight.x, THROW.flight.y);
    } else {
      if (v) {
        // Đường nhắm cong: mô phỏng đúng vật lý như stepFlight()
        const pts = trajectory(v);
        ctx.save();
        ctx.fillStyle = "#b36bff";
        ctx.shadowColor = "rgba(179, 107, 255, .55)";
        ctx.shadowBlur = 5;
        pts.forEach((p, i) => {
          if (i % 3 !== 0) return; // cách đều các chấm
          const fade = 1 - i / pts.length; // càng xa càng mờ, nhỏ
          ctx.globalAlpha = 0.25 + 0.75 * fade;
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3.2 * (0.6 + 0.4 * fade), 0, Math.PI * 2);
          ctx.fill();
        });

        // Vòng tròn đánh dấu điểm rơi dự kiến
        const last = pts[pts.length - 1];
        if (last) {
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
          ctx.strokeStyle = "#b36bff";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(
            Math.max(0, Math.min(W, last.x)),
            Math.min(last.y, GROUND),
            8,
            0,
            Math.PI * 2,
          );
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    const pw = v ? v.power : 0;
    // Thanh lực nằm ngoài .throw-arena nên phải tìm trong cả thẻ .throw-card
    const card = arena.closest(".throw-card") || document;
    const bar = card.querySelector("[data-throw-power]");
    const lbl = card.querySelector("[data-throw-power-label]");
    if (bar) bar.style.width = `${Math.round(pw * 100)}%`;
    if (lbl) lbl.textContent = `${Math.round(pw * 100)}%`;
  };

  const stepFlight = () => {
    const f = THROW.flight;
    f.vy += THROW.G;
    f.x += f.vx;
    f.y += f.vy;
    f.rot += 0.2;
    const target = spot(1 - turn);
    const ty = GROUND - CHAR / 2;
    if (Math.hypot(f.x - target.x, f.y - ty) < CHAR * 0.55) {
      THROW.flight = null;
      THROW.pose = null;
      showThrowHit(1 - turn); // trước khi onHit trừ máu / render lại
      onHit && onHit({ hit: true, power: f.power, to: 1 - turn });
      return;
    }
    if (f.y > GROUND || f.x < -PAN || f.x > W + PAN) {
      THROW.flight = null;
      setThrowPose(null);
      onHit && onHit({ hit: false, power: f.power, to: 1 - turn });
    }
  };

  const loop = () => {
    if (!arena.isConnected) return;
    if (THROW.flight) stepFlight();
    render();
    requestAnimationFrame(loop);
  };

  // Gắn sự kiện một lần cho canvas hiện tại
  if (!THROW.bound || THROW.cvs !== cvs) {
    THROW.cvs = cvs;
    THROW.bound = true;
    cvs.addEventListener("pointerdown", (e) => {
      // Không cho ném khi đang bay, đã có người hết máu, hoặc chưa tới lượt mình
      const ended = THROW_GAME.hp.some((hp) => hp <= 0);
      const mySeat = throwMySeat();
      if (THROW.flight || ended || THROW_GAME.turn !== mySeat) {
        if (THROW.debug)
          console.log(
            "[throw] bị chặn. Đang bay:",
            !!THROW.flight,
            "| đã kết thúc:",
            ended,
            "| lượt:",
            THROW_GAME.turn,
            "| ghế của mình:",
            mySeat,
          );
        return;
      }
      const p = toCanvas(e);
      THROW.drag = { sx: p.x, sy: p.y, x: p.x, y: p.y };
      setThrowPose(THROW_GAME.turn); // đổi hình trước khi ném
      cvs.setPointerCapture(e.pointerId);
    });
    cvs.addEventListener("pointermove", (e) => {
      if (!THROW.drag) return;
      const p = toCanvas(e);
      THROW.drag.x = p.x;
      THROW.drag.y = p.y;
    });
    const release = () => {
      const v = THROW.drag && launchVec();
      THROW.drag = null;
      if (!v || v.power < THROW.MIN_POWER) {
        setThrowPose(null);
        return;
      }
      const seat = THROW_GAME.turn;
      launch(seat, v.vx, v.vy, v.power);
      throwSend("throw", { seat, vx: v.vx, vy: v.vy, power: v.power });
    };
    cvs.addEventListener("pointerup", release);
    cvs.addEventListener("pointercancel", () => {
      THROW.drag = null;
      setThrowPose(null);
    });
  }

  loop();
}