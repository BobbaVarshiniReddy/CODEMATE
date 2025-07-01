chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getApiKey") {
        chrome.storage.local.get("geminiApiKey", (result) => {
            sendResponse({ apiKey: result.geminiApiKey });
        });
        return true;
    }
    if (request.type === "SET_CONTAINER_OPEN") {
    chrome.storage.local.set({ [request.key]: true });
  }
});
