-- Run once in Supabase Dashboard > SQL Editor.
-- Deleted dates, notes, and photos remain recoverable for 30 days.

alter table public.events add column if not exists deleted_at timestamptz;
alter table public.events add column if not exists deleted_by uuid references auth.users(id) on delete set null;

alter table public.notes add column if not exists deleted_at timestamptz;
alter table public.notes add column if not exists deleted_by uuid references auth.users(id) on delete set null;

alter table public.photos add column if not exists deleted_at timestamptz;
alter table public.photos add column if not exists deleted_by uuid references auth.users(id) on delete set null;

create index if not exists events_couple_deleted_idx on public.events (couple_id, deleted_at);
create index if not exists notes_couple_deleted_idx on public.notes (couple_id, deleted_at);
create index if not exists photos_couple_deleted_idx on public.photos (couple_id, deleted_at);

-- Uses the caller's existing RLS permissions. Returned photo paths are removed
-- from Storage by the web app after their database rows expire.
create or replace function public.purge_expired_recycle_bin()
returns table (photo_path text)
language plpgsql
security invoker
set search_path = public
as $$
begin
  return query
    delete from public.photos p
    where p.deleted_at < now() - interval '30 days'
    returning p.path;

  delete from public.notes
  where deleted_at < now() - interval '30 days';

  delete from public.events
  where deleted_at < now() - interval '30 days';
end;
$$;

grant execute on function public.purge_expired_recycle_bin() to authenticated;
