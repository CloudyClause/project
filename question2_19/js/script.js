/* =========================================================
   주차한끼 Ver.2
   부산광역시 공공데이터 기반 모바일 생활정보 앱

   File : ./js/script.js

   사용 데이터
   1. 부산 착한가격업소 조회
   2. 부산광역시 위생등급지정업소정보서비스
   3. 부산광역시 공영주차장 정보 서비스

   지도
   - Kakao Maps JavaScript SDK
========================================================= */

"use strict";


/* =========================================================
   01. API KEY
   ---------------------------------------------------------
   공공데이터포털에서 발급받은 인증키를 입력합니다.

   URLSearchParams가 인코딩을 처리하므로
   가능하면 공공데이터포털의 "일반 인증키(Decoding)" 값을
   그대로 입력하는 방식을 권장합니다.
========================================================= */

/* =========================================================
   Public Data API Keys

   각 공공데이터 활용신청 페이지에서 확인한
   Encoding 인증키를 각각 입력합니다.

   실제로 세 키가 같다면 같은 값을 세 곳에 넣어도 됩니다.
========================================================= */

const API_KEYS = {

  goodPrice:
    "tW7FeD8I518PrNi/5UsHOX/Xezu6UWbn8JnnGBpgg72TjF2JM4r5MjBqSk7RrTCMviF+MnZGJOX7W8d50y0uzw==",

  hygiene:
    "tW7FeD8I518PrNi/5UsHOX/Xezu6UWbn8JnnGBpgg72TjF2JM4r5MjBqSk7RrTCMviF+MnZGJOX7W8d50y0uzw==",

  parking:
    "tW7FeD8I518PrNi/5UsHOX/Xezu6UWbn8JnnGBpgg72TjF2JM4r5MjBqSk7RrTCMviF+MnZGJOX7W8d50y0uzw=="

};

/* =========================================================
   02. Public Data API Configuration
========================================================= */

const API_CONFIG = {

  /* -------------------------------------------------------
     부산 착한가격업소
     문서 Callback URL:
     /GoodPriceStoreService/getGoodPirceStore

     cnCd = 602
     → 음식점만 조회
  ------------------------------------------------------- */
  goodPrice: {

    endpoint:
      "https://apis.data.go.kr/6260000/GoodPriceStoreService/getGoodPriceStore",

    serviceKey:
      API_KEYS.goodPrice,

    pageSize: 100,

    params: {
      resultType: "json",
      cnCd: "602"
    }

  },


  /* -------------------------------------------------------
     부산 위생등급지정업소
  ------------------------------------------------------- */
  hygiene: {

    endpoint:
      "https://apis.data.go.kr/6260000/BusanHygieneGradeService/getHygieneGradeList",

    serviceKey:
      API_KEYS.hygiene,

    pageSize: 100,

    params: {
      resultType: "json"
    }

  },


  /* -------------------------------------------------------
     부산 공영주차장
  ------------------------------------------------------- */
  parking: {

    endpoint:
      "https://apis.data.go.kr/6260000/BusanPblcPrkngInfoService/getPblcPrkngInfo",

    serviceKey:
      API_KEYS.parking,

    pageSize: 100,

    params: {
      resultType: "json"
    }

  }

};


/* =========================================================
   03. Application Configuration
========================================================= */

const APP_CONFIG = {

  appName: "주차한끼",

  /* 부산 중심 좌표 */
  busanCenter: {
    latitude: 35.1795543,
    longitude: 129.0756416
  },

  /* 부산 내부 여부를 단순 확인하기 위한 범위 */
  busanBounds: {
    minLatitude: 34.80,
    maxLatitude: 35.40,
    minLongitude: 128.70,
    maxLongitude: 129.40
  },

  /* 음식점 ↔ 공영주차장 기본 연결 반경 */
  parkingRadius: 1000,

  homeRestaurantLimit: 8,

  parkingFriendlyLimit: 6,

  hygieneRestaurantLimit: 6,

  nearbyParkingLimit: 5,

  recentSearchLimit: 8,

  /* Kakao 주소검색을 한꺼번에 지나치게 많이 호출하지 않도록 제한 */
  restaurantGeocodeLimit: 120,

  parkingGeocodeLimit: 200,

  requestTimeout: 15000,

  splashDuration: 700

};


/* =========================================================
   04. LocalStorage Keys
========================================================= */

const STORAGE_KEYS = {

  favoriteRestaurants:
    "parkingMealV2FavoriteRestaurants",

  favoriteParkingLots:
    "parkingMealV2FavoriteParkingLots",

  recentSearches:
    "parkingMealV2RecentSearches",

  selectedRegion:
    "parkingMealV2SelectedRegion"

};


/* =========================================================
   05. Application State
========================================================= */

const appState = {

  raw: {
    goodPrice: [],
    hygiene: [],
    parking: []
  },

  restaurants: [],

  hygieneStores: [],

  parkingLots: [],

  filteredRestaurants: [],


  /* ---------------------------------
     선택 데이터
  --------------------------------- */
  selectedRestaurant: null,

  selectedParking: null,


  /* ---------------------------------
     지역 선택
  --------------------------------- */
  region: {
    district: "",
    dong: ""
  },

  temporaryRegion: {
    district: "",
    dong: ""
  },


  /* ---------------------------------
     현재 위치
  --------------------------------- */
  currentLocation: {

    latitude: null,
    longitude: null,

    district: "",
    dong: "",

    insideBusan: false,
    permissionGranted: false

  },


  /* ---------------------------------
     검색
  --------------------------------- */
  searchKeyword: "",


  /* ---------------------------------
     Filter
  --------------------------------- */
  filters: {

    hygiene: "",

    ownParking: "",

    parkingDistance: null,

    realtimeParkingOnly: false,

    freeParkingOnly: false,

    openParkingOnly: false,

    parkingTypes: []

  },


  /* ---------------------------------
     Sort
  --------------------------------- */
  sortOption: "recommended",


  /* ---------------------------------
     LocalStorage
  --------------------------------- */
  favorites: {
    restaurants: [],
    parkingLots: []
  },


  /* ---------------------------------
     Kakao Map
  --------------------------------- */
  map: null,

  geocoder: null,

  mapInitialized: false,

  restaurantOverlays: [],

  parkingOverlays: [],

  selectedParkingOverlay: null,


  /* ---------------------------------
     API State
  --------------------------------- */
  loading: {

    goodPrice: false,

    hygiene: false,

    parking: false

  },

  errors: {

    goodPrice: null,

    hygiene: null,

    parking: null,

    map: null

  }

};


/* =========================================================
   06. DOM Cache
========================================================= */

const DOM = {};


/* =========================================================
   07. Cache DOM Elements
========================================================= */

function cacheDomElements() {

  /* ---------------------------------
     Main
  --------------------------------- */
  DOM.splashScreen =
    document.getElementById(
      "splashScreen"
    );

  DOM.mainApp =
    document.getElementById(
      "mainApp"
    );

  DOM.screens =
    document.querySelectorAll(
      ".screen"
    );


  /* ---------------------------------
     Header
  --------------------------------- */
  DOM.defaultHeader =
    document.getElementById(
      "defaultHeader"
    );

  DOM.detailHeader =
    document.getElementById(
      "detailHeader"
    );

  DOM.detailHeaderTitle =
    document.getElementById(
      "detailHeaderTitle"
    );

  DOM.detailBackButton =
    document.getElementById(
      "detailBackButton"
    );

  DOM.headerRegionButton =
    document.getElementById(
      "headerRegionButton"
    );

  DOM.headerRegionText =
    document.getElementById(
      "headerRegionText"
    );


  /* ---------------------------------
     Home
  --------------------------------- */
  DOM.homeRegionSelectButton =
    document.getElementById(
      "homeRegionSelectButton"
    );

  DOM.homeSelectedRegion =
    document.getElementById(
      "homeSelectedRegion"
    );

  DOM.nearMeButton =
    document.getElementById(
      "nearMeButton"
    );

  DOM.homeSearchForm =
    document.getElementById(
      "homeSearchForm"
    );

  DOM.homeSearchInput =
    document.getElementById(
      "homeSearchInput"
    );

  DOM.homeSearchClearButton =
    document.getElementById(
      "homeSearchClearButton"
    );

  DOM.quickFilterList =
    document.getElementById(
      "quickFilterList"
    );

  DOM.homeRestaurantLoading =
    document.getElementById(
      "homeRestaurantLoading"
    );

  DOM.homeRestaurantList =
    document.getElementById(
      "homeRestaurantList"
    );

  DOM.homeRestaurantEmpty =
    document.getElementById(
      "homeRestaurantEmpty"
    );

  DOM.homeRestaurantError =
    document.getElementById(
      "homeRestaurantError"
    );

  DOM.homeRestaurantRetryButton =
    document.getElementById(
      "homeRestaurantRetryButton"
    );

  DOM.homeEmptyRegionButton =
    document.getElementById(
      "homeEmptyRegionButton"
    );

  DOM.parkingFriendlyList =
    document.getElementById(
      "parkingFriendlyList"
    );

  DOM.hygieneRestaurantList =
    document.getElementById(
      "hygieneRestaurantList"
    );


  /* ---------------------------------
     Recent Search
  --------------------------------- */
  DOM.recentSearchArea =
    document.getElementById(
      "recentSearchArea"
    );

  DOM.recentSearchList =
    document.getElementById(
      "recentSearchList"
    );

  DOM.clearRecentSearchButton =
    document.getElementById(
      "clearRecentSearchButton"
    );


  /* ---------------------------------
     Search
  --------------------------------- */
  DOM.searchForm =
    document.getElementById(
      "searchForm"
    );

  DOM.searchInput =
    document.getElementById(
      "searchInput"
    );

  DOM.searchClearButton =
    document.getElementById(
      "searchClearButton"
    );

  DOM.searchRegionButton =
    document.getElementById(
      "searchRegionButton"
    );

  DOM.searchRegionText =
    document.getElementById(
      "searchRegionText"
    );

  DOM.searchResultCount =
    document.getElementById(
      "searchResultCount"
    );

  DOM.searchResultList =
    document.getElementById(
      "searchResultList"
    );

  DOM.searchLoading =
    document.getElementById(
      "searchLoading"
    );

  DOM.searchEmpty =
    document.getElementById(
      "searchEmpty"
    );

  DOM.searchError =
    document.getElementById(
      "searchError"
    );

  DOM.searchRetryButton =
    document.getElementById(
      "searchRetryButton"
    );

  DOM.searchEmptyResetButton =
    document.getElementById(
      "searchEmptyResetButton"
    );

  DOM.activeFilterBar =
    document.getElementById(
      "activeFilterBar"
    );

  DOM.activeFilterList =
    document.getElementById(
      "activeFilterList"
    );

  DOM.resetAllFilterButton =
    document.getElementById(
      "resetAllFilterButton"
    );

  DOM.currentSortLabel =
    document.getElementById(
      "currentSortLabel"
    );

  DOM.distanceSortOption =
    document.getElementById(
      "distanceSortOption"
    );


  /* ---------------------------------
     Filter / Sort
  --------------------------------- */
  DOM.openFilterButton =
    document.getElementById(
      "openFilterButton"
    );

  DOM.openSortButton =
    document.getElementById(
      "openSortButton"
    );

  DOM.filterModal =
    document.getElementById(
      "filterModal"
    );

  DOM.sortModal =
    document.getElementById(
      "sortModal"
    );

  DOM.filterResetButton =
    document.getElementById(
      "filterResetButton"
    );

  DOM.filterApplyButton =
    document.getElementById(
      "filterApplyButton"
    );

  DOM.realtimeParkingFilter =
    document.getElementById(
      "realtimeParkingFilter"
    );

  DOM.freeParkingFilter =
    document.getElementById(
      "freeParkingFilter"
    );

  DOM.openParkingFilter =
    document.getElementById(
      "openParkingFilter"
    );


  /* ---------------------------------
     Region Modal
  --------------------------------- */
  DOM.regionModal =
    document.getElementById(
      "regionModal"
    );

  DOM.districtButtonList =
    document.getElementById(
      "districtButtonList"
    );

  DOM.dongButtonList =
    document.getElementById(
      "dongButtonList"
    );

  DOM.regionResetButton =
    document.getElementById(
      "regionResetButton"
    );

  DOM.regionApplyButton =
    document.getElementById(
      "regionApplyButton"
    );


  /* ---------------------------------
     Map
  --------------------------------- */
  DOM.kakaoMap =
    document.getElementById(
      "kakaoMap"
    );

  DOM.mapLoading =
    document.getElementById(
      "mapLoading"
    );

  DOM.mapError =
    document.getElementById(
      "mapError"
    );

  DOM.mapRetryButton =
    document.getElementById(
      "mapRetryButton"
    );

  DOM.mapSearchForm =
    document.getElementById(
      "mapSearchForm"
    );

  DOM.mapSearchInput =
    document.getElementById(
      "mapSearchInput"
    );

  DOM.mapCurrentLocationButton =
    document.getElementById(
      "mapCurrentLocationButton"
    );

  DOM.mapBusanButton =
    document.getElementById(
      "mapBusanButton"
    );

  DOM.mapResearchButton =
    document.getElementById(
      "mapResearchButton"
    );

  DOM.outsideBusanMessage =
    document.getElementById(
      "outsideBusanMessage"
    );

  DOM.mapBottomSheet =
    document.getElementById(
      "mapBottomSheet"
    );

  DOM.mapBottomSheetHandle =
    document.getElementById(
      "mapBottomSheetHandle"
    );

  DOM.mapResultCount =
    document.getElementById(
      "mapResultCount"
    );

  DOM.mapResultList =
    document.getElementById(
      "mapResultList"
    );


  /* ---------------------------------
     Restaurant Detail
  --------------------------------- */
  DOM.restaurantDetailImage =
    document.getElementById(
      "restaurantDetailImage"
    );

  DOM.restaurantImagePlaceholder =
    document.getElementById(
      "restaurantImagePlaceholder"
    );

  DOM.restaurantBadgeList =
    document.getElementById(
      "restaurantBadgeList"
    );

  DOM.restaurantDetailName =
    document.getElementById(
      "restaurantDetailName"
    );

  DOM.restaurantDetailRegion =
    document.getElementById(
      "restaurantDetailRegion"
    );

  DOM.restaurantFavoriteButton =
    document.getElementById(
      "restaurantFavoriteButton"
    );

  DOM.restaurantBusinessHours =
    document.getElementById(
      "restaurantBusinessHours"
    );

  DOM.restaurantOwnParking =
    document.getElementById(
      "restaurantOwnParking"
    );

  DOM.restaurantPhone =
    document.getElementById(
      "restaurantPhone"
    );

  DOM.restaurantAddress =
    document.getElementById(
      "restaurantAddress"
    );

  DOM.restaurantMapButton =
    document.getElementById(
      "restaurantMapButton"
    );

  DOM.restaurantIntroduction =
    document.getElementById(
      "restaurantIntroduction"
    );

  DOM.restaurantHygieneGrade =
    document.getElementById(
      "restaurantHygieneGrade"
    );

  DOM.hygieneGradeCard =
    document.getElementById(
      "hygieneGradeCard"
    );

  DOM.hygieneGradeError =
    document.getElementById(
      "hygieneGradeError"
    );

  DOM.nearbyParkingLoading =
    document.getElementById(
      "nearbyParkingLoading"
    );

  DOM.nearbyParkingList =
    document.getElementById(
      "nearbyParkingList"
    );

  DOM.nearbyParkingEmpty =
    document.getElementById(
      "nearbyParkingEmpty"
    );

  DOM.nearbyParkingError =
    document.getElementById(
      "nearbyParkingError"
    );


  /* ---------------------------------
     Parking Detail
  --------------------------------- */
  DOM.parkingPublicBadge =
    document.getElementById(
      "parkingPublicBadge"
    );

  DOM.parkingOpenStatusBadge =
    document.getElementById(
      "parkingOpenStatusBadge"
    );

  DOM.parkingDetailName =
    document.getElementById(
      "parkingDetailName"
    );

  DOM.parkingDetailAgency =
    document.getElementById(
      "parkingDetailAgency"
    );

  DOM.parkingFavoriteButton =
    document.getElementById(
      "parkingFavoriteButton"
    );

  DOM.parkingDistanceToRestaurant =
    document.getElementById(
      "parkingDistanceToRestaurant"
    );

  DOM.parkingRealtimeStatus =
    document.getElementById(
      "parkingRealtimeStatus"
    );

  DOM.parkingAvailableSpaces =
    document.getElementById(
      "parkingAvailableSpaces"
    );

  DOM.parkingTotalSpaces =
    document.getElementById(
      "parkingTotalSpaces"
    );

  DOM.parkingDetailAddress =
    document.getElementById(
      "parkingDetailAddress"
    );

  DOM.parkingPhone =
    document.getElementById(
      "parkingPhone"
    );

  DOM.parkingType =
    document.getElementById(
      "parkingType"
    );

  DOM.parkingOperationType =
    document.getElementById(
      "parkingOperationType"
    );

  DOM.parkingOperatingDays =
    document.getElementById(
      "parkingOperatingDays"
    );

  DOM.parkingFeeType =
    document.getElementById(
      "parkingFeeType"
    );

  DOM.parkingWeekdayHours =
    document.getElementById(
      "parkingWeekdayHours"
    );

  DOM.parkingSaturdayHours =
    document.getElementById(
      "parkingSaturdayHours"
    );

  DOM.parkingHolidayHours =
    document.getElementById(
      "parkingHolidayHours"
    );

  DOM.parkingBasicFee =
    document.getElementById(
      "parkingBasicFee"
    );

  DOM.parkingExtraFee =
    document.getElementById(
      "parkingExtraFee"
    );

  DOM.parkingDailyFee =
    document.getElementById(
      "parkingDailyFee"
    );

  DOM.parkingPaymentMethod =
    document.getElementById(
      "parkingPaymentMethod"
    );

  DOM.parkingTimeSelector =
    document.getElementById(
      "parkingTimeSelector"
    );

  DOM.estimatedParkingFee =
    document.getElementById(
      "estimatedParkingFee"
    );

  DOM.parkingSpecialNoteSection =
    document.getElementById(
      "parkingSpecialNoteSection"
    );

  DOM.parkingSpecialNote =
    document.getElementById(
      "parkingSpecialNote"
    );

  DOM.parkingDataDate =
    document.getElementById(
      "parkingDataDate"
    );

  DOM.parkingDirectionsButton =
    document.getElementById(
      "parkingDirectionsButton"
    );


  /* ---------------------------------
     Saved
  --------------------------------- */
  DOM.savedRestaurantTab =
    document.getElementById(
      "savedRestaurantTab"
    );

  DOM.savedParkingTab =
    document.getElementById(
      "savedParkingTab"
    );

  DOM.savedRestaurantPanel =
    document.getElementById(
      "savedRestaurantPanel"
    );

  DOM.savedParkingPanel =
    document.getElementById(
      "savedParkingPanel"
    );

  DOM.savedRestaurantList =
    document.getElementById(
      "savedRestaurantList"
    );

  DOM.savedParkingList =
    document.getElementById(
      "savedParkingList"
    );

  DOM.savedRestaurantEmpty =
    document.getElementById(
      "savedRestaurantEmpty"
    );

  DOM.savedParkingEmpty =
    document.getElementById(
      "savedParkingEmpty"
    );

  DOM.savedRestaurantCount =
    document.getElementById(
      "savedRestaurantCount"
    );

  DOM.savedParkingCount =
    document.getElementById(
      "savedParkingCount"
    );


  /* ---------------------------------
     Outside Busan
  --------------------------------- */
  DOM.outsideBusanModal =
    document.getElementById(
      "outsideBusanModal"
    );

  DOM.outsideBusanRegionButton =
    document.getElementById(
      "outsideBusanRegionButton"
    );


  /* ---------------------------------
     Navigation
  --------------------------------- */
  DOM.bottomNavigationItems =
    document.querySelectorAll(
      ".bottom-navigation__item"
    );


  /* ---------------------------------
     Templates
  --------------------------------- */
  DOM.restaurantCardTemplate =
    document.getElementById(
      "restaurantCardTemplate"
    );

  DOM.parkingCardTemplate =
    document.getElementById(
      "parkingCardTemplate"
    );


  /* ---------------------------------
     Global
  --------------------------------- */
  DOM.networkOfflineMessage =
    document.getElementById(
      "networkOfflineMessage"
    );

  DOM.toast =
    document.getElementById(
      "toast"
    );

  DOM.toastMessage =
    document.getElementById(
      "toastMessage"
    );

}


