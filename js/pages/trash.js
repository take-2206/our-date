// Recycle-bin page for recoverable dates, notes, and photos.
const trashItems = () => [
  ...(C.trash?.ev || []).map((item) => ({ kind: 'event', item, label: t('det'), title: tx(item.title) })),
  ...(C.trash?.notes || []).map((item) => ({ kind: 'note', item, label: t('notes'), title: item.body })),
  ...(C.trash?.photos || []).map((item) => ({
    kind: 'photo',
    item,
    label: t('album'),
    title: item.cap || item.album || item.place || t('album'),
  })),
].sort((a, b) => b.item.deletedAt - a.item.deletedAt);

const trashDaysLeft = (deletedAt) => Math.max(1, Math.ceil((30 * 864e5 - (Date.now() - deletedAt)) / 864e5));

function vTrash() {
  const h = head(t('trash'), t('trashSub')),
    items = trashItems();
  return `<div class="main">${h}<button class="btn b2" data-a="go" data-v="set" style="width:auto;padding:0 16px;min-height:40px;margin-bottom:12px">${I.back} ${t('back')}</button>${trashError ? `<div class="card note-error">${t('trashSetup')}<br><small>${esc(trashError)}</small></div>` : items.length ? `<div class="trash-list">${items
    .map(({ kind, item, label, title }) => {
      const url = kind == 'photo' ? pu(item) : '';
      return `<article class="card trash-item">${url ? `<img class="trash-thumb" src="${esc(url)}" alt="">` : `<span class="trash-icon">${kind == 'event' ? I.cal : kind == 'note' ? I.note : I.photo}</span>`}<div class="trash-copy"><span class="chip">${esc(label)}</span><h2>${esc(title)}</h2><p class="sub mono">${t('trashDays').replace('{n}', trashDaysLeft(item.deletedAt))}</p></div><div class="trash-actions"><button class="mini" data-a="trashRestore" data-kind="${kind}" data-id="${item.id}">${t('trashRestore')}</button><button class="mini danger" data-a="trashPermanent" data-kind="${kind}" data-id="${item.id}">${t('trashDelete')}</button></div></article>`;
    })
    .join('')}</div>` : `<div class="card empty">${t('trashEmpty')}</div>`}</div>`;
}
