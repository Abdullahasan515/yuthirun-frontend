// path: client/pages/src/success.jsx
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useEffect, useState } from 'react';

export default function Success() {
  const router = useRouter();
  const { session_id } = router.query;
  const [loading, setLoading] = useState(true);
  const [donation, setDonation] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!session_id) return;

    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/donate/success?session_id=${session_id}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(data => {
        setDonation(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [session_id]);

  return (
    <>
      <Head>
        <title>شكراً لتبرعك!</title>
      </Head>

      <div className="success-container" style={{ textAlign: 'center', padding: '2rem' }}>
        {/* path: client/pages/src/success.jsx - تم استبدال صورة الشعار بشعار يؤثرون النصي المأخوذ من الهيدر */}
        <div className="brand-wordmark" aria-label="شعار يؤثرون">
          يؤثرون
        </div>

        <div className="quranic-verse" style={{ margin: '1.5rem 0', fontSize: '1.2rem' }}>
          ﴿ وَمَا أَنْفَقْتُمْ مِنْ شَيْءٍ فَهُوَ يُخْلِفُهُ وَهُوَ خَيْرُ الرَّازِقِينَ ﴾
        </div>

        {loading && (
          <div id="status-container">
            <p>جاري التحقق من عملية الدفع...</p>
          </div>
        )}

        {!loading && error && (
          <div id="status-container">
            <p style={{ color: 'red' }}>حدث خطأ أثناء التحقق من الدفع.</p>
          </div>
        )}

        {!loading && donation && (
          <div id="success-message">
            <p style={{ fontSize: '1rem' }}>
              شكرًا لك أخي <strong>{donation.donorName}</strong> لقد تم تأكيد الدفع بنجاح.
              جزاك الله خيرًا وتقبَّل منك.
            </p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .success-container{
          color:#128347;
        }

        .success-container .brand-wordmark{
          display:inline-block;
          margin-bottom: .5rem;
          font-family: "LateefCustom", "Ping AR LT", serif;
          font-size: clamp(3rem, 6vw, 5.2rem);
          line-height: 1;
          color:#18A558;
          text-decoration:none;
          text-shadow: 0 10px 24px rgba(0,0,0,.08);
          white-space: nowrap;
        }

        .success-container .quranic-verse{
          color:#18A558;
        }

        .success-container #status-container p,
        .success-container #success-message p{
          color:#128347;
        }

        .success-container strong{
          color:#18A558;
        }
      `}</style>
    </>
  );
}
