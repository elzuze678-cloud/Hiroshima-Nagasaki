/* ═══════════════════════════════════════════════
   Hiroshima & Nagasaki — Interactive Presentation
   GSAP Horizontal Scroll + 3D Slide Animations
   ═══════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger);

// ─── Globals ───
const PANEL_COUNT = 6;
let currentPanel = 0;

// ─── Wait for DOM + fonts ───
window.addEventListener("load", () => {
    initLoader();
});

/* ═══════════════ LOADER ═══════════════ */
function initLoader() {
    const tl = gsap.timeline({
        onComplete: () => {
            document.getElementById("loader").style.display = "none";
            initApp();
        }
    });
    tl.to("#loader", { autoAlpha: 0, duration: 0.8, delay: 1.2, ease: "power2.inOut" });
}

/* ═══════════════ MAIN INIT ═══════════════ */
function initApp() {
    createParticles();
    initHorizontalScroll();
    initNavigation();
    initPanelAnimations();
    initCounters();
    initDataRing();
}

/* ═══════════════ PARTICLES ═══════════════ */
function createParticles() {
    const container = document.getElementById("heroParticles");
    if (!container) return;
    for (let i = 0; i < 40; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        p.style.left = Math.random() * 100 + "%";
        p.style.top = Math.random() * 100 + "%";
        container.appendChild(p);

        gsap.to(p, {
            y: -200 - Math.random() * 300,
            x: (Math.random() - 0.5) * 100,
            opacity: Math.random() * 0.4 + 0.1,
            duration: 6 + Math.random() * 8,
            repeat: -1,
            delay: Math.random() * 5,
            ease: "none"
        });
    }
}

/* ═══════════════ HORIZONTAL SCROLL ═══════════════ */
function initHorizontalScroll() {
    const track = document.getElementById("horizontalTrack");
    const panels = gsap.utils.toArray(".panel");

    // Total scroll width = (number of panels - 1) * viewport width
    const getScrollWidth = () => track.scrollWidth - window.innerWidth;

    // Pin the wrapper and scrub the track horizontally
    const scrollTween = gsap.to(track, {
        x: () => -getScrollWidth(),
        ease: "none",
        scrollTrigger: {
            trigger: "#horizontalWrapper",
            pin: true,
            start: "top top",
            end: () => "+=" + getScrollWidth(),
            scrub: 0.3,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                // Update progress bar
                const bar = document.getElementById("progressBar");
                if (bar) bar.style.width = (self.progress * 100) + "%";

                // Determine current panel
                const idx = Math.round(self.progress * (PANEL_COUNT - 1));
                if (idx !== currentPanel) {
                    currentPanel = idx;
                    updateActiveNav(idx);
                }
            }
        }
    });

    // Store reference for nav click scrolling
    window._scrollTween = scrollTween;
    window._scrollTriggerInstance = scrollTween.scrollTrigger;

    // Add wheel event for faster slide transitions with less movement
    let wheelTimeout;
    let wheelDelta = 0;
    window.addEventListener("wheel", (e) => {
        // Only intercept wheel on horizontal wrapper
        if (!document.getElementById("horizontalWrapper").contains(e.target)) return;

        wheelDelta += e.deltaY * 0.001;
        
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
            const st = window._scrollTriggerInstance;
            if (!st) return;

            // Calculate new scroll position
            const currentScroll = st.getVelocity ? st.scrollY : window.scrollY;
            const newScroll = currentScroll + wheelDelta * 200;

            // Smooth scroll to new position
            gsap.to(window, {
                scrollTo: newScroll,
                duration: 0.6,
                ease: "power2.out",
                overwrite: "auto"
            });

            wheelDelta = 0;
        }, 50);
    }, { passive: true });
}

/* ═══════════════ NAVIGATION ═══════════════ */
function initNavigation() {
    // Show nav
    gsap.to(".nav", { autoAlpha: 1, y: 0, duration: 0.8, delay: 0.3, ease: "power2.out" });

    // Nav button clicks
    document.querySelectorAll(".nav__link").forEach(btn => {
        btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.section);
            const st = window._scrollTriggerInstance;
            if (!st) return;

            const targetProgress = idx / (PANEL_COUNT - 1);
            const targetScroll = st.start + targetProgress * (st.end - st.start);

            gsap.to(window, {
                scrollTo: targetScroll,
                duration: 1.2,
                ease: "power3.inOut"
            });
        });
    });
}

