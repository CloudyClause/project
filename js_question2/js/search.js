"use strict";

/*
  true:
  모바일 기기의 현재 위치 사용

  false:
  서울역을 출발지로 고정
*/
const USE_CURRENT_LOCATION = true;

/*
  위치 조회 실패 시 사용할 서울역 좌표
*/
const SEOUL_STATION = {
  name: "서울역",
  latitude: 37.554648,
  longitude: 126.970606
};

/*
  JavaScript 키 전용 버전에서는 실제 길찾기 시간이
  아니므로 직선거리와 임시 평균속도로 예상합니다.
*/
const ESTIMATED_AVERAGE_SPEED_KMH = 25;

/* 화면 */
const searchScreen =
  document.getElementById("searchScreen");

const routeMapScreen =
  document.getElementById("routeMapScreen");

/* 검색 화면 요소 */
const searchBackButton =
  document.querySelector(".search-back-button");

const searchForm =
  document.querySelector(".search-form");

const searchInput =
  document.querySelector(".search-input");

const categoryButtons =
  document.querySelectorAll(".category-button");

const filterChips =
  document.querySelectorAll(".filter-chip");

const resultItems =
  document.querySelectorAll(".result-item");

const searchIssueButton =
  document.querySelector(".search-issue-button");

/* 지도 화면 요소 */
const routeBackButton =
  document.querySelector(".route-back-button");

const startNameElement =
  document.getElementById("startName");

const destinationNameElement =
  document.getElementById("destinationName");

const durationValueElement =
  document.getElementById("durationValue");

const distanceValueElement =
  document.getElementById("distanceValue");

const placeNameElement =
  document.getElementById("placeName");

const placeAddressElement =
  document.getElementById("placeAddress");

const placeLineElement =
  document.getElementById("placeLine");

const placeDistanceElement =
  document.getElementById("placeDistance");

const placeDetailButton =
  document.getElementById("placeDetailButton");

const mapLoading =
  document.getElementById("mapLoading");

const routeIssueButton =
  document.querySelector(".route-issue-button");

/* 카카오 지도 상태 */
let map = null;
let zoomControl = null;
let startMarker = null;
let destinationMarker = null;
let routePolyline = null;
let destinationOverlay = null;

let selectedDestination = null;
let currentStartPoint = null;

/*
  카카오 지도 SDK 준비 대기

  HTML에서 autoload=false를 사용하고 있으므로
  kakao.maps.load()가 완료된 뒤 지도 객체를 생성합니다.
*/
function loadKakaoMapSdk() {
  return new Promise(function (resolve, reject) {
    if (
      typeof window.kakao === "undefined" ||
      !window.kakao.maps ||
      typeof window.kakao.maps.load !== "function"
    ) {
      reject(
        new Error(
          "카카오 지도 SDK를 불러오지 못했습니다."
        )
      );
      return;
    }

    window.kakao.maps.load(function () {
      resolve();
    });
  });
}

/*
  검색 화면 표시
*/
function showSearchScreen() {
  routeMapScreen.classList.add("hidden");
  searchScreen.classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "auto"
  });
}

/*
  지도 화면 표시
*/
async function showRouteMapScreen(destination) {
  selectedDestination = destination;

  searchScreen.classList.add("hidden");
  routeMapScreen.classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "auto"
  });

  updateDestinationInformation(destination);

  durationValueElement.textContent = "계산 중";
  distanceValueElement.textContent = "계산 중";
  placeDistanceElement.textContent =
    "현재 위치에서 거리 계산 중";

  mapLoading.textContent =
    "현재 위치와 지도를 불러오는 중입니다.";

  mapLoading.classList.remove("hidden");

  try {
    /*
      숨겨져 있던 화면이 표시된 뒤
      카카오 SDK와 지도 컨테이너를 초기화합니다.
    */
    await waitForVisibleScreen();
    await loadKakaoMapSdk();

    initializeMap();

    currentStartPoint =
      await getCurrentPosition();

    startNameElement.textContent =
      currentStartPoint.name;

    clearPreviousRoute();

    createMarkers(
      currentStartPoint,
      selectedDestination
    );

    drawStraightRoute(
      currentStartPoint,
      selectedDestination
    );

    updateEstimatedRouteSummary(
      currentStartPoint,
      selectedDestination
    );

    mapLoading.classList.add("hidden");
  } catch (error) {
    console.error(
      "지도 초기화 오류:",
      error
    );

    mapLoading.textContent =
      error.message ||
      "지도 정보를 불러오지 못했습니다.";
  }
}

/*
  화면 표시 렌더링 대기
*/
function waitForVisibleScreen() {
  return new Promise(function (resolve) {
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(resolve);
    });
  });
}

/*
  선택한 목적지 정보 반영
*/
function updateDestinationInformation(destination) {
  destinationNameElement.textContent =
    destination.name;

  placeNameElement.textContent =
    destination.name;

  placeAddressElement.textContent =
    destination.address;

  placeLineElement.textContent =
    destination.line.replaceAll(",", " ·");
}

