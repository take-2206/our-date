// LoveSync interactions module. Classic scripts share state declared in js/core.js.
/* ===== 6. SỰ KIỆN: dùng "uỷ quyền" — chỉ cần một bộ lắng nghe cho cả trang ===== */
      const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
      function noteGhost(color, body = '', width = 190, height = 165) {
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
        if (e.clientY > innerHeight - 70) scrollBy(0, 14);
        else if (e.clientY < 70) scrollBy(0, -14);
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
        const r = board.getBoundingClientRect();
        if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return;
        const padX = Math.min(110 / r.width, 0.45),
          padY = Math.min(95 / r.height, 0.45),
          centerX = e.clientX - drag.dx,
          centerY = e.clientY - drag.dy,
          x = clamp((centerX - r.left) / r.width, padX, 1 - padX),
          y = clamp((centerY - r.top) / r.height, padY, 1 - padY);
        if (drag.kind == 'new') {
          noteDraft = { color: drag.color, x, y };
          render();
          requestAnimationFrame(() => document.querySelector('.sticky-draft textarea')?.focus());
        } else {
          Object.assign(drag.note, { x, y });
          sb.from('notes')
            .update({ pos_x: x, pos_y: y })
            .eq('id', drag.note.id)
            .then(({ error }) => (error ? say(error.message) : refresh()));
          render();
        }
      }
      const pickerInput = (el) =>
        el.matches('input[type="date"][data-calendar], input[type="time"][data-clock]');
      document.addEventListener('pointerdown', (e) => {
        startNoteDrag(e);
      });
      document.addEventListener(
        'pointermove',
        (e) => {
          if (!noteDrag) return;
          e.preventDefault();
          moveNoteGhost(e);
        },
        { passive: false },
      );
      document.addEventListener('pointerup', finishNoteDrag);
      document.addEventListener('pointercancel', finishNoteDrag);
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
          sb.from('notes')
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
              pos_y: draft.y,
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
        render();
        clearTimeout(say.t);
        say.t = setTimeout(() => {
          toast = '';
          render();
        }, 4500);
      };