function updateActiveNav(idx) {
    document.querySelectorAll(".nav__link").forEach((btn, i) => {
        btn.classList.toggle("active", i === idx);
    });
}

/* ═══════════════ PANEL ANIMATIONS ═══════════════ */
function initPanelAnimations() {
    // ─── Panel 0: Hero entrance ───
    const heroTL = gsap.timeline({ delay: 0.4 });
    heroTL
        .from("#heroDate", { autoAlpha: 0, x: -40, duration: 1, ease: "power3.out" })
        .from(".hero__title-line", { autoAlpha: 0, y: 60, duration: 1.2, stagger: 0.2, ease: "power3.out" }, "-=0.6")
        .from(".hero__title-ampersand", { autoAlpha: 0, scale: 0.5, duration: 0.6, ease: "back.out(1.7)" }, "-=0.8")
        .from("#heroSubtitle", { autoAlpha: 0, y: 30, duration: 0.8, ease: "power2.out" }, "-=0.4")
        .from("#heroScrollCue", { autoAlpha: 0, x: -20, duration: 0.6, ease: "power2.out" }, "-=0.3")
        .from("#heroImageFrame", { autoAlpha: 0, x: 100, rotationY: 15, duration: 1.4, ease: "power3.out" }, "-=1.2");

    // ─── Panel 1: Context - slide in from right with 3D ───
    const contextTL = gsap.timeline({
        scrollTrigger: {
            trigger: "#panel-1",
            containerAnimation: window._scrollTween,
            start: "left 80%",
            end: "left 20%",
            toggleActions: "play none none reverse"
        }
    });
    contextTL
        .from("#contextText", { autoAlpha: 0, x: 120, rotationY: -8, duration: 1.2, ease: "power3.out" })
        .from(".timeline__item", { autoAlpha: 0, x: 60, duration: 0.7, stagger: 0.15, ease: "power2.out" }, "-=0.6");

    // ─── Panel 2: Hiroshima ───
    const hiroTL = gsap.timeline({
        scrollTrigger: {
            trigger: "#panel-2",
            containerAnimation: window._scrollTween,
            start: "left 80%",
            end: "left 20%",
            toggleActions: "play none none reverse"
        }
    });
    hiroTL
        .from("#hiroshimaHeader", { autoAlpha: 0, x: 100, duration: 1, ease: "power3.out" })
        .from(".stat-card", { autoAlpha: 0, y: 40, x: 60, rotationY: -5, duration: 0.8, stagger: 0.15, ease: "power3.out" }, "-=0.5")
        .from(".narrative__block", { autoAlpha: 0, x: 80, duration: 0.9, stagger: 0.2, ease: "power2.out" }, "-=0.5")
        .from("#hiroshimaMap", { autoAlpha: 0, scale: 0.8, y: 20, duration: 1, ease: "power3.out" }, "-=0.5");

    // ─── Panel 3: Nagasaki ───
    const nagaTL = gsap.timeline({
        scrollTrigger: {
            trigger: "#panel-3",
            containerAnimation: window._scrollTween,
            start: "left 80%",
            end: "left 20%",
            toggleActions: "play none none reverse"
        }
    });
    nagaTL
        .from("#nagasakiHeader", { autoAlpha: 0, x: 100, duration: 1, ease: "power3.out" })
        .from("#nagasakiStory .section-body", { autoAlpha: 0, x: 60, duration: 0.8, stagger: 0.15, ease: "power2.out" }, "-=0.5")
        .from("#nagasakiDataRing", { autoAlpha: 0, scale: 0.7, rotationY: 10, duration: 1.2, ease: "power3.out" }, "-=0.6")
        .from("#nagasakiMap", { autoAlpha: 0, scale: 0.8, y: 20, duration: 1, ease: "power3.out" }, "-=0.8");


    // ─── Panel 4: Aftermath ───
    const afterTL = gsap.timeline({
        scrollTrigger: {
            trigger: "#panel-4",
            containerAnimation: window._scrollTween,
            start: "left 80%",
            end: "left 20%",
            toggleActions: "play none none reverse"
        }
    });
    afterTL
        .from("#aftermathHeader", { autoAlpha: 0, x: 100, duration: 1, ease: "power3.out" })
        .from(".aftermath-card", { autoAlpha: 0, y: 60, x: 40, rotationX: 5, duration: 0.8, stagger: 0.12, ease: "power3.out" }, "-=0.5")
        .from("#aftermathTotal", { autoAlpha: 0, y: 40, duration: 1, ease: "power2.out" }, "-=0.3");

    // ─── Panel 5: Legacy ───
    const legTL = gsap.timeline({
        scrollTrigger: {
            trigger: "#panel-5",
            containerAnimation: window._scrollTween,
            start: "left 80%",
            end: "left 20%",
            toggleActions: "play none none reverse"
        }
    });
    legTL
        .from("#legacyHeader", { autoAlpha: 0, x: 100, duration: 1, ease: "power3.out" })
        .from(".legacy__quote", { autoAlpha: 0, x: 60, duration: 1, ease: "power2.out" }, "-=0.5")
        .from(".legacy-pillar", { autoAlpha: 0, y: 40, x: 30, duration: 0.8, stagger: 0.15, ease: "power3.out" }, "-=0.5")
        .from("#legacyClosing", { autoAlpha: 0, y: 30, duration: 1, ease: "power2.out" }, "-=0.3");
}

