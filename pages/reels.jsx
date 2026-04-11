// pages/reels.jsx + Grid switch
import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

const mediaUrl = (u) => {
  if (!u) return u;
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith('/')) return `${API_BASE}${u}`;
  return `${API_BASE}/${u}`;
};

// path: pages/reels.jsx - توحيد معرف الريل لضمان فتح الريل الصحيح سواء كانت البيانات ترجع _id أو id
const getReelId = (reel, fallback = '') => {
  if (!reel) return fallback;
  return reel._id || reel.id || fallback;
};

function capturePosterFromVideo(src, { targetW = 960, targetH = 540, captureAt = 'auto' } = {}) {
  return new Promise((resolve, reject) => {
    const v = document.createElement('video');
    const sameOrigin = (() => {
      try {
        return new URL(src, location.href).origin === location.origin;
      } catch {
        return true;
      }
    })();
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
      try {
        v.pause();
      } catch {}
      v.removeAttribute('src');
      try {
        v.load();
      } catch {}
      v.remove();
    };

    const draw = () => {
      try {
        const vw = v.videoWidth || 1280;
        const vh = v.videoHeight || 720;
        const tr = targetW / targetH;
        const sr = vw / vh;

        const c = document.createElement('canvas');
        c.width = targetW;
        c.height = targetH;
        const ctx = c.getContext('2d');

        let sx = 0, sy = 0, sw = vw, sh = vh;
        if (sr > tr) {
          sw = vh * tr;
          sx = (vw - sw) / 2;
        } else if (sr < tr) {
          sh = vw / tr;
          sy = (vh - sh) / 2;
        }

        ctx.drawImage(v, sx, sy, sw, sh, 0, 0, targetW, targetH);
        resolve(c.toDataURL('image/jpeg', 0.82));
      } catch (e) {
        reject(e);
      } finally {
        clean();
      }
    };

    const onReady = () => {
      const t = (captureAt === 'auto' && v.duration && isFinite(v.duration))
        ? Math.min(Math.max(v.duration * 0.25, 0.1), Math.max(0, v.duration - 0.2))
        : 0.2;

      const onSeek = () => {
        v.removeEventListener('seeked', onSeek);
        draw();
      };

      if (v.duration && !isNaN(v.duration)) {
        v.currentTime = t;
        v.addEventListener('seeked', onSeek);
      } else {
        draw();
      }
    };

    v.addEventListener('loadeddata', onReady, { once: true });
    v.onerror = (e) => {
      clean();
      reject(e);
    };

    setTimeout(() => {
      try {
        if (!v.readyState) draw();
      } catch (e) {
        reject(e);
      }
    }, 4000);
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
        .then((dataUrl) => {
          if (!cancelled && dataUrl) {
            setMap((prev) => ({ ...prev, [id]: dataUrl }));
          }
        })
        .catch(() => {});
    });

    return () => {
      cancelled = true;
    };
  }, [items, getUrl, targetW, targetH, captureAt, map]);

  return map;
}

