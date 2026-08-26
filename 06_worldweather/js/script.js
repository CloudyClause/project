"use strict";

/* ==================================================
   OpenWeather API 설정
   --------------------------------------------------
   아래 API_KEY 값만 본인의 OpenWeather API Key로
   교체하면 됩니다.
================================================== */

const API_KEY = "9724891ddce8230a562b3d16c2168150";

const GEO_URL = "https://api.openweathermap.org/geo/1.0/direct";
const WEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";
const FORECAST_URL = "https://api.openweathermap.org/data/2.5/forecast";
const AIR_URL = "https://api.openweathermap.org/data/2.5/air_pollution";

/*
  OpenWeather Geocoding은 다양한 지역명 입력을 처리할 수 있지만,
  모든 한글 외래지명이 항상 검색된다고 단정할 수는 없습니다.

  따라서:
  1) 사용자가 입력한 한글 검색어를 먼저 그대로 요청
  2) 결과가 없으면 자주 쓰는 한글 외래지명의 영문명을 fallback
  하는 구조로 구현합니다.

  필요하면 아래 객체에 도시를 계속 추가할 수 있습니다.
*/
const KOREAN_CITY_ALIASES = {
  "서울": "Seoul",
  "부산": "Busan",
  "인천": "Incheon",
  "대구": "Daegu",
  "대전": "Daejeon",
  "광주": "Gwangju",
  "울산": "Ulsan",
  "수원": "Suwon",
  "제주": "Jeju",
  "제주시": "Jeju",
  "도쿄": "Tokyo",
  "오사카": "Osaka",
  "교토": "Kyoto",
  "후쿠오카": "Fukuoka",
  "삿포로": "Sapporo",
  "나고야": "Nagoya",
  "베이징": "Beijing",
  "북경": "Beijing",
  "상하이": "Shanghai",
  "상해": "Shanghai",
  "홍콩": "Hong Kong",
  "타이베이": "Taipei",
  "싱가포르": "Singapore",
  "방콕": "Bangkok",
  "하노이": "Hanoi",
  "호찌민": "Ho Chi Minh City",
  "호치민": "Ho Chi Minh City",
  "마닐라": "Manila",
  "자카르타": "Jakarta",
  "뉴델리": "New Delhi",
  "델리": "Delhi",
  "두바이": "Dubai",
  "이스탄불": "Istanbul",
  "런던": "London",
  "파리": "Paris",
  "로마": "Rome",
  "마드리드": "Madrid",
  "바르셀로나": "Barcelona",
  "베를린": "Berlin",
  "뮌헨": "Munich",
  "암스테르담": "Amsterdam",
  "브뤼셀": "Brussels",
  "비엔나": "Vienna",
  "빈": "Vienna",
  "프라하": "Prague",
  "부다페스트": "Budapest",
  "아테네": "Athens",
  "취리히": "Zurich",
  "리스본": "Lisbon",
  "코펜하겐": "Copenhagen",
  "스톡홀름": "Stockholm",
  "오슬로": "Oslo",
  "헬싱키": "Helsinki",
  "모스크바": "Moscow",
  "뉴욕": "New York",
  "로스앤젤레스": "Los Angeles",
  "엘에이": "Los Angeles",
  "샌프란시스코": "San Francisco",
  "시카고": "Chicago",
  "워싱턴": "Washington",
  "보스턴": "Boston",
  "시애틀": "Seattle",
  "라스베이거스": "Las Vegas",
  "라스베가스": "Las Vegas",
  "마이애미": "Miami",
  "토론토": "Toronto",
  "밴쿠버": "Vancouver",
  "몬트리올": "Montreal",
  "멕시코시티": "Mexico City",
  "상파울루": "Sao Paulo",
  "리우데자네이루": "Rio de Janeiro",
  "부에노스아이레스": "Buenos Aires",
  "시드니": "Sydney",
  "멜버른": "Melbourne",
  "오클랜드": "Auckland",
  "카이로": "Cairo",
  "케이프타운": "Cape Town",
  "요하네스버그": "Johannesburg"
};

/* ==================================================
   국가 코드 → 한국어 국가명
================================================== */
const REGION_NAMES_KO =
  typeof Intl !== "undefined" && Intl.DisplayNames
    ? new Intl.DisplayNames(["ko"], { type: "region" })
    : null;

/* ==================================================
   DOM
================================================== */
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const searchResults = document.getElementById("searchResults");
const locationButton = document.getElementById("locationButton");
const unitButton = document.getElementById("unitButton");
const favoriteButton = document.getElementById("favoriteButton");
const clearRecentButton = document.getElementById("clearRecentButton");

const statusCard = document.getElementById("statusCard");
const statusMessage = document.getElementById("statusMessage");
const loader = document.getElementById("loader");
const weatherContent = document.getElementById("weatherContent");

