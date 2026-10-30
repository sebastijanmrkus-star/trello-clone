-- Board sharing and card members. A board's owner can add other registered
-- users as members; members can work with everything on the board (lists,
-- cards, labels, checklists, comments, card members), while board settings
-- (rename, background, star, delete, sharing) stay with the owner.

-- Email of each user, so people on a shared board can see who's who.
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  created_at timestamptz not null default now()
);
alter table public.profiles enable row level security;

insert into public.profiles (id, email)
select id, coalesce(email, '') from auth.users
on conflict (id) do nothing;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email) values (new.id, coalesce(new.email, ''));
  insert into public.workspaces (owner_id, name) values (new.id, 'My Workspace');
  return new;
end;
$$;

create or replace function private.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = coalesce(new.email, '') where id = new.id;
  return new;
end;
$$;
revoke execute on function private.sync_profile_email() from public, anon, authenticated;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function private.sync_profile_email();

create table public.board_members (
  board_id uuid not null references public.boards(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  added_at timestamptz not null default now(),
  primary key (board_id, user_id)
);
create index board_members_user_id_idx on public.board_members(user_id);
alter table public.board_members enable row level security;

create or replace function private.is_board_member(b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.board_members where board_id = b and user_id = (select auth.uid())
  );
$$;

create or replace function private.can_access_board(b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.boards where id = b and owner_id = (select auth.uid()))
      or exists (select 1 from public.board_members where board_id = b and user_id = (select auth.uid()));
$$;

-- True when `other` is the current user or shares at least one board with them.
create or replace function private.shares_board_with(other uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  with mine as (
    select id from public.boards where owner_id = (select auth.uid())
    union
    select board_id from public.board_members where user_id = (select auth.uid())
  )
  select other = (select auth.uid())
      or exists (select 1 from public.boards b join mine on mine.id = b.id where b.owner_id = other)
      or exists (select 1 from public.board_members m join mine on mine.id = m.board_id where m.user_id = other);
$$;

-- Looks a user up by email for sharing. Lives in the private schema, so it is
-- not reachable through the API; only add_board_member uses it.
create or replace function private.user_id_by_email(p_email text)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select id from public.profiles where lower(email) = lower(trim(p_email)) limit 1;
$$;

revoke execute on function private.is_board_member(uuid) from public, anon;
revoke execute on function private.can_access_board(uuid) from public, anon;
revoke execute on function private.shares_board_with(uuid) from public, anon;
revoke execute on function private.user_id_by_email(text) from public, anon;
grant execute on function private.is_board_member(uuid) to authenticated;
grant execute on function private.can_access_board(uuid) to authenticated;
grant execute on function private.shares_board_with(uuid) to authenticated;
grant execute on function private.user_id_by_email(text) to authenticated;

create policy "profiles: people you share a board with" on public.profiles
  for select to authenticated using (private.shares_board_with(id));

create policy "board_members: read on accessible boards" on public.board_members
  for select to authenticated using (private.can_access_board(board_id));
create policy "board_members: owner adds" on public.board_members
  for insert to authenticated
  with check (
    private.owns_board(board_id)
    and user_id <> (select auth.uid())
  );
create policy "board_members: owner removes, members leave" on public.board_members
  for delete to authenticated
  using (private.owns_board(board_id) or user_id = (select auth.uid()));

-- Boards: members can read; only the owner can change or delete.
drop policy "boards: owner all" on public.boards;
create policy "boards: owner or member read" on public.boards
  for select to authenticated
  using (owner_id = (select auth.uid()) or private.is_board_member(id));
create policy "boards: owner insert" on public.boards
  for insert to authenticated
  with check (
    owner_id = (select auth.uid())
    and exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = (select auth.uid()))
  );
create policy "boards: owner update" on public.boards
  for update to authenticated
  using (owner_id = (select auth.uid()))
  with check (
    owner_id = (select auth.uid())
    and exists (select 1 from public.workspaces w where w.id = workspace_id and w.owner_id = (select auth.uid()))
  );
create policy "boards: owner delete" on public.boards
  for delete to authenticated using (owner_id = (select auth.uid()));

-- Board content: owner and members.
drop policy "lists: board owner all" on public.lists;
create policy "lists: board access all" on public.lists
  for all to authenticated
  using (private.can_access_board(board_id)) with check (private.can_access_board(board_id));

drop policy "cards: board owner all" on public.cards;
create policy "cards: board access all" on public.cards
  for all to authenticated
  using (private.can_access_board(board_id))
  with check (
    private.can_access_board(board_id)
    and exists (select 1 from public.lists l where l.id = list_id and l.board_id = cards.board_id)
  );

drop policy "labels: board owner all" on public.labels;
create policy "labels: board access all" on public.labels
  for all to authenticated
  using (private.can_access_board(board_id)) with check (private.can_access_board(board_id));

drop policy "card_labels: board owner all" on public.card_labels;
create policy "card_labels: board access all" on public.card_labels
  for all to authenticated
  using (private.can_access_board(board_id))
  with check (
    private.can_access_board(board_id)
    and exists (select 1 from public.cards c where c.id = card_id and c.board_id = card_labels.board_id)
    and exists (select 1 from public.labels l where l.id = label_id and l.board_id = card_labels.board_id)
  );

drop policy "checklists: board owner all" on public.checklists;
create policy "checklists: board access all" on public.checklists
  for all to authenticated
  using (private.can_access_board(board_id))
  with check (
    private.can_access_board(board_id)
    and exists (select 1 from public.cards c where c.id = card_id and c.board_id = checklists.board_id)
  );

drop policy "checklist_items: board owner all" on public.checklist_items;
create policy "checklist_items: board access all" on public.checklist_items
  for all to authenticated
  using (private.can_access_board(board_id))
  with check (
    private.can_access_board(board_id)
    and exists (select 1 from public.checklists k where k.id = checklist_id and k.board_id = checklist_items.board_id)
  );

drop policy "comments: board owner read" on public.comments;
create policy "comments: board access read" on public.comments
  for select to authenticated using (private.can_access_board(board_id));
drop policy "comments: author insert" on public.comments;
create policy "comments: author insert" on public.comments
  for insert to authenticated
  with check (
    author_id = (select auth.uid())
    and private.can_access_board(board_id)
    and exists (select 1 from public.cards c where c.id = card_id and c.board_id = comments.board_id)
  );

-- People assigned to a card; must be the board's owner or one of its members.
create table public.card_members (
  card_id uuid not null references public.cards(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  board_id uuid not null references public.boards(id) on delete cascade,
  primary key (card_id, user_id)
);
create index card_members_user_id_idx on public.card_members(user_id);
create index card_members_board_id_idx on public.card_members(board_id);
alter table public.card_members enable row level security;

create policy "card_members: board access all" on public.card_members
  for all to authenticated
  using (private.can_access_board(board_id))
  with check (
    private.can_access_board(board_id)
    and exists (select 1 from public.cards c where c.id = card_id and c.board_id = card_members.board_id)
    and (
      exists (select 1 from public.boards b where b.id = card_members.board_id and b.owner_id = card_members.user_id)
      or exists (select 1 from public.board_members m where m.board_id = card_members.board_id and m.user_id = card_members.user_id)
    )
  );

-- Someone who leaves or is removed from a board comes off its cards too.
create or replace function private.remove_card_memberships()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.card_members where board_id = old.board_id and user_id = old.user_id;
  return old;
end;
$$;
revoke execute on function private.remove_card_memberships() from public, anon, authenticated;

create trigger board_members_cleanup
  after delete on public.board_members
  for each row execute function private.remove_card_memberships();

-- Share a board with a registered user by email (owner only, enforced by the
-- board_members insert policy as well).
create or replace function public.add_board_member(p_board_id uuid, p_email text)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user uuid;
begin
  if not private.owns_board(p_board_id) then
    raise exception 'Only the board owner can share this board.' using errcode = '42501';
  end if;
  v_user := private.user_id_by_email(p_email);
  if v_user is null then
    raise exception 'No account uses that email. Ask them to sign up first.' using errcode = 'P0002';
  end if;
  if v_user = (select auth.uid()) then
    raise exception 'You already own this board.' using errcode = '22023';
  end if;
  insert into public.board_members (board_id, user_id) values (p_board_id, v_user)
  on conflict do nothing;
  return v_user;
end;
$$;
revoke execute on function public.add_board_member(uuid, text) from public, anon;
grant execute on function public.add_board_member(uuid, text) to authenticated;
