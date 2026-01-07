# 🔧 GhostLayer - Troubleshooting Guide

## ✅ Recent Fixes Applied

### 1. Email Generation Error - FIXED ✓
**Issue:** `SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON`

**Root Cause:** The 1secmail API was returning HTML error pages instead of JSON when trying to fetch the domain list.

**Solution Applied:** Updated `background.js` to use hardcoded 1secmail domains instead of fetching them from the API.

### 2. Extension Icons Not Showing - FIXED ✓
**Issue:** Icons not appearing in Chrome toolbar/extensions page

**Root Cause:** The icon files were actually JPEG images renamed to .png and were all 1024x1024 instead of the required sizes (16x16, 48x48, 128x128).

**Solution Applied:** 
- Converted all icons to proper PNG format with transparency (RGBA)
- Resized to correct dimensions: 16x16, 48x48, 128x128
- Fixed manifest.json icon paths

**Action Required:** 
1. **Reload the extension** in Chrome:
   - Go to `chrome://extensions/`
   - Find GhostLayer
   - Click the **refresh icon** 🔄
2. **Verify icons appear**:
   - Check toolbar for purple ghost icon
   - Check `chrome://extensions/` for extension card icon

---

## 🧪 Testing After Fix

### Test 1: Generate Email
1. Click the GhostLayer extension icon
2. Click **"Generate Burner Email"**
3. You should now see an email like: `ghost_abc123@1secmail.com`
4. No errors in the console!

### Test 2: Check Different Domains
The extension now uses these verified 1secmail domains:
- `1secmail.com`
- `1secmail.org`
- `1secmail.net`
- `wwjmp.com`
- `esiix.com`
- `xojxe.com`
- `yoggm.com`

Each email generation will randomly pick one of these domains.

### Test 3: Verify Inbox Works
1. Generate an email
2. Click **"Check Inbox"**
3. The inbox API should work (uses same 1secmail service)

---

## 🐛 Other Common Issues

### Issue: Extension Won't Load
**Symptoms:** Error when loading unpacked extension

**Solutions:**
1. Make sure you're in **Developer Mode**
2. Check that all files are present (especially `manifest.json`)
3. Look for syntax errors in Chrome extensions page
4. Try removing and re-adding the extension

### Issue: Ghost Button Not Appearing
**Symptoms:** No purple ghost icon on email fields

**Solutions:**
1. **Refresh the webpage** after installing the extension
2. Make sure the input field has `type="email"` or contains "email" in name/id/placeholder
3. Check browser console (F12) for content script errors
4. Try on a different website (e.g., Reddit sign-up)

### Issue: Fingerprint Not Changing
**Symptoms:** Same fingerprint on browserleaks.com

**Solutions:**
1. Make sure **"Fingerprint Spoofing"** is enabled in settings
2. **Hard refresh** the page (Ctrl + Shift + R)
3. Profile rotates every 1 hour - wait or reinstall extension for new profile
4. Check console for "[GhostLayer] Fingerprint spoofing active" message

### Issue: Stats Not Updating
**Symptoms:** Dashboard shows 0 for everything

**Solutions:**
1. Stats update in real-time - try generating an email or visiting a page with trackers
2. Check Chrome DevTools console for errors
3. Stats are stored in local storage - clearing browser data will reset them

### Issue: Inbox Shows "No messages yet"
**Symptoms:** Can't see received emails

**Solutions:**
1. Make sure you're checking the inbox for the **most recently generated email**
2. Some services take a few seconds to send emails
3. Try sending a test email to the address manually
4. Check that the email address is correct (copy it)
5. The 1secmail API might be slow - wait 30 seconds and check again

---

## 🔍 Debugging Tools

### Check Console Messages
Open Chrome DevTools (F12) and look for these messages:

**Success Messages:**
```
[GhostLayer] Background service worker loaded
[GhostLayer] Content script loaded
[GhostLayer] Fingerprint spoofing injected
[GhostLayer] Fingerprint spoofing active
```

**Error Messages:**
Look for red error messages starting with `[GhostLayer]`

### Check Extension Service Worker
1. Go to `chrome://extensions/`
2. Find GhostLayer
3. Click **"service worker"** link
4. Check the console for background script errors

### Verify API Calls
In the service worker console, manually test:
```javascript
// Test email generation
chrome.runtime.sendMessage({ action: 'generateEmail' }, (response) => {
  console.log('Email generation:', response);
});

// Test stats
chrome.runtime.sendMessage({ action: 'getStats' }, (response) => {
  console.log('Stats:', response);
});
```

---

## 📊 Verify Extension State

### Check Storage
In the service worker console:
```javascript
chrome.storage.local.get(null, (data) => {
  console.log('All stored data:', data);
});
```

You should see:
- `fingerprintSpoofing`: true/false
- `emailHistory`: Array of generated emails
- `stats`: Object with counters
- `currentProfile`: Spoofing profile

---

## 🚨 If All Else Fails

### Complete Reset
1. **Remove the extension**
   - Go to `chrome://extensions/`
   - Click "Remove" on GhostLayer

2. **Clear local storage**
   - Right-click on extension icon area → Inspect
   - Go to Application tab → Local Storage
   - Clear all GhostLayer data

3. **Reload the extension**
   - Click "Load unpacked" again
   - Select the GhostLayer folder

4. **Test from scratch**
   - Open popup
   - Generate an email
   - Check stats

---

## 🆘 Still Having Issues?

### Get Help
1. **Check the console** - 90% of issues show error messages there
2. **Test in Incognito** - Rules out conflicts with other extensions
3. **Try a different browser profile** - Fresh Chrome profile for testing
4. **Report the issue** - Open GitHub issue with:
   - Error message from console
   - Steps to reproduce
   - Chrome version
   - Screenshots if possible

---

## ✅ Quick Checklist

Before reporting an issue, verify:

- [ ] Extension is loaded in Developer Mode
- [ ] All files are present (13 files + icons folder + screenshots folder)
- [ ] Extension has been reloaded after the fix
- [ ] You tested on a fresh page (hard refresh)
- [ ] Chrome is up to date
- [ ] No other privacy extensions are conflicting
- [ ] You checked the browser console for errors

---

## 🎯 Expected Behavior After Fix

### Email Generation
✅ Should generate successfully without errors
✅ Format: `ghost_[random]@[domain]`
✅ Appears in popup instantly
✅ Stats increment immediately
✅ History shows in "Recent Emails"

### Inbox Checking
✅ "Check Inbox" button works
✅ Shows "No messages yet" initially (not an error!)
✅ Auto-refreshes every 5 seconds
✅ Messages appear when received

### Fingerprint Spoofing
✅ Works on every page load
✅ Different values on https://browserleaks.com/
✅ Console shows "Fingerprint spoofing active"
✅ No website breakage

---

**Last Updated:** 2026-01-07 after email generation fix
**Status:** ✅ Email generation issue resolved
