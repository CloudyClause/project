# 모바일 청첩장 프로젝트

김민혁 ♥ 이서영 모바일 청첩장 전체 패키지입니다.

이 ZIP은 **VS Code에서 바로 열어 수정할 수 있는 웹 프로젝트**와  
Google Sheets 방명록용 **Apps Script `Code.gs`**를 한 폴더에 묶어둔 버전입니다.

---

## 가장 먼저 할 일 3개

### 1. 프로젝트 열기
VS Code에서 이 폴더를 엽니다.

```text
mobile-wedding/
```

### 2. 카카오맵 JavaScript Key 넣기
`index.html` 맨 아래에서 다음 문자열을 찾습니다.

```text
YOUR_KAKAO_JAVASCRIPT_KEY
```

실제 Kakao Developers의 **JavaScript Key**로 교체합니다.

자세한 순서는:

```text
SETUP_KAKAO_MAP.md
```

를 확인하세요.

### 3. Google Apps Script /exec URL 넣기
`script.js` 맨 위에서 다음 문자열을 찾습니다.

```text
YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL
```

Apps Script를 웹 앱으로 배포한 뒤 받은 `/exec` URL로 교체합니다.

자세한 순서는:

```text
SETUP_GOOGLE_SHEETS.md
```

를 확인하세요.

---

# 프로젝트 구조

```text
mobile-wedding/
│
├─ index.html
├─ style.css
├─ script.js
├─ README.md
├─ SETUP_GOOGLE_SHEETS.md
├─ SETUP_KAKAO_MAP.md
│
├─ google-apps-script/
│   └─ Code.gs
│
└─ images/
    ├─ main-wedding.jpg
    ├─ gallery01.jpg
    ├─ gallery02.jpg
    ├─ gallery03.jpg
    ├─ gallery04.jpg
    └─ gallery05.jpg
```

---

# 현재 포함된 기능

- 모바일 원페이지 UI
- 메인 웨딩 이미지
- 초대 문구
- 신랑·신부 정보
- 2026년 9월 1일 화요일 예식 정보
- 실시간 D-Day 카운트다운
- 스크롤 아래 → 위 등장 애니메이션
- Swiper 웨딩 갤러리
- 사진 확대 Modal
- 신랑 전화 버튼
- 신부 전화 버튼
- 카카오맵 위치 표시
- 주소 복사
- 카카오맵에서 보기
- 교통 안내
- 신랑/신부 계좌 아코디언
- 계좌번호 복사
- Google Sheets 방명록
- 청첩장 링크 복사

---

# 현재 데이터

## 신랑
```text
김대성의 아들 김민혁
010-1234-5678
```

## 신부
```text
이완성의 딸 이서영
010-9876-5432
```

## 예식
```text
2026년 9월 1일 화요일
낮 12시
서울 신라호텔 영빈관
```

## 계좌
```text
신랑측: 농협은행 392-0897-5992-89
신부측: 농협은행 392-0897-5992-89
```

---

# 이미지

모든 웹 이미지 경로는:

```text
./images/파일명
```

기준입니다.

현재 생성한 웨딩사진도 ZIP 안에 포함되어 있습니다.

권장 규격:

```text
1086 × 1448px
3:4
```

---

# 로컬 실행 권장 방법

HTML 파일을 더블클릭해 `file://`로 실행하기보다  
VS Code의 Live Server 확장 등을 사용해 실행하는 것을 권장합니다.

예:

```text
http://127.0.0.1:5500
```

이유:

- 카카오맵 도메인 테스트가 쉬움
- 브라우저 Console 확인이 쉬움
- 실제 웹 배포 환경과 비슷함

---

# 기능이 안 될 때

먼저 브라우저 개발자 도구를 확인합니다.

```text
F12
→ Console
```

그리고:

```text
F12
→ Network
```

를 확인합니다.

특히 확인할 부분:

- 이미지 404
- Kakao SDK 오류
- Google Apps Script 요청 오류
- JavaScript 문법 오류

---

# 수정 위치 빠른 표

| 수정 내용 | 파일 |
|---|---|
| 문구 | `index.html` |
| 날짜 표시 | `index.html` |
| 카운트다운 기준일 | `script.js` |
| 디자인/간격 | `style.css` |
| 사진 | `images/` |
| 전화번호 | `index.html` |
| 계좌번호 | `index.html` |
| 주소 | `index.html` |
| 예식장 검색어 | `script.js` |
| Kakao Key | `index.html` |
| Apps Script URL | `script.js` |
| Google Sheet 저장 로직 | `google-apps-script/Code.gs` |

---

# 중요한 주의

카카오맵과 Google Sheets 연동은 외부 계정 권한 때문에  
ZIP 파일만으로 완전히 자동 연결할 수는 없습니다.

사용자가 직접 해야 하는 최소 작업은:

```text
1. Kakao JavaScript Key 발급 + 도메인 등록
2. Google Sheets 생성
3. Code.gs 복사
4. Apps Script 웹 앱 배포
5. /exec URL을 script.js에 붙여넣기
```

나머지 웹 코드는 이미 연결 구조가 준비되어 있습니다.

---

# 추천 작업 순서

```text
1. ZIP 압축 해제
2. VS Code로 폴더 열기
3. Live Server로 실행
4. 사진/텍스트 확인
5. 카카오맵 설정
6. Google Sheets 방명록 설정
7. 실제 스마트폰에서 테스트
8. GitHub Pages 등에 배포
```

외부 연동 설정은 각각의 전용 안내 파일을 보면서 진행하세요.
