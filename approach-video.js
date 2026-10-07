/**
 * NESSO — THE APPROACH VIDEO SECTION (INLINE CINEMA PLAYER)
 * Features:
 * - Direct in-place video playback (no popup lightbox modal, no auto-zoom)
 * - Clean initial state: center play button only, zero overlay labels/texts
 * - Custom luxury hover controls: play/pause, scrubber timeline with tooltip,
 *   time display, volume slider & mute toggle, playback speed & quality menu,
 *   Picture-in-Picture, and Fullscreen toggle.
 * - Auto-hiding controls on mouse idle during playback
 * - Smooth GSAP ScrollTrigger scale entrance for cinema screen
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initInlineCinemaPlayer();
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
      { scale: 0.97, opacity: 0.92 },
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

  // ── Inline Cinema Player Controller ──────────────────────────────────
  function initInlineCinemaPlayer() {
    const video = document.getElementById('approach-video-player');
    const screen = document.getElementById('video-preview-card-opt2') || document.querySelector('.theater-cinema-screen');
    const bigPlayBtn = document.getElementById('theater-play-btn');
    const controls = document.getElementById('theater-controls');

    if (!video || !screen) return;

    // Controls elements
    const playPauseBtn = document.getElementById('ctrl-play-pause');
    const currentTimeEl = document.getElementById('ctrl-current-time');
    const durationEl = document.getElementById('ctrl-duration');
    const scrubberWrap = document.getElementById('theater-scrubber');
    const scrubberProgress = document.getElementById('scrubber-progress');
    const scrubberBuffer = document.getElementById('scrubber-buffer');
    const scrubberThumb = document.getElementById('scrubber-thumb');
    const scrubberTooltip = document.getElementById('scrubber-tooltip');
    const muteBtn = document.getElementById('ctrl-mute-btn');
    const volumeSlider = document.getElementById('ctrl-volume-slider');
    const settingsBtn = document.getElementById('ctrl-settings-btn');
    const settingsDropdown = document.getElementById('settings-dropdown');
    const speedOpts = document.querySelectorAll('.speed-opt');
    const pipBtn = document.getElementById('ctrl-pip-btn');
    const fullscreenBtn = document.getElementById('ctrl-fullscreen-btn');

    let isSeeking = false;
    let controlsTimer = null;
    let lastVolume = 1;

    // ── Time Formatting Helper (MM:SS) ──
    function formatTime(seconds) {
      if (isNaN(seconds) || seconds < 0) return '00:00';
      const mins = Math.floor(seconds / 60);
      const secs = Math.floor(seconds % 60);
      return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }

    // ── Play / Pause Toggle ──
    function togglePlay() {
      if (video.paused || video.ended) {
        video.play().catch(err => {
          console.warn('[Video Player] Play interrupted or blocked:', err);
        });
      } else {
        video.pause();
      }
    }

    if (bigPlayBtn) {
      bigPlayBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlay();
      });
    }

    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        togglePlay();
      });
    }

    // Clicking anywhere on the video area (outside control bar) toggles play/pause
    screen.addEventListener('click', (e) => {
      // Don't toggle if clicking on interactive controls
      if (controls && (controls.contains(e.target) || e.target === controls)) return;
      if (settingsDropdown && settingsDropdown.contains(e.target)) return;
      togglePlay();
    });

    // ── Video Events: Sync Classes and Controls ──
    video.addEventListener('play', () => {
      screen.classList.add('has-played');
      screen.classList.add('is-playing');
      screen.classList.remove('is-paused');
      scheduleControlsHide();
    });

    video.addEventListener('pause', () => {
      screen.classList.remove('is-playing');
      screen.classList.add('is-paused');
      showControls();
    });

    video.addEventListener('ended', () => {
      screen.classList.remove('is-playing');
      screen.classList.add('is-paused');
      showControls();
    });

    // ── Time & Progress Updates ──
    function updateDuration() {
      if (durationEl && !isNaN(video.duration)) {
        durationEl.textContent = formatTime(video.duration);
      }
    }

    video.addEventListener('loadedmetadata', updateDuration);
    video.addEventListener('durationchange', updateDuration);
    if (!isNaN(video.duration) && video.duration > 0) {
      updateDuration();
    }

    video.addEventListener('timeupdate', () => {
      if (isSeeking) return;
      if (currentTimeEl) {
        currentTimeEl.textContent = formatTime(video.currentTime);
      }
      if (video.duration) {
        const percent = (video.currentTime / video.duration) * 100;
        if (scrubberProgress) scrubberProgress.style.width = `${percent}%`;
        if (scrubberThumb) scrubberThumb.style.left = `${percent}%`;
      }
    });

    // Buffer progress
    video.addEventListener('progress', () => {
      if (video.duration && video.buffered.length > 0) {
        const bufferedEnd = video.buffered.end(video.buffered.length - 1);
        const percent = (bufferedEnd / video.duration) * 100;
        if (scrubberBuffer) scrubberBuffer.style.width = `${percent}%`;
      }
    });

    // ── Scrubber Seeking ──
    function getScrubberPercent(e) {
      if (!scrubberWrap) return 0;
      const rect = scrubberWrap.getBoundingClientRect();
      const clientX = e.clientX ?? (e.touches && e.touches[0] ? e.touches[0].clientX : 0);
      const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      return pos;
    }

    function updateScrubberVisual(pos) {
      const percent = pos * 100;
      if (scrubberProgress) scrubberProgress.style.width = `${percent}%`;
      if (scrubberThumb) scrubberThumb.style.left = `${percent}%`;
      if (currentTimeEl && video.duration) {
        currentTimeEl.textContent = formatTime(pos * video.duration);
      }
    }

    if (scrubberWrap) {
      scrubberWrap.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        isSeeking = true;
        scrubberWrap.classList.add('is-seeking');
        const pos = getScrubberPercent(e);
        updateScrubberVisual(pos);

        const onMouseMove = (moveEvent) => {
          const movePos = getScrubberPercent(moveEvent);
          updateScrubberVisual(movePos);
        };

        const onMouseUp = (upEvent) => {
          isSeeking = false;
          scrubberWrap.classList.remove('is-seeking');
          const finalPos = getScrubberPercent(upEvent);
          if (video.duration) {
            video.currentTime = finalPos * video.duration;
          }
          window.removeEventListener('mousemove', onMouseMove);
          window.removeEventListener('mouseup', onMouseUp);
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
      });

      // Scrubber Hover Tooltip
      scrubberWrap.addEventListener('mousemove', (e) => {
        if (!scrubberTooltip || !video.duration) return;
        const rect = scrubberWrap.getBoundingClientRect();
        const offsetX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
        const hoverPos = offsetX / rect.width;
        scrubberTooltip.style.left = `${offsetX}px`;
        scrubberTooltip.textContent = formatTime(hoverPos * video.duration);
      });
    }

    // ── Volume & Mute Controls ──
    function setVolume(val) {
      val = Math.max(0, Math.min(1, val));
      video.volume = val;
      if (volumeSlider) volumeSlider.value = val;

      if (val === 0) {
        video.muted = true;
        screen.classList.add('is-muted');
      } else {
        video.muted = false;
        screen.classList.remove('is-muted');
        lastVolume = val;
      }
    }

    if (volumeSlider) {
      volumeSlider.addEventListener('input', (e) => {
        e.stopPropagation();
        setVolume(parseFloat(e.target.value));
      });
      volumeSlider.addEventListener('click', (e) => e.stopPropagation());
    }

    if (muteBtn) {
      muteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (video.muted || video.volume === 0) {
          video.muted = false;
          setVolume(lastVolume > 0.05 ? lastVolume : 0.8);
        } else {
          lastVolume = video.volume;
          setVolume(0);
        }
      });
    }

    // ── Playback Speed & Quality Dropdown ──
    if (settingsBtn && settingsDropdown) {
      settingsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        settingsDropdown.classList.toggle('is-active');
      });

      speedOpts.forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const speed = parseFloat(btn.dataset.speed) || 1;
          video.playbackRate = speed;
          speedOpts.forEach(opt => opt.classList.remove('is-active'));
          btn.classList.add('is-active');
          settingsDropdown.classList.remove('is-active');
        });
      });

      document.addEventListener('click', (e) => {
        if (!settingsBtn.contains(e.target) && !settingsDropdown.contains(e.target)) {
          settingsDropdown.classList.remove('is-active');
        }
      });
    }

    // ── Picture in Picture ──
    if (pipBtn) {
      if ('pictureInPictureEnabled' in document) {
        pipBtn.addEventListener('click', async (e) => {
          e.stopPropagation();
          try {
            if (document.pictureInPictureElement) {
              await document.exitPictureInPicture();
            } else {
              await video.requestPictureInPicture();
            }
          } catch (err) {
            console.warn('[Video Player] PiP failed:', err);
          }
        });
      } else {
        pipBtn.style.display = 'none';
      }
    }

    // ── Fullscreen Toggle (Expands the cinema stage element) ──
    function isFullscreen() {
      return Boolean(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
    }

    function toggleFullscreen() {
      if (!isFullscreen()) {
        if (screen.requestFullscreen) {
          screen.requestFullscreen();
        } else if (screen.webkitRequestFullscreen) {
          screen.webkitRequestFullscreen();
        } else if (video.webkitEnterFullscreen) {
          // Fallback for iOS Safari
          video.webkitEnterFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    }

    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleFullscreen();
      });
    }

    // Keyboard Shortcuts (Space to play/pause, F for fullscreen, M for mute)
    screen.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === ' ' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'f') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm') {
        e.preventDefault();
        if (muteBtn) muteBtn.click();
      }
    });

    // ── Controls Hover & Auto-Hide Behavior ──
    function showControls() {
      screen.classList.remove('hide-controls');
      clearTimeout(controlsTimer);
    }

    function scheduleControlsHide() {
      clearTimeout(controlsTimer);
      if (video.paused || isSeeking) return;

      controlsTimer = setTimeout(() => {
        // Do not hide if settings dropdown is open
        if (settingsDropdown && settingsDropdown.classList.contains('is-active')) return;
        if (!video.paused && !isSeeking) {
          screen.classList.add('hide-controls');
        }
      }, 2400);
    }

    screen.addEventListener('mouseenter', () => {
      showControls();
      if (!video.paused) scheduleControlsHide();
    });

    screen.addEventListener('mousemove', () => {
      showControls();
      if (!video.paused) scheduleControlsHide();
    });

    screen.addEventListener('mouseleave', () => {
      if (!video.paused && !isSeeking) {
        if (settingsDropdown && settingsDropdown.classList.contains('is-active')) return;
        clearTimeout(controlsTimer);
        screen.classList.add('hide-controls');
      }
    });

    // Initial state: paused, controls hidden until hover
    screen.classList.add('is-paused');
  }
})();