const heroCard = document.getElementById("heroCard");
const cityName = document.getElementById("cityName");
const countryName = document.getElementById("countryName");
const localTime = document.getElementById("localTime");
const weatherIcon = document.getElementById("weatherIcon");
const currentTemp = document.getElementById("currentTemp");
const weatherDescription = document.getElementById("weatherDescription");
const feelsLike = document.getElementById("feelsLike");
const todayMax = document.getElementById("todayMax");
const todayMin = document.getElementById("todayMin");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const pressure = document.getElementById("pressure");
const visibility = document.getElementById("visibility");

const sunrise = document.getElementById("sunrise");
const sunset = document.getElementById("sunset");

const hourlyList = document.getElementById("hourlyList");
const dailyList = document.getElementById("dailyList");

const aqiBadge = document.getElementById("aqiBadge");
const pm25 = document.getElementById("pm25");
const pm10 = document.getElementById("pm10");

const recentList = document.getElementById("recentList");
const favoriteList = document.getElementById("favoriteList");

/* ==================================================
   App State
================================================== */
let currentUnit = localStorage.getItem("weatherUnit") || "metric";
let currentLocation = null;
let searchDebounceTimer = null;

const STORAGE_KEYS = {
  favorites: "globalWeatherFavorites",
  recent: "globalWeatherRecent"
};

/* ==================================================
   초기 실행
================================================== */
document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
  updateUnitButton();
  renderRecentSearches();
  renderFavorites();

  /*
    첫 화면 기본값: 서울
    API Key가 준비되면 서울 날씨를 자동으로 불러옵니다.
  */
  if (!isApiKeyReady()) {
    showStatus(
      "script.js 상단의 YOUR_OPENWEATHER_API_KEY를 실제 API Key로 교체해 주세요.",
      false
    );
    return;
  }

  await searchAndLoadCity("서울", true);
}

/* ==================================================
   이벤트
================================================== */

/* 검색 버튼 / Enter */
searchForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const keyword = cityInput.value.trim();

  if (!keyword) {
    showStatus("검색할 도시 이름을 입력해 주세요.", false);
    return;
  }

  await searchCityCandidates(keyword, true);
});

/*
  검색 자동완성
  400ms debounce로 불필요한 API 호출을 줄입니다.
*/
cityInput.addEventListener("input", () => {
  clearTimeout(searchDebounceTimer);

  const keyword = cityInput.value.trim();

  if (keyword.length < 2) {
    hideSearchResults();
    return;
  }

  searchDebounceTimer = setTimeout(() => {
    searchCityCandidates(keyword, false);
  }, 400);
});

/* 검색 결과 바깥 클릭 시 닫기 */
document.addEventListener("click", (event) => {
  if (
    !searchResults.contains(event.target) &&
    !cityInput.contains(event.target)
  ) {
    hideSearchResults();
  }
});

/* 현재 위치 */
locationButton.addEventListener("click", getCurrentPositionWeather);

/* 단위 전환 */
unitButton.addEventListener("click", async () => {
  currentUnit = currentUnit === "metric" ? "imperial" : "metric";
  localStorage.setItem("weatherUnit", currentUnit);

  updateUnitButton();

  if (currentLocation) {
    await loadWeatherByCoordinates(currentLocation, false);
  }
});

/* 현재 도시 즐겨찾기 */
favoriteButton.addEventListener("click", toggleCurrentFavorite);

/* 최근 검색 전체 삭제 */
clearRecentButton.addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEYS.recent);
  renderRecentSearches();
});

/* ==================================================
   한글 / 영문 도시 검색
================================================== */

async function searchCityCandidates(keyword, openOnlyOne = false) {
  if (!isApiKeyReady()) {
    showStatus("먼저 OpenWeather API Key를 입력해 주세요.", false);
    return;
  }

  try {
    if (openOnlyOne) {
      showLoading("도시를 검색하고 있습니다...");
    }

    /*
      1차: 사용자가 입력한 원문 그대로 검색
      encodeURIComponent를 이용하므로 한글도 URL에 안전하게 전달됩니다.
    */
    let locations = await fetchGeocoding(keyword);

    /*
      2차 fallback:
      한글 외래지명으로 결과가 없고 별칭 사전에 존재하면
      영문 도시명으로 한 번 더 검색합니다.
    */
    if (locations.length === 0 && KOREAN_CITY_ALIASES[keyword]) {
      const alias = KOREAN_CITY_ALIASES[keyword];

      console.log("[한글 검색 fallback]", {
        originalKeyword: keyword,
        fallbackKeyword: alias
      });

      locations = await fetchGeocoding(alias);
    }

    /*
      API에서 받은 도시 후보를 먼저 console.log()로 확인합니다.
    */
    console.log("[Geocoding 검색 결과]", locations);

    if (locations.length === 0) {
      hideLoading();
      renderSearchResults([]);
      showStatus(
        `"${keyword}"에 대한 도시 검색 결과를 찾지 못했습니다.`,
        false
      );
      return;
    }

    hideStatus();

    /*
      검색 버튼을 눌렀고 결과가 정확히 1개라면 바로 이동,
      그 외에는 후보를 표시합니다.
    */
    if (openOnlyOne && locations.length === 1) {
      await selectLocation(locations[0], keyword);
      return;
    }

    renderSearchResults(locations, keyword);
  } catch (error) {
    console.error("[도시 검색 오류]", error);

    hideSearchResults();
    showStatus(getFriendlyErrorMessage(error), false);
  }
}

