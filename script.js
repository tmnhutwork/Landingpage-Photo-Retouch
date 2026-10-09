/**
 * NESSO PHOTO RETOUCH — LANDING PAGE SCRIPTS
 * Hero section powered by Cosmos.so 4-Tier Galaxy Orbit Engine (cosmos-hero.js).
 * Interactive Service Accordion & Comparison Sliders handled below.
 */

// Gom các lần resize liên tiếp (thanh URL mobile thu/giãn khi cuộn) thành một lần tính lại
function debounce(fn, wait) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

document.addEventListener('DOMContentLoaded', () => {
  initAllServiceSliders();
  initServiceAccordion();
  initZoomTagBrackets();
  initServiceCircleCursor();
  initAudienceConcepts();
  initMobileNav();
  initOffscreenSections();
});

/* ==========================================================================
   SECTION NGOÀI MÀN HÌNH (chỉ thiết bị cảm ứng): content-visibility: auto cho các section lớn sau hero
   Trình duyệt bỏ qua style/layout/paint của section ở xa màn hình, nên mỗi khung hình (vòng xoắn hero, tween GSAP)
   chỉ xử lý phần gần màn hình. Chiều cao giữ chỗ (contain-intrinsic-size) luôn bằng đúng kích thước thật:
   đo sau load + font, ResizeObserver cập nhật mỗi khi section đang hiển thị đổi cỡ (accordion Services, FAQ…),
   đo lại toàn bộ khi viewport đổi kích thước thật (xoay máy) → chiều cao trang, vị trí ScrollTrigger, anchor không đổi.
   Desktop (chuột) không áp dụng gì. Hero không bao giờ bị bỏ qua.
   ========================================================================== */
const OFFSCREEN_SECTION_IDS = ['approach', 'services', 'who-we-worked-with', 'workflow', 'pricing', 'd4-cta', 'd4-faq', 'd4-footer'];
const OFFSCREEN_TOUCH_QUERY = '(hover: none) and (pointer: coarse)';

function initOffscreenSections() {
  if (!('contentVisibility' in document.documentElement.style) || !('ResizeObserver' in window)) return;
  const sections = OFFSCREEN_SECTION_IDS.map(id => document.getElementById(id)).filter(Boolean);
  if (!sections.length) return;

  const touchQuery = window.matchMedia(OFFSCREEN_TOUCH_QUERY);
  const sizes = new Map();
  let active = false;
  let lastWidth = 0;
  let lastHeight = 0;
  let resizeTimer = null;

  // contain-intrinsic-size tính theo content-box (padding/border cộng thêm bên ngoài)
  const setPlaceholder = (section, width, height) => {
    const prev = sizes.get(section);
    if (prev && Math.abs(prev.width - width) < 0.01 && Math.abs(prev.height - height) < 0.01) return;
    sizes.set(section, { width, height });
    section.style.containIntrinsicSize = `${width}px ${height}px`;
  };

  // Section đang hiển thị báo kích thước thật; section đang bị bỏ qua báo đúng chiều cao giữ chỗ (không đổi gì)
  const observer = new ResizeObserver(entries => {
    if (!active) return;
    entries.forEach(entry => {
      const box = entry.contentBoxSize && entry.contentBoxSize[0];
      setPlaceholder(
        entry.target,
        box ? box.inlineSize : entry.contentRect.width,
        box ? box.blockSize : entry.contentRect.height
      );
    });
  });

  // Hiện tạm mọi section (cùng contain như lúc content-visibility: auto đang hiển thị) để đo kích thước thật
  const measureAll = () => {
    if (!active) return;
    sections.forEach(s => { s.style.contentVisibility = 'visible'; });
    const measured = sections.map(s => {
      const cs = getComputedStyle(s);
      const rect = s.getBoundingClientRect();
      return {
        width: rect.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - parseFloat(cs.borderLeftWidth) - parseFloat(cs.borderRightWidth),
        height: rect.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - parseFloat(cs.borderTopWidth) - parseFloat(cs.borderBottomWidth)
      };
    });
    sections.forEach((s, i) => {
      setPlaceholder(s, measured[i].width, measured[i].height);
      s.style.contentVisibility = 'auto';
    });
  };

  // Viewport đổi kích thước thật (xoay máy, chia đôi màn hình): section đang bị bỏ qua còn giữ kích thước cũ → hiện tạm
  // tất cả ngay (ScrollTrigger refresh luôn thấy kích thước thật), đo lại khi resize dừng. Chiều cao lấy theo
  // documentElement.clientHeight: không đổi khi thanh địa chỉ mobile thu/giãn (vh cũng không đổi) → cuộn trang không đo lại.
  const onResize = () => {
    const width = window.innerWidth;
    const height = document.documentElement.clientHeight;
    if (width === lastWidth && height === lastHeight) return;
    lastWidth = width;
    lastHeight = height;
    sections.forEach(s => { s.style.contentVisibility = 'visible'; });
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measureAll, 200);
  };

  const enable = () => {
    if (active) return;
    active = true;
    lastWidth = window.innerWidth;
    lastHeight = document.documentElement.clientHeight;
    sections.forEach(s => { s.style.contain = 'layout style paint'; });
    measureAll();
    sections.forEach(s => observer.observe(s));
    window.addEventListener('resize', onResize, { passive: true });
  };

  const disable = () => {
    if (!active) return;
    active = false;
    clearTimeout(resizeTimer);
    observer.disconnect();
    window.removeEventListener('resize', onResize);
    sizes.clear();
    sections.forEach(s => {
      s.style.removeProperty('content-visibility');
      s.style.removeProperty('contain-intrinsic-size');
      s.style.removeProperty('contain');
    });
  };

  // ScrollTrigger luôn đo trên bố cục gốc (bỏ contain, mọi section hiển thị) → start/end giống hệt khi không áp dụng
  // (contain giữ margin cuối của nội dung bên trong section, vd. 35px dưới Services). Đo xong thì bật lại và đo lại.
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.addEventListener('refreshInit', () => {
      if (!active) return;
      sections.forEach(s => {
        s.style.removeProperty('content-visibility');
        s.style.removeProperty('contain');
      });
    });
    ScrollTrigger.addEventListener('refresh', () => {
      if (!active) return;
      sections.forEach(s => { s.style.contain = 'layout style paint'; });
      measureAll();
    });
  }

  const sync = () => (touchQuery.matches ? enable() : disable());
  const loaded = new Promise(resolve => {
    if (document.readyState === 'complete') resolve();
    else window.addEventListener('load', resolve, { once: true });
  });
  Promise.all([loaded, document.fonts ? document.fonts.ready : null]).then(() => {
    sync();
    if (touchQuery.addEventListener) touchQuery.addEventListener('change', sync);
  });
}

