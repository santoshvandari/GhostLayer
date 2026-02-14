import { SPOOFING_PROFILES } from './fingerprint.js';

let lastEmailRequestTime = 0;
const EMAIL_THROTTLE_MS = 6000;

export async function generateBurnerEmail() {
  try {
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
      const domainsResponse = await fetch('https://api.mail.tm/domains', {
        headers: {
          'User-Agent': SPOOFING_PROFILES.userAgents[Math.floor(Math.random() * SPOOFING_PROFILES.userAgents.length)]
        }
      });
      const domainsData = await domainsResponse.json();
      const domain = domainsData['hydra:member'][0].domain;
      
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
        throw new Error('Mail.tm account creation failed');
      }
      
      const accountData = await createResponse.json();
      const token = await getMailTmToken(email, password);
      
      const result = await chrome.storage.local.get(['emailHistory', 'stats']);
      const history = result.emailHistory || [];
      const stats = result.stats || { trackersBlocked: 0, emailsGenerated: 0, dataPoisoned: 0 };
      
      const newEmailItem = {
        email: email,
        username: email,
        password: password,
        token: token,
        provider: 'mailtm',
        accountId: accountData.id,
        createdAt: Date.now()
      };
      
      history.unshift(newEmailItem);
      if (history.length > 50) history.pop();
      stats.emailsGenerated++;
      
      await chrome.storage.local.set({ emailHistory: history, stats: stats });
      return { success: true, ...newEmailItem };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function getMailTmToken(email, password) {
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

export async function checkEmailInbox(emailData) {
  const { provider, email, password, sid_token } = emailData;
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
        intro: msg.subject
      }));
      
      return { success: true, messages };
    } else {
      throw new Error('This email provider is currently unsupported or down.');
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function readEmail(emailData, messageId) {
  const { provider, email, password, sid_token } = emailData;
  
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
          htmlBody: data.mail_body,
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
    return { success: false, error: error.message };
  }
}
