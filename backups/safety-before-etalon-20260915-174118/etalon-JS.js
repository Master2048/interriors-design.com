(function() {
    "use strict";
    var P = document.getElementById("header")
      , z = document.getElementById("burger")
      , _ = document.getElementById("mobile-menu")
      , Ie = document.getElementById("to-top")
      , qe = document.getElementById("quick-cta")
      , W = document.getElementById("preloader")
      , F = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches
      , Tt = window.matchMedia && window.matchMedia("(pointer: coarse)").matches
      , Pt = window.matchMedia && window.matchMedia("(max-width: 1024px)").matches
      , cr = !!(navigator.connection && navigator.connection.saveData)
      , ur = navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4 || cr
      , ue = F || Tt || Pt || ur
      , x = null
      , _e = {}
      , Re = {};
    ue && document.documentElement.classList.add("is-lite-motion");
    function dr(e) {
        return Re[e] || (Re[e] = new Promise(function(t, a) {
            var n = document.querySelector('link[data-dynamic-href="' + e + '"]');
            if (n) {
                if (n.getAttribute("data-loaded") === "1") {
                    t();
                    return
                }
                n.addEventListener("load", function() {
                    t()
                }),
                n.addEventListener("error", function() {
                    a(new Error("Failed to load " + e))
                });
                return
            }
            var r = document.createElement("link");
            r.rel = "stylesheet",
            r.href = e,
            r.setAttribute("data-dynamic-href", e),
            r.onload = function() {
                r.setAttribute("data-loaded", "1"),
                t()
            }
            ,
            r.onerror = function() {
                a(new Error("Failed to load " + e))
            }
            ,
            document.head.appendChild(r)
        }
        )),
        Re[e]
    }
    function fr(e) {
        return _e[e] || (_e[e] = new Promise(function(t, a) {
            var n = document.querySelector('script[data-dynamic-src="' + e + '"]');
            if (n) {
                if (n.getAttribute("data-loaded") === "1") {
                    t();
                    return
                }
                n.addEventListener("load", function() {
                    t()
                }),
                n.addEventListener("error", function() {
                    a(new Error("Failed to load " + e))
                });
                return
            }
            var r = document.createElement("script");
            r.src = e,
            r.async = !0,
            r.setAttribute("data-dynamic-src", e),
            r.onload = function() {
                r.setAttribute("data-loaded", "1"),
                t()
            }
            ,
            r.onerror = function() {
                a(new Error("Failed to load " + e))
            }
            ,
            document.head.appendChild(r)
        }
        )),
        _e[e]
    }
    function It(e, t) {
        return Promise.all([dr(e), fr(t)])
    }
    function Ve() {
        x && x.stop()
    }
    function Ne() {
        x && x.start()
    }
    function Ge() {
        W && (W.classList.add("is-hidden"),
        window.setTimeout(function() {
            W && W.parentNode && W.parentNode.removeChild(W)
        }, 600))
    }
    window.setTimeout(Ge, 4e3);
    function vr() {
        var e = document.querySelector(".hero__title");
        if (!(!e || e.dataset.splitDone === "1")) {
            var t = e.innerHTML.split(/<br\s*\/?>/gi);
            e.innerHTML = "",
            e.dataset.splitDone = "1",
            e.classList.add("split-text");
            var a = 0;
            t.forEach(function(n) {
                var r = n.replace(/<[^>]*>/g, "").trim();
                if (r) {
                    var i = document.createElement("span");
                    i.className = "split-line",
                    r.split(/\s+/).forEach(function(c, u, d) {
                        var l = document.createElement("span");
                        l.className = "split-word-mask";
                        var p = document.createElement("span");
                        p.className = "split-word",
                        p.style.setProperty("--word-i", String(a)),
                        p.textContent = c + (u < d.length - 1 ? "\xA0" : ""),
                        l.appendChild(p),
                        i.appendChild(l),
                        a += 1
                    }),
                    e.appendChild(i)
                }
            }),
            e.setAttribute("aria-label", e.textContent.replace(/\s+/g, " ").trim())
        }
    }
    function qt() {
        Array.prototype.slice.call(document.querySelectorAll(".collage__item")).forEach(function(e, t) {
            e.style.setProperty("--stagger-i", String(t))
        })
    }
    function Ke(e, t, a) {
        e && (e.style.opacity = String(t),
        e.style.transform = a != null ? "translateY(" + a + "px)" : "")
    }
    function mr(e) {
        e && (e.style.opacity = "",
        e.style.transform = "")
    }
    function pr(e) {
        e && (e.getAnimations && e.getAnimations().forEach(function(t) {
            t.cancel()
        }),
        mr(e))
    }
    function hr(e) {
        e && e.getAnimations && e.getAnimations().forEach(function(t) {
            try {
                typeof t.commitStyles == "function" && t.commitStyles()
            } catch (a) {}
        })
    }
    function gr(e, t) {
        e && (e.style.transform = "translateY(" + t + "px)")
    }
    function G(e, t, a) {
        if (!e)
            return Promise.resolve();
        var n = e.animate(t, a);
        return n.finished.catch(function() {})
    }
    function yr() {
        if (F) {
            document.body.classList.add("is-intro-done"),
            Array.prototype.slice.call(document.querySelectorAll("[data-reveal]")).forEach(function(w) {
                w.classList.add("in-view")
            }),
            ee(),
            ve(),
            window.setTimeout(Ge, 100);
            return
        }
        document.body.classList.add("hero-intro-pending"),
        vr();
        var e = P ? P.querySelector(".header__pill") : null
          , t = P ? P.querySelector(".header__inner") : null
          , a = document.querySelector(".hero__content .eyebrow")
          , n = document.querySelector(".hero__title")
          , r = n ? Array.prototype.slice.call(n.querySelectorAll(".split-word")) : []
          , i = document.querySelector(".hero__subtitle")
          , c = document.querySelector(".hero__actions")
          , u = document.querySelector(".hero__pills")
          , d = Array.prototype.slice.call(document.querySelectorAll(".hero__pills .pill"))
          , l = document.querySelector(".hero__scroll")
          , p = document.querySelector(".preloader__mark")
          , f = "cubic-bezier(0.22, 1, 0.36, 1)"
          , y = "cubic-bezier(0.45, 0, 0.55, 1)";
        gr(e, -20),
        t && (t.style.opacity = "0"),
        Ke(a, 0, 16),
        l && (l.style.opacity = "0"),
        [i, c, u].forEach(function(w) {
            Ke(w, 0, 40)
        }),
        d.forEach(function(w) {
            Ke(w, 0, 20)
        }),
        n && (n.style.opacity = "1",
        n.classList.add("in-view")),
        r.forEach(function(w) {
            w.style.transform = "translateY(105%)"
        }),
        W && W.classList.add("is-animating");
        var o = []
          , m = !1
          , g = {
            header: 940,
            eyebrow: 1150,
            title: 1280,
            subtitle: 1720,
            actions: 1820,
            pillsWrap: 1920,
            pills: 2020,
            scroll: 2360,
            done: 2900
        };
        p && W && (o.push(G(p, [{
            transform: "scale(0.4) rotate(-12deg)",
            opacity: 0
        }, {
            transform: "scale(1) rotate(0deg)",
            opacity: 1
        }], {
            duration: 650,
            delay: 0,
            fill: "forwards",
            easing: f
        })),
        o.push(G(W, [{
            opacity: 1
        }, {
            opacity: 0
        }], {
            duration: 400,
            delay: 900,
            fill: "forwards",
            easing: y
        }))),
        o.push(G(e, [{
            transform: "translateY(-20px)"
        }, {
            transform: "translateY(0)"
        }], {
            duration: 600,
            delay: g.header,
            fill: "forwards",
            easing: f
        })),
        o.push(G(t, [{
            opacity: 0
        }, {
            opacity: 1
        }], {
            duration: 600,
            delay: g.header,
            fill: "forwards",
            easing: f
        })),
        o.push(G(a, [{
            opacity: 0,
            transform: "translateY(16px)"
        }, {
            opacity: 1,
            transform: "translateY(0)"
        }], {
            duration: 650,
            delay: g.eyebrow,
            fill: "forwards",
            easing: f
        })),
        r.forEach(function(w, A) {
            o.push(G(w, [{
                transform: "translateY(105%)"
            }, {
                transform: "translateY(0)"
            }], {
                duration: 950,
                delay: g.title + A * 50,
                fill: "forwards",
                easing: f
            }))
        }),
        [i, c, u].forEach(function(w, A) {
            o.push(G(w, [{
                opacity: 0,
                transform: "translateY(40px)"
            }, {
                opacity: 1,
                transform: "translateY(0)"
            }], {
                duration: 850,
                delay: g.subtitle + A * 100,
                fill: "forwards",
                easing: f
            }))
        }),
        d.forEach(function(w, A) {
            o.push(G(w, [{
                opacity: 0,
                transform: "translateY(20px)"
            }, {
                opacity: 1,
                transform: "translateY(0)"
            }], {
                duration: 500,
                delay: g.pills + A * 80,
                fill: "forwards",
                easing: f
            }))
        }),
        o.push(G(l, [{
            opacity: 0
        }, {
            opacity: 1
        }], {
            duration: 450,
            delay: g.scroll,
            fill: "forwards",
            easing: f
        }));
        function s() {
            if (!m) {
                m = !0;
                var w = [e, t, a, l, i, c, u].concat(d).concat(r);
                w.forEach(hr),
                Array.prototype.slice.call(document.querySelectorAll(".hero__content [data-reveal]")).forEach(function(A) {
                    A.classList.add("in-view")
                }),
                c && c.classList.add("in-view"),
                u && u.classList.add("in-view"),
                document.body.classList.remove("hero-intro-pending"),
                document.body.classList.add("is-intro-done"),
                document.body.offsetWidth,
                w.forEach(pr),
                l && (l.style.opacity = "",
                l.style.transform = "",
                l.style.animation = "none",
                l.offsetWidth,
                l.style.animation = ""),
                W && W.classList.remove("is-animating"),
                Ge(),
                ke = de() > 40,
                P && P.classList.toggle("is-scrolled", ke),
                ee(),
                ve()
            }
        }
        Promise.all(o).then(s),
        window.setTimeout(s, g.done)
    }
    function wr() {
        var e = function() {
            yr()
        };
        document.fonts && document.fonts.ready ? Promise.race([document.fonts.ready, new Promise(function(t) {
            window.setTimeout(t, 250)
        }
        )]).then(e) : e()
    }
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", function() {
        qt()
    }) : qt();
    var L = document.querySelector(".hero__video")
      , $ = document.getElementById("hero-video-toggle");
    if (L && !F) {
        let e = function() {
            if ($) {
                var i = !L.paused;
                $.hidden = !1,
                $.setAttribute("aria-pressed", i ? "true" : "false"),
                $.setAttribute("aria-label", i ? "\u041E\u0441\u0442\u0430\u043D\u043E\u0432\u0438\u0442\u044C \u0432\u0438\u0434\u0435\u043E" : "\u0412\u043A\u043B\u044E\u0447\u0438\u0442\u044C \u0432\u0438\u0434\u0435\u043E");
                var c = $.querySelector(".hero__media-toggle-pause")
                  , u = $.querySelector(".hero__media-toggle-play");
                c && (c.hidden = !i),
                u && (u.hidden = i)
            }
        }
          , t = function() {
            Qe || L.paused || (Qe = !0,
            L.classList.add("is-playing"),
            e())
        }
          , a = function() {
            Qe || L.paused || (typeof L.requestVideoFrameCallback == "function" ? L.requestVideoFrameCallback(function() {
                t()
            }) : window.requestAnimationFrame(function() {
                window.requestAnimationFrame(t)
            }))
        }
          , n = function() {
            L.muted = !0,
            L.defaultMuted = !0,
            L.playsInline = !0;
            var i = L.play();
            i && typeof i.then == "function" ? i.then(a).catch(function() {}) : L.paused || a()
        }
          , r = function() {
            _t || (_t = !0,
            L.addEventListener("playing", a),
            L.readyState >= 2 || (L.addEventListener("canplay", n, {
                once: !0
            }),
            L.addEventListener("loadeddata", n, {
                once: !0
            })),
            n())
        };
        var _t = !1
          , Qe = !1;
        if ("IntersectionObserver" in window) {
            var Rt = new IntersectionObserver(function(i) {
                i.forEach(function(c) {
                    c.isIntersecting && (r(),
                    Rt.disconnect())
                })
            }
            ,{
                rootMargin: "80px 0px",
                threshold: .01
            });
            Rt.observe(L)
        } else
            r();
        $ && $.addEventListener("click", function() {
            if (L.paused) {
                var i = L.play();
                i && typeof i.then == "function" && i.then(function() {
                    L.classList.add("is-playing"),
                    e()
                }).catch(function() {})
            } else {
                try {
                    L.pause()
                } catch (c) {}
                e()
            }
        })
    }
    (function() {
        var t = Array.prototype.slice.call(document.querySelectorAll(".js-viz-video"));
        if (!t.length)
            return;
        if (F) {
            t.forEach(function(i) {
                i.removeAttribute("autoplay");
                try {
                    i.pause()
                } catch (c) {}
            });
            return
        }
        function a(i) {
            if (i.readyState < 2)
                try {
                    i.load()
                } catch (u) {}
            var c = i.play();
            c && c.catch && c.catch(function() {})
        }
        function n(i) {
            try {
                i.pause()
            } catch (c) {}
        }
        if ("IntersectionObserver" in window) {
            var r = new IntersectionObserver(function(i) {
                i.forEach(function(c) {
                    var u = c.target;
                    c.isIntersecting && !document.hidden ? a(u) : n(u)
                })
            }
            ,{
                rootMargin: "60px 0px",
                threshold: .2
            });
            t.forEach(function(i) {
                r.observe(i)
            })
        } else
            t.forEach(a);
        document.addEventListener("visibilitychange", function() {
            if (document.hidden) {
                t.forEach(n);
                return
            }
            t.forEach(function(i) {
                var c = i.getBoundingClientRect();
                c.bottom > 0 && c.top < window.innerHeight && a(i)
            })
        })
    }
    )();
    var $e = Array.prototype.slice.call(document.querySelectorAll("main section[id]"))
      , br = Array.prototype.slice.call(document.querySelectorAll(".nav__link"))
      , ke = !1;
    function ee() {
        if (P) {
            var e = Math.round(P.getBoundingClientRect().height);
            e && (document.documentElement.style.setProperty("--header-h", e + "px"),
            document.documentElement.style.setProperty("--roadmap-pin-top", e + "px"),
            document.documentElement.style.setProperty("--services-sticky-top", e + 16 + "px"))
        }
    }
    function xr() {
        return (P ? P.offsetHeight : 84) + 56
    }
    function de() {
        return x && typeof x.scroll == "number" ? x.scroll : window.scrollY || window.pageYOffset || 0
    }
    var fe = document.getElementById("contacts")
      , Ce = fe && fe.querySelector(".contacts__bg-media")
      , Fe = !1
      , kt = "";
    function Lr() {
        if (!(!fe || !Ce || F) && !document.hidden) {
            var e = fe.getBoundingClientRect()
              , t = window.innerHeight || 1
              , a = e.bottom > -80 && e.top < t + 80;
            if (!a) {
                Fe && (Fe = !1,
                Ce.classList.remove("is-parallaxing"));
                return
            }
            Fe || (Fe = !0,
            Ce.classList.add("is-parallaxing"));
            var n = t + e.height
              , r = n ? (t - e.top) / n : .5;
            r = Math.max(0, Math.min(1, r));
            var i = ue ? 12 : 20
              , c = ((.5 - r) * i).toFixed(2) + "%";
            c !== kt && (kt = c,
            Ce.style.setProperty("--contacts-shift", c)),
            ue || fe.style.setProperty("--contacts-veil", (.18 + r * .55).toFixed(3))
        }
    }
    var Ze = 0;
    function ve() {
        Ze || (Ze = window.requestAnimationFrame(function() {
            Ze = 0,
            Er()
        }))
    }
    function Er() {
        var e = de();
        if (P) {
            var t = e > 40;
            t !== ke && (ke = t,
            P.classList.toggle("is-scrolled", t),
            window.requestAnimationFrame(ee))
        }
        var a = e > 480;
        Ie && Ie.classList.toggle("is-visible", a),
        qe && qe.classList.toggle("is-visible", a);
        for (var n = xr(), r = null, i = 0; i < $e.length; i++) {
            var c = $e[i].getBoundingClientRect();
            if (c.top <= n && c.bottom > n) {
                r = $e[i].id;
                break
            }
        }
        if (br.forEach(function(p) {
            var f = r && p.getAttribute("href") === "#" + r;
            p.classList.toggle("is-active", !!f)
        }),
        v && He(),
        L && L.classList.contains("is-playing") && !F && !ue) {
            var u = document.querySelector(".hero");
            if (u) {
                var d = u.offsetHeight || 1
                  , l = Math.max(0, Math.min(1, e / d));
                l < 1 ? (L.classList.add("is-parallaxing"),
                L.style.transform = "translate3d(0," + l * 14 + "%,0) scale(" + (1 + l * .04) + ")") : (L.classList.remove("is-parallaxing"),
                L.style.transform = "")
            }
        } else
            L && (L.classList.remove("is-parallaxing"),
            L.style.transform = "");
        Lr(),
        Dt()
    }
    var H = Array.prototype.slice.call(document.querySelectorAll(".service-panel"))
      , Je = H.map(function(e) {
        return e.querySelector(".service-panel__card")
    })
      , Ct = document.querySelector(".services-stack")
      , Ft = document.querySelector("[data-services-fill]")
      , Bt = document.querySelector("[data-services-current]")
      , Yt = document.querySelector("[data-services-total]")
      , Ot = document.getElementById("services")
      , et = !1
      , tt = []
      , rt = -1
      , at = -1
      , me = []
      , Be = !1;
    function Ht(e) {
        return e < 10 ? "0" + e : String(e)
    }
    Yt && H.length && (Yt.textContent = Ht(H.length));
    function Sr() {
        return de()
    }
    function Xt() {
        return (P ? P.getBoundingClientRect().height : 84) + 16
    }
    function nt() {
        if (!Ct || !H.length) {
            me = [],
            Be = !1;
            return
        }
        for (var e = Xt(), t = 0, a = Ct; a; )
            t += a.offsetTop,
            a = a.offsetParent;
        var n = [], r = t, i;
        for (i = 0; i < H.length; i++)
            n.push(Math.max(0, Math.round(r - e))),
            r += Math.max(1, H[i].offsetHeight);
        me = n,
        Be = n.length > 0 && n[n.length - 1] > n[0]
    }
    function it(e, t) {
        (!(e >= 0) || e !== e) && (e = 0),
        e > 1 && (e = 1),
        Ft && Math.abs(e - at) > 1e-4 && (at = e,
        Ft.style.setProperty("--services-progress", e.toFixed(4))),
        Bt && t !== rt && (rt = t,
        Bt.textContent = Ht(t + 1))
    }
    function Ar() {
        var e = H.length;
        if (e && (Be || nt(),
        !!Be)) {
            var t = Sr()
              , a = me[0]
              , n = me[e - 1]
              , r = Math.max(1, n - a)
              , i = (t - a) / r;
            i < 0 ? i = 0 : i > 1 && (i = 1);
            var c = 0, u;
            for (u = 0; u < e; u++)
                t >= me[u] - .5 && (c = u);
            it(i, c)
        }
    }
    function Mr() {
        var e, t;
        for (e = 0; e < Je.length; e++)
            t = Je[e],
            t && (tt[e] = 0,
            t.style.removeProperty("--recede"))
    }
    function Dt() {
        !H.length || F || et || (et = !0,
        window.requestAnimationFrame(function() {
            if (et = !1,
            !F) {
                var e = Ot ? Ot.getBoundingClientRect() : null
                  , t = window.innerHeight || document.documentElement.clientHeight || 0
                  , a = e ? e.bottom > -t * .35 && e.top < t * 1.35 : !0;
                if (!a) {
                    e && (e.top >= t * .98 ? it(0, 0) : e.bottom <= t * .02 && it(1, Math.max(0, H.length - 1)));
                    return
                }
                Ar();
                var n, r, i = H.length, c = Xt(), u, d, l, p = new Array(i);
                for (n = 0; n < i; n++)
                    p[n] = H[n].getBoundingClientRect().top;
                for (n = 0; n < i; n++)
                    r = Je[n],
                    r && (i < 2 || n === i - 1 ? l = 0 : (u = p[n + 1],
                    d = Math.max(1, r.offsetHeight * .9),
                    l = 1 - (u - c) / d,
                    l < 0 ? l = 0 : l > 1 && (l = 1),
                    l = l * l * (3 - 2 * l)),
                    !(Math.abs((tt[n] || 0) - l) < .008) && (tt[n] = l,
                    r.style.setProperty("--recede", l.toFixed(3))))
            }
        }))
    }
    function pe() {
        if (F) {
            Mr();
            return
        }
        nt(),
        at = -1,
        rt = -1,
        Dt()
    }
    window.addEventListener("pageshow", pe),
    window.addEventListener("load", function() {
        window.setTimeout(pe, 0),
        window.setTimeout(pe, 250)
    }),
    (function() {
        if (H.length) {
            if (F) {
                H.forEach(function(a) {
                    a.classList.add("is-shown")
                });
                return
            }
            if (!("IntersectionObserver" in window)) {
                H.forEach(function(a) {
                    a.classList.add("is-shown")
                });
                return
            }
            var t = new IntersectionObserver(function(a) {
                a.forEach(function(n) {
                    n.isIntersecting && (n.target.classList.add("is-shown"),
                    t.unobserve(n.target))
                })
            }
            ,{
                threshold: .28,
                rootMargin: "0px 0px -8% 0px"
            });
            H.forEach(function(a) {
                t.observe(a)
            })
        }
    }
    )();
    function Tr(e, t, a) {
        if (a = a || {},
        !e || !t || ue) {
            t && (t.style.display = "none");
            return
        }
        var n = !1;
        function r() {
            n = !0,
            t && (t.style.display = "none"),
            Se()
        }
        navigator.getBattery && navigator.getBattery().then(function(h) {
            function S() {
                !h.charging && h.level < .2 && r()
            }
            S(),
            h.addEventListener && (h.addEventListener("levelchange", S),
            h.addEventListener("chargingchange", S))
        }).catch(function() {});
        var i = t.getContext("2d", {
            alpha: !0,
            desynchronized: !0
        });
        if (!i)
            return;
        var c = a.count || {}
          , u = a.mouseParallax === !0
          , d = typeof a.parallaxStrength == "number" ? a.parallaxStrength : 32
          , l = {
            tx: 0,
            ty: 0,
            px: 0,
            py: 0,
            active: !1,
            rectLeft: 0,
            rectTop: 0,
            rectW: 1,
            rectH: 1
        }
          , p = []
          , f = 0
          , y = !1
          , o = 0
          , m = 0
          , g = 0
          , s = 1e3 / 30
          , w = .7
          , A = []
          , E = [3, 5, 7, 10]
          , X = !0
          , k = 0;
        function Q() {
            var h = e.getBoundingClientRect();
            l.rectLeft = h.left,
            l.rectTop = h.top,
            l.rectW = h.width || 1,
            l.rectH = h.height || 1,
            X = !1
        }
        function J() {
            X = !0,
            !k && (k = window.requestAnimationFrame(function() {
                k = 0,
                X && Q()
            }))
        }
        function bt() {
            A = E.map(function(h) {
                var S = document.createElement("canvas")
                  , C = 2;
                S.width = h + C * 2,
                S.height = h + C * 2;
                var I = S.getContext("2d");
                if (!I)
                    return S;
                var U = I.createRadialGradient(h / 2 + C, h / 2 + C, 0, h / 2 + C, h / 2 + C, h / 2);
                return U.addColorStop(0, "rgba(242, 149, 63, 1)"),
                U.addColorStop(.45, "rgba(217, 108, 31, 0.85)"),
                U.addColorStop(1, "rgba(179, 85, 26, 0)"),
                I.fillStyle = U,
                I.beginPath(),
                I.arc(h / 2 + C, h / 2 + C, h / 2, 0, Math.PI * 2),
                I.fill(),
                S
            })
        }
        function xt() {
            var h = o * m
              , S = typeof c.desktopMin == "number" ? c.desktopMin : 70
              , C = typeof c.desktopMax == "number" ? c.desktopMax : 120
              , I = typeof c.desktopArea == "number" ? c.desktopArea : 12e3;
            return Math.max(S, Math.min(C, Math.round(h / I)))
        }
        function Le() {
            var h = .35 + Math.random() * .65
              , S = Math.min(E.length - 1, Math.floor(Math.random() * E.length))
              , C = .3 + S / Math.max(1, E.length - 1) * .7;
            return {
                x: Math.random() * o,
                y: Math.random() * m,
                vx: -.14 + Math.random() * .28,
                vy: -.22 - Math.random() * .42,
                a: .12 + h * .5,
                tw: Math.random() * Math.PI * 2,
                tws: .01 + Math.random() * .024,
                sprite: S,
                depth: C
            }
        }
        function ie(h, S) {
            X && Q();
            var C = (h - l.rectLeft) / l.rectW * 2 - 1
              , I = (S - l.rectTop) / l.rectH * 2 - 1;
            l.tx = Math.max(-1, Math.min(1, C)),
            l.ty = Math.max(-1, Math.min(1, I)),
            l.active = !0
        }
        function De() {
            if (!n) {
                w = .7,
                o = Math.max(1, e.offsetWidth),
                m = Math.max(1, e.offsetHeight),
                t.width = Math.max(1, Math.floor(o * w)),
                t.height = Math.max(1, Math.floor(m * w)),
                t.style.width = o + "px",
                t.style.height = m + "px",
                i.setTransform(1, 0, 0, 1, 0, 0),
                i.imageSmoothingEnabled = !0,
                Q();
                var h = xt();
                if (p.length !== h) {
                    p = [];
                    for (var S = 0; S < h; S++)
                        p.push(Le())
                }
            }
        }
        function ze(h) {
            if (!(!y || n)) {
                f = window.requestAnimationFrame(ze),
                g || (g = h);
                var S = h - g;
                if (!(S < s)) {
                    var C = Math.min(33, Math.max(0, S));
                    g = h;
                    var I = C / 16.67
                      , U = t.width
                      , se = t.height
                      , Lt = U / o
                      , Me = se / m;
                    i.clearRect(0, 0, U, se);
                    var We = 0
                      , Te = 0;
                    if (u) {
                        var Pe = l.active ? l.tx : 0
                          , je = l.active ? l.ty : 0;
                        l.px += (Pe - l.px) * .11,
                        l.py += (je - l.py) * .11,
                        We = l.px * d,
                        Te = l.py * d
                    }
                    for (var le = 0; le < p.length; le++) {
                        var q = p[le];
                        q.x += q.vx * I,
                        q.y += q.vy * I,
                        q.tw += q.tws * I,
                        q.y < -10 && (q.y = m + 10,
                        q.x = Math.random() * o),
                        q.x < -10 && (q.x = o + 10),
                        q.x > o + 10 && (q.x = -10);
                        var ce = A[q.sprite];
                        if (ce) {
                            var B = q.a * (.55 + .45 * Math.sin(q.tw))
                              , M = ce.width
                              , Y = ce.height
                              , N = q.depth;
                            i.globalAlpha = B,
                            i.drawImage(ce, (q.x + We * N) * Lt - M * .5, (q.y + Te * N) * Me - Y * .5, M, Y)
                        }
                    }
                    i.globalAlpha = 1
                }
            }
        }
        function Ee() {
            n || y || document.hidden || (y = !0,
            De(),
            g = 0,
            f = window.requestAnimationFrame(ze))
        }
        function Se() {
            y = !1,
            f && (window.cancelAnimationFrame(f),
            f = 0)
        }
        if (bt(),
        u && (e.addEventListener("pointerenter", function(h) {
            Q(),
            ie(h.clientX, h.clientY)
        }, {
            passive: !0
        }),
        e.addEventListener("pointermove", function(h) {
            ie(h.clientX, h.clientY)
        }, {
            passive: !0
        }),
        e.addEventListener("pointerleave", function() {
            l.active = !1
        }),
        window.addEventListener("scroll", J, {
            passive: !0
        }),
        window.addEventListener("resize", J, {
            passive: !0
        })),
        "IntersectionObserver" in window) {
            var D = new IntersectionObserver(function(h) {
                h.forEach(function(S) {
                    S.isIntersecting && !document.hidden && !n ? Ee() : Se()
                })
            }
            ,{
                rootMargin: "40px 0px",
                threshold: .05
            });
            D.observe(e)
        } else
            Ee();
        document.addEventListener("visibilitychange", function() {
            document.hidden || n ? Se() : e.getBoundingClientRect().bottom > 0 && e.getBoundingClientRect().top < window.innerHeight && Ee()
        });
        var re = 0;
        function oe() {
            window.clearTimeout(re),
            re = window.setTimeout(function() {
                y && !n && De()
            }, 120)
        }
        if (window.addEventListener("resize", oe, {
            passive: !0
        }),
        "ResizeObserver" in window) {
            var Ae = new ResizeObserver(oe);
            Ae.observe(e)
        }
    }
    (function() {
        var t = document.getElementById("services");
        t && Tr(t, t.querySelector(".services__particles"), {
            mouseParallax: !0,
            parallaxStrength: 34,
            count: {
                desktopMin: 70,
                desktopMax: 120,
                desktopArea: 12e3
            }
        })
    }
    )(),
    (function() {
        var t = document.querySelector("[data-accordion]");
        if (t) {
            var a = Array.prototype.slice.call(t.querySelectorAll(".faq__item"));
            a.forEach(function(n) {
                var r = n.querySelector(".faq__question")
                  , i = n.querySelector(".faq__answer");
                !r || !i || r.addEventListener("click", function() {
                    var c = !n.classList.contains("is-open");
                    a.forEach(function(u) {
                        var d = u.querySelector(".faq__question")
                          , l = u.querySelector(".faq__answer");
                        u.classList.remove("is-open"),
                        d && d.setAttribute("aria-expanded", "false"),
                        l && l.setAttribute("aria-hidden", "true")
                    }),
                    c && (n.classList.add("is-open"),
                    r.setAttribute("aria-expanded", "true"),
                    i.setAttribute("aria-hidden", "false"))
                })
            })
        }
    }
    )(),
    window.addEventListener("resize", function() {
        ee(),
        pe()
    }, {
        passive: !0
    }),
    window.addEventListener("load", ee),
    ee(),
    nt(),
    wr(),
    window.addEventListener("scroll", ve, {
        passive: !0
    }),
    ve();
    function Pr() {
        if (F || typeof Lenis == "undefined" || x)
            return;
        var e = Tt || Pt;
        x = new Lenis({
            duration: 1.1,
            smoothWheel: !0,
            lerp: e ? .12 : .09,
            wheelMultiplier: 1,
            touchMultiplier: e ? 1 : 1.2,
            syncTouch: e,
            syncTouchLerp: .1,
            autoRaf: !1
        });
        var t = 0
          , a = !1
          , n = 0
          , r = 120;
        function i() {
            n && (window.clearTimeout(n),
            n = 0)
        }
        function c() {
            i(),
            a = !1,
            t && (window.cancelAnimationFrame(t),
            t = 0)
        }
        function u() {
            n || (n = window.setTimeout(function() {
                if (n = 0,
                !x) {
                    c();
                    return
                }
                var p = Math.abs(x.velocity || 0)
                  , f = typeof x.targetScroll == "number" ? x.targetScroll : x.scroll
                  , y = Math.abs((f || 0) - (x.scroll || 0));
                p < .05 && y < .5 && c()
            }, r))
        }
        function d(p) {
            if (!x) {
                c();
                return
            }
            x.raf(p);
            var f = Math.abs(x.velocity || 0)
              , y = typeof x.targetScroll == "number" ? x.targetScroll : x.scroll
              , o = Math.abs((y || 0) - (x.scroll || 0));
            f < .05 && o < .5 ? u() : i(),
            a && (t = window.requestAnimationFrame(d))
        }
        function l() {
            x && (i(),
            !a && (x.time = 0,
            a = !0,
            t = window.requestAnimationFrame(d)))
        }
        if (x.on("scroll", function() {
            ve(),
            l()
        }),
        typeof x.on == "function")
            try {
                x.on("virtual-scroll", l)
            } catch (p) {}
        window.addEventListener("wheel", l, {
            passive: !0
        }),
        window.addEventListener("touchstart", l, {
            passive: !0
        }),
        window.addEventListener("touchmove", l, {
            passive: !0
        }),
        window.addEventListener("keydown", function(p) {
            var f = {
                ArrowUp: 1,
                ArrowDown: 1,
                PageUp: 1,
                PageDown: 1,
                Home: 1,
                End: 1,
                " ": 1
            };
            f[p.key] && l()
        }),
        l(),
        window.setTimeout(pe, 50)
    }
    F || It("css/vendor/lenis/lenis.css", "js/vendor/lenis/lenis.min.js").then(Pr).catch(function() {});
    var he = document.getElementById("glass-stepper-fill")
      , Ye = document.getElementById("roadmap-swiper")
      , O = document.getElementById("roadmap-pin")
      , v = null
      , b = {
        targetTranslate: 0,
        rafId: null,
        wheelMultiplier: .36,
        lerp: .11,
        progressLerp: .16,
        displayProgress: 0
    }
      , Z = {
        enabled: !F,
        scrollDriving: !1,
        updating: !1
    };
    F && (b.lerp = 1,
    b.progressLerp = 1,
    b.wheelMultiplier = .5);
    function V() {
        return Z.enabled
    }
    function zt() {
        O && O.classList.toggle("is-pin-mode", V())
    }
    function Wt() {
        if (!v)
            return 0;
        var e = v.slides;
        if (!e.length)
            return 0;
        var t = e[0].offsetWidth || 310
          , a = v.params.spaceBetween || 24;
        return t + a
    }
    function jt() {
        if (!V())
            return 0;
        var e = Oe() * .3
          , t = Wt() * .9;
        return Math.max(e, t)
    }
    function Ut() {
        if (!V())
            return 0;
        var e = Oe() * .5
          , t = Wt() * 1.35;
        return Math.max(e, t)
    }
    function Ir() {
        if (!v)
            return 0;
        var e = v
          , t = e.slides;
        if (!t.length)
            return e.maxTranslate();
        var a = t[t.length - 1]
          , n = 0;
        try {
            n = parseFloat(window.getComputedStyle(e.el).paddingRight) || 0
        } catch (i) {}
        var r = e.width - n - a.offsetLeft - a.offsetWidth;
        return Math.min(e.minTranslate(), Math.max(e.maxTranslate(), r))
    }
    function ge() {
        if (!v)
            return {
                start: 0,
                end: 0,
                range: 0
            };
        var e = v
          , t = e.minTranslate()
          , a = Ir();
        return {
            start: t,
            end: a,
            range: t - a
        }
    }
    function qr(e) {
        if (!v)
            return 0;
        var t = ge();
        return t.range ? Math.max(0, Math.min(1, (t.start - e) / t.range)) : 0
    }
    function ot(e, t) {
        if (he) {
            var a = he.parentElement;
            a && (he.style.backgroundSize = a.offsetWidth + "px 100%"),
            he.classList.toggle("is-scrubbing", !!t),
            he.style.width = Math.max(0, Math.min(1, e)) * 100 + "%"
        }
    }
    function K(e, t) {
        if (e) {
            var a = t || {}
              , n = qr(e.getTranslate());
            if (a.immediate) {
                b.displayProgress = n,
                ot(n, !1);
                return
            }
            if (a.scrubbing) {
                var r = n - b.displayProgress;
                Math.abs(r) < 8e-4 ? b.displayProgress = n : b.displayProgress += r * b.progressLerp,
                ot(b.displayProgress, !0);
                return
            }
            b.displayProgress = n,
            ot(n, !1)
        }
    }
    function _r(e) {
        if (!v)
            return e;
        var t = ge();
        return e > t.start ? t.start : e < t.end ? t.end : e
    }
    function Vt() {
        if (!v) {
            b.rafId = null;
            return
        }
        var e = v.getTranslate()
          , t = b.targetTranslate
          , a = t - e;
        if (Math.abs(a) < .2) {
            v.setTransition(0),
            v.setTranslate(t),
            v.updateProgress(),
            v.updateActiveIndex(),
            b.targetTranslate = t,
            K(v, {
                immediate: !0
            }),
            b.rafId = null;
            return
        }
        var n = e + a * b.lerp;
        v.setTransition(0),
        v.setTranslate(n),
        v.updateProgress(),
        v.updateActiveIndex(),
        K(v, {
            scrubbing: !0
        }),
        b.rafId = window.requestAnimationFrame(Vt)
    }
    function Rr(e) {
        b.targetTranslate = _r(e),
        b.rafId || (b.rafId = window.requestAnimationFrame(Vt))
    }
    function kr(e, t) {
        if (!(!v || v.isLocked)) {
            var a = t || {}
              , n = Math.max(0, Math.min(1, e))
              , r = ge()
              , i = r.start + (r.end - r.start) * n;
            b.rafId && (window.cancelAnimationFrame(b.rafId),
            b.rafId = null),
            Z.scrollDriving = !0,
            b.targetTranslate = i,
            v.setTransition(0),
            v.setTranslate(i),
            v.updateProgress(),
            v.updateActiveIndex(),
            K(v, a.scrubbing ? {
                scrubbing: !0
            } : {
                immediate: !0
            }),
            Z.scrollDriving = !1
        }
    }
    function Nt() {
        return P ? P.offsetHeight : 84
    }
    function Cr() {
        var e = window.innerWidth;
        return e < 720 ? window.innerHeight * .16 : e < 1024 ? window.innerHeight * .22 : window.innerHeight * .3
    }
    function Oe() {
        return window.innerHeight - Nt() - Cr()
    }
    function Gt() {
        if (!O)
            return Oe();
        var e = O.querySelector(".roadmap-pin__sticky");
        return e && e.offsetHeight ? e.offsetHeight : Oe()
    }
    function Fr() {
        if (v) {
            var e = 0;
            v.params.slidesOffsetAfter !== e && (Z.updating = !0,
            v.params.slidesOffsetAfter = e,
            v.update(),
            Z.updating = !1)
        }
    }
    function st() {
        if (!(!O || !v)) {
            if (!V() || v.isLocked) {
                O.style.height = "",
                O.classList.remove("is-active");
                return
            }
            Fr();
            var e = ge()
              , t = e.range
              , a = Gt()
              , n = jt()
              , r = Ut();
            O.style.height = a + n + r + t * 1.1 + "px"
        }
    }
    function Br() {
        if (!O)
            return null;
        var e = O.getBoundingClientRect()
          , t = e.top + de()
          , a = O.offsetHeight
          , n = Nt()
          , r = Gt()
          , i = t - n
          , c = Math.max(1, a - r);
        return {
            pinTop: t,
            pinHeight: a,
            scrollStart: i,
            scrollable: c
        }
    }
    function He() {
        if (!O || !v || !V()) {
            O && O.classList.remove("is-active");
            return
        }
        var e = Br();
        if (!(!e || e.scrollable <= 0)) {
            var t = de()
              , a = t - e.scrollStart
              , n = jt()
              , r = Ut()
              , i = Math.max(1, e.scrollable - n - r)
              , c = (a - n) / i
              , u = a > 0 && a < e.scrollable;
            O.classList.toggle("is-active", u),
            kr(c, {
                scrubbing: !0
            })
        }
    }
    function Yr() {
        if (v) {
            var e = V();
            v.params.allowTouchMove = !e,
            v.allowTouchMove = !e,
            v.params.simulateTouch = !e,
            v.params.grabCursor = !e,
            v.params.freeMode = e ? !1 : {
                enabled: !0,
                momentum: !0,
                momentumRatio: .72,
                momentumVelocityRatio: .9,
                momentumBounce: !1,
                sticky: !1
            },
            zt(),
            v.update()
        }
    }
    function Or() {
        var e = document.getElementById("glass-stepper") || Ye;
        e && e.addEventListener("wheel", function(t) {
            if (!(!v || v.destroyed || V())) {
                var a = Math.abs(t.deltaY) >= Math.abs(t.deltaX) ? t.deltaY : t.deltaX;
                if (!(!a || Math.abs(a) < 1)) {
                    var n = b.rafId ? b.targetTranslate : v.getTranslate()
                      , r = ge()
                      , i = a > 0
                      , c = n >= r.start - .5
                      , u = n <= r.end + .5;
                    i && u || !i && c || (t.preventDefault(),
                    Rr(n - a * b.wheelMultiplier))
                }
            }
        }, {
            passive: !1
        })
    }
    function Hr() {
        !Ye || typeof Swiper == "undefined" || v || (v = new Swiper("#roadmap-swiper",{
            slidesPerView: "auto",
            spaceBetween: 24,
            grabCursor: !V(),
            watchOverflow: !0,
            allowTouchMove: !V(),
            simulateTouch: !V(),
            speed: 650,
            freeMode: V() ? !1 : {
                enabled: !0,
                momentum: !0,
                momentumRatio: .72,
                momentumVelocityRatio: .9,
                momentumBounce: !1,
                sticky: !1
            },
            on: {
                init: function(e) {
                    b.targetTranslate = e.getTranslate(),
                    Yr(),
                    st(),
                    He(),
                    K(e, {
                        immediate: !0
                    })
                },
                progress: function(e) {
                    !b.rafId && !Z.scrollDriving && K(e)
                },
                resize: function(e) {
                    Z.updating || (st(),
                    He(),
                    b.targetTranslate = e.getTranslate(),
                    K(e, {
                        immediate: !0
                    }))
                },
                setTranslate: function(e) {
                    !b.rafId && !Z.scrollDriving && (b.targetTranslate = e.getTranslate(),
                    K(e))
                },
                touchEnd: function(e) {
                    b.targetTranslate = e.getTranslate()
                },
                transitionEnd: function(e) {
                    b.targetTranslate = e.getTranslate(),
                    K(e)
                }
            }
        }),
        zt(),
        Or())
    }
    function Xr() {
        if (!Ye)
            return;
        function e() {
            It("css/vendor/swiper/swiper-custom.min.css", "js/vendor/swiper/swiper-custom.min.js").then(Hr).catch(function() {})
        }
        var t = O || Ye;
        if (!("IntersectionObserver" in window)) {
            e();
            return
        }
        var a = new IntersectionObserver(function(n) {
            var r = n.some(function(i) {
                return i.isIntersecting
            });
            r && (a.disconnect(),
            e())
        }
        ,{
            rootMargin: "480px 0px",
            threshold: 0
        });
        a.observe(t)
    }
    Xr(),
    window.addEventListener("resize", function() {
        ee(),
        v && (st(),
        He(),
        b.targetTranslate = v.getTranslate(),
        K(v, {
            immediate: !0
        }))
    }, {
        passive: !0
    });
    function Dr() {
        if (!window.matchMedia("(pointer: fine)").matches || window.matchMedia("(prefers-reduced-motion: reduce)").matches)
            return;
        var e = [];
        if (Array.prototype.forEach.call(document.querySelectorAll(".border-glow-card"), function(r) {
            var i = r.closest(".pricing__list, #glass-stepper") || r.parentElement;
            i && e.indexOf(i) === -1 && e.push(i)
        }),
        !e.length)
            return;
        var t = 180;
        function a(r, i, c, u) {
            var d = r / 2
              , l = i / 2
              , p = c - d
              , f = u - l
              , y = 1 / 0
              , o = 1 / 0;
            return p !== 0 && (y = d / Math.abs(p)),
            f !== 0 && (o = l / Math.abs(f)),
            Math.min(Math.max(1 / Math.min(y, o), 0), 1)
        }
        function n(r, i, c, u) {
            var d = c - r / 2
              , l = u - i / 2;
            if (d === 0 && l === 0)
                return 0;
            var p = Math.atan2(l, d) * (180 / Math.PI) + 90;
            return p < 0 && (p += 360),
            p
        }
        e.forEach(function(r) {
            var i = Array.prototype.slice.call(r.querySelectorAll(".border-glow-card"));
            if (!i.length)
                return;
            var c = 0
              , u = null;
            function d() {
                u = null,
                i.forEach(function(f) {
                    f.style.setProperty("--edge-proximity", "0")
                })
            }
            function l(f) {
                i.forEach(function(y) {
                    var o = y.getBoundingClientRect()
                      , m = f.clientX - o.left
                      , g = f.clientY - o.top
                      , s = Math.min(Math.max(m, 0), o.width)
                      , w = Math.min(Math.max(g, 0), o.height)
                      , A = a(o.width, o.height, s, w)
                      , E = m < 0 || g < 0 || m > o.width || g > o.height;
                    if (E) {
                        var X = 0
                          , k = 0;
                        m < 0 ? X = -m : m > o.width && (X = m - o.width),
                        g < 0 ? k = -g : g > o.height && (k = g - o.height);
                        var Q = Math.hypot(X, k);
                        A *= Math.max(0, 1 - Q / t)
                    }
                    var J = n(o.width, o.height, m, g);
                    y.style.setProperty("--edge-proximity", (A * 100).toFixed(3)),
                    y.style.setProperty("--cursor-angle", J.toFixed(3) + "deg")
                })
            }
            function p(f) {
                u = f,
                !c && (c = window.requestAnimationFrame(function() {
                    c = 0,
                    u && l(u)
                }))
            }
            r.addEventListener("pointermove", p, {
                passive: !0
            }),
            r.addEventListener("pointerleave", d)
        })
    }
    Dr();
    function zr() {
        var e = Array.prototype.slice.call(document.querySelectorAll(".btn--specular"));
        if (!e.length || F)
            return;
        var t = 20
          , a = `#version 300 es
in vec2 position;
void main(){ gl_Position = vec4(position, 0.0, 1.0); }`
          , n = ["#version 300 es", "precision highp float;", "uniform vec2 uCenter;", "uniform vec2 uHalfSize;", "uniform float uRadius;", "uniform float uAngle;", "uniform float uPx;", "uniform vec3 uLineColor;", "uniform vec3 uBaseColor;", "uniform float uIntensity;", "uniform float uShineSize;", "uniform float uShineFade;", "uniform float uThickness;", "uniform float uBaseWidth;", "out vec4 fragColor;", "float sdRoundedRect(vec2 p, vec2 b, float r){", " vec2 q = abs(p) - b + r;", " return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;", "}", "float gaussianLine(float d, float sigma){", " float x = d / (sigma + 1e-6);", " float k = mix(1.0, 1.6, smoothstep(0.0, 1.5, x));", " return exp(-k * x * x);", "}", "void main(){", " vec2 p = gl_FragCoord.xy - uCenter;", " float d = sdRoundedRect(p, uHalfSize, uRadius);", " vec2 L = vec2(cos(uAngle), sin(uAngle));", " float base = (1.0 - smoothstep(0.0, uBaseWidth, abs(d))) * 0.45;", " vec2 nEll = normalize(p / (uHalfSize * uHalfSize) + 1e-6);", " float phi = acos(clamp(abs(dot(nEll, L)), 0.0, 1.0));", " float rim = 1.0 - smoothstep(uShineSize - uShineFade, uShineSize + uShineFade + 1e-4, phi);", " float line = gaussianLine(d, uThickness);", " float edgeClamp = 1.0 - smoothstep(0.5 * uPx, 3.0 * uPx, abs(d));", " float hi = line * rim * edgeClamp * uIntensity;", " vec3 spec = mix(uBaseColor, uLineColor, clamp(hi, 0.0, 1.0));", " vec3 col = uBaseColor * base + spec * hi;", " float a = clamp(base + hi, 0.0, 1.0);", " fragColor = vec4(col, a);", "}"].join(`
`);
        function r(o) {
            o = String(o || "").replace("#", ""),
            o.length === 3 && (o = o.charAt(0) + o.charAt(0) + o.charAt(1) + o.charAt(1) + o.charAt(2) + o.charAt(2));
            var m = parseInt(o, 16);
            return isNaN(m) ? [1, 1, 1] : [(m >> 16 & 255) / 255, (m >> 8 & 255) / 255, (m & 255) / 255]
        }
        function i(o, m, g) {
            var s = o.createShader(m);
            return o.shaderSource(s, g),
            o.compileShader(s),
            o.getShaderParameter(s, o.COMPILE_STATUS) ? s : (o.deleteShader(s),
            null)
        }
        function c(o) {
            var m = o.querySelector(".btn__fx");
            if (!m)
                return;
            var g = document.createElement("canvas")
              , s = g.getContext("webgl2", {
                alpha: !0,
                premultipliedAlpha: !0,
                antialias: !0,
                depth: !1,
                stencil: !1,
                powerPreference: "low-power"
            });
            if (!s)
                return;
            var w = i(s, s.VERTEX_SHADER, a)
              , A = i(s, s.FRAGMENT_SHADER, n);
            if (!w || !A)
                return;
            var E = s.createProgram();
            if (s.attachShader(E, w),
            s.attachShader(E, A),
            s.bindAttribLocation(E, 0, "position"),
            s.linkProgram(E),
            s.deleteShader(w),
            s.deleteShader(A),
            !s.getProgramParameter(E, s.LINK_STATUS))
                return;
            var X = s.createBuffer();
            s.bindBuffer(s.ARRAY_BUFFER, X),
            s.bufferData(s.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), s.STATIC_DRAW);
            var k = {
                center: s.getUniformLocation(E, "uCenter"),
                halfSize: s.getUniformLocation(E, "uHalfSize"),
                radius: s.getUniformLocation(E, "uRadius"),
                angle: s.getUniformLocation(E, "uAngle"),
                px: s.getUniformLocation(E, "uPx"),
                lineColor: s.getUniformLocation(E, "uLineColor"),
                baseColor: s.getUniformLocation(E, "uBaseColor"),
                intensity: s.getUniformLocation(E, "uIntensity"),
                shineSize: s.getUniformLocation(E, "uShineSize"),
                shineFade: s.getUniformLocation(E, "uShineFade"),
                thickness: s.getUniformLocation(E, "uThickness"),
                baseWidth: s.getUniformLocation(E, "uBaseWidth")
            };
            s.enable(s.BLEND),
            s.blendFunc(s.ONE, s.ONE_MINUS_SRC_ALPHA),
            s.clearColor(0, 0, 0, 0),
            m.appendChild(g);
            var Q = !0
              , J = !1
              , bt = .35
              , xt = 250
              , Le = r("#f8c495")
              , ie = r("#b3551a")
              , De = 1.2
              , ze = 10 * Math.PI / 180
              , Ee = 40 * Math.PI / 180
              , Se = 1
              , D = {
                w: 1,
                h: 1,
                dpr: 1,
                radius: 5
            }
              , re = null
              , oe = 0
              , Ae = 2.4
              , h = 2.4
              , S = J ? 1 : 0
              , C = 0
              , I = 0
              , U = !1
              , se = !document.hidden;
            function Lt() {
                return window.devicePixelRatio || 1
            }
            function Me() {
                var B = o.getBoundingClientRect()
                  , M = B.width
                  , Y = B.height
                  , N = Lt();
                D.w = M,
                D.h = Y,
                D.dpr = N,
                D.radius = parseFloat(window.getComputedStyle(o).borderRadius) || 5,
                g.width = Math.max(1, Math.round((M + t * 2) * N)),
                g.height = Math.max(1, Math.round((Y + t * 2) * N)),
                s.viewport(0, 0, g.width, g.height)
            }
            function We(B) {
                var M = o.getBoundingClientRect()
                  , Y = M.left + M.width / 2
                  , N = M.top + M.height / 2
                  , Et = Math.max(M.left - B.clientX, 0, B.clientX - M.right)
                  , St = Math.max(M.top - B.clientY, 0, B.clientY - M.bottom)
                  , Ue = Math.hypot(Et, St);
                if (Ue === 0) {
                    var At = (B.clientX - Y) / (M.width / 2)
                      , ta = (N - B.clientY) / (M.height / 2);
                    re = Math.atan2(2 / M.height, -2 / M.width) + At * .3 + ta * .15
                } else
                    re = Math.atan2(N - B.clientY, B.clientX - Y);
                var Mt = Math.max(0, 1 - Ue / Math.max(xt, 1));
                oe = Mt * Mt * (3 - 2 * Mt)
            }
            function Te() {
                return U && se
            }
            function Pe() {
                I || !Te() || (C = performance.now(),
                I = requestAnimationFrame(le))
            }
            function je() {
                I && cancelAnimationFrame(I),
                I = 0
            }
            function le(B) {
                if (!Te()) {
                    I = 0;
                    return
                }
                I = requestAnimationFrame(le);
                var M = Math.min((B - C) / 1e3, .05);
                C = B;
                var Y = D.dpr
                  , N = D.radius;
                h += bt * M;
                var Et = Q && re != null && (!J || oe > 0)
                  , St = Et ? re : h
                  , Ue = (St - Ae + Math.PI * 3) % (Math.PI * 2) - Math.PI;
                Ae += Ue * (1 - Math.exp(-M * 7));
                var At = J ? 1 : oe;
                S += (At - S) * (1 - Math.exp(-M * 8)),
                s.useProgram(E),
                s.bindBuffer(s.ARRAY_BUFFER, X),
                s.enableVertexAttribArray(0),
                s.vertexAttribPointer(0, 2, s.FLOAT, !1, 0, 0),
                s.uniform2f(k.center, (t + D.w / 2) * Y, (t + D.h / 2) * Y),
                s.uniform2f(k.halfSize, D.w / 2 * Y, D.h / 2 * Y),
                s.uniform1f(k.radius, Math.min(N, Math.min(D.w, D.h) / 2) * Y),
                s.uniform1f(k.angle, Ae),
                s.uniform1f(k.px, Y),
                s.uniform3f(k.lineColor, Le[0], Le[1], Le[2]),
                s.uniform3f(k.baseColor, ie[0], ie[1], ie[2]),
                s.uniform1f(k.intensity, De * S),
                s.uniform1f(k.shineSize, ze),
                s.uniform1f(k.shineFade, Ee),
                s.uniform1f(k.thickness, Se * Y),
                s.uniform1f(k.baseWidth, Y),
                s.clear(s.COLOR_BUFFER_BIT),
                s.drawArrays(s.TRIANGLES, 0, 3)
            }
            var q = typeof ResizeObserver == "function" ? new ResizeObserver(Me) : null;
            if (q ? q.observe(o) : window.addEventListener("resize", Me),
            Me(),
            Q && window.addEventListener("pointermove", We, {
                passive: !0
            }),
            typeof IntersectionObserver == "function") {
                var ce = new IntersectionObserver(function(B) {
                    U = B.some(function(M) {
                        return M.isIntersecting
                    }),
                    U ? Pe() : je()
                }
                ,{
                    rootMargin: "80px",
                    threshold: 0
                });
                ce.observe(o)
            } else
                U = !0,
                Pe();
            document.addEventListener("visibilitychange", function() {
                se = !document.hidden,
                se ? Pe() : je()
            })
        }
        function u(o) {
            if (!o)
                return !1;
            var m = window.getComputedStyle(o);
            return m.display === "none" || m.visibility === "hidden" ? !1 : o.getClientRects().length > 0
        }
        var d = typeof WeakSet == "function" ? new WeakSet : [];
        function l(o) {
            d.add ? d.add(o) : d.indexOf(o) === -1 && d.push(o)
        }
        function p(o) {
            return d.has ? d.has(o) : d.indexOf(o) !== -1
        }
        function f(o) {
            p(o) || !u(o) || (l(o),
            c(o))
        }
        e.forEach(f);
        var y = 0;
        window.addEventListener("resize", function() {
            window.clearTimeout(y),
            y = window.setTimeout(function() {
                e.forEach(f)
            }, 200)
        })
    }
    zr();
    function Wr(e) {
        var t = P ? P.offsetHeight : 80
          , a = e.getBoundingClientRect()
          , n = a.top + window.pageYOffset - t + 1;
        if (x) {
            x.scrollTo(n, {
                offset: 0
            });
            return
        }
        window.scrollTo({
            top: n,
            behavior: "smooth"
        })
    }
    document.addEventListener("click", function(e) {
        var t = e.target.closest ? e.target.closest('a[href^="#"]') : null;
        if (t) {
            var a = t.getAttribute("href");
            if (!(!a || a === "#")) {
                var n = document.querySelector(a);
                if (n && (e.preventDefault(),
                ye({
                    restoreFocus: !1
                }),
                Wr(n),
                n.hasAttribute("tabindex")))
                    try {
                        n.focus({
                            preventScroll: !0
                        })
                    } catch (r) {
                        n.focus()
                    }
            }
        }
    });
    var ae = null;
    function jr() {
        var e = [];
        return z && e.push(z),
        _ ? e.concat(Array.prototype.slice.call(_.querySelectorAll("a[href], button:not([disabled])")).filter(function(t) {
            return !t.closest("[inert]")
        })) : e
    }
    function Kt(e) {
        _ && (e ? _.setAttribute("inert", "") : _.removeAttribute("inert"))
    }
    function Ur() {
        !_ || !z || (ae = document.activeElement,
        _.classList.add("is-open"),
        _.setAttribute("aria-hidden", "false"),
        Kt(!1),
        z.setAttribute("aria-expanded", "true"),
        z.setAttribute("aria-label", "\u0417\u0430\u043A\u0440\u044B\u0442\u044C \u043C\u0435\u043D\u044E"),
        P && P.classList.add("is-menu-open"),
        document.body.classList.add("modal-open"),
        Ve())
    }
    function Qt() {
        if (_) {
            var e = _.querySelectorAll(".mobile-menu__item--accordion");
            Array.prototype.forEach.call(e, function(t) {
                var a = t.querySelector(".mobile-menu__accordion-btn")
                  , n = t.querySelector(".mobile-menu__panel");
                t.classList.remove("is-open"),
                a && a.setAttribute("aria-expanded", "false"),
                n && (n.setAttribute("aria-hidden", "true"),
                n.setAttribute("inert", ""))
            })
        }
    }
    function ye(e) {
        if (!(!_ || !_.classList.contains("is-open"))) {
            var t = !e || e.restoreFocus !== !1
              , a = ae && ae !== z && typeof ae.focus == "function" ? ae : z;
            ae = null,
            t && a && a.focus(),
            _.classList.remove("is-open"),
            _.setAttribute("aria-hidden", "true"),
            Kt(!0),
            z && (z.setAttribute("aria-expanded", "false"),
            z.setAttribute("aria-label", "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u043C\u0435\u043D\u044E")),
            P && P.classList.remove("is-menu-open"),
            document.body.classList.remove("modal-open"),
            Qt(),
            Ne()
        }
    }
    z && z.addEventListener("click", function() {
        _ && _.classList.contains("is-open") ? ye() : Ur()
    }),
    document.addEventListener("keydown", function(e) {
        if (!(!_ || !_.classList.contains("is-open"))) {
            if (e.key === "Escape") {
                e.preventDefault(),
                ye();
                return
            }
            if (e.key === "Tab") {
                var t = jr();
                if (t.length) {
                    var a = t[0]
                      , n = t[t.length - 1];
                    e.shiftKey && document.activeElement === a ? (e.preventDefault(),
                    n.focus()) : !e.shiftKey && document.activeElement === n && (e.preventDefault(),
                    a.focus())
                }
            }
        }
    }),
    (function() {
        if (_) {
            var t = _.querySelectorAll(".mobile-menu__accordion-btn");
            Array.prototype.forEach.call(t, function(a) {
                var n = a.closest(".mobile-menu__item--accordion")
                  , r = n ? n.querySelector(".mobile-menu__panel") : null;
                !n || !r || a.addEventListener("click", function() {
                    var i = !n.classList.contains("is-open");
                    Qt(),
                    i && (n.classList.add("is-open"),
                    a.setAttribute("aria-expanded", "true"),
                    r.setAttribute("aria-hidden", "false"),
                    r.removeAttribute("inert"))
                })
            })
        }
    }
    )();
    var $t = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]")).filter(function(e) {
        return !e.closest("[data-enter]") && !e.classList.contains("project-card") && !e.classList.contains("pricing__item")
    });
    if ("IntersectionObserver" in window) {
        var Zt = new IntersectionObserver(function(e) {
            e.forEach(function(t) {
                t.isIntersecting && (t.target.classList.add("in-view"),
                Zt.unobserve(t.target))
            })
        }
        ,{
            threshold: .15,
            rootMargin: "0px 0px -60px 0px"
        });
        $t.forEach(function(e) {
            Zt.observe(e)
        })
    } else
        $t.forEach(function(e) {
            e.classList.add("in-view")
        });
    (function() {
        var t = Array.prototype.slice.call(document.querySelectorAll(".pricing__list"));
        if (t.length) {
            var a = 2100;
            t.forEach(function(n) {
                var r = Array.prototype.slice.call(n.querySelectorAll(".pricing__item[data-reveal]"));
                if (!r.length)
                    return;
                function i(o) {
                    window.setTimeout(function() {
                        o.classList.add("is-settled")
                    }, a)
                }
                function c(o) {
                    o.classList.contains("in-view") || (o.classList.add("in-view"),
                    i(o))
                }
                function u() {
                    r.forEach(c)
                }
                if (F || !("IntersectionObserver" in window)) {
                    r.forEach(function(o) {
                        o.classList.add("in-view"),
                        o.classList.add("is-settled")
                    });
                    return
                }
                var d = window.matchMedia("(max-width: 1024px)");
                function l() {
                    var o = new IntersectionObserver(function(m) {
                        m.forEach(function(g) {
                            g.isIntersecting && (u(),
                            o.disconnect())
                        })
                    }
                    ,{
                        threshold: .12,
                        rootMargin: "0px 0px -6% 0px"
                    });
                    return o.observe(n),
                    o
                }
                function p() {
                    var o = new IntersectionObserver(function(m) {
                        m.forEach(function(g) {
                            g.isIntersecting && (c(g.target),
                            o.unobserve(g.target))
                        })
                    }
                    ,{
                        threshold: .2,
                        rootMargin: "0px 0px -8% 0px"
                    });
                    return r.forEach(function(m) {
                        m.classList.contains("in-view") || o.observe(m)
                    }),
                    o
                }
                var f = null;
                function y() {
                    f && (f.disconnect(),
                    f = null);
                    var o = r.some(function(m) {
                        return !m.classList.contains("in-view")
                    });
                    o && (d.matches ? f = p() : f = l())
                }
                y(),
                typeof d.addEventListener == "function" ? d.addEventListener("change", y) : typeof d.addListener == "function" && d.addListener(y)
            })
        }
    }
    )(),
    (function() {
        var t = document.querySelector(".portfolio__grid");
        if (t) {
            var a = Array.prototype.slice.call(t.querySelectorAll(".project-card[data-reveal]"));
            if (a.length) {
                if (F || !("IntersectionObserver" in window)) {
                    a.forEach(function(d) {
                        d.classList.add("in-view"),
                        d.classList.add("is-settled")
                    });
                    return
                }
                var n = window.matchMedia("(min-width: 721px)")
                  , r = 200
                  , i = 0
                  , c = 0
                  , u = new IntersectionObserver(function(d) {
                    var l = d.filter(function(f) {
                        return f.isIntersecting
                    });
                    if (l.length) {
                        l.sort(function(f, y) {
                            return a.indexOf(f.target) - a.indexOf(y.target)
                        });
                        var p = performance.now();
                        p - c > 450 && (i = 0),
                        l.forEach(function(f) {
                            var y = f.target
                              , o = n.matches ? i * r : 0;
                            y.style.setProperty("--project-reveal-delay", o + "ms"),
                            y.classList.add("in-view"),
                            u.unobserve(y),
                            i += 1,
                            c = p,
                            window.setTimeout(function() {
                                y.classList.add("is-settled")
                            }, 1100 + o)
                        })
                    }
                }
                ,{
                    threshold: .18,
                    rootMargin: "0px 0px -8% 0px"
                });
                a.forEach(function(d) {
                    u.observe(d)
                })
            }
        }
    }
    )();
    var lt = Array.prototype.slice.call(document.querySelectorAll(".about__collage .collage__item"));
    if (lt.length && "IntersectionObserver" in window) {
        var Jt = new IntersectionObserver(function(e) {
            e.forEach(function(t) {
                t.isIntersecting && (t.target.classList.add("in-view"),
                Jt.unobserve(t.target))
            })
        }
        ,{
            threshold: .16,
            rootMargin: "0px 0px -6% 0px"
        });
        lt.forEach(function(e) {
            Jt.observe(e)
        })
    } else
        lt.forEach(function(e) {
            e.classList.add("in-view")
        });
    function Vr(e) {
        e.addEventListener("input", function() {
            var t = e.value.replace(/\D/g, "");
            t.charAt(0) === "8" && (t = "7" + t.slice(1)),
            t.charAt(0) !== "7" && (t = "7" + t),
            t = t.slice(0, 11);
            var a = "+7";
            t.length > 1 && (a += " (" + t.slice(1, 4)),
            t.length >= 4 && (a += ") " + t.slice(4, 7)),
            t.length >= 7 && (a += " " + t.slice(7, 9)),
            t.length >= 9 && (a += " " + t.slice(9, 11)),
            e.value = a
        }),
        e.addEventListener("focus", function() {
            e.value || (e.value = "+7 ")
        })
    }
    Array.prototype.slice.call(document.querySelectorAll('input[type="tel"]')).forEach(Vr);
    function Nr(e, t) {
        var a = e.querySelector("input, textarea")
          , n = e.querySelector(".field__error")
          , r = a.value.trim()
          , i = "";
        if (t.required && !r)
            i = "\u041E\u0431\u044F\u0437\u0430\u0442\u0435\u043B\u044C\u043D\u043E\u0435 \u043F\u043E\u043B\u0435";
        else if (t.minLength && r.length < t.minLength)
            i = "\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043A\u043E\u0440\u043E\u0442\u043A\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435";
        else if (t.phone && r) {
            var c = r.replace(/\D/g, "");
            c.length < 11 && (i = "\u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u043D\u043E\u043C\u0435\u0440 \u0442\u0435\u043B\u0435\u0444\u043E\u043D\u0430")
        } else if (t.email && r) {
            var u = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            u.test(r) || (i = "\u041F\u0440\u043E\u0432\u0435\u0440\u044C\u0442\u0435 \u0430\u0434\u0440\u0435\u0441 email")
        }
        return e.classList.toggle("has-error", !!i),
        n && (n.textContent = i),
        i ? (a.setAttribute("aria-invalid", "true"),
        e.classList.remove("is-shaking"),
        e.offsetWidth,
        e.classList.add("is-shaking")) : a.removeAttribute("aria-invalid"),
        !i
    }
    function Gr(e, t) {
        var a = e.checked;
        return t && (t.textContent = a ? "" : "\u041D\u0435\u043E\u0431\u0445\u043E\u0434\u0438\u043C\u043E \u0441\u043E\u0433\u043B\u0430\u0441\u0438\u0435 \u043D\u0430 \u043E\u0431\u0440\u0430\u0431\u043E\u0442\u043A\u0443 \u043F\u0435\u0440\u0441\u043E\u043D\u0430\u043B\u044C\u043D\u044B\u0445 \u0434\u0430\u043D\u043D\u044B\u0445"),
        a ? e.removeAttribute("aria-invalid") : e.setAttribute("aria-invalid", "true"),
        a
    }
    function er(e, t) {
        var a = document.getElementById(e);
        if (a) {
            var n = document.getElementById(t)
              , r = a.querySelector('button[type="submit"]')
              , i = a.querySelector('input[name="consent"]')
              , c = a.querySelector(".field__error--consent");
            Array.prototype.slice.call(a.querySelectorAll(".checkbox__text a")).forEach(function(u) {
                u.addEventListener("click", function(d) {
                    d.stopPropagation()
                })
            }),
            a.addEventListener("submit", function(u) {
                u.preventDefault();
                var d = !0
                  , l = Array.prototype.slice.call(a.querySelectorAll(".field"));
                if (l.forEach(function(y) {
                    var o = y.querySelector("input, textarea");
                    if (o) {
                        var m = {};
                        if (o.name === "name" && (m = {
                            required: !0,
                            minLength: 2
                        }),
                        o.name === "phone" && (m = {
                            required: !0,
                            phone: !0
                        }),
                        o.name === "email" && (m = {
                            email: !0
                        }),
                        Object.keys(m).length) {
                            var g = Nr(y, m);
                            d = d && g
                        }
                    }
                }),
                i) {
                    var p = Gr(i, c);
                    d = d && p
                }
                if (!d) {
                    var f = a.querySelector('[aria-invalid="true"]');
                    f && f.focus();
                    return
                }
                r.classList.add("is-loading"),
                r.disabled = !0,
                r.setAttribute("aria-busy", "true"),
                window.setTimeout(function() {
                    r.classList.remove("is-loading"),
                    r.disabled = !1,
                    r.removeAttribute("aria-busy"),
                    n && (n.hidden = !1),
                    a.classList.add("is-success"),
                    a.reset(),
                    Array.prototype.slice.call(a.querySelectorAll("[aria-invalid]")).forEach(function(y) {
                        y.removeAttribute("aria-invalid")
                    }),
                    e === "quick-form" && window.setTimeout(dt, 2200)
                }, 900)
            })
        }
    }
    er("contact-form", "form-success"),
    er("quick-form", "quick-form-success");
    function ct(e) {
        return e ? Array.prototype.slice.call(e.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')).filter(function(t) {
            return t.hasAttribute("disabled") || t.getAttribute("aria-hidden") === "true" || t.closest('[hidden], [aria-hidden="true"]') ? !1 : !!(t.offsetWidth || t.offsetHeight || t.getClientRects().length)
        }) : []
    }
    function tr(e, t) {
        if (!(e.key !== "Tab" || !t)) {
            var a = ct(t);
            if (!a.length) {
                e.preventDefault();
                return
            }
            var n = a[0]
              , r = a[a.length - 1]
              , i = document.activeElement;
            e.shiftKey ? (i === n || !t.contains(i)) && (e.preventDefault(),
            r.focus()) : (i === r || !t.contains(i)) && (e.preventDefault(),
            n.focus())
        }
    }
    var j = document.getElementById("quick-modal")
      , rr = j ? j.querySelector(".modal__panel") : null
      , ut = null;
    function ar(e) {
        j && (e && e.preventDefault(),
        typeof ye == "function" && ye({
            restoreFocus: !1
        }),
        ut = document.activeElement,
        j.classList.add("is-open"),
        j.setAttribute("aria-hidden", "false"),
        document.body.classList.add("modal-open"),
        Ve(),
        window.setTimeout(function() {
            var t = ct(rr || j), a = null, n;
            for (n = 0; n < t.length; n++)
                if (t[n].matches('input:not([type="hidden"]):not([type="checkbox"]), textarea, select')) {
                    a = t[n];
                    break
                }
            !a && t.length && (a = t[0]),
            a && a.focus()
        }, 350))
    }
    function dt() {
        j && (j.classList.remove("is-open"),
        j.setAttribute("aria-hidden", "true"),
        document.body.classList.remove("modal-open"),
        Ne(),
        ut && ut.focus())
    }
    qe && qe.addEventListener("click", ar),
    Array.prototype.slice.call(document.querySelectorAll("[data-open-modal]")).forEach(function(e) {
        e.addEventListener("click", ar)
    }),
    Array.prototype.slice.call(document.querySelectorAll("[data-close-modal]")).forEach(function(e) {
        e.addEventListener("click", dt)
    }),
    document.addEventListener("keydown", function(e) {
        if (!(!j || !j.classList.contains("is-open"))) {
            if (e.key === "Escape") {
                dt();
                return
            }
            tr(e, rr || j)
        }
    }),
    Ie && Ie.addEventListener("click", function() {
        if (x) {
            x.scrollTo(0);
            return
        }
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        })
    });
    var Kr = Array.prototype.slice.call(document.querySelectorAll("[data-tilt]"))
      , Qr = window.matchMedia && window.matchMedia("(pointer: fine)").matches;
    Qr && !F && Kr.forEach(function(e) {
        var t = null
          , a = e.querySelector(".project-card__btn") || e
          , n = e.querySelector(".project-card__media img")
          , r = {
            active: !1,
            rotateX: 0,
            rotateY: 0,
            targetX: 0,
            targetY: 0,
            rect: null,
            parallaxX: 0,
            parallaxY: 0,
            targetParallaxX: 0,
            targetParallaxY: 0
        }
          , i = 14
          , c = 1.2
          , u = 0;
        function d() {
            a.style.transform = "perspective(900px) rotateX(" + r.rotateX.toFixed(3) + "deg) rotateY(" + r.rotateY.toFixed(3) + "deg)",
            n && (n.style.transform = "translate3d(" + r.parallaxX.toFixed(2) + "px, " + r.parallaxY.toFixed(2) + "px, 0) scale(1.12)")
        }
        function l() {
            var s = r.active ? Math.min(1, (performance.now() - u) / 320) : 1
              , w = (r.active ? .07 : .055) * (.4 + .6 * s)
              , A = (r.active ? .055 : .045) * (.35 + .65 * s);
            r.rotateX += (r.targetX - r.rotateX) * w,
            r.rotateY += (r.targetY - r.rotateY) * w,
            r.parallaxX += (r.targetParallaxX - r.parallaxX) * A,
            r.parallaxY += (r.targetParallaxY - r.parallaxY) * A,
            d();
            var E = Math.abs(r.targetX - r.rotateX) > .02 || Math.abs(r.targetY - r.rotateY) > .02 || Math.abs(r.targetParallaxX - r.parallaxX) > .12 || Math.abs(r.targetParallaxY - r.parallaxY) > .12;
            r.active || E ? t = window.requestAnimationFrame(l) : (r.rotateX = r.targetX,
            r.rotateY = r.targetY,
            r.parallaxX = r.targetParallaxX,
            r.parallaxY = r.targetParallaxY,
            d(),
            t = null,
            e.classList.remove("is-tilting"))
        }
        function p() {
            t || (t = window.requestAnimationFrame(l))
        }
        function f() {
            r.rect = e.getBoundingClientRect()
        }
        function y(s, w) {
            if (r.rect) {
                var A = r.rect
                  , E = Math.max(0, Math.min(1, (s - A.left) / A.width))
                  , X = Math.max(0, Math.min(1, (w - A.top) / A.height));
                r.targetX = (.5 - X) * c,
                r.targetY = (E - .5) * c,
                r.targetParallaxX = (E - .5) * -2 * i,
                r.targetParallaxY = (X - .5) * -2 * i
            }
        }
        function o(s) {
            if (!(!r.active || !r.rect)) {
                var w = r.rect;
                if (s.clientX < w.left || s.clientX > w.right || s.clientY < w.top || s.clientY > w.bottom) {
                    m();
                    return
                }
                y(s.clientX, s.clientY),
                p()
            }
        }
        function m() {
            r.active && (r.active = !1,
            r.targetX = 0,
            r.targetY = 0,
            r.targetParallaxX = 0,
            r.targetParallaxY = 0,
            r.rect = null,
            window.removeEventListener("pointermove", o),
            window.removeEventListener("scroll", f, !0),
            p())
        }
        function g(s) {
            r.active || (r.active = !0,
            u = performance.now(),
            e.classList.add("is-tilting"),
            f(),
            y(s.clientX, s.clientY),
            window.addEventListener("pointermove", o, {
                passive: !0
            }),
            window.addEventListener("scroll", f, !0),
            p())
        }
        e.addEventListener("pointerenter", g),
        e.addEventListener("pointerleave", m)
    });
    var R = document.getElementById("lightbox")
      , te = document.getElementById("lightbox-img")
      , nr = document.getElementById("lightbox-title")
      , ft = document.getElementById("lightbox-desc")
      , ir = document.getElementById("lightbox-current")
      , or = document.getElementById("lightbox-total")
      , we = document.getElementById("lightbox-prev")
      , be = document.getElementById("lightbox-next")
      , vt = document.getElementById("lightbox-close")
      , xe = document.getElementById("lightbox-photo")
      , ra = R ? R.querySelector(".lightbox__stage") : null
      , T = {
        project: null,
        sources: null,
        count: 0,
        index: 0,
        title: "",
        desc: ""
    }
      , mt = null
      , pt = !1;
    function ne() {
        if (typeof ne.cache == "boolean")
            return ne.cache;
        try {
            ne.cache = document.createElement("canvas").toDataURL("image/webp").indexOf("data:image/webp") === 0
        } catch (e) {
            ne.cache = !1
        }
        return ne.cache
    }
    function $r(e, t) {
        var a = t + 1 < 10 ? "0" + (t + 1) : String(t + 1)
          , n = "assets/img/portfolio/project-" + e + "/" + a
          , r = String(e);
        return ne() && (r === "1" || r === "2" || r === "3" || r === "4" || r === "5" || r === "6") ? n + ".webp" : n + ".jpg"
    }
    function Zr() {
        return T.sources && T.sources[T.index] ? T.sources[T.index] : null
    }
    function sr(e) {
        Array.prototype.forEach.call(document.body.children, function(t) {
            t === R || t.tagName === "SCRIPT" || t.tagName === "SVG" || (e ? t.setAttribute("inert", "") : t.removeAttribute("inert"))
        })
    }
    function Jr() {
        var e = T.count > 1;
        we && (we.hidden = !e,
        we.disabled = !e),
        be && (be.hidden = !e,
        be.disabled = !e),
        xe && (xe.disabled = !e,
        xe.setAttribute("aria-label", e ? "\u0421\u043B\u0435\u0434\u0443\u044E\u0449\u0435\u0435 \u0444\u043E\u0442\u043E" : "\u0424\u043E\u0442\u043E"))
    }
    function ht() {
        if (te) {
            te.classList.remove("is-loaded");
            var e = Zr()
              , t = e ? e.src : $r(T.project, T.index)
              , a = e ? e.title : T.title
              , n = e ? e.desc : T.desc
              , r = e ? e.alt || a : a + " - \u0444\u043E\u0442\u043E " + (T.index + 1)
              , i = t.replace(/\.webp$/i, ".jpg")
              , c = new Image;
            c.onload = function() {
                te.src = c.src,
                te.alt = r,
                requestAnimationFrame(function() {
                    te.classList.add("is-loaded")
                })
            }
            ,
            c.onerror = function() {
                if (i !== t && c.src.indexOf(i) === -1) {
                    c.src = i;
                    return
                }
                te.removeAttribute("src"),
                te.alt = (a || "\u0424\u043E\u0442\u043E") + " - \u0444\u043E\u0442\u043E \u043D\u0435\u0434\u043E\u0441\u0442\u0443\u043F\u043D\u043E"
            }
            ,
            c.src = t,
            nr && (nr.textContent = a || ""),
            ft && (ft.textContent = n || "",
            ft.hidden = !n),
            ir && (ir.textContent = T.index + 1),
            or && (or.textContent = T.count),
            R && (a ? (R.setAttribute("aria-labelledby", "lightbox-title"),
            R.removeAttribute("aria-label")) : (R.setAttribute("aria-label", "\u0413\u0430\u043B\u0435\u0440\u0435\u044F \u043F\u0440\u043E\u0435\u043A\u0442\u0430"),
            R.removeAttribute("aria-labelledby"))),
            Jr()
        }
    }
    function lr() {
        R && (ht(),
        mt = document.activeElement,
        R.classList.add("is-open"),
        R.setAttribute("aria-hidden", "false"),
        document.body.classList.add("lightbox-open"),
        sr(!0),
        Ve(),
        window.setTimeout(function() {
            var e = ct(R)
              , t = vt || (e.length ? e[0] : null);
            t && t.focus()
        }, 200))
    }
    function ea(e, t, a, n, r) {
        T = {
            project: e,
            sources: null,
            count: t,
            index: r || 0,
            title: a,
            desc: n
        },
        lr()
    }
    function gt(e, t) {
        !e || !e.length || (T = {
            project: null,
            sources: e,
            count: e.length,
            index: t || 0,
            title: "",
            desc: ""
        },
        lr())
    }
    function yt() {
        R && (R.classList.remove("is-open"),
        R.setAttribute("aria-hidden", "true"),
        document.body.classList.remove("lightbox-open"),
        sr(!1),
        Ne(),
        mt && mt.focus())
    }
    function Xe() {
        T.index = (T.index + 1) % T.count,
        ht()
    }
    function wt() {
        T.index = (T.index - 1 + T.count) % T.count,
        ht()
    }
    Array.prototype.slice.call(document.querySelectorAll(".project-card")).forEach(function(e) {
        var t = e.querySelector(".project-card__btn");
        t && t.addEventListener("click", function() {
            var a = e.querySelector(".project-card__title")
              , n = e.querySelector(".project-card__desc");
            ea(e.getAttribute("data-project"), parseInt(e.getAttribute("data-count"), 10) || 1, a ? a.textContent.trim() : "", n ? n.textContent.trim() : "", 0)
        })
    }),
    (function() {
        var t = Array.prototype.slice.call(document.querySelectorAll(".collage__hit[data-full]"));
        if (t.length) {
            var a = t.map(function(n) {
                var r = n.getAttribute("data-caption") || "";
                return {
                    src: n.getAttribute("data-full"),
                    alt: r,
                    title: r,
                    desc: ""
                }
            });
            t.forEach(function(n, r) {
                n.addEventListener("click", function() {
                    gt(a, r)
                })
            })
        }
    }
    )(),
    (function() {
        var t = Array.prototype.slice.call(document.querySelectorAll(".project-gallery__item"));
        if (t.length) {
            var a = t.map(function(n, r) {
                var i = n.querySelector("img");
                return {
                    src: i ? i.currentSrc || i.src : "",
                    alt: i ? i.alt : "\u0424\u043E\u0442\u043E \u043F\u0440\u043E\u0435\u043A\u0442\u0430",
                    title: "\u0414\u043E\u043C \u0441 \u0442\u0451\u043F\u043B\u044B\u043C \u043E\u0447\u0430\u0433\u043E\u043C",
                    desc: "\u0418\u043D\u0442\u0435\u0440\u044C\u0435\u0440 \u0447\u0430\u0441\u0442\u043D\u043E\u0433\u043E \u0434\u043E\u043C\u0430, \u0444\u043E\u0442\u043E " + (r + 1)
                }
            });
            t.forEach(function(n, r) {
                n.setAttribute("tabindex", "0"),
                n.setAttribute("role", "button"),
                n.setAttribute("aria-label", "\u041E\u0442\u043A\u0440\u044B\u0442\u044C \u0444\u043E\u0442\u043E " + (r + 1)),
                n.addEventListener("click", function() {
                    gt(a, r)
                }),
                n.addEventListener("keydown", function(i) {
                    (i.key === "Enter" || i.key === " ") && (i.preventDefault(),
                    gt(a, r))
                })
            })
        }
    }
    )(),
    be && be.addEventListener("click", Xe),
    we && we.addEventListener("click", wt),
    vt && vt.addEventListener("click", yt),
    xe && xe.addEventListener("click", function() {
        if (pt) {
            pt = !1;
            return
        }
        T.count > 1 && Xe()
    }),
    Array.prototype.slice.call(document.querySelectorAll("[data-close-lightbox]")).forEach(function(e) {
        e.addEventListener("click", yt)
    }),
    document.addEventListener("keydown", function(e) {
        if (!(!R || !R.classList.contains("is-open"))) {
            if (e.key === "Escape") {
                yt();
                return
            }
            e.key === "ArrowRight" && Xe(),
            e.key === "ArrowLeft" && wt(),
            tr(e, R)
        }
    }),
    (function() {
        var e = 0
          , t = R ? R.querySelector(".lightbox__stage") : null;
        t && (t.addEventListener("touchstart", function(a) {
            e = a.changedTouches[0].screenX
        }, {
            passive: !0
        }),
        t.addEventListener("touchend", function(a) {
            var n = a.changedTouches[0].screenX - e;
            Math.abs(n) > 50 && (pt = !0,
            n < 0 ? Xe() : wt())
        }, {
            passive: !0
        }))
    }
    )()
}
)();
