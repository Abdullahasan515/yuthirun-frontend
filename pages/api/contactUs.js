// path: pages/api/contactUs.js
import nodemailer from 'nodemailer';

const normalizeBaseUrl = (value = '') => String(value || '').replace(/\/$/, '');

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

async function saveMessageInBackend(payload) {
  const backendBase =
    normalizeBaseUrl(process.env.BACKEND_API_BASE_URL) ||
    normalizeBaseUrl(process.env.NEXT_PUBLIC_API_BASE_URL);

  if (!backendBase) return;

  const res = await fetch(`${backendBase}/api/contactUs/store`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-internal-contact-key': process.env.INTERNAL_CONTACT_STORE_KEY || '',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Backend store failed: ${res.status} ${text}`);
  }
}

// path: pages/api/contactUs.js - شعار نصي مطابق للهيدر بدل الصورة
function renderEmailWordmark() {
  return `
    <div style="text-align:center; margin-bottom:20px;">
      <span
        style="
          display:inline-block;
          font-family:'LateefCustom','Ping AR LT','Noto Naskh Arabic','Amiri',serif;
          font-size:52px;
          line-height:1;
          color:#18A558;
          text-decoration:none;
          text-shadow:0 10px 24px rgba(0,0,0,.08);
          white-space:nowrap;
          font-weight:700;
        "
      >
        يؤثرون
      </span>
    </div>
  `;
}

function escapeHtml(value = '') {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed',
    });
  }

  try {
    const { name, email, message, privacyCheck } = req.body || {};

    if (!privacyCheck) {
      return res.status(400).json({
        success: false,
        error: 'يجب الموافقة على سياسة الخصوصية',
      });
    }

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        error: 'يرجى تعبئة جميع الحقول المطلوبة',
      });
    }

    const transporter = createTransporter();

    const receiverEmail =
      process.env.CONTACT_RECEIVER_EMAIL ||
      process.env.MAIL_USER ||
      'support@yuthirun.com';

    const safeName = String(name).trim();
    const safeEmail = String(email).trim();
    const safeMessage = String(message).trim();

    const subject = `رسالة جديدة من ${safeName}`;
    const text = `الاسم: ${safeName}\nالبريد: ${safeEmail}\n\n${safeMessage}`;
    const html = `
      <div dir="rtl" style="background:#f5f5f5; padding:20px; font-family:'Segoe UI', Tahoma, sans-serif;">
        <div style="max-width:600px; margin:auto; background:white; border-radius:8px; padding:30px; box-shadow:0 0 10px rgba(0,0,0,0.05);">
          ${renderEmailWordmark()}

          <div style="font-size:16px; line-height:1.8; color:#333;">
            <p><strong>الاسم:</strong> ${escapeHtml(safeName)}</p>
            <p><strong>البريد الإلكتروني:</strong> ${escapeHtml(safeEmail)}</p>
            <p><strong>الرسالة:</strong></p>
            <div style="white-space: pre-wrap; background: #f8fafc; padding: 12px; border-radius: 8px;">${escapeHtml(safeMessage)}</div>
          </div>

          <hr style="margin:30px 0; border:none; border-top:1px solid #eee;">
          <p style="font-size:13px; color:#888; text-align:center;">
            هذه الرسالة وردت من صفحة تواصل معنا في موقع يؤثرون
          </p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.MAIL_FROM,
      to: receiverEmail,
      replyTo: safeEmail,
      subject,
      text,
      html,
    });

    try {
      await saveMessageInBackend({
        name: safeName,
        email: safeEmail,
        message: safeMessage,
        privacyCheck: true,
      });
    } catch (storeError) {
      console.error('Contact message stored email-sent but DB-save failed:', storeError);
    }

    return res.status(200).json({
      success: true,
      msg: 'تم إرسال رسالتك بنجاح',
    });
  } catch (error) {
    console.error('Vercel contact API error:', error);

    return res.status(500).json({
      success: false,
      error: error.message || 'حدث خطأ أثناء إرسال الرسالة',
    });
  }
}
