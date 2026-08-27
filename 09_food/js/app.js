"use strict";

/* =========================================================
   부산맛집 가이드
   - Vanilla JavaScript
   - 부산맛집정보 OpenAPI
   - Kakao Maps JavaScript API
========================================================= */

const CONFIG = window.APP_CONFIG ?? {};

const ENDPOINTS = {
  ko: "getFoodKr",
  en: "getFoodEn",
  ja: "getFoodJa",
  zhs: "getFoodZhs",
  zht: "getFoodZht"
};

const STORAGE_KEYS = {
  favorites: "busanFoodFavorites",
  recent: "busanFoodRecent",
  language: "busanFoodLanguage"
};

const state = {
  language: localStorage.getItem(STORAGE_KEYS.language) || "ko",
  pageNo: 1,
  totalCount: 0,
  allRestaurants: [],
  visibleRestaurants: [],
  searchKeyword: "",
  district: "전체",
  currentPage: "home",
  currentRestaurant: null,
  favorites: loadStorage(STORAGE_KEYS.favorites, []),
  recent: loadStorage(STORAGE_KEYS.recent, []),
  map: null,
  mapMarkers: [],
  mapInfoWindow: null,
  recommendationIndex: 0,

  // 홈에서는 최초 8개 카드만 보여주고,
  // "전체보기" 클릭 시 현재까지 불러온 모든 맛집을 표시합니다.
  homeExpanded: false,
  homeInitialCount: 8,

  isLoading: false
};

const dom = {};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  cacheDom();
  bindEvents();

  dom.languageSelect.value = state.language;

  renderStoredLists();
  renderLoadingState();

  await fetchRestaurants({ reset: true });

  renderAll();
  loadKakaoMapsSdk();
}

/* =========================================================
   DOM
========================================================= */

function cacheDom() {
  dom.pages = [...document.querySelectorAll(".page")];
  dom.navItems = [...document.querySelectorAll(".nav-item")];

  dom.brandHomeButton = document.getElementById("brandHomeButton");
  dom.languageSelect = document.getElementById("languageSelect");

  dom.homeSearchForm = document.getElementById("homeSearchForm");
  dom.homeSearchInput = document.getElementById("homeSearchInput");
  dom.findSearchForm = document.getElementById("findSearchForm");
  dom.findSearchInput = document.getElementById("findSearchInput");

  dom.homeDistrictChips = document.getElementById("homeDistrictChips");
  dom.findDistrictChips = document.getElementById("findDistrictChips");
  dom.showAllDistrictsButton = document.getElementById("showAllDistrictsButton");
  dom.resetFilterButton = document.getElementById("resetFilterButton");

  dom.recommendationArea = document.getElementById("recommendationArea");
  dom.refreshRecommendationButton = document.getElementById("refreshRecommendationButton");

  // 홈 맛집 목록
  dom.homeRestaurantList = document.getElementById("homeRestaurantList");
  dom.homeShowAllButton = document.getElementById("homeShowAllButton");
  dom.homeLoadMoreWrap = document.getElementById("homeLoadMoreWrap");
  dom.homeLoadMoreButton = document.getElementById("homeLoadMoreButton");
  dom.homeRestaurantStatus = document.getElementById("homeRestaurantStatus");
  dom.homeDataCount = document.getElementById("homeDataCount");

  dom.restaurantList = document.getElementById("restaurantList");
  dom.resultCount = document.getElementById("resultCount");
  dom.loadMoreButton = document.getElementById("loadMoreButton");

  dom.recentHomeList = document.getElementById("recentHomeList");
  dom.goRecentButton = document.getElementById("goRecentButton");
  dom.favoriteList = document.getElementById("favoriteList");
  dom.favoriteCount = document.getElementById("favoriteCount");
  dom.recentList = document.getElementById("recentList");
  dom.clearRecentButton = document.getElementById("clearRecentButton");
  dom.focusLanguageButton = document.getElementById("focusLanguageButton");

  dom.kakaoMap = document.getElementById("kakaoMap");
  dom.mapNotice = document.getElementById("mapNotice");
  dom.mapRestaurantList = document.getElementById("mapRestaurantList");
  dom.myLocationButton = document.getElementById("myLocationButton");

  dom.detailModal = document.getElementById("detailModal");
  dom.detailContent = document.getElementById("detailContent");
  dom.closeDetailButton = document.getElementById("closeDetailButton");
  dom.detailFavoriteButton = document.getElementById("detailFavoriteButton");
  dom.shareButton = document.getElementById("shareButton");

  dom.toast = document.getElementById("toast");
}

/* =========================================================
   Event
========================================================= */

