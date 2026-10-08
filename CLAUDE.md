# NESSO — Professional Photo Retouching Studio
## Claude Code Project Context & Guidelines

### 1. Project Overview & Architecture
This is a high-end commercial landing page for **NESSO** (a luxury photo retouching studio serving fashion, e-commerce, and high-end brands).
- **Tech Stack**: Vanilla HTML5, Vanilla CSS3, Vanilla ES6+ JavaScript. No frameworks (React/Vue), no CSS preprocessors, no Tailwind CSS.
- **Local Dev Server**: Node.js static server on port 3405 (`server.js`).
  - Run server: `npm run dev`
  - Access URL: `http://localhost:3405/`

### 2. Core Modules & Key Files
- `index.html`: Main landing page structure with semantic sections and SEO optimization.
- `cosmos-hero.js` & `cosmos-hero.css`: Approved circular spiral card orbit engine (v13 specification, 4.25 turns desktop, 2.4 turns mobile, equal arc-length parameterization).
- `approach-video.js` & `approach-video.css`: Centric theater studio film player with custom luxury controls.
- `script.js` & `style.css`: Services before/after interactive sliders, mobile menu drawer, and audience concepts.
- `workflow-pricing.js` & `workflow-pricing.css`: Runway workflow steps and interactive pricing estimator.
- `trial-modal.js` & `trial-modal.css`: 3-step free trial modal flow.
- `footer-cta-faq.js` & `footer-cta-faq.css`: Interactive FAQ accordion, footer links, and global CTA.

### 3. Design System & Coding Principles
- **Design Intelligence**: Follows the **Anthropic Design Plugin** in `.agents/plugins/anthropic-design/` (WCAG 2.1 AA accessibility, UX copy standards, typography hierarchy).
- **Typography**:
  - Headings: `Plus Jakarta Sans` with `Playfair Display` (serif italic accents).
  - Body Text on Mobile: Unified font size `13.5px`, line-height `1.5`, regular (`400`), full black (`#000000`).
- **Responsive Layout**:
  - Mobile breakpoint: `<= 768px` (small mobile `<= 480px`).
  - Mobile-first safeguards: Zero horizontal scroll (`overflow-x: clip`), minimum touch target `44x44px`.
  - **Desktop Preservation**: Strictly avoid regressions on Desktop when modifying mobile layouts and styles.

### 4. Important Commands for Claude Code
- Start dev server: `npm run dev`
- Health check / linting: validate vanilla HTML/CSS/JS syntax.