async function searchAndLoadCity(keyword, autoSelectFirst = false) {
  try {
    showLoading(`"${keyword}" 날씨를 찾고 있습니다...`);

    let locations = await fetchGeocoding(keyword);

    if (locations.length === 0 && KOREAN_CITY_ALIASES[keyword]) {
      locations = await fetchGeocoding(KOREAN_CITY_ALIASES[keyword]);
    }

    console.log("[초기/빠른 도시 검색 결과]", locations);

    if (locations.length === 0) {
      throw new Error("CITY_NOT_FOUND");
    }

    if (autoSelectFirst) {
      await selectLocation(locations[0], keyword);
    } else {
      renderSearchResults(locations, keyword);
      hideLoading();
    }
  } catch (error) {
    console.error(error);
    showStatus(getFriendlyErrorMessage(error), false);
  }
}

async function fetchGeocoding(keyword) {
  const url =
    `${GEO_URL}?q=${encodeURIComponent(keyword)}` +
    `&limit=5&appid=${encodeURIComponent(API_KEY)}`;

  const response = await fetch(url);
  const data = await parseResponse(response);

  /*
    요청사항:
    서버에서 받은 데이터를 우선 console.log()로 확인
  */
  console.log("[Geocoding API 원본 응답]", data);

  return Array.isArray(data) ? data : [];
}

/* ==================================================
   검색 결과 UI
================================================== */

function renderSearchResults(locations, originalKeyword = "") {
  searchResults.innerHTML = "";

  if (!locations.length) {
    searchResults.innerHTML =
      `<div class="no-result">검색 결과가 없습니다.</div>`;
    searchResults.classList.remove("is-hidden");
    return;
  }

  locations.forEach((location) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "search-result-button";

    const displayCity = getDisplayCityName(location, originalKeyword);
    const state = location.state ? ` · ${location.state}` : "";
    const country = getCountryName(location.country);

    button.innerHTML = `
      <span class="result-title">${escapeHtml(displayCity)}</span>
      <span class="result-subtitle">
        ${escapeHtml(country)}${escapeHtml(state)}
      </span>
    `;

    button.addEventListener("click", async () => {
      await selectLocation(location, originalKeyword);
    });

    searchResults.appendChild(button);
  });

  searchResults.classList.remove("is-hidden");
}

function hideSearchResults() {
  searchResults.classList.add("is-hidden");
}

/* ==================================================
   특정 지역 선택
================================================== */

async function selectLocation(location, originalKeyword = "") {
  const normalizedLocation = {
    name: getDisplayCityName(location, originalKeyword),
    apiName: location.name,
    country: location.country,
    state: location.state || "",
    lat: Number(location.lat),
    lon: Number(location.lon)
  };

  hideSearchResults();
  cityInput.value = "";

  await loadWeatherByCoordinates(normalizedLocation, true);
}

/* ==================================================
   현재 위치
================================================== */

function getCurrentPositionWeather() {
  if (!navigator.geolocation) {
    showStatus("이 브라우저에서는 위치 기능을 지원하지 않습니다.", false);
    return;
  }

  showLoading("현재 위치를 확인하고 있습니다...");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const { latitude, longitude } = position.coords;

      console.log("[현재 위치 좌표]", {
        latitude,
        longitude
      });

      try {
        /*
          Reverse Geocoding으로 현재 좌표의 도시 이름도 가져옵니다.
        */
        const reverseUrl =
          `https://api.openweathermap.org/geo/1.0/reverse` +
          `?lat=${latitude}&lon=${longitude}&limit=1` +
          `&appid=${encodeURIComponent(API_KEY)}`;

        const reverseResponse = await fetch(reverseUrl);
        const reverseData = await parseResponse(reverseResponse);

        console.log("[Reverse Geocoding API 원본 응답]", reverseData);

        const place = reverseData[0];

        const location = {
          name: place
            ? getDisplayCityName(place, "현재 위치")
            : "현재 위치",
          apiName: place?.name || "Current location",
          country: place?.country || "",
          state: place?.state || "",
          lat: latitude,
          lon: longitude
        };

        await loadWeatherByCoordinates(location, true);
      } catch (error) {
        console.error("[현재 위치 날씨 오류]", error);

        showStatus(getFriendlyErrorMessage(error), false);
      }
    },

    (error) => {
      console.error("[위치 권한 오류]", error);

      let message = "현재 위치를 가져오지 못했습니다.";

      if (error.code === error.PERMISSION_DENIED) {
        message = "위치 권한이 거부되었습니다. 도시 검색을 이용해 주세요.";
      }

      showStatus(message, false);
    },

    {
      enableHighAccuracy: false,
      timeout: 10000,
      maximumAge: 300000
    }
  );
}

