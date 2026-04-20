// path: pages/api/donate/send-email.js
import nodemailer from 'nodemailer';

function normalizeBaseUrl(value = '') {
  return String(value || '').trim().replace(/\/+$/, '');
}

function normalizeString(value = '') {
  return String(value || '').trim();
}

function escapeHtml(value = '') {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatAmount(amount) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return '0';
  }

  return numericAmount.toLocaleString('en-US');
}

function getRequestProtocol(req) {
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '')
    .split(',')[0]
    .trim();

  return forwardedProto || 'https';
}

function getFrontendBaseUrl(req) {
  const configuredFrontendUrl =
    normalizeBaseUrl(process.env.FRONTEND_URL) ||
    normalizeBaseUrl(process.env.NEXT_PUBLIC_SITE_URL);

  if (configuredFrontendUrl) {
    return configuredFrontendUrl;
  }

  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').trim();
  if (!host) {
    return 'https://yuthirun.com';
  }

  return `${getRequestProtocol(req)}://${host.replace(/^api\./, '')}`;
}

function getBackendBaseUrl(req) {
  const configuredBackendUrl =
    normalizeBaseUrl(process.env.BACKEND_API_BASE_URL) ||
    normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

  if (configuredBackendUrl) {
    return configuredBackendUrl;
  }

  const host = String(req.headers['x-forwarded-host'] || req.headers.host || '').trim();
  if (!host) {
    throw new Error('BACKEND_API_BASE_URL أو NEXT_PUBLIC_API_BASE_URL غير مضبوط');
  }

  const protocol = getRequestProtocol(req);
  const hostname = host.split(':')[0].replace(/^www\./, '');

  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}://${host}`;
  }

  const apiHost = hostname.startsWith('api.') ? hostname : `api.${hostname}`;
  return `${protocol}://${apiHost}`;
}

function createTransporter() {
  if (!process.env.MAIL_HOST || !process.env.MAIL_PORT || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
    throw new Error('بيانات SMTP غير مكتملة: تأكد من MAIL_HOST و MAIL_PORT و MAIL_USER و MAIL_PASS');
  }

  return nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT || 0),
    secure: String(process.env.MAIL_SECURE || '').toLowerCase() === 'true',
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
    connectionTimeout: 15000,
    greetingTimeout: 15000,
    socketTimeout: 15000,
    tls: {
      servername: process.env.MAIL_HOST,
    },
  });
}

// path: pages/api/donate/send-email.js - جلب بيانات التبرع المكتملة من الباك
async function getDonationSuccessData(req, sessionId) {
  const backendBaseUrl = getBackendBaseUrl(req);

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
    throw new Error(
      payload?.error || payload?.msg || `فشل في جلب بيانات التبرع من الباك (الحالة: ${response.status})`
    );
  }

  return payload;
}

