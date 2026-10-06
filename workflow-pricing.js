/**
 * NESSO — Workflow & Pricing Interactive Switchers
 * Allows the user to toggle between Design Option 1 & 2 for Workflow,
 * and Option A & B for Pricing to preview and compare directly in the browser.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initRunwayScrollytelling();
    initPricingSwitcher();
    initBillingToggle();
  });

  // ── Runway Scrollytelling: Sticky Pinned Stage with GSAP Line Fill & Cumulative Activation ──
  function initRunwayScrollytelling() {
    const container = document.getElementById('workflow-scrolly-container');
    const lineFill = document.querySelector('.runway-line-fill');
    const stepCols = document.querySelectorAll('.runway-step-col');
    const dots = document.querySelectorAll('.runway-marker-dot');

    if (!container || !lineFill || stepCols.length === 0) return;

    // Cumulative thresholds:
    // Step 1: active always (threshold 0)
    // Step 2: activates as line reaches Step 2 (~0.28)
    // Step 3: activates as line reaches Step 3 (~0.61)
    // Step 4: activates as line reaches Step 4 (~0.92)
    const thresholds = [0, 0.28, 0.61, 0.92];

    function updateSteps(progress) {
      stepCols.forEach((col, idx) => {
        const shouldBeActive = progress >= thresholds[idx];
        col.classList.toggle('is-active', shouldBeActive);
        col.classList.toggle('is-dimmed', !shouldBeActive);
      });

      dots.forEach((dot, idx) => {
        const shouldBeActive = progress >= thresholds[idx];
        dot.classList.toggle('is-active', shouldBeActive);
      });
    }

    function handleScroll() {
      if (window.innerWidth <= 900) return;

      const rect = container.getBoundingClientRect();
      const winHeight = window.innerHeight;
      const totalDist = rect.height - winHeight;
      if (totalDist <= 0) return;

      const scrolled = -rect.top;
      // Clamp progress between 0 and 1
      const progress = Math.max(0, Math.min(1, scrolled / totalDist));

      // GSAP smooth line fill animation
      if (window.gsap) {
        window.gsap.to(lineFill, {
          scaleX: progress,
          duration: 0.22,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      } else {
        lineFill.style.transform = `scaleX(${progress})`;
      }

      updateSteps(progress);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    // Initial setup on page load
    handleScroll();
  }

  // ── Pricing Switcher: Elevated Cards (Option A) vs Editorial Columns (Option B) ──
  function initPricingSwitcher() {
    const btnElevated = document.getElementById('switch-price-elevated');
    const btnEditorial = document.getElementById('switch-price-editorial');
    const viewElevated = document.getElementById('pricing-elevated-view');
    const viewEditorial = document.getElementById('pricing-editorial-view');

    if (!btnElevated || !btnEditorial || !viewElevated || !viewEditorial) return;

    btnElevated.addEventListener('click', () => {
      btnElevated.classList.add('is-active');
      btnEditorial.classList.remove('is-active');
      viewElevated.style.display = 'grid';
      viewEditorial.style.display = 'none';
    });

    btnEditorial.addEventListener('click', () => {
      btnEditorial.classList.add('is-active');
      btnElevated.classList.remove('is-active');
      viewEditorial.style.display = 'block';
      viewElevated.style.display = 'none';
    });
  }

  // ── Pricing Billing Cycle Switcher: Per Image vs Monthly Retainer ──
  function initBillingToggle() {
    const switchEl = document.getElementById('billing-switch');
    const btnPerImage = document.getElementById('btn-per-image');
    const btnMonthly = document.getElementById('btn-monthly');

    const amounts = document.querySelectorAll('.dynamic-price-amount');
    const units = document.querySelectorAll('.dynamic-price-unit');

    if (!switchEl || !btnPerImage || !btnMonthly) return;

    let isMonthly = false;

    function updatePrices(monthly) {
      isMonthly = monthly;
      switchEl.classList.toggle('is-active', isMonthly);
      btnMonthly.classList.toggle('is-active', isMonthly);
      btnPerImage.classList.toggle('is-active', !isMonthly);

      amounts.forEach((el) => {
        const val = isMonthly ? el.getAttribute('data-monthly') : el.getAttribute('data-per-image');
        if (val) el.textContent = val;
      });

      units.forEach((el) => {
        const val = isMonthly ? el.getAttribute('data-monthly-unit') : el.getAttribute('data-per-image-unit');
        if (val) el.textContent = val;
      });
    }

    switchEl.addEventListener('click', () => updatePrices(!isMonthly));
    btnPerImage.addEventListener('click', () => updatePrices(false));
    btnMonthly.addEventListener('click', () => updatePrices(true));
  }
})();
