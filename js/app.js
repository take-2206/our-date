// LoveSync app module. Classic scripts share state declared in js/core.js.
(async () => {
        if (CFG) {
          const { data } = await sb.auth.getSession();
          if (data.session) await enter(data.session.user);
        }
        view = S.user ? 'cal' : 'auth';
        render();
        const q = new URLSearchParams(location.search).get('ev');
        if (q) {
          history.replaceState(null, '', location.pathname);
          openFromUrl(q);
        }
      })();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
        addEventListener('load', () => navigator.serviceWorker.register('./sw.js'));
      }
