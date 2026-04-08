// path: Components/Footer.jsx
import { useEffect, useState, useMemo } from 'react';

export default function Footer({ footer = {} }) {
  const [subLoading, setSubLoading] = useState(false);
  const [subOk, setSubOk] = useState(false);
  const [subErr, setSubErr] = useState('');

  const safeFooter = useMemo(
    () => ({
      aboutText: footer.aboutText ?? 'نبذة مختصرة عن المنصة.',
      address: footer.address ?? '—',
      phone: footer.phone ?? '—',
      aboutLink: footer.aboutLink ?? '/aboutUs',
      suggestionsUrl: footer.suggestionsUrl ?? '#',
      reportsUrl: footer.reportsUrl ?? '#',
      newsUrl: footer.newsUrl ?? '/news',
      contactUrl: footer.contactUrl ?? '/contactUs',
      socialLinks: Array.isArray(footer.socialLinks) ? footer.socialLinks : [],
      copyrightText:
        footer.copyrightText ?? '© جميع الحقوق محفوظة لمنصة يؤثرون',
    }),
    [footer]
  );

  useEffect(() => {
    const onScroll = () => {
      const btn = document.getElementById('scroll-up');
      if (!btn) return;
      if (window.scrollY >= 350) btn.classList.add('show-scroll');
      else btn.classList.remove('show-scroll');
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const onSubmitSubscribe = async (e) => {
    e.preventDefault();
    setSubErr('');
    const email = e.currentTarget.email.value.trim();
    if (!email) return;
    setSubLoading(true);
    try {
      await fetch('/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSubOk(true);
      try { localStorage.setItem('donationModalSeen', 'true'); } catch {}
      e.currentTarget.reset();
    } catch (err) {
      console.error('Subscription error:', err);
      setSubErr('حدث خطأ أثناء الإرسال. حاول مجددًا.');
    } finally {
      setSubLoading(false);
    }
  };

  return (
    <>
      <footer className="footer" role="contentinfo" aria-label="تذييل الموقع">
        <div className="containerr">
          <div className="allfooter">
            <div className="rightfooter">
              <div className="footer-wordmark">يؤثرون</div>
              <br />
              <br />
              <p>
                "يؤثرون" مشروع إنساني يحمل رسالة دعم ومساندة، ويؤمن أن الأثر الصادق يبدأ بخطوة،
                وأن العطاء يصنع فرقًا حقيقيًا في حياة الآخرين.
              </p>

              <div>
                <h5>موقعنا</h5>

                <div className="point">
                  <div className="imgpoint" aria-hidden>
                    <img src="/images/Group 7813.png" alt="موقع" width="22" height="22" />
                  </div>
                  <p>اليمن</p>
                </div>

                <div className="point">
                  <div className="imgpoint" aria-hidden>
                    <img src="/images/Group 9.png" alt="هاتف" width="22" height="22" />
                  </div>
                  <p className="phone-number" dir="ltr">+967 123 4567</p>
                </div>
              </div>
            </div>

            <div className="leftfooter">
              <div className="subscribe-card">
                <div className="subscribe-head">
                  <i className="bx bx-envelope" aria-hidden />
                  <h5>اشترك بالبريد</h5>
                </div>

                <p className="subscribe-note">أدخل بريدك لتصلك آخر الأخبار وفرص التبرع</p>

                {!subOk ? (
                  <form onSubmit={onSubmitSubscribe} className="subscribe-form">
                    <input type="email" name="email" placeholder="البريد الإلكتروني" required disabled={subLoading} />
                    <button type="submit" disabled={subLoading}>
                      {subLoading && <span className="spinner" aria-hidden />}
                      <span>{subLoading ? '...جاري الإرسال' : 'إرسال'}</span>
                    </button>
                    {subErr && <div className="sub-error">{subErr}</div>}
                  </form>
                ) : (
                  <div className="sub-ok">تم الاشتراك بنجاح ✨</div>
                )}

                <div className="subscribe-terms">بالاشتراك، توافق على استلام رسائل بريدية دورية.</div>
              </div>
            </div>
          </div>
        </div>

        <div className="footerbotn">
          <div className="container">
            <div className="footerall">
              <p>جميع الحقوق محفوظة للموقع الإلكتروني يؤثرون 2025 - 1446هـ</p>
              <div className="alliconbt">
                {(safeFooter.socialLinks.length ? safeFooter.socialLinks : [
                  { platform: 'facebook', url: '#' },
                  { platform: 'twitter', url: '#' },
                  { platform: 'instagram', url: '#' },
                ]).map((link) => (
                  <a key={link.platform} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.platform} title={link.platform}>
                    {link.platform === 'facebook' && <i className="bx bxl-facebook" />}
                    {link.platform === 'twitter' && <i className="bx bxl-twitter" />}
                    {link.platform === 'instagram' && <i className="bx bxl-instagram" />}
                    {link.platform === 'whatsapp' && <i className="bx bxl-whatsapp" />}
                    {link.platform === 'email' && <i className="bx bx-envelope" />}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </footer>

      <a href="#" className="scrollup" id="scroll-up" aria-label="العودة للأعلى">
        <i className="bx bxs-chevron-up-circle" aria-hidden />
      </a>

      <style jsx global>{`
        /* path: Components/Footer.jsx */
        @keyframes spin { to { transform: rotate(360deg); } }

        .spinner{
          width:16px;height:16px;border-radius:50%;
          border:2px solid rgba(255,255,255,.5);border-top-color:#fff;
          display:inline-block;animation:spin .8s linear infinite;margin-inline-end:8px;
        }

        .footer{
          background:
            radial-gradient(circle at top right, rgba(24,165,88,.12), transparent 28%),
            radial-gradient(circle at bottom left, rgba(126,226,168,.12), transparent 24%),
            linear-gradient(180deg, var(--site-surface), var(--site-soft));
          min-height: 260px;
          display: block;
          border-top: 1px solid var(--site-border);
          color: var(--site-text);
        }

        .footer-wordmark{
          display: inline-block;
          font-family: "LateefCustom", "LateefRoundedCustom", serif !important;
          font-size: clamp(2.8rem, 4vw, 4.5rem);
          line-height: 1;
          color: var(--site-primary);
          margin-bottom: 10px;
        }

        .footer .rightfooter h5,
        .footer .leftfooter h5{
          color: var(--site-text);
        }

        .footer .rightfooter p,
        .footer .footerall p,
        .footer .point p,
        .footer .subscribe-terms{
          color: var(--site-text);
        }

        .footer .leftfooter{
          background: linear-gradient(180deg, rgba(255,255,255,.78), rgba(255,255,255,.65));
          border: 1px solid var(--site-border);
          border-radius: 22px;
          padding: 16px;
          box-shadow: 0 14px 34px rgba(0,0,0,.08);
          gap: 22px;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }

        .footer .leftfooter .subscribe-card{
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
          max-width: 100% !important;
        }

        .subscribe-card .subscribe-head{
          display:flex;
          align-items:center;
          gap:10px;
          margin-bottom:6px;
        }

        .subscribe-card .subscribe-head i{
          font-size:24px;
          color: var(--site-primary);
        }

        .subscribe-card .subscribe-note{
          margin-top:0;
          color: var(--site-muted);
        }

        .subscribe-form{
          display:grid;
          gap:10px;
        }

        .subscribe-form input{
          padding:12px 14px;
          border-radius:14px;
          border:1px solid var(--site-border);
          outline:none;
          background: #fff;
          color: var(--site-text);
        }

        .subscribe-form input::placeholder{
          color: var(--site-muted);
        }

        .subscribe-form button{
          padding:12px 14px;
          border-radius:14px;
          border:none;
          background: linear-gradient(135deg, var(--site-primary), var(--site-primary-2));
          color:#fff;
          font-weight:700;
          cursor:pointer;
          display:inline-flex;
          align-items:center;
          justify-content:center;
        }

        .subscribe-form button[disabled]{ cursor:default; opacity:.9; }

        .sub-error{
          color: var(--site-danger);
          font-size:13px;
        }

        .sub-ok{
          background: var(--site-soft);
          border:1px solid var(--site-border);
          color: var(--site-text);
          padding:10px 12px;
          border-radius:14px;
          font-weight:600;
        }

        .imgpoint{
          background: var(--site-soft);
          border:1px solid var(--site-border);
          box-shadow:0 6px 18px rgba(0,0,0,.05) inset;
          width:48px;
          height:48px;
          border-radius:14px;
          display:inline-flex; align-items:center; justify-content:center;
        }

        .imgpoint img{
          filter: invert(42%) sepia(47%) saturate(874%) hue-rotate(94deg) brightness(92%) contrast(92%);
          width:22px;
          height:22px;
        }

        .phone-number{
          direction: ltr;
          unicode-bidi: isolate;
          text-align: left;
          display: inline-block;
        }

        .footerbotn{
          background: transparent;
          border-top: 1px solid var(--site-border);
        }

        .footerbotn .alliconbt a{
          color: var(--site-primary);
          margin-inline-start:8px;
        }

        .footerbotn .alliconbt a:hover{
          color: var(--site-primary-2);
        }

        .scrollup{
          position:fixed;
          bottom:24px;
          inset-inline-end:24px;
          opacity:0;
          visibility:hidden;
          transition:.3s;
        }

        .show-scroll{
          opacity:1;
          visibility:visible;
        }

        [data-theme='dark'] .footer{
          background:
            radial-gradient(circle at top right, rgba(24,165,88,.18), transparent 28%),
            radial-gradient(circle at bottom left, rgba(126,226,168,.12), transparent 24%),
            linear-gradient(180deg, rgba(15,23,42,.98), rgba(17,24,39,.96));
          border-top: 1px solid rgba(255,255,255,.08);
          color: #fff;
        }

        [data-theme='dark'] .footer .rightfooter h5,
        [data-theme='dark'] .footer .leftfooter h5,
        [data-theme='dark'] .footer .rightfooter p,
        [data-theme='dark'] .footer .footerall p,
        [data-theme='dark'] .footer .point p,
        [data-theme='dark'] .footer .subscribe-terms{
          color: rgba(255,255,255,.92);
        }

        /* تعديل مهم: جعل خلفية صندوق الاشتراك تشبه خلفية التذييل الأم في الوضع الليلي */
        [data-theme='dark'] .footer .leftfooter{
          background:
            radial-gradient(circle at top right, rgba(24,165,88,.14), transparent 32%),
            radial-gradient(circle at bottom left, rgba(126,226,168,.08), transparent 26%),
            linear-gradient(180deg, rgba(15,23,42,.72), rgba(17,24,39,.68));
          border: 1px solid rgba(255,255,255,.08);
          box-shadow: 0 14px 34px rgba(0,0,0,.22);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }

        [data-theme='dark'] .subscribe-card .subscribe-note{
          color: rgba(255,255,255,.72);
        }

        [data-theme='dark'] .subscribe-form input{
          background: rgba(15,23,42,.48);
          color: #fff;
          border: 1px solid rgba(255,255,255,.10);
        }

        [data-theme='dark'] .subscribe-form input::placeholder{
          color: rgba(255,255,255,.65);
        }

        [data-theme='dark'] .sub-ok{
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.10);
          color: #fff;
        }

        [data-theme='dark'] .imgpoint{
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.10);
          box-shadow: 0 6px 18px rgba(0,0,0,.18) inset;
        }

        [data-theme='dark'] .footerbotn{
          border-top: 1px solid rgba(255,255,255,.08);
        }

        @media (prefers-color-scheme: dark) {
          :root:not([data-theme='light']) .footer{
            background:
              radial-gradient(circle at top right, rgba(24,165,88,.18), transparent 28%),
              radial-gradient(circle at bottom left, rgba(126,226,168,.12), transparent 24%),
              linear-gradient(180deg, rgba(15,23,42,.98), rgba(17,24,39,.96));
            border-top: 1px solid rgba(255,255,255,.08);
            color: #fff;
          }

          :root:not([data-theme='light']) .footer .rightfooter h5,
          :root:not([data-theme='light']) .footer .leftfooter h5,
          :root:not([data-theme='light']) .footer .rightfooter p,
          :root:not([data-theme='light']) .footer .footerall p,
          :root:not([data-theme='light']) .footer .point p,
          :root:not([data-theme='light']) .footer .subscribe-terms{
            color: rgba(255,255,255,.92);
          }

          /* نفس التعديل هنا لو النظام نفسه دارك وما تم اختيار light يدويًا */
          :root:not([data-theme='light']) .footer .leftfooter{
            background:
              radial-gradient(circle at top right, rgba(24,165,88,.14), transparent 32%),
              radial-gradient(circle at bottom left, rgba(126,226,168,.08), transparent 26%),
              linear-gradient(180deg, rgba(15,23,42,.72), rgba(17,24,39,.68));
            border: 1px solid rgba(255,255,255,.08);
            box-shadow: 0 14px 34px rgba(0,0,0,.22);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
          }

          :root:not([data-theme='light']) .subscribe-card .subscribe-note{
            color: rgba(255,255,255,.72);
          }

          :root:not([data-theme='light']) .subscribe-form input{
            background: rgba(15,23,42,.48);
            color: #fff;
            border: 1px solid rgba(255,255,255,.10);
          }

          :root:not([data-theme='light']) .subscribe-form input::placeholder{
            color: rgba(255,255,255,.65);
          }

          :root:not([data-theme='light']) .sub-ok{
            background: rgba(255,255,255,.06);
            border: 1px solid rgba(255,255,255,.10);
            color: #fff;
          }

          :root:not([data-theme='light']) .imgpoint{
            background: rgba(255,255,255,.06);
            border: 1px solid rgba(255,255,255,.10);
            box-shadow: 0 6px 18px rgba(0,0,0,.18) inset;
          }

          :root:not([data-theme='light']) .footerbotn{
            border-top: 1px solid rgba(255,255,255,.08);
          }
        }
      `}</style>
    </>
  );
}
