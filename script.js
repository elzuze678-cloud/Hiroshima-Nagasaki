/* ═══════════════════════════════════════════════
   Hiroshima & Nagasaki — Interactive Presentation
   Fixed: overflow clipping, smooth GSAP animations,
   Animated atomic blast map (Canvas)
   ═══════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

const PANEL_COUNT = 6;
let currentPanel = 0;

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
    tl.to("#loader", { autoAlpha: 0, duration: 0.8, delay: 1.0, ease: "power2.inOut" });
}

/* ═══════════════ MAIN INIT ═══════════════ */
function initApp() {
    createParticles();
    initHorizontalScroll();
    initNavigation();
    initPanelAnimations();
    initCounters();
    initDataRing();
    initBlastMaps();
}

/* ═══════════════ PARTICLES ═══════════════ */
function createParticles() {
    const container = document.getElementById("heroParticles");
    if (!container) return;
    for (let i = 0; i < 35; i++) {
        const p = document.createElement("div");
        p.className = "particle";
        p.style.left = Math.random() * 100 + "%";
        p.style.top = Math.random() * 100 + "%";
        container.appendChild(p);
        gsap.to(p, {
            y: -180 - Math.random() * 280,
            x: (Math.random() - 0.5) * 90,
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
    const getScrollWidth = () => track.scrollWidth - window.innerWidth;

    const scrollTween = gsap.to(track, {
        x: () => -getScrollWidth(),
        ease: "none",
        scrollTrigger: {
            trigger: "#horizontalWrapper",
            pin: true,
            start: "top top",
            end: () => "+=" + getScrollWidth(),
            scrub: 0.5,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
                const bar = document.getElementById("progressBar");
                if (bar) bar.style.width = (self.progress * 100) + "%";

                const idx = Math.round(self.progress * (PANEL_COUNT - 1));
                if (idx !== currentPanel) {
                    currentPanel = idx;
                    updateActiveNav(idx);
                    // Auto-start blast maps when panel becomes visible
                    if (idx === 2) blastMaps.hiro && blastMaps.hiro.autoStart();
                    if (idx === 3) blastMaps.naga && blastMaps.naga.autoStart();
                }
            }
        }
    });

    window._scrollTween = scrollTween;
    window._scrollTriggerInstance = scrollTween.scrollTrigger;
}

/* ═══════════════ NAVIGATION ═══════════════ */
function initNavigation() {
    gsap.to(".nav", { autoAlpha: 1, y: 0, duration: 0.8, delay: 0.3, ease: "power2.out" });

    document.querySelectorAll(".nav__link").forEach(btn => {
        btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.section);
            const st = window._scrollTriggerInstance;
            if (!st) return;
            const targetProgress = idx / (PANEL_COUNT - 1);
            const targetScroll = st.start + targetProgress * (st.end - st.start);
            gsap.to(window, { scrollTo: targetScroll, duration: 1.1, ease: "power3.inOut" });
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
    // Panel 0: Hero
    const heroTL = gsap.timeline({ delay: 0.5 });
    heroTL
        .from("#heroDate", { autoAlpha: 0, x: -40, duration: 0.9, ease: "power3.out" })
        .from(".hero__title-line", { autoAlpha: 0, y: 55, duration: 1.1, stagger: 0.2, ease: "power3.out" }, "-=0.5")
        .from(".hero__title-ampersand", { autoAlpha: 0, scale: 0.4, duration: 0.6, ease: "back.out(1.7)" }, "-=0.7")
        .from("#heroSubtitle", { autoAlpha: 0, y: 25, duration: 0.8, ease: "power2.out" }, "-=0.3")
        .from("#heroScrollCue", { autoAlpha: 0, x: -20, duration: 0.6, ease: "power2.out" }, "-=0.2")
        .from("#heroImageFrame", { autoAlpha: 0, x: 80, rotationY: 12, duration: 1.3, ease: "power3.out" }, "-=1.1");

    // Helper: containerAnimation with proper scroll tween reference
    function panelTL(panelId, onEnterCb) {
        return gsap.timeline({
            scrollTrigger: {
                trigger: panelId,
                containerAnimation: window._scrollTween,
                start: "left 85%",
                end: "left 20%",
                toggleActions: "play none none reverse",
                onEnter: onEnterCb || null
            }
        });
    }

    // Panel 1: Context
    const ctxTL = panelTL("#panel-1");
    ctxTL
        .from("#contextText", { autoAlpha: 0, x: 100, rotationY: -6, duration: 1.1, ease: "power3.out" })
        .from(".timeline__item", { autoAlpha: 0, x: 50, duration: 0.65, stagger: 0.12, ease: "power2.out" }, "-=0.5");

    // Panel 2: Hiroshima
    const hiroTL = panelTL("#panel-2");
    hiroTL
        .from("#hiroshimaHeader", { autoAlpha: 0, x: 90, duration: 0.9, ease: "power3.out" })
        .from(".stat-card", { autoAlpha: 0, y: 35, x: 50, rotationY: -4, duration: 0.75, stagger: 0.12, ease: "power3.out" }, "-=0.4")
        .from(".narrative__block", { autoAlpha: 0, x: 60, duration: 0.8, stagger: 0.18, ease: "power2.out" }, "-=0.4")
        .from("#hiroshimaBlastMap", { autoAlpha: 0, y: 20, duration: 0.9, ease: "power3.out" }, "-=0.3");

    // Panel 3: Nagasaki
    const nagaTL = panelTL("#panel-3");
    nagaTL
        .from("#nagasakiHeader", { autoAlpha: 0, x: 90, duration: 0.9, ease: "power3.out" })
        .from("#nagasakiStory .section-body", { autoAlpha: 0, x: 50, duration: 0.7, stagger: 0.13, ease: "power2.out" }, "-=0.4")
        .from("#nagasakiDataRing", { autoAlpha: 0, scale: 0.75, rotationY: 8, duration: 1.1, ease: "power3.out" }, "-=0.5")
        .from("#nagasakiBlastMap", { autoAlpha: 0, y: 20, duration: 0.9, ease: "power3.out" }, "-=0.7");

    // Panel 4: Aftermath
    const afterTL = panelTL("#panel-4");
    afterTL
        .from("#aftermathHeader", { autoAlpha: 0, x: 90, duration: 0.9, ease: "power3.out" })
        .from(".aftermath-card", { autoAlpha: 0, y: 50, x: 30, rotationX: 4, duration: 0.75, stagger: 0.1, ease: "power3.out" }, "-=0.4")
        .from("#aftermathTotal", { autoAlpha: 0, y: 30, duration: 0.9, ease: "power2.out" }, "-=0.2");

    // Panel 5: Legacy
    const legTL = panelTL("#panel-5");
    legTL
        .from("#legacyHeader", { autoAlpha: 0, x: 90, duration: 0.9, ease: "power3.out" })
        .from(".legacy__quote", { autoAlpha: 0, x: 50, duration: 0.9, ease: "power2.out" }, "-=0.4")
        .from(".legacy-pillar", { autoAlpha: 0, y: 35, x: 25, duration: 0.75, stagger: 0.13, ease: "power3.out" }, "-=0.4")
        .from("#legacyClosing", { autoAlpha: 0, y: 25, duration: 0.9, ease: "power2.out" }, "-=0.2");
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
        onEnter: () => {
            const obj = { val: 0 };
            gsap.to(obj, {
                val: target, duration: 2.5, ease: "power2.out",
                onUpdate: () => { counter.textContent = Math.floor(obj.val).toLocaleString("es-ES"); }
            });
        },
        once: true
    });
}

/* ═══════════════ DATA RING ═══════════════ */
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
                gsap.to(circle, { strokeDashoffset: offset, duration: 2, ease: "power2.out", delay: 0.4 });
            });
        },
        once: true
    });
}

