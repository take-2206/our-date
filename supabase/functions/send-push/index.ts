// Edge Function: gửi thông báo đẩy cho LoveSync.
//  - { type: 'notif', record }  : do trigger trên bảng notifs gọi (lịch mới / đồng ý / từ chối)
//  - { type: 'reminders' }      : do pg_cron gọi mỗi 5 phút (nhắc trước 1 ngày / 1 giờ)
// @ts-nocheck
import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const SECRET = Deno.env.get('PUSH_SECRET') ?? '';
webpush.setVapidDetails(
  Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@example.com',
  Deno.env.get('VAPID_PUBLIC_KEY')!,
  Deno.env.get('VAPID_PRIVATE_KEY')!,
);
const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
});

type Sub = {
  id: string; user_id: string; couple_id: string; endpoint: string; p256dh: string; auth: string;
  lang: string; tz: string; n1: boolean; n2: boolean; n3: boolean;
};
type Ev = { id: number; couple_id: string; title: string; date: string; time: string | null; place: string | null; status: string | null };

const json = (o: unknown, status = 200) =>
  new Response(JSON.stringify(o), { status, headers: { 'Content-Type': 'application/json' } });

async function send(sub: Sub, payload: Record<string, unknown>) {
  try {
    await webpush.sendNotification(
      { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
      JSON.stringify({ ...payload, lang: sub.lang }),
      { TTL: 3600, urgency: 'high' },
    );
    return true;
  } catch (e) {
    const code = (e as { statusCode?: number }).statusCode;
    if (code === 404 || code === 410) await db.from('push_subscriptions').delete().eq('id', sub.id); // máy đã gỡ
    else console.error('push failed', code, (e as Error).message);
    return false;
  }
}

const hm = (t: string | null) => (t ? t.slice(0, 5) : '');
const dm = (d: string) => `${d.slice(8, 10)}/${d.slice(5, 7)}`;
const T = {
  vi: {
    new: (n: string) => `${n} đã gửi một lịch hẹn mới`,
    ok: (n: string) => `${n} đã đồng ý lịch hẹn`,
    no: (n: string) => `${n} đã từ chối lịch hẹn`,
    day: (title: string) => `Ngày mai: ${title}`,
    hour: (title: string) => `Còn 1 giờ nữa: ${title}`,
  },
  en: {
    new: (n: string) => `${n} sent a new date`,
    ok: (n: string) => `${n} accepted the date`,
    no: (n: string) => `${n} declined the date`,
    day: (title: string) => `Tomorrow: ${title}`,
    hour: (title: string) => `In 1 hour: ${title}`,
  },
} as const;
const tt = (lang: string) => (lang === 'en' ? T.en : T.vi);
const PT = {
  vi: {
    noteNew: (name: string) => `${name} vừa thêm một ghi chú mới`,
    noteUpdate: (name: string) => `${name} vừa cập nhật một ghi chú`,
    appUpdate: 'Có phiên bản mới của LoveSync',
    appUpdateBody: 'Mở ứng dụng để cập nhật ngay.',
  },
  en: {
    noteNew: (name: string) => `${name} added a new sticky note`,
    noteUpdate: (name: string) => `${name} updated a sticky note`,
    appUpdate: 'A new version of LoveSync is available',
    appUpdateBody: 'Open the app to update now.',
  },
} as const;
const pt = (lang: string) => (lang === 'en' ? PT.en : PT.vi);

// ---- 1) Thông báo từ người ấy ----
async function onNotif(r: { couple_id: string; event_id: number | null; kind: string; from_id: string }) {
  const [{ data: subs }, { data: from }, { data: ev }] = await Promise.all([
    db.from('push_subscriptions').select('*').eq('couple_id', r.couple_id).neq('user_id', r.from_id).eq('n3', true),
    db.from('profiles').select('name').eq('id', r.from_id).maybeSingle(),
    r.event_id ? db.from('events').select('id,title,date,time').eq('id', r.event_id).maybeSingle() : Promise.resolve({ data: null }),
  ]);
  const kind = (['ok', 'no'].includes(r.kind) ? r.kind : 'new') as 'new' | 'ok' | 'no';
  const name = from?.name ?? '';
  let sent = 0;
  for (const s of (subs ?? []) as Sub[]) {
    const ok = await send(s, {
      title: tt(s.lang)[kind](name),
      body: ev ? `${ev.title} · ${hm(ev.time)} ${dm(ev.date)}`.replace('  ', ' ') : '',
      url: ev ? `./?ev=${ev.id}` : './',
      id: ev?.id ?? null,
      tag: `notif-${r.event_id ?? 'x'}-${kind}`,
    });
    if (ok) sent++;
  }
  return { sent };
}

async function caller(req: Request) {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const { data, error } = await db.auth.getUser(token);
  return error ? null : data.user;
}

async function onNote(req: Request, body: { note_id?: number; action?: string }) {
  const user = await caller(req),
    noteId = Number(body.note_id),
    action = body.action === 'new' ? 'new' : body.action === 'update' ? 'update' : '';
  if (!user || !noteId || !action) throw new Error('unauthorized');
  const [{ data: note }, { data: profile }] = await Promise.all([
    db.from('notes').select('id,couple_id,body,created_by,deleted_at').eq('id', noteId).maybeSingle(),
    db.from('profiles').select('name,couple_id').eq('id', user.id).maybeSingle(),
  ]);
  if (!note || !profile || note.deleted_at || note.couple_id !== profile.couple_id)
    throw new Error('forbidden');
  if (action === 'new' && note.created_by !== user.id) throw new Error('forbidden');
  const { data: subs } = await db
    .from('push_subscriptions')
    .select('*')
    .eq('couple_id', note.couple_id)
    .neq('user_id', user.id)
    .eq('n3', true);
  const preview = String(note.body || '').replace(/\s+/g, ' ').trim().slice(0, 140);
  let sent = 0;
  for (const s of (subs ?? []) as Sub[]) {
    const ok = await send(s, {
      title: action === 'new' ? pt(s.lang).noteNew(profile.name || '') : pt(s.lang).noteUpdate(profile.name || ''),
      body: preview,
      url: './?view=notes',
      type: 'open-notes',
      tag: action === 'new' ? `note-${note.id}` : `note-text-${note.id}`,
    });
    if (ok) sent++;
  }
  return { sent };
}

async function appUpdate(version: string) {
  const { data: subs } = await db.from('push_subscriptions').select('*');
  let sent = 0;
  for (const s of (subs ?? []) as Sub[]) {
    const ok = await send(s, {
      title: pt(s.lang).appUpdate,
      body: pt(s.lang).appUpdateBody,
      url: './',
      type: 'app-update',
      tag: `app-update-${String(version || 'latest').slice(0, 40)}`,
    });
    if (ok) sent++;
  }
  return { sent };
}

// ---- 2) Nhắc trước buổi hẹn ----
function tzOffsetMs(utc: number, tz: string) {
  const u = Math.floor(utc / 1000) * 1000;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(new Date(u)).map((p) => [p.type, p.value]),
  );
  return Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second) - u;
}
// "ngày + giờ theo múi giờ tz" -> mili-giây UTC
function zoned(date: string, time: string, tz: string) {
  const [y, m, d] = date.split('-').map(Number);
  const [h, mi] = time.split(':').map(Number);
  const guess = Date.UTC(y, m - 1, d, h, mi);
  try {
    const t1 = guess - tzOffsetMs(guess, tz);
    return guess - tzOffsetMs(t1, tz);
  } catch {
    return guess - 7 * 3600e3; // múi giờ lạ: coi như Việt Nam
  }
}

