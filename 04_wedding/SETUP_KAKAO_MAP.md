# 카카오맵 설정 가이드

현재 청첩장은 지도 서비스로 **카카오맵만 사용합니다.**

ZIP 안의 지도 코드는 이미 구현되어 있으며,  
사용자는 **Kakao JavaScript Key 입력 + 사용 도메인 등록**만 하면 됩니다.

---

# 전체 흐름

```text
Kakao Developers 앱 생성
↓
카카오맵 사용 설정
↓
JavaScript Key 확인
↓
사용 웹 도메인 등록
↓
index.html에 Key 입력
↓
지도 테스트
```

---

# STEP 1. Kakao Developers 앱 생성

Kakao Developers에 로그인한 뒤 애플리케이션을 생성합니다.

앱 이름 예:

```text
모바일 청첩장
```

---

# STEP 2. 카카오맵 사용 설정

앱 관리 화면에서 카카오맵 관련 사용 설정을 활성화합니다.

---

# STEP 3. JavaScript Key 확인

앱의 플랫폼 키/앱 키 영역에서:

```text
JavaScript Key
```

를 확인합니다.

중요:

```text
JavaScript Key 사용 O
REST API Key 사용 X
Admin Key 사용 X
```

---

# STEP 4. 웹 도메인 등록

현재 청첩장을 실행할 웹 도메인을 등록합니다.

로컬 Live Server 예:

```text
http://127.0.0.1:5500
```

또는:

```text
http://localhost:5500
```

GitHub Pages 예:

```text
https://username.github.io
```

실제 사용하는 주소에 맞게 등록합니다.

---

# STEP 5. index.html 수정

VS Code에서:

```text
index.html
```

을 엽니다.

파일 맨 아래에서:

```html
<script
  src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=YOUR_KAKAO_JAVASCRIPT_KEY&libraries=services"
></script>
```

를 찾습니다.

`YOUR_KAKAO_JAVASCRIPT_KEY`만 실제 키로 교체합니다.

예:

```html
<script
  src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=실제키&libraries=services"
></script>
```

`libraries=services`는 장소 검색에 사용하므로 삭제하지 않습니다.

---

# 지도 검색 위치

현재 `script.js`에서는:

```javascript
places.keywordSearch(
  "서울 신라호텔 영빈관",
```

을 사용합니다.

장소가 바뀐다면 이 문자열도 같이 수정하세요.

---

# 표시 주소

`index.html`:

```html
<p id="venue-address">
  서울특별시 중구 동호로 249
</p>
```

주소가 바뀐다면 이 부분도 같이 수정합니다.

---

# 카카오맵 링크

`index.html`의:

```html
href="https://map.kakao.com/?q=서울%20신라호텔%20영빈관"
```

도 장소 변경 시 같이 확인합니다.

즉 장소를 변경할 때는:

```text
1. 화면 표시 장소
2. 화면 표시 주소
3. script.js 검색어
4. 카카오맵 링크
```

가 모두 같은 장소인지 확인해야 합니다.

---

# 지도가 안 나올 때

## 1. Console

```text
F12
→ Console
```

Kakao 관련 오류를 확인합니다.

## 2. Key 종류

REST API 키가 아니라 JavaScript Key인지 확인합니다.

## 3. 도메인

현재 실행 중인 주소가 Kakao Developers에 등록되어 있는지 확인합니다.

## 4. script 순서

정상:

```html
<script src="카카오맵 SDK"></script>
<script src="./script.js"></script>
```

Kakao SDK가 `script.js`보다 먼저 있어야 합니다.

---

# 참고

카카오 개발자 콘솔의 메뉴명이나 설정 화면은 서비스 업데이트로 바뀔 수 있습니다.  
화면 명칭이 다르면 최신 Kakao Developers 안내를 우선하세요.
