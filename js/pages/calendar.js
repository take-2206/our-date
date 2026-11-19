// LoveSync calendar module. Classic scripts share state declared in js/core.js.
const MS = [100, 200, 300, 365, 500, 600, 700, 730, 800, 900, 1000];
      function anniversaryInfo(since) {
        const start = parse(since),
          today = today0(),
          month = start.getMonth(),
          day = start.getDate(),
          anniversaryIn = (year) => {
            const lastDay = new Date(year, month + 1, 0).getDate();
            return new Date(year, month, Math.min(day, lastDay));
          },
          calendarDays = (from, to) =>
            Math.round(
              (Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) -
                Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) /
                864e5,
            );
        let year = today.getFullYear(),
          date = anniversaryIn(year),
          years = year - start.getFullYear();
        if (years > 0 && calendarDays(today, date) === 0) return { today: true, years };
        if (years < 1 || date <= today) {
          year += 1;
          date = anniversaryIn(year);
          years = year - start.getFullYear();
        }
        return { today: false, years, days: calendarDays(today, date) };
      }
      function dayHeadBadge() {
        const sn = C.since;
        if (!sn)
          return `<button class="head-day-badge is-empty" data-a="sedit" title="${esc(t('dcSet'))}" aria-label="${esc(t('dcSet'))}">+</button>`;
        const n = Math.round((today0() - parse(sn)) / 864e5) + 1,
          nx = MS.find((x) => x > n) || Math.ceil((n + 1) / 365) * 365,
          ann = anniversaryInfo(sn),
          annText = ann.today
            ? t('dcAnnToday').replace('{n}', ann.years)
            : t('dcAnnNext').replace('{n}', ann.days).replace('{y}', ann.years),
          nextText = n > 0 ? t('dcNext').replace('{n}', nx - n).replace('{m}', nx) : '';
        return `<button class="head-day-badge" data-a="sedit" title="${esc(annText + (nextText ? ' · ' + nextText : ''))}" aria-label="${esc(Math.max(n, 0) + ' ' + t('dc') + '. ' + annText)}"><b>${Math.max(n, 0)}</b><span>${esc(t('dcUnit'))}</span></button>`;
      }
      function vSince() {
        return `<div class="mod" data-a="sclose"><form class="card" data-f="since" role="dialog" aria-label="${t('dcTtl')}"><h2 class="px" style="font-size:16px;color:var(--pk);margin-bottom:16px">${t('dcTtl')}</h2><div class="fl"><label class="lb" for="sd">${t('dt')}</label><input class="in" id="sd" name="since" type="date" data-calendar inputmode="none" required max="${key(new Date())}" value="${esc(C.since || '')}"></div><div class="row2"><button type="button" class="btn b2" data-a="sclose">${t('cancel')}</button><button class="btn b1">${t('save')}</button></div></form></div>`;
      }

      function vDaysTogether() {
        const since = C.since,
          people = Object.values(P),
          names = people.map((person) => person.name).filter(Boolean),
          nameHtml = names.length
            ? names.map((name) => esc(name)).join('<span class="dc-name-heart" aria-hidden="true">♥</span>')
            : esc((S.user && S.user.name) || t('you'));
        let details = `<p class="sub">${esc(t('dcSet'))}</p>`;
        if (since) {
          const days = Math.max(Math.round((today0() - parse(since)) / 864e5) + 1, 0),
            next = MS.find((value) => value > days) || Math.ceil((days + 1) / 365) * 365,
            ann = anniversaryInfo(since),
            anniversary = ann.today
              ? t('dcAnnToday').replace('{n}', ann.years)
              : t('dcAnnNext').replace('{n}', ann.days).replace('{y}', ann.years),
            milestone = t('dcNext').replace('{n}', Math.max(next - days, 0)).replace('{m}', next);
          details = `<div class="dc-detail-count"><b class="px">${days}</b><span>${esc(t('dc'))}</span></div><p class="sub mono">${esc(t('dcFrom'))} ${esc(fmt(since, { dateStyle: 'long' }))}</p><p class="dc-ann mono">${esc(anniversary)}</p><p class="sub mono">${esc(milestone)}</p>`;
        }
        return `<section class="card dc-detail" role="dialog" aria-labelledby="dc-detail-title"><button type="button" class="ib dc-detail-close" data-a="dcClose" aria-label="${esc(t('close'))}">${I.x}</button><div class="dc-detail-avatar">${coupleAvatar()}</div><h2 id="dc-detail-title" class="px">${nameHtml}</h2>${details}<button type="button" class="btn b1" data-a="dcEdit">${esc(since ? t('edit') : t('dcSet'))}</button></section>`;
      }

      // Icon mini-boy / mini-girl theo giới tính của người đăng ký ngày rảnh.
      function freeIcon(e) {
        const owner = P[e.by] || (S.user && S.user.id == e.by ? S.user : {});
        const g = owner.gender == 'm' ? 'boy' : 'girl';
        return `<img src="./img/pet/mini_${g}.png" alt="" draggable="false">`;
      }

      function visibleFreeDays(entries) {
        const plans = entries.filter((e) => !isFreeDay(e)),
          freeDays = entries.filter(isFreeDay),
          bothAreFree = new Set(freeDays.map((e) => e.by).filter(Boolean)).size > 1,
          hasConfirmedDate = plans.some((e) => !e.st || e.st == 'ok');
        return bothAreFree && hasConfirmedDate ? [] : freeDays;
      }

      function heartLightHtml(dateKey) {
        const now = performance.now() / 1000,
          datePhase = Number(String(dateKey).slice(-2) || 0) * 0.037,
          offsets = [0, 1.21, 1.17, 1.13, 1.09, 1.05];
        return `<span class="heart-light" aria-hidden="true">${offsets.map((offset) => `<i style="animation-delay:-${(now + datePhase + offset).toFixed(3)}s"></i>`).join('')}</span>`;
      }

      function upcomingPrepCard(e) {
        const items = Array.isArray(e.todo) ? e.todo : [];
        return `<section class="card upcoming-prep" aria-label="${esc(t('prep'))}"><div class="upcoming-prep-head"><div><p class="mono sub">// ${esc(t('prep'))}</p><b>${esc(tx(e.title))}</b></div><button type="button" class="mini" data-a="ev" data-id="${e.id}" aria-label="${esc(items.length ? t('edit') : t('addTodo'))}">${items.length ? esc(t('edit')) : '+ ' + esc(t('addTodo'))}</button></div>${items.length ? `<div class="upcoming-prep-items">${items.map((item, i) => `<label class="upcoming-prep-item"><input type="checkbox" data-a="chk" data-id="${e.id}" data-i="${i}" ${item.d ? 'checked' : ''}><span class="${item.d ? 'x' : ''}">${esc(tx(item.t))}</span></label>`).join('')}</div>` : `<p class="sub upcoming-prep-empty">${esc(t('prepEmpty'))}</p>`}</section>`;
      }

      function vCal() {
        const y = cur.getFullYear(),
          m = cur.getMonth(),
          st = new Date(y, m, 1 - ((new Date(y, m, 1).getDay() + 6) % 7)),
          tk = key(new Date()),
          cells = [];
        for (let i = 0; i < 42; i++) {
          const d = new Date(st);
          d.setDate(st.getDate() + i);
          const k = key(d),
            entries = EV().filter((e) => e.date == k),
            es = entries.filter((e) => !isFreeDay(e)),
            free = visibleFreeDays(entries),
            np = photosOn(k).length;
          cells.push(
            `<button class="cl${d.getMonth() != m ? ' o' : ''}${k == tk ? ' td' : ''}${k == sel ? ' sl' : ''}${es.length ? ' has-plan' : ''}${free.length ? ' has-free' : ''}${np ? ' has-ph' : ''}" data-a="day" data-k="${k}" aria-label="${fmt(k, { dateStyle: 'full' })}${es.length ? `, ${es.length} ${t('det')}` : ''}${free.length ? `, ${free.length} ${t('freeDay')}` : ''}${np ? `, ${np} ${t('phMore')}` : ''}"><span>${d.getDate()}</span>${es.length ? heartLightHtml(k) : ''}${free.length ? `<span class="free-day-markers" aria-hidden="true">${free.slice(0, 2).map((e) => `<i class="${typeof freeDayOwnerClass == 'function' ? freeDayOwnerClass(e.by) : ''}">${freeIcon(e)}</i>`).join('')}</span>` : ''}${np ? '<i class="ph-dot" aria-hidden="true"></i>' : ''}</button>`,
          );
        }
        const wk = [...Array(7)]
          .map(
            (_, i) =>
              `<span class="mono sub">${new Date(2024, 0, 1 + i).toLocaleDateString(loc(), { weekday: 'short' })}</span>`,
          )
          .join('');
        const selectedEntries = EV().filter((e) => e.date == sel),
          day = selectedEntries.filter((e) => !isFreeDay(e)),
          freeDays = visibleFreeDays(selectedEntries),
          freeSection = freeDays.map(freeDayCard).join(''),
          upcoming = up()
            .filter((e) => e.date != sel)
            .slice(0, 3),
          dph = photosOn(sel),
          photoSec = dph.length
            ? `<p class="mono sub h2"${day.length || freeDays.length ? ' style="margin-top:22px"' : ''}>// ${t('phOfDay')} · ${fmt(sel, { day: 'numeric', month: 'long' })}</p><div class="card cal-ph"><div class="cal-ph-grid">${dph
                .slice(0, 4)
                .map((p, i) => {
                  const u = pu(p),
                    more = i == 3 && dph.length > 4 ? dph.length - 4 : 0;
                  return `<button class="ab-ph" data-a="pvDay" data-k="${sel}" data-id="${p.id}" aria-label="${esc(p.cap || p.place || t('album'))}">${u ? `<img src="${esc(u)}" alt="${esc(p.cap)}" loading="lazy" decoding="async">` : ''}${more ? `<span class="cal-more">+${more}</span>` : ''}</button>`;
                })
                .join('')}</div>${(() => {
                const pl = [...new Set(dph.map((p) => p.place).filter(Boolean))].join(' · ');
                return pl ? `<p class="sub cal-pl">${I.pin} ${esc(pl)}</p>` : '';
              })()}<button class="btn b2" data-a="goAlbum" data-k="${sel}" style="min-height:40px">${I.photo} ${t('phOpenAlbum')} · ${dph.length}</button></div>`
            : '',
          side = `<p class="mono sub h2">// ${fmt(sel, { day: 'numeric', month: 'long' })}</p>${freeSection}${day.map(evCard).join('')}${photoSec}<p class="mono sub h2" style="margin-top:22px">// ${t('soon')}</p>${upcoming.length ? evCard(upcoming[0]) + upcomingPrepCard(upcoming[0]) : `<div class="empty">${t('noUpcoming')}</div>`}`;
        return `<div class="main">${head(cur.toLocaleDateString(loc(), { month: 'long', year: 'numeric' }), t('shared'), dayHeadBadge())}${petCardHtml()}<div class="cg"><div class="card cal"><div class="cn"><button class="ib" data-a="mo" data-n="-1" aria-label="prev" style="width:40px;height:40px">${I.back}</button><b>${cur.toLocaleDateString(loc(), { month: 'long', year: 'numeric' })}</b><button class="ib" data-a="mo" data-n="1" aria-label="next" style="width:40px;height:40px;transform:scaleX(-1)">${I.back}</button></div><div class="g7 wk">${wk}</div><div class="g7">${cells.join('')}</div></div><div>${side}</div></div></div><button class="fab" data-a="fabMenu" aria-label="${t('add')}">+</button>`;
      }

      // Nút +: chọn "Ngày rảnh" hoặc "Tạo kế hoạch mới".
      // CSS gợi ý: .fab-sheet-card { display:flex; flex-direction:column; gap:10px; width:min(320px, 90vw); }
      function closeFabSheet() {
        const el = document.getElementById('fab-sheet');
        if (el) el.remove();
      }
      document.addEventListener('click', (ev) => {
        const target = ev.target;
        if (!target || !target.closest) return;
        const opener = target.closest('[data-a="fabMenu"]');
        if (opener) {
          if (document.getElementById('fab-sheet')) return closeFabSheet();
          const wrap = document.createElement('div');
          wrap.id = 'fab-sheet';
          wrap.className = 'mod';
          wrap.dataset.a = 'fabClose';
          const hasFree = C.ev.some((item) => isFreeDay(item) && item.date == sel && item.by == S.user.id);
          wrap.innerHTML = `<div class="card fab-sheet-card" role="dialog" aria-label="${esc(t('add'))}">
      <p class="mono sub fab-sheet-date">// ${esc(fmt(sel, { day: 'numeric', month: 'long' }))}</p>
      <button class="fab-opt" data-a="freeNew"${hasFree ? ' disabled' : ''}><span class="fab-opt-ic" aria-hidden="true">${freeIcon({ by: S.user.id })}</span><span class="fab-opt-tx"><b>${esc(t('freeDay'))}</b><small>${esc(t('freeDayAddThis'))}</small></span></button>
      <button class="fab-opt" data-a="new"><span class="fab-opt-ic" aria-hidden="true">+</span><span class="fab-opt-tx"><b>${esc(t('add'))}</b></span></button>
      <button class="btn b2" data-a="fabClose" style="min-height:44px">${esc(t('cancel'))}</button>
    </div>`;
          document.body.appendChild(wrap);
          return;
        }
        const sheet = target.closest('#fab-sheet');
        if (!sheet) return;
        const act = target.closest('[data-a]');
        // Bấm vào khoảng trống bên trong card thì không đóng.
        if (act === sheet && target !== sheet) return;
        // Đóng sau khi core xử lý xong freeNew / new.
        setTimeout(closeFabSheet, 0);
      });

      // Walk the two characters across the stage using the supplied sprite frames.
      const PET_ACT_MS = 900;
      const petWalkerState = [
        { x: 31, direction: 1, frame: 0, actUntil: 0 },
        { x: 69, direction: -1, frame: 0, actUntil: 0 },
      ];
      const petSnowTiming = [
        [9, 4], [15, 10], [23, 17], [12, 9.5], [18, 3.5], [27, 8],
      ];
      function petSnowHtml() {
        const now = performance.now() / 1000;
        return `<div class="pet-snow" aria-hidden="true">${petSnowTiming.map(([duration, offset]) => `<i style="animation-delay:-${(now + offset).toFixed(3)}s;animation-duration:${duration}s"></i>`).join('')}</div>`;
      }
      const petFrames = {
        m: { left: ['boy_walk_left_0.png', 'boy_walk_left_1.png', 'boy_walk_left_2.png'], right: ['boy_walk_right_0.png', 'boy_walk_right_1.png', 'boy_walk_right_2.png'], act: 'boy_act.png' },
        f: { left: ['girl_walk_left_0.png', 'girl_walk_left_1.png', 'girl_walk_left_2.png'], right: ['girl_walk_right_0.png', 'girl_walk_right_1.png', 'girl_walk_right_2.png'], act: 'girl_act.png' },
      };
      Object.values(petFrames).flatMap((gender) => [...gender.left, ...gender.right, gender.act]).forEach((file) => {
        const image = new Image();
        image.src = './img/pet/' + file;
      });

      function setPetFrame(walker, frameIndex = 0) {
        const image = walker.querySelector('.pet-character-image');
        const state = petWalkerState[Number(walker.dataset.index)];
        if (!image || !state || state.actUntil > Date.now()) return;
        const frames = petFrames[walker.dataset.gender] || petFrames.f;
        const direction = state.direction > 0 ? 'right' : 'left';
        state.frame = frameIndex % frames[direction].length;
        const frame = frames[direction][frameIndex % frames[direction].length];
        image.src = './img/pet/' + frame;
        const button = walker.querySelector('.pet-character-action');
        if (button) button.dataset.base = image.src;
      }

      function petAct(walker) {
        const index = Number(walker && walker.dataset.index),
          state = petWalkerState[index];
        if (!walker || !state || state.actUntil > Date.now()) return;
        const frames = petFrames[walker.dataset.gender] || petFrames.f;
        const image = walker.querySelector('.pet-character-image');
        if (!image) return;
        state.actUntil = Date.now() + PET_ACT_MS;
        image.src = './img/pet/' + frames.act;
        walker.querySelector('.pet-character-action')?.classList.add('is-act');
        setTimeout(() => {
          state.actUntil = 0;
          const current = document.querySelector(`.pet-walker[data-index="${index}"]`);
          current?.querySelector('.pet-character-action')?.classList.remove('is-act');
          if (current) setPetFrame(current, state.frame);
        }, PET_ACT_MS);
      }

      let petFrameTick = 0;
      setInterval(() => {
        const stage = document.querySelector('.pet-stage');
        if (!stage) return;
        const walkers = [...stage.querySelectorAll('.pet-walker')];
        if (walkers.length !== 2) return;
        walkers.forEach((walker, index) => {
          const state = petWalkerState[index];
          let x = state.x;
          let direction = state.direction;
          x += direction * 0.48;
          if (x <= 18 || x >= 82) {
            direction *= -1;
            x = Math.max(18, Math.min(82, x));
          }
          state.x = x;
          state.direction = direction;
          walker.dataset.x = String(x);
          walker.dataset.direction = String(direction);
          walker.style.left = x + '%';
          setPetFrame(walker, Math.floor(petFrameTick / 2));
        });
        // Characters walk through each other; contact alone does not trigger an act pose.
        petFrameTick++;
      }, 180);

      function petTouch(btn) {
        const walker = btn && btn.closest('.pet-walker');
        if (!walker) return;
        petAct(walker);
      }

      // Tự xử lý click, không cần sửa file actions/core.
      document.addEventListener('click', (ev) => {
        const btn = ev.target.closest && ev.target.closest('[data-a="petTouch"]');
        if (!btn) return;
        petTouch(btn);
        if (typeof sendPetTouch == 'function') sendPetTouch();
      });

      function petMessageRowHtml(message) {
        const own = S.user && message.by == S.user.id,
          person = P[message.by] || (own ? S.user : {}),
          name = own ? t('you') : person.name || t('petPartner'),
          gender = person.gender || (own ? me() : pr()),
          confirmed = /^[0-9]+$/.test(String(message.id)),
          original = message.replyTo == null
            ? null
            : (PET.messages || []).find((item) => String(item.id) == String(message.replyTo));
        let status = '';
        if (own) {
          if (message.readAt) status = 'petReceiptRead';
          else if (message.receivedAt) status = 'petReceiptReceived';
          else if (message.failed) status = 'petReceiptLocal';
          else if (String(message.id).startsWith('local-')) status = 'petReceiptSending';
          else status = 'petReceiptSent';
        }
        const receipt = status ? ` · <span class="pet-message-receipt${message.readAt ? ' is-read' : ''}">${esc(t(status))}</span>` : '',
          edited = message.editedAt ? ` · ${esc(t('petMessageEdited'))}` : '',
          originalOwn = original && S.user && original.by == S.user.id,
          originalName = original ? (originalOwn ? t('you') : (P[original.by] || {}).name || t('petPartner')) : '',
          replyPreview = message.replyTo == null
            ? ''
            : `<div class="pet-message-reply-preview"><b>${esc(original ? originalName : t('petMessageReply'))}</b><span>${esc(original ? original.text : t('petMessageOriginalMissing'))}</span></div>`,
          actions = confirmed
            ? `<div class="pet-message-actions"><button type="button" data-a="petMessageReply" data-id="${message.id}">${esc(t('petMessageReply'))}</button>${own ? `<button type="button" data-a="petMessageEdit" data-id="${message.id}">${esc(t('petMessageEdit'))}</button>` : ''}</div>`
            : '';
        return `<article class="pet-message-row${own ? ' is-own' : ''}" data-pet-message-id="${esc(message.id)}"><span class="pet-message-avatar" aria-hidden="true"><img src="./img/pet/mini_${gender == 'm' ? 'boy' : 'girl'}.png" alt=""></span><div class="pet-message-bubble">${replyPreview}<p>${esc(message.text)}</p><div class="pet-message-meta"><small>${esc(name)} · ${new Date(message.at).toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit' })}${edited}${receipt}</small>${actions}</div></div></article>`;
      }

      function petMessageListHtml() {
        const messages = (PET && PET.messages) || [];
        return messages.length
          ? messages.map(petMessageRowHtml).join('')
          : `<div class="empty">${esc(t('petMessagesEmpty'))}</div>`;
      }

      function paintPetMessages() {
        document.querySelectorAll('[data-pet-message-list]').forEach((list) => {
          const thread = list.closest('.pet-message-thread');
          const atBottom = thread && thread.scrollHeight - thread.scrollTop - thread.clientHeight < 32;
          const html = petMessageListHtml();
          if (list.petMessageHtml !== html) {
            list.innerHTML = html;
            list.petMessageHtml = html;
            if (atBottom) thread.scrollTop = thread.scrollHeight;
          }
          requestAnimationFrame(acknowledgePetMessages);
        });
      }

      function petMessagesHtml() {
        const other = partner(),
          presenceName = (other && other.name) || t('petPartner'),
          editing = (PET.messages || []).find((message) => String(message.id) == String(petMessageEditId)),
          replying = (PET.messages || []).find((message) => String(message.id) == String(petMessageReplyId)),
          contextMessage = editing || replying,
          contextOwn = contextMessage && S.user && contextMessage.by == S.user.id,
          contextName = contextMessage ? (contextOwn ? t('you') : (P[contextMessage.by] || {}).name || t('petPartner')) : '',
          context = contextMessage
            ? `<div class="pet-message-context"><div><b>${esc(editing ? t('petMessageEditing') : t('petMessageReplyingTo').replace('{name}', contextName))}</b><span>${esc(contextMessage.text)}</span></div><button type="button" class="ib" data-a="petMessageContextCancel" aria-label="${esc(t('cancel'))}">${I.x}</button></div>`
            : '',
          inputValue = editing ? editing.text : '';
        return `<div class="mod pet-message-modal" data-a="petMessagesClose"><section class="card pet-message-window" role="dialog" aria-modal="true" aria-labelledby="pet-message-title"><header class="pet-message-head"><div><p class="mono sub">// ${esc(PET.name || 'Mochi')}</p><h2 id="pet-message-title" class="px">${esc(t('petMessages'))}</h2><p class="pet-message-presence${partnerOnline ? ' is-online' : ''}" data-pet-presence>${esc(presenceName)} · ${esc(t(partnerOnline ? 'petOnline' : 'petOffline'))}</p></div><button type="button" class="ib" data-a="petMessagesClose" aria-label="${esc(t('close'))}">${I.x}</button></header>${petMessageError ? `<p class="hint pet-message-error">${esc(t('petMessagesSetup'))}</p>` : ''}<div class="pet-message-thread"><div class="pet-message-list" data-pet-message-list>${petMessageListHtml()}</div><div class="pet-message-typing" data-pet-typing ${partnerPetTyping ? '' : 'hidden'}><span class="pet-typing-dots" aria-hidden="true"><i></i><i></i><i></i></span><span data-pet-typing-text>${esc(t('petTyping').replace('{name}', presenceName))}</span></div></div><form class="pet-message-compose" data-f="petMessage">${context}<textarea class="in" name="text" data-pet-message-input rows="1" enterkeyhint="enter" maxlength="120" autocomplete="off" required placeholder="${esc(t('petTextPlaceholder'))}" aria-label="${esc(t('petTextPlaceholder'))}">${esc(inputValue)}</textarea><button class="btn b1" type="submit">${esc(editing ? t('save') : t('petTextSend'))}</button></form></section></div>`;
      }

      function petCardHtml() {
        const fallback = { name: 'MINI CHIBI', reactions: [], messages: [] };
        const pet = PET || fallback;
        const reactions = ['❤️', '🥰', '😘', '😍', '🤗', '😂', '🥺', '😭', '😡', '😴', '😎', '💔', '✨', '🎉', '🔥'];
        const feelingChoices = [
          ['loved', 'feelingLoved'], ['heartbroken', 'feelingHeartbroken'], ['angry', 'feelingAngry'], ['sick', 'feelingSick'],
        ];
        const feelingImage = (index, gender, feeling = feelingChoices[index]?.[0]) => {
          const image = ({
            love: 'happy', excited: 'happy', loved: 'happy', calm: 'happy', shy: 'happy',
            heartbroken: 'sad', confused: 'sad', worried: 'sad', overwhelmed: 'sad',
            angry: 'angry', sick: 'sick', sleepy: 'sick',
          })[feeling] || 'happy';
          return `<img class="feeling-sprite" src="./img/pet/feeling/${gender == 'm' ? 'b' : 'g'}-${image}.png" alt="" draggable="false">`;
        };
        const user = S.user || {};
        const other = partner();
        const people = [
          { id: user.id, name: user.name, gender: user.gender || 'f' },
          other || { id: 'partner', name: t('petPartner'), gender: me() == 'm' ? 'f' : 'm' },
        ];
        const latestMessageByUser = {};
        (pet.messages || []).forEach((message) => {
          if (message && message.by) latestMessageByUser[message.by] = message;
        });
        const character = (person, index) => {
          const gender = person.gender == 'm' ? 'm' : 'f';
          const state = petWalkerState[index];
          const direction = state.direction > 0 ? 'right' : 'left';
          const acting = state.actUntil > Date.now();
          const image = acting ? petFrames[gender].act : petFrames[gender][direction][state.frame % 3];
          const reaction = (pet.reactions || []).find((r) => r.by == person.id && reactions.includes(r.emoji));
          const latestMessage = latestMessageByUser[person.id];
          const reactionIsNewer = reaction && (!latestMessage || Number(reaction.at || 0) > Number(latestMessage.at || 0));
          const bubble = reactionIsNewer
            ? reaction
            : latestMessage
              ? { emoji: latestMessage.text, by: latestMessage.by, isMessage: true }
              : reaction;
          const genderLabel = t(gender == 'm' ? 'petMale' : 'petFemale');
          const ownBubble = person.id == user.id;
          const isTextBubble = bubble && !reactions.includes(bubble.emoji);
          // Mình: gửi ❤️ như cũ. Đối phương: chạm -> đổi ảnh act.
          const action = ownBubble
            ? 'data-a="petReact" data-emoji="❤️"'
            : 'data-a="petTouch"';
          return `<div class="pet-walker pet-walker-${index == 0 ? 'left' : 'right'}" style="left:${state.x}%" data-index="${index}" data-gender="${gender}" data-x="${state.x}" data-direction="${state.direction}" aria-label="${esc(person.name || genderLabel)}">
          <button class="pet-character-action" type="button" ${action} data-base="./img/pet/${image}" data-act="./img/pet/${gender == 'm' ? 'boy_act.png' : 'girl_act.png'}" aria-label="${esc(t('petSend'))}">
          <img class="pet-character-image" src="./img/pet/${image}" alt="${esc(genderLabel)}"></button>${bubble ? `<div class="pet-chat-bubble${isTextBubble ? ' is-text' : ''}" title="${esc(person.name || '')}"><span>${esc(bubble.emoji)}</span>${ownBubble && !bubble.isMessage ? `<button type="button" data-a="petClear" aria-label="${esc(t('petDeleteBubble'))}">×</button>` : ''}</div>` : ''}</div>`;
        };
        // Xếp bi như bi thật: mỗi viên rơi từ trên xuống, lăn vào chỗ trũng rồi nằm yên.
        // Toạ độ tính theo cqw (1% bề rộng vùng lọ) nên khớp mọi kích thước màn hình.
        const JAR_W = 100, JAR_H = 82, JAR_CR = 15; // JAR_H khớp aspect-ratio: 100 / 82 của .feelings-jar-fill; JAR_CR = độ bo góc đáy lọ
        const jarHash = (value) => {
          let h = 2166136261;
          for (const ch of String(value)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
          return ((h >>> 0) % 10000) / 10000;
        };
        const jarLayout = (list) => {
          let result = { d: 24, placed: [] };
          for (let d = 24; d >= 8; d -= 1) { // nhiều bi -> bi nhỏ dần để vẫn nằm trong lọ
            const r = d / 2, placed = [];
            const floorAt = (x) => { // đáy lọ bo tròn: bi không chui ra khỏi góc cong
              if (r >= JAR_CR) return r;
              const dx = x < JAR_CR ? JAR_CR - x : x > JAR_W - JAR_CR ? x - (JAR_W - JAR_CR) : 0;
              return dx ? JAR_CR - Math.sqrt(Math.max((JAR_CR - r) ** 2 - dx * dx, 0)) : r;
            };
            const rest = (x) => {
              let y = floorAt(x);
              for (const q of placed) {
                const dx = Math.abs(x - q.x);
                if (dx < d) y = Math.max(y, q.y + Math.sqrt(d * d - dx * dx));
              }
              return y;
            };
            let fits = true;
            list.forEach((f, i) => {
              const key = f.id ?? i;
              let x = r + jarHash(key) * (JAR_W - d), y = rest(x);
              for (let n = 0; n < 400; n++) { // lăn xuống chỗ thấp hơn cho tới khi được đỡ
                const xl = Math.max(r, x - 0.5), xr = Math.min(JAR_W - r, x + 0.5);
                const yl = rest(xl), yr = rest(xr);
                if (Math.min(yl, yr) < y - 1e-6) { if (yl <= yr) { x = xl; y = yl; } else { x = xr; y = yr; } } else break;
              }
              placed.push({ x, y, rot: (jarHash('r' + key) - 0.5) * 50 });
              if (y + r > JAR_H) fits = false;
            });
            result = { d, placed };
            if (fits) break;
          }
          return result;
        };
        // Lọ thuỷ tinh vẽ bằng SVG (viewBox 300x330): nữ = hồng, nam = xanh.
        // Lớp sau nằm dưới bi, lớp trước (phản chiếu) nằm trên bi. Nắp (.feelings-jar-lid) mở ra khi thả bi.
        const jarOuter = 'M90 42H210V58C210 80 266 92 266 140V258C266 284 246 298 220 298H80C54 298 34 284 34 258V140C34 92 90 80 90 58Z';
        const jarInner = 'M98 50H202V58C202 86 258 98 258 142V256C258 276 244 290 222 290H78C56 290 42 276 42 256V142C42 98 98 86 98 58Z';
        const jarPalette = {
          f: { glass: '#ffc6e0', deep: '#ff9cc8', lid: ['#c9588f', '#ffd6e8', '#ec86b8', '#fff0f7', '#b94a80'], band: ['#a83d73', '#f6a9cc', '#cf6a9c', '#a03a6e'] },
          m: { glass: '#c2deff', deep: '#8dbcff', lid: ['#4a78cf', '#d4e6ff', '#78a4ee', '#eef5ff', '#3f68b8'], band: ['#3558a3', '#a9c8f7', '#5f88d6', '#314f94'] },
        };
        const jarBackSvg = (g) => {
          const c = jarPalette[g == 'm' ? 'm' : 'f'], k = g == 'm' ? 'm' : 'f';
          return `<svg class="feelings-jar-svg" viewBox="0 0 300 330" aria-hidden="true" focusable="false">
          <defs>
            <radialGradient id="fjShadow-${k}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="${c.deep}" stop-opacity=".55"/><stop offset="1" stop-color="${c.deep}" stop-opacity="0"/></radialGradient>
            <linearGradient id="fjGlass-${k}" x1="0" x2="1" y1="0" y2="0"><stop offset="0" stop-color="${c.glass}" stop-opacity=".6"/><stop offset=".2" stop-color="${c.glass}" stop-opacity=".16"/><stop offset=".8" stop-color="${c.glass}" stop-opacity=".14"/><stop offset="1" stop-color="${c.glass}" stop-opacity=".58"/></linearGradient>
            <linearGradient id="fjInner-${k}" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".05"/><stop offset="1" stop-color="${c.deep}" stop-opacity=".32"/></linearGradient>
            <linearGradient id="fjLid-${k}" x1="0" x2="1" y1="0" y2="0">${c.lid.map((col, i) => `<stop offset="${[0, .22, .5, .78, 1][i]}" stop-color="${col}"/>`).join('')}</linearGradient>
            <linearGradient id="fjBand-${k}" x1="0" x2="1" y1="0" y2="0">${c.band.map((col, i) => `<stop offset="${[0, .3, .6, 1][i]}" stop-color="${col}"/>`).join('')}</linearGradient>
          </defs>
          <ellipse cx="150" cy="306" rx="104" ry="11" fill="url(#fjShadow-${k})"/>
          <path d="${jarOuter}" fill="url(#fjGlass-${k})"/>
          <path d="${jarInner}" fill="url(#fjInner-${k})"/>
          <rect x="86" y="38" width="128" height="11" rx="3" fill="url(#fjBand-${k})"/>
          <g class="feelings-jar-lid">
            <rect x="82" y="6" width="136" height="34" rx="7" fill="url(#fjLid-${k})"/>
            <rect x="82" y="6" width="136" height="5" rx="2.5" fill="#fff" opacity=".55"/>
            <path d="M96 16V34M108 16V34M120 16V34M132 16V34M144 16V34M156 16V34M168 16V34M180 16V34M192 16V34M204 16V34" stroke="#000" stroke-opacity=".08" stroke-width="2"/>
          </g>
        </svg>`;
        };
        const jarFrontSvg = (g) => {
          const c = jarPalette[g == 'm' ? 'm' : 'f'];
          return `<svg class="feelings-jar-svg" viewBox="0 0 300 330" aria-hidden="true" focusable="false">
          <defs><filter id="fjSoft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="1.2"/></filter></defs>
          <path d="${jarOuter}" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="2.5"/>
          <path d="${jarInner}" fill="none" stroke="${c.deep}" stroke-opacity=".5" stroke-width="1.5"/>
          <g fill="none" stroke-linecap="round" filter="url(#fjSoft)">
            <path d="M52 150C50 188 50 228 57 262" stroke="#fff" stroke-opacity=".7" stroke-width="6"/>
            <path d="M62 118C72 100 90 92 104 84" stroke="#fff" stroke-opacity=".6" stroke-width="5"/>
            <path d="M104 66V56" stroke="#fff" stroke-opacity=".6" stroke-width="4"/>
            <path d="M250 160V236" stroke="#fff" stroke-opacity=".3" stroke-width="4"/>
            <path d="M82 291Q150 301 218 291" stroke="#fff" stroke-opacity=".3" stroke-width="3"/>
          </g>
        </svg>`;
        };
        const feelingsJar = () => {
          const jarPeople = people
            .map((person) => ({
              ...person,
              feelings: (pet.feelings || []).filter((feeling) => feeling.by == person.id),
            }))
            .sort((a, b) => (a.gender == 'f' ? -1 : 1) - (b.gender == 'f' ? -1 : 1));
          return `<div class="feelings-jar-view">
            <div class="feelings-jar-pair">${jarPeople.map((person) => {
              const isOwn = person.id == user.id,
                feelingSheetGender = person.gender == 'm' ? 'm' : 'f',
                label = isOwn ? t('feelingsJarYou') : t('feelingsJarPartner'),
                opening = jarFeelingDropId != null && person.feelings.some((f) => f.dropKey == jarFeelingDropId);
              return `<article class="feelings-jar-member">
                <h3>${esc(person.name || label)}</h3>
                <div class="feelings-jar-art is-${feelingSheetGender == 'm' ? 'male' : 'female'}${opening ? ' is-opening' : ''}">
                  ${jarBackSvg(feelingSheetGender)}
                  <div class="feelings-jar-fill" aria-label="${esc(label)}">${(() => {
                    const ordered = person.feelings
                      .map((f, i) => ({ f, i }))
                      .sort((a, b) => (Date.parse(a.f.created_at || a.f.createdAt || '') || 0) - (Date.parse(b.f.created_at || b.f.createdAt || '') || 0) || a.i - b.i)
                      .map((o) => o.f);
                    const layout = jarLayout(ordered), r = layout.d / 2;
                    return ordered.map((feeling, i) => {
                      const pos = layout.placed[i],
                        index = feelingChoices.findIndex(([key]) => key == feeling.feeling),
                        name = t(feelingChoices[index]?.[1] || 'feelingsJar'),
                        style = `--d:${layout.d}cqw;left:${(pos.x - r).toFixed(2)}cqw;bottom:${(pos.y - r).toFixed(2)}cqw;--rot:${pos.rot.toFixed(1)}deg;--fall:${(JAR_H - (pos.y - r) + 45).toFixed(1)}cqw`;
                      return `<button type="button" class="feelings-jar-marble${jarFeelingDropId != null && feeling.dropKey == jarFeelingDropId ? ' is-dropping' : ''}" style="${style}" data-a="petFeelingView" data-id="${esc(String(feeling.id))}" aria-label="${esc(name + '. ' + (feeling.reason || t('feelingNoReason')))}" title="${esc(name + ': ' + (feeling.reason || t('feelingNoReason')))}">${feelingImage(Math.max(index, 0), feeling.gender || feelingSheetGender, feeling.feeling)}</button>`;
                    }).join('');
                  })()}</div>
                  ${jarFrontSvg(feelingSheetGender)}
                </div>
              </article>`;
            }).join('')}</div>
            <p class="feelings-jar-hint">${esc(t('feelingsJarHint'))}</p>
            <div class="feelings-jar-options">${feelingChoices.map(([key, label], index) => `<button type="button" data-a="petReact" data-feeling="${key}" data-index="${index}" aria-label="${esc(t(label))}" title="${esc(t(label))}">${feelingImage(index, me())}</button>`).join('')}</div>
          </div>`;
        };
        const feelingPrompt = () => {
          if (!feelingDraft) return '';
          const selected = feelingChoices[feelingDraft.index] || feelingChoices[0],
            sheetGender = me() == 'm' ? 'm' : 'f';
          return `<div class="mod feeling-reason-modal" data-a="petFeelingClose"><form class="card" data-f="petFeeling" role="dialog" aria-modal="true" aria-label="${esc(t('feelingReasonTitle'))}">
            <div class="feeling-reason-heading">${feelingImage(feelingDraft.index, sheetGender)}<div><h2>${esc(t('feelingReasonTitle'))}</h2><p>${esc(t(selected[1]))}</p></div></div>
            <div class="fl"><label class="lb" for="feelingReason">${esc(t('feelingReasonLabel'))}</label><textarea class="in" id="feelingReason" name="reason" maxlength="240" rows="3" autofocus placeholder="${esc(t('feelingReasonPlaceholder'))}"></textarea></div>
            <div class="row2"><button type="button" class="btn b2" data-a="petFeelingClose">${esc(t('feelingReasonCancel'))}</button><button class="btn b1">${esc(t('feelingReasonSave'))}</button></div>
          </form></div>`;
        };
        const feelingDetails = () => {
          if (!feelingViewing) return '';
          const index = feelingChoices.findIndex(([key]) => key == feelingViewing.feeling),
            name = t(feelingChoices[index]?.[1] || 'feelingsJar'),
            gender = feelingViewing.gender || me();
          return `<div class="mod feeling-reason-modal" data-a="petFeelingClose"><section class="card feeling-details" role="dialog" aria-modal="true" aria-label="${esc(name)}">
            <div class="feeling-reason-heading">${feelingImage(Math.max(index, 0), gender, feelingViewing.feeling)}<div><h2>${esc(name)}</h2><p>${esc(feelingViewing.byName || '')}</p></div></div>
            <p class="feeling-view-reason">${esc(feelingViewing.reason || t('feelingNoReason'))}</p>
            <div class="row2"><button type="button" class="btn b1" data-a="petFeelingClose">${esc(t('feelingClose'))}</button></div>
          </section></div>`;
        };
        return `<section class="pet-card${petCardView == 'jar' ? ' is-feelings-jar' : ''}" aria-label="${esc(t('petKicker'))}">
          ${petSnowHtml()}
          <div class="pet-top"><div><p class="pet-kicker">${esc(t('petKicker'))}</p><div class="pet-heading">${petCardView == 'jar' ? esc(t('feelingsJar')) : `${esc(pet.name || fallback.name)} <button type="button" class="pet-rename" data-a="petName" aria-label="${esc(t('petRename'))}">&#9998;</button>`}</div><p class="pet-hint">${esc(petCardView == 'jar' ? t('feelingsJarHint') : t('petSub'))}</p></div><div class="pet-top-actions"><button type="button" class="pet-view-toggle" data-a="petViewToggle" aria-label="${esc(petCardView == 'jar' ? t('petViewToggle') : t('feelingsJar'))}">${petCardView == 'jar' ? ' Pet' : ' Feelings Jar'}</button><span class="pet-hearts">&#9825; &#9825; &#9825;</span></div></div>
          ${petCardView == 'jar' ? feelingsJar() : `<div class="pet-stage">${people.map(character).join('')}</div>
          <div class="pet-chat">
            <form class="pet-text-form" data-f="petText">
              <textarea class="in" name="text" data-pet-message-input rows="1" enterkeyhint="enter" maxlength="120" autocomplete="off" placeholder="${esc(t('petTextPlaceholder'))}" aria-label="${esc(t('petTextPlaceholder'))}" required></textarea>
              <button class="pet-reactions-toggle" type="button" data-a="petReactionsToggle" aria-label="${esc(t('petReactionsToggle'))}" aria-expanded="${petReactionsOpen}">+</button>
              <button class="btn b2" type="submit">${esc(t('petTextSend'))}</button>
              <button class="btn b2 pet-messages-open" type="button" data-a="petMessagesOpen">${esc(t('petMessages'))}</button>
            </form>
            <div class="pet-reactions" ${petReactionsOpen ? '' : 'hidden'} aria-hidden="${!petReactionsOpen}">${reactions.map((e) => `<button type="button" data-a="petReact" data-emoji="${e}" aria-label="${esc(t('petReactOption').replace('{emoji}', e))}">${e}</button>`).join('')}</div>
          </div>`}
        </section>${petCardView == 'jar' ? feelingPrompt() : ''}${petCardView == 'jar' ? feelingDetails() : ''}${petMessagesOpen ? petMessagesHtml() : ''}`;
      }
