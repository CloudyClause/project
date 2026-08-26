# Global Weather App

OpenWeather API를 사용하는 전 세계 날씨 앱입니다.

## 실행 방법

1. `script.js`를 엽니다.
2. 아래 값을 본인의 OpenWeather API Key로 교체합니다.

```javascript
const API_KEY = "YOUR_OPENWEATHER_API_KEY";
```

3. `index.html`을 브라우저에서 실행합니다.

권장: VS Code Live Server 같은 로컬 서버 환경에서 실행하세요.

## 주요 기능

- 한글/영문 도시 검색
- Geocoding 검색 후보
- 현재 위치 날씨
- 현재 날씨
- 3시간 단위 예보
- 날짜별 5일 예보
- 대기질
- 일출/일몰
- 즐겨찾기
- 최근 검색
- 섭씨/화씨 전환
- 날씨별 메인 카드 테마
- 로딩/오류 처리
- 모든 API 원본 응답 console.log 확인

## 한글 검색 참고

OpenWeather Geocoding API에 한글 검색어를 먼저 그대로 전달합니다.
검색 결과가 없을 때는 `KOREAN_CITY_ALIASES`에 등록된 주요 한글 외래지명을 영문명으로 변환하여 재검색합니다.

전 세계 모든 한글 외래지명을 완벽하게 변환하는 사전은 아니므로 필요한 도시를 `KOREAN_CITY_ALIASES`에 추가할 수 있습니다.

## 보안

학습/로컬 개발에서는 브라우저 JavaScript에 API Key를 넣을 수 있지만,
GitHub Pages 등 공개 배포 시에는 API Key가 노출됩니다.

운영 서비스에서는 서버/서버리스 함수를 중간에 두어 API Key를 숨기는 구조를 권장합니다.
