// pages/_app.jsx
import Head from 'next/head';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import AppBase from 'next/app';
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  const { footerData = {}, newsTypesObject, searchQuery, pageType } = pageProps;

  useEffect(() => {
    const disableZoom = (e) => { if (e.ctrlKey) e.preventDefault(); };
    const disableKeyZoom = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '+' || e.key === '-' || e.key === '=')) e.preventDefault();
    };
    window.addEventListener('wheel', disableZoom, { passive: false });
    window.addEventListener('keydown', disableKeyZoom);
    return () => {
      window.removeEventListener('wheel', disableZoom);
      window.removeEventListener('keydown', disableKeyZoom);
    };
  }, []);

  return (
    <>
      <Head>
        <title>يؤثرون</title>
        <meta name="description" content="منصة يؤثرون للتبرعات" />
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/images/Afaq.jpg" type="image/jpeg" />
      </Head>

      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar pageType={pageType} newsTypesObject={newsTypesObject} searchQuery={searchQuery} />
        <main style={{ flex: 1 }}>
          <Component {...pageProps} />
        </main>
        <Footer footer={footerData} />
      </div>
    </>
  );
}

App.getInitialProps = async (appContext) => {
  const appProps = await AppBase.getInitialProps(appContext);
  const { ctx } = appContext;
  const isServer = !!ctx.req;
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '';
  const footerApiUrl = isServer ? `${baseUrl}/api/footerConfig` : `/api/footerConfig`;

  let footerData = {};
  try {
    const res = await fetch(footerApiUrl);
    if (res.ok) footerData = await res.json();
    else console.error('Failed to fetch footerConfig, status:', res.status);
  } catch (err) {
    console.error('Error loading footerConfig:', err);
  }

  const newsTypesObject = {
    all: 'الكل',
    campaigns: 'الحملات',
    humanCases: 'الحالات الإنسانية',
    achievements: 'الإنجازات'
  };

  const { pathname, query } = appContext.ctx;
  let pageType = 'index';
  if (pathname === '/news') {
    const newsType = query.type || 'all';
    pageType = `news-${newsType}`;
  } else if (pathname.startsWith('/aboutUs')) {
    pageType = 'aboutUs';
  } else if (pathname.startsWith('/contactUs')) {
    pageType = 'contactUs';
  }
  const searchQuery = query.search || '';

  return {
    ...appProps,
    pageProps: {
      ...appProps.pageProps,
      footerData,
      newsTypesObject,
      pageType,
      searchQuery
    }
  };
};