# Google Sheets 방명록 설정 가이드

이 문서는 모바일 청첩장의 방명록을 Google Sheets에 연결하기 위한 최소 단계만 정리한 안내서입니다.

---

# 전체 흐름

```text
Google Sheets 생성
↓
Guestbook 시트 준비
↓
Code.gs 복사
↓
웹 앱 배포
↓
/exec URL 복사
↓
script.js에 붙여넣기
```

---

# STEP 1. Google Sheets 만들기

새 Google Spreadsheet를 만듭니다.

첫 번째 시트 이름을 정확히:

```text
Guestbook
```

으로 바꿉니다.

첫 번째 행은 다음처럼 입력합니다.

| A1 | B1 | C1 |
|---|---|---|
| 작성시간 | 이름 | 메시지 |

---

# STEP 2. Apps Script 열기

Google Sheets 상단 메뉴에서:

```text
확장 프로그램
→ Apps Script
```

를 선택합니다.

---

# STEP 3. Code.gs 붙여넣기

이 ZIP 안의 다음 파일을 엽니다.

```text
google-apps-script/Code.gs
```

내용 전체를 복사합니다.

Google Apps Script 편집기의 기존 코드를 지우고 그대로 붙여넣습니다.

---

# STEP 4. 저장

Apps Script 편집기에서 저장합니다.

프로젝트 이름은 자유롭게 정해도 됩니다.

예:

```text
Wedding Guestbook
```

---

# STEP 5. 웹 앱 배포

Apps Script에서:

```text
배포
→ 새 배포
```

를 누릅니다.

유형:

```text
웹 앱
```

으로 선택합니다.

실행 사용자는 일반적으로 본인 계정으로 설정합니다.

외부 하객이 로그인 없이 방명록을 사용해야 하므로,  
실제 배포 화면에서 외부 사용자가 접근 가능한 권한 옵션을 선택해야 합니다.

> Google 계정 종류나 조직 정책에 따라 표시되는 접근 권한 이름이 다를 수 있습니다.

---

# STEP 6. /exec URL 복사

배포가 끝나면 다음과 비슷한 URL이 생깁니다.

```text
https://script.google.com/macros/s/XXXXXXXXXXXX/exec
```

반드시:

```text
/exec
```

로 끝나는 배포 URL을 사용합니다.

---

# STEP 7. script.js에 URL 넣기

VS Code에서:

```text
script.js
```

를 엽니다.

파일 맨 위에서:

```javascript
const GOOGLE_SCRIPT_URL =
  "YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL";
```

를 찾습니다.

예:

```javascript
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/XXXXXXXXXXXX/exec";
```

처럼 바꿉니다.

---

# STEP 8. 테스트

청첩장 페이지에서:

```text
이름
축하 메시지
```

를 입력하고:

```text
축하 메시지 남기기
```

버튼을 누릅니다.

Google Sheets에 새 행이 생기면 저장 성공입니다.

페이지를 새로고침했을 때 작성한 글이 보이면 조회도 성공입니다.

---

# 저장 구조

Google Sheets에는 다음 순서로 저장됩니다.

| 작성시간 | 이름 | 메시지 |
|---|---|---|
| 자동 생성 | 방문자 입력 | 방문자 입력 |

---

# Apps Script 수정 후

나중에 `Code.gs`를 수정했다면  
배포된 웹 앱도 새 버전으로 업데이트해야 하는 경우가 있습니다.

확인 위치:

```text
Apps Script
→ 배포
→ 배포 관리
```

코드를 수정했는데 웹에서는 예전 동작을 하면 이 부분을 먼저 확인하세요.

---

# 방명록이 안 될 때

## 1. 시트 이름

정확히:

```text
Guestbook
```

인지 확인합니다.

`Code.gs`에도:

```javascript
const SHEET_NAME = "Guestbook";
```

으로 되어 있습니다.

---

## 2. /exec 확인

잘못된 예:

```text
.../dev
```

정상 사용:

```text
.../exec
```

---

## 3. 브라우저 Console

```text
F12
→ Console
```

빨간 오류가 있는지 확인합니다.

---

## 4. Network

```text
F12
→ Network
```

`script.google.com` 요청이 발생하는지 확인합니다.

---

## 5. 접근 권한

웹 앱 배포 설정이 외부 방문자의 요청을 허용하는지 확인합니다.

---

# 중요

Google Sheets + Apps Script 방식은 개인 모바일 청첩장처럼 소규모 방명록에 적합합니다.

회원 시스템, 결제, 대규모 트래픽, 민감정보 저장이 필요해지면 정식 백엔드/DB를 별도로 검토하는 것이 좋습니다.
