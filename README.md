# GhostLayer: AI Privacy & Burner Identity

## Introduction
GhostLayer is a browser extension that enhances your privacy by spoofing your fingerprint and poisoning your data. It works with the modern web, not against it. It also provides instant burner emails with built-in inbox.


## Why GhostLayer?

Traditional ad-blockers are **failing**. Websites are forcing you to disable them, and trackers are getting smarter. **GhostLayer** is the next generation of privacy that works *with* the modern web, not against it.

Instead of breaking websites by blocking scripts, GhostLayer feeds trackers **"Data Poison"**—fake browsing history, randomized device fingerprints, and noise—so your real identity remains invisible.

### The Problem We Solve

| Traditional Approach | GhostLayer Approach |
| --- | --- |
| ❌ Blocks tracking scripts | ✅ Spoofs your fingerprint |
| ❌ Websites detect and block you | ✅ Completely undetectable |
| ❌ Breaks website functionality | ✅ Seamless browsing experience |
| ❌ Passive protection | ✅ Active data poisoning |

---

##  Features

### **Smart Fingerprint Spoofing**

Randomizes your digital fingerprint for every session:

* **UserAgent** - Appears as different browsers/OS versions.
* **Screen Resolution** - Fakes display dimensions.
* **Hardware Concurrency** - Randomizes reported CPU cores.
* **Device Memory** - Spoofs available RAM.
* **WebGL/Canvas Fingerprint** - Injects noise into graphics data.
* **Battery & Timezone** - Masks location and device health.

### **Instant Burner Emails**

* **One-Click Generation** - A ghost icon appears directly in email fields.
* **Disposable Addresses** - Keep your primary inbox spam-free.
* **Built-in Inbox** - View verification codes directly in the extension popup.
* **Real-time Updates** - Auto-refreshing inbox for instant access.

### **Data Poisoning**

* Simulates background browsing activity every 15 minutes.
* Confuses ad trackers with fake interests and search patterns.
* Makes your actual data profile statistically useless to advertisers.

### **Performance & Privacy**

* **Manifest V3** - Built for maximum efficiency and security.
* **No Logs** - No sign-up required; no data ever leaves your local machine.
* **Open Source** - Audit the code yourself for full transparency.

---

## Installation

### For Chrome Browser
1. Visit the [Chrome Web Store](#) (Coming Soon).
2. Click **"Add to Chrome"**.
3. Click the GhostLayer icon in your toolbar to begin.

### For Microsoft Edge Browser
1. Visit the [Edge Web Store](https://microsoftedge.microsoft.com/addons/detail/ghostlayer-ai-privacy-/hpkbbjgnibpilndeidpoadbjaiooadch).
2. Click **"Add to Edge"**.
3. Click the GhostLayer icon in your toolbar to begin.

### For Firefox Browser
1. Visit the [Firefox Add-ons](https://addons.mozilla.org/en-US/firefox/addon/ghostlayer/).
2. Click **"Add to Firefox"**.
3. Click the GhostLayer icon in your toolbar to begin.

### Manual Installation (Developer Mode)

1. **Clone the repository:**
```bash
git clone https://github.com/santoshvandari/GhostLayer
cd GhostLayer

```


2. **Open Chrome Extensions:**
* Navigate to `chrome://extensions/`.
* Enable **"Developer mode"** (top-right toggle).


3. **Load the extension:**
* Click **"Load unpacked"**.
* Select the `src` folder within the project directory.


## Development

### Tech Stack

* **Manifest V3** - Modern extension architecture.
* **Vanilla JavaScript** - Lightweight, dependency-free performance.
* **APIs** - Mailtm, Guerrilla, and Mailnesia for temporary mail.

### Project Structure

```text
GhostLayer/
├── src/ 
|   |__manifest.json       # Extension configuration
│   ├── background.js        # Service worker (Alarms & APIs)
│   ├── content.js           # Content script (DOM interaction)
│   ├── injected.js          # API Overrides (Fingerprinting)
│   ├── popup.html/js/css    # UI Components
│   └── modules/             
│   |   ├── fingerprint.js   # Spoofing logic
│   |   ├── emailManager.js  # API integration
│   |   └── dataPoisoner.js  # Noise generation logic
│   |__ icons/               # Extension icons
└── README.md
```
---


## Contributing
We welcome contributions! If you'd like to contribute to this Browser Extension Project, please check out our [Contribution Guidelines](Contributing.md).

## Code of Conduct
Please review our [Code of Conduct](Code_of_Conduct.md) before participating in this extension development.

## License
This project is licensed under the MIT [License](LICENSE).

### Support the Project

If GhostLayer helps you stay anonymous, consider supporting its development:

* **GitHub Sponsors**: [santoshvandari](https://github.com/sponsors/santoshvandari)
* **Ko-fi**: [santoshvandari](https://ko-fi.com/santoshvandari)
* **Buy Me a Coffee**: [santoshvandari](https://www.buymeacoffee.com/santoshvandari)

---

<div align="center">

**Take back your digital footprint. Go Ghost.** 👻

</div>