/* ==========================================================================
   SERVICES BEFORE/AFTER SLIDER ENGINE
   ========================================================================== */
function initAllServiceSliders() {
  const sliders = document.querySelectorAll('.service-model-visual');
  sliders.forEach(slider => {
    const divider = slider.querySelector('.model-slider-divider');
    if (slider && divider && !slider.dataset.sliderInitialized) {
      slider.dataset.sliderInitialized = 'true';
      attachSliderDrag(slider, divider);
    }
  });
}

function attachSliderDrag(container, divider) {
  let isDragging = false;
  let rafId = null;
  let latestClientX = 0;

  const setPercentage = (percentage) => {
    const clamped = Math.max(0, Math.min(100, percentage));
    container.style.setProperty('--slider-pos', clamped.toFixed(2) + '%');
    divider.style.left = clamped.toFixed(2) + '%';
    container.setAttribute('aria-valuenow', Math.round(clamped).toString());
  };

  const getPercentageFromClientX = (clientX) => {
    const rect = container.getBoundingClientRect();
    if (!rect.width) return 50;
    const offsetX = clientX - rect.left;
    return (offsetX / rect.width) * 100;
  };

  // Explicit default initialization at 50%
  setPercentage(50);

  const stopEntranceAnimations = () => {
    if (service1SweepTween && container.id === 'service-slider-1') {
      service1SweepTween.kill();
      service1SweepTween = null;
    }
    if (container.id === 'service-slider-2') {
      cancelService2Camera();
    }
    if (container.id === 'service-slider-3') {
      cancelService3Loupe();
    }
  };

  const renderSlider = () => {
    if (!isDragging) return;
    setPercentage(getPercentageFromClientX(latestClientX));
    rafId = null;
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    if (e.cancelable) e.preventDefault();
    latestClientX = e.clientX;
    if (!rafId) {
      rafId = requestAnimationFrame(renderSlider);
    }
  };

  const onPointerUp = (e) => {
    if (!isDragging) return;
    isDragging = false;
    container.classList.remove('is-dragging');
    document.body.classList.remove('is-slider-resizing');

    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }

    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerup', onPointerUp);
    window.removeEventListener('pointercancel', onPointerUp);

    try {
      if (e && e.pointerId && container.hasPointerCapture && container.hasPointerCapture(e.pointerId)) {
        container.releasePointerCapture(e.pointerId);
      }
    } catch (_) {}
  };

  // Chạm (điện thoại / tablet): ảnh có touch-action: pan-y (style.css, pointer: coarse) nên vuốt dọc bắt đầu trên ảnh
  // vẫn cuộn trang (trình duyệt nhận cử chỉ và gửi pointercancel → không đụng thanh chia). Chỉ bắt đầu kéo khi ngón tay
  // đi ngang rõ ràng; chạm nhẹ (tap) nhảy thanh chia tới chỗ chạm lúc nhấc tay. Nút tròn giữ touch-action: none nên
  // kéo ngay như cũ. Chuột / bút giữ nguyên hành vi cũ (nhảy ngay khi nhấn rồi kéo).
  const TOUCH_DRAG_SLOP = 6; // px đi ngang (và lớn hơn quãng đi dọc) trước khi tính là kéo
  const TOUCH_TAP_SLOP = 10; // px rung tay tối đa vẫn tính là tap
  const coarsePointerQuery = window.matchMedia('(pointer: coarse)');
  let pendingTouch = null;

  const clearPendingTouch = () => {
    pendingTouch = null;
    window.removeEventListener('pointermove', onPendingTouchMove);
    window.removeEventListener('pointerup', onPendingTouchUp);
    window.removeEventListener('pointercancel', clearPendingTouch);
  };

  const onPendingTouchMove = (e) => {
    if (!pendingTouch || e.pointerId !== pendingTouch.id) return;
    const dx = Math.abs(e.clientX - pendingTouch.x);
    const dy = Math.abs(e.clientY - pendingTouch.y);
    if (dx > TOUCH_TAP_SLOP || dy > TOUCH_TAP_SLOP) pendingTouch.moved = true;
    if (dx > TOUCH_DRAG_SLOP && dx > dy) {
      clearPendingTouch();
      startDrag(e);
    }
  };

  const onPendingTouchUp = (e) => {
    if (!pendingTouch || e.pointerId !== pendingTouch.id) return;
    const isTap = !pendingTouch.moved;
    clearPendingTouch();
    if (!isTap) return;
    stopEntranceAnimations();
    setPercentage(getPercentageFromClientX(e.clientX));
  };

  const onPointerDown = (e) => {
    // Only drag on primary button (0 for mouse, or touch/pen)
    if (e.button !== undefined && e.button !== 0) return;

    const onHandle = e.target && e.target.closest && e.target.closest('.model-handle-circle');
    if (e.pointerType === 'touch' && coarsePointerQuery.matches && !onHandle) {
      if (isDragging) return; // ngón thứ hai trong lúc đang kéo: bỏ qua
      clearPendingTouch();
      pendingTouch = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: false };
      window.addEventListener('pointermove', onPendingTouchMove, { passive: false });
      window.addEventListener('pointerup', onPendingTouchUp);
      window.addEventListener('pointercancel', clearPendingTouch);
      return;
    }

    startDrag(e);
  };

  const startDrag = (e) => {
    e.preventDefault();
    stopEntranceAnimations();

    isDragging = true;
    container.classList.add('is-dragging');
    document.body.classList.add('is-slider-resizing');

    // Immediately update to clicked position on initial press
    latestClientX = e.clientX;
    setPercentage(getPercentageFromClientX(latestClientX));

    // Try pointer capture on container
    try {
      if (e.pointerId) {
        container.setPointerCapture(e.pointerId);
      }
    } catch (_) {}

    // Window listeners guarantee buttery-smooth, un-droppable tracking everywhere
    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);
  };

  container.addEventListener('pointerdown', onPointerDown);

  // Stop browser default drag and drop or selection
  container.addEventListener('dragstart', (e) => e.preventDefault());
  container.addEventListener('selectstart', (e) => e.preventDefault());

  // Keyboard accessibility
  container.setAttribute('tabindex', '0');
  container.setAttribute('role', 'slider');
  container.setAttribute('aria-label', 'Before and after comparison slider');
  container.setAttribute('aria-valuenow', '50');
  container.setAttribute('aria-valuemin', '0');
  container.setAttribute('aria-valuemax', '100');

  container.addEventListener('keydown', (e) => {
    const current = parseFloat(getComputedStyle(container).getPropertyValue('--slider-pos')) || 50;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      stopEntranceAnimations();
      setPercentage(current - 5);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      stopEntranceAnimations();
      setPercentage(current + 5);
    }
  });
}

