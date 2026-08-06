"use strict";

/* ==================================================
   Swiper 메인 배너 슬라이드
=================================================== */

const mainBannerSwiper =
  new Swiper(".main-banner-swiper", {
    /*
      마지막 슬라이드 다음에
      첫 번째 슬라이드가 이어집니다.
    */
    loop: false,
    rewind: true,

    /*
      한 화면에 배너 한 장만 표시합니다.
    */
    slidesPerView: 1,
    slidesPerGroup: 1,

    /*
      슬라이드 사이 간격은 사용하지 않습니다.
    */
    spaceBetween: 0,

    /*
      슬라이드 전환 속도
    */
    speed: 550,

    /*
      자동 슬라이드
    */
    autoplay: {
      delay: 3000,

      /*
        사용자가 배너를 직접 넘긴 뒤에도
        자동 재생을 계속합니다.
      */
      disableOnInteraction: false,

      stopOnLastSlide: false,

      /*
        배너 위에 마우스가 올라왔을 때
        자동 재생을 일시 정지합니다.
      */
      pauseOnMouseEnter: true
    },

    /*
      모바일 터치 드래그 허용
    */
    simulateTouch: true,
    allowTouchMove: true,


    /*
      하단 페이지 표시 점
    */
    pagination: {
      el: ".main-banner-swiper .swiper-pagination",
      clickable: true
    }
  });

/* ==================================================
   기존 홈 화면 요소
=================================================== */

const homeSearchForm =
  document.querySelector(".search-form");

const homeSearchButton =
  document.querySelector(".search-button");

const prepareMenuButton =
  document.querySelector(".prepare-menu-button");

const ticketDetailMenuButton =
  document.querySelector(
    ".ticket-detail-menu-button"
  );

const routeGuideMenuButton =
  document.querySelector(
    ".route-guide-menu-button"
  );

const routeCard =
  document.querySelector(".route-card");

const menuButton =
  document.querySelector(".menu-button");

const recentChips =
  document.querySelectorAll(".recent-chip");

const clearRecentButton =
  document.querySelector(".clear-recent-button");

const recentList =
  document.querySelector(".recent-list");

/* ==================================================
   배너 요소
=================================================== */

const bannerPrepareButton =
  document.querySelector(".banner-prepare-button");

const bannerGuideButton =
  document.querySelector(".banner-guide-button");

const bannerSearchButton =
  document.querySelector(".banner-search-button");

/* ==================================================
   검색 화면 이동
=================================================== */

if (homeSearchForm) {
  homeSearchForm.addEventListener(
    "submit",
    function (event) {
      event.preventDefault();

      window.location.href =
        "./search.html";
    }
  );
}

/*
  기존 검색 버튼 클릭 기능도 유지합니다.
*/
if (homeSearchButton) {
  homeSearchButton.addEventListener(
    "click",
    function (event) {
      event.preventDefault();

      window.location.href =
        "./search.html";
    }
  );
}

/* ==================================================
   빠른 메뉴 이동
=================================================== */

if (prepareMenuButton) {
  prepareMenuButton.addEventListener(
    "click",
    function () {
      window.location.href =
        "./prepare.html";
    }
  );
}

if (ticketDetailMenuButton) {
  ticketDetailMenuButton.addEventListener(
    "click",
    function () {
      window.location.href =
        "./detail.html";
    }
  );
}

if (routeGuideMenuButton) {
  routeGuideMenuButton.addEventListener(
    "click",
    function () {
      window.location.href =
        "./route.html";
    }
  );
}

/* ==================================================
   추천 경로 카드
=================================================== */

if (routeCard) {
  routeCard.addEventListener(
    "click",
    function () {
      window.location.href =
        "./route.html";
    }
  );
}

/* ==================================================
   메인 배너 연결
=================================================== */

/*
  첫 번째 배너:
  발급 준비 화면으로 이동
*/
if (bannerPrepareButton) {
  bannerPrepareButton.addEventListener(
    "click",
    function () {
      window.location.href =
        "./prepare.html";
    }
  );
}

/*
  두 번째 배너:
  경로 안내 화면으로 이동
*/
if (bannerGuideButton) {
  bannerGuideButton.addEventListener(
    "click",
    function () {
      window.location.href =
        "./route.html";
    }
  );
}

