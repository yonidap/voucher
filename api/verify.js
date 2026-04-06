export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      ok: false,
      message: 'Method not allowed'
    });
  }

  const { pin } = req.body || {};

  if (!/^\d{8}$/.test(pin || '')) {
    return res.status(400).json({
      ok: false,
      message: 'יש להזין בדיוק 8 ספרות.'
    });
  }

  const accessCode = process.env.GIFT_ACCESS_CODE;
  const voucherCode = process.env.GIFT_VOUCHER_CODE;
  const expiry = process.env.GIFT_EXPIRY;
  const redeemAt = process.env.GIFT_CVV;

  if (!accessCode) {
    return res.status(500).json({
      ok: false,
      message: 'חסר GIFT_ACCESS_CODE ב-Vercel'
    });
  }

  if (pin !== accessCode) {
    return res.status(401).json({
      ok: false,
      message: 'הקוד שהוזן שגוי.'
    });
  }

  return res.status(200).json({
    ok: true,
    voucherCode: voucherCode || '',
    expiry: expiry || '',
    redeemAt: redeemAt || ''
  });
}
