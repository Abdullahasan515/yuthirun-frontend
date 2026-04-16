// path: client/pages/src/cancel.jsx
import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';

export default function Cancel() {
  const BG_URL = "/images/bandera-palestina-ciudad-destruida_1010572-2490.jpg";

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('siteLang') : null;
    const auto = typeof navigator !== 'undefined' ? (navigator.language || 'ar') : 'ar';
    const lang = stored || (auto.startsWith('ar') ? 'ar' : 'en');

    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = ['ar', 'he', 'fa', 'ur'].includes(lang) ? 'rtl' : 'ltr';
    }
  }, []);

  return (
    <>
      <Head>
        <title>تم إلغاء العملية</title>
        <meta name="robots" content="noindex" />
      </Head>

      <div className="cancel-wrap">
        <div className="bg" />
        <div className="tint" />

        {/* path: client/pages/src/cancel.jsx - تم استبدال صورة الشعار بشعار يؤثرون النصي المأخوذ من الهيدر */}
        <div className="brand-wordmark logo" aria-label="شعار يؤثرون">
          يؤثرون
        </div>

        <h1 className="headline">تم إلغاء العملية</h1>
        <p className="lead">
          لم يكتمل التبرع. يمكنك المحاولة مرة أخرى، أو الرجوع للرئيسية.
        </p>

        <div className="card">
          <div className="icon">✕</div>
          <p className="msg">لم يتم خصم أي مبلغ.</p>

          <div className="actions">
            <Link href="/" className="btn ghost">الرئيسية</Link>
            <Link href="/donate" className="btn primary">إعادة المحاولة</Link>
          </div>
        </div>
      </div>

      <style jsx global>{`
        :root{
          --brand:#18A558;
          --brand-2:#35C46F;
          --ink:#f7f7f9;
          --ring:rgba(255,255,255,.08);
        }

        html,body{
          background:transparent;
          margin:0;
        }

        body{
          font-family: system-ui, -apple-system, "Segoe UI", Roboto, "Noto Naskh Arabic", "Noto Sans Arabic", Arial;
        }

        header, .navbar, footer, .site-footer {
          display: none !important;
        }
      `}</style>

      <style jsx>{`
        .cancel-wrap{
          position:relative;
          min-height:100vh;
          display:grid;
          place-items:center;
          text-align:center;
          padding:clamp(16px,4vw,28px);
          color:var(--ink);
          isolation:isolate;
        }

        .bg{
          position:absolute;
          inset:0;
          background:url("${BG_URL}") center/cover no-repeat fixed;
          filter:blur(10px);
          transform:scale(1.05);
          z-index:-2;
        }

        .tint{
          position:absolute;
          inset:0;
          background:rgba(0,0,0,.45);
          z-index:-1;
        }

        .logo{
          margin-bottom:.8rem;
        }

        .brand-wordmark{
          display:inline-block;
          font-family: "LateefCustom", "Ping AR LT", serif;
          font-size: clamp(3.2rem, 7vw, 5.4rem);
          line-height: 1;
          color:#ffffff;
          text-shadow:
            0 10px 24px rgba(0,0,0,.45),
            0 0 18px rgba(24,165,88,.18);
          white-space: nowrap;
          filter: drop-shadow(0 10px 20px rgba(0,0,0,.35));
        }

        .headline{
          margin:.2rem 0 .4rem;
          font-size:clamp(1.3rem,3.6vw,1.9rem);
          font-weight:900;
          color:#fff;
        }

        .lead{
          margin:0 0 1.2rem;
          color:#e5e5e7;
          font-size:clamp(1rem,2.5vw,1.05rem);
        }

        .card{
          background:rgba(15,15,16,.9);
          border-radius:18px;
          padding:clamp(18px,3vw,24px);
          border:1px solid var(--ring);
          width:min(600px,94vw);
          box-shadow:0 24px 50px rgba(0,0,0,.45), 0 0 0 1px rgba(255,255,255,.05) inset;
        }

        .icon{
          width:64px;
          height:64px;
          border-radius:50%;
          background:linear-gradient(135deg,#dc2626,#b91c1c);
          margin:0 auto 12px;
          display:grid;
          place-items:center;
          color:#fff;
          font-size:32px;
          font-weight:900;
          box-shadow:0 12px 26px rgba(220,38,38,.25), inset 0 -2px 0 rgba(255,255,255,.18);
        }

        .msg{
          margin:.4rem 0 1rem;
          font-size:1.05rem;
          color:#f3f4f6;
        }

        .actions{
          display:flex;
          gap:12px;
          justify-content:center;
          flex-wrap:wrap;
          margin-top:10px;
        }

        .btn{
          border:0;
          border-radius:12px;
          padding:12px 18px;
          font-weight:800;
          text-decoration:none;
          text-align:center;
          transition:transform .12s ease, filter .12s ease;
        }

        .btn.primary{
          background:linear-gradient(135deg,var(--brand-2),#5dd68a 60%,#baf0cd);
          color:#0b0b0b;
          box-shadow:0 10px 22px rgba(53,196,111,.22);
        }

        .btn.ghost{
          background:rgba(255,255,255,.08);
          color:#fff;
          border:1px solid rgba(255,255,255,.12);
        }

        .btn:hover{
          transform:translateY(-2px);
          filter:brightness(1.04);
        }

        @media(max-width:520px){
          .actions{
            flex-direction:column;
          }

          .btn{
            width:100%;
          }
        }
      `}</style>
    </>
  );
}
