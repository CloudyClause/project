/* ========================================
   BEST Mobile More
======================================== */

const bestList =
  document.querySelector(".best__list");

const bestMoreButton =
  document.querySelector(".best__more-button");


if (bestList && bestMoreButton) {

  const bestCards =
    bestList.querySelectorAll(".product-card");

  const mobileVisibleCount = 4;


  /* ========================================
     BEST Mobile State
  ======================================== */

  function setBestMobileState() {

    /*
      모바일
    */
    if (window.innerWidth <= 767) {

      bestCards.forEach(function (card, index) {

        if (
          index >= mobileVisibleCount &&
          !bestMoreButton.classList.contains("is-open")
        ) {

          card.classList.add(
            "best-card--hidden"
          );

        } else {

          card.classList.remove(
            "best-card--hidden"
          );

        }

      });


      /*
        카드가 4개 이하라면
        더보기 버튼 숨김
      */

      if (bestCards.length <= mobileVisibleCount) {

        bestMoreButton
          .closest(".best__more-wrap")
          .style.display = "none";

      }

    }


    /*
      PC
    */
    else {

      bestCards.forEach(function (card) {

        card.classList.remove(
          "best-card--hidden"
        );

      });

    }

  }


  /* ========================================
     BEST More Button Click
  ======================================== */

  bestMoreButton.addEventListener(
    "click",
    function () {

      const isOpen =
        bestMoreButton.classList.toggle(
          "is-open"
        );


      bestMoreButton.setAttribute(
        "aria-expanded",
        isOpen
      );


      bestCards.forEach(
        function (card, index) {

          if (index < mobileVisibleCount) {
            return;
          }


          if (isOpen) {

            card.classList.remove(
              "best-card--hidden"
            );

          } else {

            card.classList.add(
              "best-card--hidden"
            );

          }

        }
      );


      const moreText =
        bestMoreButton.querySelector(
          ".best__more-text"
        );


      if (moreText) {

        moreText.textContent =
          isOpen
            ? "접기"
            : "더보기";

      }

    }
  );


  /* ========================================
     BEST Initial State
  ======================================== */

  setBestMobileState();


  /* ========================================
     BEST Resize
  ======================================== */

  window.addEventListener(
    "resize",
    setBestMobileState
  );

}

/* ========================================
   Daily Mobile More
======================================== */

const dailyMoreButton =
  document.querySelector(".daily__more-button");

const dailyExtraCards =
  document.querySelectorAll(
    ".daily-card--mobile-extra"
  );


if (
  dailyMoreButton &&
  dailyExtraCards.length > 0
) {

  /* ========================================
     Daily More Button Click
  ======================================== */

  dailyMoreButton.addEventListener(
    "click",
    function () {

      const isOpen =
        dailyMoreButton.classList.toggle(
          "is-open"
        );


      /* ========================================
         Extra Cards Toggle
      ======================================== */

      dailyExtraCards.forEach(
        function (card) {

          card.classList.toggle(
            "is-visible",
            isOpen
          );

        }
      );


      /* ========================================
         Accessibility State
      ======================================== */

      dailyMoreButton.setAttribute(
        "aria-expanded",
        isOpen
      );


      /* ========================================
         Button Text
      ======================================== */

      const dailyMoreText =
        dailyMoreButton.querySelector(
          ".daily__more-text"
        );


      if (dailyMoreText) {

        dailyMoreText.textContent =
          isOpen
            ? "접기"
            : "더보기";

      }

    }
  );


  /* ========================================
     Daily Resize Reset
  ======================================== */

  window.addEventListener(
    "resize",
    function () {

      /*
        PC로 넘어갔다가 다시 모바일로
        돌아왔을 때 펼쳐진 상태가 남지 않도록 초기화
      */

      if (window.innerWidth > 767) {

        dailyMoreButton.classList.remove(
          "is-open"
        );


        dailyMoreButton.setAttribute(
          "aria-expanded",
          "false"
        );


        dailyExtraCards.forEach(
          function (card) {

            card.classList.remove(
              "is-visible"
            );

          }
        );


        const dailyMoreText =
          dailyMoreButton.querySelector(
            ".daily__more-text"
          );


        if (dailyMoreText) {

          dailyMoreText.textContent =
            "더보기";

        }

      }

    }
  );

}

