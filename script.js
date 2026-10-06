/**
 * NESSO PHOTO RETOUCH — LANDING PAGE SCRIPTS
 * Hero section powered by Cosmos.so 4-Tier Galaxy Orbit Engine (cosmos-hero.js).
 * Interactive Service Accordion & Comparison Sliders handled below.
 */

document.addEventListener('DOMContentLoaded', () => {
  initAllServiceSliders();
  initServiceAccordion();
  initServiceCircleCursor();
  initAudienceConcepts();
});

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

  const setPercentage = (percentage) => {
    const clamped = Math.max(0, Math.min(100, percentage));
    container.style.setProperty('--slider-pos', clamped + '%');
    divider.style.left = clamped + '%';
  };

  const setPositionFromClientX = (clientX) => {
    const rect = container.getBoundingClientRect();
    const offsetX = clientX - rect.left;
    const percentage = (offsetX / rect.width) * 100;
    setPercentage(percentage);
  };

  // Explicit default initialization at 50%
  setPercentage(50);

  const onPointerDown = (e) => {
    // If entrance animation is running on this slider, cancel immediately so user has full instant control
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
    isDragging = true;
    try {
      container.setPointerCapture(e.pointerId);
    } catch (_) {}
    setPositionFromClientX(e.clientX);
  };

  const onPointerMove = (e) => {
    if (!isDragging) return;
    setPositionFromClientX(e.clientX);
  };

  const onPointerUp = (e) => {
    if (!isDragging) return;
    isDragging = false;
    try {
      container.releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  container.addEventListener('pointerdown', onPointerDown);
  container.addEventListener('pointermove', onPointerMove);
  container.addEventListener('pointerup', onPointerUp);
  container.addEventListener('pointercancel', onPointerUp);

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
      setPercentage(current - 5);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
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
    const titleText = collapsedRow.querySelector('.service-simple-title');

    collapsedRow.addEventListener('mouseenter', () => {
      if (typeof gsap !== 'undefined') {
        if (thumbImg) gsap.to(thumbImg, { scale: 1.04, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
        if (titleText) gsap.to(titleText, { x: 5, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
      }
    });

    collapsedRow.addEventListener('mouseleave', () => {
      if (typeof gsap !== 'undefined') {
        if (thumbImg) gsap.to(thumbImg, { scale: 1, duration: 0.35, ease: 'power2.out', overwrite: 'auto' });
        if (titleText) gsap.to(titleText, { x: 0, duration: 0.25, ease: 'power2.out', overwrite: 'auto' });
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

function switchServiceAccordion(targetItem) {
  if (targetItem.classList.contains('is-active')) return;

  const currentActive = document.querySelector('.service-accordion-item.is-active');

  if (typeof gsap !== 'undefined') {
    const tl = gsap.timeline();

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
  }
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
  const calloutZipper = document.getElementById('callout-zipper');

  if (typeof gsap !== 'undefined') {
    if (stage) gsap.set(stage, { scale: 1, x: 0, y: 0 });
    if (calloutNeck) gsap.set(calloutNeck, { opacity: 0 });
    if (calloutZipper) gsap.set(calloutZipper, { opacity: 0 });
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
  const calloutZipper = document.getElementById('callout-zipper');

  if (service2CameraTl) service2CameraTl.kill();

  // Initially: hide divider line, show After image fully so user inspects the retouched result
  if (divider) gsap.set(divider, { opacity: 0, pointerEvents: 'none' });
  slider.style.setProperty('--slider-pos', '0%');
  gsap.set(stage, { scale: 1, x: 0, y: 0 });
  if (calloutNeck) gsap.set(calloutNeck, { opacity: 0, x: -14 });
  if (calloutZipper) gsap.set(calloutZipper, { opacity: 0, x: -14 });

  service2CameraTl = gsap.timeline({
    delay: 0.2,
    onComplete: () => {
      // Zoom out completed: smoothly reveal divider line and reset slider to exact 50%
      slider.style.setProperty('--slider-pos', '50%');
      if (divider) divider.style.left = '50%';
      if (divider) {
        gsap.to(divider, {
          opacity: 1,
          duration: 0.4,
          ease: 'power2.out',
          onStart: () => {
            divider.style.pointerEvents = 'auto';
          }
        });
      }
      service2CameraTl = null;
    }
  });

  // Step 1: Camera zooms into Collar & Neck-Joint (s = 2.25, x: 6, y: 305)
  service2CameraTl
    .to(stage, {
      scale: 2.25,
      x: 6,
      y: 305,
      duration: 0.85,
      ease: 'power2.inOut'
    })
    // Callout 1 appears with gentle spring
    .to(calloutNeck, {
      opacity: 1,
      x: 0,
      duration: 0.4,
      ease: 'back.out(1.5)'
    }, '-=0.2')
    // Wait for viewer observation
    .to({}, { duration: 1.1 })
    // Callout 1 exits smoothly
    .to(calloutNeck, {
      opacity: 0,
      x: 10,
      duration: 0.25,
      ease: 'power2.in'
    })
    // Step 2: Camera pans down to Zipper & Fabric alignment (s = 2.25, x: 6, y: -10)
    .to(stage, {
      scale: 2.25,
      x: 6,
      y: -10,
      duration: 0.85,
      ease: 'power2.inOut'
    }, '-=0.1')
    // Callout 2 appears with gentle spring
    .to(calloutZipper, {
      opacity: 1,
      x: 0,
      duration: 0.4,
      ease: 'back.out(1.5)'
    }, '-=0.2')
    // Wait for viewer observation
    .to({}, { duration: 1.1 })
    // Callout 2 exits smoothly
    .to(calloutZipper, {
      opacity: 0,
      x: 10,
      duration: 0.25,
      ease: 'power2.in'
    })
    // Step 3: Camera zooms back out to full jacket view
    .to(stage, {
      scale: 1,
      x: 0,
      y: 0,
      duration: 0.85,
      ease: 'power2.inOut'
    }, '-=0.05')
    // Concurrently transition slider-pos from 0% to 50%
    .to({ pos: 0 }, {
      pos: 50,
      duration: 0.6,
      ease: 'power2.out',
      onUpdate: function() {
        const val = this.targets()[0].pos;
        slider.style.setProperty('--slider-pos', val + '%');
        if (divider) divider.style.left = val + '%';
      }
    }, '-=0.5');
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
    if (loupe) gsap.set(loupe, { scale: 0.7, opacity: 0 });
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

  // Loupe magnification factor
  const M = 1.8;
  const halfD = 88; // 176px / 2

  // Function to place the loupe and sync the internal magnified canvas
  const updateLoupePosition = (x, y) => {
    loupe.style.left = x + 'px';
    loupe.style.top = y + 'px';
    const canvasX = halfD - x * M;
    const canvasY = halfD - y * M;
    canvas.style.transform = `translate(${canvasX}px, ${canvasY}px) scale(${M})`;
  };

  // Start position: Left earring diamond curve
  const posProxy = { x: 235, y: 195 };
  updateLoupePosition(posProxy.x, posProxy.y);

  gsap.set(overlay, { opacity: 1 });
  gsap.set(loupe, { scale: 0.4, opacity: 0 });

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

  // Step 1: Loupe scales in over the Left Earring diamonds
  service3LoupeTl
    .to(loupe, {
      scale: 1,
      opacity: 1,
      duration: 0.6,
      ease: 'back.out(1.6)'
    })
    // Pause to inspect diamond pavé and prong settings
    .to({}, { duration: 1.1 })
    // Step 2: Loupe glides smoothly across to the Right Earring (inner polished gold clasp & diamonds)
    .to(posProxy, {
      x: 325,
      y: 205,
      duration: 1.25,
      ease: 'power2.inOut',
      onUpdate: () => updateLoupePosition(posProxy.x, posProxy.y)
    })
    // Pause to inspect mirror gold polish & gemstone brilliance
    .to({}, { duration: 1.1 })
    // Step 3: Loupe gently scales down and exits
    .to(loupe, {
      scale: 0.7,
      opacity: 0,
      duration: 0.4,
      ease: 'power2.in'
    })
    // Step 4: After loupe exits, the divider line appears AND the 2 tones are divided!
    // Concurrently transition slider-pos from 100% (1 tone) to 50% (2 tones)!
    .to({ pos: 100 }, {
      pos: 50,
      duration: 0.65,
      ease: 'power2.out',
      onUpdate: function() {
        const val = this.targets()[0].pos;
        slider.style.setProperty('--slider-pos', val + '%');
      }
    }, '-=0.25')
    .to(divider, {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out',
      onStart: () => {
        divider.style.pointerEvents = 'auto';
      }
    }, '-=0.45');
}

/* ==========================================================================
   WHO WE WORKED WITH: COSMOS (PINNED STICKY SCROLLYTELLING)
   ========================================================================== */
function initAudienceConcepts() {
  const cosmosContainer = document.getElementById('cosmos-scrolly-container');
  const cosmosCards = document.querySelectorAll('.cosmos-card-layer');
  const cosmosTexts = document.querySelectorAll('.cosmos-text-item');

  if (!cosmosContainer || cosmosCards.length === 0) return;

  let activeCosmosIndex = -1;

  function setCosmosStep(index) {
    if (index === activeCosmosIndex) return;
    activeCosmosIndex = index;

    cosmosCards.forEach((card, idx) => {
      card.classList.toggle('is-active', idx === index);
    });

    cosmosTexts.forEach((item, idx) => {
      item.classList.toggle('is-active', idx === index);
    });
  }

  function handleCosmosScroll() {
    if (!cosmosContainer) return;

    const rect = cosmosContainer.getBoundingClientRect();
    const winHeight = window.innerHeight;
    const totalDist = rect.height - winHeight;
    if (totalDist <= 0) return;

    const scrolled = -rect.top;
    const progress = Math.max(0, Math.min(1, scrolled / totalDist));

    let step = Math.floor(progress * 5);
    if (step > 4) step = 4;
    setCosmosStep(step);
  }

  window.addEventListener('scroll', handleCosmosScroll, { passive: true });
  window.addEventListener('resize', handleCosmosScroll, { passive: true });

  // Initial step setup
  setCosmosStep(0);
  handleCosmosScroll();
}

