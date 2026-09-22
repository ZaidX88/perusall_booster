chrome.runtime.onInstalled.addListener(async () => {
  // Initialize with empty rules or load from storage
  const result = await chrome.storage.local.get('customParams');
  const params = result.customParams || [];
  
  if (params.length > 0) {
    const rule = {
      id: 1,
      priority: 1,
      action: {
        type: "redirect",
        redirect: {
          transform: {
            queryTransform: {
              addOrReplaceParams: params.map(p => ({ key: p.key, value: p.value }))
            }
          }
        }
      },
      condition: {
        urlFilter: "|http://localhost:3000/",
        resourceTypes: ["xmlhttprequest"]
      }
    };
    
    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: [1],
      addRules: [rule]
    });
  }
});