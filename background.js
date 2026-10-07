chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    
    if (details.url.includes("_booster=true")) {
      console.log("_booster present");
      return;
    }

    // Intercept assignment document URLs to extract assignmentName and assignmentId
    if (details.url.includes("/documents/") && details.url.includes("assignmentId=")) {
      try {
        const parsedUrl = new URL(details.url);
        const pathParts = parsedUrl.pathname.split('/');
        const docIndex = pathParts.indexOf('documents');

        if (docIndex !== -1 && docIndex + 1 < pathParts.length) {
          const assignmentName = pathParts[docIndex + 1];
          const assignmentId = parsedUrl.searchParams.get('assignmentId');

          if (assignmentName && assignmentId) {
            chrome.storage.local.set({
              assignmentName: assignmentName,
              assignmentId: assignmentId
            });
            console.log("Captured assignment details:", assignmentName, assignmentId);
          }
        }
      } catch (err) {
        console.error("Error parsing assignment URL:", err);
      }
    }

    if (details.url.includes("active_time") || details.url.includes("active-time")) {
      const headersMap = {};

      
      if (details.requestHeaders) {
        console.log(details.requestHeaders)
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

      //console.log("Captured URL & Normalized Headers:", details.url, headersMap);

      chrome.storage.local.set({
        perusallUrl: details.url,
        perusallHeaders: headersMap
      }, () => {
        //console.log("Saved URL & Headers to storage:", details.url, headersMap);
      });

      if (details.tabId !== -1) {
        chrome.tabs.sendMessage(details.tabId, {
          type: "TRIGGER_HEARTBEAT_WITH_HEADERS",
          url: details.url,
        }).catch(() => {});
        console.log("TRIGGER_HEARTBEAT_WITH_HEADERS sent")
      }
    }
  },
  { urls: ["https://*.perusall.com/*"] },
  ["requestHeaders"]
);