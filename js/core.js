// LoveSync core module. Classic scripts share state declared in js/core.js.
/* ===== 1. NGÔN NGỮ (vi / en). Thêm chữ mới = thêm cùng một khoá ở cả hai bên ===== */
let PET = { name: "Mochi", reactions: [] };
      const D = {
        vi: {
          cal: 'Lịch',
          det: 'Buổi hẹn',
          notes: 'Ghi chú',
          set: 'Cài đặt',
          in: 'Đăng nhập',
          up: 'Đăng ký',
          em: 'Email',
          pw: 'Mật khẩu',
          forgot: 'Quên mật khẩu?',
          invite: 'Nhập mã mời của người ấy',
          soon: 'sắp tới',
          noUpcoming: 'Không còn buổi hẹn sắp tới',
          allDates: 'từ cũ nhất đến mới nhất',
          none: 'Chưa có buổi hẹn nào',
          add: 'Thêm buổi hẹn',
          ttl: 'Tiêu đề',
          dt: 'Ngày',
          tm: 'Giờ',
          pl: 'Địa điểm',
          save: 'Lưu',
          edit: 'Chỉnh sửa',
          saveChanges: 'Lưu thay đổi',
          cancel: 'Hủy',
          prep: 'cần chuẩn bị',
          todo: 'Thêm việc cần làm…',
          addTodo: 'Thêm',
          editTodo: 'Sửa',
          deleteTodo: 'Xóa',
          saveTodo: 'Lưu',
          both: 'Cả hai đã xác nhận',
          del: 'Xóa buổi hẹn',
          acc: 'tài khoản',
          nt: 'thông báo',
          n1: 'Nhắc trước 1 ngày',
          n2: 'Nhắc trước 1 giờ',
          n3: 'Tin từ người ấy',
          pushT: 'Thông báo về điện thoại',
          pushHint: 'Nhắc hẹn và tin từ người ấy sẽ gửi về máy này, kể cả khi đã đóng app.',
          pushIos: 'Trên iPhone: bấm Chia sẻ → "Thêm vào Màn hình chính", rồi mở app từ biểu tượng đó để bật thông báo.',
          pushUnsup: 'Trình duyệt này chưa hỗ trợ thông báo đẩy.',
          pushDenied: 'Thông báo đang bị chặn. Hãy cho phép thông báo của LoveSync trong cài đặt của máy.',
          pushCfg: 'Chưa dán khóa VAPID công khai vào js/push.js (biến VAPID_PUBLIC).',
          pushErr: 'Không bật được thông báo',
          lang: 'Ngôn ngữ',
          out: 'Đăng xuất',
          linked: 'đã liên kết',
          pt: 'người ấy',
          ptNone: 'Người ấy chưa tham gia',
          ptNoneH: 'Gửi mã kết nối cho người ấy để bắt đầu',
          ptOn: 'đã kết nối',
          ptOff: 'đang chờ',
          editProfile: 'Sửa thông tin cá nhân',
          dn: 'Tên hiển thị',
          pfFail: 'Không lưu được. Hãy kiểm tra quyền UPDATE của bảng profiles trên Supabase.',
          dc: 'ngày bên nhau',
          dcSet: 'Đặt ngày bắt đầu yêu',
          dcFrom: 'từ',
          dcNext: 'còn {n} ngày nữa đến ngày thứ {m}',
          dcAnnToday: 'Chúc mừng kỷ niệm {n} năm! ♥',
          dcAnnNext: 'Còn {n} ngày đến kỷ niệm {y} năm',
          dcTtl: 'Ngày bắt đầu yêu',
          dcLocal: 'Mới lưu trên máy này. Để cả hai cùng thấy, cần thêm cột start_date vào bảng couples trên Supabase.',
          map: 'Bản đồ',
          route: 'Chỉ đường',
          eedit: 'Sửa thời gian & địa điểm',
          del1: 'Xóa việc này',
          board: 'bảng_ghi_chú_chung',
          addNote: 'Dán ghi chú',
          notePlaceholder: 'Viết điều gì đó cho hai bạn…',
          noNotes: 'Chưa có ghi chú. Hãy dán ghi chú đầu tiên!',
          editNote: 'Sửa ghi chú',
          deleteNote: 'Xóa ghi chú',
          noteColor: 'Màu ghi chú',
          noteTyping: '{name} đang nhập…',
          noteAdded: '{name} vừa thêm một ghi chú mới.',
          noteUpdated: '{name} vừa cập nhật một ghi chú.',
          resizeNote: 'Đổi kích thước ghi chú',
          updateAvailable: 'Có phiên bản mới của LoveSync.',
          updateAction: 'Cập nhật ngay',
          updateApplying: 'Đang cập nhật…',
          dragNote: 'Kéo một tờ giấy màu bạn thích xuống bảng',
          dropNote: 'Thả ghi chú ở bất kỳ đâu trên bảng',
          noteSetup: 'Bảng ghi chú chưa được thiết lập. Hãy chạy tệp supabase-notes.sql trong Supabase.',
          album: 'Album',
          albumSub: 'album_ảnh_chung',
          phAdd: 'Thêm ảnh',
          phAll: 'Tất cả',
          phNone: 'Chưa có ảnh nào',
          phNoneH: 'Thêm bức ảnh đầu tiên của hai bạn nhé',
          phAlbum: 'Album',
          phAlbumPh: 'Ví dụ: Đà Lạt 2026 (có thể để trống)',
          phCap: 'Chú thích',
          phCapPh: 'Viết vài chữ cho kỷ niệm này…',
          phN: 'Đã chọn {n} ảnh',
          phBusy: 'Đang tải ảnh lên…',
          phFail: '{n} ảnh tải lên không thành công',
          phDelQ: 'Chuyển ảnh này vào thùng rác?',
          phDel: 'Xoá ảnh',
          phSetup: 'Album chưa được thiết lập. Hãy chạy tệp supabase-album.sql trong Supabase.',
          phDate: 'Ngày chụp',
          phPlace: 'Địa điểm',
          phPlaceIPh: 'Ví dụ: Hồ Xuân Hương (có thể để trống)',
          phOfDay: 'Ảnh kỷ niệm',
          phOpenAlbum: 'Mở trong album',
          phMore: 'ảnh',
          phMigrate: 'Hãy chạy tệp supabase-album-dates.sql trong Supabase để lưu ngày và địa điểm của ảnh.',
          phPrev: 'Ảnh trước',
          phNext: 'Ảnh sau',
          phClose: 'Đóng',
          efFail: 'Không lưu được. Hãy kiểm tra quyền UPDATE của bảng events trên Supabase.',
          empN: 'Không có thông báo mới',
          code: 'Mã mời cặp đôi',
          back: 'Quay lại',
          pick: 'Chọn một buổi hẹn trong lịch để xem chi tiết',
          you: 'Bạn',
          e1: 'Xem phim & cà phê',
          e2: 'Picnic cuối tuần',
          p1: 'Đặt vé xem phim',
          p2: 'Đặt bàn cà phê',
          p3: 'Mua hoa nhỏ',
          l1: 'Quận 1',
          l2: 'Công viên',
          shared: 'lịch_chung',
          remind: 'nhắc',
          nm: 'Tên của bạn (dùng để đăng nhập)',
          gd: 'Giới tính',
          gf: 'Nữ',
          gm: 'Nam',
          cc: 'Mã kết nối',
          ccH: 'Nhập mã của người ấy, hoặc để trống để tạo mã mới',
          newDate: 'đã gửi một lịch hẹn mới',
          send: 'Gửi thông báo cho người ấy',
          readAll: 'Đánh dấu đã đọc',
          okd: 'đã đồng ý lịch hẹn',
          nod: 'đã từ chối lịch hẹn',
          yes: 'Đồng ý',
          no: 'Từ chối',
          wait: 'chờ',
          ltWish: 'muốn hẹn bạn',
          ltDate: 'Ngày',
          ltTime: 'Giờ',
          ltPlace: 'Địa điểm',
          ltAsk: 'Bạn có đồng ý không?',
          ltOk: 'Đã đồng ý. Lịch hẹn đã được lưu vào lịch của bạn.',
          ltNo: 'Đã từ chối lịch hẹn này.',
          ltConfirmDecline: 'Bạn chắc chưa?',
          ltSure: 'Chắc chắn',
          ltCancel: 'Hủy',
          close: 'Đóng',
          badLogin: 'Sai tên hoặc mật khẩu. Nếu chưa có tài khoản, hãy dùng tab Đăng ký.',
          noConf:
            'Supabase đang yêu cầu xác nhận email. Hãy tắt Confirm email trong Authentication, vì app không dùng email thật.',
          dup: 'Tên này đã có người dùng nhưng mật khẩu không khớp. Hãy nhập đúng mật khẩu hoặc chọn tên khác.',
          un: 'Tên đăng nhập',
          unph: 'vd: lan.anh',
          badName: 'Tên cần ít nhất 3 ký tự chữ hoặc số.',
          badCode: 'Mã kết nối không đúng',
          full: 'Cặp đôi này đã đủ 2 người',
          noProf: 'Tài khoản chưa có hồ sơ. Hãy chuyển sang tab Đăng ký để hoàn tất.',
          trash: 'Thùng rác',
          trashSub: 'Có thể khôi phục trong 30 ngày',
          trashEmpty: 'Thùng rác đang trống',
          trashOpen: 'Mở thùng rác',
          trashRestore: 'Khôi phục',
          trashDelete: 'Xoá vĩnh viễn',
          trashDeleteQ: 'Xoá vĩnh viễn mục này? Không thể hoàn tác.',
          trashDays: 'còn {n} ngày',
          trashSetup: 'Hãy chạy supabase-recycle-bin.sql trong Supabase trước.',
          petKicker: 'NUÔI CÙNG NHAU',
          petSub: 'Cùng chăm một bé, cùng gửi chút yêu thương.',
          petRename: 'Đổi tên pet',
          petPartner: 'Người ấy',
          petMale: 'Nhân vật nam',
          petFemale: 'Nhân vật nữ',
          petSend: 'Gửi cảm xúc cho pet',
          petReactOption: 'Gửi {emoji}',
          petNamePrompt: 'Đặt tên cho pet chung của hai bạn:',
          petDeleteBubble: 'Xóa bubble của bạn',
          petSharedBubbles: 'Mỗi người có bubble riêng — cả hai cùng thấy',
          cfg: 'Chưa điền SUPABASE_URL và SUPABASE_KEY trong js/core.js.',
        },
        en: {
          cal: 'Calendar',
          det: 'Dates',
          notes: 'Notes',
          set: 'Settings',
          in: 'Log in',
          up: 'Sign up',
          em: 'Email',
          pw: 'Password',
          forgot: 'Forgot password?',
          invite: 'Enter your partner’s invite code',
          soon: 'upcoming',
          noUpcoming: 'No more upcoming dates',
          allDates: 'oldest to newest',
          none: 'No dates yet',
          add: 'Add a date',
          ttl: 'Title',
          dt: 'Date',
          tm: 'Time',
          pl: 'Place',
          save: 'Save',
          edit: 'Edit',
          saveChanges: 'Save changes',
          cancel: 'Cancel',
          prep: 'to prepare',
          todo: 'Add a to-do…',
          addTodo: 'Add',
          editTodo: 'Edit',
          deleteTodo: 'Delete',
          saveTodo: 'Save',
          both: 'Both of you confirmed',
          del: 'Delete date',
          acc: 'account',
          nt: 'notifications',
          n1: 'Remind 1 day before',
          n2: 'Remind 1 hour before',
          n3: 'Messages from partner',
          pushT: 'Phone notifications',
          pushHint: 'Reminders and messages from your partner are sent to this device, even when the app is closed.',
          pushIos: 'On iPhone: tap Share → "Add to Home Screen", then open the app from that icon to turn notifications on.',
          pushUnsup: 'This browser does not support push notifications.',
          pushDenied: 'Notifications are blocked. Allow LoveSync notifications in your device settings.',
          pushCfg: 'The public VAPID key is not set in js/push.js (VAPID_PUBLIC).',
          pushErr: 'Could not turn on notifications',
          lang: 'Language',
          out: 'Log out',
          linked: 'linked',
          pt: 'partner',
          ptNone: 'Your partner has not joined yet',
          ptNoneH: 'Send them your connection code to get started',
          ptOn: 'connected',
          ptOff: 'pending',
          editProfile: 'Edit profile',
          dn: 'Display name',
          pfFail: 'Could not save. Check the UPDATE policy on the profiles table in Supabase.',
          dc: 'days together',
          dcSet: 'Set your start date',
          dcFrom: 'since',
          dcNext: '{n} days until day {m}',
          dcAnnToday: 'Happy {n}-year anniversary! ♥',
          dcAnnNext: '{n} days until your {y}-year anniversary',
          dcTtl: 'Start date',
          dcLocal: 'Saved on this device only. To share it, add a start_date column to the couples table in Supabase.',
          map: 'Map',
          route: 'Directions',
          eedit: 'Edit time & place',
          del1: 'Remove this item',
          board: 'shared_note_board',
          addNote: 'Post note',
          notePlaceholder: 'Write something for the two of you…',
          noNotes: 'No notes yet. Post the first one!',
          editNote: 'Edit note',
          deleteNote: 'Delete note',
          noteColor: 'Note color',
          noteTyping: '{name} is typing…',
          noteAdded: '{name} added a new sticky note.',
          noteUpdated: '{name} updated a sticky note.',
          resizeNote: 'Resize note',
          updateAvailable: 'A new version of LoveSync is available.',
          updateAction: 'Update now',
          updateApplying: 'Updating…',
          dragNote: 'Drag a sheet from your favorite color pile',
          dropNote: 'Drop notes anywhere on the board',
          noteSetup: 'The note board is not set up yet. Run supabase-notes.sql in Supabase.',
          album: 'Album',
          albumSub: 'shared_photo_album',
          phAdd: 'Add photos',
          phAll: 'All',
          phNone: 'No photos yet',
          phNoneH: 'Add the first photo of the two of you',
          phAlbum: 'Album',
          phAlbumPh: 'e.g. Da Lat 2026 (optional)',
          phCap: 'Caption',
          phCapPh: 'Write a few words about this memory…',
          phN: '{n} photo(s) selected',
          phBusy: 'Uploading photos…',
          phFail: '{n} photo(s) failed to upload',
          phDelQ: 'Move this photo to the recycle bin?',
          phDel: 'Delete photo',
          phSetup: 'The album is not set up yet. Run supabase-album.sql in Supabase.',
          phDate: 'Date taken',
          phPlace: 'Place',
          phPlaceIPh: 'e.g. Xuan Huong Lake (optional)',
          phOfDay: 'Photo memories',
          phOpenAlbum: 'Open in album',
          phMore: 'photos',
          phMigrate: 'Run supabase-album-dates.sql in Supabase to save photo dates and places.',
          phPrev: 'Previous photo',
          phNext: 'Next photo',
          phClose: 'Close',
          efFail: 'Could not save. Check the UPDATE policy on the events table in Supabase.',
          empN: 'No new notifications',
          code: 'Couple invite code',
          back: 'Back',
          pick: 'Pick a date on the calendar to see details',
          you: 'You',
          e1: 'Movie & coffee',
          e2: 'Weekend picnic',
          p1: 'Book movie tickets',
          p2: 'Reserve a cafe table',
          p3: 'Buy a small bouquet',
          l1: 'District 1',
          l2: 'Park',
          shared: 'shared_calendar',
          remind: 'reminders',
          nm: 'Your name (used to log in)',
          gd: 'Gender',
          gf: 'Female',
          gm: 'Male',
          cc: 'Connection code',
          ccH: 'Enter your partner’s code, or leave blank to create a new one',
          newDate: 'sent a new date',
          send: 'Notify your partner',
          readAll: 'Mark all as read',
          okd: 'accepted the date',
          nod: 'declined the date',
          yes: 'Accept',
          no: 'Decline',
          wait: 'pending',
          ltWish: 'would like to meet you',
          ltDate: 'Date',
          ltTime: 'Time',
          ltPlace: 'Place',
          ltAsk: 'Will you come?',
          ltOk: 'Accepted. The date is saved to your calendar.',
          ltNo: 'You declined this date.',
          ltConfirmDecline: 'Are you sure?',
          ltSure: 'Yes, decline',
          ltCancel: 'Cancel',
          close: 'Close',
          badLogin: 'Wrong name or password. If you have no account yet, use the Sign up tab.',
          noConf:
            'Supabase requires email confirmation. Turn off Confirm email in Authentication, since this app uses no real email.',
          dup: 'This name is taken and the password does not match. Enter the right password or pick another name.',
          un: 'Username',
          unph: 'e.g. lan.anh',
          badName: 'Name needs at least 3 letters or digits.',
          badCode: 'Invalid connection code',
          full: 'This couple already has 2 people',
          noProf: 'This account has no profile yet. Switch to Sign up to finish.',
          trash: 'Recycle bin',
          trashSub: 'Restore items for up to 30 days',
          trashEmpty: 'The recycle bin is empty',
          trashOpen: 'Open recycle bin',
          trashRestore: 'Restore',
          trashDelete: 'Delete forever',
          trashDeleteQ: 'Delete this item forever? This cannot be undone.',
          trashDays: '{n} days left',
          trashSetup: 'Run supabase-recycle-bin.sql in Supabase first.',
          petKicker: 'OUR SHARED PET',
          petSub: "Let's care for our little friend and share some love.",
          petRename: 'Rename pet',
          petPartner: 'Your partner',
          petMale: 'Male character',
          petFemale: 'Female character',
          petSend: 'Send a reaction to the pet',
          petReactOption: 'Send {emoji}',
          petNamePrompt: 'Name your shared pet:',
          petDeleteBubble: 'Remove your bubble',
          petSharedBubbles: 'Each person has a bubble — both can see them',
          cfg: 'SUPABASE_URL and SUPABASE_KEY are not set in js/core.js.',
        },
      };
      /* ===== 2. TIỆN ÍCH NGÀY THÁNG: key(date) -> "YYYY-MM-DD" ===== */
      const key = (d) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, 0)}-${String(d.getDate()).padStart(2, 0)}`;
      // (plus/seed: dữ liệu mẫu của bản chạy offline cũ, bản Supabase không còn dùng)
      const plus = (n) => {
        const d = new Date();
        d.setDate(d.getDate() + n);
        return key(d);
      };
      const seed = () => [
        {
          id: 1,
          title: { k: 'e1' },
          date: plus(3),
          time: '19:00',
          place: { k: 'l1' },
          todo: [
            { t: { k: 'p1' }, d: 1 },
            { t: { k: 'p2' }, d: 0 },
            { t: { k: 'p3' }, d: 0 },
          ],
        },
        { id: 2, title: { k: 'e2' }, date: plus(9), time: '09:00', place: { k: 'l2' }, todo: [] },
      ];
      // ===== SUPABASE: điền 2 giá trị này (Project Settings > API) =====
      const SB_URL = 'https://hogbjhrwmcwohqjiqaax.supabase.co',
        SB_KEY = 'sb_publishable_bojYJA6F9H2KiF7C1Mk0XQ_YhtL9bgK';
      // CFG = true khi đã điền URL/KEY; sb = client kết nối Supabase
      const CFG = !/YOUR-/.test(SB_URL + SB_KEY) && typeof supabase != 'undefined',
        sb = CFG ? supabase.createClient(SB_URL, SB_KEY) : null;
      // S = cài đặt trên máy (ngôn ngữ, công tắc thông báo, người đang đăng nhập)
      // C = dữ liệu của cặp đôi (ev = buổi hẹn, nt = thông báo, notes = ghi chú chung)
      let S = {},
        C = { ev: [], nt: [], notes: [], photos: [], trash: { ev: [], notes: [], photos: [] } };
      try {
        S = JSON.parse(localStorage.getItem('ls')) || {};
      } catch (e) {}
      S = { lang: S.lang || 'vi', n: S.v == 2 ? S.n : [1, 1, 1], user: null };
      // Buổi hẹn được phép hiện: đã đồng ý, hoặc đang chờ nhưng do chính mình tạo (bị từ chối thì ẩn)
      const EV = () => C.ev.filter((e) => !e.st || e.st == 'ok' || (e.st == 'pending' && e.by == S.user.id));
      // Lưu cài đặt cục bộ (ngôn ngữ + công tắc thông báo)
      const save = () => {
        try {
          localStorage.setItem('ls', JSON.stringify({ v: 2, lang: S.lang, n: S.n }));
        } catch (e) {}
      };
      /* Trạng thái giao diện:
         view = màn hình (boot/auth/cal/det/set), msg = lỗi trên form, P = hồ sơ hai người,
         CH = kênh realtime, mode = tab đăng nhập/đăng ký, cur = tháng đang xem,
         sel = ngày được chọn, open = buổi hẹn đang mở, bell/modal = bảng đang mở */
      let view = 'boot',
        msg = '',
        P = {},
        CH = null,
        mode = 'in',
        cur = new Date(),
        sel = key(new Date()),
        open = null,
        bell = false,
        modal = false,
        pmod = false,
        smod = false,
        todoEdit = null,
        noteEdit = null,
        noteError = '',
        trashError = '',
        noteDraft = null,
        noteDrag = null,
        noteResize = null,
        noteTypers = {},
        notePresenceKey = Math.random().toString(36).slice(2),
        realtimeReady = false,
        localTypingNote = null,
        localTypingTimer = null,
        localTypingSentAt = 0,
        pendingNoteSave = Promise.resolve(),
        appUpdateReady = false,
        appUpdateApplying = false,
        appUpdateRegistration = null,
        albumSel = '',
        albumFocus = null,
        pushOn = false,
        pushBusy = false,
        pvDay = null,
        pv = null,
        umod = null,
        upBusy = null,
        photoError = '',
        PU = {};
      cur.setDate(1);
      // t("khoá") lấy chữ theo ngôn ngữ; tx() cho phép nội dung dạng {k:"khoá"}; esc() chống chèn HTML
      const t = (k) => D[S.lang][k],
        tx = (v) => (typeof v == 'object' ? t(v.k) : v);
      const esc = (s) =>
        String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
      // Avatar: AVF = ảnh nữ (img/girl.png), AVM = ảnh nam (img/boy.png), AVF0 = ảnh nữ nhúng sẵn dùng khi thiếu file
      // IMG = 3 ảnh lá thư nhúng base64: e0 = phong bì đóng, e1 = phong bì mở, pp = giấy thư
      const AVF0 = 'data:image/jpeg;base64,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';
      const AVF = 'img/girl.png',
        AVM = 'img/boy.png';
      const IMG = {
        e0: './img/letter_0.png',
        e1: './img/letter_1.png',
        pp: './img/paper.png',
      };
      // me() = giới tính của mình, pr() = của người ấy, av(g, cỡ) = vẽ avatar tròn
      const me = () => (S.user && S.user.gender) || 'f',
        pr = () => {
          const p = Object.values(P).find((x) => x.id != (S.user || {}).id);
          return p ? p.gender : me() == 'f' ? 'm' : 'f';
        },
        partner = () => Object.values(P).find((x) => x.id != (S.user || {}).id) || null,
        genCode = () => 'LOVE-' + Math.random().toString(36).slice(2, 6).toUpperCase();
      const av = (g, z) =>
        `<span class="av" style="width:${z}px;height:${z}px"><img src="${g == 'm' ? AVM : AVF}" alt="" onerror="avFail(this,'${g}')"></span>`;
      // Nếu thiếu file ảnh: nữ dùng ảnh nhúng sẵn, nam dùng hình SVG vẽ sẵn
      function avFail(i, g) {
        i.onerror = null;
        if (g == 'm') i.parentNode.innerHTML = '<svg aria-hidden="true"><use href="#bo"/></svg>';
        else i.src = AVF0;
      }
      // ic() vẽ biểu tượng từ <symbol>, sv() bọc đường vẽ SVG, I = bộ biểu tượng (lịch, cài đặt, chuông, mũi tên)
      const ic = (id, w = 18, h = 14) =>
        `<svg width="${w}" height="${h}" aria-hidden="true"><use href="#${id}"/></svg>`;
      const sv = (p) =>
        `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;
      const I = {
        cal: sv('<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M8 3v4M16 3v4M3 11h18"/>'),
        note: sv('<path d="M5 3h14a2 2 0 012 2v10l-6 6H5a2 2 0 01-2-2V5a2 2 0 012-2z"/><path d="M15 21v-5a1 1 0 011-1h5M7 8h10M7 12h7"/>'),
        set: sv(
          '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
        ),
        bell: sv('<path d="M6 9a6 6 0 0112 0c0 6 2 7 2 7H4s2-1 2-7"/><path d="M10 20a2 2 0 004 0"/>'),
        back: sv('<path d="M15 5l-7 7 7 7"/>'),
        fwd: sv('<path d="M9 5l7 7-7 7"/>'),
        x: sv('<path d="M6 6l12 12M18 6L6 18"/>'),
        trash: sv('<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>'),
        photo: sv('<rect x="3" y="4" width="18" height="16" rx="3"/><circle cx="9" cy="10" r="2"/><path d="M21 16l-5-5-9 9"/>'),
        pin: sv('<path d="M12 21s7-6.2 7-11a7 7 0 10-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>'),
      };
      // Ngày giờ theo ngôn ngữ: fmt() định dạng, rel() = "3 ngày nữa", up() = danh sách buổi hẹn sắp tới
      const loc = () => (S.lang == 'vi' ? 'vi-VN' : 'en-US');
      const today0 = () => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
      };
      const parse = (s) => {
        const [y, m, d] = s.split('-').map(Number);
        return new Date(y, m - 1, d);
      };
      const rel = (s) =>
        new Intl.RelativeTimeFormat(loc(), { numeric: 'auto' }).format(
          Math.round((parse(s) - today0()) / 864e5),
          'day',
        );
      const fmt = (s, o) => parse(s).toLocaleDateString(loc(), o);
      const up = () =>
        EV()
          .filter((e) => parse(e.date) >= today0())
          .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
      // Thẻ một buổi hẹn trong danh sách
      const evCard = (e) =>
        `<button class="card h ev" data-a="ev" data-id="${e.id}"><div class="d">${fmt(e.date, { day: 'numeric' })}<small class="mono">${fmt(e.date, { month: 'short' })}</small></div><div class="i"><h2 style="font-size:15px;font-weight:800">${esc(tx(e.title))}</h2><p class="sub" style="font-size:12px">${e.time} · ${esc(tx(e.place))}</p></div>${e.st == 'pending' ? `<span class="chip">${t('wait')}</span>` : ic('hr')}</button>`;
      /* Thông báo: mine() = do người ấy gửi, isR() = đã đọc chưa, unread() = các cái chưa đọc,
         ntx() = nội dung theo loại (lịch mới / đồng ý / từ chối) */
      const mine = () => C.nt.filter((n) => n.by != S.user.id).sort((a, b) => b.ts - a.ts);
      const ntx = (n) => (n.k == 'ok' ? t('okd') : n.k == 'no' ? t('nod') : t('newDate'));
      const isR = (n) => (n.r || []).includes(S.user.id);
      const unread = () => mine().filter((n) => !isR(n));
      const ago = (ts) => {
        const m = Math.round((ts - Date.now()) / 6e4),
          f = new Intl.RelativeTimeFormat(loc(), { numeric: 'auto' });
        return Math.abs(m) < 60
          ? f.format(m, 'minute')
          : Math.abs(m) < 1440
            ? f.format(Math.round(m / 60), 'hour')
            : f.format(Math.round(m / 1440), 'day');
      };
      // Phần đầu mỗi màn hình: tiêu đề + chuông (số chưa đọc) + avatar hai người
      const head = (title, sub) => {
        const u = unread().length,
          ups = up()
            .filter((e) => (parse(e.date) - today0()) / 864e5 <= 7)
            .slice(0, 3),
          ms = mine().slice(0, 5);
        return `<header class="top"><div><p class="mono sub" style="font-size:11px">&gt; ${sub}</p><h1 class="px">${title}</h1></div><div class="r"><button class="ib" data-a="bell" aria-label="${t('nt')}${u ? ' (' + u + ')' : ''}" aria-expanded="${bell}">${I.bell}${u ? `<i class="bd">${u}</i>` : ''}</button><div class="pair">${av(me(), 44)}${av(pr(), 44)}</div>${
          bell
            ? `<div class="card pop" role="dialog">${
                ms
                  .map((n) => {
                    const e = C.ev.find((x) => x.id == n.evId);
                    return `<button class="nt${isR(n) ? '' : ' un'}" data-a="nt" data-id="${n.id}">${av((P[n.by] || {}).gender || 'f', 36)}<span><b>${esc((P[n.by] || {}).name || '')}</b> ${ntx(n)}${e ? ': ' + esc(tx(e.title)) : ''}<small class="sub mono">${e ? fmt(e.date, { day: 'numeric', month: 'short' }) + ' · ' + e.time + ' · ' : ''}${ago(n.ts)}</small></span></button>`;
                  })
                  .join('') || `<div class="sub">${t('empN')}</div>`
              }${ups.length ? `<p class="mono sub h2" style="padding:10px 12px 0">// ${t('remind')}</p>` + ups.map((e) => `<div><b>${esc(tx(e.title))}</b><p class="sub mono" style="font-size:12px">${rel(e.date)} · ${e.time}</p></div>`).join('') : ''}${u ? `<button class="btn b2" data-a="read" style="min-height:40px;margin-top:6px">${t('readAll')}</button>` : ''}</div>`
            : ''
        }</div></header>`;
      };
      // Thanh tab: Lịch / Buổi hẹn / Cài đặt
      const nav = () =>
        `<nav class="tb">${[
          ['cal', I.cal],
          ['det', ic('hr')],
          ['notes', I.note],
          ['album', I.photo],
          ['set', I.set],
        ]
          .map(
            ([v, i]) =>
              `<button class="t${view == v || (view == 'trash' && v == 'set') ? ' on' : ''}" data-a="go" data-v="${v}"><span class="t-icon${v == 'det' ? ' heart' : ''}">${i}</span><span class="t-label">${t(v)}</span></button>`,
          )
          .join('')}</nav>`;
      // Nút VI / EN
      const lang = () =>
        `<div class="lg" role="group" aria-label="${t('lang')}">${['vi', 'en'].map((l) => `<button data-a="lang" data-l="${l}" aria-pressed="${S.lang == l}">${l.toUpperCase()}</button>`).join('')}</div>`;
      // Các ô chỉ có ở tab Đăng ký: tên, giới tính, mã kết nối
      const reg = () =>
        `<div class="fl"><label class="lb" for="nm">${t('nm')}</label><input class="in" id="nm" name="name" required maxlength="24" autocomplete="username"></div><fieldset class="gd"><legend class="lb">${t('gd')}</legend>${[
          ['f', 'gf'],
          ['m', 'gm'],
        ]
          .map(
            ([g, k]) =>
              `<label class="gb"><input type="radio" name="gender" value="${g}" ${g == 'f' ? 'checked' : ''}>${av(g, 56)}<span>${t(k)}</span></label>`,
          )
          .join(
            '',
          )}</fieldset><div class="fl"><label class="lb" for="cc">${t('cc')}</label><input class="in mono" id="cc" name="code" placeholder="LOVE-XXXX" maxlength="12" autocapitalize="characters"><p class="hint">${t('ccH')}</p></div>`;
      /* ===== 3. CÁC MÀN HÌNH (mỗi hàm trả về chuỗi HTML) ===== */
      // Màn đăng nhập / đăng ký
