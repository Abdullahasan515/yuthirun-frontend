//pages/news/type/[type].jsx
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import dayjs from 'dayjs';
import 'dayjs/locale/ar';
import relativeTime from 'dayjs/plugin/relativeTime';
import newsTypes from '@/constants/newsTypes';

dayjs.extend(relativeTime);
dayjs.locale('ar');

const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || '').replace(/\/$/, '');

const mediaUrl = (u) => {
  if (!u) return u;
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith('/')) return `${API_BASE}${u}`;
  return `${API_BASE}/${u}`;
};

const AchievementCard = ({ item }) => (
  <div className="card cardNews achievements-card" key={item._id}>
    <Link href={`/news/${item._id}`} className="image-wrapper">
      <img
        src={item.firstImage ? mediaUrl(item.firstImage) : '/images/default-news.jpg'}
        className="card-img-top"
        alt={item.title}
      />
      <span className="popcc">{dayjs(item.createdAt).format('D MMM YYYY')}</span>
    </Link>
    <div className="card-body">
      <h5 className="card-title fw-bold fs-5 titlmr">{item.title}</h5>
      <span className="popcc">{newsTypes[item.newsType] || item.newsType}</span>
      <p className="card-text">{item.text}</p>
      <p className="badge bg-secondary mr-10pc">{dayjs(item.createdAt).fromNow()}</p>
    </div>
  </div>
);

const DonationCardIncomplete = ({ item }) => (
  <div className="card cardNews" key={item._id}>
    <Link href={`/news/${item._id}`}>
      <img
        src={item.firstImage ? mediaUrl(item.firstImage) : '/images/default-news.jpg'}
        className="card-img-top"
        alt={item.title}
      />
    </Link>

    <Link href={`/news/${item._id}`}>
      <div className="card-body">
        <h5 className="card-title fw-bold fs-5 titlmr">{item.title}</h5>
        <span className="popcc">{newsTypes[item.newsType] || item.newsType}</span>
        <p className="card-text">{item.text}</p>
      </div>
    </Link>

    <p className="badge bg-secondary mr-10pc">{dayjs(item.createdAt).fromNow()}</p>

    <div className="tt">
      <div className="tt1">
        <p className="gf">مدفوع</p>
        <p className="cx true-amount">{item.donatedAmount}$</p>
      </div>
      <div className="tt1">
        <p className="gf">متبقي</p>
        <p className="cx loss-amount">{item.remainingAmount}$</p>
      </div>
    </div>

    <div className="tt2">
      <progress className="progress-shooting-star" value={item.donatedAmount} max={item.amount}></progress>
    </div>

    <Link href={{ pathname: '/donate', query: { newsId: item._id } }} legacyBehavior>
      <a className="donate-btn-link">
        <span className="span1"></span>
        <span className="span2"></span>
        <span className="span3"></span>
        <span className="span4"></span>
        تبرع ←
      </a>
    </Link>
  </div>
);

const DonationCardComplete = ({ item }) => (
  <div className="card cardNews" key={item._id}>
    <Link href={`/news/${item._id}`}>
      <img
        src={item.firstImage ? mediaUrl(item.firstImage) : '/images/default-news.jpg'}
        className="card-img-top"
        alt={item.title}
      />
    </Link>

    <Link href={`/news/${item._id}`}>
      <div className="card-body">
        <h5 className="card-title fw-bold fs-5 titlmr">{item.title}</h5>
        <span className="popcc">{newsTypes[item.newsType] || item.newsType}</span>
        <p className="card-text">{item.text}</p>
      </div>
    </Link>

    <p className="badge bg-secondary mr-10pc">{dayjs(item.createdAt).fromNow()}</p>

    <div className="tt">
      <div className="tt1">
        <p className="gf">المبلغ المكتمل</p>
        <p className="cx">{item.donatedAmount}$</p>
      </div>
      <div className="tt1">
        <p className="gf">المبلغ الزائد</p>
        <p className="cx">{item.remainingAmount}$</p>
      </div>
    </div>

    <div className="completed-text">تم إكتمال المبلغ</div>
  </div>
);