/*
  카카오 지도 초기화
*/
function initializeMap() {
  const mapContainer =
    document.getElementById("kakaoMap");

  if (!mapContainer) {
    throw new Error(
      "지도 영역을 찾지 못했습니다."
    );
  }

  /*
    지도 객체가 이미 있으면 다시 생성하지 않고
    컨테이너 크기만 재계산합니다.
  */
  if (map) {
    map.relayout();
    return;
  }

  const defaultCenter =
    new kakao.maps.LatLng(
      SEOUL_STATION.latitude,
      SEOUL_STATION.longitude
    );

  const mapOptions = {
    center: defaultCenter,
    level: 7
  };

  map = new kakao.maps.Map(
    mapContainer,
    mapOptions
  );

  map.setZoomable(true);
  map.setDraggable(true);

  /*
    카카오 지도에서 제공하는 기본 확대·축소 컨트롤입니다.
    별도의 아이콘 이미지가 필요하지 않습니다.
  */
  zoomControl =
    new kakao.maps.ZoomControl();

  map.addControl(
    zoomControl,
    kakao.maps.ControlPosition.RIGHT
  );

  map.relayout();
}

/*
  현재 위치 조회

  권한 거부, 타임아웃, 실행 환경 오류가 있으면
  서울역 좌표로 자동 대체합니다.
*/
function getCurrentPosition() {
  return new Promise(function (resolve) {
    if (
      !USE_CURRENT_LOCATION ||
      !navigator.geolocation
    ) {
      resolve({
        name: SEOUL_STATION.name,
        latitude: SEOUL_STATION.latitude,
        longitude: SEOUL_STATION.longitude
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      function (position) {
        resolve({
          name: "현재 위치",
          latitude:
            position.coords.latitude,
          longitude:
            position.coords.longitude
        });
      },

      function (error) {
        console.warn(
          "현재 위치 조회 실패. 서울역으로 대체합니다.",
          error
        );

        resolve({
          name: SEOUL_STATION.name,
          latitude: SEOUL_STATION.latitude,
          longitude: SEOUL_STATION.longitude
        });
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000
      }
    );
  });
}

/*
  기존 지도 객체 제거
*/
function clearPreviousRoute() {
  if (startMarker) {
    startMarker.setMap(null);
    startMarker = null;
  }

  if (destinationMarker) {
    destinationMarker.setMap(null);
    destinationMarker = null;
  }

  if (routePolyline) {
    routePolyline.setMap(null);
    routePolyline = null;
  }

  if (destinationOverlay) {
    destinationOverlay.setMap(null);
    destinationOverlay = null;
  }
}

/*
  카카오 기본 마커 생성

  marker-start.png 또는 marker-destination.png 같은
  별도 이미지 파일이 필요하지 않습니다.
*/
function createMarkers(start, destination) {
  const startPosition =
    new kakao.maps.LatLng(
      start.latitude,
      start.longitude
    );

  const destinationPosition =
    new kakao.maps.LatLng(
      destination.latitude,
      destination.longitude
    );

  startMarker =
    new kakao.maps.Marker({
      map: map,
      position: startPosition,
      title: start.name
    });

  destinationMarker =
    new kakao.maps.Marker({
      map: map,
      position: destinationPosition,
      title: destination.name
    });

  createDestinationOverlay(
    destinationPosition,
    destination
  );
}

/*
  목적지 정보창 생성
*/
function createDestinationOverlay(
  destinationPosition,
  destination
) {
  const overlayContent =
    document.createElement("div");

  overlayContent.className =
    "destination-overlay";

  const overlayTitle =
    document.createElement("strong");

  overlayTitle.textContent =
    destination.name;

  const overlayLine =
    document.createElement("span");

  overlayLine.textContent =
    destination.line.replaceAll(",", " ·");

  overlayContent.append(
    overlayTitle,
    overlayLine
  );

  destinationOverlay =
    new kakao.maps.CustomOverlay({
      map: map,
      position: destinationPosition,
      content: overlayContent,
      yAnchor: 1.55
    });
}

/*
  출발지와 목적지 직선 연결

  실제 지하철 노선 또는 도로 경로가 아니라
  두 좌표를 연결한 프로토타입용 안내선입니다.
*/
function drawStraightRoute(start, destination) {
  const startPosition =
    new kakao.maps.LatLng(
      start.latitude,
      start.longitude
    );

  const destinationPosition =
    new kakao.maps.LatLng(
      destination.latitude,
      destination.longitude
    );

  routePolyline =
    new kakao.maps.Polyline({
      map: map,

      path: [
        startPosition,
        destinationPosition
      ],

      strokeWeight: 6,
      strokeColor: "#005bff",
      strokeOpacity: 0.9,
      strokeStyle: "solid"
    });

  const bounds =
    new kakao.maps.LatLngBounds();

  bounds.extend(startPosition);
  bounds.extend(destinationPosition);

  map.relayout();

  map.setBounds(
    bounds,
    60,
    60,
    60,
    60
  );
}

/*
  직선거리 및 예상시간 표시
*/
function updateEstimatedRouteSummary(
  start,
  destination
) {
  const distance =
    calculateStraightDistance(
      start.latitude,
      start.longitude,
      destination.latitude,
      destination.longitude
    );

  const estimatedMinutes =
    Math.max(
      1,
      Math.round(
        (
          distance /
          ESTIMATED_AVERAGE_SPEED_KMH
        ) * 60
      )
    );

  durationValueElement.textContent =
    `약 ${estimatedMinutes}분`;

  distanceValueElement.textContent =
    `약 ${distance.toFixed(1)}km`;

  placeDistanceElement.textContent =
    `${start.name}에서 약 ` +
    `${distance.toFixed(1)}km`;
}

/*
  두 좌표 사이 직선거리 계산
*/
function calculateStraightDistance(
  latitude1,
  longitude1,
  latitude2,
  longitude2
) {
  const earthRadius = 6371;

  const latitudeDifference =
    toRadians(
      latitude2 - latitude1
    );

  const longitudeDifference =
    toRadians(
      longitude2 - longitude1
    );

  const value =
    Math.sin(
      latitudeDifference / 2
    ) ** 2 +
    Math.cos(
      toRadians(latitude1)
    ) *
    Math.cos(
      toRadians(latitude2)
    ) *
    Math.sin(
      longitudeDifference / 2
    ) ** 2;

  const angularDistance =
    2 *
    Math.atan2(
      Math.sqrt(value),
      Math.sqrt(1 - value)
    );

  return earthRadius * angularDistance;
}

function toRadians(degree) {
  return degree * (Math.PI / 180);
}

/*
  검색 결과 선택
*/
resultItems.forEach(function (item) {
  item.addEventListener("click", function () {
    const destination = {
      name:
        item.dataset.name,

      line:
        item.dataset.line,

      address:
        item.dataset.address,

      latitude:
        Number(item.dataset.latitude),

      longitude:
        Number(item.dataset.longitude)
    };

    if (
      !Number.isFinite(destination.latitude) ||
      !Number.isFinite(destination.longitude)
    ) {
      console.error(
        "목적지 좌표가 올바르지 않습니다.",
        destination
      );
      return;
    }

    showRouteMapScreen(destination);
  });
});

/*
  검색 화면 뒤로가기
*/
if (searchBackButton) {
  searchBackButton.addEventListener(
    "click",
    function () {
      window.history.back();
    }
  );
}

/*
  지도 화면 뒤로가기
*/
if (routeBackButton) {
  routeBackButton.addEventListener(
    "click",
    showSearchScreen
  );
}

/*
  검색 폼
*/
if (searchForm) {
  searchForm.addEventListener(
    "submit",
    function (event) {
      event.preventDefault();

      const keyword =
        searchInput.value.trim();

      if (!keyword) {
        searchInput.focus();
      }
    }
  );
}

/*
  검색 종류 선택
*/
categoryButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    categoryButtons.forEach(
      function (categoryButton) {
        categoryButton.classList.remove(
          "active"
        );
      }
    );

    button.classList.add("active");
  });
});