/* =========================================================
   08. Initialize
========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  initializeApp
);


async function initializeApp() {

  cacheDomElements();

  loadLocalState();

  bindEvents();

  renderRecentSearches();

  updateRegionLabels();

  await initializeKakaoMap();

  showMainApp();

  loadPublicData();

}


/* =========================================================
   09. Show Main App
========================================================= */

function showMainApp() {

  window.setTimeout(() => {

    DOM.splashScreen.hidden = true;

    DOM.mainApp.hidden = false;

    showScreen(
      "homeScreen"
    );

  }, APP_CONFIG.splashDuration);

}


/* =========================================================
   10. Bind Events
========================================================= */

function bindEvents() {

  document.addEventListener(
    "click",
    handleDocumentClick
  );


  /* ---------------------------------
     검색
  --------------------------------- */
  DOM.homeSearchForm.addEventListener(
    "submit",
    handleHomeSearch
  );

  DOM.homeSearchInput.addEventListener(
    "input",
    () => {

      DOM.homeSearchClearButton.hidden =
        !DOM.homeSearchInput.value;

    }
  );

  DOM.homeSearchClearButton.addEventListener(
    "click",
    () => {

      DOM.homeSearchInput.value = "";

      DOM.homeSearchClearButton.hidden =
        true;

      DOM.homeSearchInput.focus();

    }
  );


  DOM.searchForm.addEventListener(
    "submit",
    handleSearchSubmit
  );

  DOM.searchInput.addEventListener(
    "input",
    handleSearchInput
  );

  DOM.searchClearButton.addEventListener(
    "click",
    () => {

      DOM.searchInput.value = "";

      appState.searchKeyword = "";

      DOM.searchClearButton.hidden =
        true;

      applySearchAndFilters();

    }
  );


  /* ---------------------------------
     지도 검색
  --------------------------------- */
  DOM.mapSearchForm.addEventListener(
    "submit",
    handleMapSearch
  );


  /* ---------------------------------
     지역
  --------------------------------- */
  DOM.headerRegionButton.addEventListener(
    "click",
    openRegionModal
  );

  DOM.homeRegionSelectButton.addEventListener(
    "click",
    openRegionModal
  );

  DOM.searchRegionButton.addEventListener(
    "click",
    openRegionModal
  );

  DOM.homeEmptyRegionButton.addEventListener(
    "click",
    openRegionModal
  );

  DOM.regionResetButton.addEventListener(
    "click",
    resetTemporaryRegion
  );

  DOM.regionApplyButton.addEventListener(
    "click",
    applyRegionSelection
  );


  /* ---------------------------------
     현재 위치
  --------------------------------- */
  DOM.nearMeButton.addEventListener(
    "click",
    requestCurrentLocation
  );


  /* ---------------------------------
     Filter
  --------------------------------- */
  DOM.openFilterButton.addEventListener(
    "click",
    () => openModal(
      "filterModal"
    )
  );

  DOM.filterResetButton.addEventListener(
    "click",
    resetFilterControls
  );

  DOM.filterApplyButton.addEventListener(
    "click",
    applyFilterModal
  );

  DOM.resetAllFilterButton.addEventListener(
    "click",
    resetAllFilters
  );

  DOM.searchEmptyResetButton.addEventListener(
    "click",
    resetAllFilters
  );

  DOM.quickFilterList.addEventListener(
    "click",
    handleQuickFilter
  );


  /* ---------------------------------
     Sort
  --------------------------------- */
  DOM.openSortButton.addEventListener(
    "click",
    () => openModal(
      "sortModal"
    )
  );

  document
    .querySelectorAll(
      'input[name="sortOption"]'
    )
    .forEach((radio) => {

      radio.addEventListener(
        "change",
        handleSortChange
      );

    });


  /* ---------------------------------
     Retry
  --------------------------------- */
  DOM.homeRestaurantRetryButton
    .addEventListener(
      "click",
      loadPublicData
    );

  DOM.searchRetryButton.addEventListener(
    "click",
    loadPublicData
  );


  /* ---------------------------------
     Recent Search
  --------------------------------- */
  DOM.clearRecentSearchButton
    .addEventListener(
      "click",
      clearRecentSearches
    );


  /* ---------------------------------
     Restaurant Detail
  --------------------------------- */
  DOM.restaurantFavoriteButton
    .addEventListener(
      "click",
      () => {

        if (
          appState.selectedRestaurant
        ) {

          toggleRestaurantFavorite(
            appState
              .selectedRestaurant
              .id
          );

        }

      }
    );

  DOM.restaurantMapButton
    .addEventListener(
      "click",
      openSelectedRestaurantOnMap
    );


  /* ---------------------------------
     Parking Detail
  --------------------------------- */
  DOM.parkingFavoriteButton
    .addEventListener(
      "click",
      () => {

        if (
          appState.selectedParking
        ) {

          toggleParkingFavorite(
            appState
              .selectedParking
              .id
          );

        }

      }
    );

  DOM.parkingTimeSelector
    .addEventListener(
      "click",
      handleParkingTimeSelection
    );

  DOM.parkingDirectionsButton
    .addEventListener(
      "click",
      openParkingDirections
    );


  /* ---------------------------------
     Saved
  --------------------------------- */
  DOM.savedRestaurantTab
    .addEventListener(
      "click",
      () => switchSavedTab(
        "restaurant"
      )
    );

  DOM.savedParkingTab
    .addEventListener(
      "click",
      () => switchSavedTab(
        "parking"
      )
    );


  /* ---------------------------------
     Map
  --------------------------------- */
  DOM.mapCurrentLocationButton
    .addEventListener(
      "click",
      requestCurrentLocation
    );

  DOM.mapBusanButton.addEventListener(
    "click",
    moveMapToBusan
  );

  DOM.mapResearchButton
    .addEventListener(
      "click",
      searchCurrentMapArea
    );

  DOM.mapBottomSheetHandle
    .addEventListener(
      "click",
      () => {

        DOM.mapBottomSheet
          .classList.toggle(
            "is-expanded"
          );

      }
    );

  DOM.mapRetryButton.addEventListener(
    "click",
    initializeKakaoMap
  );


  /* ---------------------------------
     Outside Busan
  --------------------------------- */
  DOM.outsideBusanRegionButton
    .addEventListener(
      "click",
      () => {

        closeModal(
          "outsideBusanModal"
        );

        openRegionModal();

      }
    );


  /* ---------------------------------
     Network
  --------------------------------- */
  window.addEventListener(
    "online",
    handleNetworkStatus
  );

  window.addEventListener(
    "offline",
    handleNetworkStatus
  );

  handleNetworkStatus();

}


/* =========================================================
   11. Global Click Handler
========================================================= */

function handleDocumentClick(event) {

  /* ---------------------------------
     Screen Navigation
  --------------------------------- */
  const screenButton =
    event.target.closest(
      "[data-screen-target]"
    );

  if (screenButton) {

    event.preventDefault();

    showScreen(
      screenButton
        .dataset
        .screenTarget
    );

    return;

  }


  /* ---------------------------------
     Modal Close
  --------------------------------- */
  const modalClose =
    event.target.closest(
      "[data-modal-close]"
    );

  if (modalClose) {

    closeModal(
      modalClose
        .dataset
        .modalClose
    );

    return;

  }


  /* ---------------------------------
     District
  --------------------------------- */
  const districtButton =
    event.target.closest(
      "[data-district]"
    );

  if (
    districtButton
    &&
    districtButton.closest(
      "#districtButtonList"
    )
  ) {

    selectTemporaryDistrict(
      districtButton
        .dataset
        .district
    );

    return;

  }


  /* ---------------------------------
     Dong
  --------------------------------- */
  const dongButton =
    event.target.closest(
      "[data-dong]"
    );

  if (
    dongButton
    &&
    dongButton.closest(
      "#dongButtonList"
    )
  ) {

    selectTemporaryDong(
      dongButton
        .dataset
        .dong
    );

    return;

  }


  /* ---------------------------------
     Restaurant Open
  --------------------------------- */
  const restaurantOpen =
    event.target.closest(
      '[data-action="open-restaurant"]'
    );

  if (restaurantOpen) {

    const card =
      restaurantOpen.closest(
        ".restaurant-card"
      );

    openRestaurantDetail(
      card.dataset.restaurantId
    );

    return;

  }


  /* ---------------------------------
     Restaurant Favorite
  --------------------------------- */
  const restaurantFavorite =
    event.target.closest(
      '[data-action="toggle-restaurant-favorite"]'
    );

  if (restaurantFavorite) {

    const card =
      restaurantFavorite.closest(
        ".restaurant-card"
      );

    toggleRestaurantFavorite(
      card.dataset.restaurantId
    );

    return;

  }


  /* ---------------------------------
     Parking Open
  --------------------------------- */
  const parkingOpen =
    event.target.closest(
      '[data-action="open-parking"]'
    );

  if (parkingOpen) {

    const card =
      parkingOpen.closest(
        ".parking-card"
      );

    openParkingDetail(
      card.dataset.parkingId
    );

    return;

  }


  /* ---------------------------------
     Parking Favorite
  --------------------------------- */
  const parkingFavorite =
    event.target.closest(
      '[data-action="toggle-parking-favorite"]'
    );

  if (parkingFavorite) {

    const card =
      parkingFavorite.closest(
        ".parking-card"
      );

    toggleParkingFavorite(
      card.dataset.parkingId
    );

  }

}


/* =========================================================
   12. Screen Navigation
========================================================= */

function showScreen(screenId) {

  DOM.screens.forEach((screen) => {

    if (
      screen.id ===
      "splashScreen"
    ) {
      return;
    }

    screen.hidden = true;

    screen.classList.remove(
      "is-active"
    );

  });


  const target =
    document.getElementById(
      screenId
    );


  if (!target) {
    return;
  }


  target.hidden = false;

  target.classList.add(
    "is-active"
  );


  updateHeader(screenId);

  updateBottomNavigation(screenId);


  if (
    screenId ===
    "mapScreen"
  ) {

    refreshMap();

  } else {

    window.scrollTo({
      top: 0,
      behavior: "auto"
    });

  }


  if (
    screenId ===
    "savedScreen"
  ) {

    renderSavedLists();

  }

}


/* =========================================================
   13. Header
========================================================= */

function updateHeader(screenId) {

  const detail =
    screenId ===
      "restaurantDetailScreen"
    ||
    screenId ===
      "parkingDetailScreen";


  DOM.defaultHeader.hidden =
    detail;

  DOM.detailHeader.hidden =
    !detail;


  if (
    screenId ===
    "restaurantDetailScreen"
  ) {

    DOM.detailHeaderTitle
      .textContent =
      "음식점 상세";

  }


  if (
    screenId ===
    "parkingDetailScreen"
  ) {

    DOM.detailHeaderTitle
      .textContent =
      "주차장 상세";

  }


  DOM.detailBackButton.onclick =
    () => {

      if (
        screenId ===
          "parkingDetailScreen"
        &&
        appState
          .selectedRestaurant
      ) {

        showScreen(
          "restaurantDetailScreen"
        );

        return;

      }

      showScreen(
        "homeScreen"
      );

    };

}


/* =========================================================
   14. Bottom Navigation
========================================================= */

function updateBottomNavigation(
  screenId
) {

  const mapping = {

    homeScreen: "home",

    searchScreen: "home",

    restaurantDetailScreen:
      "home",

    parkingDetailScreen:
      "home",

    mapScreen: "map",

    savedScreen: "saved"

  };


  const activeName =
    mapping[screenId];


  DOM.bottomNavigationItems
    .forEach((button) => {

      const active =
        button.dataset.navName
        ===
        activeName;


      button.classList.toggle(
        "is-active",
        active
      );


      if (active) {

        button.setAttribute(
          "aria-current",
          "page"
        );

      } else {

        button.removeAttribute(
          "aria-current"
        );

      }

    });

}


/* =========================================================
   15. Load Local State
========================================================= */

function loadLocalState() {

  appState.favorites.restaurants =
    readStorageArray(
      STORAGE_KEYS
        .favoriteRestaurants
    );

  appState.favorites.parkingLots =
    readStorageArray(
      STORAGE_KEYS
        .favoriteParkingLots
    );


  try {

    const region =
      JSON.parse(
        localStorage.getItem(
          STORAGE_KEYS
            .selectedRegion
        )
      );


    if (
      region
      &&
      typeof region ===
        "object"
    ) {

      appState.region = {

        district:
          region.district || "",

        dong:
          region.dong || ""

      };

    }

  } catch (error) {

    console.warn(
      "저장 지역을 읽지 못했습니다.",
      error
    );

  }

}


/* =========================================================
   16. API Key Validation
========================================================= */

/* =========================================================
   API Key Validation
   세 공공데이터 API Key가 모두 입력됐는지 확인합니다.
========================================================= */

function validateApiKeys() {

  const keys = [
    API_KEYS.goodPrice,
    API_KEYS.hygiene,
    API_KEYS.parking
  ];

  return keys.every((key) => {

    return (
      typeof key === "string"
      &&
      key.trim() !== ""
      &&
      !key.includes("YOUR_")
    );

  });

}


/* =========================================================
   17. Public Data Load
========================================================= */

async function loadPublicData() {

  showHomeLoading();

  DOM.searchLoading.hidden =
    false;


  if (
    !validateApiKeys()
  ) {

    const error =
      new Error(
        "공공데이터 인증키를 입력해주세요."
      );


    appState.errors.goodPrice =
      error;

    appState.errors.hygiene =
      error;

    appState.errors.parking =
      error;


    console.error(
      "PUBLIC_DATA_SERVICE_KEY를 설정해주세요."
    );


    showHomeError();

    DOM.searchLoading.hidden =
      true;

    return;

  }


  /* ---------------------------------
     착한가격업소는 핵심 데이터
  --------------------------------- */
  try {

    appState.loading.goodPrice =
      true;


    appState.raw.goodPrice =
      await fetchAllPages(
        API_CONFIG.goodPrice,
        "부산 착한가격업소"
      );


    console.log(
      "부산 착한가격업소 원본 데이터:",
      appState.raw.goodPrice
    );


    appState.restaurants =
      appState.raw.goodPrice
        .map(
          normalizeGoodPriceStore
        )
        .filter(Boolean);


    console.log(
      "정규화된 착한가격 음식점:",
      appState.restaurants
    );


    appState.errors.goodPrice =
      null;


    renderDistrictButtons();

    applySearchAndFilters();

    renderHomeRestaurants();

  } catch (error) {

    appState.errors.goodPrice =
      error;

    console.error(
      "착한가격업소 API 오류:",
      error
    );

    showHomeError();

  } finally {

    appState.loading.goodPrice =
      false;

  }


  /* 핵심 데이터가 없어도
     다른 API는 개발자 Console 확인을 위해 독립 호출 */


  /* ---------------------------------
     위생등급
  --------------------------------- */
  const hygienePromise =
    loadHygieneData();


  /* ---------------------------------
     공영주차장
  --------------------------------- */
  const parkingPromise =
    loadParkingData();


  await Promise.allSettled([
    hygienePromise,
    parkingPromise
  ]);


  await combineAllData();


  renderApplication();

}


/* =========================================================
   18. Hygiene API
========================================================= */

async function loadHygieneData() {

  try {

    appState.loading.hygiene =
      true;


    appState.raw.hygiene =
      await fetchAllPages(
        API_CONFIG.hygiene,
        "부산 위생등급업소"
      );


    console.log(
      "부산 위생등급업소 원본 데이터:",
      appState.raw.hygiene
    );


    appState.hygieneStores =
      appState.raw.hygiene
        .map(
          normalizeHygieneStore
        )
        .filter(Boolean);


    console.log(
      "정규화된 위생등급업소:",
      appState.hygieneStores
    );


    appState.errors.hygiene =
      null;

  } catch (error) {

    appState.errors.hygiene =
      error;


    console.error(
      "위생등급 API 오류:",
      error
    );

  } finally {

    appState.loading.hygiene =
      false;

  }

}


