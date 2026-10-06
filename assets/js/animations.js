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

    // ── SECTION: THE APPROACH (FULL CONTENT CLUSTER LETTER WAVE BLUR - SPATIAL X WAVEFRONT) ──
    const approachSection = document.getElementById('approach');
    if (approachSection) {
      const approachLeft = approachSection.querySelector('.approach-left');
      const appEyebrow = approachSection.querySelector('.eyebrow-text');
      const appBar = approachSection.querySelector('.eyebrow-bar');
      const appHeadline = approachSection.querySelector('.approach-headline');
      const appSubline = approachSection.querySelector('.approach-subline');
      const appCta = approachSection.querySelector('.btn-watch-overview span');
      const appIcon = approachSection.querySelector('.play-icon-svg');
      const videoCard = approachSection.querySelector('.video-preview-wrapper');

      // ── STAGE 1: Eyebrow & Main Headline appear FIRST with letter wave blur ──
      if (appBar) {
        gsap.fromTo(
          appBar,
          { opacity: 0, scaleX: 0 },
          {
            scrollTrigger: { trigger: approachSection, start: 'top 85%', once: true },
            opacity: 1,
            scaleX: 1,
            duration: 0.45,
            ease: 'power2.out'
          }
        );
      }

      if (appEyebrow) {
        animateCharCluster(splitElementIntoChars(appEyebrow), {
          trigger: approachSection,
          delay: 0.0,
          stagger: 0.011,
          duration: 0.45,
          blur: '6px'
        });
      }

      if (appHeadline) {
        animateCharCluster(splitElementIntoChars(appHeadline), {
          trigger: approachSection,
          delay: 0.08,
          stagger: 0.012,
          duration: 0.5,
          blur: '8px'
        });
      }

      // ── STAGE 2: Subline text appears SECOND after headline ──
      if (appSubline) {
        animateCharCluster(splitElementIntoChars(appSubline), {
          trigger: approachSection,
          delay: 0.55,
          stagger: 0.007,
          duration: 0.45,
          blur: '6px'
        });
      }

      // ── STAGE 3: Watch Video button (icon + text) appears THIRD after subline ──
      if (appCta) {
        animateCharCluster(splitElementIntoChars(appCta), {
          trigger: approachSection,
          delay: 0.88,
          stagger: 0.012,
          duration: 0.45,
          blur: '6px'
        });
      }

      if (appIcon) {
        gsap.fromTo(
          appIcon,
          { opacity: 0 },
          {
            scrollTrigger: { trigger: approachSection, start: 'top 85%', once: true },
            opacity: 1,
            duration: 0.35,
            delay: 0.88,
            ease: 'power2.out'
          }
        );
      }

      if (videoCard) {
        gsap.fromTo(
          videoCard,
          { y: 40, opacity: 0, scale: 0.97 },
          {
            scrollTrigger: { trigger: videoCard, start: 'top 85%', once: true },
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.95,
            ease: 'power3.out',
            clearProps: 'transform'
          }
        );
      }
    }

    // ── SECTION: OUR SERVICES (ALL 3 SERVICES CONTENT CLUSTERS) ──
    const servicesSection = document.getElementById('services');
    if (servicesSection) {
      const eyebrowText = servicesSection.querySelector('.services-header-group .eyebrow-text');
      const eyebrowBar = servicesSection.querySelector('.services-header-group .eyebrow-bar');

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

      // Pre-split all 3 services' texts so expanded & collapsed states are always ready
      for (let s = 1; s <= 3; s++) {
        const item = document.getElementById(`service-item-${s}`);
        if (!item) continue;

        // Expanded content targets
        const expContent = item.querySelector('.service-model-content');
        if (expContent) {
          splitElementIntoChars(expContent.querySelector('.service-number'));
          splitElementIntoChars(expContent.querySelector('.service-title'));
          splitElementIntoChars(expContent.querySelector('.service-description'));
          splitElementIntoChars(expContent.querySelector('.zoom-tag-text'));
          splitElementIntoChars(expContent.querySelector('.btn-trial-main span'));
          splitElementIntoChars(expContent.querySelector('.btn-explore span'));
        }

        // Collapsed row targets
        const collRow = item.querySelector('.service-collapsed-row');
        if (collRow) {
          splitElementIntoChars(collRow.querySelector('.service-number'));
          splitElementIntoChars(collRow.querySelector('.service-simple-title'));
        }
      }

      // ── Service 01 (Initially Expanded on scroll) ──
      const service1Visual = servicesSection.querySelector('#service-slider-1');
      if (service1Visual) {
        gsap.fromTo(
          service1Visual,
          { y: 35, opacity: 0, scale: 0.98 },
          {
            scrollTrigger: { trigger: '#service-item-1', start: 'top 80%', once: true },
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.9,
            ease: 'power3.out',
            clearProps: 'transform'
          }
        );
      }

      const s1Num = servicesSection.querySelector('#service-item-1 .service-model-content .service-number .cosmos-char');
      const s1Title = servicesSection.querySelectorAll('#service-item-1 .service-model-content .service-title .cosmos-char');
      const s1Desc = servicesSection.querySelectorAll('#service-item-1 .service-model-content .service-description .cosmos-char');
      const s1ZoomTag = servicesSection.querySelectorAll('#service-item-1 .service-model-content .zoom-tag-text .cosmos-char');
      const s1ZoomThumb = servicesSection.querySelector('#service-item-1 .service-model-content .zoom-preview-thumb');
      const s1BtnTrial = servicesSection.querySelectorAll('#service-item-1 .service-model-content .btn-trial-main .cosmos-char');
      const s1BtnExp = servicesSection.querySelectorAll('#service-item-1 .service-model-content .btn-explore .cosmos-char');

      if (s1ZoomThumb) {
        gsap.fromTo(
          s1ZoomThumb,
          { opacity: 0 },
          {
            scrollTrigger: { trigger: '#service-item-1', start: 'top 80%', once: true },
            opacity: 1,
            duration: 0.5,
            delay: 0.35,
            ease: 'power2.out'
          }
        );
      }

      animateCharCluster(s1Num, { trigger: '#service-item-1', start: 'top 80%', delay: 0.0, stagger: 0.011, duration: 0.45 });
      animateCharCluster(s1Title, { trigger: '#service-item-1', start: 'top 80%', delay: 0.08, stagger: 0.012, duration: 0.5, blur: '8px' });
      animateCharCluster(s1Desc, { trigger: '#service-item-1', start: 'top 80%', delay: 0.22, stagger: 0.007, duration: 0.45 });
      animateCharCluster(s1ZoomTag, { trigger: '#service-item-1', start: 'top 80%', delay: 0.35, stagger: 0.011, duration: 0.45 });
      animateCharCluster(s1BtnTrial, { trigger: '#service-item-1', start: 'top 80%', delay: 0.45, stagger: 0.011, duration: 0.45 });
      animateCharCluster(s1BtnExp, { trigger: '#service-item-1', start: 'top 80%', delay: 0.48, stagger: 0.011, duration: 0.45 });

      // ── Service 02 (Collapsed Row on scroll) ──
      const s2Row = servicesSection.querySelector('#service-item-2 .service-collapsed-row');
      if (s2Row) {
        const s2Thumb = s2Row.querySelector('.simple-thumb-card');
        const s2Chars = s2Row.querySelectorAll('.cosmos-char');
        if (s2Thumb) {
          gsap.fromTo(
            s2Thumb,
            { opacity: 0 },
            {
              scrollTrigger: { trigger: '#service-item-2', start: 'top 85%', once: true },
              opacity: 1,
              duration: 0.55,
              ease: 'power2.out'
            }
          );
        }
        animateCharCluster(s2Chars, {
          trigger: '#service-item-2',
          start: 'top 85%',
          delay: 0.05,
          stagger: 0.011,
          duration: 0.48
        });
      }

      // ── Service 03 (Collapsed Row on scroll) ──
      const s3Row = servicesSection.querySelector('#service-item-3 .service-collapsed-row');
      if (s3Row) {
        const s3Thumb = s3Row.querySelector('.simple-thumb-card');
        const s3Chars = s3Row.querySelectorAll('.cosmos-char');
        if (s3Thumb) {
          gsap.fromTo(
            s3Thumb,
            { opacity: 0 },
            {
              scrollTrigger: { trigger: '#service-item-3', start: 'top 85%', once: true },
              opacity: 1,
              duration: 0.55,
              ease: 'power2.out'
            }
          );
        }
        animateCharCluster(s3Chars, {
          trigger: '#service-item-3',
          start: 'top 85%',
          delay: 0.05,
          stagger: 0.011,
          duration: 0.48
        });
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
          { y: 40, opacity: 0, scale: 0.98 },
          {
            scrollTrigger: {
              trigger: '.pricing-view-elevated',
              start: 'top 80%',
              once: true
            },
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1.0,
            stagger: 0.12,
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
  }

  // Refresh ScrollTrigger when window resizes
  window.addEventListener('resize', () => {
    ScrollTrigger.refresh();
  }, { passive: true });

})();
