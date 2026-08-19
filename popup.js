// popup.js

// DOM 요소
const nameInput = document.getElementById("name");
const colorInput = document.getElementById("color");
const saveBtn = document.getElementById("save");
const resetBtn = document.getElementById("reset");
const status = document.getElementById("status");
const colorList = document.getElementById("colorList");
const toggleSelfColor = document.getElementById("toggleSelfColor");

// 저장된 색상 불러오기
const loadColors = async () =>
{
    const { colors } = await chrome.storage.local.get("colors");
    return colors || {};
};

// 리스트 업데이트 함수
const updateColorList = (colors) =>
{
    colorList.innerHTML = "";
    if (!colors || Object.keys(colors).length === 0)
    {
        colorList.innerHTML = "<li>저장된 색상이 없습니다.</li>";
        return;
    }

    Object.entries(colors).forEach(([name, color]) =>
    {
        const li = document.createElement("li");
        li.textContent = `${name}: ${color}`; // 글자 색상은 기본

        const delBtn = document.createElement("button");
        delBtn.textContent = "삭제";
        delBtn.style.marginLeft = "8px";
        delBtn.addEventListener("click", async () =>
        {
            const colors = await loadColors();
            delete colors[name];
            chrome.storage.local.set({ colors }, () =>
            {
                updateColorList(colors);
                chrome.tabs.query({ active: true, currentWindow: true }, tabs =>
                {
                    chrome.tabs.sendMessage(tabs[0].id, { type: "refreshColors" });
                });
            });
        });

        li.appendChild(delBtn);
        colorList.appendChild(li);
    });

};

// 초기 로드
(async () =>
{
    const colors = await loadColors();
    updateColorList(colors);

    // 이름 입력 시 기존 색상 불러오기
    nameInput.addEventListener("input", async () =>
    {
        const name = nameInput.value.trim();
        const colors = await loadColors();
        const matchedKey = Object.keys(colors).find(key => name.includes(key));
        if (matchedKey) colorInput.value = colors[matchedKey];
    });

    // '내 채팅에도 색 적용' 토글 상태 불러오기
    const { selfColorEnabled } = await chrome.storage.local.get("selfColorEnabled");
    toggleSelfColor.checked = selfColorEnabled ?? true; // 기본값 true
})();

// 저장 버튼
saveBtn.addEventListener("click", async () =>
{
    const name = nameInput.value.trim();
    const color = colorInput.value;
    if (!name)
    {
        status.textContent = "⚠️ 이름을 입력하세요.";
        return;
    }

    const colors = await loadColors();
    const updated = { ...colors, [name]: color };
    chrome.storage.local.set({ colors: updated }, () =>
    {
        status.textContent = `✅ ${name} 색상 저장됨`;
        updateColorList(updated);
        chrome.tabs.query({ active: true, currentWindow: true }, tabs =>
        {
            chrome.tabs.sendMessage(tabs[0].id, { type: "refreshColors" });
        });
    });
});

// 전체 초기화 버튼
resetBtn.addEventListener("click", () =>
{
    const confirmed = confirm("‼️ 정말로 이미 지정된 모든 색상을 초기화하시겠습니까?");
    if (!confirmed) return;

    chrome.storage.local.set({ colors: {} }, () =>
    {
        status.textContent = "🧹 모든 색상 초기화됨";
        updateColorList({});
        chrome.tabs.query({ active: true, currentWindow: true }, tabs =>
        {
            chrome.tabs.sendMessage(tabs[0].id, { type: "refreshColors" });
        });
    });
});

// 체크박스 상태 저장
toggleSelfColor.addEventListener("change", () =>
{
    chrome.storage.local.set({ selfColorEnabled: toggleSelfColor.checked }, () =>
    {
        chrome.tabs.query({ active: true, currentWindow: true }, tabs =>
        {
            chrome.tabs.sendMessage(tabs[0].id, { type: "refreshColors" });
        });
    });
});
