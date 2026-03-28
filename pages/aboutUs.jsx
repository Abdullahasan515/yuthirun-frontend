// client/pages/aboutUs.jsx
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AboutUs({ cards = [] }) {
  const [lang, setLang] = useState('ar');

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('siteLang') : null;
    const initial = saved || 'ar';
    setLang(initial);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
      try { localStorage.setItem('siteLang', 'ar'); } catch {}
    }
  }, [lang]);

  return (
    <>
      <Head>
        <title>من نحن — يؤثرون للتبرعات</title>
        <meta name="description" content="مشروعنا يؤثرون" />
      </Head>

      <div className="containerr about-page">
        <div className="lang-switch">
          <select value={lang} onChange={(e)=>setLang(e.target.value)}>
            <option value="ar">العربية</option>
            <option value="en">English</option>
            <option value="fr">Français</option>
            <option value="tr">Türkçe</option>
          </select>
        </div>

        <section className="hedsid">
          <h6>
            <Link href="/">الرئيسية</Link> /
          </h6>
          <h6>من نحن</h6>
        </section>

        <section className="aboutt">
          <h1>مشروعنا يؤثرون</h1>

          {cards.length > 0 ? (
            cards.map((card, idx) => {
              let href = '';
              if (card.buttonLink) {
                const raw = card.buttonLink.trim();
                if (raw.startsWith('http') || raw.startsWith('/')) {
                  href = raw;
                } else {
                  href = `/${raw}`;
                }
              }

              const imageUrl = card.image?.startsWith('http')
                ? card.image
                : `${process.env.NEXT_PUBLIC_API_BASE_URL}${card.image}`;

              return (
                <div
                  key={card._id || idx}
                  className={`card_about ${idx > 0 ? `card${idx + 1}` : ''}`}
                >
                  <div className="text_card">
                    <h1>{card.title}</h1>
                    <p>{card.description}</p>
                    {card.buttonText && href && (
                      <Link href={href} className="card-btn">
                        {card.buttonText}
                      </Link>
                    )}
                  </div>

                  <div className="img_card_about">
                    <img src={imageUrl} alt={card.title} />
                  </div>
                </div>
              );
            })
          ) : (
            <p>لم يتم إضافة أي محتوى بعد.</p>
          )}
        </section>
      </div>

      <style jsx global>{`
        @font-face{
          font-family:'PingARLocal';
          src:url('/font/PingAR+LT-Regular.otf') format('opentype');
          font-weight:400;
          font-style:normal;
          font-display:swap;
        }

        @font-face{
          font-family:'PingARLocal';
          src:url('/font/PingAR+LT-Medium.otf') format('opentype');
          font-weight:500;
          font-style:normal;
          font-display:swap;
        }

        @font-face{
          font-family:'PingARLocal';
          src:url('/font/PingAR+LT-Bold.otf') format('opentype');
          font-weight:700;
          font-style:normal;
          font-display:swap;
        }

        :root{
          --primary:#18A558;
          --primary-light:#35C46F;
          --primary-dark:#128347;
          --cream:#EEF9F2;
        }

        .about-page,
        .about-page *{
          font-family:'PingARLocal', sans-serif !important;
        }

        .about-page{
          direction: rtl;
          text-align: right;
        }

        .hedsid{
          direction: rtl;
          text-align: right;
        }

        .aboutt{
          direction: rtl;
          text-align: right;
        }

        .aboutt h1{
          color:var(--primary-dark);
        }

        .card_about{
          border:1px solid rgba(24,165,88,.14);
          border-radius:18px;
          background: radial-gradient(1200px 300px at 100% 0%, rgba(24,165,88,.08), transparent 60%), #fff;
          box-shadow:0 16px 36px rgba(24,165,88,.10);
          padding:16px;
          margin-bottom:18px;

          display:flex;
          align-items:center;
          justify-content:space-between;
          gap:20px;
          direction: rtl;
          text-align: right;
        }

        .card_about .text_card{
          flex:1;
          text-align:right;
        }

        .card_about .text_card h1{
          color:#163524;
        }

        .card_about .text_card p{
          color:#476052;
        }

        .img_card_about{
          width:250px;
          height:180px;
          flex-shrink:0;
          overflow:hidden;
          border-radius:14px;
        }

        .img_card_about img{
          width:100%;
          height:100%;
          object-fit:cover;
          display:block;
        }

        .card-btn{
          display:inline-flex;
          align-items:center;
          gap:8px;
          background:var(--primary);
          color:#fff !important;
          padding:10px 14px;
          border-radius:12px;
          border:1px solid var(--primary);
          font-weight:700;
          transition:.2s ease;
        }

        .card-btn:hover{
          background:var(--primary-dark);
          border-color:var(--primary-dark);
        }

        .lang-switch{
          display:flex;
          justify-content:flex-start;
          padding:12px 0;
          direction: rtl;
        }

        .lang-switch select{
          border:1px solid rgba(24,165,88,.25);
          border-radius:10px;
          padding:6px 10px;
          background:#fff;
          color:#234433;
        }

        @media (prefers-color-scheme: dark){
          .aboutt h1{
            color:#E8FFF1;
          }

          .card_about{
            border:1px solid rgba(53,196,111,.22);
            background:
              radial-gradient(1200px 300px at 100% 0%, rgba(24,165,88,.14), transparent 60%),
              #111827;
            box-shadow:0 16px 36px rgba(0,0,0,.35);
          }

          .card_about .text_card h1{
            color:#F3FFF8;
          }

          .card_about .text_card p{
            color:#C7D7CE;
          }

          .lang-switch select{
            background:#111827;
            color:#F3FFF8;
            border:1px solid rgba(53,196,111,.22);
          }
        }

        html.dark .aboutt h1,
        body.dark .aboutt h1{
          color:#E8FFF1;
        }

        html.dark .card_about,
        body.dark .card_about{
          border:1px solid rgba(53,196,111,.22);
          background:
            radial-gradient(1200px 300px at 100% 0%, rgba(24,165,88,.14), transparent 60%),
            #111827;
          box-shadow:0 16px 36px rgba(0,0,0,.35);
        }

        html.dark .card_about .text_card h1,
        body.dark .card_about .text_card h1{
          color:#F3FFF8;
        }

        html.dark .card_about .text_card p,
        body.dark .card_about .text_card p{
          color:#C7D7CE;
        }

        html.dark .lang-switch select,
        body.dark .lang-switch select{
          background:#111827;
          color:#F3FFF8;
          border:1px solid rgba(53,196,111,.22);
        }

        html:not(.dark) .aboutt h1,
        body:not(.dark) .aboutt h1{
          color:var(--primary-dark);
        }

        html:not(.dark) .card_about,
        body:not(.dark) .card_about{
          border:1px solid rgba(24,165,88,.14);
          background: radial-gradient(1200px 300px at 100% 0%, rgba(24,165,88,.08), transparent 60%), #fff;
          box-shadow:0 16px 36px rgba(24,165,88,.10);
        }

        html:not(.dark) .card_about .text_card h1,
        body:not(.dark) .card_about .text_card h1{
          color:#163524;
        }

        html:not(.dark) .card_about .text_card p,
        body:not(.dark) .card_about .text_card p{
          color:#476052;
        }

        html:not(.dark) .lang-switch select,
        body:not(.dark) .lang-switch select{
          background:#fff;
          color:#234433;
          border:1px solid rgba(24,165,88,.25);
        }
      `}</style>
    </>
  );
}

export async function getServerSideProps(ctx) {
  const API = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  let cards = [];

  try {
    const res = await fetch(`${API}/api/aboutUs`);
    if (res.ok) {
      const data = await res.json();
      cards = Array.isArray(data.cards) ? data.cards : [];
    } else {
      console.error('Failed to fetch aboutUs:', res.status);
    }
  } catch (err) {
    console.error('Error fetching aboutUs:', err);
  }

  return {
    props: { cards },
  };
}
