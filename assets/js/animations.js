/**
 * ============================================================================
 * NESSO STUDIO — COSMOS-INSPIRED SCROLL ENTRANCE ANIMATIONS (GSAP & ScrollTrigger)
 * ============================================================================
 * Design Style: https://www.cosmos.so/
 * 
 * 1. Big Headings (Tiêu đề chữ to):
 *    - Signature Cosmos blur-to-sharp focus reveal + smooth upward float
 *    - Initial: y: 40px, opacity: 0, filter: blur(10px)
 *    - Target:  y: 0px,  opacity: 1, filter: blur(0px)
 *    - Easing:  power3.out, duration: 1.15s
 * 
 * 2. Visuals, Cards & Content Clusters (Hình ảnh & cụm nội dung):
 *    - Smooth upward slide & fade-in + subtle scale
 *    - Initial: y: 35px, opacity: 0, scale: 0.98
 *    - Target:  y: 0px,  opacity: 1, scale: 1.0
 *    - Easing:  power3.out, duration: 0.95s - 1.05s
 * 
 * Strictly respects existing layouts, hero spiral, and pinned scrollytelling.
 * ============================================================================
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    // 1. Verify GSAP & ScrollTrigger
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') {
      console.warn('[Cosmos Animations] GSAP or ScrollTrigger is not loaded.');
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // 2. Respect accessibility preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      console.info('[Cosmos Animations] Reduced motion preferred. Scroll animations bypassed.');
      return;
    }

    // 3. Initialize Cosmos-Style Scroll Reveal Engine
    initCosmosHeadlines();
    initCosmosContentClusters();
  });

  /**
   * Helper: Splits text nodes into individual characters wrapped in <span>,
   * grouped inside words (<span class="cosmos-word-wrap">) to prevent mid-word line breaking,
   * while completely preserving HTML hierarchy (<br>, <em>, <strong>, etc.),
   * styling, and normal line wraps without shifting layout.
   */
  function splitElementIntoChars(element) {
    if (!element || element.dataset.cosmosSplit) return [];
    element.dataset.cosmosSplit = 'true';
    const chars = [];

    function processNode(node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;
        const rawWords = text.trim().split(/\s+/).filter(Boolean);
        if (rawWords.length === 0) return;

        const frag = document.createDocumentFragment();
        if (text.startsWith(' ') && node.previousSibling && node.previousSibling.nodeName.toLowerCase() !== 'br') {
          frag.appendChild(document.createTextNode(' '));
        }

        rawWords.forEach((word, wIdx) => {
          const wordSpan = document.createElement('span');
          wordSpan.className = 'cosmos-word-wrap';
          wordSpan.style.display = 'inline-block';
          wordSpan.style.whiteSpace = 'nowrap';

          Array.from(word).forEach((char) => {
            const charSpan = document.createElement('span');
            charSpan.className = 'cosmos-char';
            charSpan.textContent = char;
            charSpan.style.display = 'inline-block';
            charSpan.style.willChange = 'filter, opacity';
            chars.push(charSpan);
            wordSpan.appendChild(charSpan);
          });

          frag.appendChild(wordSpan);
          if (wIdx < rawWords.length - 1) {
            frag.appendChild(document.createTextNode(' '));
          }
        });

        if (text.endsWith(' ') && node.nextSibling && node.nextSibling.nodeName.toLowerCase() !== 'br') {
          frag.appendChild(document.createTextNode(' '));
        }

        node.parentNode.replaceChild(frag, node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.tagName.toLowerCase() === 'br') return;
        Array.from(node.childNodes).forEach((child) => processNode(child));
      }
    }

    Array.from(element.childNodes).forEach((child) => processNode(child));
    return chars;
  }

  /**
   * Helper: Animate a set of character spans with the signature Cosmos letter-by-letter blur wave.
   */
  function animateCharCluster(chars, opts = {}) {
    if (!chars || chars.length === 0) return null;
    return gsap.fromTo(
      chars,
      {
        opacity: 0,
        filter: 'blur(' + (opts.blur || '7px') + ')',
        willChange: 'filter, opacity'
      },
      {
        scrollTrigger: opts.trigger
          ? {
              trigger: opts.trigger,
              start: opts.start || 'top 85%',
              once: true
            }
          : undefined,
        opacity: 1,
        filter: 'blur(0px)',
        duration: opts.duration || 0.48,
        delay: opts.delay || 0,
        stagger: {
          each: opts.stagger !== undefined ? opts.stagger : 0.012,
          from: 'start'
        },
        ease: 'power2.out',
        clearProps: 'filter,willChange'
      }
    );
  }

  /**
   * Helper: Animate a cluster of characters using Spatial X-Wavefront (Phương án 1)
   * A synchronized focus wave sweeps horizontally from left to right across ALL lines simultaneously.
   * Characters at the same horizontal X coordinate unblur together in unison across the entire cluster.
   */
  function animateCharClusterByX(chars, container, opts = {}) {
    if (!chars || chars.length === 0 || !container) return null;

    const containerRect = container.getBoundingClientRect();
    const containerLeft = containerRect.left;

    const charData = chars.map((char) => {
      const r = char.getBoundingClientRect();
      const relX = Math.max(0, r.left - containerLeft);
      return { char, relX };
    });

    const maxRelX = Math.max(...charData.map((d) => d.relX), 1);
    const waveTravel = opts.waveTravel || 0.35;
    const charDuration = opts.duration || 0.5;
    const baseBlur = opts.blur || '8px';

    // Initial state: pure stationary blur, zero translation
    gsap.set(chars, {
      opacity: 0,
      filter: 'blur(' + baseBlur + ')',
      willChange: 'filter, opacity'
    });

    const tl = gsap.timeline({
      scrollTrigger: opts.trigger
        ? {
            trigger: opts.trigger,
            start: opts.start || 'top 85%',
            once: true
          }
        : undefined,
      delay: opts.delay || 0
    });

    charData.forEach(({ char, relX }) => {
      const charDelay = (relX / maxRelX) * waveTravel;
      tl.to(
        char,
        {
          opacity: 1,
          filter: 'blur(0px)',
          duration: charDuration,
          ease: 'power2.out',
          clearProps: 'filter,willChange'
        },
        charDelay
      );
    });

    return tl;
  }

  /**
   * --------------------------------------------------------------------------
   * 1. COSMOS BIG HEADINGS: Letter-by-Letter Horizontal Blur Wave (Stationary)
   * --------------------------------------------------------------------------
   */
  function initCosmosHeadlines() {
    const standaloneHeadlines = [
      '.services-main-title',
      '.cosmos-clean-headline',
      '.workflow-clean-headline',
      '.section-headline'
    ];

    standaloneHeadlines.forEach((selector) => {
      const el = document.querySelector(selector);
      if (!el) return;

      const chars = splitElementIntoChars(el);
      if (chars.length === 0) return;

      animateCharCluster(chars, {
        trigger: el,
        start: 'top 85%',
        duration: 0.5,
        stagger: 0.012,
        blur: '8px'
      });
    });
  }

  /**
   * --------------------------------------------------------------------------
   * 2. COSMOS CONTENT CLUSTERS & IMAGES
   * --------------------------------------------------------------------------
   */
  function initCosmosContentClusters() {
    // ── SECTION: SELECTED CLIENTS ──
    const clientsSection = document.getElementById('clients');
    if (clientsSection) {
      const clientTitle = clientsSection.querySelector('.clients-title');
      const clientLogos = clientsSection.querySelectorAll('.client-logo-wrap');

      if (clientTitle) {
        gsap.fromTo(
          clientTitle,
          { y: 15, opacity: 0, filter: 'blur(4px)' },
          {
            scrollTrigger: {
              trigger: clientsSection,
              start: 'top 82%',
              once: true
            },
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.8,
            ease: 'power3.out',
            clearProps: 'filter'
          }
        );
      }

      if (clientLogos.length > 0) {
        gsap.fromTo(
          clientLogos,
          { y: 25, opacity: 0 },
          {
            scrollTrigger: {
              trigger: clientsSection,
              start: 'top 80%',
              once: true
            },
            y: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.08,
            ease: 'power3.out'
          }
        );
      }
    }

    // ── SECTION: THE APPROACH (FADE IN FROM BELOW TOGETHER) ──
    const approachSection = document.getElementById('approach');
    if (approachSection) {
      const approachLeft = approachSection.querySelector('.approach-left');
      const approachRight = approachSection.querySelector('.approach-right') || approachSection.querySelector('.video-preview-wrapper');

      const approachBlocks = [approachLeft, approachRight].filter(Boolean);
      if (approachBlocks.length > 0) {
        gsap.fromTo(
          approachBlocks,
          { y: 35, opacity: 0 },
          {
            scrollTrigger: {
              trigger: approachSection,
              start: 'top 82%',
              once: true
            },
            y: 0,
            opacity: 1,
            duration: 0.95,
            stagger: 0.1,
            ease: 'power3.out',
            clearProps: 'transform'
          }
        );
      }
    }

    // ── SECTION: OUR SERVICES (LABEL & HEADLINE LETTER WAVE, 3 SERVICES FADE IN FROM BELOW) ──
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      const eyebrowText = servicesSection.querySelector('.services-header-group .eyebrow-text');
      const eyebrowBar = servicesSection.querySelector('.services-header-group .eyebrow-bar');

      // 1. Label bar & text: Letter blur wave
      if (eyebrowBar) {
        gsap.fromTo(
          eyebrowBar,
          { opacity: 0, scaleX: 0 },
          {
            scrollTrigger: { trigger: servicesSection, start: 'top 85%', once: true },
            opacity: 1,
            scaleX: 1,
            duration: 0.45,
            ease: 'power2.out'
          }
        );
      }
      if (eyebrowText) {
        animateCharCluster(splitElementIntoChars(eyebrowText), {
          trigger: servicesSection,
          start: 'top 85%',
          delay: 0.0,
          stagger: 0.011,
          duration: 0.45,
          blur: '6px'
        });
      }
      // Note: Headline (.services-main-title) is animated with letter blur wave in initCosmosHeadlines()

      // 2. The 3 services below: Fade in from below as normal
      // Service 01 (Expanded View)
      const s1Visual = servicesSection.querySelector('#service-slider-1');
      const s1Content = servicesSection.querySelector('#service-item-1 .service-model-content');
      if (s1Visual || s1Content) {
        gsap.fromTo(
          [s1Visual, s1Content].filter(Boolean),
          { y: 35, opacity: 0 },
          {
            scrollTrigger: { trigger: '#service-item-1', start: 'top 80%', once: true },
            y: 0,
            opacity: 1,
            duration: 0.9,
            stagger: 0.1,
            ease: 'power3.out',
            clearProps: 'transform'
          }
        );
      }

      // Service 02 (Collapsed Row)
      const s2Row = servicesSection.querySelector('#service-item-2 .service-collapsed-row');
      if (s2Row) {
        gsap.fromTo(
          s2Row,
          { y: 30, opacity: 0 },
          {
            scrollTrigger: { trigger: '#service-item-2', start: 'top 85%', once: true },
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            clearProps: 'transform'
          }
        );
      }

      // Service 03 (Collapsed Row)
      const s3Row = servicesSection.querySelector('#service-item-3 .service-collapsed-row');
      if (s3Row) {
        gsap.fromTo(
          s3Row,
          { y: 30, opacity: 0 },
          {
            scrollTrigger: { trigger: '#service-item-3', start: 'top 85%', once: true },
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            clearProps: 'transform'
          }
        );
      }
    }

    // ── SECTION: WHO WE WORKED WITH (DISCIPLINE 01 LETTER WAVE BLUR) ──
    const audienceSection = document.getElementById('who-we-worked-with');
    if (audienceSection) {
      const d1 = audienceSection.querySelector('.cosmos-text-item[data-index="0"]');
      if (d1) {
        const d1Tag = d1.querySelector('.cosmos-discipline-tag');
        const d1Title = d1.querySelector('.cosmos-discipline-title');
        const d1Desc = d1.querySelector('.cosmos-discipline-desc');

        if (d1Tag) {
          animateCharCluster(splitElementIntoChars(d1Tag), {
            trigger: audienceSection,
            start: 'top 80%',
            delay: 0.04,
            stagger: 0.011,
            duration: 0.45,
            blur: '6px'
          });
        }
        if (d1Title) {
          animateCharCluster(splitElementIntoChars(d1Title), {
            trigger: audienceSection,
            start: 'top 80%',
            delay: 0.12,
            stagger: 0.012,
            duration: 0.5,
            blur: '8px'
          });
        }
        if (d1Desc) {
          animateCharCluster(splitElementIntoChars(d1Desc), {
            trigger: audienceSection,
            start: 'top 80%',
            delay: 0.26,
            stagger: 0.007,
            duration: 0.45,
            blur: '7px'
          });
        }
      }
    }

    // ── SECTION: HOW WE COLLABORATE (WORKFLOW) ──
    const workflowSection = document.getElementById('workflow');
    if (workflowSection) {
      const card = workflowSection.querySelector('.runway-workflow-card');
      if (card) {
        gsap.fromTo(
          card,
          { y: 38, opacity: 0, scale: 0.98 },
          {
            scrollTrigger: {
              trigger: workflowSection,
              start: 'top 80%',
              once: true
            },
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.05,
            delay: 0.1,
            ease: 'power3.out',
            clearProps: 'transform'
          }
        );
      }
    }

    // ── SECTION: PRICING ──
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      const eyebrow = pricingSection.querySelector('.eyebrow-group');
      const subtext = pricingSection.querySelector('.section-subtext');
      const switcher = pricingSection.querySelector('.design-option-switcher');
      const billingToggle = pricingSection.querySelector('.pricing-billing-toggle-wrap');
      const priceCards = pricingSection.querySelectorAll('.pricing-view-elevated .price-card');
      const guaranteeNote = pricingSection.querySelector('.pricing-guarantee-note');

      if (eyebrow) {
        gsap.fromTo(
          eyebrow,
          { y: 16, opacity: 0 },
          {
            scrollTrigger: { trigger: pricingSection, start: 'top 85%', once: true },
            y: 0,
            opacity: 1,
            duration: 0.75,
            ease: 'power3.out'
          }
        );
      }

      const controlsCluster = [subtext, switcher, billingToggle].filter(Boolean);
      if (controlsCluster.length > 0) {
        gsap.fromTo(
          controlsCluster,
          { y: 22, opacity: 0 },
          {
            scrollTrigger: { trigger: pricingSection, start: 'top 80%', once: true },
            y: 0,
            opacity: 1,
            duration: 0.85,
            stagger: 0.1,
            delay: 0.15,
            ease: 'power3.out'
          }
        );
      }

      if (priceCards.length > 0) {
        gsap.fromTo(
          priceCards,
          { y: 35, opacity: 0 },
          {
            scrollTrigger: {
              trigger: '.pricing-view-elevated',
              start: 'top 82%',
              once: true
            },
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'power3.out',
            clearProps: 'transform'
          }
        );
      }

      if (guaranteeNote) {
        gsap.fromTo(
          guaranteeNote,
          { y: 25, opacity: 0 },
          {
            scrollTrigger: { trigger: guaranteeNote, start: 'top 88%', once: true },
            y: 0,
            opacity: 1,
            duration: 0.85,
            ease: 'power3.out'
          }
        );
      }
    }

    // ── SECTION: CTA (INTERCOM GRID CANVAS: LETTER WAVE BLUR & ENTRANCE) ──
    const ctaSection = document.getElementById('d4-cta');
    if (ctaSection) {
      const ctaHeadline = ctaSection.querySelector('.d4-center-headline');
      const ctaBtn = ctaSection.querySelector('.d4-actions-row');
      const ctaMedia = ctaSection.querySelectorAll('.d4-cell-media, .d4-sketch-art');
      const ctaDots = ctaSection.querySelectorAll('.d4-dot');

      // 1. Blue Dots: Subtle expansion from center
      if (ctaDots.length > 0) {
        gsap.fromTo(
          ctaDots,
          { opacity: 0, scale: 0 },
          {
            scrollTrigger: { trigger: ctaSection, start: 'top 85%', once: true },
            opacity: 1,
            scale: 1,
            duration: 0.45,
            stagger: {
              amount: 0.35,
              from: 'center'
            },
            ease: 'power2.out',
            clearProps: 'transform'
          }
        );
      }

      // 2. Photos & Line-art sketches: Clean blur-to-sharp focus entrance
      if (ctaMedia.length > 0) {
        gsap.fromTo(
          ctaMedia,
          { opacity: 0, scale: 0.88, filter: 'blur(8px)' },
          {
            scrollTrigger: { trigger: ctaSection, start: 'top 82%', once: true },
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.8,
            stagger: 0.08,
            delay: 0.15,
            ease: 'power3.out',
            clearProps: 'filter,transform'
          }
        );
      }

      // 3. Center Headline: Signature Cosmos Letter-by-Letter Horizontal Blur Wave
      if (ctaHeadline) {
        const ctaChars = splitElementIntoChars(ctaHeadline);
        animateCharCluster(ctaChars, {
          trigger: ctaSection,
          start: 'top 80%',
          delay: 0.06,
          duration: 0.52,
          stagger: 0.012,
          blur: '8px'
        });
      }

      // 4. CTA Button: Lift with subtle blur reveal right as headline finishes
      if (ctaBtn) {
        gsap.fromTo(
          ctaBtn,
          { y: 24, opacity: 0, filter: 'blur(6px)' },
          {
            scrollTrigger: { trigger: ctaSection, start: 'top 80%', once: true },
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.75,
            delay: 0.42,
            ease: 'power3.out',
            clearProps: 'filter,transform'
          }
        );
      }
    }

    // ── SECTION: FAQ (INTERCOM STYLE ACCORDION: LETTER WAVE BLUR & ENTRANCE) ──
    const faqSection = document.getElementById('d4-faq');
    if (faqSection) {
      const faqHeadline = faqSection.querySelector('.d4-faq-headline');
      const faqCards = faqSection.querySelectorAll('.d4-faq-card');

      // 1. FAQ Headline: Signature Cosmos Letter-by-Letter Horizontal Blur Wave
      if (faqHeadline) {
        const faqChars = splitElementIntoChars(faqHeadline);
        animateCharCluster(faqChars, {
          trigger: faqSection,
          start: 'top 82%',
          delay: 0.05,
          duration: 0.52,
          stagger: 0.013,
          blur: '8px'
        });
      }

      // 2. FAQ Cards: Cascade blur-to-focus entrance
      if (faqCards.length > 0) {
        gsap.fromTo(
          faqCards,
          { y: 28, opacity: 0, filter: 'blur(6px)' },
          {
            scrollTrigger: { trigger: faqSection, start: 'top 80%', once: true },
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.75,
            stagger: 0.07,
            delay: 0.28,
            ease: 'power3.out',
            clearProps: 'filter,transform'
          }
        );
      }
    }
  }

  // Refresh ScrollTrigger when window resizes
  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
  }, { passive: true });

})();
