// Server-to-server endpoints for the Weighbridge mobile cloud (never called from a browser or from the app on a plant PC):
//
//   POST /api/v1/mobile/login         owner sign-in check
//   POST /api/v1/mobile/entitlement   facts about a licence (by id, or by key + machine)
//
// Authorised ONLY by `Authorization: Bearer $MOBILE_SERVICE_SECRET` (32+ characters). With the secret unset on this
// deployment the endpoints answer 503, i.e. they stay closed. Every business outcome is HTTP 200 with ok:true/false (or
// found:false), so the caller can tell "wrong password" from "portal unreachable" (a non-200 or no answer at all).
const express = require('express');
const logger = require('../services/logger');
const M = require('../services/mobileLicense');

const router = express.Router();

/** Shared front door: secret first (so strangers learn nothing), then the body. Returns the parsed body, or null once it has replied. */
function frontDoor(req, res, parse) {
  const auth = M.serviceAuth(req);
  if (auth === 'unconfigured') { res.status(503).json({ error: 'Mobile service is not configured.' }); return null; }
  if (auth === 'denied') { res.status(401).json({ error: 'Unauthorized.' }); return null; }
  const body = parse(req.body);
  if (!body) { res.status(400).json({ error: 'Invalid request.' }); return null; }
  return body;
}

router.post('/login', async (req, res) => {
  const body = frontDoor(req, res, M.parseLogin);
  if (!body) return;
  try {
    res.json(await M.mobileLogin(body));
  } catch (err) {
    logger.error(`[mobile:login] failed: ${err.message}`);
    res.status(503).json({ error: 'Service unavailable.' });
  }
});

router.post('/entitlement', async (req, res) => {
  const body = frontDoor(req, res, M.parseEntitlement);
  if (!body) return;
  try {
    const result = await M.getEntitlement(body);
    if (result === 'too-many-attempts') return res.status(429).json({ error: 'Too many attempts.' });
    res.json(result);
  } catch (err) {
    logger.error(`[mobile:entitlement] failed: ${err.message}`);
    res.status(503).json({ error: 'Service unavailable.' });
  }
});

module.exports = router;
