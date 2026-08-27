# 부산맛집 가이드 — GitHub Pages 배포형

순수 정적 웹 프로젝트입니다.

```text
busan-food-app/
├─ index.html
├─ .nojekyll
├─ css/
│  └─ style.css
└─ js/
   ├─ config.js
   └─ app.js
```

별도 서버 실행 파일은 포함하지 않습니다.

## 키 설정

`js/config.js`에서:

```javascript
FOOD_API_KEY: "YOUR_DATA_GO_KR_SERVICE_KEY",
KAKAO_JAVASCRIPT_KEY: "YOUR_KAKAO_JAVASCRIPT_KEY",
```

를 실제 키로 교체합니다.

공공데이터 인증키는 Encoding/Decoding 어느 쪽을 입력해도
`app.js`가 URL에 한 번만 인코딩하도록 처리합니다.

## Kakao Maps

Kakao Developers에서 JavaScript Key를 사용합니다.

예를 들어 실제 사이트가:

```text
https://username.github.io/busan-food-app/
```

라면 JavaScript SDK 도메인에는:

```text
https://username.github.io
```

를 등록합니다.

## GitHub Pages

1. 저장소 루트에 이 프로젝트를 업로드
2. Settings → Pages
3. 배포 Branch/폴더 지정
4. 생성된 Pages URL로 접속

프로젝트의 CSS/JS 경로는 상대경로입니다.

```text
./css/style.css
./js/config.js
./js/app.js
```

따라서 프로젝트형 GitHub Pages URL에서도 동작하도록 구성했습니다.

## API 로그

개발자도구 Console에서:

```text
[부산맛집 API] 요청:
[부산맛집 API] 원본 응답:
[부산맛집 API] 정규화 데이터:
```

를 확인할 수 있습니다.

HTTP 오류가 발생하면 응답 본문도 표시합니다.

```text
[부산맛집 API] HTTP 403 응답 본문:
```

브라우저가 응답을 읽지 못한 경우에는 Network 탭에서
HTTPS 상태와 응답 헤더/CORS 여부를 확인하도록 진단 메시지를 출력합니다.
