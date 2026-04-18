// path: pages/api/admin/send-bulk-email.js
import nodemailer from 'nodemailer';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb',
    },
  },
};

// path: pages/api/admin/send-bulk-email.js - helper لتطبيع القيم
function normalizeString(value = '') {
  return String(value || '').trim();
}

// path: pages/api/admin/send-bulk-email.js - helper لإزالة التكرار وتنظيف الإيميلات
function normalizeRecipients(input) {
  const list = Array.isArray(input) ? input : [input];

  return [
    ...new Set(
      list
        .map((item) => normalizeString(item).toLowerCase())
        .filter(Boolean)
    ),
  ];
}

// path: pages/api/admin/send-bulk-email.js - إنشاء transporter داخل Vercel
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method Not Allowed',
    });
  }

  try {
    const expectedKey = normalizeString(process.env.ADMIN_BULK_MAILER_KEY);
    const receivedKey = normalizeString(req.headers['x-admin-bulk-mailer-key']);

    if (!expectedKey || receivedKey !== expectedKey) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
    }

    const recipients = normalizeRecipients(req.body?.recipients);
    const subject = normalizeString(req.body?.subject || 'إشعار من يؤثرون');
    const html = String(req.body?.html || '').trim();
    const text = String(req.body?.text || '').trim();

    if (!recipients.length) {
      return res.status(400).json({
        success: false,
        error: 'لا يوجد مستلمون صالحون للإرسال',
      });
    }

    if (!html && !text) {
      return res.status(400).json({
        success: false,
        error: 'محتوى الرسالة مطلوب',
      });
    }

    const transporter = createTransporter();
    const from = process.env.MAIL_FROM;
    const results = [];

    // path: pages/api/admin/send-bulk-email.js - إرسال الرسائل واحدًا واحدًا للحصول على نتيجة دقيقة لكل مستلم
    for (const to of recipients) {
      try {
        const info = await transporter.sendMail({
          from,
          to,
          subject,
          html: html || undefined,
          text: text || undefined,
        });

        results.push({
          to,
          success: true,
          messageId: info.messageId || null,
          accepted: info.accepted || [],
          rejected: info.rejected || [],
          response: info.response || '',
        });
      } catch (error) {
        console.error(`Bulk email send failed for ${to}:`, error);

        results.push({
          to,
          success: false,
          error: error?.message || 'Unknown send error',
        });
      }
    }

    const successCount = results.filter((item) => item.success).length;
    const failedResults = results.filter((item) => !item.success);

    return res.status(200).json({
      success: successCount > 0,
      successCount,
      failedCount: failedResults.length,
      results,
    });
  } catch (error) {
    console.error('Bulk email API fatal error:', error);

    return res.status(500).json({
      success: false,
      error: error?.message || 'حدث خطأ أثناء الإرسال الجماعي',
    });
  }
}
