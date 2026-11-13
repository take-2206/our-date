// LoveSync interactions module. Classic scripts share state declared in js/core.js.
/* ===== 6. SỰ KIỆN: dùng "uỷ quyền" — chỉ cần một bộ lắng nghe cho cả trang ===== */
      const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
      function noteGhost(color, body = '', width = 220, height = 190) {
        const ghost = document.createElement('div');
        ghost.className = `sticky drag-ghost ${color}`;
        ghost.innerHTML = `<p class="sticky-body">${esc(body)}</p>`;
        ghost.style.width = width + 'px';
        ghost.style.height = height + 'px';
        document.body.append(ghost);
        return ghost;
      }
      function moveNoteGhost(e) {
        if (!noteDrag) return;
        noteDrag.ghost.style.left = e.clientX - noteDrag.dx + 'px';
        noteDrag.ghost.style.top = e.clientY - noteDrag.dy + 'px';
        const board = document.querySelector('[data-note-board]');
        if (board) {
          const rect = board.getBoundingClientRect(),
            scale = rect.width / board.clientWidth || 1,
            logicalY = (e.clientY - rect.top) / scale;
          if (e.clientX >= rect.left && e.clientX <= rect.right && logicalY > board.clientHeight - 160)
            growNoteBoard(board, logicalY + 360);
        }
        if (e.clientY > innerHeight - 70) scrollBy(0, 14);
        else if (e.clientY < 70) scrollBy(0, -14);
      }
      function growNoteBoard(board, requiredHeight) {
        const current = board.clientHeight;
        if (requiredHeight <= current) return;
        const height = Math.ceil(requiredHeight / 400) * 400,
          rect = board.getBoundingClientRect(),
          scale = rect.width / board.clientWidth || 1,
          viewport = board.closest('.note-board-viewport');
        board.style.minHeight = height + 'px';
        if (viewport) viewport.style.height = Math.ceil(height * scale) + 'px';
      }
      function startNoteDrag(e) {
        const pile = e.target.closest('[data-note-color]'),
          handle = e.target.closest('[data-note-drag]');
        if (!pile && !handle) return false;
        e.preventDefault();
        if (pile) {
          const color = pile.dataset.noteColor;
          noteDrag = { kind: 'new', color, ghost: noteGhost(color), dx: 0, dy: 0 };
        } else {
          const n = C.notes.find((x) => String(x.id) == String(handle.dataset.noteDrag));
          if (!n) return false;
          const card = handle.closest('.sticky'),
            r = card.getBoundingClientRect();
          noteDrag = {
            kind: 'move',
            note: n,
            ghost: noteGhost(n.color, n.body, r.width, r.height),
            width: card.offsetWidth,
            height: card.offsetHeight,
            dx: e.clientX - (r.left + r.width / 2),
            dy: e.clientY - (r.top + r.height / 2),
          };
        }
        document.body.classList.add('note-dragging');
        moveNoteGhost(e);
        return true;
      }
      function finishNoteDrag(e) {
        if (!noteDrag) return;
        const drag = noteDrag,
          board = document.querySelector('[data-note-board]');
        noteDrag = null;
        drag.ghost.remove();
        document.body.classList.remove('note-dragging');
        if (!board) return;
        const r = board.getBoundingClientRect(),
          boardScale = r.width / board.clientWidth || 1;
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
        const padX = Math.min((drag.width || 220) / 2 / board.clientWidth, 0.45),
          centerX = e.clientX - drag.dx,
          centerY = e.clientY - drag.dy,
          x = clamp((centerX - r.left) / r.width, padX, 1 - padX),
          yPx = clamp((centerY - r.top) / boardScale, (drag.height || 190) / 2 + 12, board.clientHeight - (drag.height || 190) / 2 - 12);
        if (drag.kind == 'new') {
          noteDraft = { color: drag.color, x, yPx };
          render();
          requestAnimationFrame(() => document.querySelector('.sticky-draft textarea')?.focus());
        } else {
          Object.assign(drag.note, { x, yPx });
          sb.from('notes')
            .update({ pos_x: x, pos_y_px: yPx })
            .eq('id', drag.note.id)
            .then(({ error }) => (error ? say(error.message) : refresh()));
          render();
        }
      }
      function startNoteResize(e) {
        const handle = e.target.closest('[data-note-resize]');
        if (!handle) return false;
        const note = C.notes.find((n) => String(n.id) == String(handle.dataset.noteResize)),
          card = handle.closest('.sticky'),
          board = card && card.closest('[data-note-board]');
        if (!note || !card || !board) return false;
        e.preventDefault();
        card.classList.add('is-resizing');
        document.body.classList.add('note-resizing');
        card.style.width = card.offsetWidth + 'px';
        card.style.height = card.offsetHeight + 'px';
        noteResize = {
          pointerId: e.pointerId,
          note,
          card,
          handle,
          board,
          startX: e.clientX,
          startY: e.clientY,
          startWidth: card.offsetWidth,
          startHeight: card.offsetHeight,
          startCenterX: card.offsetLeft,
          startCenterY: card.offsetTop,
        };
        return true;
      }
      function moveNoteResize(e) {
        if (!noteResize || e.pointerId != noteResize.pointerId) return;
        e.preventDefault();
        const z = noteResize,
          boardRect = z.board.getBoundingClientRect(),
          boardScale = boardRect.width / z.board.clientWidth || 1,
          maxWidth = Math.min(480, z.board.clientWidth - 24),
          maxHeight = Math.min(420, z.board.clientHeight - 24),
          width = clamp(z.startWidth + (e.clientX - z.startX) / boardScale, Math.min(180, maxWidth), maxWidth),
          height = clamp(z.startHeight + (e.clientY - z.startY) / boardScale, Math.min(150, maxHeight), maxHeight),
          centerX = clamp(z.startCenterX + (width - z.startWidth) / 2, width / 2 + 12, z.board.clientWidth - width / 2 - 12),
          centerY = clamp(z.startCenterY + (height - z.startHeight) / 2, height / 2 + 12, z.board.clientHeight - height / 2 - 12);
        z.card.style.width = width + 'px';
        z.card.style.height = height + 'px';
        z.card.style.left = centerX + 'px';
        z.card.style.top = centerY + 'px';
      }
      function finishNoteResize(e) {
        if (!noteResize || (e && e.pointerId != noteResize.pointerId)) return;
        const z = noteResize,
          width = Math.round(z.card.offsetWidth),
          height = Math.round(z.card.offsetHeight),
          x = z.card.offsetLeft / z.board.clientWidth,
          yPx = z.card.offsetTop;
        noteResize = null;
        z.card.classList.remove('is-resizing');
        document.body.classList.remove('note-resizing');
        Object.assign(z.note, { width: width + 'px', height: height + 'px', x, yPx });
        sb.from('notes')
          .update({ width: width + 'px', height: height + 'px', pos_x: x, pos_y_px: yPx })
          .eq('id', z.note.id)
          .then(({ error }) => error && say(error.message));
      }
      const pickerInput = (el) =>
        el.matches('input[type="date"][data-calendar], input[type="time"][data-clock]');
      document.addEventListener('pointerdown', (e) => {
        if (startNoteResize(e)) return;
        startNoteDrag(e);
      });
      window.addEventListener(
        'pointermove',
        (e) => {
          if (noteResize) {
            moveNoteResize(e);
            return;
          }
          if (!noteDrag) return;
          e.preventDefault();
          moveNoteGhost(e);
        },
        { passive: false },
      );
      window.addEventListener('pointerup', (e) => {
        finishNoteResize(e);
        finishNoteDrag(e);
      });
      window.addEventListener('pointercancel', (e) => {
        finishNoteResize(e);
        finishNoteDrag(e);
      });
      document.addEventListener('input', (e) => {
        if (e.target.matches('[data-note-body], [data-note-editor]')) startLocalNoteTyping(e.target.dataset.id);
      });
      document.addEventListener('focusout', (e) => {
        if (e.target.matches('[data-note-body], [data-note-editor]')) stopLocalNoteTyping(e.target.dataset.id);
      });
      document.addEventListener('click', (e) => {
        if (pickerInput(e.target)) return;
        const el = e.target.closest('[data-a]'),
          wasBell = bell;
        if (bell && !e.target.closest('.pop,[data-a=bell]')) bell = false;
        if (!el || el.matches('input')) {
          if (wasBell && !bell) render();
          return;
        }
        act(el.dataset.a, el.dataset, el);
      });
      document.addEventListener('change', (e) => {
        if (e.target.matches('input[data-a]')) act(e.target.dataset.a, e.target.dataset, e.target);
        if (e.target.matches('[data-photo-cap]')) {
          const p = C.photos.find((x) => String(x.id) == String(e.target.dataset.id)),
            cap = e.target.value.trim();
          if (!p) return;
          p.cap = cap;
          sb.from('photos')
            .update({ caption: cap })
            .eq('id', p.id)
            .then(({ error }) => (error ? say(error.message) : refresh()));
          return;
        }
        if (e.target.matches('[data-photo-date], [data-photo-place]')) {
          const p = C.photos.find((x) => String(x.id) == String(e.target.dataset.id)),
            isDate = e.target.matches('[data-photo-date]'),
            val = e.target.value.trim();
          if (!p) return;
          if (isDate && !/^\d{4}-\d{2}-\d{2}$/.test(val)) {
            e.target.value = p.date;
            return;
          }
          if (isDate) {
            p.date = val;
            if (pvDay) pvDay = val;
            C.photos.sort((a, b) => b.date.localeCompare(a.date) || b.ts - a.ts);
          } else p.place = val.slice(0, 60);
          sb.from('photos')
            .update(isDate ? { taken_on: val } : { place: val.slice(0, 60) })
            .eq('id', p.id)
            .then(({ error }) => (error ? say(/taken_on|place/.test(error.message) ? t('phMigrate') : error.message) : refresh()));
          return;
        }
        if (e.target.matches('[data-note-body]')) {
          const n = C.notes.find((x) => String(x.id) == String(e.target.dataset.id)),
            body = e.target.value.trim();
          if (!n) return;
          if (!body) {
            e.target.value = n.body;
            return;
          }
          n.body = body;
          n.updated = Date.now();
          pendingNoteSave = sb.from('notes')
            .update({ body, updated_at: new Date().toISOString() })
            .eq('id', n.id)
            .then(({ error }) => (error ? say(error.message) : refresh()));
        }
      });
      // Gửi form: auth = đăng nhập/đăng ký, ev = thêm buổi hẹn, todo = thêm việc cần làm
      document.addEventListener('submit', (e) => {
        e.preventDefault();
        const f = e.target,
          k = f.dataset.f,
          v = Object.fromEntries(new FormData(f));
        if (k == 'auth') {
          doAuth(f, v);
          return;
        } else if (k == 'ev') {
          if (modal == 'edit') {
            const target = C.ev.find((x) => x.id == open),
              changes = {
                title: v.title.trim(),
                date: v.date,
                time: v.time || '00:00',
                place: v.place.trim(),
              };
            if (!target) return;
            Object.assign(target, changes);
            sel = changes.date;
            const p = parse(changes.date);
            cur = new Date(p.getFullYear(), p.getMonth(), 1);
            modal = false;
            sb.from('events')
              .update(changes)
              .eq('id', target.id)
              .then(({ error }) => (error ? say(error.message) : refresh()));
            render();
            return;
          }
          const sd = !!v.send,
            row = {
              couple_id: S.user.couple_id,
              title: v.title,
              date: v.date,
              time: v.time || '00:00',
              place: v.place || '—',
              status: sd ? 'pending' : 'ok',
            };
          sb.from('events')
            .insert(row)
            .select()
            .single()
            .then(async ({ data, error }) => {
              if (error) return say(error.message);
              if (sd)
                await sb
                  .from('notifs')
                  .insert({
                    couple_id: S.user.couple_id,
                    event_id: data.id,
                    kind: 'new',
                    read_by: [S.user.id],
                  });
              refresh();
            });
          sel = v.date;
          cur = new Date(parse(v.date).getFullYear(), parse(v.date).getMonth(), 1);
          modal = false;
        } else if (k == 'since') {
          if (!v.since) return;
          C.since = v.since;
          smod = false;
          try {
            localStorage.setItem('ls_since_' + S.user.couple_id, v.since);
          } catch (x) {}
          sb.from('couples')
            .update({ start_date: v.since })
            .eq('id', S.user.couple_id)
            .select('id')
            .then(({ data, error }) => {
              if (error || !data || !data.length) say(t('dcLocal'));
            });
        } else if (k == 'prof') {
          const nm = (v.name || '').trim(),
            g = v.gender == 'm' ? 'm' : 'f';
          if (!nm) return;
          S.user.name = nm;
          S.user.gender = g;
          if (P[S.user.id]) P[S.user.id] = { ...P[S.user.id], name: nm, gender: g };
          pmod = false;
          sb.from('profiles')
            .update({ name: nm, gender: g })
            .eq('id', S.user.id)
            .select('id')
            .then(async ({ data, error }) => {
              await refresh();
              if (error || !data || !data.length) say(error ? error.message : t('pfFail'));
            });
        } else if (k == 'note') {
          const body = (v.body || '').trim(),
            draft = noteDraft;
          if (!body || !draft) return;
          noteDraft = null;
          sb.from('notes')
            .insert({
              couple_id: S.user.couple_id,
              body,
              color: draft.color,
              pos_x: draft.x,
              pos_y_px: draft.yPx,
            })
            .select()
            .single()
            .then(({ data, error }) => {
              if (error) {
                noteDraft = draft;
                say(error.message);
                return;
              }
              C.notes.unshift(toNote(data));
              render();
            });
        } else if (k == 'photo') {
          const files = umod ? umod.files : [];
          if (!files.length) return;
          const al = (v.album || '').trim().slice(0, 30),
            cap = (v.caption || '').trim(),
            date = /^\d{4}-\d{2}-\d{2}$/.test(v.date || '') ? v.date : key(new Date()),
            place = (v.place || '').trim().slice(0, 60);
          closeUp();
          albumSel = al;
          albumFocus = date;
          upPhotos(files, al, cap, date, place);
        } else if (k == 'noteedit') {
          const n = C.notes.find((x) => String(x.id) == String(f.dataset.id)),
            body = (v.body || '').trim(),
            color = ['yellow', 'pink', 'cyan', 'lilac'].includes(v.color) ? v.color : 'pink';
          if (!n || !body) return;
          Object.assign(n, { body, color, updated: Date.now() });
          noteEdit = null;
          sb.from('notes')
            .update({ body, color, updated_at: new Date().toISOString() })
            .eq('id', n.id)
            .then(({ error }) => (error ? say(error.message) : refresh()));
        } else if (k == 'todoedit') {
          if (!v.t.trim()) return;
          const e = C.ev.find((x) => x.id == open),
            i = Number(f.dataset.i);
          if (!e || !e.todo[i]) return;
          e.todo[i].t = v.t.trim();
          todoEdit = null;
          sb.from('events')
            .update({ todo: e.todo })
            .eq('id', e.id)
            .then(() => {});
        } else if (k == 'todo') {
          if (!v.t.trim()) return;
          const e = C.ev.find((x) => x.id == open);
          e.todo.push({ t: v.t.trim(), d: 0 });
          sb.from('events')
            .update({ todo: e.todo })
            .eq('id', e.id)
            .then(() => {});
        }
        save();
        render();
      });
      // Ô chọn ảnh ẩn (đặt ngoài #app để không bị vẽ lại khi hộp thoại chọn file đang mở)
      const pin = document.createElement('input');
      pin.type = 'file';
      pin.accept = 'image/*';
      pin.multiple = true;
      pin.hidden = true;
      document.body.append(pin);
      pin.addEventListener('change', () => {
        const fs = [...pin.files].filter((f) => /^image\//.test(f.type) || /\.(heic|heif)$/i.test(f.name)).slice(0, 20);
        pin.value = '';
        if (!fs.length) return;
        closeUp();
        umod = { files: fs, urls: fs.slice(0, 4).map((f) => URL.createObjectURL(f)) };
        render();
      });
      function closeUp() {
        if (umod) umod.urls.forEach((u) => URL.revokeObjectURL(u));
        umod = null;
      }
      // Vuốt trái / phải khi xem ảnh
      let swX = null;
      document.addEventListener(
        'touchstart',
        (e) => {
          swX = pv != null && e.touches.length == 1 ? e.touches[0].clientX : null;
        },
        { passive: true },
      );
      document.addEventListener(
        'touchend',
        (e) => {
          if (swX == null || pv == null) return;
          const dx = e.changedTouches[0].clientX - swX;
          swX = null;
          if (Math.abs(dx) > 60) act('pvGo', { d: dx < 0 ? 1 : -1 }, document.body);
        },
        { passive: true },
      );
      // Phím Esc đóng mọi bảng đang mở
      document.addEventListener('keydown', (e) => {
        if (pv != null && !e.target.matches('input,textarea')) {
          if (e.key == 'ArrowLeft') return act('pvGo', { d: -1 }, document.body);
          if (e.key == 'ArrowRight') return act('pvGo', { d: 1 }, document.body);
        }
        if (e.key == 'Escape') {
          modal = false;
          pmod = false;
          smod = false;
          noteEdit = null;
          noteDraft = null;
          bell = false;
          closeLT();
          closeUp();
          pv = null;
          pvDay = null;
          render();
        }
      });
      // Thông báo nổi ở đầu màn hình: say("nội dung") hiện khoảng 4,5 giây
      let toast = '';
      const say = (m) => {
        toast = m;
        paintToast();
        clearTimeout(say.t);
        say.t = setTimeout(() => {
          toast = '';
          paintToast();
        }, 4500);
      };
