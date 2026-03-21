   document.addEventListener('DOMContentLoaded', () => {
      const btn = document.getElementById('shareBtn');

      btn.addEventListener('click', async (e) => {
        e.preventDefault();

        const shareData = {
          title: document.title,
          text: document.querySelector('h1')?.innerText || '',
          url: window.location.href
        };

        if (navigator.share) {
          try {
            await navigator.share(shareData);
            return;
          } catch (err) {
            console.error('فشل المشاركة عبر Web Share API:', err);
          }
        }

        if (window.client && typeof window.client.share === 'function') {
          window.client.share('auto', shareData);
          return;
        }

        window.prompt('انسخ هذا الرابط وشاركه حيث تريد:', shareData.url);
      });
      
    });


    