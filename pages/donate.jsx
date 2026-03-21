// pages/donate.jsx
import Link from 'next/link'
import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { CountryRegionData } from 'react-country-region-selector';
import PhoneInput from 'react-phone-input-2';
import ar from 'react-phone-input-2/lang/ar.json';
import 'react-phone-input-2/lib/style.css';

export default function Donate() {
  const router = useRouter();
  const { newsId } = router.query;

  const [projects, setProjects] = useState([]);
  const [newsItem, setNewsItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorLoadingProjects, setErrorLoadingProjects] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);
  const [lang, setLang] = useState('ar');

  const t = {
    ar: {
      breadcrumbHome: 'الرئيسية',
      breadcrumbDonate: 'تبرع الآن',
      pageTitleFallback: 'تفاصيل التبرع',
      donorDetails: 'تفاصيل المتبرع',
      donorName: 'اسم المتبرع',
      email: 'البريد الإلكتروني',
      phone: 'رقم الهاتف',
      chooseProject: '— اختر المشروع —',
      chooseCountry: 'اختر الدولة',
      chooseRegion: 'اختر المنطقة',
      message: 'رسالتك لنا (اختياري)',
      acknowledgeTitle: 'التعريف بالمتبرع',
      acknowledgeSub: 'لا بأس بذكر اسمي في لوائح الشرف والشكر',
      chooseAmount: 'اختر المبلغ المراد التبرع به',
      addAnotherAmount: 'إضافة مبلغ آخر',
      customAmountPh: 'أدخل المبلغ المخصص',
      methodTitle: 'طريقة التبرع',
      donateBtn: 'تبرع',
      redirecting: 'جاري التوجيه…',
      trustedBy: 'موثوق من',
      loadingProjects: 'جاري تحميل المشاريع...',
      loading: 'جاري التحميل...',
      fetchFail: 'فشل في جلب المشاريع',
      mustProject: 'يرجى اختيار المشروع',
      mustCountry: 'يرجى اختيار الدولة',
      mustRegion: 'يرجى اختيار المنطقة',
      invalidAmount: 'يرجى إدخال مبلغ صحيح',
      donateDetailsTitle: 'تبرع الآن',
      searchCountry: 'ابحث عن الدولة',
    },
    en: {
      breadcrumbHome: 'Home',
      breadcrumbDonate: 'Donate Now',
      pageTitleFallback: 'Donation Details',
      donorDetails: 'Donor Details',
      donorName: 'Donor Name',
      email: 'Email',
      phone: 'Phone Number',
      chooseProject: '— Select a Project —',
      chooseCountry: 'Select country',
      chooseRegion: 'Select region',
      message: 'Your message (optional)',
      acknowledgeTitle: 'Acknowledge Donor',
      acknowledgeSub: 'It is okay to mention my name on honor lists',
      chooseAmount: 'Choose the donation amount',
      addAnotherAmount: 'Add another amount',
      customAmountPh: 'Enter custom amount',
      methodTitle: 'Donation Method',
      donateBtn: 'Donate',
      redirecting: 'Redirecting…',
      trustedBy: 'Trusted by',
      loadingProjects: 'Loading projects...',
      loading: 'Loading...',
      fetchFail: 'Failed to fetch projects',
      mustProject: 'Please choose a project',
      mustCountry: 'Please choose a country',
      mustRegion: 'Please choose a region',
      invalidAmount: 'Please enter a valid amount',
      donateDetailsTitle: 'Donate Now',
      searchCountry: 'Search country',
    },
    tr: {
      breadcrumbHome: 'Ana Sayfa',
      breadcrumbDonate: 'Hemen Bağış Yap',
      pageTitleFallback: 'Bağış Detayları',
      donorDetails: 'Bağışçı Bilgileri',
      donorName: 'Bağışçı Adı',
      email: 'E-posta',
      phone: 'Telefon Numarası',
      chooseProject: '— Proje seçin —',
      chooseCountry: 'Ülke seçin',
      chooseRegion: 'Bölge seçin',
      message: 'Mesajınız (isteğe bağlı)',
      acknowledgeTitle: 'Bağışçıyı Tanıt',
      acknowledgeSub: 'Adımın teşekkür listelerinde yer alması uygun',
      chooseAmount: 'Bağış tutarını seçin',
      addAnotherAmount: 'Başka bir tutar ekle',
      customAmountPh: 'Özel tutar girin',
      methodTitle: 'Bağış Yöntemi',
      donateBtn: 'Bağış Yap',
      redirecting: 'Yönlendiriliyor…',
      trustedBy: 'Güvenilir',
      loadingProjects: 'Projeler yükleniyor...',
      loading: 'Yükleniyor...',
      fetchFail: 'Projeler alınamadı',
      mustProject: 'Lütfen bir proje seçin',
      mustCountry: 'Lütfen bir ülke seçin',
      mustRegion: 'Lütfen bir bölge seçin',
      invalidAmount: 'Lütfen geçerli bir tutar girin',
      donateDetailsTitle: 'Hemen Bağış Yap',
      searchCountry: 'Ülke ara',
    }
  };

  useEffect(() => {
    setHasMounted(true);
  }, []);

  useEffect(() => {
    const qpLang = typeof router.query.lang === 'string' ? router.query.lang : null;
    const stored = typeof window !== 'undefined' ? localStorage.getItem('siteLang') : null;
    const nextLang = qpLang || stored || 'ar';
    const safe = ['ar', 'en', 'tr'].includes(nextLang) ? nextLang : 'ar';
    setLang(safe);
  }, [router.query.lang]);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
      try { localStorage.setItem('siteLang', lang) } catch {}
    }
  }, [lang]);

  const [form, setForm] = useState({
    donorName: '',
    email: '',
    phone: '',
    project: newsId || '',
    country: '',
    state: '',
    message: '',
    acknowledge: false,
    amount: 20,
    customAmountToggle: false,
    customAmount: '',
    method: 'stripe'
  });

  const handleCountryChange = val => {
    setForm(f => ({ ...f, country: val, state: '' }));
  };
  const handleStateChange = val => {
    setForm(f => ({ ...f, state: val }));
  };
  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };
  const handleCardSelect = val => {
    setForm(f => ({ ...f, amount: val, customAmountToggle: false, customAmount: '' }));
  };

  // تهيئة وترجمة الدول والمناطق والتأكد من توافق البيانات مع Next.js 15 Turbopack
  const localizedCountries = useMemo(() => {
    let safeData = [];
    
    // استخراج المصفوفة بأمان لتجنب خطأ map is not a function
    if (Array.isArray(CountryRegionData)) {
      safeData = CountryRegionData;
    } else if (CountryRegionData?.default && Array.isArray(CountryRegionData.default)) {
      safeData = CountryRegionData.default;
    } else if (typeof CountryRegionData === 'object' && CountryRegionData !== null) {
      safeData = Object.values(CountryRegionData);
    }

    return safeData
      .filter(item => Array.isArray(item) && item.length >= 3)
      .map(countryData => {
        const originalName = countryData[0];
        const isoCode = countryData[1];
        const regionsStr = countryData[2];

        let localizedName = originalName;
        try {
          if (typeof Intl !== 'undefined' && Intl.DisplayNames) {
            const displayNames = new Intl.DisplayNames([lang], { type: 'region' });
            localizedName = displayNames.of(isoCode) || originalName;
          }
        } catch (e) {
          // Fallback
        }

        return { originalName, isoCode, localizedName, regionsStr };
      })
      .sort((a, b) => a.localizedName.localeCompare(b.localizedName, lang));
  }, [lang]);

  const selectedCountryData = useMemo(() => {
    return localizedCountries.find(c => c.originalName === form.country);
  }, [form.country, localizedCountries]);

  const regions = useMemo(() => {
    if (!selectedCountryData) return [];

    const saudiArabicRegions = [
      { name: 'الرياض', short: 'riyadh' },
      { name: 'مكة المكرمة', short: 'makkah' },
      { name: 'المدينة المنورة', short: 'madinah' },
      { name: 'القصيم', short: 'qassim' },
      { name: 'المنطقة الشرقية', short: 'eastern' },
      { name: 'عسير', short: 'asir' },
      { name: 'تبوك', short: 'tabuk' },
      { name: 'حائل', short: 'hail' },
      { name: 'الحدود الشمالية', short: 'northern-borders' },
      { name: 'جازان', short: 'jazan' },
      { name: 'نجران', short: 'najran' },
      { name: 'الباحة', short: 'bahah' },
      { name: 'الجوف', short: 'jouf' }
    ];

    const yemenArabicGovernorates = [
      { name: 'أمانة العاصمة', short: 'amanat-al-asimah' },
      { name: 'عدن', short: 'aden' },
      { name: 'أبين', short: 'abyan' },
      { name: 'الضالع', short: 'al-dhalee' },
      { name: 'البيضاء', short: 'al-bayda' },
      { name: 'الجوف', short: 'al-jawf' },
      { name: 'المهرة', short: 'al-mahrah' },
      { name: 'المحويت', short: 'al-mahwit' },
      { name: 'عمران', short: 'amran' },
      { name: 'ذمار', short: 'dhamar' },
      { name: 'حضرموت', short: 'hadramaut' },
      { name: 'حجة', short: 'hajjah' },
      { name: 'الحديدة', short: 'al-hudaydah' },
      { name: 'إب', short: 'ibb' },
      { name: 'لحج', short: 'lahij' },
      { name: 'مأرب', short: 'marib' },
      { name: 'ريمة', short: 'raymah' },
      { name: 'صعدة', short: 'saadah' },
      { name: 'صنعاء', short: 'sanaa' },
      { name: 'شبوة', short: 'shabwah' },
      { name: 'سقطرى', short: 'socotra' },
      { name: 'تعز', short: 'taizz' }
    ];

    const selectedIso = selectedCountryData.isoCode;
    const selectedOriginalName = selectedCountryData.originalName;

    if (
      selectedIso === 'SA' ||
      selectedOriginalName === 'Saudi Arabia'
    ) {
      return saudiArabicRegions;
    }

    if (
      selectedIso === 'YE' ||
      selectedOriginalName === 'Yemen'
    ) {
      return yemenArabicGovernorates;
    }

    if (!selectedCountryData.regionsStr) return [];

    return selectedCountryData.regionsStr
      .split('|')
      .map(r => {
        const parts = r.split('~');
        return { name: parts[0], short: parts[1] };
      })
      .filter(r => r.name);
  }, [selectedCountryData]);

  useEffect(() => {
    if (!hasMounted || !router.isReady) return;

    async function fetchProjects() {
      setLoading(true);
      try {
        const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';
        const apiUrl = newsId
          ? `${BASE}/api/donate/${newsId}`
          : `${BASE}/api/donate`;

        const res = await fetch(apiUrl, {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        });
        if (!res.ok) throw new Error(`فشل في جلب البيانات (الحالة: ${res.status})`);

        const data = await res.json();

        if (!newsId) {
          const list = Array.isArray(data) ? data : [];
          setProjects(list);
          setNewsItem(null);
        } else {
          setProjects(Array.isArray(data.projects) ? data.projects : []);
          const item = data.newsItem ?? (data._id ? data : null);
          if (item) {
            setNewsItem(item);
            setForm(f => ({ ...f, project: item._id }));
          }
        }

        setErrorLoadingProjects(false);
      } catch (error) {
        console.error('خطأ في جلب البيانات:', error);
        setErrorLoadingProjects(true);
        toast.error(t[lang].fetchFail);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, [hasMounted, router.isReady, newsId, lang]);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    if (!form.project) {
      toast.error(t[lang].mustProject);
      setLoading(false);
      return;
    }
    if (!form.country) {
      toast.error(t[lang].mustCountry);
      setLoading(false);
      return;
    }
    if (!form.state) {
      toast.error(t[lang].mustRegion);
      setLoading(false);
      return;
    }

    let amountToSend = form.amount;
    if (form.customAmountToggle) {
      const val = parseFloat(form.customAmount);
      if (isNaN(val) || val <= 0) {
        toast.error(t[lang].invalidAmount);
        setLoading(false);
        return;
      }
      amountToSend = val;
    }

    const payload = {
      donorName: form.donorName,
      email: form.email,
      phone: form.phone,
      project: form.project,
      country: form.country,
      state: form.state,
      message: form.message,
      acknowledge: form.acknowledge,
      customAmountToggle: form.customAmountToggle,
      customAmount: form.customAmount,
      amount: amountToSend,
      method: 'stripe'
    };

    const BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

    try {
      const res = await fetch(`${BASE}/api/donate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || data.error || `خطأ حالة ${res.status}`);
      const redirectUrl = data.checkout_url || data.paymentUrl || data.paypal_url;
      if (!redirectUrl) throw new Error('لم يتم العثور على رابط للدفع');
      window.location.href = redirectUrl;
    } catch (err) {
      console.error('Donation error:', err);
      toast.error('حدث خطأ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!hasMounted) {
    return <div className="containerr" style={{ padding: 30, fontSize: 18 }}>{t[lang].loading}</div>;
  }

  if (loading && projects.length === 0 && !errorLoadingProjects) {
    return <div className="containerr" style={{ padding: 30, fontSize: 18 }}>{t[lang].loadingProjects}</div>;
  }

  return (
    <>
      <Head>
        <title>{t[lang].donateDetailsTitle}</title>
      </Head>

      <ToastContainer position="top-center" />

      <div className="containerr">
        <section className="hedsid">
          <h6>
            <Link href="/">{t[lang].breadcrumbHome}</Link> / <span>{t[lang].breadcrumbDonate}</span>
          </h6>
        </section>

        <section className="aboutt">
          <h1>{newsItem?.title || t[lang].pageTitleFallback}</h1>

          {errorLoadingProjects && (
            <div style={{ color: '#128347', marginBottom: 20 }}>{t[lang].fetchFail}</div>
          )}

          <form className="body_donate" id="donateForm" onSubmit={handleSubmit}>
            <div className="right_donate">
              <h2>{t[lang].donorDetails}</h2>
              <div className="blowline" />

              <div className="input_donate">
                <input
                  type="text"
                  name="donorName"
                  placeholder={t[lang].donorName}
                  required
                  value={form.donorName}
                  onChange={handleChange}
                />
                <input
                  type="email"
                  name="email"
                  placeholder={t[lang].email}
                  required
                  value={form.email}
                  onChange={handleChange}
                />
              </div>

              <div className="input_donate">
                <div className="selectPhone">
                  <PhoneInput
                    country={'ye'}
                    preferredCountries={['ye']}
                    localization={lang === 'ar' ? ar : undefined}
                    value={form.phone}
                    onChange={(phone) => setForm({ ...form, phone })}
                    inputClass="inputPhoneI"
                    containerClass="phone-container"
                    buttonClass="phone-flag-button"
                    dropdownClass="phone-dropdown"
                    searchClass="phone-search-center"
                    searchStyle={{
                      textAlign: 'center',
                      direction: lang === 'ar' ? 'rtl' : 'ltr',
                    }}
                    enableSearch={true}
                    searchPlaceholder={t[lang].searchCountry}
                    placeholder={t[lang].phone}
                    className="inputPhoneI"
                    inputProps={{
                      name: 'phone',
                      required: true,
                    }}
                    specialLabel=""
                    containerStyle={{ direction: lang === 'ar' ? 'rtl' : 'ltr' }}
                  />
                </div>
                <select
                  id="project"
                  name="project"
                  className="form-select"
                  required
                  value={form.project}
                  onChange={handleChange}
                >
                  <option value="" disabled hidden>{t[lang].chooseProject}</option>

                  {newsItem ? (
                    <>
                      <option value={newsItem._id}>{newsItem.title}</option>
                      {projects
                        .filter(p => p._id !== newsItem._id)
                        .map(p => (
                          <option key={p._id} value={p._id}>
                            {p.title}
                          </option>
                        ))}
                    </>
                  ) : (
                    projects.map(p => (
                      <option key={p._id} value={p._id}>
                        {p.title}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="input_donate">
                <select
                  name="country"
                  className="form-select"
                  required
                  value={form.country}
                  onChange={(e) => handleCountryChange(e.target.value)}
                >
                  <option value="" disabled hidden>{t[lang].chooseCountry}</option>
                  {localizedCountries.map(c => (
                    <option key={c.isoCode} value={c.originalName}>
                      {c.localizedName}
                    </option>
                  ))}
                </select>
                <select
                  name="state"
                  className="form-select"
                  required
                  value={form.state}
                  onChange={(e) => handleStateChange(e.target.value)}
                >
                  <option value="" disabled hidden>{t[lang].chooseRegion}</option>
                  {regions.map(r => (
                    <option key={r.name} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input_donate">
                <textarea
                  name="message"
                  cols="30"
                  rows="5"
                  placeholder={t[lang].message}
                  value={form.message}
                  onChange={handleChange}
                />
              </div>

              <div className="inputCheck">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="defaultCheck1"
                  name="acknowledge"
                  checked={form.acknowledge}
                  onChange={handleChange}
                />
                <label className="form-check-label" htmlFor="defaultCheck1">
                  {t[lang].acknowledgeTitle}
                  <br />
                  {t[lang].acknowledgeSub}
                </label>
              </div>
            </div>

            <div className="leftdonateForm">
              <div className="mt-4">
                <label style={{ fontWeight: 'bold', fontSize: 16 }}>
                  {t[lang].chooseAmount}
                </label>

                <div className="cardsDonate">
                  {[20, 50, 100, 500, 1000, 2000].map(val => (
                    <div
                      key={val}
                      className={`cardDonate ${form.amount === val && !form.customAmountToggle ? 'active' : ''}`}
                      data-amount={val}
                      onClick={() => handleCardSelect(val)}
                      style={{ cursor: 'pointer' }}
                    >
                      <i className="bx bx-check" />
                      <span>${val}</span>
                    </div>
                  ))}
                </div>

                <div>
                  <div className="inputCheck anotherAmount">
                    <input
                      className="form-check-input inputCheckA"
                      type="checkbox"
                      id="customAmountToggle"
                      name="customAmountToggle"
                      checked={form.customAmountToggle}
                      onChange={handleChange}
                    />
                    <label className="form-check-label" htmlFor="customAmountToggle">
                      {t[lang].addAnotherAmount}
                    </label>
                  </div>
                </div>

                {form.customAmountToggle && (
                  <div className="input_donate">
                    <div className="inputPriceI input-group mb-3" style={{ maxWidth: 300 }}>
                      <span className="input-group-text textDI inputCA">$</span>
                      <input
                        type="number"
                        className="form-control inputCA"
                        name="customAmount"
                        min="1"
                        step="0.01"
                        value={form.customAmount}
                        onChange={handleChange}
                        placeholder={t[lang].customAmountPh}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <h5>{t[lang].methodTitle}</h5>

                <div className="cardsDonate">
                  <div
                    className={`cardDonateS active`}
                    style={{ cursor: 'default' }}
                  >
                    <i className="bx bx-check" />
                    <img src="/images/stripe-purple-300x300.svg" alt="Stripe" />
                  </div>
                </div>

                <p style={{ marginTop: 10, color: '#128347', fontSize: 14 }}>
                  Visa / MasterCard تتم معالجتها عبر Stripe
                </p>
              </div>

              <button type="submit" className="btnDonare" disabled={loading}>
                {loading ? t[lang].redirecting : t[lang].donateBtn}
              </button>

              <div className="mt-4">
                <h5>{t[lang].trustedBy}</h5>
                <div className="imgGC">
                  <img src="/images/stripe-purple-300x300.svg" alt="Stripe" />
                  <img src="/images/masterCardS.svg" alt="MasterCard" />
                  <img src="/images/visaa.svg" alt="Visa" />
                  <img src="/images/3d-secure.svg" alt="3D Secure" />
                  <div className="d-flex gap-2">
                    <img className="imgS" src="/images/secureCheckOut.svg" alt="Secure Checkout" />
                    <img className="imgS" src="/images/privacyProtected.svg" alt="Privacy Protected" />
                  </div>
                </div>
              </div>
            </div>
          </form>

          <div id="card-element-sub" className="mt-4" />
        </section>
      </div >

      <style jsx global>{`
        :root{
          --brand:#18A558;
          --brand-dark:#128347;
          --brand-light:#35C46F;
          --cream:#EEF9F2;
        }
        .blowline{ height:2px; background:linear-gradient(90deg,var(--brand),var(--brand-light)); border-radius:2px; }
        .body_donate .form-select,
        .body_donate input[type="text"],
        .body_donate input[type="email"],
        .body_donate input[type="number"],
        .body_donate textarea{
          border:1px solid rgba(24,165,88,.25);
          background:#fff;
          color:#128347;
        }
        .body_donate .form-select:focus,
        .body_donate input:focus,
        .body_donate textarea:focus{
          outline:none;
          border-color: var(--brand);
          box-shadow: 0 0 0 3px rgba(24,165,88,.12);
        }
        .cardsDonate .cardDonate{
          border:1.5px solid rgba(24,165,88,.25);
          background:#fff;
          color:#128347;
        }
        .cardsDonate .cardDonate.active{
          border-color: var(--brand);
          background: var(--cream);
          box-shadow: 0 6px 18px rgba(24,165,88,.12);
        }
        .cardsDonate .cardDonateS{
          border:1.5px solid rgba(24,165,88,.25);
          background:#fff;
        }
        .cardsDonate .cardDonateS.active{
          border-color: var(--brand);
          background: var(--cream);
          box-shadow: 0 6px 18px rgba(24,165,88,.12);
        }
        .input-group .input-group-text.textDI{
          background: var(--cream);
          color: var(--brand-dark);
          border-color: rgba(24,165,88,.25);
        }
        .btnDonare{
          background: var(--brand);
          color:#fff;
          border:none;
          border-radius:12px;
          padding:12px 18px;
          transition: background .2s ease, transform .1s ease;
        }
        .btnDonare:hover{ background: var(--brand-dark); transform: translateY(-1px); }
        .btnDonare:disabled{ background: var(--brand-light); opacity:.7; }
        .inputCheck .form-check-input:checked{
          background-color: var(--brand);
          border-color: var(--brand);
        }
        .inputCheck label{ color:#128347; }
        .right_donate h2, .leftdonateForm h5, .aboutt h1{ color:#128347; }
        .phone-container .form-control{
          border-radius: 10px !important;
          border:1px solid rgba(24,165,88,.25) !important;
          height: 44px !important;
        }
        .phone-flag-button{
          border:1px solid rgba(24,165,88,.25) !important;
          background:#fff !important;
        }
        .phone-dropdown{
          max-height:240px;
        }
        .phone-search-center{
          text-align: center !important;
        }
        .cardsDonate .cardDonate i,
        .cardsDonate .cardDonateS i{
          color: var(--brand);
        }
        .imgGC img.imgS{ height:32px }
        html[dir="rtl"] .react-tel-input .selected-flag{ right:auto; left:0; }
        html[dir="rtl"] .react-tel-input .form-control{ padding-right: 48px !important; padding-left: 12px !important; text-align: right; }
        html[dir="ltr"] .react-tel-input .form-control{ text-align: left; }
        .aboutt{ background: linear-gradient(180deg, rgba(238,249,242,.65), rgba(255,255,255,.0)); border-radius:16px; padding:8px; }
      `}</style>
    </>
  );
}