// LoveSync album module. Classic scripts share state declared in js/core.js.
/* ===== ALBUM ẢNH: danh sách, form tải ảnh, xem phóng to ===== */
      // phs() = ảnh đang hiển thị (theo album được chọn), albums() = tên các album, pu() = link ảnh đã ký
      const phs = () => C.photos.filter((p) => albumSel == '__unfiled__' ? !p.album : !albumSel || p.album == albumSel);
      const albums = () =>
        [...new Set(C.photos.map((p) => p.album).filter(Boolean))].sort((a, b) => a.localeCompare(b, loc()));
      const pu = (p) => (PU[p.path] || {}).url || '';
      // Danh sách ảnh trong khung xem: nếu mở từ lịch thì chỉ gồm ảnh của ngày đó
      const pvList = () => (pvDay ? C.photos.filter((p) => p.date == pvDay) : phs());
      const photosOn = (k) => C.photos.filter((p) => p.date == k);
      function vAlbumGridLegacy() {
        const h = head(t('album'), t('albumSub'));
        if (photoError) return `<div class="main">${h}<div class="card note-error">${t('phSetup')}</div></div>`;
        if (albumSel && !albums().includes(albumSel)) albumSel = null;
        const list = albumSel === null ? [] : phs(),
          chips = `<div class="ab-bar" role="group" aria-label="${t('album')}">${['', ...albums()]
            .map((a) => {
              const n = a ? C.photos.filter((p) => p.album == a).length : C.photos.length;
              const name = a || t('phAll');
              return `<button class="ab-folder${albumSel === a ? ' on' : ''}" data-a="albumSel" data-al="${esc(a)}" aria-label="${esc(name)} · ${n}" aria-pressed="${albumSel === a}"><img src="./img/file.png" alt=""><span>${esc(name)}</span><small>${n}</small></button>`;
            })
            .join('')}</div>`,
          prog = upBusy
            ? `<div class="card ab-prog" role="status"><span>${t('phBusy')}</span><div class="ab-meter"><i style="width:${Math.round((upBusy.n / upBusy.total) * 100)}%"></i></div><span class="mono">${upBusy.n}/${upBusy.total}</span></div>`
            : '',
          days = [...new Set(list.map((p) => p.date))],
          grid = albumSel === null ? '' : list.length
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
        return `<div class="main">${h}<div class="ab-act"><button class="btn b1" data-a="pick"${upBusy ? ' disabled' : ''}>${I.photo} ${t('phAdd')}</button></div>${prog}${chips}${grid}</div>`;
      }
      // Form chọn album + chú thích trước khi tải ảnh lên
      // Album bookshelf renderer: book covers open into a two-page photo spread.
      function vAlbum() {
        const h = head(t('album'), t('albumSub')),
          perSpread = 2,
          perPage = perSpread / 2,
          colorIndex = (value) => {
            let hash = 2166136261;
            for (const ch of String(value)) { hash ^= ch.charCodeAt(0); hash = Math.imul(hash, 16777619); }
            return (hash >>> 0) % 5;
          };
        if (photoError) return `<div class="main">${h}<div class="card note-error">${t('phSetup')}</div></div>`;
        if (albumSel && albumSel != '__unfiled__' && !albums().includes(albumSel)) albumSel = null;
        const prog = upBusy
            ? `<div class="card ab-prog" role="status"><span>${t('phBusy')}</span><div class="ab-meter"><i style="width:${Math.round((upBusy.n / upBusy.total) * 100)}%"></i></div><span class="mono">${upBusy.n}/${upBusy.total}</span></div>`
            : '',
          entries = [...albums().map((name) => ({ name, key: name, photos: C.photos.filter((p) => p.album == name) })), ...(C.photos.some((p) => !p.album) ? [{ name: t('phUnsorted'), key: '__unfiled__', photos: C.photos.filter((p) => !p.album) }] : [])],
          shelf = `<section class="ab-bookshelf" aria-label="${t('album')}">${entries.map((book, index) => {
            const cover = book.photos.length ? pu(book.photos[0]) : '';
            return `<button class="ab-book ab-book-tone-${colorIndex(book.key || book.name)}" type="button" data-a="albumSel" data-al="${esc(book.key)}" aria-label="${esc(book.name)} · ${book.photos.length} ${t('phMore')}"><span class="ab-book-face">${cover ? `<img class="ab-book-cover-image" src="${esc(cover)}" alt="" loading="lazy">` : `<span class="ab-book-cover-empty">${I.photo}</span>`}<span class="ab-book-cover-shade"></span><span class="ab-book-label">${esc(book.name)}</span><span class="ab-book-count">${book.photos.length} ${t('phMore')}</span><span class="ab-book-open-mark">${I.fwd}</span></span></button>`;
          }).join('')}</section>`;
        if (albumSel === null) return `<div class="main ab-main">${h}<div class="ab-act"><button class="btn b1" data-a="pick"${upBusy ? ' disabled' : ''}>${I.photo} ${t('phAdd')}</button></div>${prog}${shelf}${C.photos.length ? '' : `<div class="card ab-empty">${I.photo}<h2>${t('phNone')}</h2><p class="sub">${t('phNoneH')}</p></div>`}</div>`;
        const list = phs(), pageCount = Math.ceil(list.length / perSpread), bookTitle = albumSel == '__unfiled__' ? t('phUnsorted') : albumSel || t('phAll');
        if (pageCount && albumPage >= pageCount) albumPage = pageCount - 1;
        const spreadPhotos = list.slice(albumPage * perSpread, albumPage * perSpread + perSpread),
          anchors = [...new Set(spreadPhotos.map((p) => p.date).filter(Boolean))].map((date) => `<span class="ab-book-anchor" id="ad-${date}"></span>`).join(''),
          page = (photos) => {
            if (!photos.length) return `<div class="ab-book-page is-empty" aria-hidden="true"><span class="ab-page-watermark">${I.photo}</span></div>`;
            return `<div class="ab-book-page"><div class="ab-page-photos">${photos.map((photo) => {
              const url = pu(photo), caption = photo.cap || photo.place || t('album');
              return `<article class="ab-page-memory"><button class="ab-page-photo" type="button" data-a="pv" data-id="${esc(String(photo.id))}" aria-label="${esc(caption)}">${url ? `<img src="${esc(url)}" alt="${esc(photo.cap || '')}" loading="lazy" decoding="async">` : I.photo}</button><div class="ab-page-note"><time>${fmt(photo.date, { day: 'numeric', month: 'long', year: 'numeric' })}</time>${photo.cap ? `<p>${esc(photo.cap)}</p>` : ''}${photo.place ? `<small>${I.pin} ${esc(photo.place)}</small>` : ''}</div></article>`;
            }).join('')}</div></div>`;
          },
          leftPhotos = spreadPhotos.slice(0, perPage),
          rightPhotos = spreadPhotos.slice(perPage),
          flipFrom = albumFlip ? (albumFlip.direction == 'next' ? albumFlip.from * perSpread + perPage : albumFlip.from * perSpread) : -1,
          turningPhotos = flipFrom < 0 ? [] : list.slice(flipFrom, flipFrom + perPage),
          turnOverlay = albumFlip ? `<div class="ab-page-turn ab-page-turn--${albumFlip.direction}"><div class="ab-page-turn-face">${page(turningPhotos)}</div><div class="ab-page-turn-back" aria-hidden="true"></div></div>` : '',
          openBook = `<section class="ab-book-reading"><div class="ab-book-heading"><button class="ib" type="button" data-a="albumShelf" aria-label="${t('back')}" title="${t('back')}">${I.back}</button><div><h2>${esc(bookTitle)}</h2><p>${list.length} ${t('phMore')}</p></div></div>${list.length ? `<div class="ab-open-book${albumOpening ? ' is-opening' : ''}" aria-label="${esc(bookTitle)}">${anchors}<div class="ab-book-pages">${page(leftPhotos)}<span class="ab-book-fold" aria-hidden="true"></span>${page(rightPhotos)}${turnOverlay}</div></div><div class="ab-book-controls"><button class="ib" type="button" data-a="albumPage" data-step="-1" aria-label="${t('phPrev')}"${albumPage <= 0 ? ' disabled' : ''}>${I.back}</button><span>${albumPage + 1} / ${Math.max(pageCount, 1)}</span><button class="ib" type="button" data-a="albumPage" data-step="1" aria-label="${t('phNext')}"${albumPage >= pageCount - 1 ? ' disabled' : ''}>${I.fwd}</button></div>` : `<div class="card ab-empty">${I.photo}<h2>${t('phNone')}</h2><p class="sub">${t('phNoneH')}</p></div>`}</section>`;
        return `<div class="main ab-main">${h}<div class="ab-act"><button class="btn b1" data-a="pick"${upBusy ? ' disabled' : ''}>${I.photo} ${t('phAdd')}</button></div>${prog}${openBook}</div>`;
      }
      function vUp() {
        const n = umod.files.length;
        return `<div class="mod" data-a="uclose"><form class="card" data-f="photo" role="dialog" aria-label="${t('phAdd')}"><h2 class="px" style="font-size:16px;color:var(--pk);margin-bottom:6px">${t('phAdd')}</h2><p class="sub" style="font-size:12px;margin-bottom:14px">${t('phN').replace('{n}', n)}</p><div class="ab-prev">${umod.urls.map((u) => `<img src="${u}" alt="">`).join('')}${n > umod.urls.length ? `<b>+${n - umod.urls.length}</b>` : ''}</div><div class="fl"><label class="lb" for="pa">${t('phAlbum')}</label><input class="in" id="pa" name="album" list="ab-list" maxlength="30" autocomplete="off" value="${esc(albumSel || String())}" placeholder="${t('phAlbumPh')}"><datalist id="ab-list">${albums()
          .map((a) => `<option value="${esc(a)}"></option>`)
          .join('')}</datalist></div><div class="fl"><label class="lb" for="pd">${t('phDate')}</label><input class="in" id="pd" name="date" type="date" data-calendar inputmode="none" required value="${key(new Date())}"></div><div class="fl"><label class="lb" for="pp">${t('phPlace')}</label><input class="in" id="pp" name="place" maxlength="60" autocomplete="off" list="pl-list" placeholder="${t('phPlaceIPh')}"><datalist id="pl-list">${[...new Set(C.photos.map((x) => x.place).filter(Boolean))].map((a) => `<option value="${esc(a)}"></option>`).join('')}</datalist></div>${n == 1 ? `<div class="fl"><label class="lb" for="pc">${t('phCap')}</label><input class="in" id="pc" name="caption" maxlength="120" placeholder="${t('phCapPh')}"></div>` : ''}<div class="row2"><button type="button" class="btn b2" data-a="uclose">${t('cancel')}</button><button class="btn b1">${t('save')}</button></div></form></div>`;
      }
      // Xem ảnh toàn màn hình: mũi tên / vuốt để chuyển ảnh, sửa chú thích, xoá
      function fitPhotoViewer(img) {
        const box = img && img.parentElement;
        if (!box || !img.naturalWidth || !img.naturalHeight) return;
        const scale = Math.min(box.clientWidth / img.naturalWidth, box.clientHeight / img.naturalHeight);
        img.style.width = Math.max(1, Math.floor(img.naturalWidth * scale)) + 'px';
        img.style.height = Math.max(1, Math.floor(img.naturalHeight * scale)) + 'px';
        img.dataset.fitted = 'true';
      }
      addEventListener('resize', () => {
        const img = document.querySelector('.pv-img img');
        if (img) fitPhotoViewer(img);
      });
      function vPv() {
        const list = pvList(),
          i = list.findIndex((p) => p.id == pv);
        if (i < 0) return '';
        const p = list[i],
          u = pu(p),
          who = (P[p.by] || {}).name || '';
        return `<div class="pv" role="dialog" aria-modal="true" aria-label="${t('album')}"><div class="pv-top"><span class="mono sub" style="font-size:12px">${i + 1} / ${list.length}${p.album ? ' · ' + esc(p.album) : ''}</span><div style="display:flex;gap:8px"><button class="ib" data-a="phDel" data-id="${p.id}" aria-label="${t('phDel')}">${I.trash}</button><button class="ib" data-a="pvClose" aria-label="${t('phClose')}">${I.x}</button></div></div><div class="pv-img">${u ? `<img src="${esc(u)}" alt="${esc(p.cap)}" onload="fitPhotoViewer(this)">` : ''}${i > 0 ? `<button class="ib pv-nav" style="left:4px" data-a="pvGo" data-d="-1" aria-label="${t('phPrev')}">${I.back}</button>` : ''}${i < list.length - 1 ? `<button class="ib pv-nav" style="right:4px" data-a="pvGo" data-d="1" aria-label="${t('phNext')}">${I.fwd}</button>` : ''}</div><div class="pv-foot"><input class="in" data-photo-cap data-id="${p.id}" maxlength="120" value="${esc(p.cap)}" placeholder="${t('phCapPh')}" aria-label="${t('phCap')}"><div class="pv-meta"><input class="in" type="date" data-calendar inputmode="none" data-photo-date data-id="${p.id}" value="${p.date}" aria-label="${t('phDate')}"><input class="in" data-photo-place data-id="${p.id}" maxlength="60" value="${esc(p.place)}" placeholder="${t('phPlace')}" aria-label="${t('phPlace')}"></div>${who ? `<p class="sub mono" style="font-size:11px;text-align:center">${esc(who)}</p>` : ''}</div></div>`;
      }
      // Vẽ lại toàn bộ màn hình theo trạng thái hiện tại
