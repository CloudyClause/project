"use strict";

/* ========================================
   Kakao Map Section
======================================== */

/*
  카카오 지도 생성 시 사용할 중심 좌표입니다.

  아래 좌표는 예시값입니다.
  실제 카페온24 강남역점 좌표가 있다면
  해당 값으로 변경하면 됩니다.
*/
const centerPosition = new kakao.maps.LatLng(
  37.498095,
  127.027610
);


/* ========================================
   Kakao Map Create
======================================== */

const mapContainer = document.getElementById("map");

const mapOptions = {
  center: centerPosition,
  level: 5
};

const map = new kakao.maps.Map(
  mapContainer,
  mapOptions
);


/* ========================================
   Store Location Data
======================================== */

/*
  지도 위에 표시할 매장 좌표입니다.

  필요에 따라 매장을 추가하거나
  좌표를 변경할 수 있습니다.
*/
const storePositions = [
  {
    name: "카페온24 강남역점",
    lat: 37.498095,
    lng: 127.027610
  },

  {
    name: "카페온24 역삼점",
    lat: 37.501500,
    lng: 127.039000
  },

  {
    name: "카페온24 서초점",
    lat: 37.491500,
    lng: 127.020000
  },

  {
    name: "카페온24 삼성점",
    lat: 37.505500,
    lng: 127.050000
  },

  {
    name: "카페온24 교대점",
    lat: 37.493500,
    lng: 127.013000
  }
];


/* ========================================
   Kakao Map Marker
======================================== */

storePositions.forEach(function (store) {

  const markerPosition =
    new kakao.maps.LatLng(
      store.lat,
      store.lng
    );

  const marker = new kakao.maps.Marker({
    position: markerPosition
  });

  marker.setMap(map);

});