/* =========================================================
   19. Parking API
========================================================= */

async function loadParkingData() {

  try {

    appState.loading.parking =
      true;


    appState.raw.parking =
      await fetchAllPages(
        API_CONFIG.parking,
        "부산 공영주차장"
      );


    console.log(
      "부산 공영주차장 원본 데이터:",
      appState.raw.parking
    );


    appState.parkingLots =
      appState.raw.parking
        .map(
          normalizeParkingLot
        )
        .filter(Boolean);


    console.log(
      "정규화된 부산 공영주차장:",
      appState.parkingLots
    );


    appState.errors.parking =
      null;

  } catch (error) {

    appState.errors.parking =
      error;


    console.error(
      "공영주차장 API 오류:",
      error
    );

  } finally {

    appState.loading.parking =
      false;

  }

}


/* =========================================================
   20. Fetch All Pages
========================================================= */

async function fetchAllPages(
  config,
  label
) {

  const firstPage =
    await fetchPublicDataPage(
      config,
      1,
      label
    );


  const firstItems =
    firstPage.items;


  const totalCount =
    firstPage.totalCount;


  if (
    !totalCount
    ||
    totalCount <=
      config.pageSize
  ) {

    return firstItems;

  }


  const totalPages =
    Math.ceil(
      totalCount
      /
      config.pageSize
    );


  const allItems =
    [...firstItems];


  /* 한 번에 너무 많은 요청을 던지지 않고
     순차적으로 조회 */
  for (
    let page = 2;
    page <= totalPages;
    page += 1
  ) {

    const result =
      await fetchPublicDataPage(
        config,
        page,
        label
      );


    allItems.push(
      ...result.items
    );

  }


  return removeDuplicateItems(
    allItems
  );

}


/* =========================================================
   21. Fetch Public Data Page
========================================================= */

/* =========================================================
   Public Data API Page Request
   ---------------------------------------------------------
   공공데이터포털의 Encoding 인증키가
   URLSearchParams에 의해 이중 인코딩되지 않도록
   serviceKey는 URL 문자열에 직접 삽입합니다.
========================================================= */

/* =========================================================
   Public Data API Page Request
   ---------------------------------------------------------
   Encoding / Decoding 인증키 어느 쪽이 들어와도
   한 번만 URL 인코딩되도록 정규화합니다.
========================================================= */

async function fetchPublicDataPage(
  config,
  pageNo,
  label
) {

  const url =
    new URL(config.endpoint);


  /* ---------------------------------
     인증키 정규화

     Encoding Key:
     abc%2B123%3D
          ↓ decodeURIComponent()
     abc+123=

     Decoding Key:
     abc+123=
          ↓ 그대로 사용

     이후 URLSearchParams가 정확히 한 번 인코딩합니다.
  --------------------------------- */
  let serviceKey =
    String(config.serviceKey || "")
      .trim();


  try {

    if (serviceKey.includes("%")) {

      serviceKey =
        decodeURIComponent(
          serviceKey
        );

    }

  } catch (error) {

    console.warn(
      `[${label}] 인증키 디코딩을 건너뜁니다.`,
      error
    );

  }


  url.searchParams.set(
    "serviceKey",
    serviceKey
  );

  url.searchParams.set(
    "numOfRows",
    String(config.pageSize)
  );

  url.searchParams.set(
    "pageNo",
    String(pageNo)
  );


  Object.entries(
    config.params || {}
  ).forEach(
    ([key, value]) => {

      url.searchParams.set(
        key,
        value
      );

    }
  );


  console.log(
    `[${label}] ${pageNo}페이지 요청 URL:`,
    maskServiceKey(
      url.toString()
    )
  );


  const response =
    await fetchWithTimeout(
      url.toString(),
      `${label} / ${pageNo}페이지`
    );


  return extractPublicDataResponse(
    response
  );

}


/* =========================================================
   API Key Mask
   Console에 실제 인증키가 노출되지 않도록 처리
========================================================= */

function maskServiceKey(url) {

  return String(url).replace(
    /([?&]serviceKey=)[^&]+/i,
    "$1********"
  );

}

/* =========================================================
   22. Fetch Timeout
========================================================= */

async function fetchWithTimeout(
  url,
  label
) {

  const controller =
    new AbortController();


  const timeout =
    window.setTimeout(
      () => {

        controller.abort();

      },
      APP_CONFIG.requestTimeout
    );


  try {

    const response =
      await fetch(
        url,
        {
          signal:
            controller.signal
        }
      );


    if (!response.ok) {

      throw new Error(
        `${label} 요청 실패 (${response.status})`
      );

    }


    const text =
      await response.text();


    /* JSON 우선 */
    try {

      return JSON.parse(text);

    } catch (jsonError) {

      /* 문서 서비스는 XML도 지원하므로
         JSON이 아니면 XML fallback */
      if (
        text.trim()
          .startsWith("<")
      ) {

        return parseXmlDocument(
          text
        );

      }


      throw new Error(
        `${label} 응답 형식을 해석하지 못했습니다.`
      );

    }

  } catch (error) {

    if (
      error.name ===
      "AbortError"
    ) {

      throw new Error(
        `${label} 요청 시간이 초과되었습니다.`
      );

    }


    throw error;

  } finally {

    window.clearTimeout(
      timeout
    );

  }

}


/* =========================================================
   23. XML Parser
========================================================= */

function parseXmlDocument(xmlText) {

  const parser =
    new DOMParser();


  const xml =
    parser.parseFromString(
      xmlText,
      "application/xml"
    );


  const parserError =
    xml.querySelector(
      "parsererror"
    );


  if (parserError) {

    throw new Error(
      "XML 응답 파싱에 실패했습니다."
    );

  }


  const resultCode =
    xml.querySelector(
      "resultCode"
    )?.textContent?.trim();


  const resultMsg =
    xml.querySelector(
      "resultMsg"
    )?.textContent?.trim();


  const items =
    Array.from(
      xml.querySelectorAll(
        "items > item"
      )
    )
      .map((itemNode) => {

        const object = {};


        Array.from(
          itemNode.children
        )
          .forEach((child) => {

            object[
              child.tagName
            ] =
              child.textContent
                .trim();

          });


        return object;

      });


  const totalCount =
    parseNullableNumber(
      xml.querySelector(
        "totalCount"
      )?.textContent
    );


  return {

    response: {

      header: {
        resultCode,
        resultMsg
      },

      body: {
        items: {
          item: items
        },

        totalCount:
          totalCount
      }

    }

  };

}


/* =========================================================
   24. Extract Public Data Response
========================================================= */

function extractPublicDataResponse(
  data
) {

  const response =
    data?.response
    ||
    data;


  const header =
    response?.header
    ||
    data?.header
    ||
    {};


  const resultCode =
    String(
      header.resultCode
      ??
      header.resultcode
      ??
      ""
    );


  const resultMessage =
    header.resultMsg
    ??
    header.resultmsg
    ??
    "";


  if (
    resultCode
    &&
    resultCode !== "00"
  ) {

    throw new Error(
      resultMessage
      ||
      `공공데이터 오류 코드: ${resultCode}`
    );

  }


  const body =
    response?.body
    ||
    data?.body
    ||
    {};


  let items =
    body?.items?.item
    ??
    body?.items
    ??
    [];


  if (
    items
    &&
    !Array.isArray(items)
  ) {

    items = [items];

  }


  if (!Array.isArray(items)) {

    items = [];

  }


  const totalCount =
    parseNullableNumber(
      body.totalCount
      ??
      body.totalcount
    );


  return {

    items,

    totalCount:
      totalCount
      ??
      items.length

  };

}


/* =========================================================
   25. Remove Duplicate Items
========================================================= */

function removeDuplicateItems(items) {

  const result = [];

  const seen =
    new Set();


  items.forEach(
    (item, index) => {

      const key =
        item.idx
        ||
        item.mgntNum
        ||
        item.biz_nm
        ||
        JSON.stringify(item)
        ||
        String(index);


      if (
        seen.has(key)
      ) {
        return;
      }


      seen.add(key);

      result.push(item);

    }
  );


  return result;

}


/* =========================================================
   26. Normalize Good Price Store
========================================================= */

function normalizeGoodPriceStore(
  item
) {

  /* 문서상 음식점 코드 602 */
  if (
    String(item.cnCd || "")
    !==
    "602"
  ) {

    return null;

  }


  const name =
    cleanValue(item.sj);


  if (!name) {
    return null;
  }


  const address =
    cleanAddress(
      item.adres
    );


  const district =
    extractBusanDistrict(
      address
    );


  const dong =
    cleanValue(
      item.locale
    )
    ||
    extractDong(
      address
    );


  return {

    id:
      `restaurant-${cleanValue(
        item.idx
      ) || createSimpleId(name)}`,

    sourceId:
      cleanValue(
        item.idx
      ),

    name,

    ownerName:
      cleanValue(
        item.mNm
      ),

    address,

    district,

    dong,

    localeCode:
      cleanValue(
        item.localeCd
      ),

    phone:
      cleanValue(
        item.tel
      ),

    businessHours:
      cleanValue(
        item.bsnTime
      ),

    introduction:
      cleanIntroduction(
        item.intrcn
      ),

    hasOwnParking:
      parseOwnParking(
        item.parkngAt
      ),

    imageUrl1:
      normalizeImageUrl(
        item.imgFile1
      ),

    imageUrl2:
      normalizeImageUrl(
        item.imgFile2
      ),

    imageName1:
      cleanValue(
        item.imgName1
      ),

    imageName2:
      cleanValue(
        item.imgName2
      ),

    createdAt:
      cleanValue(
        item.creatDt
      ),

    hygiene: {

      matched: false,

      grade: "",

      phone: "",

      latitude: null,

      longitude: null

    },

    latitude: null,

    longitude: null,

    locationSource: "",

    distanceFromUser: null,

    nearbyParkingLots: [],

    nearestParking: null,

    source: item

  };

}


/* =========================================================
   27. Normalize Hygiene Store
========================================================= */

function normalizeHygieneStore(
  item
) {

  const name =
    cleanValue(
      item.biz_nm
    );


  const address =
    cleanAddress(
      item.addrs
    );


  if (
    !name
    &&
    !address
  ) {

    return null;

  }


  const coordinate =
    parsePointGeometry(
      item.geom
    );


  return {

    name,

    address,

    district:
      extractBusanDistrict(
        address
      ),

    dong:
      extractDong(
        address
      ),

    grade:
      cleanValue(
        item.region
      ),

    phone:
      cleanValue(
        item.biz_tel
      ),

    latitude:
      coordinate
        ?.latitude
        ??
        null,

    longitude:
      coordinate
        ?.longitude
        ??
        null,

    source: item

  };

}


/* =========================================================
   28. POINT Parser
   ---------------------------------------------------------
   예:
   POINT(128.8998465 35.08634202)

   순서:
   경도 → 위도
========================================================= */

function parsePointGeometry(
  value
) {

  const text =
    cleanValue(value);


  if (!text) {
    return null;
  }


  const match =
    text.match(
      /POINT\s*\(\s*([+-]?\d+(?:\.\d+)?)\s+([+-]?\d+(?:\.\d+)?)\s*\)/i
    );


  if (!match) {
    return null;
  }


  const longitude =
    Number(match[1]);

  const latitude =
    Number(match[2]);


  if (
    !isValidWgs84(
      latitude,
      longitude
    )
  ) {

    return null;

  }


  return {
    latitude,
    longitude
  };

}


/* =========================================================
   29. Normalize Parking Lot
========================================================= */

function normalizeParkingLot(
  item
) {

  const name =
    cleanValue(
      item.pkNam
    );


  if (!name) {
    return null;
  }


  const roadAddress =
    cleanValue(
      item.doroAddr
    );


  const jibunAddress =
    cleanValue(
      item.jibunAddr
    );


  /* 문서상 주소 명칭이 예제와 실제 내용상
     혼재할 수 있으므로 유효값을 우선 사용 */
  const address =
    chooseParkingAddress(
      roadAddress,
      jibunAddress
    );


  const rawX =
    parseNullableNumber(
      item.xCdnt
    );

  const rawY =
    parseNullableNumber(
      item.yCdnt
    );


  const coordinate =
    normalizeParkingCoordinate(
      rawX,
      rawY
    );


  return {

    id:
      `parking-${cleanValue(
        item.mgntNum
      ) || createSimpleId(name)}`,

    managementNumber:
      cleanValue(
        item.mgntNum
      ),

    name,

    agency:
      cleanValue(
        item.guNm
      ),

    address,

    roadAddress,

    jibunAddress,

    phone:
      cleanValue(
        item.tponNum
      ),

    type:
      cleanValue(
        item.pkFm
      ),

    parkingDivision:
      cleanValue(
        item.pkGubun
      ),

    totalSpaces:
      parseNullableNumber(
        item.pkCnt
      ),

    availableSpaces:
      parseRealtimeSpaces(
        item.currava
      ),

    weekdayOpen:
      cleanTimeValue(
        item.svcSrtTe
      ),

    weekdayClose:
      cleanTimeValue(
        item.svcEndTe
      ),

    saturdayOpen:
      cleanTimeValue(
        item.satSrtTe
      ),

    saturdayClose:
      cleanTimeValue(
        item.satEndTe
      ),

    holidayOpen:
      cleanTimeValue(
        item.hldSrtTe
      ),

    holidayClose:
      cleanTimeValue(
        item.hldEndTe
      ),

    grade:
      cleanValue(
        item.ldRtg
      ),

    basicFee:
      parseNullableNumber(
        item.tenMin
      ),

    dailyFee:
      parseNullableNumber(
        item.ftDay
      ),

    monthlyFee:
      parseNullableNumber(
        item.ftMon
      ),

    basicTime:
      parseNullableNumber(
        item.pkBascTime
      ),

    extraTime:
      parseNullableNumber(
        item.pkAddTime
      ),

    extraFee:
      parseNullableNumber(
        item.feeAdd
      ),

    dailyApplyTime:
      cleanValue(
        item.ftDayApplytime
      ),

    paymentMethod:
      cleanValue(
        item.payMtd
      ),

    specialNote:
      cleanValue(
        item.spclNote
      ),

    operatingDays:
      cleanValue(
        item.oprDay
      ),

    feeInfo:
      cleanValue(
        item.feeInfo
      ),

    operationType:
      cleanValue(
        item.oprt_fm
      ),

    finalDate:
      cleanValue(
        item.fnlDt
      ),

    latitude:
      coordinate
        ?.latitude
        ??
        null,

    longitude:
      coordinate
        ?.longitude
        ??
        null,

    locationSource:
      coordinate
        ? "api"
        : "",

    distance:
      null,

    isOpen:
      null,

    source: item

  };

}


/* =========================================================
   30. Parking Coordinate Validation
========================================================= */

function normalizeParkingCoordinate(
  x,
  y
) {

  if (
    x === null
    ||
    y === null
  ) {

    return null;

  }


  /* 문서 표기는 xCdnt=위도, yCdnt=경도이지만
     예제에는 평면좌표처럼 보이는 큰 값도 존재한다.
     정상 WGS84 범위일 때만 직접 사용한다. */


  /* Case 1
     x = 위도
     y = 경도 */
  if (
    isValidWgs84(
      x,
      y
    )
  ) {

    return {
      latitude: x,
      longitude: y
    };

  }


  /* Case 2
     실제 API가 반대로 제공될 가능성을 방어 */
  if (
    isValidWgs84(
      y,
      x
    )
  ) {

    return {
      latitude: y,
      longitude: x
    };

  }


  return null;

}


/* =========================================================
   31. Valid WGS84
========================================================= */

function isValidWgs84(
  latitude,
  longitude
) {

  return (
    Number.isFinite(latitude)
    &&
    Number.isFinite(longitude)
    &&
    latitude >= -90
    &&
    latitude <= 90
    &&
    longitude >= -180
    &&
    longitude <= 180
  );

}


/* =========================================================
   32. Combine Data
========================================================= */

async function combineAllData() {

  if (
    !appState.restaurants.length
  ) {
    return;
  }


  /* ---------------------------------
     위생등급 매칭
  --------------------------------- */
  if (
    appState.hygieneStores.length
  ) {

    matchHygieneStores();

  }


  /* ---------------------------------
     음식점 좌표
  --------------------------------- */
  await geocodeRestaurantCoordinates();


  /* ---------------------------------
     공영주차장 좌표
  --------------------------------- */
  await geocodeParkingCoordinates();


  /* ---------------------------------
     주차장 연결
  --------------------------------- */
  connectParkingLots();


  /* ---------------------------------
     현재 위치 거리
  --------------------------------- */
  updateUserDistances();


  renderDistrictButtons();

  applySearchAndFilters();

}


/* =========================================================
   33. Hygiene Matching
========================================================= */

function matchHygieneStores() {

  const normalizedHygiene =
    appState.hygieneStores
      .map((store) => ({

        ...store,

        normalizedName:
          normalizeBusinessName(
            store.name
          ),

        normalizedAddress:
          normalizeAddressForMatch(
            store.address
          )

      }));


  appState.restaurants
    .forEach((restaurant) => {

      const restaurantName =
        normalizeBusinessName(
          restaurant.name
        );


      const restaurantAddress =
        normalizeAddressForMatch(
          restaurant.address
        );


      const candidates =
        normalizedHygiene
          .filter(
            (store) => {

              return (
                store.normalizedName
                ===
                restaurantName
              );

            }
          );


      if (!candidates.length) {
        return;
      }


      let bestMatch = null;


      /* 이름 일치 + 주소 비교 */
      bestMatch =
        candidates.find(
          (store) => {

            return addressesProbablyMatch(
              restaurantAddress,
              store.normalizedAddress
            );

          }
        );


      /* 이름이 같고 후보가 1개뿐이며
         같은 구인 경우에만 보조 매칭 */
      if (
        !bestMatch
        &&
        candidates.length === 1
      ) {

        const candidate =
          candidates[0];


        if (
          restaurant.district
          &&
          candidate.district
          &&
          restaurant.district
          ===
          candidate.district
        ) {

          bestMatch =
            candidate;

        }

      }


      if (!bestMatch) {
        return;
      }


      restaurant.hygiene = {

        matched: true,

        grade:
          bestMatch.grade,

        phone:
          bestMatch.phone,

        latitude:
          bestMatch.latitude,

        longitude:
          bestMatch.longitude

      };


      /* 위생등급 데이터가 정상 좌표를 제공하면
         음식점 좌표로 우선 사용 */
      if (
        isValidWgs84(
          bestMatch.latitude,
          bestMatch.longitude
        )
      ) {

        restaurant.latitude =
          bestMatch.latitude;

        restaurant.longitude =
          bestMatch.longitude;

        restaurant.locationSource =
          "hygiene";

      }

    });

}


