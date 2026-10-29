-- "Mark complete" on cards, independent of the due date's completion.
alter table public.cards add column completed boolean not null default false;
