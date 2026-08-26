"use strict";

/* =========================================================
   ★ 가장 먼저 확인할 설정 2개
   ========================================================= */

/*
  결혼식 기준 시각.
  +09:00 = 대한민국 표준시
*/
const WEDDING_DATE =
  new Date("2026-09-01T12:00:00+09:00");

/*
  ★ 수정 필요 2: Google Apps Script 웹 앱 /exec URL
  예:
  https://script.google.com/macros/s/XXXXXXXXXXXX/exec
*/
const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxfmw4owB24pF7pfen5y_1xaUQiOabJxujoMY8IHwgjox9FfCrFdG4rdJcbJd5ND8se/exec";


/* ========================================
   Toast Message
======================================== */
const toast = document.querySelector("#toast");
let toastTimer = null;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);

  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2200);
}


/* ========================================
   01. Scroll Reveal
======================================== */
const revealElements =
  document.querySelectorAll(".reveal");

const revealObserver =
  new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("show");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.15,
      rootMargin: "0px 0px -40px 0px"
    }
  );

revealElements.forEach((element) => {
  revealObserver.observe(element);
});


/* ========================================
   02. Wedding Countdown
======================================== */
const daysElement = document.querySelector("#days");
const hoursElement = document.querySelector("#hours");
const minutesElement = document.querySelector("#minutes");
const secondsElement = document.querySelector("#seconds");
const dDayText = document.querySelector("#d-day-text");
const countdown = document.querySelector("#countdown");
const weddingFinished = document.querySelector("#wedding-finished");

function padNumber(number) {
  return String(number).padStart(2, "0");
}

function updateNumber(element, value) {
  const formattedValue = padNumber(value);

  if (element.textContent === formattedValue) return;

  element.textContent = formattedValue;
  element.classList.remove("count-change");
  void element.offsetWidth;
  element.classList.add("count-change");
}

function updateCountdown() {
  const now = new Date();
  const difference =
    WEDDING_DATE.getTime() - now.getTime();

  if (difference <= 0) {
    countdown.style.display = "none";
    dDayText.style.display = "none";
    weddingFinished.style.display = "block";
    return;
  }

  const totalSeconds =
    Math.floor(difference / 1000);

  const days =
    Math.floor(totalSeconds / (60 * 60 * 24));

  const hours =
    Math.floor(
      (totalSeconds % (60 * 60 * 24)) / (60 * 60)
    );

  const minutes =
    Math.floor(
      (totalSeconds % (60 * 60)) / 60
    );

  const seconds =
    totalSeconds % 60;

  updateNumber(daysElement, days);
  updateNumber(hoursElement, hours);
  updateNumber(minutesElement, minutes);
  updateNumber(secondsElement, seconds);

  dDayText.textContent = `D-${days}`;
}

updateCountdown();
setInterval(updateCountdown, 1000);


/* ========================================
   03. Wedding Gallery
======================================== */
const weddingSwiper =
  new Swiper(".wedding-swiper", {
    slidesPerView: "auto",
    spaceBetween: 14,
    centeredSlides: true,
    grabCursor: true,
    pagination: {
      el: ".swiper-pagination",
      clickable: true
    }
  });


/* ========================================
   04. Gallery Image Modal
======================================== */
const galleryImages =
  document.querySelectorAll(".wedding-swiper img");

const imageModal =
  document.querySelector("#image-modal");

const modalImage =
  document.querySelector("#modal-image");

const modalClose =
  document.querySelector("#modal-close");

galleryImages.forEach((image) => {
  image.addEventListener("click", () => {
    modalImage.src = image.src;
    imageModal.classList.add("show");
    imageModal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  });
});

