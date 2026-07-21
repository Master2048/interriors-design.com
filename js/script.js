/* =========================================================
   YMG DESIGN — main script
   ========================================================= */
(function () {
  'use strict';

  var header       = document.getElementById('header');
  var burger       = document.getElementById('burger');
  var burgerClose  = document.getElementById('burger-close');
  var mobileMenu   = document.getElementById('mobile-menu');
  var overlay      = document.getElementById('overlay');
  var toTopBtn     = document.getElementById('to-top');
  var quickCta     = document.getElementById('quick-cta');
  var preloader    = document.getElementById('preloader');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var coarsePointer = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  var narrowViewport = window.matchMedia && window.matchMedia('(max-width: 1024px)').matches;
  var saveData = !!(navigator.connection && navigator.connection.saveData);
  var lowEndDevice = (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) || saveData;
  var preferLiteMotion = reduceMotion || coarsePointer || narrowViewport || lowEndDevice;
  var lenis = null;

  function stopSmoothScroll() {
    if (lenis) lenis.stop();
  }
  function startSmoothScroll() {
    if (lenis) lenis.start();
  }

  /* ---------------------------------------------------------
     Preloader
  --------------------------------------------------------- */
  function hidePreloader() {
    if (!preloader) return;
    preloader.classList.add('is-hidden');
    window.setTimeout(function () {
      if (preloader && preloader.parentNode) {
        preloader.parentNode.removeChild(preloader);
      }
    }, 600);
  }
  window.setTimeout(hidePreloader, 4000);

  /* ---------------------------------------------------------
     Hero intro timeline (Web Animations API — GSAP-like sequence)
  --------------------------------------------------------- */
  function splitHeroTitle() {
    var title = document.querySelector('.hero__title');
    if (!title || title.dataset.splitDone === '1') return;

    var lineChunks = title.innerHTML.split(/<br\s*\/?>/gi);
    title.innerHTML = '';
    title.dataset.splitDone = '1';
    title.classList.add('split-text');

    var wordIndex = 0;
    lineChunks.forEach(function (chunk) {
      var clean = chunk.replace(/<[^>]*>/g, '').trim();
      if (!clean) return;

      var lineWrap = document.createElement('span');
      lineWrap.className = 'split-line';

      clean.split(/\s+/).forEach(function (word, wi, arr) {
        var mask = document.createElement('span');
        mask.className = 'split-word-mask';

        var wordSpan = document.createElement('span');
        wordSpan.className = 'split-word';
        wordSpan.style.setProperty('--word-i', String(wordIndex));
        wordSpan.textContent = word + (wi < arr.length - 1 ? '\u00A0' : '');

        mask.appendChild(wordSpan);
        lineWrap.appendChild(mask);
        wordIndex += 1;
      });

      title.appendChild(lineWrap);
    });

    title.setAttribute('aria-label', title.textContent.replace(/\s+/g, ' ').trim());
  }

  function setStaggerIndices() {
    Array.prototype.slice.call(document.querySelectorAll('.collage__item')).forEach(function (el, i) {
      el.style.setProperty('--stagger-i', String(i));
    });
    Array.prototype.slice.call(document.querySelectorAll('.contacts__form-wrap .field')).forEach(function (el, i) {
      el.style.setProperty('--stagger-i', String(i));
    });
  }

  function setMotion(el, opacity, y) {
    if (!el) return;
    el.style.opacity = String(opacity);
    el.style.transform = y !== undefined && y !== null ? 'translateY(' + y + 'px)' : '';
  }

  function clearMotion(el) {
    if (!el) return;
    el.style.opacity = '';
    el.style.transform = '';
  }

  function resetMotion(el) {
    if (!el) return;
    if (el.getAnimations) {
      el.getAnimations().forEach(function (anim) { anim.cancel(); });
    }
    clearMotion(el);
  }

  function setTranslateY(el, y) {
    if (!el) return;
    el.style.transform = 'translateY(' + y + 'px)';
  }

  function waapi(el, frames, options) {
    if (!el) return Promise.resolve();
    var anim = el.animate(frames, options);
    return anim.finished.catch(function () {});
  }

  function startHeroIntro() {
    if (reduceMotion) {
      document.body.classList.add('is-intro-done');
      Array.prototype.slice.call(document.querySelectorAll('[data-reveal]')).forEach(function (el) {
        el.classList.add('in-view');
      });
      syncHeaderMetrics();
      onScroll();
      window.setTimeout(hidePreloader, 100);
      return;
    }

    document.body.classList.add('hero-intro-pending');
    splitHeroTitle();

    var headerPill = header ? header.querySelector('.header__pill') : null;
    var headerInner = header ? header.querySelector('.header__inner') : null;
    var eyebrow = document.querySelector('.hero__content .eyebrow');
    var title = document.querySelector('.hero__title');
    var words = title ? Array.prototype.slice.call(title.querySelectorAll('.split-word')) : [];
    var subtitle = document.querySelector('.hero__subtitle');
    var actions = document.querySelector('.hero__actions');
    var pillsWrap = document.querySelector('.hero__pills');
    var pills = Array.prototype.slice.call(document.querySelectorAll('.hero__pills .pill'));
    var scrollHint = document.querySelector('.hero__scroll');
    var mark = document.querySelector('.preloader__mark');

    var easeOut = 'cubic-bezier(0.22, 1, 0.36, 1)';
    var easeInOut = 'cubic-bezier(0.45, 0, 0.55, 1)';
    var easeBack = 'cubic-bezier(0.34, 1.56, 0.64, 1)';

    setTranslateY(headerPill, -20);
    if (headerInner) headerInner.style.opacity = '0';
    setMotion(eyebrow, 0, 16);
    if (scrollHint) scrollHint.style.opacity = '0';
    [subtitle, actions, pillsWrap].forEach(function (el) { setMotion(el, 0, 40); });
    pills.forEach(function (pill) { setMotion(pill, 0, 20); });
    if (title) {
      title.style.opacity = '1';
      title.classList.add('in-view');
    }
    words.forEach(function (word) {
      word.style.transform = 'translateY(105%)';
    });

    if (preloader) preloader.classList.add('is-animating');

    var jobs = [];
    var introFinished = false;
    var t = {
      header: 940,
      eyebrow: 1150,
      title: 1280,
      subtitle: 1720,
      actions: 1820,
      pillsWrap: 1920,
      pills: 2020,
      scroll: 2360,
      done: 2900,
    };

    if (mark && preloader) {
      jobs.push(waapi(mark, [
        { transform: 'scale(0.4) rotate(-12deg)', opacity: 0 },
        { transform: 'scale(1) rotate(0deg)', opacity: 1 },
      ], { duration: 650, delay: 0, fill: 'forwards', easing: easeBack }));
      jobs.push(waapi(preloader, [
        { opacity: 1 },
        { opacity: 0 },
      ], { duration: 400, delay: 900, fill: 'forwards', easing: easeInOut }));
    }

    jobs.push(waapi(headerPill, [
      { transform: 'translateY(-20px)' },
      { transform: 'translateY(0)' },
    ], { duration: 600, delay: t.header, fill: 'forwards', easing: easeOut }));

    jobs.push(waapi(headerInner, [
      { opacity: 0 },
      { opacity: 1 },
    ], { duration: 600, delay: t.header, fill: 'forwards', easing: easeOut }));

    jobs.push(waapi(eyebrow, [
      { opacity: 0, transform: 'translateY(16px)' },
      { opacity: 1, transform: 'translateY(0)' },
    ], { duration: 650, delay: t.eyebrow, fill: 'forwards', easing: easeOut }));

    words.forEach(function (word, i) {
      jobs.push(waapi(word, [
        { transform: 'translateY(105%)' },
        { transform: 'translateY(0)' },
      ], { duration: 950, delay: t.title + i * 50, fill: 'forwards', easing: easeOut }));
    });

    [subtitle, actions, pillsWrap].forEach(function (el, i) {
      jobs.push(waapi(el, [
        { opacity: 0, transform: 'translateY(40px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: 850, delay: t.subtitle + i * 100, fill: 'forwards', easing: easeOut }));
    });

    pills.forEach(function (pill, i) {
      jobs.push(waapi(pill, [
        { opacity: 0, transform: 'translateY(20px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: 500, delay: t.pills + i * 80, fill: 'forwards', easing: easeOut }));
    });

    jobs.push(waapi(scrollHint, [
      { opacity: 0 },
      { opacity: 1 },
    ], { duration: 450, delay: t.scroll, fill: 'forwards', easing: easeOut }));

    function finishHeroIntro() {
      if (introFinished) return;
      introFinished = true;

      document.body.classList.remove('hero-intro-pending');
      document.body.classList.add('is-intro-done');

      [headerPill, headerInner, eyebrow, scrollHint, subtitle, actions, pillsWrap].forEach(resetMotion);
      pills.forEach(resetMotion);
      words.forEach(function (word) { word.style.transform = ''; });

      if (scrollHint) {
        scrollHint.style.opacity = '';
        scrollHint.style.transform = '';
        scrollHint.style.animation = 'none';
        void scrollHint.offsetWidth;
        scrollHint.style.animation = '';
      }

      Array.prototype.slice.call(document.querySelectorAll('.hero__content [data-reveal]')).forEach(function (el) {
        el.classList.add('in-view');
      });
      if (preloader) preloader.classList.remove('is-animating');
      hidePreloader();

      headerScrolled = getPageScrollY() > 40;
      if (header) {
        header.classList.toggle('is-scrolled', headerScrolled);
      }
      syncHeaderMetrics();
      onScroll();
    }

    Promise.all(jobs).then(finishHeroIntro);
    window.setTimeout(finishHeroIntro, t.done);
  }

  function bootHeroIntro() {
    var run = function () {
      startHeroIntro();
    };
    if (document.fonts && document.fonts.ready) {
      Promise.race([
        document.fonts.ready,
        new Promise(function (resolve) { window.setTimeout(resolve, 250); }),
      ]).then(run);
    } else {
      run();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setStaggerIndices();
    });
  } else {
    setStaggerIndices();
  }

  /* ---------------------------------------------------------
     Hero background video — keep poster until real playback
     (iOS Low Power Mode often blocks autoplay)
  --------------------------------------------------------- */
  var heroVideo = document.querySelector('.hero__video');
  if (heroVideo) {
    var heroPlayArmed = false;
    var heroGestureBound = false;
    var heroPlaying = false;

    function showHeroPoster() {
      heroPlaying = false;
      heroVideo.classList.remove('is-playing');
    }

    function showHeroVideo() {
      if (heroPlaying) return;
      heroPlaying = true;
      heroVideo.classList.add('is-playing');
    }

    function unlockHeroAttrs() {
      heroVideo.muted = true;
      heroVideo.defaultMuted = true;
      heroVideo.setAttribute('muted', '');
      heroVideo.playsInline = true;
      heroVideo.setAttribute('playsinline', '');
      heroVideo.setAttribute('webkit-playsinline', '');
    }

    function playHeroVideo() {
      unlockHeroAttrs();
      var promise = heroVideo.play();
      if (promise && typeof promise.then === 'function') {
        promise.then(function () {
          if (!heroVideo.paused) showHeroVideo();
        }).catch(function () {
          showHeroPoster();
          bindHeroGestureRetry();
        });
      } else if (!heroVideo.paused) {
        showHeroVideo();
      }
    }

    function bindHeroGestureRetry() {
      if (heroGestureBound) return;
      heroGestureBound = true;
      var retry = function () {
        playHeroVideo();
        if (!heroVideo.paused) {
          window.removeEventListener('touchstart', retry, true);
          window.removeEventListener('click', retry, true);
          document.removeEventListener('visibilitychange', onVisibleRetry);
        }
      };
      function onVisibleRetry() {
        if (!document.hidden) retry();
      }
      window.addEventListener('touchstart', retry, { capture: true, passive: true });
      window.addEventListener('click', retry, true);
      document.addEventListener('visibilitychange', onVisibleRetry);
    }

    function armHeroVideo() {
      if (heroPlayArmed) return;
      heroPlayArmed = true;
      unlockHeroAttrs();
      heroVideo.addEventListener('playing', showHeroVideo);
      heroVideo.addEventListener('pause', function () {
        if (document.hidden || heroVideo.ended) return;
        /* iOS Low Power Mode may pause mid-play — keep last frame, retry quietly */
        window.setTimeout(function () {
          if (!document.hidden && heroVideo.paused && !heroVideo.ended) playHeroVideo();
        }, 250);
      });
      /* Do not call load() — it clears poster and causes a visible refresh */
      if (heroVideo.readyState >= 2) playHeroVideo();
      else {
        heroVideo.addEventListener('canplay', playHeroVideo, { once: true });
        heroVideo.addEventListener('loadeddata', playHeroVideo, { once: true });
      }
    }

    if ('IntersectionObserver' in window) {
      var heroIo = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            armHeroVideo();
            heroIo.disconnect();
          }
        });
      }, { rootMargin: '10% 0px', threshold: 0.01 });
      heroIo.observe(heroVideo);
    } else {
      armHeroVideo();
    }
  }

  /* ---------------------------------------------------------
     Viz showcase videos (cinematic) — play in view
  --------------------------------------------------------- */
  (function initVizVideos() {
    var videos = Array.prototype.slice.call(document.querySelectorAll('.js-viz-video'));
    if (!videos.length) return;

    if (reduceMotion) {
      videos.forEach(function (video) {
        video.removeAttribute('autoplay');
        try { video.pause(); } catch (e) {}
      });
      return;
    }

    function tryPlay(video) {
      if (video.readyState < 2) {
        try { video.load(); } catch (e) {}
      }
      var p = video.play();
      if (p && p.catch) p.catch(function () {});
    }

    function tryPause(video) {
      try { video.pause(); } catch (e) {}
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          var video = entry.target;
          if (entry.isIntersecting && !document.hidden) tryPlay(video);
          else tryPause(video);
        });
      }, { rootMargin: '60px 0px', threshold: 0.2 });
      videos.forEach(function (video) { io.observe(video); });
    } else {
      videos.forEach(tryPlay);
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        videos.forEach(tryPause);
        return;
      }
      videos.forEach(function (video) {
        var rect = video.getBoundingClientRect();
        if (rect.bottom > 0 && rect.top < window.innerHeight) tryPlay(video);
      });
    });
  })();

  /* ---------------------------------------------------------
     Header scroll state + scrollspy
  --------------------------------------------------------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll('main section[id]'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));

  var headerScrolled = false;

  function syncHeaderMetrics() {
    if (!header) return;
    var h = Math.round(header.getBoundingClientRect().height);
    if (!h) return;
    document.documentElement.style.setProperty('--header-h', h + 'px');
    document.documentElement.style.setProperty('--roadmap-pin-top', h + 'px');
    document.documentElement.style.setProperty('--services-sticky-top', (h + 16) + 'px');
  }

  function getScrollspyOffset() {
    return (header ? header.offsetHeight : 84) + 56;
  }

  function getPageScrollY() {
    if (lenis && typeof lenis.scroll === 'number') return lenis.scroll;
    return window.scrollY || window.pageYOffset || 0;
  }

  var scrollRaf = 0;
  function onScroll() {
    if (scrollRaf) return;
    scrollRaf = window.requestAnimationFrame(function () {
      scrollRaf = 0;
      onScrollFrame();
    });
  }

  function onScrollFrame() {
    var y = getPageScrollY();

    if (header) {
      var nextScrolled = y > 40;
      if (nextScrolled !== headerScrolled) {
        headerScrolled = nextScrolled;
        header.classList.toggle('is-scrolled', nextScrolled);
        window.requestAnimationFrame(syncHeaderMetrics);
      }
    }

    // back to top + quick cta visibility
    var showFloats = y > 480;
    if (toTopBtn) toTopBtn.classList.toggle('is-visible', showFloats);
    if (quickCta) quickCta.classList.toggle('is-visible', showFloats);

    // scrollspy
    var offset = getScrollspyOffset();
    var current = null;
    for (var i = 0; i < sections.length; i++) {
      var rect = sections[i].getBoundingClientRect();
      if (rect.top <= offset && rect.bottom > offset) {
        current = sections[i].id;
        break;
      }
    }
    navLinks.forEach(function (link) {
      var isActive = current && link.getAttribute('href') === '#' + current;
      link.classList.toggle('is-active', !!isActive);
    });

    if (roadmapSwiper) updateRoadmapFromPageScroll();

    if (heroVideo && !reduceMotion && !preferLiteMotion) {
      var hero = document.querySelector('.hero');
      if (hero) {
        var heroH = hero.offsetHeight || 1;
        var p = Math.max(0, Math.min(1, y / heroH));
        if (p < 1) {
          heroVideo.classList.add('is-parallaxing');
          heroVideo.style.transform = 'translate3d(0,' + (p * 14) + '%,0) scale(' + (1 + p * 0.04) + ')';
        } else {
          heroVideo.classList.remove('is-parallaxing');
          heroVideo.style.transform = '';
        }
      }
    }

    updateServicesRecede();
  }

  /* Services sticky stack — 3D recede as next card overlays */
  var servicePanels = Array.prototype.slice.call(document.querySelectorAll('.service-panel'));
  var serviceCards = servicePanels.map(function (panel) {
    return panel.querySelector('.service-panel__card');
  });
  var servicesStackEl = document.querySelector('.services-stack');
  var servicesProgressFill = document.querySelector('[data-services-fill]');
  var servicesProgressCurrent = document.querySelector('[data-services-current]');
  var servicesProgressTotal = document.querySelector('[data-services-total]');
  var servicesSectionEl = document.getElementById('services');
  var servicesRecedeQueued = false;
  var servicesLastProgress = [];
  var servicesLastActive = -1;
  var servicesLastFill = -1;
  var servicesAnchors = [];
  var servicesAnchorsReady = false;

  function padServicesIndex(n) {
    return n < 10 ? '0' + n : String(n);
  }

  if (servicesProgressTotal && servicePanels.length) {
    servicesProgressTotal.textContent = padServicesIndex(servicePanels.length);
  }

  function getServicesScrollY() {
    return getPageScrollY();
  }

  function getServicesStickyTop() {
    return (header ? header.getBoundingClientRect().height : 84) + 16;
  }

  function measureServicesAnchors() {
    if (!servicesStackEl || !servicePanels.length) {
      servicesAnchors = [];
      servicesAnchorsReady = false;
      return;
    }
    var stickyTop = getServicesStickyTop();
    var stackTop = 0;
    var node = servicesStackEl;
    while (node) {
      stackTop += node.offsetTop;
      node = node.offsetParent;
    }
    var anchors = [];
    var y = stackTop;
    var i;
    for (i = 0; i < servicePanels.length; i++) {
      anchors.push(Math.max(0, Math.round(y - stickyTop)));
      y += Math.max(1, servicePanels[i].offsetHeight);
    }
    servicesAnchors = anchors;
    servicesAnchorsReady = anchors.length > 0 && anchors[anchors.length - 1] > anchors[0];
  }

  function applyServicesProgress(fill, activeIndex) {
    if (!(fill >= 0) || fill !== fill) fill = 0;
    if (fill > 1) fill = 1;

    if (servicesProgressFill && Math.abs(fill - servicesLastFill) > 0.0001) {
      servicesLastFill = fill;
      servicesProgressFill.style.setProperty('--services-progress', fill.toFixed(4));
    }
    if (servicesProgressCurrent && activeIndex !== servicesLastActive) {
      servicesLastActive = activeIndex;
      servicesProgressCurrent.textContent = padServicesIndex(activeIndex + 1);
    }
  }

  function updateServicesProgressFromScroll() {
    var total = servicePanels.length;
    if (!total) return;

    if (!servicesAnchorsReady) measureServicesAnchors();
    if (!servicesAnchorsReady) return;

    var y = getServicesScrollY();
    var start = servicesAnchors[0];
    var end = servicesAnchors[total - 1];
    var span = Math.max(1, end - start);
    var fill = (y - start) / span;
    if (fill < 0) fill = 0;
    else if (fill > 1) fill = 1;

    var activeIndex = 0;
    var i;
    for (i = 0; i < total; i++) {
      if (y >= servicesAnchors[i] - 0.5) activeIndex = i;
    }

    applyServicesProgress(fill, activeIndex);
  }

  function updateServicesRecede() {
    if (!servicePanels.length) return;
    if (servicesRecedeQueued) return;
    servicesRecedeQueued = true;
    window.requestAnimationFrame(function () {
      servicesRecedeQueued = false;

      var sectionRect = servicesSectionEl
        ? servicesSectionEl.getBoundingClientRect()
        : null;
      var vh = window.innerHeight || document.documentElement.clientHeight || 0;
      var near = sectionRect
        ? sectionRect.bottom > -vh * 0.35 && sectionRect.top < vh * 1.35
        : true;

      if (!near) {
        /* Keep bar coherent when leaving the section up/down */
        if (sectionRect) {
          if (sectionRect.top >= vh * 0.98) applyServicesProgress(0, 0);
          else if (sectionRect.bottom <= vh * 0.02) {
            applyServicesProgress(1, Math.max(0, servicePanels.length - 1));
          }
        }
        return;
      }

      updateServicesProgressFromScroll();

      var i;
      var card;
      var total = servicePanels.length;

      /* Lite / reduced: keep sticky + progress bar, skip 3D recede math */
      if (preferLiteMotion || reduceMotion) {
        for (i = 0; i < total; i++) {
          card = serviceCards[i];
          if (!card) continue;
          if ((servicesLastProgress[i] || 0) !== 0) {
            servicesLastProgress[i] = 0;
            card.style.setProperty('--recede', '0');
          }
        }
        return;
      }

      var stickyTop = getServicesStickyTop();
      var nextTop;
      var range;
      var progress;
      var tops = new Array(total);

      for (i = 0; i < total; i++) {
        tops[i] = servicePanels[i].getBoundingClientRect().top;
      }

      for (i = 0; i < total; i++) {
        card = serviceCards[i];
        if (!card) continue;

        if (total < 2 || i === total - 1) {
          progress = 0;
        } else {
          nextTop = tops[i + 1];
          range = Math.max(1, card.offsetHeight * 0.9);
          progress = 1 - (nextTop - stickyTop) / range;
          if (progress < 0) progress = 0;
          else if (progress > 1) progress = 1;
          progress = progress * progress * (3 - 2 * progress);
        }

        if (Math.abs((servicesLastProgress[i] || 0) - progress) < 0.004) continue;
        servicesLastProgress[i] = progress;
        card.style.setProperty('--recede', progress.toFixed(4));
      }
    });
  }

  function refreshServicesMetrics() {
    measureServicesAnchors();
    servicesLastFill = -1;
    servicesLastActive = -1;
    updateServicesRecede();
  }

  window.addEventListener('pageshow', refreshServicesMetrics);
  window.addEventListener('load', function () {
    window.setTimeout(refreshServicesMetrics, 0);
    window.setTimeout(refreshServicesMetrics, 250);
  });

  (function initServicePanelReveal() {
    if (!servicePanels.length) return;
    if (reduceMotion) {
      servicePanels.forEach(function (panel) { panel.classList.add('is-shown'); });
      return;
    }
    if (!('IntersectionObserver' in window)) {
      servicePanels.forEach(function (panel) { panel.classList.add('is-shown'); });
      return;
    }
    var revealIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-shown');
        revealIo.unobserve(entry.target);
      });
    }, { threshold: 0.28, rootMargin: '0px 0px -8% 0px' });
    servicePanels.forEach(function (panel) { revealIo.observe(panel); });
  })();

  /* Ambient particles (GPU-friendly) */
  function initAmbientParticles(section, canvas, options) {
    options = options || {};
    /* Off on lite devices, touch, narrow, save-data, reduced motion */
    if (!section || !canvas || reduceMotion || preferLiteMotion || coarsePointer || narrowViewport || saveData) {
      if (canvas) canvas.style.display = 'none';
      return;
    }

    var destroyed = false;
    function disableParticles() {
      destroyed = true;
      if (canvas) canvas.style.display = 'none';
      stop();
    }

    /* Battery API: disable when unplugged and level is low */
    if (navigator.getBattery) {
      navigator.getBattery().then(function (battery) {
        function checkBattery() {
          if (!battery.charging && battery.level < 0.2) disableParticles();
        }
        checkBattery();
        if (battery.addEventListener) {
          battery.addEventListener('levelchange', checkBattery);
          battery.addEventListener('chargingchange', checkBattery);
        }
      }).catch(function () {});
    }

    var ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;

    var countOpts = options.count || {};
    var mouseParallax = options.mouseParallax === true;
    var parallaxStrength = typeof options.parallaxStrength === 'number' ? options.parallaxStrength : 32;
    var pointer = { tx: 0, ty: 0, px: 0, py: 0, active: false, rectLeft: 0, rectTop: 0, rectW: 1, rectH: 1 };
    var particles = [];
    var rafId = 0;
    var running = false;
    var width = 0;
    var height = 0;
    var lastFrame = 0;
    var frameInterval = 1000 / 30;
    var resolveScale = 0.7;
    var sprites = [];
    var spriteSizes = [3, 5, 7, 10];
    var rectDirty = true;
    var rectRafId = 0;

    function cachePointerRect() {
      var rect = section.getBoundingClientRect();
      pointer.rectLeft = rect.left;
      pointer.rectTop = rect.top;
      pointer.rectW = rect.width || 1;
      pointer.rectH = rect.height || 1;
      rectDirty = false;
    }

    function schedulePointerRect() {
      rectDirty = true;
      if (rectRafId) return;
      rectRafId = window.requestAnimationFrame(function () {
        rectRafId = 0;
        if (rectDirty) cachePointerRect();
      });
    }

    function buildSprites() {
      sprites = spriteSizes.map(function (size) {
        var s = document.createElement('canvas');
        var pad = 2;
        s.width = size + pad * 2;
        s.height = size + pad * 2;
        var sctx = s.getContext('2d');
        if (!sctx) return s;
        var g = sctx.createRadialGradient(
          size / 2 + pad, size / 2 + pad, 0,
          size / 2 + pad, size / 2 + pad, size / 2
        );
        g.addColorStop(0, 'rgba(242, 149, 63, 1)');
        g.addColorStop(0.45, 'rgba(217, 108, 31, 0.85)');
        g.addColorStop(1, 'rgba(179, 85, 26, 0)');
        sctx.fillStyle = g;
        sctx.beginPath();
        sctx.arc(size / 2 + pad, size / 2 + pad, size / 2, 0, Math.PI * 2);
        sctx.fill();
        return s;
      });
    }

    function countForSize() {
      var area = width * height;
      var desktopMin = typeof countOpts.desktopMin === 'number' ? countOpts.desktopMin : 40;
      var desktopMax = typeof countOpts.desktopMax === 'number' ? countOpts.desktopMax : 72;
      var desktopArea = typeof countOpts.desktopArea === 'number' ? countOpts.desktopArea : 18000;
      return Math.max(desktopMin, Math.min(desktopMax, Math.round(area / desktopArea)));
    }

    function spawn() {
      var bright = 0.35 + Math.random() * 0.65;
      var spriteIndex = Math.min(spriteSizes.length - 1, Math.floor(Math.random() * spriteSizes.length));
      var depth = 0.3 + (spriteIndex / Math.max(1, spriteSizes.length - 1)) * 0.7;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: -0.14 + Math.random() * 0.28,
        vy: -0.22 - Math.random() * 0.42,
        a: 0.12 + bright * 0.5,
        tw: Math.random() * Math.PI * 2,
        tws: 0.01 + Math.random() * 0.024,
        sprite: spriteIndex,
        depth: depth,
      };
    }

    function updatePointer(clientX, clientY) {
      if (rectDirty) cachePointerRect();
      var nx = ((clientX - pointer.rectLeft) / pointer.rectW) * 2 - 1;
      var ny = ((clientY - pointer.rectTop) / pointer.rectH) * 2 - 1;
      pointer.tx = Math.max(-1, Math.min(1, nx));
      pointer.ty = Math.max(-1, Math.min(1, ny));
      pointer.active = true;
    }

    function resize() {
      if (destroyed) return;
      resolveScale = 0.7;
      width = Math.max(1, section.offsetWidth);
      height = Math.max(1, section.offsetHeight);
      canvas.width = Math.max(1, Math.floor(width * resolveScale));
      canvas.height = Math.max(1, Math.floor(height * resolveScale));
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.imageSmoothingEnabled = true;
      cachePointerRect();

      var n = countForSize();
      if (particles.length !== n) {
        particles = [];
        for (var i = 0; i < n; i++) particles.push(spawn());
      }
    }

    function frame(now) {
      if (!running || destroyed) return;
      rafId = window.requestAnimationFrame(frame);
      if (now - lastFrame < frameInterval) return;
      lastFrame = now;

      var cw = canvas.width;
      var ch = canvas.height;
      var sx = cw / width;
      var sy = ch / height;
      ctx.clearRect(0, 0, cw, ch);

      var parallaxBaseX = 0;
      var parallaxBaseY = 0;
      if (mouseParallax) {
        var targetX = pointer.active ? pointer.tx : 0;
        var targetY = pointer.active ? pointer.ty : 0;
        pointer.px += (targetX - pointer.px) * 0.11;
        pointer.py += (targetY - pointer.py) * 0.11;
        parallaxBaseX = pointer.px * parallaxStrength;
        parallaxBaseY = pointer.py * parallaxStrength;
      }

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.tw += p.tws;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        var sprite = sprites[p.sprite];
        if (!sprite) continue;
        var alpha = p.a * (0.55 + 0.45 * Math.sin(p.tw));
        var sw = sprite.width;
        var sh = sprite.height;
        var depth = p.depth;
        ctx.globalAlpha = alpha;
        ctx.drawImage(
          sprite,
          (p.x + parallaxBaseX * depth) * sx - sw * 0.5,
          (p.y + parallaxBaseY * depth) * sy - sh * 0.5,
          sw,
          sh
        );
      }
      ctx.globalAlpha = 1;
    }

    function start() {
      if (destroyed || running || document.hidden) return;
      running = true;
      resize();
      lastFrame = 0;
      rafId = window.requestAnimationFrame(frame);
    }

    function stop() {
      running = false;
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    }

    buildSprites();

    if (mouseParallax) {
      section.addEventListener('pointerenter', function (e) {
        cachePointerRect();
        updatePointer(e.clientX, e.clientY);
      }, { passive: true });
      section.addEventListener('pointermove', function (e) {
        updatePointer(e.clientX, e.clientY);
      }, { passive: true });
      section.addEventListener('pointerleave', function () {
        pointer.active = false;
      });
      window.addEventListener('scroll', schedulePointerRect, { passive: true });
      window.addEventListener('resize', schedulePointerRect, { passive: true });
    }

    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && !document.hidden && !destroyed) start();
          else stop();
        });
      }, { rootMargin: '40px 0px', threshold: 0.05 });
      io.observe(section);
    } else {
      start();
    }

    document.addEventListener('visibilitychange', function () {
      if (document.hidden || destroyed) stop();
      else if (section.getBoundingClientRect().bottom > 0 && section.getBoundingClientRect().top < window.innerHeight) {
        start();
      }
    });

    var resizeTimer = 0;
    function scheduleResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        if (running && !destroyed) resize();
      }, 120);
    }
    window.addEventListener('resize', scheduleResize, { passive: true });
    if ('ResizeObserver' in window) {
      var ro = new ResizeObserver(scheduleResize);
      ro.observe(section);
    }
  }

  (function bootAmbientParticles() {
    var services = document.getElementById('services');
    if (services) {
      initAmbientParticles(services, services.querySelector('.services__particles'), {
        mouseParallax: true,
        parallaxStrength: 34,
        count: {
          desktopMin: 40,
          desktopMax: 72,
          desktopArea: 18000,
        },
      });
    }
  })();

  /* ---------------------------------------------------------
     FAQ accordion
  --------------------------------------------------------- */
  (function initFaqAccordion() {
    var root = document.querySelector('[data-accordion]');
    if (!root) return;
    var items = Array.prototype.slice.call(root.querySelectorAll('.faq__item'));

    items.forEach(function (item) {
      var btn = item.querySelector('.faq__question');
      var panel = item.querySelector('.faq__answer');
      if (!btn || !panel) return;

      btn.addEventListener('click', function () {
        var willOpen = !item.classList.contains('is-open');

        items.forEach(function (other) {
          var otherBtn = other.querySelector('.faq__question');
          var otherPanel = other.querySelector('.faq__answer');
          other.classList.remove('is-open');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          if (otherPanel) otherPanel.setAttribute('aria-hidden', 'true');
        });

        if (willOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          panel.setAttribute('aria-hidden', 'false');
        }
      });
    });
  })();

  window.addEventListener('resize', function () {
    syncHeaderMetrics();
    refreshServicesMetrics();
  }, { passive: true });
  window.addEventListener('load', syncHeaderMetrics);
  syncHeaderMetrics();
  measureServicesAnchors();
  bootHeroIntro();

  /* ---------------------------------------------------------
     Lenis smooth scroll — desktop fine-pointer only; idle rAF pause
  --------------------------------------------------------- */
  if (!preferLiteMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      lerp: 0.09,
      wheelMultiplier: 1,
      touchMultiplier: 1.2,
      autoRaf: false,
    });
    var lenisRafId = 0;
    var lenisRafRunning = false;
    var lenisIdleStopTimer = 0;
    var LENIS_IDLE_STOP_MS = 120;

    function clearLenisIdleStop() {
      if (lenisIdleStopTimer) {
        window.clearTimeout(lenisIdleStopTimer);
        lenisIdleStopTimer = 0;
      }
    }

    function stopLenisRaf() {
      clearLenisIdleStop();
      lenisRafRunning = false;
      if (lenisRafId) {
        window.cancelAnimationFrame(lenisRafId);
        lenisRafId = 0;
      }
    }

    function scheduleLenisIdleStop() {
      if (lenisIdleStopTimer) return;
      lenisIdleStopTimer = window.setTimeout(function () {
        lenisIdleStopTimer = 0;
        if (!lenis) {
          stopLenisRaf();
          return;
        }
        var vel = Math.abs(lenis.velocity || 0);
        var target = typeof lenis.targetScroll === 'number' ? lenis.targetScroll : lenis.scroll;
        var delta = Math.abs((target || 0) - (lenis.scroll || 0));
        if (vel < 0.05 && delta < 0.5) {
          stopLenisRaf();
        }
      }, LENIS_IDLE_STOP_MS);
    }

    function lenisRaf(time) {
      if (!lenis) {
        stopLenisRaf();
        return;
      }
      lenis.raf(time);
      var vel = Math.abs(lenis.velocity || 0);
      var target = typeof lenis.targetScroll === 'number' ? lenis.targetScroll : lenis.scroll;
      var delta = Math.abs((target || 0) - (lenis.scroll || 0));
      if (vel < 0.05 && delta < 0.5) {
        scheduleLenisIdleStop();
      } else {
        clearLenisIdleStop();
      }
      if (!lenisRafRunning) return;
      lenisRafId = window.requestAnimationFrame(lenisRaf);
    }

    function startLenisRaf() {
      if (!lenis) return;
      clearLenisIdleStop();
      if (lenisRafRunning) return;
      lenis.time = 0;
      lenisRafRunning = true;
      lenisRafId = window.requestAnimationFrame(lenisRaf);
    }

    lenis.on('scroll', function () {
      onScroll();
      startLenisRaf();
    });
    if (typeof lenis.on === 'function') {
      try { lenis.on('virtual-scroll', startLenisRaf); } catch (e) {}
    }
    window.addEventListener('wheel', startLenisRaf, { passive: true });
    window.addEventListener('keydown', function (e) {
      var keys = { ArrowUp: 1, ArrowDown: 1, PageUp: 1, PageDown: 1, Home: 1, End: 1, ' ': 1 };
      if (keys[e.key]) startLenisRaf();
    });
    startLenisRaf();
    window.setTimeout(refreshServicesMetrics, 50);
  } else {
    window.addEventListener('scroll', onScroll, { passive: true });
  }
  onScroll();

  /* ---------------------------------------------------------
     Roadmap Swiper + progress line
  --------------------------------------------------------- */
  var stepperFill = document.getElementById('glass-stepper-fill');
  var roadmapSwiperEl = document.getElementById('roadmap-swiper');
  var roadmapPinEl = document.getElementById('roadmap-pin');
  var roadmapSwiper = null;
  var roadmapAnim = {
    targetTranslate: 0,
    rafId: null,
    wheelMultiplier: 0.36,
    lerp: 0.11,
    progressLerp: 0.16,
    displayProgress: 0,
  };
  var roadmapPinState = {
    enabled: !reduceMotion,
    scrollDriving: false,
    updating: false,
  };

  if (reduceMotion) {
    roadmapAnim.lerp = 1;
    roadmapAnim.progressLerp = 1;
    roadmapAnim.wheelMultiplier = 0.5;
  }

  function isRoadmapPinEnabled() {
    return roadmapPinState.enabled;
  }

  function syncRoadmapPinMode() {
    if (roadmapPinEl) {
      roadmapPinEl.classList.toggle('is-pin-mode', isRoadmapPinEnabled());
    }
  }

  function getRoadmapVirtualTail() {
    if (!roadmapSwiper) return 0;
    var slides = roadmapSwiper.slides;
    if (!slides.length) return 0;
    var slideWidth = slides[0].offsetWidth || 310;
    var gap = roadmapSwiper.params.spaceBetween || 24;
    return slideWidth + gap;
  }

  /* Lead-in before horizontal rewind starts (pin already active). */
  function getRoadmapLeadIn() {
    if (!isRoadmapPinEnabled()) return 0;
    var viewLead = getRoadmapViewZone() * 0.3;
    var cardLead = getRoadmapVirtualTail() * 0.9;
    return Math.max(viewLead, cardLead);
  }

  /* Lead-out: hold page scroll after last slide appears at container edge. */
  function getRoadmapLeadOut() {
    if (!isRoadmapPinEnabled()) return 0;
    var viewLead = getRoadmapViewZone() * 0.5;
    var cardLead = getRoadmapVirtualTail() * 1.35;
    return Math.max(viewLead, cardLead);
  }

  function getRoadmapEndTranslate() {
    if (!roadmapSwiper) return 0;
    var swiper = roadmapSwiper;
    var slides = swiper.slides;
    if (!slides.length) return swiper.maxTranslate();

    var lastSlide = slides[slides.length - 1];
    var padRight = 0;
    try {
      padRight = parseFloat(window.getComputedStyle(swiper.el).paddingRight) || 0;
    } catch (err) { /* ignore */ }

    // Last slide's right edge flush with container/swiper content edge
    var endT = swiper.width - padRight - lastSlide.offsetLeft - lastSlide.offsetWidth;
    return Math.min(swiper.minTranslate(), Math.max(swiper.maxTranslate(), endT));
  }

  function getRoadmapScrollBounds() {
    if (!roadmapSwiper) return { start: 0, end: 0, range: 0 };

    var swiper = roadmapSwiper;
    var startT = swiper.minTranslate();
    var endT = getRoadmapEndTranslate();

    return { start: startT, end: endT, range: startT - endT };
  }

  function getRoadmapProgressFromTranslate(translate) {
    if (!roadmapSwiper) return 0;
    var bounds = getRoadmapScrollBounds();
    if (!bounds.range) return 0;
    return Math.max(0, Math.min(1, (bounds.start - translate) / bounds.range));
  }

  function setRoadmapProgressWidth(progress, scrubbing) {
    if (!stepperFill) return;
    var line = stepperFill.parentElement;
    if (line) {
      stepperFill.style.backgroundSize = line.offsetWidth + 'px 100%';
    }
    stepperFill.classList.toggle('is-scrubbing', !!scrubbing);
    stepperFill.style.width = (Math.max(0, Math.min(1, progress)) * 100) + '%';
  }

  function updateRoadmapProgress(swiper, options) {
    if (!swiper) return;
    var opts = options || {};
    var targetP = getRoadmapProgressFromTranslate(swiper.getTranslate());

    if (opts.immediate) {
      roadmapAnim.displayProgress = targetP;
      setRoadmapProgressWidth(targetP, false);
      return;
    }

    if (opts.scrubbing) {
      var diff = targetP - roadmapAnim.displayProgress;
      if (Math.abs(diff) < 0.0008) roadmapAnim.displayProgress = targetP;
      else roadmapAnim.displayProgress += diff * roadmapAnim.progressLerp;
      setRoadmapProgressWidth(roadmapAnim.displayProgress, true);
      return;
    }

    roadmapAnim.displayProgress = targetP;
    setRoadmapProgressWidth(targetP, false);
  }

  function clampRoadmapTranslate(value) {
    if (!roadmapSwiper) return value;
    var bounds = getRoadmapScrollBounds();
    if (value > bounds.start) return bounds.start;
    if (value < bounds.end) return bounds.end;
    return value;
  }

  function roadmapAnimFrame() {
    if (!roadmapSwiper) {
      roadmapAnim.rafId = null;
      return;
    }

    var current = roadmapSwiper.getTranslate();
    var target = roadmapAnim.targetTranslate;
    var diff = target - current;

    if (Math.abs(diff) < 0.2) {
      roadmapSwiper.setTransition(0);
      roadmapSwiper.setTranslate(target);
      roadmapSwiper.updateProgress();
      roadmapSwiper.updateActiveIndex();
      roadmapAnim.targetTranslate = target;
      updateRoadmapProgress(roadmapSwiper, { immediate: true });
      roadmapAnim.rafId = null;
      return;
    }

    var next = current + diff * roadmapAnim.lerp;
    roadmapSwiper.setTransition(0);
    roadmapSwiper.setTranslate(next);
    roadmapSwiper.updateProgress();
    roadmapSwiper.updateActiveIndex();
    updateRoadmapProgress(roadmapSwiper, { scrubbing: true });
    roadmapAnim.rafId = window.requestAnimationFrame(roadmapAnimFrame);
  }

  function setRoadmapTargetTranslate(value) {
    roadmapAnim.targetTranslate = clampRoadmapTranslate(value);
    if (!roadmapAnim.rafId) {
      roadmapAnim.rafId = window.requestAnimationFrame(roadmapAnimFrame);
    }
  }

  function applyRoadmapScrollProgress(progress, options) {
    if (!roadmapSwiper || roadmapSwiper.isLocked) return;

    var opts = options || {};
    var p = Math.max(0, Math.min(1, progress));
    var bounds = getRoadmapScrollBounds();
    var translate = bounds.start + (bounds.end - bounds.start) * p;

    if (roadmapAnim.rafId) {
      window.cancelAnimationFrame(roadmapAnim.rafId);
      roadmapAnim.rafId = null;
    }

    roadmapPinState.scrollDriving = true;
    roadmapAnim.targetTranslate = translate;
    roadmapSwiper.setTransition(0);
    roadmapSwiper.setTranslate(translate);
    roadmapSwiper.updateProgress();
    roadmapSwiper.updateActiveIndex();
    updateRoadmapProgress(roadmapSwiper, opts.scrubbing ? { scrubbing: true } : { immediate: true });
    roadmapPinState.scrollDriving = false;
  }

  function getRoadmapStickyTop() {
    return header ? header.offsetHeight : 84;
  }

  function getRoadmapBottomReserve() {
    var w = window.innerWidth;
    if (w < 720) return window.innerHeight * 0.16;
    if (w < 1024) return window.innerHeight * 0.22;
    return window.innerHeight * 0.3;
  }

  function getRoadmapViewZone() {
    return window.innerHeight - getRoadmapStickyTop() - getRoadmapBottomReserve();
  }

  function getRoadmapStickyHeight() {
    if (!roadmapPinEl) return getRoadmapViewZone();
    var stickyEl = roadmapPinEl.querySelector('.roadmap-pin__sticky');
    return stickyEl && stickyEl.offsetHeight
      ? stickyEl.offsetHeight
      : getRoadmapViewZone();
  }

  function updateRoadmapSlidesOffsetAfter() {
    if (!roadmapSwiper) return;

    // No virtual card gap: last slide stops at container right edge
    var offsetAfter = 0;
    if (roadmapSwiper.params.slidesOffsetAfter === offsetAfter) return;

    roadmapPinState.updating = true;
    roadmapSwiper.params.slidesOffsetAfter = offsetAfter;
    roadmapSwiper.update();
    roadmapPinState.updating = false;
  }

  function updateRoadmapPinHeight() {
    if (!roadmapPinEl || !roadmapSwiper) return;

    if (!isRoadmapPinEnabled() || roadmapSwiper.isLocked) {
      roadmapPinEl.style.height = '';
      roadmapPinEl.classList.remove('is-active');
      return;
    }

    updateRoadmapSlidesOffsetAfter();
    var bounds = getRoadmapScrollBounds();
    var horizontalDistance = bounds.range;
    var stickyHeight = getRoadmapStickyHeight();
    var leadIn = getRoadmapLeadIn();
    var leadOut = getRoadmapLeadOut();
    roadmapPinEl.style.height = (stickyHeight + leadIn + leadOut + horizontalDistance * 1.1) + 'px';
  }

  function getRoadmapPinMetrics() {
    if (!roadmapPinEl) return null;
    var rect = roadmapPinEl.getBoundingClientRect();
    var pinTop = rect.top + getPageScrollY();
    var pinHeight = roadmapPinEl.offsetHeight;
    var stickyTop = getRoadmapStickyTop();
    var stickyHeight = getRoadmapStickyHeight();
    var scrollStart = pinTop - stickyTop;
    var scrollable = Math.max(1, pinHeight - stickyHeight);
    return {
      pinTop: pinTop,
      pinHeight: pinHeight,
      scrollStart: scrollStart,
      scrollable: scrollable,
    };
  }

  function updateRoadmapFromPageScroll() {
    if (!roadmapPinEl || !roadmapSwiper || !isRoadmapPinEnabled()) {
      if (roadmapPinEl) roadmapPinEl.classList.remove('is-active');
      return;
    }

    var metrics = getRoadmapPinMetrics();
    if (!metrics || metrics.scrollable <= 0) return;

    var scrollY = getPageScrollY();
    var scrolled = scrollY - metrics.scrollStart;
    var leadIn = getRoadmapLeadIn();
    var leadOut = getRoadmapLeadOut();
    var driveScrollable = Math.max(1, metrics.scrollable - leadIn - leadOut);
    var progress = (scrolled - leadIn) / driveScrollable;
    var inPin = scrolled > 0 && scrolled < metrics.scrollable;

    roadmapPinEl.classList.toggle('is-active', inPin);
    applyRoadmapScrollProgress(progress, { scrubbing: true });
  }

  function applyRoadmapSwiperMode() {
    if (!roadmapSwiper) return;

    var pinOn = isRoadmapPinEnabled();
    roadmapSwiper.params.allowTouchMove = !pinOn;
    roadmapSwiper.allowTouchMove = !pinOn;
    roadmapSwiper.params.simulateTouch = !pinOn;
    roadmapSwiper.params.grabCursor = !pinOn;
    roadmapSwiper.params.freeMode = pinOn ? false : {
      enabled: true,
      momentum: true,
      momentumRatio: 0.72,
      momentumVelocityRatio: 0.9,
      momentumBounce: false,
      sticky: false,
    };
    syncRoadmapPinMode();
    roadmapSwiper.update();
  }

  function initRoadmapWheelScroll() {
    var roadmapWheelTarget = document.getElementById('glass-stepper') || roadmapSwiperEl;
    if (!roadmapWheelTarget) return;

    roadmapWheelTarget.addEventListener('wheel', function (e) {
      if (!roadmapSwiper || roadmapSwiper.destroyed || isRoadmapPinEnabled()) return;

      var delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      if (!delta || Math.abs(delta) < 1) return;

      var translate = roadmapAnim.rafId ? roadmapAnim.targetTranslate : roadmapSwiper.getTranslate();
      var bounds = getRoadmapScrollBounds();
      var scrollingForward = delta > 0;
      var atStart = translate >= bounds.start - 0.5;
      var atEnd = translate <= bounds.end + 0.5;

      if (scrollingForward && atEnd) return;
      if (!scrollingForward && atStart) return;

      e.preventDefault();
      setRoadmapTargetTranslate(translate - delta * roadmapAnim.wheelMultiplier);
    }, { passive: false });
  }

  if (roadmapSwiperEl && typeof Swiper !== 'undefined') {
    roadmapSwiper = new Swiper('#roadmap-swiper', {
      slidesPerView: 'auto',
      spaceBetween: 24,
      grabCursor: !isRoadmapPinEnabled(),
      watchOverflow: true,
      allowTouchMove: !isRoadmapPinEnabled(),
      simulateTouch: !isRoadmapPinEnabled(),
      speed: 650,
      freeMode: isRoadmapPinEnabled() ? false : {
        enabled: true,
        momentum: true,
        momentumRatio: 0.72,
        momentumVelocityRatio: 0.9,
        momentumBounce: false,
        sticky: false,
      },
      on: {
        init: function (swiper) {
          roadmapAnim.targetTranslate = swiper.getTranslate();
          applyRoadmapSwiperMode();
          updateRoadmapPinHeight();
          updateRoadmapFromPageScroll();
          updateRoadmapProgress(swiper, { immediate: true });
        },
        progress: function (swiper) {
          if (!roadmapAnim.rafId && !roadmapPinState.scrollDriving) updateRoadmapProgress(swiper);
        },
        resize: function (swiper) {
          if (roadmapPinState.updating) return;
          updateRoadmapPinHeight();
          updateRoadmapFromPageScroll();
          roadmapAnim.targetTranslate = swiper.getTranslate();
          updateRoadmapProgress(swiper, { immediate: true });
        },
        setTranslate: function (swiper) {
          if (!roadmapAnim.rafId && !roadmapPinState.scrollDriving) {
            roadmapAnim.targetTranslate = swiper.getTranslate();
            updateRoadmapProgress(swiper);
          }
        },
        touchEnd: function (swiper) {
          roadmapAnim.targetTranslate = swiper.getTranslate();
        },
        transitionEnd: function (swiper) {
          roadmapAnim.targetTranslate = swiper.getTranslate();
          updateRoadmapProgress(swiper);
        },
      },
    });

    syncRoadmapPinMode();
    initRoadmapWheelScroll();

    window.addEventListener('resize', function () {
      syncHeaderMetrics();
      if (roadmapSwiper) {
        updateRoadmapPinHeight();
        updateRoadmapFromPageScroll();
        roadmapAnim.targetTranslate = roadmapSwiper.getTranslate();
        updateRoadmapProgress(roadmapSwiper, { immediate: true });
      }
    }, { passive: true });
  }

  /* ---------------------------------------------------------
     Border glow on roadmap cards (reactbits-style)
  --------------------------------------------------------- */
  function initBorderGlowCards() {
    var root = document.getElementById('glass-stepper');
    var cards = Array.prototype.slice.call(
      (root || document).querySelectorAll('.border-glow-card')
    );
    if (!cards.length || !window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var influenceRadius = 180;

    function getCenter(el) {
      var rect = el.getBoundingClientRect();
      return [rect.width / 2, rect.height / 2];
    }
    function getEdgeProximity(el, x, y) {
      var c = getCenter(el);
      var dx = x - c[0];
      var dy = y - c[1];
      var kx = Infinity;
      var ky = Infinity;
      if (dx !== 0) kx = c[0] / Math.abs(dx);
      if (dy !== 0) ky = c[1] / Math.abs(dy);
      return Math.min(Math.max(1 / Math.min(kx, ky), 0), 1);
    }
    function getCursorAngle(el, x, y) {
      var c = getCenter(el);
      var dx = x - c[0];
      var dy = y - c[1];
      if (dx === 0 && dy === 0) return 0;
      var deg = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
      if (deg < 0) deg += 360;
      return deg;
    }
    function clearGlow() {
      cards.forEach(function (card) {
        card.style.setProperty('--edge-proximity', '0');
      });
    }
    function updateFromPointer(e) {
      cards.forEach(function (card) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left;
        var y = e.clientY - rect.top;
        var clampedX = Math.min(Math.max(x, 0), rect.width);
        var clampedY = Math.min(Math.max(y, 0), rect.height);
        var edge = getEdgeProximity(card, clampedX, clampedY);
        var outside = x < 0 || y < 0 || x > rect.width || y > rect.height;

        if (outside) {
          var odx = 0;
          var ody = 0;
          if (x < 0) odx = -x;
          else if (x > rect.width) odx = x - rect.width;
          if (y < 0) ody = -y;
          else if (y > rect.height) ody = y - rect.height;
          var dist = Math.hypot(odx, ody);
          edge *= Math.max(0, 1 - dist / influenceRadius);
        }

        var angle = getCursorAngle(card, x, y);
        card.style.setProperty('--edge-proximity', (edge * 100).toFixed(3));
        card.style.setProperty('--cursor-angle', angle.toFixed(3) + 'deg');
      });
    }

    var target = root || cards[0].parentElement;
    if (!target) return;
    target.addEventListener('pointermove', updateFromPointer);
    target.addEventListener('pointerleave', clearGlow);
  }
  initBorderGlowCards();

  /* ---------------------------------------------------------
     Smooth anchor scrolling with header offset
  --------------------------------------------------------- */
  function scrollToTarget(target) {
    var headerH = header ? header.offsetHeight : 80;
    var rect = target.getBoundingClientRect();
    var top = rect.top + window.pageYOffset - headerH + 1;
    if (lenis) {
      lenis.scrollTo(top, { offset: 0 });
      return;
    }
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

  /* ---------------------------------------------------------
     Mobile menu
  --------------------------------------------------------- */
  function openMobileMenu() {
    mobileMenu.classList.add('is-open');
    overlay.classList.add('is-visible');
    mobileMenu.setAttribute('aria-hidden', 'false');
    burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('modal-open');
    stopSmoothScroll();
  }
  function collapseMobileAccordions() {
    if (!mobileMenu) return;
    var items = mobileMenu.querySelectorAll('.mobile-menu__item--accordion');
    Array.prototype.forEach.call(items, function (item) {
      var btn = item.querySelector('.mobile-menu__accordion-btn');
      var panel = item.querySelector('.mobile-menu__panel');
      item.classList.remove('is-open');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (panel) panel.setAttribute('aria-hidden', 'true');
    });
  }
  function closeMobileMenu() {
    if (!mobileMenu) return;
    mobileMenu.classList.remove('is-open');
    overlay.classList.remove('is-visible');
    mobileMenu.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('modal-open');
    collapseMobileAccordions();
    startSmoothScroll();
  }
  if (burger) burger.addEventListener('click', openMobileMenu);
  if (burgerClose) burgerClose.addEventListener('click', closeMobileMenu);
  if (overlay) overlay.addEventListener('click', closeMobileMenu);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMobileMenu();
  });

  (function initMobileMenuAccordion() {
    if (!mobileMenu) return;
    var toggles = mobileMenu.querySelectorAll('.mobile-menu__accordion-btn');
    Array.prototype.forEach.call(toggles, function (btn) {
      var item = btn.closest('.mobile-menu__item--accordion');
      var panel = item ? item.querySelector('.mobile-menu__panel') : null;
      if (!item || !panel) return;

      btn.addEventListener('click', function () {
        var willOpen = !item.classList.contains('is-open');
        collapseMobileAccordions();
        if (willOpen) {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          panel.setAttribute('aria-hidden', 'false');
        }
      });
    });
  })();

  /* ---------------------------------------------------------
     Reveal on scroll
  --------------------------------------------------------- */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]')).filter(function (el) {
    return !el.closest('[data-enter]') && !el.classList.contains('project-card');
  });
  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    revealItems.forEach(function (item) { revealObserver.observe(item); });
  } else {
    revealItems.forEach(function (item) { item.classList.add('in-view'); });
  }

  /* Portfolio: reveal each card when it enters view (left then right in a row) */
  (function initPortfolioReveal() {
    var grid = document.querySelector('.portfolio__grid');
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.project-card[data-reveal]'));
    if (!cards.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      cards.forEach(function (card) {
        card.classList.add('in-view');
        card.classList.add('is-settled');
      });
      return;
    }

    /* Right-column cards get a short delay so left appears first */
    cards.forEach(function (card, index) {
      if (index % 2 === 1) card.setAttribute('data-reveal-delay', '1');
      else card.removeAttribute('data-reveal-delay');
    });

    var portfolioObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var card = entry.target;
        card.classList.add('in-view');
        portfolioObserver.unobserve(card);
        window.setTimeout(function () {
          card.classList.add('is-settled');
        }, 1100);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });

    cards.forEach(function (card) { portfolioObserver.observe(card); });
  })();

  /* Contacts: coordinated enter, then nested reveals */
  var contactsSection = document.querySelector('.contacts');
  var contactsEnterPanels = Array.prototype.slice.call(document.querySelectorAll('.contacts [data-enter]'));
  var contactsEnterDuration = 620;

  function revealContactsChildren(panel) {
    if (panel.classList.contains('is-content-ready')) return;
    panel.classList.add('is-content-ready');
    Array.prototype.slice.call(panel.querySelectorAll('[data-reveal]')).forEach(function (el, i) {
      window.setTimeout(function () {
        el.classList.add('in-view');
      }, i * 65);
    });
  }

  function onContactsPanelEntered(panel) {
    function finishEnter(e) {
      if (e && e.target !== panel) return;
      if (e && e.propertyName && e.propertyName !== 'transform' && e.propertyName !== 'opacity') return;
      panel.removeEventListener('transitionend', finishEnter);
      window.clearTimeout(panel._contactsEnterFallback);
      panel.classList.remove('is-animating');
      revealContactsChildren(panel);
    }

    panel.addEventListener('transitionend', finishEnter);
    panel._contactsEnterFallback = window.setTimeout(function () {
      panel.removeEventListener('transitionend', finishEnter);
      panel.classList.remove('is-animating');
      revealContactsChildren(panel);
    }, contactsEnterDuration + 50);
  }

  function playContactsEnter() {
    if (!contactsEnterPanels.length) return;
    contactsEnterPanels.forEach(function (panel) {
      if (reduceMotion) {
        panel.classList.add('is-entered');
        revealContactsChildren(panel);
        return;
      }
      var stagger = panel.getAttribute('data-enter') === 'right' ? 110 : 0;
      window.setTimeout(function () {
        panel.classList.add('is-animating');
        panel.classList.add('is-entered');
        onContactsPanelEntered(panel);
      }, stagger);
    });
  }

  if (contactsEnterPanels.length) {
    if ('IntersectionObserver' in window && !reduceMotion && contactsSection) {
      var contactsEnterObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          contactsEnterObserver.unobserve(entry.target);
          playContactsEnter();
        });
      }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
      contactsEnterObserver.observe(contactsSection);
    } else {
      playContactsEnter();
    }
  }

  var collage = document.querySelector('.about__collage');
  if (collage && 'IntersectionObserver' in window) {
    var collageObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        Array.prototype.slice.call(collage.querySelectorAll('.collage__item')).forEach(function (item, i) {
          window.setTimeout(function () {
            item.classList.add('in-view');
          }, i * 100);
        });
        collageObserver.unobserve(collage);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
    collageObserver.observe(collage);
  }

  /* ---------------------------------------------------------
     Phone input mask (RU)
  --------------------------------------------------------- */
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
    input.addEventListener('focus', function () {
      if (!input.value) input.value = '+7 ';
    });
  }
  Array.prototype.slice.call(document.querySelectorAll('input[type="tel"]')).forEach(maskPhone);

  /* ---------------------------------------------------------
     Form validation + fake submit
  --------------------------------------------------------- */
  function validateField(field, rules) {
    var input = field.querySelector('input, textarea');
    var errorEl = field.querySelector('.field__error');
    var value = input.value.trim();
    var message = '';

    if (rules.required && !value) {
      message = 'Обязательное поле';
    } else if (rules.minLength && value.length < rules.minLength) {
      message = 'Слишком короткое значение';
    } else if (rules.phone && value) {
      var digits = value.replace(/\D/g, '');
      if (digits.length < 11) message = 'Проверьте номер телефона';
    } else if (rules.email && value) {
      var re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!re.test(value)) message = 'Проверьте адрес email';
    }

    field.classList.toggle('has-error', !!message);
    if (errorEl) errorEl.textContent = message;
    if (message) {
      field.classList.remove('is-shaking');
      void field.offsetWidth;
      field.classList.add('is-shaking');
    }
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

      var fields = Array.prototype.slice.call(form.querySelectorAll('.field'));
      fields.forEach(function (field) {
        var input = field.querySelector('input, textarea');
        if (!input) return;
        var rules = {};
        if (input.name === 'name') rules = { required: true, minLength: 2 };
        if (input.name === 'phone') rules = { required: true, phone: true };
        if (input.name === 'email') rules = { email: true };
        if (Object.keys(rules).length) {
          var ok = validateField(field, rules);
          validity = validity && ok;
        }
      });

      if (consentInput) {
        var consentOk = validateConsent(consentInput, consentError);
        validity = validity && consentOk;
      }

      if (!validity) return;

      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;

      // NOTE: backend integration point.
      // Replace this timeout with a real fetch()/XHR call to your endpoint, e.g.:
      // fetch('/api/lead', { method: 'POST', body: new FormData(form) })
      window.setTimeout(function () {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
        if (success) success.hidden = false;
        form.classList.add('is-success');
        form.reset();

        if (formId === 'quick-form') {
          window.setTimeout(closeQuickModal, 2200);
        }
      }, 900);
    });
  }

  setupForm('contact-form', 'form-success');
  setupForm('quick-form', 'quick-form-success');

  /* ---------------------------------------------------------
     Focus trap helpers (modal / lightbox)
  --------------------------------------------------------- */
  function getFocusableElements(container) {
    if (!container) return [];
    return Array.prototype.slice.call(container.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(function (el) {
      if (el.hasAttribute('disabled') || el.getAttribute('aria-hidden') === 'true') return false;
      if (el.closest('[hidden], [aria-hidden="true"]')) return false;
      return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
    });
  }

  function trapFocusKeydown(e, container) {
    if (e.key !== 'Tab' || !container) return;
    var focusable = getFocusableElements(container);
    if (!focusable.length) {
      e.preventDefault();
      return;
    }
    var first = focusable[0];
    var last = focusable[focusable.length - 1];
    var active = document.activeElement;
    if (e.shiftKey) {
      if (active === first || !container.contains(active)) {
        e.preventDefault();
        last.focus();
      }
    } else if (active === last || !container.contains(active)) {
      e.preventDefault();
      first.focus();
    }
  }

  /* ---------------------------------------------------------
     Quick request modal
  --------------------------------------------------------- */
  var quickModal = document.getElementById('quick-modal');
  var quickModalPanel = quickModal ? quickModal.querySelector('.modal__panel') : null;
  var lastFocusedEl = null;

  function openQuickModal() {
    if (!quickModal) return;
    lastFocusedEl = document.activeElement;
    quickModal.classList.add('is-open');
    quickModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    stopSmoothScroll();
    window.setTimeout(function () {
      var focusables = getFocusableElements(quickModalPanel || quickModal);
      var target = null;
      var i;
      for (i = 0; i < focusables.length; i++) {
        if (focusables[i].matches('input:not([type="hidden"]):not([type="checkbox"]), textarea, select')) {
          target = focusables[i];
          break;
        }
      }
      if (!target && focusables.length) target = focusables[0];
      if (target) target.focus();
    }, 350);
  }
  function closeQuickModal() {
    if (!quickModal) return;
    quickModal.classList.remove('is-open');
    quickModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    startSmoothScroll();
    if (lastFocusedEl) lastFocusedEl.focus();
  }
  if (quickCta) quickCta.addEventListener('click', openQuickModal);
  Array.prototype.slice.call(document.querySelectorAll('[data-close-modal]')).forEach(function (btn) {
    btn.addEventListener('click', closeQuickModal);
  });
  document.addEventListener('keydown', function (e) {
    if (!quickModal || !quickModal.classList.contains('is-open')) return;
    if (e.key === 'Escape') {
      closeQuickModal();
      return;
    }
    trapFocusKeydown(e, quickModalPanel || quickModal);
  });

  /* ---------------------------------------------------------
     Back to top
  --------------------------------------------------------- */
  if (toTopBtn) {
    toTopBtn.addEventListener('click', function () {
      if (lenis) {
        lenis.scrollTo(0);
        return;
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ---------------------------------------------------------
     Mouse-tilt + image parallax for portfolio cards
  --------------------------------------------------------- */
  var tiltCards = Array.prototype.slice.call(document.querySelectorAll('[data-tilt]'));
  var hasFinePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;
  var prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (hasFinePointer && !prefersReducedMotion) {
    tiltCards.forEach(function (card) {
      var rafId = null;
      var tiltEl = card.querySelector('.project-card__btn') || card;
      var mediaImg = card.querySelector('.project-card__media img');
      // Keep hit-testing on the outer card (no transform), tilt the inner button.
      card.style.transform = '';
      var tilt = {
        active: false,
        rotateX: 0,
        rotateY: 0,
        targetX: 0,
        targetY: 0,
        rect: null,
        parallaxX: 0,
        parallaxY: 0,
        targetParallaxX: 0,
        targetParallaxY: 0,
      };
      var parallaxStrength = 18;
      var maxTilt = 1.2;

      function applyTiltTransform() {
        tiltEl.style.transform =
          'perspective(900px) rotateX(' + tilt.rotateX.toFixed(3) + 'deg) rotateY(' + tilt.rotateY.toFixed(3) + 'deg)';
        if (mediaImg) {
          mediaImg.style.transform =
            'translate3d(' + tilt.parallaxX.toFixed(2) + 'px, ' + tilt.parallaxY.toFixed(2) + 'px, 0) scale(1.12)';
        }
      }

      function tiltFrame() {
        var lerp = tilt.active ? 0.11 : 0.09;
        tilt.rotateX += (tilt.targetX - tilt.rotateX) * lerp;
        tilt.rotateY += (tilt.targetY - tilt.rotateY) * lerp;
        tilt.parallaxX += (tilt.targetParallaxX - tilt.parallaxX) * lerp;
        tilt.parallaxY += (tilt.targetParallaxY - tilt.parallaxY) * lerp;
        applyTiltTransform();

        var settling =
          Math.abs(tilt.targetX - tilt.rotateX) > 0.02 ||
          Math.abs(tilt.targetY - tilt.rotateY) > 0.02 ||
          Math.abs(tilt.targetParallaxX - tilt.parallaxX) > 0.15 ||
          Math.abs(tilt.targetParallaxY - tilt.parallaxY) > 0.15;
        if (tilt.active || settling) {
          rafId = window.requestAnimationFrame(tiltFrame);
        } else {
          tilt.rotateX = tilt.targetX;
          tilt.rotateY = tilt.targetY;
          tilt.parallaxX = tilt.targetParallaxX;
          tilt.parallaxY = tilt.targetParallaxY;
          applyTiltTransform();
          rafId = null;
          card.classList.remove('is-tilting');
        }
      }

      function startTiltLoop() {
        if (!rafId) rafId = window.requestAnimationFrame(tiltFrame);
      }

      function refreshRect() {
        tilt.rect = card.getBoundingClientRect();
      }

      function onPointerMove(e) {
        if (!tilt.active || !tilt.rect) return;

        var r = tilt.rect;
        if (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        ) {
          endTilt();
          return;
        }

        var px = (e.clientX - r.left) / r.width;
        var py = (e.clientY - r.top) / r.height;
        // Clamp to avoid edge spikes
        px = Math.max(0, Math.min(1, px));
        py = Math.max(0, Math.min(1, py));

        tilt.targetX = (0.5 - py) * maxTilt;
        tilt.targetY = (px - 0.5) * maxTilt;
        tilt.targetParallaxX = (px - 0.5) * -2 * parallaxStrength;
        tilt.targetParallaxY = (py - 0.5) * -2 * parallaxStrength;
        startTiltLoop();
      }

      function endTilt() {
        if (!tilt.active) return;
        tilt.active = false;
        tilt.targetX = 0;
        tilt.targetY = 0;
        tilt.targetParallaxX = 0;
        tilt.targetParallaxY = 0;
        tilt.rect = null;
        window.removeEventListener('pointermove', onPointerMove);
        window.removeEventListener('scroll', refreshRect, true);
        startTiltLoop();
      }

      function onPointerEnter() {
        if (tilt.active) return;
        tilt.active = true;
        card.classList.add('is-tilting');
        refreshRect();
        window.addEventListener('pointermove', onPointerMove, { passive: true });
        window.addEventListener('scroll', refreshRect, true);
        startTiltLoop();
      }

      card.addEventListener('pointerenter', onPointerEnter);
      card.addEventListener('pointerleave', endTilt);
    });
  }

  /* ---------------------------------------------------------
     Portfolio lightbox
  --------------------------------------------------------- */
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

  function supportsWebp() {
    if (typeof supportsWebp.cache === 'boolean') return supportsWebp.cache;
    try {
      supportsWebp.cache = document.createElement('canvas')
        .toDataURL('image/webp')
        .indexOf('data:image/webp') === 0;
    } catch (e) {
      supportsWebp.cache = false;
    }
    return supportsWebp.cache;
  }

  function imgPath(project, index) {
    var num = (index + 1) < 10 ? '0' + (index + 1) : String(index + 1);
    var base = 'assets/img/portfolio/project-' + project + '/' + num;
    var p = String(project);
    // Optimized WebP galleries: projects 1–6 (fallback via onerror)
    if (supportsWebp() && (p === '1' || p === '2' || p === '3' || p === '4' || p === '5' || p === '6')) return base + '.webp';
    return base + '.jpg';
  }

  function renderLightboxImage() {
    if (!lightboxImg) return;
    lightboxImg.classList.remove('is-loaded');
    var src = imgPath(galleryState.project, galleryState.index);
    var fallback = src.replace(/\.webp$/i, '.jpg');
    var tempImg = new Image();
    tempImg.onload = function () {
      lightboxImg.src = tempImg.src;
      lightboxImg.alt = galleryState.title + ' — фото ' + (galleryState.index + 1);
      requestAnimationFrame(function () {
        lightboxImg.classList.add('is-loaded');
      });
    };
    tempImg.onerror = function () {
      if (fallback !== src && tempImg.src.indexOf(fallback) === -1) {
        tempImg.src = fallback;
        return;
      }
      lightboxImg.removeAttribute('src');
      lightboxImg.alt = galleryState.title + ' — фото недоступно';
    };
    tempImg.src = src;

    if (lightboxTitle) lightboxTitle.textContent = galleryState.title;
    if (lightboxDesc) lightboxDesc.textContent = galleryState.desc;
    if (lightboxCurrent) lightboxCurrent.textContent = galleryState.index + 1;
    if (lightboxTotal) lightboxTotal.textContent = galleryState.count;
  }

  function openLightbox(project, count, title, desc, startIndex) {
    if (!lightbox) return;
    galleryState = { project: project, count: count, index: startIndex || 0, title: title, desc: desc };
    renderLightboxImage();
    lastLightboxFocusedEl = document.activeElement;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    stopSmoothScroll();
    window.setTimeout(function () {
      var focusables = getFocusableElements(lightbox);
      var target = lightboxCloseBtn || (focusables.length ? focusables[0] : null);
      if (target) target.focus();
    }, 200);
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    startSmoothScroll();
    if (lastLightboxFocusedEl) lastLightboxFocusedEl.focus();
  }

  function showNext() {
    galleryState.index = (galleryState.index + 1) % galleryState.count;
    renderLightboxImage();
  }
  function showPrev() {
    galleryState.index = (galleryState.index - 1 + galleryState.count) % galleryState.count;
    renderLightboxImage();
  }

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
    if (e.key === 'Escape') {
      closeLightbox();
      return;
    }
    if (e.key === 'ArrowRight') showNext();
    if (e.key === 'ArrowLeft') showPrev();
    trapFocusKeydown(e, lightbox);
  });

  // touch swipe support
  (function () {
    var touchStartX = 0;
    var stage = lightbox ? lightbox.querySelector('.lightbox__stage') : null;
    if (!stage) return;
    stage.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    stage.addEventListener('touchend', function (e) {
      var delta = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(delta) > 50) {
        if (delta < 0) showNext(); else showPrev();
      }
    }, { passive: true });
  })();

})();
