/**
 * NESSO — Workflow & Pricing Interactive Switchers
 * Allows the user to toggle between Design Option 1 & 2 for Workflow,
 * and Option A & B for Pricing to preview and compare directly in the browser.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initWorkflowSwitcher();
    initPricingSwitcher();
    initBillingToggle();
  });

  // ── Workflow Switcher: Matrix (Option 1) vs Stepper (Option 2) ──
  function initWorkflowSwitcher() {
    const btnMatrix = document.getElementById('switch-wf-matrix');
    const btnStepper = document.getElementById('switch-wf-stepper');
    const viewMatrix = document.getElementById('workflow-matrix-view');
    const viewStepper = document.getElementById('workflow-stepper-view');

    if (!btnMatrix || !btnStepper || !viewMatrix || !viewStepper) return;

    btnMatrix.addEventListener('click', () => {
      btnMatrix.classList.add('is-active');
      btnStepper.classList.remove('is-active');
      viewMatrix.style.display = 'grid';
      viewStepper.style.display = 'none';
    });

    btnStepper.addEventListener('click', () => {
      btnStepper.classList.add('is-active');
      btnMatrix.classList.remove('is-active');
      viewStepper.style.display = 'block';
      viewMatrix.style.display = 'none';

      const lineFill = viewStepper.querySelector('.runway-line-fill');
      if (lineFill) {
        lineFill.style.animation = 'none';
        void lineFill.offsetWidth;
        lineFill.style.animation = '';
      }
    });
  }

  // ── Pricing Switcher: Elevated Cards (Option A) vs Editorial Columns (Option B) ──
  function initPricingSwitcher() {
    const btnElevated = document.getElementById('switch-price-elevated');
    const btnEditorial = document.getElementById('switch-price-editorial');
    const viewElevated = document.getElementById('pricing-elevated-view');
    const viewEditorial = document.getElementById('pricing-editorial-view');

    if (!btnElevated || !btnEditorial || !viewElevated || !viewEditorial) return;

    btnElevated.addEventListener('click', () => {
      btnElevated.classList.add('is-active');
      btnEditorial.classList.remove('is-active');
      viewElevated.style.display = 'grid';
      viewEditorial.style.display = 'none';
    });

    btnEditorial.addEventListener('click', () => {
      btnEditorial.classList.add('is-active');
      btnElevated.classList.remove('is-active');
      viewEditorial.style.display = 'block';
      viewElevated.style.display = 'none';
    });
  }

  // ── Pricing Billing Cycle Switcher: Per Image vs Monthly Retainer ──
  function initBillingToggle() {
    const switchEl = document.getElementById('billing-switch');
    const btnPerImage = document.getElementById('btn-per-image');
    const btnMonthly = document.getElementById('btn-monthly');

    const amounts = document.querySelectorAll('.dynamic-price-amount');
    const units = document.querySelectorAll('.dynamic-price-unit');

    if (!switchEl || !btnPerImage || !btnMonthly) return;

    let isMonthly = false;

    function updatePrices(monthly) {
      isMonthly = monthly;
      switchEl.classList.toggle('is-active', isMonthly);
      btnMonthly.classList.toggle('is-active', isMonthly);
      btnPerImage.classList.toggle('is-active', !isMonthly);

      amounts.forEach((el) => {
        const val = isMonthly ? el.getAttribute('data-monthly') : el.getAttribute('data-per-image');
        if (val) el.textContent = val;
      });

      units.forEach((el) => {
        const val = isMonthly ? el.getAttribute('data-monthly-unit') : el.getAttribute('data-per-image-unit');
        if (val) el.textContent = val;
      });
    }

    switchEl.addEventListener('click', () => updatePrices(!isMonthly));
    btnPerImage.addEventListener('click', () => updatePrices(false));
    btnMonthly.addEventListener('click', () => updatePrices(true));
  }
})();
