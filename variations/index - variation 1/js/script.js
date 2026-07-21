/* =========================================================
   INTERRIORS — variation 1 "Terracotta Editorial" script
   Adds: accordion (services), timeline scroll-fill (roadmap),
   snap-carousel controls (portfolio). Core UX kept from original.
   ========================================================= */
(function () {
  'use strict';

  var header       = document.getElementById('header');
  var utilityBar    = document.querySelector('.utility-bar');
  var burger       = document.getElementById('burger');
  var burgerClose  = document.getElementById('burger-close');
  var mobileMenu   = document.getElementById('mobile-menu');
  var overlay      = document.getElementById('overlay');
  var toTopBtn     = document.getElementById('to-top');
  var quickCta     = document.getElementById('quick-cta');
  var preloader    = document.getElementById('preloader');

  /* Preloader */
  function hidePreloader() {
    if (!preloader) return;
    preloader.classList.add('is-hidden');
    window.setTimeout(function () {
      if (preloader && preloader.parentNode) preloader.parentNode.removeChild(preloader);
    }, 600);
  }
  window.addEventListener('load', function () { window.setTimeout(hidePreloader, 250); });
  window.setTimeout(hidePreloader, 4000);

  /* Header scroll state + scrollspy */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));

  function headerOffset() {
    var h = header ? header.offsetHeight : 74;
    var u = (utilityBar && !header.classList.contains('is-scrolled')) ? utilityBar.offsetHeight : 0;
    return h + u;
  }

  function onScroll() {
    var y = window.scrollY || window.pageYOffset;
    if (header) header.classList.toggle('is-scrolled', y > 40);

    var showFloats = y > 480;
    if (toTopBtn) toTopBtn.classList.toggle('is-visible', showFloats);
    if (quickCta) quickCta.classList.toggle('is-visible', showFloats);

    var offset = headerOffset() + 60;
    var current = null;
    for (var i = 0; i < sections.length; i++) {
      var rect = sections[i].getBoundingClientRect();
      if (rect.top <= offset && rect.bottom > offset) { current = sections[i].id; break; }
    }
    navLinks.forEach(function (link) {
      link.classList.toggle('is-active', !!current && link.getAttribute('href') === '#' + current);
    });

    updateTimelineFill();
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* Smooth anchor scroll with header offset */
  function scrollToTarget(target) {
    var rect = target.getBoundingClientRect();
    var top = rect.top + window.pageYOffset - headerOffset() + 1;
    window.scrollTo({ top: top, behavior: 'smooth' });
  }
  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!link) return;
    var id = link.getAttribute('href');
    if (!id || id === '#') return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    closeMobileMenu();
    scrollToTarget(target);
  });

  /* Mobile menu */
  function openMobileMenu() {
    mobileMenu.classList.add('is-open'); overlay.classList.add('is-visible');
    mobileMenu.setAttribute('aria-hidden', 'false'); burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('modal-open');
  }
  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('is-open'); overlay.classList.remove('is-visible');
    mobileMenu.setAttribute('aria-hidden', 'true'); burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('modal-open');
  }
  if (burger) burger.addEventListener('click', openMobileMenu);
  if (burgerClose) burgerClose.addEventListener('click', closeMobileMenu);
  if (overlay) overlay.addEventListener('click', closeMobileMenu);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMobileMenu(); });

  /* Reveal on scroll */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('in-view'); revealObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    revealItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add('in-view'); });
  }

  /* Phone mask */
  function maskPhone(input) {
    input.addEventListener('input', function () {
      var digits = input.value.replace(/\D/g, '');
      if (digits.charAt(0) === '8') digits = '7' + digits.slice(1);
      if (digits.charAt(0) !== '7') digits = '7' + digits;
      digits = digits.slice(0, 11);
      var out = '+7';
      if (digits.length > 1) out += ' (' + digits.slice(1, 4);
      if (digits.length >= 4) out += ') ' + digits.slice(4, 7);
      if (digits.length >= 7) out += ' ' + digits.slice(7, 9);
      if (digits.length >= 9) out += ' ' + digits.slice(9, 11);
      input.value = out;
    });
    input.addEventListener('focus', function () { if (!input.value) input.value = '+7 '; });
  }
  Array.prototype.slice.call(document.querySelectorAll('input[type="tel"]')).forEach(maskPhone);

  /* Form validation + fake submit */
  function validateField(field, rules) {
    var input = field.querySelector('input, textarea');
    var errorEl = field.querySelector('.field__error');
    var value = input.value.trim();
    var message = '';
    if (rules.required && !value) message = 'Обязательное поле';
    else if (rules.minLength && value.length < rules.minLength) message = 'Слишком короткое значение';
    else if (rules.phone && value) { if (value.replace(/\D/g, '').length < 11) message = 'Проверьте номер телефона'; }
    else if (rules.email && value) { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) message = 'Проверьте адрес email'; }
    field.classList.toggle('has-error', !!message);
    if (errorEl) errorEl.textContent = message;
    return !message;
  }
  function validateConsent(checkbox, errorEl) {
    var valid = checkbox.checked;
    if (errorEl) errorEl.textContent = valid ? '' : 'Необходимо согласие на обработку персональных данных';
    return valid;
  }
  function setupForm(formId, successId) {
    var form = document.getElementById(formId);
    if (!form) return;
    var success = document.getElementById(successId);
    var submitBtn = form.querySelector('button[type="submit"]');
    var consentInput = form.querySelector('input[name="consent"]');
    var consentError = form.querySelector('.field__error--consent');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var validity = true;
      Array.prototype.slice.call(form.querySelectorAll('.field')).forEach(function (field) {
        var input = field.querySelector('input, textarea');
        if (!input) return;
        var rules = {};
        if (input.name === 'name') rules = { required: true, minLength: 2 };
        if (input.name === 'phone') rules = { required: true, phone: true };
        if (input.name === 'email') rules = { email: true };
        if (Object.keys(rules).length) validity = validateField(field, rules) && validity;
      });
      if (consentInput) validity = validateConsent(consentInput, consentError) && validity;
      if (!validity) return;

      submitBtn.classList.add('is-loading'); submitBtn.disabled = true;
      // Backend integration point: replace with real fetch()/XHR call.
      window.setTimeout(function () {
        submitBtn.classList.remove('is-loading'); submitBtn.disabled = false;
        if (success) success.hidden = false;
        form.classList.add('is-success'); form.reset();
        if (formId === 'quick-form') window.setTimeout(closeQuickModal, 2200);
      }, 900);
    });
  }
  setupForm('contact-form', 'form-success');
  setupForm('quick-form', 'quick-form-success');

  /* Quick request modal */
  var quickModal = document.getElementById('quick-modal');
  var lastFocusedEl = null;
  function openQuickModal() {
    if (!quickModal) return;
    lastFocusedEl = document.activeElement;
    quickModal.classList.add('is-open'); quickModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    var firstInput = quickModal.querySelector('input');
    if (firstInput) window.setTimeout(function () { firstInput.focus(); }, 350);
  }
  function closeQuickModal() {
    if (!quickModal) return;
    quickModal.classList.remove('is-open'); quickModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    if (lastFocusedEl) lastFocusedEl.focus();
  }
  if (quickCta) quickCta.addEventListener('click', openQuickModal);
  Array.prototype.slice.call(document.querySelectorAll('[data-close-modal]')).forEach(function (btn) {
    btn.addEventListener('click', closeQuickModal);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && quickModal && quickModal.classList.contains('is-open')) closeQuickModal();
  });

  /* Back to top */
  if (toTopBtn) toTopBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* --------------------------------------------------
     NEW: Services accordion
  -------------------------------------------------- */
  var accordionItems = Array.prototype.slice.call(document.querySelectorAll('.accordion__item'));
  accordionItems.forEach(function (item) {
    var head = item.querySelector('.accordion__head');
    head.addEventListener('click', function () {
      var wasOpen = item.classList.contains('is-open');
      accordionItems.forEach(function (i) { i.classList.remove('is-open'); });
      if (!wasOpen) item.classList.add('is-open');
    });
  });

  /* --------------------------------------------------
     NEW: Timeline scroll-fill (roadmap progress line)
  -------------------------------------------------- */
  var timeline = document.getElementById('timeline');
  var timelineFill = document.getElementById('timeline-fill');
  function updateTimelineFill() {
    if (!timeline || !timelineFill) return;
    var rect = timeline.getBoundingClientRect();
    var viewportH = window.innerHeight;
    var total = rect.height;
    var visibleTop = viewportH * 0.75;
    var progressPx = visibleTop - rect.top;
    var pct = Math.max(0, Math.min(1, progressPx / total));
    timelineFill.style.height = (pct * 100) + '%';
  }

  /* --------------------------------------------------
     NEW: Portfolio snap-carousel controls
  -------------------------------------------------- */
  var carousel = document.getElementById('portfolio-carousel');
  var carPrev = document.getElementById('carousel-prev');
  var carNext = document.getElementById('carousel-next');
  function carouselScrollBy(dir) {
    if (!carousel) return;
    var card = carousel.querySelector('.project-card');
    var step = card ? card.getBoundingClientRect().width + 24 : 360;
    carousel.scrollBy({ left: dir * step, behavior: 'smooth' });
  }
  if (carPrev) carPrev.addEventListener('click', function () { carouselScrollBy(-1); });
  if (carNext) carNext.addEventListener('click', function () { carouselScrollBy(1); });

  /* --------------------------------------------------
     Portfolio lightbox
  -------------------------------------------------- */
  var lightbox        = document.getElementById('lightbox');
  var lightboxImg      = document.getElementById('lightbox-img');
  var lightboxTitle     = document.getElementById('lightbox-title');
  var lightboxDesc      = document.getElementById('lightbox-desc');
  var lightboxCurrent    = document.getElementById('lightbox-current');
  var lightboxTotal      = document.getElementById('lightbox-total');
  var lightboxPrev       = document.getElementById('lightbox-prev');
  var lightboxNext       = document.getElementById('lightbox-next');
  var lightboxCloseBtn   = document.getElementById('lightbox-close');

  var galleryState = { project: null, count: 0, index: 0, title: '', desc: '' };
  var lastLightboxFocusedEl = null;

  function imgPath(project, index) {
    var num = (index + 1) < 10 ? '0' + (index + 1) : String(index + 1);
    return '../../assets/img/portfolio/project-' + project + '/' + num + '.jpg';
  }
  function renderLightboxImage() {
    lightboxImg.classList.remove('is-loaded');
    var src = imgPath(galleryState.project, galleryState.index);
    var tempImg = new Image();
    tempImg.onload = function () {
      lightboxImg.src = src;
      lightboxImg.alt = galleryState.title + ' — фото ' + (galleryState.index + 1);
      requestAnimationFrame(function () { lightboxImg.classList.add('is-loaded'); });
    };
    tempImg.src = src;
    lightboxTitle.textContent = galleryState.title;
    lightboxDesc.textContent = galleryState.desc;
    lightboxCurrent.textContent = galleryState.index + 1;
    lightboxTotal.textContent = galleryState.count;
  }
  function openLightbox(project, count, title, desc, startIndex) {
    galleryState = { project: project, count: count, index: startIndex || 0, title: title, desc: desc };
    renderLightboxImage();
    lastLightboxFocusedEl = document.activeElement;
    lightbox.classList.add('is-open'); lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    window.setTimeout(function () { lightboxCloseBtn.focus(); }, 200);
  }
  function closeLightbox() {
    lightbox.classList.remove('is-open'); lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    if (lastLightboxFocusedEl) lastLightboxFocusedEl.focus();
  }
  function showNext() { galleryState.index = (galleryState.index + 1) % galleryState.count; renderLightboxImage(); }
  function showPrev() { galleryState.index = (galleryState.index - 1 + galleryState.count) % galleryState.count; renderLightboxImage(); }

  Array.prototype.slice.call(document.querySelectorAll('.project-card')).forEach(function (card) {
    var btn = card.querySelector('.project-card__btn');
    if (!btn) return;
    btn.addEventListener('click', function () {
      openLightbox(
        card.getAttribute('data-project'),
        parseInt(card.getAttribute('data-count'), 10) || 1,
        card.getAttribute('data-title') || '',
        card.getAttribute('data-desc') || '',
        0
      );
    });
  });

  if (lightboxNext) lightboxNext.addEventListener('click', showNext);
  if (lightboxPrev) lightboxPrev.addEventListener('click', showPrev);
  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  Array.prototype.slice.call(document.querySelectorAll('[data-close-lightbox]')).forEach(function (el) {
    el.addEventListener('click', closeLightbox);
  });
  document.addEventListener('keydown', function (e) {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
  });
  (function () {
    var touchStartX = 0;
    var stage = lightbox ? lightbox.querySelector('.lightbox__stage') : null;
    if (!stage) return;
    stage.addEventListener('touchstart', function (e) { touchStartX = e.changedTouches[0].screenX; }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      var delta = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(delta) > 50) { if (delta < 0) showNext(); else showPrev(); }
    }, { passive: true });
  })();

  /* Footer year */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();
