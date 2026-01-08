export const SPOOFING_PROFILES = {
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

export function generateRandomProfile() {
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
