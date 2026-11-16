-- Mobile app support for the licence portal (Weighbridge owner app).
--
-- ADDITIVE and IDEMPOTENT: it only adds a column and a table, changes nothing that already exists, and is safe to
-- run more than once. Apply with:   node server/scripts/apply-licensing-mobile.js   (DATABASE_URL in the environment;
-- add --dry-run to print what would run without running it).
--
-- features: premium switches on a licence, e.g. {mobile}. The portal puts them in the signed answer the Weighbridge app
-- receives, and the mobile cloud checks them on every request.
alter table weighbridge.licenses add column if not exists features text[] not null default '{}';

-- One mobile-app login per licence, created from the licence page in the admin Projects area. The phone sign-in is
-- checked here (the mobile cloud calls /api/v1/mobile/login with a shared secret); the password is stored only as a
-- bcrypt hash and shown once when it is created or reset.
create table if not exists weighbridge.mobile_accounts (
  license_id    uuid primary key references weighbridge.licenses(id) on delete cascade,
  username      text not null,
  password_hash text not null,
  created_at    timestamptz not null default now(),
  last_login_at timestamptz,
  disabled_at   timestamptz
);
create unique index if not exists mobile_accounts_username_idx on weighbridge.mobile_accounts (lower(username));
alter table weighbridge.mobile_accounts enable row level security;