/* ==========================================================================
   SERVICES ACCORDION & GSAP HOVER / SWITCHER
   ========================================================================== */
function initServiceAccordion() {
  const items = document.querySelectorAll('.service-accordion-item');
  if (!items.length) return;

  items.forEach(item => {
    const collapsedRow = item.querySelector('.service-collapsed-row');
    if (!collapsedRow) return;

    // Elements for GSAP micro-interactions
    const thumbImg = collapsedRow.querySelector('.simple-thumb-img');

    collapsedRow.addEventListener('mouseenter', () => {
      if (typeof gsap !== 'undefined') {
        if (thumbImg) gsap.to(thumbImg, { scale: 1.04, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
      }
    });

    collapsedRow.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        if (thumbImg) gsap.to(thumbImg, { scale: 1, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
      }
    });

    // Click to Expand
    collapsedRow.addEventListener('click', () => {
      const cursor = document.getElementById('serviceCircleCursor');
      if (cursor && typeof gsap !== 'undefined') {
        gsap.to(cursor, { scale: 0, opacity: 0, duration: 0.2, overwrite: 'auto' });
      }
      switchServiceAccordion(item);
    });

    collapsedRow.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const cursor = document.getElementById('serviceCircleCursor');
        if (cursor && typeof gsap !== 'undefined') {
          gsap.to(cursor, { scale: 0, opacity: 0, duration: 0.2, overwrite: 'auto' });
        }
        switchServiceAccordion(item);
      }
    });
  });

  // Initial trigger for Service 1 when #services scrolls into view for the first time
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.create({
      trigger: '#services',
      start: 'top 70%',
      once: true,
      onEnter: () => {
        const item1 = document.getElementById('service-item-1');
        if (item1 && item1.classList.contains('is-active')) {
          playService1Sweep();
        }
      }
    });
  }
}

// Mobile/tablet (<= 1024px): khi mở một dịch vụ, đưa dịch vụ đó lên ngay dưới header để đọc từ trên xuống.
// Desktop giữ nguyên hành vi cũ. Kiểm tra tại thời điểm chạm nên tự đúng khi resize desktop <-> mobile.
const SERVICE_COMPACT_QUERY = '(max-width: 1024px)';
const SERVICE_ALIGN_GAP = 16;
let isServiceSwitching = false;
let serviceSwitchTimer = null;

function isCompactServiceLayout() {
  return window.matchMedia(SERVICE_COMPACT_QUERY).matches;
}

function releaseServiceSwitchLock() {
  clearTimeout(serviceSwitchTimer);
  isServiceSwitching = false;
}

function alignServiceItemInView(item, topBefore) {
  // 1) Dịch vụ phía trên vừa thu gọn kéo mọi thứ lên: giữ dịch vụ vừa chạm đứng yên tại chỗ
  //    (Safari không tự bù vị trí cuộn như Chrome nên phải tự bù)
  const shift = item.getBoundingClientRect().top - topBefore;
  if (Math.abs(shift) > 1) {
    window.scrollTo({ top: window.scrollY + shift, behavior: 'instant' });
  }

  // 2) Khung hình kế tiếp (sau khi vị trí bù đã vẽ): trượt mượt để mép trên dịch vụ nằm ngay dưới header
  requestAnimationFrame(() => {
    const header = document.getElementById('main-header');
    const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
    const target = window.scrollY + item.getBoundingClientRect().top - headerBottom - SERVICE_ALIGN_GAP;
    if (Math.abs(target - window.scrollY) > 2) {
      window.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
    }
  });
}

function switchServiceAccordion(targetItem) {
  if (targetItem.classList.contains('is-active')) return;

  const compact = isCompactServiceLayout();
  // Mobile/tablet: bỏ qua chạm mới khi đang chuyển dịch vụ (tránh mở 2 dịch vụ cùng lúc)
  if (compact && isServiceSwitching) return;
  const targetTopBefore = compact ? targetItem.getBoundingClientRect().top : 0;

  const currentActive = document.querySelector('.service-accordion-item.is-active');

  if (typeof gsap !== 'undefined') {
    const tl = gsap.timeline();

    if (compact) {
      isServiceSwitching = true;
      tl.eventCallback('onComplete', releaseServiceSwitchLock);
      // Dự phòng: luôn mở khóa kể cả khi timeline bị tạm dừng (tab ẩn…)
      clearTimeout(serviceSwitchTimer);
      serviceSwitchTimer = setTimeout(releaseServiceSwitchLock, 800);
    }

    if (currentActive) {
      const prevId = currentActive.dataset.serviceId;
      if (prevId === '1' && service1SweepTween) {
        service1SweepTween.kill();
        service1SweepTween = null;
      } else if (prevId === '2') {
        cancelService2Camera();
      } else if (prevId === '3') {
        cancelService3Loupe();
      }

      const activeExpanded = currentActive.querySelector('.service-expanded-view');
      tl.to(activeExpanded, {
        opacity: 0,
        y: -10,
        duration: 0.25,
        ease: 'power2.in',
        onComplete: () => {
          currentActive.classList.remove('is-active');
          gsap.set(activeExpanded, { clearProps: 'all' });
        }
      });
    }

    tl.add(() => {
      targetItem.classList.add('is-active');
      const newExpanded = targetItem.querySelector('.service-expanded-view');
      const content = targetItem.querySelector('.service-model-content');
      const zoomCard = targetItem.querySelector('.service-zoom-card');
      const ctaRow = targetItem.querySelector('.service-cta-row');

      if (newExpanded) {
        gsap.fromTo(newExpanded, 
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out' }
        );
      }

      if (content) {
        const animElements = [
          content.querySelector('.service-number'),
          content.querySelector('.service-title'),
          content.querySelector('.service-description'),
          zoomCard,
          ctaRow
        ].filter(Boolean);

        gsap.fromTo(animElements,
          { opacity: 0, y: 14 },
          { opacity: 1, y: 0, stagger: 0.06, duration: 0.45, ease: 'power2.out', clearProps: 'transform' }
        );
      }

      initAllServiceSliders();

      // Trigger unique GSAP entrance animation based on active service
      const serviceId = targetItem.dataset.serviceId;
      if (serviceId === '1') {
        playService1Sweep();
      } else if (serviceId === '2') {
        playService2CameraTour();
      } else if (serviceId === '3') {
        playService3Loupe();
      }

      if (compact) alignServiceItemInView(targetItem, targetTopBefore);
    });
  } else {
    if (currentActive) {
      const prevId = currentActive.dataset.serviceId;
      if (prevId === '2') cancelService2Camera();
      else if (prevId === '3') cancelService3Loupe();
      currentActive.classList.remove('is-active');
    }
    targetItem.classList.add('is-active');
    initAllServiceSliders();
    const serviceId = targetItem.dataset.serviceId;
    if (serviceId === '1') playService1Sweep();
    else if (serviceId === '2') playService2CameraTour();
    else if (serviceId === '3') playService3Loupe();

    if (compact) alignServiceItemInView(targetItem, targetTopBefore);
  }
}