function closeImageModal() {
  imageModal.classList.remove("show");
  imageModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

modalClose.addEventListener(
  "click",
  closeImageModal
);

imageModal.addEventListener(
  "click",
  (event) => {
    if (event.target === imageModal) {
      closeImageModal();
    }
  }
);


/* ========================================
   05. Kakao Map
======================================== */
function initializeKakaoMap() {
  const mapContainer =
    document.querySelector("#map");

  if (
    typeof kakao === "undefined" ||
    !kakao.maps
  ) {
    mapContainer.innerHTML = `
      <div
        style="
          width:100%;
          height:100%;
          display:flex;
          align-items:center;
          justify-content:center;
          padding:20px;
          text-align:center;
          color:#888;
          font-size:12px;
        "
      >
        Kakao JavaScript Key와<br>
        사용 도메인을 설정하면 지도가 표시됩니다.
      </div>
    `;

    return;
  }

  const defaultPosition =
    new kakao.maps.LatLng(
      37.5565,
      127.0052
    );

  const map =
    new kakao.maps.Map(
      mapContainer,
      {
        center: defaultPosition,
        level: 4
      }
    );

  const places =
    new kakao.maps.services.Places();

  places.keywordSearch(
    "서울 신라호텔 영빈관",
    (result, status) => {
      if (
        status !==
        kakao.maps.services.Status.OK
      ) {
        return;
      }

      const place = result[0];

      const position =
        new kakao.maps.LatLng(
          place.y,
          place.x
        );

      map.setCenter(position);

      const marker =
        new kakao.maps.Marker({
          position: position
        });

      marker.setMap(map);

      const infoWindow =
        new kakao.maps.InfoWindow({
          content: `
            <div
              style="
                padding:8px 12px;
                font-size:12px;
                white-space:nowrap;
              "
            >
              서울 신라호텔 영빈관
            </div>
          `
        });

      infoWindow.open(map, marker);
    }
  );
}

initializeKakaoMap();


/* ========================================
   06. Address Copy
======================================== */
const copyAddressButton =
  document.querySelector("#copy-address");

copyAddressButton.addEventListener(
  "click",
  async () => {
    const address =
      document
        .querySelector("#venue-address")
        .textContent
        .trim();

    try {
      await navigator.clipboard.writeText(address);

      showToast(
        "주소가 복사되었습니다."
      );
    } catch (error) {
      console.error(error);

      showToast(
        "주소 복사에 실패했습니다."
      );
    }
  }
);


/* ========================================
   07. Account Accordion
======================================== */
const accountToggles =
  document.querySelectorAll(".account-toggle");

accountToggles.forEach((button) => {
  button.addEventListener(
    "click",
    () => {
      const accountItem =
        button.closest(".account-item");

      accountItem.classList.toggle("active");
    }
  );
});


/* ========================================
   08. Account Copy
======================================== */
const accountCopyButtons =
  document.querySelectorAll(".copy-account");

accountCopyButtons.forEach((button) => {
  button.addEventListener(
    "click",
    async () => {
      const account =
        button.dataset.account;

      try {
        await navigator.clipboard.writeText(account);

        showToast(
          "계좌번호가 복사되었습니다."
        );
      } catch (error) {
        console.error(error);

        showToast(
          "계좌번호 복사에 실패했습니다."
        );
      }
    }
  );
});

/* ========================================
   09. RSVP
======================================== */

const rsvpForm =
  document.querySelector("#rsvp-form");

const rsvpName =
  document.querySelector("#rsvp-name");

const rsvpSubmit =
  document.querySelector("#rsvp-submit");

const rsvpStatus =
  document.querySelector("#rsvp-status");

const attendanceRadios =
  document.querySelectorAll(
    'input[name="attendance"]'
  );

const rsvpAttendanceDetail =
  document.querySelector(
    "#rsvp-attendance-detail"
  );


/* ========================================
   참석 / 불참에 따른 상세 항목 표시
======================================== */

attendanceRadios.forEach((radio) => {

  radio.addEventListener(
    "change",
    () => {

      const attendance =
        document.querySelector(
          'input[name="attendance"]:checked'
        )?.value;


      if (attendance === "불참") {

        /*
          불참일 경우
          동반 인원 / 식사 여부 숨김
        */
        rsvpAttendanceDetail
          .classList
          .add("hide");


        /*
          식사 radio 선택값 초기화
        */
        document
          .querySelectorAll(
            'input[name="meal"]'
          )
          .forEach((mealRadio) => {

            mealRadio.checked = false;

          });


        /*
          동반 인원 0으로 초기화
        */
        document
          .querySelector(
            "#rsvp-companions"
          )
          .value = "0";

      }

      else {

        rsvpAttendanceDetail
          .classList
          .remove("hide");

      }

    }
  );

});


/* ========================================
   RSVP Submit
======================================== */

rsvpForm.addEventListener(
  "submit",

  async (event) => {

    event.preventDefault();


    const name =
      rsvpName.value.trim();


    const side =
      document.querySelector(
        'input[name="side"]:checked'
      )?.value;


    const attendance =
      document.querySelector(
        'input[name="attendance"]:checked'
      )?.value;


    let companions = "0";

    let meal = "해당없음";


    /* ========================================
       Validation
    ======================================== */

    if (!name) {

      showToast(
        "이름을 입력해주세요."
      );

      rsvpName.focus();

      return;

    }


    if (!side) {

      showToast(
        "신랑측 또는 신부측을 선택해주세요."
      );

      return;

    }


    if (!attendance) {

      showToast(
        "참석 여부를 선택해주세요."
      );

      return;

    }


    /*
      참석자일 때만
      동반 인원과 식사 여부 확인
    */
    if (attendance === "참석") {

      companions =
        document.querySelector(
          "#rsvp-companions"
        ).value;


      meal =
        document.querySelector(
          'input[name="meal"]:checked'
        )?.value;


      if (!meal) {

        showToast(
          "식사 여부를 선택해주세요."
        );

        return;

      }

    }


    /*
      Apps Script URL 미설정 상태
    */
    if (
      GOOGLE_SCRIPT_URL.includes(
        "YOUR_GOOGLE"
      )
    ) {

      showToast(
        "Google Apps Script URL을 설정해주세요."
      );

      return;

    }


    rsvpSubmit.disabled = true;

    rsvpSubmit.textContent =
      "전달 중...";


    rsvpStatus.textContent = "";


    try {

      const formData =
        new URLSearchParams();


      /*
        어떤 데이터를 저장할지
        Apps Script에 전달합니다.
      */
      formData.append(
        "action",
        "rsvp"
      );


      formData.append(
        "name",
        name
      );


      formData.append(
        "side",
        side
      );


      formData.append(
        "attendance",
        attendance
      );


      formData.append(
        "companions",
        companions
      );


      formData.append(
        "meal",
        meal
      );


      const response =
        await fetch(
          GOOGLE_SCRIPT_URL,
          {
            method: "POST",
            body: formData
          }
        );


      if (!response.ok) {

        throw new Error(
          "RSVP request failed"
        );

      }


      const result =
        await response.json();


      if (!result.success) {

        throw new Error(
          result.message ||
          "RSVP failed"
        );

      }


      /*
        성공 후 Form 초기화
      */
      rsvpForm.reset();


      rsvpAttendanceDetail
        .classList
        .remove("hide");


      showToast(
        "참석 여부가 전달되었습니다."
      );


      rsvpStatus.textContent =
        "소중한 답변 감사합니다.";


    }

    catch (error) {

      console.error(
        "RSVP ERROR:",
        error
      );


      showToast(
        "참석 여부 전달에 실패했습니다."
      );


      rsvpStatus.textContent =
        "잠시 후 다시 시도해주세요.";


    }

    finally {

      rsvpSubmit.disabled = false;

      rsvpSubmit.textContent =
        "참석 여부 전달하기";

    }

  }

);

/* ========================================
   09. Guestbook
======================================== */
const guestbookForm =
  document.querySelector("#guestbook-form");

const guestName =
  document.querySelector("#guest-name");

const guestMessage =
  document.querySelector("#guest-message");

const messageLength =
  document.querySelector("#message-length");

const guestbookSubmit =
  document.querySelector("#guestbook-submit");

const guestbookList =
  document.querySelector("#guestbook-list");

guestMessage.addEventListener(
  "input",
  () => {
    messageLength.textContent =
      guestMessage.value.length;
  }
);

function escapeHTML(text) {
  const div =
    document.createElement("div");

  div.textContent = text;

  return div.innerHTML;
}

function formatGuestbookDate(dateText) {
  const date = new Date(dateText);

  if (Number.isNaN(date.getTime())) {
    return dateText;
  }

  return new Intl.DateTimeFormat(
    "ko-KR",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }
  ).format(date);
}

