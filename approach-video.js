/**
 * NESSO — THE APPROACH VIDEO SECTION (CENTRIC THEATER CONTROLLER)
 * Controls:
 * - Interactive modal lightbox player with play/pause simulation
 * - Smooth GSAP ScrollTrigger subtle expansion on cinema screen
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initVideoModalLightbox();
    initTheaterScrollEffect();
  });

  // ── GSAP ScrollTrigger for Centric Theater Stage ─────────────────────
  function initTheaterScrollEffect() {
    if (!window.gsap || !window.ScrollTrigger) return;

    const screen = document.querySelector('.theater-cinema-screen');
    const section = document.getElementById('approach');
    if (!screen || !section) return;

    window.gsap.fromTo(
      screen,
      { scale: 0.96, opacity: 0.9 },
      {
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'center center',
          scrub: 1.2
        },
        scale: 1,
        opacity: 1,
        ease: 'power2.out'
      }
    );
  }

  // ── Video Modal Lightbox Player ──────────────────────────────────────
  function initVideoModalLightbox() {
    const modal = document.getElementById('approach-video-modal');
    const btnClose = document.getElementById('btn-close-video-modal');
    const triggers = [
      document.getElementById('video-preview-card-opt2'),
      document.querySelector('.theater-play-hub'),
      document.querySelector('.theater-play-btn-circle')
    ].filter(Boolean);

    if (!modal) return;

    function openModal() {
      modal.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    }

    function closeModal() {
      modal.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    triggers.forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        openModal();
      });
    });

    if (btnClose) {
      btnClose.addEventListener('click', closeModal);
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.classList.contains('is-open')) {
        closeModal();
      }
    });

    // Simulated play/pause button in modal
    const playBtn = modal.querySelector('.btn-player-play');
    if (playBtn) {
      let isPlaying = true;
      playBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        playBtn.innerHTML = isPlaying
          ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>'
          : '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>';
      });
    }
  }
})();
