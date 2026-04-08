// path: pages/contactUs.jsx
import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay } from 'swiper/modules';
import 'react-toastify/dist/ReactToastify.css';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

const mediaUrl = (u) => {
  if (!u) return u;
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith('/')) return `${API_BASE}${u}`;
  return `${API_BASE}/${u}`;
};

export default function ContactUs() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    message: '',
    privacyCheck: false,
  });
  const [contactData, setContactData] = useState({
    phone: '',
    email: '',
    address: '',
    socialItems: [],
  });
  const [indexConfig, setIndexConfig] = useState(null);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [lang, setLang] = useState('ar');

  useEffect(() => {
    setLang('ar');
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = 'ar';
      document.documentElement.dir = 'rtl';
      try {
        localStorage.setItem('site_lang', 'ar');
      } catch {}
    }
  }, [lang]);

  useEffect(() => {
    async function fetchContactData() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/contactUs`);
        if (!res.ok) {
          throw new Error(`فشل في جلب بيانات التواصل (الحالة: ${res.status})`);
        }
        const data = await res.json();
        setContactData(data);
      } catch (err) {
        console.error('Error fetching contact data:', err);
        setError('فشل في تحميل بيانات التواصل');
      }
    }
    fetchContactData();
  }, []);

  useEffect(() => {
    async function fetchHomeSlider() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/home`);
        if (!res.ok) {
          throw new Error(`فشل في جلب بيانات السلايدر (الحالة: ${res.status})`);
        }
        const data = await res.json();
        setIndexConfig(data.indexConfig || null);
      } catch (err) {
        console.error('Error fetching slider data:', err);
      }
    }
    fetchHomeSlider();
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.privacyCheck) {
      toast.error('يجب الموافقة على سياسة الخصوصية');
      return;
    }
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ''}/api/contactUs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        setError(null);
        setForm({ name: '', email: '', message: '', privacyCheck: false });
      } else {
        throw new Error(data.error || 'حدث خطأ أثناء إرسال الرسالة');
      }
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err.message);
    }
  };

  return (
    <>
      <Head>
        <title>تواصل معنا</title>
      </Head>

      <ToastContainer position="top-center" />

      <div id="contact-page" className="containerr">
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
          <h6>تواصل معنا</h6>
        </section>

        <section className="aboutt">
          <h1>اتصل بنا</h1>

          {error && <div style={{ color: 'red', marginBottom: 20 }}>{error}</div>}
          {success && <div style={{ color: 'green', marginBottom: 20 }}>تم إرسال رسالتك بنجاح</div>}

          <div className="body_cotact">
            <div className="right_contact">
              <form id="contactForm" onSubmit={handleSubmit}>
                <div className="input_name">
                  <input
                    type="text"
                    name="name"
                    placeholder="الاسم كامل"
                    required
                    value={form.name}
                    onChange={handleChange}
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="البريد الإلكتروني"
                    required
                    value={form.email}
                    onChange={handleChange}
                  />
                </div>

                <textarea
                  name="message"
                  rows="6"
                  placeholder="رسالتك"
                  required
                  value={form.message}
                  onChange={handleChange}
                />

                <div className="checkbox_text">
                  <input
                    type="checkbox"
                    id="privacyCheck"
                    name="privacyCheck"
                    className="form-check-input"
                    checked={form.privacyCheck}
                    onChange={handleChange}
                  />
                  <label htmlFor="privacyCheck" className="form-check-label">
                    أوافق على سياسة الخصوصية
                  </label>
                </div>

                <button type="submit" className="btn_donate">
                  إرسال
                </button>
              </form>
            </div>

            <div className="left_contact mini_hero_wrap">
              <div className="mini_hero_slider">
                {indexConfig?.slides?.length ? (
                  <Swiper
                    modules={[Pagination, Navigation, Autoplay]}
                    slidesPerView={1}
                    spaceBetween={0}
                    pagination={{ clickable: true }}
                    navigation
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    loop={indexConfig.slides.length > 1}
                    speed={1300}
                    className="contactMiniSwiper"
                  >
                    {indexConfig.slides.map((s, i) => (
                      <SwiperSlide key={i} className="contactMiniSlide" data-duration={s.duration}>
                        <div className="contactMiniMedia">
                          <img src={mediaUrl(s.imagePath)} alt={`slide-${i + 1}`} />
                          {s.shadowImage ? (
                            <img
                              src={mediaUrl(s.shadowImage)}
                              alt={`shadow-${i + 1}`}
                              className="contactMiniShadow"
                            />
                          ) : null}
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                ) : (
                  <div className="mini_hero_placeholder">
                    <img src="/images/logo.png" alt="يؤثرون" />
                    <p>جارٍ تحميل السلايدر...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>

      <style jsx global>{`
        /* path: pages/contactUs.jsx */
        :root{
          --primary:#7B2C3B;
          --primary-light:#8C3F47;
          --primary-dark:#6A2331;
          --cream:#F5E9E2;
        }

        #contact-page{
          direction: rtl;
          text-align: right;
        }

        #contact-page .hedsid,
        #contact-page .aboutt,
        #contact-page .body_cotact,
        #contact-page .right_contact,
        #contact-page form,
        #contact-page .checkbox_text{
          direction: rtl;
          text-align: right;
        }

        #contact-page .aboutt h1{
          color: var(--primary-dark);
        }

        #contact-page .btn_donate{
          background: var(--primary);
          border: 1px solid var(--primary);
          color: #fff;
          border-radius: 12px;
          padding: 10px 16px;
          font-weight: 800;
          transition: .2s ease;
        }

        #contact-page .btn_donate:hover{
          background: var(--primary-dark);
          border-color: var(--primary-dark);
        }

        #contact-page .checkbox_text .form-check-input{
          accent-color: var(--primary);
          border-color: var(--primary-light);
        }

        #contact-page .checkbox_text .form-check-label{
          color:#3b3b3b;
        }

        #contact-page .right_contact input,
        #contact-page .right_contact textarea{
          border:1px solid rgba(123,44,59,.25);
          border-radius:12px;
          width: 100%;
          text-align: right;
          direction: rtl;
          background:#f2f4f1;
          color:#234433;
        }

        #contact-page .right_contact input::placeholder,
        #contact-page .right_contact textarea::placeholder{
          color:#4a8f69;
        }

        #contact-page .right_contact input:focus,
        #contact-page .right_contact textarea:focus{
          outline: none;
          border-color: var(--primary);
          box-shadow: 0 0 0 3px rgba(123,44,59,.12);
        }

        #contact-page .left_contact h1{
          color: var(--primary-dark);
        }

        #contact-page .line_contant{
          height: 4px;
          width: 60px;
          background: linear-gradient(90deg,var(--primary),var(--primary-light));
          border-radius: 8px;
          margin: 10px 0 18px;
        }

        #contact-page .icon_text_contact .imgd{
          width: 46px;
          height: 46px;
          border-radius: 12px;
          background: radial-gradient(240px 80px at 100% 0%, rgba(123,44,59,.15), transparent 60%), #fff;
          border: 1px solid rgba(123,44,59,.2);
          display:flex;
          align-items:center;
          justify-content:center;
          box-shadow: 0 10px 24px rgba(123,44,59,.12);
        }

        #contact-page .icon_text_contact .imgd img{
          filter: invert(16%) sepia(35%) saturate(1494%) hue-rotate(314deg) brightness(90%) contrast(93%);
          width:22px;
          height:22px;
        }

        #contact-page .left_contact a{
          color: var(--primary);
        }

        #contact-page .left_contact a:hover{
          color: var(--primary-dark);
        }

        #contact-page .body_cotact{
          background:
            radial-gradient(1200px 300px at 100% 0%, rgba(123,44,59,.08), transparent 60%),
            linear-gradient(180deg,#ffffff, var(--cream));
          border: 1px solid rgba(123,44,59,.14);
          border-radius: 20px;
          padding: 22px;
          box-shadow: 0 20px 50px rgba(123,44,59,.12);
          display: grid;
          grid-template-columns: 1fr 1.08fr;
          gap: 14px;
          align-items: stretch;
          transition: background .25s ease, border-color .25s ease, box-shadow .25s ease;
        }

        #contact-page .right_contact{
          min-width: 0;
          width: 100%;
        }

        #contact-page .right_contact form{
          width: 100%;
        }

        #contact-page .right_contact .input_name{
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          width: 100%;
        }

        #contact-page .right_contact textarea{
          width: 100%;
          margin-top: 12px;
        }

        @media (max-width: 992px){
          #contact-page .body_cotact{
            grid-template-columns: 1fr;
            padding: 16px;
          }
          #contact-page .right_contact .input_name{
            grid-template-columns: 1fr 1fr;
          }
        }

        @media (max-width: 640px){
          #contact-page .right_contact .input_name{
            grid-template-columns: 1fr;
          }
        }

        #contact-page .lang-switch{
          display:flex;
          justify-content:flex-end;
          align-items:center;
          width:100%;
          padding: 12px 0;
          direction: rtl;
        }

        #contact-page .lang-switch select{
          border:1px solid rgba(123,44,59,.25);
          border-radius:10px;
          padding:6px 10px;
          background:#fff;
          color:#3b3b3b;
          direction: rtl;
          text-align: right;
        }

        #contact-page .mini_hero_wrap{
          min-width: 0;
          width: 100%;
        }

        #contact-page .mini_hero_slider{
          position: relative;
          width: 100%;
          border-radius: 18px;
          overflow: hidden;
          background:
            radial-gradient(240px 120px at 100% 0%, rgba(123,44,59,.16), transparent 60%),
            linear-gradient(180deg, #fff, #f9f2ee);
          border: 1px solid rgba(123,44,59,.14);
          box-shadow: 0 16px 36px rgba(123,44,59,.12);
          min-height: 420px;
          height: 100%;
          -webkit-transform: translateZ(0);
          transform: translateZ(0);
          transition: background .25s ease, border-color .25s ease, box-shadow .25s ease;
        }

        #contact-page .contactMiniSwiper{
          width: 100%;
          height: 100%;
          border-radius: 18px;
          overflow: hidden;
          touch-action: pan-y;
        }

        #contact-page .contactMiniSlide{
          width: 100%;
          height: 420px;
        }

        #contact-page .contactMiniMedia{
          position: relative;
          width: 100%;
          height: 100%;
          overflow: hidden;
          background: #fff;
        }

        #contact-page .contactMiniMedia > img:first-child{
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          -webkit-user-drag: none;
          user-select: none;
        }

        #contact-page .contactMiniShadow{
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          pointer-events: none;
        }

        #contact-page .mini_hero_placeholder{
          min-height: 420px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 18px;
          text-align: center;
          color: var(--primary-dark);
        }

        #contact-page .mini_hero_placeholder img{
          max-width: 120px;
          height: auto;
          display: block;
        }

        #contact-page .mini_hero_placeholder p{
          margin: 0;
          font-weight: 700;
        }

        #contact-page .contactMiniSwiper .swiper-button-next,
        #contact-page .contactMiniSwiper .swiper-button-prev{
          width: 36px;
          height: 36px;
          border-radius: 999px;
          background: rgba(255,255,255,.86);
          box-shadow: 0 8px 18px rgba(0,0,0,.12);
          color: var(--primary-dark);
          backdrop-filter: blur(6px);
        }

        #contact-page .contactMiniSwiper .swiper-button-next:after,
        #contact-page .contactMiniSwiper .swiper-button-prev:after{
          font-size: 14px;
          font-weight: 900;
        }

        #contact-page .contactMiniSwiper .swiper-pagination{
          bottom: 10px !important;
        }

        #contact-page .contactMiniSwiper .swiper-pagination-bullet{
          width: 9px;
          height: 9px;
          background: rgba(255,255,255,.7);
          opacity: 1;
          border: 1px solid rgba(123,44,59,.2);
        }

        #contact-page .contactMiniSwiper .swiper-pagination-bullet-active{
          background: var(--primary);
        }

        @media (min-width: 1200px){
          #contact-page .body_cotact{
            grid-template-columns: 1.03fr 1.12fr;
            gap: 10px;
          }
          #contact-page .mini_hero_slider{
            min-height: 480px;
          }
          #contact-page .contactMiniSlide{
            height: 480px;
          }
          #contact-page .mini_hero_placeholder{
            min-height: 480px;
          }
        }

        @media (min-width: 1440px){
          #contact-page .body_cotact{
            grid-template-columns: 1.08fr 1.12fr;
            gap: 8px;
          }
          #contact-page .mini_hero_slider{
            min-height: 520px;
          }
          #contact-page .contactMiniSlide{
            height: 520px;
          }
          #contact-page .mini_hero_placeholder{
            min-height: 520px;
          }
        }

        @media (max-width: 992px){
          #contact-page .mini_hero_slider{
            min-height: 300px;
          }
          #contact-page .contactMiniSlide{
            height: 300px;
          }
          #contact-page .mini_hero_placeholder{
            min-height: 300px;
          }
        }

        @media (max-width: 640px){
          #contact-page .mini_hero_slider{
            min-height: 260px;
            border-radius: 16px;
          }
          #contact-page .contactMiniSwiper{
            border-radius: 16px;
          }
          #contact-page .contactMiniSlide{
            height: 260px;
          }
          #contact-page .mini_hero_placeholder{
            min-height: 260px;
          }
          #contact-page .contactMiniSwiper .swiper-button-next,
          #contact-page .contactMiniSwiper .swiper-button-prev{
            width: 32px;
            height: 32px;
          }
          #contact-page .contactMiniSwiper .swiper-button-next:after,
          #contact-page .contactMiniSwiper .swiper-button-prev:after{
            font-size: 12px;
          }
        }

        html[data-theme='dark'] #contact-page .aboutt h1,
        body[data-theme='dark'] #contact-page .aboutt h1,
        html.dark #contact-page .aboutt h1,
        body.dark #contact-page .aboutt h1{
          color:#f5f7f6;
        }

        html[data-theme='dark'] #contact-page .body_cotact,
        body[data-theme='dark'] #contact-page .body_cotact,
        html.dark #contact-page .body_cotact,
        body.dark #contact-page .body_cotact{
          background:
            radial-gradient(1200px 300px at 100% 0%, rgba(123,44,59,.18), transparent 60%),
            linear-gradient(180deg, rgba(18,24,22,.94), rgba(10,14,12,.96));
          border: 1px solid rgba(255,255,255,.08);
          box-shadow: 0 22px 54px rgba(0,0,0,.34);
        }

        html[data-theme='dark'] #contact-page .right_contact input,
        html[data-theme='dark'] #contact-page .right_contact textarea,
        body[data-theme='dark'] #contact-page .right_contact input,
        body[data-theme='dark'] #contact-page .right_contact textarea,
        html.dark #contact-page .right_contact input,
        html.dark #contact-page .right_contact textarea,
        body.dark #contact-page .right_contact input,
        body.dark #contact-page .right_contact textarea{
          background: rgba(255,255,255,.06);
          border: 1px solid rgba(255,255,255,.10);
          color: #eef7f1;
        }

        html[data-theme='dark'] #contact-page .right_contact input::placeholder,
        html[data-theme='dark'] #contact-page .right_contact textarea::placeholder,
        body[data-theme='dark'] #contact-page .right_contact input::placeholder,
        body[data-theme='dark'] #contact-page .right_contact textarea::placeholder,
        html.dark #contact-page .right_contact input::placeholder,
        html.dark #contact-page .right_contact textarea::placeholder,
        body.dark #contact-page .right_contact input::placeholder,
        body.dark #contact-page .right_contact textarea::placeholder{
          color: rgba(226,240,230,.70);
        }

        html[data-theme='dark'] #contact-page .checkbox_text .form-check-label,
        body[data-theme='dark'] #contact-page .checkbox_text .form-check-label,
        html.dark #contact-page .checkbox_text .form-check-label,
        body.dark #contact-page .checkbox_text .form-check-label{
          color:#eef7f1;
        }

        html[data-theme='dark'] #contact-page .lang-switch select,
        body[data-theme='dark'] #contact-page .lang-switch select,
        html.dark #contact-page .lang-switch select,
        body.dark #contact-page .lang-switch select{
          background: rgba(255,255,255,.06);
          color:#eef7f1;
          border:1px solid rgba(255,255,255,.10);
        }

        html[data-theme='dark'] #contact-page .mini_hero_slider,
        body[data-theme='dark'] #contact-page .mini_hero_slider,
        html.dark #contact-page .mini_hero_slider,
        body.dark #contact-page .mini_hero_slider{
          background:
            radial-gradient(240px 120px at 100% 0%, rgba(123,44,59,.22), transparent 60%),
            linear-gradient(180deg, rgba(25,31,29,.96), rgba(14,19,17,.98));
          border: 1px solid rgba(255,255,255,.08);
          box-shadow: 0 18px 40px rgba(0,0,0,.30);
        }

        html[data-theme='dark'] #contact-page .mini_hero_placeholder,
        body[data-theme='dark'] #contact-page .mini_hero_placeholder,
        html.dark #contact-page .mini_hero_placeholder,
        body.dark #contact-page .mini_hero_placeholder{
          color:#eef7f1;
        }

        html[data-theme='dark'] #contact-page .contactMiniSwiper .swiper-button-next,
        html[data-theme='dark'] #contact-page .contactMiniSwiper .swiper-button-prev,
        body[data-theme='dark'] #contact-page .contactMiniSwiper .swiper-button-next,
        body[data-theme='dark'] #contact-page .contactMiniSwiper .swiper-button-prev,
        html.dark #contact-page .contactMiniSwiper .swiper-button-next,
        html.dark #contact-page .contactMiniSwiper .swiper-button-prev,
        body.dark #contact-page .contactMiniSwiper .swiper-button-next,
        body.dark #contact-page .contactMiniSwiper .swiper-button-prev{
          background: rgba(18,24,22,.72);
          color:#fff;
          box-shadow: 0 8px 18px rgba(0,0,0,.28);
        }

        html[data-theme='dark'] #contact-page .contactMiniSwiper .swiper-pagination-bullet,
        body[data-theme='dark'] #contact-page .contactMiniSwiper .swiper-pagination-bullet,
        html.dark #contact-page .contactMiniSwiper .swiper-pagination-bullet,
        body.dark #contact-page .contactMiniSwiper .swiper-pagination-bullet{
          background: rgba(255,255,255,.35);
          border: 1px solid rgba(255,255,255,.10);
        }

        html[data-theme='dark'] #contact-page .contactMiniSwiper .swiper-pagination-bullet-active,
        body[data-theme='dark'] #contact-page .contactMiniSwiper .swiper-pagination-bullet-active,
        html.dark #contact-page .contactMiniSwiper .swiper-pagination-bullet-active,
        body.dark #contact-page .contactMiniSwiper .swiper-pagination-bullet-active{
          background: #2dc269;
        }
      `}</style>
    </>
  );
}