/* ========================================
   Recommend Mobile More
======================================== */

const recommendMobileList =
  document.querySelector(".recommend-mobile__list");

const recommendMobileMoreButton =
  document.querySelector(
    ".recommend-mobile__more-button"
  );


if (
  recommendMobileList &&
  recommendMobileMoreButton
) {

  const recommendMobileCards =
    recommendMobileList.querySelectorAll(
      ".recommend-mobile-card"
    );

  const recommendVisibleCount = 4;


  /* ========================================
     Recommend Mobile Initial State
  ======================================== */

  function setRecommendMobileState() {

    if (window.innerWidth <= 767) {

      const isOpen =
        recommendMobileMoreButton
          .classList
          .contains("is-open");


      recommendMobileCards.forEach(
        function (card, index) {

          if (
            index >= recommendVisibleCount &&
            !isOpen
          ) {

            card.classList.add(
              "recommend-mobile-card--hidden"
            );

          } else {

            card.classList.remove(
              "recommend-mobile-card--hidden"
            );

          }

        }
      );

    } else {

      /*
        PC에서는 모바일 블록 자체가 CSS로
        숨겨지지만 상태도 정상적으로 초기화
      */

      recommendMobileCards.forEach(
        function (card) {

          card.classList.remove(
            "recommend-mobile-card--hidden"
          );

        }
      );

    }

  }


  /* ========================================
     Recommend More Click
  ======================================== */

  recommendMobileMoreButton.addEventListener(
    "click",
    function () {

      const isOpen =
        recommendMobileMoreButton
          .classList
          .toggle("is-open");


      recommendMobileMoreButton.setAttribute(
        "aria-expanded",
        isOpen
      );


      recommendMobileCards.forEach(
        function (card, index) {

          if (index < recommendVisibleCount) {
            return;
          }


          card.classList.toggle(
            "recommend-mobile-card--hidden",
            !isOpen
          );

        }
      );


      const text =
        recommendMobileMoreButton.querySelector(
          ".recommend-mobile__more-text"
        );


      if (text) {

        text.textContent =
          isOpen
            ? "접기"
            : "더보기";

      }

    }
  );


  /* ========================================
     Recommend Initial
  ======================================== */

  setRecommendMobileState();


  /* ========================================
     Recommend Resize
  ======================================== */

  window.addEventListener(
    "resize",
    setRecommendMobileState
  );

}

/* ========================================
   MD Mobile More
======================================== */

const mdMoreButton =
  document.querySelector(".md__more-button");

const mdExtraCards =
  document.querySelectorAll(
    ".md-card--mobile-extra"
  );


if (
  mdMoreButton &&
  mdExtraCards.length > 0
) {

  /* ========================================
     MD More Button Click
  ======================================== */

  mdMoreButton.addEventListener(
    "click",
    function () {

      const isOpen =
        mdMoreButton.classList.toggle(
          "is-open"
        );


      /* ========================================
         MD Extra Cards Toggle
      ======================================== */

      mdExtraCards.forEach(
        function (card) {

          card.classList.toggle(
            "is-visible",
            isOpen
          );

        }
      );


      /* ========================================
         Accessibility
      ======================================== */

      mdMoreButton.setAttribute(
        "aria-expanded",
        isOpen
      );


      /* ========================================
         MD More Text
      ======================================== */

      const mdMoreText =
        mdMoreButton.querySelector(
          ".md__more-text"
        );


      if (mdMoreText) {

        mdMoreText.textContent =
          isOpen
            ? "접기"
            : "더보기";

      }

    }
  );


  /* ========================================
     MD Resize Reset
  ======================================== */

  window.addEventListener(
    "resize",
    function () {

      if (window.innerWidth > 767) {

        mdMoreButton.classList.remove(
          "is-open"
        );


        mdMoreButton.setAttribute(
          "aria-expanded",
          "false"
        );


        mdExtraCards.forEach(
          function (card) {

            card.classList.remove(
              "is-visible"
            );

          }
        );


        const mdMoreText =
          mdMoreButton.querySelector(
            ".md__more-text"
          );


        if (mdMoreText) {

          mdMoreText.textContent =
            "더보기";

        }

      }

    }
  );

}