/* ==========================================================================
   ZOOM CAPTION BRACKETS — ôm sát dòng chữ dài nhất
   Khi chú thích tự xuống dòng (tablet/mobile), CSS giữ hộp rộng bằng toàn bộ chỗ trống
   nên ngoặc phải bị đẩy xa chữ. Đo dòng dài nhất rồi gán width cho chữ để khoảng cách
   ngoặc trái → chữ luôn bằng chữ → ngoặc phải. Desktop (không tự xuống dòng) không bị gán gì.
   ========================================================================== */
function initZoomTagBrackets() {
  const texts = Array.from(document.querySelectorAll('.zoom-tag-text'));
  if (!texts.length) return;

  const fit = (text) => {
    text.style.width = '';
    if (!text.getClientRects().length) return; // dịch vụ đang thu gọn (display: none)

    const range = document.createRange();
    range.selectNodeContents(text);
    let left = Infinity;
    let right = -Infinity;
    for (const r of range.getClientRects()) {
      if (r.width > 0) {
        left = Math.min(left, r.left);
        right = Math.max(right, r.right);
      }
    }
    if (right <= left) return;

    // Quy đổi về px CSS nếu cha đang có transform scale (hiệu ứng reveal)
    const boxWidth = parseFloat(getComputedStyle(text).width) || 0;
    const rectWidth = text.getBoundingClientRect().width;
    const scale = boxWidth > 0 && rectWidth > 0 ? rectWidth / boxWidth : 1;
    const widest = (right - left) / scale;

    if (boxWidth - widest > 0.5) {
      text.style.width = `${Math.ceil(widest * 64) / 64}px`;
    }
  };
  const fitAll = () => texts.forEach(fit);

  if ('ResizeObserver' in window) {
    // Theo dõi khung zoom card: đổi kích thước khi resize và khi dịch vụ được mở (display: none → hiện)
    const observer = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const text = entry.target.querySelector('.zoom-tag-text');
        if (text) fit(text);
      });
    });
    texts.forEach(text => observer.observe(text.closest('.service-zoom-card') || text.parentElement));
  } else {
    window.addEventListener('resize', debounce(fitAll, 100));
  }

  if (document.fonts) {
    document.fonts.ready.then(fitAll);
    document.fonts.addEventListener('loadingdone', fitAll);
  }
  fitAll();
}

/* ==========================================================================
   ROTATING CIRCULAR CURSOR FOLLOWER
   ========================================================================== */
function initServiceCircleCursor() {
  const cursor = document.getElementById('serviceCircleCursor');
  if (!cursor || typeof gsap === 'undefined') return;

  const collapsedRows = document.querySelectorAll('.service-collapsed-row');
  if (!collapsedRows.length) return;

  // Initialize cursor state with xPercent & yPercent to center on pointer
  gsap.set(cursor, {
    xPercent: -50,
    yPercent: -50,
    scale: 0,
    opacity: 0,
    pointerEvents: 'none'
  });

  const setX = gsap.quickTo(cursor, "x", { duration: 0.16, ease: "power2.out" });
  const setY = gsap.quickTo(cursor, "y", { duration: 0.16, ease: "power2.out" });

  window.addEventListener('mousemove', (e) => {
    setX(e.clientX);
    setY(e.clientY);
  });

  collapsedRows.forEach(row => {
    row.addEventListener('mouseenter', () => {
      gsap.to(cursor, {
        scale: 1,
        opacity: 1,
        duration: 0.32,
        ease: "back.out(1.7)",
        overwrite: "auto"
      });
    });

    row.addEventListener('mouseleave', () => {
      gsap.to(cursor, {
        scale: 0,
        opacity: 0,
        duration: 0.22,
        ease: "power2.in",
        overwrite: "auto"
      });
    });

    row.addEventListener('mousedown', () => {
      gsap.to(cursor, { scale: 0.85, duration: 0.12, overwrite: "auto" });
    });

    row.addEventListener('mouseup', () => {
      gsap.to(cursor, { scale: 1, duration: 0.2, overwrite: "auto" });
    });
  });
}

/* ==========================================================================
   SERVICE-SPECIFIC ENTRANCE ANIMATIONS (Sweep, Hotspots, Sparkles)
   ========================================================================== */
let service1SweepTween = null;
function playService1Sweep() {
  const slider = document.getElementById('service-slider-1');
  if (!slider || typeof gsap === 'undefined') return;
  const divider = slider.querySelector('.model-slider-divider');
  if (!divider) return;

  if (service1SweepTween) service1SweepTween.kill();

  const posProxy = { val: 50 };
  const applyPos = (val) => {
    slider.style.setProperty('--slider-pos', val + '%');
    divider.style.left = val + '%';
  };

  // Reset to 50% first
  applyPos(50);

  // Sweep animation: 50% -> 22% (show After) -> 78% (show Before) -> 50% (center rest)
  service1SweepTween = gsap.timeline({
    delay: 0.35,
    onUpdate: () => applyPos(posProxy.val),
    onComplete: () => {
      applyPos(50);
      service1SweepTween = null;
    }
  })
  .to(posProxy, { val: 22, duration: 0.65, ease: 'power2.inOut' })
  .to(posProxy, { val: 78, duration: 0.95, ease: 'power2.inOut' })
  .to(posProxy, { val: 50, duration: 0.65, ease: 'power2.out' });
}

