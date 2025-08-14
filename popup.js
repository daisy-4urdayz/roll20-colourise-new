// popup.js

// 캐릭터 이름, 색깔, 저장 버튼, 삭제 버튼, 현재 상태
const nameInput = document.getElementById("name");
const colorInput = document.getElementById("color");
const saveBtn = document.getElementById("save");
const deleteBtn = document.getElementById("delete");
const resetBtn = document.getElementById("reset");
const status = document.getElementById("status");

// 저장된 색상 불러오기
const loadColors = async () => {
    return new Promise(resolve => {
        chrome.storage.local.get("colors", ({ colors }) => resolve(colors || {}));
    });
};

// 이름 입력 시 저장된 색 불러오기
nameInput.addEventListener("input", async () => {
    const colors = await loadColors();
    const name = nameInput.value.trim();
    const matchedKey = Object.keys(colors).find(key => key === name || key.includes(name) || name.includes(key));
    if (matchedKey) {
        colorInput.value = colors[matchedKey];
    }
});

// 저장 버튼
saveBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    const color = colorInput.value;
    if (!name) {
        status.textContent = "⚠️ 이름을 입력하세요.";
        return;
    }

    const colors = await loadColors();
    const updated = { ...colors, [name]: color };
    chrome.storage.local.set({ colors: updated }, () => {
        status.textContent = `✅ ${name} 색상 저장됨`;
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, { type: "refreshColors" });
        });
    });
});

// 선택 삭제 버튼
deleteBtn.addEventListener("click", async () => {
    const name = nameInput.value.trim();
    if (!name) {
        status.textContent = "⚠️ 이름을 입력하세요.";
        return;
    }

    const colors = await loadColors();
    // main.js와 동일한 매칭 로직: 완전 일치 → 부분 일치
    const keyToDelete = Object.keys(colors).find(key => key === name || key.includes(name) || name.includes(key));

    if (!keyToDelete) {
        status.textContent = "❌ 해당 이름의 색상이 저장되어 있지 않습니다.";
        return;
    }

    delete colors[keyToDelete];
    chrome.storage.local.set({ colors }, () => {
        status.textContent = `🗑️ ${keyToDelete} 색상 삭제됨`;
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, { type: "refreshColors" });
        });
    });
});

// 전체 초기화 버튼
resetBtn.addEventListener("click", async () => {
    const confirmed = confirm("정말로 이미 지정된 모든 색상을 초기화하시겠습니까?");
    if (!confirmed) return;

    chrome.storage.local.set({ colors: {} }, () => {
        status.textContent = "🧹 모든 색상 초기화됨";
        chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
            chrome.tabs.sendMessage(tabs[0].id, { type: "refreshColors" });
        });
    });
});
