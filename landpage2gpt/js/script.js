"use strict";


/* ========================================
   DOM
======================================== */

const modal =
  document.getElementById("leadModal");

const modalOpenButtons =
  document.querySelectorAll(".js-modal-open");

const modalCloseButtons =
  document.querySelectorAll("[data-modal-close]");

const modalTitle =
  document.getElementById("modalTitle");

const modalDescription =
  document.getElementById("modalDescription");

const leadForm =
  document.getElementById("leadForm");

const modalFormView =
  document.getElementById("modalFormView");

const modalSuccessView =
  document.getElementById("modalSuccessView");

const successTitle =
  document.getElementById("successTitle");

const successDescription =
  document.getElementById("successDescription");

const leadType =
  document.getElementById("leadType");

const ctaSource =
  document.getElementById("ctaSource");

const submitButton =
  document.getElementById("submitButton");

const privacyDetailButton =
  document.getElementById("privacyDetailButton");

const privacyContent =
  document.getElementById("privacyContent");

const nameInput =
  document.getElementById("name");

const emailInput =
  document.getElementById("email");

const phoneInput =
  document.getElementById("phone");

const privacyInput =
  document.getElementById("privacy");


/* ========================================
   Modal Content
======================================== */

const modalContent = {

  content: {
    title:
      "AI 실무 활용 가이드 받아보기",

    description:
      "간단한 정보를 남겨주시면 AI 실무 활용 콘텐츠를 보내드립니다.",

    button:
      "무료 가이드 받기",

    successTitle:
      "신청이 완료되었습니다.",

    successDescription:
      "입력한 이메일로 AI 실무 활용 콘텐츠를 보내드립니다."
  },

  consulting: {
    title:
      "AI 업무 활용 상담 신청",

    description:
      "현재 업무와 AI 활용 고민에 맞는 협업 방향을 안내해드립니다.",

    button:
      "상담 신청하기",

    successTitle:
      "상담 신청이 완료되었습니다.",

    successDescription:
      "입력하신 연락처를 통해 추가 안내를 드리겠습니다."
  }

};


/* ========================================
   Modal Open
======================================== */

function openModal(type, source) {

  const content =
    modalContent[type] ||
    modalContent.content;

  leadType.value = type;
  ctaSource.value = source;

  modalTitle.textContent =
    content.title;

  modalDescription.textContent =
    content.description;

  submitButton.textContent =
    content.button;

  successTitle.textContent =
    content.successTitle;

  successDescription.textContent =
    content.successDescription;


  modalFormView.hidden = false;
  modalSuccessView.hidden = true;

  modal.classList.add("is-open");
  modal.setAttribute(
    "aria-hidden",
    "false"
  );

  document.body.classList.add(
    "modal-open"
  );


  /*
    접근성:
    Modal open 후 첫 번째 input으로
    focus 이동
  */

  setTimeout(() => {
    nameInput.focus();
  }, 50);

}


/* ========================================
   Modal Close
======================================== */

function closeModal() {

  modal.classList.remove("is-open");

  modal.setAttribute(
    "aria-hidden",
    "true"
  );

  document.body.classList.remove(
    "modal-open"
  );

  resetForm();

}


/* ========================================
   CTA Click
======================================== */

modalOpenButtons.forEach(button => {

  button.addEventListener(
    "click",
    function () {

      const type =
        this.dataset.modalType;

      const source =
        this.dataset.source;

      openModal(type, source);


      /*
        Analytics를 연결한다면
        아래 위치에서 이벤트 기록 가능

        예:
        gtag("event", "modal_open", {
          lead_type: type,
          cta_source: source
        });
      */

      console.log(
        "Modal Open:",
        {
          type,
          source
        }
      );

    }
  );

});


/* ========================================
   Close Event
======================================== */

modalCloseButtons.forEach(button => {

  button.addEventListener(
    "click",
    closeModal
  );

});


/* ESC key */

document.addEventListener(
  "keydown",
  function (event) {

    if (
      event.key === "Escape" &&
      modal.classList.contains("is-open")
    ) {
      closeModal();
    }

  }
);


/* ========================================
   Privacy Detail
======================================== */

privacyDetailButton.addEventListener(
  "click",
  function () {

    const isOpen =
      privacyContent.classList.toggle(
        "is-open"
      );

    this.textContent =
      isOpen
        ? "닫기"
        : "자세히 보기";

  }
);


/* ========================================
   Phone Auto Format
======================================== */

phoneInput.addEventListener(
  "input",
  function () {

    let value =
      this.value.replace(/\D/g, "");

    value =
      value.substring(0, 11);


    if (value.length < 4) {

      this.value = value;

    } else if (value.length < 8) {

      this.value =
        value.slice(0, 3) +
        "-" +
        value.slice(3);

    } else {

      this.value =
        value.slice(0, 3) +
        "-" +
        value.slice(3, 7) +
        "-" +
        value.slice(7, 11);

    }

  }
);


/* ========================================
   Validation Helper
======================================== */

function showError(
  input,
  errorElementId,
  message
) {

  const field =
    input.closest(".form-field");

  if (field) {
    field.classList.add("is-error");
  }

  const errorElement =
    document.getElementById(
      errorElementId
    );

  errorElement.textContent =
    message;

}


function clearError(
  input,
  errorElementId
) {

  const field =
    input.closest(".form-field");

  if (field) {
    field.classList.remove("is-error");
  }

  const errorElement =
    document.getElementById(
      errorElementId
    );

  errorElement.textContent = "";

}


/* ========================================
   Name Validation
======================================== */

