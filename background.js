// background.js

// Function to update the DNR rule based on the value
async function updatePerusallRule(presetValue) {
  if (!presetValue) return;

  // If 'random' is chosen, you can handle it or use a default/fallback number
  const multiplier = presetValue === 'random' ? 5 : parseInt(presetValue, 10);

  const rule = {
    id: 1,
    priority: 1,
    action: {
      type: "redirect",
      redirect: {
        // \1 preserves the full URL path + all params before increment
        regexSubstitution: "\\1" + multiplier
      }
    },
    condition: {
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
    console.log(`DNR Rule updated: increment set to ${multiplier}`);
  } catch (err) {
    console.error("Failed to update DNR rule:", err);
  }
}

// 1. Run when extension starts/installs
chrome.runtime.onInstalled.addListener(async () => {
  const result = await chrome.storage.local.get('presetValue');
  if (result.presetValue) {
    updatePerusallRule(result.presetValue);
  }
});

// 2. Listen for changes when user changes the dropdown in popup.js
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.presetValue) {
    updatePerusallRule(changes.presetValue.newValue);
  }
});