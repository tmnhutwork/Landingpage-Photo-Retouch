/**
 * NESSO — CIRCULAR SPIRAL HERO ENGINE (PORTED FROM APPROVED REFERENCE v13)
 * Source of Truth: reference/nesso_circular_spiral_hero_v13.html
 * 
 * Key Principles & Acceptance Criteria:
 * [1] Exactly ONE continuous circular spiral
 * [2] 4.25 circular turns winding inward around central headline
 * [3] Even card spacing via arc-length parameterization (2600 samples)
 * [4] Uniform portrait vertical cards (56x76px, r:14px, responsive 50x68px)
 * [5] Short bottom edge points directly toward center at all times:
 *     angleToCenter = atan2(cy - y, cx - x) * 180 / Math.PI;
 *     rotation = angleToCenter - 90;
 * [6] Image rotates together with card container (no counter-rotation)
 * [7] Subtle size/depth progression: 1.08 scale (outer) -> 0.92 scale (inner)
 * [8] 100% path-locked sampling: zero accumulated drift over infinite loops
 * [9] Looping with silent reset tail (0.16) and smooth fade-in/fade-out
 * [10] Starts automatically on page load via requestAnimationFrame
 * [11] Calm, controlled ambient speed (FLOW_SPEED = 0.028)
 * [12] Center safe zone protects headline and CTA from obstruction
 * [13] Debug mode shows dashed spiral guide path and center dot
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initCircularSpiralHero();
  });

  function initCircularSpiralHero() {
    const hero = document.getElementById('hero');
    const stage = document.getElementById('stage');
    const pathEl = document.getElementById('spiralPath');
    const centerGuide = document.getElementById('centerGuide');
    const toggle = document.getElementById('togglePath');
    const centerContent = document.getElementById('center-content');
    if (!hero || !stage) return;

    // Force motion: always run spiral drift and scroll effect, bypass browser prefers-reduced-motion rule
    const reduceMotion = false;

    // Approved reference constants
    const CARD_COUNT = 100;
    const TURNS = 4.25;
    const INNER_SAFE = 210;
    const OUTER_EXTRA = 150;

    const OUTER_SCALE = 1.12;
    const INNER_SCALE = 0.88;

    // Ultra-calm ambient motion reduced by an additional 20% (0.00565 * 0.80 = 0.00452)
    const FLOW_SPEED = 0.00452;

    // Curated high-fidelity project images (mix of local retouching assets and luxury commercial fashion)
    const REAL_IMAGES = [
      'assets/images/service-model-after.png',
      'https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?auto=format&fit=crop&w=240&q=75',
      'assets/images/service-mannequin.png',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=75',
      'assets/images/service-jewelry.png',
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=240&q=75',
      'assets/images/hero-portrait.png',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=240&q=75',
      'assets/images/audience-sneakers.png',
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=240&q=75',
      'assets/images/service-zoom-cheek.png',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=240&q=75',
      'assets/images/service-zoom-jewelry.png',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=75',
      'assets/images/service-zoom-mannequin.png',
      'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=240&q=75',
      'assets/images/service-model-before.png',
      'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=240&q=75',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=240&q=75',
      'https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=240&q=75',
      'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=240&q=75',
      'https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=240&q=75',
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=240&q=75',
      'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=240&q=75',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=240&q=75',
      'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=240&q=75',
      'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=240&q=75',
      'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=240&q=75',
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=240&q=75',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=75',
      'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=240&q=75',
      'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=240&q=75',
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=240&q=75',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=240&q=75',
      'https://images.unsplash.com/photo-1517445312882-bc9910d016b7?auto=format&fit=crop&w=240&q=75',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=240&q=75'
    ];

    // Clean existing cards in stage if any
    const existingCards = stage.querySelectorAll('.card');
    existingCards.forEach(c => c.remove());

    // Generate 48 uniform portrait cards
    const cards = [];
    for (let i = 0; i < CARD_COUNT; i++) {
      const el = document.createElement('div');
      el.className = 'card';

      const img = document.createElement('img');
      img.className = 'media';
      img.alt = 'Nesso retouching work';
      img.loading = 'eager';
      img.decoding = 'async';
      img.src = REAL_IMAGES[i % REAL_IMAGES.length];

      el.appendChild(img);
      stage.appendChild(el);
      cards.push({ el, index: i });
    }

    // Toggle debug spiral path
    if (toggle) {
      toggle.addEventListener('click', () => {
        const isVisible = pathEl && pathEl.style.opacity !== '0';
        if (pathEl) pathEl.style.opacity = isVisible ? '0' : '0.30';
        if (centerGuide) centerGuide.style.opacity = isVisible ? '0' : '0.25';
        toggle.textContent = isVisible ? 'Show spiral guide' : 'Hide spiral guide';
      });
    }

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const lerp = (a, b, t) => a + (b - a) * t;

    // Mathematical spiral trajectory (identical to approved reference v13)
    function spiralPoint(u, outerR, innerR) {
      const r = lerp(outerR, innerR, u);
      const theta = -Math.PI * 0.58 + u * (Math.PI * 2 * TURNS);
      return {
        u,
        r,
        theta,
        x: Math.cos(theta) * r,
        y: Math.sin(theta) * r
      };
    }

    // High-resolution arc-length parameterization table (2600 samples)
    function buildLookup(outerR, innerR) {
      const samples = 2600;
      const pts = [];
      let totalLen = 0;
      let prev = null;

      for (let i = 0; i <= samples; i++) {
        const u = i / samples;
        const p = spiralPoint(u, outerR, innerR);

        if (prev) {
          totalLen += Math.hypot(p.x - prev.x, p.y - prev.y);
        }

        pts.push({
          u: p.u,
          x: p.x,
          y: p.y,
          theta: p.theta,
          len: totalLen
        });
        prev = p;
      }
      return { pts, totalLen };
    }

    // Exact equal arc-length sampling via binary search & linear interpolation
    function sampleByArc(lookup, t) {
      t = clamp(t, 0, 1);
      const target = t * lookup.totalLen;
      const pts = lookup.pts;

      let lo = 0, hi = pts.length - 1;
      while (lo < hi) {
        const mid = (lo + hi) >> 1;
        if (pts[mid].len < target) lo = mid + 1;
        else hi = mid;
      }

      const b = pts[lo];
      const a = pts[Math.max(0, lo - 1)];
      const span = Math.max(0.0001, b.len - a.len);
      const k = clamp((target - a.len) / span, 0, 1);

      return {
        u: lerp(a.u, b.u, k),
        x: lerp(a.x, b.x, k),
        y: lerp(a.y, b.y, k)
      };
    }

    // SVG Guide Path renderer for debug verification
    function buildGuide(cx, cy, outerR, innerR) {
      if (!pathEl) return;
      const steps = 720;
      let d = '';
      for (let i = 0; i <= steps; i++) {
        const p = spiralPoint(i / steps, outerR, innerR);
        const x = cx + p.x;
        const y = cy + p.y;
        d += (i === 0 ? 'M' : 'L') + x.toFixed(2) + ' ' + y.toFixed(2) + ' ';
      }
      pathEl.setAttribute('d', d);
      if (centerGuide) {
        centerGuide.style.left = cx + 'px';
        centerGuide.style.top = cy + 'px';
      }
    }

    // Cached geometry variables (recomputed ONLY on viewport resize)
    let cx = 0;
    let cy = 0;
    let outerR = 0;
    let innerR = 0;
    let cachedLookup = null;

    function updateGeometry() {
      const rect = stage.getBoundingClientRect();
      const w = rect.width || window.innerWidth;
      const h = rect.height || window.innerHeight;

      // Perfectly center spiral on the headline
      if (centerContent) {
        const cRect = centerContent.getBoundingClientRect();
        cx = cRect.left + cRect.width / 2 - rect.left;
        cy = cRect.top + cRect.height / 2 - rect.top;
      } else {
        cx = w / 2;
        cy = h / 2;
      }

      outerR = Math.hypot(w / 2, h / 2) + OUTER_EXTRA;
      innerR = Math.max(190, Math.min(INNER_SAFE, w * 0.14));

      buildGuide(cx, cy, outerR, innerR);
      cachedLookup = buildLookup(outerR, innerR);
    }

    updateGeometry();
    window.addEventListener('resize', updateGeometry, { passive: true });

    // Calibrated scroll velocity physics: MAX = 0.025, impulse +35%, pleasant smooth glide (~0.85s)
    let currentScrollVelocity = 0;
    let targetScrollVelocity = 0;
    const MAX_SCROLL_VELOCITY = 0.025; // user-specified top speed

    window.addEventListener('wheel', (e) => {
      const scrollY = window.scrollY || window.pageYOffset || document.documentElement.scrollTop || 0;
      
      // If at the very top of the page (hero at top, cannot scroll up anymore), ignore rolling up!
      if (e.deltaY < 0 && scrollY <= 3) {
        return;
      }

      // Smooth impulse (+35% responsiveness per user request)
      const delta = Math.abs(e.deltaY);
      const impulse = Math.min(0.0057, delta * 0.000038);
      targetScrollVelocity = Math.min(MAX_SCROLL_VELOCITY, targetScrollVelocity + impulse);
    }, { passive: true });

    let lastScrollY = window.scrollY || window.pageYOffset || 0;
    window.addEventListener('scroll', () => {
      const currentY = window.scrollY || window.pageYOffset || 0;
      const deltaY = Math.abs(currentY - lastScrollY);
      lastScrollY = currentY;

      // When scrolling down OR scrolling back up to the top, apply smooth velocity (+35%)
      if (currentY < window.innerHeight * 1.3 && deltaY > 0) {
        const impulse = Math.min(0.0061, deltaY * 0.000043);
        targetScrollVelocity = Math.min(MAX_SCROLL_VELOCITY, targetScrollVelocity + impulse);
      }
    }, { passive: true });

    // Seamless continuous loop: cycle = 1.0, step = 1 / CARD_COUNT
    // Eliminates any ending blank gap/tail completely!
    const step = 1 / CARD_COUNT;
    const cycle = 1.0;
    let accumulatedTime = 0;
    let lastTimestamp = 0;

    // Main 60fps RAF animation loop
    function render(timestamp) {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const dt = Math.min(0.1, (timestamp - lastTimestamp) / 1000);
      lastTimestamp = timestamp;

      // Pleasant smooth glide decay: settles in ~0.85s so users feel the distinction without dizziness
      const decay = Math.pow(0.942, dt * 60);
      targetScrollVelocity *= decay;

      // Smooth ease-to-target
      const ease = 1 - Math.exp(-10 * dt);
      currentScrollVelocity += (targetScrollVelocity - currentScrollVelocity) * ease;

      // Force motion: continuous ambient drift + silky smooth clockwise scroll velocity (always active, bypassing prefers-reduced-motion)
      accumulatedTime += (FLOW_SPEED + currentScrollVelocity) * dt;

      if (!cachedLookup) {
        requestAnimationFrame(render);
        return;
      }

      for (let i = 0; i < CARD_COUNT; i++) {
        const item = cards[i];
        let t = i * step + accumulatedTime;
        t = ((t % cycle) + cycle) % cycle;

        // Sample position strictly along the mathematical spiral arc length
        const p = sampleByArc(cachedLookup, t);

        const x = cx + p.x;
        const y = cy + p.y;

        // SHORT BOTTOM EDGE POINTS DIRECTLY TOWARD CENTER
        const angleToCenter = Math.atan2(cy - y, cx - x) * 180 / Math.PI;
        const rotation = angleToCenter - 90;
        const scale = lerp(OUTER_SCALE, INNER_SCALE, p.u);

        // Smooth entry fade-in and center exit fade-out
        const fadeIn = clamp(t / 0.045, 0, 1);
        const fadeOut = clamp((1 - t) / 0.045, 0, 1);
        const opacity = Math.min(fadeIn, fadeOut);
        
        // Ethereal depth-of-field: cards smoothly blur as they approach the center aura
        const innerProgress = clamp((p.u - 0.58) / 0.42, 0, 1);
        const blur = Math.pow(innerProgress, 1.6) * 12.0;

        // Cards smoothly dissolve as they reach the innermost turns behind the blurred color patch
        const coreFade = clamp(1 - (p.u - 0.78) / 0.22, 0, 1);
        const finalOpacity = Math.min(opacity, coreFade);

        item.el.style.left = x + 'px';
        item.el.style.top = y + 'px';
        item.el.style.opacity = finalOpacity.toFixed(3);
        item.el.style.filter = blur > 0.08 ? `blur(${blur.toFixed(2)}px)` : 'none';
        item.el.style.transform = `translate(-50%,-50%) rotate(${rotation.toFixed(2)}deg) scale(${scale.toFixed(3)})`;
        item.el.style.zIndex = String(Math.round(100 - p.u * 35));
      }

      requestAnimationFrame(render);
    }

    requestAnimationFrame(render);
  }
})();
