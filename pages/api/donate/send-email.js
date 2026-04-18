// path: pages/api/donate/send-email.js
import nodemailer from 'nodemailer';

function normalizeBaseUrl(value = '') {
  return String(value || '').replace(/\/$/, '');
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

function createTransporter() {
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

// path: pages/api/donate/send-email.js - جلب بيانات التبرع من الباك
async function getDonationSuccessData(sessionId) {
  const backendBase =
    normalizeBaseUrl(process.env.BACKEND_API_BASE_URL) ||
    normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

  if (!backendBase) {
    throw new Error('BACKEND_API_BASE_URL أو NEXT_PUBLIC_API_BASE_URL غير مضبوط في Vercel');
  }

  const res = await fetch(
    `${backendBase}/api/donate/success?session_id=${encodeURIComponent(sessionId)}`
  );

  if (!res.ok) {
    throw new Error(`فشل في جلب بيانات التبرع من الباك (الحالة: ${res.status})`);
  }

  return res.json();
}

// path: pages/api/donate/send-email.js - قالب HTML نظيف وبسيط مثل قالب الإدارة الذي نجح
function buildHtmlContent({ donorName, amount, country, frontendUrl }) {
  const cleanFrontendUrl = normalizeBaseUrl(frontendUrl || 'https://yuthirun.com');
  const logoUrl = `${cleanFrontendUrl}/Afaq1.png`;

  return `
    <div dir="rtl" style="background:#f5f5f5; padding:20px; font-family:'Segoe UI', Tahoma, sans-serif;">
      <div style="max-width:600px; margin:auto; background:white; border-radius:8px; padding:30px; box-shadow:0 0 10px rgba(0,0,0,0.05);">
        <div style="text-align:center; margin-bottom:20px;">
          <img src="${logoUrl}" alt="يؤثرون" style="max-width:150px; border-radius:8px;" />
        </div>

        <div style="font-size:16px; line-height:1.8; color:#333;">
          <p>السلام عليكم ورحمة الله وبركاته ${escapeHtml(donorName)}،</p>

          <p>
            جزاك الله خيرًا على تبرعك بقيمة
            <strong>${amount.toLocaleString('en-US')} دولارًا أمريكيًا</strong>
            من <strong>${escapeHtml(country)}</strong>.
          </p>

          <p>
            نشكرك على دعمك الكريم، ونسأل الله أن يجعل هذا التبرع في ميزان حسناتك.
          </p>
        </div>

        <div style="text-align:center; margin-top:30px;">
          <a
            href="${cleanFrontendUrl}"
            style="background-color:#00a896; color:white; padding:12px 20px; text-decoration:none; border-radius:5px; font-size:15px; display:inline-block;"
          >
            زيارة موقع يؤثرون
          </a>
        </div>

        <hr style="margin:30px 0; border:none; border-top:1px solid #eee;">

        <p style="font-size:13px; color:#888; text-align:center;">
          هذه رسالة شكر تلقائية بعد نجاح عملية التبرع
        </p>
      </div>
    </div>
  `;
}

// path: pages/api/donate/send-email.js - نسخة نصية نظيفة مرافقة
function buildTextContent({ donorName, amount, country, frontendUrl }) {
  const cleanFrontendUrl = normalizeBaseUrl(frontendUrl || 'https://yuthirun.com');

  return [
    `السلام عليكم ورحمة الله وبركاته ${donorName}`,
    '',
    `جزاك الله خيرًا على تبرعك بقيمة ${amount.toLocaleString('en-US')} دولارًا أمريكيًا من ${country}.`,
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
    const { session_id } = req.body || {};

    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: 'session_id مطلوب',
      });
    }

    const donation = await getDonationSuccessData(session_id);

    const donorName = normalizeString(donation?.donorName || 'المتبرع الكريم');
    const donorEmail = normalizeString(donation?.email || '');
    const country = normalizeString(donation?.country || 'غير محدد');
    const amount = Number(donation?.amount || 0);
    const frontendUrl = normalizeString(process.env.FRONTEND_URL || 'https://yuthirun.com');

    if (!donorEmail) {
      return res.status(400).json({
        success: false,
        error: 'لا يوجد بريد إلكتروني محفوظ لهذا التبرع',
      });
    }

    const transporter = createTransporter();

    const subject = 'شكرًا لتبرعك معنا!';
    const html = buildHtmlContent({
      donorName,
      amount,
      country,
      frontendUrl,
    });

    const text = buildTextContent({
      donorName,
      amount,
      country,
      frontendUrl,
    });

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: donorEmail,
      subject,
      text,
      html,
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
