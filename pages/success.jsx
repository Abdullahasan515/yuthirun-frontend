// path: client/pages/src/success.jsx
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;

  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState(null);
  const [error, setError] = useState(false);
  const [emailStatus, setEmailStatus] = useState('idle'); // idle | sending | sent | failed

  // path: client/pages/src/success.jsx - منع إرسال البريد أكثر من مرة واحدة
  const emailTriggeredRef = useRef(false);

  useEffect(() => {
    if (!router.isReady || !session_id) return;

    let cancelled = false;

    async function loadSuccessDataAndSendEmail() {
      try {
        setLoading(true);
        setError(false);

        const successRes = await fetch(
          `${API_BASE}/api/donate/success?session_id=${encodeURIComponent(session_id)}`
        );

        if (!successRes.ok) {
          throw new Error('فشل في جلب بيانات نجاح التبرع');
        }

        const successData = await successRes.json();

        if (cancelled) return;

        setDonation(successData);
        setLoading(false);

        // path: client/pages/src/success.jsx - إرسال رسالة الشكر عبر Vercel API المحلي بدل Railway
        if (!emailTriggeredRef.current) {
          emailTriggeredRef.current = true;
          setEmailStatus('sending');

          try {
            const emailRes = await fetch('/api/donate/send-email', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ session_id }),
            });

            const emailData = await emailRes.json().catch(() => ({}));

            if (!emailRes.ok || !emailData.success) {
              throw new Error(
                emailData.error || emailData.msg || 'فشل في إرسال رسالة الشكر'
              );
            }

            if (!cancelled) {
              setEmailStatus('sent');
            }
          } catch (mailError) {
            console.error('Failed to send thank-you email:', mailError);

            if (!cancelled) {
              setEmailStatus('failed');
            }
          }
        }
      } catch (err) {
        console.error('Success page error:', err);

        if (!cancelled) {
          setError(true);
          setLoading(false);
        }
      }
    }

    loadSuccessDataAndSendEmail();

    return () => {
      cancelled = true;
    };
  }, [router.isReady, session_id]);

  return (
    <>
      <Head>
        <title>شكراً لتبرعك!</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="success-page">
        <div className="success-card">
          {/* path: client/pages/src/success.jsx - شعار نصي مطابق للهيدر */}
          <div className="brand-wordmark" aria-label="شعار يؤثرون">
            يؤثرون
          </div>

          <p className="verse">
            ﴿ مَثَلُ الَّذِينَ يُنْفِقُونَ أَمْوَالَهُمْ فِي سَبِيلِ اللَّهِ
            كَمَثَلِ حَبَّةٍ أَنْبَتَتْ سَبْعَ سَنَابِلَ ﴾
          </p>

          {loading ? (
            <div className="state-box">
              <h1>جاري التحقق من بيانات التبرع...</h1>
              <p>يرجى الانتظار قليلاً</p>
            </div>
          ) : error ? (
            <div className="state-box error">
              <h1>تعذر تحميل بيانات التبرع</h1>
              <p>تمت العملية لكن تعذر عرض التفاصيل من الخادم.</p>

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
              <h1>شكراً لتبرعك ❤️</h1>
              <p>
                تمت العملية بنجاح، ونسأل الله أن يجعل هذا التبرع في ميزان حسناتك.
              </p>

              <div className="details">
                <div className="detail-item">
                  <span>اسم المتبرع</span>
                  <strong>{donation?.donorName || 'غير محدد'}</strong>
                </div>

                <div className="detail-item">
                  <span>البريد الإلكتروني</span>
                  <strong>{donation?.email || 'غير محدد'}</strong>
                </div>

                <div className="detail-item">
                  <span>المبلغ</span>
                  <strong>
                    {donation?.amount
                      ? `${Number(donation.amount).toLocaleString('en-US')}$`
                      : 'غير محدد'}
                  </strong>
                </div>

                <div className="detail-item">
                  <span>الدولة</span>
                  <strong>{donation?.country || 'غير محدد'}</strong>
                </div>
              </div>

              <div className={`mail-status ${emailStatus}`}>
                {emailStatus === 'idle' &&
                  'سيتم إرسال رسالة الشكر إلى بريدك الإلكتروني.'}
                {emailStatus === 'sending' &&
                  'جاري إرسال رسالة الشكر إلى بريدك الإلكتروني...'}
                {emailStatus === 'sent' &&
                  'تم إرسال رسالة الشكر إلى بريدك الإلكتروني بنجاح.'}
                {emailStatus === 'failed' &&
                  'تمت عملية التبرع، لكن تعذر إرسال رسالة الشكر بالبريد حالياً.'}
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

        <style jsx>{`
          .success-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 24px;
            background:
              radial-gradient(
                1200px 300px at 100% 0%,
                rgba(24, 165, 88, 0.12),
                transparent 60%
              ),
              linear-gradient(180deg, #f7fff9, #eef9f2);
          }

          .success-card {
            width: 100%;
            max-width: 760px;
            background: #ffffff;
            border: 1px solid rgba(24, 165, 88, 0.14);
            border-radius: 24px;
            box-shadow: 0 20px 48px rgba(24, 165, 88, 0.12);
            padding: 28px;
            text-align: center;
            direction: rtl;
          }

          .brand-wordmark {
            font-size: clamp(2.8rem, 7vw, 4.8rem);
            line-height: 1;
            color: #18A558;
            font-weight: 800;
            margin-bottom: 14px;
          }

          .verse {
            margin: 0 0 24px;
            color: #476052;
            line-height: 1.9;
            font-size: 1.05rem;
          }

          .state-box h1 {
            margin: 0 0 12px;
            color: #128347;
            font-size: clamp(1.4rem, 3.4vw, 2rem);
          }

          .state-box p {
            margin: 0 0 18px;
            color: #476052;
            line-height: 1.8;
          }

          .details {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 12px;
            margin: 24px 0;
            text-align: right;
          }

          .detail-item {
            background: #f6fbf7;
            border: 1px solid rgba(24, 165, 88, 0.12);
            border-radius: 16px;
            padding: 14px;
          }

          .detail-item span {
            display: block;
            margin-bottom: 8px;
            color: #557463;
            font-size: 0.95rem;
          }

          .detail-item strong {
            color: #163524;
            word-break: break-word;
          }

          .mail-status {
            margin: 18px 0 0;
            border-radius: 14px;
            padding: 14px 16px;
            font-weight: 600;
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
          }

          .btn.primary {
            background: #18A558;
            color: #fff;
            border: none;
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
            .success-card {
              padding: 20px;
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
      </div>
    </>
  );
}
