"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const bannerElement = document.querySelector(".main-banner-swiper");

  /*
    Swiper 요소가 존재하지 않을 경우
    JavaScript 실행을 중단합니다.
  */
  if (!bannerElement) {
    console.error("메인 배너 요소를 찾을 수 없습니다.");
    return;
  }

  /*
    Swiper CDN이 정상적으로 로드되지 않았을 경우
    오류를 표시하고 실행을 중단합니다.
  */
  if (typeof Swiper === "undefined") {
    console.error("Swiper 라이브러리가 로드되지 않았습니다.");
    return;
  }

  /*
    메인 배너 Swiper 초기화
  */
  const mainBannerSwiper = new Swiper(".main-banner-swiper", {
    /*
      한 번에 한 장만 표시
    */
    slidesPerView: 1,

    /*
      슬라이드 사이 간격 없음
    */
    spaceBetween: 0,

    /*
      마지막 배너 다음에 다시 첫 번째 배너 표시
    */
    loop: true,

    /*
      슬라이드 전환 시간
    */
    speed: 700,

    /*
      모바일 터치 스와이프 허용
    */
    allowTouchMove: true,

    /*
      자동 슬라이드
    */
    autoplay: {
      delay: 3000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true
    },

    /*
      하단 페이지 점
    */
    pagination: {
      el: ".main-banner-swiper .swiper-pagination",
      clickable: true
    },

    /*
      좌우 이동 버튼
    */
    navigation: {
      nextEl: ".main-banner-swiper .swiper-button-next",
      prevEl: ".main-banner-swiper .swiper-button-prev"
    },

    /*
      키보드 방향키 조작
    */
    keyboard: {
      enabled: true,
      onlyInViewport: true
    },

    /*
      접근성 메시지
    */
    a11y: {
      enabled: true,
      prevSlideMessage: "이전 배너",
      nextSlideMessage: "다음 배너",
      firstSlideMessage: "첫 번째 배너입니다.",
      lastSlideMessage: "마지막 배너입니다.",
      paginationBulletMessage: "{{index}}번째 배너로 이동"
    }
  });


  /*
    전체 메뉴 버튼
  */
  const menuButton = document.querySelector(".menu-button");

  if (menuButton) {
    menuButton.addEventListener("click", function () {
      console.log("전체 메뉴 버튼이 선택되었습니다.");

      /*
        메뉴 페이지가 완성되면 아래 코드의
        주석을 해제해서 사용할 수 있습니다.

        window.location.href = "./menu.html";
      */
    });
  }


  /*
    검색 버튼
  */
  const searchButton = document.querySelector(".search-button");

  if (searchButton) {
    searchButton.addEventListener("click", function () {
      console.log("검색 버튼이 선택되었습니다.");

      /*
        검색 페이지가 완성되면 아래 코드의
        주석을 해제해서 사용할 수 있습니다.

        window.location.href = "./search.html";
      */
    });
  }


  /*
    브라우저 또는 앱 화면이 숨겨지면
    자동 재생을 일시 정지합니다.
  */
  document.addEventListener("visibilitychange", function () {
    if (!mainBannerSwiper.autoplay) {
      return;
    }

    if (document.hidden) {
      mainBannerSwiper.autoplay.stop();
    } else {
      mainBannerSwiper.autoplay.start();
    }
  });
});