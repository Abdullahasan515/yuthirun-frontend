// components/Navbar.jsx
import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import newsTypes from '@/constants/newsTypes'

export default function Navbar({
  pageType,
  newsTypesObject,
  searchQuery: initialSearch = ''
}) {
  const router = useRouter()
  const [showSearch, setShowSearch] = useState(false)
  const [searchQuery, setSearchQuery] = useState(initialSearch)
  const [lang, setLang] = useState('ar')
  const [theme, setTheme] = useState('light')
  const inputRef = useRef(null)

  const t = {
    ar: {
      home: 'الصفحة الرئيسية',
      videos: 'الفيديوهات',
      posts: 'المنشورات',
      postsBrand: 'منشورات يؤثرون',
      about: 'من نحن',
      contact: 'تواصل معنا',
      donate: 'تبرع الآن',
      searchPh: 'ابحث هنا'
    }
  }

  useEffect(() => {
    setSearchQuery(initialSearch)
  }, [initialSearch])

  useEffect(() => {
    const qpLang = typeof router.query.lang === 'string' ? router.query.lang : null
    const stored = typeof window !== 'undefined' ? localStorage.getItem('siteLang') : null
    const nextLang = qpLang || stored || 'ar'
    setLang(nextLang === 'ar' ? 'ar' : 'ar')
  }, [router.query.lang])

  useEffect(() => {
    if (showSearch && inputRef.current) {
      inputRef.current.focus()
    }
  }, [showSearch])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = 'ar'
      document.documentElement.dir = 'rtl'
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('siteLang', 'ar')
    }
  }, [lang])

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('siteTheme') : null
    setTheme(stored || 'light')
  }, [])

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme)
      try { localStorage.setItem('siteTheme', theme) } catch {}
    }
  }, [theme])

  const isActive = (key) =>
    key === 'all'
      ? pageType === 'all' || pageType === 'news-all'
      : pageType.replace(/^news-/, '') === key

  const performSearch = () => {
    const q = searchQuery.trim()
    if (!q) return
    let typeKey = 'all';
    if (pageType.startsWith('news-')) {
      typeKey = pageType.replace(/^news-/, '') || 'all';
    }
    const url = `/news/type/${typeKey}?search=${encodeURIComponent(q)}&lang=ar`
    router.push(url);
    setShowSearch(false);
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') performSearch()
  }

  useEffect(() => {
    const handler = (e) => {
      if (
        showSearch &&
        inputRef.current &&
        !e.target.closest('.areasearch') &&
        !e.target.classList.contains('search-icon')
      ) {
        setShowSearch(false)
      }
    }
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [showSearch])

  const L = t.ar

  return (
    <nav className="navbar navbar-expand-lg" id="navbar">
      <div className="container-fluid util-row">
        <div className="brand-group">
          <Link href={{ pathname: '/', query: { ...(router.query||{}), lang: 'ar' } }} rel="noopener noreferrer" className="navbar-brand">
            <span className="brand-wordmark">يؤثرون</span>
          </Link>

          <div className="brand-controls">
            <button type="button" className="theme-toggle" onClick={()=>setTheme(theme==='light'?'dark':'light')} aria-label="Toggle theme">
              <i className={theme === 'light' ? 'bx bx-moon' : 'bx bx-sun'} />
            </button>
          </div>
        </div>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <ul className="navbar-nav me-0 mb-0 mb-lg-0">
            <li className="nav-item">
              <Link href={{ pathname: '/', query: { ...(router.query||{}), lang: 'ar' } }} rel="noopener noreferrer" className={`nav-link ${isActive('index') ? 'active' : ''}`}>
                {L.home}
              </Link>
            </li>
            <li className="nav-item">
              <Link href={{ pathname: '/reels', query: { ...(router.query||{}), lang: 'ar' } }} rel="noopener noreferrer" className="nav-link">
                {L.videos}
              </Link>
            </li>
            <li className="nav-item">
              <Link href={{ pathname: '/news/type/all', query: { ...(router.query||{}), lang: 'ar' } }} className={`nav-link ${isActive('all') ? 'active' : ''}`}>
                {L.posts}
              </Link>
            </li>

            <li className="nav-item dropdown">
              <Link
                href="#"
                className={`nav-link dropdown-toggle ${pageType.startsWith('news-') ? 'active' : ''}`}
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                {L.postsBrand}
              </Link>

              <ul className="dropdown-menu">
                {Object.entries(newsTypes).map(([key, label]) =>
                  key !== 'all' && (
                    <li key={key}>
                      <Link
                        href={{ pathname: `/news/type/${key}`, query: { ...(router.query||{}), lang: 'ar' } }}
                        className={`dropdown-item ${pageType === `news-${key}` ? 'active' : ''}`}
                      >
                        {label}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </li>

            <li className="nav-item">
              <Link href={{ pathname: '/aboutUs', query: { ...(router.query||{}), lang: 'ar' } }} rel="noopener noreferrer" className={`nav-link ${isActive('aboutUs') ? 'active' : ''}`}>
                {L.about}
              </Link>
            </li>

            <li className="nav-item">
              <Link href={{ pathname: '/contactUs', query: { ...(router.query||{}), lang: 'ar' } }} rel="noopener noreferrer" className={`nav-link ${isActive('contactUs') ? 'active' : ''}`}>
                {L.contact}
              </Link>
            </li>
          </ul>
        </div>

        <div className="btnserch" onClick={() => setShowSearch(v => !v)}>
          <i className="bx bx-search search-icon" />
        </div>

        <div className={`areasearch${showSearch ? ' active' : ''}`}>
          <div className="inputser">
            <i className="bx bx-search searchnon" onClick={performSearch} />
            <input
              ref={inputRef}
              type="text"
              id="globalSearchInput"
              name="search"
              placeholder={L.searchPh}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
        </div>

        <div className="btn_search">
          <div className="btnserch" onClick={() => setShowSearch(v => !v)}>
            <i className="bx bx-search search-icon" />
          </div>

          <Link href={{ pathname: '/donate', query: { ...(router.query||{}), lang: 'ar' } }} rel="noopener noreferrer">
            <div className="btnnow">
              <h6>{L.donate}</h6>
              <svg xmlns="http://www.w3.org/2000/svg" width="32.062" height="29.898" viewBox="0 0 32.062 29.898">
                <defs>
                  <clipPath id="clip-path">
                    <rect width="32.062" height="29.898" fill="#fff" />
                  </clipPath>
                </defs>
                <g clipPath="url(#clip-path)">
                  <path
                    d="M32.051,9.019a11.049,11.049,0,0,1-.267,2.78c-.151.752-.639.9-1.2.376-.483-.457-.943-.939-1.416-1.407-.689-.682-1.245-.773-1.725-.29-.442.445-.34,1.029.3,1.671.836.84,1.679,1.673,2.513,2.515.3.305.619.66.2,1.065-.4.387-.758.117-1.073-.2q-2.16-2.162-4.322-4.322c-.147-.147-.294-.3-.454-.427a.883.883,0,0,0-1.245.025.927.927,0,0,0-.172,1.245,3.034,3.034,0,0,0,.523.614q2.421,2.43,4.849,4.853a5.08,5.08,0,0,1,.425.455.515.515,0,0,1,.012.688.558.558,0,0,1-.729.16,2.257,2.257,0,0,1-.528-.429q-2.1-2.09-4.192-4.187a3.578,3.578,0,0,0-.457-.422.936.936,0,0,0-1.258.054A.954.954,0,0,0,21.7,15.1a2.526,2.526,0,0,0,.449.514q2.246,2.252,4.5,4.5a3.558,3.558,0,0,1,.416.462.538.538,0,0,1-.055.739.531.531,0,0,1-.735.07,3.46,3.46,0,0,1-.465-.412q-1.7-1.695-3.4-3.394A2.832,2.832,0,0,0,22,17.2a.949.949,0,0,0-1.306.072.935.935,0,0,0-.052,1.3,6.52,6.52,0,0,0,.686.723c1.086,1.09,2.18,2.172,3.26,3.268.505.512.478.823-.061,1.3a58.338,58.338,0,0,1-7.854,5.826,1.041,1.041,0,0,1-1.254,0,58.355,58.355,0,0,1-7.854-5.826c-.539-.477-.567-.787-.062-1.3,1.124-1.14,2.261-2.267,3.392-3.4.132-.132.268-.262.395-.4a1.045,1.045,0,0,0,.113-1.5,1.02,1.02,0,0,0-1.5.1c-.673.649-1.327,1.319-1.989,1.98q-.927.926-1.854,1.851c-.292.29-.628.474-.975.123s-.162-.684.129-.976Q7.547,18,9.885,15.66a4.8,4.8,0,0,0,.428-.453,1.048,1.048,0,0,0-.054-1.368.992.992,0,0,0-1.36.018c-.236.2-.448.434-.669.654Q6.288,16.45,4.346,18.389a2.711,2.711,0,0,1-.466.41.567.567,0,0,1-.787-.109.529.529,0,0,1,.013-.738,5.3,5.3,0,0,1,.385-.407q2.424-2.427,4.849-4.854a3.4,3.4,0,0,0,.532-.607.924.924,0,0,0-.132-1.25.9.9,0,0,0-1.25-.056,10.027,10.027,0,0,0-.813.772Q4.8,13.422,2.928,15.3q-.154.154-.31.308c-.3.29-.633.458-.986.137-.37-.336-.188-.68.094-.975.344-.361.7-.71,1.054-1.063.587-.589,1.185-1.168,1.759-1.769a1,1,0,0,0,.107-1.446.966.966,0,0,0-1.49.049c-.578.538-1.114,1.121-1.688,1.663-.506.477-1.024.345-1.15-.32a11.517,11.517,0,0,1,.74-7.667A7.486,7.486,0,0,1,7.034.116a8.844,8.844,0,0,1,8.672,3.8c.321.425.437.307.69-.037A9.039,9.039,0,0,1,23.914,0,8.008,8.008,0,0,1,31.93,6.965a12.287,12.287,0,0,1,.121,2.054"
                    transform="translate(0 0)"
                    fill="#fff"
                  />
                </g>
              </svg>
            </div>
          </Link>
        </div>
      </div>

      <style jsx global>{`
        .navbar{
          background: var(--site-nav-bg, rgba(255,255,255,.78));
          border-bottom: 1px solid var(--site-border);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
        }

        .util-row{
          display:flex;
          align-items:center;
          gap:8px;
        }

        .brand-group{
          display:flex;
          align-items:center;
          gap:10px;
        }

        .brand-controls{
          display:flex;
          align-items:center;
          gap:6px;
        }

        .navbar .nav-link{
          color: var(--site-text);
          font-weight: 700;
        }

        .navbar .nav-link:hover,
        .navbar .dropdown-item:hover{
          color: var(--site-primary);
        }

        .navbar .nav-link.active,
        .navbar .dropdown-item.active,
        .navbar .dropdown-toggle.active{
          color: var(--site-primary) !important;
        }

        .navbar .dropdown-menu{
          border-color: var(--site-border);
          background: var(--site-surface);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 20px 50px rgba(0,0,0,.12);
        }

        .navbar .dropdown-item{
          color: var(--site-text);
        }

        .brand-wordmark{
          display:inline-block;
          font-family: "LateefCustom", "Ping AR LT", serif;
          font-size: clamp(2.2rem, 4vw, 3.8rem);
          line-height: 1;
          color: var(--site-primary);
          text-decoration: none;
          text-shadow: 0 10px 24px rgba(0,0,0,.08);
          white-space: nowrap;
        }

        .btnnow{
          background: linear-gradient(135deg, var(--site-primary), var(--site-primary-2));
          color:#fff;
          border-radius:999px;
          padding:.75rem 1.15rem;
          display:flex;
          align-items:center;
          gap:.5rem;
          box-shadow: 0 14px 30px rgba(24,165,88,.24);
        }

        .btnnow:hover{
          background: linear-gradient(135deg, var(--site-primary-2), var(--site-primary));
        }

        .btnserch{
          background: linear-gradient(135deg, var(--site-primary), var(--site-primary-2));
          color:#fff;
          width:46px;
          height:46px;
          border-radius:50%;
          display:flex;
          align-items:center;
          justify-content:center;
        }

        .btnserch .search-icon{
          color:#fff;
          font-size:22px;
        }

        .areasearch{
          position:absolute;
          inset-inline-end: 100px;
          top: 50%;
          transform: translateY(-50%);
          background: var(--site-surface);
          border:1px solid var(--site-border);
          border-radius:16px;
          padding:8px 10px;
          display:none;
          box-shadow:0 16px 36px rgba(0,0,0,.12);
        }

        .areasearch.active{ display:block }

        .areasearch .inputser{
          display:flex;
          align-items:center;
          gap:8px;
          background: transparent;
          border: none;
          margin-top: 0;
          width: auto;
        }

        .areasearch .inputser .searchnon{
          color:#fff;
          cursor:pointer;
          background: linear-gradient(135deg, var(--site-primary), var(--site-primary-2));
          border-radius:10px;
          padding:8px;
          font-size: 18px;
        }

        .areasearch input{
          border:none;
          outline:none;
          min-width:220px;
          color:var(--site-text);
          background: transparent;
        }

        .theme-toggle{
          display:flex;
          align-items:center;
          justify-content:center;
          width:40px;
          height:40px;
          border-radius:12px;
          border:1px solid var(--site-border);
          background: var(--site-soft);
          cursor:pointer;
          transition:transform .15s ease;
          color: var(--site-text);
        }

        .theme-toggle:hover{ transform: translateY(-1px) }
        .theme-toggle i{ font-size:20px }

        @media (min-width: 992px){
          .util-row{ gap:12px }
          .brand-controls{ margin-inline-start:auto }
        }

        @media (max-width: 991.98px){
          .brand-group{ gap:10px }
          .brand-controls{ gap:6px }
          .navbar-toggler{ order:3 }
          .btn_search{ order:4 }
          .areasearch{ inset-inline-end: 70px }
          .brand-wordmark{
            font-size: 2.3rem;
          }
        }

        @media (max-width: 480px){
          .brand-wordmark{ font-size: 2rem; }
        }

        body.reels-mode .brand-wordmark{
          color: #fff;
          text-shadow: 0 10px 24px rgba(0,0,0,.5);
        }
      `}</style>
    </nav>
  )
}