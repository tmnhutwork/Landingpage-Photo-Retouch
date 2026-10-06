/**
 * NESSO — Free Trial Test Modal (Wispr Flow 2-Column Style)
 * Permanent Studio Warm Gray Theme, Dual-Mode Upload (Direct 3-Image or Cloud Link),
 * 100% Dead-Centered, Responsive.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initTrialModal();
  });

  function initTrialModal() {
    const overlay = document.getElementById('trialModalOverlay');
    const dialog = document.getElementById('trialModalDialog');
    const closeBtn = document.getElementById('trialModalClose');
    
    // Form elements
    const trialForm = document.getElementById('trialTestForm');
    const formStage = document.getElementById('trialFormStage');
    const successStage = document.getElementById('trialSuccessStage');
    const resetSuccessBtn = document.getElementById('trialResetBtn');
    const submitBtn = document.getElementById('trialSubmitBtn');
    const submitText = document.getElementById('trialSubmitText');
    const successHeadline = document.getElementById('successHeadline');
    const successDesc = document.getElementById('successDesc');
    
    // Dual-Mode Upload / Cloud Link Tabs
    const tabUploadFiles = document.getElementById('tabUploadFiles');
    const tabShareLink = document.getElementById('tabShareLink');
    const panelUploadFiles = document.getElementById('panelUploadFiles');
    const panelShareLink = document.getElementById('panelShareLink');
    const submissionModeInput = document.getElementById('submissionModeInput');
    const cloudLinkInput = document.getElementById('trialCloudLink');
    
    // File upload elements
    const fileInput = document.getElementById('trialFileInput');
    const dropzone = document.getElementById('trialDropzone');
    const dropzoneEmptyState = document.getElementById('dropzoneEmptyState');
    const dropzoneSelectedState = document.getElementById('dropzoneSelectedState');
    const selectedCountBadge = document.getElementById('selectedCountBadge');
    const dropzoneFilesChips = document.getElementById('dropzoneFilesChips');

    // Tier buttons
    const tierBtns = document.querySelectorAll('.tier-btn');
    const hiddenTierInput = document.getElementById('selectedTierInput');

    if (!overlay || !dialog) return;

    let uploadedFiles = []; // stores up to 3 File objects
    let currentMode = 'files'; // 'files' or 'link'

    // ── Open Modal Hook: Connect all Trial Buttons across the page ──
    const triggerSelectors = [
      'a[href="#trial"]',
      '.btn-trial-header',
      '.btn-trial-main',
      '.price-card-cta',
      '.runway-card-btn'
    ];

    document.querySelectorAll(triggerSelectors.join(', ')).forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Detect which plan card was clicked, if any
        const parentCard = btn.closest('.price-card');
        if (parentCard) {
          const banner = parentCard.querySelector('.banner-title');
          const bannerText = banner ? banner.textContent.trim().toUpperCase() : '';
          if (bannerText.includes('MEDIUM')) {
            selectTier('Medium');
          } else if (bannerText.includes('PREMIUM')) {
            selectTier('Premium');
          } else {
            selectTier('Simple');
          }
        }

        openModal();
      });
    });

    function openModal() {
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      // Trap focus or focus first input
      setTimeout(() => {
        const firstInput = trialForm ? trialForm.querySelector('input:not([type="hidden"])') : null;
        if (firstInput) firstInput.focus();
      }, 150);
    }

    function closeModal() {
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
    }

    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Close on backdrop click (outside dialog)
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) {
        closeModal();
      }
    });

    // ── Tier Selection ──
    function selectTier(tierName) {
      tierBtns.forEach((btn) => {
        const matches = btn.getAttribute('data-tier').toLowerCase() === tierName.toLowerCase();
        btn.classList.toggle('is-active', matches);
      });
      if (hiddenTierInput) hiddenTierInput.value = tierName;
    }

    tierBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        const tier = btn.getAttribute('data-tier');
        selectTier(tier);
      });
    });

    // ── Dual-Mode Upload / Link Tab Switching ──
    function setSubmissionMode(mode) {
      currentMode = mode;
      if (submissionModeInput) submissionModeInput.value = mode;

      if (mode === 'files') {
        if (tabUploadFiles) {
          tabUploadFiles.classList.add('is-active');
          tabUploadFiles.setAttribute('aria-selected', 'true');
        }
        if (tabShareLink) {
          tabShareLink.classList.remove('is-active');
          tabShareLink.setAttribute('aria-selected', 'false');
        }
        if (panelUploadFiles) {
          panelUploadFiles.style.display = 'block';
          panelUploadFiles.classList.add('is-active');
        }
        if (panelShareLink) {
          panelShareLink.style.display = 'none';
          panelShareLink.classList.remove('is-active');
        }
        if (submitText) {
          submitText.textContent = uploadedFiles.length > 0 
            ? `Submit ${uploadedFiles.length} Free Trial Images \u2192` 
            : 'Submit 3 Free Trial Images \u2192';
        }
      } else {
        if (tabShareLink) {
          tabShareLink.classList.add('is-active');
          tabShareLink.setAttribute('aria-selected', 'true');
        }
        if (tabUploadFiles) {
          tabUploadFiles.classList.remove('is-active');
          tabUploadFiles.setAttribute('aria-selected', 'false');
        }
        if (panelShareLink) {
          panelShareLink.style.display = 'block';
          panelShareLink.classList.add('is-active');
        }
        if (panelUploadFiles) {
          panelUploadFiles.style.display = 'none';
          panelUploadFiles.classList.remove('is-active');
        }
        if (submitText) {
          submitText.textContent = 'Submit Free Trial Link \u2192';
        }
        if (cloudLinkInput) {
          setTimeout(() => cloudLinkInput.focus(), 100);
        }
      }
    }

    if (tabUploadFiles) {
      tabUploadFiles.addEventListener('click', () => setSubmissionMode('files'));
    }
    if (tabShareLink) {
      tabShareLink.addEventListener('click', () => setSubmissionMode('link'));
    }

    // ── 3-Image Drag & Drop Upload Management ──
    if (dropzone && fileInput) {
      dropzone.addEventListener('click', (e) => {
        // Don't trigger if remove button was clicked
        if (e.target.closest('.file-chip-remove')) return;
        fileInput.click();
      });

      ['dragenter', 'dragover'].forEach((eventName) => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.add('dragover');
        });
      });

      ['dragleave', 'drop'].forEach((eventName) => {
        dropzone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
          dropzone.classList.remove('dragover');
        });
      });

      dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
      });

      fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
        fileInput.value = ''; // reset so same file can be selected again
      });
    }

    function handleFiles(files) {
      const incoming = Array.from(files);
      incoming.forEach((file) => {
        if (uploadedFiles.length < 3) {
          uploadedFiles.push(file);
        }
      });
      renderFiles();
      if (currentMode === 'files' && submitText) {
        submitText.textContent = `Submit ${uploadedFiles.length} Free Trial Images \u2192`;
      }
    }

    function removeFile(index) {
      uploadedFiles.splice(index, 1);
      renderFiles();
      if (currentMode === 'files' && submitText) {
        submitText.textContent = uploadedFiles.length > 0
          ? `Submit ${uploadedFiles.length} Free Trial Images \u2192`
          : 'Submit 3 Free Trial Images \u2192';
      }
    }

    function renderFiles() {
      if (!dropzoneEmptyState || !dropzoneSelectedState) return;

      if (uploadedFiles.length === 0) {
        dropzoneEmptyState.style.display = 'flex';
        dropzoneSelectedState.style.display = 'none';
      } else {
        dropzoneEmptyState.style.display = 'none';
        dropzoneSelectedState.style.display = 'flex';

        if (selectedCountBadge) {
          selectedCountBadge.textContent = `${uploadedFiles.length} of 3 Photos Selected`;
        }

        if (dropzoneFilesChips) {
          dropzoneFilesChips.innerHTML = '';
          uploadedFiles.forEach((file, index) => {
            const chip = document.createElement('div');
            chip.className = 'file-chip';
            chip.innerHTML = `
              <span title="${file.name}">${file.name.length > 20 ? file.name.slice(0, 18) + '...' : file.name}</span>
            `;

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'file-chip-remove';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Remove file';
            removeBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              removeFile(index);
            });

            chip.appendChild(removeBtn);
            dropzoneFilesChips.appendChild(chip);
          });
        }
      }
    }

    // Initialize initial empty dropzone state
    renderFiles();

    // ── Form Submission Simulation ──
    if (trialForm) {
      trialForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (submitBtn) {
          submitBtn.disabled = true;
          if (submitText) {
            submitText.textContent = 'Submitting & Calibrating...';
          }
        }

        // Simulate 700ms server response
        setTimeout(() => {
          if (formStage && successStage) {
            formStage.style.display = 'none';
            successStage.classList.add('is-visible');

            // Customize confirmation message based on submission mode
            if (currentMode === 'link') {
              if (successHeadline) successHeadline.textContent = 'Cloud Link Received';
              if (successDesc) {
                const linkVal = cloudLinkInput ? cloudLinkInput.value.trim() : '';
                successDesc.textContent = linkVal 
                  ? `Thank you! We received your cloud transfer link. Our lead retouchers are downloading your files and will return your 3 calibration proofs within 24 hours.`
                  : `Thank you! Our lead retoucher team is reviewing your trial request and will deliver high-res proofs directly to your email within 24 hours.`;
              }
            } else {
              if (successHeadline) successHeadline.textContent = '3 Calibration Images Received';
              if (successDesc) {
                successDesc.textContent = `Thank you! Our lead retoucher is already preparing your studio calibration batch. We will deliver high-res proof files directly to your email within 24 hours.`;
              }
            }
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            if (submitText) {
              submitText.textContent = currentMode === 'link' 
                ? 'Submit Free Trial Link \u2192' 
                : 'Submit 3 Free Trial Images \u2192';
            }
          }
        }, 700);
      });
    }

    if (resetSuccessBtn) {
      resetSuccessBtn.addEventListener('click', () => {
        if (formStage && successStage) {
          successStage.classList.remove('is-visible');
          formStage.style.display = 'block';
          trialForm.reset();
          uploadedFiles = [];
          renderFiles();
          setSubmissionMode('files');
        }
      });
    }
  }
})();
