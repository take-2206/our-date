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
          cols = innerWidth < 600 ? 1 : innerWidth < 900 ? 2 : 4,
          x = Number.isFinite(n.x) ? n.x : (i % cols + 0.5) / cols,
          y = Number.isFinite(n.y) ? n.y : Math.min(0.18 + Math.floor(i / cols) * 0.32, 0.82),
          width = clamp(parseFloat(n.width) || 220, 180, 480),
          height = clamp(parseFloat(n.height) || 190, 150, 420);
        return `<article class="sticky ${color}" style="--x:${x * 100}%;--y:${y * 100}%;--tilt:${tilt}deg;--note-w:${width}px;--note-h:${height}px" data-note-id="${n.id}"><button class="note-drag" type="button" data-note-drag="${n.id}" aria-label="${t('dropNote')}"></button><textarea class="sticky-inline" data-note-body data-id="${n.id}" maxlength="500" aria-label="${t('editNote')}">${esc(n.body)}</textarea><footer class="sticky-foot">${av(author.gender || 'f', 28)}<span class="who"><b>${esc(author.name || t('you'))}</b><br>${new Date(n.updated).toLocaleDateString(loc(), { month: 'short', day: 'numeric' })}</span><button class="mini" data-a="noteDel" data-id="${n.id}" aria-label="${t('deleteNote')}">×</button></footer><button class="note-resize" type="button" data-note-resize="${n.id}" aria-label="Resize note"></button></article>`;
      };
      // Bảng ghi chú được đồng bộ theo thời gian thực cho cả hai người
      function vNotes() {
        const h = head(t('notes'), t('board'));
        if (noteError) return `<div class="main">${h}<div class="card note-error">${t('noteSetup')}</div></div>`;
        const colors = ['yellow', 'pink', 'cyan', 'lilac'],
          piles = `<section class="card note-tray"><div class="note-tray-head"><b>${t('dragNote')}</b><span class="sub mono">// drag + drop</span></div><div class="note-piles">${colors.map((c) => `<button class="note-stack ${c}" type="button" data-note-color="${c}" aria-label="${t('addNote')}: ${c}"><i></i><i></i><i></i><span>${c}</span></button>`).join('')}</div></section>`,
          cols = innerWidth < 600 ? 1 : innerWidth < 900 ? 2 : 4,
          rows = Math.max(2, Math.ceil((C.notes.length + (noteDraft ? 1 : 0)) / cols)),
          draft = noteDraft
            ? `<form class="sticky sticky-draft ${noteDraft.color}" style="--x:${noteDraft.x * 100}%;--y:${noteDraft.y * 100}%;--tilt:0deg" data-f="note"><textarea class="sticky-inline" name="body" maxlength="500" required placeholder="${t('notePlaceholder')}"></textarea><footer class="sticky-foot"><button type="button" class="mini" data-a="noteDraftCancel">${t('cancel')}</button><button class="mini">${t('save')}</button></footer></form>`
            : '',
          board = `<div class="note-board" data-note-board data-hint="${t('dropNote')}" style="min-height:${Math.max(560, rows * 230)}px">${C.notes.map(noteCard).join('')}${draft}</div>`;
        return `<div class="main">${h}${piles}${board}</div>`;
      }
      // Màn cài đặt: hồ sơ, tài khoản, công tắc thông báo, đăng xuất