/* ==========================================================================
   SERVICE 02 / 03 — ĐIỂM NHẤN BÁM THEO ẢNH (không phụ thuộc kích thước khung)
   Vùng khoanh cổ áo (02) và đường đi kính lúp (03) được canh trên khung desktop 693×403.
   Tablet co giãn khung (tỉ lệ 693/403), mobile cao cố định 300px, ảnh dùng object-fit: cover
   nên cùng một chi tiết trên ảnh rơi vào vị trí px khác nhau. Quy đổi: điểm trên khung desktop
   → điểm trên ảnh gốc → khung hiện tại (tính lại khi chạy hiệu ứng và khi khung đổi kích thước).
   Khung đúng 693×403 giữ nguyên toạ độ gốc nên desktop không đổi một pixel nào.
   ========================================================================== */
const SERVICE_REF_BOX = { width: 693, height: 403 };

function roundServicePx(value) {
  return Math.round(value * 1000) / 1000;
}

// Kích thước thật của khung ảnh (null khi dịch vụ đang thu gọn)
function getServiceBoxSize(slider) {
  if (!slider || !slider.getClientRects().length) return null;
  const style = getComputedStyle(slider);
  const width = parseFloat(style.width);
  const height = parseFloat(style.height);
  return width > 0 && height > 0 ? { width, height } : null;
}

// object-fit: cover + object-position → tỉ lệ phóng và độ lệch của ảnh trong khung
function getServiceCoverFit(img, box, fallbackSize) {
  const naturalW = (img && img.naturalWidth) || fallbackSize[0];
  const naturalH = (img && img.naturalHeight) || fallbackSize[1];
  const scale = Math.max(box.width / naturalW, box.height / naturalH);
  const freeX = box.width - naturalW * scale;
  const freeY = box.height - naturalH * scale;
  const parts = img ? getComputedStyle(img).objectPosition.trim().split(/\s+/) : [];
  const offset = (value, free) => {
    const n = parseFloat(value);
    if (parts.length !== 2 || isNaN(n)) return free * 0.5;
    return /%$/.test(value) ? (free * n) / 100 : n;
  };
  return { scale, x: offset(parts[0], freeX), y: offset(parts[1], freeY) };
}

// map(x, y): điểm trên khung desktop → điểm cùng chi tiết ảnh trên khung hiện tại; k = tỉ lệ ảnh so với desktop
function createServiceFocusMapper(img, fallbackSize, box) {
  const isRefBox = box.width === SERVICE_REF_BOX.width && box.height === SERVICE_REF_BOX.height;
  const ref = getServiceCoverFit(img, SERVICE_REF_BOX, fallbackSize);
  const cur = getServiceCoverFit(img, box, fallbackSize);
  const k = isRefBox ? 1 : cur.scale / ref.scale;
  return {
    k,
    map: (refX, refY) => (isRefBox
      ? { x: refX, y: refY }
      : { x: roundServicePx(cur.x + (refX - ref.x) * k), y: roundServicePx(cur.y + (refY - ref.y) * k) })
  };
}

// Khung ảnh đổi kích thước (xoay máy, kéo cửa sổ desktop → tablet → mobile): đặt lại ngay vùng khoanh / kính lúp
let serviceFocusObserverReady = false;
function ensureServiceFocusObserver() {
  if (serviceFocusObserverReady) return;
  serviceFocusObserverReady = true;
  const relayout = () => {
    layoutService2Callout();
    layoutService3Loupe();
  };
  if ('ResizeObserver' in window) {
    const observer = new ResizeObserver(relayout);
    ['service-slider-2', 'service-slider-3'].forEach(id => {
      const slider = document.getElementById(id);
      if (slider) observer.observe(slider);
    });
  } else {
    window.addEventListener('resize', debounce(relayout, 100));
  }
  // Chiều cao thẻ chú thích phụ thuộc phông chữ
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(relayout);
}

// Service 02: tâm vùng khoanh cổ áo trên khung desktop + hình học vòng khoanh (khớp CSS #callout-neck)
const SERVICE2_NECK_FOCUS = { x: 346, y: 155 };
const SERVICE2_IMAGE_SIZE = [1300, 1950];
const CALLOUT_RING_HALF = { width: 52, height: 36 }; // vòng khoanh 104×72
const CALLOUT_STEM_SPAN = 34;                        // chấm + đường dẫn + khe trước thẻ (86 − 52)
const CALLOUT_EDGE_GAP = 8;

function layoutService2Callout() {
  const slider = document.getElementById('service-slider-2');
  const callout = document.getElementById('callout-neck');
  const box = getServiceBoxSize(slider);
  if (!callout || !box) return;

  const mapper = createServiceFocusMapper(slider.querySelector('.model-img-after'), SERVICE2_IMAGE_SIZE, box);
  const focus = mapper.map(SERVICE2_NECK_FOCUS.x, SERVICE2_NECK_FOCUS.y);
  const k = mapper.k;
  callout.style.left = focus.x + 'px';
  callout.style.top = focus.y + 'px';
  // Vòng khoanh co giãn cùng ảnh để ôm đúng vùng cổ áo
  callout.style.setProperty('--callout-k', String(Math.round(k * 10000) / 10000));

  const badge = callout.querySelector('.callout-badge-card');
  if (!badge) return;
  const badgeMaxW = parseFloat(getComputedStyle(badge).maxWidth) || 255;
  // Desktop: thẻ chú thích bên phải vòng khoanh. Khung hẹp không đủ chỗ → thẻ xếp dưới (hoặc trên) vòng khoanh
  const sideRight = focus.x + CALLOUT_RING_HALF.width * k + CALLOUT_STEM_SPAN + badgeMaxW;
  const stacked = sideRight > box.width - 2;
  callout.classList.toggle('is-stacked', stacked);
  if (!stacked) {
    callout.classList.remove('is-above');
    ['--callout-badge-w', '--callout-badge-x', '--callout-badge-y'].forEach(p => callout.style.removeProperty(p));
    return;
  }

  const badgeW = Math.min(badgeMaxW, box.width - CALLOUT_EDGE_GAP * 2);
  callout.style.setProperty('--callout-badge-w', roundServicePx(badgeW) + 'px');
  const badgeH = badge.offsetHeight;
  const reach = CALLOUT_RING_HALF.height * k + CALLOUT_STEM_SPAN;
  const fitsBelow = focus.y + reach + badgeH <= box.height - CALLOUT_EDGE_GAP;
  const fitsAbove = focus.y - reach - badgeH >= CALLOUT_EDGE_GAP;
  const above = !fitsBelow && (fitsAbove || focus.y > box.height / 2);
  const minX = CALLOUT_EDGE_GAP - focus.x;
  const maxX = box.width - CALLOUT_EDGE_GAP - badgeW - focus.x;
  const badgeX = Math.max(minX, Math.min(-badgeW / 2, maxX));
  callout.classList.toggle('is-above', above);
  callout.style.setProperty('--callout-badge-x', roundServicePx(badgeX) + 'px');
  callout.style.setProperty('--callout-badge-y', roundServicePx(above ? -(reach + badgeH) : reach) + 'px');
}

