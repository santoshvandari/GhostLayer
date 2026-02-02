# Privacy Policy for GhostLayer

**Last Updated:** January 2026

## 1. Introduction
GhostLayer ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how our browser extension handles your data. The core philosophy of GhostLayer is **Data Minimization**—we built this tool to protect your privacy, not invade it.

**TL;DR:** We don't collect, store, or transmit any of your personal data. All data stays on your device. We only connect to third-party temporary email services when you explicitly generate a burner email.

## 2. Data We Collect
**We do not collect, store, or transmit any personal data to our servers.**

*   **No Accounts:** You do not need to create an account to use GhostLayer.
*   **No Analytics:** We do not use Google Analytics, telemetry, or any third-party tracking software in our extension.
*   **No Backend Server:** GhostLayer runs entirely on your local device (client-side). We do not operate a backend server that receives your browsing history, passwords, or personal information.
*   **No Tracking:** We do not track your browsing behavior, websites visited, or any user activity.

## 3. Local Data Storage
We store the following data **locally** in your browser using `chrome.storage.local` to ensure the extension functions correctly. This data never leaves your device:

### 3.1 Settings & Preferences
*   **Fingerprint Spoofing Toggle:** On/off state (default: enabled)
*   **Data Poisoning Toggle:** On/off state (default: enabled)

### 3.2 Email History
*   **Email Addresses:** A history of up to 50 burner email addresses you have generated
*   **Provider Information:** Which temporary email service was used (Mail.tm, Guerrilla Mail, or Mailnesia)
*   **Authentication Tokens:** Temporary tokens for accessing email inboxes (only stored for Mail.tm provider)
*   **Creation Timestamps:** When each email was generated
*   **Active Email:** The currently selected email address for inbox viewing

### 3.3 Fingerprint Spoofing Profile
*   **Randomized User Agent:** Browser identification string
*   **Screen Resolution:** Fake display dimensions
*   **Hardware Specifications:** Spoofed CPU cores and RAM
*   **Platform:** Operating system identifier
*   **Language Settings:** Browser language preferences
*   **Timezone Offset:** Randomized timezone
*   **Profile Timestamp:** When the current profile was generated (refreshed every hour)

### 3.4 Statistics
*   **Trackers Detected:** Count of tracking scripts detected on websites
*   **Emails Generated:** Total number of burner emails created
*   **Data Poisoning Events:** Number of simulated browsing activities

### 3.5 Data Retention
All locally stored data can be cleared at any time by:
*   Uninstalling the extension
*   Clearing your browser's extension storage
*   Resetting your browser settings

## 4. Third-Party Services
GhostLayer interacts with the following third-party services **only when you explicitly request to generate or check a burner email**:

