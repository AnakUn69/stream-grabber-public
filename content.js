const W2G_ICON = `<img src="${chrome.runtime.getURL('icons/w2g.svg')}" style="width: 60px; height: auto; display: block; margin: auto;" alt="W2G">`;
const CLAPPER_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="grabber-header-icon"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>`;
const COPY_ICON = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="grabber-btn-icon"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/><path d="M16 4h2a2 2 0 0 1 2 2v4"/><path d="M21 14H11"/><path d="m15 10-4 4 4 4"/></svg>`;
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
    return `<span class="grabber-badge">${q}p</span>`;
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
    header.innerHTML = `${CLAPPER_ICON} <span>Stream Grabber</span>`;
    container.appendChild(header);

    const conversions = data.conversions || {};
    const qualities = Object.keys(conversions).sort((a, b) => parseInt(b) - parseInt(a));

    if (qualities.length === 0) return;

    qualities.forEach(quality => {
        const url = conversions[quality];
        const label = getQualityLabel(quality);
        const row = document.createElement('div');
        row.className = 'grabber-row';

        // Quality Badge
        const badgeWrapper = document.createElement('div');
        badgeWrapper.className = 'grabber-quality-label';
        badgeWrapper.innerHTML = label;

        // W2G Button
        const btnW2G = document.createElement('button');
        btnW2G.className = 'grabber-btn grabber-btn-w2g';
        btnW2G.innerHTML = W2G_ICON;
        btnW2G.title = "Otevřít ve Watch2Gether";
        btnW2G.onclick = (e) => {
            e.preventDefault();
            chrome.runtime.sendMessage({ type: "CREATE_W2G_ROOM", videoUrl: url }, (res) => {
                if (res?.error) alert(res.error);
            });
        };

        // Copy Button
        const btnCopy = document.createElement('button');
        btnCopy.className = 'grabber-btn grabber-btn-copy';
        btnCopy.innerHTML = `${COPY_ICON} Kopírovat`;
        btnCopy.onclick = (e) => {
            e.preventDefault();
            navigator.clipboard.writeText(url);
            btnCopy.innerHTML = 'Zkopírováno ✓';
            btnCopy.classList.add('success');
            setTimeout(() => {
                btnCopy.innerHTML = `${COPY_ICON} Kopírovat`;
                btnCopy.classList.remove('success');
            }, 2000);
        };

        row.appendChild(badgeWrapper);
        row.appendChild(btnW2G);
        row.appendChild(btnCopy);
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
