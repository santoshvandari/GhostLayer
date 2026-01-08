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
  
  const messageModal = document.getElementById('messageModal');
  const modalFrom = document.getElementById('modalFrom');
  const modalSubject = document.getElementById('modalSubject');
  const modalBody = document.getElementById('modalBody');
  const closeModalBtn = document.getElementById('closeModalBtn');
  
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
      
      // If no current email is selected, try to load it from storage or default to history
      if (!currentEmail) {
        const stored = await chrome.storage.local.get(['activeEmail']);
        if (stored.activeEmail) {
          currentEmail = stored.activeEmail;
        } else if (history.length > 0) {
          currentEmail = history[0];
        }
        
        if (currentEmail) {
          emailValue.textContent = currentEmail.email;
          
          // Update provider tag
          const providerTag = document.querySelector('.provider-tag') || document.createElement('span');
          providerTag.className = 'provider-tag';
          providerTag.textContent = currentEmail.provider || '1secmail';
          if (!document.querySelector('.provider-tag')) {
             emailValue.parentNode.appendChild(providerTag);
          }
          
          emailDisplay.classList.remove('hidden');
        }
      }
      
      emailHistory.innerHTML = history.slice(0, 5).map(item => {
        const date = new Date(item.createdAt);
        const timeAgo = getTimeAgo(date);
        
        return `
          <div class="history-item" data-email="${item.email}">
            <div class="history-email-row">
              <span class="history-email">${item.email}</span>
              <span class="history-provider">${item.provider || '1secmail'}</span>
            </div>
            <div class="history-date">${timeAgo}</div>
          </div>
        `;
      }).join('');

      // Add click handlers to history items to switch active email
      document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', async () => {
          const email = item.dataset.email;
          const selected = history.find(h => h.email === email);
          if (selected) {
            currentEmail = selected;
            
            // Save as active email
            await chrome.storage.local.set({ activeEmail: currentEmail });
            
            emailValue.textContent = currentEmail.email;
            
            // Update provider tag
            const providerTag = document.querySelector('.provider-tag') || document.createElement('span');
            providerTag.className = 'provider-tag';
            providerTag.textContent = currentEmail.provider || '1secmail';
            if (!document.querySelector('.provider-tag')) {
               emailValue.parentNode.appendChild(providerTag);
            }

            emailDisplay.classList.remove('hidden');
            inboxDisplay.classList.add('hidden');
            if (checkInboxInterval) {
              clearInterval(checkInboxInterval);
              checkInboxInterval = null;
            }
            console.log('[GhostLayer] Switched email to:', currentEmail.email);
          }
        });
      });
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
        currentEmail = response;
        
        // Save as active email
        await chrome.storage.local.set({ activeEmail: currentEmail });
        
        emailValue.textContent = response.email;
        emailDisplay.classList.remove('hidden');
        inboxDisplay.classList.add('hidden');
        
        // Update provider tag
        const providerTag = document.querySelector('.provider-tag') || document.createElement('span');
        providerTag.className = 'provider-tag';
        providerTag.textContent = response.provider;
        if (!document.querySelector('.provider-tag')) {
           emailValue.parentNode.appendChild(providerTag);
        }
        
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
        emailData: currentEmail
      });
      
      if (!response || !response.success) {
        throw new Error(response ? response.error : 'Unknown error');
      }
      
      if (response && response.success) {
        displayMessages(response.messages);
        inboxDisplay.classList.remove('hidden');
        
        // Show last updated time
        const now = new Date();
        const timeStr = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0');
        document.querySelector('.inbox-header span').innerHTML = `Inbox <small style="opacity: 0.6; font-size: 10px; margin-left: 8px;">(Refreshed: ${timeStr})</small>`;
        
        // Manual Refresh only to avoid 403 blocks
        if (checkInboxInterval) {
          clearInterval(checkInboxInterval);
          checkInboxInterval = null;
        }
      }
      
      checkInboxBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
        </svg>
        Refresh Inbox
      `;
    } catch (error) {
      console.error('[GhostLayer] Inbox check failed:', error); // Removed in future
      
      const isThrottle = error.message.includes('Cooling down');
      const is403 = error.message.includes('403');
      
      let displayMsg = isThrottle ? error.message : 'Rate limited by server.';
      if (is403) displayMsg = 'Server busy. Try new email.';
      
      document.querySelector('.inbox-header span').innerHTML = `<span style="color: #ef4444; font-size: 10px;">${displayMsg}</span>`;
      
      checkInboxBtn.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
        </svg>
        ${isThrottle ? 'Wait...' : (is403 ? 'Server Blocked' : 'Try Again')}
      `;
      
      if (isThrottle) {
        checkInboxBtn.disabled = true;
        setTimeout(() => {
          checkInboxBtn.disabled = false;
          checkInboxBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            Refresh Inbox
          `;
        }, 3000); // Shorter visual lock
      }
    }
  });
  
  async function checkInbox(emailData) {
    try {
      const response = await chrome.runtime.sendMessage({
        action: 'checkInbox',
        emailData: emailData
      });
      
      if (response && response.success) {
        displayMessages(response.messages);
      } else {
        throw new Error(response ? response.error : 'Unknown error');
      }
    } catch (error) {
      console.error('[GhostLayer] Auto inbox check failed:', error);
    }
  }
  
  function displayMessages(messages) {
    if (!messages || messages.length === 0) {
      messageList.innerHTML = '<div class="empty-state">No messages yet. Waiting for email...</div>';
      return;
    }
    
    // Check if new messages arrived
    const currentCount = messageList.querySelectorAll('.message-item').length;
    
    messageList.innerHTML = messages.map(msg => {
      // Handle both "YYYY-MM-DD HH:MM:SS" and ISO formats
      let datePart = msg.date;
      if (msg.date.includes(' ')) {
        datePart = msg.date.split(' ')[1].substring(0, 5); // HH:MM
      } else if (msg.date.includes('T')) {
        const d = new Date(msg.date);
        datePart = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
      }
      
      return `
        <div class="message-item" data-id="${msg.id}">
          <div class="message-header-row">
            <span class="message-from">${msg.from}</span>
            <span class="message-time">${datePart}</span>
          </div>
          <div class="message-subject">${msg.subject}</div>
        </div>
      `;
    }).join('');
    
    // Play subtle notification if new messages arrived
    if (currentCount > 0 && messages.length > currentCount) {
       console.log('[GhostLayer] New message received!');
    }
    
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
        emailData: currentEmail,
        messageId: messageId
      });
      
      if (response && response.success) {
        const msg = response.message;
        
        // Populate and show modal
        modalFrom.textContent = `From: ${msg.from}`;
        modalSubject.textContent = msg.subject;
        modalBody.innerHTML = msg.htmlBody || msg.textBody || 'No content';
        
        messageModal.classList.remove('hidden');
      } else {
        throw new Error(response ? response.error : 'Unknown error');
      }
    } catch (error) {
      console.error('[GhostLayer] Message read failed:', error);
    }
  }

  // Close Modal Listeners
  closeModalBtn.addEventListener('click', () => {
    messageModal.classList.add('hidden');
  });

  // Close modal on click outside
  messageModal.addEventListener('click', (e) => {
    if (e.target === messageModal) {
      messageModal.classList.add('hidden');
    }
  });

  // Close modal on escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !messageModal.classList.contains('hidden')) {
      messageModal.classList.add('hidden');
    }
  });
  
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