function validateName() {

  const value =
    nameInput.value.trim();

  if (!value) {

    showError(
      nameInput,
      "nameError",
      "이름을 입력해주세요."
    );

    return false;
  }

  if (value.length < 2) {

    showError(
      nameInput,
      "nameError",
      "이름을 2자 이상 입력해주세요."
    );

    return false;
  }

  clearError(
    nameInput,
    "nameError"
  );

  return true;

}


/* ========================================
   Email Validation
======================================== */

function validateEmail() {

  const value =
    emailInput.value.trim();

  const emailRegExp =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!value) {

    showError(
      emailInput,
      "emailError",
      "이메일 주소를 입력해주세요."
    );

    return false;
  }

  if (!emailRegExp.test(value)) {

    showError(
      emailInput,
      "emailError",
      "올바른 이메일 주소를 입력해주세요."
    );

    return false;
  }

  clearError(
    emailInput,
    "emailError"
  );

  return true;

}


/* ========================================
   Phone Validation
======================================== */

function validatePhone() {

  const value =
    phoneInput.value.replace(/\D/g, "");

  const phoneRegExp =
    /^01[016789]\d{7,8}$/;

  if (!value) {

    showError(
      phoneInput,
      "phoneError",
      "전화번호를 입력해주세요."
    );

    return false;
  }

  if (!phoneRegExp.test(value)) {

    showError(
      phoneInput,
      "phoneError",
      "전화번호를 확인해주세요."
    );

    return false;
  }

  clearError(
    phoneInput,
    "phoneError"
  );

  return true;

}


/* ========================================
   Privacy Validation
======================================== */

function validatePrivacy() {

  const error =
    document.getElementById(
      "privacyError"
    );

  if (!privacyInput.checked) {

    error.textContent =
      "개인정보 수집 및 이용 동의가 필요합니다.";

    return false;
  }

  error.textContent = "";

  return true;

}


/* ========================================
   Real-time Validation
======================================== */

nameInput.addEventListener(
  "blur",
  validateName
);

emailInput.addEventListener(
  "blur",
  validateEmail
);

phoneInput.addEventListener(
  "blur",
  validatePhone
);

privacyInput.addEventListener(
  "change",
  validatePrivacy
);


/* ========================================
   Submit
======================================== */

leadForm.addEventListener(
  "submit",
  async function (event) {

    event.preventDefault();


    const isNameValid =
      validateName();

    const isEmailValid =
      validateEmail();

    const isPhoneValid =
      validatePhone();

    const isPrivacyValid =
      validatePrivacy();


    const isValid =
      isNameValid &&
      isEmailValid &&
      isPhoneValid &&
      isPrivacyValid;


    if (!isValid) {
      return;
    }


    /* ----------------------------------------
       제출 데이터
    ----------------------------------------- */

    const formData = {

      name:
        nameInput.value.trim(),

      email:
        emailInput.value.trim(),

      phone:
        phoneInput.value.replace(
          /\D/g,
          ""
        ),

      leadType:
        leadType.value,

      ctaSource:
        ctaSource.value,

      privacyAgreement:
        privacyInput.checked,

      createdAt:
        new Date().toISOString()

    };


    /* ----------------------------------------
       Loading
    ----------------------------------------- */

    const originalButtonText =
      submitButton.textContent;

    submitButton.disabled = true;
    submitButton.textContent =
      "신청 중...";


    try {

      /*
      ==========================================
      실제 Backend 연결 시 이 부분 사용
      ==========================================

      const response =
        await fetch(
          "/api/leads",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json"
            },

            body:
              JSON.stringify(formData)
          }
        );


      if (!response.ok) {
        throw new Error(
          "Lead submission failed."
        );
      }

      */


      /*
        현재는 프론트엔드 데모이므로
        서버 요청을 대신해 짧은 지연 처리
      */

      await new Promise(resolve => {

        setTimeout(
          resolve,
          700
        );

      });


      console.log(
        "Lead Data:",
        formData
      );


      /*
        Analytics 연결 예:

        gtag(
          "event",
          "form_success",
          {
            lead_type:
              formData.leadType,

            cta_source:
              formData.ctaSource
          }
        );
      */


      modalFormView.hidden = true;
      modalSuccessView.hidden = false;


    } catch (error) {

      console.error(error);

      alert(
        "신청을 완료하지 못했습니다. 잠시 후 다시 시도해주세요."
      );


    } finally {

      submitButton.disabled = false;
      submitButton.textContent =
        originalButtonText;

    }

  }
);


/* ========================================
   Reset Form
======================================== */

function resetForm() {

  leadForm.reset();

  [
    ["nameError", nameInput],
    ["emailError", emailInput],
    ["phoneError", phoneInput]
  ].forEach(
    ([errorId, input]) => {

      clearError(
        input,
        errorId
      );

    }
  );


  document.getElementById(
    "privacyError"
  ).textContent = "";


  privacyContent.classList.remove(
    "is-open"
  );

  privacyDetailButton.textContent =
    "자세히 보기";


  modalFormView.hidden = false;
  modalSuccessView.hidden = true;

}


/* ========================================
   Scroll Reveal
======================================== */

const revealElements =
  document.querySelectorAll(".reveal");


const revealObserver =
  new IntersectionObserver(
    entries => {

      entries.forEach(entry => {

        if (
          entry.isIntersecting
        ) {

          entry.target.classList.add(
            "is-visible"
          );

          revealObserver.unobserve(
            entry.target
          );

        }

      });

    },
    {
      threshold: 0.12
    }
  );


revealElements.forEach(element => {

  revealObserver.observe(element);

});


/* ========================================
   Header Shadow
======================================== */

const header =
  document.getElementById("header");


window.addEventListener(
  "scroll",
  function () {

    if (window.scrollY > 20) {

      header.style.boxShadow =
        "0 8px 30px rgba(15, 23, 42, 0.06)";

    } else {

      header.style.boxShadow =
        "none";

    }

  }
);