chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    if (details.url.includes("active_time") || details.url.includes("active-time")) {
      const headersMap = {};
      
      if (details.requestHeaders) {
        for (const header of details.requestHeaders) {
          const lowerName = header.name.toLowerCase();
          // Store them with their exact intended casing
          if (lowerName === 'x-csrf-token') {
            headersMap['X-Csrf-Token'] = header.value;
          }
          if (lowerName === 'x-perusall-client-user-id') {
            headersMap['X-Perusall-Client-User-Id'] = header.value;
          }
        }
      }

      console.log("Captured URL & Normalized Headers:", details.url, headersMap);

      chrome.storage.local.set({
        perusallUrl: details.url,
        perusallHeaders: headersMap
      }, () => {
        console.log("Saved URL & Headers to storage:", details.url, headersMap);
      });

      if (details.tabId !== -1) {
        chrome.tabs.sendMessage(details.tabId, {
          type: "TRIGGER_HEARTBEAT_WITH_HEADERS",
          url: details.url,
        }).catch(() => {});
      }
    }
  },
  { urls: ["https://*.perusall.com/*"] },
  ["requestHeaders"]
);