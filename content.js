function init() {
    const controls = document.querySelector('.controls');
    if (!controls) {
        // Retry if controls not found yet (some pages load dynamically)
        setTimeout(init, 500);
        return;
    }

    if (document.getElementById('grabber-injected')) return;

    chrome.runtime.sendMessage(
        { type: "FETCH_HELLSPY", url: window.location.href },
        (res) => {
            if (!res || res.error) return;
            injectButtons(res);
        }
    );
}

function getQualityLabel(q) {
    if (q === '720') return '<span class="grabber-badge">HD</span>';
    if (q === '1080') return '<span class="grabber-badge">FullHD</span>';
    return `${q}p`;
}

function injectButtons(data) {
    const controls = document.querySelector('.controls');
    const container = document.createElement('div');
    container.id = 'grabber-injected';
    container.className = 'grabber-container';

    // Header
    const header = document.createElement('div');
    header.className = 'grabber-header';
    header.innerHTML = '<span>🎬 Stream Grabber</span>';
    container.appendChild(header);

    const conversions = data.conversions || {};

    // Sort qualities descending
    const qualities = Object.keys(conversions).sort((a, b) => parseInt(b) - parseInt(a));

    if (qualities.length === 0) return;

    qualities.forEach(quality => {
        const url = conversions[quality];
        const label = getQualityLabel(quality);
        const row = document.createElement('div');
        row.className = 'grabber-row';

        // Copy Button
        const btnCopy = document.createElement('button');
        btnCopy.className = 'grabber-btn grabber-btn-copy';
        btnCopy.innerHTML = `Kopírovat ${label}`;
        btnCopy.onclick = (e) => {
            e.preventDefault();
            navigator.clipboard.writeText(url);
            btnCopy.innerHTML = '✅ Zkopírováno';
            btnCopy.classList.add('success');
            setTimeout(() => {
                btnCopy.innerHTML = `Kopírovat ${label}`;
                btnCopy.classList.remove('success');
            }, 2000);
        };

        // W2G Button
        const btnW2G = document.createElement('button');
        btnW2G.className = 'grabber-btn grabber-btn-w2g';
        btnW2G.innerHTML = `W2G ${label}`;
        btnW2G.onclick = (e) => {
            e.preventDefault();
            chrome.runtime.sendMessage({ type: "CREATE_W2G_ROOM", videoUrl: url }, (res) => {
                if (res?.error) {
                    alert(res.error);
                }
            });
        };

        row.appendChild(btnCopy);
        row.appendChild(btnW2G);
        container.appendChild(row);
    });

    controls.prepend(container);
}

// Start Initialization
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Listen for navigation changes from background script
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "RE_INIT") {
        init();
    }
});
