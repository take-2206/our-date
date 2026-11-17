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
            free = entries.filter(isFreeDay),
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
          freeDays = selectedEntries.filter(isFreeDay),
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

      function petMessagesHtml() {
        const messages = PET.messages || [];
        return `<div class="mod pet-message-modal" data-a="petMessagesClose"><section class="card pet-message-window" role="dialog" aria-modal="true" aria-labelledby="pet-message-title"><header class="pet-message-head"><div><p class="mono sub">// ${esc(PET.name || 'Mochi')}</p><h2 id="pet-message-title" class="px">${esc(t('petMessages'))}</h2></div><button type="button" class="ib" data-a="petMessagesClose" aria-label="${esc(t('close'))}">${I.x}</button></header>${petMessageError ? `<p class="hint pet-message-error">${esc(t('petMessagesSetup'))}</p>` : ''}<div class="pet-message-thread">${messages.length ? messages.map((message) => {
          const own = S.user && message.by == S.user.id,
            name = own ? t('you') : (P[message.by] || {}).name || t('petPartner');
          return `<article class="pet-message-row${own ? ' is-own' : ''}"><div class="pet-message-bubble"><p>${esc(message.text)}</p><small>${esc(name)} · ${new Date(message.at).toLocaleTimeString(loc(), { hour: '2-digit', minute: '2-digit' })}</small></div></article>`;
        }).join('') : `<div class="empty">${esc(t('petMessagesEmpty'))}</div>`}</div><form class="pet-message-compose" data-f="petMessage"><input class="in" name="text" maxlength="120" autocomplete="off" required placeholder="${esc(t('petTextPlaceholder'))}" aria-label="${esc(t('petTextPlaceholder'))}"><button class="btn b1">${esc(t('petTextSend'))}</button></form></section></div>`;
      }

      function petCardHtml() {
        const fallback = { name: 'MINI CHIBI', reactions: [], messages: [] };
        const pet = PET || fallback;
        const reactions = ['❤️', '🥰', '😘', '😍', '🤗', '😂', '🥺', '😭', '😡', '😴', '😎', '💔', '✨', '🎉', '🔥'];
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
          const bubble = latestMessage
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
        return `<section class="pet-card" aria-label="${esc(t('petKicker'))}">
          ${petSnowHtml()}
          <div class="pet-top"><div><p class="pet-kicker">${esc(t('petKicker'))}</p><div class="pet-heading">${esc(pet.name || fallback.name)} <button type="button" class="pet-rename" data-a="petName" aria-label="${esc(t('petRename'))}">&#9998;</button></div><p class="pet-hint">${esc(t('petSub'))}</p></div><span class="pet-hearts">&#9825; &#9825; &#9825;</span></div>
          <div class="pet-stage">${people.map(character).join('')}</div>
          <div class="pet-chat">
            <form class="pet-text-form" data-f="petText">
              <input class="in" type="text" name="text" maxlength="120" autocomplete="off" placeholder="${esc(t('petTextPlaceholder'))}" aria-label="${esc(t('petTextPlaceholder'))}" required>
              <button class="pet-reactions-toggle" type="button" data-a="petReactionsToggle" aria-label="${esc(t('petReactionsToggle'))}" aria-expanded="${petReactionsOpen}">+</button>
              <button class="btn b2" type="submit">${esc(t('petTextSend'))}</button>
              <button class="btn b2 pet-messages-open" type="button" data-a="petMessagesOpen">${esc(t('petMessages'))}</button>
            </form>
            <div class="pet-reactions" ${petReactionsOpen ? '' : 'hidden'} aria-hidden="${!petReactionsOpen}">${reactions.map((e) => `<button type="button" data-a="petReact" data-emoji="${e}" aria-label="${esc(t('petReactOption').replace('{emoji}', e))}">${e}</button>`).join('')}</div>
          </div>
        </section>${petMessagesOpen ? petMessagesHtml() : ''}`;
      }
