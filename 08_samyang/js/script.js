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