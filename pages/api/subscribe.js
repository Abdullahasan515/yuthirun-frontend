// path: pages/api/subscribe.js
import { verifyGoogleEmailMatch } from '../../lib/server/googleVerify';

const BACKEND_API_BASE = (process.env.BACKEND_API_BASE_URL || '').replace(/\/$/, '');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { email, googleCredential } = req.body || {};

    if (!email) {
      return res.status(400).json({ success: false, error: 'البريد الإلكتروني مطلوب' });
    }

    const verified = await verifyGoogleEmailMatch({
      credential: googleCredential,
      email,
    });

    if (!verified.ok) {
      return res.status(401).json({ success: false, error: verified.error });
    }

    const upstream = await fetch(`${BACKEND_API_BASE}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        verifiedGoogle: true,
        googleSub: verified.sub,
      }),
    });

    let data = null;
    try {
      data = await upstream.json();
    } catch {
      data = null;
    }

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        success: false,
        error: data?.error || data?.msg || 'فشل الاشتراك',
      });
    }

    return res.status(200).json({
      success: true,
      msg: data?.msg || 'تم الاشتراك بنجاح',
    });
  } catch (error) {
    console.error('Subscribe API error:', error);
    return res.status(500).json({
      success: false,
      error: 'حدث خطأ داخلي أثناء التحقق أو الاشتراك',
    });
  }
}
