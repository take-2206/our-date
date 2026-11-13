// LoveSync push module. Classic scripts share state declared in js/core.js.
const VAPID_PUBLIC = 'BIol42oCVVxoqcBVueyTLai3kV8qseeVBYozCu5SiUqb_0G33VrVVec7dFXmL3b9raPD3_nC4Epb8wVlVXhKq9E';      const pushOK = () =>
        location.protocol != 'file:' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
      const pushKeyOK = () => /^[\w-]{80,}$/.test(VAPID_PUBLIC);
      const pushFlag = () => 'ls_push_' + (S.user ? S.user.id : '');
      const b64u = (x) => {
        const b = atob((x + '='.repeat((4 - (x.length % 4)) % 4)).replace(/-/g, '+').replace(/_/g, '/'));
        return Uint8Array.from(b, (c) => c.charCodeAt(0));
      };
      const pushReg = async () => (await navigator.serviceWorker.getRegistration()) || navigator.serviceWorker.ready;
      const pushSubOf = async () => {
        const reg = await pushReg();
        return (await reg.pushManager.getSubscription()) || null;
      };
      const pushMake = async () => {
        const reg = await pushReg();
        return (
          (await reg.pushManager.getSubscription()) ||
          reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: b64u(VAPID_PUBLIC) })
        );
      };
      // Lưu / cập nhật máy này (kèm ngôn ngữ, múi giờ, 3 công tắc nhắc) vào Supabase
      async function pushSave(sub) {
        const j = sub.toJSON(),
          r = await sb.rpc('save_push_subscription', {
            p_endpoint: sub.endpoint,
            p_p256dh: j.keys.p256dh,
            p_auth: j.keys.auth,
            p_lang: S.lang,
            p_tz: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Ho_Chi_Minh',
            p_n1: !!S.n[0],
            p_n2: !!S.n[1],
            p_n3: !!S.n[2],
          });
        if (r.error) throw r.error;
      }
      async function pushEnable() {
        if (pushBusy) return;
        if (!pushOK()) return say(t('pushUnsup'));
        if (!pushKeyOK()) return say(t('pushCfg'));
        pushBusy = true;
        render();
        try {
          const perm = await Notification.requestPermission();
          if (perm != 'granted') throw new Error('denied');
          await pushSave(await pushMake());
          try {
            localStorage.setItem(pushFlag(), '1');
          } catch (x) {}
          pushOn = true;
          pushBusy = false;
          render();
        } catch (x) {
          pushOn = false;
          pushBusy = false;
          say(x.message == 'denied' ? t('pushDenied') : t('pushErr') + ' (' + (x.message || x) + ')');
        }
      }
      async function pushDisable() {
        pushBusy = true;
        render();
        try {
          const sub = await pushSubOf();
          if (sub) {
            await sb.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
            await sub.unsubscribe();
          }
        } catch (x) {}
        try {
          localStorage.removeItem(pushFlag());
        } catch (x) {}
        pushOn = false;
        pushBusy = false;
        render();
      }
      // Đăng xuất: gỡ máy này khỏi tài khoản để không nhận thông báo của người khác
      async function pushDetach() {
        pushOn = false;
        try {
          if (!pushOK()) return;
          const sub = await pushSubOf();
          if (sub) await sb.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        } catch (x) {}
      }
      // Sau khi đăng nhập: nếu máy này đã bật thông báo thì đồng bộ lại
      async function pushInit() {
        pushOn = false;
        if (!pushOK() || !pushKeyOK() || Notification.permission != 'granted') return;
        let f = '';
        try {
          f = localStorage.getItem(pushFlag()) || '';
        } catch (x) {}
        if (!f) return;
        try {
          await pushSave(await pushMake());
          pushOn = true;
          render();
        } catch (x) {}
      }
      // Đổi công tắc nhắc / ngôn ngữ thì cập nhật lại lên Supabase
      async function pushResync() {
        if (!pushOn) return;
        try {
          const sub = await pushSubOf();
          if (sub) await pushSave(sub);
        } catch (x) {}
      }
      function pushNote() {
        const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
        const m = !pushOK()
          ? ios
            ? t('pushIos')
            : t('pushUnsup')
          : !pushKeyOK()
            ? t('pushCfg')
            : Notification.permission == 'denied'
              ? t('pushDenied')
              : t('pushHint');
        return `<p class="sub" style="font-size:12px;margin-top:8px">${m}</p>`;
      }
      // Bấm thông báo -> mở đúng buổi hẹn
      function openFromUrl(id) {
        id = Number(id);
        if (!id || !S.user) return;
        const go = () => {
          if (!C.ev.some((e) => e.id == id)) return false;
          open = id;
          todoEdit = null;
          bell = false;
          view = 'det';
          render();
          return true;
        };
        if (!go()) refresh().then(go);
      }
      if ('serviceWorker' in navigator && location.protocol != 'file:')
        navigator.serviceWorker.addEventListener('message', (e) => {
          if (e.data && e.data.type == 'open-event') openFromUrl(e.data.id);
        });
      /* ===== 8. KHỞI ĐỘNG: nếu đã có phiên đăng nhập thì vào thẳng lịch, không thì hiện màn đăng nhập ===== */
