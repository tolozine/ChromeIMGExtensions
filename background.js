chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "PROXY_DOWNLOAD") {
    fetch(request.url)
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        chrome.downloads.download({
          url,
          filename: request.filename,
          saveAs: true
        });
        setTimeout(() => URL.revokeObjectURL(url), 10000);
      })
      .catch(error => console.error('代理下载失败:', error));
  }
});