/* ==================================================
   날씨 데이터 통합 조회
================================================== */

async function loadWeatherByCoordinates(location, saveHistory = true) {
  try {
    showLoading(`${location.name} 날씨 정보를 불러오고 있습니다...`);

    const params =
      `lat=${location.lat}&lon=${location.lon}` +
      `&appid=${encodeURIComponent(API_KEY)}` +
      `&units=${currentUnit}&lang=kr`;

    /*
      Current Weather / Forecast / Air Pollution을
      동시에 요청합니다.
    */
    const [weatherResponse, forecastResponse, airResponse] =
      await Promise.all([
        fetch(`${WEATHER_URL}?${params}`),
        fetch(`${FORECAST_URL}?${params}`),
        fetch(
          `${AIR_URL}?lat=${location.lat}&lon=${location.lon}` +
          `&appid=${encodeURIComponent(API_KEY)}`
        )
      ]);

    const weatherData = await parseResponse(weatherResponse);
    const forecastData = await parseResponse(forecastResponse);

    /*
      대기질은 부가 기능이므로 실패해도 전체 날씨 화면은 표시합니다.
    */
    let airData = null;

    if (airResponse.ok) {
      airData = await airResponse.json();
    } else {
      console.warn("[Air Pollution API 오류]", airResponse.status);
    }

    /*
      요청사항:
      서버 데이터를 UI 처리 전에 먼저 console.log()로 확인합니다.
    */
    console.log("[Current Weather API 원본 응답]", weatherData);
    console.log("[5 Day / 3 Hour Forecast API 원본 응답]", forecastData);
    console.log("[Air Pollution API 원본 응답]", airData);

    currentLocation = {
      ...location,
      timezone: Number(weatherData.timezone || 0)
    };

    renderCurrentWeather(weatherData, forecastData, currentLocation);
    renderHourlyForecast(forecastData, currentLocation.timezone);
    renderDailyForecast(forecastData, currentLocation.timezone);
    renderAirQuality(airData);

    if (saveHistory) {
      addRecentSearch(currentLocation);
    }

    updateFavoriteButton();
    renderFavorites();

    hideStatus();
    weatherContent.classList.remove("is-hidden");
  } catch (error) {
    console.error("[날씨 통합 조회 오류]", error);

    weatherContent.classList.add("is-hidden");
    showStatus(getFriendlyErrorMessage(error), false);
  }
}

/* ==================================================
   현재 날씨 UI
================================================== */

function renderCurrentWeather(weather, forecast, location) {
  const unitSymbol = getUnitSymbol();

  cityName.textContent = location.name || weather.name || "알 수 없는 지역";
  countryName.textContent = getCountryName(
    location.country || weather.sys?.country
  );

  localTime.textContent = formatLocalDateTime(
    weather.dt,
    weather.timezone
  );

  currentTemp.textContent =
    `${Math.round(weather.main.temp)}${unitSymbol}`;

  feelsLike.textContent =
    `${Math.round(weather.main.feels_like)}${unitSymbol}`;

  weatherDescription.textContent =
    getKoreanWeatherDescription(weather.weather?.[0]);

  humidity.textContent = `${weather.main.humidity}%`;

  windSpeed.textContent =
    `${formatWindSpeed(weather.wind.speed)}`;

  pressure.textContent = `${weather.main.pressure} hPa`;

  visibility.textContent =
    weather.visibility != null
      ? `${(weather.visibility / 1000).toFixed(1)} km`
      : "-";

  sunrise.textContent = formatClockTime(
    weather.sys.sunrise,
    weather.timezone
  );

  sunset.textContent = formatClockTime(
    weather.sys.sunset,
    weather.timezone
  );

  const iconCode = weather.weather?.[0]?.icon;

  if (iconCode) {
    weatherIcon.src =
      `https://openweathermap.org/img/wn/${iconCode}@2x.png`;

    weatherIcon.alt =
      weather.weather?.[0]?.description || "날씨 아이콘";
  }

  /*
    오늘의 최고/최저는 Current Weather의 temp_min/max를
    '일일 최고/최저'라고 단정하기보다 Forecast의 오늘 데이터에서
    계산합니다.
  */
  const todayRange =
    getTodayTemperatureRange(forecast, weather.timezone);

  todayMax.textContent =
    `${Math.round(todayRange.max ?? weather.main.temp_max)}${unitSymbol}`;

  todayMin.textContent =
    `${Math.round(todayRange.min ?? weather.main.temp_min)}${unitSymbol}`;

  applyWeatherTheme(weather.weather?.[0]?.main);
}

