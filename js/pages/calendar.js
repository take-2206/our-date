// LoveSync calendar module. Classic scripts share state declared in js/core.js.
const MS = [100, 200, 300, 365, 500, 600, 700, 730, 800, 900, 1000];
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
          sub = `${t('dcFrom')} ${fmt(sn, { day: 'numeric', month: 'numeric', year: 'numeric' })}${n > 0 ? ' · ' + t('dcNext').replace('{n}', nx - n).replace('{m}', nx) : ''}`;
        return `<div class="card dc"><div class="pair">${av(me(), 44)}${av(pr(), 44)}</div><div class="dcb">${nameLine}<div class="dcv"><b class="px">${Math.max(n, 0)}</b><span>${t('dc')}</span></div><p class="sub mono" style="font-size:12px;margin-top:2px">${sub}</p></div><button class="ib" data-a="sedit" aria-label="${t('dcTtl')}">${sv('<path d="M4 20h4L19 9l-4-4L4 16v4z"/>')}</button></div>`;
      }
      function vSince() {
        return `<div class="mod" data-a="sclose"><form class="card" data-f="since" role="dialog" aria-label="${t('dcTtl')}"><h2 class="px" style="font-size:16px;color:var(--pk);margin-bottom:16px">${t('dcTtl')}</h2><div class="fl"><label class="lb" for="sd">${t('dt')}</label><input class="in" id="sd" name="since" type="date" required max="${key(new Date())}" value="${esc(C.since || '')}"></div><div class="row2"><button type="button" class="btn b2" data-a="sclose">${t('cancel')}</button><button class="btn b1">${t('save')}</button></div></form></div>`;
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
            es = EV().filter((e) => e.date == k),
            np = photosOn(k).length;
          cells.push(
            `<button class="cl${d.getMonth() != m ? ' o' : ''}${k == tk ? ' td' : ''}${k == sel ? ' sl' : ''}${es.length ? ' has-plan' : ''}${np ? ' has-ph' : ''}" data-a="day" data-k="${k}" aria-label="${fmt(k, { dateStyle: 'full' })}${es.length ? `, ${es.length} ${t('det')}` : ''}${np ? `, ${np} ${t('phMore')}` : ''}"><span>${d.getDate()}</span>${es.length ? '<span class="heart-light" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i></span>' : ''}${np ? '<i class="ph-dot" aria-hidden="true"></i>' : ''}</button>`,
          );
        }
        const wk = [...Array(7)]
          .map(
            (_, i) =>
              `<span class="mono sub">${new Date(2024, 0, 1 + i).toLocaleDateString(loc(), { weekday: 'short' })}</span>`,
          )
          .join('');
        const day = EV().filter((e) => e.date == sel),
          upcoming = up()
            .filter((e) => e.date != sel)
            .slice(0, 3),
          dph = photosOn(sel),
          photoSec = dph.length
            ? `<p class="mono sub h2"${day.length ? ' style="margin-top:22px"' : ''}>// ${t('phOfDay')} · ${fmt(sel, { day: 'numeric', month: 'long' })}</p><div class="card cal-ph"><div class="cal-ph-grid">${dph
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
          side = day.length
            ? `<p class="mono sub h2">// ${fmt(sel, { day: 'numeric', month: 'long' })}</p>${day.map(evCard).join('')}${photoSec}<p class="mono sub h2" style="margin-top:22px">// ${t('soon')}</p>${upcoming.length ? upcoming.map(evCard).join('') : `<div class="empty">${t('noUpcoming')}</div>`}`
            : `${photoSec}<p class="mono sub h2"${photoSec ? ' style="margin-top:22px"' : ''}>// ${t('soon')}</p>${up().slice(0, 3).map(evCard).join('') || `<div class="empty">${t('none')}</div>`}`;
        return `<div class="main">${head(cur.toLocaleDateString(loc(), { month: 'long', year: 'numeric' }), t('shared'))}${dayCard()}<div class="cg"><div class="card cal"><div class="cn"><button class="ib" data-a="mo" data-n="-1" aria-label="prev" style="width:40px;height:40px">${I.back}</button><b>${cur.toLocaleDateString(loc(), { month: 'long', year: 'numeric' })}</b><button class="ib" data-a="mo" data-n="1" aria-label="next" style="width:40px;height:40px;transform:scaleX(-1)">${I.back}</button></div><div class="g7 wk">${wk}</div><div class="g7">${cells.join('')}</div></div><div>${side}</div></div></div><button class="fab" data-a="new" aria-label="${t('add')}">+</button>`;
      }