/* =========================================================
   34. Business Name Normalization
========================================================= */

function normalizeBusinessName(
  value
) {

  return String(value || "")
    .toLowerCase()
    .replace(
      /\([^)]*\)/g,
      ""
    )
    .replace(
      /[\s\-_.·ㆍ]/g,
      ""
    )
    .replace(
      /[^0-9a-z가-힣]/g,
      ""
    );

}


/* =========================================================
   35. Address Normalization
========================================================= */

function normalizeAddressForMatch(
  value
) {

  return String(value || "")
    .replace(
      /^\(\d{5}\)\s*/,
      ""
    )
    .replace(
      /\([^)]*\)/g,
      ""
    )
    .replace(
      /부산광역시/g,
      "부산"
    )
    .replace(
      /\s+/g,
      ""
    )
    .replace(
      /[,.-]/g,
      ""
    )
    .trim();

}


/* =========================================================
   36. Address Match
========================================================= */

function addressesProbablyMatch(
  addressA,
  addressB
) {

  if (
    !addressA
    ||
    !addressB
  ) {

    return false;

  }


  if (
    addressA === addressB
  ) {

    return true;

  }


  const shorter =
    addressA.length <
      addressB.length
      ?
      addressA
      :
      addressB;


  if (
    shorter.length >= 10
    &&
    (
      addressA.includes(shorter)
      ||
      addressB.includes(shorter)
    )
  ) {

    return true;

  }


  /* 앞부분 주요 주소 비교 */
  const prefixA =
    addressA.slice(0, 18);

  const prefixB =
    addressB.slice(0, 18);


  return (
    prefixA.length >= 10
    &&
    prefixA === prefixB
  );

}


/* =========================================================
   37. Initialize Kakao Map
========================================================= */

async function initializeKakaoMap() {

  if (
    appState.mapInitialized
  ) {

    return true;

  }


  DOM.mapLoading.hidden =
    false;

  DOM.mapError.hidden =
    true;


  try {

    if (
      !window.kakao
      ||
      !window.kakao.maps
    ) {

      throw new Error(
        "Kakao Maps SDK가 로드되지 않았습니다."
      );

    }


    await new Promise(
      (resolve) => {

        kakao.maps.load(
          resolve
        );

      }
    );


    const center =
      new kakao.maps.LatLng(

        APP_CONFIG
          .busanCenter
          .latitude,

        APP_CONFIG
          .busanCenter
          .longitude

      );


    appState.map =
      new kakao.maps.Map(
        DOM.kakaoMap,
        {
          center,
          level: 8
        }
      );


    appState.geocoder =
      new kakao.maps.services
        .Geocoder();


    kakao.maps.event.addListener(
      appState.map,
      "dragend",
      handleMapMoved
    );


    kakao.maps.event.addListener(
      appState.map,
      "zoom_changed",
      handleMapMoved
    );


    appState.mapInitialized =
      true;

    appState.errors.map =
      null;


    DOM.mapLoading.hidden =
      true;


    return true;

  } catch (error) {

    appState.errors.map =
      error;


    console.error(
      "Kakao Maps 오류:",
      error
    );


    DOM.mapLoading.hidden =
      true;

    DOM.mapError.hidden =
      false;


    return false;

  }

}


/* =========================================================
   38. Kakao Geocoder
========================================================= */

function geocodeAddress(address) {

  return new Promise(
    (resolve) => {

      if (
        !address
        ||
        !appState.geocoder
      ) {

        resolve(null);

        return;

      }


      appState.geocoder
        .addressSearch(

          address,

          (
            result,
            status
          ) => {

            if (
              status ===
                kakao.maps
                  .services
                  .Status
                  .OK
              &&
              result.length
            ) {

              const latitude =
                Number(
                  result[0].y
                );

              const longitude =
                Number(
                  result[0].x
                );


              if (
                isValidWgs84(
                  latitude,
                  longitude
                )
              ) {

                resolve({
                  latitude,
                  longitude
                });

                return;

              }

            }


            resolve(null);

          }

        );

    }
  );

}


/* =========================================================
   39. Restaurant Geocoding
========================================================= */

async function geocodeRestaurantCoordinates() {

  if (
    !appState.mapInitialized
  ) {
    return;
  }


  const targets =
    appState.restaurants
      .filter(
        (restaurant) => {

          return (
            !hasCoordinates(
              restaurant
            )
            &&
            restaurant.address
          );

        }
      )
      .slice(
        0,
        APP_CONFIG
          .restaurantGeocodeLimit
      );


  for (
    const restaurant
    of targets
  ) {

    const coordinate =
      await geocodeAddress(
        restaurant.address
      );


    if (!coordinate) {
      continue;
    }


    restaurant.latitude =
      coordinate.latitude;

    restaurant.longitude =
      coordinate.longitude;

    restaurant.locationSource =
      "kakao-geocoder";

  }

}


/* =========================================================
   40. Parking Geocoding
========================================================= */

async function geocodeParkingCoordinates() {

  if (
    !appState.mapInitialized
  ) {
    return;
  }


  const targets =
    appState.parkingLots
      .filter(
        (parking) => {

          return (
            !hasCoordinates(
              parking
            )
            &&
            parking.address
          );

        }
      )
      .slice(
        0,
        APP_CONFIG
          .parkingGeocodeLimit
      );


  for (
    const parking
    of targets
  ) {

    /* 공영주차장 주소 예제는
       "남구 ..."처럼 부산광역시가 생략될 수 있으므로 보완 */
    const address =
      parking.address
        .includes(
          "부산"
        )
        ?
        parking.address
        :
        `부산광역시 ${parking.address}`;


    const coordinate =
      await geocodeAddress(
        address
      );


    if (!coordinate) {
      continue;
    }


    parking.latitude =
      coordinate.latitude;

    parking.longitude =
      coordinate.longitude;

    parking.locationSource =
      "kakao-geocoder";

  }

}


/* =========================================================
   41. Connect Parking Lots
========================================================= */

function connectParkingLots() {

  const validParking =
    appState.parkingLots
      .filter(
        hasCoordinates
      );


  appState.restaurants
    .forEach((restaurant) => {

      if (
        !hasCoordinates(
          restaurant
        )
      ) {

        restaurant.nearbyParkingLots =
          [];

        restaurant.nearestParking =
          null;

        return;

      }


      const nearby =
        validParking
          .map((parking) => {

            const distance =
              calculateDistance(

                restaurant.latitude,

                restaurant.longitude,

                parking.latitude,

                parking.longitude

              );


            return {

              ...parking,

              distance,

              isOpen:
                getParkingOpenStatus(
                  parking
                )

            };

          })
          .filter(
            (parking) => {

              return (
                parking.distance !== null
                &&
                parking.distance <=
                  APP_CONFIG
                    .parkingRadius
              );

            }
          )
          .sort(
            compareParkingForRestaurant
          );


      restaurant.nearbyParkingLots =
        nearby;


      restaurant.nearestParking =
        nearby[0]
        ||
        null;

    });

}


/* =========================================================
   42. Parking Priority
========================================================= */

function compareParkingForRestaurant(
  a,
  b
) {

  /* 1. 거리 */
  const distanceDiff =
    (
      a.distance ?? Infinity
    )
    -
    (
      b.distance ?? Infinity
    );


  if (
    Math.abs(distanceDiff)
    > 100
  ) {

    return distanceDiff;

  }


  /* 2. 실시간 정보 */
  const realtimeA =
    a.availableSpaces !== null
      ? 1
      : 0;

  const realtimeB =
    b.availableSpaces !== null
      ? 1
      : 0;


  if (
    realtimeA !== realtimeB
  ) {

    return realtimeB
      -
      realtimeA;

  }


  /* 3. 운영 중 */
  const openA =
    a.isOpen === true
      ? 1
      : 0;

  const openB =
    b.isOpen === true
      ? 1
      : 0;


  return openB - openA;

}


/* =========================================================
   43. Haversine Distance
========================================================= */

function calculateDistance(
  latitude1,
  longitude1,
  latitude2,
  longitude2
) {

  if (
    ![
      latitude1,
      longitude1,
      latitude2,
      longitude2
    ].every(
      Number.isFinite
    )
  ) {

    return null;

  }


  const earthRadius =
    6371000;


  const lat1 =
    degreesToRadians(
      latitude1
    );

  const lat2 =
    degreesToRadians(
      latitude2
    );

  const deltaLatitude =
    degreesToRadians(
      latitude2
      -
      latitude1
    );

  const deltaLongitude =
    degreesToRadians(
      longitude2
      -
      longitude1
    );


  const a =
    Math.sin(
      deltaLatitude / 2
    ) ** 2
    +
    Math.cos(lat1)
    *
    Math.cos(lat2)
    *
    Math.sin(
      deltaLongitude / 2
    ) ** 2;


  const c =
    2
    *
    Math.atan2(
      Math.sqrt(a),
      Math.sqrt(1 - a)
    );


  return earthRadius * c;

}


function degreesToRadians(
  degrees
) {

  return (
    degrees
    *
    Math.PI
    /
    180
  );

}


/* =========================================================
   44. Has Coordinates
========================================================= */

function hasCoordinates(item) {

  return (
    Number.isFinite(
      item.latitude
    )
    &&
    Number.isFinite(
      item.longitude
    )
  );

}


/* =========================================================
   45. Current Location
========================================================= */

function requestCurrentLocation() {

  if (
    !navigator.geolocation
  ) {

    showToast(
      "이 브라우저에서는 위치 기능을 사용할 수 없습니다."
    );

    return;

  }


  showToast(
    "현재 위치를 확인하고 있습니다."
  );


  navigator.geolocation
    .getCurrentPosition(

      async (position) => {

        const latitude =
          position.coords
            .latitude;

        const longitude =
          position.coords
            .longitude;


        appState.currentLocation
          .latitude =
          latitude;

        appState.currentLocation
          .longitude =
          longitude;

        appState.currentLocation
          .permissionGranted =
          true;


        const insideBusan =
          isInsideBusan(
            latitude,
            longitude
          );


        appState.currentLocation
          .insideBusan =
          insideBusan;


        if (!insideBusan) {

          openModal(
            "outsideBusanModal"
          );

          return;

        }


        await reverseGeocodeLocation(
          latitude,
          longitude
        );


        DOM.distanceSortOption.hidden =
          false;


        updateUserDistances();


        appState.sortOption =
          "currentDistance";


        syncSortRadio();


        applySearchAndFilters();


        showToast(
          "부산 내 현재 위치를 기준으로 정렬했습니다."
        );


        if (
          appState.mapInitialized
        ) {

          const position =
            new kakao.maps.LatLng(
              latitude,
              longitude
            );


          appState.map.panTo(
            position
          );

          appState.map.setLevel(5);

        }

      },

      (error) => {

        console.warn(
          "현재 위치 확인 오류:",
          error
        );


        showToast(
          "현재 위치를 확인할 수 없습니다."
        );

      },

      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000
      }

    );

}


/* =========================================================
   46. Is Inside Busan
========================================================= */

function isInsideBusan(
  latitude,
  longitude
) {

  const bounds =
    APP_CONFIG
      .busanBounds;


  return (
    latitude >=
      bounds.minLatitude
    &&
    latitude <=
      bounds.maxLatitude
    &&
    longitude >=
      bounds.minLongitude
    &&
    longitude <=
      bounds.maxLongitude
  );

}


/* =========================================================
   47. Reverse Geocode Location
========================================================= */

function reverseGeocodeLocation(
  latitude,
  longitude
) {

  return new Promise(
    (resolve) => {

      if (
        !appState.geocoder
      ) {

        resolve();

        return;

      }


      appState.geocoder
        .coord2RegionCode(

          longitude,
          latitude,

          (
            result,
            status
          ) => {

            if (
              status ===
                kakao.maps
                  .services
                  .Status
                  .OK
            ) {

              const region =
                result.find(
                  (item) => {

                    return (
                      item.region_type
                      === "H"
                    );

                  }
                )
                ||
                result[0];


              if (region) {

                appState
                  .currentLocation
                  .district =
                  region
                    .region_2depth_name
                    || "";

                appState
                  .currentLocation
                  .dong =
                  region
                    .region_3depth_name
                    || "";

              }

            }


            resolve();

          }

        );

    }
  );

}


/* =========================================================
   48. Update User Distance
========================================================= */

function updateUserDistances() {

  const {
    latitude,
    longitude
  } =
    appState.currentLocation;


  if (
    !Number.isFinite(latitude)
    ||
    !Number.isFinite(longitude)
  ) {

    return;

  }


  appState.restaurants
    .forEach(
      (restaurant) => {

        if (
          !hasCoordinates(
            restaurant
          )
        ) {

          restaurant.distanceFromUser =
            null;

          return;

        }


        restaurant.distanceFromUser =
          calculateDistance(

            latitude,
            longitude,

            restaurant.latitude,
            restaurant.longitude

          );

      }
    );

}


/* =========================================================
   49. Region Modal
========================================================= */

function openRegionModal() {

  appState.temporaryRegion = {

    district:
      appState.region
        .district,

    dong:
      appState.region
        .dong

  };


  renderDistrictButtons();

  renderDongButtons();


  openModal(
    "regionModal"
  );

}


/* =========================================================
   50. District Buttons
========================================================= */

function renderDistrictButtons() {

  const districts =
    [
      ...new Set(
        appState.restaurants
          .map(
            (restaurant) =>
              restaurant.district
          )
          .filter(Boolean)
      )
    ]
      .sort(
        (a, b) =>
          a.localeCompare(
            b,
            "ko"
          )
      );


  DOM.districtButtonList
    .innerHTML = "";


  DOM.districtButtonList
    .appendChild(
      createRegionButton(
        "부산 전체",
        "",
        "district",
        appState
          .temporaryRegion
          .district === ""
      )
    );


  districts.forEach(
    (district) => {

      DOM.districtButtonList
        .appendChild(
          createRegionButton(
            district,
            district,
            "district",
            appState
              .temporaryRegion
              .district ===
              district
          )
        );

    }
  );

}


/* =========================================================
   51. Dong Buttons
========================================================= */

function renderDongButtons() {

  const district =
    appState
      .temporaryRegion
      .district;


  const dongs =
    [
      ...new Set(
        appState.restaurants
          .filter(
            (restaurant) => {

              return (
                !district
                ||
                restaurant.district
                === district
              );

            }
          )
          .map(
            (restaurant) =>
              restaurant.dong
          )
          .filter(Boolean)
      )
    ]
      .sort(
        (a, b) =>
          a.localeCompare(
            b,
            "ko"
          )
      );


  DOM.dongButtonList
    .innerHTML = "";


  DOM.dongButtonList
    .appendChild(
      createRegionButton(
        "전체",
        "",
        "dong",
        appState
          .temporaryRegion
          .dong === ""
      )
    );


  dongs.forEach(
    (dong) => {

      DOM.dongButtonList
        .appendChild(
          createRegionButton(
            dong,
            dong,
            "dong",
            appState
              .temporaryRegion
              .dong === dong
          )
        );

    }
  );

}


/* =========================================================
   52. Create Region Button
========================================================= */

function createRegionButton(
  text,
  value,
  type,
  active
) {

  const button =
    document.createElement(
      "button"
    );


  button.type = "button";

  button.className =
    "region-button";


  if (active) {

    button.classList.add(
      "is-active"
    );

  }


  button.textContent =
    text;


  if (
    type === "district"
  ) {

    button.dataset.district =
      value;

  } else {

    button.dataset.dong =
      value;

  }


  return button;

}


/* =========================================================
   53. Temporary District
========================================================= */

function selectTemporaryDistrict(
  district
) {

  appState
    .temporaryRegion
    .district =
    district;


  appState
    .temporaryRegion
    .dong =
    "";


  renderDistrictButtons();

  renderDongButtons();

}


/* =========================================================
   54. Temporary Dong
========================================================= */

function selectTemporaryDong(
  dong
) {

  appState
    .temporaryRegion
    .dong =
    dong;


  renderDongButtons();

}


/* =========================================================
   55. Region Reset
========================================================= */

function resetTemporaryRegion() {

  appState.temporaryRegion = {
    district: "",
    dong: ""
  };


  renderDistrictButtons();

  renderDongButtons();

}


/* =========================================================
   56. Apply Region
========================================================= */

function applyRegionSelection() {

  appState.region = {

    district:
      appState
        .temporaryRegion
        .district,

    dong:
      appState
        .temporaryRegion
        .dong

  };


  localStorage.setItem(
    STORAGE_KEYS
      .selectedRegion,
    JSON.stringify(
      appState.region
    )
  );


  updateRegionLabels();

  closeModal(
    "regionModal"
  );


  applySearchAndFilters();

  renderHomeRestaurants();


  moveMapToSelectedRegion();

}


/* =========================================================
   57. Region Labels
========================================================= */

function updateRegionLabels() {

  const regionText =
    createRegionText(
      appState.region
    );


  DOM.headerRegionText
    .textContent =
    regionText;


  DOM.searchRegionText
    .textContent =
    `부산광역시 ${regionText}`;


  DOM.homeSelectedRegion
    .textContent =
    `부산광역시 ${regionText}`;

}


/* =========================================================
   58. Region Text
========================================================= */

