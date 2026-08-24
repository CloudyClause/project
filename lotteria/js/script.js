"use strict";


/* ==================================================
   Header 전체 2단 메뉴
================================================== */


/*
  Header 요소
*/
const header =
  document.querySelector("#header");


/*
  주메뉴 전체
*/
const gnbItems =
  document.querySelectorAll(".gnb-item");


/* ==================================================
   주메뉴에 마우스가 올라왔을 경우

   header에 menu-open 클래스 추가
   → 전체 2단 메뉴가 열립니다.
================================================== */

gnbItems.forEach(function (item) {

  item.addEventListener(
    "mouseenter",
    function () {

      header.classList.add("menu-open");

    }
  );

});


/* ==================================================
   Header 전체 영역에서 마우스가 벗어났을 경우

   menu-open 클래스 제거
   → 전체 2단 메뉴가 닫힙니다.

   header 내부에 mega-menu가 들어 있기 때문에
   주메뉴에서 2단 메뉴로 마우스를 이동하더라도
   닫히지 않습니다.
================================================== */

header.addEventListener(
  "mouseleave",
  function () {

    header.classList.remove("menu-open");

  }
);

/* ==================================================
   MAIN BANNER SWIPER
================================================== */


/*
  Swiper 생성

  - 총 3개
  - 한 화면에 1개
  - 3초 자동재생
  - 마지막 → 첫 번째 반복
  - 오른쪽 방향으로 단방향 진행
*/
const mainBannerSwiper =
  new Swiper(".main-banner-swiper", {

    /*
      무한 반복

      3번째 슬라이드 다음에는
      다시 1번째 슬라이드로 이동합니다.
    */
    loop: true,


    /*
      한 화면에 한 장
    */
    slidesPerView: 1,


    /*
      슬라이드 전환 속도
    */
    speed: 600,


    /*
      자동재생
    */
    autoplay: {

      /*
        3초
      */
      delay: 3000,

      /*
        사용자가 버튼을 눌러도
        이후 자동재생을 계속 유지합니다.
      */
      disableOnInteraction: false

    },


    /*
      좌우 버튼
    */
    navigation: {

      nextEl: ".banner-next",

      prevEl: ".banner-prev"

    },


    /*
      슬라이드 변경 시
      페이지 번호 갱신
    */
    on: {

      init: function () {

        updateBannerCounter(this);

      },

      slideChange: function () {

        updateBannerCounter(this);

      }

    }

  });


/* ==================================================
   PAGE COUNTER
================================================== */

function updateBannerCounter(swiper) {

  const current =
    document.querySelector(".banner-current");

  /*
    loop 사용 시에는 activeIndex가 아니라
    realIndex를 사용해야
    실제 1 / 2 / 3 번호가 표시됩니다.
  */
  current.textContent =
    swiper.realIndex + 1;

}


/* ==================================================
   PLAY / PAUSE BUTTON
================================================== */

const bannerPlayButton =
  document.querySelector(".banner-play-toggle");


let bannerPaused = false;


bannerPlayButton.addEventListener(
  "click",
  function () {

    /*
      현재 자동재생 중이라면 정지
    */
    if (!bannerPaused) {

      mainBannerSwiper.autoplay.stop();

      bannerPaused = true;

      bannerPlayButton.classList.add(
        "is-paused"
      );

      bannerPlayButton.setAttribute(
        "aria-label",
        "슬라이드 재생"
      );

    }


    /*
      정지 상태라면 다시 재생
    */
    else {

      mainBannerSwiper.autoplay.start();

      bannerPaused = false;

      bannerPlayButton.classList.remove(
        "is-paused"
      );

      bannerPlayButton.setAttribute(
        "aria-label",
        "슬라이드 일시정지"
      );

    }

  }
);


/* ==================================================
   배너 + 버튼

   실제 상세페이지가 결정되지 않은 상태이므로
   우선 클릭 가능한 버튼 상태만 구현합니다.

   추후 실제 페이지 연결 시
   location.href 부분의 주소만 변경하면 됩니다.
================================================== */

const bannerMoreButton =
  document.querySelector(".banner-more");


bannerMoreButton.addEventListener(
  "click",
  function () {

    /*
      예:
      window.location.href = "./event.html";
    */

    console.log(
      "배너 더보기 버튼 클릭"
    );

  }
);


/* ==================================================
   EATZ 마일 TAB
================================================== */

const mileTabs =
  document.querySelectorAll(".mile-tab");


const mileContents =
  document.querySelectorAll(
    ".mile-tab-content"
  );


