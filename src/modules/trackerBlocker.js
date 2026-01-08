export async function handleTrackerBlocked(count = 1) {
  const result = await chrome.storage.local.get(['stats']);
  const stats = result.stats || { trackersBlocked: 0, emailsGenerated: 0, dataPoisoned: 0 };
  stats.trackersBlocked += count;
  await chrome.storage.local.set({ stats });
  return { success: true };
}

// Future expansion: Add declarativeNetRequest or webRequest listeners here
export function setupTrackerBlocker() {
  console.log('[GhostLayer] Tracker blocker module initialized');
  
  // Example of using webRequest to monitor (if needed)
  // chrome.webRequest.onBeforeRequest.addListener(
  //   (details) => {
  //     // Logic to monitor/log trackers
  //   },
  //   { urls: ["<all_urls>"] }
  // );
}
