export async function handleTrackerBlocked(count = 1) {
  const result = await chrome.storage.local.get(['stats']);
  const stats = result.stats || { trackersBlocked: 0, emailsGenerated: 0, dataPoisoned: 0 };
  stats.trackersBlocked += count;
  await chrome.storage.local.set({ stats });
  return { success: true };
}

// Generate random noise for tracker data poisoning
export function generateTelemetryNoise() {
  const noise = {
    referrer: getRandomReferrer(),
    screen: getRandomScreen(),
    timestamp: Date.now() - Math.floor(Math.random() * 10000000), // Random past time
    event: getRandomEvent()
  };
  return noise;
}

function getRandomReferrer() {
  const referrers = [
    'https://www.google.com/',
    'https://www.bing.com/',
    'https://www.facebook.com/',
    'https://twitter.com/',
    'https://www.reddit.com/',
    'https://en.wikipedia.org/'
  ];
  return referrers[Math.floor(Math.random() * referrers.length)];
}

function getRandomScreen() {
  const screens = [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1536, height: 864 }
  ];
  return screens[Math.floor(Math.random() * screens.length)];
}

function getRandomEvent() {
  const events = ['page_view', 'click', 'scroll', 'purchase', 'add_to_cart'];
  return events[Math.floor(Math.random() * events.length)];
}


// Comprehensive list of tracker domains to block across ALL websites
const TRACKER_DOMAINS = [
  // === Analytics Trackers ===
  '*://*.google-analytics.com/*',
  '*://*.googletagmanager.com/*',
  '*://www.google-analytics.com/*',
  '*://ssl.google-analytics.com/*',
  '*://*.analytics.google.com/*',
  '*://stats.g.doubleclick.net/*',
  '*://*.clarity.ms/*',
  '*://*.hotjar.com/*',
  '*://*.mixpanel.com/*',
  '*://api.segment.com/*',
  '*://api.segment.io/*',
  '*://cdn.segment.com/*',
  '*://*.amplitude.com/*',
  '*://*.fullstory.com/*',
  '*://*.mouseflow.com/*',
  '*://*.inspectlet.com/*',
  '*://*.crazyegg.com/*',
  '*://*.heap.io/*',
  '*://*.logrocket.com/*',
  '*://*.logrocket.io/*',
  
  // === Advertising Networks ===
  '*://*.doubleclick.net/*',
  '*://*.googlesyndication.com/*',
  '*://*.googleadservices.com/*',
  '*://*.google.com/pagead/*',
  '*://*.adsystem.com/*',
  '*://*.advertising.com/*',
  '*://*.2mdn.net/*',
  '*://*.adnxs.com/*',
  '*://*.adsafeprotected.com/*',
  '*://*.adroll.com/*',
  '*://*.outbrain.com/*',
  '*://*.taboola.com/*',
  '*://*.revcontent.com/*',
  
  // === Social Media Trackers ===
  '*://www.facebook.com/tr*',
  '*://www.facebook.com/tr/*',
  '*://*.connect.facebook.net/*',
  '*://connect.facebook.net/*',
  '*://*.facebook.net/*/fbevents.js*',
  '*://*.analytics.twitter.com/*',
  '*://*.ads-twitter.com/*',
  '*://platform.twitter.com/widgets/*',
  '*://static.ads-twitter.com/*',
  '*://*.linkedin.com/px/*',
  '*://www.linkedin.com/analytics/*',
  '*://px.ads.linkedin.com/*',
  '*://*.pinterest.com/ct/*',
  '*://ct.pinterest.com/*',
  '*://*.tiktok.com/i18n/pixel/*',
  
  // === Behavioral Tracking ===
  '*://*.bat.bing.com/*',
  '*://*.quantserve.com/*',
  '*://*.scorecardresearch.com/*',
  '*://*.luckyorange.com/*',
  '*://*.smartlook.com/*',
  '*://*.sessioncam.com/*',
  '*://*.clicktale.net/*',
  '*://*.livechatinc.com/*',
  '*://*.intercom.io/widget/*',
  
  // === Fingerprinting Services ===
  '*://*.bugsnag.com/*',
  '*://*.sentry.io/*',
  '*://*.newrelic.com/*',
  '*://*.nr-data.net/*',
  '*://*.datadoghq.com/*',
  
  // === Common CDN Trackers ===
  '*://bat.bing.com/*',
  '*://www.googletagservices.com/*',
  '*://pagead2.googlesyndication.com/*',
  '*://tpc.googlesyndication.com/*',
  
  // === Affiliate & Marketing ===
  '*://*.shareasale.com/*',
  '*://*.cj.com/*',
  '*://*.avantlink.com/*',
  '*://*.impact.com/*',
  '*://*.awin1.com/*',
  
  // === Generic Patterns ===
  '*://*/collect*',
  '*://*/analytics*',
  '*://*/tracking*',
  '*://*/tracker*'
];

// Setup tracker blocking using webRequest API
export function setupTrackerBlocker() {
  
  // Block tracker requests
  chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
      
      // Increment tracker count asynchronously
      handleTrackerBlocked(1);
      
      return { cancel: true };
    },
    { urls: TRACKER_DOMAINS },
    ['blocking']
  );
}
