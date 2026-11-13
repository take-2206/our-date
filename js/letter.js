// LoveSync letter module. Classic scripts share state declared in js/core.js.
/* ===== 4. LÁ THƯ: bấm thông báo -> phong bì đóng lắc -> mở ra -> giấy thư hiện nội dung + nút Đồng ý / Từ chối.
         LT.st: 0 = phong bì đóng, 1 = phong bì mở, 2 = giấy thư ===== */
      let LT = null;
      function drawLT() {
        if (!LT) return;
        const e = C.ev.find((x) => x.id == LT.id),
          n = LT.n,
          st = LT.st;
        let h = `<button class="ib" data-a="lclose" aria-label="${t('close')}" style="position:absolute;top:max(16px,env(safe-area-inset-top));right:16px">${sv('<path d="M6 6l12 12M18 6L6 18"/>')}</button>`;
        if (st < 2) h += `<img class="env ${st ? 'o' : 'w'}" src="${st ? IMG.e1 : IMG.e0}" alt="">`;
        else if (!e) h += `<p class="sub">${t('none')}</p>`;
        else {
          const L = [
            `${esc((P[n.by] || {}).name || '')} ${t('ltWish')}`,
            esc(tx(e.title)),
            `${t('ltDate')}: ${fmt(e.date, { weekday: 'long', day: 'numeric', month: 'long' })}`,
            `${t('ltTime')}: ${e.time}`,
            `${t('ltPlace')}: ${esc(tx(e.place))}`,
            t('ltAsk'),
          ];
          h += `<div class="ppr"><img src="${IMG.pp}" alt="">${L.map((x, i) => `<div class="tx${i == 1 ? ' ti' : ''}" style="top:calc(var(--t0) + ${i} * var(--pt))">${x}</div>`).join('')}</div>`;
          const ans = LT.done || (e.st == 'ok' ? 'ok' : e.st == 'declined' ? 'no' : '');
          h += ans
            ? `<p class="mono" style="color:var(--cy);text-align:center;max-width:min(640px,94vw)" role="status">${t(ans == 'ok' ? 'ltOk' : 'ltNo')}</p>`
            : `<div class="acts"><button class="btn b2" data-a="dec">${t('no')}</button><button class="btn b1" data-a="acc">${t('yes')}</button></div>`;
        }
        $('#lt').innerHTML =
          `<div class="lt" data-a="lclose" role="dialog" aria-modal="true" aria-label="${t('nt')}">${h}</div>`;
      }
      function closeLT() {
        if (LT && LT.tm) LT.tm.forEach(clearTimeout);
        LT = null;
        $('#lt').innerHTML = '';
      }
      function openLetter(n) {
        closeLT();
        LT = { n, id: n.evId, st: 0 };
        drawLT();
        if (matchMedia('(prefers-reduced-motion:reduce)').matches) {
          LT.st = 2;
          drawLT();
          return;
        }
        LT.tm = [
          setTimeout(() => {
            LT.st = 1;
            drawLT();
          }, 1100),
          setTimeout(() => {
            LT.st = 2;
            drawLT();
          }, 1900),
        ];
      }
      // Người nhận bấm Đồng ý / Từ chối: cập nhật trạng thái buổi hẹn trên Supabase và gửi thông báo trả lời
      function answer(ok) {
        const e = C.ev.find((x) => x.id == LT.id);
        if (!e || e.st != 'pending') return;
        e.st = ok ? 'ok' : 'declined';
        sb.from('events')
          .update({ status: e.st })
          .eq('id', e.id)
          .then(() =>
            sb
              .from('notifs')
              .insert({
                couple_id: S.user.couple_id,
                event_id: e.id,
                kind: ok ? 'ok' : 'no',
                read_by: [S.user.id],
              }),
          )
          .then(() => refresh());
        if (ok) {
          sel = e.date;
          const p = parse(e.date);
          cur = new Date(p.getFullYear(), p.getMonth(), 1);
        }
        LT.done = ok ? 'ok' : 'no';
        drawLT();
        LT.tm = [
          setTimeout(() => {
            closeLT();
            if (ok) view = 'cal';
            render();
          }, 1600),
        ];
      }
