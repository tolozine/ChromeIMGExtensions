async function getImageData(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return {
      displaySrc: URL.createObjectURL(blob),
      originalSrc: url
    };
  } catch {
    return { displaySrc: url, originalSrc: url };
  }
}

async function getAllImages() {
  const results = await Promise.all(
    Array.from(document.images).map(async (img) => {
      const { displaySrc, originalSrc } = await getImageData(img.src);
      return {
        displaySrc,
        originalSrc,
        width: img.naturalWidth || img.width,
        height: img.naturalHeight || img.height,
        size: (img.naturalWidth || img.width) * (img.naturalHeight || img.height)
      };
    })
  );
  
  // 过滤无效图片
  return results.filter(img => img.width > 10 && img.height > 10);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "GET_IMAGES") {
    getAllImages().then(images => sendResponse(images));
    return true;
  }
});