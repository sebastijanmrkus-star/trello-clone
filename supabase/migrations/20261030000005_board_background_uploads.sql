-- Custom board background images. Publicly readable (board backgrounds are
-- plain images), but each user can only upload to and delete from their own
-- folder: <user id>/<file>.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('board-backgrounds', 'board-backgrounds', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do nothing;

create policy "board-backgrounds: upload to own folder" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'board-backgrounds'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "board-backgrounds: delete own files" on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'board-backgrounds'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