function bindEvents() {
  dom.navItems.forEach((button) => {
    button.addEventListener("click", () => navigate(button.dataset.target));
  });

  dom.brandHomeButton.addEventListener("click", () => navigate("home"));

  dom.languageSelect.addEventListener("change", async (event) => {
    state.language = event.target.value;
    localStorage.setItem(STORAGE_KEYS.language, state.language);

    state.pageNo = 1;
    state.allRestaurants = [];
    state.visibleRestaurants = [];
    state.searchKeyword = "";
    state.district = "전체";
    state.homeExpanded = false;

    renderLoadingState();
    await fetchRestaurants({ reset: true });
    renderAll();
    refreshMapMarkers();
  });

  dom.homeSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    applySearch(dom.homeSearchInput.value);
  });

  dom.findSearchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    applySearch(dom.findSearchInput.value);
  });

  dom.showAllDistrictsButton.addEventListener("click", () => navigate("find"));

  dom.resetFilterButton.addEventListener("click", () => {
    state.searchKeyword = "";
    state.district = "전체";
    dom.findSearchInput.value = "";
    filterRestaurants();
    renderFindPage();
  });

  dom.refreshRecommendationButton.addEventListener("click", () => {
    if (!state.allRestaurants.length) return;
    state.recommendationIndex =
      (state.recommendationIndex + 1) % state.allRestaurants.length;
    renderRecommendation();
  });

  /*
    홈 "전체보기"
    - 최초: 8개
    - 클릭: 현재 API에서 불러온 모든 맛집
    - 다시 클릭: 8개로 접기
  */
  dom.homeShowAllButton.addEventListener("click", () => {
    state.homeExpanded = !state.homeExpanded;
    renderHomeRestaurants();

    // 펼칠 때 사용자가 목록 시작 위치를 놓치지 않도록 섹션 상단을 유지합니다.
    if (state.homeExpanded) {
      document
        .getElementById("homeRestaurantsSection")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  /*
    홈 "맛집 더보기"
    현재 pageNo를 기준으로 다음 API 페이지를 추가 호출합니다.
    기존 데이터는 유지하고 새 데이터만 뒤에 합칩니다.
  */
  dom.homeLoadMoreButton.addEventListener("click", async () => {
    await fetchRestaurants({ reset: false });
    filterRestaurants();
    renderAll();
  });

  dom.loadMoreButton.addEventListener("click", async () => {
    await fetchRestaurants({ reset: false });
    filterRestaurants();
    renderAll();
  });

  dom.goRecentButton.addEventListener("click", () => {
    navigate("my");
    setTimeout(() => {
      dom.recentList.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  });

  dom.clearRecentButton.addEventListener("click", () => {
    state.recent = [];
    saveStorage(STORAGE_KEYS.recent, state.recent);
    renderStoredLists();
    showToast("최근 본 맛집 기록을 삭제했습니다.");
  });

  dom.focusLanguageButton.addEventListener("click", () => {
    dom.languageSelect.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  dom.closeDetailButton.addEventListener("click", closeDetail);
  dom.detailModal.addEventListener("click", (event) => {
    if (event.target === dom.detailModal) closeDetail();
  });

  dom.detailFavoriteButton.addEventListener("click", () => {
    if (state.currentRestaurant) toggleFavorite(state.currentRestaurant);
  });

  dom.shareButton.addEventListener("click", shareCurrentRestaurant);
  dom.myLocationButton.addEventListener("click", moveToMyLocation);

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !dom.detailModal.hidden) {
      closeDetail();
    }
  });
}

/* =========================================================
   Navigation
========================================================= */

function navigate(pageName) {
  state.currentPage = pageName;

  dom.pages.forEach((page) => {
    page.classList.toggle("is-active", page.dataset.page === pageName);
  });

  dom.navItems.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.target === pageName);
  });

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (pageName === "map") {
    setTimeout(() => {
      if (state.map && window.kakao?.maps) {
        state.map.relayout();
        fitMapToRestaurants();
      }
    }, 80);
  }

  if (pageName === "my") {
    renderStoredLists();
  }
}

/* =========================================================
   부산맛집 OpenAPI
========================================================= */

async function fetchRestaurants({ reset }) {
  if (state.isLoading) return;

  if (reset) {
    state.pageNo = 1;
    state.allRestaurants = [];
    state.totalCount = 0;
  }

  if (
    !reset &&
    state.totalCount > 0 &&
    state.allRestaurants.length >= state.totalCount
  ) {
    showToast("마지막 데이터까지 불러왔습니다.");
    return;
  }

  if (!isFoodApiKeyConfigured()) {
    console.warn(
      "[부산맛집 API] FOOD_API_KEY가 설정되지 않았습니다. js/config.js에 인증키를 입력하세요."
    );
    showApiSetupState();
    return;
  }

  state.isLoading = true;
  updateLoadMoreButton();

  const endpoint = ENDPOINTS[state.language] || ENDPOINTS.ko;

  /*
    GitHub Pages 최종 배포용 직접 호출 방식.
    Encoding/Decoding 인증키를 normalizeServiceKey()에서 정규화한 뒤
    URLSearchParams가 URL 인코딩을 정확히 한 번만 수행합니다.
  */
  const params = new URLSearchParams({
    serviceKey: normalizeServiceKey(CONFIG.FOOD_API_KEY),
    numOfRows: String(CONFIG.PAGE_SIZE || 20),
    pageNo: String(state.pageNo),
    resultType: "json"
  });

  const apiUrl =
    `${CONFIG.FOOD_API_BASE_URL}/${endpoint}?${params.toString()}`;

  console.log(
    "[부산맛집 API] 요청:",
    `${CONFIG.FOOD_API_BASE_URL}/${endpoint}` +
      `?serviceKey=HIDDEN_KEY` +
      `&numOfRows=${CONFIG.PAGE_SIZE || 20}` +
      `&pageNo=${state.pageNo}` +
      `&resultType=json`
  );

  try {
    /*
      이 fetch()가 실행되면 Chrome DevTools > Network > Fetch/XHR에
      getFoodKr / FoodService 요청이 반드시 표시됩니다.
    */
    const response = await fetch(apiUrl);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      console.error(
        `[부산맛집 API] HTTP ${response.status} 응답 본문:`,
        errorText
      );
      throw new Error(
        `HTTP ${response.status}${errorText ? ` - ${errorText.slice(0, 180)}` : ""}`
      );
    }

    const data = await response.json();

    // PRD 요구사항: 서버 응답을 먼저 console.log()로 확인
    console.log("[부산맛집 API] 원본 응답:", data);

    const resultCode = extractResultCode(data);

    if (resultCode && resultCode !== "00") {
      const message = extractResultMessage(data);
      throw new Error(`OpenAPI 오류 ${resultCode}: ${message || "알 수 없는 오류"}`);
    }

    const normalized = normalizeApiResponse(data);

    console.log("[부산맛집 API] 정규화 데이터:", normalized);

    const unique = mergeUniqueRestaurants(state.allRestaurants, normalized.items);
    state.allRestaurants = unique;
    state.totalCount = normalized.totalCount || state.totalCount || unique.length;

    state.pageNo += 1;
    filterRestaurants();
  } catch (error) {
    console.error("[부산맛집 API] 호출 실패:", error);

    if (error instanceof TypeError) {
      console.error(
        "[진단] 브라우저가 응답을 읽지 못했습니다. Network 탭에서 요청 URL, HTTPS 상태, 응답 헤더와 CORS 여부를 확인하세요."
      );
    }

    showApiErrorState(error);
  } finally {
    state.isLoading = false;
    updateLoadMoreButton();
  }
}

