console.log("✅ main.js is active");

// 저장된 색상 불러오기
const loadColors = async () => {
    const { colors } = await chrome.storage.local.get('colors');
    return colors || {};
};

// 이름 기반 해시 생성
const hashCode = str =>
    Array.from(str).reduce((hash, c) => ((hash << 7) - hash + c.charCodeAt(0) * 7) | 0, 0);

// HSV → RGB 변환
const hsvToRgb = (h, s, v) => {
    s = Math.max(0, Math.min(100, s)) / 100;
    v = Math.max(0, Math.min(100, v)) / 100;
    h = Math.max(0, Math.min(360, h)) / 60;

    if (s === 0) return Array(3).fill(Math.round(v * 255));

    const i = Math.floor(h);
    const f = h - i;
    const p = v * (1 - s);
    const q = v * (1 - s * f);
    const t = v * (1 - s * (1 - f));

    const [r, g, b] = [
        [v, t, p],
        [q, v, p],
        [p, v, t],
        [p, q, v],
        [t, p, v],
        [v, p, q]
    ][i % 6];

    return [r, g, b].map(x => Math.round(x * 255));
};

// RGB → HEX 변환
const rgbToHex = (r, g, b) =>
    `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

// 이름 기반 자동 색상 생성 (구버전 공식)
const generateColorFromName = name => {
    const hash = Math.abs(hashCode(name));
    const hue = (hash % 120) * 3;
    const saturation = 5 + (hash % 3);
    const brightness = 95 - (hash % 3);

    const [r, g, b] = hsvToRgb(hue, saturation, brightness);
    return rgbToHex(r, g, b);
};

// 색상 적용 함수
const applyColorsToChat = async () => {
    const storedColors = await loadColors();
    const messages = document.querySelectorAll('#textchat .message.general'); // .you 포함
    let lastName = null;

    messages.forEach(msg => {
        if (msg.classList.contains('roll20-colourised')) return;

        const nameTag = msg.querySelector('.by');
        const name = nameTag?.textContent.trim() || lastName; // <span class="by"> 없으면 lastName 사용
        if (!name) return; // 저널 미선택 → 기본 Roll20 색상 유지

        lastName = name;

        // 저장된 색상 우선, 없으면 자동 색상
        let matchedKey = Object.keys(storedColors).find(key => key === name);
        if (!matchedKey) {
            matchedKey = Object.keys(storedColors).find(key => name.includes(key));
        }
        const hex = matchedKey ? storedColors[matchedKey] : generateColorFromName(name);

        msg.style.setProperty('box-shadow', `inset 0 0 0 1000px ${hex}`, 'important');
        msg.classList.add('roll20-colourised');
    });
};

// 채팅창 감지 및 초기 적용
const waitForChat = () => {
    const chat = document.getElementById('textchat');
    if (chat) {
        console.log("✅ Roll20 Colourise: chat found");
        applyColorsToChat();

        new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (!(node instanceof HTMLElement)) return;
                    if (!node.classList.contains('message')) return;
                    if (node.classList.contains('roll20-colourised')) return;

                    applyColorsToChat();
                });
            });
        }).observe(chat, { childList: true, subtree: true });
    } else {
        console.log("⏳ Roll20 Colourise: waiting for chat...");
        setTimeout(waitForChat, 1000);
    }
};

waitForChat();

// popup.js에서 보낸 메시지 수신
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'refreshColors') {
        document.querySelectorAll('#textchat .message.general').forEach(msg => {
            msg.classList.remove('roll20-colourised');
        });

        applyColorsToChat();
        sendResponse({ status: 'ok' });
    }
});
