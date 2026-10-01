/**
 * Antigravity Browser Extension Content Script
 * Injected into streaming provider DOMs to bridge playback events and command executions.
 */

const EXTENSION_SOURCE = 'ANTIGRAVITY_BROWSER_EXTENSION';
const APP_SOURCE = 'ANTIGRAVITY_WEB_APP';

function getActiveVideoElement() {
  return document.querySelector('video');
}

// 1. Listen for commands from Antigravity Web App via postMessage
window.addEventListener('message', (event) => {
  if (event.data?.source !== APP_SOURCE) return;

  const video = getActiveVideoElement();
  if (!video) return;

  const { action, timestamp } = event.data;

  switch (action) {
    case 'SYNC_COMMAND_PLAY':
      if (video.paused) {
        video.play().catch(console.warn);
      }
      break;

    case 'SYNC_COMMAND_PAUSE':
      if (!video.paused) {
        video.pause();
      }
      break;

    case 'SYNC_COMMAND_SEEK':
      if (typeof timestamp === 'number' && Math.abs(video.currentTime - timestamp) > 0.5) {
        video.currentTime = timestamp;
      }
      break;

    case 'REQUEST_SESSION_HEARTBEAT':
      window.postMessage(
        {
          source: EXTENSION_SOURCE,
          action: 'EXTENSION_PONG',
          currentTime: video.currentTime,
          paused: video.paused,
          clientTimestamp: Date.now(),
        },
        '*'
      );
      break;
  }
});

// 2. Broadcast local player interactions back to Antigravity room
function observeVideoElement(video) {
  const notifyStateChange = (stateType) => {
    window.postMessage(
      {
        source: EXTENSION_SOURCE,
        action: 'EXTERNAL_PLAYER_STATE_CHANGE',
        playbackState: stateType,
        timestamp: video.currentTime,
        clientTimestamp: Date.now(),
      },
      '*'
    );
  };

  video.addEventListener('play', () => notifyStateChange('PLAY'));
  video.addEventListener('pause', () => notifyStateChange('PAUSE'));
  video.addEventListener('seeking', () => notifyStateChange('SEEK'));
}

const initialVideo = getActiveVideoElement();
if (initialVideo) {
  observeVideoElement(initialVideo);
} else {
  const observer = new MutationObserver(() => {
    const video = getActiveVideoElement();
    if (video) {
      observeVideoElement(video);
      observer.disconnect();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}