function normalizeApiResponse(data) {
  /*
    공공데이터 API는 서비스/버전에 따라 JSON 래핑 구조가 달라질 수 있으므로
    문서에 명시된 item/numOfRows/pageNo/totalCount 필드를 기준으로
    여러 일반적인 구조를 안전하게 탐색합니다.
  */

  const body =
    data?.response?.body ??
    data?.body ??
    data?.getFoodKr ??
    data?.getFoodEn ??
    data?.getFoodJa ??
    data?.getFoodZhs ??
    data?.getFoodZht ??
    data;

  const rawItems =
    body?.items?.item ??
    body?.items ??
    body?.item ??
    data?.response?.body?.items?.item ??
    [];

  const itemsArray = Array.isArray(rawItems)
    ? rawItems
    : rawItems && typeof rawItems === "object"
      ? [rawItems]
      : [];

  return {
    items: itemsArray
      .map(normalizeRestaurant)
      .filter((item) => item.id || item.name),
    totalCount: Number(
      body?.totalCount ??
      data?.response?.body?.totalCount ??
      itemsArray.length
    )
  };
}

function normalizeRestaurant(item) {
  return {
    id: String(item.UC_SEQ ?? item.ucSeq ?? item.id ?? ""),
    name: cleanText(item.MAIN_TITLE ?? item.mainTitle ?? item.PLACE ?? ""),
    district: cleanText(item.GUGUN_NM ?? item.gugunNm ?? ""),
    lat: toNumber(item.LAT ?? item.lat),
    lng: toNumber(item.LNG ?? item.lng),
    place: cleanText(item.PLACE ?? item.place ?? ""),
    title: cleanText(item.TITLE ?? item.title ?? ""),
    subtitle: cleanText(item.SUBTITLE ?? item.subtitle ?? ""),
    address1: cleanText(item.ADDR1 ?? item.addr1 ?? ""),
    address2: cleanText(item.ADDR2 ?? item.addr2 ?? ""),
    telephone: cleanText(item.CNTCT_TEL ?? item.cntctTel ?? ""),
    homepage: cleanText(item.HOMEPAGE_URL ?? item.homepageUrl ?? ""),
    hours: cleanText(
      item.USAGE_DAY_WEEK_AND_TIME ??
      item.usageDayWeekAndTime ??
      ""
    ),
    menu: cleanText(item.RPRSNTV_MENU ?? item.rprsntvMenu ?? ""),
    image: cleanText(item.MAIN_IMG_NORMAL ?? item.mainImgNormal ?? ""),
    thumb: cleanText(item.MAIN_IMG_THUMB ?? item.mainImgThumb ?? ""),
    description: cleanText(item.ITEMCNTNTS ?? item.itemcntnts ?? "")
  };
}

function extractResultCode(data) {
  return String(
    data?.response?.header?.resultCode ??
    data?.header?.resultCode ??
    data?.resultCode ??
    ""
  ).trim();
}

function extractResultMessage(data) {
  return String(
    data?.response?.header?.resultMsg ??
    data?.header?.resultMsg ??
    data?.resultMsg ??
    ""
  ).trim();
}

function isFoodApiKeyConfigured() {
  return Boolean(
    CONFIG.FOOD_API_KEY &&
    CONFIG.FOOD_API_KEY !== "YOUR_DATA_GO_KR_SERVICE_KEY"
  );
}

/*
  공공데이터포털 인증키 정규화

  Encoding 키 예:
  abc%2Bdef%2Fghi%3D%3D

  Decoding 키 예:
  abc+def/ghi==

  Encoding 키는 먼저 decodeURIComponent()로 원래 문자열로 되돌리고,
  URLSearchParams가 최종 요청 URL에서 한 번만 인코딩합니다.
*/
function normalizeServiceKey(key) {
  const value = String(key || "").trim();

  try {
    return decodeURIComponent(value);
  } catch (error) {
    return value;
  }
}

function mergeUniqueRestaurants(existing, incoming) {
  const map = new Map();

  [...existing, ...incoming].forEach((item) => {
    const key = item.id || `${item.name}-${item.address1}`;
    if (key) map.set(key, item);
  });

  return [...map.values()];
}

