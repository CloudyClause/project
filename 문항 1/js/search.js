"use strict";

/*
  현재 위치 사용 설정

  true:
  모바일 기기의 현재 위치를 사용합니다.

  false:
  서울역을 출발지로 고정합니다.
*/
const USE_CURRENT_LOCATION = true;

/*
  위치를 가져오지 못했을 때 사용하는 서울역 좌표
*/
const SEOUL_STATION = {
  name: "서울역",
  latitude: 37.554648,
  longitude: 126.970606
};

/*
  실제 대중교통 경로가 아닌 직선거리 기준
  임시 예상시간 계산 속도
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

const zoomInButton =
  document.getElementById("zoomInButton");

const zoomOutButton =
  document.getElementById("zoomOutButton");

const routeIssueButton =
  document.querySelector(".route-issue-button");

/*
  지도 상태
*/
let map = null;
let startMarker = null;
let destinationMarker = null;
let routePolyline = null;
let destinationOverlay = null;

let selectedDestination = null;
let currentStartPoint = null;

/*
  검색 화면으로 이동
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
  지도 화면으로 이동
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

  mapLoading.textContent =
    "현재 위치와 지도를 불러오는 중입니다.";

  mapLoading.classList.remove("hidden");

  try {
    /*
      display:none 상태에서 지도를 생성하면
      지도 크기를 정상 계산하지 못할 수 있으므로
      화면을 표시한 뒤 지도를 처리합니다.
    */
    await waitForVisibleScreen();

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
    console.error(error);

    mapLoading.textContent =
      "지도 정보를 불러오지 못했습니다.";
  }
}

/*
  화면 렌더링 완료 대기
*/
function waitForVisibleScreen() {
  return new Promise(function (resolve) {
    window.requestAnimationFrame(function () {
      window.requestAnimationFrame(resolve);
    });
  });
}

/*
  목적지 화면 정보 변경
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
  if (map) {
    map.relayout();
    return;
  }

  if (
    typeof kakao === "undefined" ||
    !kakao.maps
  ) {
    throw new Error(
      "카카오 지도 SDK가 로드되지 않았습니다."
    );
  }

  const mapContainer =
    document.getElementById("kakaoMap");

  const defaultCenter =
    new kakao.maps.LatLng(
      SEOUL_STATION.latitude,
      SEOUL_STATION.longitude
    );

  map = new kakao.maps.Map(
    mapContainer,
    {
      center: defaultCenter,
      level: 7
    }
  );

  map.setZoomable(true);
  map.setDraggable(true);
}

/*
  모바일 기기의 현재 위치 조회

  권한 거부 또는 오류 발생 시 서울역 사용
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
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        });
      },

      function () {
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
  이전 목적지의 마커, 경로선, 정보창 제거
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
  출발지 및 목적지 마커 생성
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

  const startMarkerImage =
    new kakao.maps.MarkerImage(
      "./images/marker-start.png",
      new kakao.maps.Size(34, 34),
      {
        offset: new kakao.maps.Point(17, 17)
      }
    );

  const destinationMarkerImage =
    new kakao.maps.MarkerImage(
      "./images/marker-destination.png",
      new kakao.maps.Size(42, 52),
      {
        offset: new kakao.maps.Point(21, 52)
      }
    );

  startMarker =
    new kakao.maps.Marker({
      map: map,
      position: startPosition,
      image: startMarkerImage,
      title: start.name
    });

  destinationMarker =
    new kakao.maps.Marker({
      map: map,
      position: destinationPosition,
      image: destinationMarkerImage,
      title: destination.name
    });

  createDestinationOverlay(
    destinationPosition,
    destination
  );
}

/*
  목적지 장소 정보창 생성
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
      yAnchor: 1.75
    });
}

/*
  출발지와 목적지를 직선으로 연결

  JavaScript 키만 사용하는 버전이므로
  실제 지하철 또는 도로 경로가 아닙니다.
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
    48,
    48,
    48,
    48
  );
}

/*
  직선거리와 임시 예상시간 출력
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
  위도와 경도를 이용한 직선거리 계산
*/
function calculateStraightDistance(
  latitude1,
  longitude1,
  latitude2,
  longitude2
) {
  const earthRadius = 6371;

  const latitudeDifference =
    toRadians(latitude2 - latitude1);

  const longitudeDifference =
    toRadians(longitude2 - longitude1);

  const value =
    Math.sin(latitudeDifference / 2) ** 2 +
    Math.cos(toRadians(latitude1)) *
    Math.cos(toRadians(latitude2)) *
    Math.sin(longitudeDifference / 2) ** 2;

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
  검색 결과 클릭
*/
resultItems.forEach(function (item) {
  item.addEventListener("click", function () {
    const destination = {
      name: item.dataset.name,
      line: item.dataset.line,
      address: item.dataset.address,
      latitude: Number(
        item.dataset.latitude
      ),
      longitude: Number(
        item.dataset.longitude
      )
    };

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

  별도 페이지로 이동하지 않고
  기존 검색 화면으로 복귀합니다.
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
  검색 종류 활성 상태
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
  경로 필터 활성 상태
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
  검색 화면 하단 발급 준비 버튼
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
  지도 화면 발급 준비 버튼
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
  지도 확대
*/
if (zoomInButton) {
  zoomInButton.addEventListener(
    "click",
    function () {
      if (!map) {
        return;
      }

      const currentLevel =
        map.getLevel();

      map.setLevel(
        Math.max(
          1,
          currentLevel - 1
        ),
        {
          animate: true
        }
      );
    }
  );
}

/*
  지도 축소
*/
if (zoomOutButton) {
  zoomOutButton.addEventListener(
    "click",
    function () {
      if (!map) {
        return;
      }

      map.setLevel(
        map.getLevel() + 1,
        {
          animate: true
        }
      );
    }
  );
}

/*
  상세보기

  별도의 장소 상세 화면이 아직 없으므로
  현재는 목적지 마커를 지도 중앙으로 이동합니다.
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