/**
 * NESSO — Interactive Controller for FAQ Accordion
 * Handles expand/collapse for the FAQ accordion items.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initFAQAccordion();
    initCTAPerspectiveTilt();
  });

  /* ==========================================================================
     1. FAQ ACCORDION INTERACTION & FOOTER STABILITY CONTROLLER
     ========================================================================== */
  function initFAQAccordion() {
    const section = document.querySelector('.d4-faq-section');
    const header = document.querySelector('.d4-faq-header');
    const list = document.querySelector('.d4-faq-list');
    const items = document.querySelectorAll('.d4-faq-card');
    if (!items.length) return;

    // Dynamically calculate and lock stable height so footer NEVER shifts
    function updateStableHeight() {
      if (!list) return;

      let baseHeight = 0;
      const gap = 12;
      let maxSingleAnswer = 0;

      items.forEach((item, index) => {
        const questionBtn = item.querySelector('.d4-faq-question');
        const qHeight = questionBtn ? questionBtn.getBoundingClientRect().height : 58;
        baseHeight += qHeight + 2; // + 2px for card border
        if (index > 0) baseHeight += gap;

        const ansText = item.querySelector('.d4-faq-answer-text');
        if (ansText) {
          const aH = ansText.scrollHeight + 20; // 20px padding-bottom
          if (aH > maxSingleAnswer) maxSingleAnswer = aH;
        }
      });

      // Exactly 1 question open at a time: list needs baseHeight + maxSingleAnswer
      const isMobile = window.innerWidth <= 640;
      const minDesktop = 565;
      const minMobile = 680;
      const calculatedListHeight = Math.ceil(baseHeight + maxSingleAnswer + 4);
      const lockedListHeight = Math.max(isMobile ? minMobile : minDesktop, calculatedListHeight);

      list.style.minHeight = lockedListHeight + 'px';
      list.style.setProperty('--faq-list-min-height', lockedListHeight + 'px');

      if (section) {
        const headerH = header ? header.getBoundingClientRect().height : 75;
        const padV = isMobile ? 68 : 88; // 64px top + 24px bottom = 88px (mobile: 48 + 20 = 68)
        const lockedSectionHeight = Math.ceil(lockedListHeight + headerH + padV);
        section.style.minHeight = lockedSectionHeight + 'px';
        section.style.setProperty('--faq-section-min-height', lockedSectionHeight + 'px');
      }
    }

    updateStableHeight();
    let stableHeightTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(stableHeightTimer);
      stableHeightTimer = setTimeout(updateStableHeight, 150);
    }, { passive: true });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(updateStableHeight);
    }

    // Pure class-based toggle with CSS Grid 0fr -> 1fr (zero jank, zero stutter)
    // Strictly at most 1 card open at any time
    items.forEach(item => {
      const btn = item.querySelector('.d4-faq-question');
      const answer = item.querySelector('.d4-faq-answer');
      if (!btn || !answer) return;

      // Remove any leftover inline styles
      answer.style.maxHeight = '';

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const isOpen = item.classList.contains('is-open');

        // Strictly close any other open question (only 1 open at a time)
        items.forEach(otherItem => {
          if (otherItem !== item && otherItem.classList.contains('is-open')) {
            otherItem.classList.remove('is-open');
            const otherBtn = otherItem.querySelector('.d4-faq-question');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });

        // Toggle current card
        if (isOpen) {
          item.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });
  }

  /* ==========================================================================
     2. CTA CURSOR-DRIVEN GENTLE MAGNETIC ATTRACTION (GSAP)
     Only photo elements (.d4-cell-media) gently float/attract towards cursor.
     All other elements (grid canvas, dots, sketches, headline, button) stay 100% static.
     WordPress Compatible | Pure Vanilla JS + GSAP Core | Zero Dependencies
     ========================================================================== */
  function initCTAPerspectiveTilt() {
    // Safety check: GSAP availability & Accessibility checks
    if (typeof gsap === 'undefined') {
      console.warn('[NESSO CTA Magnet] GSAP not detected. Effect disabled.');
      return;
    }
    // Force motion: bypass prefers-reduced-motion rule so magnetic attraction is always active
    if (window.matchMedia('(hover: none)').matches) return;

    const section = document.getElementById('d4-cta');
    if (!section) return;

    // Target ONLY the photo image cards (.d4-cell-media)
    const photoElements = section.querySelectorAll('.d4-cell-media');
    if (!photoElements.length) return;

    // Configuration dials for gentle, subtle magnetic pull
    const CONFIG = {
      magneticRadius: 300,    // Pixel radius around cursor where gentle attraction begins
      magneticPull: 12,       // Gentle suction force: max 12px pull towards cursor
      parallaxDriftX: 3,      // Very subtle ambient drift X (3px max)
      parallaxDriftY: 2,      // Very subtle ambient drift Y (2px max)
      lerpDuration: 0.55,     // Interpolation smoothing duration (silky 60-120fps)
      ease: 'power2.out'
    };

    // Prepare photo items with individual quickTo setters (pure 2D floating)
    const items = Array.from(photoElements).map(el => {
      return {
        el,
        relX: 0,
        relY: 0,
        quickX: gsap.quickTo(el, 'x', { duration: CONFIG.lerpDuration, ease: CONFIG.ease }),
        quickY: gsap.quickTo(el, 'y', { duration: CONFIG.lerpDuration, ease: CONFIG.ease })
      };
    });

    let sectionRect = section.getBoundingClientRect();

    // Cache relative item center positions to completely eliminate DOM reads during mousemove
    function updateMetrics() {
      sectionRect = section.getBoundingClientRect();
      items.forEach(item => {
        const currentTransform = item.el.style.transform;
        const currentTransition = item.el.style.transition;
        item.el.style.transition = 'none';
        item.el.style.transform = 'none';

        const itemRect = item.el.getBoundingClientRect();
        item.relX = (itemRect.left - sectionRect.left) + itemRect.width / 2;
        item.relY = (itemRect.top - sectionRect.top) + itemRect.height / 2;

        item.el.style.transform = currentTransform;
        item.el.style.transition = currentTransition;
      });
    }

    updateMetrics();
    let metricsTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(metricsTimer);
      metricsTimer = setTimeout(updateMetrics, 150);
    }, { passive: true });
    window.addEventListener('scroll', () => {
      sectionRect = section.getBoundingClientRect();
    }, { passive: true });

    // Handle mouse movement across the CTA Section
    section.addEventListener('mousemove', (e) => {
      const mouseRelX = e.clientX - sectionRect.left;
      const mouseRelY = e.clientY - sectionRect.top;

      // Normalized coordinates from center [-0.5, 0.5]
      const normX = (mouseRelX / sectionRect.width) - 0.5;
      const normY = (mouseRelY / sectionRect.height) - 0.5;

      items.forEach(item => {
        const dx = mouseRelX - item.relX;
        const dy = mouseRelY - item.relY;
        const dist = Math.hypot(dx, dy);

        // Subtle ambient drift
        const driftX = normX * CONFIG.parallaxDriftX;
        const driftY = normY * CONFIG.parallaxDriftY;

        // Gentle localized magnetic pull when cursor is nearby
        let pullX = 0;
        let pullY = 0;
        if (dist < CONFIG.magneticRadius) {
          const proximity = Math.pow(1 - (dist / CONFIG.magneticRadius), 1.8);
          const force = proximity * CONFIG.magneticPull;
          pullX = (dx / (dist || 1)) * force;
          pullY = (dy / (dist || 1)) * force;
        }

        const totalX = driftX + pullX;
        const totalY = driftY + pullY;

        item.quickX(totalX);
        item.quickY(totalY);
      });
    });

    // Handle cursor leaving the section: smooth glide back to (0, 0)
    section.addEventListener('mouseleave', () => {
      items.forEach(item => {
        gsap.to(item.el, {
          x: 0,
          y: 0,
          duration: 0.65,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    });

    section.addEventListener('mouseenter', () => {
      sectionRect = section.getBoundingClientRect();
    });
  }
})();

