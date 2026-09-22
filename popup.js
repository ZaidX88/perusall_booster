// popup.js
document.addEventListener('DOMContentLoaded', async () => {
  const result = await chrome.storage.local.get('incrementMultiplier');
  document.getElementById('multiplier').value = result.incrementMultiplier || '';
  document.getElementById('btn-save').addEventListener('click', saveRules);
});

async function saveRules() {
  const multInput = document.getElementById('multiplier');
  const multiplier = parseInt(multInput.value, 10);
  const status = document.getElementById('status');

  if (!multiplier || multiplier < 1) {
    status.textContent = '❌ Enter a valid number ≥ 1';
    status.style.color = 'red';
    return;
  }

  await chrome.storage.local.set({ incrementMultiplier: multiplier });

  // ✅ FIXED: Uses capture groups to PRESERVE the URL path and other params
  // Group 1 (\1): Everything from start up to and including "increment="
  // Group 2 (\2): The old numeric value (discarded in substitution)
  const rule = {
    id: 1,
    priority: 1,
    action: {
      type: "redirect",
      redirect: {
        // \1 preserves the full URL path + all params before increment
        // Then we append our new clean increment value
        regexSubstitution: "\\1" + multiplier
      }
    },
    condition: {
      // Capture group 1 = everything up to &increment= or ?increment=
      // Capture group 2 = the digits after increment=
      regexFilter: "(.*[?&]increment=)(\\d+)",
      resourceTypes: ["xmlhttprequest"],
      requestDomains: ["backend-production.perusall.com"]
    }
  };

  try {
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1],
      addRules: [rule]
    });
    status.textContent = `✅ Active! Setting increment to ${multiplier} on Perusall`;
    status.style.color = 'green';
  } catch (err) {
    status.textContent = '❌ ' + err.message;
    status.style.color = 'red';
  }
}