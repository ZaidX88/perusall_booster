document.addEventListener('DOMContentLoaded', async () => {
  const enableToggle = document.getElementById('enableToggle');
  const statusDiv = document.getElementById('status');
  const assignmentNameEl = document.getElementById('assignmentName');
  const assignmentIdEl = document.getElementById('assignmentId');

  const readingTimeEl = document.getElementById('readingTime');
  const readingPctEl = document.getElementById('readingPct');
  const annotationsCountEl = document.getElementById('annotationsCount');

  // Load saved state and identifiers
  const result = await chrome.storage.local.get([
    'heartbeatEnabled',
    'assignmentName',
    'assignmentId',
    'progressMetrics'
  ]);

  const isEnabled = result.heartbeatEnabled !== false;
  enableToggle.checked = isEnabled;

  if (result.assignmentName) {
    assignmentNameEl.textContent = result.assignmentName;
  }
  if (result.assignmentId) {
    assignmentIdEl.textContent = `ID: ${result.assignmentId}`;
  }

  if (result.progressMetrics) {
    updateMetricsUI(result.progressMetrics);
  }

  // Request fresh progress update from content script in the active tab
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab && activeTab.id) {
    chrome.tabs.sendMessage(activeTab.id, { type: "FETCH_PROGRESS" }).catch(() => {
      // Content script might not be loaded on non-Perusall pages
    });
  }

  // Toggle switch listener
  enableToggle.addEventListener('change', async (event) => {
    const enabled = event.target.checked;

    try {
      await chrome.storage.local.set({ heartbeatEnabled: enabled });

      statusDiv.textContent = enabled ? 'Saved: Booster enabled.' : 'Saved: Booster disabled.';
      statusDiv.style.color = enabled ? '#2563eb' : '#64748b';

      setTimeout(() => {
        statusDiv.textContent = '';
      }, 1500);
    } catch (err) {
      statusDiv.textContent = 'Error saving state: ' + err.message;
      statusDiv.style.color = '#dc2626';
    }
  });

  // Real-time storage observer
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      if (changes.assignmentName) {
        assignmentNameEl.textContent = changes.assignmentName.newValue || 'Not detected';
      }
      if (changes.assignmentId) {
        assignmentIdEl.textContent = changes.assignmentId.newValue ? `ID: ${changes.assignmentId.newValue}` : 'ID: Not detected';
      }
      if (changes.progressMetrics && changes.progressMetrics.newValue) {
        updateMetricsUI(changes.progressMetrics.newValue);
      }
    }
  });

  function updateMetricsUI(metrics) {
    // 1. Format Active Reading Time (Minutes -> Hrs & Mins)
    const minutes = metrics.activeReadingTimeMinutes || 0;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hrs > 0) {
      readingTimeEl.textContent = `${hrs}h ${mins}m`;
    } else {
      readingTimeEl.textContent = `${mins}m`;
    }

    // 2. Format Reading Percentage
    const readingDecimal = metrics.reading || 0;
    const readingPercent = (readingDecimal * 100).toFixed(1);
    readingPctEl.textContent = `${readingPercent}%`;

    // 3. Format Annotations Count
    annotationsCountEl.textContent = metrics.numAnnotations !== undefined ? metrics.numAnnotations : 0;
  }
});