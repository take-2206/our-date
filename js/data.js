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
      let freeDayPurgeAt = 0;
      async function purgeExpiredFreeDays() {
        if (Date.now() - freeDayPurgeAt < 3600000) return;
        freeDayPurgeAt = Date.now();
        try {
          const { data, error } = await sb.from('events').select('id,title').lt('date', key(new Date()));
          if (error) return;
          const expiredIds = (data || []).filter(isFreeDay).map((event) => event.id);
          if (expiredIds.length) await sb.from('events').delete().in('id', expiredIds);
        } catch (x) {}
      }
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
      function applyTttGame(game, preserveBusy = false) {
        if (!game || !Array.isArray(game.board) || game.board.length != 9) return;
        TTT = {
          ...TTT,
          board: game.board.map((mark) => (mark == 'X' || mark == 'O' ? mark : '')),
          turn: game.turn == 'O' ? 'O' : 'X',
          winner: game.winner || '',
          draw: !!game.is_draw,
          winLine: Array.isArray(game.win_line) ? game.win_line.map(Number) : [],
          scores: { X: 0, O: 0, draws: 0, ...(game.scores || {}) },
          playerX: game.player_x || null,
          playerO: game.player_o || null,
          ready: true,
          busy: preserveBusy && TTT.busy,
          error: '',
        };
      }
      async function loadTttGame() {
        try {
          const { data, error } = await sb.rpc('ttt_get_or_create_game');
          if (error) throw error;
          applyTttGame(data, true);
        } catch (error) {
          TTT.busy = false;
          TTT.ready = false;
          TTT.error = error.message || String(error);
        }
      }
      async function updateTttGame(rpc, args) {
        if (!TTT.ready || TTT.busy) return;
        TTT.busy = true;
        render();
        let failure = '';
        try {
          const { data, error } = await sb.rpc(rpc, args);
          if (error) throw error;
          if (!data || !Array.isArray(data.board)) throw new Error('Game returned an invalid board state.');
          applyTttGame(data);
        } catch (error) {
          failure = error.message || String(error);
        } finally {
          TTT.busy = false;
          render();
        }
        if (failure) say(failure);
      }
      function playTttMove(cell) {
        return updateTttGame('ttt_make_move', { p_cell: cell });
      }
      function startTttRound(resetScore = false) {
        return updateTttGame('ttt_new_round', { p_reset_score: resetScore });
      }
      async function loadC() {
        await Promise.all([purgeExpiredTrash(), purgeExpiredFreeDays()]);
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
        await loadTttGame();
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
        await Promise.all([loadPetReactions(), loadPetFeelings()]);
        await loadPetMessages();
        await loadPetMessageReactions();
      }
      const petLocalKey = () => 'ls_pet_' + (S.user && S.user.couple_id || '');
      function saveLocalPet() {
        try {
          localStorage.setItem(petLocalKey(), JSON.stringify({
            name: PET.name,
            reactions: PET.reactions || [],
            feelings: PET.feelings || [],
            messages: PET.messages || [],
            messageReactions: PET.messageReactions || [],
          }));
        } catch (x) {}
      }
      function loadLocalPet() {
        try {
          const local = JSON.parse(localStorage.getItem(petLocalKey()) || '{}');
          PET = { name: local.name || 'Mochi', reactions: local.reactions || [], feelings: local.feelings || [], messages: local.messages || [], messageReactions: local.messageReactions || [] };
        } catch (x) { PET = { name: 'Mochi', reactions: [], feelings: [], messages: [], messageReactions: [] }; }
      }
      async function loadPetReactions() {
        try {
          const { data, error } = await sb.from('pet_reactions').select('id, emoji, sender_id, created_at').eq('couple_id', S.user.couple_id).order('created_at', { ascending: true }).limit(2);
          if (error) return;
          PET.reactions = (data || []).map((r) => ({ id: r.id, emoji: r.emoji, by: r.sender_id, byName: (P[r.sender_id] || {}).name || '', at: Date.parse(r.created_at) || Date.now() }));
          saveLocalPet();
        } catch (x) {}
      }
      async function loadPetMessageReactions() {
        if (!S.user) return;
        const messageIds = (PET.messages || [])
          .map((message) => String(message.id))
          .filter((id) => /^[0-9]+$/.test(id));
        try {
          let query = sb
            .from('pet_message_reactions')
            .select('id,message_id,user_id,emoji,created_at')
            .eq('couple_id', S.user.couple_id);
          query = messageIds.length ? query.in('message_id', messageIds) : query.limit(1);
          const { data, error } = await query;
          if (error) throw error;
          petMessageReactionError = '';
          PET.messageReactions = (data || []).map((reaction) => ({
            id: reaction.id,
            messageId: reaction.message_id,
            by: reaction.user_id,
            emoji: reaction.emoji,
            at: Date.parse(reaction.created_at) || Date.now(),
          }));
          saveLocalPet();
        } catch (error) {
          petMessageReactionError = error.message || String(error);
          PET.messageReactions ||= [];
        }
      }
      async function setPetMessageReaction(messageId, emoji) {
        const allowed = ['❤️', '👍', '😂', '😮', '😢', '😡'],
          id = String(messageId),
          user = S.user;
        if (!user || !/^[0-9]+$/.test(id) || !allowed.includes(emoji)) return;
        const previous = (PET.messageReactions || []).slice(),
          current = previous.find((reaction) => String(reaction.messageId) == id && reaction.by == user.id),
          removing = current && current.emoji == emoji;
        PET.messageReactions = previous.filter((reaction) => !(String(reaction.messageId) == id && reaction.by == user.id));
        if (!removing)
          PET.messageReactions.push({ id: 'local-reaction-' + Date.now(), messageId: id, by: user.id, emoji, at: Date.now() });
        petMessageReactionId = null;
        saveLocalPet();
        paintPetMessages();
        try {
          const request = removing
            ? sb.from('pet_message_reactions').delete().eq('message_id', id).eq('user_id', user.id)
            : sb.from('pet_message_reactions').upsert(
                { couple_id: user.couple_id, message_id: id, user_id: user.id, emoji },
                { onConflict: 'message_id,user_id' },
              );
          const { error } = await request;
          if (error) throw error;
          await loadPetMessageReactions();
          paintPetMessages();
        } catch (error) {
          PET.messageReactions = previous;
          saveLocalPet();
          paintPetMessages();
          say(t('petMessageReactionSetup'));
        }
      }
      const toPetMessage = (row) => ({
        id: row.id,
        text: row.body,
        by: row.sender_id,
        byName: (P[row.sender_id] || {}).name || '',
        at: Date.parse(row.created_at) || Date.now(),
        receivedAt: row.received_at || null,
        readAt: row.read_at || null,
        replyTo: row.reply_to == null ? null : row.reply_to,
        editedAt: row.edited_at || null,
      });
      function mergePetReceipt(message, receipt) {
        if (receipt.received_at) message.receivedAt ||= receipt.received_at;
        if (receipt.read_at) message.readAt ||= receipt.read_at;
      }
      function mergePetMessageRow(message, row) {
        if (row.body != null) message.text = row.body;
        if (row.reply_to !== undefined) message.replyTo = row.reply_to;
        if (row.edited_at !== undefined) message.editedAt = row.edited_at;
        mergePetReceipt(message, row);
      }
      let petReceiptRequest = null,
        petReceiptRetryAt = 0;
      async function acknowledgePetMessages() {
        if (!S.user || !PET.messages || petReceiptRequest || Date.now() < petReceiptRetryAt) return;
        const user = S.user;
        const thread = document.visibilityState == 'visible' && document.querySelector('.pet-message-thread');
        const visibleIds = new Set();
        if (thread) {
          const viewport = thread.getBoundingClientRect();
          for (const row of thread.querySelectorAll('[data-pet-message-id]')) {
            const rect = row.getBoundingClientRect();
            if (rect.height > 0 && rect.bottom > Math.max(0, viewport.top) &&
                rect.top < Math.min(window.innerHeight, viewport.bottom))
              visibleIds.add(row.dataset.petMessageId);
          }
        }
        const received = [], read = [];
        for (const message of PET.messages) {
          const id = String(message.id);
          if (message.by == user.id || !/^[0-9]+$/.test(id)) continue;
          if (!message.receivedAt) received.push(id);
          if (!message.readAt && visibleIds.has(id)) read.push(id);
        }
        if (!received.length && !read.length) return;
        const request = sb.rpc('ack_pet_messages', { p_received: received, p_read: read });
        petReceiptRequest = request;
        let updated = false;
        try {
          const { data, error } = await request;
          if (error) throw error;
          if (S.user !== user) return;
          const receipts = new Map((data || []).map((receipt) => [String(receipt.id), receipt]));
          for (const message of PET.messages) {
            const receipt = receipts.get(String(message.id));
            if (receipt) mergePetReceipt(message, receipt);
          }
          updated = receipts.size > 0;
          if (updated) saveLocalPet();
        } catch (error) {
          petReceiptRetryAt = Date.now() + 15000;
        } finally {
          petReceiptRequest = null;
          if (updated) requestAnimationFrame(acknowledgePetMessages);
        }
      }
      function onPetMessageReceipt(change) {
        const receipt = change.new;
        if (!S.user || receipt.couple_id != S.user.couple_id) return;
        const message = (PET.messages || []).find((item) => String(item.id) == String(receipt.id));
        if (!message) return;
        mergePetMessageRow(message, receipt);
        saveLocalPet();
        paintPetMessages();
      }
      async function loadPetMessages() {
        const user = S.user;
        if (!user) return;
        try {
          const { data, error } = await sb
            .from('pet_messages')
            .select('*')
            .eq('couple_id', user.couple_id)
            .order('created_at', { ascending: false })
            .limit(100);
          if (S.user !== user) return;
          if (error) throw error;
          const previous = new Map((PET.messages || []).map((message) => [String(message.id), message]));
          PET.messages = (data || []).reverse().map((row) => {
            const message = toPetMessage(row);
            const cached = previous.get(String(row.id));
            if (cached) mergePetReceipt(message, { received_at: cached.receivedAt, read_at: cached.readAt });
            return message;
          });
          petMessageError = '';
          saveLocalPet();
          void acknowledgePetMessages();
        } catch (x) {
          if (S.user === user) petMessageError = x.message || String(x);
        }
      }
      async function syncPetMessagesLive() {
        if (!S.user || petMessageSyncBusy) return;
        petMessageSyncBusy = true;
        try {
          const before = (PET.messages || []).map((message) => message.id).join(',');
          await loadPetMessages();
          if (typeof paintPetMessages == 'function') paintPetMessages();
          if (before !== (PET.messages || []).map((message) => message.id).join(','))
            requestDeferredRefresh();
        } finally {
          petMessageSyncBusy = false;
        }
      }
      const toPetFeeling = (row) => ({
        id: row.id,
        dropKey: 'db-' + row.id,
        feeling: row.feeling,
        reason: row.reason || '',
        by: row.sender_id,
        byName: (P[row.sender_id] || {}).name || '',
        gender: (P[row.sender_id] || {}).gender || 'f',
        at: Date.parse(row.created_at) || Date.now(),
      });
      async function loadPetFeelings() {
        try {
          const { data, error } = await sb
            .from('pet_feelings')
            .select('id, feeling, reason, sender_id, created_at')
            .eq('couple_id', S.user.couple_id)
            .order('created_at', { ascending: true });
          if (error) throw error;
          PET.feelings = (data || []).map(toPetFeeling);
          saveLocalPet();
        } catch (x) {}
      }
      async function sendPetFeeling(feeling, reason) {
        reason = String(reason || '').trim().slice(0, 240);
        if (!S.user || !S.user.couple_id || !feeling) return;
        const localId = 'local-feeling-' + Date.now(),
          local = {
            id: localId,
            dropKey: localId,
            feeling,
            reason: reason.slice(0, 240),
            by: S.user.id,
            byName: S.user.name || '',
            gender: S.user.gender || 'f',
            at: Date.now(),
          };
        PET.feelings = (PET.feelings || []).concat(local);
        jarFeelingDropId = localId;
        clearTimeout(jarFeelingDropTimer);
        jarFeelingDropTimer = setTimeout(() => {
          jarFeelingDropId = null;
          jarFeelingDropTimer = null;
          if (view == 'cal' && petCardView == 'jar') render();
        }, 1500);
        saveLocalPet();
        render();
        try {
          const { data, error } = await sb
            .from('pet_feelings')
            .insert({ couple_id: S.user.couple_id, sender_id: S.user.id, feeling, reason: local.reason })
            .select('id, feeling, reason, sender_id, created_at')
            .single();
          if (error) throw error;
          PET.feelings = PET.feelings.map((item) => item.id == localId ? toPetFeeling(data) : item);
          jarFeelingDropId = 'db-' + data.id;
          saveLocalPet();
        } catch (x) {
          saveLocalPet();
          say(t('petFeelingsSaveError') + ' ' + t('petFeelingsSetup') + ' ' + (x.message || x));
        }
      }
      function onPetFeelingInsert(change) {
        const row = change && change.new;
        if (!row) return;
        jarFeelingDropId = 'db-' + row.id;
        clearTimeout(jarFeelingDropTimer);
        jarFeelingDropTimer = setTimeout(() => {
          jarFeelingDropId = null;
          jarFeelingDropTimer = null;
          if (view == 'cal' && petCardView == 'jar') render();
        }, 1500);
        refresh();
      }
      async function sendPetReaction(message) {
        const emoji = String(message || '').trim().slice(0, 120);
        if (!emoji || !S.user) return;
        const reaction = { id: 'local-' + Date.now(), emoji, by: S.user.id, byName: S.user.name, at: Date.now() };
        PET.reactions = (PET.reactions || []).filter((r) => r.by != S.user.id).concat(reaction);
        render();
        try {
          const { error } = await sb.from('pet_reactions').upsert({ couple_id: S.user.couple_id, sender_id: S.user.id, emoji, created_at: new Date().toISOString() }, { onConflict: 'couple_id,sender_id' });
          if (error) throw error;
          saveLocalPet();
        } catch (x) {
          saveLocalPet();
         say('Bubble đã hiện trên máy này. Không đồng bộ được: ' + (x.message || x));
        }
      }
      async function sendPetMessage(message, replyTo = petMessageReplyId) {
        const text = String(message || '').trim().slice(0, 120);
        if (!text || !S.user) return;
        const replyId = /^[0-9]+$/.test(String(replyTo || '')) ? String(replyTo) : null;
        petMessageReplyId = null;
        petMessageEditId = null;
        const localId = 'local-message-' + Date.now(),
          local = { id: localId, text, by: S.user.id, byName: S.user.name, at: Date.now(), replyTo: replyId, editedAt: null };
        PET.messages = (PET.messages || []).concat(local).slice(-100);
        saveLocalPet();
        render();
        try {
          const insertRow = { couple_id: S.user.couple_id, sender_id: S.user.id, body: text };
          if (replyId) insertRow.reply_to = replyId;
          const { data, error } = await sb
            .from('pet_messages')
            .insert(insertRow)
            .select('*')
            .single();
          if (error) throw error;
          const confirmed = (PET.messages || []).find((item) => String(item.id) == String(data.id));
          PET.messages = (PET.messages || []).filter((item) => item.id != localId);
          if (!confirmed) PET.messages = PET.messages.concat(toPetMessage(data)).slice(-100);
          petMessageError = '';
          saveLocalPet();
          render();
          sendPetMessageBroadcast(data);
          if (typeof pushPetMessage == 'function') await pushPetMessage(data.id);
        } catch (x) {
          local.failed = true;
          petMessageError = x.message || String(x);
          saveLocalPet();
          say(t('petMessagesSetup'));
          render();
        }
      }
      async function editPetMessage(messageId, message) {
        const text = String(message || '').trim().slice(0, 120),
          target = (PET.messages || []).find((item) => String(item.id) == String(messageId));
        if (!text || !target || target.by != S.user?.id || !/^[0-9]+$/.test(String(target.id))) return;
        const previousText = target.text,
          previousEditedAt = target.editedAt,
          editedAt = new Date().toISOString();
        petMessageEditId = null;
        petMessageReplyId = null;
        target.text = text;
        target.editedAt = editedAt;
        saveLocalPet();
        render();
        try {
          const { data, error } = await sb
            .from('pet_messages')
            .update({ body: text, edited_at: editedAt })
            .eq('id', target.id)
            .eq('sender_id', S.user.id)
            .select('*')
            .single();
          if (error) throw error;
          mergePetMessageRow(target, data);
          petMessageError = '';
          saveLocalPet();
          paintPetMessages();
          sendPetMessageBroadcast(data);
        } catch (error) {
          target.text = previousText;
          target.editedAt = previousEditedAt;
          saveLocalPet();
          render();
          say(t('petMessageEditFailed'));
        }
      }
      async function onPetMessageInsert(change) {
        const incoming = change && change.new;
        if (!incoming || !S.user) return;
        if (incoming.sender_id != S.user.id) markPartnerOnline();
        const messageRow = toPetMessage(incoming),
          existing = (PET.messages || []).find((item) => String(item.id) == String(messageRow.id)),
          existed = !!existing;
        if (existing) mergePetMessageRow(existing, incoming);
        else PET.messages = (PET.messages || []).concat(messageRow).slice(-100);
        saveLocalPet();
        if (typeof paintPetMessages == 'function') paintPetMessages();
        void acknowledgePetMessages();
        requestDeferredRefresh();
        if (incoming.sender_id == S.user.id || existed) return;
        const name = (P[incoming.sender_id] || {}).name || t('pt'),
          preview = String(incoming.body || '').replace(/\s+/g, ' ').trim().slice(0, 80),
          message = t('petMessageReceived').replace('{name}', name).replace('{message}', preview);
        if (pushOn) say(message);
        else notifyApp(message, 'pet-message-' + incoming.id, 'open-pet-messages');
      }
      function sendPetMessageBroadcast(row) {
        if (!CH || !S.user || !realtimeReady || !row) return;
        Promise.resolve(
          CH.send({ type: 'broadcast', event: 'pet_message', payload: { row } }),
        ).catch(() => {});
      }
      function onPetMessageBroadcast(payload) {
        if (payload && payload.row)
          onPetMessageInsert({ new: { ...payload.row, received_at: null, read_at: null } });
      }
      function sendPetTouch() {
  if (!CH || !S.user || !realtimeReady) return;
  Promise.resolve(
    CH.send({ type: 'broadcast', event: 'pet_touch', payload: { from: S.user.id } }),
  ).catch(() => {});
}
function onPetTouch(p) {
  if (!p || !S.user || p.from == S.user.id || view != 'cal') return;
  markPartnerOnline();
  const btn = document.querySelector('.pet-walker-left .pet-character-action');
  if (btn && typeof petTouch == 'function') petTouch(btn);
}
      async function clearPetReaction() {
        PET.reactions = (PET.reactions || []).filter((r) => r.by != S.user.id);
        render();
        try {
          const { error } = await sb.from('pet_reactions').delete().eq('couple_id', S.user.couple_id).eq('sender_id', S.user.id);
          if (error) throw error;
          saveLocalPet();
        } catch (x) {
          saveLocalPet();
          say('Bubble đã ẩn ở máy này. Hãy chạy supabase-pet.sql để đồng bộ thao tác xóa.');
        }
      }
      function savePetName(name) {
        PET.name = name;
        saveLocalPet();
        render();
      }
      let deferredRefreshPending = false,
        deferredRefreshTimer = null;
      function interactionInProgress() {
        const active = document.activeElement,
          editing = active && active !== document.body && active.matches &&
            active.matches('input, textarea, select, [contenteditable="true"]');
        return !!(
          uiPointerActive || editing || noteDrag || noteResize || modal || pmod || smod || umod || pv != null || noteEdit || noteDraft
        );
      }
      function consumeDeferredRefresh() {
        deferredRefreshPending = false;
        clearTimeout(deferredRefreshTimer);
        deferredRefreshTimer = null;
      }
      function paintDeferredRefresh() {
        deferredRefreshTimer = null;
        if (!deferredRefreshPending) return;
        if (interactionInProgress()) {
          deferredRefreshTimer = setTimeout(paintDeferredRefresh, 300);
          return;
        }
        deferredRefreshPending = false;
        render();
        if (LT) drawLT();
      }
      function requestDeferredRefresh() {
        deferredRefreshPending = true;
        if (!deferredRefreshTimer) deferredRefreshTimer = setTimeout(paintDeferredRefresh, 300);
      }
      // Tải lại dữ liệu rồi vẽ lại màn hình
      async function refresh() {
        if (!S.user) return;
        const ae = document.activeElement,
          activeNote = ae && ae.matches && ae.matches('[data-note-body]')
            ? { id: String(ae.dataset.id), body: ae.value }
            : null;
        await loadC();
        // Keep live sticky-note text in memory while background data is merged.
        if (activeNote && ae.isConnected && document.activeElement === ae) {
          const note = C.notes.find((item) => String(item.id) == activeNote.id);
          if (note) note.body = activeNote.body;
        }
        // Data is current now; DOM replacement waits until the user's action is finished.
        requestDeferredRefresh();
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
      function sendLocalPresence(noteId, noteTyping, petTyping = localPetTyping) {
        if (!CH || !S.user || !realtimeReady) return;
        const request = CH.track({
          noteId: noteTyping && noteId != null ? String(noteId) : '',
          userId: S.user.id,
          name: S.user.name || t('you'),
          online: true,
          typing: !!noteTyping,
          petTyping: !!petTyping,
          at: Date.now(),
        });
        Promise.resolve(request).catch(() => {});
      }
      function sendNoteTyping(noteId, typing) {
        sendLocalPresence(noteId, typing);
      }
      function sendRealtimeOnlineState(online = true) {
        if (!CH || !S.user || !realtimeReady) return;
        if (online) sendLocalPresence(localTypingNote, !!localTypingNote, localPetTyping);
        Promise.resolve(
          CH.send({
            type: 'broadcast',
            event: 'partner_status',
            payload: { from: S.user.id, online: !!online, at: Date.now() },
          }),
        ).catch(() => {});
        if (!online) Promise.resolve(CH.untrack()).catch(() => {});
      }
      function markPartnerOnline() {
        partnerOnline = true;
        partnerOnlineLastSeen = Date.now();
        paintPetMessagePresence();
      }
      function onRealtimeOnlineState(payload) {
        if (!payload || !S.user || payload.from == S.user.id) return;
        if (payload.online) markPartnerOnline();
        else if (!partnerOnlineLastSeen || Date.now() - partnerOnlineLastSeen > 12000) {
          partnerOnline = false;
          partnerOnlineLastSeen = 0;
          partnerPetTyping = false;
          paintPetMessagePresence();
        }
        paintPetMessageTyping();
      }
      function expireRealtimeOnlineState() {
        if (!partnerOnline || !partnerOnlineLastSeen || Date.now() - partnerOnlineLastSeen <= 12000) return;
        partnerOnline = false;
        partnerPetTyping = false;
        partnerOnlineLastSeen = 0;
        paintPetMessagePresence();
        paintPetMessageTyping();
      }
      function startLocalPetTyping() {
        const now = Date.now();
        localPetTyping = true;
        if (now - localPetTypingSentAt > 600) {
          sendLocalPresence(localTypingNote, !!localTypingNote, true);
          localPetTypingSentAt = now;
        }
        clearTimeout(localPetTypingTimer);
        localPetTypingTimer = setTimeout(stopLocalPetTyping, 1400);
      }
      function stopLocalPetTyping() {
        clearTimeout(localPetTypingTimer);
        if (localPetTyping) sendLocalPresence(localTypingNote, !!localTypingNote, false);
        localPetTyping = false;
        localPetTypingTimer = null;
        localPetTypingSentAt = 0;
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
        let nextPartnerOnline = false,
          nextPartnerPetTyping = false;
        Object.values(CH.presenceState() || {})
          .flat()
          .forEach((presence) => {
            if (presence && presence.userId && presence.userId != S.user.id)
              nextPartnerOnline = true;
            if (presence && presence.userId != S.user.id && presence.petTyping)
              nextPartnerPetTyping = true;
            const id = !presence || presence.noteId == null ? '' : String(presence.noteId);
            if (!id || !presence.typing || presence.userId == S.user.id) return;
            next[id] = {
              userId: presence.userId,
              name: String(presence.name || '').slice(0, 60),
            };
          });
        noteTypers = next;
        const recentHeartbeat = partnerOnlineLastSeen && Date.now() - partnerOnlineLastSeen <= 12000;
        partnerOnline = nextPartnerOnline || !!recentHeartbeat;
        if (nextPartnerOnline) partnerOnlineLastSeen = Date.now();
        else if (!partnerOnline) partnerOnlineLastSeen = 0;
        partnerPetTyping = nextPartnerPetTyping;
        new Set(previous.concat(Object.keys(next))).forEach(paintNoteTyping);
        paintPetMessagePresence();
        paintPetMessageTyping();
      }
      function paintPetMessagePresence() {
        const other = partner(),
          name = (other && other.name) || t('petPartner');
        document.querySelectorAll('[data-pet-presence]').forEach((el) => {
          el.textContent = `${name} · ${t(partnerOnline ? 'petOnline' : 'petOffline')}`;
          el.classList.toggle('is-online', partnerOnline);
        });
      }
      function paintPetMessageTyping() {
        const other = partner(),
          name = (other && other.name) || t('petPartner');
        document.querySelectorAll('[data-pet-typing]').forEach((el) => {
          el.hidden = !partnerPetTyping;
          const text = el.querySelector('[data-pet-typing-text]');
          if (text) text.textContent = t('petTyping').replace('{name}', name);
          if (partnerPetTyping) {
            const thread = el.closest('.pet-message-thread');
            if (thread) thread.scrollTop = thread.scrollHeight;
          }
        });
      }
      async function onPetMessageReactionChange() {
        await loadPetMessageReactions();
        if (typeof paintPetMessages == 'function') paintPetMessages();
      }
      // Realtime: nghe thay đổi của events / notifs để hai máy đồng bộ ngay
      function subscribe() {
        clearTimeout(localTypingTimer);
        noteTypers = {};
        partnerOnline = false;
        partnerOnlineLastSeen = 0;
        partnerPetTyping = false;
        realtimeReady = false;
        localTypingNote = null;
        localTypingTimer = null;
        localTypingSentAt = 0;
        clearTimeout(localPetTypingTimer);
        localPetTyping = false;
        localPetTypingTimer = null;
        localPetTypingSentAt = 0;
        if (CH) sb.removeChannel(CH);
        const f = 'couple_id=eq.' + S.user.couple_id;
        let channel = sb
          .channel('c-' + S.user.couple_id, { config: { presence: { key: notePresenceKey } } })
          .on('presence', { event: 'sync' }, syncNoteTypingPresence)
          .on('broadcast', { event: 'pet_touch' }, (m) => onPetTouch(m.payload))
          .on('broadcast', { event: 'pet_message' }, (m) => onPetMessageBroadcast(m.payload))
          .on('broadcast', { event: 'partner_status' }, (m) => onRealtimeOnlineState(m.payload))
          .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'pet_reactions' }, refresh)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tic_tac_toe_games', filter: f }, (change) => {
            applyTttGame(change.new, true);
            if (view == 'game') render();
          })
          .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tic_tac_toe_games', filter: f }, (change) => {
            applyTttGame(change.new, true);
            if (view == 'game') render();
          })
          .on('postgres_changes', { event: '*', schema: 'public', table: 'events', filter: f }, refresh)
          .on('postgres_changes', { event: '*', schema: 'public', table: 'pet_reactions', filter: f }, refresh)
          .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pet_feelings', filter: f }, onPetFeelingInsert);
        if (!petMessageReactionError)
          channel = channel.on('postgres_changes', { event: '*', schema: 'public', table: 'pet_message_reactions', filter: f }, onPetMessageReactionChange);
        if (!petMessageError) {
          channel = channel
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'pet_messages', filter: f }, onPetMessageInsert)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'pet_messages', filter: f }, onPetMessageReceipt)
            .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'pet_messages' }, refresh);
        }
        CH = channel
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
            if (realtimeReady) {
              sendRealtimeOnlineState(document.visibilityState == 'visible');
              syncPetMessagesLive();
            }
            else {
              partnerOnline = false;
              partnerOnlineLastSeen = 0;
              partnerPetTyping = false;
              paintPetMessagePresence();
              paintPetMessageTyping();
            }
            if (realtimeReady) loadTttGame().then(() => { if (view == 'game') render(); });
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

      async function resetPassword(v) {
        msg = '';
        if (!CFG) {
          msg = t('cfg');
          return render();
        }
        const username = String(v.username || '').trim(),
          code = String(v.code || '').trim().toUpperCase(),
          password = String(v.password || ''),
          confirm = String(v.confirm || '');
        if (slug(username).length < 3) {
          msg = t('badName');
          return render();
        }
        if (password !== confirm) {
          msg = t('resetMismatch');
          return render();
        }
        try {
          const { error } = await sb.functions.invoke('reset-password', {
            body: { username, code, password },
          });
          if (error) {
            msg = t('resetFailed');
            return render();
          }
          mode = 'in';
          msg = t('resetSuccess');
        } catch (x) {
          msg = t('resetFailed');
        }
        render();
      }
      /* ===== THÔNG BÁO ĐẨY (Web Push) =====
         Dán khóa công khai VAPID (tạo bằng: npx web-push generate-vapid-keys) vào VAPID_PUBLIC.
         Máy được đăng ký qua hàm save_push_subscription trong Supabase (xem supabase-push.sql). */
