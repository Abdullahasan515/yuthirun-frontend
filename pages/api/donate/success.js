// path: pages/api/donate/success.js
function normalizeBaseUrl(value = '') {
  return String(value || '').trim().replace(/\/+$/, '');
}

function getRequestProtocol(req) {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim();

  return forwardedProto || 'https';
}

function getBackendBaseUrl(req) {
  const configuredBase =
    normalizeBaseUrl(process.env.BACKEND_API_BASE_URL) ||
    normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

  if (configuredBase) {
    return configuredBase;
  }

  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').trim();
  if (!host) {
    throw new Error('لم يتم العثور على عنوان الخادم الخلفي');
  }

  const protocol = getRequestProtocol(req);
  const hostname = host.split(':')[0].replace(/^www\./, '');

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}://${host}`;
  }

  const apiHost = hostname.startsWith('api.') ? hostname : `api.${hostname}`;
  return `${protocol}://${apiHost}`;
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed',
    });
  }

  try {
    const sessionId = String(req.query.session_id || '').trim();

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'session_id مطلوب',
      });
    }

    const backendBaseUrl = getBackendBaseUrl(req);

    // path: pages/api/donate/success.js - بروكسي داخلي بين صفحة النجاح والباك الفعلي
    const response = await fetch(
      `${backendBaseUrl}/api/donate/success?session_id=${encodeURIComponent(sessionId)}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      }
    );

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: payload?.error || payload?.msg || 'تعذر جلب بيانات نجاح التبرع',
        details: payload,
      });
    }

    return res.status(200).json({
      success: true,
      ...payload,
    });
  } catch (error) {
    console.error('Next donate success proxy error:', error);

    return res.status(500).json({
      success: false,
      error: error?.message || 'حدث خطأ أثناء معالجة بيانات نجاح التبرع',
    });
  }
}
