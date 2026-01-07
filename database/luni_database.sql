create table categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  icon text,
  active boolean default true,
  created_at timestamp default now()
);


create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  price numeric not null,
  color text,
  size text,
  stock integer default 0,
  available boolean default true,
  description text,
  image text,
  created_at timestamp default now()
);

create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null,
  customer_info jsonb not null,
  items jsonb not null,
  subtotal numeric not null,
  discount numeric default 0,
  shipping numeric default 0,
  total numeric not null,
  status text default 'pendiente',
  invoice_sent boolean default false,
  invoice_sent_at timestamp,
  created_at timestamp default now(),
  updated_at timestamp default now()
);


create policy "public access"
on products
for all
using (true)
with check (true);



insert into categories (name, slug, icon, active) values
('Ganchitos', 'ganchitos', '🎀', true),
('Fruticas', 'fruticas', '🍓', true),
('Animalitos', 'animalitos', '🐱', true),
('Naturales', 'naturales', '🌿', true),
('Pinzas Clasicas', 'pinzasclasicas', '📎', true),
('Flores Medianas', 'floresmedianas', '🌸', true),
('Flores Mini', 'floresmini', '🌺', true),
('Sets', 'sets', '🎁', true);

select * from categories;