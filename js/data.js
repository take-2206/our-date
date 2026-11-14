// LoveSync data module. Classic scripts share state declared in js/core.js.
/* ===== 7. SUPABASE: ĐỌC / GHI DỮ LIỆU ===== */
      // toE / toN: đổi dòng trong database sang dạng mà app dùng
      const toE = (e) => ({
        id: e.id,
        title: e.title,
        date: e.date,
        time: e.time || '',
        place: e.place || '',
        todo: e.todo || [],
        by: e.created_by,
        st: e.status,
        deletedAt: Date.parse(e.deleted_at) || 0,
      });
      const toN = (n) => ({
        id: n.id,
        evId: n.event_id,
        k: n.kind == 'new' ? undefined : n.kind,
        by: n.from_id,
        r: n.read_by || [],
        ts: Date.parse(n.created_at),
      });
      const toNote = (n) => ({
        id: n.id,
        body: n.body || '',
        color: n.color || 'pink',
        by: n.created_by,
        x: n.pos_x == null ? null : Number(n.pos_x),
        y: n.pos_y == null ? null : Number(n.pos_y),
        yPx: n.pos_y_px == null ? null : Number(n.pos_y_px),
        width: n.width || '220px',
        height: n.height || '190px',
        deletedAt: Date.parse(n.deleted_at) || 0,
        updated: Date.parse(n.updated_at || n.created_at) || Date.now(),
      });
      // Ảnh trong album: toPhoto đổi dòng database, shrink thu nhỏ ảnh, upPhotos tải lên Storage + ghi bảng photos
      const toPhoto = (p) => ({
        id: p.id,
        path: p.path,
        cap: p.caption || '',
        album: p.album || '',
        // Ngày chụp (taken_on) và địa điểm; ảnh cũ chưa có thì lấy ngày tải lên
        date: p.taken_on || key(new Date(Date.parse(p.created_at) || Date.now())),
        place: p.place || '',
        by: p.created_by,
        deletedAt: Date.parse(p.deleted_at) || 0,
        ts: Date.parse(p.created_at) || Date.now(),
      });
      // Bucket "photos" là riêng tư nên mỗi ảnh cần link ký sẵn (hiệu lực 1 giờ, tự làm mới khi sắp hết hạn)
      async function signPhotos() {
        const now = Date.now(),
          allPhotos = C.photos.concat(C.trash?.photos || []),
          need = allPhotos.filter((p) => !PU[p.path] || PU[p.path].exp < now + 300000).map((p) => p.path);
        if (!need.length) return;
        try {
          const { data } = await sb.storage.from('photos').createSignedUrls(need, 3600);
          (data || []).forEach((x) => {
            if (x.signedUrl) PU[x.path] = { url: x.signedUrl, exp: now + 3600000 };
          });
        } catch (x) {}
      }
      // Thu nhỏ ảnh về tối đa 1600px, nén JPEG ~82% để tiết kiệm dung lượng
      const shrink = (file, max = 1600, q = 0.82) =>
        new Promise((ok, no) => {
          const url = URL.createObjectURL(file),
            img = new Image();
          img.onload = () => {
            const r = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight)),
              c = document.createElement('canvas'),
              g = c.getContext('2d');
            c.width = Math.max(1, Math.round(img.naturalWidth * r));
            c.height = Math.max(1, Math.round(img.naturalHeight * r));
            g.fillStyle = '#fff';
            g.fillRect(0, 0, c.width, c.height);
            g.drawImage(img, 0, 0, c.width, c.height);
            URL.revokeObjectURL(url);
            c.toBlob((b) => (b ? ok(b) : no(new Error('toBlob'))), 'image/jpeg', q);
          };
          img.onerror = () => {
            URL.revokeObjectURL(url);
            no(new Error('decode'));
          };
          img.src = url;
        });
      async function upPhotos(files, album, caption, date, place) {
        upBusy = { n: 0, total: files.length };
        render();
        let fail = 0,
          why = '';
        for (const f of files) {
          try {
            const blob = await shrink(f),
              path = S.user.couple_id + '/' + Date.now() + '-' + Math.random().toString(36).slice(2, 8) + '.jpg',
              up = await sb.storage.from('photos').upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' });
            if (up.error) throw up.error;
            const ins = await sb
              .from('photos')
              .insert({ couple_id: S.user.couple_id, path, album, caption: files.length == 1 ? caption : '', taken_on: date, place });
            if (ins.error) {
              sb.storage.from('photos').remove([path]);
              throw ins.error;
            }
          } catch (x) {
            fail++;
            why = x.message || String(x);
          }
          upBusy.n++;
          render();
        }
        upBusy = null;
        await refresh();
        if (fail)
          say(
            t('phFail').replace('{n}', fail) +
              (/taken_on|place/.test(why) ? ' — ' + t('phMigrate') : why ? ' (' + why + ')' : ''),
          );
      }
      // Đánh dấu thông báo đã đọc (ghi vào mảng read_by)
      const markRead = (n) => {
        if (!isR(n)) {
          n.r = (n.r || []).concat(S.user.id);
          sb.from('notifs')
            .update({ read_by: n.r })
            .eq('id', n.id)
            .then(() => {});
        }
      };
      /* Đăng nhập bằng tên: Supabase cần email nên tên được đổi thành email ẩn,
         ví dụ "Lan Anh" -> lan.anh@lovesync.app (bỏ dấu, viết thường, khoảng trắng thành dấu chấm) */
      const slug = (n) =>
        n
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[đĐ]/g, 'd')
          .toLowerCase()
          .trim()
          .replace(/\s+/g, '.')
          .replace(/[^a-z0-9._-]/g, '');
      const toEmail = (n) => slug(n) + '@lovesync.app';
      // Đổi thông báo lỗi của Supabase sang câu dễ hiểu
      const em2 = (m) =>
        /invalid_code/.test(m)
          ? t('badCode')
          : /couple_full/.test(m)
            ? t('full')
            : /Invalid login/i.test(m)
              ? t('badLogin')
              : /not confirmed/i.test(m)
                ? t('noConf')
                : /already registered/i.test(m)
                  ? t('dup')
                  : m;
      // Tải buổi hẹn, thông báo, hồ sơ và ghi chú của cặp đôi (RLS tự lọc đúng cặp đôi của mình)
      let trashPurgeAt = 0;
      async function purgeExpiredTrash() {
        if (Date.now() - trashPurgeAt < 3600000) return;
        trashPurgeAt = Date.now();
        try {
          const { data, error } = await sb.rpc('purge_expired_recycle_bin');
          if (!error) {
            const paths = (data || []).map((row) => row.photo_path).filter(Boolean);
            if (paths.length) await sb.storage.from('photos').remove(paths);
          }
        } catch (x) {}
      }
      async function loadC() {
        await purgeExpiredTrash();
        loadLocalPet();
        const trashCutoff = new Date(Date.now() - 30 * 864e5).toISOString();
        let [ev, nt, pf, cp, notes, ph, trashEv, trashNotes, trashPhotos] = await Promise.all([
          sb.from('events').select('*').is('deleted_at', null).order('date'),
          sb.from('notifs').select('*').order('created_at', { ascending: false }).limit(50),
          sb.from('profiles').select('id,name,gender'),
          sb.from('couples').select('start_date').eq('id', S.user.couple_id).maybeSingle(),
          sb.from('notes').select('*').is('deleted_at', null).order('updated_at', { ascending: false }),
          sb.from('photos').select('*').is('deleted_at', null).order('created_at', { ascending: false }),
          sb.from('events').select('*').not('deleted_at', 'is', null).gte('deleted_at', trashCutoff).order('deleted_at', { ascending: false }),
          sb.from('notes').select('*').not('deleted_at', 'is', null).gte('deleted_at', trashCutoff).order('deleted_at', { ascending: false }),
          sb.from('photos').select('*').not('deleted_at', 'is', null).gte('deleted_at', trashCutoff).order('deleted_at', { ascending: false }),
        ]);
        const migrationError = [ev, notes, ph, trashEv, trashNotes, trashPhotos]
          .map((result) => result.error && result.error.message)
          .find((message) => message && /deleted_at|purge_expired_recycle_bin/i.test(message));
        trashError = migrationError || '';
        if (migrationError) {
          [ev, notes, ph] = await Promise.all([
            sb.from('events').select('*').order('date'),
            sb.from('notes').select('*').order('updated_at', { ascending: false }),
            sb.from('photos').select('*').order('created_at', { ascending: false }),
          ]);
          trashEv = trashNotes = trashPhotos = { data: [] };
        }
        let ls = '';
        try {
          ls = localStorage.getItem('ls_since_' + S.user.couple_id) || '';
        } catch (x) {}
        C.since = (!cp.error && cp.data && cp.data.start_date) || ls || '';
        P = {};
        (pf.data || []).forEach((x) => (P[x.id] = x));
        C.ev = (ev.data || []).map(toE);
        C.nt = (nt.data || []).map(toN);
        C.notes = (notes.data || []).map(toNote);
        C.trash = {
          ev: (trashEv.data || []).map(toE),
          notes: (trashNotes.data || []).map(toNote),
          photos: (trashPhotos.data || []).map(toPhoto),
        };
        noteError = notes.error ? notes.error.message : '';
        photoError = ph.error ? ph.error.message : '';
        C.photos = (ph.data || []).map(toPhoto).sort((a, b) => b.date.localeCompare(a.date) || b.ts - a.ts);
        await signPhotos();
        await loadPetReactions();
      }
      const petLocalKey = () => 'ls_pet_' + (S.user && S.user.couple_id || '');
      function loadLocalPet() {
        try {
          const local = JSON.parse(localStorage.getItem(petLocalKey()) || '{}');
          PET = { name: local.name || 'Mochi', reactions: local.reactions || [] };
        } catch (x) { PET = { name: 'Mochi', reactions: [] }; }
      }
      async function loadPetReactions() {
        try {
          const { data, error } = await sb.from('pet_reactions').select('id, emoji, sender_id, created_at').eq('couple_id', S.user.couple_id).order('created_at', { ascending: true }).limit(2);
          if (error) return;
          PET.reactions = (data || []).map((r) => ({ id: r.id, emoji: r.emoji, by: r.sender_id, byName: (P[r.sender_id] || {}).name || '', at: Date.parse(r.created_at) || Date.now() }));
        } catch (x) {}
      }
      async function sendPetReaction(emoji) {
        const reaction = { id: 'local-' + Date.now(), emoji, by: S.user.id, byName: S.user.name, at: Date.now() };
        PET.reactions = (PET.reactions || []).filter((r) => r.by != S.user.id).concat(reaction);
        render();
        try {
          const { error } = await sb.from('pet_reactions').upsert({ couple_id: S.user.couple_id, sender_id: S.user.id, emoji, created_at: new Date().toISOString() }, { onConflict: 'couple_id,sender_id' });
          if (error) throw error;
          localStorage.setItem(petLocalKey(), JSON.stringify({ name: PET.name, reactions: PET.reactions }));
        } catch (x) {
          localStorage.setItem(petLocalKey(), JSON.stringify({ name: PET.name, reactions: PET.reactions }));
          say('Bubble đã hiện trên máy này. Hãy chạy supabase-pet.sql để đồng bộ cho cả hai.');
        }
      }
      async function clearPetReaction() {
        PET.reactions = (PET.reactions || []).filter((r) => r.by != S.user.id);
        render();
        try {
          const { error } = await sb.from('pet_reactions').delete().eq('couple_id', S.user.couple_id).eq('sender_id', S.user.id);
          if (error) throw error;
          localStorage.setItem(petLocalKey(), JSON.stringify({ name: PET.name, reactions: PET.reactions }));
        } catch (x) {
          localStorage.setItem(petLocalKey(), JSON.stringify({ name: PET.name, reactions: PET.reactions }));
          say('Bubble đã ẩn ở máy này. Hãy chạy supabase-pet.sql để đồng bộ thao tác xóa.');
        }
      }
      function savePetName(name) {
        PET.name = name;
        localStorage.setItem(petLocalKey(), JSON.stringify({ name, reactions: PET.reactions || [] }));
        render();
      }
      // Tải lại dữ liệu rồi vẽ lại màn hình
      async function refresh() {
        if (!S.user) return;
        const ae = document.activeElement,
          activeNote = ae && ae.matches && ae.matches('[data-note-body]')
            ? { id: String(ae.dataset.id), body: ae.value }
            : null;
        await loadC();
        // Keep a live sticky-note editor in place. Replacing it here loses the cursor and unsaved text.
        if (activeNote && ae.isConnected && document.activeElement === ae) {
          const note = C.notes.find((item) => String(item.id) == activeNote.id);
          if (note) note.body = activeNote.body;
          return;
        }
        // Đang nhập / chọn ngày giờ trong form: đã tải dữ liệu mới nhưng chưa vẽ lại để không làm đóng bộ chọn
        if (ae && ae.matches && ae.matches('.mod input, .mod textarea')) return;
        render();
        if (LT) drawLT();
      }
      // Có thông báo mới từ người ấy -> tải lại và hiện toast
      async function onNotif(n) {
        await refresh();
        if (n.from_id != S.user.id && S.n[2]) {
          const x = C.nt.find((m) => m.id == n.id) || { k: n.kind == 'new' ? undefined : n.kind },
            e = C.ev.find((m) => m.id == n.event_id);
          say(((P[n.from_id] || {}).name || '') + ' ' + ntx(x) + (e ? ': ' + tx(e.title) : ''));
        }
      }
      async function onNoteInsert(change) {
        const note = change && change.new;
        await refresh();
        if (!note || !S.user || note.created_by == S.user.id) return;
        const name = (P[note.created_by] || {}).name || t('pt');
        const message = t('noteAdded').replace('{name}', name);
        if (pushOn) say(message);
        else notifyApp(message, 'note-' + note.id, 'open-notes');
      }
      async function onNoteUpdate(change) {
        const incoming = change && change.new,
          current = incoming && C.notes.find((note) => String(note.id) == String(incoming.id)),
          bodyChanged = !!(current && incoming.body != current.body);
        await refresh();
        if (!bodyChanged || !S.user) return;
        const other = partner(),
          name = (other && other.name) || t('pt');
        const message = t('noteUpdated').replace('{name}', name);
        if (pushOn) say(message);
        else notifyApp(message, 'note-text-' + incoming.id, 'open-notes');
      }
      function noteTypingText(noteId) {
        const typer = noteTypers[String(noteId)];
        return typer ? t('noteTyping').replace('{name}', typer.name || t('pt')) : '';
      }
      function paintNoteTyping(noteId) {
        const id = String(noteId),
          text = noteTypingText(id);
        document.querySelectorAll('[data-note-typing]').forEach((el) => {
          if (String(el.dataset.noteTyping) != id) return;
          el.textContent = text;
          el.hidden = !text;
          el.closest('.sticky')?.classList.toggle('partner-typing', !!text);
        });
      }
      function sendNoteTyping(noteId, typing) {
        if (!CH || !S.user || !realtimeReady) return;
        const request = typing
          ? CH.track({
              noteId: String(noteId),
              userId: S.user.id,
              name: S.user.name || t('you'),
              typing: true,
              at: Date.now(),
            })
          : CH.untrack();
        Promise.resolve(request).catch(() => {});
      }
      function startLocalNoteTyping(noteId) {
        const id = String(noteId),
          now = Date.now();
        if (localTypingNote && localTypingNote != id) sendNoteTyping(localTypingNote, false);
        localTypingNote = id;
        if (now - localTypingSentAt > 800) {
          sendNoteTyping(id, true);
          localTypingSentAt = now;
        }
        clearTimeout(localTypingTimer);
        localTypingTimer = setTimeout(() => stopLocalNoteTyping(id), 1500);
      }
      function stopLocalNoteTyping(noteId = localTypingNote) {
        if (noteId == null || String(noteId) != String(localTypingNote)) return;
        clearTimeout(localTypingTimer);
        sendNoteTyping(localTypingNote, false);
        localTypingNote = null;
        localTypingTimer = null;
        localTypingSentAt = 0;
      }
      function syncNoteTypingPresence() {
        if (!CH || !S.user) return;
        const previous = Object.keys(noteTypers),
          next = {};
        Object.values(CH.presenceState() || {})
          .flat()
          .forEach((presence) => {
            const id = !presence || presence.noteId == null ? '' : String(presence.noteId);
            if (!id || !presence.typing || presence.userId == S.user.id) return;
            next[id] = {
              userId: presence.userId,
              name: String(presence.name || '').slice(0, 60),
            };
          });
        noteTypers = next;
        new Set(previous.concat(Object.keys(next))).forEach(paintNoteTyping);
      }
      // Realtime: nghe thay đổi của events / notifs để hai máy đồng bộ ngay
      function subscribe() {
        clearTimeout(localTypingTimer);
        noteTypers = {};
        realtimeReady = false;
        localTypingNote = null;
        localTypingTimer = null;
        localTypingSentAt = 0;
        if (CH) sb.removeChannel(CH);
        const f = 'couple_id=eq.' + S.user.couple_id;
        CH = sb
          .channel('c-' + S.user.couple_id, { config: { presence: { key: notePresenceKey } } })
          .on('presence', { event: 'sync' }, syncNoteTypingPresence)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: f }, refresh)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'pet_reactions', filter: f }, refresh)
          .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'events' }, refresh)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notes', filter: f }, onNoteInsert)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notes', filter: f }, onNoteUpdate)
          .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'notes' }, refresh)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'photos', filter: f }, refresh)
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'photos', filter: f }, refresh)
          .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'photos' }, refresh)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifs', filter: f }, (x) =>
            onNotif(x.new),
          )
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'notifs', filter: f }, refresh)
          .subscribe((status) => {
            realtimeReady = status == 'SUBSCRIBED';
            if (realtimeReady && localTypingNote) sendNoteTyping(localTypingNote, true);
          });
      }
      // Sau khi đăng nhập: lấy hồ sơ + mã cặp đôi, tải dữ liệu, bật realtime
      async function enter(u) {
        const { data } = await sb
          .from('profiles')
          .select('name,gender,couple_id,couples(code)')
          .eq('id', u.id)
          .maybeSingle();
        if (!data || !data.couple_id) {
          S.user = null;
          return false;
        }
        S.user = {
          id: u.id,
          email: u.email,
          name: data.name,
          gender: data.gender,
          couple_id: data.couple_id,
          code: (data.couples && data.couples.code) || '',
        };
        await loadC();
        subscribe();
        view = 'cal';
        pushInit();
        return true;
      }
      // Đăng ký (signUp + join_couple) hoặc đăng nhập (signInWithPassword)
      async function doAuth(f, v) {
        msg = '';
        if (!CFG) {
          msg = t('cfg');
          return render();
        }
        const un = (mode == 'up' ? v.name || '' : f.querySelector('#e').value).trim(),
          pw = f.querySelector('#p').value;
        if (slug(un).length < 3) {
          msg = t('badName');
          return render();
        }
        const em = toEmail(un);
        try {
          if (mode == 'up') {
            const c = (v.code || '').trim().toUpperCase();
            let r = await sb.auth.signUp({ email: em, password: pw });
            if (r.error || !r.data.session) {
              const s2 = await sb.auth.signInWithPassword({ email: em, password: pw });
              if (s2.error) {
                msg = em2(r.error ? r.error.message : s2.error.message);
                return render();
              }
              r = s2;
            }
            const j = await sb.rpc('join_couple', {
              p_code: c,
              p_name: (v.name || '').trim() || t('you'),
              p_gender: v.gender || 'f',
            });
            if (j.error) {
              msg = em2(j.error.message);
              return render();
            }
          } else {
            const r = await sb.auth.signInWithPassword({ email: em, password: pw });
            if (r.error) {
              msg = em2(r.error.message);
              return render();
            }
          }
          const { data } = await sb.auth.getUser();
          if (!(await enter(data.user))) msg = t('noProf');
        } catch (x) {
          msg = String(x.message || x);
        }
        render();
      }
      /* ===== THÔNG BÁO ĐẨY (Web Push) =====
         Dán khóa công khai VAPID (tạo bằng: npx web-push generate-vapid-keys) vào VAPID_PUBLIC.
         Máy được đăng ký qua hàm save_push_subscription trong Supabase (xem supabase-push.sql). */
