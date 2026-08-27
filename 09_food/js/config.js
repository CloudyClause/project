"use strict";

/*
  GitHub Pages 배포용 설정

  FOOD_API_KEY
  - 공공데이터포털 부산맛집정보 서비스 인증키
  - Encoding 키 / Decoding 키 모두 입력 가능

  KAKAO_JAVASCRIPT_KEY
  - Kakao Developers의 JavaScript Key
  - REST API Key가 아님

  예)
  GitHub Pages 주소:
  https://username.github.io/busan-food-app/

  Kakao JavaScript SDK 도메인:
  https://username.github.io
*/

window.APP_CONFIG = {
  FOOD_API_KEY: "tW7FeD8I518PrNi%2F5UsHOX%2FXezu6UWbn8JnnGBpgg72TjF2JM4r5MjBqSk7RrTCMviF%2BMnZGJOX7W8d50y0uzw%3D%3D",
  KAKAO_JAVASCRIPT_KEY: "ff903ba5afd1fcd44c239001c7ce94a6",

  FOOD_API_BASE_URL: "https://apis.data.go.kr/6260000/FoodService",

  PAGE_SIZE: 20,
  RECENT_LIMIT: 10
};