function renderGuestbook(data) {
  guestbookList.innerHTML = "";

  if (
    !Array.isArray(data) ||
    data.length === 0
  ) {
    guestbookList.innerHTML = `
      <div class="guestbook-empty">
        아직 등록된 축하 메시지가 없습니다.
      </div>
    `;
    return;
  }

  const reversedData =
    [...data].reverse();

  reversedData.forEach((item) => {
    const card =
      document.createElement("article");

    card.className = "guestbook-card";

    card.innerHTML = `
      <div class="guestbook-card-header">
        <strong>${escapeHTML(item.name)}</strong>

        <span class="guestbook-date">
          ${formatGuestbookDate(item.date)}
        </span>
      </div>

      <p>${escapeHTML(item.message)}</p>
    `;

    guestbookList.appendChild(card);
  });
}

async function loadGuestbook() {
  if (
    GOOGLE_SCRIPT_URL.includes(
      "YOUR_GOOGLE"
    )
  ) {
    guestbookList.innerHTML = `
      <div class="guestbook-empty">
        Google Apps Script /exec URL을 설정하면<br>
        방명록이 표시됩니다.
      </div>
    `;

    return;
  }

  try {
    const response =
      await fetch(
        `${GOOGLE_SCRIPT_URL}?action=list`
      );

    if (!response.ok) {
      throw new Error(
        "Guestbook request failed"
      );
    }

    const result =
      await response.json();

    renderGuestbook(
      result.data || []
    );
  } catch (error) {
    console.error(error);

    guestbookList.innerHTML = `
      <div class="guestbook-empty">
        방명록을 불러오지 못했습니다.
      </div>
    `;
  }
}

