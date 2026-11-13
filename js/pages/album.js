// LoveSync album module. Classic scripts share state declared in js/core.js.
/* ===== ALBUM ẢNH: danh sách, form tải ảnh, xem phóng to ===== */
      // phs() = ảnh đang hiển thị (theo album được chọn), albums() = tên các album, pu() = link ảnh đã ký
      const phs = () => C.photos.filter((p) => !albumSel || p.album == albumSel);
      const albums = () =>
        [...new Set(C.photos.map((p) => p.album).filter(Boolean))].sort((a, b) => a.localeCompare(b, loc()));
      const pu = (p) => (PU[p.path] || {}).url || '';
      // Danh sách ảnh trong khung xem: nếu mở từ lịch thì chỉ gồm ảnh của ngày đó
      const pvList = () => (pvDay ? C.photos.filter((p) => p.date == pvDay) : phs());
      const photosOn = (k) => C.photos.filter((p) => p.date == k);
      function vAlbum() {
        const h = head(t('album'), t('albumSub'));
        if (photoError) return `<div class="main">${h}<div class="card note-error">${t('phSetup')}</div></div>`;
        if (albumSel && !albums().includes(albumSel)) albumSel = '';
        const list = phs(),
          chips = `<div class="ab-bar" role="group" aria-label="${t('album')}">${['', ...albums()]
            .map((a) => {
              const n = a ? C.photos.filter((p) => p.album == a).length : C.photos.length;
              return `<button class="ab-chip${albumSel == a ? ' on' : ''}" data-a="albumSel" data-al="${esc(a)}" aria-pressed="${albumSel == a}">${a ? esc(a) : t('phAll')} · ${n}</button>`;
            })
            .join('')}</div>`,
          prog = upBusy
            ? `<div class="card ab-prog" role="status"><span>${t('phBusy')}</span><div class="ab-meter"><i style="width:${Math.round((upBusy.n / upBusy.total) * 100)}%"></i></div><span class="mono">${upBusy.n}/${upBusy.total}</span></div>`
            : '',
          days = [...new Set(list.map((p) => p.date))],
          grid = list.length
            ? days
                .map((k) => {
                  const g = list.filter((p) => p.date == k),
                    places = [...new Set(g.map((p) => p.place).filter(Boolean))].join(' · ');
                  return `<section class="ab-day" id="ad-${k}"><div class="ab-dh"><b>${fmt(k, { day: 'numeric', month: 'long', year: 'numeric' })}</b>${places ? `<span class="sub">${I.pin} ${esc(places)}</span>` : ''}</div><div class="ab-grid">${g
                    .map((p) => {
                      const u = pu(p);
                      return `<button class="ab-ph" data-a="pv" data-id="${p.id}" aria-label="${esc(p.cap || p.place || t('album'))}">${u ? `<img src="${esc(u)}" alt="${esc(p.cap)}" loading="lazy" decoding="async">` : ''}${p.cap ? `<span>${esc(p.cap)}</span>` : ''}</button>`;
                    })
                    .join('')}</div></section>`;
                })
                .join('')
            : `<div class="card ab-empty">${I.photo}<h2 style="font-size:16px;font-weight:800">${t('phNone')}</h2><p class="sub" style="font-size:13px">${t('phNoneH')}</p></div>`;
        return `<div class="main">${h}<div class="ab-act"><button class="btn b1" data-a="pick"${upBusy ? ' disabled' : ''}>${I.photo} ${t('phAdd')}</button></div>${prog}${C.photos.length ? chips : ''}${grid}</div>`;
      }
      // Form chọn album + chú thích trước khi tải ảnh lên
      function vUp() {
        const n = umod.files.length;
        return `<div class="mod" data-a="uclose"><form class="card" data-f="photo" role="dialog" aria-label="${t('phAdd')}"><h2 class="px" style="font-size:16px;color:var(--pk);margin-bottom:6px">${t('phAdd')}</h2><p class="sub" style="font-size:12px;margin-bottom:14px">${t('phN').replace('{n}', n)}</p><div class="ab-prev">${umod.urls.map((u) => `<img src="${u}" alt="">`).join('')}${n > umod.urls.length ? `<b>+${n - umod.urls.length}</b>` : ''}</div><div class="fl"><label class="lb" for="pa">${t('phAlbum')}</label><input class="in" id="pa" name="album" list="ab-list" maxlength="30" autocomplete="off" value="${esc(albumSel)}" placeholder="${t('phAlbumPh')}"><datalist id="ab-list">${albums()
          .map((a) => `<option value="${esc(a)}"></option>`)
          .join('')}</datalist></div><div class="fl"><label class="lb" for="pd">${t('phDate')}</label><input class="in" id="pd" name="date" type="date" data-calendar required value="${key(new Date())}"></div><div class="fl"><label class="lb" for="pp">${t('phPlace')}</label><input class="in" id="pp" name="place" maxlength="60" autocomplete="off" list="pl-list" placeholder="${t('phPlaceIPh')}"><datalist id="pl-list">${[...new Set(C.photos.map((x) => x.place).filter(Boolean))].map((a) => `<option value="${esc(a)}"></option>`).join('')}</datalist></div>${n == 1 ? `<div class="fl"><label class="lb" for="pc">${t('phCap')}</label><input class="in" id="pc" name="caption" maxlength="120" placeholder="${t('phCapPh')}"></div>` : ''}<div class="row2"><button type="button" class="btn b2" data-a="uclose">${t('cancel')}</button><button class="btn b1">${t('save')}</button></div></form></div>`;
      }
      // Xem ảnh toàn màn hình: mũi tên / vuốt để chuyển ảnh, sửa chú thích, xoá
      function vPv() {
        const list = pvList(),
          i = list.findIndex((p) => p.id == pv);
        if (i < 0) return '';
        const p = list[i],
          u = pu(p),
          who = (P[p.by] || {}).name || '';
        return `<div class="pv" role="dialog" aria-modal="true" aria-label="${t('album')}"><div class="pv-top"><span class="mono sub" style="font-size:12px">${i + 1} / ${list.length}${p.album ? ' · ' + esc(p.album) : ''}</span><div style="display:flex;gap:8px"><button class="ib" data-a="phDel" data-id="${p.id}" aria-label="${t('phDel')}">${I.trash}</button><button class="ib" data-a="pvClose" aria-label="${t('phClose')}">${I.x}</button></div></div><div class="pv-img">${u ? `<img src="${esc(u)}" alt="${esc(p.cap)}">` : ''}${i > 0 ? `<button class="ib pv-nav" style="left:4px" data-a="pvGo" data-d="-1" aria-label="${t('phPrev')}">${I.back}</button>` : ''}${i < list.length - 1 ? `<button class="ib pv-nav" style="right:4px" data-a="pvGo" data-d="1" aria-label="${t('phNext')}">${I.fwd}</button>` : ''}</div><div class="pv-foot"><input class="in" data-photo-cap data-id="${p.id}" maxlength="120" value="${esc(p.cap)}" placeholder="${t('phCapPh')}" aria-label="${t('phCap')}"><div class="pv-meta"><input class="in" type="date" data-calendar data-photo-date data-id="${p.id}" value="${p.date}" aria-label="${t('phDate')}"><input class="in" data-photo-place data-id="${p.id}" maxlength="60" value="${esc(p.place)}" placeholder="${t('phPlace')}" aria-label="${t('phPlace')}"></div>${who ? `<p class="sub mono" style="font-size:11px;text-align:center">${esc(who)}</p>` : ''}</div></div>`;
      }
      // Vẽ lại toàn bộ màn hình theo trạng thái hiện tại
