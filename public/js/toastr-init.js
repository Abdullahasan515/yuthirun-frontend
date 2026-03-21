// /public/js/contact-toast.js
toastr.options = {
  closeButton:       false,        
  progressBar:       false,         
  timeOut:           5000,          
  extendedTimeOut:   1000,         
  tapToDismiss:      true,         
  showMethod:        'fadeIn',      
  hideMethod:        'fadeOut',     
  showDuration:      300,             
  hideDuration:      300,           
  preventDuplicates: true             
};

document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('contact-page');
  if (!container) return;

  const isSuccess = container.dataset.success === 'true';
  const errorMsg  = container.dataset.error;

  if (isSuccess) {
    toastr.success('تم إرسال رسالتك بنجاح، شكرًا لتواصلك معنا!');
  } else if (errorMsg && errorMsg !== 'null') {
    toastr.error(errorMsg);
  }
});
