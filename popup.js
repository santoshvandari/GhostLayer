// GhostLayer Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  console.log('[GhostLayer] Popup initialized');
  
  // ============================================
  // ELEMENTS
  // ============================================
  
  const generateEmailBtn = document.getElementById('generateEmailBtn');
  const emailDisplay = document.getElementById('emailDisplay');
  const emailValue = document.getElementById('emailValue');
  const copyEmailBtn = document.getElementById('copyEmailBtn');
  const checkInboxBtn = document.getElementById('checkInboxBtn');
  const inboxDisplay = document.getElementById('inboxDisplay');
  const closeInboxBtn = document.getElementById('closeInboxBtn');
  const messageList = document.getElementById('messageList');
  
  const fingerprintToggle = document.getElementById('fingerprintToggle');
  const dataPoisoningToggle = document.getElementById('dataPoisoningToggle');
  
  const trackersBlockedEl = document.getElementById('trackersBlocked');
  const emailsGeneratedEl = document.getElementById('emailsGenerated');
  const dataPoisonedEl = document.getElementById('dataPoisoned');
  
  const emailHistory = document.getElementById('emailHistory');
  
  let currentEmail = null;
  let checkInboxInterval = null;
  
  // ============================================
  // LOAD STATS
  // ============================================
  
  async function loadStats() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getStats' });
      if (response && response.stats) {
        animateNumber(trackersBlockedEl, response.stats.trackersBlocked);
        animateNumber(emailsGeneratedEl, response.stats.emailsGenerated);
        animateNumber(dataPoisonedEl, response.stats.dataPoisoned);
      }
    } catch (error) {
      console.error('[GhostLayer] Failed to load stats:', error);
    }
  }
  
  function animateNumber(element, target) {
    const current = parseInt(element.textContent) || 0;
    const increment = Math.ceil((target - current) / 20);
    
    if (current < target) {
      element.textContent = Math.min(current + increment, target);
      setTimeout(() => animateNumber(element, target), 50);
    } else {
      element.textContent = target;
    }
  }
  
  // ============================================
  // LOAD SETTINGS
  // ============================================
  
  async function loadSettings() {
    try {
      const settings = await chrome.storage.local.get(['fingerprintSpoofing', 'dataPoisoning']);
      
      fingerprintToggle.checked = settings.fingerprintSpoofing !== false;
      dataPoisoningToggle.checked = settings.dataPoisoning !== false;
      
      console.log('[GhostLayer] Settings loaded - All features enabled!');
    } catch (error) {
      console.error('[GhostLayer] Failed to load settings:', error);
    }
  }
  
  // ============================================
  // LOAD EMAIL HISTORY
  // ============================================
  
  async function loadEmailHistory() {
    try {
      const result = await chrome.storage.local.get(['emailHistory']);
      const history = result.emailHistory || [];
      
      if (history.length === 0) {
        emailHistory.innerHTML = '<div class="empty-state">No emails generated yet</div>';
        return;
      }
      
      emailHistory.innerHTML = history.slice(0, 5).map(item => {
        const date = new Date(item.createdAt);
        const timeAgo = getTimeAgo(date);
        
        return `
          <div class="history-item">
            <div class="history-email">${item.email}</div>
            <div class="history-date">${timeAgo}</div>
          </div>
        `;
      }).join('');
    } catch (error) {
      console.error('[GhostLayer] Failed to load email history:', error);
    }
  }
  
  function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
  
  // ============================================
  // GENERATE EMAIL
  // ============================================
  
  generateEmailBtn.addEventListener('click', async () => {
    try {
      // Show loading state
      generateEmailBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.3"/>
          <path d="M12 2 A 10 10 0 0 1 22 12" stroke-linecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
          </path>
        </svg>
        <span>Generating...</span>
      `;
      generateEmailBtn.disabled = true;
      
      const response = await chrome.runtime.sendMessage({ action: 'generateEmail' });
      
      if (response && response.success) {
        currentEmail = {
          email: response.email,
          username: response.username,
          domain: response.domain
        };
        
        emailValue.textContent = response.email;
        emailDisplay.classList.remove('hidden');
        inboxDisplay.classList.add('hidden');
        
        // Update stats and history
        await loadStats();
        await loadEmailHistory();
        
        // Success animation
        generateEmailBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        generateEmailBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span>Email Generated!</span>
        `;
        
        setTimeout(() => {
          generateEmailBtn.style.background = '';
          generateEmailBtn.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
            <span>Generate Burner Email</span>
          `;
          generateEmailBtn.disabled = false;
        }, 2000);
      } else {
        throw new Error(response?.error || 'Email generation failed');
      }
    } catch (error) {
      console.error('[GhostLayer] Email generation error:', error);
      
      // Error state
      generateEmailBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      generateEmailBtn.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/>
          <line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        <span>Failed. Try Again</span>
      `;
      
      setTimeout(() => {
        generateEmailBtn.style.background = '';
        generateEmailBtn.innerHTML = `
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          <span>Generate Burner Email</span>
        `;
        generateEmailBtn.disabled = false;
      }, 2000);
    }
  });
  
  // ============================================
  // COPY EMAIL
  // ============================================
  
  copyEmailBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(currentEmail.email);
      
      // Success feedback
      const originalHTML = copyEmailBtn.innerHTML;
      copyEmailBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"/>
        </svg>
        Copied!
      `;
      copyEmailBtn.style.background = 'rgba(16, 185, 129, 0.4)';
      
      setTimeout(() => {
        copyEmailBtn.innerHTML = originalHTML;
        copyEmailBtn.style.background = '';
      }, 2000);
    } catch (error) {
      console.error('[GhostLayer] Copy failed:', error);
    }
  });
  
  // ============================================
  // CHECK INBOX
  // ============================================
  
  checkInboxBtn.addEventListener('click', async () => {
    if (!currentEmail) return;
    
    try {
      checkInboxBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" stroke-opacity="0.3"/>
          <path d="M12 2 A 10 10 0 0 1 22 12" stroke-linecap="round">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
          </path>
        </svg>
        Checking...
      `;
      
      const response = await chrome.runtime.sendMessage({
        action: 'checkInbox',
        username: currentEmail.username,
        domain: currentEmail.domain
      });
      
      if (response && response.success) {
        displayMessages(response.messages);
        inboxDisplay.classList.remove('hidden');
        
        // Start auto-refresh
        if (checkInboxInterval) {
          clearInterval(checkInboxInterval);
        }
        checkInboxInterval = setInterval(() => {
          checkInbox(currentEmail.username, currentEmail.domain);
        }, 5000);
      }
      
      checkInboxBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        Check Inbox
      `;
    } catch (error) {
      console.error('[GhostLayer] Inbox check failed:', error);
      checkInboxBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
        </svg>
        Check Inbox
      `;
    }
  });
  
  async function checkInbox(username, domain) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'checkInbox',
        username: username,
        domain: domain
      });
      
      if (response && response.success) {
        displayMessages(response.messages);
      }
    } catch (error) {
      console.error('[GhostLayer] Auto inbox check failed:', error);
    }
  }
  
  function displayMessages(messages) {
    if (!messages || messages.length === 0) {
      messageList.innerHTML = '<div class="empty-state">No messages yet</div>';
      return;
    }
    
    messageList.innerHTML = messages.map(msg => `
      <div class="message-item" data-id="${msg.id}">
        <div class="message-from">From: ${msg.from}</div>
        <div class="message-subject">${msg.subject}</div>
        <div class="message-date">${new Date(msg.date).toLocaleString()}</div>
      </div>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.message-item').forEach(item => {
      item.addEventListener('click', () => {
        readMessage(item.dataset.id);
      });
    });
  }
  
  async function readMessage(messageId) {
    if (!currentEmail) return;
    
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'readEmail',
        username: currentEmail.username,
        domain: currentEmail.domain,
        messageId: messageId
      });
      
      if (response && response.success) {
        const msg = response.message;
        alert(`From: ${msg.from}\nSubject: ${msg.subject}\n\n${msg.textBody || msg.htmlBody || 'No content'}`);
      }
    } catch (error) {
      console.error('[GhostLayer] Message read failed:', error);
    }
  }
  
  closeInboxBtn.addEventListener('click', () => {
    inboxDisplay.classList.add('hidden');
    if (checkInboxInterval) {
      clearInterval(checkInboxInterval);
      checkInboxInterval = null;
    }
  });
  
  // ============================================
  // SETTINGS
  // ============================================
  
  fingerprintToggle.addEventListener('change', async () => {
    try {
      await chrome.storage.local.set({ 
        fingerprintSpoofing: fingerprintToggle.checked 
      });
      console.log('[GhostLayer] Fingerprint spoofing:', fingerprintToggle.checked);
    } catch (error) {
      console.error('[GhostLayer] Failed to save setting:', error);
    }
  });
  
  dataPoisoningToggle.addEventListener('change', async () => {
    try {
      await chrome.storage.local.set({ 
        dataPoisoning: dataPoisoningToggle.checked 
      });
      console.log('[GhostLayer] Data poisoning:', dataPoisoningToggle.checked);
    } catch (error) {
      console.error('[GhostLayer] Failed to save setting:', error);
    }
  });
  
  // ============================================
  // INITIALIZATION
  // ============================================
  
  await loadStats();
  await loadSettings();
  await loadEmailHistory();
  
  // Refresh stats every 5 seconds
  setInterval(loadStats, 5000);
});
