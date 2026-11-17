-- Shared Tic Tac Toe game for the two members of a LoveSync couple.
-- Run once in Supabase Dashboard > SQL Editor.

create table if not exists public.tic_tac_toe_games (
  couple_id uuid primary key references public.couples(id) on delete cascade,
  player_x uuid references auth.users(id) on delete set null,
  player_o uuid references auth.users(id) on delete set null,
  board text[] not null default array['', '', '', '', '', '', '', '', '']::text[],
  turn text not null default 'X' check (turn in ('X', 'O')),
  winner text check (winner in ('X', 'O')),
  is_draw boolean not null default false,
  win_line smallint[] not null default '{}'::smallint[],
  scores jsonb not null default '{"X":0,"O":0,"draws":0}'::jsonb,
  updated_by uuid references auth.users(id) on delete set null,
  updated_at timestamptz not null default now(),
  constraint tic_tac_toe_board_size check (cardinality(board) = 9)
);

alter table public.tic_tac_toe_games enable row level security;
grant select on public.tic_tac_toe_games to authenticated;
revoke insert, update, delete on public.tic_tac_toe_games from anon, authenticated;

drop policy if exists "Couple members can read Tic Tac Toe" on public.tic_tac_toe_games;
create policy "Couple members can read Tic Tac Toe"
  on public.tic_tac_toe_games for select to authenticated
  using (exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.couple_id = tic_tac_toe_games.couple_id
  ));

create or replace function public.ttt_get_or_create_game()
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_couple uuid;
  v_players uuid[];
  v_game public.tic_tac_toe_games;
begin
  if auth.uid() is null then raise exception 'Sign in to play.'; end if;

  select couple_id into v_couple from public.profiles where id = auth.uid();
  if v_couple is null then raise exception 'No couple is linked to this account.'; end if;

  select array_agg(id order by id) into v_players
  from public.profiles where couple_id = v_couple;
  if coalesce(cardinality(v_players), 0) > 2 then
    raise exception 'Tic Tac Toe supports two couple members.';
  end if;

  insert into public.tic_tac_toe_games as current_game (couple_id, player_x, player_o)
  values (v_couple, v_players[1], v_players[2])
  on conflict (couple_id) do update
    set player_o = coalesce(current_game.player_o, excluded.player_o)
    where current_game.player_o is null and excluded.player_o is not null
  returning * into v_game;

  if v_game.couple_id is null then
    select * into v_game from public.tic_tac_toe_games where couple_id = v_couple;
  end if;
  return to_jsonb(v_game);
end;
$$;

create or replace function public.ttt_make_move(p_cell integer)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_game public.tic_tac_toe_games;
  v_board text[];
  v_mark text;
  v_line smallint[];
  v_scores jsonb;
begin
  if auth.uid() is null then raise exception 'Sign in to play.'; end if;
  if p_cell is null or p_cell < 0 or p_cell > 8 then raise exception 'Invalid cell.'; end if;

  select * into v_game from public.tic_tac_toe_games
  where couple_id = (select couple_id from public.profiles where id = auth.uid())
  for update;
  if v_game.couple_id is null then raise exception 'Game is not ready.'; end if;
  if auth.uid() not in (v_game.player_x, v_game.player_o) then raise exception 'You are not a player in this game.'; end if;
  if v_game.player_o is null then raise exception 'Waiting for your partner to join.'; end if;
  if v_game.winner is not null or v_game.is_draw then raise exception 'This round is over.'; end if;
  if (v_game.turn = 'X' and auth.uid() <> v_game.player_x)
    or (v_game.turn = 'O' and auth.uid() <> v_game.player_o) then
    raise exception 'Wait for your turn.';
  end if;

  v_board := v_game.board;
  if v_board[p_cell + 1] <> '' then raise exception 'That cell is already taken.'; end if;
  v_mark := v_game.turn;
  v_board[p_cell + 1] := v_mark;

  select array[a - 1, b - 1, c - 1]::smallint[] into v_line
  from (values (1,2,3), (4,5,6), (7,8,9), (1,4,7), (2,5,8), (3,6,9), (1,5,9), (3,5,7)) as lines(a,b,c)
  where v_board[a] = v_mark and v_board[b] = v_mark and v_board[c] = v_mark
  limit 1;

  v_scores := v_game.scores;
  if v_line is not null then
    v_scores := jsonb_set(v_scores, array[v_mark], to_jsonb(coalesce((v_scores->>v_mark)::integer, 0) + 1), true);
    update public.tic_tac_toe_games set board = v_board, winner = v_mark, win_line = v_line,
      scores = v_scores, updated_by = auth.uid(), updated_at = now()
    where couple_id = v_game.couple_id returning * into v_game;
  elsif array_position(v_board, '') is null then
    v_scores := jsonb_set(v_scores, '{draws}', to_jsonb(coalesce((v_scores->>'draws')::integer, 0) + 1), true);
    update public.tic_tac_toe_games set board = v_board, is_draw = true,
      scores = v_scores, updated_by = auth.uid(), updated_at = now()
    where couple_id = v_game.couple_id returning * into v_game;
  else
    update public.tic_tac_toe_games set board = v_board, turn = case when v_mark = 'X' then 'O' else 'X' end,
      updated_by = auth.uid(), updated_at = now()
    where couple_id = v_game.couple_id returning * into v_game;
  end if;
  return to_jsonb(v_game);
end;
$$;

create or replace function public.ttt_new_round(p_reset_score boolean default false)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_game public.tic_tac_toe_games;
begin
  if auth.uid() is null then raise exception 'Sign in to play.'; end if;
  update public.tic_tac_toe_games g
  set board = array['', '', '', '', '', '', '', '', '']::text[], turn = 'X', winner = null,
      is_draw = false, win_line = '{}'::smallint[],
      scores = case when p_reset_score then '{"X":0,"O":0,"draws":0}'::jsonb else g.scores end,
      updated_by = auth.uid(), updated_at = now()
  where g.couple_id = (select p.couple_id from public.profiles p where p.id = auth.uid())
    and auth.uid() in (g.player_x, g.player_o)
  returning g.* into v_game;
  if v_game.couple_id is null then raise exception 'Game is not ready.'; end if;
  return to_jsonb(v_game);
end;
$$;

revoke all on function public.ttt_get_or_create_game() from public, anon;
revoke all on function public.ttt_make_move(integer) from public, anon;
revoke all on function public.ttt_new_round(boolean) from public, anon;
grant execute on function public.ttt_get_or_create_game() to authenticated;
grant execute on function public.ttt_make_move(integer) to authenticated;
grant execute on function public.ttt_new_round(boolean) to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'tic_tac_toe_games'
  ) then
    alter publication supabase_realtime add table public.tic_tac_toe_games;
  end if;
end $$;