/* ═══════════════════════════════════════════════
   ATOMIC BLAST MAP — Canvas-based animation
   Renders: city grid → bomb drop path → flash →
   expanding fireball + shockwave + destruction zones
   ═══════════════════════════════════════════════ */

const blastMaps = {};

function initBlastMaps() {
    blastMaps.hiro = createBlastMap({
        canvasId: "hiroCanvas",
        timeFillId: "hiroTimeFill",
        timeLabelId: "hiroTimeLabel",
        replayBtn: document.querySelector('[data-map="hiro"]'),
        // Hiroshima: flat delta, wide destruction
        cityShape: "delta",
        blastRadius1: 0.18,   // total destruction (1.6km equiv)
        blastRadius2: 0.36,   // severe damage (3.5km equiv)
        blastColor1: "rgba(192,64,64,",
        blastColor2: "rgba(196,130,64,",
        label: "Little Boy — 13 kt"
    });
    blastMaps.naga = createBlastMap({
        canvasId: "nagaCanvas",
        timeFillId: "nagaTimeFill",
        timeLabelId: "nagaTimeLabel",
        replayBtn: document.querySelector('[data-map="naga"]'),
        // Nagasaki: valley shape, constrained radius
        cityShape: "valley",
        blastRadius1: 0.20,
        blastRadius2: 0.30,    // mountains limit spread
        blastColor1: "rgba(200,80,50,",
        blastColor2: "rgba(180,120,60,",
        label: "Fat Man — 21 kt"
    });

    document.querySelectorAll(".blast-replay-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const key = btn.dataset.map;
            if (blastMaps[key]) blastMaps[key].replay();
        });
    });
}