/* =========================================================
   Search / Filter
========================================================= */

function applySearch(keyword) {
  state.searchKeyword = cleanText(keyword);
  state.district = "전체";
  dom.findSearchInput.value = state.searchKeyword;

  filterRestaurants();
  renderFindPage();
  navigate("find");
}

function filterRestaurants() {
  const keyword = state.searchKeyword.toLowerCase();

  state.visibleRestaurants = state.allRestaurants.filter((restaurant) => {
    const matchesDistrict =
      state.district === "전체" ||
      restaurant.district === state.district;

    const searchable = [
      restaurant.name,
      restaurant.district,
      restaurant.menu,
      restaurant.title,
      restaurant.address1
    ]
      .join(" ")
      .toLowerCase();

    const matchesKeyword = !keyword || searchable.includes(keyword);

    return matchesDistrict && matchesKeyword;
  });
}

function getDistricts() {
  return [
    "전체",
    ...new Set(
      state.allRestaurants
        .map((item) => item.district)
        .filter(Boolean)
    )
  ];
}

function selectDistrict(district) {
  state.district = district;
  filterRestaurants();
  renderDistrictChips();
  renderFindPage();
  navigate("find");
}

/* =========================================================
   Render
========================================================= */

function renderAll() {
  renderDistrictChips();
  renderRecommendation();
  renderHomeRestaurants();
  renderFindPage();
  renderStoredLists();
  renderMapList();
  updateLoadMoreButton();
}

function renderLoadingState() {
  dom.restaurantList.innerHTML = createSkeletonCards(6);
  dom.recommendationArea.innerHTML = createSkeletonCards(1, true);

  // 홈 첫 로딩에서도 8개 카드가 들어올 위치를 바로 보여줍니다.
  dom.homeRestaurantList.innerHTML = createSkeletonCards(state.homeInitialCount);
  dom.homeLoadMoreWrap.hidden = true;
  dom.homeRestaurantStatus.textContent = "맛집 정보를 불러오는 중입니다.";
  dom.homeDataCount.textContent = "0 / 불러오는 중";
}

function renderDistrictChips() {
  const districts = getDistricts();

  dom.homeDistrictChips.innerHTML = districts
    .filter((district) => district !== "전체")
    .slice(0, 8)
    .map((district) => chipTemplate(district, false))
    .join("");

  dom.findDistrictChips.innerHTML = districts
    .map((district) => chipTemplate(district, district === state.district))
    .join("");

  document.querySelectorAll("[data-district]").forEach((button) => {
    button.addEventListener("click", () => {
      selectDistrict(button.dataset.district);
    });
  });
}

function chipTemplate(district, active) {
  return `
    <button
      class="chip ${active ? "is-active" : ""}"
      type="button"
      data-district="${escapeHtml(district)}"
    >
      ${escapeHtml(district)}
    </button>
  `;
}

function renderRecommendation() {
  if (!state.allRestaurants.length) {
    dom.recommendationArea.innerHTML = emptyState(
      "추천할 맛집 데이터가 없습니다.",
      "API 키 설정 또는 데이터 호출 상태를 확인해주세요."
    );
    return;
  }

  const restaurant =
    state.allRestaurants[
      state.recommendationIndex % state.allRestaurants.length
    ];

  dom.recommendationArea.innerHTML = `
    <article class="recommendation-card">
      ${imageBlock(restaurant, "recommendation-image")}
      <div class="recommendation-content">
        <span class="restaurant-district">${escapeHtml(restaurant.district || "부산")}</span>
        <h3>${escapeHtml(restaurant.name || "이름 정보 없음")}</h3>
        <p class="recommendation-title">
          ${escapeHtml(restaurant.title || restaurant.description || "부산의 맛집 정보를 확인해보세요.")}
        </p>
        <div class="info-row">
          <span>대표메뉴</span>
          <strong>${escapeHtml(restaurant.menu || "정보 없음")}</strong>
        </div>
        <div class="info-row">
          <span>운영시간</span>
          <strong>${escapeHtml(restaurant.hours || "정보 없음")}</strong>
        </div>
        <button class="primary-button detail-open-button" type="button" data-id="${escapeHtml(restaurant.id)}">
          상세보기
        </button>
      </div>
    </article>
  `;

  bindRestaurantActionButtons(dom.recommendationArea);
}

