// 만든 자바 스크립트 코드안에 붙여넣기
const swiper = new Swiper('.swiper', {
  // Optional parameters
  // 슬라이드 애니메이션 방향 
//   direction: 'horizontal',
// 슬라이드를 fade in out
    effect: 'fade',
  // 반복 재생
  loop: true,

  // 자동으로 슬라이드를 실행
  autoplay:{
    delay:3000,
  },

  // If we need pagination
  pagination: {
    el: '.swiper-pagination',
    // 페이지 버튼에 하이퍼링크 설정
    clickable: true,
  },

  // Navigation arrows
  navigation: {
    nextEl: '.swiper-button-next',
    prevEl: '.swiper-button-prev',
  },

  // And if we need scrollbar
  scrollbar: {
    el: '.swiper-scrollbar',
  },
});