// main.js

// 제대로 작동하고 있는지 확인
console.log("✅ main.js is active");

// 캐시 변수 선언
let cachedColors = {};
let cachedSelfColorEnabled = true;

// 설정값 미리 불러오기
const preloadSettings = async () =>
{
    const { colors } = await chrome.storage.local.get('colors');
    cachedColors = colors || {};

    const { selfColorEnabled } = await chrome.storage.local.get("selfColorEnabled");
    cachedSelfColorEnabled = selfColorEnabled ?? true;
};

// 이름 기반 해시 생성
const hashCode = str =>
    Array.from(str).reduce((hash, c) => ((hash << 7) - hash + c.charCodeAt(0) * 7) | 0, 0);

// HSV → RGB 변환
const hsvToRgb = (h, s, v) =>
{
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

// 이름 기반 색상 생성
const generateColorFromName = name =>
{
    const hash = Math.abs(hashCode(name));
    const hue = (hash % 120) * 3;
    const saturation = 5 + (hash % 3);
    const brightness = 95 - (hash % 3);

    const [r, g, b] = hsvToRgb(hue, saturation, brightness);
    return rgbToHex(r, g, b);
};

// 직전 화자 정보 저장
let lastName = null;
let lastHex = null;

// 메시지 하나에 색상 적용
const applyColorToMessage = (msg) =>
{
    if (msg.classList.contains('roll20-colourised')) return;

    if (msg.classList.contains("you") && !cachedSelfColorEnabled)
    {
        msg.classList.add("roll20-colourised");
        return;
    }

    const nameTag = msg.querySelector('.by');
    if (nameTag)
    {
        const name = nameTag.textContent.trim();
        if (!name) return;

        lastName = name;

        let matchedKey = Object.keys(cachedColors).find(key => key === name);
        if (!matchedKey)
        {
            matchedKey = Object.keys(cachedColors).find(key => name.includes(key));
        }
        lastHex = matchedKey ? cachedColors[matchedKey] : generateColorFromName(name);
    }

    if (lastHex)
    {
        msg.style.setProperty(
            'box-shadow',
            `inset 0 0 0 1000px ${lastHex}`,
            'important'
        );
        msg.classList.add('roll20-colourised');
    }
};

// 초기 메시지 전체에 색상 적용
const applyInitialColors = () =>
{
    const messages = document.querySelectorAll('#textchat .message.general, #textchat .message.rollresult');
    messages.forEach(msg => applyColorToMessage(msg));
};

// 채팅창 감지 및 MutationObserver 설정
const waitForChat = async () =>
{
    await preloadSettings(); // 설정값 미리 불러오기

    const chat = document.getElementById('textchat');
    if (chat)
    {
        console.log("✅ Roll20 Colourise: chat found");

        applyInitialColors();

        new MutationObserver(mutations =>
        {
            mutations.forEach(mutation =>
            {
                mutation.addedNodes.forEach(node =>
                {
                    if (!node.classList.contains('message')) return;
                    if (!(node.classList.contains('general') || node.classList.contains('rollresult'))) return;

                    applyColorToMessage(node);
                });
            });
        }).observe(chat, { childList: true, subtree: true });
    }
    else
    {
        console.log("⏳ Roll20 Colourise: waiting for chat...");
        setTimeout(waitForChat, 1000);
    }
};

waitForChat();

// popup.js에서 색상 새로고침 요청 수신
chrome.runtime.onMessage.addListener((message, sender, sendResponse) =>
{
    if (message.type === 'refreshColors')
    {
        document.querySelectorAll('#textchat .message.general').forEach(msg =>
        {
            msg.classList.remove('roll20-colourised');
        });

        applyInitialColors();
        sendResponse({ status: 'ok' });
    }
});
