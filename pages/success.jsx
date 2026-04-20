// path: pages/success.jsx
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';

function normalizeText(value, fallback = 'غير محدد') {
  const text = String(value || '').trim();
  return text || fallback;
}

function formatUsd(amount) {
  const numericAmount = Number(amount);

  if (!Number.isFinite(numericAmount)) {
    return 'غير محدد';
  }

  return `${numericAmount.toLocaleString('en-US')} $`;
}

function formatMethod(method) {
  const clean = String(method || '').trim().toLowerCase();

  if (clean === 'stripe') return 'Stripe';
  if (clean === 'paypal') return 'PayPal';
  if (clean === 'visa') return 'Visa';
  if (clean === 'mastercard') return 'MasterCard';

  return normalizeText(method);
}

export default function Success() {
  const router = useRouter();
  const sessionId = typeof router.query.session_id === 'string' ? router.query.session_id : '';

  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailStatus, setEmailStatus] = useState('idle'); // idle | sending | sent | failed

  // path: pages/success.jsx - منع تكرار إرسال البريد عند إعادة الرندر
  const emailTriggeredRef = useRef(false);

  useEffect(() => {
    const storedLang = typeof window !== 'undefined' ? localStorage.getItem('siteLang') : null;
    const lang = storedLang || 'ar';

    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = ['ar', 'he', 'fa', 'ur'].includes(lang) ? 'rtl' : 'ltr';
    }
  }, []);

  useEffect(() => {
    if (!router.isReady || !sessionId) {
      return;
    }

    let cancelled = false;

    async function loadDonationSuccess() {
      try {
        setLoading(true);
        setErrorMessage('');

        // path: pages/success.jsx - جلب بيانات النجاح من API المحلي في Next
        const successRes = await fetch(
          `/api/donate/success?session_id=${encodeURIComponent(sessionId)}`,
          {
            method: 'GET',
            headers: {
              Accept: 'application/json',
            },
          }
        );

        const successData = await successRes.json().catch(() => ({}));

        if (!successRes.ok) {
          throw new Error(
            successData?.error ||
              successData?.msg ||
              'تعذر تحميل بيانات نجاح التبرع من الخادم.'
          );
        }

        if (cancelled) return;

        setDonation(successData);
        setLoading(false);

        // path: pages/success.jsx - إرسال رسالة الشكر بعد نجاح جلب بيانات التبرع
        if (!emailTriggeredRef.current) {
          emailTriggeredRef.current = true;
          setEmailStatus('sending');

          try {
            const emailRes = await fetch('/api/donate/send-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
              },
              body: JSON.stringify({ session_id: sessionId }),
            });

            const emailData = await emailRes.json().catch(() => ({}));

            if (!emailRes.ok || !emailData?.success) {
              throw new Error(
                emailData?.error ||
                  emailData?.msg ||
                  'تعذر إرسال رسالة الشكر إلى البريد الإلكتروني.'
              );
            }

            if (!cancelled) {
              setEmailStatus('sent');
            }
          } catch (mailError) {
            console.error('Donation thank-you email failed:', mailError);

            if (!cancelled) {
              setEmailStatus('failed');
            }
          }
        }
      } catch (error) {
        console.error('Success page load error:', error);

        if (!cancelled) {
          setErrorMessage(error?.message || 'تعذر تحميل بيانات التبرع.');
          setLoading(false);
        }
      }
    }

    loadDonationSuccess();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, sessionId]);

  const donorName = normalizeText(donation?.donorName);
  const donorEmail = normalizeText(donation?.email);
  const donorPhone = normalizeText(donation?.phone);
  const donorCountry = normalizeText(donation?.country);
  const donorState = normalizeText(donation?.state);
  const projectTitle = normalizeText(donation?.projectTitle);
  const paymentMethod = formatMethod(donation?.method);

  return (
    <>
      <Head>
        <title>شكراً لتبرعك</title>
        <meta name="robots" content="noindex,nofollow" />
        <link rel="stylesheet" href="/css/donation-success.css" />
      </Head>

      <div className="success-page">
        <div className="success-card">
          {loading ? (
            <div className="state-box loading">
              <div className="state-icon loading" aria-hidden="true">
                ...
              </div>
              <h1>جاري التحقق من بيانات التبرع...</h1>
              <p>يرجى الانتظار قليلاً حتى يتم تجهيز بيانات العملية.</p>
            </div>
          ) : errorMessage ? (
            <div className="state-box error">
              <div className="state-icon error" aria-hidden="true">
                ✕
              </div>

              <h1>تعذر تحميل بيانات التبرع</h1>
              <p>{errorMessage}</p>

              <div className="actions">
                <button
                  type="button"
                  className="btn primary"
                  onClick={() => router.reload()}
                >
                  إعادة المحاولة
                </button>

                <Link href="/" className="btn ghost">
                  العودة للرئيسية
                </Link>
              </div>
            </div>
          ) : (
            <div className="state-box success">
              <div className="state-icon success" aria-hidden="true">
                ✓
              </div>

              <h1>تمت عملية التبرع بنجاح</h1>
              <p>
                شكراً لك، تم تأكيد العملية بنجاح، وهذه هي البيانات المحفوظة
                للمتبرع.
              </p>

              <div className="details">
                <div className="detail-item">
                  <span>اسم المتبرع</span>
                  <strong>{donorName}</strong>
                </div>

                <div className="detail-item">
                  <span>البريد الإلكتروني</span>
                  <strong>{donorEmail}</strong>
                </div>

                <div className="detail-item">
                  <span>رقم الهاتف</span>
                  <strong>{donorPhone}</strong>
                </div>

                <div className="detail-item">
                  <span>المبلغ</span>
                  <strong>{formatUsd(donation?.amount)}</strong>
                </div>

                <div className="detail-item">
                  <span>الدولة</span>
                  <strong>{donorCountry}</strong>
                </div>

                <div className="detail-item">
                  <span>المنطقة</span>
                  <strong>{donorState}</strong>
                </div>

                <div className="detail-item">
                  <span>المشروع</span>
                  <strong>{projectTitle}</strong>
                </div>

                <div className="detail-item">
                  <span>طريقة الدفع</span>
                  <strong>{paymentMethod}</strong>
                </div>
              </div>

              <div className={`mail-status ${emailStatus}`}>
                {emailStatus === 'idle' && 'سيتم إرسال رسالة الشكر إلى بريدك الإلكتروني.'}
                {emailStatus === 'sending' &&
                  'جاري إرسال رسالة الشكر إلى بريدك الإلكتروني...'}
                {emailStatus === 'sent' &&
                  'تم إرسال رسالة الشكر إلى بريدك الإلكتروني بنجاح.'}
                {emailStatus === 'failed' &&
                  'تم تأكيد التبرع، لكن تعذر إرسال رسالة الشكر بالبريد حالياً.'}
              </div>

              <div className="actions">
                <Link href="/" className="btn primary">
                  العودة للرئيسية
                </Link>

                <Link href="/donate" className="btn ghost">
                  تنفيذ تبرع آخر
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
