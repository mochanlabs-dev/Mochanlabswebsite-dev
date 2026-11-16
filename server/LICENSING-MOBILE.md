# Licensing: the Mobile app feature

The Weighbridge owner app (repo `mochanlabs-dev/weighbridge-mobile`, a Next.js cloud + phone PWA) is a premium feature
switched on per licence here. This is what the licence portal provides for it.

| Piece | Where |
|---|---|
| Schema (additive, idempotent): `licenses.features text[]`, table `weighbridge.mobile_accounts` | `server/db/licensing-mobile.sql`, applied by `server/scripts/apply-licensing-mobile.js` |
| Server-to-server endpoints for the mobile cloud: `POST /api/v1/mobile/login`, `POST /api/v1/mobile/entitlement` | `server/routes/mobileApp.js`, `server/services/mobileLicense.js` |
| `features` in the **signed** answer of `/api/v1/activate` and `/api/v1/check` | `server/services/licensing.js` (`answer()`) |
| Admin: "Mobile app" box on the licence page (feature tick, create login, reset password, disable, delete) | `server/routes/projects.js`, `web/public/admin/projects.js` |
| Tests | `server/test/licence-mobile.test.js` (needs a throwaway Postgres, see its header) |

## How it behaves

- One mobile login per licence. Username `wbm-xxxxxx`, password `XXXX-XXXX-XXXX` (generated, shown once, only a bcrypt
  hash is stored; case, spaces and dashes typed on a phone do not matter).
- `/api/v1/mobile/*` are authorised ONLY by `Authorization: Bearer $MOBILE_SERVICE_SECRET` (32+ characters, the same value
  on the mobile cloud). With the secret unset they answer 503 (closed). Every business outcome is HTTP 200 with
  `ok:false` / `found:false`, so the caller can tell "wrong password" from "portal down".
- Rate limits: 10 failed phone sign-ins per address and 20 per username in 15 minutes (shared `portal.login_attempts`,
  `mobile:` prefix); 20 unknown keys per address in 10 minutes on the entitlement-by-key call.
- The signed answer gains one field, `features` (e.g. `["mobile"]`). The Weighbridge app ignores unknown fields (0.2.27 and
  earlier) and the new one reads it; the signature is over the exact JSON text, so nothing else about activate/check changed.

## Deploying (order matters)

1. **Schema first** (additive, safe to repeat, can run before the new code is live):
   `DATABASE_URL=... node server/scripts/apply-licensing-mobile.js --dry-run` to see exactly what runs, then without `--dry-run`.
   Until it has run, the new code still serves activate/check normally (`features` comes back as `[]`) and the mobile
   endpoints/admin box answer with errors.
2. **Env**: set `MOBILE_SERVICE_SECRET` (32+ characters, same as the mobile cloud). Generate with
   `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`. `bcryptjs` is a new dependency (root and `server/`).
3. Deploy the code.
4. In the admin: open a licence, tick **Mobile app**, **Create mobile login**, hand the username and password to the customer.

## Local tests

```
npx pglite-server --db=memory:// --port=5434 --max-connections=5        # a throwaway Postgres (any project that has pglite-server)
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:5434/postgres DATABASE_SSL=disable npm run test:licence
```
The test refuses to run unless the database host is local.
