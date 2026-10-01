// Content script injecting the Not Too Far sync bridge into streaming provider tabs
const s = document.createElement('script');
s.src = chrome.runtime.getURL('extension-bridge.js');
s.onload = function () {
  this.remove();
};
(document.head || document.documentElement).appendChild(s);

// Relay window messages to chrome extension background port
window.addEventListener('message', (event) => {
  if (event.data?.source === 'NOT_TOO_FAR_EXTENSION') {
    chrome.runtime.sendMessage(event.data);
  }
});

// Relay background messages back to the window
chrome.runtime.onMessage.addListener((message) => {
  window.postMessage(message, '*');
});
