// Background service worker for cross-tab coordination
chrome.runtime.onInstalled.addListener(() => {
  console.log('[Not Too Far Extension] Companion active.');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Broadcast from one tab to all other active streaming tabs
  chrome.tabs.query({}, (tabs) => {
    tabs.forEach((tab) => {
      if (tab.id !== sender?.tab?.id) {
        chrome.tabs.sendMessage(tab.id, message).catch(() => {});
      }
    });
  });
  sendResponse({ status: 'relayed' });
  return true;
});
