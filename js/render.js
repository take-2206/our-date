// LoveSync render module. Classic scripts share state declared in js/core.js.
function render() {
        document.documentElement.lang = S.lang;
        $('#app').innerHTML =
          view == 'boot'
            ? '<div class="auth"><p class="mono sub">…</p></div>'
            : view == 'auth'
              ? vAuth()
              : `<div class="shell">${{ cal: vCal, det: vDet, notes: vNotes, album: vAlbum, set: vSet }[view]()}${nav()}</div>` +
                (modal ? vMod() : '') +
                (pmod ? vProf() : '') +
                (smod ? vSince() : '') +
                (umod ? vUp() : '') +
                (pv != null ? vPv() : '') +
                (toast && view != 'auth'
                  ? `<div class="toast card" role="status">${av(pr(), 32)}<span>${esc(toast)}</span></div>`
                  : '');
        // Từ lịch bấm "Mở trong album" (hoặc vừa thêm ảnh): cuộn tới đúng ngày trong album
        if (albumFocus && view == 'album') {
          const el = document.getElementById('ad-' + albumFocus);
          if (el) {
            albumFocus = null;
            el.classList.add('hl');
            el.scrollIntoView({ block: 'start' });
          } else if (!upBusy && C.photos.length) albumFocus = null;
        } else if (view != 'album') albumFocus = null;
      }
      const $ = (s) => document.querySelector(s);
