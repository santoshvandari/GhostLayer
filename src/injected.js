// GhostLayer Injected Script
// This script runs in the page context to override native JavaScript APIs
// for fingerprint spoofing

(function() {
  'use strict';
  
  // Get spoofing profile from the document attribute to avoid CSP issues with script tags
  let PROFILE = null;
  const profileData = document.documentElement.getAttribute('data-ghostlayer-profile');
  
  if (profileData) {
    try {
      PROFILE = JSON.parse(profileData);
      // Clean up the attribute to stay stealthy
      document.documentElement.removeAttribute('data-ghostlayer-profile');
    } catch (e) {
      console.error('[GhostLayer] Failed to parse profile data from bridge');
    }
  }
  
  if (!PROFILE) {
    // Fallback to legacy global if bridge fails
    PROFILE = window.__GHOSTLAYER_PROFILE__;
  }
  
  if (!PROFILE) {
    console.warn('[GhostLayer] No profile found, skipping spoofing');
    return;
  }
  
  console.log('[GhostLayer] Injecting fingerprint spoofing...');
  
  // ============================================
  // NAVIGATOR SPOOFING
  // ============================================
  
  // Spoof User Agent
  Object.defineProperty(Navigator.prototype, 'userAgent', {
    get: function() {
      return PROFILE.userAgent;
    }
  });
  
  // Spoof Platform
  Object.defineProperty(Navigator.prototype, 'platform', {
    get: function() {
      return PROFILE.platform;
    }
  });
  
  // Spoof Hardware Concurrency
  Object.defineProperty(Navigator.prototype, 'hardwareConcurrency', {
    get: function() {
      return PROFILE.hardware;
    }
  });
  
  // Spoof Device Memory
  Object.defineProperty(Navigator.prototype, 'deviceMemory', {
    get: function() {
      return PROFILE.memory;
    }
  });
  
  // Spoof Languages
  Object.defineProperty(Navigator.prototype, 'languages', {
    get: function() {
      return PROFILE.languages;
    }
  });
  
  Object.defineProperty(Navigator.prototype, 'language', {
    get: function() {
      return PROFILE.languages[0];
    }
  });
  
  // ============================================
  // SCREEN SPOOFING
  // ============================================
  
  Object.defineProperty(Screen.prototype, 'width', {
    get: function() {
      return PROFILE.screen.width;
    }
  });
  
  Object.defineProperty(Screen.prototype, 'height', {
    get: function() {
      return PROFILE.screen.height;
    }
  });
  
  Object.defineProperty(Screen.prototype, 'availWidth', {
    get: function() {
      return PROFILE.screen.width;
    }
  });
  
  Object.defineProperty(Screen.prototype, 'availHeight', {
    get: function() {
      return PROFILE.screen.height - 40; // Account for taskbar
    }
  });
  
  // ============================================
  // TIMEZONE SPOOFING
  // ============================================
  
  const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
  Date.prototype.getTimezoneOffset = function() {
    return PROFILE.timezone * 60; // Convert hours to minutes
  };
  
  // ============================================
  // WEBGL FINGERPRINT RANDOMIZATION
  // ============================================
  
  const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
  WebGLRenderingContext.prototype.getParameter = function(parameter) {
    // Randomize WEBGL vendor and renderer
    if (parameter === 37445) { // UNMASKED_VENDOR_WEBGL
      return 'Intel Inc.';
    }
    if (parameter === 37446) { // UNMASKED_RENDERER_WEBGL
      return 'Intel Iris OpenGL Engine';
    }
    return originalGetParameter.apply(this, arguments);
  };
  
  // ============================================
  // CANVAS FINGERPRINT NOISE
  // ============================================
  
  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function(type) {
    // Add minimal noise to canvas fingerprinting
    const context = this.getContext('2d');
    if (context) {
      const imageData = context.getImageData(0, 0, this.width, this.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        // Add tiny random noise (±1 to RGB values)
        imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] + Math.random() * 2 - 1));
        imageData.data[i + 1] = Math.min(255, Math.max(0, imageData.data[i + 1] + Math.random() * 2 - 1));
        imageData.data[i + 2] = Math.min(255, Math.max(0, imageData.data[i + 2] + Math.random() * 2 - 1));
      }
      context.putImageData(imageData, 0, 0);
    }
    return originalToDataURL.apply(this, arguments);
  };
  
  // ============================================
  // BATTERY STATUS RANDOMIZATION
  // ============================================
  
  if (navigator.getBattery) {
    const originalGetBattery = navigator.getBattery;
    navigator.getBattery = async function() {
      const battery = await originalGetBattery.apply(this);
      
      // Override battery properties
      Object.defineProperties(battery, {
        charging: {
          get: function() {
            return Math.random() > 0.5;
          }
        },
        level: {
          get: function() {
            return Math.random() * 0.5 + 0.5; // 50-100%
          }
        }
      });
      
      return battery;
    };
  }
  
  console.log('[GhostLayer] Fingerprint spoofing active');
  
  // Clean up: remove the script tag after execution
  if (currentScript && currentScript.parentNode) {
    currentScript.remove();
  }
})();
