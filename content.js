let currentTimeout = null;
let activeJob = null;

let activeTimeouts = [];

console.log("Perusall booster content script active.");

// Listen for captured data from background.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TRIGGER_HEARTBEAT_WITH_HEADERS") {
    
    chrome.storage.local.get(['heartbeatEnabled'], (data) => {
      if (data.heartbeatEnabled !== false) {
        console.log("Received new trigger, starting a bounded batch of 4 heartbeats.");
        startBoundedBatch(activeJob);
      } else {
        console.log("Heartbeat booster is disabled. Allowing only original heartbeat.");
      }
    });
    
  }else if (message.type === "FETCH_PROGRESS") {
    fetchProgressMetrics();
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
  const delays = [15000, 30000, 45000];

  delays.forEach((delay, index) => {
    const timeoutId = setTimeout(() => {
      fireFetch(index + 1);
    }, delay);
    activeTimeouts.push(timeoutId);
  });

  
}

async function fireFetch() {
  // Read the URL and headers directly from storage
  chrome.storage.local.get(['perusallUrl', 'perusallHeaders', 'heartbeatEnabled'], async (data) => {

    if (data.heartbeatEnabled === false) {
      console.log("Heartbeat booster is disabled. Skipping automated heartbeat.");
      return;
    }

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

// Fetch Reading Time, Reading Percentage, and Annotations
async function fetchProgressMetrics() {
  chrome.storage.local.get(['courseId', 'assignmentId', 'perusallHeaders'], async (data) => {
    if (!data.courseId || !data.assignmentId) {
      console.log("[Booster] Missing courseId or assignmentId for progress fetch.");
      return;
    }

    const progressUrl = `https://backend-production.perusall.com/courses/${data.courseId}/assignments/${data.assignmentId}/progress?partNum=1`;
    const requestHeaders = {
      ...(data.perusallHeaders || {})
    };

    try {
      const response = await fetch(progressUrl, {
        method: "GET",
        headers: requestHeaders,
        credentials: "include"
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const json = await response.json();
      if (json && json.metrics) {
        await chrome.storage.local.set({ progressMetrics: json.metrics });
        console.log("[Booster] Progress metrics updated:", json.metrics);
      }
    } catch (err) {
      console.error("[Booster] Progress metrics fetch error:", err);
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
  badge.style.padding = '6px 12px';
  badge.style.borderRadius = '20px';
  badge.style.fontSize = '12px';
  badge.style.zIndex = '999999';
  badge.style.pointerEvents = 'none';
  badge.style.fontFamily = 'sans-serif';

  document.body.appendChild(badge);
  updateBadgeState();
}

function updateBadgeState() {
  const badge = document.getElementById('perusall-booster-badge');
  if (!badge) return;

  chrome.storage.local.get(['heartbeatEnabled'], (data) => {
    const isEnabled = data.heartbeatEnabled !== false;
    if (isEnabled) {
      badge.style.backgroundColor = '#16a34a';
      badge.style.color = 'white';
      badge.textContent = '⚡Perusall Booster Active';
    } else {
      badge.style.backgroundColor = '#64748b';
      badge.style.color = 'white';
      badge.textContent = 'Perusall Booster Disabled';
    }
  });
}

// Listen for settings changes to update badge and active timeouts in real-time
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === 'local' && changes.heartbeatEnabled) {
    updateBadgeState();
    if (changes.heartbeatEnabled.newValue === false) {
      // Clear any pending automated timeouts when toggled off
      activeTimeouts.forEach(t => clearTimeout(t));
      activeTimeouts = [];
    }
  }
});

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', createBadge);
} else {
  createBadge();
}