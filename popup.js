document.addEventListener('DOMContentLoaded', async () => {
  const enableToggle = document.getElementById('enableToggle');
  const statusDiv = document.getElementById('status');

  // Load saved state (defaults to true if unset)
  const result = await chrome.storage.local.get('heartbeatEnabled');
  const isEnabled = result.heartbeatEnabled !== false;
  enableToggle.checked = isEnabled;

  // Update storage when toggle state changes
  enableToggle.addEventListener('change', async (event) => {
    const enabled = event.target.checked;

    try {
      await chrome.storage.local.set({ heartbeatEnabled: enabled });

      statusDiv.textContent = enabled ? 'Saved: Booster enabled.' : 'Saved: Booster disabled.';
      statusDiv.style.color = enabled ? '#16a34a' : '#4b5563';

      setTimeout(() => {
        statusDiv.textContent = '';
      }, 1500);
    } catch (err) {
      statusDiv.textContent = 'Error saving state: ' + err.message;
      statusDiv.style.color = '#dc2626';
    }
  });
});