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
      function dayCard() {
        const sn = C.since,
          self = P[(S.user || {}).id] || S.user || {},
          other = partner(),
          names = [self.name, other && other.name].filter(Boolean),
          nameLine = names.length
            ? `<p class="dc-names">${names.map(esc).join(' <span aria-hidden="true">&#9829;</span> ')}</p>`
            : '';
        if (!sn)
          return `<div class="card dc"><div class="pair">${av(me(), 44)}${av(pr(), 44)}</div><div class="dcb">${nameLine}<button class="btn b1" data-a="sedit" style="min-height:44px">${t('dcSet')}</button></div></div>`;
        const n = Math.round((today0() - parse(sn)) / 864e5) + 1,
          nx = MS.find((x) => x > n) || Math.ceil((n + 1) / 365) * 365,
          sub = `${t('dcFrom')} ${fmt(sn, { day: 'numeric', month: 'numeric', year: 'numeric' })}${n > 0 ? ' · ' + t('dcNext').replace('{n}', nx - n).replace('{m}', nx) : ''}`,
          ann = anniversaryInfo(sn),
          annText = ann.today
            ? t('dcAnnToday').replace('{n}', ann.years)
            : t('dcAnnNext').replace('{n}', ann.days).replace('{y}', ann.years);
        return `<div class="card dc"><div class="pair">${av(me(), 44)}${av(pr(), 44)}</div><div class="dcb">${nameLine}<div class="dcv"><b class="px">${Math.max(n, 0)}</b><span>${t('dc')}</span></div><p class="sub mono" style="font-size:12px;margin-top:2px">${sub}</p><p class="dc-ann mono">${annText}</p></div><button class="ib" data-a="sedit" aria-label="${t('dcTtl')}">${sv('<path d="M4 20h4L19 9l-4-4L4 16v4z"/>')}</button></div>`;
      }
      function vSince() {
        return `<div class="mod" data-a="sclose"><form class="card" data-f="since" role="dialog" aria-label="${t('dcTtl')}"><h2 class="px" style="font-size:16px;color:var(--pk);margin-bottom:16px">${t('dcTtl')}</h2><div class="fl"><label class="lb" for="sd">${t('dt')}</label><input class="in" id="sd" name="since" type="date" data-calendar inputmode="none" required max="${key(new Date())}" value="${esc(C.since || '')}"></div><div class="row2"><button type="button" class="btn b2" data-a="sclose">${t('cancel')}</button><button class="btn b1">${t('save')}</button></div></form></div>`;
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
            `<button class="cl${d.getMonth() != m ? ' o' : ''}${k == tk ? ' td' : ''}${k == sel ? ' sl' : ''}${es.length ? ' has-plan' : ''}${free.length ? ' has-free' : ''}${np ? ' has-ph' : ''}" data-a="day" data-k="${k}" aria-label="${fmt(k, { dateStyle: 'full' })}${es.length ? `, ${es.length} ${t('det')}` : ''}${free.length ? `, ${free.length} ${t('freeDay')}` : ''}${np ? `, ${np} ${t('phMore')}` : ''}"><span>${d.getDate()}</span>${es.length ? '<span class="heart-light" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span>' : ''}${free.length ? `<span class="free-day-markers" aria-hidden="true">${free.slice(0, 2).map(() => '<i>☀</i>').join('')}</span>` : ''}${np ? '<i class="ph-dot" aria-hidden="true"></i>' : ''}</button>`,
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
          freeAction = freeDays.some((item) => item.by == S.user.id)
            ? ''
            : `<button class="btn b2 free-day-inline" data-a="freeNew"><span aria-hidden="true">☀</span> ${t('freeDayAddThis')}</button>`,
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
          side = `<p class="mono sub h2">// ${fmt(sel, { day: 'numeric', month: 'long' })}</p>${freeSection}${day.map(evCard).join('')}${photoSec}${freeAction}<p class="mono sub h2" style="margin-top:22px">// ${t('soon')}</p>${upcoming.length ? upcoming.map(evCard).join('') : `<div class="empty">${t('noUpcoming')}</div>`}`;
        return `<div class="main">${head(cur.toLocaleDateString(loc(), { month: 'long', year: 'numeric' }), t('shared'))}${dayCard()}${petCardHtml()}<div class="cg"><div class="card cal"><div class="cn"><button class="ib" data-a="mo" data-n="-1" aria-label="prev" style="width:40px;height:40px">${I.back}</button><b>${cur.toLocaleDateString(loc(), { month: 'long', year: 'numeric' })}</b><button class="ib" data-a="mo" data-n="1" aria-label="next" style="width:40px;height:40px;transform:scaleX(-1)">${I.back}</button></div><div class="g7 wk">${wk}</div><div class="g7">${cells.join('')}</div></div><div>${side}</div></div></div><button class="fab" data-a="new" aria-label="${t('add')}">+</button>`;
      }

      // Keep the two characters facing inward, including during the tap animation.
      const PET_ACT_MS = 1500;
      ['boy_left.png', 'boy_right.png', 'girl_right.png'].forEach((f) => {
        const im = new Image();
        im.src = './img/pet/' + f;
      });

      function petTouch(btn) {
        const img = btn && btn.querySelector('img');
        if (!img || btn.dataset.busy) return;
        btn.dataset.busy = '1';
        img.src = btn.dataset.act;
        btn.classList.add('is-act');
        setTimeout(() => {
          img.src = btn.dataset.base;
          btn.classList.remove('is-act');
          delete btn.dataset.busy;
        }, PET_ACT_MS);
      }

      // Tự xử lý click, không cần sửa file actions/core.
      document.addEventListener('click', (ev) => {
        const btn = ev.target.closest && ev.target.closest('[data-a="petTouch"]');
        if (!btn) return;
        petTouch(btn);
        if (typeof sendPetTouch == 'function') sendPetTouch();
      });

      function petCardHtml() {
        const fallback = { name: 'Mochi', reactions: [] };
        const pet = PET || fallback;
        const reactions = ['❤️', '😡', '🥺', '😴', '💔'];
        const user = S.user || {};
        const other = partner();
        const people = [
          { id: user.id, name: user.name, gender: user.gender || 'f' },
          other || { id: 'partner', name: t('petPartner'), gender: me() == 'm' ? 'f' : 'm' },
        ];
        const character = (person, index) => {
          const gender = person.gender == 'm' ? 'm' : 'f';
          const facesRight = index == 0,
            image = gender == 'm' ? (facesRight ? 'boy_right.png' : 'boy_left.png') : 'girl_right.png',
            flip = gender == 'f' && !facesRight ? ' pet-flip' : '';
          const bubble = (pet.reactions || []).find((r) => r.by == person.id);
          const genderLabel = t(gender == 'm' ? 'petMale' : 'petFemale');
          const ownBubble = person.id == user.id;
          const isTextBubble = bubble && !reactions.includes(bubble.emoji);
          // Mình: gửi ❤️ như cũ. Đối phương: chạm -> đổi ảnh act.
          const action = ownBubble
            ? 'data-a="petReact" data-emoji="❤️"'
            : 'data-a="petTouch"';
          return `<div class="pet-walker pet-walker-${index == 0 ? 'left' : 'right'}" aria-label="${esc(person.name || genderLabel)}">
          <button class="pet-character-action${flip}" type="button" ${action} data-base="./img/pet/${image}" data-act="./img/pet/${image}" aria-label="${esc(t('petSend'))}">
          <img class="pet-character-image" src="./img/pet/${image}" alt="${esc(genderLabel)}"></button>${bubble ? `<div class="pet-chat-bubble${isTextBubble ? ' is-text' : ''}" title="${esc(person.name || '')}"><span>${esc(bubble.emoji)}</span>${ownBubble ? `<button type="button" data-a="petClear" aria-label="${esc(t('petDeleteBubble'))}">×</button>` : ''}</div>` : ''}</div>`;
        };
        return `<section class="pet-card" aria-label="${esc(t('petKicker'))}"><div class="pet-top"><div><p class="pet-kicker">${esc(t('petKicker'))}</p><div class="pet-heading">${esc(pet.name || fallback.name)} <button type="button" class="pet-rename" data-a="petName" aria-label="${esc(t('petRename'))}">✎</button></div><p class="pet-hint">${esc(t('petSub'))}</p></div><span class="pet-hearts">♡ ♡ ♡</span></div><div class="pet-stage">${people.map(character).join('')}<span class="pet-spark">✦</span></div><div class="pet-care"><span class="pet-care-label">${esc(t('petSharedBubbles'))}</span></div><form class="pet-text-form" data-f="petText"><input class="in" type="text" name="text" maxlength="120" autocomplete="off" placeholder="${esc(t('petTextPlaceholder'))}" aria-label="${esc(t('petTextPlaceholder'))}" required><button class="btn b2" type="submit">${esc(t('petTextSend'))}</button></form><div class="pet-reactions">${reactions.map((e) => `<button type="button" data-a="petReact" data-emoji="${e}" aria-label="${esc(t('petReactOption').replace('{emoji}', e))}">${e}</button>`).join('')}</div></section>`;
      }
