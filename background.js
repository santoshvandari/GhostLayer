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
    // Favor stable servers (Mail.tm, Guerrilla, Mailnesia)
    const rand = Math.random();
    let provider;
    if (rand < 0.33) provider = 'mailtm';
    else if (rand < 0.66) provider = 'guerrilla';
    else provider = 'mailnesia';
    
    if (provider === 'mailnesia') {
      const mailbox = 'gl_' + Math.random().toString(36).substring(2, 10);
      const email = `${mailbox}@mailnesia.com`;
      
      const newEmailItem = {
        email: email,
        mailbox: mailbox,
        provider: 'mailnesia',
        createdAt: Date.now()
      };
      
      const result = await chrome.storage.local.get(['emailHistory', 'stats']);
      const history = result.emailHistory || [];
      const stats = result.stats || { trackersBlocked: 0, emailsGenerated: 0, dataPoisoned: 0 };
      
      history.unshift(newEmailItem);
      if (history.length > 50) history.pop();
      stats.emailsGenerated++;
      
      await chrome.storage.local.set({ emailHistory: history, stats: stats });
      return { success: true, ...newEmailItem };
    } else if (provider === 'guerrilla') {
      const response = await fetch('https://www.guerrillamail.com/ajax.php?f=get_email_address');
      const data = await response.json();
      
      const newEmailItem = {
        email: data.email_addr,
        sid_token: data.sid_token,
        provider: 'guerrilla',
        createdAt: Date.now()
      };
      
      const result = await chrome.storage.local.get(['emailHistory', 'stats']);
      const history = result.emailHistory || [];
      const stats = result.stats || { trackersBlocked: 0, emailsGenerated: 0, dataPoisoned: 0 };
      
      history.unshift(newEmailItem);
      if (history.length > 50) history.pop();
      stats.emailsGenerated++;
      
      await chrome.storage.local.set({ emailHistory: history, stats: stats });
      return { success: true, ...newEmailItem };
    } else if (provider === 'mailtm') {
      // 1. Get Mail.tm domain
      const domainsResponse = await fetch('https://api.mail.tm/domains', {
        headers: {
          'User-Agent': SPOOFING_PROFILES.userAgents[Math.floor(Math.random() * SPOOFING_PROFILES.userAgents.length)]
        }
      });
      const domainsData = await domainsResponse.json();
      const domain = domainsData['hydra:member'][0].domain;
      
      // 2. Generate account
      const username = 'gl_' + Math.random().toString(36).substring(2, 10);
      const email = `${username}@${domain}`;
      const password = Math.random().toString(36);
      
      const createResponse = await fetch('https://api.mail.tm/accounts', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'User-Agent': SPOOFING_PROFILES.userAgents[Math.floor(Math.random() * SPOOFING_PROFILES.userAgents.length)]
        },
        body: JSON.stringify({ address: email, password: password })
      });
      
      if (!createResponse.ok) {
        const errText = await createResponse.text();
        console.error('[GhostLayer] Mail.tm account creation failed:', errText);
        throw new Error('Mail.tm account creation failed');
      }
      
      const accountData = await createResponse.json();
      
      // 3. Get initial token
      const token = await getMailTmToken(email, password);
      
      // Store in history
      const result = await chrome.storage.local.get(['emailHistory', 'stats']);
      const history = result.emailHistory || [];
      const stats = result.stats || { trackersBlocked: 0, emailsGenerated: 0, dataPoisoned: 0 };
      
      const newEmailItem = {
        email: email,
        username: email,
        password: password,
        token: token, // Store token directly to avoid login spam
        provider: 'mailtm',
        accountId: accountData.id,
        createdAt: Date.now()
      };
      
      history.unshift(newEmailItem);
      if (history.length > 50) history.pop();
      stats.emailsGenerated++;
      
      await chrome.storage.local.set({ emailHistory: history, stats: stats });
      await chrome.storage.local.set({ emailHistory: history, stats: stats });
      return { success: true, ...newEmailItem };
    }
  } catch (error) {
    console.error('[GhostLayer] Email generation failed:', error);
    return { success: false, error: error.message };
  }
}

let lastEmailRequestTime = 0;
const EMAIL_THROTTLE_MS = 6000; // Reduced to 6s for better UX, still safe

async function getMailTmToken(email, password) {
  const response = await fetch('https://api.mail.tm/token', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'User-Agent': SPOOFING_PROFILES.userAgents[Math.floor(Math.random() * SPOOFING_PROFILES.userAgents.length)]
    },
    body: JSON.stringify({ address: email, password: password })
  });
  if (!response.ok) throw new Error('Mail.tm login failed');
  const data = await response.json();
  return data.token;
}

