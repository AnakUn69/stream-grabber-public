chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    console.log("MSG RECEIVED:", msg);

    if (msg.type !== "FETCH_HELLSPY") return;

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
});
