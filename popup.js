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

        // Copy Button
        const btnCopy = document.createElement("button");
        btnCopy.textContent = `Kopírovat ${quality}p`;
        btnCopy.onclick = async () => {
            await navigator.clipboard.writeText(url);
            btnCopy.textContent = "Zkopírováno ✓";
            btnCopy.classList.add("copied");

            setTimeout(() => {
                btnCopy.textContent = `Kopírovat ${quality}p`;
                btnCopy.classList.remove("copied");
            }, 1500);
        };

        // W2G Button
        const btnW2G = document.createElement("button");
        btnW2G.textContent = `W2G`;
        btnW2G.className = "secondary";
        btnW2G.title = "Otevřít ve Watch2Gether";
        btnW2G.onclick = () => openW2G(url);

        div.appendChild(btnCopy);
        div.appendChild(btnW2G);
        content.appendChild(div);
    }
}

async function openW2G(videoUrl) {
    const storage = await chrome.storage.local.get("w2g_api_key");
    const apiKey = storage.w2g_api_key;

    if (!apiKey) {
        alert("Prosím, vložte nejdříve W2G API klíč v nastavení (ikona ozubeného kola).");
        settingsDiv.classList.add("visible");
        return;
    }

    try {
        const response = await fetch("https://api.w2g.tv/rooms/create.json", {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                "w2g_api_key": apiKey,
                "share": videoUrl,
                "bg_color": "#020617",
                "bg_opacity": "100"
            })
        });

        const data = await response.json();
        if (data.streamkey) {
            chrome.tabs.create({ url: `https://w2g.tv/rooms/${data.streamkey}` });
        } else {
            alert("Chyba při vytváření roomky. Zkontrolujte API klíč.");
        }
    } catch (err) {
        console.error("W2G Error:", err);
        alert("Chyba při komunikaci s W2G API.");
    }
}

init();
