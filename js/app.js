// LoveSync app module. Classic scripts share state declared in js/core.js.
(async () => {
        const params = new URLSearchParams(location.search);
        if (CFG) {
          const { data } = await sb.auth.getSession();
          if (data.session) await enter(data.session.user);
        }
        view = S.user ? 'cal' : 'auth';
        if (S.user && params.get('view') == 'notes') view = 'notes';
        render();
        const q = params.get('ev');
        if (q || params.has('view')) {
          history.replaceState(null, '', location.pathname);
        }
        if (q) {
          openFromUrl(q);
        }
      })();

function notifyApp(body, tag, type) {
        say(body);
        if (
          !('Notification' in window) ||
          Notification.permission != 'granted' ||
          !('serviceWorker' in navigator)
        )
          return;
        navigator.serviceWorker.ready
          .then((registration) =>
            registration.showNotification('LoveSync', {
              body,
              icon: './img/icons/app-icon-192.png',
              badge: './img/icons/app-icon-192.png',
              tag,
              data: { url: type == 'open-notes' ? './?view=notes' : './', type: type || '' },
            }),
          )
          .catch(() => {});
      }

function offerAppUpdate(registration) {
        if (!registration || !registration.waiting || !navigator.serviceWorker.controller) return;
        const firstNotice = !appUpdateReady;
        appUpdateRegistration = registration;
        appUpdateReady = true;
        paintAppUpdatePrompt();
        if (firstNotice) notifyApp(t('updateAvailable'), 'app-update', 'app-update');
      }

async function applyAppUpdate() {
        const worker = appUpdateRegistration && appUpdateRegistration.waiting;
        if (!worker || appUpdateApplying) return;
        appUpdateApplying = true;
        paintAppUpdatePrompt();
        document.activeElement?.blur();
        await Promise.race([
          Promise.resolve(pendingNoteSave).catch(() => {}),
          new Promise((resolve) => setTimeout(resolve, 3000)),
        ]);
        worker.postMessage({ type: 'SKIP_WAITING' });
      }

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
        let reloadingForUpdate = false,
          lastUpdateCheck = 0;
        const controlledAtLoad = !!navigator.serviceWorker.controller;
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          if (reloadingForUpdate || (!controlledAtLoad && !appUpdateApplying)) return;
          reloadingForUpdate = true;
          location.reload();
        });
        addEventListener('load', async () => {
          try {
            const registration = await navigator.serviceWorker.register('./sw.js');
            offerAppUpdate(registration);
            registration.addEventListener('updatefound', () => {
              const worker = registration.installing;
              if (!worker) return;
              worker.addEventListener('statechange', () => {
                if (worker.state == 'installed') offerAppUpdate(registration);
              });
            });
            const checkForUpdate = () => {
              if (document.visibilityState != 'visible' || Date.now() - lastUpdateCheck < 300000) return;
              lastUpdateCheck = Date.now();
              registration.update().catch(() => {});
            };
            document.addEventListener('visibilitychange', checkForUpdate);
            setInterval(checkForUpdate, 3600000);
          } catch (x) {}
        });
      }
