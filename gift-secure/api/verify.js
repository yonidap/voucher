/**
 * gift-secure/api/verify.js
 *
 * Voucher verification endpoint.
 *
 * Expected request body (JSON):
 *   { "code": "<voucher-code>" }
 *
 * Response (JSON):
 *   { "valid": true,  "value": "$25.00" }   – when the code is valid
 *   { "valid": false, "message": "..."    }   – when the code is invalid/expired
 */

// In-memory store of valid voucher codes.
// Replace with a real database lookup in production.
const VOUCHERS = {
  'GIFT-1234': { value: '$25.00', used: false },
  'GIFT-5678': { value: '$50.00', used: false },
  'GIFT-ABCD': { value: '$10.00', used: true  },
};

/**
 * Verifies a gift voucher code.
 *
 * @param {string} code - The voucher code submitted by the user.
 * @returns {{ valid: boolean, value?: string, message?: string }}
 */
function verifyVoucher(code) {
  if (!code || typeof code !== 'string') {
    return { valid: false, message: 'No code provided.' };
  }

  const voucher = VOUCHERS[code.trim().toUpperCase()];

  if (!voucher) {
    return { valid: false, message: 'Voucher code not found.' };
  }

  if (voucher.used) {
    return { valid: false, message: 'Voucher has already been used.' };
  }

  return { valid: true, value: voucher.value };
}

// ── Node / Express integration ──────────────────────────────────────────────
// Export the helper and Express-compatible handler for use as a module.

/**
 * Express-compatible request handler.
 *
 * Usage:
 *   const { handler } = require('./api/verify');
 *   app.post('/api/verify', express.json(), handler);
 */
module.exports = {
  verifyVoucher,
  handler: function (req, res) {
    const { code } = req.body || {};
    const result = verifyVoucher(code);
    res.status(result.valid ? 200 : 400).json(result);
  },
};

// ── Minimal HTTP server for standalone testing ───────────────────────────────
if (require.main === module) {
  const http = require('http');

  const server = http.createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/api/verify') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', () => {
        try {
          const { code } = JSON.parse(body);
          const result = verifyVoucher(code);
          res.writeHead(result.valid ? 200 : 400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        } catch {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ valid: false, message: 'Invalid JSON.' }));
        }
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Verify API listening on http://localhost:${PORT}/api/verify`);
  });
}