/*
  =========================================================
  홈 맛집 목록
  =========================================================

  기본 상태:
  - 첫 API 호출에서 받은 데이터 중 8개 표시

  전체보기 상태:
  - 현재 allRestaurants에 누적된 모든 카드 표시
  - 아직 API에 다음 페이지가 남아 있으면 하단 "맛집 더보기" 표시

  "맛집 더보기":
  - API를 다음 pageNo로 한 번 추가 호출
  - 새 데이터를 allRestaurants 뒤에 합침
*/
function renderHomeRestaurants() {
  const all = state.allRestaurants;

  /*
    API 응답의 totalCount를 전체 데이터 수로 사용합니다.
    예: 20 / 200
    → 현재 브라우저에 20개를 누적 로딩했고, API 전체 데이터는 200개라는 의미입니다.
  */
  const totalLabel =
    state.totalCount > 0 ? state.totalCount : all.length;

  dom.homeDataCount.textContent = `${all.length} / ${totalLabel}`;

  if (!all.length) {
    dom.homeRestaurantList.innerHTML = emptyState(
      "표시할 맛집이 없습니다.",
      "API 데이터 호출 상태를 확인해주세요."
    );
    dom.homeLoadMoreWrap.hidden = true;
    dom.homeShowAllButton.textContent = "전체보기";
    dom.homeShowAllButton.setAttribute("aria-expanded", "false");
    dom.homeRestaurantStatus.textContent = "불러온 맛집이 없습니다.";
    dom.homeDataCount.textContent =
      `0 / ${state.totalCount > 0 ? state.totalCount : 0}`;
    return;
  }

  const list = state.homeExpanded
    ? all
    : all.slice(0, state.homeInitialCount);

  dom.homeRestaurantList.innerHTML =
    list.map(restaurantCardTemplate).join("");

  bindRestaurantActionButtons(dom.homeRestaurantList);

  dom.homeShowAllButton.textContent =
    state.homeExpanded ? "접기" : "전체보기";

  dom.homeShowAllButton.setAttribute(
    "aria-expanded",
    String(state.homeExpanded)
  );

  if (state.homeExpanded) {
    dom.homeRestaurantStatus.textContent =
      `현재 ${all.length}개의 맛집을 불러왔습니다.`;

    const hasMore =
      state.totalCount === 0 ||
      all.length < state.totalCount;

    dom.homeLoadMoreWrap.hidden = !hasMore;
  } else {
    const visibleCount = Math.min(state.homeInitialCount, all.length);

    dom.homeRestaurantStatus.textContent =
      `${visibleCount}개의 맛집을 먼저 보여드립니다. 전체보기를 누르면 현재 불러온 맛집을 모두 확인할 수 있습니다.`;

    dom.homeLoadMoreWrap.hidden = true;
  }
}

function renderFindPage() {
  const list = state.visibleRestaurants;
  dom.resultCount.textContent = String(list.length);

  if (!list.length) {
    dom.restaurantList.innerHTML = emptyState(
      "검색 결과가 없습니다.",
      "다른 맛집 이름이나 지역을 검색해보세요."
    );
    return;
  }

  dom.restaurantList.innerHTML = list.map(restaurantCardTemplate).join("");
  bindRestaurantActionButtons(dom.restaurantList);
}

function restaurantCardTemplate(restaurant) {
  const favorite = isFavorite(restaurant.id);

  return `
    <article class="restaurant-card" data-card-id="${escapeHtml(restaurant.id)}">
      <button class="card-main detail-open-button" type="button" data-id="${escapeHtml(restaurant.id)}">
        ${imageBlock(restaurant, "card-image")}
        <div class="card-content">
          <div class="card-title-row">
            <div>
              <span class="restaurant-district">${escapeHtml(restaurant.district || "부산")}</span>
              <h3>${escapeHtml(restaurant.name || "이름 정보 없음")}</h3>
            </div>
          </div>

          <p class="card-menu">
            ${escapeHtml(restaurant.menu || restaurant.title || "대표메뉴 정보 없음")}
          </p>

          <div class="card-meta">
            <span>${escapeHtml(restaurant.hours || "운영시간 정보 없음")}</span>
          </div>
        </div>
      </button>

      <button
        class="favorite-button ${favorite ? "is-active" : ""}"
        type="button"
        data-favorite-id="${escapeHtml(restaurant.id)}"
        aria-label="${favorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}"
      >
        ${favorite ? "♥" : "♡"}
      </button>
    </article>
  `;
}

function imageBlock(restaurant, className) {
  const imageUrl = resolveImageUrl(restaurant.thumb || restaurant.image);

  if (!imageUrl) {
    return `
      <div class="${className} image-placeholder" aria-label="등록된 이미지 없음">
        <span>BUSAN<br>FOOD</span>
      </div>
    `;
  }

  return `
    <div class="${className}">
      <img
        src="${escapeHtml(imageUrl)}"
        alt="${escapeHtml(restaurant.name || "부산 맛집")} 이미지"
        loading="lazy"
        onerror="this.parentElement.classList.add('image-placeholder'); this.remove();"
      />
    </div>
  `;
}

function renderStoredLists() {
  dom.favoriteCount.textContent = String(state.favorites.length);

  dom.favoriteList.innerHTML = state.favorites.length
    ? state.favorites.map(restaurantCardTemplate).join("")
    : emptyState("저장한 맛집이 없습니다.", "관심 있는 맛집의 ♡ 버튼을 눌러 저장해보세요.");

  dom.recentList.innerHTML = state.recent.length
    ? state.recent.map(restaurantCardTemplate).join("")
    : emptyState("최근 본 맛집이 없습니다.", "맛집 상세 페이지를 열면 여기에 기록됩니다.");

  dom.recentHomeList.innerHTML = state.recent.length
    ? state.recent.slice(0, 5).map(compactCardTemplate).join("")
    : emptyState("최근 본 맛집이 없습니다.", "맛집을 살펴보면 최근 목록에 저장됩니다.");

  bindRestaurantActionButtons(dom.favoriteList);
  bindRestaurantActionButtons(dom.recentList);
  bindRestaurantActionButtons(dom.recentHomeList);
}

function compactCardTemplate(restaurant) {
  return `
    <button class="compact-card detail-open-button" type="button" data-id="${escapeHtml(restaurant.id)}">
      ${imageBlock(restaurant, "compact-image")}
      <span class="compact-content">
        <strong>${escapeHtml(restaurant.name || "이름 정보 없음")}</strong>
        <small>${escapeHtml(restaurant.district || "부산")}</small>
      </span>
    </button>
  `;
}

function emptyState(title, description) {
  return `
    <div class="empty-state">
      <div class="empty-icon" aria-hidden="true">○</div>
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(description)}</p>
    </div>
  `;
}

