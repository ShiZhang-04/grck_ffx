# Grok Imagine Quota Viewer (Firefox)

A Firefox sidebar extension that displays your Grok Imagine image/video quotas.

Ported from the Chrome extension [mashiourcse/grok_quota_check_extension](https://github.com/mashiourcse/grok_quota_check_extension).

---

## Features

* Native Firefox Sidebar
* Auto refresh every 30 seconds
* Shows: Speed Image, Quality Image, Edit Image, 480p Video, 720p Video
* Uses your existing logged-in Grok session (via content script on grok.com)

---

## Why a content script?

Direct `fetch` from the sidebar uses `Origin: moz-extension://…`, which Grok often answers with **HTTP 403**.

The content script runs on `https://grok.com/*`, so the request is same-site (cookies + Origin). The sidebar only asks that tab for the JSON.

---

## Installation (Temporary / Developer)

1. Open this folder (or clone the `firefox-quota-viewer` branch).
2. Firefox → `about:debugging#/runtime/this-firefox`
3. **Load Temporary Add-on…** → select `manifest.json`
4. Open (or refresh) a tab on https://grok.com while logged in
5. Open the sidebar: **View → Sidebar → Grok Imagine Quota** (or it may open on install)
6. Click **Refresh** if needed

---

## Requirements

* Logged into https://grok.com
* At least one open tab on grok.com (content script must be injected)

---

## How It Works

1. Sidebar asks any open `grok.com` tab for quota data
2. Content script POSTs to:

```
https://grok.com/rest/media/imagine/quota_info
```

3. Response is rendered as cards (remaining quota, window, next available)

---

## Troubleshooting

| Symptom | Fix |
|--------|-----|
| **No grok.com tab open** | Open https://grok.com and stay logged in |
| **Content script not ready** | Refresh the grok.com tab once, then Refresh in sidebar |
| **HTTP 401 / 403** | Re-login on grok.com, refresh that tab |
| Empty cards | API field names may have changed — check Network tab on grok.com |

---

## Notes

* Undocumented/private Grok API — may change without notice
* Temporary add-ons are removed when Firefox restarts
* For permanent install, sign via AMO or use `web-ext`
