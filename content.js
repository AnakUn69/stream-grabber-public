let isInjecting = false;
let lastUrl = '';

function init(force = false) {
    const currentUrl = window.location.href;

    // Skip if already injecting or if not on a video page
    if (isInjecting) return;
    if (!currentUrl.includes('/video/')) return;

    // Skip if already processed this URL (unless forced)
    if (!force && currentUrl === lastUrl && document.getElementById('grabber-injected')) return;

    const controls = document.querySelector('.controls');
    if (!controls) return;

    isInjecting = true;
    lastUrl = currentUrl;

    chrome.runtime.sendMessage(
        { type: "FETCH_HELLSPY", url: currentUrl },
        (res) => {
            isInjecting = false;

            if (!res || res.error) return;

            // Clean up any existing instances to avoid duplicates
            const existing = document.getElementById('grabber-injected');
            if (existing) existing.remove();

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
    if (!controls) return;

    const container = document.createElement('div');
    container.id = 'grabber-injected';
    container.className = 'grabber-container';

    // Header
    const header = document.createElement('div');
    header.className = 'grabber-header';
    header.innerHTML = '<span>🎬 Stream Grabber</span>';
    container.appendChild(header);

    const conversions = data.conversions || {};
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
                if (res?.error) alert(res.error);
            });
        };

        row.appendChild(btnCopy);
        row.appendChild(btnW2G);
        container.appendChild(row);
    });

    controls.prepend(container);
}

// Watch for DOM changes to detect when .controls appears
const observer = new MutationObserver(() => {
    if (document.querySelector('.controls') && !document.getElementById('grabber-injected')) {
        init();
    }
});

observer.observe(document.documentElement, {
    childList: true,
    subtree: true
});

// Initial run
init();

// Handle messages from background (SPA navigation fallback)
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === "RE_INIT") {
        init(true); // Force re-init on navigation message
    }
});
