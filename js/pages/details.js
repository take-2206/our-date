// LoveSync details module. Classic scripts share state declared in js/core.js.
const todoRows = (e) =>
        e.todo
          .map((o, i) =>
            todoEdit == i
              ? `<form class="todo-edit" data-f="todoedit" data-i="${i}"><input class="in" name="t" required value="${esc(tx(o.t))}" aria-label="${t('todo')}"><button class="mini">${t('saveTodo')}</button><button type="button" class="mini" data-a="todoCancel">${t('cancel')}</button></form>`
              : `<div class="todo-row"><label class="chk"><input type="checkbox" data-a="chk" data-i="${i}" ${o.d ? 'checked' : ''}><span class="${o.d ? 'x' : ''}">${esc(tx(o.t))}</span></label><div class="todo-actions"><button class="mini" data-a="todoEdit" data-i="${i}">${t('editTodo')}</button><button class="mini" data-a="todoDel" data-i="${i}">${t('deleteTodo')}</button></div></div>`,
          )
          .join('');
      // Màn chi tiết buổi hẹn: giờ, địa điểm, checklist, xoá
      function vDet() {
        const e = C.ev.find((x) => x.id == open);
        const h = head(t('det'), 'date_details');
        if (!e) return `<div class="main">${h}<div class="card empty">${t('pick')}</div></div>`;
        return `<div class="main">${h}<button class="btn b2" data-a="go" data-v="cal" style="width:auto;padding:0 16px;min-height:40px;margin-bottom:12px">${I.back} ${t('back')}</button><div class="card hero"><div><span class="chip">${fmt(e.date, { weekday: 'short', day: 'numeric', month: 'numeric' })}</span><h2>${esc(tx(e.title))}</h2><p class="mono sub" style="font-size:12px">${rel(e.date)} ${ic('hr')}</p></div>${av(me(), 92)}</div><div class="card" style="margin-top:12px"><div class="rw"><span class="sub">${t('tm')}</span><span>${e.time}</span></div><div class="rw"><span class="sub">${t('pl')}</span><span>${esc(tx(e.place))}</span></div></div><div class="card sec"><p class="mono sub" style="font-size:12px;margin-bottom:4px">// ${t('prep')}</p>${todoRows(e)}<form class="todo-add" data-f="todo"><input class="in" name="t" placeholder="${t('todo')}" aria-label="${t('todo')}"><button class="btn b1">${t('addTodo')}</button></form></div><div class="card sec" style="display:flex;align-items:center;gap:12px"><div class="pair">${av(me(), 36)}${av(pr(), 36)}</div><p style="flex:1">${t('both')}</p><span class="chip">OK</span></div><div class="row2"><button class="btn b2" data-a="del">${t('del')}</button><button class="btn b1" data-a="edit">${t('edit')}</button></div></div>`;
      }
