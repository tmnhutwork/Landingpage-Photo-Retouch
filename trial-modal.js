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
    const emailInput = document.getElementById('trialEmail');
    const companyInput = document.getElementById('trialCompany');
    
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
    let isSubmitting = false;
    let submissionComplete = false;
    const maxFiles = 3;
    const allowedFileExtensions = new Set(['jpg', 'jpeg', 'tif', 'tiff', 'cr3', 'cr2', 'crw', 'nef', 'arw', 'raf', 'rw2', 'orf', 'dng']);
    const trialEndpoint = `${window.location.origin}/wp-json/nesso-lms/v1/photo-retouch-trial`;

    function trackRetouchEvent(eventName, parameters = {}) {
      const payload = {
        type: 'nesso-photo-retouch-analytics',
        event: eventName,
        parameters
      };

      if (window.parent !== window) {
        window.parent.postMessage(payload, window.location.origin);
        return;
      }

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: eventName, ...parameters });
    }

    function getCtaLocation(element) {
      const section = element.closest('header, section, footer, [id]');
      if (!section) return 'standalone';
      return section.id || section.className || section.tagName.toLowerCase();
    }

    function getFileSizeBucket(files) {
      const totalBytes = Array.from(files).reduce((total, file) => total + file.size, 0);
      const megabytes = totalBytes / (1024 * 1024);
      if (megabytes <= 5) return '0-5mb';
      if (megabytes <= 25) return '5-25mb';
      if (megabytes <= 100) return '25-100mb';
      return '100mb-plus';
    }

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

    // Work emails only. The WordPress endpoint enforces the same list.
    const personalEmailDomains = ['gmail.com', 'googlemail.com'];
    const personalEmailMessage = 'Please use your work email. Personal Gmail addresses are not accepted.';
    const companyMessage = 'Please enter your company or studio name.';

    function isPersonalEmail(value) {
      const domain = String(value).trim().toLowerCase().split('@').pop();
      return personalEmailDomains.includes(domain);
    }

    // Custom rules join the browser's required/type checks, so checkValidity() covers them.
    function applyCustomValidity() {
      if (emailInput) {
        emailInput.setCustomValidity(isPersonalEmail(emailInput.value) ? personalEmailMessage : '');
      }
      if (companyInput) {
        companyInput.setCustomValidity(companyInput.value.trim() ? '' : companyMessage);
      }
    }

    [emailInput, companyInput].forEach((input) => {
      if (input) input.addEventListener('input', () => input.setCustomValidity(''));
    });

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

        const ctaLabel = (btn.getAttribute('aria-label') || btn.textContent || '').replace(/\s+/g, ' ').trim();
        trackRetouchEvent('nesso_retouch_cta_click', {
          cta_label: ctaLabel.slice(0, 100),
          cta_location: String(getCtaLocation(btn)).slice(0, 100)
        });
        
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

        openModal('cta');
      });
    });

    document.querySelectorAll('a[href^="mailto:"], a[href^="tel:"]').forEach((link) => {
      link.addEventListener('click', () => {
        trackRetouchEvent('nesso_retouch_contact_click', {
          contact_type: link.href.startsWith('mailto:') ? 'email' : 'phone',
          cta_location: String(getCtaLocation(link)).slice(0, 100)
        });
      });
    });

    function openModal(source = 'unknown') {
      overlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
      trackRetouchEvent('nesso_retouch_trial_modal_open', { source });
      // Trap focus or focus first input
      setTimeout(() => {
        // First visible field; the honeypot input sits earlier in the form and must never take focus
        const firstInput = trialForm ? trialForm.querySelector('.trial-form-grid input:not([type="hidden"])') : null;
        if (firstInput) firstInput.focus();
      }, 150);
    }

    function closeModal() {
      const wasSuccess = dialog.classList.contains('is-success');
      overlay.classList.remove('is-open');
      document.body.style.overflow = '';
      trackRetouchEvent(wasSuccess ? 'nesso_retouch_success_return_home' : 'nesso_retouch_trial_modal_close');

      if (wasSuccess) {
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
        trackRetouchEvent('nesso_retouch_plan_selected', { plan_tier: tier });
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
      tabUploadFiles.addEventListener('click', () => {
        setSubmissionMode('files');
        trackRetouchEvent('nesso_retouch_submission_mode_selected', { submission_mode: 'files' });
      });
    }
    if (tabShareLink) {
      tabShareLink.addEventListener('click', () => {
        setSubmissionMode('link');
        trackRetouchEvent('nesso_retouch_submission_mode_selected', { submission_mode: 'link' });
      });
    }

    // ── 3-Image Drag & Drop Upload Management ──
    if (dropzone && fileInput) {
      dropzone.addEventListener('click', (e) => {
        // Don't trigger if remove button was clicked
        if (e.target.closest('.file-chip-remove')) return;
        trackRetouchEvent('nesso_retouch_upload_picker_open');
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
        handleFiles(files, 'drag_drop');
      });

      fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files, 'file_picker');
        fileInput.value = ''; // reset so same file can be selected again
      });
    }

    function handleFiles(files, source = 'unknown') {
      const incoming = Array.from(files);
      const invalidFiles = incoming.filter((file) => !isAllowedFile(file));
      const validFiles = incoming.filter(isAllowedFile);
      const availableSlots = maxFiles - uploadedFiles.length;
      const acceptedFiles = validFiles.slice(0, availableSlots);

      uploadedFiles.push(...acceptedFiles);
      renderFiles();

      if (acceptedFiles.length > 0) {
        trackRetouchEvent('nesso_retouch_files_selected', {
          file_count: acceptedFiles.length,
          upload_source: source,
          file_size_bucket: getFileSizeBucket(acceptedFiles)
        });
      }

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
      trackRetouchEvent('nesso_retouch_trial_submit_success', {
        submission_mode: currentMode,
        file_count: uploadedFiles.length,
        plan_tier: hiddenTierInput ? hiddenTierInput.value : ''
      });
    }

    function navigateToThankYou(value) {
      if (typeof value !== 'string' || !value) return;
      try {
        const target = new URL(value, window.location.origin);
        if (target.origin !== window.location.origin || target.pathname !== '/nesso-retouch-thank-you/' || target.search || target.hash) return;
        if (window.parent !== window) {
          window.parent.postMessage({ type: 'nesso-photo-retouch-thank-you', url: target.href }, window.location.origin);
        } else {
          window.location.assign(target.href);
        }
      } catch (_) {
        // Keep the success message if navigation is unavailable.
      }
    }

    function resetSuccessState() {
      if (!formStage || !successStage) return;

      successStage.classList.remove('is-visible');
      dialog.classList.remove('is-success');
      // Back to the stylesheet's display (flex), so the form still fills the card after a reset
      formStage.style.display = '';
      if (trialForm) trialForm.reset();
      uploadedFiles = [];
      submissionComplete = false;
      setFormMessage('');
      renderFiles();
      selectTier('Simple');
      setSubmissionMode('files');
    }

    // ── Form Submission ──
    if (trialForm) {
      trialForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (isSubmitting || submissionComplete) return;
        setFormMessage('');

        applyCustomValidity();
        if (!trialForm.checkValidity()) {
          trialForm.reportValidity();
          // Name the field that is actually wrong
          const firstInvalid = trialForm.querySelector(':invalid');
          let message = 'Please enter your name and a valid work email.';
          if (firstInvalid === cloudLinkInput) {
            message = 'Please paste a valid Google Drive, Dropbox, or WeTransfer link.';
          } else if (firstInvalid === companyInput) {
            message = companyMessage;
          } else if (firstInvalid === emailInput && isPersonalEmail(emailInput.value)) {
            message = personalEmailMessage;
          }
          setFormMessage(message, 'error');
          return;
        }

        if (uploadedFiles.some((file) => !isAllowedFile(file))) {
          setFormMessage('Only RAW, TIFF, or JPG images can be uploaded.', 'error');
          return;
        }

        isSubmitting = true;
        if (submitBtn) submitBtn.disabled = true;
        if (submitText) {
          submitText.textContent = uploadedFiles.length > 0
            ? 'Uploading 0%...'
            : 'Submitting & Calibrating...';
        }

        trackRetouchEvent('nesso_retouch_trial_submit_started', {
          submission_mode: currentMode,
          file_count: uploadedFiles.length,
          file_size_bucket: getFileSizeBucket(uploadedFiles),
          plan_tier: hiddenTierInput ? hiddenTierInput.value : ''
        });

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

          submissionComplete = true;
          setFormMessage(payload.message || 'Your request was sent.', 'success');
          showSubmissionSuccess();
          navigateToThankYou(payload.thank_you_url);
        } catch (error) {
          trackRetouchEvent('nesso_retouch_trial_submit_failed', {
            submission_mode: currentMode,
            file_count: uploadedFiles.length,
            plan_tier: hiddenTierInput ? hiddenTierInput.value : ''
          });
          setFormMessage(error.message || 'We could not send your request. Please try again.', 'error');
        } finally {
          isSubmitting = false;
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
