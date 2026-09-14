/**
 * Runs in the page context of https://grok.com/*
 * Fetch from here so Origin/cookies match the real site (avoids 403 from extension origin).
 */
const API_URL = "https://grok.com/rest/media/imagine/quota_info";

async function fetchQuota() {
  const response = await fetch(API_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      accept: "*/*",
      "content-type": "application/json",
    },
    body: "{}",
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`HTTP ${response.status}${text ? `: ${text.slice(0, 200)}` : ""}`);
  }

  return response.json();
}

browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "FETCH_QUOTA") {
    return undefined;
  }

  fetchQuota()
    .then((data) => sendResponse({ ok: true, data }))
    .catch((err) =>
      sendResponse({
        ok: false,
        error: err?.message || String(err),
      })
    );

  // Keep the message channel open for async sendResponse
  return true;
});
