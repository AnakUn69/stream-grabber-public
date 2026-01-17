const content = document.getElementById("content");

async function init() {
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

        const btn = document.createElement("button");
        btn.textContent = `Kopírovat ${quality}p`;
        btn.onclick = async () => {
            await navigator.clipboard.writeText(url);
            btn.textContent = "Zkopírováno ✓";
            btn.classList.add("copied");

            setTimeout(() => {
                btn.textContent = `Kopírovat ${quality}p`;
                btn.classList.remove("copied");
            }, 1500);
        };


        div.appendChild(btn);
        content.appendChild(div);
    }
}

init();
