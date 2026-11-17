// LoveSync auth module. Classic scripts share state declared in js/core.js.
function vAuth() {
  const reset = mode == 'reset';
  const authFields = reset
    ? `<div class="fl"><label class="lb" for="e">${t('un')}</label><input class="in" id="e" name="username" type="text" required maxlength="24" autocomplete="username" placeholder="${t('unph')}"></div>
       <div class="fl"><label class="lb" for="reset-code">${t('resetCode')}</label><input class="in mono" id="reset-code" name="code" type="text" required maxlength="12" autocomplete="off" autocapitalize="characters" placeholder="LOVE-XXXX"></div>
       <div class="fl"><label class="lb" for="p">${t('newPw')}</label><input class="in" id="p" name="password" type="password" required minlength="6" autocomplete="new-password" placeholder="••••••••"></div>
       <div class="fl"><label class="lb" for="p-confirm">${t('confirmPw')}</label><input class="in" id="p-confirm" name="confirm" type="password" required minlength="6" autocomplete="new-password" placeholder="••••••••"></div>`
    : `${mode == 'up' ? reg() : ''}${mode == 'in' ? `<div class="fl"><label class="lb" for="e">${t('un')}</label><input class="in" id="e" type="text" required maxlength="24" autocomplete="username" placeholder="${t('unph')}"></div>` : ''}
       <div class="fl"><label class="lb" for="p">${t('pw')}</label><input class="in" id="p" type="password" required minlength="6" autocomplete="${mode == 'in' ? 'current-password' : 'new-password'}" placeholder="••••••••"></div>`;

  return `<div class="auth">${lang()}<span class="deco" style="top:40px;left:28px">${ic('hr')}</span><span class="deco" style="top:110px;right:40px">${ic('st', 14, 14)}</span><span class="deco" style="bottom:60px;left:36px">${ic('st', 14, 14)}</span><div class="box"><h1 class="px" style="font-size:32px;margin:0 0 4px;color:var(--pk);text-shadow:0 0 16px var(--pk)">LoveSync</h1><p class="mono sub" style="font-size:12px;margin-bottom:22px">&gt; sync_hearts(you, me);</p>${
    reset
      ? `<h2 class="px" style="font-size:18px;color:var(--pk);margin-bottom:8px">${t('resetTitle')}</h2><p class="hint" style="margin-bottom:18px">${t('resetIntro')}</p>`
      : `<div class="seg" style="width:100%">${['in', 'up'].map((m) => `<button class="btn${mode == m ? ' on' : ''}" data-a="mode" data-m="${m}">${t(m)}</button>`).join('')}</div>`
  }<form data-f="${reset ? 'reset' : 'auth'}" style="width:100%">${authFields}${
    !reset && mode == 'in'
      ? `<p style="text-align:right;margin-bottom:18px"><button type="button" class="auth-link" data-a="forgot">${t('forgot')}</button></p>`
      : ''
  }${msg ? `<p role="alert" class="hint" style="color:var(--pk);margin:-6px 0 12px">${esc(msg)}</p>` : ''}${CFG ? '' : `<p class="hint" style="margin:-6px 0 12px">${t('cfg')}</p>`}<button class="btn b1" style="margin-bottom:12px">${reset ? t('resetAction') : `${t(mode)} ${ic('hr')}`}</button>${
    reset
      ? `<button type="button" class="btn b2" data-a="resetBack">${t('resetBack')}</button>`
      : mode == 'in'
        ? `<button type="button" class="btn b2" data-a="mode" data-m="up">${t('invite')}</button>`
        : ''
  }</form></div></div>`;
}
      // Màn lịch: lưới 6 tuần x 7 ngày + danh sách buổi hẹn của ngày được chọn
      // Đếm ngày bên nhau: ngày bắt đầu = ngày thứ 1; mốc kế tiếp = 100, 200, 300, 365, 500... rồi mỗi năm
