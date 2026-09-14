# Grok Imagine Quota Viewer (Firefox)

A Firefox sidebar extension that displays your Grok Imagine image/video quotas.

Ported from the Chrome extension [mashiourcse/grok_quota_check_extension](https://github.com/mashiourcse/grok_quota_check_extension).

---

## Features

* Native Firefox Sidebar
* Auto refresh every 30 seconds
* Shows:
  * Speed Image
  * Quality Image
  * Edit Image
  * 480p Video
  * 720p Video
* Uses your existing logged-in Grok session

---

## Installation (Temporary / Developer)

1. Clone or download this repository (this branch).
2. Open Firefox and go to `about:debugging#/runtime/this-firefox`.
3. Click **Load Temporary Add-on…**.
4. Select the `manifest.json` file in this folder.
5. The sidebar should open automatically (or open via **View → Sidebar → Grok Imagine Quota**).

For a permanent install you need to sign the extension via [addons.mozilla.org](https://addons.mozilla.org) or use `web-ext`.

---

## Requirements

You must already be logged into Grok at [https://grok.com](https://grok.com).

The extension uses your browser session cookies to fetch quota information.

---

## How It Works

The extension calls this internal Grok API:

```
https://grok.com/rest/media/imagine/quota_info
```

(POST with empty JSON body, credentials included) and displays remaining quotas, reset windows, and next available times.

---

## Notes

* This uses an undocumented/private Grok API.
* Grok may change the API anytime.
* If the sidebar stops working, inspect the browser console for updated response fields.

---

## Differences from Chrome version

* Uses Firefox `sidebar_action` instead of Chrome `sidePanel`.
* No background service worker needed for panel behavior.
* Layout tuned for typical sidebar width (single column).
* Manifest includes `browser_specific_settings.gecko` for Firefox.
