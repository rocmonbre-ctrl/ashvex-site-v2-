-- À copier-coller dans Supabase → SQL Editor → New query → Run

create table if not exists catalog (
  id text primary key default 'main',
  data jsonb not null default '{"products": [], "categories": []}'::jsonb,
  updated_at timestamptz default now()
);

insert into catalog (id, data)
values ('main', '{"products": [], "categories": ["Hoodies", "T-Shirts", "Chaussures", "Accessoires", "Pantalons"]}'::jsonb)
on conflict (id) do nothing;

alter table catalog enable row level security;

create policy "Public read access"
  on catalog for select
  using (true);

create policy "Public write access"
  on catalog for update
  using (true);