function createSkeletonCards(count, recommendation = false) {
  if (recommendation) {
    return `
      <div class="skeleton recommendation-skeleton">
        <div class="skeleton-block"></div>
        <div class="skeleton-lines">
          <span></span><span></span><span></span><span></span>
        </div>
      </div>
    `;
  }

  return Array.from({ length: count }, () => `
    <div class="skeleton skeleton-card">
      <div class="skeleton-block"></div>
      <div class="skeleton-lines">
        <span></span><span></span><span></span>
      </div>
    </div>
  `).join("");
}

/* =========================================================
   Detail
========================================================= */

function bindRestaurantActionButtons(container) {
  container.querySelectorAll(".detail-open-button").forEach((button) => {
    button.addEventListener("click", () => {
      const restaurant = findRestaurantAnywhere(button.dataset.id);
      if (restaurant) openDetail(restaurant);
    });
  });

  container.querySelectorAll("[data-favorite-id]").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const restaurant = findRestaurantAnywhere(button.dataset.favoriteId);
      if (restaurant) toggleFavorite(restaurant);
    });
  });
}

function openDetail(restaurant) {
  state.currentRestaurant = restaurant;
  addRecent(restaurant);

  dom.detailContent.innerHTML = detailTemplate(restaurant);
  updateDetailFavoriteButton();

  dom.detailModal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeDetail() {
  dom.detailModal.hidden = true;
  document.body.classList.remove("modal-open");
  state.currentRestaurant = null;
}

function detailTemplate(restaurant) {
  const address = [restaurant.address1, restaurant.address2]
    .filter(Boolean)
    .join(" ");

  const telButton = restaurant.telephone
    ? `<a class="action-link" href="tel:${escapeHtml(restaurant.telephone.replace(/[^\d+]/g, ""))}">전화하기</a>`
    : "";

  const homepageButton = isSafeHttpUrl(restaurant.homepage)
    ? `<a class="action-link" href="${escapeHtml(restaurant.homepage)}" target="_blank" rel="noopener noreferrer">홈페이지</a>`
    : "";

  const kakaoDirectionButton =
    restaurant.lat && restaurant.lng
      ? `<a class="action-link" href="${createKakaoMapUrl(restaurant)}" target="_blank" rel="noopener noreferrer">길찾기</a>`
      : "";

  return `
    ${imageBlock(restaurant, "detail-image")}

    <div class="detail-body">
      <span class="restaurant-district">${escapeHtml(restaurant.district || "부산")}</span>
      <h2 id="detailTitle">${escapeHtml(restaurant.name || "이름 정보 없음")}</h2>
      <p class="detail-lead">${escapeHtml(restaurant.title || restaurant.subtitle || "")}</p>

      <div class="detail-action-links">
        ${telButton}
        ${kakaoDirectionButton}
        ${homepageButton}
      </div>

      <dl class="detail-info-list">
        <div>
          <dt>대표메뉴</dt>
          <dd>${escapeHtml(restaurant.menu || "정보 없음")}</dd>
        </div>
        <div>
          <dt>운영시간</dt>
          <dd>${escapeHtml(restaurant.hours || "정보 없음")}</dd>
        </div>
        <div>
          <dt>주소</dt>
          <dd>${escapeHtml(address || "정보 없음")}</dd>
        </div>
        <div>
          <dt>전화번호</dt>
          <dd>${escapeHtml(restaurant.telephone || "정보 없음")}</dd>
        </div>
      </dl>

      <section class="detail-description">
        <h3>맛집 소개</h3>
        <p>${escapeHtml(restaurant.description || "상세 소개 정보가 없습니다.")}</p>
      </section>

      <section class="detail-location">
        <div class="section-heading">
          <div>
            <p class="section-kicker">LOCATION</p>
            <h3>위치</h3>
          </div>
        </div>
        <div class="detail-location-box">
          <strong>${escapeHtml(address || restaurant.district || "부산")}</strong>
          ${
            restaurant.lat && restaurant.lng
              ? `<button class="outline-button" type="button" onclick="window.BUSAN_FOOD_APP.openOnMap('${escapeJs(restaurant.id)}')">카카오맵에서 위치 보기</button>`
              : `<span class="muted">좌표 정보 없음</span>`
          }
        </div>
      </section>
    </div>
  `;
}

function addRecent(restaurant) {
  const withoutCurrent = state.recent.filter((item) => item.id !== restaurant.id);
  state.recent = [restaurant, ...withoutCurrent].slice(
    0,
    Number(CONFIG.RECENT_LIMIT || 10)
  );

  saveStorage(STORAGE_KEYS.recent, state.recent);
  renderStoredLists();
}

function toggleFavorite(restaurant) {
  if (isFavorite(restaurant.id)) {
    state.favorites = state.favorites.filter((item) => item.id !== restaurant.id);
    showToast("즐겨찾기에서 삭제했습니다.");
  } else {
    state.favorites = [restaurant, ...state.favorites];
    showToast("즐겨찾기에 저장했습니다.");
  }

  saveStorage(STORAGE_KEYS.favorites, state.favorites);

  renderStoredLists();
  renderFindPage();
  updateDetailFavoriteButton();
}

function isFavorite(id) {
  return state.favorites.some((item) => item.id === id);
}

function updateDetailFavoriteButton() {
  if (!state.currentRestaurant) return;

  const favorite = isFavorite(state.currentRestaurant.id);
  dom.detailFavoriteButton.textContent = favorite ? "♥" : "♡";
  dom.detailFavoriteButton.classList.toggle("is-active", favorite);
  dom.detailFavoriteButton.setAttribute(
    "aria-label",
    favorite ? "즐겨찾기 해제" : "즐겨찾기 추가"
  );
}

async function shareCurrentRestaurant() {
  const restaurant = state.currentRestaurant;
  if (!restaurant) return;

  const address = [restaurant.address1, restaurant.address2]
    .filter(Boolean)
    .join(" ");

  const shareData = {
    title: restaurant.name || "부산 맛집",
    text: `${restaurant.name || "부산 맛집"}${address ? ` - ${address}` : ""}`,
    url: window.location.href
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else {
      await navigator.clipboard.writeText(
        `${shareData.text}\n${shareData.url}`
      );
      showToast("맛집 정보를 클립보드에 복사했습니다.");
    }
  } catch (error) {
    if (error?.name !== "AbortError") {
      console.error("공유 실패:", error);
      showToast("공유 기능을 사용할 수 없습니다.");
    }
  }
}

/* =========================================================
   Kakao Map
========================================================= */

function loadKakaoMapsSdk() {
  if (
    !CONFIG.KAKAO_JAVASCRIPT_KEY ||
    CONFIG.KAKAO_JAVASCRIPT_KEY === "YOUR_KAKAO_JAVASCRIPT_KEY"
  ) {
    showMapNotice(
      "Kakao JavaScript Key가 설정되지 않았습니다. js/config.js에서 키를 입력한 뒤, Kakao Developers에 현재 실행 도메인을 등록해주세요."
    );
    return;
  }

  if (window.kakao?.maps) {
    window.kakao.maps.load(initKakaoMap);
    return;
  }

  const script = document.createElement("script");
  script.src =
    `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(CONFIG.KAKAO_JAVASCRIPT_KEY)}&autoload=false`;
  script.async = true;

  script.onload = () => {
    if (!window.kakao?.maps) {
      showMapNotice("Kakao 지도 SDK를 불러오지 못했습니다.");
      return;
    }

    window.kakao.maps.load(initKakaoMap);
  };

  script.onerror = () => {
    showMapNotice(
      "Kakao 지도 SDK 로딩에 실패했습니다. JavaScript Key와 등록 도메인을 확인해주세요."
    );
  };

  document.head.appendChild(script);
}

function initKakaoMap() {
  if (!window.kakao?.maps) return;

  const center = new kakao.maps.LatLng(35.1795543, 129.0756416);

  state.map = new kakao.maps.Map(dom.kakaoMap, {
    center,
    level: 8
  });

  state.mapInfoWindow = new kakao.maps.InfoWindow({ zIndex: 10 });

  const mapTypeControl = new kakao.maps.MapTypeControl();
  state.map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT);

  const zoomControl = new kakao.maps.ZoomControl();
  state.map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT);

  hideMapNotice();
  refreshMapMarkers();
}