function createRegionText(region) {

  if (
    region.dong
  ) {

    return [
      region.district,
      region.dong
    ]
      .filter(Boolean)
      .join(" · ");

  }


  if (
    region.district
  ) {

    return region.district;

  }


  return "전체 지역";

}


/* =========================================================
   59. Search
========================================================= */

function handleHomeSearch(event) {

  event.preventDefault();


  const keyword =
    DOM.homeSearchInput
      .value
      .trim();


  if (!keyword) {
    return;
  }


  appState.searchKeyword =
    keyword;


  DOM.searchInput.value =
    keyword;


  saveRecentSearch(
    keyword
  );


  showScreen(
    "searchScreen"
  );


  applySearchAndFilters();

}


/* =========================================================
   60. Search Submit
========================================================= */

function handleSearchSubmit(event) {

  event.preventDefault();


  appState.searchKeyword =
    DOM.searchInput
      .value
      .trim();


  if (
    appState.searchKeyword
  ) {

    saveRecentSearch(
      appState.searchKeyword
    );

  }


  applySearchAndFilters();

}


/* =========================================================
   61. Search Input
========================================================= */

function handleSearchInput() {

  appState.searchKeyword =
    DOM.searchInput
      .value
      .trim();


  DOM.searchClearButton.hidden =
    !DOM.searchInput.value;


  applySearchAndFilters();

}


/* =========================================================
   62. Search / Filter Pipeline
========================================================= */

function applySearchAndFilters() {

  let result =
    [...appState.restaurants];


  result =
    filterBySelectedRegion(
      result
    );


  result =
    filterByKeyword(
      result
    );


  result =
    filterByHygiene(
      result
    );


  result =
    filterByOwnParking(
      result
    );


  result =
    filterByParkingDistance(
      result
    );


  result =
    filterByRealtimeParking(
      result
    );


  result =
    filterByFreeParking(
      result
    );


  result =
    filterByOpenParking(
      result
    );


  result =
    filterByParkingType(
      result
    );


  result =
    sortRestaurants(
      result
    );


  appState.filteredRestaurants =
    result;


  renderSearchResults();

  renderActiveFilters();

  renderMapData();

}


/* =========================================================
   63. Region Filter
========================================================= */

function filterBySelectedRegion(
  restaurants
) {

  const {
    district,
    dong
  } =
    appState.region;


  return restaurants.filter(
    (restaurant) => {

      if (
        district
        &&
        restaurant.district
        !==
        district
      ) {

        return false;

      }


      if (
        dong
        &&
        restaurant.dong
        !==
        dong
      ) {

        return false;

      }


      return true;

    }
  );

}


/* =========================================================
   64. Keyword Filter
========================================================= */

function filterByKeyword(
  restaurants
) {

  const keyword =
    normalizeSearchText(
      appState.searchKeyword
    );


  if (!keyword) {

    return restaurants;

  }


  return restaurants.filter(
    (restaurant) => {

      const text =
        normalizeSearchText(
          [
            restaurant.name,
            restaurant.address,
            restaurant.district,
            restaurant.dong
          ].join(" ")
        );


      return text.includes(
        keyword
      );

    }
  );

}


/* =========================================================
   65. Hygiene Filter
========================================================= */

function filterByHygiene(
  restaurants
) {

  const filter =
    appState.filters
      .hygiene;


  if (!filter) {

    return restaurants;

  }


  if (
    filter === "assigned"
  ) {

    return restaurants.filter(
      (restaurant) =>
        restaurant
          .hygiene
          .matched
    );

  }


  return restaurants.filter(
    (restaurant) => {

      return (
        restaurant
          .hygiene
          .matched
        &&
        restaurant
          .hygiene
          .grade ===
          filter
      );

    }
  );

}


/* =========================================================
   66. Own Parking Filter
========================================================= */

function filterByOwnParking(
  restaurants
) {

  const filter =
    appState.filters
      .ownParking;


  if (!filter) {

    return restaurants;

  }


  const target =
    filter === "true";


  return restaurants.filter(
    (restaurant) => {

      return (
        restaurant.hasOwnParking
        ===
        target
      );

    }
  );

}


/* =========================================================
   67. Parking Distance Filter
========================================================= */

function filterByParkingDistance(
  restaurants
) {

  const maxDistance =
    appState.filters
      .parkingDistance;


  if (!maxDistance) {

    return restaurants;

  }


  return restaurants.filter(
    (restaurant) => {

      return (
        restaurant.nearestParking
        &&
        restaurant
          .nearestParking
          .distance <=
          maxDistance
      );

    }
  );

}


/* =========================================================
   68. Realtime Parking Filter
========================================================= */

function filterByRealtimeParking(
  restaurants
) {

  if (
    !appState.filters
      .realtimeParkingOnly
  ) {

    return restaurants;

  }


  return restaurants.filter(
    (restaurant) => {

      return restaurant
        .nearbyParkingLots
        .some(
          (parking) => {

            return (
              parking
                .availableSpaces
              !==
              null
            );

          }
        );

    }
  );

}


/* =========================================================
   69. Free Parking Filter
========================================================= */

function filterByFreeParking(
  restaurants
) {

  if (
    !appState.filters
      .freeParkingOnly
  ) {

    return restaurants;

  }


  return restaurants.filter(
    (restaurant) => {

      return restaurant
        .nearbyParkingLots
        .some(
          isFreeParking
        );

    }
  );

}


/* =========================================================
   70. Open Parking Filter
========================================================= */

function filterByOpenParking(
  restaurants
) {

  if (
    !appState.filters
      .openParkingOnly
  ) {

    return restaurants;

  }


  return restaurants.filter(
    (restaurant) => {

      return restaurant
        .nearbyParkingLots
        .some(
          (parking) => {

            return (
              getParkingOpenStatus(
                parking
              )
              ===
              true
            );

          }
        );

    }
  );

}


/* =========================================================
   71. Parking Type Filter
========================================================= */

function filterByParkingType(
  restaurants
) {

  const types =
    appState.filters
      .parkingTypes;


  if (!types.length) {

    return restaurants;

  }


  return restaurants.filter(
    (restaurant) => {

      return restaurant
        .nearbyParkingLots
        .some(
          (parking) => {

            return types.includes(
              parking.type
            );

          }
        );

    }
  );

}


/* =========================================================
   72. Sort Restaurants
========================================================= */

function sortRestaurants(
  restaurants
) {

  const result =
    [...restaurants];


  switch (
    appState.sortOption
  ) {

    case "parkingDistance":

      result.sort(
        (a, b) => {

          return compareNullableNumbers(

            a.nearestParking
              ?.distance,

            b.nearestParking
              ?.distance

          );

        }
      );

      break;


    case "availableParking":

      result.sort(
        (a, b) => {

          return (
            getBestAvailableSpaces(
              b
            )
            -
            getBestAvailableSpaces(
              a
            )
          );

        }
      );

      break;


    case "name":

      result.sort(
        (a, b) => {

          return a.name.localeCompare(
            b.name,
            "ko"
          );

        }
      );

      break;


    case "currentDistance":

      result.sort(
        (a, b) => {

          return compareNullableNumbers(

            a.distanceFromUser,

            b.distanceFromUser

          );

        }
      );

      break;


    case "recommended":
    default:

      result.sort(
        (a, b) => {

          return (
            calculateRecommendationScore(
              b
            )
            -
            calculateRecommendationScore(
              a
            )
          );

        }
      );

  }


  return result;

}


/* =========================================================
   73. Recommendation Score
========================================================= */

function calculateRecommendationScore(
  restaurant
) {

  let score = 0;


  if (
    restaurant
      .hygiene
      .matched
  ) {

    score += 20;

  }


  if (
    restaurant
      .hygiene
      .grade ===
      "매우우수"
  ) {

    score += 10;

  }


  if (
    restaurant.hasOwnParking
    ===
    true
  ) {

    score += 25;

  }


  if (
    restaurant.nearestParking
  ) {

    const distance =
      restaurant
        .nearestParking
        .distance;


    if (
      distance <= 300
    ) {

      score += 20;

    }

    else if (
      distance <= 500
    ) {

      score += 14;

    }

    else if (
      distance <= 1000
    ) {

      score += 8;

    }

  }


  if (
    restaurant
      .nearbyParkingLots
      .some(
        (parking) => {

          return (
            parking
              .availableSpaces
            !==
            null
          );

        }
      )
  ) {

    score += 10;

  }


  if (
    restaurant
      .nearbyParkingLots
      .some(
        (parking) => {

          return (
            getParkingOpenStatus(
              parking
            )
            === true
          );

        }
      )
  ) {

    score += 10;

  }


  if (
    restaurant
      .nearbyParkingLots
      .some(
        isFreeParking
      )
  ) {

    score += 5;

  }


  return score;

}


/* =========================================================
   74. Best Realtime Spaces
========================================================= */

function getBestAvailableSpaces(
  restaurant
) {

  const values =
    restaurant
      .nearbyParkingLots
      .map(
        (parking) =>
          parking.availableSpaces
      )
      .filter(
        Number.isFinite
      );


  if (!values.length) {

    return -1;

  }


  return Math.max(
    ...values
  );

}


/* =========================================================
   75. Compare Nullable Number
========================================================= */

function compareNullableNumbers(
  a,
  b
) {

  if (
    !Number.isFinite(a)
    &&
    !Number.isFinite(b)
  ) {

    return 0;

  }


  if (
    !Number.isFinite(a)
  ) {

    return 1;

  }


  if (
    !Number.isFinite(b)
  ) {

    return -1;

  }


  return a - b;

}


/* =========================================================
   76. Quick Filter
========================================================= */

function handleQuickFilter(event) {

  const button =
    event.target.closest(
      ".filter-chip"
    );


  if (!button) {
    return;
  }


  const type =
    button.dataset
      .filterType;

  const value =
    button.dataset
      .filterValue;


  /* 단일 선택 성격 필터 */
  if (
    type === "hygiene"
    ||
    type === "hygieneGrade"
  ) {

    document
      .querySelectorAll(
        '#quickFilterList [data-filter-type="hygiene"], #quickFilterList [data-filter-type="hygieneGrade"]'
      )
      .forEach(
        (item) => {

          if (
            item !== button
          ) {

            item.classList.remove(
              "is-active"
            );

          }

        }
      );


    const next =
      !button.classList
        .contains(
          "is-active"
        );


    button.classList.toggle(
      "is-active",
      next
    );


    appState.filters.hygiene =
      next
        ?
        (
          type ===
          "hygiene"
            ?
            "assigned"
            :
            value
        )
        :
        "";

  }


  else if (
    type ===
    "ownParking"
  ) {

    const next =
      !button.classList
        .contains(
          "is-active"
        );


    button.classList.toggle(
      "is-active",
      next
    );


    appState.filters
      .ownParking =
      next
        ? "true"
        : "";

  }


  else if (
    type ===
    "parkingDistance"
  ) {

    const next =
      !button.classList
        .contains(
          "is-active"
        );


    button.classList.toggle(
      "is-active",
      next
    );


    appState.filters
      .parkingDistance =
      next
        ? Number(value)
        : null;

  }


  else if (
    type ===
    "realtimeParking"
  ) {

    button.classList.toggle(
      "is-active"
    );


    appState.filters
      .realtimeParkingOnly =
      button.classList
        .contains(
          "is-active"
        );

  }


  else if (
    type ===
    "freeParking"
  ) {

    button.classList.toggle(
      "is-active"
    );


    appState.filters
      .freeParkingOnly =
      button.classList
        .contains(
          "is-active"
        );

  }


  else if (
    type ===
    "openParking"
  ) {

    button.classList.toggle(
      "is-active"
    );


    appState.filters
      .openParkingOnly =
      button.classList
        .contains(
          "is-active"
        );

  }


  syncFilterControlsFromState();


  showScreen(
    "searchScreen"
  );


  applySearchAndFilters();

}


/* =========================================================
   77. Filter Modal Apply
========================================================= */

function applyFilterModal() {

  const hygiene =
    document.querySelector(
      'input[name="hygieneFilter"]:checked'
    );


  appState.filters.hygiene =
    hygiene?.value
    ||
    "";


  const ownParking =
    document.querySelector(
      'input[name="ownParkingFilter"]:checked'
    );


  appState.filters.ownParking =
    ownParking?.value
    ||
    "";


  const parkingDistance =
    document.querySelector(
      'input[name="parkingDistanceFilter"]:checked'
    );


  appState.filters.parkingDistance =
    parkingDistance?.value
      ?
      Number(
        parkingDistance.value
      )
      :
      null;


  appState.filters
    .realtimeParkingOnly =
    DOM.realtimeParkingFilter
      .checked;


  appState.filters
    .freeParkingOnly =
    DOM.freeParkingFilter
      .checked;


  appState.filters
    .openParkingOnly =
    DOM.openParkingFilter
      .checked;


  appState.filters.parkingTypes =
    Array.from(
      document.querySelectorAll(
        'input[name="parkingTypeFilter"]:checked'
      )
    )
      .map(
        (input) =>
          input.value
      );


  syncQuickFiltersFromState();


  closeModal(
    "filterModal"
  );


  applySearchAndFilters();

}


/* =========================================================
   78. Reset Filter Controls
========================================================= */

function resetFilterControls() {

  document
    .querySelectorAll(
      'input[name="hygieneFilter"]'
    )
    .forEach(
      (input) => {

        input.checked =
          input.value === "";

      }
    );


  document
    .querySelectorAll(
      'input[name="ownParkingFilter"]'
    )
    .forEach(
      (input) => {

        input.checked =
          input.value === "";

      }
    );


  document
    .querySelectorAll(
      'input[name="parkingDistanceFilter"]'
    )
    .forEach(
      (input) => {

        input.checked =
          input.value === "";

      }
    );


  DOM.realtimeParkingFilter
    .checked = false;

  DOM.freeParkingFilter
    .checked = false;

  DOM.openParkingFilter
    .checked = false;


  document
    .querySelectorAll(
      'input[name="parkingTypeFilter"]'
    )
    .forEach(
      (input) => {

        input.checked =
          false;

      }
    );

}


/* =========================================================
   79. Reset All Filters
========================================================= */

function resetAllFilters() {

  appState.filters = {

    hygiene: "",

    ownParking: "",

    parkingDistance: null,

    realtimeParkingOnly: false,

    freeParkingOnly: false,

    openParkingOnly: false,

    parkingTypes: []

  };


  resetFilterControls();

  syncQuickFiltersFromState();

  applySearchAndFilters();

}


/* =========================================================
   80. Sync Filter Controls
========================================================= */

function syncFilterControlsFromState() {

  const hygieneValue =
    appState.filters
      .hygiene;


  document
    .querySelectorAll(
      'input[name="hygieneFilter"]'
    )
    .forEach(
      (input) => {

        input.checked =
          input.value ===
          hygieneValue;

      }
    );


  document
    .querySelectorAll(
      'input[name="ownParkingFilter"]'
    )
    .forEach(
      (input) => {

        input.checked =
          input.value ===
          appState.filters
            .ownParking;

      }
    );


  document
    .querySelectorAll(
      'input[name="parkingDistanceFilter"]'
    )
    .forEach(
      (input) => {

        const target =
          appState.filters
            .parkingDistance
            ?
            String(
              appState.filters
                .parkingDistance
            )
            :
            "";


        input.checked =
          input.value === target;

      }
    );


  DOM.realtimeParkingFilter
    .checked =
    appState.filters
      .realtimeParkingOnly;


  DOM.freeParkingFilter
    .checked =
    appState.filters
      .freeParkingOnly;


  DOM.openParkingFilter
    .checked =
    appState.filters
      .openParkingOnly;


  document
    .querySelectorAll(
      'input[name="parkingTypeFilter"]'
    )
    .forEach(
      (input) => {

        input.checked =
          appState.filters
            .parkingTypes
            .includes(
              input.value
            );

      }
    );

}


/* =========================================================
   81. Sync Quick Filters
========================================================= */

function syncQuickFiltersFromState() {

  document
    .querySelectorAll(
      "#quickFilterList .filter-chip"
    )
    .forEach(
      (button) => {

        const type =
          button.dataset
            .filterType;

        const value =
          button.dataset
            .filterValue;


        let active = false;


        if (
          type === "hygiene"
        ) {

          active =
            appState.filters
              .hygiene ===
              "assigned";

        }


        else if (
          type ===
          "hygieneGrade"
        ) {

          active =
            appState.filters
              .hygiene === value;

        }


        else if (
          type ===
          "ownParking"
        ) {

          active =
            appState.filters
              .ownParking ===
              "true";

        }


        else if (
          type ===
          "parkingDistance"
        ) {

          active =
            appState.filters
              .parkingDistance ===
              Number(value);

        }


        else if (
          type ===
          "realtimeParking"
        ) {

          active =
            appState.filters
              .realtimeParkingOnly;

        }


        else if (
          type ===
          "freeParking"
        ) {

          active =
            appState.filters
              .freeParkingOnly;

        }


        else if (
          type ===
          "openParking"
        ) {

          active =
            appState.filters
              .openParkingOnly;

        }


        button.classList.toggle(
          "is-active",
          active
        );

      }
    );

}


/* =========================================================
   82. Active Filter Display
========================================================= */

function renderActiveFilters() {

  const labels = [];


  if (
    appState.filters
      .hygiene
  ) {

    labels.push(
      appState.filters
        .hygiene ===
        "assigned"
        ?
        "위생등급 지정"
        :
        appState.filters
          .hygiene
    );

  }


  if (
    appState.filters
      .ownParking ===
      "true"
  ) {

    labels.push(
      "자체주차 가능"
    );

  }


  if (
    appState.filters
      .ownParking ===
      "false"
  ) {

    labels.push(
      "자체주차 없음"
    );

  }


  if (
    appState.filters
      .parkingDistance
  ) {

    labels.push(
      `공영주차장 ${formatDistance(
        appState.filters
          .parkingDistance
      )}`
    );

  }


  if (
    appState.filters
      .realtimeParkingOnly
  ) {

    labels.push(
      "실시간 주차정보"
    );

  }


  if (
    appState.filters
      .freeParkingOnly
  ) {

    labels.push(
      "무료주차장"
    );

  }


  if (
    appState.filters
      .openParkingOnly
  ) {

    labels.push(
      "현재 운영중"
    );

  }


  appState.filters
    .parkingTypes
    .forEach(
      (type) => {

        labels.push(type);

      }
    );


  DOM.activeFilterBar.hidden =
    labels.length === 0;


  DOM.activeFilterList
    .innerHTML = "";


  labels.forEach(
    (label) => {

      const button =
        document.createElement(
          "button"
        );


      button.type = "button";

      button.textContent =
        label;


      DOM.activeFilterList
        .appendChild(
          button
        );

    }
  );

}


