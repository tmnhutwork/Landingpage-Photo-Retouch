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
    const formMessage = document.getElementById('trialFormMessage');
    
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
    const maxFiles = 3;
    const allowedFileExtensions = new Set(['jpg', 'jpeg', 'tif', 'tiff', 'cr3', 'cr2', 'crw', 'nef', 'arw', 'raf', 'rw2', 'orf', 'dng']);
    const trialEndpoint = `${window.location.origin}/wp-json/nesso-lms/v1/photo-retouch-trial`;

    function setFormMessage(message = '', type = '') {
      if (!formMessage) return;

      formMessage.textContent = message;
      formMessage.classList.toggle('is-error', type === 'error');
      formMessage.classList.toggle('is-success', type === 'success');
    }

    function getFileExtension(file) {
      const parts = file.name.toLowerCase().split('.');
      return parts.length > 1 ? parts.pop() : '';
    }

    function isAllowedFile(file) {
      return allowedFileExtensions.has(getFileExtension(file));
    }

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

      if (dialog.classList.contains('is-success')) {
        resetSuccessState();
      }
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
      const invalidFiles = incoming.filter((file) => !isAllowedFile(file));
      const validFiles = incoming.filter(isAllowedFile);
      const availableSlots = maxFiles - uploadedFiles.length;
      const acceptedFiles = validFiles.slice(0, availableSlots);

      uploadedFiles.push(...acceptedFiles);
      renderFiles();

      const notices = [];
      if (invalidFiles.length > 0) {
        notices.push('Only RAW, TIFF, or JPG images can be uploaded.');
      }
      if (validFiles.length > availableSlots) {
        notices.push(`Only ${maxFiles} images can be attached to one request.`);
      }
      setFormMessage(notices.join(' '), notices.length > 0 ? 'error' : '');

      if (currentMode === 'files' && submitText) {
        submitText.textContent = uploadedFiles.length > 0
          ? `Submit ${uploadedFiles.length} Free Trial Images \u2192`
          : 'Submit 3 Free Trial Images \u2192';
      }
    }

    function removeFile(index) {
      uploadedFiles.splice(index, 1);
      renderFiles();
      setFormMessage('');
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
          selectedCountBadge.textContent = `${uploadedFiles.length} of ${maxFiles} Photos Selected`;
        }

        if (dropzoneFilesChips) {
          dropzoneFilesChips.innerHTML = '';
          uploadedFiles.forEach((file, index) => {
            const chip = document.createElement('div');
            chip.className = 'file-chip';
            const fileName = document.createElement('span');
            fileName.title = file.name;
            fileName.textContent = file.name.length > 20 ? `${file.name.slice(0, 18)}...` : file.name;

            const removeBtn = document.createElement('button');
            removeBtn.type = 'button';
            removeBtn.className = 'file-chip-remove';
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Remove file';
            removeBtn.addEventListener('click', (e) => {
              e.stopPropagation();
              removeFile(index);
            });

            chip.appendChild(fileName);
            chip.appendChild(removeBtn);
            dropzoneFilesChips.appendChild(chip);
          });
        }
      }
    }

    // Initialize initial empty dropzone state
    renderFiles();

    function buildTrialFormData() {
      const formData = new FormData(trialForm);
      formData.delete('files[]');
      formData.append('page_url', document.referrer || window.location.href);

      uploadedFiles.forEach((file) => {
        formData.append('files[]', file, file.name);
      });

      return formData;
    }

    function submitTrialFormData(formData, onUploadProgress) {
      return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('POST', trialEndpoint, true);
        request.withCredentials = true;

        request.upload.addEventListener('progress', (event) => {
          if (!event.lengthComputable || typeof onUploadProgress !== 'function') return;
          onUploadProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)));
        });

        request.addEventListener('load', () => {
          let payload = {};
          try {
            payload = JSON.parse(request.responseText || '{}');
          } catch (error) {}

          resolve({ ok: request.status >= 200 && request.status < 300, payload });
        });
        request.addEventListener('error', () => reject(new Error('Network error. Please try again.')));
        request.addEventListener('abort', () => reject(new Error('Upload was cancelled. Please try again.')));
        request.send(formData);
      });
    }

    function showSubmissionSuccess() {
      if (!formStage || !successStage) return;

      formStage.style.display = 'none';
      dialog.classList.add('is-success');
      successStage.classList.add('is-visible');
    }

    function resetSuccessState() {
      if (!formStage || !successStage) return;

      successStage.classList.remove('is-visible');
      dialog.classList.remove('is-success');
      formStage.style.display = 'block';
      if (trialForm) trialForm.reset();
      uploadedFiles = [];
      setFormMessage('');
      renderFiles();
      selectTier('Simple');
      setSubmissionMode('files');
    }

    // ── Form Submission ──
    if (trialForm) {
      trialForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        setFormMessage('');

        if (!trialForm.checkValidity()) {
          trialForm.reportValidity();
          setFormMessage('Please enter your name and a valid work email.', 'error');
          return;
        }

        if (uploadedFiles.some((file) => !isAllowedFile(file))) {
          setFormMessage('Only RAW, TIFF, or JPG images can be uploaded.', 'error');
          return;
        }

        if (submitBtn) submitBtn.disabled = true;
        if (submitText) {
          submitText.textContent = uploadedFiles.length > 0
            ? 'Uploading 0%...'
            : 'Submitting & Calibrating...';
        }

        try {
          const response = await submitTrialFormData(buildTrialFormData(), (progress) => {
            if (!submitText) return;
            submitText.textContent = progress >= 100
              ? 'Saving your files...'
              : `Uploading ${progress}%...`;
          });
          const payload = response.payload;

          if (!response.ok || !payload.ok) {
            throw new Error(payload.message || 'We could not send your request. Please try again.');
          }

          setFormMessage(payload.message || 'Your request was sent.', 'success');
          showSubmissionSuccess();
        } catch (error) {
          setFormMessage(error.message || 'We could not send your request. Please try again.', 'error');
        } finally {
          if (submitBtn) submitBtn.disabled = false;
          if (submitText) {
            submitText.textContent = currentMode === 'link'
              ? 'Submit Free Trial Link \u2192'
              : uploadedFiles.length > 0
                ? `Submit ${uploadedFiles.length} Free Trial Images \u2192`
                : 'Submit 3 Free Trial Images \u2192';
          }
        }
      });
    }

    if (resetSuccessBtn) {
      resetSuccessBtn.addEventListener('click', () => {
        closeModal();
      });
    }
  }
})();
