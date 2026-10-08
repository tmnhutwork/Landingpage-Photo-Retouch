/**
 * NESSO — Workflow & Pricing Interactive Switchers
 * Allows the user to toggle between Design Option 1 & 2 for Workflow,
 * and Option A & B for Pricing to preview and compare directly in the browser.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initRunwayScrollytelling();
    initMobileRunwayTimeline();
    initPricingSwitcher();
    initBillingToggle();
  });

  // ── Runway Scrollytelling: Sticky Pinned Stage with GSAP Line Fill & Cumulative Activation ──
  function initRunwayScrollytelling() {
    const container = document.getElementById('workflow-scrolly-container');
    const lineTrack = document.querySelector('.runway-line-track');
    const lineFill = document.querySelector('.runway-line-fill');
    const stepCols = document.querySelectorAll('.runway-step-col');
    const stepDots = document.querySelectorAll('.runway-markers-row .runway-marker-dot');
    const endDot = document.querySelector('.runway-marker-dot-end');

    if (!container || !lineFill || stepCols.length === 0) return;

    let dotFractions = [0, 0.266, 0.532, 0.798];

    function calculateDotFractions() {
      if (!lineTrack || stepDots.length === 0) return;
      const trackRect = lineTrack.getBoundingClientRect();
      const trackLeft = trackRect.left;
      const trackWidth = trackRect.width;
      if (trackWidth <= 0) return;

      dotFractions = Array.from(stepDots).map((dot) => {
        const dotRect = dot.getBoundingClientRect();
        const dotCenter = dotRect.left + dotRect.width / 2;
        return Math.max(0, Math.min(1, (dotCenter - trackLeft) / trackWidth));
      });
    }

    function updateSteps(progress) {
      // Step 1: active always (threshold 0)
      // Step 2: activates as line reaches Dot 2
      // Step 3: activates as line reaches Dot 3
      // Step 4: activates as line reaches Dot 4; line then continues through Step 4's bar to 1.0
      const t1 = 0;
      const t2 = (dotFractions[1] || 0.266) - 0.015;
      const t3 = (dotFractions[2] || 0.532) - 0.015;
      const t4 = (dotFractions[3] || 0.798) - 0.015;
      const thresholds = [t1, t2, t3, t4];

      stepCols.forEach((col, idx) => {
        const shouldBeActive = progress >= thresholds[idx];
        col.classList.toggle('is-active', shouldBeActive);
        col.classList.toggle('is-dimmed', !shouldBeActive);
      });

      stepDots.forEach((dot, idx) => {
        const shouldBeActive = progress >= thresholds[idx];
        dot.classList.toggle('is-active', shouldBeActive);
      });

      if (endDot) {
        const isEndActive = progress >= 0.97;
        endDot.classList.toggle('is-active', isEndActive);
      }
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

      // GSAP smooth line fill animation: runs smoothly through Step 1 -> 2 -> 3 -> 4,
      // and completes the full bar of Step 4 before unpinning.
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

    calculateDotFractions();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', () => {
      calculateDotFractions();
      handleScroll();
    }, { passive: true });

    // Initial setup on page load
    handleScroll();
  }

  // ── Mobile Runway Scrollytelling: Vertical Timeline & Progressive Center Illumination ──
  function initMobileRunwayTimeline() {
    const vTimeline = document.getElementById('runway-v-timeline');
    const vTrack = document.querySelector('.runway-v-line-track');
    const vFill = document.querySelector('.runway-v-line-fill');
    const vDots = document.querySelectorAll('.runway-v-dot');
    const stepCols = document.querySelectorAll('.runway-step-col');
    const grid = document.querySelector('.runway-steps-grid');

    if (!vTimeline || vDots.length === 0 || stepCols.length === 0 || !grid) return;

    let dotTops = [];

    function updateMobilePositions() {
      if (window.innerWidth > 900) return;
      const gridRect = grid.getBoundingClientRect();
      dotTops = [];

      stepCols.forEach((col, idx) => {
        const pill = col.querySelector('.runway-step-pill');
        const target = pill || col;
        const targetRect = target.getBoundingClientRect();
        // Tâm điểm chính xác của badge số so với đỉnh của lưới
        const dotCenter = (targetRect.top + targetRect.height / 2) - gridRect.top;
        dotTops.push(dotCenter);
        if (vDots[idx]) {
          vDots[idx].style.top = `${dotCenter}px`;
        }
      });

      const firstDot = dotTops[0] || 0;
      // Điểm kết thúc: lướt qua hết toàn bộ nội dung của Bước 04 (xuống tới icon/text SLA của bước 4)
      const lastCol = stepCols[stepCols.length - 1];
      const lastSla = lastCol ? lastCol.querySelector('.runway-step-sla') : null;
      let endPoint = 0;
      if (lastSla) {
        const slaRect = lastSla.getBoundingClientRect();
        endPoint = (slaRect.top + slaRect.height / 2) - gridRect.top;
      } else if (lastCol) {
        endPoint = lastCol.getBoundingClientRect().bottom - gridRect.top;
      } else {
        endPoint = dotTops[dotTops.length - 1] || 1;
      }

      const trackSpan = endPoint - firstDot;

      if (trackSpan > 0) {
        if (vTrack) {
          vTrack.style.top = `${firstDot}px`;
          vTrack.style.height = `${trackSpan}px`;
        }
        if (vFill) {
          vFill.style.top = `${firstDot}px`;
          vFill.style.height = `${trackSpan}px`;
        }
        const endDot = document.getElementById('runway-v-dot-end');
        if (endDot) {
          endDot.style.top = `${endPoint}px`;
        }
      }
    }

    function handleMobileScroll() {
      if (window.innerWidth > 900) return;
      if (dotTops.length < 4) updateMobilePositions();

      // Đường kích hoạt nằm ngay chính giữa màn hình (tầm mắt: 50% viewport height)
      const triggerY = window.innerHeight * 0.5;

      const pills = Array.from(stepCols).map(c => c.querySelector('.runway-step-pill') || c);
      const pillFirstRect = pills[0].getBoundingClientRect();
      const pillLastRect = pills[pills.length - 1].getBoundingClientRect();

      // Điểm bắt đầu là tâm badge 01, điểm kết thúc là ngang hàng cuối Bước 04
      const startY = pillFirstRect.top + pillFirstRect.height / 2;
      const lastCol = stepCols[stepCols.length - 1];
      const lastSla = lastCol ? lastCol.querySelector('.runway-step-sla') : null;
      let endY = 0;
      if (lastSla) {
        const slaRect = lastSla.getBoundingClientRect();
        endY = slaRect.top + slaRect.height / 2;
      } else if (lastCol) {
        endY = lastCol.getBoundingClientRect().bottom;
      } else {
        endY = pillLastRect.top + pillLastRect.height / 2;
      }

      const span = endY - startY;

      let progress = 0;
      if (span > 0) {
        progress = (triggerY - startY) / span;
        progress = Math.max(0, Math.min(1, progress));
      }

      if (vFill) {
        vFill.style.transform = `scaleY(${progress})`;
      }

      // Ô vuông kết thúc ở đáy đường line: sáng đen khi vệt đen lướt tới cuối
      const endDot = document.getElementById('runway-v-dot-end');
      if (endDot) {
        const isEndActive = progress >= 0.96;
        endDot.classList.toggle('is-active', isEndActive);
      }

      // Bước 01 luôn sáng mặc định
      stepCols[0].classList.add('is-active');
      stepCols[0].classList.remove('is-dimmed');
      vDots[0].classList.add('is-active');

      // Các bước 02, 03, 04 sáng dần khi badge chạm vào giữa tầm mắt người xem
      for (let i = 1; i < stepCols.length; i++) {
        const pRect = pills[i].getBoundingClientRect();
        const pCenter = pRect.top + pRect.height / 2;
        const isReached = pCenter <= triggerY;

        stepCols[i].classList.toggle('is-active', isReached);
        stepCols[i].classList.toggle('is-dimmed', !isReached);
        if (vDots[i]) {
          vDots[i].classList.toggle('is-active', isReached);
        }
      }
    }

    window.addEventListener('scroll', handleMobileScroll, { passive: true });
    window.addEventListener('resize', () => {
      updateMobilePositions();
      handleMobileScroll();
    }, { passive: true });

    // Cập nhật vị trí ngay sau khi trình duyệt render
    setTimeout(() => {
      updateMobilePositions();
      handleMobileScroll();
    }, 100);
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
