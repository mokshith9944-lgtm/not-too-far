/**
 * Not Too Far - Web Extension & In-Tab Playback Synchronization Bridge
 * 
 * Standardized protocol for bi-directional communication between
 * the Not Too Far Watch Room and external media tabs or embedded video players.
 */

(function () {
  const BRIDGE_CHANNEL = 'NOT_TOO_FAR_SYNC_BRIDGE_V1';
  const BRIDGE_VERSION = '1.0.0';

  console.log(`[Not Too Far Bridge v${BRIDGE_VERSION}] Initializing playback synchronization harness...`);

  // State cache
  let attachedVideo = null;
  let isRemoteSeeking = false;
  let lastReportedTime = 0;
  let heartbeatTimer = null;

  /**
   * Helper to locate primary media element on the current page
   */
  function locateVideoElement() {
    if (attachedVideo && document.contains(attachedVideo)) {
      return attachedVideo;
    }
    const videos = Array.from(document.querySelectorAll('video'));
    // Select largest visible video element (usually the main player)
    if (videos.length > 0) {
      videos.sort((a, b) => {
        const areaA = a.clientWidth * a.clientHeight;
        const areaB = b.clientWidth * b.clientHeight;
        return areaB - areaA;
      });
      attachedVideo = videos[0];
      attachVideoListeners(attachedVideo);
      return attachedVideo;
    }
    return null;
  }

  /**
   * Attach native DOM event listeners to the player
   */
  function attachVideoListeners(video) {
    if (!video || video._ntf_attached) return;
    video._ntf_attached = true;

    console.log('[Not Too Far Bridge] Attached to video element:', video);

    video.addEventListener('play', () => {
      if (isRemoteSeeking) return;
      notifyRoom('MEDIA_EVENT_PLAY', {
        currentTime: video.currentTime,
        playbackRate: video.playbackRate,
        timestamp: Date.now(),
      });
    });

    video.addEventListener('pause', () => {
      if (isRemoteSeeking) return;
      notifyRoom('MEDIA_EVENT_PAUSE', {
        currentTime: video.currentTime,
        timestamp: Date.now(),
      });
    });

    video.addEventListener('seeked', () => {
      if (isRemoteSeeking) {
        isRemoteSeeking = false;
        return;
      }
      notifyRoom('MEDIA_EVENT_SEEK', {
        currentTime: video.currentTime,
        timestamp: Date.now(),
      });
    });

    video.addEventListener('ratechange', () => {
      notifyRoom('MEDIA_EVENT_RATE_CHANGE', {
        playbackRate: video.playbackRate,
        timestamp: Date.now(),
      });
    });

    // Start 1-second precision heartbeat
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(() => {
      if (!video.paused && Math.abs(video.currentTime - lastReportedTime) > 0.4) {
        lastReportedTime = video.currentTime;
        notifyRoom('MEDIA_EVENT_HEARTBEAT', {
          currentTime: video.currentTime,
          duration: video.duration || 0,
          playbackRate: video.playbackRate,
          paused: video.paused,
          timestamp: Date.now(),
        });
      }
    }, 1000);
  }

  /**
   * Broadcast message to Not Too Far web application
   */
  function notifyRoom(type, payload) {
    window.postMessage(
      {
        source: 'NOT_TOO_FAR_EXTENSION',
        channel: BRIDGE_CHANNEL,
        type,
        payload,
      },
      '*'
    );
  }

  /**
   * Handle incoming control commands from Not Too Far Room Controller
   */
  window.addEventListener('message', (event) => {
    // Only accept messages intended for this bridge
    if (!event.data || event.data.channel !== BRIDGE_CHANNEL) return;
    if (event.data.source === 'NOT_TOO_FAR_EXTENSION') return; // Ignore own messages

    const { type, payload } = event.data;
    const video = locateVideoElement();

    if (!video) {
      console.warn('[Not Too Far Bridge] Received command but no active video element found:', type);
      return;
    }

    switch (type) {
      case 'COMMAND_PLAY':
        if (video.paused) {
          isRemoteSeeking = true;
          video.play().catch((err) => console.warn('[Not Too Far Bridge] Play failed:', err));
          setTimeout(() => { isRemoteSeeking = false; }, 200);
        }
        break;

      case 'COMMAND_PAUSE':
        if (!video.paused) {
          isRemoteSeeking = true;
          video.pause();
          setTimeout(() => { isRemoteSeeking = false; }, 200);
        }
        break;

      case 'COMMAND_SEEK':
        if (typeof payload?.targetTime === 'number') {
          const delta = Math.abs(video.currentTime - payload.targetTime);
          if (delta > 0.25) {
            isRemoteSeeking = true;
            video.currentTime = payload.targetTime;
          }
        }
        break;

      case 'COMMAND_SYNC_STATE':
        // High-precision sync packet with latency compensation
        if (typeof payload?.timestamp === 'number') {
          const rttCompensation = (payload.networkRtt || 0) / 2000; // Half RTT in seconds
          const targetTime = payload.currentTime + (payload.playbackState === 'PLAYING' ? rttCompensation : 0);
          const drift = Math.abs(video.currentTime - targetTime);

          // Drift correction threshold: 1.5s as specified
          if (drift > 1.5) {
            console.log(`[Not Too Far Bridge] Drift correction triggered: delta=${drift.toFixed(2)}s`);
            isRemoteSeeking = true;
            video.currentTime = targetTime;
          }

          if (payload.playbackState === 'PLAYING' && video.paused) {
            video.play().catch(() => {});
          } else if (payload.playbackState === 'PAUSED' && !video.paused) {
            video.pause();
          }

          if (payload.playbackRate && video.playbackRate !== payload.playbackRate) {
            video.playbackRate = payload.playbackRate;
          }
        }
        break;

      case 'COMMAND_PING':
        notifyRoom('BRIDGE_PONG', {
          version: BRIDGE_VERSION,
          hasVideo: !!video,
          currentTime: video ? video.currentTime : 0,
          paused: video ? video.paused : true,
          duration: video ? video.duration : 0,
        });
        break;

      default:
        break;
    }
  });

  // Watch DOM for dynamically injected video tags
  const observer = new MutationObserver(() => {
    locateVideoElement();
  });
  observer.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });

  // Initial scan
  locateVideoElement();

  // Announce bridge readiness
  notifyRoom('BRIDGE_READY', { version: BRIDGE_VERSION, url: window.location.href });
})();