let service2CameraTl = null;

function cancelService2Camera() {
  if (service2CameraTl) {
    service2CameraTl.kill();
    service2CameraTl = null;
  }
  const slider = document.getElementById('service-slider-2');
  if (!slider) return;
  const stage = document.getElementById('service-camera-stage-2');
  const divider = slider.querySelector('.model-slider-divider');
  const calloutNeck = document.getElementById('callout-neck');

  if (typeof gsap !== 'undefined') {
    if (stage) gsap.set(stage, { scale: 1, x: 0, y: 0 });
    // yPercent -50 = translateY(-50%) của CSS. Khai báo rõ (kèm x/y = 0) vì lần đầu GSAP đọc transform
    // nó có thể đổi -50% thành px cố định khi kích thước lẻ → lệch khi khung đổi kích thước
    if (calloutNeck) gsap.set(calloutNeck, { opacity: 0, scale: 0.9, x: 0, y: 0, yPercent: -50 });
    if (divider) gsap.set(divider, { opacity: 1, pointerEvents: 'auto' });
  }
  slider.style.setProperty('--slider-pos', '50%');
  if (divider) divider.style.left = '50%';
}

function playService2CameraTour() {
  const slider = document.getElementById('service-slider-2');
  if (!slider || typeof gsap === 'undefined') return;
  const stage = document.getElementById('service-camera-stage-2');
  if (!stage) return;
  const divider = slider.querySelector('.model-slider-divider');
  const calloutNeck = document.getElementById('callout-neck');

  if (service2CameraTl) service2CameraTl.kill();

  // Đặt vùng khoanh theo kích thước khung hiện tại (và theo dõi resize trong lúc chạy)
  ensureServiceFocusObserver();
  layoutService2Callout();

  // Initially:
  // - Stage stays completely normal (scale: 1, x: 0, y: 0) -> NO CLIPPING, NO CUTTING OFF!
  // - Hide divider line
  // - Show After image fully so user inspects the retouched collar (slider-pos = 0%)
  if (divider) gsap.set(divider, { opacity: 0, pointerEvents: 'none' });
  slider.style.setProperty('--slider-pos', '0%');
  gsap.set(stage, { scale: 1, x: 0, y: 0 });
  if (calloutNeck) gsap.set(calloutNeck, { opacity: 0, scale: 0.88, x: 0, y: 0, yPercent: -50 });

  service2CameraTl = gsap.timeline({
    delay: 0.2,
    onComplete: () => {
      // Completed: smoothly reveal divider line and set slider to exact 50%
      slider.style.setProperty('--slider-pos', '50%');
      if (divider) divider.style.left = '50%';
      if (divider) {
        gsap.to(divider, {
          opacity: 1,
          duration: 0.35,
          ease: 'power2.out',
          onStart: () => {
            divider.style.pointerEvents = 'auto';
          }
        });
      }
      service2CameraTl = null;
    }
  });

  // Step 1: Khoanh vùng chỗ đã sửa đầu tiên (cổ áo) + hiện chú thích (0.4s)
  service2CameraTl
    .to(calloutNeck, {
      opacity: 1,
      scale: 1,
      duration: 0.4,
      ease: 'back.out(1.5)'
    })
    // Dừng vừa đủ để người xem nhận diện vùng khoanh và đọc chú thích (0.9s)
    .to({}, { duration: 0.9 })
    // Step 2: Ẩn chú thích và vùng khoanh (0.25s)
    .to(calloutNeck, {
      opacity: 0,
      scale: 0.95,
      duration: 0.25,
      ease: 'power2.in'
    })
    // Step 3: Đồng thời thanh Before/After trượt về 50% cho người dùng tương tác (0.45s)
    .to({ pos: 0 }, {
      pos: 50,
      duration: 0.45,
      ease: 'power2.out',
      onUpdate: function() {
        const val = this.targets()[0].pos;
        slider.style.setProperty('--slider-pos', val + '%');
        if (divider) divider.style.left = val + '%';
      }
    }, '-=0.15')
    .to(divider, {
      opacity: 1,
      duration: 0.35,
      ease: 'power2.out',
      onStart: () => {
        divider.style.pointerEvents = 'auto';
      }
    }, '-=0.35');
}

// Service 03: kính lúp đi từ khuyên tai trái → phải (toạ độ trên khung desktop 693×403)
const SERVICE3_LOUPE_FROM = { x: 235, y: 195 };
const SERVICE3_LOUPE_TO = { x: 325, y: 205 };
const SERVICE3_IMAGE_SIZE = [5504, 3072];
const LOUPE_DIAMETER = 176; // đường kính trên desktop (CSS --loupe-d mặc định)
const LOUPE_MAGNIFY = 1.8;
let service3LoupeMapper = null;
const service3LoupeRefPos = { x: SERVICE3_LOUPE_FROM.x, y: SERVICE3_LOUPE_FROM.y };

// Đặt kính lúp tại điểm (toạ độ khung desktop) và đồng bộ ảnh phóng to bên trong ống kính
function placeService3Loupe(refX, refY) {
  service3LoupeRefPos.x = refX;
  service3LoupeRefPos.y = refY;
  const loupe = document.getElementById('jewelry-loupe');
  const canvas = document.getElementById('loupe-zoom-canvas');
  if (!service3LoupeMapper || !loupe || !canvas) return;
  const p = service3LoupeMapper.map(refX, refY);
  const halfD = (LOUPE_DIAMETER * service3LoupeMapper.k) / 2;
  loupe.style.left = p.x + 'px';
  loupe.style.top = p.y + 'px';
  canvas.style.transform = `translate(${halfD - p.x * LOUPE_MAGNIFY}px, ${halfD - p.y * LOUPE_MAGNIFY}px) scale(${LOUPE_MAGNIFY})`;
}

