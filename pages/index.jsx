// path: pages/index.jsx
import { useEffect, useState, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import axios from "axios";
import { useRouter } from "next/router";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
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

function capturePosterFromVideo(src, { targetW = 960, targetH = 540, captureAt = 'auto' } = {}) {
  return new Promise((resolve, reject) => {
    const v = document.createElement('video');
    const sameOrigin = (() => { try { return new URL(src, location.href).origin === location.origin; } catch { return true; } })();
    const proxied = sameOrigin ? src : `/api/media-proxy?u=${encodeURIComponent(src)}`;

    v.crossOrigin = 'anonymous';
    v.preload = 'auto';
    v.muted = true;
    v.defaultMuted = true;
    v.playsInline = true;
    v.setAttribute('muted', '');
    v.setAttribute('playsinline', '');
    v.setAttribute('webkit-playsinline', 'true');
    v.src = proxied;

    const clean = () => {
      try { v.pause(); } catch { }
      v.removeAttribute('src');
      try { v.load(); } catch { }
      v.remove();
    };

    const draw = () => {
      try {
        const vw = v.videoWidth || 1280, vh = v.videoHeight || 720;
        const tr = targetW / targetH, sr = vw / vh;
        const c = document.createElement('canvas');
        c.width = targetW; c.height = targetH;
        const ctx = c.getContext('2d');
        let sx = 0, sy = 0, sw = vw, sh = vh;
        if (sr > tr) { sw = vh * tr; sx = (vw - sw) / 2; }
        else if (sr < tr) { sh = vw / tr; sy = (vh - sh) / 2; }
        ctx.drawImage(v, sx, sy, sw, sh, 0, 0, targetW, targetH);
        resolve(c.toDataURL('image/jpeg', 0.82));
      } catch (e) { reject(e); }
      finally { clean(); }
    };

    const onReady = () => {
      const t = (captureAt === 'auto' && v.duration && isFinite(v.duration))
        ? Math.min(Math.max(v.duration * 0.25, 0.1), Math.max(0, v.duration - 0.2))
        : 0.2;
      const onSeek = () => { v.removeEventListener('seeked', onSeek); draw(); };
      if (v.duration && !isNaN(v.duration)) { v.currentTime = t; v.addEventListener('seeked', onSeek); }
      else { draw(); }
    };

    v.addEventListener('loadeddata', onReady, { once: true });
    v.onerror = (e) => { clean(); reject(e); };
    setTimeout(() => { try { if (!v.readyState) draw(); } catch (e) { reject(e); } }, 4000);
  });
}

function useVideoPosters(items, getUrl, { targetW = 960, targetH = 540, captureAt = 'auto' } = {}) {
  const [map, setMap] = useState({});
  useEffect(() => {
    let cancelled = false;
    (items || []).forEach((it, i) => {
      const id = it?._id || it?.id || String(i);
      if (!id || map[id] || it?.poster || it?.thumbnail || !it?.videoUrl) return;
      capturePosterFromVideo(getUrl(it.videoUrl), { targetW, targetH, captureAt })
        .then(dataUrl => { if (!cancelled && dataUrl) setMap(prev => ({ ...prev, [id]: dataUrl })); })
        .catch(() => { });
    });
    return () => { cancelled = true; };
  }, [items, getUrl, targetW, targetH, captureAt, map]);
  return map;
}

export default function Home() {
  const [activeTab, setActiveTab] = useState('injured');
  const [reels, setReels] = useState([]);
  const [reelsLoading, setReelsLoading] = useState(true);
  const [indexConfig, setIndexConfig] = useState(null);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();
  const [gzLoading, setGzLoading] = useState(true);
  const [gzErr, setGzErr] = useState('');
  const [gzTotals, setGzTotals] = useState({
    killed: 0, injured: 0, children: 0, women: 0,
    massacres: 0, med: 0, civdef: 0, press: 0, lastDate: ''
  });
  const nf = (n) => Number(n || 0).toLocaleString('ar-EG');
  const posters = useVideoPosters(reels, mediaUrl);

  const fetchGz = useCallback(async () => {
    try {
      setGzErr('');
      const res = await fetch('https://data.techforpalestine.org/api/v2/casualties_daily.json', { cache: 'no-store' });
      if (!res.ok) throw new Error();
      const arr = await res.json();
      const mx = (a, b) => Math.max(...arr.map(r => Number(r?.[a] ?? r?.[b] ?? 0) || 0));
      const lastDate = arr.reduce((p, r) => (String(r?.report_date || '') > p ? String(r.report_date) : p), '');
      setGzTotals({
        killed: mx('killed_cum', 'ext_killed_cum'),
        injured: mx('injured_cum', 'ext_injured_cum'),
        children: mx('killed_children_cum', 'ext_killed_children_cum'),
        women: mx('killed_women_cum', 'ext_killed_women_cum'),
        massacres: mx('massacres_cum', 'ext_massacres_cum'),
        med: mx('med_killed_cum', 'ext_med_killed_cum'),
        civdef: mx('civdef_killed_cum', 'ext_civdef_killed_cum'),
        press: mx('press_killed_cum', 'ext_press_killed_cum'),
        lastDate
      });
    } catch {
      setGzErr('تعذّر جلب بيانات غزة.');
    } finally {
      setGzLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const { data } = await axios.get(`${base}/api/reels?limit=12`);
        setReels(Array.isArray(data) ? data : []);
      } catch {
        setReels([]);
      } finally {
        setReelsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    fetchGz();
    const id = setInterval(fetchGz, 180000);
    return () => clearInterval(id);
  }, [fetchGz]);

  useEffect(() => {
    async function fetchData() {
      try {
        const { data } = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/home`);
        setIndexConfig(data.indexConfig);
        setNews(data.news);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleModalClose = () => {
    try { localStorage.setItem("donationModalSeen", "true"); } catch { }
    setShowModal(false);
  };

  useEffect(() => {
    if (!router.isReady) return;
    const force = router.query.showModal === '1';
    if (force) { setShowModal(true); return; }
    try { if (localStorage.getItem("donationModalSeen")) return; } catch { }
    const timer = setTimeout(() => setShowModal(true), 1500);
    return () => clearTimeout(timer);
  }, [router.isReady, router.query.showModal]);

  if (loading) return <p>جارٍ التحميل...</p>;
  if (!indexConfig) return <p>تعذر تحميل بيانات الصفحة الرئيسية.</p>;

  return (
    <>
      <Head><title>يؤثرون</title></Head>

      {showModal && (
        <div
          onClick={handleModalClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 80, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              width: 'min(520px,92vw)',
              background: '#f0fff4',
              borderRadius: '16px',
              padding: '22px',
              boxShadow: '0 20px 60px rgba(0, 100, 0, 0.3)',
              direction: 'rtl',
              textAlign: 'center',
              border: '1px solid #bbf7d0'
            }}
          >
            <button
              onClick={handleModalClose}
              aria-label="إغلاق"
              style={{
                position: 'absolute',
                top: 8,
                insetInlineEnd: 8,
                width: 36,
                height: 36,
                borderRadius: 999,
                border: 'none',
                background: '#16a34a',
                color: '#fff',
                cursor: 'pointer',
                fontSize: 20
              }}
            >
              ×
            </button>

            <div style={{ marginBottom: 12 }}>
              <img src="/images/logo.png" alt="شعار يؤثرون" style={{ height: 64 }} />
            </div>

            <h2 style={{ color: '#065f46' }}>تابع آخر الأخبار</h2>
            <p style={{ color: '#047857' }}>
              أدخل بريدك الإلكتروني ليصلك كل جديد، أو يمكنك إغلاق هذه النافذة.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const email = e.currentTarget.email.value.trim();
                const btn = e.currentTarget.querySelector('button[type="submit"]');
                const old = btn.textContent;

                btn.disabled = true;
                btn.textContent = '...جاري الإرسال';

                try {
                  await fetch("/subscribe", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email })
                  });
                } catch { }

                try {
                  localStorage.setItem("donationModalSeen", "true");
                } catch { }

                btn.disabled = false;
                btn.textContent = old;
                setShowModal(false);
              }}
              style={{ display: 'grid', gap: 10, marginTop: 8 }}
            >
              <input
                type="email"
                name="email"
                placeholder="البريد الإلكتروني"
                required
                style={{
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: '1px solid #86efac',
                  outline: 'none',
                  width: '80%',
                  margin: '0 auto',
                  display: 'block',
                  textAlign: 'center'
                }}
              />

              <button
                type="submit"
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: 'none',
                  background: '#16a34a',
                  color: '#fff',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                إرسال
              </button>
            </form>
          </div>
        </div>
      )}

      <header className="heade">
        <div className="back_heder"></div>
        <div className="slide_heder">
          <Swiper
            modules={[Pagination, Navigation, Autoplay]}
            slidesPerView={1}
            spaceBetween={0}
            pagination={{ clickable: true }}
            navigation
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop
            speed={1300}
            className="swiper mySwiper "
          >
            {indexConfig.slides.map((s, i) => (
              <SwiperSlide key={i} className="swiper-slide centerimgheder" data-duration={s.duration}>
                <img src={mediaUrl(s.imagePath)} alt="slide" />
                <img src={mediaUrl(s.shadowImage)} alt="shadow" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </header>

      <section className="gaza-ribbon" dir="rtl">
        <div className="containerr">
          <div className="gz-wrap">
            <div className="gz-head">
              <div className="ttl"><i className="bx bxs-map-pin" /><span>إحصائيات غزة</span></div>
              <div className="dt">{gzLoading ? 'جارٍ التحديث…' : gzErr ? '—' : `آخر تحديث: ${gzTotals.lastDate}`}</div>
            </div>

            {gzErr ? (
              <div className="gz-err">{gzErr}</div>
            ) : (
              <>
                <div className={`grid ${gzLoading ? 'loading' : ''}`}>
                  <div className="chip"><i className="bx bxs-heart-circle" /><span>الشهداء</span><strong>{nf(gzTotals.killed)}</strong></div>
                  <div className="chip"><i className="bx bxs-first-aid" /><span>الجرحى</span><strong>{nf(gzTotals.injured)}</strong></div>
                  <div className="chip"><i className="bx bxs-baby-carriage" /><span>الأطفال</span><strong>{nf(gzTotals.children)}</strong></div>
                  <div className="chip"><i className="bx bxs-female-sign" /><span>النساء</span><strong>{nf(gzTotals.women)}</strong></div>
                  <div className="chip"><i className="bx bxs-error" /><span>المجازر</span><strong>{nf(gzTotals.massacres)}</strong></div>
                  <div className="chip"><i className="bx bxs-ambulance" /><span>الطبي</span><strong>{nf(gzTotals.med)}</strong></div>
                  <div className="chip"><i className="bx bxs-hard-hat" /><span>الدفاع المدني</span><strong>{nf(gzTotals.civdef)}</strong></div>
                  <div className="chip"><i className="bx bxs-microphone" /><span>الصحفيون</span><strong>{nf(gzTotals.press)}</strong></div>
                </div>

                <div className="gz-card">
                  <div className="gz-header">
                    <div className="gz-date">{gzLoading ? 'جارٍ تحديث البيانات...' : gzErr ? '—' : `آخر تحديث: ${gzTotals.lastDate}`}</div>
                  </div>

                  <div className="gz-tabs" role="tablist" aria-label="إحصائيات">
                    <button
                      role="tab"
                      aria-selected={activeTab === 'injured'}
                      className={`gz-tab ${activeTab === 'injured' ? 'active' : ''}`}
                      onClick={() => setActiveTab('injured')}
                      title="الجرحى والمصابين"
                    >
                      <i className="bx bxs-first-aid-kit" />
                      <span>الجرحى</span>
                    </button>
                    <button
                      role="tab"
                      aria-selected={activeTab === 'killed'}
                      className={`gz-tab ${activeTab === 'killed' ? 'active' : ''}`}
                      onClick={() => setActiveTab('killed')}
                      title="الشهداء"
                    >
                      <i className="bx bxs-heart" />
                      <span>الشهداء</span>
                    </button>
                  </div>

                  <div className="gz-body">
                    {gzErr ? (
                      <div className="gz-error">{gzErr}</div>
                    ) : gzLoading ? (
                      <div className="gz-skeleton"><div className="sk-bar" /></div>
                    ) : (
                      <>
                        {activeTab === 'injured' && (
                          <div className="gz-grid">
                            <div className="gz-metric">
                              <div className="gz-icon"><i className="bx bxs-first-aid" /></div>
                              <div className="gz-val">{nf(gzTotals.injured)}</div>
                              <div className="gz-label">إجمالي الجرحى</div>
                            </div>
                            <div className="gz-mini">
                              <div className="mini-item">
                                <i className="bx bxs-baby-carriage" />
                                <span>الأطفال المتضررون*</span>
                                <strong>{nf(gzTotals.children)}</strong>
                              </div>
                              <div className="mini-item">
                                <i className="bx bxs-female-sign" />
                                <span>النساء المتضررات*</span>
                                <strong>{nf(gzTotals.women)}</strong>
                              </div>
                            </div>
                          </div>
                        )}

                        {activeTab === 'killed' && (
                          <div className="gz-grid">
                            <div className="gz-metric">
                              <div className="gz-icon"><i className="bx bxs-heart-circle" /></div>
                              <div className="gz-val">{nf(gzTotals.killed)}</div>
                              <div className="gz-label">إجمالي الشهداء</div>
                            </div>
                            <div className="gz-mini">
                              <div className="mini-item">
                                <i className="bx bxs-baby-carriage" />
                                <span>الأطفال الشهداء</span>
                                <strong>{nf(gzTotals.children)}</strong>
                              </div>
                              <div className="mini-item">
                                <i className="bx bxs-female-sign" />
                                <span>النساء الشهيدات</span>
                                <strong>{nf(gzTotals.women)}</strong>
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="gz-note">* في بيانات المصدر تُسجّل أعداد الأطفال والنساء ضمن خانة الضحايا.</div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="news">
        <div className="containerr">
          <div className="textnews">
            <h1>انتقل الى قسم الفيدوهات ورؤية  التفاصيل </h1>
            <Link href="/reels" legacyBehavior>
              <a><h6>عرض الكل</h6></a>
            </Link>
          </div>

          <Swiper
            modules={[Pagination, Navigation, Autoplay]}
            slidesPerView={1}
            spaceBetween={20}
            pagination={{ clickable: true, dynamicBullets: true }}
            navigation={false}
            autoplay={{ delay: 5000, disableOnInteraction: false, waitForTransition: true }}
            breakpoints={{ 640: { slidesPerView: 2 }, 1000: { slidesPerView: 3 }, 1400: { slidesPerView: 3 } }}
            loop
            className="mySwiper2 reelsSwiper"
          >
            {(!reelsLoading && reels.length > 0) ? (
              reels.map((item, idx) => {
                const id = item._id || item.id || String(idx);
                const poster = posters[id] || item.poster || item.thumbnail || null;
                return (
                  <SwiperSlide key={id}>
                    <Link href="/reels" legacyBehavior>
                      <a>
                        <div className="card cardNews reelCard">
                          <div className="reel-thumb">
                            <video
                              className="card-img-top"
                              src={mediaUrl(item.videoUrl)}
                              poster={poster || '/images/reel-placeholder.jpg'}
                              preload="metadata"
                              muted
                              playsInline
                              onLoadedMetadata={(e) => {
                                try {
                                  e.currentTarget.currentTime = 0.1;
                                } catch { }
                              }}
                              onSeeked={(e) => {
                                e.currentTarget.pause();
                              }}
                              style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                            />
                          </div>
                          <div className="card-body">
                            <h5 className="card-title">{item.title || 'مقطع قصير'}</h5>
                            <p className="card-text">
                              {item.description || 'شاهد مقاطع قصيرة مؤثرة من يؤثرون'}
                            </p>
                            <p className="badge bg-primary">شاهد الآن</p>
                          </div>
                        </div>
                      </a>
                    </Link>
                  </SwiperSlide>
                );
              })
            ) : (
              <SwiperSlide>
                <Link href="/reels" legacyBehavior>
                  <a>
                    <div className="card cardNews reelCard">
                      <div className="reel-thumb">
                        <img
                          src="/images/reel-placeholder.jpg"
                          className="card-img-top"
                          alt="ريلز"
                        />
                      </div>
                      <div className="card-body">
                        <h5 className="card-title">ريلز يؤثرون</h5>
                        <p className="card-text">اكتشف المقاطع القصيرة الآن</p>
                        <p className="badge bg-primary">شاهد الآن</p>
                      </div>
                    </div>
                  </a>
                </Link>
              </SwiperSlide>
            )}
          </Swiper>
        </div>
      </section>

      {news.map((section, idx) => (
        <section className="news" key={idx}>
          <div className="containerr">
            <div className="textnews">
              <h1>{section.title}</h1>
              {section?.type && (
                <Link href={`/news/type/${section.type}`} legacyBehavior>
                  <a><h6>عرض الكل</h6></a>
                </Link>
              )}
            </div>

            <Swiper
              modules={[Pagination, Navigation, Autoplay]}
              slidesPerView={1}
              spaceBetween={20}
              pagination={{ clickable: true, dynamicBullets: true }}
              navigation={false}
              autoplay={{ delay: 5000, disableOnInteraction: false, waitForTransition: true }}
              breakpoints={{ 640: { slidesPerView: 2 }, 1000: { slidesPerView: 3 }, 1400: { slidesPerView: 3 } }}
              loop
              className="mySwiper2"
            >
              {section.data.length > 0 ? (
                section.data.map((item) => (
                  <SwiperSlide key={item._id}>
                    <Link href={`/news/${item._id}`} legacyBehavior>
                      <a>
                        <div className="card cardNews">
                          <img src={mediaUrl(item.firstImage)} className="card-img-top" alt="صورة الخبر" />
                          <div className="card-body">
                            <h5 className="card-title">{item.title}</h5>
                            <p className="card-text">{item.text}</p>
                            <p className="badge bg-secondary mr-10pc">{item.relativeTime}</p>
                          </div>
                          {item.newsType !== "achievements" && (
                            <>
                              <div className="tt">
                                <div className="tt1">
                                  <p className="gf">مدفوع</p>
                                  <p className="cx true-amount">${item.donatedAmount}</p>
                                </div>
                                <div className="tt1">
                                  <p className="gf ">متبقي</p>
                                  <p className="cx loss-amount">${item.remainingAmount}</p>
                                </div>
                              </div>
                              <div className="tt2">
                                <progress className="progress-shooting-star " value={item.donatedAmount} max={item.amount} />
                                <Link href={{ pathname: '/donate', query: { newsId: item._id } }} legacyBehavior>
                                  <a className="donate-btn-link magic-glow">
                                    <span className="span1"></span>
                                    <span className="span2"></span>
                                    <span className="span3"></span>
                                    <span className="span4"></span>
                                    تبرع ←
                                  </a>
                                </Link>
                              </div>
                            </>
                          )}
                        </div>
                      </a>
                    </Link>
                  </SwiperSlide>
                ))
              ) : (
                <SwiperSlide>
                  <div className="text-center p-3">
                    <p>لا توجد أخبار في هذه الفئة حالياً.</p>
                  </div>
                </SwiperSlide>
              )}
            </Swiper>
          </div>
        </section>
      ))}

      <div className="allcardpro">
        <div className="cardpro crad_achievements">
          <img src="/images/Group 7814.png" alt="مجموع التبرعات" data-tilt data-tilt-scale="1.1" />
          <h3>مجموع التبرعات</h3>
          <div className="con">
            <h2 className="counter">{indexConfig.stats.totalDonations}</h2><h2>+</h2>
          </div>
        </div>
        <div className="cardpro crad_achievements">
          <img src="/images/Group 7815.png" alt="عدد المتبرعين" data-tilt data-tilt-scale="1.1" />
          <h3>المتبرعين</h3>
          <div className="con">
            <h2 className="counter">{indexConfig.stats.donorsCount}</h2><h2>+</h2>
          </div>
        </div>
        <div className="cardpro crad_achievements">
          <img src="/images/Group 7816.png" alt="المهام المنجزة" data-tilt data-tilt-scale="1.1" />
          <h3>مهام منجزة</h3>
          <div className="con">
            <h2 className="counter">{indexConfig.stats.tasksCompleted}</h2><h2>+</h2>
          </div>
        </div>
      </div>

      <style jsx global>{`
/* path: pages/index.jsx - Gaza stats dark mode enhancement */
:root{
  --primary:#18a558;
  --primary-light:#35c46f;
  --primary-dark:#128247;
  --cream:#f3fff8;
  --text:#123222;
  --muted:#4e6b5a;

  --gz-surface:#ffffff;
  --gz-surface-soft:rgba(255,255,255,.88);
  --gz-surface-alt:#f7fff9;
  --gz-border:rgba(20,90,50,.10);
  --gz-shadow:0 10px 26px rgba(20,80,40,.06);
  --gz-shadow-soft:0 8px 20px rgba(20,80,40,.05);
  --gz-tab-bg:rgba(24,165,88,.08);
  --gz-tab-active-bg:#ffffff;
  --gz-skeleton-1:#eef8f1;
  --gz-skeleton-2:#f8fffa;
  --gz-number:#128247;
  --gz-title:#123222;
  --gz-muted:#4e6b5a;
}

html[data-theme='dark']{
  --text:#e7f5ec;
  --muted:#9ab7a6;
  --cream:#0d1711;

  --gz-surface:#121a15;
  --gz-surface-soft:rgba(18,26,21,.92);
  --gz-surface-alt:#0f1512;
  --gz-border:rgba(120,214,153,.16);
  --gz-shadow:0 14px 34px rgba(0,0,0,.32);
  --gz-shadow-soft:0 10px 24px rgba(0,0,0,.28);
  --gz-tab-bg:rgba(24,165,88,.16);
  --gz-tab-active-bg:#18231c;
  --gz-skeleton-1:#17211b;
  --gz-skeleton-2:#223128;
  --gz-number:#86efac;
  --gz-title:#e7f5ec;
  --gz-muted:#9ab7a6;
}

        .vision-hero{
          position:relative;
          min-height:100vh;
          display:flex;
          align-items:center;
          justify-content:center;
          padding: clamp(20px, 4vw, 40px) 0;
          background-image:url('/images/bandera-palestina-ciudad-destruida_1010572-2490.jpg');
          background-size:cover;
          background-position:center;
          background-attachment:fixed;
          overflow:hidden;
          isolation:isolate;
          color:#fff;
          direction:rtl;
        }
        .vh-overlay{
          position:absolute; inset:0;
          background:
            radial-gradient(1200px 380px at 80% -10%, rgba(24,165,88,.25), transparent 60%),
            linear-gradient(180deg, rgba(0,0,0,.55) 0%, rgba(0,0,0,.65) 40%, rgba(0,0,0,.85) 100%);
          mix-blend-multiply;
          z-index:0;
        }
        .vh-vignette{
          position:absolute; inset:-10%;
          background: radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,.65) 100%);
          z-index:0;
          pointer-events:none;
        }
        .vh-noise{
          position:absolute; inset:0; opacity:.07; z-index:1; pointer-events:none;
          background-image:
            url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/></filter><rect width='100%' height='100%' filter='url(%23n)' /></svg>");
          background-size:160px 160px;
          mix-blend:overlay;
        }
        .vh-rays{
          position:absolute; inset:-20%;
          background:
            conic-gradient(from 210deg at 70% 10%, rgba(245,255,248,.24), transparent 25%),
            conic-gradient(from 30deg at 10% 80%, rgba(53,196,111,.18), transparent 30%);
          filter: blur(26px);
          animation: rays 26s linear infinite;
          z-index:0;
          pointer-events:none;
        }
        @keyframes rays { to { transform: rotate(360deg) scale(1.02); } }

        .vh-content{
          position:relative; z-index:2; width:100%;
        }
        .vh-grid{
          display:grid; gap: clamp(16px, 2.6vw, 28px);
          grid-template-columns: 1fr;
          padding-inline: clamp(14px, 4vw, 40px);
        }
        @media(min-width: 900px){
          .vh-grid{ grid-template-columns: repeat(3, 1fr); }
        }

        .glass-card{
          background: linear-gradient(180deg, rgba(26,26,26,.75), rgba(26,26,26,.55));
          border: 1px solid rgba(245,255,248,.22);
          border-radius: 18px;
          padding: clamp(18px, 2.4vw, 26px);
          box-shadow:
            0 18px 50px rgba(0,0,0,.45),
            inset 0 1px 0 rgba(255,255,255,.04);
          backdrop-filter: blur(10px);
          transform: translateZ(0);
          transition: transform .25s ease, box-shadow .25s ease;
        }
        .glass-card:hover{
          transform: translateY(-6px);
          box-shadow:
            0 26px 70px rgba(0,0,0,.55),
            inset 0 1px 0 rgba(255,255,255,.05);
        }

        .vh-title{
          margin:0 0 .4rem;
          font-weight:900;
          font-size: clamp(22px, 3.2vw, 30px);
          letter-spacing:.2px;
          line-height:1.15;
          text-shadow:0 2px 10px rgba(0,0,0,.35);
        }
        .vh-title.cyan{ color:#a7f3d0; }
        .vh-title.emerald{ color:#86efac; }
        .vh-title.amber{ color:#fde68a; }

        .vh-bar{
          height:8px; width:110px; border-radius:999px; margin: 8px 0 16px;
        }
        .vh-bar.cyan{ background: linear-gradient(90deg, #67e8f9, #22d3ee); box-shadow:0 6px 16px rgba(34,211,238,.35); }
        .vh-bar.emerald{ background: linear-gradient(90deg, #6ee7b7, #10b981); box-shadow:0 6px 16px rgba(16,185,129,.35); }
        .vh-bar.amber{ background: linear-gradient(90deg, #fcd34d, #f59e0b); box-shadow:0 6px 16px rgba(245,158,11,.35); }

        .vh-text{
          color:#fff;
          font-weight:800;
          font-size: clamp(16px, 2.2vw, 18px);
          line-height:1.95;
          text-shadow: 0 1px 0 rgba(0,0,0,.4);
        }

        .vh-list{
          display:grid; gap:12px;
          color:#fff;
          font-weight:800;
          font-size: clamp(16px, 2.2vw, 18px);
          line-height:1.95;
          text-align: start;
        }
        .vh-list strong{
          background: linear-gradient(90deg, var(--primary), var(--primary-light));
          -webkit-background-clip: text; background-clip: text; color: transparent;
          font-weight:900;
        }

      .reelsSwiper .swiper-wrapper{
        align-items: stretch;
      }

      .reelsSwiper .swiper-slide{
        height: auto;
        display: flex;
      }

      .reelsSwiper .swiper-slide > a{
        display: flex;
        width: 100%;
        height: 100%;
      }

      .reelCard{
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .reelCard .reel-thumb{
        position: relative;
        width: 100%;
        height: 0;
        padding-top: 56.25%;
        overflow: hidden;
        flex-shrink: 0;
        background: #e9efe9;
        border-top-left-radius: .5rem;
        border-top-right-radius: .5rem;
      }

      .reelCard .card-img-top{
        position: absolute;
        top: 0;
        right: 0;
        bottom: 0;
        left: 0;
        width: 100% !important;
        height: 100% !important;
        object-fit: cover;
        display: block;
      }

      .reelCard .card-body{
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .reelCard .card-title{
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        line-height: 1.6;
        min-height: 3.2em;
      }

      .reelCard .card-text{
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 2;
        overflow: hidden;
        line-height: 1.6;
        min-height: 3.2em;
      }

      .reelCard .badge{
        margin-top: auto;
        width: fit-content;
      }

      .reelCard .playBadge{
        position:absolute; left:50%; top:50%; transform:translate(-50%, -50%);
        width:62px; height:62px; border-radius:50%;
        display:grid; place-items:center; font-size:28px; color:#fff;
        background:rgba(0,0,0,.45); box-shadow:0 10px 24px rgba(0,0,0,.35);
      }

      .gaza-ribbon{
        position:relative;
        z-index:2;
        padding:350px 0 10px;
      }

      .gz-wrap{
        border:1px solid var(--gz-border);
        border-radius:18px;
        padding:12px;
        background:
          radial-gradient(1200px 280px at 100% 0%, rgba(24,165,88,.08), transparent 60%),
          linear-gradient(180deg,var(--gz-surface-alt),var(--gz-surface));
        box-shadow:var(--gz-shadow);
        transition: background .25s ease, border-color .25s ease, box-shadow .25s ease;
      }

      html[data-theme='dark'] .gz-wrap{
        background:
          radial-gradient(1200px 280px at 100% 0%, rgba(53,196,111,.14), transparent 60%),
          linear-gradient(180deg,#101712,#0b100d);
      }

      .gz-head{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        margin-bottom:8px;
      }

      .gz-head .ttl{
        display:flex;
        align-items:center;
        gap:8px;
        font-weight:800;
        color:var(--gz-title);
      }

      .gz-head .ttl i{
        color:var(--primary);
        font-size:20px;
      }

      .gz-head .dt{
        color:var(--gz-muted);
        font-size:12px;
      }

      .gz-err{
        color:var(--gz-number);
        font-weight:700;
        padding:6px 0;
      }

      .grid{
        display:grid;
        gap:10px;
        grid-template-columns: repeat(2, minmax(0,1fr));
      }

      @media (min-width:640px){
        .grid{
          grid-template-columns: repeat(4, minmax(0,1fr));
        }
      }

      @media (min-width:1024px){
        .grid{
          grid-template-columns: repeat(8, minmax(0,1fr));
        }
      }

      .chip{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:8px;
        background:var(--gz-surface-soft);
        border:1px solid var(--gz-border);
        border-radius:14px;
        padding:10px 12px;
        box-shadow:var(--gz-shadow-soft);
        min-height:56px;
        transition: background .25s ease, border-color .25s ease, box-shadow .25s ease;
      }

      .chip i{
        font-size:20px;
        color:var(--primary);
      }

      .chip span{
        color:var(--gz-title);
        font-weight:700;
        font-size:13px;
      }

      .chip strong{
        font-size:18px;
        font-weight:900;
        color:var(--gz-number);
      }

      .grid.loading .chip strong{ opacity:.5 }

      .gaza-stats{ position: relative; padding: 14px 0 18px; }
      .gaza-stats .containerr{ position: relative; z-index: 1; }

      .gz-card{
        background:
          radial-gradient(1200px 300px at 100% 0%, rgba(24,165,88,.10), transparent 60%),
          linear-gradient(180deg,var(--gz-surface),var(--gz-surface-alt));
        border:1px solid var(--gz-border);
        border-radius:18px;
        padding:clamp(14px, 2vw, 20px);
        box-shadow:var(--gz-shadow);
        transition: background .25s ease, border-color .25s ease, box-shadow .25s ease;
      }

      html[data-theme='dark'] .gz-card{
        background:
          radial-gradient(1200px 300px at 100% 0%, rgba(53,196,111,.12), transparent 60%),
          linear-gradient(180deg,#121a15,#0d1410);
      }

      .gz-header{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:12px;
        margin-bottom:10px;
      }

      .gz-title{
        display:flex;
        align-items:center;
        gap:10px;
      }

      .gz-title h3{
        margin:0;
        font-weight:800;
        font-size:clamp(18px,2.6vw,22px);
      }

      .gz-pin{
        font-size:20px;
        color:var(--primary);
      }

      .gz-date{
        color:var(--gz-muted);
        font-size:12px;
      }

      .gz-tabs{
        display:flex;
        gap:8px;
        background:var(--gz-tab-bg);
        padding:6px;
        border-radius:12px;
        width:fit-content;
        margin-inline-start:auto;
        margin-top:6px;
        margin-bottom:10px;
        transition: background .25s ease;
      }

      .gz-tab{
        display:inline-flex;
        align-items:center;
        gap:8px;
        padding:8px 12px;
        border-radius:10px;
        background:transparent;
        border:none;
        cursor:pointer;
        font-weight:700;
        color:var(--gz-title);
        transition: transform .15s ease, background .2s ease, color .2s ease, box-shadow .25s ease;
      }

      .gz-tab i{
        font-size:18px;
        color:var(--primary);
      }

      .gz-tab.active{
        background:var(--gz-tab-active-bg);
        box-shadow:0 6px 18px rgba(20,80,40,.08);
        transform:translateY(-1px);
      }

      html[data-theme='dark'] .gz-tab.active{
        box-shadow:0 8px 20px rgba(0,0,0,.22);
      }

      .gz-tab:not(.active):hover{
        transform:translateY(-1px);
        background:rgba(24,165,88,.06);
      }

      html[data-theme='dark'] .gz-tab:not(.active):hover{
        background:rgba(24,165,88,.10);
      }

      .gz-body{ margin-top:10px }
      .gz-error{ color:var(--gz-number); font-weight:700 }

      .gz-skeleton .sk-bar{
        height:16px; width:160px; border-radius:6px;
        background:linear-gradient(90deg,var(--gz-skeleton-1),var(--gz-skeleton-2),var(--gz-skeleton-1));
        background-size:200% 100%;
        animation: sh 1.2s infinite linear;
      }

      @keyframes sh { to{ background-position: -200% 0 } }

      .gz-grid{
        display:grid;
        gap:14px;
        grid-template-columns:1fr;
      }

      .gz-metric{
        display:flex;
        align-items:center;
        justify-content:space-between;
        background:var(--gz-surface);
        border:1px solid var(--gz-border);
        border-radius:14px;
        padding:14px 16px;
        box-shadow:var(--gz-shadow-soft);
        transition: background .25s ease, border-color .25s ease, box-shadow .25s ease;
      }

      .gz-icon{
        width:44px;
        height:44px;
        border-radius:12px;
        display:grid;
        place-items:center;
        background:linear-gradient(145deg,var(--primary),var(--primary-light));
        color:#fff;
        flex:0 0 44px;
      }

      .gz-val{
        font-size: clamp(22px, 5.5vw, 34px);
        font-weight:900;
        letter-spacing:.3px;
        color:var(--gz-number);
      }

      .gz-label{
        color:var(--gz-muted);
        font-weight:700;
      }

      .gz-mini{
        display:grid;
        gap:10px;
        grid-template-columns: 1fr 1fr;
      }

      .mini-item{
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:10px;
        background:var(--gz-surface);
        border:1px solid var(--gz-border);
        border-radius:12px;
        padding:10px 12px;
        transition: background .25s ease, border-color .25s ease, box-shadow .25s ease;
      }

      .mini-item i{
        font-size:18px;
        color:var(--primary);
      }

      .mini-item span{
        color:var(--gz-title);
        font-weight:600;
        font-size:13px;
      }

      .mini-item strong{
        font-size:clamp(16px,4.5vw,22px);
        color:var(--gz-number);
      }

      .gz-note{
        margin-top:8px;
        color:var(--gz-muted);
        font-size:12px;
      }

      .donate-btn-link{
        background:var(--primary);
        color:#fff !important;
        padding:10px 14px;
        border-radius:12px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:6px;
        text-decoration:none;
      }

      .donate-btn-link:hover{ background:var(--primary-dark) }

.progress-shooting-star{
  accent-color: green;
}

.progress-shooting-star::-webkit-progress-value{
  background: green;
}

.progress-shooting-star::-moz-progress-bar{
  background: green;
}

      .badge.bg-primary{ background-color: var(--primary) !important; }
      .badge.bg-secondary{ background-color: var(--primary-light) !important; }

      @media (min-width: 640px){
        .gz-grid{ grid-template-columns: 1.3fr .7fr; align-items:stretch }
        .gz-metric{ padding:18px 22px }
        .mini-item span{ font-size:14px }
      }

      @media (min-width: 1024px){
        .gz-card{ padding:22px }
        .gz-tabs{ margin-top:0 }
        .gz-grid{ grid-template-columns: 1.2fr .8fr }
      }
      `}</style>
    </>
  );
}
