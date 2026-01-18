const W2G_ICON = `<img src="icons/w2g.svg" style="width: 100px; height: auto; display: block; margin: auto;" alt="W2G">`;
const COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><path d="M16 4h2a2 2 0 0 1 2 2v4"/><path d="M21 14H11"/><path d="m15 10-4 4 4 4"/></svg>`;
const content = document.getElementById("content");
const settingsDiv = document.getElementById("settings");
const apiKeyInput = document.getElementById("apiKey");
const toggleBtn = document.getElementById("toggleSettings");
const saveBtn = document.getElementById("saveSettings");

// Settings Logic
toggleBtn.onclick = () => settingsDiv.classList.toggle("visible");

saveBtn.onclick = async () => {
    const key = apiKeyInput.value.trim();
    await chrome.storage.local.set({ w2g_api_key: key });
    saveBtn.textContent = "Uloženo!";
    setTimeout(() => {
        saveBtn.textContent = "Uložit";
        settingsDiv.classList.remove("visible");
    }, 1000);
};

async function init() {
    // Load API Key
    const storage = await chrome.storage.local.get("w2g_api_key");
    if (storage.w2g_api_key) {
        apiKeyInput.value = storage.w2g_api_key;
    }

    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    chrome.runtime.sendMessage(
        { type: "FETCH_HELLSPY", url: tab.url },
        (res) => {
            if (!res || res.error) {
                content.textContent = res?.error || "Chyba";
                return;
            }

            render(res);
        }
    );
}

function getQualityLabel(q) {
    if (q === '720') return '<span class="quality-badge">HD</span>';
    if (q === '1080') return '<span class="quality-badge">FullHD</span>';
    return `<span class="quality-badge">${q}p</span>`;
}

function render(data) {
    content.innerHTML = `<strong>${data.title}</strong><hr />`;

    const conversions = data.conversions;

    if (!Object.keys(conversions).length) {
        content.innerHTML += "Žádné konverze";
        return;
    }

    for (const [quality, url] of Object.entries(conversions)) {
        const div = document.createElement("div");
        div.className = "item";

        const label = getQualityLabel(quality);

        const badgeDiv = document.createElement("div");
        badgeDiv.className = "quality-label";
        badgeDiv.innerHTML = label;

        // W2G Button
        const btnW2G = document.createElement("button");
        btnW2G.innerHTML = W2G_ICON;
        btnW2G.className = "secondary w2g-btn-icon";
        btnW2G.title = "Otevřít ve Watch2Gether";
        btnW2G.onclick = () => openW2G(url);

        // Copy Button
        const btnCopy = document.createElement("button");
        btnCopy.innerHTML = `${COPY_ICON} Kopírovat`;
        btnCopy.onclick = async () => {
            await navigator.clipboard.writeText(url);
            const originalHTML = btnCopy.innerHTML;
            btnCopy.innerHTML = "Zkopírováno ✓";
            btnCopy.classList.add("copied");

            setTimeout(() => {
                btnCopy.innerHTML = originalHTML;
                btnCopy.classList.remove("copied");
            }, 1500);
        };

        div.appendChild(badgeDiv);
        div.appendChild(btnW2G);
        div.appendChild(btnCopy);
        content.appendChild(div);
    }
}

async function openW2G(videoUrl) {
    chrome.runtime.sendMessage({ type: "CREATE_W2G_ROOM", videoUrl }, (res) => {
        if (res?.error) {
            if (res.error.includes("klíč")) {
                alert(res.error);
                settingsDiv.classList.add("visible");
            } else {
                alert(res.error);
            }
        }
    });
}

init();