const NewsPage = () => {
  const router = useRouter();
  const { type = 'all', search = '' } = router.query;
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState(search);
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(prevState => !prevState);
  };

  useEffect(() => {
    if (!router.isReady) return;

    const fetchNews = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams({ type });
        if (search.trim()) params.set('search', search.trim());

        const res = await fetch(`/api/news?${params.toString()}`);
        if (!res.ok) throw new Error('فشل في جلب الأخبار');

        const data = await res.json();
        setNews(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
        toast.error('فشل في تحميل الأخبار');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [type, search, router.isReady]);

  if (loading) {
    return (
      <div className="news-type-page text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جارٍ التحميل...</span>
        </div>
        <p className="mt-3">جارٍ تحميل الأخبار...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-type-page alert alert-danger text-center py-5">
        <p>حدث خطأ: {error}</p>
        <button
          className="btn btn-primary mt-3"
          onClick={() => window.location.reload()}
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>أخبار الجمعية</title>
      </Head>

      <div className="news-type-page">
        <ToastContainer position="top-center" />

        <section className="hedsid">
          <h6>
            <Link href="/">الرئيسية</Link> /
            {type !== 'all' && (
              <Link href="/news/type/all">
                أخبار الجمعية
              </Link>
            )}
          </h6>
          <h6>{newsTypes[type] || 'كل الأخبار'}</h6>
        </section>

        <section className="allnewss">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="newss">
              <h1>{newsTypes[type] || 'كل الأخبار'}</h1>
            </div>

            <div className="drop" id="dummy">
              <button
                className="drop__btn"
                aria-expanded={isOpen ? "true" : "false"}
                aria-haspopup="true"
                type="button"
                onClick={toggleMenu}
              >
                {newsTypes[type] || "اختر النوع"}
              </button>

              <div className={`drop__items ${isOpen ? 'open' : ''}`} data-items>
                <div className="drop__items-inner">
                  {Object.entries(newsTypes).map(([key, label]) => (
                    <button
                      key={key}
                      className={`drop__btn ${type === key ? 'active' : ''}`}
                      value={key}
                      onClick={() => {
                        window.location.href = `/news/type/${key}`;
                      }}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="allcardnews">
            {news.length === 0 ? (
              <div className="alert alert-info text-center py-5">
                لا توجد أخبار متاحة حاليًا في هذا القسم
              </div>
            ) : (
              news.map((item) => {
                const isAchievement = item.newsType === 'achievements';
                const isDonationComplete = item.donatedAmount >= item.amount;

                if (isAchievement) {
                  return <AchievementCard key={item._id} item={item} />;
                } else if (!isDonationComplete) {
                  return <DonationCardIncomplete key={item._id} item={item} />;
                } else {
                  return <DonationCardComplete key={item._id} item={item} />;
                }
              })
            )}
          </div>
        </section>
      </div>

      <style jsx global>{`
        .news-type-page{
          --news-primary: #18a558;
          --news-primary-2: #35c46f;
          --news-accent-soft: rgba(34, 172, 96, 0.1);
          --news-border: rgba(44, 189, 61, 0.18);
          --news-text: #34b053;
          --news-muted: #557463;
        }

        .news-type-page .text-primary{
          color: var(--news-primary) !important;
        }

        .news-type-page .btn.btn-primary{
          background-color: var(--news-primary) !important;
          border-color: var(--news-primary) !important;
        }

        .news-type-page .btn.btn-primary:hover{
          background-color: var(--news-primary-2) !important;
          border-color: var(--news-primary-2) !important;
        }

        .news-type-page .newss h1{
          color: var(--news-text) !important;
        }

        .news-type-page .drop__btn{
          color: var(--news-text);
          border-color: var(--news-border);
        }

        .news-type-page .drop__btn.active{
          color: #fff !important;
          background: var(--news-primary) !important;
          border-color: var(--news-primary) !important;
        }

        .news-type-page .drop__items{
          border-color: var(--news-border);
        }

        .news-type-page .cardNews .card-title{
          color: var(--news-text) !important;
        }

        .news-type-page .cardNews .card-text{
          color: var(--news-muted) !important;
        }

        .news-type-page .popcc{
          color: var(--news-primary) !important;
        }

        .news-type-page .badge.bg-secondary{
          background-color: var(--news-primary-2) !important;
          color: #fff !important;
        }

        .news-type-page .true-amount{
          color: var(--news-primary) !important;
        }

        .news-type-page .loss-amount{
          color: #c66a2b !important;
        }

        .news-type-page .gf{
          color: var(--news-muted) !important;
        }

        .news-type-page .cx{
          color: var(--news-text) !important;
        }

        .news-type-page .completed-text{
          background: rgba(24,165,88,.12) !important;
          color: var(--news-primary) !important;
          border: 1px solid rgba(24,165,88,.22) !important;
        }

        .news-type-page .alert-info{
          background: rgba(24,165,88,.08) !important;
          border-color: rgba(24,165,88,.18) !important;
          color: var(--news-text) !important;
        }

        .news-type-page .progress-shooting-star::-webkit-progress-value{
          background: green;
        }

        .news-type-page .progress-shooting-star::-moz-progress-bar{
          background: green;
        }
      `}</style>
    </>
  );
};

export default NewsPage;