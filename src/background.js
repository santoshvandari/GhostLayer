// GhostLayer Background Service Worker - Modular Version
// Components are separated for better maintainability and code clarity.

import { generateRandomProfile } from './modules/fingerprint.js';
import { setupPoisoningAlarm } from './modules/dataPoisoner.js';
import { generateBurnerEmail, checkEmailInbox, readEmail } from './modules/emailManager.js';
import { handleTrackerBlocked, setupTrackerBlocker } from './modules/trackerBlocker.js';

// ============================================
// 1. INITIALIZATION & ALARMS
// ============================================

setupPoisoningAlarm();
setupTrackerBlocker();

// ============================================
// 2. MESSAGE HANDLING
// ============================================

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'generateEmail':
      generateBurnerEmail().then(sendResponse);
      return true; // Async response
      
    case 'checkInbox':
      checkEmailInbox(request.emailData).then(sendResponse);
      return true;
      
    case 'readEmail':
      readEmail(request.emailData, request.messageId).then(sendResponse);
      return true;
      
    case 'getProfile':
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
      
    case 'trackerBlocked':
      handleTrackerBlocked(request.count || 1).then(sendResponse);
      return true;
      
    case 'getStats':
      chrome.storage.local.get(['stats'], (result) => {
        const stats = result.stats || { trackersBlocked: 0, emailsGenerated: 0, dataPoisoned: 0 };
        sendResponse({ stats });
      });
      return true;
      
    default:
      console.warn(`[GhostLayer] Unknown action: ${request.action}`);
      break;
  }
});

// ============================================
// 3. INSTALLATION EVENT
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
