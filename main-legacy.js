// 쓰지 않는 코드

// 🎯 이름 기반 해시 생성
const hashCode = str =>
    Array.from(str).reduce((hash, c) => ((hash << 7) - hash + c.charCodeAt(0) * 7) | 0, 0);

// 🎯 HSV → RGB 변환
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

// 🎯 RGB → HEX 변환
const rgbToHex = (r, g, b) =>
    `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;

// 🎯 색상 적용 함수
const applyColors = () => {
    const messages = document.querySelectorAll('#textchat .message.general');
    let lastName = null;

    messages.forEach(msg => {
        if (msg.classList.contains('roll20-colourised')) return;

        const nameTag = msg.querySelector('.by');
        const name = nameTag?.textContent.trim() || lastName;
        if (!name) return;

        lastName = name;

        const hash = Math.abs(hashCode(name));
        const sVar = hash % 3;
        const bVar = hash % 3;
        const [r, g, b] = hsvToRgb((hash % 120) * 3, 5 + sVar, 95 - bVar);
        const hex = rgbToHex(r, g, b);

        msg.style.setProperty('background-color', hex, 'important');
        msg.classList.add('roll20-colourised');
    });
};

// 🎯 DOM이 준비될 때까지 기다리기
const waitForChat = () => {
    const chat = document.getElementById('textchat');
    if (chat) {
        console.log("✅ Roll20 Colourise: chat found");
        applyColors(); // 초기 메시지 처리

        let lastName = null;

        new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (!(node instanceof HTMLElement)) return;
                    if (!node.classList.contains('message')) return;
                    if (node.classList.contains('roll20-colourised')) return;

                    const nameTag = node.querySelector('.by');
                    const name = nameTag?.textContent.trim() || lastName;
                    if (!name) return;

                    lastName = name;

                    const hash = Math.abs(hashCode(name));
                    const sVar = hash % 3;
                    const bVar = hash % 3;
                    const [r, g, b] = hsvToRgb((hash % 120) * 3, 5 + sVar, 95 - bVar);
                    const hex = rgbToHex(r, g, b);

                    node.style.setProperty('background-color', hex, 'important');
                    node.classList.add('roll20-colourised');
                });
            });
        }).observe(chat, {
            childList: true,
            subtree: true
        });
    } else {
        console.log("⏳ Roll20 Colourise: waiting for chat...");
        setTimeout(waitForChat, 1000);
    }
};


waitForChat();
