let currentImages = [];

document.addEventListener('DOMContentLoaded', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.tabs.sendMessage(tab.id, { action: "GET_IMAGES" }, (images) => {
    currentImages = images;
    updateCount(images.length);
    renderImages(sortImages(images, 'size'));
  });

  document.getElementById('sortBy').addEventListener('change', (e) => {
    renderImages(sortImages(currentImages, e.target.value));
  });
});

function sortImages(images, key) {
  return [...images].sort((a, b) => b[key] - a[key]);
}

function renderImages(images) {
  const container = document.getElementById('imageList');
  container.innerHTML = images.map((img, index) => `
    <div class="image-item">
      <img class="thumbnail" src="${img.displaySrc}" 
           onerror="this.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='">
      <div class="meta">
        <div class="dimension">${img.width} × ${img.height}</div>
        <div class="filename">${truncate(getFileName(img.originalSrc), 25)}</div>
      </div>
      <button class="download-btn" 
              data-src="${img.displaySrc}"
              data-filename="${getFileName(img.originalSrc)}">
        ↓ 下载
      </button>
    </div>
  `).join('');

  container.querySelectorAll('.download-btn').forEach(btn => {
    btn.addEventListener('click', handleDownload);
  });
}

async function handleDownload(e) {
  const btn = e.currentTarget;
  btn.disabled = true;
  btn.textContent = '下载中...';
  
  try {
    await chrome.downloads.download({
      url: btn.dataset.src,
      filename: btn.dataset.filename,
      conflictAction: 'uniquify'
    });
  } catch (error) {
    console.error('下载失败:', error);
    alert('下载失败，请尝试右键另存为');
  } finally {
    btn.disabled = false;
    btn.textContent = '↓ 下载';
  }
}

function getFileName(url) {
  try {
    const parsed = new URL(url);
    let filename = parsed.pathname.split('/').pop() || 'image';
    
    // 清理特殊字符
    filename = filename
      .replace(/[^a-zA-Z0-9\-._]/g, '_')
      .split(/[#?]/)[0];
    
    // 补充扩展名
    if (!filename.includes('.')) {
      const ext = parsed.pathname.split('.').pop().slice(0, 4);
      filename += ext ? `.${ext}` : '.jpg';
    }
    
    return filename;
  } catch {
    return `image_${Date.now()}.jpg`;
  }
}

function truncate(str, maxLength) {
  return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
}

function updateCount(count) {
  document.getElementById('count').textContent = `找到 ${count} 张图片`;
}