# 🚀 GhostLayer Quick Start Guide

## Installation in Chrome (Developer Mode)

### Step 1: Enable Developer Mode
1. Open Chrome and navigate to: `chrome://extensions/`
2. Toggle **"Developer mode"** in the top-right corner

### Step 2: Load GhostLayer
1. Click **"Load unpacked"**
2. Navigate to the `GhostLayer` folder
3. Click **"Select Folder"**

### Step 3: Pin the Extension
1. Click the puzzle piece icon 🧩 in Chrome toolbar
2. Find **GhostLayer** in the list
3. Click the pin icon 📌 to pin it

---

## 🧪 Testing Features

### Test 1: Fingerprint Spoofing
1. Visit: https://browserleaks.com/canvas
2. **Before GhostLayer**: Take a screenshot of your fingerprint
3. **Click the GhostLayer icon** → Enable "Fingerprint Spoofing"
4. **Refresh the page**
5. **After GhostLayer**: Your fingerprint should be different!

**Expected Result**: Different Canvas hash, UserAgent, Screen Resolution, etc.

### Test 2: Burner Email Generation
1. Visit: https://www.reddit.com/ (or any site requiring email)
2. Click **"Sign Up"**
3. Focus on the email input field
4. **A purple ghost icon should appear** at the right edge
5. Click the ghost icon
6. **Email is auto-filled!**

**Expected Result**: A random email like `ghost_xyz123@1secmail.com`

### Test 3: Check Email Inbox
1. After generating an email, **click the GhostLayer icon**
2. Click **"Check Inbox"**
3. You should see "No messages yet" or any incoming emails
4. Complete a sign-up to test receiving emails

**Expected Result**: Real-time inbox with messages

### Test 4: Stats Dashboard
1. Click the **GhostLayer icon**
2. You should see:
   - **Trackers Blocked**: Increases as you browse
   - **Emails Generated**: Counts your burner emails
   - **Data Poisoned**: Pro feature (shows 0 on free tier)

**Expected Result**: Live updating statistics

---

## 🐛 Troubleshooting

### Ghost Button Not Appearing?
- **Refresh the page** after installing the extension
- Make sure the email field has type="email" or contains "email" in name/id
- Check browser console (F12) for errors

### Fingerprint Not Changing?
- Make sure **"Fingerprint Spoofing"** is enabled in settings
- **Hard refresh** the page (Ctrl+Shift+R)
- Wait 1 hour for profile rotation (or reinstall extension)

### Email Not Generating?
- Check your internet connection
- 1secmail API might be down (try again in a few minutes)
- Check browser console for API errors

### Extension Not Loading?
- Make sure you're in **Developer Mode**
- Check for errors in `chrome://extensions/`
- Try removing and re-adding the extension

---

## 📊 Developer Console Monitoring

Open Chrome DevTools (F12) and check console for:

```
[GhostLayer] Background service worker loaded
[GhostLayer] Content script loaded
[GhostLayer] Fingerprint spoofing injected
[GhostLayer] Fingerprint spoofing active
```

These messages confirm everything is working correctly.

---

## 🎯 Advanced Testing

### Test WebGL Spoofing
```javascript
// Paste in console on any website
const canvas = document.createElement('canvas');
const gl = canvas.getContext('webgl');
console.log('Vendor:', gl.getParameter(gl.VENDOR));
console.log('Renderer:', gl.getParameter(gl.RENDERER));
```

**Expected**: Should show spoofed values like "Intel Inc."

### Test Navigator Spoofing
```javascript
// Paste in console
console.log('UserAgent:', navigator.userAgent);
console.log('Platform:', navigator.platform);
console.log('Hardware:', navigator.hardwareConcurrency);
console.log('Memory:', navigator.deviceMemory);
```

**Expected**: Randomized values different from your actual hardware

---

## ✅ Feature Checklist

- [ ] Extension loads without errors
- [ ] Ghost icon appears on email fields
- [ ] Burner email generates successfully
- [ ] Inbox shows messages (after receiving)
- [ ] Copy email button works
- [ ] Stats update in real-time
- [ ] Settings toggles work
- [ ] Fingerprint changes on refresh
- [ ] No console errors

---

## 🚀 Next Steps

1. **Browse normally** and watch trackers get blocked
2. **Generate multiple emails** to test the history
3. **Test on different websites** (Reddit, Medium, etc.)
4. **Check fingerprint** on multiple testing sites
5. **Provide feedback** or report bugs

---

## 📝 Notes

- Free tier: **3 burner emails per day**
- Profile rotation: **Every 1 hour**
- Inbox auto-refresh: **Every 5 seconds**
- Data poisoning: **Pro feature only**

---

**Need Help?** Open an issue on GitHub or check the full README.md

Happy testing! 👻
