// GhostLayer Content Script
// Runs on every page to inject burner emails and block trackers

console.log('[GhostLayer] Content script loaded');

// ============================================
// 1. INJECT FINGERPRINT SPOOFING SCRIPT
// ============================================

(async function injectSpoofing() {
  try {
    // Get current profile from background
    const response = await chrome.runtime.sendMessage({ action: 'getProfile' });
    
    if (response && response.profile) {
      // Inject profile into page context
      const script = document.createElement('script');
      script.textContent = `window.__GHOSTLAYER_PROFILE__ = ${JSON.stringify(response.profile)};`;
      (document.head || document.documentElement).appendChild(script);
      script.remove();
      
      // Inject the main spoofing script
      const spoofingScript = document.createElement('script');
      spoofingScript.src = chrome.runtime.getURL('injected.js');
      (document.head || document.documentElement).appendChild(spoofingScript);
      
      console.log('[GhostLayer] Fingerprint spoofing injected');
    }
  } catch (error) {
    console.error('[GhostLayer] Failed to inject spoofing:', error);
  }
})();

// ============================================
// 2. TRACKER DETECTION & BLOCKING
// ============================================

const TRACKER_PATTERNS = [
  /google-analytics\.com/i,
  /googletagmanager\.com/i,
  /doubleclick\.net/i,
  /facebook\.com\/tr/i,
  /connect\.facebook\.net/i,
  /analytics\.twitter\.com/i,
  /bat\.bing\.com/i,
  /hotjar\.com/i,
  /mixpanel\.com/i,
  /segment\.com/i,
  /amplitude\.com/i,
  /fullstory\.com/i
];

function detectTrackers() {
  const scripts = document.querySelectorAll('script[src]');
  let blockCount = 0;
  
  scripts.forEach(script => {
    const src = script.getAttribute('src');
    if (src && TRACKER_PATTERNS.some(pattern => pattern.test(src))) {
      console.log('[GhostLayer] Blocked tracker:', src);
      script.remove();
      blockCount++;
    }
  });
  
  if (blockCount > 0) {
    chrome.runtime.sendMessage({ 
      action: 'trackerBlocked',
      count: blockCount 
    });
  }
}

// Run tracker detection on page load and DOM changes
detectTrackers();

const observer = new MutationObserver(detectTrackers);
observer.observe(document.documentElement, {
  childList: true,
  subtree: true
});

// ============================================
// 3. BURNER EMAIL INJECTION
// ============================================

let ghostEmailButton = null;
let currentEmailField = null;

function createGhostButton() {
  const button = document.createElement('div');
  button.id = 'ghostlayer-email-btn';
  button.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
    </svg>
  `;
  
  Object.assign(button.style, {
    position: 'absolute',
    width: '32px',
    height: '32px',
    backgroundColor: '#6366f1',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    zIndex: '999999',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
    transition: 'all 0.3s ease',
    color: 'white'
  });
  
  button.addEventListener('mouseenter', () => {
    button.style.transform = 'scale(1.1)';
    button.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.6)';
  });
  
  button.addEventListener('mouseleave', () => {
    button.style.transform = 'scale(1)';
    button.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.4)';
  });
  
  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!currentEmailField) return;
    
    // Show loading state
    button.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10" stroke-opacity="0.3"/>
        <path d="M12 2 A 10 10 0 0 1 22 12" stroke-linecap="round">
          <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
        </path>
      </svg>
    `;
    
    try {
      const response = await chrome.runtime.sendMessage({ action: 'generateEmail' });
      
      if (response && response.success) {
        currentEmailField.value = response.email;
        currentEmailField.dispatchEvent(new Event('input', { bubbles: true }));
        currentEmailField.dispatchEvent(new Event('change', { bubbles: true }));
        
        // Success feedback
        button.style.backgroundColor = '#10b981';
        button.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        `;
        
        setTimeout(() => {
          button.style.backgroundColor = '#6366f1';
          updateGhostButton();
        }, 2000);
      }
    } catch (error) {
      console.error('[GhostLayer] Email generation failed:', error);
      button.style.backgroundColor = '#ef4444';
      setTimeout(() => {
        button.style.backgroundColor = '#6366f1';
        updateGhostButton();
      }, 2000);
    }
  });
  
  return button;
}

function updateGhostButton() {
  if (!ghostEmailButton) return;
  
  ghostEmailButton.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
    </svg>
  `;
}

function positionGhostButton(emailField) {
  if (!ghostEmailButton) {
    ghostEmailButton = createGhostButton();
    document.body.appendChild(ghostEmailButton);
  }
  
  currentEmailField = emailField;
  
  const rect = emailField.getBoundingClientRect();
  ghostEmailButton.style.top = `${window.scrollY + rect.top + (rect.height / 2) - 16}px`;
  ghostEmailButton.style.left = `${window.scrollX + rect.right - 40}px`;
  ghostEmailButton.style.display = 'flex';
}

function hideGhostButton() {
  if (ghostEmailButton) {
    ghostEmailButton.style.display = 'none';
    currentEmailField = null;
  }
}

// Detect email input fields
function detectEmailFields() {
  const emailFields = document.querySelectorAll('input[type="email"], input[name*="email" i], input[id*="email" i], input[placeholder*="email" i]');
  
  emailFields.forEach(field => {
    if (field.dataset.ghostlayerAttached) return;
    field.dataset.ghostlayerAttached = 'true';
    
    field.addEventListener('focus', () => {
      positionGhostButton(field);
    });
    
    field.addEventListener('blur', (e) => {
      setTimeout(() => {
        if (!ghostEmailButton?.matches(':hover')) {
          hideGhostButton();
        }
      }, 200);
    });
  });
}

// Run email field detection
detectEmailFields();

const emailObserver = new MutationObserver(detectEmailFields);
emailObserver.observe(document.documentElement, {
  childList: true,
  subtree: true
});

// Reposition button on scroll/resize
window.addEventListener('scroll', () => {
  if (currentEmailField && ghostEmailButton.style.display === 'flex') {
    positionGhostButton(currentEmailField);
  }
});

window.addEventListener('resize', () => {
  if (currentEmailField && ghostEmailButton.style.display === 'flex') {
    positionGhostButton(currentEmailField);
  }
});

console.log('[GhostLayer] Content script initialized');
