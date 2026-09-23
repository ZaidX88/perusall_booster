// popup.js
document.addEventListener('DOMContentLoaded', async () => {
  const presetSelect = document.getElementById('preset');
  const statusDiv = document.getElementById('status');

  // 1. Load the previously saved preset when popup opens
  const result = await chrome.storage.local.get('presetValue');
  if (result.presetValue) {
    presetSelect.value = result.presetValue;
  }

  // 2. Save instantly when the user changes the dropdown selection
  presetSelect.addEventListener('change', async (event) => {
    const selectedValue = event.target.value;

    try {
      // Save to storage
      await chrome.storage.local.set({ presetValue: selectedValue });
      
      statusDiv.textContent = `✅ Saved! Preset set to ${selectedValue}`;
      statusDiv.style.color = 'green';

      // Clear status message after 1.5 seconds
      setTimeout(() => {
        statusDiv.textContent = '';
      }, 1500);
    } catch (err) {
      statusDiv.textContent = '❌ ' + err.message;
      statusDiv.style.color = 'red';
    }
  });
});