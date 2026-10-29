-- Keep the RLS helper out of the PostgREST-exposed schema.
create schema if not exists private;
grant usage on schema private to authenticated;
alter function public.owns_board(uuid) set schema private;
