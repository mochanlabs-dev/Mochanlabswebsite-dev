-- Mochan Labs license portal. Safe to run more than once (everything is IF NOT EXISTS).
-- Apply with `npm run db:setup` against the `mochanlabs-license` database.
--
--   mochanlabs-license           the database
--   ├─ portal                    the list of applications, plus admin sign-in attempts
--   ├─ weighbridge               licenses, activations and activity log for Weighbridge
--   └─ <next-app>                one schema per application, created when the app is registered
--
-- Every query in the portal names its schema (weighbridge.licenses, portal.apps ...), so nothing depends on
-- search_path or on connection options, both of which poolers like Neon's tend to strip.

create schema if not exists portal;
create schema if not exists weighbridge;

-- ---- portal: the registry of applications this portal manages ---------------------------------------------

create table if not exists portal.apps (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique check (code ~ '^[a-z][a-z0-9-]{1,29}$'),   -- URL slug, and later the license-key prefix
  name        text not null,
  description text not null default '',
  schema_name text not null unique check (schema_name ~ '^[a-z][a-z0-9_]{1,29}$'),   -- this app's own schema in this database
  icon_data   text,                         -- uploaded icon as a data: URL (small PNG/JPEG/WebP/SVG); null = coloured letter tile
  color       text not null default 'blue',
  status      text not null default 'planned' check (status in ('planned', 'live')),
  archived_at timestamptz,
  created_at  timestamptz not null default now()
);

create table if not exists portal.login_attempts (
  id       bigserial primary key,
  at       timestamptz not null default now(),
  username text,
  ip       text,
  success  boolean not null
);
create index if not exists login_attempts_recent_idx on portal.login_attempts (at desc);

-- Weighbridge is the first application.
insert into portal.apps (code, name, description, schema_name, color, status)
values ('weighbridge', 'Weighbridge', 'Weighbridge, billing and compliance software for stone crushers and mines.', 'weighbridge', 'blue', 'live')
on conflict (code) do nothing;

-- ---- weighbridge: licensing for the Weighbridge app --------------------------------------------------------

create table if not exists weighbridge.licenses (
  id            uuid primary key default gen_random_uuid(),
  key           text not null unique,              -- WB-XXXX-XXXX-XXXX-XXXX
  customer_name text not null,
  notes         text,
  max_machines  integer not null default 1 check (max_machines >= 1),
  grace_days    integer not null default 7 check (grace_days >= 0),
  expires_at    timestamptz not null,
  revoked_at    timestamptz,
  created_at    timestamptz not null default now()
);

create table if not exists weighbridge.activations (
  id             uuid primary key default gen_random_uuid(),
  license_id     uuid not null references weighbridge.licenses(id) on delete cascade,
  machine_id     text not null,                    -- hashed on the client; never the raw Windows id
  machine_name   text,
  os             text,
  app_version    text,
  local_ip       text,                             -- as reported by the app
  last_ip        text,                             -- as seen by this server
  activated_at   timestamptz not null default now(),
  last_seen_at   timestamptz not null default now(),
  deactivated_at timestamptz,
  unique (license_id, machine_id)
);
create index if not exists activations_license_idx on weighbridge.activations (license_id);

create table if not exists weighbridge.activity_log (
  id         bigserial primary key,
  at         timestamptz not null default now(),
  actor      text not null,                        -- admin username, 'app', or 'system'
  action     text not null,
  license_id uuid references weighbridge.licenses(id) on delete set null,
  detail     text,
  ip         text
);
create index if not exists activity_log_license_idx on weighbridge.activity_log (license_id, at desc);
create index if not exists activity_log_action_idx on weighbridge.activity_log (action, ip, at desc);

-- Lock everything down for any public REST API on the database: with RLS on and no policies, only direct
-- connections (this server, using DATABASE_URL) can read or write these tables.
alter table portal.apps               enable row level security;
alter table portal.login_attempts     enable row level security;
alter table weighbridge.licenses      enable row level security;
alter table weighbridge.activations   enable row level security;
alter table weighbridge.activity_log  enable row level security;
