// LoveSync settings module. Classic scripts share state declared in js/core.js.
function vSet() {
        const n = S.n,
          trashCount = (C.trash?.ev?.length || 0) + (C.trash?.notes?.length || 0) + (C.trash?.photos?.length || 0);
        return `<div class="main" style="max-width:560px">${head(t('set'), 'settings.cfg')}<div class="card sec" style="display:flex;align-items:center;gap:14px;margin:0">${av(me(), 64)}<div style="flex:1"><h2 style="font-size:17px">${esc((S.user && S.user.name) || t('you'))}</h2><p class="sub" style="font-size:12px;margin-bottom:6px">${esc(((S.user && S.user.email) || '').split('@')[0])}</p><span class="chip">${t('linked')}</span><div><button class="btn b2" data-a="pedit" style="width:auto;min-height:36px;padding:0 14px;margin-top:10px;font-size:13px">${t('editProfile')}</button></div></div></div><p class="mono sub h2" style="margin-top:18px">// ${t('pt')}</p>${(() => {
          const o = partner();
          return o
            ? `<div class="card sec" style="display:flex;align-items:center;gap:14px;margin:0">${av(o.gender, 52)}<div style="flex:1"><h2 style="font-size:16px">${esc(o.name || '')}</h2><p class="sub" style="font-size:12px;margin-bottom:6px">${t('gd')}: ${o.gender == 'm' ? t('gm') : t('gf')}</p><span class="chip">${t('ptOn')}</span></div></div>`
            : `<div class="card sec" style="display:flex;align-items:center;gap:14px;margin:0">${av(me() == 'f' ? 'm' : 'f', 52)}<div style="flex:1"><h2 style="font-size:16px">${t('ptNone')}</h2><p class="sub" style="font-size:12px;margin-bottom:6px">${t('ptNoneH')}</p><span class="chip">${t('ptOff')}</span></div></div>`;
        })()}<p class="mono sub h2" style="margin-top:18px">// ${t('acc')}</p><div class="card"><div class="rw"><span>${t('un')}</span><span class="sub">${esc(((S.user && S.user.email) || '').split('@')[0])}</span></div><div class="rw"><span>${t('code')}</span><span class="mono" style="color:var(--cy)">${esc((S.user && S.user.code) || 'LOVE-XXXX')}</span></div><div class="rw"><span>${t('lang')}</span>${lang()}</div></div><p class="mono sub h2" style="margin-top:18px">// ${t('nt')}</p><div class="card"><div class="rw"><label for="pushTg">${t('pushT')}</label><input class="tg" id="pushTg" type="checkbox" data-a="pushTog" ${pushOn ? 'checked' : ''}${pushBusy ? ' disabled' : ''}></div>${['n1', 'n2', 'n3'].map((k, i) => `<div class="rw"><label for="${k}">${t(k)}</label><input class="tg" id="${k}" type="checkbox" data-a="tg" data-i="${i}" ${n[i] ? 'checked' : ''}></div>`).join('')}</div>${pushNote()}<p class="mono sub h2" style="margin-top:18px">// ${t('trash')}</p><button class="card rw" data-a="go" data-v="trash" style="width:100%;color:inherit;cursor:pointer"><span>${I.trash} ${t('trashOpen')}</span><span class="chip">${trashCount}</span></button><p class="sub" style="font-size:12px;margin-top:8px">${t('trashSub')}</p><div class="row2" style="margin-top:20px"><button class="btn b2" data-a="out">${t('out')}</button></div></div>`;
      }
      // Form thêm buổi hẹn (có ô "Gửi thông báo cho người ấy")
      function vMod() {
        const e = modal == 'edit' ? C.ev.find((x) => x.id == open) : null,
          editing = !!e;
        return `<div class="mod" data-a="close"><form class="card" data-f="ev" role="dialog" aria-label="${t(editing ? 'edit' : 'add')}"><h2 class="px" style="font-size:16px;color:var(--pk);margin-bottom:16px">${t(editing ? 'edit' : 'add')}</h2><div class="fl"><label class="lb" for="mt">${t('ttl')}</label><input class="in" id="mt" name="title" required value="${editing ? esc(tx(e.title)) : ''}"></div><div style="display:flex;gap:12px"><div class="fl" style="flex:1"><label class="lb" for="md">${t('dt')}</label><input class="in" id="md" name="date" type="date" data-calendar required value="${editing ? e.date : sel}"></div><div class="fl" style="flex:1"><label class="lb" for="mm">${t('tm')}</label><input class="in" id="mm" name="time" type="time" data-clock value="${editing ? e.time : '19:00'}"></div></div><div class="fl"><label class="lb" for="mp">${t('pl')}</label><input class="in" id="mp" name="place" value="${editing ? esc(tx(e.place)) : ''}"></div>${editing ? '' : `<label class="chk"><input type="checkbox" name="send" checked><span>${t('send')}</span></label>`}<div class="row2"><button type="button" class="btn b2" data-a="close">${t('cancel')}</button><button class="btn b1">${t(editing ? 'saveChanges' : 'save')}</button></div></form></div>`;
      }
      // Form sửa thông tin cá nhân (tên hiển thị + giới tính/avatar)
      function vProf() {
        const g = me();
        return `<div class="mod" data-a="pclose"><form class="card" data-f="prof" role="dialog" aria-label="${t('editProfile')}"><h2 class="px" style="font-size:16px;color:var(--pk);margin-bottom:16px">${t('editProfile')}</h2><div class="fl"><label class="lb" for="pn">${t('dn')}</label><input class="in" id="pn" name="name" required maxlength="24" value="${esc((S.user && S.user.name) || '')}"></div><fieldset class="gd"><legend class="lb">${t('gd')}</legend>${[
          ['f', 'gf'],
          ['m', 'gm'],
        ]
          .map(
            ([x, k]) =>
              `<label class="gb"><input type="radio" name="gender" value="${x}" ${x == g ? 'checked' : ''}>${av(x, 56)}<span>${t(k)}</span></label>`,
          )
          .join('')}</fieldset><div class="row2"><button type="button" class="btn b2" data-a="pclose">${t('cancel')}</button><button class="btn b1">${t('save')}</button></div></form></div>`;
      }
