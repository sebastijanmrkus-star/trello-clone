-- Teams grow by an Admin adding someone who already has an account (by email)
-- instead of invitation links. Cards can only be assigned to members of the
-- board's team.

drop function public.accept_invitation(text);
drop function public.get_invitation(text);
drop function public.revoke_invitation(uuid);
drop table public.team_invitations;

-- Add an existing user to a team. Admins only; the person needs an account.
create or replace function public.add_team_member(p_team_id uuid, p_email text, p_role text default 'member')
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user uuid;
begin
  if not private.is_team_admin(p_team_id) then
    raise exception 'Only a team Admin can add members.' using errcode = '42501';
  end if;
  if p_role not in ('admin', 'member') then
    raise exception 'Role must be Admin or Member.' using errcode = '22023';
  end if;
  v_user := private.user_id_by_email(p_email);
  if v_user is null then
    raise exception 'No account uses that email. They need to sign up first.' using errcode = 'P0002';
  end if;
  if exists (select 1 from public.workspace_members where workspace_id = p_team_id and user_id = v_user) then
    raise exception 'That person is already in this team.' using errcode = '23505';
  end if;
  insert into public.workspace_members (workspace_id, user_id, role) values (p_team_id, v_user, p_role);
  return v_user;
end;
$$;
revoke execute on function public.add_team_member(uuid, text, text) from public, anon;
grant execute on function public.add_team_member(uuid, text, text) to authenticated;

-- Card assignees must be members of the board's team.
drop policy "card_members: board access all" on public.card_members;
create policy "card_members: board access all" on public.card_members
  for all to authenticated
  using (private.can_access_board(board_id))
  with check (
    private.can_access_board(board_id)
    and exists (select 1 from public.cards c where c.id = card_id and c.board_id = card_members.board_id)
    and exists (
      select 1 from public.boards b
      join public.workspace_members m on m.workspace_id = b.workspace_id
      where b.id = card_members.board_id and m.user_id = card_members.user_id
    )
  );

-- Existing assignments of people outside the board's team go.
delete from public.card_members cm
using public.boards b
where b.id = cm.board_id
  and not exists (
    select 1 from public.workspace_members m where m.workspace_id = b.workspace_id and m.user_id = cm.user_id
  );

-- Someone who leaves a team comes off every card on its boards.
create or replace function private.remove_team_card_memberships()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.card_members cm
  using public.boards b
  where cm.board_id = b.id and b.workspace_id = old.workspace_id and cm.user_id = old.user_id;
  return old;
end;
$$;