/* ==================================================
   시간대별 예보
================================================== */

function renderHourlyForecast(forecast, timezoneOffset) {
  hourlyList.innerHTML = "";

  if (!forecast.list?.length) {
    hourlyList.innerHTML =
      `<p class="empty-message">시간대별 예보가 없습니다.</p>`;
    return;
  }

  /*
    5일/3시간 예보 중 앞의 10개를 표시
    = 약 30시간
  */
  forecast.list.slice(0, 10).forEach((item, index) => {
    const card = document.createElement("article");
    card.className = "hourly-item";

    const time =
      index === 0
        ? "다음"
        : formatClockTime(item.dt, timezoneOffset);

    const pop =
      item.pop != null
        ? `${Math.round(item.pop * 100)}%`
        : "-";

    const icon = item.weather?.[0]?.icon || "01d";
    const description =
      getKoreanWeatherDescription(item.weather?.[0]);

    card.innerHTML = `
      <span class="hourly-time">${escapeHtml(time)}</span>

      <img
        src="https://openweathermap.org/img/wn/${icon}@2x.png"
        alt="${escapeHtml(description)}"
      />

      <strong class="hourly-temp">
        ${Math.round(item.main.temp)}${getUnitSymbol()}
      </strong>

      <span class="hourly-pop">강수 ${pop}</span>
    `;

    hourlyList.appendChild(card);
  });
}

/* ==================================================
   5일 예보
================================================== */

function renderDailyForecast(forecast, timezoneOffset) {
  dailyList.innerHTML = "";

  if (!forecast.list?.length) {
    dailyList.innerHTML =
      `<p class="empty-message">일별 예보가 없습니다.</p>`;
    return;
  }

  const groups = groupForecastByLocalDate(
    forecast.list,
    timezoneOffset
  );

  /*
    API는 5일/3시간 데이터이므로
    날짜 기준으로 묶어 최대 5일을 표시합니다.
  */
  Object.values(groups)
    .slice(0, 5)
    .forEach((items, index) => {
      const min = Math.min(...items.map((item) => item.main.temp_min));
      const max = Math.max(...items.map((item) => item.main.temp_max));

      /*
        대표 날씨는 정오에 가장 가까운 데이터 사용
      */
      const representative = getRepresentativeForecast(
        items,
        timezoneOffset
      );

      const card = document.createElement("article");
      card.className = "daily-item";

      card.innerHTML = `
        <strong class="daily-day">
          ${index === 0 ? "오늘" : getWeekday(representative.dt, timezoneOffset)}
        </strong>

        <div class="daily-weather">
          <img
            src="https://openweathermap.org/img/wn/${representative.weather[0].icon}@2x.png"
            alt="${escapeHtml(representative.weather[0].description)}"
          />

        <span>
          ${escapeHtml(
            getKoreanWeatherDescription(representative.weather[0])
          )}
        </span>
        </div>

        <div class="daily-temp">
          <span>${Math.round(min)}${getUnitSymbol()}</span>
          <strong>${Math.round(max)}${getUnitSymbol()}</strong>
        </div>
      `;

      dailyList.appendChild(card);
    });
}

/* ==================================================
   대기질
================================================== */

function renderAirQuality(airData) {
  const item = airData?.list?.[0];

  if (!item) {
    aqiBadge.textContent = "정보 없음";
    pm25.textContent = "-";
    pm10.textContent = "-";
    return;
  }

  const aqi = Number(item.main.aqi);
  const label = getAqiLabel(aqi);

  aqiBadge.textContent = label;
  pm25.textContent =
    roundAirValue(item.components.pm2_5);
  pm10.textContent =
    roundAirValue(item.components.pm10);
}

function getAqiLabel(aqi) {
  const labels = {
    1: "좋음",
    2: "보통",
    3: "나쁨",
    4: "매우 나쁨",
    5: "최악"
  };

  return labels[aqi] || "정보 없음";
}

/* ==================================================
   즐겨찾기
================================================== */