function createBlastMap(cfg) {
    const canvas = document.getElementById(cfg.canvasId);
    if (!canvas) return null;
    const ctx = canvas.getContext("2d");

    let W, H, cx, cy;
    let raf = null;
    let phase = "idle";  // idle → drop → flash → expand → debris → done
    let t = 0;           // normalized 0–1 per phase
    let started = false;

    function resize() {
        const rect = canvas.parentElement.getBoundingClientRect();
        W = canvas.width = rect.width;
        H = canvas.height = canvas.offsetHeight || 260;
        cx = W / 2;
        cy = H / 2;
    }

    // City grid — schematic top-down view
    function drawCity(destructionProgress) {
        ctx.save();
        // Background
        ctx.fillStyle = "#0d0d0f";
        ctx.fillRect(0, 0, W, H);

        // Subtle grid (street layout)
        ctx.strokeStyle = "rgba(255,255,255,0.04)";
        ctx.lineWidth = 1;
        const spacing = 22;
        for (let x = 0; x < W; x += spacing) {
            ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
        }
        for (let y = 0; y < H; y += spacing) {
            ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
        }

        // City shape outline
        if (cfg.cityShape === "valley") {
            // Nagasaki valley: elliptical, oriented N-S
            ctx.beginPath();
            ctx.ellipse(cx, cy, W * 0.28, H * 0.44, 0.2, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(100,90,70,0.2)";
            ctx.lineWidth = 1.5;
            ctx.stroke();
            // Mountains on sides (dotted)
            ctx.setLineDash([4, 6]);
            ctx.strokeStyle = "rgba(80,100,80,0.15)";
            ctx.beginPath();
            ctx.ellipse(cx - W*0.22, cy, W * 0.18, H * 0.48, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.beginPath();
            ctx.ellipse(cx + W*0.22, cy, W * 0.18, H * 0.48, 0, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);
        } else {
            // Hiroshima delta: fan shape, rivers
            ctx.beginPath();
            ctx.moveTo(cx, cy - H * 0.4);
            ctx.lineTo(cx + W * 0.35, cy + H * 0.3);
            ctx.lineTo(cx - W * 0.35, cy + H * 0.3);
            ctx.closePath();
            ctx.strokeStyle = "rgba(80,100,120,0.2)";
            ctx.lineWidth = 1.5;
            ctx.stroke();
            // Rivers
            ctx.strokeStyle = "rgba(60,80,140,0.2)";
            ctx.lineWidth = 2;
            for (let r = -2; r <= 2; r++) {
                ctx.beginPath();
                ctx.moveTo(cx + r * W * 0.08, cy - H * 0.3);
                ctx.quadraticCurveTo(cx + r * W * 0.12, cy, cx + r * W * 0.15, cy + H * 0.4);
                ctx.stroke();
            }
        }

        // Building dots (random but seeded)
        const seed = 42;
        for (let i = 0; i < 300; i++) {
            const sx = pseudoRand(seed + i * 3.1) * W;
            const sy = pseudoRand(seed + i * 7.3) * H;
            const dist = Math.hypot(sx - cx, sy - cy) / (W * 0.5);
            if (dist > 0.85) continue;

            // Fade buildings by destruction progress
            const destroyed = dist < (destructionProgress * cfg.blastRadius1 * 2.5);
            const severe = dist < (destructionProgress * cfg.blastRadius2 * 2.0) && !destroyed;
            const alpha = destroyed ? 0.03 : severe ? 0.08 : 0.18;
            const color = destroyed ? `rgba(80,40,20,${alpha})` :
                          severe    ? `rgba(140,80,40,${alpha})` :
                                      `rgba(160,140,110,${alpha})`;
            ctx.fillStyle = color;
            ctx.fillRect(sx - 3, sy - 3, 6, 5);
        }
        ctx.restore();
    }

    function pseudoRand(seed) {
        const x = Math.sin(seed) * 43758.5453;
        return x - Math.floor(x);
    }

    // Drop path: plane → epicenter
    function drawDropPath(progress) {
        const startX = cx - W * 0.3;
        const startY = cy - H * 0.35;
        const endX = cx;
        const endY = cy;
        const px = startX + (endX - startX) * progress;
        const py = startY + (endY - startY) * progress;

        // Dashed flight path
        ctx.save();
        ctx.setLineDash([6, 5]);
        ctx.strokeStyle = "rgba(196,168,130,0.3)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(px, py);
        ctx.stroke();
        ctx.setLineDash([]);

        // Plane icon
        ctx.save();
        ctx.translate(px, py);
        const angle = Math.atan2(endY - startY, endX - startX);
        ctx.rotate(angle);
        ctx.fillStyle = "rgba(196,168,130,0.7)";
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-8, -4);
        ctx.lineTo(-5, 0);
        ctx.lineTo(-8, 4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Bomb (small dot following)
        if (progress > 0.6) {
            const bp = (progress - 0.6) / 0.4;
            const bx = cx - W * 0.12 + (cx - (cx - W * 0.12)) * bp;
            const by = cy - H * 0.14 + (cy - (cy - H * 0.14)) * bp;
            ctx.beginPath();
            ctx.arc(bx, by, 4, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(196,168,130,0.5)";
            ctx.fill();
        }
        ctx.restore();
    }

    // Flash burst
    function drawFlash(progress) {
        const alpha = progress < 0.3 ? progress / 0.3 : 1 - (progress - 0.3) / 0.7;
        const r = W * 0.6 * progress;
        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        grad.addColorStop(0, `rgba(255,255,220,${alpha * 0.95})`);
        grad.addColorStop(0.15, `rgba(255,180,60,${alpha * 0.8})`);
        grad.addColorStop(0.4, `rgba(200,80,20,${alpha * 0.5})`);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
    }

    // Expanding blast zones
    function drawBlastZones(progress) {
        const r1 = W * cfg.blastRadius1 * progress;
        const r2 = W * cfg.blastRadius2 * easeOut(progress);

        // Severe damage zone
        if (cfg.cityShape === "valley") {
            // Constrained by mountains — elliptical
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(cx, cy, r2 * 0.72, r2, 0, 0, Math.PI * 2);
            const g2 = ctx.createRadialGradient(cx, cy, 0, cx, cy, r2);
            g2.addColorStop(0, cfg.blastColor2 + "0.35)");
            g2.addColorStop(1, cfg.blastColor2 + "0)");
            ctx.fillStyle = g2;
            ctx.fill();
            ctx.restore();
        } else {
            const g2 = ctx.createRadialGradient(cx, cy, r1 * 0.8, cx, cy, r2);
            g2.addColorStop(0, cfg.blastColor2 + "0.3)");
            g2.addColorStop(1, cfg.blastColor2 + "0)");
            ctx.beginPath();
            ctx.arc(cx, cy, r2, 0, Math.PI * 2);
            ctx.fillStyle = g2;
            ctx.fill();
        }

        // Total destruction zone (glowing red)
        const g1 = ctx.createRadialGradient(cx, cy, 0, cx, cy, r1);
        g1.addColorStop(0, cfg.blastColor1 + "0.9)");
        g1.addColorStop(0.5, cfg.blastColor1 + "0.6)");
        g1.addColorStop(1, cfg.blastColor1 + "0.15)");
        ctx.beginPath();
        ctx.arc(cx, cy, r1, 0, Math.PI * 2);
        ctx.fillStyle = g1;
        ctx.fill();

        // Fireball core
        const coreR = W * 0.04 * (1 + Math.sin(Date.now() * 0.006) * 0.2);
        const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, coreR);
        cg.addColorStop(0, "rgba(255,240,200,0.95)");
        cg.addColorStop(0.3, "rgba(255,140,20,0.8)");
        cg.addColorStop(1, cfg.blastColor1 + "0.2)");
        ctx.beginPath();
        ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
        ctx.fillStyle = cg;
        ctx.fill();
    }

    // Shockwave ring(s)
    function drawShockwaves(elapsed) {
        const waves = [0, 0.4, 0.75];
        waves.forEach(offset => {
            const age = Math.max(0, elapsed - offset);
            if (age <= 0) return;
            const alpha = Math.max(0, 0.7 - age * 0.55);
            const r = W * cfg.blastRadius2 * Math.min(age * 1.4, 1.1);
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(196,168,130,${alpha})`;
            ctx.lineWidth = 2 - age;
            ctx.stroke();
        });
    }

    // Debris particles
    const debris = Array.from({ length: 60 }, (_, i) => ({
        angle: (i / 60) * Math.PI * 2 + pseudoRand(i * 5) * 0.5,
        speed: 0.08 + pseudoRand(i * 11) * 0.14,
        size: 1 + pseudoRand(i * 17) * 3,
        color: `rgba(${140 + Math.floor(pseudoRand(i) * 60)},${60 + Math.floor(pseudoRand(i+1) * 40)},${20 + Math.floor(pseudoRand(i+2) * 30)},`
    }));

    function drawDebris(progress) {
        debris.forEach(d => {
            const dist = W * d.speed * progress * cfg.blastRadius2 * 4;
            const dx = cx + Math.cos(d.angle) * dist;
            const dy = cy + Math.sin(d.angle) * dist;
            const alpha = Math.max(0, 0.6 - progress * 0.5);
            ctx.beginPath();
            ctx.arc(dx, dy, d.size, 0, Math.PI * 2);
            ctx.fillStyle = d.color + alpha + ")";
            ctx.fill();
        });
    }

    // Distance rings (legend reference)
    function drawDistanceRings(progress) {
        if (progress < 0.5) return;
        const a = (progress - 0.5) * 2;
        const radii = [
            { r: W * cfg.blastRadius1, label: cfg.cityShape === "valley" ? "2.0 km" : "1.6 km", color: "rgba(192,64,64," },
            { r: W * cfg.blastRadius2, label: cfg.cityShape === "valley" ? "3.5 km" : "3.5 km", color: "rgba(196,168,100," }
        ];
        radii.forEach(ring => {
            ctx.save();
            ctx.setLineDash([5, 5]);
            ctx.strokeStyle = ring.color + (0.4 * a) + ")";
            ctx.lineWidth = 1;
            if (cfg.cityShape === "valley") {
                ctx.beginPath();
                ctx.ellipse(cx, cy, ring.r * 0.72, ring.r, 0, 0, Math.PI * 2);
            } else {
                ctx.beginPath();
                ctx.arc(cx, cy, ring.r, 0, Math.PI * 2);
            }
            ctx.stroke();
            ctx.setLineDash([]);
            // label
            ctx.fillStyle = ring.color + (0.6 * a) + ")";
            ctx.font = `10px 'JetBrains Mono', monospace`;
            ctx.fillText(ring.label, cx + ring.r * 0.7 + 4, cy - 4);
            ctx.restore();
        });

        // Epicenter label
        ctx.font = "10px 'JetBrains Mono', monospace";
        ctx.fillStyle = `rgba(196,168,130,${0.7 * a})`;
        ctx.fillText("⊕ Epicentro", cx + 10, cy - 12);
    }

    // Mushroom cloud outline (top of frame)
    function drawMushroomCloud(progress) {
        if (progress < 0.2) return;
        const p = Math.min((progress - 0.2) / 0.8, 1);
        const cloudH = H * 0.45 * p;
        const cloudW = W * 0.22 * p;
        ctx.save();
        ctx.globalAlpha = p * 0.5;

        // Stem
        ctx.beginPath();
        ctx.moveTo(cx - W * 0.03, cy);
        ctx.lineTo(cx - cloudW * 0.3, cy - cloudH);
        ctx.lineTo(cx + cloudW * 0.3, cy - cloudH);
        ctx.lineTo(cx + W * 0.03, cy);
        const stemGrad = ctx.createLinearGradient(cx, cy, cx, cy - cloudH);
        stemGrad.addColorStop(0, "rgba(200,100,40,0.6)");
        stemGrad.addColorStop(1, "rgba(180,160,100,0.3)");
        ctx.fillStyle = stemGrad;
        ctx.fill();

        // Cap
        ctx.beginPath();
        ctx.ellipse(cx, cy - cloudH, cloudW, cloudH * 0.3, 0, 0, Math.PI * 2);
        const capGrad = ctx.createRadialGradient(cx, cy - cloudH, 0, cx, cy - cloudH, cloudW);
        capGrad.addColorStop(0, "rgba(200,160,80,0.5)");
        capGrad.addColorStop(0.6, "rgba(160,100,60,0.4)");
        capGrad.addColorStop(1, "rgba(80,60,40,0)");
        ctx.fillStyle = capGrad;
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.restore();
    }

    function easeOut(t) { return 1 - Math.pow(1 - t, 2); }

    // Phase durations (seconds)
    const PHASES = {
        drop: 2.5,
        flash: 0.5,
        expand: 3.5,
        debris: 2.0
    };
    const TOTAL = PHASES.drop + PHASES.flash + PHASES.expand + PHASES.debris;
    let startTime = null;
    let animating = false;

    function animate(ts) {
        if (!startTime) startTime = ts;
        const elapsed = (ts - startTime) / 1000;
        const progress = Math.min(elapsed / TOTAL, 1);

        // Update timeline UI
        const fill = document.getElementById(cfg.timeFillId);
        const label = document.getElementById(cfg.timeLabelId);
        if (fill) fill.style.width = (progress * 100) + "%";
        if (label) label.textContent = elapsed.toFixed(1) + " s";

        // Resize in case container changed
        resize();

        // Determine phase
        let destructionProgress = 0;
        let shockwaveElapsed = 0;
        let phaseName = "drop";
        let phaseT = 0;

        if (elapsed < PHASES.drop) {
            phaseName = "drop";
            phaseT = elapsed / PHASES.drop;
        } else if (elapsed < PHASES.drop + PHASES.flash) {
            phaseName = "flash";
            phaseT = (elapsed - PHASES.drop) / PHASES.flash;
            destructionProgress = 0;
        } else if (elapsed < PHASES.drop + PHASES.flash + PHASES.expand) {
            phaseName = "expand";
            phaseT = (elapsed - PHASES.drop - PHASES.flash) / PHASES.expand;
            destructionProgress = easeOut(phaseT);
            shockwaveElapsed = phaseT * PHASES.expand;
        } else {
            phaseName = "debris";
            phaseT = (elapsed - PHASES.drop - PHASES.flash - PHASES.expand) / PHASES.debris;
            destructionProgress = 1;
            shockwaveElapsed = PHASES.expand + phaseT * PHASES.debris;
        }

        // Draw
        drawCity(destructionProgress);

        if (phaseName === "drop") {
            drawDropPath(phaseT);
        } else if (phaseName === "flash") {
            drawFlash(phaseT);
        } else {
            drawBlastZones(destructionProgress);
            drawShockwaves(shockwaveElapsed / PHASES.expand);
            drawDistanceRings(destructionProgress);
            drawMushroomCloud(phaseName === "debris" ? phaseT : 0);
            if (phaseName === "debris") drawDebris(phaseT);
        }

        if (progress < 1) {
            raf = requestAnimationFrame(animate);
        } else {
            animating = false;
        }
    }

    function start() {
        if (animating) return;
        animating = true;
        startTime = null;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(animate);
    }

    function replay() {
        if (raf) cancelAnimationFrame(raf);
        animating = false;
        const fill = document.getElementById(cfg.timeFillId);
        const label = document.getElementById(cfg.timeLabelId);
        if (fill) fill.style.width = "0%";
        if (label) label.textContent = "0.0 s";
        resize();
        drawCity(0);
        start();
    }

    // Init canvas
    resize();
    drawCity(0);

    // Kick off when first visible (IntersectionObserver)
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(e => {
            if (e.isIntersecting && !started) {
                started = true;
                start();
            }
        });
    }, { threshold: 0.3 });
    observer.observe(canvas);

    window.addEventListener("resize", () => {
        resize();
        if (!animating) drawCity(0);
    });

    return { replay, autoStart: () => { if (!started) { started = true; start(); } } };
}

/* ═══════════════ SOUND TOGGLE (visual only) ═══════════════ */
document.getElementById("soundToggle")?.addEventListener("click", function () {
    this.classList.toggle("muted");
});