/* =========================================================
   83. Sort Change
========================================================= */

function handleSortChange(event) {

  appState.sortOption =
    event.target.value;


  updateSortLabel();


  closeModal(
    "sortModal"
  );


  applySearchAndFilters();

}


/* =========================================================
   84. Sort Label
========================================================= */

function updateSortLabel() {

  const labels = {

    recommended:
      "추천순",

    parkingDistance:
      "공영주차장 가까운 순",

    availableParking:
      "실시간 주차면 많은 순",

    name:
      "업소명순",

    currentDistance:
      "내 위치 가까운 순"

  };


  DOM.currentSortLabel
    .textContent =
    labels[
      appState.sortOption
    ]
    ||
    "추천순";

}


/* =========================================================
   85. Sync Sort Radio
========================================================= */

function syncSortRadio() {

  document
    .querySelectorAll(
      'input[name="sortOption"]'
    )
    .forEach(
      (input) => {

        input.checked =
          input.value ===
          appState.sortOption;

      }
    );


  updateSortLabel();

}


/* =========================================================
   86. Render Entire Application
========================================================= */

function renderApplication() {

  renderHomeRestaurants();

  renderParkingFriendlyRestaurants();

  renderHygieneRestaurants();

  applySearchAndFilters();

  renderSavedLists();

  renderMapData();

}


/* =========================================================
   87. Home State
========================================================= */

function hideHomeStates() {

  DOM.homeRestaurantLoading.hidden =
    true;

  DOM.homeRestaurantList.hidden =
    true;

  DOM.homeRestaurantEmpty.hidden =
    true;

  DOM.homeRestaurantError.hidden =
    true;

}


function showHomeLoading() {

  hideHomeStates();

  DOM.homeRestaurantLoading.hidden =
    false;

}


function showHomeError() {

  hideHomeStates();

  DOM.homeRestaurantError.hidden =
    false;

}


/* =========================================================
   88. Render Home Restaurants
========================================================= */

function renderHomeRestaurants() {

  hideHomeStates();


  if (
    appState.errors
      .goodPrice
    &&
    !appState
      .restaurants
      .length
  ) {

    showHomeError();

    return;

  }


  const restaurants =
    filterBySelectedRegion(
      [...appState.restaurants]
    )
      .sort(
        (a, b) => {

          return (
            calculateRecommendationScore(
              b
            )
            -
            calculateRecommendationScore(
              a
            )
          );

        }
      )
      .slice(
        0,
        APP_CONFIG
          .homeRestaurantLimit
      );


  if (!restaurants.length) {

    DOM.homeRestaurantEmpty
      .hidden =
      false;

    return;

  }


  DOM.homeRestaurantList
    .innerHTML = "";

  DOM.homeRestaurantList.hidden =
    false;


  restaurants.forEach(
    (restaurant) => {

      DOM.homeRestaurantList
        .appendChild(
          createRestaurantCard(
            restaurant
          )
        );

    }
  );

}


/* =========================================================
   89. Parking Friendly Restaurants
========================================================= */

function renderParkingFriendlyRestaurants() {

  DOM.parkingFriendlyList
    .innerHTML = "";


  const restaurants =
    filterBySelectedRegion(
      [...appState.restaurants]
    )
      .filter(
        (restaurant) => {

          return (
            restaurant
              .hasOwnParking ===
              true
            ||
            restaurant
              .nearestParking
          );

        }
      )
      .sort(
        (a, b) => {

          /* 자체주차를 우선 */
          const ownParkingDiff =
            Number(
              b.hasOwnParking
              === true
            )
            -
            Number(
              a.hasOwnParking
              === true
            );


          if (
            ownParkingDiff !== 0
          ) {

            return ownParkingDiff;

          }


          return compareNullableNumbers(

            a.nearestParking
              ?.distance,

            b.nearestParking
              ?.distance

          );

        }
      )
      .slice(
        0,
        APP_CONFIG
          .parkingFriendlyLimit
      );


  restaurants.forEach(
    (restaurant) => {

      DOM.parkingFriendlyList
        .appendChild(
          createRestaurantCard(
            restaurant
          )
        );

    }
  );

}


/* =========================================================
   90. Hygiene Restaurants
========================================================= */

function renderHygieneRestaurants() {

  DOM.hygieneRestaurantList
    .innerHTML = "";


  const restaurants =
    filterBySelectedRegion(
      [...appState.restaurants]
    )
      .filter(
        (restaurant) =>
          restaurant
            .hygiene
            .matched
      )
      .sort(
        (a, b) => {

          const priority = {
            매우우수: 2,
            우수: 1
          };


          return (
            (
              priority[
                b.hygiene.grade
              ]
              || 0
            )
            -
            (
              priority[
                a.hygiene.grade
              ]
              || 0
            )
          );

        }
      )
      .slice(
        0,
        APP_CONFIG
          .hygieneRestaurantLimit
      );


  restaurants.forEach(
    (restaurant) => {

      DOM.hygieneRestaurantList
        .appendChild(
          createRestaurantCard(
            restaurant
          )
        );

    }
  );

}


/* =========================================================
   91. Render Search Results
========================================================= */

function renderSearchResults() {

  DOM.searchLoading.hidden =
    true;

  DOM.searchError.hidden =
    true;

  DOM.searchResultList
    .innerHTML = "";


  const restaurants =
    appState.filteredRestaurants;


  DOM.searchResultCount
    .textContent =
    restaurants.length;


  DOM.searchEmpty.hidden =
    restaurants.length > 0;


  restaurants.forEach(
    (restaurant) => {

      DOM.searchResultList
        .appendChild(
          createRestaurantCard(
            restaurant
          )
        );

    }
  );

}


/* =========================================================
   92. Create Restaurant Card
========================================================= */

function createRestaurantCard(
  restaurant
) {

  const fragment =
    DOM.restaurantCardTemplate
      .content
      .cloneNode(true);


  const card =
    fragment.querySelector(
      ".restaurant-card"
    );


  card.dataset.restaurantId =
    restaurant.id;


  /* ---------------------------------
     Image
  --------------------------------- */
  const image =
    fragment.querySelector(
      ".restaurant-card__image-element"
    );


  const imagePlaceholder =
    fragment.querySelector(
      ".restaurant-card__image-placeholder"
    );


  setupRestaurantImage(
    image,
    imagePlaceholder,
    restaurant
  );


  /* ---------------------------------
     Badge
  --------------------------------- */
  const badgeList =
    fragment.querySelector(
      ".restaurant-card__badge-list"
    );


  addRestaurantBadges(
    badgeList,
    restaurant
  );


  /* ---------------------------------
     Name
  --------------------------------- */
  fragment.querySelector(
    ".restaurant-card__name"
  ).textContent =
    restaurant.name;


  /* ---------------------------------
     Region
  --------------------------------- */
  fragment.querySelector(
    ".restaurant-card__region"
  ).textContent =
    [
      restaurant.district,
      restaurant.dong
    ]
      .filter(Boolean)
      .join(" · ")
    ||
    "부산광역시";


  /* ---------------------------------
     Business Hours
  --------------------------------- */
  fragment.querySelector(
    ".restaurant-card__business-hours"
  ).textContent =
    restaurant.businessHours
    ||
    "영업시간 정보 없음";


  /* ---------------------------------
     Own Parking
  --------------------------------- */
  fragment.querySelector(
    ".restaurant-card__own-parking"
  ).textContent =
    formatOwnParking(
      restaurant
        .hasOwnParking
    );


  /* ---------------------------------
     Nearby Parking
  --------------------------------- */
  const parkingName =
    fragment.querySelector(
      ".restaurant-card__parking-name"
    );


  const parkingDistance =
    fragment.querySelector(
      ".restaurant-card__parking-distance"
    );


  const realtime =
    fragment.querySelector(
      ".restaurant-card__realtime"
    );


  const realtimeText =
    fragment.querySelector(
      ".restaurant-card__realtime-text"
    );


  if (
    restaurant.nearestParking
  ) {

    parkingName.textContent =
      restaurant
        .nearestParking
        .name;


    parkingDistance.textContent =
      formatDistance(
        restaurant
          .nearestParking
          .distance
      );


    if (
      restaurant
        .nearestParking
        .availableSpaces
      !==
      null
    ) {

      realtime.hidden =
        false;


      realtimeText.textContent =
        `실시간 ${restaurant.nearestParking.availableSpaces}면`;

    } else {

      realtime.hidden =
        true;

    }

  } else {

    parkingName.textContent =
      "주변 공영주차장 정보 없음";

    parkingDistance.textContent =
      "1km 이내 정보 없음";

    realtime.hidden =
      true;

  }


  /* ---------------------------------
     Favorite
  --------------------------------- */
  const favorite =
    fragment.querySelector(
      ".restaurant-card__favorite"
    );


  updateCardFavoriteButton(
    favorite,
    isRestaurantFavorite(
      restaurant.id
    )
  );


  return fragment;

}


/* =========================================================
   93. Restaurant Image
========================================================= */

function setupRestaurantImage(
  image,
  placeholder,
  restaurant
) {

  const imageUrl =
    restaurant.imageUrl1
    ||
    restaurant.imageUrl2;


  if (!imageUrl) {

    image.hidden = true;

    placeholder.hidden =
      false;

    return;

  }


  image.hidden = false;

  placeholder.hidden = true;

  image.src = imageUrl;

  image.alt =
    `${restaurant.name} 이미지`;


  image.onerror = () => {

    image.hidden = true;

    placeholder.hidden =
      false;

  };

}


/* =========================================================
   94. Restaurant Badges
========================================================= */

function addRestaurantBadges(
  container,
  restaurant
) {

  container.innerHTML = "";


  container.appendChild(
    createBadge(
      "착한가격",
      "badge--good-price"
    )
  );


  if (
    restaurant
      .hygiene
      .matched
  ) {

    container.appendChild(
      createBadge(
        restaurant
          .hygiene
          .grade
          ?
          `위생등급 ${restaurant.hygiene.grade}`
          :
          "위생등급 지정",
        "badge--hygiene"
      )
    );

  }


  if (
    restaurant.hasOwnParking
    ===
    true
  ) {

    container.appendChild(
      createBadge(
        "자체주차",
        "badge--parking"
      )
    );

  }

}


/* =========================================================
   95. Create Badge
========================================================= */

function createBadge(
  text,
  className
) {

  const span =
    document.createElement(
      "span"
    );


  span.className =
    `badge ${className}`;

  span.textContent =
    text;


  return span;

}


/* =========================================================
   96. Restaurant Detail
========================================================= */

function openRestaurantDetail(
  restaurantId
) {

  const restaurant =
    appState.restaurants.find(
      (item) => {

        return (
          item.id ===
          restaurantId
        );

      }
    );


  if (!restaurant) {

    const saved =
      appState.favorites
        .restaurants
        .find(
          (item) =>
            item.id ===
            restaurantId
        );


    if (!saved) {
      return;
    }


    appState.selectedRestaurant =
      saved;

  } else {

    appState.selectedRestaurant =
      restaurant;

  }


  renderRestaurantDetail(
    appState.selectedRestaurant
  );


  showScreen(
    "restaurantDetailScreen"
  );

}


/* =========================================================
   97. Render Restaurant Detail
========================================================= */

function renderRestaurantDetail(
  restaurant
) {

  setupRestaurantImage(

    DOM.restaurantDetailImage,

    DOM.restaurantImagePlaceholder,

    restaurant

  );


  addRestaurantBadges(
    DOM.restaurantBadgeList,
    restaurant
  );


  DOM.restaurantDetailName
    .textContent =
    restaurant.name;


  DOM.restaurantDetailRegion
    .textContent =
    [
      "부산광역시",
      restaurant.district,
      restaurant.dong
    ]
      .filter(Boolean)
      .join(" ");


  DOM.restaurantBusinessHours
    .textContent =
    restaurant.businessHours
    ||
    "정보 없음";


  DOM.restaurantOwnParking
    .textContent =
    formatOwnParking(
      restaurant
        .hasOwnParking
    );


  DOM.restaurantPhone
    .textContent =
    restaurant.phone
    ||
    "정보 없음";


  DOM.restaurantAddress
    .textContent =
    restaurant.address
    ||
    "주소 정보 없음";


  DOM.restaurantIntroduction
    .textContent =
    restaurant.introduction
    ||
    "소개 정보가 없습니다.";


  renderRestaurantHygiene(
    restaurant
  );


  renderNearbyParking(
    restaurant
  );


  updateRestaurantFavoriteDetail();

}


/* =========================================================
   98. Restaurant Hygiene Detail
========================================================= */

function renderRestaurantHygiene(
  restaurant
) {

  DOM.hygieneGradeError.hidden =
    true;


  if (
    appState.errors.hygiene
  ) {

    DOM.restaurantHygieneGrade
      .textContent =
      "정보 확인 불가";

    DOM.hygieneGradeError.hidden =
      false;

    return;

  }


  if (
    restaurant
      .hygiene
      .matched
  ) {

    DOM.restaurantHygieneGrade
      .textContent =
      restaurant
        .hygiene
        .grade
      ||
      "지정업소";

  } else {

    DOM.restaurantHygieneGrade
      .textContent =
      "위생등급 정보 없음";

  }

}


/* =========================================================
   99. Nearby Parking
========================================================= */

function renderNearbyParking(
  restaurant
) {

  DOM.nearbyParkingList
    .innerHTML = "";


  DOM.nearbyParkingLoading.hidden =
    true;

  DOM.nearbyParkingEmpty.hidden =
    true;

  DOM.nearbyParkingError.hidden =
    true;


  if (
    appState.errors.parking
    &&
    !appState.parkingLots.length
  ) {

    DOM.nearbyParkingError.hidden =
      false;

    return;

  }


  const parkingLots =
    restaurant
      .nearbyParkingLots
      .slice(
        0,
        APP_CONFIG
          .nearbyParkingLimit
      );


  if (!parkingLots.length) {

    DOM.nearbyParkingEmpty.hidden =
      false;

    return;

  }


  parkingLots.forEach(
    (parking) => {

      DOM.nearbyParkingList
        .appendChild(
          createParkingCard(
            parking
          )
        );

    }
  );

}


/* =========================================================
   100. Create Parking Card
========================================================= */

function createParkingCard(
  parking
) {

  const fragment =
    DOM.parkingCardTemplate
      .content
      .cloneNode(true);


  const card =
    fragment.querySelector(
      ".parking-card"
    );


  card.dataset.parkingId =
    parking.id;


  fragment.querySelector(
    ".parking-card__name"
  ).textContent =
    parking.name;


  fragment.querySelector(
    ".parking-card__distance"
  ).textContent =
    formatDistance(
      parking.distance
    );


  /* ---------------------------------
     실시간
  --------------------------------- */
  fragment.querySelector(
    ".parking-card__available"
  ).textContent =
    parking.availableSpaces !==
      null
      ?
      `${parking.availableSpaces}면`
      :
      "정보 없음";


  fragment.querySelector(
    ".parking-card__capacity-current"
  ).textContent =
    parking.availableSpaces !==
      null
      ?
      `실시간 ${parking.availableSpaces}면`
      :
      "실시간 정보 없음";


  fragment.querySelector(
    ".parking-card__capacity-total"
  ).textContent =
    parking.totalSpaces !==
      null
      ?
      `총 ${parking.totalSpaces}면`
      :
      "총 주차구획 정보 없음";


  /* ---------------------------------
     Fee
  --------------------------------- */
  fragment.querySelector(
    ".parking-card__fee"
  ).textContent =
    formatParkingBasicFee(
      parking
    );


  /* ---------------------------------
     Hours
  --------------------------------- */
  fragment.querySelector(
    ".parking-card__hours"
  ).textContent =
    formatCurrentParkingHours(
      parking
    );


  fragment.querySelector(
    ".parking-card__type"
  ).textContent =
    parking.type
    ||
    "유형 정보 없음";


  /* ---------------------------------
     Badges
  --------------------------------- */
  const badgeList =
    fragment.querySelector(
      ".parking-card__badges"
    );


  badgeList.appendChild(
    createBadge(
      "공영주차장",
      "badge--parking"
    )
  );


  if (
    parking.availableSpaces !==
    null
  ) {

    badgeList.appendChild(
      createBadge(
        `실시간 ${parking.availableSpaces}면`,
        "badge--realtime"
      )
    );

  }


  const open =
    getParkingOpenStatus(
      parking
    );


  if (
    open !== null
  ) {

    const badge =
      createBadge(
        open
          ? "운영 중"
          : "운영 종료",
        "badge--status"
      );


    badge.classList.add(
      open
        ? "is-open"
        : "is-closed"
    );


    badgeList.appendChild(
      badge
    );

  }


  /* ---------------------------------
     Favorite
  --------------------------------- */
  const favorite =
    fragment.querySelector(
      ".parking-card__favorite"
    );


  updateCardFavoriteButton(
    favorite,
    isParkingFavorite(
      parking.id
    )
  );


  return fragment;

}


/* =========================================================
   101. Parking Detail
========================================================= */

function openParkingDetail(
  parkingId
) {

  let parking = null;


  if (
    appState.selectedRestaurant
  ) {

    parking =
      appState
        .selectedRestaurant
        .nearbyParkingLots
        .find(
          (item) => {

            return (
              item.id ===
              parkingId
            );

          }
        );

  }


  if (!parking) {

    parking =
      appState.parkingLots
        .find(
          (item) =>
            item.id ===
            parkingId
        );

  }


  if (!parking) {

    parking =
      appState.favorites
        .parkingLots
        .find(
          (item) =>
            item.id ===
            parkingId
        );

  }


  if (!parking) {
    return;
  }


  appState.selectedParking =
    parking;


  renderParkingDetail(
    parking
  );


  showScreen(
    "parkingDetailScreen"
  );

}


