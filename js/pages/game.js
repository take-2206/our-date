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

function vThrowGame() {
  const ended = THROW_GAME.hp.some((hp) => hp <= 0),
    names = [S.user?.name || me(), partner()?.name || t("petPartner")],
    genders = [me(), pr()];
  if (!THROW_GAME.open)
    return `<button class="card throw-launch" type="button" data-a="throwOpen" aria-label="${esc(t("throwOpen"))}"><img src="./img/game1.png" alt=""><span><small class="mono">MINI GAME</small><b>${esc(t("throwTitle"))}</b><em>${esc(t("throwOpen"))} ↗</em></span>
</button>`;
  return `<section class="card throw-card" aria-label="${esc(t("throwTitle"))}">
    <div class="throw-heading"><div><p class="mono sub">// MINI GAME</p><h2 class="px">${esc(t("throwTitle"))}</h2><p class="sub">${esc(t("throwHint"))}</p></div><div class="throw-heading-actions"><button class="btn b2 throw-reset" type="button" data-a="throwReset">${esc(t("throwReset"))}</button><button class="btn b2 throw-reset" type="button" data-a="throwClose">${esc(t("throwClose"))}</button></div></div>
    <div class="throw-score"><div class="throw-player${THROW_GAME.turn == 0 && !ended ? " active" : ""}"><img src="./img/pet/mini_${genders[0] == "m" ? "boy" : "girl"}.png" alt=""><span>${esc(names[0])}</span><b>${Math.max(0, THROW_GAME.hp[0])}%</b></div><div class="throw-player${THROW_GAME.turn == 1 && !ended ? " active" : ""}"><img src="./img/pet/mini_${genders[1] == "m" ? "boy" : "girl"}.png" alt=""><span>${esc(names[1])}</span><b>${Math.max(0, THROW_GAME.hp[1])}%</b></div></div>
    <p class="throw-status" role="status">${esc(ended ? t("throwWin").replace("{name}", names[THROW_GAME.hp[0] <= 0 ? 0 : 1]) : THROW_GAME.message || t("throwTurn").replace("{name}", names[THROW_GAME.turn]))}</p>
    <div class="throw-arena" data-throw-arena>
      <canvas class="throw-canvas" data-throw-canvas width="640" height="360"></canvas>
      <img class="throw-target throw-target-left" data-throw-target="0" src="./img/pet/${genders[0] == "m" ? "boy" : "girl"}.png" alt="${esc(names[0])}">
      <img class="throw-target throw-target-right" data-throw-target="1" src="./img/pet/${genders[1] == "m" ? "boy" : "girl"}.png" alt="${esc(names[1])}">
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

// ===== Game ném chảo: kéo chuột ngắm theo quỹ đạo cong =====
// Gọi initThrowGame(onHit) sau khi HTML của vGame() đã được gắn vào trang.
const THROW = {
  G: 0.45, // trọng lực
  MAX_PULL: 160, // kéo tối đa (px trên canvas)
  POWER_K: 0.16, // hệ số lực ném
  MIN_POWER: 0.08,
  PAN: 44,
  CHAR: 80,
  img: null,
  drag: null,
  flight: null,
  cvs: null,
  bound: false,
};

function initThrowGame(onHit) {
  const arena = document.querySelector("[data-throw-arena]");
  if (!arena) return;
  const cvs = arena.querySelector("[data-throw-canvas]");
  const ctx = cvs.getContext("2d");
  const W = cvs.width,
    H = cvs.height;
  const GROUND = H * 0.83;
  const { CHAR, PAN } = THROW;

  if (!THROW.img) {
    THROW.img = new Image();
    THROW.img.src = "./img/throw/frying_pan.png";
  }

  const turn = THROW_GAME.turn;
  // Người 0 đứng bên trái, người 1 đứng bên phải
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

  const drawPan = (x, y, rot) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    if (THROW.img.complete && THROW.img.naturalWidth) {
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(THROW.img, -PAN / 2, -PAN / 2, PAN, PAN);
    } else {
      ctx.fillStyle = "#222";
      ctx.beginPath();
      ctx.arc(0, 0, PAN / 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  };

  const render = () => {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = "#3a4a2e";
    ctx.fillRect(0, GROUND, W, H - GROUND);

    const v = THROW.drag ? launchVec() : null;

    if (THROW.flight) {
      drawPan(THROW.flight.x, THROW.flight.y, THROW.flight.rot);
    } else {
      if (v) {
        const endX = start.x + v.vx * 18,
          endY = start.y + v.vy * 18,
          length = Math.hypot(endX - start.x, endY - start.y),
          dots = Math.max(2, Math.floor(length / 12));
        ctx.save();
        // Dragging backward stores the pull vector; aim in its opposite direction,
        // matching launchVec() and the actual projectile velocity.
        ctx.fillStyle = "#b36bff";
        ctx.shadowColor = "rgba(179, 107, 255, .55)";
        ctx.shadowBlur = 5;
        for (let i = 0; i <= dots; i++) {
          const progress = i / dots;
          ctx.beginPath();
          ctx.arc(
            start.x + (endX - start.x) * progress,
            start.y + (endY - start.y) * progress,
            3.2,
            0,
            Math.PI * 2,
          );
          ctx.fill();
        }
        ctx.restore();
      }
      drawPan(start.x, start.y, 0);
    }

    const pw = v ? v.power : 0;
    const bar = arena.querySelector("[data-throw-power]");
    const lbl = arena.querySelector("[data-throw-power-label]");
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
      onHit && onHit({ hit: true, power: f.power, to: 1 - turn });
      return;
    }
    if (f.y > GROUND || f.x < -PAN || f.x > W + PAN) {
      THROW.flight = null;
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
      if (THROW.flight) return;
      const p = toCanvas(e);
      THROW.drag = { sx: p.x, sy: p.y, x: p.x, y: p.y };
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
      if (!v || v.power < THROW.MIN_POWER) return;
      const s = spot(THROW_GAME.turn);
      THROW.flight = {
        x: s.x,
        y: s.y,
        vx: v.vx,
        vy: v.vy,
        power: v.power,
        rot: 0,
      };
    };
    cvs.addEventListener("pointerup", release);
    cvs.addEventListener("pointercancel", () => {
      THROW.drag = null;
    });
  }

  loop();
}

/* CSS gợi ý:
.throw-arena{position:relative}
.throw-canvas{width:100%;height:auto;display:block;touch-action:none;cursor:grab}
.throw-canvas:active{cursor:grabbing}
*/
