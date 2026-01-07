# Firefox Compatibility Guide

If you are seeing a "Corrupted" error in Firefox, it is usually due to Manifest V3 differences between Chrome and Firefox. We have updated the `manifest.json` to handle this.

## How to Load in Firefox

Firefox handles temporary extensions differently than Chrome:

1.  **Open Firefox** and type `about:debugging` in the address bar.
2.  Click on **"This Firefox"** in the left sidebar.
3.  Click the **"Load Temporary Add-on..."** button.
4.  Navigate to your `GhostLayer` folder and select the **`manifest.json`** file.

## ✅ What we fixed for Firefox:

1.  **Browser Specific Settings**: Added the required `gecko` ID in `manifest.json`. Firefox requires an ID for Manifest V3 extensions loaded locally.
2.  **Service Worker Type**: Explicitly set `"type": "module"` in the background settings.
3.  **Strict Min Version**: Ensured Firefox 109+ is targeted, as that is when MV3 support became stable.
4.  **CSP Compatibility**: Fixed "inline script" violations by using data-attributes for profile transmission instead of `textContent`. This ensures spoofing works on high-security sites.

## ⚠️ Known Firefox Differences:

*   **Permissions**: Firefox might ask for more explicit permissions when first loading.
*   **Service Workers**: Firefox service workers can sometimes be more aggressive about sleeping. If the extension seems "dead", simply re-open the popup to wake it up.

## 📋 Verification Checklist

- [ ] Check `about:debugging` for any red error text under the GhostLayer entry.
- [ ] Ensure the icon appears in the "Extensions" (puzzle piece) menu.
- [ ] Open the popup to see if the interface renders correctly.
- [ ] Check the console in `about:debugging` (click "Inspect") to see if there are any script errors.

If you still see errors, try restarting Firefox or clearing the temporary extension cache.
