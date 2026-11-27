// LoveSync actions module. Classic scripts share state declared in js/core.js.
/* ===== 5. HÀNH ĐỘNG ===== */
/* act(tên, dữ liệu, phần tử) xử lý mọi nút có data-a="tên":
         go = đổi màn hình, lang = đổi ngôn ngữ, mode = tab đăng nhập/đăng ký, day = chọn ngày,
         mo = đổi tháng, ev = mở buổi hẹn, bell = bật/tắt chuông, new = mở form thêm,
         close = đóng form, out = đăng xuất, del = xoá buổi hẹn, tg = công tắc thông báo,
         chk = tick việc cần làm, nt = mở thông báo, read = đánh dấu đã đọc hết,
         acc / dec = đồng ý / mở xác nhận từ chối, lclose = đóng lá thư */
function act(a, d, el) {
  if (a == "appUpdate") {
    applyAppUpdate();
    return;
  }
  if (a == "close" && el.classList.contains("mod") && event.target !== el)
    return;
  if (a == "lclose" && el.classList.contains("lt") && event.target !== el)
    return;
  if (a == "pclose" && el.classList.contains("mod") && event.target !== el)
    return;
  if (a == "petFeelingClose" && el.classList.contains("mod") && event.target !== el)
    return;
  if (a == "sclose" && el.classList.contains("mod") && event.target !== el)
    return;
  if (a == "petMessagesClose" && el.classList.contains("mod") && event.target !== el)
    return;
  if (a == "dcClose" && el.classList.contains("mod") && event.target !== el)
    return;
  if (a == "uclose" && el.classList.contains("mod") && event.target !== el)
    return;
  if (a == "toggleRoomLight") {
    try {
      localStorage.setItem('ls-room-lights', roomLightsOn() ? 'off' : 'on');
    } catch (e) {}
  } else if (a == "go") {
    view = d.v;
    bell = false;
    if (view != "notes") {
      stopLocalNoteTyping();
      noteEdit = null;
      noteDraft = null;
    }
    if (view == "det") open = null;
  } else if (a == "lang") {
    S.lang = d.l;
    save();
    pushResync();
  } else if (a == "mode") {
    mode = d.m;
    msg = "";
  } else if (a == "forgot") {
    mode = "reset";
    msg = "";
  } else if (a == "resetBack") {
    mode = "in";
    msg = "";
  } else if (a == "day") {
    sel = d.k;
    const p = parse(d.k);
    cur = new Date(p.getFullYear(), p.getMonth(), 1);
  } else if (a == "petReact") {
    if (petCardView == 'jar') {
      feelingDraft = { feeling: d.feeling, index: Number(d.index) };
      feelingViewing = null;
      render();
      requestAnimationFrame(() => document.querySelector('#feelingReason')?.focus());
      return;
    }
    petReactionsOpen = false;
    sendPetReaction(d.emoji || "❤️");
    return;
  } else if (a == "petFeelingClose") {
    feelingDraft = null;
    feelingViewing = null;
  } else if (a == "petFeelingView") {
    feelingViewing = (PET.feelings || []).find((feeling) => String(feeling.id) == String(d.id)) || null;
    if (!feelingViewing) return;
  } else if (a == "petReactionsToggle") {
    petReactionsOpen = !petReactionsOpen;
  } else if (a == "petViewToggle") {
    petCardView = petCardView == 'pet' ? 'jar' : 'pet';
    petJarOpening = petCardView == 'jar';
    if (petJarOpening) requestAnimationFrame(() => { petJarOpening = false; });
    petReactionsOpen = false;
    feelingDraft = null;
    feelingViewing = null;
  } else if (a == "petMessagesOpen") {
    petMessagesOpen = true;
    petReactionsOpen = false;
    bell = false;
    dcmod = false;
    syncPetMessagesLive();
    if (typeof syncPartnerChatActivity == "function") void syncPartnerChatActivity();
  } else if (a == "petMessagesClose") {
    petMessagesOpen = false;
    petMessageReplyId = null;
    petMessageEditId = null;
    petMessageReactionId = null;
  } else if (a == "petMessageReactionToggle") {
    const message = (PET.messages || []).find((item) => String(item.id) == String(d.id));
    if (!message || !/^[0-9]+$/.test(String(message.id))) return;
    petMessageReactionId = String(petMessageReactionId) == String(message.id) ? null : message.id;
  } else if (a == "petMessageReact") {
    void setPetMessageReaction(d.id, d.emoji);
    return;
  } else if (a == "petMessageReply") {
    const message = (PET.messages || []).find((item) => String(item.id) == String(d.id));
    if (!message || !/^[0-9]+$/.test(String(message.id))) return;
    petMessageReplyId = message.id;
    petMessageEditId = null;
    petMessageReactionId = null;
    requestAnimationFrame(() => document.querySelector('[data-pet-message-input]')?.focus());
  } else if (a == "petMessageEdit") {
    const message = (PET.messages || []).find((item) => String(item.id) == String(d.id));
    if (!message || message.by != S.user.id || !/^[0-9]+$/.test(String(message.id))) return;
    petMessageEditId = message.id;
    petMessageReplyId = null;
    petMessageReactionId = null;
    requestAnimationFrame(() => {
      const input = document.querySelector('[data-pet-message-input]');
      if (!input) return;
      input.focus();
      input.selectionStart = input.selectionEnd = input.value.length;
      if (typeof fitPetMessageInput == "function") fitPetMessageInput(input);
    });
  } else if (a == "petMessageContextCancel") {
    petMessageReplyId = null;
    petMessageEditId = null;
    petMessageReactionId = null;
    requestAnimationFrame(() => document.querySelector('[data-pet-message-input]')?.focus());
  } else if (a == "petClear") {
    clearPetReaction();
    return;
  } else if (a == "petName") {
    const next = prompt(t("petNamePrompt"), PET.name || "Mini chibi");
    if (next && next.trim()) savePetName(next.trim().slice(0, 20));
    return;
  } else if (a == "mo")
    cur = new Date(cur.getFullYear(), cur.getMonth() + Number(d.n), 1);
  else if (a == "ev") {
    open = Number(d.id);
    todoEdit = null;
    view = "det";
  } else if (a == "calendarAdd") {
    const calendarEvent = C.ev.find((item) => String(item.id) == String(d.id));
    if (calendarEvent) openCalendarAdd(calendarEvent);
    return;
  } else if (a == "calendarAddClose") {
    if (el.classList.contains("mod") && event.target !== el) return;
    closeCalendarAdd();
    return;
  } else if (a == "calendarAddGoogle") {
    const calendarEvent = C.ev.find((item) => String(item.id) == String(d.id));
    if (calendarEvent) addEventToGoogleCalendar(calendarEvent);
    return;
  } else if (a == "calendarAddDevice") {
    const calendarEvent = C.ev.find((item) => String(item.id) == String(d.id));
    if (calendarEvent) addEventToDeviceCalendar(calendarEvent);
    return;
  } else if (a == "bell") {
    bell = !bell;
    if (bell) dcmod = false;
  }
  else if (a == "nt") {
    const n = C.nt.find((x) => x.id == d.id);
    bell = false;
    if (n) {
      markRead(n);
      if (n.k) {
        if (n.k == "ok" && C.ev.some((e) => e.id == n.evId)) {
          open = n.evId;
          view = "det";
        }
      } else openLetter(n);
    }
  } else if (a == "acc") answer(true);
  else if (a == "dec") {
    if (LT) {
      LT.confirm = 1;
      drawLT();
    }
  } else if (a == "decSure") confirmDecline();
  else if (a == "decCancel") {
    if (LT) {
      LT.confirm = 0;
      drawLT();
    }
  } else if (a == "lclose") closeLT();
  else if (a == "read") {
    mine().forEach((n) => markRead(n));
  } else if (a == "sedit") smod = true;
  else if (a == "sclose") smod = false;
  else if (a == "dcOpen") {
    dcmod = !dcmod;
    if (dcmod) bell = false;
  }
  else if (a == "dcClose") dcmod = false;
  else if (a == "dcEdit") {
    dcmod = false;
    smod = true;
  }
  else if (a == "pedit") pmod = true;
  else if (a == "pclose") pmod = false;
  else if (a == "noteEdit") {
    noteEdit = d.id;
    requestAnimationFrame(() =>
      document.querySelector("[data-note-editor]")?.focus(),
    );
  } else if (a == "noteCancel") noteEdit = null;
  else if (a == "noteDraftCancel") noteDraft = null;
  else if (a == "noteDel") {
    const n = C.notes.find((x) => String(x.id) == String(d.id));
    if (!n) return;
    C.notes = C.notes.filter((x) => String(x.id) != String(d.id));
    noteEdit = null;
    sb.from("notes")
      .update({ deleted_at: new Date().toISOString(), deleted_by: S.user.id })
      .eq("id", n.id)
      .then(({ error }) => (error ? say(error.message) : refresh()));
  } else if (a == "pick") {
    pin.value = "";
    pin.click();
    return;
  } else if (a == "albumSel") {
    albumSel = d.al || "";
    albumPage = 0;
    albumFlip = null;
    albumOpening = true;
    requestAnimationFrame(() => { albumOpening = false; });
  } else if (a == "albumShelf") {
    albumSel = null;
    albumPage = 0;
    albumOpening = false;
    albumFlip = null;
  } else if (a == "albumPage") {
    const photos = C.photos.filter((p) => albumSel == '__unfiled__' ? !p.album : !albumSel || p.album == albumSel),
      total = photos.length,
      step = Math.sign(Number(d.step || 0));
    if (total > 1 && step) {
      // Vòng tròn: qua ảnh cuối thì quay lại ảnh đầu, và ngược lại
      const nextPage = (((albumPage + step) % total) + total) % total;
      const flip = { direction: step > 0 ? 'next' : 'prev', from: albumPage };
      albumFlip = flip;
      albumPage = nextPage;
      setTimeout(() => {
        if (albumFlip != flip) return;
        albumFlip = null;
        if (view == 'album' && pv == null) render();
      }, 620);
    }
  }
    else if (a == "pv") {
    pvDay = null;
    pv = Number(d.id);
  } else if (a == "pvDay") {
    pvDay = d.k;
    pv = Number(d.id);
  } else if (a == "goAlbum") {
    albumSel = "";
    const photoIndex = C.photos.findIndex((p) => p.date == d.k),
      perSpread = 1;
    albumPage = photoIndex < 0 ? 0 : Math.floor(photoIndex / perSpread);
    albumFlip = null;
    albumOpening = true;
    requestAnimationFrame(() => { albumOpening = false; });
    albumFocus = d.k;
    bell = false;
    view = "album";
  } else if (a == "pvClose") {
    pv = null;
    pvDay = null;
  } else if (a == "pvGo") {
    const l = pvList(),
      i = l.findIndex((p) => p.id == pv),
      nx = l[i + Number(d.d)];
    if (nx) pv = nx.id;
  } else if (a == "uclose") closeUp();
  else if (a == "phDel") {
    const p = C.photos.find((x) => String(x.id) == String(d.id));
    if (!p || !confirm(t("phDelQ"))) return;
    const l = pvList(),
      i = l.findIndex((x) => x.id == p.id),
      nx = l[i + 1] || l[i - 1];
    C.photos = C.photos.filter((x) => x.id != p.id);
    if (pv != null) pv = nx ? nx.id : null;
    if (!nx && pv != null) pvDay = null;
    sb.from("photos")
      .update({ deleted_at: new Date().toISOString(), deleted_by: S.user.id })
      .eq("id", p.id)
      .then(({ error }) => {
        if (error) {
          say(error.message);
          refresh();
          return;
        }
        refresh();
      });
  } else if (a == "trashRestore") {
    const table = { event: "events", note: "notes", photo: "photos" }[d.kind];
    if (!table) return;
    sb.from(table)
      .update({ deleted_at: null, deleted_by: null })
      .eq("id", d.id)
      .then(({ error }) => (error ? say(error.message) : refresh()));
    return;
  } else if (a == "trashPermanent") {
    const table = { event: "events", note: "notes", photo: "photos" }[d.kind];
    if (!table || !confirm(t("trashDeleteQ"))) return;
    const photo =
      d.kind == "photo"
        ? (C.trash?.photos || []).find(
            (item) => String(item.id) == String(d.id),
          )
        : null;
    sb.from(table)
      .delete()
      .eq("id", d.id)
      .then(async ({ error }) => {
        if (error) return say(error.message);
        if (photo) await sb.storage.from("photos").remove([photo.path]);
        refresh();
      });
    return;
  } else if (a == "placeAdd") {
    const list = el.closest("form")?.querySelector(".event-place-list");
    if (!list || list.children.length >= 8) return;
    list.insertAdjacentHTML("beforeend", eventPlaceInput());
    list.lastElementChild?.querySelector("input")?.focus();
    return;
  } else if (a == "placeRemove") {
    const row = el.closest(".event-place-row"),
      list = row?.parentElement;
    if (!row || !list) return;
    if (list.children.length > 1) row.remove();
    else {
      const input = row.querySelector("input");
      if (input) {
        input.value = "";
        input.focus();
      }
    }
    return;
  } else if (a == "freeNew") {
    if (
      C.ev.some(
        (item) => isFreeDay(item) && item.date == sel && item.by == S.user.id,
      )
    )
      return;
    const enteredTitle = prompt(t("freeDayTitlePrompt"), t("freeDay"));
    if (enteredTitle === null) return;
    const customTitle = enteredTitle.trim().slice(0, 80),
      savedTitle = makeFreeDayTitle(customTitle && customTitle != t("freeDay") ? customTitle : ""),
      tempId = "free-" + Date.now(),
      optimistic = {
        id: tempId,
        title: savedTitle,
        date: sel,
        time: "00:00",
        place: "—",
        todo: [],
        by: S.user.id,
        st: "ok",
      };
    C.ev.push(optimistic);
    sb.from("events")
      .insert({
        couple_id: S.user.couple_id,
        title: savedTitle,
        date: sel,
        time: "00:00",
        place: "—",
        status: "ok",
      })
      .select()
      .single()
      .then(({ data, error }) => {
        if (error) {
          C.ev = C.ev.filter((item) => item.id != tempId);
          say(error.message);
          render();
          return;
        }
        const index = C.ev.findIndex((item) => item.id == tempId);
        if (index >= 0) C.ev[index] = toE(data);
        render();
        refresh();
      });
  } else if (a == "freeRemove") {
    const freeDay = C.ev.find(
      (item) => String(item.id) == String(d.id) && isFreeDay(item),
    );
    if (!freeDay || freeDay.by != S.user.id) return;
    C.ev = C.ev.filter((item) => item.id != freeDay.id);
    sb.from("events")
      .update({ deleted_at: new Date().toISOString(), deleted_by: S.user.id })
      .eq("id", freeDay.id)
      .then(({ error }) => (error ? say(error.message) : refresh()));
  } else if (a == "tttMove") {
    const index = Number(d.i);
    if (!Number.isInteger(index) || index < 0 || index > 8 || !TTT.ready || !TTT.playerO) return;
    playTttMove(index);
    return;
  } else if (a == "tttNewRound") {
    startTttRound(false);
    return;
  } else if (a == "tttResetScore") {
    startTttRound(true);
    return;
  } else if (a == "tttOpen") {
    TTT.open = true;
    render();
    return;
  } else if (a == "tttClose") {
    TTT.open = false;
    render();
    return;
  } else if (a == "throwReset") {
    THROW_GAME.open = true;
    THROW_GAME.hp = [100, 100];
    THROW_GAME.turn = 0;
    THROW_GAME.angle = -35;
    THROW_GAME.power = 0;
    THROW_GAME.charging = false;
    THROW_GAME.busy = false;
    THROW_GAME.message = '';
    if (typeof THROW != 'undefined') {
      THROW.drag = null;
      THROW.flight = null;
    }
    render();
    return;
  } else if (a == "throwOpen") {
    THROW_GAME.open = true;
    render();
    return;
  } else if (a == "throwClose") {
    THROW_GAME.open = false;
    render();
    return;
  } else if (a == "new") modal = "new";
  else if (a == "edit") modal = "edit";
  else if (a == "todoEdit") todoEdit = Number(d.i);
  else if (a == "todoCancel") todoEdit = null;
  else if (a == "todoDel") {
    const e = C.ev.find((x) => x.id == open);
    if (!e || !e.todo[d.i]) return;
    e.todo.splice(Number(d.i), 1);
    todoEdit = null;
    sb.from("events")
      .update({ todo: e.todo })
      .eq("id", e.id)
      .then(() => {});
  } else if (a == "close") modal = false;
  else if (a == "out") {
    void publishPetChatActivity(false);
    void publishPetPresenceActivity(false);
    if (sb) {
      pushDetach().then(() => sb.auth.signOut());
      if (CH) sb.removeChannel(CH);
    }
    S.user = null;
    C = {
      ev: [],
      nt: [],
      notes: [],
      photos: [],
      trash: { ev: [], notes: [], photos: [] },
    };
    P = {};
    PU = {};
    pv = null;
    pvDay = null;
    albumSel = null;
    petMessageReplyId = null;
    petMessageEditId = null;
    petMessageReactionId = null;
    closeUp();
    view = "auth";
    msg = "";
  } else if (a == "del") {
    const id = open;
    C.ev = C.ev.filter((e) => e.id != id);
    sb.from("events")
      .update({ deleted_at: new Date().toISOString(), deleted_by: S.user.id })
      .eq("id", id)
      .then(({ error }) => (error ? say(error.message) : refresh()));
    open = null;
    view = "det";
  } else if (a == "pushTog") {
    if (el.checked) pushEnable();
    else pushDisable();
    return;
  } else if (a == "tg") {
    S.n[d.i] = el.checked ? 1 : 0;
    save();
    pushResync();
    return;
  } else if (a == "chk") {
    const e = C.ev.find((x) => x.id == (d.id != null ? d.id : open)),
      o = e && e.todo && e.todo[d.i];
    if (!o) return;
    o.d = el.checked ? 1 : 0;
    sb.from("events")
      .update({ todo: e.todo })
      .eq("id", e.id)
      .then(() => {});
  } else return;
  render();
}
