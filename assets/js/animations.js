/**
 * ============================================================================
 * NESSO STUDIO — GSAP & SCROLLTRIGGER ANIMATION ENGINE
 * ============================================================================
 * File: animations.js
 * Location in WP Theme: wp-content/themes/{your-theme}/assets/js/animations.js
 * 
 * Dependencies: GSAP Core (v3.12+), ScrollTrigger (v3.12+)
 * ============================================================================
 */

(function () {
  'use strict';

  // 1. Wait for DOM to be fully loaded
  document.addEventListener('DOMContentLoaded', () => {
    // Check if GSAP & ScrollTrigger are available
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[GSAP] GSAP or ScrollTrigger is not loaded.');
      return;
    }

    // 2. Register ScrollTrigger Plugin
    gsap.registerPlugin(ScrollTrigger);

    // 3. Respect user accessibility settings (prefers-reduced-motion)
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      console.info('[GSAP] Reduced motion preferred. Animations suppressed for accessibility.');
      return;
    }

    // 4. Initialize Animations
    initHeroAnimations();
    initScrollRevealAnimations();
    initParallaxEffects();
    initInteractiveTriggers();
  });

  /**
   * --------------------------------------------------------------------------
   * SECTION 1: HERO ENTRANCE ANIMATIONS (Chạy khi tải trang)
   * --------------------------------------------------------------------------
   */
  function initHeroAnimations() {
    const heroTl = gsap.timeline({
      defaults: { ease: 'power3.out', duration: 1 }
    });

    // Ví dụ: Animation xuất hiện tuần tự (Stagger) cho các thành phần Hero
    heroTl
      .from('.eyebrow-group', {
        y: 20,
        opacity: 0,
        duration: 0.8
      })
      .from('.hero-headline', {
        y: 30,
        opacity: 0,
        duration: 1
      }, '-=0.5')
      .from('.hero-subtext', {
        y: 20,
        opacity: 0,
        duration: 0.8
      }, '-=0.6')
      .from('.hero-cta-group', {
        y: 20,
        opacity: 0,
        duration: 0.8
      }, '-=0.6')
      .from('.hero-right', {
        scale: 0.96,
        opacity: 0,
        duration: 1.2,
        ease: 'power2.out'
      }, '-=0.8');
  }

  /**
   * --------------------------------------------------------------------------
   * SECTION 2: SCROLLTRIGGER REVEAL ANIMATIONS (Xuất hiện khi cuộn tới)
   * --------------------------------------------------------------------------
   */
  function initScrollRevealAnimations() {
    // Fade up cho các tiêu đề Section
    const sectionHeaders = document.querySelectorAll('.services-header-group, .approach-left, .audience-left');
    sectionHeaders.forEach((header) => {
      gsap.from(header, {
        scrollTrigger: {
          trigger: header,
          start: 'top 85%',
          toggleActions: 'play none none none', // play, pause, resume, reverse
          // markers: true, // Bật 'true' khi muốn debug vị trí trigger
        },
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      });
    });

    // Stagger xuất hiện cho logo Selected Clients
    if (document.querySelector('.clients-logo-row')) {
      gsap.from('.client-logo-wrap', {
        scrollTrigger: {
          trigger: '.figma-clients-section',
          start: 'top 80%',
        },
        y: 20,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
      });
    }

    // Hiệu ứng trượt vào cho Service Items
    const serviceItems = document.querySelectorAll('.service-row-01, .service-row-simple');
    serviceItems.forEach((item, index) => {
      gsap.from(item, {
        scrollTrigger: {
          trigger: item,
          start: 'top 80%',
        },
        y: 45,
        opacity: 0,
        duration: 1,
        delay: index * 0.1,
        ease: 'power3.out'
      });
    });
  }

  /**
   * --------------------------------------------------------------------------
   * SECTION 3: PARALLAX & SCRUB EFFECTS (Hiệu ứng di chuyển mượt theo cuộn chuột)
   * --------------------------------------------------------------------------
   */
  function initParallaxEffects() {
    // Parallax nhẹ cho hình ảnh Sneaker trong section "Who We Worked With"
    const sneakerCard = document.querySelector('.sneakers-comparison-card');
    if (sneakerCard) {
      gsap.to(sneakerCard, {
        scrollTrigger: {
          trigger: '.figma-audience-section',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.2, // Chuyển động bám theo quán tính cuộn chuột
        },
        y: -30,
        ease: 'none'
      });
    }

    // Video preview scale nhẹ khi cuộn vào tầm nhìn
    const videoCard = document.querySelector('.video-preview-wrapper');
    if (videoCard) {
      gsap.from(videoCard, {
        scrollTrigger: {
          trigger: videoCard,
          start: 'top 85%',
          end: 'center center',
          scrub: 1,
        },
        scale: 0.94,
        opacity: 0.7,
        ease: 'power2.out'
      });
    }
  }

  /**
   * --------------------------------------------------------------------------
   * SECTION 4: INTERACTIVE TRIGGERS & UTILITIES
   * --------------------------------------------------------------------------
   */
  function initInteractiveTriggers() {
    // Cập nhật lại ScrollTrigger khi người dùng tương tác thay đổi layout
    // Ví dụ: Khi chuyển tab hoặc mở accordion
    window.addEventListener('resize', () => {
      ScrollTrigger.refresh();
    });
  }

  // Export globally if needed
  window.NessoAnimations = {
    refresh: () => ScrollTrigger.refresh()
  };

})();
