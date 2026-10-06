/**
 * NESSO — Interactive Controller for FAQ Accordion
 * Handles expand/collapse for the FAQ accordion items.
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', () => {
    initFAQAccordion();
  });

  function initFAQAccordion() {
    const items = document.querySelectorAll('.d4-faq-card');

    items.forEach(item => {
      const btn = item.querySelector('.d4-faq-question');
      const answer = item.querySelector('.d4-faq-answer');
      if (!btn || !answer) return;

      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('is-open');

        // Optional: close siblings in the same list
        const parentList = item.parentElement;
        if (parentList) {
          parentList.querySelectorAll('.d4-faq-card').forEach(sibling => {
            if (sibling !== item) {
              sibling.classList.remove('is-open');
              const sibBtn = sibling.querySelector('.d4-faq-question');
              if (sibBtn) sibBtn.setAttribute('aria-expanded', 'false');
              const sibAnswer = sibling.querySelector('.d4-faq-answer');
              if (sibAnswer) sibAnswer.style.maxHeight = null;
            }
          });
        }

        if (isOpen) {
          item.classList.remove('is-open');
          btn.setAttribute('aria-expanded', 'false');
          answer.style.maxHeight = null;
        } else {
          item.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
          answer.style.maxHeight = answer.scrollHeight + 30 + 'px';
        }
      });
    });
  }
})();
