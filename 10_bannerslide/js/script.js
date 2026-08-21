"use strict";


/* ========================================
   사용할 HTML 요소 먼저 가져오기
======================================== */

/*
  Swiper가 생성되는 순간 init 이벤트가 실행될 수 있으므로
  진행바 요소를 반드시 Swiper보다 먼저 선언합니다.
*/
const progressFill =
  document.querySelector(".progress-fill");


/*
  재생 / 일시정지 버튼
*/
const playControl =
  document.querySelector(".play-control");


/*
  현재 자동재생 상태
*/
let isPlaying = true;



/* ========================================
   진행 상태 막대 함수
======================================== */

function updateProgress(swiper) {

  /*
    전체 슬라이드는 총 6개입니다.
  */
  const totalSlides = 6;


  /*
    loop 모드에서는 activeIndex가 아니라
    실제 슬라이드 번호인 realIndex를 사용합니다.
  */
  const currentSlide =
    swiper.realIndex + 1;


  /*
    현재 슬라이드 위치를 백분율로 계산합니다.

    1번째 = 16.67%
    2번째 = 33.33%
    3번째 = 50%
    ...
    6번째 = 100%
  */
  const progress =
    (currentSlide / totalSlides) * 100;


  /*
    진행바 너비 변경
  */
  progressFill.style.width =
    progress + "%";
}



/* ========================================
   설화수 추천 Swiper
======================================== */

const recommendSwiper =
  new Swiper(".recommend-swiper", {

    /*
      한 화면에 3개의 상품을 보여줍니다.
    */
    slidesPerView: 3,


    /*
      상품 카드 사이의 간격
    */
    spaceBetween: 24,


    /*
      좌우 버튼 또는 자동재생 시
      한 번에 한 장씩 이동합니다.
    */
    slidesPerGroup: 1,


    /*
      마지막 슬라이드 이후
      다시 처음으로 연결합니다.
    */
    loop: true,


    /*
      슬라이드 이동 애니메이션 속도
    */
    speed: 700,


    /*
      3초마다 자동으로
      다음 슬라이드로 이동합니다.
    */
    autoplay: {

      delay: 3000,

      /*
        좌우 버튼을 클릭해도
        자동재생을 중단하지 않습니다.
      */
      disableOnInteraction: false

    },


    /*
      이전 / 다음 버튼 연결
    */
    navigation: {

      prevEl: ".recommend-prev",

      nextEl: ".recommend-next"

    },


    /*
      처음 실행하거나
      슬라이드가 변경될 때마다
      진행바를 갱신합니다.
    */
    on: {

      init: function () {

        updateProgress(this);

      },


      slideChange: function () {

        updateProgress(this);

      }

    }

  });



/* ========================================
   재생 / 일시정지 버튼
======================================== */

playControl.addEventListener(
  "click",
  function () {

    /*
      현재 자동재생 중인 경우
      → 일시정지
    */
    if (isPlaying) {

      recommendSwiper.autoplay.stop();


      /*
        현재 상태 변경
      */
      isPlaying = false;


      /*
        pause 아이콘에서
        play 아이콘으로 변경
      */
      playControl.classList.remove("pause");

      playControl.classList.add("play");


      /*
        접근성 문구 변경
      */
      playControl.setAttribute(
        "aria-label",
        "슬라이드 재생"
      );

    }


    /*
      현재 정지 상태인 경우
      → 다시 자동재생
    */
    else {

      recommendSwiper.autoplay.start();


      /*
        현재 상태 변경
      */
      isPlaying = true;


      /*
        play 아이콘에서
        pause 아이콘으로 변경
      */
      playControl.classList.remove("play");

      playControl.classList.add("pause");


      /*
        접근성 문구 변경
      */
      playControl.setAttribute(
        "aria-label",
        "슬라이드 일시정지"
      );

    }

  }
);