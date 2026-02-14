// GhostLayer Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  
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
  
  function createSvg(width, height, pathData, isLoader = false) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "2");

    if (isLoader) {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute("cx", "12"); circle.setAttribute("cy", "12"); circle.setAttribute("r", "10");
      circle.setAttribute("stroke-opacity", "0.3");
      svg.appendChild(circle);

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", "M12 2 A 10 10 0 0 1 22 12");
      path.setAttribute("stroke-linecap", "round");
      
      const animate = document.createElementNS("http://www.w3.org/2000/svg", "animateTransform");
      animate.setAttribute("attributeName", "transform");
      animate.setAttribute("type", "rotate");
      animate.setAttribute("from", "0 12 12");
      animate.setAttribute("to", "360 12 12");
      animate.setAttribute("dur", "1s");
      animate.setAttribute("repeatCount", "indefinite");
      path.appendChild(animate);
      svg.appendChild(path);
    } else if (Array.isArray(pathData)) {
        pathData.forEach(d => {
            const el = document.createElementNS("http://www.w3.org/2000/svg", d.tag || "path");
            Object.entries(d.attr).forEach(([k, v]) => el.setAttribute(k, v));
            svg.appendChild(el);
        });
    } else {
      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("d", pathData);
      svg.appendChild(path);
    }
    return svg;
  }

  function setButtonState(btn, text, iconType = 'loader', iconData = null) {
    btn.textContent = '';
    let icon;
    if (iconType === 'loader') {
      icon = createSvg(20, 20, null, true);
    } else {
      icon = createSvg(iconType === 'check' ? 16 : 20, iconType === 'check' ? 16 : 20, iconData);
    }
    btn.appendChild(icon);
    btn.appendChild(document.createTextNode(' ' + text));
  }
  
  async function loadStats() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getStats' });
      if (response && response.stats) {
        animateNumber(trackersBlockedEl, response.stats.trackersBlocked);
        animateNumber(emailsGeneratedEl, response.stats.emailsGenerated);
        animateNumber(dataPoisonedEl, response.stats.dataPoisoned);
      }
    } catch (error) {
      // Failed to load stats
    }
  }
  
  function animateNumber(element, target) {
    const current = parseInt(element.textContent) || 0;
    const duration = 500; // Animation duration in milliseconds
    const steps = 20; // Number of animation steps
    const stepDuration = duration / steps;
    const increment = Math.ceil((target - current) / steps);
    
    let currentValue = current;
    let step = 0;
    
    const timer = setInterval(() => {
      step++;
      currentValue = current + Math.floor(((target - current) * step) / steps);
      
      if (step >= steps || currentValue >= target) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = currentValue;
      }
    }, stepDuration);
  }
  
  async function loadSettings() {
    try {
      const settings = await chrome.storage.local.get(['fingerprintSpoofing', 'dataPoisoning']);
      fingerprintToggle.checked = settings.fingerprintSpoofing !== false;
      dataPoisoningToggle.checked = settings.dataPoisoning !== false;
    } catch (error) {
      // Failed to load settings
    }
  }
  
  async function loadEmailHistory() {
    try {
      const result = await chrome.storage.local.get(['emailHistory']);
      const history = result.emailHistory || [];
      
      emailHistory.textContent = '';
      if (history.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = 'No emails generated yet';
        emailHistory.appendChild(empty);
        return;
      }
      
      // Load current email if needed
      if (!currentEmail) {
        const stored = await chrome.storage.local.get(['activeEmail']);
        if (stored.activeEmail) {
          currentEmail = stored.activeEmail;
        } else if (history.length > 0) {
          currentEmail = history[0];
        }
        
        if (currentEmail) {
          emailValue.textContent = currentEmail.email;
          const providerTag = document.querySelector('.provider-tag') || document.createElement('span');
          providerTag.className = 'provider-tag';
          providerTag.textContent = currentEmail.provider || '1secmail';
          if (!document.querySelector('.provider-tag')) {
             emailValue.parentNode.appendChild(providerTag);
          }
          emailDisplay.classList.remove('hidden');
        }
      }
      
      history.slice(0, 5).forEach(item => {
        const date = new Date(item.createdAt);
        const timeAgo = getTimeAgo(date);
        
        const div = document.createElement('div');
        div.className = 'history-item';
        div.dataset.email = item.email;
        
        const row = document.createElement('div');
        row.className = 'history-email-row';
        
        const emailSpan = document.createElement('span');
        emailSpan.className = 'history-email';
        emailSpan.textContent = item.email;
        
        const providerSpan = document.createElement('span');
        providerSpan.className = 'history-provider';
        providerSpan.textContent = item.provider || '1secmail';
        
        row.appendChild(emailSpan);
        row.appendChild(providerSpan);
        
        const dateDiv = document.createElement('div');
        dateDiv.className = 'history-date';
        dateDiv.textContent = timeAgo;
        
        div.appendChild(row);
        div.appendChild(dateDiv);
        
        div.addEventListener('click', async () => {
          currentEmail = item;
          await chrome.storage.local.set({ activeEmail: currentEmail });
          emailValue.textContent = currentEmail.email;
          const tag = document.querySelector('.provider-tag');
          if (tag) tag.textContent = currentEmail.provider || '1secmail';
          emailDisplay.classList.remove('hidden');
          inboxDisplay.classList.add('hidden');
          if (checkInboxInterval) { clearInterval(checkInboxInterval); checkInboxInterval = null; }
        });
        
        emailHistory.appendChild(div);
      });
    } catch (error) {
      // Failed to load history
    }
  }
  
  function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  }
  
  generateEmailBtn.addEventListener('click', async () => {
    try {
      setButtonState(generateEmailBtn, 'Generating...');
      generateEmailBtn.disabled = true;
      
      const response = await chrome.runtime.sendMessage({ action: 'generateEmail' });
      
      if (response && response.success) {
        currentEmail = response;
        await chrome.storage.local.set({ activeEmail: currentEmail });
        emailValue.textContent = response.email;
        emailDisplay.classList.remove('hidden');
        inboxDisplay.classList.add('hidden');
        
        const tag = document.querySelector('.provider-tag') || document.createElement('span');
        tag.className = 'provider-tag';
        tag.textContent = response.provider;
        if (!document.querySelector('.provider-tag')) emailValue.parentNode.appendChild(tag);
        
        await loadStats();
        await loadEmailHistory();
        
        generateEmailBtn.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
        setButtonState(generateEmailBtn, 'Email Generated!', 'check', "M20 6 9 17 4 12");
        
        setTimeout(() => {
          generateEmailBtn.style.background = '';
          setButtonState(generateEmailBtn, 'Generate Burner Email', 'plus', [
            {tag: 'circle', attr: {cx: '12', cy: '12', r: '10'}},
            {tag: 'line', attr: {x1: '12', y1: '8', x2: '12', y2: '16'}},
            {tag: 'line', attr: {x1: '8', y1: '12', x2: '16', y2: '12'}}
          ]);
          generateEmailBtn.disabled = false;
        }, 2000);
      } else {
        throw new Error(response?.error || 'Email generation failed');
      }
    } catch (error) {
      generateEmailBtn.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      setButtonState(generateEmailBtn, 'Failed. Try Again', 'error', [
        {tag: 'circle', attr: {cx: '12', cy: '12', r: '10'}},
        {tag: 'line', attr: {x1: '15', y1: '9', x2: '9', y2: '15'}},
        {tag: 'line', attr: {x1: '9', y1: '9', x2: '15', y2: '15'}}
      ]);
      setTimeout(() => {
        generateEmailBtn.style.background = '';
        setButtonState(generateEmailBtn, 'Generate Burner Email', 'plus', [
            {tag: 'circle', attr: {cx: '12', cy: '12', r: '10'}},
            {tag: 'line', attr: {x1: '12', y1: '8', x2: '12', y2: '16'}},
            {tag: 'line', attr: {x1: '8', y1: '12', x2: '16', y2: '12'}}
        ]);
        generateEmailBtn.disabled = false;
      }, 2000);
    }
  });
  
  copyEmailBtn.addEventListener('click', async () => {
    if (!currentEmail) return;
    try {
      await navigator.clipboard.writeText(currentEmail.email);
      const originalContent = Array.from(copyEmailBtn.childNodes);
      setButtonState(copyEmailBtn, 'Copied!', 'check', "M20 6 9 17 4 12");
      copyEmailBtn.style.background = 'rgba(16, 185, 129, 0.4)';
      setTimeout(() => {
        copyEmailBtn.textContent = '';
        originalContent.forEach(node => copyEmailBtn.appendChild(node));
        copyEmailBtn.style.background = '';
      }, 2000);
    } catch (e) {}
  });
  
  checkInboxBtn.addEventListener('click', async () => {
    if (!currentEmail) return;
    try {
      setButtonState(checkInboxBtn, 'Checking...', 'loader');
      const response = await chrome.runtime.sendMessage({ action: 'checkInbox', emailData: currentEmail });
      
      if (response && response.success) {
        displayMessages(response.messages);
        inboxDisplay.classList.remove('hidden');
        const now = new Date();
        const timeStr = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0') + ':' + String(now.getSeconds()).padStart(2, '0');
        const header = document.querySelector('.inbox-header span');
        header.textContent = 'Inbox ';
        const small = document.createElement('small');
        small.style.opacity = '0.6'; small.style.fontSize = '10px'; small.style.marginLeft = '8px';
        small.textContent = `(Refreshed: ${timeStr})`;
        header.appendChild(small);
      } else {
        throw new Error(response?.error || 'Check failed');
      }
      setButtonState(checkInboxBtn, 'Refresh Inbox', 'refresh', "M23 4v6h-6M1 20v-6h6M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15");
    } catch (error) {
      const header = document.querySelector('.inbox-header span');
      header.textContent = '';
      const err = document.createElement('span');
      err.style.color = '#ef4444'; err.style.fontSize = '10px';
      err.textContent = error.message.includes('Cooling down') ? error.message : 'Rate limited.';
      header.appendChild(err);
      
      setButtonState(checkInboxBtn, 'Try Again', 'error', [
        {tag: 'circle', attr: {cx: '12', cy: '12', r: '10'}},
        {tag: 'line', attr: {x1: '15', y1: '9', x2: '9', y2: '15'}},
        {tag: 'line', attr: {x1: '9', y1: '9', x2: '15', y2: '15'}}
      ]);
    }
  });
  
  function displayMessages(messages) {
    messageList.textContent = '';
    if (!messages || messages.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'empty-state';
      empty.textContent = 'No messages yet.';
      messageList.appendChild(empty);
      return;
    }
    
    messages.forEach(msg => {
      const div = document.createElement('div');
      div.className = 'message-item';
      div.dataset.id = msg.id;
      
      const header = document.createElement('div');
      header.className = 'message-header-row';
      const from = document.createElement('span'); from.className = 'message-from'; from.textContent = msg.from;
      const time = document.createElement('span'); time.className = 'message-time'; time.textContent = msg.date.includes(' ') ? msg.date.split(' ')[1].substring(0, 5) : 'Recently';
      header.appendChild(from); header.appendChild(time);
      
      const sub = document.createElement('div'); sub.className = 'message-subject'; sub.textContent = msg.subject;
      div.appendChild(header); div.appendChild(sub);
      
      div.addEventListener('click', () => readMessage(msg.id));
      messageList.appendChild(div);
    });
  }
  
  async function readMessage(messageId) {
    if (!currentEmail) return;
    try {
      const resp = await chrome.runtime.sendMessage({ action: 'readEmail', emailData: currentEmail, messageId });
      if (resp && resp.success) {
        modalFrom.textContent = `From: ${resp.message.from}`;
        modalSubject.textContent = resp.message.subject;
        modalBody.textContent = '';
        const doc = new DOMParser().parseFromString(resp.message.htmlBody || resp.message.textBody || '', 'text/html');
        Array.from(doc.body.childNodes).forEach(node => modalBody.appendChild(document.importNode(node, true)));
        messageModal.classList.remove('hidden');
      }
    } catch (e) {}
  }

  // Basic listeners
  closeModalBtn.addEventListener('click', () => messageModal.classList.add('hidden'));
  closeInboxBtn.addEventListener('click', () => inboxDisplay.classList.add('hidden'));
  fingerprintToggle.addEventListener('change', () => chrome.storage.local.set({ fingerprintSpoofing: fingerprintToggle.checked }));
  dataPoisoningToggle.addEventListener('change', () => chrome.storage.local.set({ dataPoisoning: dataPoisoningToggle.checked }));

  // Init
  await loadStats();
  await loadSettings();
  await loadEmailHistory();
  setInterval(loadStats, 5000);
});
