const cards = document.getElementById("cards");
const refreshBtn = document.getElementById("refreshBtn");

function createServiceCard(title, data) {
  const isActive =
    data.available &&
    (data.remainingQueries === null || data.remainingQueries > 0);

  return `
    <div class="service-card">
      <div class="service-header">
        <div class="service-title">${title}</div>
        <button class="status-btn ${isActive ? "active" : "inactive"}">
          <span class="dot"></span>
          ${isActive ? "ACTIVE" : "LIMITED"}
        </button>
      </div>
      <div class="stats-row">
        <div class="stat-box">
          <div class="stat-label">Quota</div>
          <div class="stat-value">${data.remainingQueries ?? "-"}</div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Reset</div>
          <div class="stat-value">
            ${
              data.windowSizeSeconds
                ? `${(data.windowSizeSeconds / 3600).toFixed(0)}h`
                : "-"
            }
          </div>
        </div>
        <div class="stat-box">
          <div class="stat-label">Next</div>
          <div class="stat-value small-text">
            ${
              data.nextAvailableAt
                ? formatDate(data.nextAvailableAt)
                : "Not Set"
            }
          </div>
        </div>
      </div>
    </div>
  `;
}

function formatDate(dateString) {
  try {
    return new Date(dateString).toLocaleString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return dateString;
  }
}

function showError(message, hint) {
  cards.innerHTML = `
    <div class="service-card error-card">
      <div class="service-title">❌ Error</div>
      <div class="stat-value" style="font-size:14px;margin-top:8px;">${message}</div>
      ${
        hint
          ? `<div class="stat-label" style="margin-top:12px;text-transform:none;letter-spacing:0;opacity:0.85;">${hint}</div>`
          : ""
      }
    </div>
  `;
}

/**
 * Ask a content script on an open grok.com tab to perform the fetch.
 * This avoids 403 caused by moz-extension Origin.
 */
async function requestQuotaFromPage() {
  const tabs = await browser.tabs.query({
    url: ["https://grok.com/*", "https://www.grok.com/*"],
  });

  if (!tabs.length) {
    throw new Error("NO_GROK_TAB");
  }

  // Prefer active tab if it is grok.com, otherwise first match
  const tab =
    tabs.find((t) => t.active) ||
    tabs.find((t) => t.url && t.url.includes("grok.com")) ||
    tabs[0];

  let response;
  try {
    response = await browser.tabs.sendMessage(tab.id, { type: "FETCH_QUOTA" });
  } catch (err) {
    // Content script not injected yet (page still loading, or temporary add-on just loaded)
    throw new Error(
      `CONTENT_SCRIPT_MISSING: ${err?.message || err}. Refresh the grok.com tab and try again.`
    );
  }

  if (!response?.ok) {
    throw new Error(response?.error || "Unknown error from content script");
  }

  return response.data;
}

async function loadQuota() {
  cards.innerHTML = `
    <div class="loading-card">
      <div class="loader"></div>
      Loading quotas...
    </div>
  `;

  try {
    const data = await requestQuotaFromPage();

    cards.innerHTML = "";

    const services = [
      { key: "image", title: "⚡ Speed Image" },
      { key: "imagePro", title: "🎨 Quality Image" },
      { key: "imageEdit", title: "✏️ Edit Image" },
      { key: "video", title: "🎥 480p Video" },
      { key: "video720p", title: "📽️ 720p Video" },
    ];

    let any = false;
    services.forEach((service) => {
      if (data[service.key]) {
        any = true;
        cards.innerHTML += createServiceCard(service.title, data[service.key]);
      }
    });

    if (!any) {
      showError(
        "No quota fields in response",
        "API shape may have changed. Open the Browser Console on grok.com and inspect the network response."
      );
      console.log("quota_info payload:", data);
    }
  } catch (err) {
    const msg = err?.message || String(err);

    if (msg === "NO_GROK_TAB") {
      showError(
        "No grok.com tab open",
        "Open https://grok.com in a tab (and stay logged in), then click Refresh."
      );
    } else if (msg.startsWith("CONTENT_SCRIPT_MISSING")) {
      showError(
        "Content script not ready",
        "Refresh the open grok.com tab once, then click Refresh here."
      );
    } else if (msg.includes("HTTP 401") || msg.includes("HTTP 403")) {
      showError(
        msg,
        "Log in at https://grok.com, then refresh that tab and try again. 403 can also mean the session cookie expired."
      );
    } else {
      showError(msg, "See sidebar console for details.");
    }

    console.error(err);
  }
}

refreshBtn.addEventListener("click", loadQuota);

loadQuota();
setInterval(loadQuota, 30000);
