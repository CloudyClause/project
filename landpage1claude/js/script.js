(() => {
  'use strict';

  /* ---------------------------------------------
     1. Nav — solid background after scrolling past hero
  --------------------------------------------- */
  const nav = document.getElementById('nav');
  const onScrollNav = () => {
    if (window.scrollY > 60) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  };
  onScrollNav();
  window.addEventListener('scroll', onScrollNav, { passive: true });

  /* ---------------------------------------------
     2. Scroll-reveal for elements marked .reveal
  --------------------------------------------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------------------------------------------
     3. CTA Popup (modal) — open / close
  --------------------------------------------- */
  const backdrop = document.getElementById('modalBackdrop');
  const modal = backdrop.querySelector('.modal');
  const openTriggers = document.querySelectorAll('[data-open-modal]');
  const closeBtn = document.getElementById('modalClose');
  const successCloseBtn = document.getElementById('successClose');

  let lastFocused = null;

  function openModal(e) {
    if (e) e.preventDefault();
    lastFocused = document.activeElement;
    backdrop.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    const firstField = document.getElementById('fieldName');
    setTimeout(() => firstField && firstField.focus(), 250);
  }

  function closeModal() {
    backdrop.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  openTriggers.forEach((btn) => btn.addEventListener('click', openModal));
  closeBtn.addEventListener('click', closeModal);
  successCloseBtn.addEventListener('click', closeModal);

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && backdrop.classList.contains('is-open')) closeModal();
  });

  // simple focus trap within the modal
  modal.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusable = modal.querySelectorAll('button, input, a[href]');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  /* ---------------------------------------------
     4. Lead form — validation, phone formatting, submit
  --------------------------------------------- */
  const form = document.getElementById('leadForm');
  const nameField = document.getElementById('fieldName');
  const emailField = document.getElementById('fieldEmail');
  const phoneField = document.getElementById('fieldPhone');
  const consentField = document.getElementById('fieldConsent');
  const submitBtn = document.getElementById('submitBtn');
  const formState = document.getElementById('formState');
  const successState = document.getElementById('successState');

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function formatPhone(value) {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length < 4) return digits;
    if (digits.length < 8) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  }

  phoneField.addEventListener('input', () => {
    phoneField.value = formatPhone(phoneField.value);
    validateAll();
  });

  function validators() {
    return {
      fieldName: nameField.value.trim().length >= 2 && nameField.value.trim().length <= 20,
      fieldEmail: EMAIL_RE.test(emailField.value.trim()),
      fieldPhone: /^01[0-9]-\d{3,4}-\d{4}$/.test(phoneField.value.trim()),
    };
  }

  function showFieldError(fieldEl, valid) {
    const wrapper = fieldEl.closest('.field');
    if (fieldEl.value.trim() === '') {
      wrapper.classList.remove('has-error');
      return;
    }
    wrapper.classList.toggle('has-error', !valid);
  }

  function validateAll() {
    const v = validators();
    showFieldError(nameField, v.fieldName);
    showFieldError(emailField, v.fieldEmail);
    showFieldError(phoneField, v.fieldPhone);

    const allValid = v.fieldName && v.fieldEmail && v.fieldPhone && consentField.checked;
    submitBtn.disabled = !allValid;
    return allValid;
  }

  [nameField, emailField].forEach((field) => {
    field.addEventListener('input', validateAll);
    field.addEventListener('blur', validateAll);
  });
  consentField.addEventListener('change', validateAll);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateAll() || submitBtn.classList.contains('is-loading')) return;

    submitBtn.classList.add('is-loading');
    submitBtn.disabled = true;

    // Simulate submission — replace with a real API call when the backend is ready.
    setTimeout(() => {
      submitBtn.classList.remove('is-loading');
      formState.hidden = true;
      successState.hidden = false;
    }, 900);
  });

  // Reset form + view state whenever the modal is closed
  backdrop.addEventListener('transitionend', (e) => {
    if (e.propertyName !== 'opacity') return;
    if (backdrop.classList.contains('is-open')) return;
    form.reset();
    formState.hidden = false;
    successState.hidden = true;
    submitBtn.disabled = true;
    document.querySelectorAll('.field').forEach((f) => f.classList.remove('has-error'));
  });
})();
