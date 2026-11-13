// LoveSync notes module. Classic scripts share state declared in js/core.js.
const noteColors = (selected = 'pink') =>
        `<fieldset class="note-colors"><legend>${t('noteColor')}</legend>${['yellow', 'pink', 'cyan', 'lilac']
          .map(
            (c) =>
              `<label class="note-color" data-c="${c}" aria-label="${c}"><input type="radio" name="color" value="${c}" ${c == selected ? 'checked' : ''}></label>`,
          )
          .join('')}</fieldset>`;
      const noteCard = (n, i) => {
        const color = ['yellow', 'pink', 'cyan', 'lilac'].includes(n.color) ? n.color : 'pink',
          tilt = [-1.4, 1.1, -0.7, 1.5][i % 4],
          author = P[n.by] || {},
          cols = innerWidth < 600 ? 4 : innerWidth < 900 ? 2 : 4,
          layoutRows = Math.max(2, Math.ceil(C.notes.length / cols)),
          baseHeight = Math.max(560, layoutRows * 230),
          x = Number.isFinite(n.x) ? n.x : (i % cols + 0.5) / cols,
          y = Number.isFinite(n.y) ? n.y : (Math.floor(i / cols) + 0.5) / layoutRows,
          yPx = Number.isFinite(n.yPx) ? n.yPx : y * baseHeight,
          width = clamp(parseFloat(n.width) || 220, 180, 480),
          height = clamp(parseFloat(n.height) || 190, 150, 420),
          mobile = innerWidth < 600,
          typing = noteTypingText(n.id);
        return `<article class="sticky ${color}${typing ? ' partner-typing' : ''}" style="--x:${x * 100}%;--y:${yPx}px;--tilt:${tilt}deg;--note-w:${width}px;--note-h:${height}px" data-note-id="${n.id}"><button class="note-drag" type="button" data-note-drag="${n.id}" aria-label="${t('dropNote')}"></button><textarea class="sticky-inline" data-note-body data-id="${n.id}" maxlength="500" aria-label="${t('editNote')}"${mobile ? ` readonly data-a="noteEdit"` : ''}>${esc(n.body)}</textarea><span class="note-typing" data-note-typing="${n.id}" role="status"${typing ? '' : ' hidden'}>${esc(typing)}</span><footer class="sticky-foot">${av(author.gender || 'f', 28)}<span class="who"><b>${esc(author.name || t('you'))}</b><br>${new Date(n.updated).toLocaleDateString(loc(), { month: 'short', day: 'numeric' })}</span><button class="mini" data-a="noteDel" data-id="${n.id}" aria-label="${t('deleteNote')}">×</button></footer><button class="note-resize" type="button" data-note-resize="${n.id}" aria-label="${esc(t('resizeNote'))}"></button></article>`;
      };
      function vNoteEditor() {
        const n = C.notes.find((item) => String(item.id) == String(noteEdit));
        if (!n) return '';
        const color = ['yellow', 'pink', 'cyan', 'lilac'].includes(n.color) ? n.color : 'pink';
        return `<div class="mod note-focus"><form class="sticky sticky-edit ${color}" data-f="noteedit" data-id="${n.id}" role="dialog" aria-modal="true" aria-label="${t('editNote')}"><header class="note-focus-head"><b>${t('editNote')}</b><button type="button" class="ib" data-a="noteCancel" aria-label="${t('cancel')}">${I.x}</button></header><textarea class="in note-text note-focus-text" name="body" data-note-editor data-id="${n.id}" maxlength="500" required>${esc(n.body)}</textarea><div class="note-edit-foot">${noteColors(color)}<div class="note-focus-actions"><button type="button" class="btn b2 danger" data-a="noteDel" data-id="${n.id}">${t('deleteNote')}</button><button class="btn b1">${t('save')}</button></div></div></form></div>`;
      }
      // Bảng ghi chú được đồng bộ theo thời gian thực cho cả hai người
      function vNotes() {
        const h = head(t('notes'), t('board'));
        if (noteError) return `<div class="main">${h}<div class="card note-error">${t('noteSetup')}</div></div>`;
        const colors = ['yellow', 'pink', 'cyan', 'lilac'],
          piles = `<section class="card note-tray"><div class="note-tray-head"><b>${t('dragNote')}</b><span class="sub mono">// drag + drop</span></div><div class="note-piles">${colors.map((c) => `<button class="note-stack ${c}" type="button" data-note-color="${c}" aria-label="${t('addNote')}: ${c}"><i></i><i></i><i></i><span>${c}</span></button>`).join('')}</div></section>`,
          mobileBoard = innerWidth < 600,
          cols = mobileBoard ? 4 : innerWidth < 900 ? 2 : 4,
          rows = Math.max(2, Math.ceil((C.notes.length + (noteDraft ? 1 : 0)) / cols)),
          contentBottom = Math.max(
            C.notes.reduce((max, note) => {
              if (!Number.isFinite(note.yPx)) return max;
              const height = clamp(parseFloat(note.height) || 190, 150, 420);
              return Math.max(max, note.yPx + height / 2 + 180);
            }, 0),
            Number.isFinite(noteDraft?.yPx) ? noteDraft.yPx + 275 : 0,
          ),
          boardHeight = Math.max(560, rows * 230, Math.ceil(contentBottom / 400) * 400),
          boardWidth = 960,
          boardScale = mobileBoard ? Math.min(1, Math.max(280, document.documentElement.clientWidth - 40) / boardWidth) : 1,
          draft = noteDraft
            ? `<form class="sticky sticky-draft ${noteDraft.color}" style="--x:${noteDraft.x * 100}%;--y:${noteDraft.yPx}px;--tilt:0deg" data-f="note"><textarea class="sticky-inline" name="body" maxlength="500" required placeholder="${t('notePlaceholder')}"></textarea><footer class="sticky-foot"><button type="button" class="mini" data-a="noteDraftCancel">${t('cancel')}</button><button class="mini">${t('save')}</button></footer></form>`
            : '',
          board = mobileBoard
            ? `<div class="note-board-viewport" style="height:${Math.ceil(boardHeight * boardScale)}px"><div class="note-board mobile-board" data-note-board data-hint="${t('dropNote')}" style="width:${boardWidth}px;min-height:${boardHeight}px;transform:scale(${boardScale})">${C.notes.map(noteCard).join('')}${draft}</div></div>`
            : `<div class="note-board" data-note-board data-hint="${t('dropNote')}" style="min-height:${boardHeight}px">${C.notes.map(noteCard).join('')}${draft}</div>`;
        return `<div class="main">${h}${piles}${board}</div>${innerWidth < 600 && noteEdit != null ? vNoteEditor() : ''}`;
      }
      let noteBoardResizeTimer = null;
      addEventListener('resize', () => {
        if (view != 'notes' || document.activeElement?.closest('.sticky')) return;
        clearTimeout(noteBoardResizeTimer);
        noteBoardResizeTimer = setTimeout(render, 120);
      });
      // Màn cài đặt: hồ sơ, tài khoản, công tắc thông báo, đăng xuất
