-- GCE Papers database schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) on a fresh project.
-- All application access happens through server-side API routes using the
-- service-role key, so Row Level Security is enabled with no public policies
-- (deny-by-default) to make sure the anon key can never read/write this data
-- directly if it is ever accidentally exposed client-side.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- users: students, authenticated by phone number + password (hashed)
-- ---------------------------------------------------------------------------
create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  phone_number text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

alter table users enable row level security;

-- ---------------------------------------------------------------------------
-- documents: one row per uploadable asset (a "questions" paper or a
-- "marking_scheme" for a given level/year/subject). A subject's purchasable
-- "both" option is represented by owning the pair of rows (questions +
-- marking_scheme), not a third file.
-- ---------------------------------------------------------------------------
create type gce_level as enum ('O_LEVEL', 'A_LEVEL');
create type document_type as enum ('QUESTIONS', 'MARKING_SCHEME');

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  level gce_level not null,
  year int not null check (year between 2000 and 2100),
  subject text not null,
  type document_type not null,
  file_path text not null, -- path inside the private 'documents' storage bucket
  price_fcfa int not null check (price_fcfa >= 0),
  created_at timestamptz not null default now(),
  unique (level, year, subject, type)
);

alter table documents enable row level security;

create index if not exists idx_documents_level_year on documents (level, year);

-- ---------------------------------------------------------------------------
-- purchases: what a student has unlocked. A purchase either references a
-- single document, a "questions + marking scheme" pair for one subject
-- (both document ids set), or a full-year bundle (bundle_year/bundle_level
-- set, document ids null).
-- ---------------------------------------------------------------------------
create table if not exists purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users (id) on delete cascade,
  document_id uuid references documents (id) on delete restrict,
  second_document_id uuid references documents (id) on delete restrict, -- marking scheme, when bought alongside questions
  bundle_level gce_level,
  bundle_year int,
  subject text, -- set for single-subject purchases (either doc type), null for bundles
  amount_paid_fcfa int not null check (amount_paid_fcfa >= 0),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'confirmed', 'failed')),
  payment_reference text, -- provider transaction id, filled in on confirmation
  momo_number text not null,
  created_at timestamptz not null default now(),
  confirmed_at timestamptz,
  check (
    (document_id is not null and bundle_level is null and bundle_year is null)
    or (document_id is null and bundle_level is not null and bundle_year is not null)
  )
);

alter table purchases enable row level security;

create index if not exists idx_purchases_user on purchases (user_id);
create index if not exists idx_purchases_status on purchases (payment_status);

-- ---------------------------------------------------------------------------
-- admins: separate from students, for the admin-only dashboard
-- ---------------------------------------------------------------------------
create table if not exists admins (
  id uuid primary key default gen_random_uuid(),
  username text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

alter table admins enable row level security;

-- ---------------------------------------------------------------------------
-- Storage: a private bucket for PDFs. Never made public; files are only ever
-- streamed through the authenticated /api/viewer route, never linked directly.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('documents', 'documents', false)
on conflict (id) do nothing;
