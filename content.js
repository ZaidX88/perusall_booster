let currentTimeout = null;
let activeJob = null;

let activeTimeouts = [];

console.log("Perusall booster content script active.");

// Listen for captured data from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TRIGGER_HEARTBEAT_WITH_HEADERS") {
    
    console.log("Received new trigger, starting a bounded batch of 4 heartbeats.");
    startBoundedBatch(activeJob);
    
  }
});

function startBoundedBatch(job) {
  // Clear any existing scheduled batch sequence so they don't overlap chaotically
  // if (currentTimeout) {
  //   clearTimeout(currentTimeout);
  //   currentTimeout = null;
  // }

  // Fire the first one immediately
  //fireFetch(job);

  // Schedule the remaining 3 heartbeats spaced 15 seconds apart
  activeTimeouts.forEach(t => clearTimeout(t));
  activeTimeouts = [];

  // Define 4 staggered heartbeats (0s, 15s, 30s, 45s)
  const delays = [0, 15000, 30000, 45000];

  delays.forEach((delay, index) => {
    const timeoutId = setTimeout(() => {
      fireFetch(index + 1);
    }, delay);
    activeTimeouts.push(timeoutId);
  });

  
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

    const separator = data.perusallUrl.includes('?') ? '&' : '?';
    const taggedUrl = `${data.perusallUrl}${separator}_booster=true`;

    try {
      const response = await fetch(taggedUrl, {
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