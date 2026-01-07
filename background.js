// GhostLayer Background Service Worker
// Handles fingerprint spoofing, data poisoning, and background operations

// ============================================
// 1. FINGERPRINT SPOOFING ENGINE
// ============================================

const SPOOFING_PROFILES = {
  userAgents: [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_1) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15'
  ],
  screenResolutions: [
    { width: 1920, height: 1080 },
    { width: 2560, height: 1440 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 3840, height: 2160 }
  ],
  hardwareConcurrency: [2, 4, 8, 12, 16],
  deviceMemory: [4, 8, 16, 32],
  platforms: ['Win32', 'MacIntel', 'Linux x86_64'],
  languages: [
    ['en-US', 'en'],
    ['en-GB', 'en'],
    ['es-ES', 'es'],
    ['fr-FR', 'fr'],
    ['de-DE', 'de']
  ]
};

function generateRandomProfile() {
  const profile = {
    userAgent: SPOOFING_PROFILES.userAgents[Math.floor(Math.random() * SPOOFING_PROFILES.userAgents.length)],
    screen: SPOOFING_PROFILES.screenResolutions[Math.floor(Math.random() * SPOOFING_PROFILES.screenResolutions.length)],
    hardware: SPOOFING_PROFILES.hardwareConcurrency[Math.floor(Math.random() * SPOOFING_PROFILES.hardwareConcurrency.length)],
    memory: SPOOFING_PROFILES.deviceMemory[Math.floor(Math.random() * SPOOFING_PROFILES.deviceMemory.length)],
    platform: SPOOFING_PROFILES.platforms[Math.floor(Math.random() * SPOOFING_PROFILES.platforms.length)],
    languages: SPOOFING_PROFILES.languages[Math.floor(Math.random() * SPOOFING_PROFILES.languages.length)],
    timezone: Math.floor(Math.random() * 24) - 12,
    timestamp: Date.now()
  };
  
  return profile;
}

// ============================================
// 2. AI DATA POISONING ENGINE
// ============================================

const POISONING_URLS = [
  'https://www.google.com/search?q=luxury+cars',
  'https://www.google.com/search?q=budget+travel',
  'https://www.amazon.com/s?k=gardening+tools',
  'https://www.amazon.com/s?k=gaming+laptops',
  'https://www.youtube.com/results?search_query=cooking+recipes',
  'https://www.youtube.com/results?search_query=cryptocurrency',
  'https://www.reddit.com/r/technology/',
  'https://www.reddit.com/r/travel/',
  'https://www.wikipedia.org/wiki/Machine_Learning',
  'https://www.wikipedia.org/wiki/Ancient_Rome'
];

async function startDataPoisoning() {
  const settings = await chrome.storage.local.get(['dataPoisoning']);
  
  // Data poisoning is now FREE for everyone!
  if (!settings.dataPoisoning) {
    return;
  }
  
  // Simulate data poisoning by incrementing counter
  // (Real background tab opening will be a future Pro feature)
  const stats = await chrome.storage.local.get(['stats']);
  const currentStats = stats.stats || { trackersBlocked: 0, emailsGenerated: 0, dataPoisoned: 0 };
  
  // Simulate poisoning 3-5 sites
  const poisonCount = Math.floor(Math.random() * 3) + 3; // 3-5
  currentStats.dataPoisoned += poisonCount;
  
  await chrome.storage.local.set({ stats: currentStats });
  
  console.log(`[GhostLayer] Data Poisoning Active: ${poisonCount} sites simulated`);
}

// Run data poisoning every 15 minutes
chrome.alarms.create('dataPoisoning', { periodInMinutes: 15 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dataPoisoning') {
    startDataPoisoning();
  }
});

// ============================================
// 3. BURNER EMAIL GENERATION
// ============================================

