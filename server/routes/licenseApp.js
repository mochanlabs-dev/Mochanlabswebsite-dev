// What the Weighbridge app and this server say to each other (unchanged protocol).
//
//   POST /api/v1/activate   first run on a machine: binds the key to that machine
//   POST /api/v1/check      every app start and a few times a day: "am I still licensed?"
//
// Every business outcome (revoked, expired, wrong key, over the machine limit...) is an
// HTTP 200 carrying a SIGNED answer with valid:false and a reason. "No answer at all"
// (network down, 5xx) is treated by the app completely differently from "answered: no",
// and only a signed answer is ever believed. The nonce comes back inside the signed
// payload, so an old "valid" answer can't be replayed.
const express = require('express');
const logger = require('../services/logger');
const { parseAppRequest, tooManyInvalidKeys, processRequest, sign } = require('../services/licensing');

const router = express.Router();

function clientIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  return (fwd ? String(fwd).split(',')[0].trim() : '') || req.headers['x-real-ip'] || req.ip || 'unknown';
}

function handler(kind) {
  return async (req, res) => {
    const body = parseAppRequest(req.body);
    if (!body) return res.status(400).json({ error: 'Invalid request.' });

    const ip = clientIp(req);
    try {
      if (await tooManyInvalidKeys(ip)) return res.status(429).json({ error: 'Too many attempts. Try again later.' });
      const payload = await processRequest(kind, body, ip);
      return res.json(sign(payload));
    } catch (err) {
      logger.error(`[license:${kind}] failed: ${err.message}`);
      // 503, not a signed "invalid": the app must treat this exactly like the server being
      // unreachable (keep its grace period running), not as an answer about the license.
      return res.status(503).json({ error: 'License service unavailable.' });
    }
  };
}

router.post('/activate', handler('activate'));
router.post('/check', handler('check'));

module.exports = router;
