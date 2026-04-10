// path: client/pages/aboutUs.jsx
import Head from 'next/head';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export default function AboutUs({ cards = [] }) {
  const [lang, setLang] = useState('ar');

  useEffect(() => {
    const saved =
      typeof window !== 'undefined' ? localStorage.getItem('siteLang') : null;
    const initial = saved || 'ar';
    setLang(initial);
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
      try {
        localStorage.setItem('siteLang', 'ar');
      } catch {}
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
          <select value={lang} onChange={(e) => setLang(e.target.value)}>
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

              const imagePath = typeof card.image === 'string' ? card.image : '';
              const imageUrl = imagePath
                ? imagePath.startsWith('http')
                  ? imagePath
                  : `${process.env.NEXT_PUBLIC_API_BASE_URL}${imagePath}`
                : '';

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
                    {imageUrl ? (
                      <img src={imageUrl} alt={card.title || 'about-card-image'} />
                    ) : null}
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
        /* path: client/pages/aboutUs.jsx */

        @font-face {
          font-family: 'PingARLocal';
          src: url('/font/PingAR+LT-Regular.otf') format('opentype');
          font-weight: 400;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: 'PingARLocal';
          src: url('/font/PingAR+LT-Medium.otf') format('opentype');
          font-weight: 500;
          font-style: normal;
          font-display: swap;
        }

        @font-face {
          font-family: 'PingARLocal';
          src: url('/font/PingAR+LT-Bold.otf') format('opentype');
          font-weight: 700;
          font-style: normal;
          font-display: swap;
        }

        :root {
          --primary: #18A558;
          --primary-light: #35C46F;
          --primary-dark: #128347;
          --cream: #EEF9F2;

          --about-page-bg: transparent;
          --about-title-color: var(--primary-dark);

          --about-card-border: rgba(24, 165, 88, 0.14);
          --about-card-solid-bg: #ffffff;
          --about-card-bg-image:
            radial-gradient(
              1200px 300px at 100% 0%,
              rgba(24, 165, 88, 0.08),
              transparent 60%
            );
          --about-card-shadow: 0 16px 36px rgba(24, 165, 88, 0.10);

          --about-card-title-color: #163524;
          --about-card-text-color: #476052;

          --about-select-bg: #ffffff;
          --about-select-color: #234433;
          --about-select-border: rgba(24, 165, 88, 0.25);
        }

        /* path: client/pages/aboutUs.jsx - dark mode variables */
        @media (prefers-color-scheme: dark) {
          :root {
            --about-page-bg: transparent;
            --about-title-color: #E8FFF1;

            --about-card-border: rgba(53, 196, 111, 0.22);
            --about-card-solid-bg: #111827;
            --about-card-bg-image:
              radial-gradient(
                1200px 300px at 100% 0%,
                rgba(24, 165, 88, 0.14),
                transparent 60%
              );
            --about-card-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);

            --about-card-title-color: #F3FFF8;
            --about-card-text-color: #C7D7CE;

            --about-select-bg: #111827;
            --about-select-color: #F3FFF8;
            --about-select-border: rgba(53, 196, 111, 0.22);
          }
        }

        /* path: client/pages/aboutUs.jsx - support multiple dark theme implementations */
        html.dark,
        body.dark,
        .dark,
        .dark-mode,
        .theme-dark,
        html[data-theme='dark'],
        body[data-theme='dark'],
        [data-theme='dark'] {
          --about-page-bg: transparent;
          --about-title-color: #E8FFF1;

          --about-card-border: rgba(53, 196, 111, 0.22);
          --about-card-solid-bg: #111827;
          --about-card-bg-image:
            radial-gradient(
              1200px 300px at 100% 0%,
              rgba(24, 165, 88, 0.14),
              transparent 60%
            );
          --about-card-shadow: 0 16px 36px rgba(0, 0, 0, 0.35);

          --about-card-title-color: #F3FFF8;
          --about-card-text-color: #C7D7CE;

          --about-select-bg: #111827;
          --about-select-color: #F3FFF8;
          --about-select-border: rgba(53, 196, 111, 0.22);
        }

        .about-page,
        .about-page * {
          font-family: 'PingARLocal', sans-serif !important;
        }

        .about-page {
          direction: rtl;
          text-align: right;
          background: var(--about-page-bg);
        }

        .hedsid {
          direction: rtl;
          text-align: right;
        }

        .aboutt {
          direction: rtl;
          text-align: right;
        }

        .aboutt h1 {
          color: var(--about-title-color) !important;
        }

        .card_about {
          border: 1px solid var(--about-card-border) !important;
          border-radius: 18px;
          background-color: var(--about-card-solid-bg) !important;
          background-image: var(--about-card-bg-image) !important;
          background-repeat: no-repeat !important;
          box-shadow: var(--about-card-shadow) !important;
          padding: 16px;
          margin-bottom: 18px;

          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          direction: rtl;
          text-align: right;

          transition:
            background-color 0.25s ease,
            background-image 0.25s ease,
            color 0.25s ease,
            border-color 0.25s ease,
            box-shadow 0.25s ease;
        }

        .card_about .text_card {
          flex: 1;
          text-align: right;
        }

        .card_about .text_card h1 {
          color: var(--about-card-title-color) !important;
        }

        .card_about .text_card p {
          color: var(--about-card-text-color) !important;
        }

        .img_card_about {
          width: 250px;
          height: 180px;
          flex-shrink: 0;
          overflow: hidden;
          border-radius: 14px;
        }

        .img_card_about img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .card-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--primary);
          color: #fff !important;
          padding: 10px 14px;
          border-radius: 12px;
          border: 1px solid var(--primary);
          font-weight: 700;
          transition: 0.2s ease;
        }

        .card-btn:hover {
          background: var(--primary-dark);
          border-color: var(--primary-dark);
        }

        .lang-switch {
          display: flex;
          justify-content: flex-end;
          align-items: center;
          width: 100%;
          padding: 12px 0;
          direction: rtl;
          text-align: right;
        }

        .lang-switch select {
          border: 1px solid var(--about-select-border) !important;
          border-radius: 10px;
          padding: 6px 10px;
          background: var(--about-select-bg) !important;
          color: var(--about-select-color) !important;
          direction: rtl;
          text-align: right;
          transition:
            background-color 0.25s ease,
            color 0.25s ease,
            border-color 0.25s ease;
        }

        /* path: client/pages/aboutUs.jsx - explicit forced dark mode rules */
        html.dark .about-page .aboutt h1,
        body.dark .about-page .aboutt h1,
        .dark .about-page .aboutt h1,
        .dark-mode .about-page .aboutt h1,
        .theme-dark .about-page .aboutt h1,
        html[data-theme='dark'] .about-page .aboutt h1,
        body[data-theme='dark'] .about-page .aboutt h1,
        [data-theme='dark'] .about-page .aboutt h1 {
          color: #E8FFF1 !important;
        }

        html.dark .about-page .card_about,
        body.dark .about-page .card_about,
        .dark .about-page .card_about,
        .dark-mode .about-page .card_about,
        .theme-dark .about-page .card_about,
        html[data-theme='dark'] .about-page .card_about,
        body[data-theme='dark'] .about-page .card_about,
        [data-theme='dark'] .about-page .card_about {
          border: 1px solid rgba(53, 196, 111, 0.22) !important;
0.22) !important;
          background-color: #111827 !important;
          background-image:
            radial-gradient(
              1200px 300px at 100% 0%,
              rgba(24, 165, 88, 0.14),
              transparent 60%
            ) !important;
          background-repeat: no-repeat !important;
          box-shadow: 0 16px 36px rgba(0, 0, 0, 0.35) !important;
        }

        html.dark .about-page .card_about .text_card h1,
        body.dark .about-page .card_about .text_card h1,
        .dark .about-page .card_about .text_card h1,
        .dark-mode .about-page .card_about .text_card h1,
        .theme-dark .about-page .card_about .text_card h1,
        html[data-theme='dark'] .about-page .card_about .text_card h1,
        body[data-theme='dark'] .about-page .card_about .text_card h1,
        [data-theme='dark'] .about-page .card_about .text_card h1 {
          color: #F3FFF8 !important;
        }

        html.dark .about-page .card_about .text_card p,
        body.dark .about-page .card_about .text_card p,
        .dark .about-page .card_about .text_card p,
        .dark-mode .about-page .card_about .text_card p,
        .theme-dark .about-page .card_about .text_card p,
        html[data-theme='dark'] .about-page .card_about .text_card p,
        body[data-theme='dark'] .about-page .card_about .text_card p,
        [data-theme='dark'] .about-page .card_about .text_card p {
          color: #C7D7CE !important;
        }

        html.dark .about-page .lang-switch select,
        body.dark .about-page .lang-switch select,
        .dark .about-page .lang-switch select,
        .dark-mode .about-page .lang-switch select,
        .theme-dark .about-page .lang-switch select,
        html[data-theme='dark'] .about-page .lang-switch select,
        body[data-theme='dark'] .about-page .lang-switch select,
        [data-theme='dark'] .about-page .lang-switch select {
          background: #111827 !important;
          color: #F3FFF8 !important;
          border: 1px solid rgba(53, 196, 111, 0.22) !important;
        }

        @media (max-width: 768px) {
          .card_about {
            flex-direction: column-reverse;
            align-items: stretch;
          }

          .img_card_about {
            width: 100%;
            height: 220px;
          }
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