### 4.1 Mail.tm (api.mail.tm)
*   **Purpose:** Generate temporary email addresses and receive messages
*   **Data Shared:** Randomly generated username and password (no personal information)
*   **Communication:** Direct API calls from your browser to their servers
*   **Privacy Policy:** [https://docs.mail.tm/](https://docs.mail.tm/)

### 4.2 Guerrilla Mail (guerrillamail.com)
*   **Purpose:** Generate temporary email addresses and receive messages
*   **Data Shared:** Session tokens only (no personal information)
*   **Communication:** Direct API calls from your browser to their servers
*   **Privacy Policy:** [https://www.guerrillamail.com/](https://www.guerrillamail.com/)

### 4.3 Mailnesia (mailnesia.com)
*   **Purpose:** Generate temporary email addresses and receive messages
*   **Data Shared:** Randomly generated mailbox names (no personal information)
*   **Communication:** Direct API calls from your browser to their servers
*   **Privacy Policy:** [https://mailnesia.com/](https://mailnesia.com/)

**Important Notes:**
*   The extension randomly selects one of these services when you generate an email
*   GhostLayer acts only as a **client-side bridge** between your browser and these services
*   **We do not proxy, log, or intercept any email content**
*   All communication happens directly between your browser and the email service
*   Please review each service's privacy policy for details on how they handle temporary email data

## 5. How We Protect Your Privacy

### 5.1 Fingerprint Spoofing
GhostLayer injects scripts into web pages to override browser APIs that trackers use for fingerprinting:
*   **Navigator API:** Spoofs user agent, platform, language, hardware specs
*   **Screen API:** Randomizes screen resolution and dimensions
*   **WebGL/Canvas:** Adds noise to prevent canvas fingerprinting
*   **Battery API:** Randomizes battery status information
*   **Timezone API:** Spoofs timezone offset

This happens **locally in your browser** and does not send any data to external servers.

### 5.2 Data Poisoning
When enabled, GhostLayer:
*   Simulates background browsing activity every 15 minutes
*   Injects "noise" into analytics platforms (Google Analytics, Facebook Pixel, Mixpanel, Segment)
*   Makes your actual browsing profile statistically useless to advertisers

**All poisoning activities are simulated locally**—no actual requests are made to external websites. We only increment a local counter for statistical purposes.

### 5.3 Tracker Detection
GhostLayer detects tracking scripts from common analytics platforms including:
*   Google Analytics & Tag Manager
*   Facebook Pixel
*   DoubleClick
*   Twitter Analytics
*   Bing Ads
*   Hotjar, Mixpanel, Segment, Amplitude, FullStory

**Note:** We detect but do not block these trackers. Instead, we poison their data to protect your privacy while maintaining website functionality.

## 6. Permissions Justification
We require the following browser permissions to function properly:

### 6.1 Required Permissions
*   **`storage`:** Save your settings, email history, and spoofing profiles locally
*   **`activeTab`:** Read the current tab's URL and interact with the active page
*   **`tabs`:** Detect when pages load to apply privacy protections
*   **`webRequest`:** Monitor and block network requests from tracking scripts
*   **`alarms`:** Schedule periodic data poisoning activities (every 15 minutes)

### 6.2 Content Scripts & Web Accessible Resources
*   **Content Scripts:** Automatically injected on all pages to detect email fields and inject spoofing scripts
*   **Web Accessible Resources:** The `injected.js` script that overrides browser APIs for fingerprint spoofing
*   **Note:** We use declarative content scripts (defined in manifest) rather than dynamic script injection for better transparency and security

### 6.2 Host Permissions
*   **`<all_urls>`:** Required to inject privacy protection scripts on all websites you visit
**We only use these permissions for their stated purposes and never for data collection.**

## 7. Data Security
*   **No Server-Side Storage:** Since we don't operate servers, there's no risk of server breaches
*   **Local Encryption:** Browser extension storage is protected by Chrome's built-in security mechanisms
*   **No Network Transmission:** Your browsing data, settings, and statistics never leave your device
*   **Open Source:** Our code is publicly available for security audits at [GitHub](https://github.com/santoshvandari/GhostLayer)

## 8. Children's Privacy
GhostLayer does not knowingly collect data from children under the age of 13. Since we collect **no user data at all**, this applies to all users regardless of age. Parents and guardians can verify our privacy practices by reviewing our open-source code.

## 9. Your Rights & Control
You have complete control over your data:

*   **Access:** View all stored data via Chrome DevTools (`chrome://extensions` → GhostLayer → Inspect views: background page → Application → Storage → Extension)
*   **Deletion:** Uninstall the extension to remove all data instantly
*   **Export:** No cloud storage means your data is always on your device
*   **Opt-Out:** Toggle features on/off in the extension popup

## 10. Changes to This Policy
We may update our Privacy Policy from time to time. We will notify you of any material changes by:
*   Posting the new Privacy Policy on this page with an updated "Last Updated" date
*   Publishing an update notice on our GitHub repository
*   Incrementing the extension version number in the Chrome Web Store

**Continued use of GhostLayer after changes constitutes acceptance of the updated policy.**

## 11. Compliance & Legal
*   **GDPR (Europe):** We do not process personal data, so GDPR obligations are minimal. Users have full data control.
*   **CCPA (California):** We do not sell, share, or process personal information.
*   **Data Processing:** All data processing occurs locally on your device.

## 12. Contact Us
If you have any questions, concerns, or requests regarding this Privacy Policy, please contact us:

*   **GitHub Issues:** [https://github.com/santoshvandari/GhostLayer/issues](https://github.com/santoshvandari/GhostLayer/issues)
*   **GitHub Repository:** [https://github.com/santoshvandari/GhostLayer](https://github.com/santoshvandari/GhostLayer)
*   **Email:** Available via GitHub profile

## 13. Transparency Commitment
We believe in radical transparency:

*   **100% Open Source:** Every line of code is publicly auditable
*   **No Hidden Features:** What you see is what you get
*   **No Monetization Through Data:** We will never sell user data (because we don't collect it)
*   **Community-Driven:** Privacy improvements are welcome via GitHub pull requests

---

**Take back your digital footprint. Go Ghost.** 