// path: pages/api/donate/send-email.js - قالب HTML نظيف لرسالة شكر التبرع
function buildHtmlContent({ donorName, amount, country, projectTitle, frontendUrl }) {
  const cleanFrontendUrl = normalizeBaseUrl(frontendUrl || 'https://yuthirun.com');
  const logoUrl = `${cleanFrontendUrl}/Afaq1.png`;

  return `
    <div dir="rtl" style="background:#f5f7f6; padding:24px; font-family:'Segoe UI',Tahoma,sans-serif; color:#1f2937;">
      <div style="max-width:640px; margin:auto; background:#ffffff; border-radius:16px; padding:32px; box-shadow:0 8px 28px rgba(0,0,0,.06); border:1px solid rgba(24,165,88,.10);">
        <div style="text-align:center; margin-bottom:24px;">
          <img src="${logoUrl}" alt="يؤثرون" style="max-width:150px; height:auto;" />
        </div>

        <h2 style="margin:0 0 16px; color:#128347; text-align:center;">شكراً لتبرعك معنا</h2>

        <div style="font-size:16px; line-height:1.95; color:#334155;">
          <p style="margin:0 0 12px;">السلام عليكم ورحمة الله وبركاته ${escapeHtml(donorName)}،</p>
          <p style="margin:0 0 12px;">
            تم استلام تبرعك بنجاح بقيمة <strong>${formatAmount(amount)} دولارًا أمريكيًا</strong>
            من <strong>${escapeHtml(country)}</strong>.
          </p>
          <p style="margin:0 0 12px;">
            المشروع المرتبط بالتبرع: <strong>${escapeHtml(projectTitle || 'غير محدد')}</strong>.
          </p>
          <p style="margin:0;">
            نشكرك على دعمك الكريم، ونسأل الله أن يجعل هذا العطاء في ميزان حسناتك.
          </p>
        </div>

        <div style="text-align:center; margin-top:28px;">
          <a
            href="${cleanFrontendUrl}"
            style="background:#18a558; color:#ffffff; padding:12px 22px; text-decoration:none; border-radius:10px; font-size:15px; font-weight:700; display:inline-block;"
          >
            زيارة موقع يؤثرون
          </a>
        </div>

        <hr style="margin:28px 0; border:none; border-top:1px solid #e5e7eb;" />

        <p style="font-size:13px; color:#64748b; text-align:center; margin:0;">
          هذه رسالة شكر تلقائية بعد نجاح عملية التبرع.
        </p>
      </div>
    </div>
  `;
}

// path: pages/api/donate/send-email.js - نسخة نصية مرافقة لرسالة الشكر
function buildTextContent({ donorName, amount, country, projectTitle, frontendUrl }) {
  const cleanFrontendUrl = normalizeBaseUrl(frontendUrl || 'https://yuthirun.com');

  return [
    `السلام عليكم ورحمة الله وبركاته ${donorName}`,
    '',
    `تم استلام تبرعك بنجاح بقيمة ${formatAmount(amount)} دولارًا أمريكيًا من ${country}.`,
    `المشروع المرتبط بالتبرع: ${projectTitle || 'غير محدد'}.`,
    'نشكرك على دعمك الكريم، ونسأل الله أن يجعل هذا التبرع في ميزان حسناتك.',
    '',
    `زيارة الموقع: ${cleanFrontendUrl}`,
  ].join('\n');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed',
    });
  }

  try {
    const sessionId = normalizeString(req.body?.session_id || '');

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'session_id مطلوب',
      });
    }

    const donation = await getDonationSuccessData(req, sessionId);

    const donorName = normalizeString(donation?.donorName || 'المتبرع الكريم');
    const donorEmail = normalizeString(donation?.email || '');
    const country = normalizeString(donation?.country || 'غير محدد');
    const projectTitle = normalizeString(donation?.projectTitle || 'غير محدد');
    const amount = Number(donation?.amount || 0);
    const frontendUrl = getFrontendBaseUrl(req);

    if (!donorEmail) {
      return res.status(400).json({
        success: false,
        error: 'لا يوجد بريد إلكتروني محفوظ لهذا التبرع',
      });
    }

    const transporter = createTransporter();
    const subject = 'شكرًا لتبرعك مع يؤثرون';

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || process.env.MAIL_USER,
      to: donorEmail,
      subject,
      text: buildTextContent({
        donorName,
        amount,
        country,
        projectTitle,
        frontendUrl,
      }),
      html: buildHtmlContent({
        donorName,
        amount,
        country,
        projectTitle,
        frontendUrl,
      }),
    });

    console.log('Donation thank-you SMTP result', {
      to: donorEmail,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
      envelope: info.envelope,
    });

    return res.status(200).json({
      success: true,
      msg: 'تم إرسال رسالة الشكر بنجاح',
    });
  } catch (error) {
    console.error('Vercel donate thank-you email error:', error);

    return res.status(500).json({
      success: false,
      error: error?.message || 'حدث خطأ أثناء إرسال رسالة الشكر',
    });
  }
}
