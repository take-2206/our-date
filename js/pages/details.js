// LoveSync details module. Classic scripts share state declared in js/core.js.
const todoRows = (e) =>
        e.todo
          .map((o, i) =>
            todoEdit == i
              ? `<form class="todo-edit" data-f="todoedit" data-i="${i}"><input class="in" name="t" required value="${esc(tx(o.t))}" aria-label="${t('todo')}"><button class="mini">${t('saveTodo')}</button><button type="button" class="mini" data-a="todoCancel">${t('cancel')}</button></form>`
              : `<div class="todo-row"><label class="chk"><input type="checkbox" data-a="chk" data-i="${i}" ${o.d ? 'checked' : ''}><span class="${o.d ? 'x' : ''}">${esc(tx(o.t))}</span></label><div class="todo-actions"><button class="mini" data-a="todoEdit" data-i="${i}">${t('editTodo')}</button><button class="mini" data-a="todoDel" data-i="${i}">${t('deleteTodo')}</button></div></div>`,
          )
          .join('');

      const calendarPad = (value) => String(value).padStart(2, '0');
      const calendarUtc = (date) =>
        date.getUTCFullYear() +
        calendarPad(date.getUTCMonth() + 1) +
        calendarPad(date.getUTCDate()) +
        'T' +
        calendarPad(date.getUTCHours()) +
        calendarPad(date.getUTCMinutes()) +
        calendarPad(date.getUTCSeconds()) +
        'Z';
      const calendarEscape = (value) =>
        String(value || '')
          .replace(/\\/g, '\\\\')
          .replace(/\r?\n/g, '\\n')
          .replace(/,/g, '\\,')
          .replace(/;/g, '\\;');
      function calendarEventData(e) {
        const dateParts = String(e.date || '').split('-').map(Number),
          timeParts = String(e.time || '00:00').split(':').map(Number),
          start = new Date(dateParts[0], dateParts[1] - 1, dateParts[2], timeParts[0] || 0, timeParts[1] || 0),
          end = new Date(start.getTime() + 60 * 60 * 1000),
          location = eventPlaceText(e.place) || '',
          checklist = (e.todo || []).map((item) => `${item.d ? '[x]' : '[ ]'} ${tx(item.t)}`).join('\n'),
          details = checklist ? `${t('prep')}:\n${checklist}` : '';
        return { start, end, location, details, title: tx(e.title) };
      }
      function calendarIcs(e) {
        const item = calendarEventData(e),
          uid = `lovesync-${String(e.id).replace(/[^a-z0-9_-]/gi, '')}-${e.date}@lovesync`;
        return [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//LoveSync//Shared Date//EN',
          'CALSCALE:GREGORIAN',
          'METHOD:PUBLISH',
          'BEGIN:VEVENT',
          `UID:${uid}`,
          `DTSTAMP:${calendarUtc(new Date())}`,
          `DTSTART:${calendarUtc(item.start)}`,
          `DTEND:${calendarUtc(item.end)}`,
          `SUMMARY:${calendarEscape(item.title)}`,
          item.location ? `LOCATION:${calendarEscape(item.location)}` : '',
          item.details ? `DESCRIPTION:${calendarEscape(item.details)}` : '',
          'END:VEVENT',
          'END:VCALENDAR',
          '',
        ].filter(Boolean).join('\r\n');
      }
      function closeCalendarAdd() {
        document.getElementById('calendar-add-sheet')?.remove();
      }
      function openCalendarAdd(e) {
        closeCalendarAdd();
        const sheet = document.createElement('div');
        sheet.id = 'calendar-add-sheet';
        sheet.className = 'mod calendar-add-sheet';
        sheet.dataset.a = 'calendarAddClose';
        sheet.innerHTML = `<section class="card calendar-add-card" role="dialog" aria-modal="true" aria-labelledby="calendar-add-title"><button type="button" class="ib calendar-add-close" data-a="calendarAddClose" aria-label="${esc(t('close'))}">${I.x}</button><span class="calendar-add-icon" aria-hidden="true">${I.cal}</span><h2 id="calendar-add-title" class="px">${esc(t('calendarAddTitle'))}</h2><p class="sub calendar-add-event">${esc(tx(e.title))} · ${esc(fmt(e.date, { dateStyle: 'long' }))} · ${esc(e.time)}</p><div class="calendar-add-actions"><button type="button" class="btn b1" data-a="calendarAddGoogle" data-id="${e.id}">${esc(t('calendarGoogle'))}</button><button type="button" class="btn b2" data-a="calendarAddDevice" data-id="${e.id}">${esc(t('calendarDevice'))}</button></div><p class="sub calendar-add-hint">${esc(t('calendarHint'))}</p></section>`;
        document.body.appendChild(sheet);
        sheet.querySelector('.calendar-add-actions .btn')?.focus();
      }
      function addEventToGoogleCalendar(e) {
        const item = calendarEventData(e),
          query = new URLSearchParams({
            action: 'TEMPLATE',
            text: item.title,
            dates: `${calendarUtc(item.start)}/${calendarUtc(item.end)}`,
            details: item.details,
            location: item.location,
          });
        window.open(`https://calendar.google.com/calendar/render?${query}`, '_blank', 'noopener,noreferrer');
        closeCalendarAdd();
      }
      function addEventToDeviceCalendar(e) {
        const blob = new Blob([calendarIcs(e)], { type: 'text/calendar;charset=utf-8' }),
          url = URL.createObjectURL(blob),
          anchor = document.createElement('a'),
          safeTitle = tx(e.title).replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 40) || 'lovesync-date';
        anchor.href = url;
        anchor.download = `${safeTitle}.ics`;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        setTimeout(() => URL.revokeObjectURL(url), 30000);
        closeCalendarAdd();
        say(t('calendarDownloaded'));
      }
      // Màn chi tiết buổi hẹn: giờ, địa điểm, checklist, xoá
      function vDet() {
        const e = C.ev.find((x) => x.id == open),
          h = head(t('det'), e ? 'date_details' : t('allDates'));
        if (!e) {
          const dates = EV()
            .filter((item) => !isFreeDay(item))
            .slice()
            .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
          return `<div class="main">${h}${calTabs()}<div class="date-list">${dates
            .map(
              (item) =>
                `<button class="card h date-list-item${parse(item.date) < today0() ? ' is-past' : ''}" data-a="ev" data-id="${item.id}"><div class="d">${fmt(item.date, { day: 'numeric' })}<small class="mono">${fmt(item.date, { month: 'short', year: 'numeric' })}</small></div><div class="i"><h2>${esc(tx(item.title))}</h2><p class="sub">${item.time} · ${esc(eventPlaceText(item.place) || '—')}</p></div><span class="date-rel mono">${rel(item.date)}</span></button>`,
            )
            .join('') || `<div class="card empty">${t('none')}</div>`}</div></div>`;
        }
        const places = eventPlaces(e.place),
          place = places.join(' · '),
          map = places
            .map((item) => `<details class="card route-card">
              <summary class="route-head route-toggle">
                <span class="route-toggle-title"><span class="mono sub">// ${t('map')}</span><span class="route-place">${I.pin} ${esc(item)}</span></span>
                <span class="route-toggle-icon" aria-hidden="true"></span>
              </summary>
              <div class="route-content">
                <iframe class="route-map" title="${esc(t('map') + ': ' + item)}" src="https://www.google.com/maps?q=${encodeURIComponent(item)}&amp;output=embed" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe>
                <a class="btn b1 route-btn" href="https://www.google.com/maps/dir/?api=1&amp;destination=${encodeURIComponent(item)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(t('route') + ': ' + item)}">${t('route')}</a>
              </div>
            </details>`)
            .join('');
        return `<div class="main">${h}
          <button class="btn b2" data-a="go" data-v="det" style="width:auto;padding:0 16px;min-height:40px;margin-bottom:12px">${I.back} ${t('back')}</button>
          <div class="card hero"><div><span class="chip">${fmt(e.date, { weekday: 'short', day: 'numeric', month: 'numeric' })}</span><h2>${esc(tx(e.title))}</h2><p class="mono sub" style="font-size:12px">${rel(e.date)} ${ic('hr')}</p></div>${av(me(), 92)}</div>
          <div class="card" style="margin-top:12px"><div class="rw"><span class="sub">${t('tm')}</span><span>${e.time}</span></div><div class="rw"><span class="sub">${t('pl')}</span><span>${esc(place || '—')}</span></div></div>
          <div class="card sec"><p class="mono sub" style="font-size:12px;margin-bottom:4px">// ${t('prep')}</p>${todoRows(e)}<form class="todo-add" data-f="todo"><input class="in" name="t" placeholder="${t('todo')}" aria-label="${t('todo')}"><button class="btn b1">${t('addTodo')}</button></form></div>
          <button class="btn b1 calendar-add-trigger" data-a="calendarAdd" data-id="${e.id}">${I.cal}<span>${esc(t('calendarAdd'))}</span></button>
          <div class="row2"><button class="btn b2" data-a="del">${t('del')}</button><button class="btn b1" data-a="edit">${t('edit')}</button></div>
          ${map}
        </div>`;
      }