function refreshMapMarkers() {
  if (!state.map || !window.kakao?.maps) return;

  state.mapMarkers.forEach((marker) => marker.setMap(null));
  state.mapMarkers = [];

  const restaurants = state.allRestaurants.filter(
    (item) => Number.isFinite(item.lat) && Number.isFinite(item.lng)
  );

  restaurants.forEach((restaurant) => {
    const position = new kakao.maps.LatLng(restaurant.lat, restaurant.lng);

    const marker = new kakao.maps.Marker({
      map: state.map,
      position,
      title: restaurant.name
    });

    kakao.maps.event.addListener(marker, "click", () => {
      const content = document.createElement("div");
      content.className = "map-info-window";
      content.innerHTML = `
        <strong>${escapeHtml(restaurant.name || "부산 맛집")}</strong>
        <span>${escapeHtml(restaurant.district || "부산")}</span>
        <button type="button">상세보기</button>
      `;

      content.querySelector("button").addEventListener("click", () => {
        openDetail(restaurant);
      });

      state.mapInfoWindow.setContent(content);
      state.mapInfoWindow.open(state.map, marker);
    });

    state.mapMarkers.push(marker);
  });

  fitMapToRestaurants();
}

function fitMapToRestaurants() {
  if (!state.map || !state.mapMarkers.length || !window.kakao?.maps) return;

  const bounds = new kakao.maps.LatLngBounds();

  state.mapMarkers.forEach((marker) => {
    bounds.extend(marker.getPosition());
  });

  state.map.setBounds(bounds);
}

function renderMapList() {
  const restaurants = state.allRestaurants.filter(
    (item) => Number.isFinite(item.lat) && Number.isFinite(item.lng)
  );

  dom.mapRestaurantList.innerHTML = restaurants.length
    ? restaurants.slice(0, 12).map(compactCardTemplate).join("")
    : emptyState(
        "지도에 표시할 좌표 데이터가 없습니다.",
        "API 데이터의 LAT/LNG 값을 확인해주세요."
      );

  bindRestaurantActionButtons(dom.mapRestaurantList);
}

function moveToMyLocation() {
  if (!navigator.geolocation) {
    showToast("이 브라우저에서는 위치 정보를 사용할 수 없습니다.");
    return;
  }

  if (!state.map || !window.kakao?.maps) {
    showToast("Kakao 지도가 아직 준비되지 않았습니다.");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latLng = new kakao.maps.LatLng(
        position.coords.latitude,
        position.coords.longitude
      );

      state.map.setCenter(latLng);
      state.map.setLevel(5);

      new kakao.maps.Marker({
        map: state.map,
        position: latLng,
        title: "내 위치"
      });
    },
    (error) => {
      console.error("위치 정보 오류:", error);
      showToast("현재 위치를 가져오지 못했습니다.");
    },
    {
      enableHighAccuracy: true,
      timeout: 8000
    }
  );
}

