// path: lib/googleEmailClient.js
let googleScriptPromise = null;

function loadGoogleScript() {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('هذا الإجراء يعمل داخل المتصفح فقط'));
  }

  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-google-gsi="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener(
        'error',
        () => reject(new Error('تعذر تحميل خدمة Google')),
        { once: true }
      );
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.googleGsi = 'true';
    script.onload = () => resolve();
    script.onerror = () =>
      reject(new Error('تعذر تحميل خدمة التحقق من Google'));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
}

export async function requestGoogleCredential() {
  await loadGoogleScript();

  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    throw new Error('NEXT_PUBLIC_GOOGLE_CLIENT_ID غير موجود');
  }

  return new Promise((resolve, reject) => {
    const old = document.getElementById('google-verify-overlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'google-verify-overlay';
    overlay.innerHTML = `
      <div class="google-verify-card">
        <button type="button" class="google-verify-close" aria-label="إغلاق">×</button>
        <h3>تحقق من البريد للمتابعة</h3>
        <p>سجّل الدخول بحساب Google المطابق للبريد المكتوب في النموذج.</p>
        <div id="google-verify-button"></div>
      </div>
    `;

    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      background: 'rgba(0,0,0,.45)',
      display: 'grid',
      placeItems: 'center',
      zIndex: '99999',
      padding: '16px',
    });

    document.body.appendChild(overlay);

    const card = overlay.querySelector('.google-verify-card');
    const closeBtn = overlay.querySelector('.google-verify-close');
    const buttonSlot = overlay.querySelector('#google-verify-button');

    Object.assign(card.style, {
      width: '100%',
      maxWidth: '420px',
      background: '#fff',
      borderRadius: '18px',
      padding: '24px',
      direction: 'rtl',
      textAlign: 'center',
      position: 'relative',
      boxShadow: '0 20px 60px rgba(0,0,0,.2)',
    });

    Object.assign(closeBtn.style, {
      position: 'absolute',
      top: '10px',
      left: '10px',
      border: 'none',
      background: 'transparent',
      fontSize: '24px',
      cursor: 'pointer',
      lineHeight: '1',
    });

    let finished = false;

    const cleanup = () => {
      if (finished) return;
      finished = true;
      try {
        window.google?.accounts?.id?.cancel?.();
      } catch {}
      overlay.remove();
    };

    closeBtn.onclick = () => {
      cleanup();
      reject(new Error('تم إلغاء التحقق من المستخدم'));
    };

    window.google.accounts.id.initialize({
      client_id: clientId,
      auto_select: true,
      callback: (response) => {
        const credential = response?.credential;
        cleanup();

        if (!credential) {
          reject(new Error('فشل التحقق من المستخدم'));
          return;
        }

        resolve(credential);
      },
    });

    window.google.accounts.id.renderButton(buttonSlot, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'pill',
      locale: 'ar',
      width: 280,
    });
  });
}