function layoutService3Loupe() {
  const slider = document.getElementById('service-slider-3');
  const overlay = document.getElementById('service-3-loupe');
  const box = getServiceBoxSize(slider);
  if (!overlay || !box) return;
  service3LoupeMapper = createServiceFocusMapper(slider.querySelector('.model-img-before'), SERVICE3_IMAGE_SIZE, box);
  // Ống kính co giãn cùng ảnh (phủ cùng một vùng trang sức); ảnh phóng to trong ống kính = đúng khung ảnh hiện tại
  overlay.style.setProperty('--loupe-d', roundServicePx(LOUPE_DIAMETER * service3LoupeMapper.k) + 'px');
  overlay.style.setProperty('--loupe-canvas-w', box.width + 'px');
  overlay.style.setProperty('--loupe-canvas-h', box.height + 'px');
  placeService3Loupe(service3LoupeRefPos.x, service3LoupeRefPos.y);
}

let service3LoupeTl = null;

function cancelService3Loupe() {
  if (service3LoupeTl) {
    service3LoupeTl.kill();
    service3LoupeTl = null;
  }
  const slider = document.getElementById('service-slider-3');
  if (!slider) return;
  const overlay = document.getElementById('service-3-loupe');
  const loupe = document.getElementById('jewelry-loupe');
  const divider = slider.querySelector('.model-slider-divider');

  if (typeof gsap !== 'undefined') {
    if (overlay) gsap.set(overlay, { opacity: 0 });
    // xPercent/yPercent -50 = translate(-50%, -50%) của CSS (kèm x/y = 0): tâm kính lúp luôn đúng khi đường kính lẻ / đổi kích thước
    if (loupe) gsap.set(loupe, { scale: 0.7, opacity: 0, x: 0, y: 0, xPercent: -50, yPercent: -50 });
    if (divider) gsap.set(divider, { opacity: 1, pointerEvents: 'auto' });
  }
  slider.style.setProperty('--slider-pos', '50%');
  if (divider) divider.style.left = '50%';
}

function playService3Loupe() {
  const slider = document.getElementById('service-slider-3');
  if (!slider || typeof gsap === 'undefined') return;
  const divider = slider.querySelector('.model-slider-divider');
  const overlay = document.getElementById('service-3-loupe');
  const loupe = document.getElementById('jewelry-loupe');
  const canvas = document.getElementById('loupe-zoom-canvas');
  if (!overlay || !loupe || !canvas) return;

  if (service3LoupeTl) service3LoupeTl.kill();

  // 1. Initial State:
  // - Hide divider line
  // - Show base image in ONE SINGLE UNIFORM TONE across the whole container (100% Before image)
  //   --slider-pos set to 100% means the after-clip has width 0, so entire image is 1 tone!
  if (divider) gsap.set(divider, { opacity: 0, pointerEvents: 'none' });
  slider.style.setProperty('--slider-pos', '100%');
  if (divider) divider.style.left = '50%';

  // Start position: Left earring diamond curve.
  // Toạ độ tính trên khung desktop rồi quy đổi theo khung hiện tại (layoutService3Loupe / placeService3Loupe),
  // nên kính lúp và ảnh phóng to luôn trùng đúng chi tiết trang sức ở mọi kích thước, kể cả khi resize giữa chừng.
  ensureServiceFocusObserver();
  service3LoupeRefPos.x = SERVICE3_LOUPE_FROM.x;
  service3LoupeRefPos.y = SERVICE3_LOUPE_FROM.y;
  layoutService3Loupe();
  const posProxy = { x: SERVICE3_LOUPE_FROM.x, y: SERVICE3_LOUPE_FROM.y };

  gsap.set(overlay, { opacity: 1 });
  gsap.set(loupe, { scale: 0.4, opacity: 0, x: 0, y: 0, xPercent: -50, yPercent: -50 });

  service3LoupeTl = gsap.timeline({
    delay: 0.25,
    onComplete: () => {
      gsap.set(overlay, { opacity: 0 });
      // Guarantee exactly 50% split
      slider.style.setProperty('--slider-pos', '50%');
      if (divider) {
        divider.style.left = '50%';
        gsap.to(divider, {
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
          onStart: () => {
            divider.style.pointerEvents = 'auto';
          }
        });
      }
      service3LoupeTl = null;
    }
  });

  // Step 1: Loupe scales in quickly over the Left Earring diamonds (0.35s)
  service3LoupeTl
    .to(loupe, {
      scale: 1,
      opacity: 1,
      duration: 0.35,
      ease: 'back.out(1.4)'
    })
    // Brief pause to register diamond pavé texture (0.25s)
    .to({}, { duration: 0.25 })
    // Step 2: Loupe glides swiftly across to the Right Earring (0.65s)
    .to(posProxy, {
      x: SERVICE3_LOUPE_TO.x,
      y: SERVICE3_LOUPE_TO.y,
      duration: 0.65,
      ease: 'power2.inOut',
      onUpdate: () => placeService3Loupe(posProxy.x, posProxy.y)
    })
    // Brief pause to register mirror gold polish (0.25s)
    .to({}, { duration: 0.25 })
    // Step 3: Loupe briskly scales down and exits (0.25s)
    .to(loupe, {
      scale: 0.7,
      opacity: 0,
      duration: 0.25,
      ease: 'power2.in'
    })
    // Step 4: After loupe exits, the divider line appears and smoothly splits to 50% (0.5s with slight overlap)
    .to({ pos: 100 }, {
      pos: 50,
      duration: 0.5,
      ease: 'power2.out',
      onUpdate: function() {
        const val = this.targets()[0].pos;
        slider.style.setProperty('--slider-pos', val + '%');
      }
    }, '-=0.15')
    .to(divider, {
      opacity: 1,
      duration: 0.35,
      ease: 'power2.out',
      onStart: () => {
        divider.style.pointerEvents = 'auto';
      }
    }, '-=0.35');
}

/* ==========================================================================
   WHO WE WORKED WITH: COSMOS (PINNED STICKY SCROLLYTELLING)
   ========================================================================== */
