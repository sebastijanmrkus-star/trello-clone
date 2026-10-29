-- Trello-style card details: labels, due dates, covers, archiving,
-- checklists and comments. All rows carry board_id so RLS stays one check.
alter table public.cards
  add column due_at timestamptz,
  add column due_complete boolean not null default false,
  add column cover text check (cover is null or char_length(cover) <= 300),
  add column archived boolean not null default false;
alter table public.lists add column archived boolean not null default false;

create table public.labels (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  name text not null default '' check (char_length(name) <= 50),
  color text not null check (char_length(color) <= 20),
  created_at timestamptz not null default now()
);
create index labels_board_id_idx on public.labels(board_id);

create table public.card_labels (
  card_id uuid not null references public.cards(id) on delete cascade,
  label_id uuid not null references public.labels(id) on delete cascade,
  board_id uuid not null references public.boards(id) on delete cascade,
  primary key (card_id, label_id)
);
create index card_labels_label_id_idx on public.card_labels(label_id);
create index card_labels_board_id_idx on public.card_labels(board_id);

create table public.checklists (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  position double precision not null default 0,
  created_at timestamptz not null default now()
);
create index checklists_card_id_idx on public.checklists(card_id);
create index checklists_board_id_idx on public.checklists(board_id);

create table public.checklist_items (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  checklist_id uuid not null references public.checklists(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 500),
  done boolean not null default false,
  position double precision not null default 0,
  created_at timestamptz not null default now()
);
create index checklist_items_checklist_id_idx on public.checklist_items(checklist_id);
create index checklist_items_board_id_idx on public.checklist_items(board_id);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.boards(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  author_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 5000),
  created_at timestamptz not null default now()
);
create index comments_card_id_idx on public.comments(card_id, created_at);
create index comments_board_id_idx on public.comments(board_id);
create index comments_author_id_idx on public.comments(author_id);

alter table public.labels enable row level security;
alter table public.card_labels enable row level security;
alter table public.checklists enable row level security;
alter table public.checklist_items enable row level security;
alter table public.comments enable row level security;

create policy "labels: board owner all" on public.labels
  for all to authenticated
  using (private.owns_board(board_id)) with check (private.owns_board(board_id));

create policy "card_labels: board owner all" on public.card_labels
  for all to authenticated
  using (private.owns_board(board_id))
  with check (
    private.owns_board(board_id)
    and exists (select 1 from public.cards c where c.id = card_id and c.board_id = card_labels.board_id)
    and exists (select 1 from public.labels l where l.id = label_id and l.board_id = card_labels.board_id)
  );

create policy "checklists: board owner all" on public.checklists
  for all to authenticated
  using (private.owns_board(board_id))
  with check (
    private.owns_board(board_id)
    and exists (select 1 from public.cards c where c.id = card_id and c.board_id = checklists.board_id)
  );

create policy "checklist_items: board owner all" on public.checklist_items
  for all to authenticated
  using (private.owns_board(board_id))
  with check (
    private.owns_board(board_id)
    and exists (select 1 from public.checklists k where k.id = checklist_id and k.board_id = checklist_items.board_id)
  );

create policy "comments: board owner read" on public.comments
  for select to authenticated using (private.owns_board(board_id));
create policy "comments: author insert" on public.comments
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and private.owns_board(board_id)
    and exists (select 1 from public.cards c where c.id = card_id and c.board_id = comments.board_id)
  );
create policy "comments: author update" on public.comments
  for update to authenticated
  using (author_id = (select auth.uid())) with check (author_id = (select auth.uid()));
create policy "comments: author delete" on public.comments
  for delete to authenticated using (author_id = (select auth.uid()));

-- Cards and lists must not jump to another board.
drop policy "cards: board owner all" on public.cards;
create policy "cards: board owner all" on public.cards
  for all to authenticated
  using (private.owns_board(board_id))
  with check (
    private.owns_board(board_id)
    and exists (select 1 from public.lists l where l.id = list_id and l.board_id = cards.board_id)
  );

-- New boards start with Trello's six default label colors.
create or replace function private.add_default_labels()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  insert into public.labels (board_id, color)
  select new.id, c from unnest(array['green', 'yellow', 'orange', 'red', 'purple', 'blue']) as c;
  return new;
end;
$$;
grant execute on function private.add_default_labels() to authenticated;

create trigger boards_default_labels
  after insert on public.boards
  for each row execute function private.add_default_labels();

insert into public.labels (board_id, color)
select b.id, c from public.boards b, unnest(array['green', 'yellow', 'orange', 'red', 'purple', 'blue']) as c
where not exists (select 1 from public.labels l where l.board_id = b.id);

-- Copy a card (with labels and checklists) into a list, in one transaction.
create or replace function public.copy_card(
  p_card_id uuid,
  p_list_id uuid,
  p_title text,
  p_position double precision
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_new uuid;
  v_board uuid;
  k record;
  v_k uuid;
begin
  select board_id into v_board from public.lists where id = p_list_id;
  if v_board is null then
    raise exception 'list not found';
  end if;

  insert into public.cards (board_id, list_id, title, description, position, due_at, due_complete, cover)
  select v_board, p_list_id, p_title, description, p_position, due_at, due_complete, cover
  from public.cards where id = p_card_id
  returning id into v_new;
  if v_new is null then
    raise exception 'card not found';
  end if;

  -- Labels only carry over within the same board.
  insert into public.card_labels (card_id, label_id, board_id)
  select v_new, cl.label_id, v_board from public.card_labels cl
  join public.labels l on l.id = cl.label_id
  where cl.card_id = p_card_id and l.board_id = v_board;

  for k in select * from public.checklists where card_id = p_card_id order by position loop
    insert into public.checklists (board_id, card_id, title, position)
    values (v_board, v_new, k.title, k.position) returning id into v_k;
    insert into public.checklist_items (board_id, checklist_id, title, done, position)
    select v_board, v_k, title, done, position from public.checklist_items where checklist_id = k.id;
  end loop;

  return v_new;
end;
$$;
revoke execute on function public.copy_card(uuid, uuid, text, double precision) from public, anon;
grant execute on function public.copy_card(uuid, uuid, text, double precision) to authenticated;

-- Copy a list with its (non-archived) cards to the end of the same board.
create or replace function public.copy_list(p_list_id uuid, p_title text, p_position double precision)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_new uuid;
  c record;
begin
  insert into public.lists (board_id, title, position)
  select board_id, p_title, p_position from public.lists where id = p_list_id
  returning id into v_new;
  if v_new is null then
    raise exception 'list not found';
  end if;

  for c in select id, title, position from public.cards
           where list_id = p_list_id and not archived order by position loop
    perform public.copy_card(c.id, v_new, c.title, c.position);
  end loop;
  return v_new;
end;
$$;
revoke execute on function public.copy_list(uuid, text, double precision) from public, anon;
grant execute on function public.copy_list(uuid, text, double precision) to authenticated;