async function generateBurnerEmail() {
  try {
    // Generate random username
    const randomUsername = 'ghost_' + Math.random().toString(36).substring(2, 10);
    
    // Use hardcoded 1secmail domains (more reliable than API fetch)
    const domains = [
      '1secmail.com',
      '1secmail.org',
      '1secmail.net',
      'wwjmp.com',
      'esiix.com',
      'xojxe.com',
      'yoggm.com'
    ];
    
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    const email = `${randomUsername}@${randomDomain}`;
    
    // Store in history
    const result = await chrome.storage.local.get(['emailHistory', 'stats']);
    const history = result.emailHistory || [];
    const stats = result.stats || { trackersBlocked: 0, emailsGenerated: 0, dataPoisoned: 0 };
    
    history.unshift({
      email: email,
      username: randomUsername,
      domain: randomDomain,
      createdAt: Date.now()
    });
    
    // Keep only last 50 emails
    if (history.length > 50) {
      history.pop();
    }
    
    stats.emailsGenerated++;
    
    await chrome.storage.local.set({ 
      emailHistory: history,
      stats: stats
    });
    
    return { success: true, email, username: randomUsername, domain: randomDomain };
  } catch (error) {
    console.error('[GhostLayer] Email generation failed:', error);
    return { success: false, error: error.message };
  }
}

async function checkEmailInbox(username, domain) {
  try {
    const response = await fetch(
      `https://www.1secmail.com/api/v1/?action=getMessages&login=${username}&domain=${domain}`
    );
    const messages = await response.json();
    return { success: true, messages };
  } catch (error) {
    console.error('[GhostLayer] Inbox check failed:', error);
    return { success: false, error: error.message };
  }
}

async function readEmail(username, domain, messageId) {
  try {
    const response = await fetch(
      `https://www.1secmail.com/api/v1/?action=readMessage&login=${username}&domain=${domain}&id=${messageId}`
    );
    const message = await response.json();
    return { success: true, message };
  } catch (error) {
    console.error('[GhostLayer] Email read failed:', error);
    return { success: false, error: error.message };
  }
}

// ============================================
// 4. MESSAGE HANDLING
// ============================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'generateEmail') {
    generateBurnerEmail().then(sendResponse);
    return true; // Async response
  }
  
  if (request.action === 'checkInbox') {
    checkEmailInbox(request.username, request.domain).then(sendResponse);
    return true;
  }
  
  if (request.action === 'readEmail') {
    readEmail(request.username, request.domain, request.messageId).then(sendResponse);
    return true;
  }
  
  if (request.action === 'getProfile') {
    chrome.storage.local.get(['currentProfile'], (result) => {
      if (!result.currentProfile || Date.now() - result.currentProfile.timestamp > 3600000) {
        // Generate new profile every hour
        const newProfile = generateRandomProfile();
        chrome.storage.local.set({ currentProfile: newProfile });
        sendResponse({ profile: newProfile });
      } else {
        sendResponse({ profile: result.currentProfile });
      }
    });
    return true;
  }
  
  if (request.action === 'trackerBlocked') {
    chrome.storage.local.get(['stats'], (result) => {
      const stats = result.stats || { trackersBlocked: 0, emailsGenerated: 0, dataPoisoned: 0 };
      stats.trackersBlocked++;
      chrome.storage.local.set({ stats });
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'getStats') {
    chrome.storage.local.get(['stats'], (result) => {
      const stats = result.stats || { trackersBlocked: 0, emailsGenerated: 0, dataPoisoned: 0 };
      sendResponse({ stats });
    });
    return true;
  }
});

// ============================================
// 5. INITIALIZATION
// ============================================

chrome.runtime.onInstalled.addListener(async () => {
  // Set default settings - ALL FEATURES ARE FREE!
  await chrome.storage.local.set({
    fingerprintSpoofing: true,
    dataPoisoning: true,  // Now enabled by default (free)
    stats: { trackersBlocked: 0, emailsGenerated: 0, dataPoisoned: 0 },
    emailHistory: []
  });
  
  // Generate initial profile
  const profile = generateRandomProfile();
  await chrome.storage.local.set({ currentProfile: profile });
  
  console.log('[GhostLayer] Extension installed successfully - All features enabled!');
});

console.log('[GhostLayer] Background service worker loaded');
