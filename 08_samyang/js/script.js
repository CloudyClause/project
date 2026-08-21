"use strict";


/* ========================================
   팝업창 요소 가져오기
======================================== */

const popupWrap = document.getElementById("popupWrap");

const popupClose = document.getElementById("popupClose");

const todayClose = document.getElementById("todayClose");


/* ========================================
   오늘 날짜 구하기

   예:
   2026-08-21

   오늘 하루 보지 않기 기능을 위해
   현재 날짜를 문자열로 만들어 사용합니다.
======================================== */

function getToday() {

  const today = new Date();

  const year = today.getFullYear();

  const month = String(
    today.getMonth() + 1
  ).padStart(2, "0");

  const date = String(
    today.getDate()
  ).padStart(2, "0");


  return `${year}-${month}-${date}`;

}


/* ========================================
   페이지 로딩 시 팝업 표시 여부 확인
======================================== */

const today = getToday();


/*
  localStorage에 저장되어 있는
  popupCloseDate 값을 가져옵니다.
*/
const popupCloseDate =
  localStorage.getItem("popupCloseDate");


/*
  저장된 날짜와 오늘 날짜가 같다면
  오늘 이미 팝업을 닫았다는 의미이므로
  팝업을 표시하지 않습니다.
*/
if (popupCloseDate === today) {

  popupWrap.classList.add("hide");

}


/* ========================================
   닫기 버튼 클릭 이벤트
======================================== */

popupClose.addEventListener(
  "click",
  function () {

    /*
      '오늘 하루 이 창을 열지 않음'이
      체크되어 있는지 확인합니다.
    */
    if (todayClose.checked) {

      /*
        체크되어 있다면
        오늘 날짜를 브라우저 localStorage에 저장합니다.

        예:
        popupCloseDate = 2026-08-21
      */
      localStorage.setItem(
        "popupCloseDate",
        today
      );

    }


    /*
      팝업을 숨깁니다.
    */
    popupWrap.classList.add("hide");

  }
);


/* ========================================
   Main Visual Swiper
======================================== */

const mainVisualSwiper = new Swiper(".main-visual-swiper", {

  /* ----------------------------------------
     슬라이드 방향
  ---------------------------------------- */
  direction: "horizontal",


  /* ----------------------------------------
     무한 반복
  ---------------------------------------- */
  loop: true,


  /* ----------------------------------------
     슬라이드 전환 속도
  ---------------------------------------- */
  speed: 700,


  /* ----------------------------------------
     자동 재생
     페이지 로딩 직후부터 3초마다 실행
  ---------------------------------------- */
  autoplay: {
    delay: 3000,

    /*
      사용자가 이전/다음 버튼을 눌러도
      자동재생을 중단하지 않습니다.
    */
    disableOnInteraction: false,
  },


  /* ----------------------------------------
     Previous / Next Button
  ---------------------------------------- */
  navigation: {
    nextEl: ".main-next",
    prevEl: ".main-prev",
  },


  /* ----------------------------------------
     1 / 3 Pagination
  ---------------------------------------- */
  pagination: {
    el: ".main-pagination",
    type: "fraction",

    /*
      기본 Swiper 표기는
      1 / 3 형식으로 출력됩니다.
    */
  },

});

/* ========================================
   Brand Tab
======================================== */

/*
  모든 탭 버튼을 가져옵니다.
*/
const brandTabs =
  document.querySelectorAll(".brand-tab");


/*
  모든 제품 콘텐츠를 가져옵니다.
*/
const brandContents =
  document.querySelectorAll(".brand-content");


/* ========================================
   Tab Click Event
======================================== */

brandTabs.forEach(function (tab) {

  tab.addEventListener("click", function () {

    /*
      클릭한 탭의 data-tab 값을 가져옵니다.
    */
    const targetTab =
      this.getAttribute("data-tab");


    /* ----------------------------------------
       모든 탭의 active 제거
    ---------------------------------------- */

    brandTabs.forEach(function (item) {
      item.classList.remove("active");
    });


    /* ----------------------------------------
       모든 제품 콘텐츠 숨김
    ---------------------------------------- */

    brandContents.forEach(function (content) {
      content.classList.remove("active");
    });


    /* ----------------------------------------
       클릭한 탭 활성화
    ---------------------------------------- */

    this.classList.add("active");


    /* ----------------------------------------
       클릭한 탭에 해당하는 제품 표시
    ---------------------------------------- */

    const targetContent =
      document.getElementById(targetTab);

    if (targetContent) {
      targetContent.classList.add("active");
    }

  });

});

$(function () {

  $(".family-button").on("click", function () {

    $(".family-list").stop().slideToggle(300);

    $(".family-wrap").toggleClass("active");

  });

});

/* ========================================
   TOP 버튼
======================================== */

const topBtn = document.getElementById("topBtn");


/* ========================================
   페이지 스크롤 이벤트

   페이지를 일정 거리 이상 내리면
   TOP 버튼을 화면에 표시합니다.
======================================== */

window.addEventListener(
  "scroll",
  function () {

    /*
      현재 세로 스크롤 위치가
      300px보다 크면 버튼을 보여줍니다.
    */
    if (window.scrollY > 300) {

      topBtn.classList.add("show");

    } else {

      /*
        페이지 위쪽에 있을 경우
        버튼을 숨깁니다.
      */
      topBtn.classList.remove("show");

    }

  }
);


/* ========================================
   TOP 버튼 클릭 이벤트
======================================== */

topBtn.addEventListener(
  "click",
  function () {

    /*
      페이지 맨 위로 이동합니다.

      behavior: "smooth"
      → 바로 이동하지 않고
        애니메이션처럼 부드럽게 이동합니다.
    */
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }
);