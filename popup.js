document.addEventListener('DOMContentLoaded', async () => {
  const enableToggle = document.getElementById('enableToggle');
  const statusDiv = document.getElementById('status');
  const assignmentNameEl = document.getElementById('assignmentName');
  const assignmentIdEl = document.getElementById('assignmentId');

  // Load saved state and assignment details
  const result = await chrome.storage.local.get(['heartbeatEnabled', 'assignmentName', 'assignmentId']);

  const isEnabled = result.heartbeatEnabled !== false;
  enableToggle.checked = isEnabled;

  if (result.assignmentName) {
    assignmentNameEl.textContent = result.assignmentName;
  }
  if (result.assignmentId) {
    assignmentIdEl.textContent = `ID: ${result.assignmentId}`;
  }

  // Update toggle state
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

  // Listen for storage changes in real-time
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local') {
      if (changes.assignmentName) {
        assignmentNameEl.textContent = changes.assignmentName.newValue || 'Not detected';
      }
      if (changes.assignmentId) {
        assignmentIdEl.textContent = changes.assignmentId.newValue ? `ID: ${changes.assignmentId.newValue}` : 'ID: Not detected';
      }
    }
  });
});