// popup.js

// 캐릭터 이름, 색깔, 저장 버튼, 초기화 버튼, 현재 색상
const nameInput = document.getElementById("name");
const colorInput = document.getElementById("color");
const saveBtn = document.getElementById("save");
const resetBtn = document.getElementById("reset");
const status = document.getElementById("status");

// 저장된 색상 불러오기
chrome.storage.local.get("colors", ({ colors }) =>
{
    if (!colors) return;
    nameInput.addEventListener("input", () =>
    {
        const name = nameInput.value.trim();
        const matchedKey = Object.keys(colors).find(key => name.includes(key));
        if (matchedKey)
        {
            colorInput.value = colors[matchedKey];
        }
    });
});

// 저장 버튼
saveBtn.addEventListener("click", () =>
{
    const name = nameInput.value.trim();
    const color = colorInput.value;
    if (!name)
    {
        status.textContent = "⚠️ 이름을 입력하세요.";
        return;
    }

    chrome.storage.local.get("colors", ({ colors }) =>
    {
        const updated = { ...(colors || {}), [name]: color };
        chrome.storage.local.set({ colors: updated }, () =>
        {
            status.textContent = `✅ ${name} 색상 저장됨`;
            chrome.tabs.query({ active: true, currentWindow: true }, tabs =>
            {
                chrome.tabs.sendMessage(tabs[0].id, { type: "refreshColors" });
            });
        });
    });
});

// 초기화 버튼
resetBtn.addEventListener("click", () =>
{
    const confirmed = confirm("정말로 이미 지정된 모든 색상을 초기화하시겠습니까?");
    if (!confirmed) return; // 취소하면 실행 안 함

    chrome.storage.local.set({ colors: {} }, () =>
    {
        status.textContent = "🧹 모든 색상 초기화됨";
        chrome.tabs.query({ active: true, currentWindow: true }, tabs =>
        {
            chrome.tabs.sendMessage(tabs[0].id, { type: "refreshColors" });
        });
    });
});
