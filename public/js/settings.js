document.addEventListener('DOMContentLoaded', () => {
  const colorPicker  = document.getElementById('color-picker');
  const imageInput   = document.getElementById('image-input');
  const previewBox   = document.getElementById('preview-box');
  const bgImageElem  = document.querySelector('.bg-image');
  const body         = document.body;

  function applyBackground({ color, imagePath }) {
    if (imagePath) {
      bgImageElem.src = imagePath;
      body.classList.remove('no-bg-image');
    } else {
      body.classList.add('no-bg-image');
      body.style.setProperty('--bg-dark', color);
      body.setAttribute('data-bg-color', color);
    }
    previewBox.style.background = `${color} ${imagePath ? `url('${imagePath}')` : ''} center/cover no-repeat`;
  }

  colorPicker.addEventListener('input', async () => {
    const color = colorPicker.value;
    applyBackground({ color, imagePath: null });

    await fetch('/admin/settings/color', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ color })
    });
  });

  imageInput.addEventListener('change', async () => {
    const file = imageInput.files[0];
    if (!file) return;
    const form = new FormData();
    form.append('backgroundImage', file);

    const res = await fetch('/admin/settings/image', {
      method: 'POST',
      body: form
    });
    const data = await res.json(); // { success, backgroundImage }
    applyBackground({ color: colorPicker.value, imagePath: data.backgroundImage });
  });
});
