// LoveSync render module. Classic scripts share state declared in js/core.js.
function render() {
        document.documentElement.lang = S.lang;
        const content =
          view == 'boot'
            ? '<div class="auth"><p class="mono sub">…</p></div>'
            : view == 'auth'
              ? vAuth()
              : `<div class="shell">${{ cal: vCal, det: vDet, notes: vNotes, album: vAlbum, set: vSet, trash: vTrash }[view]()}${nav()}</div>` +
                (modal ? vMod() : '') +
                (pmod ? vProf() : '') +
                (smod ? vSince() : '') +
                (umod ? vUp() : '') +
                (pv != null ? vPv() : '') +
                toastPrompt();
        $('#app').innerHTML = content + appUpdatePrompt();
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
      function toastPrompt() {
        return toast && view != 'auth'
          ? `<div class="toast card" role="status">${av(pr(), 32)}<span>${esc(toast)}</span></div>`
          : '';
      }
      function paintToast() {
        const current = document.querySelector('.toast'),
          html = toastPrompt();
        if (current) current.remove();
        if (html) document.querySelector('#app')?.insertAdjacentHTML('beforeend', html);
      }
      function appUpdatePrompt() {
        return appUpdateReady
          ? `<aside class="app-update card" role="status" aria-live="polite"><span>${esc(t(appUpdateApplying ? 'updateApplying' : 'updateAvailable'))}</span><button class="btn b1" data-a="appUpdate"${appUpdateApplying ? ' disabled' : ''}>${esc(t(appUpdateApplying ? 'updateApplying' : 'updateAction'))}</button></aside>`
          : '';
      }
      function paintAppUpdatePrompt() {
        const current = document.querySelector('.app-update'),
          html = appUpdatePrompt();
        if (current) current.remove();
        if (html) document.querySelector('#app')?.insertAdjacentHTML('beforeend', html);
      }
      const $ = (s) => document.querySelector(s);
