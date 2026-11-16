// LoveSync actions module. Classic scripts share state declared in js/core.js.
/* ===== 5. HÀNH ĐỘNG ===== */
      /* act(tên, dữ liệu, phần tử) xử lý mọi nút có data-a="tên":
         go = đổi màn hình, lang = đổi ngôn ngữ, mode = tab đăng nhập/đăng ký, day = chọn ngày,
         mo = đổi tháng, ev = mở buổi hẹn, bell = bật/tắt chuông, new = mở form thêm,
         close = đóng form, out = đăng xuất, del = xoá buổi hẹn, tg = công tắc thông báo,
         chk = tick việc cần làm, nt = mở thông báo, read = đánh dấu đã đọc hết,
         acc / dec = đồng ý / từ chối, lclose = đóng lá thư */
      function act(a, d, el) {
        if (a == 'appUpdate') {
          applyAppUpdate();
          return;
        }
        if (a == 'close' && el.classList.contains('mod') && event.target !== el) return;
        if (a == 'lclose' && el.classList.contains('lt') && event.target !== el) return;
        if (a == 'pclose' && el.classList.contains('mod') && event.target !== el) return;
        if (a == 'sclose' && el.classList.contains('mod') && event.target !== el) return;
        if (a == 'uclose' && el.classList.contains('mod') && event.target !== el) return;
        if (a == 'go') {
          view = d.v;
          bell = false;
          if (view != 'notes') {
            stopLocalNoteTyping();
            noteEdit = null;
            noteDraft = null;
          }
          if (view == 'det') open = null;
        } else if (a == 'lang') {
          S.lang = d.l;
          save();
          pushResync();
        } else if (a == 'mode') {
          mode = d.m;
          msg = '';
        } else if (a == 'day') {
          sel = d.k;
          const p = parse(d.k);
          cur = new Date(p.getFullYear(), p.getMonth(), 1);
        } else if (a == 'mo') cur = new Date(cur.getFullYear(), cur.getMonth() + Number(d.n), 1);
        else if (a == 'ev') {
          open = Number(d.id);
          todoEdit = null;
          view = 'det';
        } else if (a == 'bell') bell = !bell;
        else if (a == 'nt') {
          const n = C.nt.find((x) => x.id == d.id);
          bell = false;
          if (n) {
            markRead(n);
            if (n.k) {
              if (n.k == 'ok' && C.ev.some((e) => e.id == n.evId)) {
                open = n.evId;
                view = 'det';
              }
            } else openLetter(n);
          }
        } else if (a == 'acc') answer(true);
        else if (a == 'dec') answer(false);
        else if (a == 'lclose') closeLT();
        else if (a == 'read') {
          mine().forEach((n) => markRead(n));
        } else if (a == 'sedit') smod = true;
        else if (a == 'sclose') smod = false;
        else if (a == 'pedit') pmod = true;
        else if (a == 'pclose') pmod = false;
        else if (a == 'noteEdit') {
          noteEdit = d.id;
          requestAnimationFrame(() => document.querySelector('[data-note-editor]')?.focus());
        }
        else if (a == 'noteCancel') noteEdit = null;
        else if (a == 'noteDraftCancel') noteDraft = null;
        else if (a == 'noteDel') {
          const n = C.notes.find((x) => String(x.id) == String(d.id));
          if (!n) return;
          C.notes = C.notes.filter((x) => String(x.id) != String(d.id));
          noteEdit = null;
          sb.from('notes')
            .update({ deleted_at: new Date().toISOString(), deleted_by: S.user.id })
            .eq('id', n.id)
            .then(({ error }) => (error ? say(error.message) : refresh()));
        }
        else if (a == 'pick') {
          pin.value = '';
          pin.click();
          return;
        } else if (a == 'albumSel') albumSel = d.al || '';
        else if (a == 'pv') {
          pvDay = null;
          pv = Number(d.id);
        } else if (a == 'pvDay') {
          pvDay = d.k;
          pv = Number(d.id);
        } else if (a == 'goAlbum') {
          albumSel = '';
          albumFocus = d.k;
          bell = false;
          view = 'album';
        } else if (a == 'pvClose') {
          pv = null;
          pvDay = null;
        } else if (a == 'pvGo') {
          const l = pvList(),
            i = l.findIndex((p) => p.id == pv),
            nx = l[i + Number(d.d)];
          if (nx) pv = nx.id;
        } else if (a == 'uclose') closeUp();
        else if (a == 'phDel') {
          const p = C.photos.find((x) => String(x.id) == String(d.id));
          if (!p || !confirm(t('phDelQ'))) return;
          const l = pvList(),
            i = l.findIndex((x) => x.id == p.id),
            nx = l[i + 1] || l[i - 1];
          C.photos = C.photos.filter((x) => x.id != p.id);
          pv = nx ? nx.id : null;
          if (!nx) pvDay = null;
          sb.from('photos')
            .update({ deleted_at: new Date().toISOString(), deleted_by: S.user.id })
            .eq('id', p.id)
            .then(({ error }) => {
              if (error) {
                say(error.message);
                refresh();
                return;
              }
              refresh();
            });
        }
        else if (a == 'trashRestore') {
          const table = { event: 'events', note: 'notes', photo: 'photos' }[d.kind];
          if (!table) return;
          sb.from(table)
            .update({ deleted_at: null, deleted_by: null })
            .eq('id', d.id)
            .then(({ error }) => (error ? say(error.message) : refresh()));
          return;
        }
        else if (a == 'trashPermanent') {
          const table = { event: 'events', note: 'notes', photo: 'photos' }[d.kind];
          if (!table || !confirm(t('trashDeleteQ'))) return;
          const photo = d.kind == 'photo' ? (C.trash?.photos || []).find((item) => String(item.id) == String(d.id)) : null;
          sb.from(table)
            .delete()
            .eq('id', d.id)
            .then(async ({ error }) => {
              if (error) return say(error.message);
              if (photo) await sb.storage.from('photos').remove([photo.path]);
              refresh();
            });
          return;
        }
        else if (a == 'new') modal = 'new';
        else if (a == 'edit') modal = 'edit';
        else if (a == 'todoEdit') todoEdit = Number(d.i);
        else if (a == 'todoCancel') todoEdit = null;
        else if (a == 'todoDel') {
          const e = C.ev.find((x) => x.id == open);
          if (!e || !e.todo[d.i]) return;
          e.todo.splice(Number(d.i), 1);
          todoEdit = null;
          sb.from('events')
            .update({ todo: e.todo })
            .eq('id', e.id)
            .then(() => {});
        } else if (a == 'close') modal = false;
        else if (a == 'out') {
          if (sb) {
            pushDetach().then(() => sb.auth.signOut());
            if (CH) sb.removeChannel(CH);
          }
          S.user = null;
          C = { ev: [], nt: [], notes: [], photos: [], trash: { ev: [], notes: [], photos: [] } };
          P = {};
          PU = {};
          pv = null;
          pvDay = null;
          albumSel = '';
          closeUp();
          view = 'auth';
          msg = '';
        } else if (a == 'del') {
          const id = open;
          C.ev = C.ev.filter((e) => e.id != id);
          sb.from('events')
            .update({ deleted_at: new Date().toISOString(), deleted_by: S.user.id })
            .eq('id', id)
            .then(({ error }) => (error ? say(error.message) : refresh()));
          open = null;
          view = 'det';
        } else if (a == 'pushTog') {
          if (el.checked) pushEnable();
          else pushDisable();
          return;
        } else if (a == 'tg') {
          S.n[d.i] = el.checked ? 1 : 0;
          save();
          pushResync();
          return;
        } else if (a == 'chk') {
          const e = C.ev.find((x) => x.id == open),
            o = e.todo[d.i];
          o.d = o.d ? 0 : 1;
          sb.from('events')
            .update({ todo: e.todo })
            .eq('id', e.id)
            .then(() => {});
        } else return;
        render();
      }
