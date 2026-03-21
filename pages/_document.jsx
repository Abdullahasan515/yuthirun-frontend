
  // client/pages/_document.jsx
import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html lang="ar" dir="rtl">
      <Head>
        <link rel="preconnect" href="https://euqstlacutrqjvhhaedr.supabase.co" crossOrigin="" />
        <link href="https://cdn.jsdelivr.net/npm/boxicons@2.1.2/css/boxicons.min.css" rel="stylesheet" />
        <link rel="stylesheet" href="/css/bootstrap.min.css" />
        <link rel="stylesheet" href="/css/error-pages.css" />
        <link rel="stylesheet" href="/css/slick-theme.css" />
        <link rel="stylesheet" href="/css/about-association.css" />
        <link rel="stylesheet" href="/css/publications_and_reports.css" />
        <link rel="stylesheet" href="/css/Program_Details.css" />
        <link rel="stylesheet" href="/css/volunteerrequest.css" />
        <link rel="stylesheet" href="/css/toastr.min.css" />
        <link rel="stylesheet" href="/css/volunteer_request.css" />
        <link rel="stylesheet" href="/css/demo.css" />
        <link rel="stylesheet" href="/css/intlTelInput.min.css" />
        <link rel="stylesheet" href="/css/principles.css" />
        <link rel="stylesheet" href="/css/companyrequest.css" />
        <link rel="stylesheet" href="/css/news.css" />
        <link rel="stylesheet" href="/css/swiper.css" />
        <link rel="stylesheet" href="/css/animate.css" />
        <link rel="stylesheet" href="/css/donate.css" />
        <link rel="stylesheet" href="/css/contact_us.css" />
        <link rel="stylesheet" href="/css/style.css" />
        <link rel="stylesheet" href="/css/news_details.css" />

        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var savedTheme = localStorage.getItem('siteTheme') || 'light';
                  document.documentElement.setAttribute('data-theme', savedTheme);
                } catch (e) {
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              })();
            `,
          }}
        />
      </Head>
      <body>
        <Main />
        <NextScript />

        <script src="https://js.stripe.com/v3/"></script>
        <script src="/js/jquery-3.7.1.min.js"></script>
        <script src="/js/bootstrap.min.js"></script>
        <script src="/js/slick.min.js"></script>
        <script src="/js/toastr.min.js"></script>
        <script src="/js/scrollreveal.min.js"></script>
        <script src="/js/intlTelInput.min.js"></script>
        <script src="/js/vanila_tilt.js"></script>
        <script src="/js/toastr-init.js"></script>
        <script src="/js/fancyapps.js"></script>
        <script src="/js/utils.js"></script>
      </body>
    </Html>
  );
}