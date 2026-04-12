// pages/news/[id].jsx
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import dayjs from "dayjs";
import "dayjs/locale/ar";
import relativeTime from "dayjs/plugin/relativeTime";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

dayjs.extend(relativeTime);
dayjs.locale("ar");

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "";
const API_BASE = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/$/, "");

const mediaUrl = (u) => {
  if (!u) return u;
  if (/^https?:\/\//i.test(u)) return u;
  if (u.startsWith("/")) return `${API_BASE}${u}`;
  return `${API_BASE}/${u}`;
};

const NewsDetailPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [newsItem, setNewsItem] = useState(null);
  const [lastNews, setLastNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    if (!router.isReady) return;

    const fetchNewsDetail = async () => {
      try {
        setLoading(true);

        const resDetail = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/news/${id}`);
        if (!resDetail.ok) throw new Error("فشل في جلب تفاصيل الخبر");
        const detailData = await resDetail.json();

        const resLast = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/news?limit=5&exclude=${id}`);
        if (!resLast.ok) throw new Error("فشل في جلب آخر الأخبار");
        const lastData = await resLast.json();

        setNewsItem(detailData);
        setLastNews(lastData);
        setLoading(false);
      } catch (err) {
        setError(err.message || "حدث خطأ أثناء جلب البيانات");
        setLoading(false);
      }
    };

    fetchNewsDetail();
  }, [id, router.isReady]);

  useEffect(() => {
    if (!router.isReady) return;
    const full = SITE_URL ? `${SITE_URL}${router.asPath}` : (typeof window !== "undefined" ? window.location.href : "");
    setShareUrl(full);
  }, [router.isReady, router.asPath]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: newsItem.title,
          text: newsItem.text || "",
          url: shareUrl,
        });
      } else if (navigator.clipboard && shareUrl) {
        await navigator.clipboard.writeText(shareUrl);
        alert("تم نسخ رابط الخبر!");
      } else {
        prompt("انسخ الرابط:", shareUrl);
      }
    } catch (err) {
      console.error("خطأ في المشاركة:", err);
    }
  };

  const donatedPercentage =
    newsItem?.amount > 0
      ? Math.min(((newsItem.donatedAmount || 0) / newsItem.amount) * 100, 100)
      : 0;

  const remainingAmount =
    newsItem?.amount > 0
      ? newsItem.amount - (newsItem.donatedAmount || 0)
      : 0;

  const encodedTitle = encodeURIComponent(newsItem?.title || "");
  const encodedURL = encodeURIComponent(shareUrl || "");
  const waLink = `https://wa.me/?text=${encodeURIComponent(`${newsItem?.title || ""}\n${shareUrl}`)}`;
  const fbLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedURL}`;
  const twLink = `https://twitter.com/intent/tweet?url=${encodedURL}&text=${encodedTitle}`;
  const tgLink = `https://t.me/share/url?url=${encodedURL}&text=${encodedTitle}`;

  if (loading) {
    return (
      <div className="news-detail-page text-center py-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">جارٍ التحميل...</span>
        </div>
        <p className="mt-3">جارٍ تحميل تفاصيل الخبر...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="news-detail-page alert alert-danger text-center py-5">
        <p>حدث خطأ: {error}</p>
        <button className="btn btn-primary mt-3" onClick={() => router.reload()}>
          إعادة المحاولة
        </button>
      </div>
    );
  }

  if (!newsItem) {
    return (
      <div className="news-detail-page alert alert-warning text-center py-5">
        <p>الخبر غير موجود</p>
        <Link href="/news/type/all" className="btn btn-primary mt-3">
          العودة للأخبار
        </Link>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{newsItem.title} - أخبار الجمعية</title>
        <meta name="description" content={newsItem.text} />
        {shareUrl && <link rel="canonical" href={shareUrl} />}
        <meta property="og:type" content="article" />
        {shareUrl && <meta property="og:url" content={shareUrl} />}
        <meta property="og:title" content={newsItem.title} />
        <meta property="og:description" content={newsItem.text || ""} />
        {newsItem.images?.[0] && <meta property="og:image" content={newsItem.images[0]} />}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={newsItem.title} />
        <meta name="twitter:description" content={newsItem.text || ""} />
        {newsItem.images?.[0] && <meta name="twitter:image" content={newsItem.images[0]} />}
      </Head>

      <div className="news-detail-page">
        <div className="containerr">
          <section className="hedsid py-3">
            <h6 className="d-flex gap-1">
              <Link href="/" className="text-decoration-none">
                الرئيسية /
              </Link>
              <Link href={`/news/type/${newsItem.newsType || "all"}`} className="text-decoration-none">
                الاخبار والاعلانات /
              </Link>
              <span className="text-muted">تفاصيل الخبر</span>
            </h6>
          </section>

          <section className="allnewss">
            <div className="allnewsdetails">
              <div className="right_newsdeta">
                <h1 className="fw-bold fs-1">{newsItem.title}</h1>
                <h5>{newsItem.text}</h5>

                <div className="icons_ns">
                  <div className="icon_n">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="30"
                      height="27.954"
                      viewBox="0 0 30 27.954"
                      fill="currentColor"
                    >
                      <path d="M15.117,65.276H29.227c.845,0,.869.023.869.858q0,7.887,0,15.774a3.13,3.13,0,0,1-3.255,3.27q-12.046.013-24.093,0c-1.6,0-2.594-1.079-2.622-2.86C.1,80.781.118,79.24.118,77.7q0-5.792,0-11.584c0-.811.026-.837.826-.838q7.086,0,14.172,0M14.762,68.9c-.349,0-.7.006-1.047,0-.574-.012-.823.3-.83.837q-.012.986,0,1.972a.729.729,0,0,0,.788.822c.719.009,1.438,0,2.156,0a.615.615,0,0,0,.694-.68q.006-.585.007-1.171c.005-1.848.129-1.8-1.768-1.78M5.591,70.671c0,.327-.007.655,0,.982.017.673.212.868.892.878.634.009,1.269,0,1.9,0a.74.74,0,0,0,.829-.784c.02-.716.015-1.432,0-2.148a.645.645,0,0,0-.7-.694c-.388-.013-.778-.006-1.166-.009-1.853-.015-1.782-.079-1.767,1.776m14.767,0c0,.328-.009.657,0,.984.022.7.2.87.889.879.636.009,1.272-.006,1.908,0A.744.744,0,0,0,24,71.706c.014-.656.02-1.313,0-1.969-.017-.615-.25-.822-.886-.839-.328-.009-.656,0-.985,0-1.884-.013-1.784-.08-1.773,1.772m0,8.4c0,.287-.005.574,0,.86.016.751.214.959.944.972q.86.015,1.721,0c.755-.014.97-.236.982-1.01.009-.533.007-1.065,0-1.6-.008-.848-.2-1.029-1.065-1.038-.266,0-.533,0-.8,0-1.9-.005-1.793-.121-1.786,1.814m-14.767,0c0,1.832,0,1.832,1.809,1.832S9.221,80.9,9.229,79.1c.008-1.87.118-1.856-1.849-1.846-1.881.01-1.8-.124-1.79,1.821m10.939-.012c0-.327-.009-.655,0-.982.018-.562-.235-.84-.807-.823-.327.01-.655,0-.982,0-1.86,0-1.86,0-1.86,1.836,0,1.813,0,1.813,1.8,1.813,1.845,0,1.845,0,1.843-1.844" transform="translate(-0.098 -57.232)" />
                    </svg>
                    <p>{dayjs(newsItem.createdAt).format("D MMM YYYY")}</p>
                  </div>

                  <div className="icon_n">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="30"
                      height="30.019"
                      viewBox="0 0 30 30.019"
                      fill="currentColor"
                    >
                      <path d="M30,14.988A15,15,0,1,1,15,0,15.031,15.031,0,0,1,30,14.988m-2.417.029A12.572,12.572,0,1,0,15.017,27.582,12.638,12.638,0,0,0,27.582,15.017" />
                      <path d="M120.6,63.564c0,.934.016,1.868-.008,2.8a.955.955,0,0,0,.437.88c1.223.9,2.433,1.813,3.641,2.731a1.2,1.2,0,0,1,.538,1.318,1.224,1.224,0,0,1-.959.918,1.144,1.144,0,0,1-.986-.246q-2.3-1.7-4.579-3.425a1.249,1.249,0,0,1-.5-1.065c0-2.276-.005-4.552.006-6.827a1.2,1.2,0,1,1,2.406,0c.014.972,0,1.945,0,2.918Z" transform="translate(-104.382 -52.444)" />
                    </svg>
                    <p>{dayjs(newsItem.createdAt).fromNow()}</p>
                  </div>

                  <div className="icon_n">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20.547"
                      height="30.764"
                      viewBox="0 0 20.547 30.764"
                      fill="currentColor"
                    >
                      <path d="M10.032,30.764a1.228,1.228,0,0,1-.455-.5q-2.909-5.266-5.822-10.53C2.861,18.109,1.939,16.5,1.09,14.86A9.769,9.769,0,0,1,.033,9.519a10.021,10.021,0,0,1,2.981-6.51A9.947,9.947,0,0,1,10,0,10,10,0,0,1,17.49,2.966,10,10,0,0,1,20.439,8.8a10.873,10.873,0,0,1-1.519,7.1c-2.532,4.5-5,9.028-7.5,13.544-.155.28-.317.556-.466.839a1.156,1.156,0,0,1-.44.478Zm.231-25.572a5.079,5.079,0,1,0,5.1,5.059,5.075,5.075,0,0,0-5.1-5.059" />
                    </svg>
                    <p>{newsItem.location || "غير محدد"}</p>
                  </div>
                </div>

                <div className="imgnewsd">
                  {newsItem.images && newsItem.images.length > 0 ? (
                    <Swiper
                      modules={[Pagination, Navigation, Autoplay]}
                      slidesPerView={1}
                      spaceBetween={0}
                      pagination={{ clickable: true }}
                      navigation
                      autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                      }}
                      loop
                      speed={1300}
                      className="swiper mySwiper5 swiper-wrapper"
                    >
                      {newsItem.images.map((img, index) => (
                        <SwiperSlide key={index} className="swiper-slide">
                          <img
                            src={mediaUrl(img)}
                            alt={`صورة الخبر ${index + 1}`}
                          />
                        </SwiperSlide>
                      ))}

                      <div className="swiper-button-next"></div>
                      <div className="swiper-button-prev"></div>
                    </Swiper>
                  ) : (
                    <div className="bg-light p-5 text-center rounded">
                      <p className="text-muted">لا توجد صور متاحة لهذا الخبر</p>
                    </div>
                  )}

                  <div className="sotial_news ">
                    <button
                      onClick={handleShare}
                      className="share-btn btn btn-primary"
                    >
                      ساعد بمشاركة المنشور
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="17.979"
                        height="19.58"
                        viewBox="0 0 17.979 19.58"
                        fill="white"
                      >
                        <path d="M3.316,0A3.268,3.268,0,0,0,.008,3.16a3.306,3.306,0,0,0,2.84,3.378A3.139,3.139,0,0,0,5.4,5.8a.512.512,0,0,1,.7-.048Q8.619,7.215,11.16,8.643a.48.48,0,0,1,.279.613,2.438,2.438,0,0,0,.006,1.1.421.421,0,0,1-.222.535c-1.758.993-3.515,1.987-5.262,3-.268.155-.392,0-.557-.134a3.3,3.3,0,1,0,1.17,2.853,1.035,1.035,0,0,0,.024-.377c-.174-.562.1-.821.57-1.078,1.659-.909,3.3-1.86,4.935-2.8a.432.432,0,0,1,.571.034,3.252,3.252,0,0,0,3.967.055,3.3,3.3,0,0,0-2.188-5.943,3.121,3.121,0,0,0-1.782.7.4.4,0,0,1-.538.05C10.35,6.211,8.566,5.187,6.771,4.183c-.284-.159-.213-.367-.2-.582A3.275,3.275,0,0,0,3.959.052,3.294,3.294,0,0,0,3.316,0" />
                      </svg>
                    </button>

                    <div className="icon_sot">
                      <a href={waLink} target="_blank" rel="noopener noreferrer">
                        <i className="bx bxl-whatsapp " style={{ color: "#25D366" }}></i>
                      </a>
                      <a href={fbLink} target="_blank" rel="noopener noreferrer">
                        <i className="bx bxl-facebook" style={{ color: "#1877F2" }}></i>
                      </a>
                      <a href={twLink} target="_blank" rel="noopener noreferrer">
                        <i className="bx bxl-twitter" style={{ color: "#1DA1F2" }}></i>
                      </a>
                      <a href={tgLink} target="_blank" rel="noopener noreferrer">
                        <i className="bx bxl-telegram" style={{ color: "#0088cc" }}></i>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="left_newsdeta d-none d-md-block" style={{ flex: "0 0 300px" }}>
                <div className="newssss mb-3">
                  <h3>آخر الأخبار</h3>
                  <div className="line_news bg-primary mb-3" style={{ height: "2px", width: "50px" }}></div>
                </div>

                <div className="allcnew">
                  {lastNews.length > 0 ? (
                    lastNews.slice(0, 4).map(item => (
                      <Link
                        key={item._id}
                        href={`/news/${item._id}`}
                        className="text-decoration-none text-dark"
                      >
                        <div className="lastnews">
                          <div className="imgnewsd" style={{ flex: "0 0 100px" }}>
                            <img
                              src={item.firstImage ? mediaUrl(item.firstImage) : "/default-news.jpg"}
                              alt={item.title}
                              className="rounded"
                              style={{ width: "100px", height: "80px", objectFit: "cover" }}
                            />
                          </div>
                          <div className="textlnews">
                            <h6 className="fw-bold">{item.title}</h6>
                            <p className="text-muted small">{item.text}</p>
                            <div className="nononews">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16.477"
                                height="16.487"
                                viewBox="0 0 16.477 16.487"
                                fill="currentColor"
                              >
                                <path d="M16.476,8.232A8.238,8.238,0,1,1,8.24,0a8.256,8.256,0,0,1,8.236,8.232m-1.327.016a6.905,6.905,0,1,0-6.9,6.9,6.941,6.941,0,0,0,6.9-6.9" />
                                <path d="M119.511,61.677c0,.513.009,1.026,0,1.538a.524.524,0,0,0,.24.483c.672.493,1.336,1,2,1.5a.659.659,0,0,1,.3.724.672.672,0,0,1-.527.5.628.628,0,0,1-.541-.135q-1.261-.935-2.515-1.881a.686.686,0,0,1-.275-.585c0-1.25,0-2.5,0-3.75a.662.662,0,1,1,1.322,0c.008.534,0,1.068,0,1.6.Z" transform="translate(-110.603 -55.57)" />
                              </svg>
                              <p>{dayjs(item.createdAt).fromNow()}</p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <p className="text-muted text-center">لا توجد أخبار أخرى حالياً</p>
                  )}
                </div>
              </div>
            </div>

            <div className="textnewsbetails mt-5">
              <h1 className="mb-4">{newsItem.title}</h1>

              {newsItem.textDetails && (
                <p className="lh-lg fs-5">{newsItem.textDetails}</p>
              )}

              {newsItem.newsType !== "achievements" && newsItem.amount && (
                <div className="mt-5">
                  {newsItem.donatedAmount < newsItem.amount ? (
                    <>
                      <div className="d-flex justify-content-between mb-2 fs-5">
                        <div>
                          <span className="fw-bold">متبقي</span>
                          <br />
                          <span className="text-danger">{remainingAmount.toLocaleString()}$</span>
                        </div>
                        <div>
                          <span className="fw-bold">مدفوع</span>
                          <br />
                          <span className="text-success">{(newsItem.donatedAmount || 0).toLocaleString()}$</span>
                        </div>
                      </div>

                      <div className="mb-3">
                        <progress
                          className="progress-shooting-star detail-progress"
                          value={newsItem.donatedAmount || 0}
                          max={newsItem.amount || 1}
                        />
                      </div>

                      <Link href={{ pathname: "/donate", query: { newsId: newsItem._id } }} legacyBehavior>
                        <a className="donate-btn-link">
                          <span className="span1"></span>
                          <span className="span2"></span>
                          <span className="span3"></span>
                          <span className="span4"></span>
                          تبرع ←
                        </a>
                      </Link>
                    </>
                  ) : (
                    <div className="alert alert-success text-center fs-4 py-3">
                      تم إكمال المبلغ بنجاح
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="left_newsdeta mobile-only">
              <div className="newssss ">
                <h3>آخر الأخبار</h3>
                <div className="line_news" style={{ height: "2px", width: "50px" }}></div>
              </div>

              <div className="allcnew">
                {lastNews.length > 0 ? (
                  lastNews.slice(0, 5).map(item => (
                    <Link
                      key={item._id}
                      href={`/news/${item._id}`}
                    >
                      <div className="lastnews">
                        <div className="imgnewsd" style={{ flex: "0 0 100px" }}>
                          <img
                            src={item.firstImage ? mediaUrl(item.firstImage) : "/default-news.jpg"}
                            alt={item.title}
                          />
                        </div>
                        <div className="textlnews">
                          <h6>{item.title}</h6>
                          <p>{item.text}</p>
                          <div className="nononews">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16.477"
                              height="16.487"
                              viewBox="0 0 16.477 16.487"
                              fill="currentColor"
                            >
                              <path d="M16.476,8.232A8.238,8.238,0,1,1,8.24,0a8.256,8.256,0,0,1,8.236,8.232m-1.327.016a6.905,6.905,0,1,0-6.9,6.9,6.941,6.941,0,0,0,6.9-6.9" />
                              <path d="M119.511,61.677c0,.513.009,1.026,0,1.538a.524.524,0,0,0,.24.483c.672.493,1.336,1,2,1.5a.659.659,0,0,1,.3.724.672.672,0,0,1-.527.5.628.628,0,0,1-.541-.135q-1.261-.935-2.515-1.881a.686.686,0,0,1-.275-.585c0-1.25,0-2.5,0-3.75a.662.662,0,1,1,1.322,0c.008.534,0,1.068,0,1.6.Z" transform="translate(-110.603 -55.57)" />
                            </svg>
                            <p>{dayjs(item.createdAt).fromNow()}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <p className="text-muted text-center">لا توجد أخبار أخرى حالياً</p>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>

      <style jsx global>{`
        .news-detail-page{
          --detail-primary: #18a558;
          --detail-primary-2: #35c46f;
          --detail-border: rgba(24,165,88,.18);
          --detail-soft: rgba(24,165,88,.10);
          --detail-text: #123222;
          --detail-muted: #557463;
          --detail-heading-color: var(--detail-text);
        }

        .news-detail-page .text-primary{
          color: var(--detail-primary) !important;
        }

        .news-detail-page .btn.btn-primary,
        .news-detail-page .share-btn.btn.btn-primary{
          background-color: var(--detail-primary) !important;
          border-color: var(--detail-primary) !important;
        }

        .news-detail-page .btn.btn-primary:hover,
        .news-detail-page .share-btn.btn.btn-primary:hover{
          background-color: var(--detail-primary-2) !important;
          border-color: var(--detail-primary-2) !important;
        }

        .news-detail-page .icon_n,
        .news-detail-page .nononews{
          color: var(--detail-primary) !important;
        }

        .news-detail-page .right_newsdeta h1,
        .news-detail-page .textnewsbetails h1,
        .news-detail-page .newssss h3{
          color: var(--detail-heading-color) !important;
        }

        .news-detail-page .right_newsdeta h5,
        .news-detail-page .textnewsbetails p,
        .news-detail-page .textlnews p{
          color: var(--detail-muted) !important;
        }

        .news-detail-page .bg-primary{
          background-color: var(--detail-primary) !important;
        }

        .news-detail-page .text-success{
          color: var(--detail-primary) !important;
        }

        .news-detail-page .line_news{
          background-color: var(--detail-primary) !important;
        }

        .news-detail-page .lastnews h6,
        .news-detail-page .textlnews h6{
          color: var(--detail-text) !important;
        }

        .news-detail-page .alert-success{
          background: rgba(24,165,88,.10) !important;
          border-color: rgba(24,165,88,.20) !important;
          color: var(--detail-primary) !important;
        }

        .news-detail-page .bg-light{
          background: rgba(24,165,88,.06) !important;
          border: 1px solid rgba(24,165,88,.14);
        }

        .news-detail-page .detail-progress{
          width: 100%;
          height: 14px;
          display: block;
          appearance: none;
          -webkit-appearance: none;
          border: none;
          border-radius: 999px;
          overflow: hidden;
          background: transparent;
        }

        .news-detail-page .detail-progress::-webkit-progress-bar{
          background: rgba(24,165,88,.12);
          border-radius: 999px;
        }

        .news-detail-page .detail-progress::-webkit-progress-value{
          background: linear-gradient(
            90deg,
            #18a558 0%,
            #35c46f 35%,
            #7df0a7 50%,
            #35c46f 65%,
            #18a558 100%
          );
          background-size: 200% 100%;
          border-radius: 999px;
          animation: detail-progress-glow 2s linear infinite;
        }

        .news-detail-page .detail-progress::-moz-progress-bar{
          background: linear-gradient(
            90deg,
            #18a558 0%,
            #35c46f 35%,
            #7df0a7 50%,
            #35c46f 65%,
            #18a558 100%
          );
          background-size: 200% 100%;
          border-radius: 999px;
          animation: detail-progress-glow 2s linear infinite;
        }

        /* pages/news/[id].jsx - dark mode big titles fix */
        html.dark .news-detail-page,
        body.dark .news-detail-page,
        body.dark-mode .news-detail-page,
        .dark .news-detail-page,
        .dark-mode .news-detail-page,
        [data-theme="dark"] .news-detail-page,
        [data-bs-theme="dark"] .news-detail-page,
        [data-mode="dark"] .news-detail-page,
        [theme="dark"] .news-detail-page{
          --detail-heading-color: #ffffff;
        }

        @keyframes detail-progress-glow{
          0%{
            background-position: 200% 0;
          }
          100%{
            background-position: -200% 0;
          }
        }
      `}</style>
    </>
  );
};

export default NewsDetailPage;