loadGuestbook();

guestbookForm.addEventListener(
  "submit",
  async (event) => {
    event.preventDefault();

    const name =
      guestName.value.trim();

    const message =
      guestMessage.value.trim();

    if (!name) {
      showToast(
        "이름을 입력해주세요."
      );
      guestName.focus();
      return;
    }

    if (!message) {
      showToast(
        "축하 메시지를 입력해주세요."
      );
      guestMessage.focus();
      return;
    }

    if (
      GOOGLE_SCRIPT_URL.includes(
        "YOUR_GOOGLE"
      )
    ) {
      showToast(
        "Google Apps Script /exec URL을 설정해주세요."
      );
      return;
    }

    guestbookSubmit.disabled = true;
    guestbookSubmit.textContent = "등록 중...";

    try {
      const formData =
        new URLSearchParams();

      formData.append("name", name);
      formData.append("message", message);

      const response =
        await fetch(
          GOOGLE_SCRIPT_URL,
          {
            method: "POST",
            body: formData
          }
        );

      if (!response.ok) {
        throw new Error(
          "Guestbook submit failed"
        );
      }

      const result =
        await response.json();

      if (!result.success) {
        throw new Error(
          result.message ||
          "Registration failed"
        );
      }

      guestbookForm.reset();
      messageLength.textContent = "0";

      showToast(
        "축하 메시지가 등록되었습니다."
      );

      await loadGuestbook();
    } catch (error) {
      console.error(error);

      showToast(
        "메시지 등록에 실패했습니다."
      );
    } finally {
      guestbookSubmit.disabled = false;
      guestbookSubmit.textContent =
        "축하 메시지 남기기";
    }
  }
);


/* ========================================
   10. Invitation Link Copy
======================================== */
const copyLinkButton =
  document.querySelector("#copy-link");

copyLinkButton.addEventListener(
  "click",
  async () => {
    try {
      await navigator.clipboard.writeText(
        window.location.href
      );

      showToast(
        "청첩장 링크가 복사되었습니다."
      );
    } catch (error) {
      console.error(error);

      showToast(
        "링크 복사에 실패했습니다."
      );
    }
  }
);
