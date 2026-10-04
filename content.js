let heartbeatTimer = null;
let activeJob = null;

console.log("Perusall booster content script active.");

// Listen for captured data from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TRIGGER_HEARTBEAT_WITH_HEADERS") {
    if (!activeJob || activeJob.url !== message.url) {
      activeJob = {
        url: message.url,
        csrf: message.csrf,
        client_id: message.client_id,
      };
      console.log("Received new active job configuration with headers, starting 15s loop.");
      startLoop(activeJob);
    }
  }
});

function startLoop(job) {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
  }

  // Fire immediately once
  fireFetch(job);

  // Repeat every 15 seconds (4 times per minute)
  heartbeatTimer = setInterval(() => {
    if (activeJob) {
      fireFetch();
    }
  }, 15000);
}

async function fireFetch() {
  // Read the URL and headers directly from storage
  chrome.storage.local.get(['perusallUrl', 'perusallHeaders'], async (data) => {
    if (!data.perusallUrl) {
      console.error("❌ [Booster] No URL found in storage.");
      return;
    }

    const requestHeaders = {
      ...(data.perusallHeaders || {})
    };

    console.log("Dispatching fetch with storage headers:", requestHeaders);

    try {
      const response = await fetch(data.perusallUrl, {
        method: "POST",
        headers: requestHeaders,
        credentials: "include" // Automatically attaches session cookies
      });

      console.log(`⚡ [Booster] Heartbeat sent! Status: ${response.status} at ${new Date().toLocaleTimeString()}`);
    } catch (err) {
      console.error("❌ [Booster] Fetch error:", err);
    }
  });
}

// Visual badge
function createBadge() {
  if (document.getElementById('perusall-booster-badge')) return;
  const badge = document.createElement('div');
  badge.id = 'perusall-booster-badge';
  badge.style.position = 'fixed';
  badge.style.bottom = '10px';
  badge.style.right = '10px';
  badge.style.backgroundColor = '#16a34a';
  badge.style.color = 'white';
  badge.style.padding = '6px 12px';
  badge.style.borderRadius = '20px';
  badge.style.fontSize = '12px';
  badge.style.zIndex = '999999';
  badge.style.pointerEvents = 'none';
  badge.textContent = `⚡ Perusall Multiplier Active (Headers Cloned)`;
  document.body.appendChild(badge);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createBadge);
} else {
  createBadge();
}