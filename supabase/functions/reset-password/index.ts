// Password recovery for LoveSync's username-based accounts.
// This function must remain server-side because it uses the Supabase service role.
// @ts-nocheck
import { createClient } from 'npm:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, 'Content-Type': 'application/json' },
  });
const db = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  { auth: { autoRefreshToken: false, persistSession: false } },
);

const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

function limited(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt <= now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

function usernameEmail(value: unknown) {
  const username = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '.')
    .replace(/[^a-z0-9._-]/g, '');
  return username.length >= 3 && username.length <= 24 ? `${username}@lovesync.app` : '';
}

async function userByEmail(email: string) {
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    const match = data.users.find((user) => user.email?.toLowerCase() === email);
    if (match || data.users.length < 1000) return match || null;
  }
  return null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405);
  if (limited(req)) return json({ error: 'too_many_attempts' }, 429);

  try {
    const body = await req.json();
    const email = usernameEmail(body.username);
    const code = String(body.code || '').trim().toUpperCase();
    const password = String(body.password || '');
    if (!email || !/^[A-Z0-9-]{4,12}$/.test(code) || password.length < 6 || password.length > 72) {
      return json({ error: 'invalid_recovery' }, 400);
    }

    const user = await userByEmail(email);
    if (!user) return json({ error: 'invalid_recovery' }, 400);

    const { data: profile, error: profileError } = await db
      .from('profiles')
      .select('couple_id')
      .eq('id', user.id)
      .maybeSingle();
    if (profileError || !profile?.couple_id) return json({ error: 'invalid_recovery' }, 400);

    const { data: couple, error: coupleError } = await db
      .from('couples')
      .select('id')
      .eq('id', profile.couple_id)
      .eq('code', code)
      .maybeSingle();
    if (coupleError || !couple) return json({ error: 'invalid_recovery' }, 400);

    const { error: updateError } = await db.auth.admin.updateUserById(user.id, { password });
    if (updateError) throw updateError;
    return json({ ok: true });
  } catch (error) {
    console.error('reset-password failed', error instanceof Error ? error.message : error);
    return json({ error: 'reset_failed' }, 500);
  }
});