/*
  경로 필터 선택
*/
filterChips.forEach(function (chip) {
  chip.addEventListener("click", function () {
    filterChips.forEach(
      function (filterChip) {
        filterChip.classList.remove(
          "active"
        );
      }
    );

    chip.classList.add("active");
  });
});

/*
  검색 화면 발급 준비
*/
if (searchIssueButton) {
  searchIssueButton.addEventListener(
    "click",
    function () {
      window.location.href =
        "./prepare.html";
    }
  );
}

/*
  지도 화면 발급 준비
*/
if (routeIssueButton) {
  routeIssueButton.addEventListener(
    "click",
    function () {
      if (!selectedDestination) {
        window.location.href =
          "./prepare.html";
        return;
      }

      const query =
        new URLSearchParams({
          destination:
            selectedDestination.name,

          line:
            selectedDestination.line,

          address:
            selectedDestination.address
        });

      window.location.href =
        `./prepare.html?${query.toString()}`;
    }
  );
}

/*
  장소 상세보기

  별도 장소 상세 화면이 아직 없으므로
  목적지 마커 중심으로 지도 이동 및 확대합니다.
*/
if (placeDetailButton) {
  placeDetailButton.addEventListener(
    "click",
    function () {
      if (
        !map ||
        !selectedDestination
      ) {
        return;
      }

      const destinationPosition =
        new kakao.maps.LatLng(
          selectedDestination.latitude,
          selectedDestination.longitude
        );

      map.panTo(destinationPosition);
      map.setLevel(3);
    }
  );
}