function toggleCurrentFavorite() {
  if (!currentLocation) {
    return;
  }

  const favorites = getStoredArray(STORAGE_KEYS.favorites);

  const index = favorites.findIndex(
    (item) => isSameCoordinates(item, currentLocation)
  );

  if (index >= 0) {
    favorites.splice(index, 1);
  } else {
    favorites.unshift({
      name: currentLocation.name,
      apiName: currentLocation.apiName,
      country: currentLocation.country,
      state: currentLocation.state,
      lat: currentLocation.lat,
      lon: currentLocation.lon
    });
  }

  localStorage.setItem(
    STORAGE_KEYS.favorites,
    JSON.stringify(favorites.slice(0, 12))
  );

  updateFavoriteButton();
  renderFavorites();
}

function updateFavoriteButton() {
  if (!currentLocation) {
    favoriteButton.textContent = "☆";
    return;
  }

  const favorites = getStoredArray(STORAGE_KEYS.favorites);

  const active = favorites.some(
    (item) => isSameCoordinates(item, currentLocation)
  );

  favoriteButton.textContent = active ? "★" : "☆";
  favoriteButton.setAttribute(
    "aria-label",
    active ? "즐겨찾기 해제" : "즐겨찾기 추가"
  );
}

function renderFavorites() {
  const favorites = getStoredArray(STORAGE_KEYS.favorites);

  favoriteList.innerHTML = "";

  if (!favorites.length) {
    favoriteList.innerHTML =
      `<p class="empty-message">즐겨찾기한 도시가 없습니다.</p>`;
    return;
  }

  favorites.forEach((favorite) => {
    const row = document.createElement("div");
    row.className = "favorite-city";

    const mainButton = document.createElement("button");
    mainButton.type = "button";
    mainButton.className = "favorite-city-main";

    mainButton.innerHTML = `
      <strong>${escapeHtml(favorite.name)}</strong>
      <span>${escapeHtml(getCountryName(favorite.country))}</span>
    `;

    mainButton.addEventListener("click", async () => {
      await loadWeatherByCoordinates(favorite, true);
    });

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "remove-favorite";
    removeButton.textContent = "×";
    removeButton.setAttribute("aria-label", `${favorite.name} 즐겨찾기 삭제`);

    removeButton.addEventListener("click", () => {
      removeFavorite(favorite);
    });

    row.append(mainButton, removeButton);
    favoriteList.appendChild(row);
  });
}

function removeFavorite(target) {
  const favorites =
    getStoredArray(STORAGE_KEYS.favorites).filter(
      (item) => !isSameCoordinates(item, target)
    );

  localStorage.setItem(
    STORAGE_KEYS.favorites,
    JSON.stringify(favorites)
  );

  updateFavoriteButton();
  renderFavorites();
}

/* ==================================================
   최근 검색
================================================== */

function addRecentSearch(location) {
  const recent = getStoredArray(STORAGE_KEYS.recent);

  const filtered = recent.filter(
    (item) => !isSameCoordinates(item, location)
  );

  filtered.unshift({
    name: location.name,
    apiName: location.apiName,
    country: location.country,
    state: location.state,
    lat: location.lat,
    lon: location.lon
  });

  localStorage.setItem(
    STORAGE_KEYS.recent,
    JSON.stringify(filtered.slice(0, 5))
  );

  renderRecentSearches();
}

function renderRecentSearches() {
  const recent = getStoredArray(STORAGE_KEYS.recent);

  recentList.innerHTML = "";

  if (!recent.length) {
    recentList.innerHTML =
      `<span class="empty-inline">최근 검색이 없습니다.</span>`;
    return;
  }

  recent.forEach((location) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "chip";
    button.textContent = location.name;

    button.addEventListener("click", async () => {
      await loadWeatherByCoordinates(location, true);
    });

    recentList.appendChild(button);
  });
}

/* ==================================================
   Forecast 데이터 가공
================================================== */

function getTodayTemperatureRange(forecast, timezoneOffset) {
  if (!forecast.list?.length) {
    return {
      min: null,
      max: null
    };
  }

  const nowUnix = Math.floor(Date.now() / 1000);
  const todayKey = getLocalDateKey(nowUnix, timezoneOffset);

  const todayItems = forecast.list.filter(
    (item) =>
      getLocalDateKey(item.dt, timezoneOffset) === todayKey
  );

  if (!todayItems.length) {
    return {
      min: null,
      max: null
    };
  }

  return {
    min: Math.min(...todayItems.map((item) => item.main.temp_min)),
    max: Math.max(...todayItems.map((item) => item.main.temp_max))
  };
}

function groupForecastByLocalDate(list, timezoneOffset) {
  return list.reduce((groups, item) => {
    const key = getLocalDateKey(item.dt, timezoneOffset);

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(item);

    return groups;
  }, {});
}

function getRepresentativeForecast(items, timezoneOffset) {
  return items.reduce((best, current) => {
    const bestHour = getLocalHour(best.dt, timezoneOffset);
    const currentHour = getLocalHour(current.dt, timezoneOffset);

    return Math.abs(currentHour - 12) < Math.abs(bestHour - 12)
      ? current
      : best;
  });
}

