chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("MSG RECEIVED:", msg);

    if (msg.type === "FETCH_HELLSPY") {
        const { url } = msg;
        console.log("TAB URL:", url);

        const match = url.match(/hellspy\.to\/video\/([a-f0-9]+)\/(\d+)/);

        if (!match) {
            console.log("URL NOT MATCHED");
            sendResponse({ error: "Neplatná Hellspy URL" });
            return;
        }

        const [, fileHash, id] = match;
        console.log("PARSED:", { fileHash, id });

        const apiUrl = `https://api.hellspy.to/gw/video/${id}/${fileHash}`;
        console.log("FETCHING:", apiUrl);

        fetch(apiUrl)
            .then(res => res.json())
            .then(data => {
                console.log("API RESPONSE:", data);
                sendResponse({
                    title: data.title,
                    conversions: data.conversions || {}
                });
            })
            .catch(err => {
                console.error("FETCH ERROR:", err);
                sendResponse({ error: err.message });
            });

        return true; // ❗️MUST BE HERE
    }

    if (msg.type === "CREATE_W2G_ROOM") {
        const { videoUrl } = msg;

        chrome.storage.local.get("w2g_api_key", (storage) => {
            const apiKey = storage.w2g_api_key;

            if (!apiKey) {
                sendResponse({ error: "Chybí W2G API klíč v nastavení rozšíření." });
                return;
            }

            fetch("https://api.w2g.tv/rooms/create.json", {
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
            })
                .then(res => res.json())
                .then(data => {
                    if (data.streamkey) {
                        chrome.tabs.create({ url: `https://w2g.tv/rooms/${data.streamkey}` });
                        sendResponse({ success: true });
                    } else {
                        sendResponse({ error: "Chyba při vytváření W2G roomky. Zkontrolujte API klíč." });
                    }
                })
                .catch(err => {
                    console.error("W2G Error:", err);
                    sendResponse({ error: "Chyba při komunikaci s W2G API." });
                });
        });

        return true;
    }
});

// Detect navigation changes (for SPAs or same-tab navigation)
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url && tab.url.includes('hellspy.to/video/')) {
        chrome.tabs.sendMessage(tabId, { type: "RE_INIT" }).catch(() => {
            // Content script might not be injected yet or context invalidated, ignore
        });
    }
});
