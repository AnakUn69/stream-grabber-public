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
    return `${q}p`;
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

        // Copy Button
        const btnCopy = document.createElement("button");
        btnCopy.innerHTML = `Kopírovat ${label}`;
        btnCopy.onclick = async () => {
            await navigator.clipboard.writeText(url);
            const originalHTML = btnCopy.innerHTML;
            btnCopy.textContent = "Zkopírováno ✓";
            btnCopy.classList.add("copied");

            setTimeout(() => {
                btnCopy.innerHTML = originalHTML;
                btnCopy.classList.remove("copied");
            }, 1500);
        };

        // W2G Button
        const btnW2G = document.createElement("button");
        btnW2G.innerHTML = `W2G ${label}`;
        btnW2G.className = "secondary";
        btnW2G.title = "Otevřít ve Watch2Gether";
        btnW2G.onclick = () => openW2G(url);

        div.appendChild(btnCopy);
        div.appendChild(btnW2G);
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
