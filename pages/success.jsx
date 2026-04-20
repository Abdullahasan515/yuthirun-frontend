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

        // path: pages/success.jsx - الاعتماد على API محلي في Next بدل استدعاء الباك مباشرة من المتصفح
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

        if (cancelled) {
          return;
        }

        setDonation(successData);
        setLoading(false);

        // path: pages/success.jsx - إرسال الشكر بالبريد مرة واحدة فقط بعد نجاح جلب البيانات
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
  const paymentMethod = normalizeText(donation?.method);

  return (
    <>
      <Head>
        <title>شكراً لتبرعك</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <div className="success-page">
        <div className="success-card">
          <div className="success-icon" aria-hidden="true">
            ✓
          </div>

          {loading ? (
            <div className="state-box">
              <h1>جاري التحقق من بيانات التبرع...</h1>
              <p>يرجى الانتظار قليلاً حتى يتم تجهيز بيانات العملية.</p>
            </div>
          ) : errorMessage ? (
            <div className="state-box error">
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
              <h1>تمت عملية التبرع بنجاح</h1>
              <p>
                شكراً لك، تم تأكيد العملية بنجاح ونعرض لك تفاصيل المتبرع كما تم
                حفظها في النظام.
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

      <style jsx global>{`
        /* path: pages/success.jsx - إخفاء الهيدر والفوتر في صفحة النجاح */
        html,
        body {
          margin: 0;
          background: transparent;
        }

        body {
          font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Noto Sans Arabic',
            'Noto Naskh Arabic', Arial, sans-serif;
        }

        header,
        .navbar,
        .site-header,
        footer,
        .site-footer {
          display: none !important;
        }
      `}</style>

      <style jsx>{`
        .success-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background:
            radial-gradient(1200px 320px at 100% 0%, rgba(24, 165, 88, 0.12), transparent 60%),
            linear-gradient(180deg, #f7fff9, #eef9f2);
        }

        .success-card {
          width: 100%;
          max-width: 860px;
          background: #ffffff;
          border: 1px solid rgba(24, 165, 88, 0.14);
          border-radius: 26px;
          box-shadow: 0 20px 48px rgba(24, 165, 88, 0.12);
          padding: 32px;
          text-align: center;
          direction: rtl;
        }

        .success-icon {
          width: 82px;
          height: 82px;
          border-radius: 999px;
          margin: 0 auto 18px;
          display: grid;
          place-items: center;
          font-size: 40px;
          font-weight: 900;
          color: #ffffff;
          background: linear-gradient(135deg, #18a558, #35c46f);
          box-shadow: 0 16px 30px rgba(24, 165, 88, 0.22);
        }

        .state-box h1 {
          margin: 0 0 12px;
          color: #128347;
          font-size: clamp(1.45rem, 3.4vw, 2rem);
        }

        .state-box p {
          margin: 0 0 18px;
          color: #476052;
          line-height: 1.9;
        }

        .details {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin: 24px 0;
          text-align: right;
        }

        .detail-item {
          background: #f6fbf7;
          border: 1px solid rgba(24, 165, 88, 0.12);
          border-radius: 16px;
          padding: 16px;
        }

        .detail-item span {
          display: block;
          margin-bottom: 8px;
          color: #557463;
          font-size: 0.95rem;
        }

        .detail-item strong {
          display: block;
          color: #163524;
          word-break: break-word;
          line-height: 1.7;
        }

        .mail-status {
          margin-top: 8px;
          border-radius: 14px;
          padding: 14px 16px;
          font-weight: 700;
          line-height: 1.8;
        }

        .mail-status.idle,
        .mail-status.sending {
          background: rgba(24, 165, 88, 0.08);
          color: #128347;
        }

        .mail-status.sent {
          background: rgba(24, 165, 88, 0.12);
          color: #128347;
        }

        .mail-status.failed {
          background: rgba(220, 38, 38, 0.08);
          color: #b91c1c;
        }

        .actions {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-top: 24px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 180px;
          padding: 12px 18px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 800;
          transition: 0.2s ease;
          border: none;
          cursor: pointer;
        }

        .btn.primary {
          background: #18a558;
          color: #ffffff;
        }

        .btn.primary:hover {
          background: #128347;
        }

        .btn.ghost {
          background: rgba(24, 165, 88, 0.08);
          color: #128347;
          border: 1px solid rgba(24, 165, 88, 0.16);
        }

        .btn.ghost:hover {
          background: rgba(24, 165, 88, 0.12);
        }

        .error h1 {
          color: #b91c1c;
        }

        @media (max-width: 640px) {
          .success-page {
            padding: 16px;
          }

          .success-card {
            padding: 22px;
          }

          .details {
            grid-template-columns: 1fr;
          }

          .btn {
            width: 100%;
            min-width: 0;
          }
        }
      `}</style>
    </>
  );
}