async function reminders() {
  const { data: subs } = await db.from('push_subscriptions').select('*').or('n1.eq.true,n2.eq.true');
  if (!subs?.length) return { sent: 0 };
  const now = Date.now();
  const lo = new Date(now - 864e5).toISOString().slice(0, 10);
  const hi = new Date(now + 3 * 864e5).toISOString().slice(0, 10);
  const couples = [...new Set((subs as Sub[]).map((s) => s.couple_id))];
  const { data: evs } = await db.from('events').select('id,couple_id,title,date,time,place,status')
    .in('couple_id', couples).gte('date', lo).lte('date', hi);
  const okEvs = ((evs ?? []) as Ev[]).filter((e) => !e.status || e.status === 'ok'); // bỏ lịch đang chờ / bị từ chối
  let sent = 0;
  for (const s of subs as Sub[]) {
    for (const e of okEvs.filter((x) => x.couple_id === s.couple_id)) {
      const t = zoned(e.date, e.time || '09:00', s.tz);
      const diff = t - now;
      const kinds: ('day' | 'hour')[] = [];
      if (s.n1 && diff <= 24 * 3600e3 && diff > 24 * 3600e3 - 20 * 60e3) kinds.push('day');
      if (s.n2 && e.time && diff <= 3600e3 && diff > 40 * 60e3) kinds.push('hour');
      for (const kind of kinds) {
        const { error } = await db.from('push_sent').insert({
          sub_id: s.id, event_id: e.id, kind, stamp: `${e.date} ${e.time ?? ''}`,
        });
        if (error) continue; // đã gửi rồi (trùng khóa) hoặc lỗi ghi nhật ký -> bỏ qua
        const ok = await send(s, {
          title: tt(s.lang)[kind](e.title),
          body: [hm(e.time), e.place].filter(Boolean).join(' · '),
          url: `./?ev=${e.id}`,
          id: e.id,
          tag: `rem-${e.id}-${kind}`,
        });
        if (ok) sent++;
      }
    }
  }
  await db.from('push_sent').delete().lt('created_at', new Date(now - 30 * 864e5).toISOString());
  return { sent };
}

Deno.serve(async (req) => {
  const body = await req.json().catch(() => ({}));
  try {
    if (body.type === 'note') return json(await onNote(req, body));
    if (!SECRET || req.headers.get('x-push-secret') !== SECRET) return json({ error: 'forbidden' }, 403);
    if (body.type === 'reminders') return json(await reminders());
    if (body.type === 'notif' && body.record) return json(await onNotif(body.record));
    if (body.type === 'app_update') return json(await appUpdate(body.version || 'latest'));
    return json({ error: 'bad request' }, 400);
  } catch (e) {
    console.error(e);
    return json({ error: String((e as Error).message) }, 500);
  }
});