/* =========================================================
   102. Render Parking Detail
========================================================= */

function renderParkingDetail(
  parking
) {

  DOM.parkingDetailName
    .textContent =
    parking.name;


  DOM.parkingDetailAgency
    .textContent =
    parking.agency
    ||
    "관리기관 정보 없음";


  const openStatus =
    getParkingOpenStatus(
      parking
    );


  DOM.parkingOpenStatusBadge
    .classList.remove(
      "is-open",
      "is-closed"
    );


  if (
    openStatus === true
  ) {

    DOM.parkingOpenStatusBadge
      .textContent =
      "운영 중";

    DOM.parkingOpenStatusBadge
      .classList.add(
        "is-open"
      );

  }

  else if (
    openStatus === false
  ) {

    DOM.parkingOpenStatusBadge
      .textContent =
      "운영 종료";

    DOM.parkingOpenStatusBadge
      .classList.add(
        "is-closed"
      );

  }

  else {

    DOM.parkingOpenStatusBadge
      .textContent =
      "운영시간 정보 없음";

  }


  DOM.parkingDistanceToRestaurant
    .textContent =
    formatDistance(
      parking.distance
    );


  /* ---------------------------------
     실시간
  --------------------------------- */
  if (
    parking.availableSpaces !==
    null
  ) {

    DOM.parkingRealtimeStatus
      .textContent =
      "실시간 제공";

    DOM.parkingAvailableSpaces
      .textContent =
      `${parking.availableSpaces}면`;

  } else {

    DOM.parkingRealtimeStatus
      .textContent =
      "정보 없음";

    DOM.parkingAvailableSpaces
      .textContent =
      "정보 없음";

  }


  DOM.parkingTotalSpaces
    .textContent =
    parking.totalSpaces !==
      null
      ?
      `${parking.totalSpaces}면`
      :
      "정보 없음";


  DOM.parkingDetailAddress
    .textContent =
    parking.address
    ||
    "주소 정보 없음";


  DOM.parkingPhone
    .textContent =
    parking.phone
      ?
      `전화 ${parking.phone}`
      :
      "전화번호 정보 없음";


  DOM.parkingType
    .textContent =
    parking.type
    ||
    "정보 없음";


  DOM.parkingOperationType
    .textContent =
    parking.operationType
    ||
    "정보 없음";


  DOM.parkingOperatingDays
    .textContent =
    parking.operatingDays
    ||
    "정보 없음";


  DOM.parkingFeeType
    .textContent =
    formatParkingFeeType(
      parking
    );


  DOM.parkingWeekdayHours
    .textContent =
    formatTimeRange(
      parking.weekdayOpen,
      parking.weekdayClose
    );


  DOM.parkingSaturdayHours
    .textContent =
    formatTimeRange(
      parking.saturdayOpen,
      parking.saturdayClose
    );


  DOM.parkingHolidayHours
    .textContent =
    formatTimeRange(
      parking.holidayOpen,
      parking.holidayClose
    );


  DOM.parkingBasicFee
    .textContent =
    formatParkingBasicFee(
      parking
    );


  DOM.parkingExtraFee
    .textContent =
    formatParkingExtraFee(
      parking
    );


  DOM.parkingDailyFee
    .textContent =
    parking.dailyFee !== null
      ?
      `${formatNumber(
        parking.dailyFee
      )}원`
      :
      "정보 없음";


  DOM.parkingPaymentMethod
    .textContent =
    parking.paymentMethod
    ||
    "정보 없음";


  if (
    parking.specialNote
  ) {

    DOM.parkingSpecialNoteSection
      .hidden =
      false;

    DOM.parkingSpecialNote
      .textContent =
      parking.specialNote;

  } else {

    DOM.parkingSpecialNoteSection
      .hidden =
      true;

  }


  DOM.parkingDataDate
    .textContent =
    parking.finalDate
    ||
    "정보 없음";


  updateEstimatedParkingFee(
    parking,
    60
  );


  updateParkingFavoriteDetail();

}


/* =========================================================
   103. Parking Time Selection
========================================================= */

function handleParkingTimeSelection(
  event
) {

  const button =
    event.target.closest(
      "[data-parking-minutes]"
    );


  if (!button) {
    return;
  }


  DOM.parkingTimeSelector
    .querySelectorAll(
      ".time-selector__button"
    )
    .forEach(
      (item) => {

        item.classList.remove(
          "is-active"
        );

      }
    );


  button.classList.add(
    "is-active"
  );


  updateEstimatedParkingFee(

    appState.selectedParking,

    Number(
      button.dataset
        .parkingMinutes
    )

  );

}


/* =========================================================
   104. Calculate Parking Fee
========================================================= */

function calculateParkingFee(
  parking,
  minutes
) {

  if (!parking) {
    return null;
  }


  if (
    isFreeParking(
      parking
    )
  ) {

    return 0;

  }


  if (
    parking.basicTime ===
      null
    ||
    parking.basicFee ===
      null
  ) {

    return null;

  }


  if (
    minutes <=
    parking.basicTime
  ) {

    return parking.basicFee;

  }


  if (
    parking.extraTime ===
      null
    ||
    parking.extraFee ===
      null
    ||
    parking.extraTime <= 0
  ) {

    return parking.basicFee;

  }


  const additionalMinutes =
    minutes
    -
    parking.basicTime;


  const units =
    Math.ceil(
      additionalMinutes
      /
      parking.extraTime
    );


  let total =
    parking.basicFee
    +
    (
      units
      *
      parking.extraFee
    );


  /* 일 주차권 요금이 유효하고
     0보다 큰 경우 상한선 참고 */
  if (
    parking.dailyFee !== null
    &&
    parking.dailyFee > 0
  ) {

    total =
      Math.min(
        total,
        parking.dailyFee
      );

  }


  return total;

}


/* =========================================================
   105. Estimated Fee UI
========================================================= */

function updateEstimatedParkingFee(
  parking,
  minutes
) {

  const fee =
    calculateParkingFee(
      parking,
      minutes
    );


  DOM.estimatedParkingFee
    .textContent =
    fee === null
      ?
      "계산할 수 없음"
      :
      `${formatNumber(
        fee
      )}원`;

}


/* =========================================================
   106. Parking Open Status
========================================================= */

function getParkingOpenStatus(
  parking
) {

  const now =
    new Date();


  const day =
    now.getDay();


  let start = "";

  let end = "";


  if (
    day === 6
  ) {

    start =
      parking.saturdayOpen;

    end =
      parking.saturdayClose;

  }

  else if (
    day === 0
  ) {

    start =
      parking.holidayOpen;

    end =
      parking.holidayClose;

  }

  else {

    start =
      parking.weekdayOpen;

    end =
      parking.weekdayClose;

  }


  if (
    !start
    ||
    !end
  ) {

    return null;

  }


  const startMinutes =
    timeToMinutes(
      start,
      false
    );


  const endMinutes =
    timeToMinutes(
      end,
      true
    );


  if (
    startMinutes === null
    ||
    endMinutes === null
  ) {

    return null;

  }


  const currentMinutes =
    (
      now.getHours()
      *
      60
    )
    +
    now.getMinutes();


  /* 00:00 ~ 24:00 */
  if (
    startMinutes === 0
    &&
    endMinutes === 1440
  ) {

    return true;

  }


  /* 익일 종료형 */
  if (
    endMinutes <
    startMinutes
  ) {

    return (
      currentMinutes >=
        startMinutes
      ||
      currentMinutes <=
        endMinutes
    );

  }


  return (
    currentMinutes >=
      startMinutes
    &&
    currentMinutes <
      endMinutes
  );

}


/* =========================================================
   107. Time Parser
========================================================= */

function timeToMinutes(
  value,
  allow24
) {

  const text =
    cleanValue(value);


  if (!text) {
    return null;
  }


  const match =
    text.match(
      /^(\d{1,2}):(\d{2})$/
    );


  if (!match) {
    return null;
  }


  const hour =
    Number(match[1]);

  const minute =
    Number(match[2]);


  if (
    allow24
    &&
    hour === 24
    &&
    minute === 0
  ) {

    return 1440;

  }


  if (
    hour < 0
    ||
    hour > 23
    ||
    minute < 0
    ||
    minute > 59
  ) {

    return null;

  }


  return (
    hour * 60
    +
    minute
  );

}


/* =========================================================
   108. Is Free Parking
========================================================= */

function isFreeParking(parking) {

  const feeInfo =
    String(
      parking.feeInfo || ""
    );


  if (
    feeInfo.includes(
      "무료"
    )
  ) {

    return true;

  }


  /* 요금 정보 필드는 '-'일 수 있으므로
     단순 기본요금 0만으로 무료를 확정하지 않고,
     추가요금도 0일 경우에만 보조 판단 */
  return (
    parking.basicFee === 0
    &&
    (
      parking.extraFee === 0
      ||
      parking.extraFee ===
        null
    )
  );

}


/* =========================================================
   109. Favorites
========================================================= */

function toggleRestaurantFavorite(
  restaurantId
) {

  const restaurant =
    appState.restaurants.find(
      (item) =>
        item.id ===
        restaurantId
    );


  if (!restaurant) {
    return;
  }


  const index =
    appState.favorites
      .restaurants
      .findIndex(
        (item) =>
          item.id ===
          restaurantId
      );


  if (
    index >= 0
  ) {

    appState.favorites
      .restaurants
      .splice(
        index,
        1
      );


    showToast(
      "저장에서 삭제했습니다."
    );

  } else {

    appState.favorites
      .restaurants
      .push(
        restaurant
      );


    showToast(
      "음식점을 저장했습니다."
    );

  }


  saveFavorites();

  renderApplication();

  updateRestaurantFavoriteDetail();

}


/* =========================================================
   110. Parking Favorite
========================================================= */

function toggleParkingFavorite(
  parkingId
) {

  const parking =
    findParkingById(
      parkingId
    );


  if (!parking) {
    return;
  }


  const index =
    appState.favorites
      .parkingLots
      .findIndex(
        (item) =>
          item.id ===
          parkingId
      );


  if (
    index >= 0
  ) {

    appState.favorites
      .parkingLots
      .splice(
        index,
        1
      );


    showToast(
      "저장에서 삭제했습니다."
    );

  } else {

    appState.favorites
      .parkingLots
      .push(
        parking
      );


    showToast(
      "주차장을 저장했습니다."
    );

  }


  saveFavorites();

  renderSavedLists();

  updateParkingFavoriteDetail();

}


/* =========================================================
   111. Save Favorites
========================================================= */

function saveFavorites() {

  localStorage.setItem(

    STORAGE_KEYS
      .favoriteRestaurants,

    JSON.stringify(
      appState.favorites
        .restaurants
    )

  );


  localStorage.setItem(

    STORAGE_KEYS
      .favoriteParkingLots,

    JSON.stringify(
      appState.favorites
        .parkingLots
    )

  );

}


/* =========================================================
   112. Favorite Check
========================================================= */

function isRestaurantFavorite(id) {

  return appState.favorites
    .restaurants
    .some(
      (item) =>
        item.id === id
    );

}


function isParkingFavorite(id) {

  return appState.favorites
    .parkingLots
    .some(
      (item) =>
        item.id === id
    );

}


/* =========================================================
   113. Card Favorite
========================================================= */

function updateCardFavoriteButton(
  button,
  favorite
) {

  button.classList.toggle(
    "is-active",
    favorite
  );


  button.textContent =
    favorite
      ? "♥"
      : "♡";


  button.setAttribute(
    "aria-pressed",
    String(favorite)
  );

}


/* =========================================================
   114. Restaurant Detail Favorite
========================================================= */

function updateRestaurantFavoriteDetail() {

  if (
    !appState.selectedRestaurant
  ) {
    return;
  }


  updateCardFavoriteButton(

    DOM.restaurantFavoriteButton,

    isRestaurantFavorite(
      appState
        .selectedRestaurant
        .id
    )

  );

}


/* =========================================================
   115. Parking Detail Favorite
========================================================= */

function updateParkingFavoriteDetail() {

  if (
    !appState.selectedParking
  ) {
    return;
  }


  updateCardFavoriteButton(

    DOM.parkingFavoriteButton,

    isParkingFavorite(
      appState
        .selectedParking
        .id
    )

  );

}


/* =========================================================
   116. Saved List
========================================================= */

function renderSavedLists() {

  DOM.savedRestaurantList
    .innerHTML = "";

  DOM.savedParkingList
    .innerHTML = "";


  const restaurants =
    appState.favorites
      .restaurants;


  const parkingLots =
    appState.favorites
      .parkingLots;


  DOM.savedRestaurantCount
    .textContent =
    restaurants.length;


  DOM.savedParkingCount
    .textContent =
    parkingLots.length;


  DOM.savedRestaurantEmpty.hidden =
    restaurants.length > 0;


  DOM.savedParkingEmpty.hidden =
    parkingLots.length > 0;


  restaurants.forEach(
    (restaurant) => {

      DOM.savedRestaurantList
        .appendChild(
          createRestaurantCard(
            restaurant
          )
        );

    }
  );


  parkingLots.forEach(
    (parking) => {

      DOM.savedParkingList
        .appendChild(
          createParkingCard(
            parking
          )
        );

    }
  );

}


/* =========================================================
   117. Saved Tab
========================================================= */

function switchSavedTab(type) {

  const restaurant =
    type === "restaurant";


  DOM.savedRestaurantTab
    .classList.toggle(
      "is-active",
      restaurant
    );

  DOM.savedParkingTab
    .classList.toggle(
      "is-active",
      !restaurant
    );


  DOM.savedRestaurantTab
    .setAttribute(
      "aria-selected",
      String(restaurant)
    );

  DOM.savedParkingTab
    .setAttribute(
      "aria-selected",
      String(!restaurant)
    );


  DOM.savedRestaurantPanel.hidden =
    !restaurant;

  DOM.savedParkingPanel.hidden =
    restaurant;

}


/* =========================================================
   118. Recent Search
========================================================= */

function getRecentSearches() {

  return readStorageArray(
    STORAGE_KEYS
      .recentSearches
  );

}


function saveRecentSearch(
  keyword
) {

  if (!keyword) {
    return;
  }


  let searches =
    getRecentSearches();


  searches =
    searches.filter(
      (item) =>
        item !== keyword
    );


  searches.unshift(
    keyword
  );


  searches =
    searches.slice(
      0,
      APP_CONFIG
        .recentSearchLimit
    );


  localStorage.setItem(

    STORAGE_KEYS
      .recentSearches,

    JSON.stringify(
      searches
    )

  );


  renderRecentSearches();

}


/* =========================================================
   119. Render Recent Search
========================================================= */

function renderRecentSearches() {

  const searches =
    getRecentSearches();


  DOM.recentSearchList
    .innerHTML = "";


  DOM.recentSearchArea.hidden =
    searches.length === 0;


  searches.forEach(
    (keyword) => {

      const button =
        document.createElement(
          "button"
        );


      button.type =
        "button";

      button.textContent =
        keyword;


      button.addEventListener(
        "click",
        () => {

          DOM.searchInput.value =
            keyword;

          appState.searchKeyword =
            keyword;


          showScreen(
            "searchScreen"
          );


          applySearchAndFilters();

        }
      );


      DOM.recentSearchList
        .appendChild(
          button
        );

    }
  );

}


/* =========================================================
   120. Clear Recent Search
========================================================= */

function clearRecentSearches() {

  localStorage.removeItem(
    STORAGE_KEYS
      .recentSearches
  );


  renderRecentSearches();

}


/* =========================================================
   121. Map Render
========================================================= */

function renderMapData() {

  if (
    !appState.mapInitialized
  ) {
    return;
  }


  clearMapOverlays();


  const restaurants =
    appState.filteredRestaurants
      .filter(
        hasCoordinates
      );


  restaurants.forEach(
    createRestaurantOverlay
  );


  /* 선택 음식점이 있으면 주변 주차장,
     아니면 검색 결과 음식점들의 가까운 주차장 */
  const parkingMap =
    new Map();


  if (
    appState.selectedRestaurant
    &&
    appState.selectedRestaurant
      .nearbyParkingLots
  ) {

    appState
      .selectedRestaurant
      .nearbyParkingLots
      .forEach(
        (parking) => {

          parkingMap.set(
            parking.id,
            parking
          );

        }
      );

  } else {

    restaurants.forEach(
      (restaurant) => {

        restaurant
          .nearbyParkingLots
          .slice(0, 2)
          .forEach(
            (parking) => {

              parkingMap.set(
                parking.id,
                parking
              );

            }
          );

      }
    );

  }


  [...parkingMap.values()]
    .filter(
      hasCoordinates
    )
    .forEach(
      createParkingOverlay
    );


  DOM.mapResultCount
    .textContent =
    `${restaurants.length}곳`;


  DOM.mapResultList
    .innerHTML = "";


  restaurants
    .slice(0, 30)
    .forEach(
      (restaurant) => {

        DOM.mapResultList
          .appendChild(
            createRestaurantCard(
              restaurant
            )
          );

      }
    );

}


/* =========================================================
   122. Restaurant Map Overlay
========================================================= */

function createRestaurantOverlay(
  restaurant
) {

  const element =
    document.createElement(
      "button"
    );


  element.type =
    "button";

  element.textContent =
    "●";


  Object.assign(
    element.style,
    {
      width: "38px",
      height: "38px",

      border: "3px solid #ffffff",
      borderRadius: "50%",

      background: "#2563eb",

      color: "#ffffff",

      boxShadow:
        "0 4px 12px rgba(15,23,42,.2)",

      fontSize: "12px",

      cursor: "pointer"
    }
  );


  element.title =
    restaurant.name;


  element.addEventListener(
    "click",
    () => {

      openRestaurantDetail(
        restaurant.id
      );

    }
  );


  const position =
    new kakao.maps.LatLng(

      restaurant.latitude,

      restaurant.longitude

    );


  const overlay =
    new kakao.maps.CustomOverlay({

      map:
        appState.map,

      position,

      content:
        element,

      yAnchor:
        1

    });


  appState
    .restaurantOverlays
    .push(
      overlay
    );

}


