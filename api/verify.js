export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, message: 'Method not allowed' });
  }

  const { pin } = req.body || {};

  if (!/^\\d{8}$/.test(pin || '')) {
    return res.status(400).json({ ok: false, message: 'יש להזין 8 ספרות.' });
  }

  if (pin !== process.env.GIFT_ACCESS_CODE) {
    return res.status(401).json({ ok: false, message: 'קוד שגוי.' });
  }

  return res.status(200).json({
    ok: true,
    voucherCode: process.env.GIFT_VOUCHER_CODE || 'FACTORY54-200-GIFT',
    expiry: process.env.GIFT_EXPIRY || '31/12/2026',
    redeemAt: process.env.GIFT_REDEEM_AT || 'בסניפים ובאתר'
  });
}