/* ═══════════════ ANIMATED COUNTERS ═══════════════ */
function initCounters() {
    const counter = document.querySelector(".counter");
    if (!counter) return;

    const target = parseInt(counter.dataset.target);

    ScrollTrigger.create({
        trigger: "#panel-4",
        containerAnimation: window._scrollTween,
        start: "left 60%",
        onEnter: () => animateCounter(counter, target),
        once: true
    });
}

function animateCounter(el, target) {
    const obj = { val: 0 };
    gsap.to(obj, {
        val: target,
        duration: 2.5,
        ease: "power2.out",
        onUpdate: () => {
            el.textContent = Math.floor(obj.val).toLocaleString("es-ES");
        }
    });
}

/* ═══════════════ DATA RING (SVG) ═══════════════ */
function initDataRing() {
    const fills = document.querySelectorAll(".data-ring__fill");
    if (!fills.length) return;

    ScrollTrigger.create({
        trigger: "#panel-3",
        containerAnimation: window._scrollTween,
        start: "left 60%",
        onEnter: () => {
            fills.forEach(circle => {
                const r = parseFloat(circle.getAttribute("r"));
                const circumference = 2 * Math.PI * r;
                const percent = parseFloat(circle.dataset.percent) || 50;
                const offset = circumference - (percent / 100) * circumference;

                circle.style.strokeDasharray = circumference;
                circle.style.strokeDashoffset = circumference;

                gsap.to(circle, {
                    strokeDashoffset: offset,
                    duration: 2,
                    ease: "power2.out",
                    delay: 0.3
                });
            });
        },
        once: true
    });
}

/* ═══════════════ SOUND TOGGLE (visual only) ═══════════════ */
document.getElementById("soundToggle")?.addEventListener("click", function () {
    this.classList.toggle("muted");
});

/* ═══════════════ SCROLL-TO PLUGIN FALLBACK ═══════════════ */
// Simple scrollTo if GSAP ScrollTo plugin isn't loaded
if (!gsap.plugins?.scrollTo) {
    gsap.registerEffect({
        name: "scrollTo",
        effect: (targets, config) => {
            return gsap.to(window, {
                duration: config.duration || 1,
                ease: config.ease || "power3.inOut",
                onUpdate: function () {
                    window.scrollTo(0, gsap.getProperty(this, "progress") * config.scrollTo);
                }
            });
        }
    });
}

// Nav click - simple scroll approach
document.querySelectorAll(".nav__link").forEach(btn => {
    btn.addEventListener("click", () => {
        const idx = parseInt(btn.dataset.section);
        const st = window._scrollTriggerInstance;
        if (!st) return;

        const targetProgress = idx / (PANEL_COUNT - 1);
        const targetScroll = st.start + targetProgress * (st.end - st.start);

        window.scrollTo({ top: targetScroll, behavior: "smooth" });
    });
});
