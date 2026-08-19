$(function () {

  /* ========================================
     Family Site Slide Toggle
  ======================================== */

  $(".family-button").on("click", function () {

    /*
      family-button을 클릭하면

      첫 번째 클릭
      → family-list가 부드럽게 나타남

      두 번째 클릭
      → family-list가 부드럽게 사라짐
    */
    $(".family-list").stop().slideToggle(300);


    /*
      화살표 방향 변경을 위해
      active 클래스도 함께 toggle
    */
    $(".family-wrap").toggleClass("active");

  });

});