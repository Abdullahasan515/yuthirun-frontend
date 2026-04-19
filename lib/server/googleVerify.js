// path: lib/server/googleVerify.js
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export async function verifyGoogleEmailMatch({ credential, email }) {
  if (!process.env.GOOGLE_CLIENT_ID) {
    throw new Error('GOOGLE_CLIENT_ID غير موجود');
  }

  if (!credential) {
    return { ok: false, error: 'رمز التحقق من Google غير موجود' };
  }

  const ticket = await client.verifyIdToken({
    idToken: credential,
    audience: process.env.GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  const googleEmail = String(payload?.email || '').trim().toLowerCase();
  const typedEmail = String(email || '').trim().toLowerCase();

  if (!payload?.email_verified) {
    return { ok: false, error: 'البريد الإلكتروني في Google غير موثق' };
  }

  if (!googleEmail || googleEmail !== typedEmail) {
    return { ok: false, error: 'فشل التحقق من المستخدم' };
  }

  return {
    ok: true,
    email: googleEmail,
    sub: payload.sub,
    name: payload.name || '',
    picture: payload.picture || '',
  };
}