function openRestaurantOnMap(id) {
  const restaurant = findRestaurantAnywhere(id);

  if (!restaurant || !restaurant.lat || !restaurant.lng) {
    showToast("지도 좌표가 없는 맛집입니다.");
    return;
  }

  closeDetail();
  navigate("map");

  setTimeout(() => {
    if (!state.map || !window.kakao?.maps) return;

    const position = new kakao.maps.LatLng(restaurant.lat, restaurant.lng);
    state.map.setCenter(position);
    state.map.setLevel(4);
  }, 150);
}

function createKakaoMapUrl(restaurant) {
  /*
    Kakao 지도 길찾기 URL 형식.
    목적지명과 위도/경도를 전달합니다.
  */
  const destination = encodeURIComponent(restaurant.name || "목적지");
  return `https://map.kakao.com/link/to/${destination},${restaurant.lat},${restaurant.lng}`;
}

function showMapNotice(message) {
  dom.mapNotice.hidden = false;
  dom.mapNotice.textContent = message;
}

function hideMapNotice() {
  dom.mapNotice.hidden = true;
  dom.mapNotice.textContent = "";
}

/* =========================================================
   Error / Setup UI
========================================================= */

function showApiSetupState() {
  const message = `
    <div class="setup-state">
      <span class="setup-badge">설정 필요</span>
      <strong>공공데이터 API 인증키를 입력해주세요.</strong>
      <p>
        js/config.js 파일의 FOOD_API_KEY를
        공공데이터포털에서 발급받은 인증키로 교체하면 실제 부산 맛집 데이터를 불러옵니다.
      </p>
    </div>
  `;

  dom.restaurantList.innerHTML = message;
  dom.recommendationArea.innerHTML = message;
  dom.resultCount.textContent = "0";
}

function showApiErrorState(error) {
  const message = `
    <div class="empty-state error-state">
      <div class="empty-icon" aria-hidden="true">!</div>
      <strong>맛집 정보를 불러오지 못했습니다.</strong>
      <p>${escapeHtml(error?.message || "잠시 후 다시 시도해주세요.")}</p>
      <button class="primary-button" type="button" id="retryApiButton">다시 시도</button>
    </div>
  `;

  dom.restaurantList.innerHTML = message;
  dom.recommendationArea.innerHTML = message;

  document.querySelectorAll("#retryApiButton").forEach((button) => {
    button.addEventListener("click", async () => {
      renderLoadingState();
      await fetchRestaurants({ reset: true });
      renderAll();
    });
  });
}

function updateLoadMoreButton() {
  const complete =
    state.totalCount > 0 &&
    state.allRestaurants.length >= state.totalCount;

  // 맛집찾기 화면의 더보기 버튼
  dom.loadMoreButton.disabled = state.isLoading || complete;

  if (state.isLoading) {
    dom.loadMoreButton.textContent = "불러오는 중...";
  } else {
    dom.loadMoreButton.textContent = complete
      ? "마지막 데이터입니다"
      : "더 불러오기";
  }

  // 홈 전체보기 상태의 더보기 버튼
  dom.homeLoadMoreButton.disabled = state.isLoading || complete;

  if (state.isLoading) {
    dom.homeLoadMoreButton.textContent = "맛집 불러오는 중...";
  } else {
    dom.homeLoadMoreButton.textContent = complete
      ? "마지막 데이터입니다"
      : "맛집 더보기";
  }

  // 홈이 펼쳐져 있을 때만 더보기 영역을 노출합니다.
  if (state.homeExpanded) {
    dom.homeLoadMoreWrap.hidden = complete;
  }
}

/* =========================================================
   Utility
========================================================= */

function findRestaurantAnywhere(id) {
  return (
    state.allRestaurants.find((item) => item.id === id) ||
    state.favorites.find((item) => item.id === id) ||
    state.recent.find((item) => item.id === id)
  );
}

function loadStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function cleanText(value) {
  if (value === null || value === undefined) return "";
  return String(value)
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function resolveImageUrl(value) {
  if (!value) return "";

  const url = value.trim();

  if (/^https?:\/\//i.test(url)) {
    return url;
  }

  /*
    제공 문서의 이미지 예시는 /uploadImgs/... 형태의 상대경로입니다.
    문서에는 해당 상대경로의 별도 이미지 호스트가 명시되어 있지 않으므로,
    임의의 도메인을 붙이지 않습니다.
    실제 API 응답이 절대 URL을 반환하면 그대로 표시되고,
    상대경로만 반환하면 안전하게 기본 이미지 UI를 사용합니다.
  */
  return "";
}

function isSafeHttpUrl(value) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeJs(value) {
  return String(value ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "\\'");
}

let toastTimer;

function showToast(message) {
  clearTimeout(toastTimer);
  dom.toast.textContent = message;
  dom.toast.classList.add("is-visible");

  toastTimer = setTimeout(() => {
    dom.toast.classList.remove("is-visible");
  }, 2200);
}

/*
  상세 모달의 "지도에서 보기" 버튼에서 접근하는 최소 공개 API
*/
window.BUSAN_FOOD_APP = {
  openOnMap: openRestaurantOnMap
};
