-- KAELZONLINE DATABASE
create extension if not exists pgcrypto;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('game','virtual','logo')),
  subcategory text,
  name text not null,
  price integer not null default 0,
  icon text,
  active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_code text,
  product_id uuid references public.products(id),
  product_name text,
  buyer_name text,
  whatsapp text,
  detail text,
  payment_method text,
  amount integer,
  status text default 'Menunggu Verifikasi',
  proof_path text,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.orders enable row level security;

drop policy if exists "public read active products" on public.products;
create policy "public read active products"
on public.products for select to anon, authenticated
using (active = true);

drop policy if exists "public create orders" on public.orders;
create policy "public create orders"
on public.orders for insert to anon, authenticated
with check (true);

drop policy if exists "public read orders" on public.orders;
create policy "public read orders"
on public.orders for select to anon, authenticated
using (true);

insert into public.products (category,subcategory,name,price,icon,active,sort_order)
select * from (values
('game','FREE FIRE','50 DIAMOND',8000,'💎',true,1),
('game','FREE FIRE','140 DIAMOND',18000,'💎',true,2),
('game','FREE FIRE','210 DIAMOND',27000,'💎',true,3),
('game','FREE FIRE','355 DIAMOND',44000,'💎',true,4),
('game','FREE FIRE','500 DIAMOND',61000,'💎',true,5),
('game','FREE FIRE','720 DIAMOND',85000,'💎',true,6),
('game','FREE FIRE','1450 DIAMOND',170000,'💎',true,7),
('game','MOBILE LEGENDS','56 DIAMOND',17000,'💎',true,8),
('game','MOBILE LEGENDS','144 DIAMOND',39000,'💎',true,9),
('game','MOBILE LEGENDS','240 DIAMOND',65000,'💎',true,10),
('game','MOBILE LEGENDS','355 DIAMOND',90000,'💎',true,11),
('game','MOBILE LEGENDS','460 DIAMOND',117000,'💎',true,12),
('game','MOBILE LEGENDS','712 DIAMOND',179000,'💎',true,13),
('game','MOBILE LEGENDS','1159 DIAMOND',289000,'💎',true,14),
('game','LAINNYA','LAINNYA DALAM PROSES',0,'🎮',true,99),
('virtual','WHATSAPP','INDONESIA',4000,'🇮🇩',true,1),
('virtual','WHATSAPP','COLOMBIA',6000,'🇨🇴',true,2),
('virtual','WHATSAPP','MALAYSIA',10000,'🇲🇾',true,3),
('virtual','WHATSAPP','PHILIPINA',7000,'🇵🇭',true,4),
('virtual','SHOPEE','INDONESIA',3000,'🇮🇩',true,5),
('virtual','SHOPEE','PHILIPINA',4000,'🇵🇭',true,6),
('virtual','SHOPEE','MALAYSIA',5000,'🇲🇾',true,7),
('logo','JASA LOGO','LOGO JB',1000,'🎨',true,1),
('logo','JASA LOGO','LOGO FT',3000,'🖼️',true,2),
('logo','JASA LOGO','LOGO ANIME',2000,'🌌',true,3),
('logo','JASA LOGO','LOGO CHIBI',2000,'✨',true,4),
('logo','JASA LOGO','LOGO QRIS',3000,'▣',true,5),
('logo','JASA LOGO','LOGO MUKA',5000,'👤',true,6),
('logo','JASA LOGO','LOGO TESTIMONI',3000,'💬',true,7),
('logo','JASA LOGO','LOGO WALPAPER',1000,'📱',true,8),
('logo','JASA LOGO','LOGO INFO SELL',5000,'🛍️',true,9)
) as v(category,subcategory,name,price,icon,active,sort_order)
where not exists (
  select 1 from public.products p
  where p.category=v.category and p.subcategory=v.subcategory and p.name=v.name
);

insert into storage.buckets (id,name,public)
values ('payment-proofs','payment-proofs',false)
on conflict (id) do update set public=false;

drop policy if exists "public upload payment proofs" on storage.objects;
create policy "public upload payment proofs"
on storage.objects for insert to anon, authenticated
with check (bucket_id='payment-proofs');

drop policy if exists "public read payment proofs" on storage.objects;
create policy "public read payment proofs"
on storage.objects for select to anon, authenticated
using (bucket_id='payment-proofs');