/* ==================================================
   시간 처리
   --------------------------------------------------
   OpenWeather timezone은 UTC 기준 초 단위 offset입니다.

   아래 함수는 Unix timestamp + timezone offset을 이용해
   대상 도시의 현지 시간을 생성합니다.
================================================== */

function getOffsetDate(unixSeconds, timezoneOffset = 0) {
  return new Date((unixSeconds + timezoneOffset) * 1000);
}

function formatLocalDateTime(unixSeconds, timezoneOffset = 0) {
  const date = getOffsetDate(unixSeconds, timezoneOffset);

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "UTC",
    month: "long",
    day: "numeric",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function formatClockTime(unixSeconds, timezoneOffset = 0) {
  const date = getOffsetDate(unixSeconds, timezoneOffset);

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(date);
}

function getLocalDateKey(unixSeconds, timezoneOffset = 0) {
  const date = getOffsetDate(unixSeconds, timezoneOffset);

  return [
    date.getUTCFullYear(),
    String(date.getUTCMonth() + 1).padStart(2, "0"),
    String(date.getUTCDate()).padStart(2, "0")
  ].join("-");
}

function getLocalHour(unixSeconds, timezoneOffset = 0) {
  return getOffsetDate(
    unixSeconds,
    timezoneOffset
  ).getUTCHours();
}

function getWeekday(unixSeconds, timezoneOffset = 0) {
  const date = getOffsetDate(unixSeconds, timezoneOffset);

  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "UTC",
    weekday: "short"
  }).format(date);
}

/* ==================================================
   표시명 / 국가명
================================================== */

function getDisplayCityName(location, originalKeyword = "") {
  /*
    OpenWeather local_names.ko가 있으면 최우선 사용.
  */
  const koreanName = location.local_names?.ko;

  if (koreanName) {
    return koreanName;
  }

  /*
    사용자가 정확한 한글 별칭으로 검색한 경우
    그 한글 표현을 화면에 유지합니다.
  */
  if (
    originalKeyword &&
    /[가-힣]/.test(originalKeyword) &&
    KOREAN_CITY_ALIASES[originalKeyword]
  ) {
    return originalKeyword;
  }

  return location.name || originalKeyword || "알 수 없는 지역";
}

function getCountryName(countryCode) {
  if (!countryCode) {
    return "";
  }

  try {
    return REGION_NAMES_KO
      ? REGION_NAMES_KO.of(countryCode) || countryCode
      : countryCode;
  } catch {
    return countryCode;
  }
}

/* ==================================================
   단위
================================================== */

function updateUnitButton() {
  unitButton.textContent =
    currentUnit === "metric" ? "°C" : "°F";
}

function getUnitSymbol() {
  return currentUnit === "metric" ? "°" : "°";
}

function formatWindSpeed(speed) {
  if (currentUnit === "metric") {
    return `${speed.toFixed(1)} m/s`;
  }

  return `${speed.toFixed(1)} mph`;
}


/* ==================================================
   날씨 상태 한국어 변환
   --------------------------------------------------
   OpenWeather의 lang=kr description을 그대로 사용하면
   일부 표현이 부자연스러울 수 있으므로
   weather id를 기준으로 화면용 문구를 직접 정의합니다.
================================================== */

