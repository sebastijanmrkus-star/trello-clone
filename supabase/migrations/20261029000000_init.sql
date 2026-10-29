-- Boards, lists and cards owned by the signed-in user.
create table public.boards (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  color text not null default '#0079bf',
  created_at timestamptz not null default now()
);

create table public.lists (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 100),
  position double precision not null default 0,
  created_at timestamptz not null default now()
);

create table public.cards (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  list_id uuid not null references public.lists(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 500),
  description text not null default '',
  position double precision not null default 0,
  created_at timestamptz not null default now()
);

create index boards_owner_id_idx on public.boards(owner_id);
create index lists_board_id_idx on public.lists(board_id, position);
create index cards_list_id_idx on public.cards(list_id, position);
create index cards_board_id_idx on public.cards(board_id);

alter table public.boards enable row level security;
alter table public.lists enable row level security;
alter table public.cards enable row level security;

create or replace function public.owns_board(b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.boards where id = b and owner_id = (select auth.uid())
  );
$$;
revoke execute on function public.owns_board(uuid) from public, anon;
grant execute on function public.owns_board(uuid) to authenticated;

create policy "boards: owner all" on public.boards
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

create policy "lists: board owner all" on public.lists
  for all to authenticated
  using (public.owns_board(board_id))
  with check (public.owns_board(board_id));

create policy "cards: board owner all" on public.cards
  for all to authenticated
  using (public.owns_board(board_id))
  with check (
    public.owns_board(board_id)
    and exists (select 1 from public.lists l where l.id = list_id and l.board_id = cards.board_id)
  );
