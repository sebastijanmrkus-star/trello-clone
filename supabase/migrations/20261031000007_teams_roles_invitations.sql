-- Teams. Every workspace becomes a team with Admin and Member roles. Team
-- members can open every board in the team. Admins rename the team, manage
-- members and roles, and create or revoke single-use invitation links. A team
-- always keeps at least one Admin.

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'member' check (role in ('admin', 'member')),
  joined_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);
create index workspace_members_user_id_idx on public.workspace_members(user_id);
alter table public.workspace_members enable row level security;

-- Existing workspace owners become their team's Admin.
insert into public.workspace_members (workspace_id, user_id, role, joined_at)
select w.id, w.owner_id, 'admin', w.created_at
from public.workspaces w
join public.profiles p on p.id = w.owner_id
on conflict do nothing;

-- Whoever creates a team becomes its Admin.
create or replace function private.add_team_creator()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.workspace_members (workspace_id, user_id, role)
  values (new.id, new.owner_id, 'admin')
  on conflict do nothing;
  return new;
end;
$$;
revoke execute on function private.add_team_creator() from public, anon, authenticated;

create trigger workspaces_add_creator
  after insert on public.workspaces
  for each row execute function private.add_team_creator();

create or replace function private.is_team_member(w uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.workspace_members where workspace_id = w and user_id = (select auth.uid())
  );
$$;