mileTabs.forEach(function (tab) {

  tab.addEventListener(
    "click",
    function () {

      /*
        모든 TAB active 제거
      */
      mileTabs.forEach(
        function (item) {

          item.classList.remove("active");

        }
      );


      /*
        모든 내용 숨김
      */
      mileContents.forEach(
        function (content) {

          content.classList.remove("active");

        }
      );


      /*
        클릭한 TAB 활성화
      */
      tab.classList.add("active");


      /*
        data-mile-tab에 지정된
        해당 내용 표시
      */
      const target =
        tab.dataset.mileTab;


      document
        .getElementById(target)
        .classList.add("active");

    }
  );

});

/* ==================================================
   COUPON BANNER SWIPER
================================================== */

const couponSwiper =
  new Swiper(".coupon-swiper", {

    /*
      한 화면에 4개 표시
    */
    slidesPerView: 4,


    /*
      카드 사이 간격

      268.5px × 4 = 1074px
      전체 1110px에서 남는 36px을
      3개의 간격으로 분배
    */
    spaceBetween: 12,


    /*
      한 번에 1개씩 이동
    */
    slidesPerGroup: 1,


    /*
      8번째 이후 다시
      첫 번째 카드가 오른쪽에서 나타남
    */
    loop: true,


    /*
      슬라이드 전환 속도
    */
    speed: 600,


    /*
      자동재생
      3초마다 다음 카드로 이동
    */
    autoplay: {

      delay: 3000,

      /*
        버튼을 눌러도
        자동재생 유지
      */
      disableOnInteraction: false

    },


    /*
      좌우 버튼
    */
    navigation: {

      nextEl: ".coupon-next",

      prevEl: ".coupon-prev"

    }

  });

  /* ==================================================
   HOT MENU TAB
================================================== */


/*
  탭 버튼 전체
*/
const hotmenuTabs =
  document.querySelectorAll(".hotmenu-tab");


/*
  탭 콘텐츠 전체
*/
const hotmenuContents =
  document.querySelectorAll(".hotmenu-content");


/* ==================================================
   탭 클릭 이벤트
================================================== */

hotmenuTabs.forEach(function (tab) {

  tab.addEventListener(
    "click",
    function () {

      /*
        클릭한 탭이 보여줄 콘텐츠 ID

        예:
        data-tab="lotte"
        → id="lotte"
      */
      const target =
        tab.dataset.tab;


      /*
        모든 탭 active 제거
      */
      hotmenuTabs.forEach(
        function (item) {

          item.classList.remove("active");

        }
      );


      /*
        모든 콘텐츠 active 제거
      */
      hotmenuContents.forEach(
        function (content) {

          content.classList.remove("active");

        }
      );


      /*
        클릭한 탭 활성화
      */
      tab.classList.add("active");


      /*
        클릭한 탭에 해당하는
        콘텐츠만 표시
      */
      document
        .getElementById(target)
        .classList.add("active");

    }
  );

});

/* ==================================================
   FAMILY SITE
   jQuery slideToggle
================================================== */

$(function () {

  /*
    Family Site 버튼 클릭
  */
  $(".family-btn").on("click", function () {

    /*
      리스트를 한번 클릭하면 열고,
      다시 클릭하면 닫습니다.
    */
    $(".family-list").stop().slideToggle(250);


    /*
      버튼 화살표 회전을 위해
      open 클래스도 함께 토글합니다.
    */
    $(".family-site").toggleClass("open");

  });

});

/* ==================================================
   TOP BUTTON
================================================== */


/*
  TOP 버튼 가져오기
*/
const topBtn =
  document.querySelector("#topBtn");


/* ==================================================
   Scroll Event

   페이지를 400px 이상 내리면
   TOP 버튼에 show 클래스를 추가합니다.

   400px보다 위로 올라오면
   show 클래스를 제거합니다.
================================================== */

window.addEventListener(
  "scroll",
  function () {

    /*
      현재 페이지의 세로 스크롤 위치
    */
    const scrollPosition =
      window.scrollY;


    /*
      400px 이상 스크롤
    */
    if (scrollPosition >= 400) {

      topBtn.classList.add("show");

    }


    /*
      400px 미만
    */
    else {

      topBtn.classList.remove("show");

    }

  }
);


/* ==================================================
   TOP BUTTON CLICK

   클릭하면 페이지 최상단으로
   부드럽게 이동합니다.
================================================== */

topBtn.addEventListener(
  "click",
  function () {

    window.scrollTo({

      /*
        페이지 맨 위
      */
      top: 0,

      /*
        부드러운 스크롤 이동
      */
      behavior: "smooth"

    });

  }
);