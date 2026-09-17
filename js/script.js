/* =========================================================
   YMG DESIGN - main script
   ========================================================= */
(function () {
  'use strict';

  var header       = document.getElementById('header');
  var burger       = document.getElementById('burger');
  var mobileMenu   = document.getElementById('mobile-menu');
  var toTopBtn     = document.getElementById('to-top');
  var quickCta     = document.getElementById('quick-cta');
  var preloader    = document.getElementById('preloader');
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var saveData = !!(navigator.connection && navigator.connection.saveData);
  /* Full motion by default; lite only for reduced-motion or Save-Data. */
  var preferLiteMotion = reduceMotion || saveData;
  var isIosTouch = (function () {
    var ua = navigator.userAgent || '';
    if (/iP(hone|ad|od)/.test(ua)) return true;
    return navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  })();
  var isCoarsePointer = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);
  var isNarrowViewport = !!(window.matchMedia && window.matchMedia('(max-width: 1024px)').matches);
  /* Lenis only on desktop. Phones keep native scroll: sticky pin stays stable, less JS. */
  var allowSmoothScroll = !preferLiteMotion && !isCoarsePointer && !isNarrowViewport;
  var lenis = null;

  /* Hero heights and the bottom-bar inset live in CSS: 100svh plus
     env(safe-area-inset-bottom). Measuring them here made the photo jump. */
  var scriptLoaders = {};
  var styleLoaders = {};

  if (preferLiteMotion) {
    document.documentElement.classList.add('is-lite-motion');
  }

  function loadStylesheet(href) {
    if (styleLoaders[href]) return styleLoaders[href];
    styleLoaders[href] = new Promise(function (resolve, reject) {
      var existing = document.querySelector('link[data-dynamic-href="' + href + '"]');
      if (existing) {
        if (existing.getAttribute('data-loaded') === '1') {
          resolve();
          return;
        }
        existing.addEventListener('load', function () { resolve(); });
        existing.addEventListener('error', function () { reject(new Error('Failed to load ' + href)); });
        return;
      }
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.setAttribute('data-dynamic-href', href);
      link.onload = function () {
        link.setAttribute('data-loaded', '1');
        resolve();
      };
      link.onerror = function () {
        reject(new Error('Failed to load ' + href));
      };
      document.head.appendChild(link);
    });
    return styleLoaders[href];
  }

  function loadScript(src) {
    if (scriptLoaders[src]) return scriptLoaders[src];
    scriptLoaders[src] = new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-dynamic-src="' + src + '"]');
      if (existing) {
        if (existing.getAttribute('data-loaded') === '1') {
          resolve();
          return;
        }
        existing.addEventListener('load', function () { resolve(); });
        existing.addEventListener('error', function () { reject(new Error('Failed to load ' + src)); });
        return;
      }
      var s = document.createElement('script');
      s.src = src;
      s.async = true;
      s.setAttribute('data-dynamic-src', src);
      s.onload = function () {
        s.setAttribute('data-loaded', '1');
        resolve();
      };
      s.onerror = function () {
        reject(new Error('Failed to load ' + src));
      };
      document.head.appendChild(s);
    });
    return scriptLoaders[src];
  }

  function loadVendor(cssHref, jsSrc) {
    return Promise.all([loadStylesheet(cssHref), loadScript(jsSrc)]);
  }

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
    if (!preloader || !preloader.parentNode) return;
    preloader.classList.add('is-hidden');
    window.setTimeout(function () {
      if (preloader && preloader.parentNode) {
        preloader.parentNode.removeChild(preloader);
      }
      preloader = null;
    }, 600);
  }
  window.setTimeout(hidePreloader, 2500);

  /* ---------------------------------------------------------
     Hero intro timeline (Web Animations API - GSAP-like sequence)
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
        /* Mask off immediately — Firefox shows split title before intro starts */
        wordSpan.style.transform = 'translateY(105%)';
        wordSpan.textContent = word + (wi < arr.length - 1 ? '\u00A0' : '');

        mask.appendChild(wordSpan);
        lineWrap.appendChild(mask);
        wordIndex += 1;
      });

      title.appendChild(lineWrap);
    });

    title.setAttribute('aria-label', title.textContent.replace(/\s+/g, ' ').trim());
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

  function commitMotion(el) {
    if (!el) return;
    if (el.getAnimations) {
      el.getAnimations().forEach(function (anim) {
        try {
          if (typeof anim.commitStyles === 'function') anim.commitStyles();
        } catch (err) {}
      });
    }
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
    var hasHeroTitle = !!document.querySelector('.hero__title');

    if (!hasHeroTitle || reduceMotion) {
      document.body.classList.remove('hero-intro-pending');
      document.body.classList.add('is-intro-done');
      if (!hasHeroTitle) {
        hidePreloader();
        return;
      }
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

    if (preloader) {
      preloader.classList.add('is-animating');
      window.setTimeout(hidePreloader, 900);
    }

    var jobs = [];
    var introFinished = false;
    var t = {
      header: 940,
      title: 1280,
      subtitle: 1720,
      actions: 1820,
      pillsWrap: 1920,
      pills: 2020,
      scroll: 2360,
      done: 3200,
    };

    if (mark && preloader) {
      jobs.push(waapi(mark, [
        { transform: 'scale(0.4) rotate(-12deg)', opacity: 0 },
        { transform: 'scale(1) rotate(0deg)', opacity: 1 },
      ], { duration: 650, delay: 0, fill: 'both', easing: easeBack }));
      jobs.push(waapi(preloader, [
        { opacity: 1 },
        { opacity: 0 },
      ], { duration: 400, delay: 900, fill: 'both', easing: easeInOut }));
    }

    jobs.push(waapi(headerPill, [
      { transform: 'translateY(-20px)' },
      { transform: 'translateY(0)' },
    ], { duration: 600, delay: t.header, fill: 'both', easing: easeOut }));

    jobs.push(waapi(headerInner, [
      { opacity: 0 },
      { opacity: 1 },
    ], { duration: 600, delay: t.header, fill: 'both', easing: easeOut }));

    words.forEach(function (word, i) {
      jobs.push(waapi(word, [
        { transform: 'translateY(105%)' },
        { transform: 'translateY(0)' },
      ], { duration: 950, delay: t.title + i * 50, fill: 'both', easing: easeOut }));
    });

    [subtitle, actions, pillsWrap].forEach(function (el, i) {
      jobs.push(waapi(el, [
        { opacity: 0, transform: 'translateY(40px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: 850, delay: t.subtitle + i * 100, fill: 'both', easing: easeOut }));
    });

    pills.forEach(function (pill, i) {
      jobs.push(waapi(pill, [
        { opacity: 0, transform: 'translateY(20px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], { duration: 500, delay: t.pills + i * 80, fill: 'both', easing: easeOut }));
    });

    jobs.push(waapi(scrollHint, [
      { opacity: 0 },
      { opacity: 1 },
    ], { duration: 450, delay: t.scroll, fill: 'both', easing: easeOut }));

    function finishHeroIntro() {
      if (introFinished) return;
      introFinished = true;

      var settleTargets = [headerPill, headerInner, scrollHint, subtitle, actions, pillsWrap]
        .concat(pills)
        .concat(words);

      settleTargets.forEach(function (el) {
        if (!el) return;
        commitMotion(el);
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      if (headerPill) headerPill.style.transform = 'none';

      Array.prototype.slice.call(document.querySelectorAll('.hero__content [data-reveal]')).forEach(function (el) {
        el.classList.add('in-view');
      });
      if (actions) actions.classList.add('in-view');
      if (pillsWrap) pillsWrap.classList.add('in-view');

      document.body.classList.remove('hero-intro-pending');
      document.body.classList.add('is-intro-done');
      void document.body.offsetWidth;

      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(function () {
          settleTargets.forEach(resetMotion);
          if (scrollHint) {
            scrollHint.style.opacity = '';
            scrollHint.style.transform = '';
            scrollHint.style.animation = 'none';
            void scrollHint.offsetWidth;
            scrollHint.style.animation = '';
          }
        });
      });

      if (preloader) preloader.classList.remove('is-animating');
      hidePreloader();

      headerScrolled = window.innerWidth > 1024 && getPageScrollY() > 240;
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
    if (!document.querySelector('.hero__title')) {
      startHeroIntro();
      return;
    }
    var run = function () {
      startHeroIntro();
    };
    /* Wait for display/body fonts before intro — Firefox late swap was jumping hero layout */
    if (document.fonts && document.fonts.status !== 'loaded') {
      var loads = [];
      try {
        loads.push(document.fonts.load('400 4rem "Cormorant Infant"'));
        loads.push(document.fonts.load('300 1rem Manrope'));
      } catch (err) {}
      Promise.race([
        Promise.all(loads.concat([document.fonts.ready])),
        new Promise(function (resolve) { window.setTimeout(resolve, 1800); }),
      ]).then(run);
    } else {
      run();
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      /* Split while still hidden so Firefox does not rewrite title mid-intro */
      splitHeroTitle();
    });
  } else {
    splitHeroTitle();
  }

  /* ---------------------------------------------------------
     Hero background video - stable CSS poster under video;
     no load() (avoids poster wipe / hero “reload” on mobile)
  --------------------------------------------------------- */
  var heroVideo = document.querySelector('.hero__video');
  var heroVideoToggle = document.getElementById('hero-video-toggle');

  function syncHeroVideoToggle() {
    if (!heroVideo || !heroVideoToggle) return;
    var isPlaying = !heroVideo.paused;
    heroVideoToggle.hidden = false;
    heroVideoToggle.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    heroVideoToggle.setAttribute('aria-label', isPlaying ? 'Остановить видео' : 'Включить видео');
    var pauseIcon = heroVideoToggle.querySelector('.hero__media-toggle-pause');
    var playIcon = heroVideoToggle.querySelector('.hero__media-toggle-play');
    if (pauseIcon) pauseIcon.hidden = !isPlaying;
    if (playIcon) playIcon.hidden = isPlaying;
  }

  if (heroVideo && !reduceMotion) {
    var heroPlayArmed = false;
    var heroRevealed = false;

    function revealHeroVideo() {
      if (heroRevealed || heroVideo.paused) return;
      heroRevealed = true;
      heroVideo.classList.add('is-playing');
      syncHeroVideoToggle();
    }

    function queueHeroReveal() {
      if (heroRevealed || heroVideo.paused) return;
      if (typeof heroVideo.requestVideoFrameCallback === 'function') {
        heroVideo.requestVideoFrameCallback(function () {
          revealHeroVideo();
        });
      } else {
        window.requestAnimationFrame(function () {
          window.requestAnimationFrame(revealHeroVideo);
        });
      }
    }

    function playHeroVideo() {
      heroVideo.muted = true;
      heroVideo.defaultMuted = true;
      heroVideo.playsInline = true;
      var promise = heroVideo.play();
      if (promise && typeof promise.then === 'function') {
        promise.then(queueHeroReveal).catch(function () {});
      } else if (!heroVideo.paused) {
        queueHeroReveal();
      }
    }

    function armHeroVideo() {
      if (heroPlayArmed) return;
      heroPlayArmed = true;
      heroVideo.addEventListener('playing', queueHeroReveal);
      /* play() starts the fetch - do not call load() (clears frame / feels like reload) */
      if (heroVideo.readyState >= 2) playHeroVideo();
      else {
        heroVideo.addEventListener('canplay', playHeroVideo, { once: true });
        heroVideo.addEventListener('loadeddata', playHeroVideo, { once: true });
        playHeroVideo();
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
      }, { rootMargin: '80px 0px', threshold: 0.01 });
      heroIo.observe(heroVideo);
    } else {
      armHeroVideo();
    }

    if (heroVideoToggle) {
      heroVideoToggle.addEventListener('click', function () {
        if (heroVideo.paused) {
          var playPromise = heroVideo.play();
          if (playPromise && typeof playPromise.then === 'function') {
            playPromise.then(function () {
              heroVideo.classList.add('is-playing');
              syncHeroVideoToggle();
            }).catch(function () {});
          } else {
            syncHeroVideoToggle();
          }
        } else {
          try { heroVideo.pause(); } catch (e) {}
          syncHeroVideoToggle();
        }
      });
    }
  } else if (heroVideoToggle) {
    heroVideoToggle.hidden = true;
  }

  /* ---------------------------------------------------------
     Viz showcase videos (cinematic) - play in view
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
  var headerExpandedH = 0;

  function syncHeaderMetrics() {
    if (!header) return;
    var measured = Math.round(header.getBoundingClientRect().height);
    if (!measured) return;

    /* Keep layout offset on the expanded height while the bar visually shrinks.
       Updating --header-h mid-transition caused Firefox/Chrome content jumps. */
    if (!header.classList.contains('is-scrolled') || header.classList.contains('is-menu-open')) {
      headerExpandedH = measured;
    } else if (!headerExpandedH) {
      headerExpandedH = measured;
    }

    var h = header.classList.contains('is-menu-open')
      ? measured
      : (headerExpandedH || measured);

    document.documentElement.style.setProperty('--header-h', h + 'px');
    document.documentElement.style.setProperty('--roadmap-pin-top', h + 'px');
    document.documentElement.style.setProperty('--services-sticky-top', (h + 16) + 'px');
  }

  function getScrollspyOffset() {
    return (header ? header.offsetHeight : 80) + 56;
  }

  function getPageScrollY() {
    if (lenis && typeof lenis.scroll === 'number') return lenis.scroll;
    var doc = document.documentElement;
    return window.scrollY || window.pageYOffset || doc.scrollTop || 0;
  }

  var contactsSection = document.getElementById('contacts');
  var contactsBgMedia = contactsSection && contactsSection.querySelector('.contacts__bg-media');
  var contactsParallaxActive = false;
  var contactsLastShift = '';

  function updateContactsParallax() {
    if (!contactsSection || !contactsBgMedia || reduceMotion) return;
    if (document.hidden) return;

    var rect = contactsSection.getBoundingClientRect();
    var vh = window.innerHeight || 1;
    var inView = rect.bottom > -80 && rect.top < vh + 80;

    if (!inView) {
      if (contactsParallaxActive) {
        contactsParallaxActive = false;
        contactsBgMedia.classList.remove('is-parallaxing');
      }
      return;
    }

    if (!contactsParallaxActive) {
      contactsParallaxActive = true;
      contactsBgMedia.classList.add('is-parallaxing');
    }

    var range = vh + rect.height;
    var progress = range ? (vh - rect.top) / range : 0.5;
    progress = Math.max(0, Math.min(1, progress));

    var amplitude = preferLiteMotion ? 12 : 20;
    var shift = ((0.5 - progress) * amplitude).toFixed(2) + '%';
    if (shift !== contactsLastShift) {
      contactsLastShift = shift;
      contactsBgMedia.style.setProperty('--contacts-shift', shift);
    }

    if (!preferLiteMotion) {
      contactsSection.style.setProperty('--contacts-veil', (0.18 + progress * 0.55).toFixed(3));
    }
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

    if (header && document.body.classList.contains('is-intro-done') && window.innerWidth > 1024) {
      /* Later trigger + hysteresis: avoid snapping right after load */
      var nextScrolled = headerScrolled ? (y >= 140) : (y > 240);
      if (nextScrolled !== headerScrolled) {
        headerScrolled = nextScrolled;
        header.classList.toggle('is-scrolled', nextScrolled);
        /* Do not resync --header-h on shrink; layout stays stable cross-browser */
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
    syncRoadmapFrost();

    /* Parallax only on desktop. On phones the URL bar changes scrollY/height and the video jumps. */
    if (allowSmoothScroll && heroVideo && heroVideo.classList.contains('is-playing') && !reduceMotion && !preferLiteMotion) {
      var hero = document.querySelector('.hero');
      if (hero) {
        var heroH = hero.offsetHeight || 1;
        var p = Math.max(0, Math.min(1, y / heroH));
        if (p < 1) {
          heroVideo.classList.add('is-parallaxing');
          /* Base scale must exceed max translate so sides never letterbox */
          heroVideo.style.transform = 'translate3d(0,' + (p * 10) + '%,0) scale(' + (1.12 + p * 0.04) + ')';
        } else {
          heroVideo.classList.remove('is-parallaxing');
          heroVideo.style.transform = '';
        }
      }
    }

    updateContactsParallax();
    if (!reduceMotion) updateServicesRecede();
  }

  /* Services sticky stack - 3D recede as next card overlays */
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

    var y = getPageScrollY();
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

  function clearServicesRecedeStyles() {
    var i;
    var card;
    for (i = 0; i < serviceCards.length; i++) {
      card = serviceCards[i];
      if (!card) continue;
      servicesLastProgress[i] = 0;
      card.style.removeProperty('--recede');
    }
  }

  function isServicesRecedeOff() {
    return !!(window.matchMedia && window.matchMedia('(max-width: 480px)').matches);
  }

  function updateServicesRecede() {
    if (!servicePanels.length || reduceMotion) return;
    if (isServicesRecedeOff()) return;
    if (servicesRecedeQueued) return;
    servicesRecedeQueued = true;
    window.requestAnimationFrame(function () {
      servicesRecedeQueued = false;
      if (reduceMotion) return;

      var sectionRect = servicesSectionEl
        ? servicesSectionEl.getBoundingClientRect()
        : null;
      var vh = window.innerHeight || document.documentElement.clientHeight || 0;
      var near = sectionRect
        ? sectionRect.bottom > -vh * 0.35 && sectionRect.top < vh * 1.35
        : true;

      if (!near) {
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

        if (Math.abs((servicesLastProgress[i] || 0) - progress) < 0.008) continue;
        servicesLastProgress[i] = progress;
        card.style.setProperty('--recede', progress.toFixed(3));
      }
    });
  }

  function refreshServicesMetrics() {
    if (reduceMotion || isServicesRecedeOff()) {
      clearServicesRecedeStyles();
      if (reduceMotion) return;
    }
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
    if (reduceMotion || !('IntersectionObserver' in window)) {
      servicePanels.forEach(function (panel) { panel.classList.add('is-shown'); });
      return;
    }

    var revealIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var panel = entry.target.classList.contains('service-panel')
          ? entry.target
          : (entry.target.closest && entry.target.closest('.service-panel'));
        if (!panel || panel.classList.contains('is-shown')) return;
        panel.classList.add('is-shown');
        revealIo.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -50% 0px' });

    servicePanels.forEach(function (panel) {
      revealIo.observe(panel.querySelector('.service-panel__card') || panel);
    });
  })();

  /* Ambient particles (GPU-friendly) */
  function initAmbientParticles(section, canvas, options) {
    options = options || {};
    if (!section || !canvas || preferLiteMotion ||
        (window.matchMedia && window.matchMedia('(max-width: 1024px)').matches)) {
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
      var desktopMin = typeof countOpts.desktopMin === 'number' ? countOpts.desktopMin : 70;
      var desktopMax = typeof countOpts.desktopMax === 'number' ? countOpts.desktopMax : 120;
      var desktopArea = typeof countOpts.desktopArea === 'number' ? countOpts.desktopArea : 12000;
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
      if (!lastFrame) lastFrame = now;
      var rawDt = now - lastFrame;
      if (rawDt < frameInterval) return;
      /* Cap dt so a long pause doesn't jump particles */
      var dt = Math.min(33, Math.max(0, rawDt));
      lastFrame = now;
      var step = dt / 16.67;

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
        p.x += p.vx * step;
        p.y += p.vy * step;
        p.tw += p.tws * step;

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
          desktopMin: 70,
          desktopMax: 120,
          desktopArea: 12000,
        },
      });
    }
  })();

  /* ---------------------------------------------------------
     Accordion
  --------------------------------------------------------- */
  (function initAccordions() {
    var roots = Array.prototype.slice.call(document.querySelectorAll('[data-accordion]'));
    if (!roots.length) return;

    roots.forEach(function (root) {
      var items = Array.prototype.slice.call(root.querySelectorAll('.accordion__item'));

      items.forEach(function (item) {
        var btn = item.querySelector('.accordion__trigger');
        var panel = item.querySelector('.accordion__panel');
        if (!btn || !panel) return;

        btn.addEventListener('click', function () {
          var willOpen = !item.classList.contains('is-open');

          items.forEach(function (other) {
            var otherBtn = other.querySelector('.accordion__trigger');
            var otherPanel = other.querySelector('.accordion__panel');
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
    });
  })();

  window.addEventListener('resize', function () {
    syncHeaderMetrics();
    refreshServicesMetrics();
  }, { passive: true });
  window.addEventListener('orientationchange', function () {
    window.setTimeout(refreshServicesMetrics, 120);
  });
  window.addEventListener('load', function () {
    syncHeaderMetrics();
  });
  syncHeaderMetrics();
  refreshServicesMetrics();
  bootHeroIntro();

  /* ---------------------------------------------------------
     Lenis smooth scroll - desktop only; loaded on demand
  --------------------------------------------------------- */
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function initLenisSmoothScroll() {
    if (!allowSmoothScroll || typeof Lenis === 'undefined' || lenis) return;

    lenis = new Lenis({
      duration: 1.1,
      smoothWheel: true,
      lerp: 0.09,
      wheelMultiplier: 1,
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
  }

  if (allowSmoothScroll) {
    loadVendor('css/vendor/lenis/lenis.css', 'js/vendor/lenis/lenis.min.js')
      .then(initLenisSmoothScroll)
      .catch(function () {});
  }

  /* ---------------------------------------------------------
     Roadmap Swiper + progress line
  --------------------------------------------------------- */
  var stepperFill = document.getElementById('glass-stepper-fill');
  var roadmapSwiperEl = document.getElementById('roadmap-swiper');
  var roadmapPinEl = document.getElementById('roadmap-pin');
  var roadmapSwiper = null;
  var roadmapTicks = [];
  var ticksRoot = document.querySelector('.glass-stepper__ticks');
  if (ticksRoot) {
    roadmapTicks = Array.prototype.slice.call(ticksRoot.querySelectorAll('.glass-stepper__tick'));
  }
  var roadmapMediaEl = document.getElementById('roadmap-media');
  var roadmapFrostNodes = [];
  var useMozRoadmapFrost = typeof CSS !== 'undefined' && CSS.supports('-moz-appearance', 'none');
  if (useMozRoadmapFrost) {
    roadmapFrostNodes = Array.prototype.slice.call(
      document.querySelectorAll('#glass-stepper .glass-stepper__frost')
    );
  }

  function syncRoadmapFrost() {
    if (!useMozRoadmapFrost || !roadmapMediaEl || !roadmapFrostNodes.length) return;
    var mediaRect = roadmapMediaEl.getBoundingClientRect();
    if (mediaRect.bottom < -80 || mediaRect.top > (window.innerHeight + 80)) return;
    for (var i = 0; i < roadmapFrostNodes.length; i++) {
      var frost = roadmapFrostNodes[i];
      var card = frost.parentElement;
      if (!card) continue;
      var cardRect = card.getBoundingClientRect();
      frost.style.setProperty('--frost-x', (mediaRect.left - cardRect.left) + 'px');
      frost.style.setProperty('--frost-y', (mediaRect.top - cardRect.top) + 'px');
      frost.style.setProperty('--frost-w', mediaRect.width + 'px');
      frost.style.setProperty('--frost-h', mediaRect.height + 'px');
    }
  }

  if (useMozRoadmapFrost) {
    syncRoadmapFrost();
    window.addEventListener('load', syncRoadmapFrost, { passive: true });
  }
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
    var fallback = getRoadmapFallbackRange();
    if (!roadmapSwiper) {
      return { start: 0, end: -fallback, range: fallback };
    }

    var swiper = roadmapSwiper;
    var startT = swiper.minTranslate();
    var endT = getRoadmapEndTranslate();
    var range = startT - endT;
    if (!(range > 8)) {
      return { start: startT, end: startT - fallback, range: fallback };
    }

    return { start: startT, end: endT, range: range };
  }

  function getRoadmapProgressFromTranslate(translate) {
    if (!roadmapSwiper) return 0;
    var bounds = getRoadmapScrollBounds();
    if (!bounds.range) return 0;
    return Math.max(0, Math.min(1, (bounds.start - translate) / bounds.range));
  }

  function syncRoadmapTicks(progress) {
    if (!roadmapTicks.length) return;
    var n = roadmapTicks.length;
    var index = Math.round(Math.max(0, Math.min(1, progress)) * (n - 1));
    for (var t = 0; t < n; t++) {
      roadmapTicks[t].classList.toggle('is-active', t === index);
      roadmapTicks[t].classList.toggle('is-passed', t < index);
    }
  }

  function setRoadmapProgressWidth(progress, scrubbing) {
    if (!stepperFill) return;
    var line = stepperFill.parentElement;
    if (line) {
      stepperFill.style.backgroundSize = line.offsetWidth + 'px 100%';
    }
    var p = Math.max(0, Math.min(1, progress));
    stepperFill.classList.toggle('is-scrubbing', !!scrubbing);
    stepperFill.style.width = (p * 100) + '%';
    syncRoadmapTicks(p);
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

  function getRoadmapFallbackRange() {
    var track = roadmapSwiperEl;
    if (!track) return 0;
    var slides = track.querySelectorAll('.swiper-slide');
    if (slides.length < 2) return 0;
    var slideW = slides[0].offsetWidth || 286;
    return (slides.length - 1) * (slideW + 24);
  }

  function applyRoadmapScrollProgress(progress, options) {
    if (!roadmapSwiper) return;

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

  function updateRoadmapPinHeight() {
    if (!roadmapPinEl) return;

    if (!isRoadmapPinEnabled()) {
      roadmapPinEl.style.height = '';
      roadmapPinEl.classList.remove('is-active');
      return;
    }

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

  function mountRoadmapSwiper() {
    if (!roadmapSwiperEl || typeof Swiper === 'undefined' || roadmapSwiper) return;

    roadmapSwiper = new Swiper('#roadmap-swiper', {
      slidesPerView: 'auto',
      spaceBetween: 24,
      grabCursor: !isRoadmapPinEnabled(),
      watchOverflow: false,
      allowTouchMove: !isRoadmapPinEnabled(),
      simulateTouch: !isRoadmapPinEnabled(),
      /* iOS Safari: default preventDefault on touchstart blocks vertical page scroll. */
      touchStartPreventDefault: false,
      touchMoveStopPropagation: false,
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
          window.setTimeout(function () {
            if (!roadmapSwiper || roadmapSwiper.destroyed) return;
            roadmapSwiper.update();
            updateRoadmapPinHeight();
            updateRoadmapFromPageScroll();
          }, 80);
          window.setTimeout(function () {
            if (!roadmapSwiper || roadmapSwiper.destroyed) return;
            roadmapSwiper.update();
            updateRoadmapPinHeight();
            updateRoadmapFromPageScroll();
          }, 360);
        },
        progress: function (swiper) {
          if (!roadmapAnim.rafId && !roadmapPinState.scrollDriving) updateRoadmapProgress(swiper);
        },
        resize: function (swiper) {
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
          syncRoadmapFrost();
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
    syncRoadmapFrost();
  }

  function scheduleRoadmapSwiper() {
    if (!roadmapSwiperEl) return;

    function loadAndMount() {
      loadVendor('css/vendor/swiper/swiper-custom.min.css', 'js/vendor/swiper/swiper-custom.min.js')
        .then(mountRoadmapSwiper)
        .catch(function () {});
    }

    var observeTarget = roadmapPinEl || roadmapSwiperEl;
    if (isIosTouch || !('IntersectionObserver' in window)) {
      loadAndMount();
      return;
    }

    var io = new IntersectionObserver(function (entries) {
      var near = entries.some(function (entry) { return entry.isIntersecting; });
      if (!near) return;
      io.disconnect();
      loadAndMount();
    }, { rootMargin: '480px 0px', threshold: 0 });
    io.observe(observeTarget);
  }

  scheduleRoadmapSwiper();
  updateRoadmapPinHeight();

  window.addEventListener('resize', function () {
    syncHeaderMetrics();
    if (roadmapSwiper) {
      updateRoadmapPinHeight();
      updateRoadmapFromPageScroll();
      roadmapAnim.targetTranslate = roadmapSwiper.getTranslate();
      updateRoadmapProgress(roadmapSwiper, { immediate: true });
    }
    syncRoadmapFrost();
  }, { passive: true });

  /* iOS Safari URL-bar show/hide: resize only. visualViewport scroll fires during
     normal page scroll on inner pages and was causing layout thrash (breadcrumbs jump). */
  if (window.visualViewport) {
    var roadmapViewportRaf = 0;
    function onVisualViewportResize() {
      if (roadmapViewportRaf) return;
      roadmapViewportRaf = window.requestAnimationFrame(function () {
        roadmapViewportRaf = 0;
        syncHeaderMetrics();
        if (!roadmapSwiper) return;
        updateRoadmapPinHeight();
        updateRoadmapFromPageScroll();
      });
    }
    window.visualViewport.addEventListener('resize', onVisualViewportResize, { passive: true });
  }

  /* ---------------------------------------------------------
     Border glow on roadmap + pricing cards (reactbits-style)
  --------------------------------------------------------- */
  function initBorderGlowCards() {
    var cards = Array.prototype.slice.call(document.querySelectorAll('.border-glow-card'));
    if (!cards.length || !window.matchMedia('(pointer: fine)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var influenceRadius = 180;
    var parents = [];
    cards.forEach(function (card) {
      var parent = card.parentElement;
      if (parent && parents.indexOf(parent) === -1) parents.push(parent);
    });
    if (!parents.length) return;

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

    parents.forEach(function (parent) {
      parent.addEventListener('pointermove', updateFromPointer);
      parent.addEventListener('pointerleave', clearGlow);
    });
  }
  initBorderGlowCards();

  /* ---------------------------------------------------------
     Smooth anchor scrolling with header offset
  --------------------------------------------------------- */
  function scrollToTarget(target) {
    var headerH = header ? header.offsetHeight : 80;
    if (lenis) {
      lenis.scrollTo(target, { offset: -headerH });
      return;
    }
    var rect = target.getBoundingClientRect();
    var top = rect.top + (window.pageYOffset || window.scrollY || 0) - headerH + 1;
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
  function setMobileMenuInert(isInert) {
    if (!mobileMenu) return;
    if (isInert) {
      mobileMenu.setAttribute('inert', '');
      mobileMenu.inert = true;
    } else {
      mobileMenu.removeAttribute('inert');
      mobileMenu.inert = false;
    }
  }
  function openMobileMenu() {
    if (!mobileMenu || !burger) return;
    if (header) header.classList.add('is-menu-open');
    syncHeaderMetrics();
    mobileMenu.classList.add('is-open');
    mobileMenu.setAttribute('aria-hidden', 'false');
    setMobileMenuInert(false);
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Закрыть меню');
    document.body.classList.add('modal-open');
    stopSmoothScroll();
    window.requestAnimationFrame(syncHeaderMetrics);
  }
  function collapseMobileAccordions() {
    if (!mobileMenu) return;
    var items = mobileMenu.querySelectorAll('.mobile-menu__item--accordion');
    Array.prototype.forEach.call(items, function (item) {
      var btn = item.querySelector('.mobile-menu__accordion-btn');
      var panel = item.querySelector('.mobile-menu__panel');
      item.classList.remove('is-open');
      if (btn) btn.setAttribute('aria-expanded', 'false');
      if (panel) {
        panel.setAttribute('aria-hidden', 'true');
      }
    });
  }
  function closeMobileMenu() {
    if (!mobileMenu || !mobileMenu.classList.contains('is-open')) return;
    mobileMenu.classList.remove('is-open');
    mobileMenu.setAttribute('aria-hidden', 'true');
    setMobileMenuInert(true);
    if (burger) {
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Открыть меню');
    }
    if (header) header.classList.remove('is-menu-open');
    document.body.classList.remove('modal-open');
    collapseMobileAccordions();
    startSmoothScroll();
    window.requestAnimationFrame(syncHeaderMetrics);
  }
  if (burger) {
    burger.addEventListener('click', function () {
      if (mobileMenu && mobileMenu.classList.contains('is-open')) closeMobileMenu();
      else openMobileMenu();
    });
  }
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
          panel.removeAttribute('inert');
          panel.inert = false;
        }
      });
    });
  })();

  /* ---------------------------------------------------------
     Reveal on scroll
  --------------------------------------------------------- */
  var revealItems = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]')).filter(function (el) {
    /* Hero intro owns these; IO must not mark them in-view early (Firefox flash) */
    if (el.closest('.hero')) return false;
    return !el.closest('[data-enter]') && !el.classList.contains('project-card') && !el.classList.contains('pricing__item');
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

  /* Pricing cards: desktop fans out from middle; mobile reveals per card in view */
  (function initPricingReveal() {
    var lists = Array.prototype.slice.call(document.querySelectorAll('.pricing__list'));
    if (!lists.length) return;
    var settleMs = 2100;
    var skipMotion = reduceMotion || !('IntersectionObserver' in window);
    var mobileMq = window.matchMedia('(max-width: 900px)');

    lists.forEach(function (list) {
      var cards = Array.prototype.slice.call(list.querySelectorAll('.pricing__item[data-reveal]'));
      if (!cards.length) return;

      function settleCard(card) {
        window.setTimeout(function () {
          card.classList.add('is-settled');
        }, settleMs);
      }

      function showCard(card) {
        if (card.classList.contains('in-view')) return;
        card.classList.add('in-view');
        settleCard(card);
      }

      if (skipMotion) {
        cards.forEach(function (card) {
          card.classList.add('in-view');
          card.classList.add('is-settled');
        });
        return;
      }

      var activeObserver = null;

      function observeDesktop() {
        var groupObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            cards.forEach(showCard);
            groupObserver.disconnect();
          });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        groupObserver.observe(list);
        return groupObserver;
      }

      function observeMobile() {
        var cardObserver = new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            showCard(entry.target);
            cardObserver.unobserve(entry.target);
          });
        }, { threshold: 0.2, rootMargin: '0px 0px -8% 0px' });
        cards.forEach(function (card) {
          if (!card.classList.contains('in-view')) cardObserver.observe(card);
        });
        return cardObserver;
      }

      function bind() {
        if (activeObserver) {
          activeObserver.disconnect();
          activeObserver = null;
        }
        var pending = cards.some(function (card) { return !card.classList.contains('in-view'); });
        if (!pending) return;
        if (mobileMq.matches) activeObserver = observeMobile();
        else activeObserver = observeDesktop();
      }

      bind();
      if (typeof mobileMq.addEventListener === 'function') {
        mobileMq.addEventListener('change', bind);
      } else if (typeof mobileMq.addListener === 'function') {
        mobileMq.addListener(bind);
      }
    });
  })();

  /* Portfolio: desktop L→R per row in view; mobile one-by-one */
  (function initPortfolioReveal() {
    var grid = document.querySelector('.portfolio__grid');
    if (!grid) return;
    var cards = Array.prototype.slice.call(grid.querySelectorAll('.project-card[data-reveal]'));
    if (!cards.length) return;

    if (reduceMotion || !('IntersectionObserver' in window)) {
      cards.forEach(function (card) { card.classList.add('in-view'); });
      return;
    }

    var mqDesktop = window.matchMedia('(min-width: 721px)');
    var state = { observer: null };

    function clearDelays() {
      cards.forEach(function (card) { card.removeAttribute('data-reveal-delay'); });
    }

    function clearObserver() {
      if (state.observer) {
        state.observer.disconnect();
        state.observer = null;
      }
    }

    function revealPair(leftIndex) {
      var left = cards[leftIndex];
      var right = cards[leftIndex + 1];
      if (!left || left.classList.contains('in-view')) return;

      left.removeAttribute('data-reveal-delay');
      left.classList.add('in-view');

      if (right && !right.classList.contains('in-view')) {
        right.setAttribute('data-reveal-delay', '1');
        right.classList.add('in-view');
      }
    }

    function bindDesktop() {
      clearObserver();
      clearDelays();

      state.observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var index = cards.indexOf(entry.target);
          if (index === -1) return;

          if (index % 2 === 0) {
            revealPair(index);
          } else if (!cards[index - 1].classList.contains('in-view')) {
            revealPair(index - 1);
          } else if (!entry.target.classList.contains('in-view')) {
            entry.target.removeAttribute('data-reveal-delay');
            entry.target.classList.add('in-view');
          }

          state.observer.unobserve(entry.target);
        });
      }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });

      cards.forEach(function (card) {
        if (!card.classList.contains('in-view')) state.observer.observe(card);
      });
    }

    function bindMobile() {
      clearObserver();
      clearDelays();

      state.observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in-view');
          state.observer.unobserve(entry.target);
        });
      }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });

      cards.forEach(function (card) {
        if (!card.classList.contains('in-view')) state.observer.observe(card);
      });
    }

    function applyMode() {
      clearObserver();
      clearDelays();
      cards.forEach(function (card) { card.classList.remove('in-view'); });
      if (mqDesktop.matches) bindDesktop();
      else bindMobile();
    }

    applyMode();
    if (typeof mqDesktop.addEventListener === 'function') {
      mqDesktop.addEventListener('change', applyMode);
    } else if (typeof mqDesktop.addListener === 'function') {
      mqDesktop.addListener(applyMode);
    }
  })();

  var collageItems = Array.prototype.slice.call(document.querySelectorAll('.about__collage .collage__item'));
  if (collageItems.length) {
    collageItems.forEach(function (item, i) {
      item.style.setProperty('--stagger-i', String(i));
    });
    if (preferLiteMotion || !('IntersectionObserver' in window)) {
      collageItems.forEach(function (item) { item.classList.add('in-view'); });
    } else {
      var collageObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in-view');
          collageObserver.unobserve(entry.target);
        });
      }, { threshold: 0.16, rootMargin: '0px 0px -6% 0px' });
      collageItems.forEach(function (item) { collageObserver.observe(item); });
    }
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
      input.setAttribute('aria-invalid', 'true');
      field.classList.remove('is-shaking');
      void field.offsetWidth;
      field.classList.add('is-shaking');
    } else {
      input.removeAttribute('aria-invalid');
    }
    return !message;
  }

  function validateConsent(checkbox, errorEl) {
    var valid = checkbox.checked;
    if (errorEl) errorEl.textContent = valid ? '' : 'Необходимо согласие на обработку персональных данных';
    if (valid) {
      checkbox.removeAttribute('aria-invalid');
    } else {
      checkbox.setAttribute('aria-invalid', 'true');
    }
    return valid;
  }

  function setupForm(formId, successId) {
    var form = document.getElementById(formId);
    if (!form) return;
    var success = document.getElementById(successId);
    var submitBtn = form.querySelector('button[type="submit"]');
    var consentInput = form.querySelector('input[name="consent"]');
    var consentError = form.querySelector('.field__error--consent');

    Array.prototype.slice.call(form.querySelectorAll('.checkbox__text a')).forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.stopPropagation();
      });
    });

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

      if (!validity) {
        var firstInvalid = form.querySelector('[aria-invalid="true"]');
        if (firstInvalid) firstInvalid.focus();
        return;
      }

      submitBtn.classList.add('is-loading');
      submitBtn.disabled = true;
      submitBtn.setAttribute('aria-busy', 'true');

      // NOTE: backend integration point.
      // Replace this timeout with a real fetch()/XHR call to your endpoint, e.g.:
      // fetch('/api/lead', { method: 'POST', body: new FormData(form) })
      window.setTimeout(function () {
        submitBtn.classList.remove('is-loading');
        submitBtn.disabled = false;
        submitBtn.removeAttribute('aria-busy');
        if (success) success.hidden = false;
        form.classList.add('is-success');
        form.reset();
        Array.prototype.slice.call(form.querySelectorAll('[aria-invalid]')).forEach(function (el) {
          el.removeAttribute('aria-invalid');
        });

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

  function isCoarsePointer() {
    return window.matchMedia('(hover: none), (pointer: coarse)').matches;
  }
  function setQuickModalInert(isInert) {
    if (!quickModal) return;
    if (isInert) quickModal.setAttribute('inert', '');
    else quickModal.removeAttribute('inert');
  }

  function openQuickModal() {
    if (!quickModal) return;
    lastFocusedEl = document.activeElement;
    setQuickModalInert(false);
    quickModal.classList.add('is-open');
    quickModal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    stopSmoothScroll();
    if (isCoarsePointer()) return;
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
    setQuickModalInert(true);
    document.body.classList.remove('modal-open');
    startSmoothScroll();
    if (lastFocusedEl && !isCoarsePointer()) lastFocusedEl.focus();
  }
  if (quickModal) setQuickModalInert(true);
  if (quickCta) quickCta.addEventListener('click', openQuickModal);
  Array.prototype.slice.call(document.querySelectorAll('[data-open-modal]')).forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      openQuickModal();
    });
  });
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

  var lightboxPhoto     = document.getElementById('lightbox-photo');
  var lightboxStage     = lightbox ? lightbox.querySelector('.lightbox__stage') : null;

  var galleryState = { project: null, sources: null, count: 0, index: 0, title: '', desc: '' };
  var lastLightboxFocusedEl = null;
  var lightboxSwipeUsed = false;

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
    // Optimized WebP galleries: projects 1-6 (fallback via onerror)
    if (supportsWebp() && (p === '1' || p === '2' || p === '3' || p === '4' || p === '5' || p === '6')) return base + '.webp';
    return base + '.jpg';
  }

  function currentLightboxItem() {
    if (galleryState.sources && galleryState.sources[galleryState.index]) {
      return galleryState.sources[galleryState.index];
    }
    return null;
  }

  function setLightboxPageInert(on) {
    Array.prototype.forEach.call(document.body.children, function (el) {
      if (el === lightbox || el.tagName === 'SCRIPT' || el.tagName === 'SVG') return;
      if (on) el.setAttribute('inert', '');
      else el.removeAttribute('inert');
    });
  }

  function syncLightboxChrome() {
    var many = galleryState.count > 1;
    if (lightboxPrev) {
      lightboxPrev.hidden = !many;
      lightboxPrev.disabled = !many;
    }
    if (lightboxNext) {
      lightboxNext.hidden = !many;
      lightboxNext.disabled = !many;
    }
    if (lightboxPhoto) {
      lightboxPhoto.disabled = !many;
      lightboxPhoto.setAttribute('aria-label', many ? 'Следующее фото' : 'Фото');
    }
  }

  function renderLightboxImage() {
    if (!lightboxImg) return;
    lightboxImg.classList.remove('is-loaded');
    var item = currentLightboxItem();
    var src = item ? item.src : imgPath(galleryState.project, galleryState.index);
    var title = item ? item.title : galleryState.title;
    var desc = item ? item.desc : galleryState.desc;
    var alt = item ? (item.alt || title) : (title + ' - фото ' + (galleryState.index + 1));
    var fallback = src.replace(/\.webp$/i, '.jpg');
    var tempImg = new Image();
    tempImg.onload = function () {
      lightboxImg.src = tempImg.src;
      lightboxImg.alt = alt;
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
      lightboxImg.alt = (title || 'Фото') + ' - фото недоступно';
    };
    tempImg.src = src;

    if (lightboxTitle) lightboxTitle.textContent = title || '';
    if (lightboxDesc) {
      lightboxDesc.textContent = desc || '';
      lightboxDesc.hidden = !desc;
    }
    if (lightboxCurrent) lightboxCurrent.textContent = galleryState.index + 1;
    if (lightboxTotal) lightboxTotal.textContent = galleryState.count;
    if (lightbox) {
      if (title) {
        lightbox.setAttribute('aria-labelledby', 'lightbox-title');
        lightbox.removeAttribute('aria-label');
      } else {
        lightbox.setAttribute('aria-label', 'Галерея проекта');
        lightbox.removeAttribute('aria-labelledby');
      }
    }
    syncLightboxChrome();
  }

  function showLightbox() {
    if (!lightbox) return;
    renderLightboxImage();
    lastLightboxFocusedEl = document.activeElement;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    setLightboxPageInert(true);
    stopSmoothScroll();
    window.setTimeout(function () {
      var focusables = getFocusableElements(lightbox);
      var target = lightboxCloseBtn || (focusables.length ? focusables[0] : null);
      if (target) target.focus();
    }, 200);
  }

  function openLightbox(project, count, title, desc, startIndex) {
    galleryState = {
      project: project,
      sources: null,
      count: count,
      index: startIndex || 0,
      title: title,
      desc: desc
    };
    showLightbox();
  }

  function openSourcesLightbox(sources, startIndex) {
    if (!sources || !sources.length) return;
    galleryState = {
      project: null,
      sources: sources,
      count: sources.length,
      index: startIndex || 0,
      title: '',
      desc: ''
    };
    showLightbox();
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-open');
    setLightboxPageInert(false);
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

  function bindLightboxGroup(nodes, mapSource, options) {
    var list = Array.prototype.slice.call(nodes);
    if (!list.length || !lightbox) return;
    var sources = list.map(mapSource);
    list.forEach(function (node, index) {
      var trigger = options && options.trigger ? options.trigger(node) : node;
      if (!trigger) return;
      function open() { openSourcesLightbox(sources, index); }
      trigger.addEventListener('click', open);
      if (options && options.asButton) {
        trigger.setAttribute('role', 'button');
        trigger.setAttribute('tabindex', '0');
        trigger.setAttribute('aria-label', 'Открыть фото ' + (index + 1));
        trigger.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            open();
          }
        });
      }
    });
  }

  bindLightboxGroup(document.querySelectorAll('.collage__hit[data-full]'), function (btn) {
    var title = btn.getAttribute('data-caption') || '';
    return {
      src: btn.getAttribute('data-full'),
      alt: title,
      title: title,
      desc: ''
    };
  });

  bindLightboxGroup(document.querySelectorAll('.project-gallery__item img'), function (img) {
    var alt = img.getAttribute('alt') || '';
    return {
      src: img.currentSrc || img.getAttribute('src'),
      alt: alt,
      title: alt,
      desc: ''
    };
  }, {
    asButton: true,
    trigger: function (img) {
      return img.closest('.project-gallery__item') || img.parentElement;
    }
  });

    if (lightboxNext) lightboxNext.addEventListener('click', showNext);
  if (lightboxPrev) lightboxPrev.addEventListener('click', showPrev);
  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (lightboxPhoto) {
    lightboxPhoto.addEventListener('click', function () {
      if (lightboxSwipeUsed) {
        lightboxSwipeUsed = false;
        return;
      }
      if (galleryState.count > 1) showNext();
    });
  }
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
        lightboxSwipeUsed = true;
        if (delta < 0) showNext(); else showPrev();
      }
    }, { passive: true });
  })();

})();
