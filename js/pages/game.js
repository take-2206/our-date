// Shared, online two-player Tic Tac Toe page.
const TTT_WINS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

function tttWinningLine(board) {
  return TTT_WINS.find(([a, b, c]) => board[a] && board[a] == board[b] && board[a] == board[c]) || [];
}

function vGame() {
  const line = TTT.winLine || [],
    finished = !!TTT.winner || TTT.draw,
    profileX = (TTT.playerX && P[TTT.playerX]) || {},
    profileO = (TTT.playerO && P[TTT.playerO]) || {},
    playerX = profileX.name || (TTT.playerX == S.user?.id ? S.user.name : 'X'),
    playerO = profileO.name || (TTT.playerO == S.user?.id ? S.user.name : 'O'),
    playerXGender = profileX.gender || (TTT.playerX == S.user?.id ? me() : pr()),
    playerOGender = profileO.gender || (TTT.playerO == S.user?.id ? me() : pr()),
    myTurn = !!S.user && S.user.id == (TTT.turn == 'X' ? TTT.playerX : TTT.playerO),
    status = !TTT.playerO
      ? t('gameWaitPartner')
      : TTT.winner
        ? t('gameWin').replace('{name}', TTT.winner == 'X' ? playerX : playerO)
        : TTT.draw
          ? t('gameDraw')
          : myTurn
            ? t('gameYourTurn')
            : t('gameTurn').replace('{name}', TTT.turn == 'X' ? playerX : playerO);
  return `<div class="main">${head(t('game'), t('gameSub'))}
    ${!TTT.ready ? `<section class="card ttt-card ttt-setup"><h2>${t('gameSetup')}</h2><p class="sub">${esc(TTT.error || '')}</p></section>` : `<section class="card ttt-card" aria-label="${t('game')}">
      <div class="ttt-scoreboard" aria-label="${t('gameScore')}" aria-live="polite">
        <div class="ttt-score-player${TTT.turn == 'X' && !finished ? ' active' : ''}"><img class="ttt-mark ttt-x" src="./img/pet/mini_${playerXGender == 'm' ? 'boy' : 'girl'}.png" alt=""><span class="ttt-player-name">${esc(playerX)}</span><b>${Number(TTT.scores?.X) || 0}</b></div>
        <div class="ttt-score-draw"><span>${t('gameDraws')}</span><b>${Number(TTT.scores?.draws) || 0}</b></div>
        <div class="ttt-score-player${TTT.turn == 'O' && !finished ? ' active' : ''}"><img class="ttt-mark ttt-o" src="./img/pet/mini_${playerOGender == 'm' ? 'boy' : 'girl'}.png" alt=""><span class="ttt-player-name">${esc(playerO)}</span><b>${Number(TTT.scores?.O) || 0}</b></div>
      </div>
      <p class="ttt-status" role="status" aria-live="polite">${esc(status)}</p>
      <div class="ttt-board" role="group" aria-label="${t('game')}">${TTT.board.map((mark, index) => `<button class="ttt-cell${mark ? ` ttt-${mark.toLowerCase()}` : ''}${line.includes(index) ? ' win' : ''}" type="button" data-a="tttMove" data-i="${index}" aria-label="${t('gameCell').replace('{n}', index + 1)}${mark ? `: ${mark}` : ''}"${mark || finished || !myTurn || TTT.busy || !TTT.playerO ? ' disabled' : ''}>${mark ? `<img class="ttt-token" src="./img/pet/mini_${(mark == 'X' ? playerXGender : playerOGender) == 'm' ? 'boy' : 'girl'}.png" alt="">` : ''}</button>`).join('')}</div>
      <div class="ttt-actions"><button class="btn b1" type="button" data-a="tttNewRound"${TTT.busy || !TTT.playerO ? ' disabled' : ''}>${t('gameNewRound')}</button><button class="btn b2" type="button" data-a="tttResetScore"${TTT.busy || !TTT.playerO ? ' disabled' : ''}>${t('gameResetScore')}</button></div>
    </section>`}
  </div>`;
}