create or replace function private.is_team_admin(w uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = w and user_id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Board settings (rename, star, background, delete, sharing): the board's
-- owner or an Admin of its team.
create or replace function private.can_manage_board(b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.boards where id = b and owner_id = (select auth.uid()))
      or exists (
        select 1 from public.boards bd
        join public.workspace_members m on m.workspace_id = bd.workspace_id
        where bd.id = b and m.user_id = (select auth.uid()) and m.role = 'admin'
      );
$$;

-- Board content: owner, people the board is shared with, and the board's team.
create or replace function private.can_access_board(b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.boards where id = b and owner_id = (select auth.uid()))
      or exists (select 1 from public.board_members where board_id = b and user_id = (select auth.uid()))
      or exists (
        select 1 from public.boards bd
        join public.workspace_members m on m.workspace_id = bd.workspace_id
        where bd.id = b and m.user_id = (select auth.uid())
      );
$$;

-- People you can see: yourself, people on a board with you, and teammates.
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
      or exists (select 1 from public.board_members m join mine on mine.id = m.board_id where m.user_id = other)
      or exists (
        select 1 from public.workspace_members a
        join public.workspace_members o on o.workspace_id = a.workspace_id
        where a.user_id = (select auth.uid()) and o.user_id = other
      );
$$;

revoke execute on function private.is_team_member(uuid) from public, anon;
revoke execute on function private.is_team_admin(uuid) from public, anon;
revoke execute on function private.can_manage_board(uuid) from public, anon;
grant execute on function private.is_team_member(uuid) to authenticated;
grant execute on function private.is_team_admin(uuid) to authenticated;
grant execute on function private.can_manage_board(uuid) to authenticated;

-- Workspaces (teams)
drop policy "workspaces: owner all" on public.workspaces;
create policy "workspaces: members read" on public.workspaces
  for select to authenticated using (private.is_team_member(id));
create policy "workspaces: create your own" on public.workspaces
  for insert to authenticated with check (owner_id = (select auth.uid()));
create policy "workspaces: admins update" on public.workspaces
  for update to authenticated using (private.is_team_admin(id)) with check (private.is_team_admin(id));
create policy "workspaces: admins delete" on public.workspaces
  for delete to authenticated using (private.is_team_admin(id));

-- Team members: everyone in the team sees the list; Admins change roles and
-- remove people; anyone can leave. New members join only through invitations.
create policy "workspace_members: team reads" on public.workspace_members
  for select to authenticated using (private.is_team_member(workspace_id));
create policy "workspace_members: admins change roles" on public.workspace_members
  for update to authenticated
  using (private.is_team_admin(workspace_id)) with check (private.is_team_admin(workspace_id));
create policy "workspace_members: admins remove, members leave" on public.workspace_members
  for delete to authenticated
  using (private.is_team_admin(workspace_id) or user_id = (select auth.uid()));
revoke insert, update on public.workspace_members from authenticated, anon;
grant update (role) on public.workspace_members to authenticated;

-- A team always keeps at least one Admin. Deleting the whole team (or the
-- account) is still allowed.
create or replace function private.keep_one_admin()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.role <> 'admin' or (tg_op = 'UPDATE' and new.role = 'admin') then
    return coalesce(new, old);
  end if;
  if not exists (select 1 from public.workspaces where id = old.workspace_id)
     or not exists (select 1 from public.profiles where id = old.user_id) then
    return coalesce(new, old);
  end if;
  if not exists (
    select 1 from public.workspace_members
    where workspace_id = old.workspace_id and role = 'admin' and user_id <> old.user_id
  ) then
    raise exception 'A team needs at least one Admin. Make someone else an Admin first.'
      using errcode = '23514';
  end if;
  return coalesce(new, old);
end;
$$;
revoke execute on function private.keep_one_admin() from public, anon, authenticated;

create trigger workspace_members_keep_one_admin
  before update of role or delete on public.workspace_members
  for each row execute function private.keep_one_admin();

-- Someone who leaves a team comes off the cards of its boards, unless they
-- still reach that board another way.
create or replace function private.remove_team_card_memberships()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.card_members cm
  using public.boards b
  where cm.board_id = b.id
    and b.workspace_id = old.workspace_id
    and cm.user_id = old.user_id
    and b.owner_id <> old.user_id
    and not exists (select 1 from public.board_members bm where bm.board_id = b.id and bm.user_id = old.user_id);
  return old;
end;
$$;
revoke execute on function private.remove_team_card_memberships() from public, anon, authenticated;

create trigger workspace_members_cleanup
  after delete on public.workspace_members
  for each row execute function private.remove_team_card_memberships();

-- Boards: the team reads; any team member creates boards in it; the board's
-- owner or a team Admin changes or deletes it.
drop policy "boards: owner or member read" on public.boards;
drop policy "boards: owner insert" on public.boards;
drop policy "boards: owner update" on public.boards;
drop policy "boards: owner delete" on public.boards;
create policy "boards: owner, shared or team read" on public.boards
  for select to authenticated
  using (
    owner_id = (select auth.uid())
    or private.is_board_member(id)
    or private.is_team_member(workspace_id)
  );
create policy "boards: team members create" on public.boards
  for insert to authenticated
  with check (owner_id = (select auth.uid()) and private.is_team_member(workspace_id));
create policy "boards: owner or team admin update" on public.boards
  for update to authenticated
  using (owner_id = (select auth.uid()) or private.is_team_admin(workspace_id))
  with check (
    private.is_team_member(workspace_id)
    and (owner_id = (select auth.uid()) or private.is_team_admin(workspace_id))
  );
create policy "boards: owner or team admin delete" on public.boards
  for delete to authenticated
  using (owner_id = (select auth.uid()) or private.is_team_admin(workspace_id));

-- Sharing a single board: its owner or a team Admin.
drop policy "board_members: owner adds" on public.board_members;
drop policy "board_members: owner removes, members leave" on public.board_members;
create policy "board_members: managers add" on public.board_members
  for insert to authenticated
  with check (private.can_manage_board(board_id) and user_id <> (select auth.uid()));
create policy "board_members: managers remove, members leave" on public.board_members
  for delete to authenticated
  using (private.can_manage_board(board_id) or user_id = (select auth.uid()));

create or replace function public.add_board_member(p_board_id uuid, p_email text)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_user uuid;
begin
  if not private.can_manage_board(p_board_id) then
    raise exception 'Only the board owner or a team Admin can share this board.' using errcode = '42501';
  end if;
  v_user := private.user_id_by_email(p_email);
  if v_user is null then
    raise exception 'No account uses that email. Ask them to sign up first.' using errcode = 'P0002';
  end if;
  if v_user = (select auth.uid()) then
    raise exception 'You already have access to this board.' using errcode = '22023';
  end if;
  insert into public.board_members (board_id, user_id) values (p_board_id, v_user)
  on conflict do nothing;
  return v_user;
end;
$$;

-- Card assignees: anyone who can reach the board.
drop policy "card_members: board access all" on public.card_members;
create policy "card_members: board access all" on public.card_members
  for all to authenticated
  using (private.can_access_board(board_id))
  with check (
    private.can_access_board(board_id)
    and exists (select 1 from public.cards c where c.id = card_id and c.board_id = card_members.board_id)
    and (
      exists (select 1 from public.boards b where b.id = card_members.board_id and b.owner_id = card_members.user_id)
      or exists (select 1 from public.board_members m where m.board_id = card_members.board_id and m.user_id = card_members.user_id)
      or exists (
        select 1 from public.boards b
        join public.workspace_members m on m.workspace_id = b.workspace_id
        where b.id = card_members.board_id and m.user_id = card_members.user_id
      )
    )
  );

-- Invitation links. The token is the secret in the link; only the team's
-- Admins can read it. Each link works once, expires, and can be revoked.
create table public.team_invitations (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  token text not null unique
    default replace(gen_random_uuid()::text, '-', '') || replace(gen_random_uuid()::text, '-', ''),
  role text not null default 'member' check (role in ('admin', 'member')),
  created_by uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_by uuid references public.profiles(id) on delete set null,
  accepted_at timestamptz,
  revoked_at timestamptz
);
create index team_invitations_workspace_id_idx on public.team_invitations(workspace_id);
alter table public.team_invitations enable row level security;

create policy "team_invitations: admins read" on public.team_invitations
  for select to authenticated using (private.is_team_admin(workspace_id));
create policy "team_invitations: admins create" on public.team_invitations
  for insert to authenticated
  with check (
    private.is_team_admin(workspace_id)
    and created_by = (select auth.uid())
    and expires_at > now()
    and expires_at <= now() + interval '30 days 1 minute'
  );
revoke insert, update, delete on public.team_invitations from authenticated, anon;
grant insert (workspace_id, role, expires_at) on public.team_invitations to authenticated;

-- What the invitation page shows to whoever holds the link.
create or replace function public.get_invitation(p_token text)
returns table (
  team_id uuid,
  team_name text,
  role text,
  invited_by text,
  status text,
  expires_at timestamptz,
  already_member boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    w.id,
    w.name,
    i.role,
    p.email,
    case
      when i.revoked_at is not null then 'revoked'
      when i.accepted_at is not null then 'accepted'
      when i.expires_at <= now() then 'expired'
      else 'pending'
    end,
    i.expires_at,
    exists (select 1 from public.workspace_members m where m.workspace_id = w.id and m.user_id = (select auth.uid()))
  from public.team_invitations i
  join public.workspaces w on w.id = i.workspace_id
  left join public.profiles p on p.id = i.created_by
  where i.token = p_token;
$$;

create or replace function public.accept_invitation(p_token text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_inv public.team_invitations;
  v_user uuid := (select auth.uid());
begin
  if v_user is null then
    raise exception 'Sign in to accept this invitation.' using errcode = '42501';
  end if;
  select * into v_inv from public.team_invitations where token = p_token for update;
  if not found then
    raise exception 'This invitation link is not valid.' using errcode = 'P0002';
  elsif v_inv.revoked_at is not null then
    raise exception 'This invitation was revoked by a team Admin.' using errcode = '22023';
  elsif v_inv.accepted_at is not null then
    raise exception 'This invitation link has already been used.' using errcode = '22023';
  elsif v_inv.expires_at <= now() then
    raise exception 'This invitation link has expired. Ask a team Admin for a new one.' using errcode = '22023';
  end if;
  if exists (select 1 from public.workspace_members where workspace_id = v_inv.workspace_id and user_id = v_user) then
    raise exception 'You are already a member of this team.' using errcode = '23505';
  end if;

  insert into public.workspace_members (workspace_id, user_id, role)
  values (v_inv.workspace_id, v_user, v_inv.role);
  update public.team_invitations
  set accepted_by = v_user, accepted_at = now()
  where id = v_inv.id;
  return v_inv.workspace_id;
end;
$$;

create or replace function public.revoke_invitation(p_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_team uuid;
begin
  select workspace_id into v_team from public.team_invitations where id = p_id;
  if v_team is null or not private.is_team_admin(v_team) then
    raise exception 'Only a team Admin can revoke invitations.' using errcode = '42501';
  end if;
  update public.team_invitations
  set revoked_at = now()
  where id = p_id and revoked_at is null and accepted_at is null;
end;
$$;

revoke execute on function public.get_invitation(text) from public, anon;
revoke execute on function public.accept_invitation(text) from public, anon;
revoke execute on function public.revoke_invitation(uuid) from public, anon;
grant execute on function public.get_invitation(text) to authenticated;
grant execute on function public.accept_invitation(text) to authenticated;
grant execute on function public.revoke_invitation(uuid) to authenticated;
