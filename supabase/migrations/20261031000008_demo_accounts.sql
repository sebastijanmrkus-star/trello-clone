-- Four fictional demo accounts for one-click sign-in from the login page, and
-- a demo team with a sample board. The demo password is public (it is in the
-- login page), so the accounts are marked as demo and their password and
-- email cannot be changed.
--
--   ava.admin@demo.example.com      Admin of "Demo Studio", Member of "Marketing Crew"
--   leo.member@demo.example.com     Member of "Demo Studio", Admin of "Marketing Crew"
--   mia.member@demo.example.com     Member of "Demo Studio"
--   noah.newcomer@demo.example.com  only a personal team (try an invitation link)

create or replace function private.protect_demo_accounts()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if coalesce(old.raw_app_meta_data->>'demo', '') = 'true' then
    new.encrypted_password := old.encrypted_password;
    new.email := old.email;
    new.email_change := old.email_change;
    new.raw_app_meta_data := old.raw_app_meta_data;
  end if;
  return new;
end;
$$;
revoke execute on function private.protect_demo_accounts() from public, anon, authenticated;

create trigger protect_demo_accounts
  before update on auth.users
  for each row execute function private.protect_demo_accounts();

do $$
declare
  v_pw text := extensions.crypt('Demo-Pass-2026!', extensions.gen_salt('bf'));
  v_ava uuid := 'de300000-0000-4000-a000-000000000001';
  v_leo uuid := 'de300000-0000-4000-a000-000000000002';
  v_mia uuid := 'de300000-0000-4000-a000-000000000003';
  v_noah uuid := 'de300000-0000-4000-a000-000000000004';
  v_team uuid := 'de300000-0000-4000-b000-000000000001';
  v_team2 uuid := 'de300000-0000-4000-b000-000000000002';
  v_board uuid := 'de300000-0000-4000-c000-000000000001';
  v_list uuid;
  v_card uuid;
  u record;
  l record;
  v_title text;
  j int;
begin
  for u in
    select * from (values
      (v_ava, 'ava.admin@demo.example.com'),
      (v_leo, 'leo.member@demo.example.com'),
      (v_mia, 'mia.member@demo.example.com'),
      (v_noah, 'noah.newcomer@demo.example.com')
    ) as t(id, email)
  loop
    if not exists (select 1 from auth.users where id = u.id or email = u.email) then
      insert into auth.users (
        instance_id, id, aud, role, email, encrypted_password, email_confirmed_at,
        raw_app_meta_data, raw_user_meta_data, created_at, updated_at,
        confirmation_token, recovery_token, email_change_token_new, email_change
      ) values (
        '00000000-0000-0000-0000-000000000000', u.id, 'authenticated', 'authenticated', u.email, v_pw, now(),
        '{"provider": "email", "providers": ["email"], "demo": true}', '{}', now(), now(),
        '', '', '', ''
      );
      insert into auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at)
      values (
        u.id::text, u.id,
        jsonb_build_object('sub', u.id::text, 'email', u.email, 'email_verified', true),
        'email', now(), now(), now()
      );
    end if;
  end loop;

  -- The demo team: Ava is the Admin, Leo and Mia are Members.
  if not exists (select 1 from public.workspaces where id = v_team) then
    -- Their teams are the shared demo teams, not an empty personal one.
    delete from public.workspaces
    where owner_id in (v_ava, v_leo, v_mia) and id not in (v_team, v_team2);

    insert into public.workspaces (id, owner_id, name, created_at)
    values (v_team, v_ava, 'Demo Studio', now() - interval '1 minute');
    insert into public.workspace_members (workspace_id, user_id, role) values
      (v_team, v_leo, 'member'),
      (v_team, v_mia, 'member')
    on conflict do nothing;

    insert into public.boards (id, owner_id, workspace_id, title, background)
    values (
      v_board, v_ava, v_team, 'Website Launch',
      'linear-gradient(135deg, #0c66e4 0%, #6e5dc6 100%)'
    );

    for l in
      select * from (values
        (1, 'To do', array['Write launch blog post', 'Prepare social media posts', 'Final QA pass']),
        (2, 'In progress', array['Design new landing page', 'Set up analytics']),
        (3, 'Done', array['Choose launch date', 'Book photographer'])
      ) as t(pos, title, cards)
    loop
      insert into public.lists (board_id, title, position)
      values (v_board, l.title, l.pos * 1024)
      returning id into v_list;
      j := 0;
      foreach v_title in array l.cards loop
        j := j + 1;
        insert into public.cards (board_id, list_id, title, position, completed)
        values (v_board, v_list, v_title, j * 1024, l.title = 'Done')
        returning id into v_card;
        -- Spread the cards over the team so the member avatars show.
        insert into public.card_members (card_id, user_id, board_id)
        values (v_card, (array[v_ava, v_leo, v_mia])[1 + (l.pos + j) % 3], v_board);
      end loop;
    end loop;
  end if;

  -- A second team for switching between teams: Leo is the Admin, Ava a Member.
  if not exists (select 1 from public.workspaces where id = v_team2) then
    insert into public.workspaces (id, owner_id, name) values (v_team2, v_leo, 'Marketing Crew');
    insert into public.workspace_members (workspace_id, user_id, role) values (v_team2, v_ava, 'member')
    on conflict do nothing;
    insert into public.boards (owner_id, workspace_id, title, background)
    values (v_leo, v_team2, 'Campaign Calendar', 'linear-gradient(135deg, #1f845a 0%, #2898bd 100%)')
    returning id into v_board;
    insert into public.lists (board_id, title, position) values (v_board, 'Ideas', 1024) returning id into v_list;
    insert into public.cards (board_id, list_id, title, position) values
      (v_board, v_list, 'Autumn newsletter', 1024),
      (v_board, v_list, 'Customer story video', 2048);
    insert into public.lists (board_id, title, position) values (v_board, 'Scheduled', 2048);
  end if;
end;
$$;