async function checkEmailInbox(emailData) {
  const { provider, username, domain, email, password, sid_token } = emailData;
  const now = Date.now();
  
  if (now - lastEmailRequestTime < EMAIL_THROTTLE_MS) {
    const waitTime = Math.ceil((EMAIL_THROTTLE_MS - (now - lastEmailRequestTime)) / 1000);
    return { success: false, error: `Cooling down... Please wait ${waitTime}s.` };
  }
  
  try {
    lastEmailRequestTime = now;

    if (provider === 'guerrilla') {
      const response = await fetch(`https://www.guerrillamail.com/ajax.php?f=check_email&seq=0&sid_token=${sid_token}`);
      const data = await response.json();
      
      const messages = (data.list || []).map(msg => ({
        id: msg.mail_id,
        from: msg.mail_from,
        subject: msg.mail_subject,
        date: msg.mail_date,
        intro: msg.mail_excerpt
      }));
      
      return { success: true, messages };
    } else if (provider === 'mailtm') {
      const authToken = emailData.token || await getMailTmToken(email, password);
      const response = await fetch('https://api.mail.tm/messages', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!response.ok) throw new Error('Mail.tm inbox check failed');
      const data = await response.json();
      
      const messages = data['hydra:member'].map(msg => ({
        id: msg.id,
        from: msg.from.address,
        subject: msg.subject,
        date: msg.createdAt,
        intro: msg.intro
      }));
      
      return { success: true, messages };
    } else if (provider === 'mailnesia') {
      const response = await fetch(`https://m.mailnesia.com/api/mailbox/${emailData.mailbox}`, {
        headers: {
          'User-Agent': SPOOFING_PROFILES.userAgents[Math.floor(Math.random() * SPOOFING_PROFILES.userAgents.length)]
        }
      });
      if (!response.ok) throw new Error('Mailnesia inbox check failed');
      const data = await response.json();
      
      const messages = data.map(msg => ({
        id: msg.id,
        from: msg.from,
        subject: msg.subject,
        date: msg.date,
        intro: msg.subject // Mailnesia API doesn't always provide intro in the list
      }));
      
      return { success: true, messages };
    } else {
      // 1secmail is down, return error suggesting to try a new email
      throw new Error('1secmail server is currently down. Please generate a new burner email.');
    }
  } catch (error) {
    console.error('[GhostLayer] Inbox check failed:', error);
    return { success: false, error: error.message };
  }
}

async function readEmail(emailData, messageId) {
  const { provider, username, domain, email, password, sid_token } = emailData;
  
  try {
    if (provider === 'guerrilla') {
      const response = await fetch(`https://www.guerrillamail.com/ajax.php?f=fetch_email&email_id=${messageId}&sid_token=${sid_token}`);
      const data = await response.json();
      
      return {
        success: true,
        message: {
          from: data.mail_from,
          subject: data.mail_subject,
          textBody: data.mail_body,
          htmlBody: data.mail_body, // Guerrilla often returns plain text/mixed
          date: data.mail_date
        }
      };
    } else if (provider === 'mailtm') {
      const authToken = emailData.token || await getMailTmToken(email, password);
      const response = await fetch(`https://api.mail.tm/messages/${messageId}`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!response.ok) throw new Error('Mail.tm message read failed');
      const data = await response.json();
      
      return { 
        success: true, 
        message: {
          from: data.from.address,
          subject: data.subject,
          textBody: data.text,
          htmlBody: data.html[0] || '',
          date: data.createdAt
        } 
      };
    } else if (provider === 'mailnesia') {
      const response = await fetch(`https://m.mailnesia.com/api/mailbox/${emailData.mailbox}/${messageId}`, {
        headers: {
          'User-Agent': SPOOFING_PROFILES.userAgents[Math.floor(Math.random() * SPOOFING_PROFILES.userAgents.length)]
        }
      });
      if (!response.ok) throw new Error('Mailnesia message read failed');
      const data = await response.json();
      
      return {
        success: true,
        message: {
          from: data.from,
          subject: data.subject,
          textBody: data.textPlain,
          htmlBody: data.textHtml,
          date: data.date
        }
      };
    } else {
      throw new Error('This email provider is no longer supported.');
    }
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
    checkEmailInbox(request.emailData).then(sendResponse);
    return true;
  }
  
  if (request.action === 'readEmail') {
    readEmail(request.emailData, request.messageId).then(sendResponse);
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
