-- Workspaces group boards; boards gain stars, recently-viewed tracking and
-- CSS backgrounds (solid colors or gradients).
create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 100),
  created_at timestamptz not null default now()
);
create index workspaces_owner_id_idx on public.workspaces(owner_id);
alter table public.workspaces enable row level security;

create policy "workspaces: owner all" on public.workspaces
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- Every new user gets a default workspace.
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.workspaces (owner_id, name) values (new.id, 'My Workspace');
  return new;
end;
$$;
revoke execute on function private.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

insert into public.workspaces (owner_id, name)
select u.id, 'My Workspace' from auth.users u
where not exists (select 1 from public.workspaces w where w.owner_id = u.id);

alter table public.boards rename column color to background;
alter table public.boards
  alter column background type text,
  add column workspace_id uuid references public.workspaces(id) on delete cascade,
  add column starred boolean not null default false,
  add column last_viewed_at timestamptz;

update public.boards b
set workspace_id = (select w.id from public.workspaces w where w.owner_id = b.owner_id order by w.created_at limit 1)
where workspace_id is null;

alter table public.boards alter column workspace_id set not null;
alter table public.boards add constraint boards_background_len check (char_length(background) <= 300);
create index boards_workspace_id_idx on public.boards(workspace_id);

drop policy "boards: owner all" on public.boards;
create policy "boards: owner all" on public.boards
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (
    owner_id = (select auth.uid())
    and exists (
      select 1 from public.workspaces w
      where w.id = workspace_id and w.owner_id = (select auth.uid())
    )
  );

-- Create a board with its lists and cards in one transaction.
-- p_lists: [{"title": "To do", "cards": ["Card A", "Card B"]}, ...]
create or replace function public.create_board_from_template(
  p_title text,
  p_background text,
  p_workspace_id uuid,
  p_lists jsonb
)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_board uuid;
  v_list uuid;
  l jsonb;
  c text;
  i int := 0;
  j int;
begin
  insert into public.boards (title, background, workspace_id)
  values (p_title, p_background, p_workspace_id)
  returning id into v_board;

  for l in select * from jsonb_array_elements(coalesce(p_lists, '[]'::jsonb)) loop
    i := i + 1;
    insert into public.lists (board_id, title, position)
    values (v_board, l->>'title', i * 1024)
    returning id into v_list;

    j := 0;
    for c in select * from jsonb_array_elements_text(coalesce(l->'cards', '[]'::jsonb)) loop
      j := j + 1;
      insert into public.cards (board_id, list_id, title, position)
      values (v_board, v_list, c, j * 1024);
    end loop;
  end loop;

  return v_board;
end;
$$;
revoke execute on function public.create_board_from_template(text, text, uuid, jsonb) from public, anon;
grant execute on function public.create_board_from_template(text, text, uuid, jsonb) to authenticated;
