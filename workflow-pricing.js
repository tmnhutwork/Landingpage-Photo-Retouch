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
      if (window.innerWidth <= 1200) return;

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
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        calculateDotFractions();
        handleScroll();
      }, 150);
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
    let endPoint = 0;

    // Vị trí layout của el so với lưới (offsetTop): không bị lệch bởi transform/animation
    // (card đang scale 0.98 lúc xuất hiện, cột dịch 3px khi đổi mờ/rõ) như getBoundingClientRect
    function offsetWithinGrid(el) {
      let top = 0;
      let node = el;
      while (node && node !== grid) {
        top += node.offsetTop;
        node = node.offsetParent;
      }
      if (node !== grid) {
        // offsetParent không đi qua lưới: dùng chênh lệch rect làm phương án dự phòng
        return el.getBoundingClientRect().top - grid.getBoundingClientRect().top;
      }
      return top;
    }

    function updateMobilePositions() {
      if (window.innerWidth > 1200) return;
      dotTops = [];

      stepCols.forEach((col, idx) => {
        const pill = col.querySelector('.runway-step-pill');
        const target = pill || col;
        // Tâm điểm chính xác của badge số so với đỉnh của lưới
        const dotCenter = offsetWithinGrid(target) + target.offsetHeight / 2;
        dotTops.push(dotCenter);
        if (vDots[idx]) {
          vDots[idx].style.top = `${dotCenter}px`;
        }
      });

      const firstDot = dotTops[0] || 0;
      // Điểm kết thúc: lướt qua hết toàn bộ nội dung của Bước 04 (xuống tới icon/text SLA của bước 4)
      const lastCol = stepCols[stepCols.length - 1];
      const lastSla = lastCol ? lastCol.querySelector('.runway-step-sla') : null;
      if (lastSla) {
        endPoint = offsetWithinGrid(lastSla) + lastSla.offsetHeight / 2;
      } else if (lastCol) {
        endPoint = offsetWithinGrid(lastCol) + lastCol.offsetHeight;
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
      if (window.innerWidth > 1200) return;
      if (dotTops.length < 4) updateMobilePositions();

      // Đường kích hoạt nằm ngay chính giữa màn hình (tầm mắt: 50% viewport height)
      const triggerY = window.innerHeight * 0.5;

      // Chỉ đọc vị trí lưới, còn lại tính từ số đo đã lưu: đầu thanh đen, các chấm và ngưỡng sáng
      // của từng bước dùng chung một hệ tọa độ nên đầu thanh luôn đứng yên đúng giữa màn hình
      const gridTop = grid.getBoundingClientRect().top;

      // Điểm bắt đầu là tâm badge 01, điểm kết thúc là ngang hàng cuối Bước 04
      const startY = gridTop + dotTops[0];
      const endY = gridTop + endPoint;

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
        const pCenter = gridTop + dotTops[i];
        const isReached = pCenter <= triggerY;

        stepCols[i].classList.toggle('is-active', isReached);
        stepCols[i].classList.toggle('is-dimmed', !isReached);
        if (vDots[i]) {
          vDots[i].classList.toggle('is-active', isReached);
        }
      }
    }

    // Gom các sự kiện cuộn vào đúng 1 lần cập nhật mỗi khung hình
    let scrollRaf = null;
    window.addEventListener('scroll', () => {
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(() => {
        scrollRaf = null;
        handleMobileScroll();
      });
    }, { passive: true });

    function remeasure() {
      updateMobilePositions();
      handleMobileScroll();
    }

    let mobileResizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(mobileResizeTimer);
      mobileResizeTimer = setTimeout(remeasure, 150);
    }, { passive: true });

    // Cập nhật vị trí ngay sau khi trình duyệt render, và đo lại khi font/ảnh tải xong (layout có thể đổi)
    setTimeout(remeasure, 100);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(remeasure);
    }
    window.addEventListener('load', remeasure);
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
