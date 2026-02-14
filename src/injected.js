(function() {
  'use strict';
  
  let PROFILE = null;
  const profileData = document.documentElement.getAttribute('data-ghostlayer-profile');
  
  if (profileData) {
    try {
      PROFILE = JSON.parse(profileData);
      document.documentElement.removeAttribute('data-ghostlayer-profile');
    } catch (e) {
      // Failed to parse profile data
    }
  }
  
  if (!PROFILE) {
    PROFILE = window.__GHOSTLAYER_PROFILE__;
  }
  
  if (!PROFILE) {
    return;
  }
  
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
  
  const originalGetTimezoneOffset = Date.prototype.getTimezoneOffset;
  Date.prototype.getTimezoneOffset = function() {
    return PROFILE.timezone * 60;
  };
  
  const originalGetParameter = WebGLRenderingContext.prototype.getParameter;
  WebGLRenderingContext.prototype.getParameter = function(parameter) {
    if (parameter === 37445) {
      return 'Intel Inc.';
    }
    if (parameter === 37446) {
      return 'Intel Iris OpenGL Engine';
    }
    return originalGetParameter.apply(this, arguments);
  };
  
  const originalToDataURL = HTMLCanvasElement.prototype.toDataURL;
  HTMLCanvasElement.prototype.toDataURL = function(type) {
    const context = this.getContext('2d');
    if (context) {
      const imageData = context.getImageData(0, 0, this.width, this.height);
      for (let i = 0; i < imageData.data.length; i += 4) {
        imageData.data[i] = Math.min(255, Math.max(0, imageData.data[i] + Math.random() * 2 - 1));
        imageData.data[i + 1] = Math.min(255, Math.max(0, imageData.data[i + 1] + Math.random() * 2 - 1));
        imageData.data[i + 2] = Math.min(255, Math.max(0, imageData.data[i + 2] + Math.random() * 2 - 1));
      }
      context.putImageData(imageData, 0, 0);
    }
    return originalToDataURL.apply(this, arguments);
  };
  
  if (navigator.getBattery) {
    const originalGetBattery = navigator.getBattery;
    navigator.getBattery = async function() {
      const battery = await originalGetBattery.apply(this);
      
      Object.defineProperties(battery, {
        charging: {
          get: function() {
            return Math.random() > 0.5;
          }
        },
        level: {
          get: function() {
            return Math.random() * 0.5 + 0.5;
          }
        }
      });
      
      return battery;
    };
  }
  
  let NOISE = null;
  const noiseData = document.documentElement.getAttribute('data-ghostlayer-noise');
  
  if (noiseData) {
    try {
      NOISE = JSON.parse(noiseData);
      document.documentElement.removeAttribute('data-ghostlayer-noise');
    } catch (e) {
      // Failed to parse noise data
    }
  }
  
  const poisoningEnabled = document.documentElement.getAttribute('data-ghostlayer-poisoning-enabled');
  document.documentElement.removeAttribute('data-ghostlayer-poisoning-enabled');
  
  if (NOISE && poisoningEnabled === 'true') {
    setInterval(() => {
      if (window.dataLayer && Array.isArray(window.dataLayer)) {
        if (Math.random() > 0.95) {
          window.dataLayer.push({
            'event': NOISE.event,
            'screen_resolution': `${NOISE.screen.width}x${NOISE.screen.height}`,
            'non_interaction': true
          });
        }
      }
      
      if (typeof window.fbq === 'function') {
        if (Math.random() > 0.95) {
          window.fbq('trackCustom', NOISE.event, {
            content_name: 'GhostLayer_Noise',
            value: Math.random() * 100
          });
        }
      }
      
      if (typeof window.analytics === 'object' && typeof window.analytics.track === 'function') {
        if (Math.random() > 0.95) {
          window.analytics.track(NOISE.event, {
            platform: 'GhostLayer',
            noisy: true
          });
        }
      }
    }, 10000);
    
  }

  
  // Clean up: remove the script tag after execution
  if (document.currentScript && document.currentScript.parentNode) {
    document.currentScript.remove();
  }
})();