export default function ReelsPage() {
  const router = useRouter();
  const [reels, setReels]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [muted, setMuted]     = useState(false);
  const [viewMode, setViewMode] = useState('reels');
  const [posters, setPosters] = useState({});
  const capturedPosters = useVideoPosters(reels, mediaUrl);

  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };
    setVh();
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);
    return () => {
      window.removeEventListener('resize', setVh);
      window.removeEventListener('orientationchange', setVh);
    };
  }, []);

  useEffect(() => {
    const qMode = typeof router.query.mode === 'string' ? router.query.mode : null;
    if (qMode === 'grid' || qMode === 'reels') setViewMode(qMode);
  }, [router.query.mode]);

  useEffect(() => {
    document.body.classList.add('reels-mode');

    const nav = document.querySelector('.navbar.navbar-expand-lg');
    const prevBgClasses = [];
    let containers = [];
    if (nav) {
      Array.from(nav.classList).forEach(c => { if (/^bg-/.test(c)) prevBgClasses.push(c); });
      if (prevBgClasses.length) nav.classList.remove(...prevBgClasses);
      nav.classList.add('reels-nav-transparent');

      nav.style.setProperty('background', 'transparent', 'important');
      nav.style.setProperty('background-color', 'transparent', 'important');
      nav.style.setProperty('--bs-bg-opacity', '0', 'important');
      nav.style.setProperty('box-shadow', 'none', 'important');
      nav.style.setProperty('backdrop-filter', 'none', 'important');
      nav.style.setProperty('position', 'fixed', 'important');
      nav.style.setProperty('top', '0', 'important');
      nav.style.setProperty('left', '0', 'important');
      nav.style.setProperty('right', '0', 'important');
      nav.style.setProperty('z-index', '70', 'important');

      containers = nav.querySelectorAll(':scope > .container, :scope > .container-fluid');
      containers.forEach(c => {
        c.style.setProperty('max-width', '100vw', 'important');
        c.style.setProperty('width', '100vw', 'important');
        c.style.setProperty('margin', '0', 'important');
        c.style.setProperty('padding-left', 'max(12px, env(safe-area-inset-left))', 'important');
        c.style.setProperty('padding-right', 'max(12px, env(safe-area-inset-right))', 'important');
        c.style.setProperty('background', 'transparent', 'important');
        c.style.setProperty('background-color', 'transparent', 'important');
      });
    }

    return () => {
      document.body.classList.remove('reels-mode');
      if (nav) {
        nav.classList.remove('reels-nav-transparent');
        if (prevBgClasses.length) nav.classList.add(...prevBgClasses);
        ['background','background-color','--bs-bg-opacity','box-shadow','backdrop-filter','position','top','left','right','z-index']
          .forEach(p => nav.style.removeProperty(p));
        containers.forEach(c => {
          ['max-width','width','margin','padding-left','padding-right','background','background-color']
            .forEach(p => c.style.removeProperty(p));
        });
      }
    };
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const res  = await fetchFp(`${base}/api/reels`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!mounted) return;
        const arr = Array.isArray(data) ? data : [];
        setReels(arr);
        const map = {};
        arr.forEach((it) => {
          const id = getReelId(it);
          const p  = it?.poster || it?.thumbnail || '';
          if (id && p) map[id] = p;
        });
        setPosters(map);
      } catch (e) {
        console.error(e);
        if (!mounted) return;
        setError('تعذّر تحميل الريلز من الخادم.');
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  function getReelsFp() {
    try {
      let id = localStorage.getItem('reels_fp');
      if (!id) {
        id = (crypto?.randomUUID?.() || (Date.now().toString(36) + Math.random().toString(36).slice(2)));
        localStorage.setItem('reels_fp', id);
      }
      return id;
    } catch { return 'anon'; }
  }

  function fetchFp(url, opts = {}) {
    const fp = typeof window !== 'undefined' ? getReelsFp() : '';
    return fetch(url, { ...opts, headers: { ...(opts.headers || {}), 'x-reels-fp': fp } });
  }

  const gridItems = useMemo(() => {
    return (reels || []).map((r, i) => {
      const id = getReelId(r, String(i));
      return {
        id,
        src: capturedPosters[id] || mediaUrl(posters[id] || r.poster || r.thumbnail || ''),
        videoSrc: mediaUrl(r.videoUrl || ''),
        alt: r.title || 'ريل',
        counts: r.counts || {}
      };
    });
  }, [reels, posters, capturedPosters]);

  const setMode = (mode) => {
    setViewMode(mode);
    const q = { ...(router.query || {}), mode };
    router.replace({ pathname: router.pathname, query: q }, undefined, { shallow: true });
  };

  return (
    <>
      <Head>
        <title>ريلز — يؤثرون</title>
        <meta name="description" content="مقاطع قصيرة بملء الشاشة أو شبكة عرض شبيهة بإنستقرام" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link href="https://unpkg.com/boxicons@2.1.4/css/boxicons.min.css" rel="stylesheet" />
      </Head>

      <div className="view-switch">
        <button
          className={`vs-btn ${viewMode === 'reels' ? 'active' : ''}`}
          onClick={() => setMode('reels')}
          aria-pressed={viewMode === 'reels'}
          title="عرض ريلز"
        >
          <i className="bx bx-movie-play" />
          <span>ريلز</span>
        </button>
        <button
          className={`vs-btn ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => setMode('grid')}
          aria-pressed={viewMode === 'grid'}
          title="عرض شبكة"
        >
          <i className="bx bx-grid-alt" />
          <span>شبكة</span>
        </button>
      </div>

      {viewMode === 'reels' ? (
        <div className="reels-root">
          {loading && <div className="reels-status">جارٍ التحميل…</div>}
          {!loading && reels.length === 0 && <div className="reels-status">لا توجد مقاطع حالياً.</div>}
          {error && <div className="reels-toast" role="alert">{error}</div>}
          <ReelsFeed
            reels={reels}
            openId={typeof router.query.open === 'string' ? router.query.open : null}
            globalMuted={muted}
            onToggleMute={() => setMuted(v => !v)}
            onForceMute={() => setMuted(true)}
            fetchFp={fetchFp}
          />
        </div>
      ) : (
        <GridFeed
          items={gridItems}
        />
      )}

      <style jsx global>{`
        :global(body.reels-mode){ --rail-shift: 8vh; }
        :global(body.reels-mode .btnnow), :global(body.reels-mode .btnserch){ display:none !important; }
        :global(.reels-nav-transparent),
        :global(body.reels-mode .navbar.navbar-expand-lg),
        :global(body.reels-mode .navbar.navbar-expand-lg.bg-light),
        :global(body.reels-mode .navbar.navbar-expand-lg.bg-white),
        :global(body.reels-mode .navbar.navbar-expand-lg[class*="bg-"]){
          background:transparent !important; background-color:transparent !important;
          --bs-bg-opacity:0 !important; box-shadow:none !important; backdrop-filter:none !important;
        }
        :global(.reels-nav-transparent .navbar-brand),
        :global(.reels-nav-transparent .nav-link),
        :global(body.reels-mode .navbar.navbar-expand-lg .navbar-brand),
        :global(body.reels-mode .navbar.navbar-expand-lg .nav-link){ color:#fff !important; }
        :global(html), :global(body){ height:100%; margin:0; padding:0; }

        .view-switch{
          position:fixed; top:calc(env(safe-area-inset-top) + 66px); inset-inline:0;
          display:flex; gap:10px; justify-content:center; z-index:80;
          pointer-events:none;
        }
        @media (min-width:1024px){
          .view-switch{ top:calc(env(safe-area-inset-top) + 80px); }
        }
        @media (max-width:768px){
          .view-switch{
            top:calc(env(safe-area-inset-top) + 12px);
            inset-inline-start:auto;
            inset-inline-end:calc(env(safe-area-inset-right) + 64px);
            justify-content:flex-end;
            gap:6px;
          }
          .view-switch .vs-btn span{ display:none; }
          .view-switch .vs-btn{ padding:6px; border-radius:12px; }
        }
        .vs-btn{
          pointer-events:auto;
          display:inline-flex; align-items:center; gap:8px;
          padding:8px 14px; border-radius:999px;
          background:rgba(0,0,0,.45); color:#fff; border:1px solid rgba(255,255,255,.18);
          backdrop-filter: blur(10px);
          cursor:pointer; font-weight:800; letter-spacing:.2px;
          transition:transform .12s ease, background .2s ease, border-color .2s ease;
        }
        .vs-btn i{ font-size:18px }
        .vs-btn:hover{ transform: translateY(-1px); background:rgba(0,0,0,.55); }
        .vs-btn.active{ background:#7B2C3B; border-color:#8C3F47; }

        .reels-root{ position:relative; background:#000; }
        .reels-status{ color:#fff; text-align:center; padding:24px; }
        .reels-toast{
          position:fixed; top:12px; left:50%; transform:translateX(-50%);
          background:rgba(0,0,0,.75); color:#fff; padding:8px 12px; border-radius:10px; z-index:9999;
        }

        .reels-scroll{ width:100vw; height:calc(var(--vh, 1vh) * 100); overflow-y:auto; scroll-snap-type:y mandatory; overscroll-behavior-y:contain; -webkit-overflow-scrolling:touch; touch-action:pan-y; }
        .reel-card{ width:100vw; height:calc(var(--vh, 1vh) * 100); scroll-snap-align:start; position:relative; display:flex; align-items:center; justify-content:center; background:#000; }
        .reel-spinner{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; z-index:55; pointer-events:none; }
        .spinner{ width:44px; height:44px; border:3px solid rgba(255,255,255,.3); border-top-color:#fff; border-radius:50%; animation:spin .8s linear infinite; }
        @keyframes spin{ to{ transform:rotate(360deg); } }
        .dbl-heart{ position:absolute; transform:translate(-50%,-50%) scale(.8); opacity:.9; font-size:84px; color:#ff2d55; pointer-events:none; animation:pop-heart .85s ease forwards; filter:drop-shadow(0 6px 18px rgba(255,0,80,.4)); z-index:40; }
        @keyframes pop-heart{ 0%{transform:translate(-50%,-50%) scale(.6);opacity:0} 20%{transform:translate(-50%,-50%) scale(1.1);opacity:1} 60%{transform:translate(-50%,-65%) scale(1.0);opacity:1} 100%{transform:translate(-50%,-90%) scale(1.0) rotate(-10deg);opacity:0} }
        .reel-wrapper{ position:relative; display:flex; align-items:center; justify-content:center; }
        .reel-wrapper.expanded{ position:fixed; inset:0; background:rgba(0,0,0,.95); z-index:60; }
        .reel-wrapper.expanded .reel-video{ width:100vw; height:100vh; object-fit:contain; max-width:none !important; }

        .cluster{ display:flex; gap:8px; }
        .circle{ width:40px; height:40px; border-radius:999px; border:1px solid rgba(255,255,255,.28); background:rgba(0,0,0,.45); color:#fff; display:flex; align-items:center; justify-content:center; }

        .left-rail{
          position:absolute;
          left: max(6px, env(safe-area-inset-left));
          top: calc(36% + var(--rail-shift, 0vh));
          transform: translateY(-50%);
          z-index: 61;
          display: flex;
          flex-direction: column;
          gap: 16px;
          pointer-events: auto;
        }
        @media (min-width: 1024px){ .left-rail{ left: calc(25px + env(safe-area-inset-left)) !important; } }
        .left-rail .rail-row{ display: flex; flex-direction: column; align-items: center; gap: 6px; min-width: 56px; }
        .left-rail .rail-btn{ width: 56px; height: 56px; border-radius: 50%; border: 1px solid rgba(255,255,255,.14); background: #1f1f1f; color: #f2f2f2; display: inline-flex; align-items: center; justify-content: center; font-size: 22px; cursor: pointer; box-shadow: inset 0 -2px 0 rgba(255,255,255,.06), 0 8px 18px rgba(0,0,0,.35); transition: transform .12s ease, filter .12s ease, background .12s ease; }
        .left-rail .rail-btn:hover { transform: translateY(-1px) scale(1.02); }
        .left-rail .rail-btn:active{ transform: translateY(0) scale(.98);  }
        .left-rail .rail-btn.is-liked{ background: rgba(255,0,80,.22); border-color: rgba(255,0,80,.45); color: #fff; }
        .left-rail .rail-count{ font-size: 13px; line-height: 1; color: #ffffff; font-weight: 600; text-shadow: 0 1px 8px rgba(0,0,0,.6); letter-spacing: .2px; min-width: 40px; text-align: center; }
        @media (max-width: 480px){ .left-rail{ left: max(4px, env(safe-area-inset-left)); gap: 5px; } .left-rail .rail-row{ min-width: 50px; gap: 6px; } .left-rail .rail-btn{ width: 50px; height: 50px; font-size: 20px; } .left-rail .rail-count{ font-size: 12px; min-width: 36px; } }

        .reel-progress{ position:absolute; top:0; left:0; height:3px; background:linear-gradient(90deg,#00e0ff,#00ffa4); }

        .comments-drawer{ position:absolute; inset:0 0 0 auto; width:min(420px,100%); background:rgba(0,0,0,.92); color:#fff; transform:translateX(100%); transition:transform .2s ease; z-index:999; display:grid; grid-template-rows:auto 1fr auto; border-left:1px solid rgba(255,255,255,.15); }
        .comments-drawer.open{ transform:translateX(0); }
        .comments-header{ padding:16px 14px 20px; display:flex; align-items:center; justify-content:center; border-bottom:1px solid rgba(255,255,255,.12); position:relative; }
        .comments-header .circle{ position:absolute; top:8px; inset-inline-end:8px; }
        .comments-list{ overflow-y:auto; padding:12px; }
        .comment-item{ margin-bottom:12px; border-bottom:1px dashed rgba(255,255,255,.15); padding-bottom:10px; }
        .comment-item .name{ font-weight:700; margin-bottom:4px; }
        .comments-form{ padding:12px; display:grid; gap:8px; border-top:1px solid rgba(255,255,255,.12); }
        .comments-form input,.comments-form textarea{ background:rgba(255,255,255,.08); border:1px solid rgba(255,255,255,.2); color:#fff; border-radius:10px; padding:10px 12px; }
        .comments-form button{ background:#7B2C3B; border:1px solid #8C3F47; color:#fff; padding:10px 14px; border-radius:10px; cursor:pointer; font-weight:700; }

        :global(.reel-overlay){ padding-bottom: clamp(45px, 14vh, 13px) !important; }

        .grid-root{
          min-height:100vh;
          padding-top:calc(100px + env(safe-area-inset-top));
          padding-bottom:40px;
          background: radial-gradient(1200px 300px at 0% 0%, rgba(123,44,59,.15), transparent 55%), #0b0b0b;
        }
        .grid-container{
          width:min(1100px, 94vw);
          margin-inline:auto;
          display:grid;
          gap:8px;
          grid-template-columns: repeat(2, 1fr);
        }
        @media (min-width:768px){ .grid-container{ grid-template-columns: repeat(3, 1fr); gap:10px; } }
        @media (min-width:1200px){ .grid-container{ grid-template-columns: repeat(4, 1fr); gap:12px; } }

        .grid-item{
          position:relative; overflow:hidden; border-radius:14px; background:#111; aspect-ratio:1/1;
          border:1px solid rgba(255,255,255,.06);
        }
        .grid-item img, .grid-item video{
          position:absolute; inset:0; width:100%; height:100%; object-fit:cover;
          transition: transform .25s ease;
        }
        .grid-item:hover img, .grid-item:hover video{ transform: scale(1.04); }
        .grid-badge{
          position:absolute; top:8px; inset-inline-start:8px;
          display:inline-flex; align-items:center; gap:6px;
          padding:4px 8px; border-radius:999px; font-size:12px; font-weight:800;
          background:rgba(0,0,0,.55); color:#fff; border:1px solid rgba(255,255,255,.18);
          backdrop-filter: blur(6px);
        }
        .grid-overlay{
          position:absolute; inset:0;
          background: linear-gradient(180deg, transparent 40%, rgba(0,0,0,.65));
          display:flex; align-items:flex-end; justify-content:space-between;
          padding:10px;
          opacity:0; transition:opacity .2s ease;
        }
        .grid-item:hover .grid-overlay{ opacity:1; }
        .grid-counts{
          display:flex; gap:10px; color:#fff; font-weight:800; text-shadow:0 2px 8px rgba(0,0,0,.6);
        }
        .grid-counts i{ font-size:18px; margin-inline-end:4px; }
        .grid-cta{
          display:inline-flex; align-items:center; gap:6px;
          padding:6px 10px; border-radius:999px; background:#7B2C3B; color:#fff; border:1px solid #8C3F47;
          text-decoration:none; font-weight:800;
        }
      `}</style>
    </>
  );
}

function GridFeed({ items }) {
  const router = useRouter();

  const openReel = (id) => {
    router.push({ pathname: '/reels', query: { mode: 'reels', open: id } }, undefined, { shallow: true });
  };

  return (
    <section className="grid-root" aria-label="شبكة الفيديوهات">
      <div className="grid-container">
        {items.map((it) => (
          <article className="grid-item" key={it.id}>
            {it.videoSrc ? (
              <video
                src={it.videoSrc}
                muted
                defaultMuted
                playsInline
                preload="metadata"
                poster=""
                aria-label={it.alt}
                style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }}
                onLoadedMetadata={(e) => {
                  try {
                    e.currentTarget.currentTime = 0.1;
                  } catch {}
                }}
                onSeeked={(e) => {
                  e.currentTarget.pause();
                }}
              />
            ) : (
              <div style={{position:'absolute', inset:0, display:'grid', placeItems:'center', color:'#bbb'}}>بدون صورة</div>
            )}

            <div className="grid-badge" title="مقطع ريلز">
              <i className="bx bx-movie-play" />
              ريلز
            </div>

            <div className="grid-overlay">
              <div className="grid-counts">
                <span><i className="bx bxs-heart"></i>{formatCount(it.counts?.likes || 0)}</span>
                <span><i className="bx bx-show"></i>{formatCount(it.counts?.views || 0)}</span>
              </div>
              <button className="grid-cta" onClick={() => openReel(it.id)}>مشاهدة</button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ReelsFeed({ reels, openId, globalMuted, onToggleMute, onForceMute, fetchFp }) {
  const containerRef = useRef(null);
  const videoRefs = useRef({});
  const [activeIndex, setActiveIndex] = useState(0);
  const viewed = useRef(new Set());

  useEffect(() => {
    if (!containerRef.current) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(async (entry) => {
        const id  = entry.target.getAttribute('data-reel-id');
        const idx = Number(entry.target.getAttribute('data-index')) || 0;
        const vid = videoRefs.current[id];

        if (entry.isIntersecting) {
          setActiveIndex(idx);
          if (vid) {
            try { await vid.play(); }
            catch {
              if (!vid.muted) {
                vid.muted = true;
                onForceMute?.();
                try { await vid.play(); } catch {}
                flashToast('تم كتم الصوت للسماح بالتشغيل — اضغط زر الصوت لإعادة الصوت');
              }
            }
          }
          if (!viewed.current.has(id)) {
            viewed.current.add(id);
            try {
              const base = process.env.NEXT_PUBLIC_API_BASE_URL || '';
              await fetchFp(`${base}/api/reels/${id}/view`, { method: 'POST' });
            } catch {}
          }
        } else {
          if (vid) vid.pause();
        }
      });
    }, { root: containerRef.current, threshold: 0.6 });

    const cards = containerRef.current.querySelectorAll('.reel-card');
    cards.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [reels, onForceMute, fetchFp]);

  useEffect(() => {
    Object.values(videoRefs.current).forEach((v) => { if (v) v.muted = globalMuted; });
  }, [globalMuted]);

  const onKey = useCallback((e) => {
    if (!containerRef.current) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault(); containerRef.current.scrollBy({ top: window.innerHeight, behavior: 'smooth' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault(); containerRef.current.scrollBy({ top: -window.innerHeight, behavior: 'smooth' });
    } else if (e.key.toLowerCase() === 'm') {
      onToggleMute();
    }
  }, [onToggleMute]);

  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    el.addEventListener('keydown', onKey); el.tabIndex = 0;
    return () => el.removeEventListener('keydown', onKey);
  }, [onKey]);

  useEffect(() => {
    if (!openId || !containerRef.current) return;
    const idx = reels.findIndex((r, i) => getReelId(r, String(i)) === openId);
    if (idx >= 0) {
      const h = window.innerHeight;
      containerRef.current.scrollTo({ top: h * idx, behavior: 'auto' });
      setActiveIndex(idx);
    }
  }, [openId, reels]);

  return (
    <div ref={containerRef} className="reels-scroll">
      {reels.map((reel, idx) => (
        <ReelCard
          key={getReelId(reel, String(idx))}
          reel={reel}
          index={idx}
          active={idx === activeIndex}
          globalMuted={globalMuted}
          registerVideo={(id, el) => { videoRefs.current[id] = el; }}
          onToggleMute={onToggleMute}
          fetchFp={fetchFp}
        />
      ))}
    </div>
  );
}

function ReelCard({ reel, index, active, globalMuted, registerVideo, onToggleMute, fetchFp }) {
  const cardRef  = useRef(null);
  const videoRef = useRef(null);
  const lastTap  = useRef(0);
  const tapTimeout = useRef(null);

  const [progress, setProgress] = useState(0);
  const [liked, setLiked]       = useState(false);
  const [liking, setLiking]     = useState(false);
  const [buffering, setBuffering] = useState(true);

  const [likesCount, setLikesCount]       = useState(reel?.counts?.likes   || 0);
  const [viewsCount, setViewsCount]       = useState(reel?.counts?.views   || 0);
  const [sharesCount, setSharesCount]     = useState(reel?.counts?.shares  || 0);
  const [commentsCount, setCommentsCount] = useState(reel?.counts?.comments|| 0);

  const [openComments, setOpenComments] = useState(false);
  const [paused, setPaused]             = useState(false);
  const [isExpanded, setIsExpanded]     = useState(false);

  useEffect(() => {
    setOpenComments(false);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('reels_likes');
      const map = raw ? JSON.parse(raw) : {};
      if (map[reel._id]) setLiked(true);
    } catch {}
  }, [reel?._id]);

  const saveLikeLocal = (id, v) => {
    try {
      const raw = localStorage.getItem('reels_likes');
      const map = raw ? JSON.parse(raw) : {};
      if (v) map[id] = true; else delete map[id];
      localStorage.setItem('reels_likes', JSON.stringify(map));
    } catch {}
  };

  const fmt = useCallback((n) => formatCount(n), []);
  useEffect(() => {
    setLikesCount(reel?.counts?.likes || 0);
    setViewsCount(reel?.counts?.views || 0);
    setSharesCount(reel?.counts?.shares || 0);
    setCommentsCount(reel?.counts?.comments || 0);
  }, [reel?.counts]);

  useEffect(() => {
    if (videoRef.current) {
      registerVideo(getReelId(reel, String(index)), videoRef.current);
      videoRef.current.muted = globalMuted;
    }
  }, [registerVideo, reel._id, reel.id, index, globalMuted]);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onTime    = () => { if (v.duration) setProgress((v.currentTime / v.duration) * 100); };
    const onPlay    = () => { setPaused(false); setBuffering(false); };
    const onPause   = () => setPaused(true);
    const onStart   = () => setBuffering(true);
    const onWaiting = () => setBuffering(true);
    const onCanplay = () => setBuffering(false);
    const onPlaying = () => setBuffering(false);
    v.addEventListener('timeupdate', onTime);
    v.addEventListener('loadedmetadata', onTime);
    v.addEventListener('ended', () => setProgress(100));
    v.addEventListener('play', onPlay);
    v.addEventListener('pause', onPause);
    v.addEventListener('loadstart', onStart);
    v.addEventListener('waiting', onWaiting);
    v.addEventListener('canplay', onCanplay);
    v.addEventListener('playing', onPlaying);
    return () => {
      v.removeEventListener('timeupdate', onTime);
      v.removeEventListener('loadedmetadata', onTime);
      v.removeEventListener('play', onPlay);
      v.removeEventListener('pause', onPause);
      v.removeEventListener('loadstart', onStart);
      v.removeEventListener('waiting', onWaiting);
      v.removeEventListener('canplay', onCanplay);
      v.removeEventListener('playing', onPlaying);
    };
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (openComments && !v.paused) v.pause();
  }, [openComments]);

  useEffect(() => {
    const onFs = () => setIsExpanded(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', onFs);
    return () => document.removeEventListener('fullscreenchange', onFs);
  }, []);

  const base = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  const onLike = async (forceInc = false) => {
    if (liking) return;
    setLiking(true);
    const willLike = forceInc ? true : !liked;
    setLiked(prev => (forceInc ? true : !prev));
    setLikesCount(c => (willLike ? c + 1 : Math.max(0, c - 1)));
    saveLikeLocal(reel._id, willLike);
    try { await fetchFp(`${base}/api/reels/${reel._id}/like?dir=${willLike ? 'inc' : 'dec'}`, { method:'POST' }); } catch {}
    setTimeout(() => setLiking(false), 250);
  };

  const onShare = async () => {
    try {
      if (typeof window === 'undefined') return;

      const reelUrlObj = new URL('/reels', window.location.origin);
      reelUrlObj.searchParams.set('mode', 'reels');
      reelUrlObj.searchParams.set('open', reel._id);

      const reelUrl = reelUrlObj.toString();
      const shareData = {
        title: reel.title || 'ريل',
        text: reel.title || 'شاهد هذا الريل',
        url: reelUrl
      };

      let shared = false;

      if (
        window.isSecureContext &&
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function'
      ) {
        try {
          if (!navigator.canShare || navigator.canShare(shareData)) {
            await navigator.share(shareData);
            shared = true;
          }
        } catch (err) {
          if (err?.name === 'AbortError') return;
        }
      }

      if (!shared && navigator?.clipboard?.writeText) {
        try {
          await navigator.clipboard.writeText(reelUrl);
          flashToast('تم نسخ رابط الريل');
          shared = true;
        } catch {}
      }

      if (!shared) {
        const text = encodeURIComponent(`${reel.title || 'شاهد هذا الريل'} ${reelUrl}`);
        const waUrl = `https://wa.me/?text=${text}`;
        window.open(waUrl, '_blank', 'noopener,noreferrer');
        shared = true;
      }

      if (shared) {
        setSharesCount(c => c + 1);
        try {
          await fetchFp(`${base}/api/reels/${reel._id}/share`, { method: 'POST' });
        } catch {}
      }
    } catch {}
  };

  const handleTap = (e) => {
    if (e.target.closest && e.target.closest('.left-rail, .reel-cta, .circle, .rail-btn')) return;
    const v = videoRef.current;
    if (!v) return;
    const now = Date.now();
    const delta = now - (lastTap.current || 0);

    const rect = cardRef.current.getBoundingClientRect();
    const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? rect.left + rect.width / 2;
    const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? rect.top + rect.height / 2;
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    if (delta < 300) {
      if (tapTimeout.current) { clearTimeout(tapTimeout.current); tapTimeout.current = null; }
      spawnHeart(x, y);
      if (!liked) onLike(true);
    } else {
      if (tapTimeout.current) clearTimeout(tapTimeout.current);
      tapTimeout.current = setTimeout(() => {
        v.paused ? v.play() : v.pause();
        tapTimeout.current = null;
      }, 300);
    }
    lastTap.current = now;
  };

  const spawnHeart = (x, y) => {
    const el = document.createElement('i');
    el.className = 'bx bxs-heart dbl-heart';
    el.style.left = `${x}px`;
    el.style.top  = `${y}px`;
    cardRef.current.appendChild(el);
    setTimeout(() => { el.remove(); }, 900);
  };

  const toggleExpand = async () => {
    const el = videoRef.current;
    try {
      if (!document.fullscreenElement && el?.requestFullscreen) {
        await el.requestFullscreen(); setIsExpanded(true);
      } else if (document.fullscreenElement) {
        await document.exitFullscreen(); setIsExpanded(false);
      } else {
        setIsExpanded(p => !p);
      }
    } catch { setIsExpanded(p => !p); }
  };

  return (
    <section
      ref={cardRef}
      data-reel-id={getReelId(reel, String(index))}
      data-index={index}
      className="reel-card"
      onPointerDown={handleTap}
    >
      <div className={`reel-wrapper ${isExpanded ? 'expanded' : ''}`}>
        {buffering && (
          <div className="reel-spinner" aria-hidden>
            <div className="spinner" />
          </div>
        )}

        <video
          ref={videoRef}
          className="reel-video"
          src={mediaUrl(reel.videoUrl)}
          poster={mediaUrl(reel.poster)}
          playsInline
          loop
          preload="metadata"
          controls={false}
          disablePictureInPicture
          style={{ width:'100vw', height:'calc(var(--vh, 1vh) * 100)', objectFit:'contain', background:'#000' }}
          onDoubleClick={(e) => {
            const r = cardRef.current.getBoundingClientRect();
            spawnHeart(e.clientX - r.left, e.clientY - r.top);
            if (!liked) onLike(true);
          }}
        />

        <div className="reel-progress" style={{ width: `${progress}%` }} />

        <div className="reel-overlay" style={{ position:'absolute', inset:0, display:'grid',
          gridTemplateColumns:'1fr auto', gridTemplateRows:'1fr auto',
          padding:'12px', pointerEvents:'none', color:'#fff' }}>
          <div style={{ gridColumn:'1 / 2', gridRow:'2 / 3', alignSelf:'end', maxWidth:520 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8, pointerEvents:'auto' }}>
              <img src="/images/logo.png" alt="" width="32" height="32" style={{ borderRadius:'50%' }} />
              <strong className="brand-wordmark" style={{ fontSize: '25px' }}>@يؤثرون</strong>
            </div>
            {reel.title && (
              <h3 style={{ fontSize:18, lineHeight:1.5, margin:'0 0 10px', textShadow:'0 2px 10px rgba(0,0,0,.6)' }}>
                {reel.title}
              </h3>
            )}
            {reel.ctaLink && (
              <Link href={reel.ctaLink} legacyBehavior>
                <a className="reel-cta" style={{
                  display:'inline-flex', alignItems:'center', gap:8,
                  padding:'8px 14px', borderRadius:999, background:'rgba(255,255,255,.12)',
                  border:'1px solid rgba(255,255,255,.25)', color:'#fff',
                  backdropFilter:'blur(8px)', pointerEvents:'auto'
                }}>
                  {reel.ctaText || 'المزيد'} ↗
                </a>
              </Link>
            )}
          </div>
        </div>

        <div className="left-rail" aria-label="شريط الإجراءات">
          <div className="rail-row">
            <button className="rail-btn" onClick={onToggleMute} title="صوت">
              <i className={globalMuted ? 'bx bx-volume-mute' : 'bx bx-volume-full'} />
            </button>
          </div>

          <div className="rail-row">
            <button className={`rail-btn ${liked ? 'is-liked' : ''}`} onClick={() => onLike(false)} title="أعجبني">
              <i className={liked ? 'bx bxs-heart' : 'bx bx-heart'} />
            </button>
            <span className="rail-count">{fmt(likesCount)}</span>
          </div>

          <div className="rail-row">
            <button className="rail-btn" onClick={() => setOpenComments(true)} title="التعليقات">
              <i className="bx bx-message-rounded-dots" />
            </button>
            <span className="rail-count">{fmt(commentsCount)}</span>
          </div>

          <div className="rail-row">
            <button className="rail-btn" onClick={onShare} title="مشاركة">
              <i className="bx bx-share-alt" />
            </button>
            <span className="rail-count">{fmt(sharesCount)}</span>
          </div>

          <div className="rail-row">
            <button className="rail-btn" style={{cursor:'default'}} title="المشاهدات">
              <i className="bx bx-show" />
            </button>
            <span className="rail-count">{fmt(viewsCount)}</span>
          </div>
        </div>

        {openComments && (
          <CommentsDrawer
            reelId={reel._id}
            open={openComments}
            onClose={() => setOpenComments(false)}
            onCountChange={(n) => setCommentsCount(n)}
            fetchFp={fetchFp}
          />
        )}
      </div>
    </section>
  );
}

function CommentsDrawer({ reelId, open, onClose, onCountChange, fetchFp }) {
  const [items, setItems] = useState([]);
  const [page, setPage]   = useState(1);
  const [pages, setPages] = useState(1);
  const [name, setName]   = useState('');
  const [text, setText]   = useState('');
  const [sending, setSending] = useState(false);
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || '';

  const fetchPage = async (p = 1) => {
    const res = await fetchFp(`${base}/api/reels/${reelId}/comments?page=${p}&limit=20`);
    const data = await res.json();
    if (p === 1) setItems(data.items);
    else setItems(prev => [...prev, ...data.items]);
    setPage(data.page); setPages(data.pages);
    onCountChange?.(data.total);
  };

  useEffect(() => { if (open && reelId) fetchPage(1); }, [open, reelId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const commentsQuotaKey = `reels_comments_${reelId}`;
  const getSentCount = () => {
    try { return parseInt(localStorage.getItem(commentsQuotaKey) || '0', 10) || 0; } catch { return 0; }
  };
  const incSentCount = () => {
    try { const n = getSentCount() + 1; localStorage.setItem(commentsQuotaKey, String(n)); } catch {}
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;

    if (getSentCount() >= 3) {
      flashToast('لقد وصلت للحد الأقصى (3 تعليقات) لهذا المقطع من جهازك.');
      return;
    }

    setSending(true);
    try {
      const res = await fetchFp(`${base}/api/reels/${reelId}/comments`, {
        method:'POST', headers:{ 'Content-Type':'application/json' },
        body:JSON.stringify({ name: name.trim(), text: text.trim() })
      });
      const data = await res.json();
      if (data?.comment) {
        setItems(prev => [data.comment, ...prev]);
        onCountChange?.(items.length + 1);
        setText('');
        incSentCount();
        flashToast('تم إرسال رسالتك بنجاح');
      } else {
        flashToast('تعذّر إرسال التعليق.');
      }
    } catch {
      flashToast('تعذّر إرسال التعليق.');
    } finally {
      setSending(false);
    }
  };

  return (
    <aside className={`comments-drawer ${open ? 'open' : ''}`}>
      <div className="comments-header">
        <strong>التعليقات</strong>
        <button className="circle" onClick={onClose} aria-label="إغلاق"><i className="bx bx-x" /></button>
      </div>

      <div className="comments-list">
        {items.map(c => (
          <div key={c._id} className="comment-item">
            <div className="name">{c.name}</div>
            <div className="text">{c.text}</div>
            <div style={{ opacity:.7, fontSize:12, marginTop:4 }}>{new Date(c.createdAt).toLocaleString()}</div>
          </div>
        ))}
        {page < pages && (
          <div style={{textAlign:'center', padding:'8px'}}>
            <button className="circle" onClick={() => fetchPage(page + 1)} aria-label="تحميل المزيد">
              <i className="bx bx-down-arrow-circle" />
            </button>
          </div>
        )}
      </div>

      <form className="comments-form" onSubmit={submit}>
        <input placeholder="اسمك" value={name} onChange={e => setName(e.target.value)} maxLength={64} />
        <textarea placeholder="اكتب تعليقك…" rows={3} value={text} onChange={e => setText(e.target.value)} maxLength={2000} />
        <button type="submit" disabled={sending}>
          {sending ? <i className="bx bx-loader-alt bx-spin" /> : 'إرسال'}
        </button>
      </form>
    </aside>
  );
}

function flashToast(text) {
  const el = document.createElement('div');
  el.textContent = text;
  Object.assign(el.style, {
    position:'fixed', bottom:'18px', left:'50%', transform:'translateX(-50%)',
    background:'rgba(0,0,0,.75)', color:'#fff', padding:'8px 12px', borderRadius:'10px', zIndex:9999,
  });
  document.body.appendChild(el);
  setTimeout(() => { el.remove(); }, 1600);
}

function formatCount(n) {
  const v = Math.abs(Number(n) || 0);
  const fmt = (x, d) => x.toFixed(d).replace(/\.0$/, '');
  if (v >= 1e9) return fmt(v / 1e9, v % 1e9 >= 1e8 ? 1 : 0) + 'B';
  if (v >= 1e6) return fmt(v / 1e6, v % 1e6 >= 1e5 ? 1 : 0) + 'M';
  if (v >= 1e3) return fmt(v / 1e3, v % 1e3 >= 100 ? 1 : 0) + 'K';
  return String(v);
}