/*
  세 번째 배너:
  목적지 검색 화면으로 이동
*/
if (bannerSearchButton) {
  bannerSearchButton.addEventListener(
    "click",
    function () {
      window.location.href =
        "./search.html";
    }
  );
}

/* ==================================================
   최근 검색
=================================================== */

recentChips.forEach(function (chip) {
  chip.addEventListener(
    "click",
    function () {
      const destination =
        chip.textContent.trim();

      const query =
        new URLSearchParams({
          destination: destination
        });

      window.location.href =
        `./search.html?${query.toString()}`;
    }
  );
});

if (
  clearRecentButton &&
  recentList
) {
  clearRecentButton.addEventListener(
    "click",
    function () {
      recentList.innerHTML = "";
      clearRecentButton.disabled = true;
      clearRecentButton.textContent =
        "삭제 완료";
    }
  );
}

/* ==================================================
   왼쪽 슬라이드 모바일 메뉴
=================================================== */

/*
  HTML에서 추가한 메뉴 관련 요소를 가져옵니다.
*/
const mobileMenu =
  document.getElementById("mobileMenu");

const menuOverlay =
  document.getElementById("menuOverlay");

const menuCloseButton =
  document.getElementById("menuCloseButton");

/*
  메뉴를 여는 함수입니다.
*/
function openMobileMenu() {
  if (
    !mobileMenu ||
    !menuOverlay
  ) {
    return;
  }

  /*
    메뉴와 배경에 is-open 클래스를 추가해
    CSS 슬라이드 애니메이션을 실행합니다.
  */
  mobileMenu.classList.add("is-open");
  menuOverlay.classList.add("is-open");

  /*
    메뉴가 열린 동안 홈 화면 스크롤을 막습니다.
  */
  document.body.classList.add("menu-open");

  /*
    접근성 속성을 현재 상태에 맞게 변경합니다.
  */
  mobileMenu.setAttribute(
    "aria-hidden",
    "false"
  );

  menuOverlay.setAttribute(
    "aria-hidden",
    "false"
  );

  if (menuButton) {
    menuButton.setAttribute(
      "aria-expanded",
      "true"
    );
  }

  /*
    메뉴가 열린 뒤 닫기 버튼으로
    키보드 초점을 이동합니다.
  */
  if (menuCloseButton) {
    menuCloseButton.focus();
  }
}

/*
  메뉴를 닫는 함수입니다.
*/
function closeMobileMenu() {
  if (
    !mobileMenu ||
    !menuOverlay
  ) {
    return;
  }

  mobileMenu.classList.remove("is-open");
  menuOverlay.classList.remove("is-open");

  document.body.classList.remove("menu-open");

  mobileMenu.setAttribute(
    "aria-hidden",
    "true"
  );

  menuOverlay.setAttribute(
    "aria-hidden",
    "true"
  );

  if (menuButton) {
    menuButton.setAttribute(
      "aria-expanded",
      "false"
    );

    /*
      메뉴가 닫히면 햄버거 버튼으로
      키보드 초점을 되돌립니다.
    */
    menuButton.focus();
  }
}

/*
  햄버거 버튼 클릭 시 메뉴 열기
*/
if (menuButton) {
  menuButton.setAttribute(
    "aria-controls",
    "mobileMenu"
  );

  menuButton.setAttribute(
    "aria-expanded",
    "false"
  );

  menuButton.addEventListener(
    "click",
    openMobileMenu
  );
}

/*
  X 닫기 버튼 클릭 시 메뉴 닫기
*/
if (menuCloseButton) {
  menuCloseButton.addEventListener(
    "click",
    closeMobileMenu
  );
}

/*
  메뉴 바깥의 어두운 배경을 누르면 닫기
*/
if (menuOverlay) {
  menuOverlay.addEventListener(
    "click",
    closeMobileMenu
  );
}

/*
  키보드 Esc를 누르면 메뉴 닫기
*/
document.addEventListener(
  "keydown",
  function (event) {
    if (
      event.key === "Escape" &&
      mobileMenu &&
      mobileMenu.classList.contains("is-open")
    ) {
      closeMobileMenu();
    }
  }
);