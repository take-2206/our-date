// LoveSync app module. Classic scripts share state declared in js/core.js.
const petChatSessionId = globalThis.crypto?.randomUUID?.();
let petChatPublishedFor = null,
    petChatPublishedAt = 0,
    petChatPublishBusy = false,
    petChatDesiredState = false,
    partnerChatCheckBusy = false,
    partnerChatCheckRetryAt = 0;

(async () => {
        const params = new URLSearchParams(location.search);
        if (CFG) {
          const { data } = await sb.auth.getSession();
          if (data.session) await enter(data.session.user);
        }
        view = S.user ? 'cal' : 'auth';
        if (S.user && params.get('view') == 'notes') view = 'notes';
        if (S.user && params.get('view') == 'pet-messages') {
          view = 'cal';
          petMessagesOpen = true;
        }
        render();
        const q = params.get('ev');
        if (q || params.has('view')) {
          history.replaceState(null, '', location.pathname);
        }
        if (q) {
          openFromUrl(q);
        }
      })();

function petChatIsActive() {
        return !!(S.user && view == 'cal' && document.visibilityState == 'visible');
      }

async function publishPetChatActivity(active = petChatIsActive()) {
        petChatDesiredState = active;
        const user = S.user;
        if (!user || !petChatSessionId || petChatPublishBusy) return;
        if (active && petChatPublishedFor === user.id && Date.now() - petChatPublishedAt < 5000) return;
        if (!active && petChatPublishedFor !== user.id) return;
        petChatPublishBusy = true;
        petChatPublishedFor = active ? user.id : null;
        petChatPublishedAt = Date.now();
        try {
          const { error } = await sb.rpc('set_pet_chat_active', { p_session_id: petChatSessionId, p_active: active });
          if (error) throw error;
        } catch (error) {
          // The server expires the record if a disconnect prevents clearing it.
        } finally {
          petChatPublishBusy = false;
          if (S.user === user && petChatDesiredState !== active)
            void publishPetChatActivity(petChatDesiredState);
        }
      }

async function syncPartnerChatActivity() {
        const user = S.user;
        if (!user || !petMessagesOpen || partnerChatCheckBusy || Date.now() < partnerChatCheckRetryAt) return;
        partnerChatCheckBusy = true;
        try {
          const { data, error } = await sb.rpc('is_partner_pet_chat_active');
          if (error) throw error;
          if (S.user !== user) return;
          if (data) markPartnerOnline();
          else if (!partnerOnlineLastSeen || Date.now() - partnerOnlineLastSeen > 12000) {
            partnerOnline = false;
            partnerOnlineLastSeen = 0;
            partnerPetTyping = false;
            paintPetMessagePresence();
            paintPetMessageTyping();
          }
        } catch (error) {
          partnerChatCheckRetryAt = Date.now() + 30000;
        } finally {
          partnerChatCheckBusy = false;
        }
      }

function notifyApp(body, tag, type, title = 'LoveSync') {
        if (type == 'open-pet-messages' && petChatIsActive()) return;
        say(body);
        if (
          !('Notification' in window) ||
          Notification.permission != 'granted' ||
          !('serviceWorker' in navigator)
        )
          return;
        navigator.serviceWorker.ready
          .then((registration) => {
            if (type == 'open-pet-messages' && petChatIsActive()) return;
            return registration.showNotification(title, {
              body,
              icon: './img/icons/app-icon-192.png',
              badge: './img/icons/app-icon-192.png',
              tag,
              renotify: !!tag,
              requireInteraction: type == 'app-update',
              vibrate: type == 'app-update' ? [180, 80, 180] : undefined,
              data: {
                url: type == 'open-notes' ? './?view=notes' : type == 'open-pet-messages' ? './?view=pet-messages' : './',
                type: type || '',
              },
            });
          })
          .catch(() => {});
      }

function offerAppUpdate(registration) {
        if (!registration || !registration.waiting || !navigator.serviceWorker.controller) return;
        const firstNotice = !appUpdateReady;
        appUpdateRegistration = registration;
        appUpdateReady = true;
        paintAppUpdatePrompt();
        if (firstNotice)
          notifyApp(t('updateAvailable'), 'app-update', 'app-update', t('updateNotificationTitle'));
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
            const checkForUpdate = (force = false) => {
              if (!force && Date.now() - lastUpdateCheck < 30000) return;
              lastUpdateCheck = Date.now();
              registration.update().then(() => offerAppUpdate(registration)).catch(() => {});
            };
            document.addEventListener('visibilitychange', () => {
              if (document.visibilityState == 'visible') checkForUpdate(true);
            });
            addEventListener('focus', () => checkForUpdate(true));
            addEventListener('online', () => checkForUpdate(true));
            checkForUpdate(true);
            setInterval(checkForUpdate, 30000);
          } catch (x) {}
        });
      }

document.addEventListener('scroll', (event) => {
        if (event.target.matches?.('.pet-message-thread')) acknowledgePetMessages();
      }, true);

document.addEventListener('visibilitychange', () => {
        if (!S.user) return;
        void publishPetChatActivity();
        if (typeof sendRealtimeOnlineState == 'function')
          sendRealtimeOnlineState(document.visibilityState == 'visible');
        if (document.visibilityState != 'visible' || typeof refresh != 'function') return;
        refresh().then(() => {
          if (typeof paintPetMessages == 'function') paintPetMessages();
        }).catch(() => {});
      });

addEventListener('pagehide', () => {
        void publishPetChatActivity(false);
        if (S.user && typeof sendRealtimeOnlineState == 'function') sendRealtimeOnlineState(false);
      });
addEventListener('pageshow', () => {
        void publishPetChatActivity();
        if (S.user && typeof sendRealtimeOnlineState == 'function') sendRealtimeOnlineState(true);
      });

setInterval(() => {
        if (petChatIsActive()) void publishPetChatActivity();
        if (document.visibilityState == 'visible' && S.user && typeof sendRealtimeOnlineState == 'function')
          sendRealtimeOnlineState(true);
        if (typeof expireRealtimeOnlineState == 'function') expireRealtimeOnlineState();
      }, 5000);

setInterval(() => {
        if (document.visibilityState == 'visible' && S.user && petMessagesOpen) {
          syncPetMessagesLive();
          void syncPartnerChatActivity();
        }
      }, 2500);
