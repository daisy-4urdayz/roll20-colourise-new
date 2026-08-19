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
{
    let hash = 0;
    for (let i = 0; i < str.length; i++)
    {
        hash = ((hash << 7) - hash + str.charCodeAt(i) * 7) | 0;
    }
    return hash;
};

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

// 이름 → hex 색상 결정
// 같은 이름을 넣으면 언제 호출하든 항상 같은 색이 나옴
const resolveColorForName = name =>
{
    // 이름이 정확히 일치하는 경우
    if (Object.prototype.hasOwnProperty.call(cachedColors, name))
    {
        return cachedColors[name];
    }

    // 이름이 일부만 일치하는 경우
    const matchedKey = Object.keys(cachedColors).find(key => name.includes(key));
    return matchedKey ? cachedColors[matchedKey] : generateColorFromName(name);
};

// 유효한 채팅 메시지인지 확인(general/rollresult/hidden-message)
const isChatMessageEl = el =>
    !!(el && el.classList && el.classList.contains('message') &&
        (el.classList.contains('general') || el.classList.contains('rollresult') || el.classList.contains('hidden-message')));

// 메시지의 화자 이름 찾기
// - 자체 .by 태그가 있으면 그 이름을 사용
// - 없으면(Roll20이 연속 메시지의 이름을 생략하는 "그룹핑" 상태)
//   실제 DOM을 거슬러 올라가 가장 가까운 "이름을 확인할 수 있는" 이전 메시지 요소를 탐색
const findNameForMessage = (msg) =>
{
    const nameTag = msg.querySelector('.by');
    if (nameTag)
    {
        const name = nameTag.textContent.trim();
        if (name) return name;
    }

    let sibling = msg.previousElementSibling;
    while (sibling)
    {
        if (isChatMessageEl(sibling))
        {
            // 이미 처리된 형제라면 캐시된 이름을 바로 사용
            if (sibling.dataset.colouriseName)
            {
                return sibling.dataset.colouriseName;
            }

            const siblingNameTag = sibling.querySelector('.by');
            if (siblingNameTag)
            {
                const siblingName = siblingNameTag.textContent.trim();
                if (siblingName) return siblingName;
            }
        }
        sibling = sibling.previousElementSibling;
    }

    return null; // 화자를 특정할 수 없다면 다음 기회에 재시도
};

// 메시지 하나에 색상 적용
const applyColorToMessage = (msg) =>
{
    if (msg.classList.contains('roll20-colourised')) return;

    if (msg.classList.contains("you") && !cachedSelfColorEnabled)
    {
        // '내 채팅에도 색 적용' 토글을 끈 경우 토글을 끄기 전 메시지까지 색상 제거
        msg.style.removeProperty('background-color');
        delete msg.dataset.colouriseName;
        msg.classList.add("roll20-colourised");
        return;
    }

    const name = findNameForMessage(msg);
    if (!name) return; // 아직 이름을 확인할 수 없으면 이번엔 건너뛰고 다음 기회에 재시도

    const hex = resolveColorForName(name);

    // 다음 메시지가 이 메시지를 거슬러 올라와 이름을 역참조할 수 있도록 기록
    msg.dataset.colouriseName = name;

    msg.style.setProperty('background-color', hex, 'important');
    msg.classList.add('roll20-colourised');
};

// 초기 메시지 전체에 색상 적용
const applyInitialColors = () =>
{
    const messages = document.querySelectorAll('#textchat .message.general, #textchat .message.rollresult, #textchat .message.hidden-message');
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

        // subtree: true - 실제 채팅 메시지 div는 #textchat의 직계 자식이 아니라 내부 wrapper 안에 중첩
        // subtree: false로 바꿨을 때 새 메시지 감지 자체가 안 되는 문제 발생
        new MutationObserver(mutations =>
        {
            mutations.forEach(mutation =>
            {
                mutation.addedNodes.forEach(node =>
                {
                    // classList 없는 노드 방어
                    if (!node.classList) return;
                    if (!isChatMessageEl(node)) return;

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
        // 팝업에서 바뀐 설정을 다시 불러옴
        preloadSettings().then(() =>
        {
            document.querySelectorAll('#textchat .message.general, #textchat .message.rollresult, #textchat .message.hidden-message').forEach(msg =>
            {
                msg.classList.remove('roll20-colourised');
                delete msg.dataset.colouriseName;
            });

            applyInitialColors();
            sendResponse({ status: 'ok' });
        });

        return true; // sendResponse를 비동기로 호출
    }
});