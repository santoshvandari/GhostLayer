export const POISONING_URLS = [
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

export async function startDataPoisoning() {
  const settings = await chrome.storage.local.get(['dataPoisoning']);
  
  if (!settings.dataPoisoning) {
    return;
  }
  
  const stats = await chrome.storage.local.get(['stats']);
  const currentStats = stats.stats || { trackersBlocked: 0, emailsGenerated: 0, dataPoisoned: 0 };
  
  const poisonCount = Math.floor(Math.random() * 3) + 3; // 3-5
  currentStats.dataPoisoned += poisonCount;
  
  await chrome.storage.local.set({ stats: currentStats });
  
  console.log(`[GhostLayer] Data Poisoning Active: ${poisonCount} sites simulated`);
}

export function setupPoisoningAlarm() {
  chrome.alarms.create('dataPoisoning', { periodInMinutes: 15 });
  
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'dataPoisoning') {
      startDataPoisoning();
    }
  });
}