/* =========================================================
   123. Parking Map Overlay
========================================================= */

function createParkingOverlay(
  parking
) {

  const element =
    document.createElement(
      "button"
    );


  element.type =
    "button";

  element.textContent =
    parking.availableSpaces !==
      null
      ?
      `P ${parking.availableSpaces}`
      :
      "P";


  Object.assign(
    element.style,
    {
      minWidth: "34px",
      height: "32px",

      padding: "0 7px",

      border: "2px solid #ffffff",
      borderRadius: "9px",

      background: "#0f766e",

      color: "#ffffff",

      boxShadow:
        "0 4px 12px rgba(15,23,42,.18)",

      fontSize: "10px",
      fontWeight: "800",

      cursor: "pointer"
    }
  );


  element.title =
    parking.name;


  element.addEventListener(
    "click",
    () => {

      openParkingDetail(
        parking.id
      );

    }
  );


  const position =
    new kakao.maps.LatLng(

      parking.latitude,

      parking.longitude

    );


  const overlay =
    new kakao.maps.CustomOverlay({

      map:
        appState.map,

      position,

      content:
        element,

      yAnchor:
        1

    });


  appState
    .parkingOverlays
    .push(
      overlay
    );

}


/* =========================================================
   124. Clear Map
========================================================= */

function clearMapOverlays() {

  appState
    .restaurantOverlays
    .forEach(
      (overlay) =>
        overlay.setMap(null)
    );


  appState
    .parkingOverlays
    .forEach(
      (overlay) =>
        overlay.setMap(null)
    );


  appState.restaurantOverlays =
    [];

  appState.parkingOverlays =
    [];

}


/* =========================================================
   125. Refresh Map
========================================================= */

function refreshMap() {

  if (
    !appState.mapInitialized
  ) {

    initializeKakaoMap()
      .then(
        () => {

          renderMapData();

        }
      );

    return;

  }


  window.setTimeout(
    () => {

      appState.map.relayout();

      renderMapData();

    },
    50
  );

}


/* =========================================================
   126. Map Moved
========================================================= */

function handleMapMoved() {

  if (
    !appState.map
  ) {
    return;
  }


  const center =
    appState.map
      .getCenter();


  const insideBusan =
    isInsideBusan(

      center.getLat(),

      center.getLng()

    );


  DOM.outsideBusanMessage.hidden =
    insideBusan;


  DOM.mapResearchButton.hidden =
    !insideBusan;

}


/* =========================================================
   127. Search Current Map Area
========================================================= */

function searchCurrentMapArea() {

  if (
    !appState.map
  ) {
    return;
  }


  const center =
    appState.map
      .getCenter();


  const latitude =
    center.getLat();

  const longitude =
    center.getLng();


  if (
    !isInsideBusan(
      latitude,
      longitude
    )
  ) {

    DOM.outsideBusanMessage.hidden =
      false;

    return;

  }


  const result =
    appState.restaurants
      .filter(
        hasCoordinates
      )
      .map(
        (restaurant) => {

          return {

            restaurant,

            distance:
              calculateDistance(

                latitude,

                longitude,

                restaurant.latitude,

                restaurant.longitude

              )

          };

        }
      )
      .filter(
        (item) => {

          return (
            item.distance !==
              null
            &&
            item.distance <=
              3000
          );

        }
      )
      .sort(
        (a, b) =>
          a.distance
          -
          b.distance
      )
      .map(
        (item) =>
          item.restaurant
      );


  appState.filteredRestaurants =
    result;


  DOM.mapResearchButton.hidden =
    true;


  renderMapData();

}


/* =========================================================
   128. Map Search
========================================================= */

function handleMapSearch(event) {

  event.preventDefault();


  const keyword =
    DOM.mapSearchInput
      .value
      .trim();


  if (!keyword) {
    return;
  }


  appState.searchKeyword =
    keyword;


  DOM.searchInput.value =
    keyword;


  saveRecentSearch(
    keyword
  );


  applySearchAndFilters();


  const first =
    appState.filteredRestaurants
      .find(
        hasCoordinates
      );


  if (
    first
    &&
    appState.map
  ) {

    appState.map.panTo(
      new kakao.maps.LatLng(

        first.latitude,

        first.longitude

      )
    );


    appState.map.setLevel(5);

  }

}


/* =========================================================
   129. Move Map Busan
========================================================= */

function moveMapToBusan() {

  if (
    !appState.map
  ) {
    return;
  }


  appState.map.setCenter(

    new kakao.maps.LatLng(

      APP_CONFIG
        .busanCenter
        .latitude,

      APP_CONFIG
        .busanCenter
        .longitude

    )

  );


  appState.map.setLevel(8);


  DOM.outsideBusanMessage.hidden =
    true;

  DOM.mapResearchButton.hidden =
    true;

}


/* =========================================================
   130. Move Map Selected Region
========================================================= */

async function moveMapToSelectedRegion() {

  if (
    !appState.mapInitialized
    ||
    !appState.map
  ) {
    return;
  }


  if (
    !appState.region.district
  ) {

    moveMapToBusan();

    return;

  }


  const query =
    [
      "부산광역시",
      appState.region.district,
      appState.region.dong
    ]
      .filter(Boolean)
      .join(" ");


  const coordinate =
    await geocodeAddress(
      query
    );


  if (!coordinate) {
    return;
  }


  appState.map.panTo(

    new kakao.maps.LatLng(

      coordinate.latitude,

      coordinate.longitude

    )

  );


  appState.map.setLevel(
    appState.region.dong
      ? 5
      : 7
  );

}


/* =========================================================
   131. Restaurant Map
========================================================= */

function openSelectedRestaurantOnMap() {

  const restaurant =
    appState.selectedRestaurant;


  if (
    !restaurant
    ||
    !hasCoordinates(
      restaurant
    )
  ) {

    showToast(
      "지도에서 표시할 위치 정보가 없습니다."
    );

    return;

  }


  showScreen(
    "mapScreen"
  );


  window.setTimeout(
    () => {

      appState.map.panTo(

        new kakao.maps.LatLng(

          restaurant.latitude,

          restaurant.longitude

        )

      );


      appState.map.setLevel(4);


      renderMapData();

    },
    100
  );

}


/* =========================================================
   132. Kakao Directions
========================================================= */

function openParkingDirections() {

  const parking =
    appState.selectedParking;


  if (
    !parking
    ||
    !hasCoordinates(
      parking
    )
  ) {

    showToast(
      "길찾기에 필요한 주차장 좌표가 없습니다."
    );

    return;

  }


  const name =
    encodeURIComponent(
      parking.name
    );


  const url =
    `https://map.kakao.com/link/to/${name},${parking.latitude},${parking.longitude}`;


  window.open(
    url,
    "_blank",
    "noopener"
  );

}


/* =========================================================
   133. Find Parking
========================================================= */

function findParkingById(
  parkingId
) {

  const original =
    appState.parkingLots
      .find(
        (parking) => {

          return (
            parking.id ===
            parkingId
          );

        }
      );


  if (original) {

    return original;

  }


  for (
    const restaurant
    of appState.restaurants
  ) {

    const parking =
      restaurant
        .nearbyParkingLots
        .find(
          (item) => {

            return (
              item.id ===
              parkingId
            );

          }
        );


    if (parking) {

      return parking;

    }

  }


  return appState.favorites
    .parkingLots
    .find(
      (parking) =>
        parking.id ===
        parkingId
    )
    ||
    null;

}


/* =========================================================
   134. Modal
========================================================= */

function openModal(modalId) {

  const modal =
    document.getElementById(
      modalId
    );


  if (!modal) {
    return;
  }


  modal.hidden = false;


  document.body.style
    .overflow =
    "hidden";

}


function closeModal(modalId) {

  const modal =
    document.getElementById(
      modalId
    );


  if (!modal) {
    return;
  }


  modal.hidden = true;


  document.body.style
    .overflow =
    "";

}


/* =========================================================
   135. Network
========================================================= */

function handleNetworkStatus() {

  DOM.networkOfflineMessage
    .hidden =
    navigator.onLine;

}


/* =========================================================
   136. Toast
========================================================= */

let toastTimer = null;


function showToast(message) {

  window.clearTimeout(
    toastTimer
  );


  DOM.toastMessage
    .textContent =
    message;


  DOM.toast.hidden =
    false;


  toastTimer =
    window.setTimeout(
      () => {

        DOM.toast.hidden =
          true;

      },
      2200
    );

}


/* =========================================================
   137. Clean Value
   ---------------------------------------------------------
   공공데이터의 "-", 공백 등을 결측으로 처리
========================================================= */

function cleanValue(value) {

  if (
    value === null
    ||
    value === undefined
  ) {

    return "";

  }


  const text =
    String(value)
      .trim();


  if (
    !text
    ||
    text === "-"
    ||
    text.toLowerCase()
      === "null"
  ) {

    return "";

  }


  return decodeHtmlEntities(
    text
  );

}


/* =========================================================
   138. Introduction Cleaner
========================================================= */

function cleanIntroduction(value) {

  const decoded =
    decodeHtmlEntities(
      String(value || "")
    );


  if (!decoded) {

    return "";

  }


  const container =
    document.createElement(
      "div"
    );


  container.innerHTML =
    decoded;


  /* script/style/form 관련 요소 제거 */
  container
    .querySelectorAll(
      "script, style, input, button, form, textarea, select"
    )
    .forEach(
      (element) =>
        element.remove()
    );


  return container
    .textContent
    .replace(
      /\u00a0/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


/* =========================================================
   139. Decode HTML Entities
========================================================= */

function decodeHtmlEntities(
  value
) {

  if (!value) {
    return "";
  }


  const textarea =
    document.createElement(
      "textarea"
    );


  textarea.innerHTML =
    value;


  return textarea.value;

}


/* =========================================================
   140. Clean Address
========================================================= */

function cleanAddress(value) {

  return cleanValue(value)
    .replace(
      /^\(\d{5}\)\s*/,
      ""
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();

}


/* =========================================================
   141. Image URL
========================================================= */

function normalizeImageUrl(value) {

  let url =
    cleanValue(value);


  if (!url) {
    return "";
  }


  url =
    url.replace(
      /&amp;/g,
      "&"
    );


  if (
    url.startsWith("//")
  ) {

    return `https:${url}`;

  }


  if (
    /^https?:\/\//i
      .test(url)
  ) {

    return url;

  }


  if (
    url.startsWith(
      "busan.go.kr"
    )
  ) {

    return `https://${url}`;

  }


  return url;

}


/* =========================================================
   142. Own Parking
========================================================= */

function parseOwnParking(value) {

  const text =
    cleanValue(value)
      .toUpperCase();


  if (
    text === "Y"
    ||
    text === "YES"
    ||
    text === "가능"
  ) {

    return true;

  }


  if (
    text === "N"
    ||
    text === "NO"
    ||
    text === "불가"
  ) {

    return false;

  }


  return null;

}


function formatOwnParking(value) {

  if (
    value === true
  ) {

    return "자체주차 가능";

  }


  if (
    value === false
  ) {

    return "자체주차 없음";

  }


  return "자체주차 정보 없음";

}


/* =========================================================
   143. Realtime Parking Parser
========================================================= */

function parseRealtimeSpaces(value) {

  const text =
    cleanValue(value);


  if (!text) {
    return null;
  }


  const number =
    Number(
      String(text)
        .replace(
          /[^\d.-]/g,
          ""
        )
    );


  if (
    !Number.isFinite(number)
    ||
    number < 0
  ) {

    return null;

  }


  return number;

}


/* =========================================================
   144. Nullable Number
========================================================= */

function parseNullableNumber(
  value
) {

  const text =
    cleanValue(value);


  if (!text) {
    return null;
  }


  const number =
    Number(
      text.replace(
        /[^\d.-]/g,
        ""
      )
    );


  return Number.isFinite(
    number
  )
    ?
    number
    :
    null;

}


/* =========================================================
   145. Time Value Cleaner
========================================================= */

function cleanTimeValue(value) {

  const text =
    cleanValue(value);


  if (!text) {
    return "";
  }


  return text;

}


/* =========================================================
   146. Parking Address
========================================================= */

function chooseParkingAddress(
  address1,
  address2
) {

  if (
    address1
    &&
    address1 !== "-"
  ) {

    return address1;

  }


  if (
    address2
    &&
    address2 !== "-"
  ) {

    return address2;

  }


  return "";

}


/* =========================================================
   147. Extract District
========================================================= */

function extractBusanDistrict(
  address
) {

  const text =
    String(address || "");


  const match =
    text.match(
      /(중구|서구|동구|영도구|부산진구|동래구|남구|북구|해운대구|사하구|금정구|강서구|연제구|수영구|사상구|기장군)/
    );


  return match
    ? match[1]
    : "";

}


/* =========================================================
   148. Extract Dong
========================================================= */

function extractDong(address) {

  const text =
    String(address || "");


  const match =
    text.match(
      /([가-힣0-9]+(?:동|읍|면))/
    );


  return match
    ? match[1]
    : "";

}


/* =========================================================
   149. Search Text Normalizer
========================================================= */

function normalizeSearchText(value) {

  return String(value || "")
    .toLowerCase()
    .replace(
      /\s+/g,
      ""
    )
    .trim();

}


/* =========================================================
   150. Simple ID
========================================================= */

function createSimpleId(value) {

  return String(value || "")
    .replace(
      /[^0-9a-zA-Z가-힣]/g,
      ""
    )
    .slice(0, 30);

}


/* =========================================================
   151. Number Format
========================================================= */

function formatNumber(value) {

  if (
    value === null
    ||
    value === undefined
  ) {

    return "";

  }


  return Number(value)
    .toLocaleString(
      "ko-KR"
    );

}


/* =========================================================
   152. Distance Format
========================================================= */

function formatDistance(value) {

  if (
    !Number.isFinite(value)
  ) {

    return "거리 정보 없음";

  }


  if (
    value < 1000
  ) {

    return `${Math.round(
      value
    )}m`;

  }


  return `${(
    value / 1000
  ).toFixed(1)}km`;

}


/* =========================================================
   153. Time Range
========================================================= */

function formatTimeRange(
  start,
  end
) {

  if (
    !start
    ||
    !end
  ) {

    return "정보 없음";

  }


  return `${start} ~ ${end}`;

}


/* =========================================================
   154. Current Parking Hours
========================================================= */

function formatCurrentParkingHours(
  parking
) {

  const day =
    new Date().getDay();


  if (
    day === 6
  ) {

    return formatTimeRange(
      parking.saturdayOpen,
      parking.saturdayClose
    );

  }


  if (
    day === 0
  ) {

    return formatTimeRange(
      parking.holidayOpen,
      parking.holidayClose
    );

  }


  return formatTimeRange(
    parking.weekdayOpen,
    parking.weekdayClose
  );

}


/* =========================================================
   155. Parking Basic Fee
========================================================= */

function formatParkingBasicFee(
  parking
) {

  if (
    isFreeParking(
      parking
    )
  ) {

    return "무료";

  }


  if (
    parking.basicFee === null
  ) {

    return "요금 정보 없음";

  }


  if (
    parking.basicTime !== null
  ) {

    return (
      `${parking.basicTime}분 `
      +
      `${formatNumber(
        parking.basicFee
      )}원`
    );

  }


  return `${formatNumber(
    parking.basicFee
  )}원`;

}


/* =========================================================
   156. Parking Extra Fee
========================================================= */

function formatParkingExtraFee(
  parking
) {

  if (
    parking.extraFee ===
    null
  ) {

    return "정보 없음";

  }


  if (
    parking.extraTime !==
    null
  ) {

    return (
      `${parking.extraTime}분당 `
      +
      `${formatNumber(
        parking.extraFee
      )}원`
    );

  }


  return `${formatNumber(
    parking.extraFee
  )}원`;

}


/* =========================================================
   157. Parking Fee Type
========================================================= */

function formatParkingFeeType(
  parking
) {

  if (
    parking.feeInfo
  ) {

    return parking.feeInfo;

  }


  if (
    isFreeParking(
      parking
    )
  ) {

    return "무료";

  }


  if (
    parking.basicFee !==
    null
  ) {

    return "유료";

  }


  return "정보 없음";

}


/* =========================================================
   158. LocalStorage Read
========================================================= */

function readStorageArray(key) {

  try {

    const raw =
      localStorage.getItem(
        key
      );


    if (!raw) {
      return [];
    }


    const parsed =
      JSON.parse(raw);


    return Array.isArray(
      parsed
    )
      ?
      parsed
      :
      [];

  } catch (error) {

    console.warn(
      "LocalStorage 오류:",
      error
    );

    return [];

  }

}


/* =========================================================
   159. Debug Helper
   ---------------------------------------------------------
   브라우저 Console에서:

   parkingMealV2Debug()

   입력 시 현재 앱 상태를 확인할 수 있습니다.
========================================================= */

window.parkingMealV2Debug =
  function parkingMealV2Debug() {

    console.group(
      "주차한끼 Ver.2 Debug"
    );


    console.log(
      "선택 지역:",
      appState.region
    );

    console.log(
      "현재 위치:",
      appState.currentLocation
    );

    console.log(
      "착한가격 원본:",
      appState.raw.goodPrice
    );

    console.log(
      "위생등급 원본:",
      appState.raw.hygiene
    );

    console.log(
      "공영주차장 원본:",
      appState.raw.parking
    );

    console.log(
      "음식점:",
      appState.restaurants
    );

    console.log(
      "위생등급:",
      appState.hygieneStores
    );

    console.log(
      "공영주차장:",
      appState.parkingLots
    );

    console.log(
      "검색 결과:",
      appState.filteredRestaurants
    );

    console.log(
      "필터:",
      appState.filters
    );

    console.log(
      "선택 음식점:",
      appState.selectedRestaurant
    );

    console.log(
      "선택 주차장:",
      appState.selectedParking
    );

    console.log(
      "오류:",
      appState.errors
    );


    console.groupEnd();

  };