function getKoreanWeatherDescription(weather) {
  if (!weather) {
    return "날씨 정보 없음";
  }

  const id = Number(weather.id);

  /* 천둥번개 200 ~ 232 */
  if (id >= 200 && id <= 232) {
    if (id === 200 || id === 201 || id === 202) {
      return "비와 천둥번개";
    }

    if (id === 210 || id === 211 || id === 212 || id === 221) {
      return "천둥번개";
    }

    return "약한 비와 천둥번개";
  }

  /* 이슬비 300 ~ 321 */
  if (id >= 300 && id <= 321) {
    return "이슬비";
  }

  /* 비 500 ~ 531 */
  if (id >= 500 && id <= 531) {
    switch (id) {
      case 500:
        return "약한 비";

      case 501:
        return "비";

      case 502:
        return "강한 비";

      case 503:
      case 504:
        return "매우 강한 비";

      case 511:
        return "어는 비";

      case 520:
        return "약한 소나기";

      case 521:
        return "소나기";

      case 522:
        return "강한 소나기";

      case 531:
        return "간헐적 소나기";

      default:
        return "비";
    }
  }

  /* 눈 600 ~ 622 */
  if (id >= 600 && id <= 622) {
    switch (id) {
      case 600:
        return "약한 눈";

      case 601:
        return "눈";

      case 602:
        return "강한 눈";

      case 611:
      case 612:
      case 613:
        return "진눈깨비";

      case 615:
      case 616:
        return "비와 눈";

      case 620:
        return "약한 소나기성 눈";

      case 621:
        return "소나기성 눈";

      case 622:
        return "강한 소나기성 눈";

      default:
        return "눈";
    }
  }

  /* 대기 상태 701 ~ 781 */
  if (id >= 701 && id <= 781) {
    switch (id) {
      case 701:
        return "박무";

      case 711:
        return "연무";

      case 721:
        return "실안개";

      case 731:
      case 751:
      case 761:
        return "먼지";

      case 741:
        return "안개";

      case 762:
        return "화산재";

      case 771:
        return "돌풍";

      case 781:
        return "토네이도";

      default:
        return "흐린 대기";
    }
  }

  /* 맑음 */
  if (id === 800) {
    return "맑음";
  }

  /* 구름 */
  if (id === 801) {
    return "구름 조금";
  }

  if (id === 802) {
    return "구름 많음";
  }

  if (id === 803) {
    return "대체로 흐림";
  }

  if (id === 804) {
    return "흐림";
  }

  /*
    혹시 새로운 코드가 추가되었을 경우
    main 값을 기준으로 한 번 더 fallback 합니다.
  */
  switch (weather.main) {
    case "Clear":
      return "맑음";

    case "Clouds":
      return "흐림";

    case "Rain":
      return "비";

    case "Drizzle":
      return "이슬비";

    case "Thunderstorm":
      return "천둥번개";

    case "Snow":
      return "눈";

    case "Mist":
    case "Fog":
      return "안개";

    default:
      return "날씨 정보";
  }
}
/* ==================================================
   날씨에 따른 Hero Theme
================================================== */

function applyWeatherTheme(mainWeather = "") {
  heroCard.classList.remove(
    "weather-clear",
    "weather-clouds",
    "weather-rain",
    "weather-drizzle",
    "weather-snow",
    "weather-thunderstorm"
  );

  const normalized = String(mainWeather).toLowerCase();

  if (normalized === "clear") {
    heroCard.classList.add("weather-clear");
  } else if (normalized === "clouds") {
    heroCard.classList.add("weather-clouds");
  } else if (normalized === "rain") {
    heroCard.classList.add("weather-rain");
  } else if (normalized === "drizzle") {
    heroCard.classList.add("weather-drizzle");
  } else if (normalized === "snow") {
    heroCard.classList.add("weather-snow");
  } else if (normalized === "thunderstorm") {
    heroCard.classList.add("weather-thunderstorm");
  }
}

/* ==================================================
   HTTP / Error
================================================== */

async function parseResponse(response) {
  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error("INVALID_JSON");
  }

  if (!response.ok) {
    const error = new Error(
      data?.message || `HTTP_${response.status}`
    );

    error.status = response.status;
    throw error;
  }

  return data;
}

function getFriendlyErrorMessage(error) {
  if (error.message === "CITY_NOT_FOUND") {
    return "검색한 도시를 찾지 못했습니다.";
  }

  if (error.status === 401) {
    return "API Key가 올바르지 않거나 아직 활성화되지 않았습니다.";
  }

  if (error.status === 404) {
    return "요청한 날씨 정보를 찾지 못했습니다.";
  }

  if (error.status === 429) {
    return "API 요청 횟수가 제한을 초과했습니다. 잠시 후 다시 시도해 주세요.";
  }

  if (
    error instanceof TypeError &&
    String(error.message).toLowerCase().includes("fetch")
  ) {
    return "네트워크 연결을 확인해 주세요.";
  }

  return "날씨 정보를 불러오는 중 문제가 발생했습니다.";
}

/* ==================================================
   Status UI
================================================== */

function showLoading(message) {
  statusCard.classList.remove("is-hidden");
  loader.classList.remove("is-hidden");
  statusMessage.textContent = message;
}

function hideLoading() {
  loader.classList.add("is-hidden");
}

function showStatus(message, loading = false) {
  statusCard.classList.remove("is-hidden");
  statusMessage.textContent = message;

  loader.classList.toggle("is-hidden", !loading);
}

function hideStatus() {
  statusCard.classList.add("is-hidden");
  loader.classList.add("is-hidden");
}

/* ==================================================
   Storage / Utility
================================================== */

function getStoredArray(key) {
  try {
    const data = JSON.parse(localStorage.getItem(key) || "[]");
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function isSameCoordinates(a, b) {
  return (
    Number(a.lat).toFixed(3) === Number(b.lat).toFixed(3) &&
    Number(a.lon).toFixed(3) === Number(b.lon).toFixed(3)
  );
}

function roundAirValue(value) {
  return value == null ? "-" : Math.round(Number(value));
}

function isApiKeyReady() {
  return (
    API_KEY &&
    API_KEY !== "YOUR_OPENWEATHER_API_KEY"
  );
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
