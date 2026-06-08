-- Production hardening notes for Supabase.
-- Apply this only after migrating the admin panel to Supabase Auth.
-- The current localStorage admin login is not a database identity, so these
-- write policies would block product/category/order management until auth is migrated.
-- These policies allow any authenticated Supabase user to manage admin data.
-- Keep only trusted admin users in Supabase Auth for this project.

alter table categories enable row level security;
alter table products enable row level security;
alter table orders enable row level security;

drop policy if exists "public access" on products;

create policy "public read categories"
on categories
for select
using (active = true);

create policy "public read available products"
on products
for select
using (available = true);

create policy "admin manage categories"
on categories
for all
to authenticated
using (true)
with check (true);

create policy "admin manage products"
on products
for all
to authenticated
using (true)
with check (true);

create policy "admin manage orders"
on orders
for all
to authenticated
using (true)
with check (true);

create policy "public create orders"
on orders
for insert
to anon
with check (true);

create index if not exists products_available_created_at_idx
on products (available, created_at desc);

create index if not exists products_created_at_idx
on products (created_at desc);

create index if not exists categories_active_name_idx
on categories (active, name);
