document.addEventListener('DOMContentLoaded', async () => {
  const enableToggle = document.getElementById('enableToggle');
  const statusDiv = document.getElementById('status');
  const assignmentNameEl = document.getElementById('assignmentName');
  const assignmentIdEl = document.getElementById('assignmentId');

  const readingTimeEl = document.getElementById('readingTime');
  const readingPctEl = document.getElementById('readingPct');
  const annotationsCountEl = document.getElementById('annotationsCount');
  const boosterBtns = document.querySelectorAll('.booster-btn');

  // Load saved state and stored identifiers
  const result = await chrome.storage.local.get([
    'heartbeatEnabled',
    'boosterMultiplier',
    'assignmentName',
    'assignmentId',
    'progressMetrics'
  ]);

  const isEnabled = result.heartbeatEnabled !== false;
  enableToggle.checked = isEnabled;

  const currentMultiplier = result.boosterMultiplier || '4x';
  updateBoosterSelection(currentMultiplier);

  if (result.assignmentName) {
    assignmentNameEl.textContent = result.assignmentName;
  }
  if (result.assignmentId) {
    assignmentIdEl.textContent = `ID: ${result.assignmentId}`;
  }

  if (result.progressMetrics) {
    updateMetricsUI(result.progressMetrics);
  }

  // Request fresh progress update from content script
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab && activeTab.id) {
    chrome.tabs.sendMessage(activeTab.id, { type: "FETCH_PROGRESS" }).catch(() => {});
  }

  // Toggle Listener
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

  // Booster Selection Listener
  boosterBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const selectedVal = btn.getAttribute('data-value');
      updateBoosterSelection(selectedVal);

      try {
        await chrome.storage.local.set({ boosterMultiplier: selectedVal });

        statusDiv.textContent = `Saved: ${selectedVal} booster active.`;
        statusDiv.style.color = '#2563eb';

        setTimeout(() => {
          statusDiv.textContent = '';
        }, 1500);
      } catch (err) {
        statusDiv.textContent = 'Error saving state: ' + err.message;
        statusDiv.style.color = '#dc2626';
      }
    });
  });

  function updateBoosterSelection(value) {
    boosterBtns.forEach(btn => {
      if (btn.getAttribute('data-value') === value) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });
  }

  // Real-time Storage Observer
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
      if (changes.boosterMultiplier && changes.boosterMultiplier.newValue) {
        updateBoosterSelection(changes.boosterMultiplier.newValue);
      }
    }
  });

  function updateMetricsUI(metrics) {
    const minutes = metrics.activeReadingTimeMinutes || 0;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hrs > 0) {
      readingTimeEl.textContent = `${hrs}h ${mins}m`;
    } else {
      readingTimeEl.textContent = `${mins}m`;
    }

    const readingDecimal = metrics.reading || 0;
    const readingPercent = (readingDecimal * 100).toFixed(1);
    readingPctEl.textContent = `${readingPercent}%`;

    annotationsCountEl.textContent = metrics.numAnnotations !== undefined ? metrics.numAnnotations : 0;
  }
});