function initAudienceConcepts() {
  const cosmosContainer = document.getElementById('cosmos-scrolly-container');
  const cosmosStickyStage = document.getElementById('cosmos-sticky-stage');
  const cosmosStage = document.getElementById('cosmos-card-stage');
  const cosmosTextStage = document.getElementById('cosmos-text-stage');
  const cosmosCards = document.querySelectorAll('.cosmos-card-layer');
  const cosmosTexts = document.querySelectorAll('.cosmos-text-item');

  if (!cosmosContainer || cosmosCards.length === 0) return;

  let activeCosmosIndex = -1;
  let stickyTop = 0;
  let stageHeight = 0;

  function updateStickyMetrics() {
    if (cosmosStickyStage) {
      stickyTop = parseFloat(getComputedStyle(cosmosStickyStage).top) || 0;
      stageHeight = cosmosStickyStage.offsetHeight || window.innerHeight;
    } else {
      stickyTop = 0;
      stageHeight = window.innerHeight;
    }
  }

  function setCosmosStep(index) {
    if (index === activeCosmosIndex) return;
    const direction = index >= activeCosmosIndex ? 'down' : 'up';
    const prevIndex = activeCosmosIndex;
    activeCosmosIndex = index;

    if (cosmosStage) cosmosStage.setAttribute('data-direction', direction);
    if (cosmosTextStage) cosmosTextStage.setAttribute('data-direction', direction);

    cosmosCards.forEach((card, idx) => {
      if (idx === index) {
        card.classList.remove('is-leaving');
        card.classList.add('is-active');
        card.style.zIndex = '3';
      } else if (idx === prevIndex) {
        card.classList.remove('is-active');
        card.classList.add('is-leaving');
        card.style.zIndex = '2';
      } else {
        card.classList.remove('is-active', 'is-leaving');
        card.style.zIndex = '1';
      }
    });

    cosmosTexts.forEach((item, idx) => {
      if (idx === index) {
        item.classList.remove('is-leaving');
        item.classList.add('is-active');
      } else if (idx === prevIndex) {
        item.classList.remove('is-active');
        item.classList.add('is-leaving');
      } else {
        item.classList.remove('is-active', 'is-leaving');
      }
    });
  }

  function handleCosmosScroll() {
    if (!cosmosContainer) return;

    const rect = cosmosContainer.getBoundingClientRect();
    const totalDist = rect.height - stageHeight;
    if (totalDist <= 0) return;

    const scrolled = stickyTop - rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / totalDist));

    let step = 0;
    const isMobile = window.innerWidth <= 991;
    if (isMobile) {
      // Mobile: Dành 30% đầu tiên làm vùng đệm cho Thẻ 01 hấp thụ quán tính từ Services, tránh bị trôi sang Thẻ 02
      if (progress < 0.30) step = 0;
      else if (progress < 0.475) step = 1;
      else if (progress < 0.65) step = 2;
      else if (progress < 0.825) step = 3;
      else step = 4;
    } else {
      // Desktop: Giữ nguyên chia đều 5 thẻ tuyến tính 100% như cũ
      step = Math.min(4, Math.floor(progress * 5));
    }
    setCosmosStep(step);
  }

  function onResize() {
    updateStickyMetrics();
    handleCosmosScroll();
  }

  window.addEventListener('scroll', handleCosmosScroll, { passive: true });
  window.addEventListener('resize', debounce(onResize, 150), { passive: true });

  // Initial step & metrics setup
  updateStickyMetrics();
  setCosmosStep(0);
  handleCosmosScroll();
}

/* ==========================================================================
   MOBILE NAVIGATION MENU TOGGLE & SMOOTH ANCHOR SCROLL
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const navPanel = document.getElementById('mobile-nav-panel');
  const header = document.getElementById('main-header');
  const navItems = document.querySelectorAll('.mobile-nav-item');
  const ctaPill = document.querySelector('.mobile-nav-cta-pill');
  if (!toggleBtn || !navPanel) return;

  // Khóa cuộn kiểu an toàn cho iOS: body.overflow = hidden không có tác dụng vì html đang overflow-x: clip,
  // nên cố định body tại vị trí hiện tại và trả về đúng chỗ khi đóng menu
  let lockedScrollY = 0;
  let isPageLocked = false;

  function lockPageScroll() {
    if (isPageLocked) return;
    isPageLocked = true;
    lockedScrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  }

  function unlockPageScroll() {
    if (!isPageLocked) return;
    isPageLocked = false;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo({ top: lockedScrollY, behavior: 'instant' });
  }

  function toggleMenu(open) {
    const isOpen = open !== undefined ? open : !toggleBtn.classList.contains('is-open');
    toggleBtn.classList.toggle('is-open', isOpen);
    navPanel.classList.toggle('is-open', isOpen);
    if (header) header.classList.toggle('menu-open', isOpen);
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
    navPanel.setAttribute('aria-hidden', String(!isOpen));

    // Lock background page scroll on mobile while menu is open
    if (isOpen) {
      lockPageScroll();
    } else {
      unlockPageScroll();
    }
  }

  toggleBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const targetId = item.getAttribute('href');
      toggleMenu(false);

      if (targetId && targetId.startsWith('#')) {
        const targetEl = document.querySelector(targetId);
        if (targetEl) {
          e.preventDefault();
          setTimeout(() => {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 100);
        }
      }
    });
  });

  if (ctaPill) {
    ctaPill.addEventListener('click', () => {
      toggleMenu(false);
    });
  }

  const headerCta = header ? header.querySelector('.btn-trial-header') : null;
  if (headerCta) {
    headerCta.addEventListener('click', () => {
      if (toggleBtn.classList.contains('is-open')) {
        toggleMenu(false);
      }
    });
  }

  const brandLogo = header ? header.querySelector('.brand-logo') : null;
  if (brandLogo) {
    brandLogo.addEventListener('click', () => {
      if (toggleBtn.classList.contains('is-open')) {
        toggleMenu(false);
      }
    });
  }

  // Click outside to close (e.g. if overlay clicked)
  document.addEventListener('click', (e) => {
    if (toggleBtn.classList.contains('is-open')) {
      if (!navPanel.contains(e.target) && !toggleBtn.contains(e.target) && (!header || !header.contains(e.target))) {
        toggleMenu(false);
      }
    }
  });

  // Escape key to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggleBtn.classList.contains('is-open')) {
      toggleMenu(false);
    }
  });

  // Close when window resized to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && toggleBtn.classList.contains('is-open')) {
      toggleMenu(false);
    }
  });
}

