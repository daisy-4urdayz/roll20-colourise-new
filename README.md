## 🎨 Roll20 Colourise - New(Remake)

- 이 프로젝트(확장 프로그램)는 Xavier Ho의 ["Roll20 Colouriser"](https://github.com/Spaxe/roll20-colouriser)를 원작자의 허가를 받아 다시 만든 것입니다.
- 더하여 신청자/원본 제작자의 합의 아래, 확장 프로그램 및 소스 코드를 전체 공개합니다. 실제 프로그램은 [이곳](https://chromewebstore.google.com/detail/bdmnfebmomokholhpmfdglgohkolbikp?utm_source=item-share-cb)에서 설치하실 수 있습니다.

---

### 📝 업데이트 내역
- 2.4.0(최신): 리팩토링, 네이버 웨일에서 제보된 오류 수정(개발자 모드로 확인) 및 네이버 웨일 스토어에 프로그램 등록
- 2.3.2: 프로그램 적용 범위 변경
- 2.3.0: '내 채팅에도 색 적용' 옵션 on/off 기능 추가
- 2.2.0: 채팅 배경을 더 연하게 수정(구버전 컬러 계산 공식으로 변경)
- 2.1.0: `manifest.json`에서 사용하지 않는 권한 제거 후 구글 심사 통과
- 2.0.0: 최초 작성

### ⚙️ 기능
- 원본 확장과 거의 비슷합니다. 대신 **사용자가 직접 색상을 지정할 수 있는 기능**과 **자신의 채팅에 색을 입힐지 입히지 않을지 선택하는 기능**(2.3.0~. 단, 체크박스를 설정/해제한 후 꼭 1회 새로고침해 주세요)이 추가되었습니다.
<img width="400" height="365" alt="image" src="https://github.com/user-attachments/assets/ebcde597-1ebb-4184-93e2-ac58b0828649" />

<br>
<br>

![Roll20 Colourise 스크린샷 1](./image/1.png)
- 위와 같이 사용자가 색을 지정하지 않았거나 초기화했다면, 프로그램에서 기본적으로 설정된 색이 나옵니다.

![Roll20 Colourise 스크린샷 2](./image/2.png)
- 위와 같이 사용자가 색을 지정했다면, 그 색이 나옵니다. 이 경우에는 글씨가 잘 보이도록 직접 조절해 주세요.

---

### ❓ FAQ
- **Q. 파란색으로 가로 선이 떠요. 어떻게 없애나요?**
  - A. [이 글](https://posty.pe/oetg40)을 참고해 주세요. 코드 내에서 없애는 방법은 찾지 못했습니다.

- **Q. 색이 비슷해 보여요.**
  - A. 원본 확장의 계산식을 그대로 사용하기 때문에 이 부분은 바뀐 점이 없습니다. 정말 우연히도 비슷한 패턴이 나오면 색도 비슷하게 보이더라고요.

- **Q. 이런 기능 추가해 주실 수 있나요?**
  - A. 네. 대신 제가 시간이 날 때만 건드릴 수 있어서 업데이트가 느릴 수는 있습니다.

- **Q. 문제가 생겼어요.**
  - A. <d9916859@gmail.com>으로 메일 주세요.

---

### 📂 폴더 구조
```
roll20-coloursie-new/
├─ icon/
│  └─ icon.png              ← 확장 프로그램 아이콘
├─ image/
│  ├─ 1.png                 ← 샘플 이미지 1
│  └─ 2.png                 ← 샘플 이미지 2
├─ main-legacy.js           ← 레거시 메인 스크립트
├─ main.js                  ← 메인 스크립트
├─ manifest.json            ← 확장 프로그램 설정 파일
├─ popup.css                ← 팝업 CSS
├─ popup.html               ← 팝업 HTML
├─ popup.js                 ← 팝업 스크립트(JS)
├─ README.md                ← 설명서
└─ roll20-colourise-new.zip ← 배포용(Github 업로드용) 압축 파일
```

---

### 📧 기타
- 제작자: daisy, 원본 제작자: Xavier Ho
- 문의: [Github Issues](https://github.com/daisy-4urdayz/roll20-colourise-new/issues) 또는 <d9916859@gmail.com>
- 로고에 사용된 배경은 <a href="https://unsplash.com/ko/%EC%82%AC%EC%A7%84/%EC%97%AC%EB%9F%AC-%EA%B0%80%EC%A7%80-%EC%83%89%EC%83%81%EC%9D%98-%EB%B0%B0%EA%B2%BD%EC%9D%B4-%ED%9D%90%EB%A6%BF%ED%95%9C-%EC%9D%B4%EB%AF%B8%EC%A7%80-Cxt_W7nqLvM?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Unsplash</a>, <a href="https://unsplash.com/ko/@plufow?utm_content=creditCopyText&utm_medium=referral&utm_source=unsplash">Plufow Le Studio</a>의 작품입니다.
