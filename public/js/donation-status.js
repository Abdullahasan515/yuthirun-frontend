// server/public/js/donation-status.js
(function(){
  const statusContainer = document.getElementById('status-container');
  const successMessage  = document.getElementById('success-message');
  const sessionId       = window.DONATION_SESSION_ID;

  if (!sessionId) {
    statusContainer.innerHTML = '<p>معرِّف الجلسة مفقود.</p>';
    return;
  }

  async function checkStatus() {
    try {
      const res = await fetch(`/api/donate/status?session_id=${encodeURIComponent(sessionId)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { status } = await res.json();

      if (status === 'completed') {
        statusContainer.style.display = 'none';
        successMessage.style.display  = 'block';
      } else if (status === 'pending') {
        setTimeout(checkStatus, 2000);
      } else {
        statusContainer.innerHTML = `
          <h1>عذراً، لم نتمكّن من تأكيد الدفع.</h1>
          <p>يرجى المحاولة لاحقًا أو التواصل معنا.</p>
        `;
      }
    } catch (err) {
      console.error('Error fetching status:', err);
      statusContainer.innerHTML = `
        <h1>حدث خطأ أثناء التحقق.</h1>
        <p>يرجى المحاولة لاحقًا.</p>
      `;
    }
  }

  checkStatus();
})();
